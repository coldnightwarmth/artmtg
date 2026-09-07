import {
  SUPPORTED_CARD_MINT_INDEX,
  SUPPORTED_CARD_REFERENCE_INDEX,
} from "./supported-card-index.js";

const LIVE_STATUS_REFRESH_MS = 12 * 60 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 25_000;
const WALLET_ASSET_PAGE_LIMIT = 1000;
const WALLET_ASSET_MAX = 25_000;
const CARD_NFT_2_CARD_COUNT = 11_133;
const CARD_NFT_2_EXCLUDED_NUMBERS = new Set([10_022]);
const PONCHO_CARD_COUNT = 207;
const PONCHO_TENSOR_COLLECTION_SLUG = "9aa9b85e-4e43-4900-be61-199e7cce1943";
const PONCHO_COLLECTION_MINT = "JCTP3kK3xGtWs5mDHxJBuRro38HftaiCDdKsfkXuK2gH";
const CLEAR_CARD_COUNT = 192;
const CLEAR_CARD_COLLECTION_MINT = "3fYe95cviaHzka38Q82q64JLhhddKQm37Jt4dQSxPKxz";
const SWAG_PACK_COLLECTION_MINT = "C22esis7kQMbX9JGWsMaKvsh1X5GeBmHPju28jiKDyAP";
const LIVE_STATUS_COLLECTION_IDS = Object.freeze(["cardnft2", "poncho", "clear"]);
const SOLANA_TOKEN_PROGRAM_IDS = Object.freeze([
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
]);
const SUPPORTED_CARD_BY_MINT = buildFlatIndex(SUPPORTED_CARD_MINT_INDEX);
const SUPPORTED_CARD_BY_REFERENCE = buildFlatIndex(SUPPORTED_CARD_REFERENCE_INDEX);

const PONCHO_COLLECTION_QUERY = `
  query CollectionMintsV2(
    $slug: String!
    $sortBy: CollectionMintsSortBy!
    $cursor: String
    $limit: Int
  ) {
    collectionMintsV2(
      slug: $slug
      sortBy: $sortBy
      cursor: $cursor
      limit: $limit
    ) {
      mints {
        mint {
          onchainId
          name
          attributes {
            trait_type
            value
          }
        }
      }
      page {
        endCursor
        hasMore
      }
    }
  }
`;

export async function readLiveCardStatuses(env) {
  let collections = await readStoredCardStatuses(env);
  const now = Date.now();
  const storedCollectionIds = new Set(collections.map((entry) => entry.collectionId));
  const missingSnapshot = LIVE_STATUS_COLLECTION_IDS.some((collectionId) => (
    !storedCollectionIds.has(collectionId)
  ));
  const staleSnapshot = collections.some((entry) => (
    now - Number(entry.refreshedAt || 0) >= LIVE_STATUS_REFRESH_MS
  ));

  if (missingSnapshot || staleSnapshot) {
    await refreshLiveCardStatuses(env);
    collections = await readStoredCardStatuses(env);
  }

  return {
    refreshIntervalMs: LIVE_STATUS_REFRESH_MS,
    collections: Object.fromEntries(
      collections.map((entry) => [entry.collectionId, entry]),
    ),
  };
}

export async function refreshLiveCardStatuses(env) {
  const jobs = [
    ["cardnft2", () => fetchCardNft2StatusSnapshot(env)],
    ["poncho", () => fetchPonchoStatusSnapshot(env)],
    ["clear", () => fetchClearStatusSnapshot(env)],
  ];
  const results = await Promise.allSettled(jobs.map(([, job]) => job()));
  const refreshedAt = Date.now();
  const successful = [];
  const failures = [];

  results.forEach((result, index) => {
    const collectionId = jobs[index][0];
    if (result.status === "fulfilled") {
      successful.push({
        collectionId,
        refreshedAt,
        cards: result.value,
      });
    } else {
      failures.push({ collectionId, error: result.reason });
    }
  });

  if (successful.length) {
    await env.DB.batch(successful.map((snapshot) => (
      env.DB.prepare(
        `INSERT INTO live_card_status_snapshots (collection_id, snapshot_json, refreshed_at)
         VALUES (?, ?, ?)
         ON CONFLICT(collection_id) DO UPDATE SET
           snapshot_json = excluded.snapshot_json,
           refreshed_at = excluded.refreshed_at`,
      ).bind(
        snapshot.collectionId,
        JSON.stringify(snapshot.cards),
        snapshot.refreshedAt,
      )
    )));
  }

  for (const failure of failures) {
    console.error(`Unable to refresh ${failure.collectionId} statuses`, failure.error);
  }
  if (!successful.length) {
    throw new Error("Every live card status source failed");
  }
  return successful;
}

export async function fetchLiveWalletHoldings(address, env) {
  const dasHoldings = await fetchWalletDasHoldings(address, env);
  const supplementalResults = await Promise.allSettled([
    ...SOLANA_TOKEN_PROGRAM_IDS.map((programId) => (
      fetchWalletTokenProgramMints(address, programId, env)
    )),
    fetchCardNft2WalletMints(address, env),
  ]);
  const mints = new Set(dasHoldings.mints);
  for (const result of supplementalResults) {
    if (result.status !== "fulfilled") continue;
    for (const mint of result.value) mints.add(mint);
  }
  const holdings = {
    walletAddress: address,
    fetchedAt: Date.now(),
    mints: [...mints].sort(),
    cardRefs: dasHoldings.cardRefs,
    swagPackAssets: dasHoldings.swagPackAssets,
  };
  holdings.supportedCardCount = countSupportedWalletCards(holdings);
  return holdings;
}

export function countSupportedWalletCards(holdings) {
  const cardIndexes = new Set();
  for (const mint of Array.isArray(holdings?.mints) ? holdings.mints : []) {
    const cardIndex = SUPPORTED_CARD_BY_MINT.get(String(mint || "").trim());
    if (Number.isInteger(cardIndex)) cardIndexes.add(cardIndex);
  }
  for (const reference of Array.isArray(holdings?.cardRefs) ? holdings.cardRefs : []) {
    const collectionId = String(reference?.[0] || "").trim();
    const number = Number(reference?.[1]);
    if (!collectionId || !Number.isInteger(number)) continue;
    const cardIndex = SUPPORTED_CARD_BY_REFERENCE.get(`${collectionId}:${number}`);
    if (Number.isInteger(cardIndex)) cardIndexes.add(cardIndex);
  }
  return cardIndexes.size;
}

function buildFlatIndex(values) {
  const index = new Map();
  for (let offset = 0; offset + 1 < values.length; offset += 2) {
    index.set(values[offset], values[offset + 1]);
  }
  return index;
}

async function readStoredCardStatuses(env) {
  const result = await env.DB.prepare(
    `SELECT collection_id, snapshot_json, refreshed_at
     FROM live_card_status_snapshots
     ORDER BY collection_id`,
  ).all();
  const collections = [];
  for (const row of result?.results || []) {
    try {
      const cards = JSON.parse(row.snapshot_json);
      if (!Array.isArray(cards)) continue;
      collections.push({
        collectionId: row.collection_id,
        refreshedAt: Number(row.refreshed_at),
        cards,
      });
    } catch {
      // A malformed row is treated as missing and replaced by the next refresh.
    }
  }
  return collections;
}

async function fetchCardNft2StatusSnapshot(env) {
  const baseUrl = String(
    env.CARD_NFT_2_COLLECTION_URL || "https://cardnft2.taile73682.ts.net/collection",
  );
  const url = new URL(baseUrl);
  url.searchParams.set("status", String(Date.now()));
  const response = await fetchWithTimeout(url, {
    headers: { accept: "application/json" },
    cf: { cacheTtl: 0 },
  });
  if (!response.ok) {
    throw new Error(`Card NFT 2 collection fetch failed: ${response.status}`);
  }
  const assets = await response.json();
  if (!Array.isArray(assets) || assets.length < 1000) {
    throw new Error("Card NFT 2 collection returned an incomplete asset list");
  }
  return buildCardNft2StatusCards(assets);
}

async function fetchPonchoStatusSnapshot(env) {
  const endpoint = String(env.TENSOR_GRAPHQL_URL || "https://graphql.tensor.trade/graphql");
  const assets = [];
  const seenCursors = new Set();
  let cursor = null;

  while (true) {
    const response = await fetchWithTimeout(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        operationName: "CollectionMintsV2",
        variables: {
          slug: String(env.PONCHO_TENSOR_COLLECTION_SLUG || PONCHO_TENSOR_COLLECTION_SLUG),
          sortBy: "OrdinalAsc",
          cursor,
          limit: 250,
        },
        query: PONCHO_COLLECTION_QUERY,
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.errors) {
      throw new Error(`Poncho Tensor fetch failed: ${response.status}`);
    }
    const result = payload?.data?.collectionMintsV2;
    const pageMints = Array.isArray(result?.mints) ? result.mints : null;
    if (!pageMints) throw new Error("Poncho Tensor response is missing its mint list");
    for (const wrapper of pageMints) {
      if (wrapper?.mint) assets.push(wrapper.mint);
    }
    if (!result?.page?.hasMore) break;
    const nextCursor = cleanText(result.page.endCursor);
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error("Poncho Tensor pagination stalled");
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  if (assets.length < 100) throw new Error("Poncho Tensor returned an incomplete asset list");
  return buildPonchoStatusCards(assets);
}

async function fetchClearStatusSnapshot(env) {
  const collectionMint = String(env.CLEAR_CARD_COLLECTION_MINT || CLEAR_CARD_COLLECTION_MINT);
  const assets = await fetchDasCollectionAssets(collectionMint, env);
  if (assets.length < CLEAR_CARD_COUNT) {
    throw new Error("Clear Cards DAS lookup returned an incomplete collection");
  }
  return buildClearStatusCards(assets);
}

async function fetchDasCollectionAssets(collectionMint, env) {
  const assets = [];
  const seenAssetIds = new Set();
  let page = 1;

  while (assets.length < WALLET_ASSET_MAX) {
    const result = await jsonRpc(getHeliusRpcUrl(env), "getAssetsByGroup", {
      groupKey: "collection",
      groupValue: collectionMint,
      page,
      limit: WALLET_ASSET_PAGE_LIMIT,
    });
    const items = Array.isArray(result?.items) ? result.items : [];
    let newAssetCount = 0;
    for (const asset of items) {
      const assetId = cleanText(asset?.id);
      if (assetId && seenAssetIds.has(assetId)) continue;
      if (assetId) {
        seenAssetIds.add(assetId);
        newAssetCount += 1;
      }
      assets.push(asset);
    }
    if (
      items.length < WALLET_ASSET_PAGE_LIMIT
      || (items.length > 0 && newAssetCount === 0)
    ) {
      break;
    }
    page += 1;
  }
  return assets;
}

async function fetchWalletDasHoldings(address, env) {
  const mints = new Set();
  const cardRefs = new Map();
  const swagPackAssets = new Map();
  const clearCollectionMint = String(env.CLEAR_CARD_COLLECTION_MINT || CLEAR_CARD_COLLECTION_MINT);
  const ponchoCollectionMint = String(env.PONCHO_COLLECTION_MINT || PONCHO_COLLECTION_MINT);
  const seenAssetIds = new Set();
  let page = 1;
  let fetched = 0;

  while (fetched < WALLET_ASSET_MAX) {
    const result = await jsonRpc(getHeliusRpcUrl(env), "getAssetsByOwner", {
      ownerAddress: address,
      page,
      limit: WALLET_ASSET_PAGE_LIMIT,
      displayOptions: {
        showFungible: true,
        showNativeBalance: false,
      },
    });
    const items = Array.isArray(result?.items) ? result.items : [];
    let newAssetCount = 0;
    for (const asset of items) {
      const mint = cleanText(asset?.id);
      if (mint && seenAssetIds.has(mint)) continue;
      if (mint) {
        seenAssetIds.add(mint);
        newAssetCount += 1;
      }
      if (mint) mints.add(mint);
      const reference = getWalletCardReference(asset, {
        clearCollectionMint,
        ponchoCollectionMint,
      });
      if (reference) cardRefs.set(`${reference[0]}:${reference[1]}`, reference);
      const swagPackAsset = getSwagPackAsset(asset);
      if (swagPackAsset) swagPackAssets.set(swagPackAsset.mint, swagPackAsset);
    }
    fetched += items.length;
    if (
      items.length < WALLET_ASSET_PAGE_LIMIT
      || (items.length > 0 && newAssetCount === 0)
    ) {
      break;
    }
    page += 1;
  }
  return {
    mints,
    cardRefs: [...cardRefs.values()].sort((left, right) => (
      left[0].localeCompare(right[0]) || left[1] - right[1]
    )),
    swagPackAssets: [...swagPackAssets.values()].sort((left, right) => (
      left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" })
        || left.mint.localeCompare(right.mint)
    )),
  };
}

function getSwagPackAsset(asset) {
  if (!assetBelongsToCollection(asset, SWAG_PACK_COLLECTION_MINT)) return null;
  const mint = cleanText(asset?.id);
  const metadata = asset?.content?.metadata || {};
  const imageUrl = cleanHttpsUrl(
    asset?.content?.links?.image
      || (asset?.content?.files || []).find((file) => (
        cleanText(file?.mime).startsWith("image/")
      ))?.uri,
  );
  if (!mint || !imageUrl) return null;
  return {
    mint,
    name: cleanText(metadata.json_name || metadata.name || "Swag Pack sticker").slice(0, 120)
      || "Swag Pack sticker",
    imageUrl,
  };
}

function cleanHttpsUrl(value) {
  try {
    const url = new URL(cleanText(value));
    return url.protocol === "https:" && url.href.length <= 2048 ? url.href : "";
  } catch {
    return "";
  }
}

async function fetchWalletTokenProgramMints(address, programId, env) {
  const result = await jsonRpc(getSolanaRpcUrl(env), "getTokenAccountsByOwner", [
    address,
    { programId },
    { encoding: "jsonParsed", commitment: "confirmed" },
  ]);
  const mints = new Set();
  for (const entry of result?.value || []) {
    const info = entry?.account?.data?.parsed?.info;
    if (!info?.mint || !hasPositiveTokenBalance(info.tokenAmount)) continue;
    mints.add(cleanText(info.mint));
  }
  return mints;
}

async function fetchCardNft2WalletMints(address, env) {
  const baseUrl = String(
    env.CARD_NFT_2_WALLET_URL || "https://cardnft2.taile73682.ts.net/wallet",
  );
  const url = new URL(baseUrl);
  url.searchParams.set("address", address);
  url.searchParams.set("status", String(Date.now()));
  const response = await fetchWithTimeout(url, {
    headers: { accept: "application/json" },
    cf: { cacheTtl: 0 },
  });
  if (!response.ok) throw new Error(`Card NFT 2 wallet fetch failed: ${response.status}`);
  const payload = await response.json();
  const candidates = Array.isArray(payload?.mints)
    ? payload.mints
    : Array.isArray(payload?.assets)
      ? payload.assets
      : Array.isArray(payload)
        ? payload
        : [];
  return new Set(candidates.map(getCandidateMint).filter(Boolean));
}

async function jsonRpc(url, method, params) {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: `${method}-${Date.now()}`, method, params }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.error) {
    throw new Error(payload?.error?.message || `${method} failed: ${response.status}`);
  }
  return payload?.result;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function getHeliusRpcUrl(env) {
  const url = String(env.HELIUS_RPC_URL || "").trim();
  if (!url) throw new Error("HELIUS_RPC_URL is not configured");
  return url;
}

function getSolanaRpcUrl(env) {
  return String(env.SOLANA_RPC_URL || getHeliusRpcUrl(env));
}

function getCandidateMint(candidate) {
  const mint = typeof candidate === "string"
    ? candidate
    : candidate?.mint || candidate?.mintAddress || candidate?.id || candidate?.assetId || "";
  return cleanText(mint);
}

function hasPositiveTokenBalance(tokenAmount) {
  try {
    return BigInt(String(tokenAmount?.amount || "0")) > 0n;
  } catch {
    return false;
  }
}

export function buildCardNft2StatusCards(assets) {
  const liveCards = new Map();
  const receipts = new Map();
  for (const asset of assets || []) {
    const metadata = asset?.content?.metadata || {};
    const number = cardNumberFromName(metadata.name);
    if (!isCardNft2Number(number)) continue;
    const type = normalizeTrait(getAttributeValue(metadata.attributes, "type"));
    const mint = cleanText(asset?.id);
    if (!mint) continue;
    if (type === "card") {
      const redeemed = normalizeTrait(getAttributeValue(metadata.attributes, "redeemed")) === "true";
      liveCards.set(number, [number, redeemed ? "redeemed" : "pulled", mint]);
    } else if (type === "card receipt") {
      receipts.set(number, [number, "redeemed", mint]);
    }
  }

  return buildCompleteStatusCards(
    CARD_NFT_2_CARD_COUNT,
    CARD_NFT_2_EXCLUDED_NUMBERS,
    liveCards,
    receipts,
  );
}

export function buildPonchoStatusCards(assets) {
  const liveCards = new Map();
  const receipts = new Map();
  for (const asset of assets || []) {
    const number = cardNumberFromName(asset?.name);
    if (!Number.isInteger(number) || number < 1 || number > PONCHO_CARD_COUNT) continue;
    const type = normalizeTrait(getAttributeValue(asset?.attributes, "type"));
    const mint = cleanText(asset?.onchainId);
    if (!mint) continue;
    if (type === "card") liveCards.set(number, [number, "pulled", mint]);
    else if (type === "card receipt") receipts.set(number, [number, "redeemed", mint]);
  }
  return buildCompleteStatusCards(PONCHO_CARD_COUNT, new Set(), liveCards, receipts);
}

export function buildClearStatusCards(assets) {
  const liveCards = new Map();
  const receipts = new Map();
  for (const asset of assets || []) {
    const record = getClearCardRecord(asset);
    if (!record) continue;
    const [number] = record;
    const type = normalizeTrait(getAttributeValue(asset?.content?.metadata?.attributes, "type"));
    if (type === "card receipt") receipts.set(number, record);
    else liveCards.set(number, record);
  }
  return buildCompleteStatusCards(CLEAR_CARD_COUNT, new Set(), liveCards, receipts);
}

function getWalletCardReference(asset, collectionMints) {
  const clearRecord = getClearCardRecord(asset, {
    requiredCollectionMint: collectionMints.clearCollectionMint,
  });
  if (clearRecord) return ["clear", clearRecord[0], clearRecord[2]];

  const ponchoRecord = getPonchoCardRecord(asset, {
    requiredCollectionMint: collectionMints.ponchoCollectionMint,
  });
  return ponchoRecord ? ["poncho", ponchoRecord[0], ponchoRecord[2]] : null;
}

function getPonchoCardRecord(asset, options = {}) {
  if (
    options.requiredCollectionMint
    && !assetBelongsToCollection(asset, options.requiredCollectionMint)
  ) {
    return null;
  }

  const metadata = asset?.content?.metadata || {};
  const type = normalizeTrait(getAttributeValue(metadata.attributes, "type"));
  if (type !== "card" && type !== "card receipt") return null;

  const number = cardNumberFromName(metadata.name);
  const mint = cleanText(asset?.id);
  if (!Number.isInteger(number) || number < 1 || number > PONCHO_CARD_COUNT || !mint) return null;
  return [number, type === "card receipt" ? "redeemed" : "pulled", mint];
}

function getClearCardRecord(asset, options = {}) {
  if (
    options.requiredCollectionMint
    && !assetBelongsToCollection(asset, options.requiredCollectionMint)
  ) {
    return null;
  }

  const metadata = asset?.content?.metadata || {};
  const type = normalizeTrait(getAttributeValue(metadata.attributes, "type"));
  if (type !== "card" && type !== "card receipt") return null;

  const metadataUri = cleanText(asset?.content?.json_uri);
  const uriMatch = metadataUri.match(/\/(?:r?f)(\d+)\.json(?:$|[?#])/i);
  const number = uriMatch ? Number(uriMatch[1]) : cardNumberFromName(metadata.name);
  const mint = cleanText(asset?.id);
  if (!Number.isInteger(number) || number < 1 || number > CLEAR_CARD_COUNT || !mint) return null;

  const redeemed = type === "card receipt"
    || normalizeTrait(getAttributeValue(metadata.attributes, "redeemed")) === "true";
  return [number, redeemed ? "redeemed" : "pulled", mint];
}

function assetBelongsToCollection(asset, collectionMint) {
  return (asset?.grouping || []).some((group) => (
    cleanText(group?.group_key) === "collection"
    && cleanText(group?.group_value) === collectionMint
  ));
}

function buildCompleteStatusCards(count, excludedNumbers, liveCards, receipts) {
  const cards = [];
  for (let number = 1; number <= count; number += 1) {
    if (excludedNumbers.has(number)) continue;
    cards.push(receipts.get(number) || liveCards.get(number) || [number, "in pack", ""]);
  }
  return cards;
}

function getAttributeValue(attributes, category) {
  const normalizedCategory = normalizeTrait(category);
  return (attributes || []).find((attribute) => (
    normalizeTrait(attribute?.trait_type) === normalizedCategory
  ))?.value;
}

function isCardNft2Number(number) {
  return Number.isInteger(number)
    && number >= 1
    && number <= CARD_NFT_2_CARD_COUNT
    && !CARD_NFT_2_EXCLUDED_NUMBERS.has(number);
}

function cardNumberFromName(value) {
  const matches = cleanText(value).match(/\d+/g);
  return matches ? Number(matches[matches.length - 1]) : null;
}

function normalizeTrait(value) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function cleanText(value) {
  return String(value ?? "").trim();
}

export const testing = {
  LIVE_STATUS_REFRESH_MS,
  buildCardNft2StatusCards,
  buildPonchoStatusCards,
  buildClearStatusCards,
};
