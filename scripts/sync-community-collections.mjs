import { createHash } from "node:crypto";
import {
  mkdir,
  readFile,
  readdir,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import {
  COMMUNITY_COLLECTIONS,
  getCommunityCollection,
} from "./community-collections.mjs";

const require = createRequire(import.meta.url);
const sharp = loadSharp();

const ROOT = process.cwd();
const TENSOR_GRAPHQL_URL = "https://graphql.tensor.trade/graphql";
const SOLANA_DAS_RPC_URL = process.env.COMMUNITY_SOLANA_DAS_RPC_URL
  || "https://lauraine-qytyxk-fast-mainnet.helius-rpc.com";
const TENSOR_IMAGE_CDN_URL = "https://prod-image-cdn.tensor.trade/images/600x600/freeze=true";
const TENSOR_PAGE_LIMIT = 250;
const METADATA_WORKERS = Number(process.env.COMMUNITY_METADATA_WORKERS || 16);
const IMAGE_WORKERS = Number(process.env.COMMUNITY_IMAGE_WORKERS || 8);
const WEBP_QUALITY = Number(process.env.COMMUNITY_WEBP_QUALITY || 75);
const ANIMATED_WEBP_QUALITY = Number(process.env.COMMUNITY_ANIMATED_WEBP_QUALITY || 75);
const ANIMATED_SPRITE_QUALITY = Number(process.env.COMMUNITY_ANIMATED_SPRITE_QUALITY || 76);
const ANIMATED_IMAGE_WORKERS = Number(process.env.COMMUNITY_ANIMATED_IMAGE_WORKERS || 2);
const RETRIES = Number(process.env.COMMUNITY_RETRIES || 4);
const REQUEST_TIMEOUT_MS = Number(process.env.COMMUNITY_REQUEST_TIMEOUT_MS || 45000);
const BACK_COLOR = "#242424";
const CARD_PADDING_COLOR = "#111111";
const FORCE_IMAGES = process.env.COMMUNITY_FORCE_IMAGES === "1";
const RESUME_IMAGES = process.env.COMMUNITY_RESUME_IMAGES === "1";
const FORCE_TENSOR_BROWSER = process.env.COMMUNITY_TENSOR_BROWSER === "1";

let activeTensorPageSlug = "";
let tensorBrowser = null;
let tensorBrowserPage = null;
let tensorBrowserPageSlug = "";

const INSTRUMENT_QUERY = `
  query Instrument($slug: String!) {
    instrumentTV2(slug: $slug) {
      id
      slug
      slugDisplay
      name
      symbol
      imageUri
      description
      tokenStandard
      tokenProgram
      compressed
      statsV2 {
        numMints
      }
    }
  }
`;

const COLLECTION_MINTS_QUERY = `
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
          owner
          name
          imageUri
          animationUri
          metadataUri
          files {
            type
            uri
          }
          attributes {
            trait_type
            value
          }
          tokenProgram
          tokenStandard
        }
      }
      page {
        endCursor
        hasMore
      }
    }
  }
`;

try {
  await main();
} finally {
  if (tensorBrowser) await tensorBrowser.close();
}

async function main() {
  validateSettings();
  const requestedIds = process.argv.slice(2);
  const collections = requestedIds.length
    ? requestedIds.map((id) => {
      const collection = getCommunityCollection(id);
      if (!collection) {
        throw new Error(
          `Unknown collection "${id}". Choose from ${COMMUNITY_COLLECTIONS.map(({ id: value }) => value).join(", ")}.`,
        );
      }
      return collection;
    })
    : COMMUNITY_COLLECTIONS;

  for (const collection of collections) {
    await syncCollection(collection);
  }
}

function validateSettings() {
  for (const [name, value] of [
    ["COMMUNITY_METADATA_WORKERS", METADATA_WORKERS],
    ["COMMUNITY_IMAGE_WORKERS", IMAGE_WORKERS],
    ["COMMUNITY_ANIMATED_IMAGE_WORKERS", ANIMATED_IMAGE_WORKERS],
    ["COMMUNITY_RETRIES", RETRIES],
    ["COMMUNITY_REQUEST_TIMEOUT_MS", REQUEST_TIMEOUT_MS],
  ]) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${name} must be a positive integer; received ${value}`);
    }
  }
  if (!Number.isInteger(WEBP_QUALITY) || WEBP_QUALITY < 1 || WEBP_QUALITY > 100) {
    throw new Error(
      `COMMUNITY_WEBP_QUALITY must be an integer from 1 to 100; received ${WEBP_QUALITY}`,
    );
  }
  for (const [name, value] of [
    ["COMMUNITY_ANIMATED_WEBP_QUALITY", ANIMATED_WEBP_QUALITY],
    ["COMMUNITY_ANIMATED_SPRITE_QUALITY", ANIMATED_SPRITE_QUALITY],
  ]) {
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      throw new Error(`${name} must be an integer from 1 to 100; received ${value}`);
    }
  }
}

async function syncCollection(collection) {
  const paths = getCollectionPaths(collection);
  const directories = [
    mkdir(paths.cardDir, { recursive: true }),
    mkdir(paths.metadataDir, { recursive: true }),
    mkdir(paths.backDir, { recursive: true }),
  ];
  if (collection.preserveAnimatedGifs) {
    directories.push(
      mkdir(paths.animatedDir, { recursive: true }),
      mkdir(paths.animatedSpriteDir, { recursive: true }),
    );
  }
  await Promise.all(directories);

  const explicitMintSource = collection.sourceMode === "explicit-mints";
  console.log(
    `[${collection.id}] resolving ${explicitMintSource ? "configured mint set" : "Tensor collection set"}`,
  );
  const previousSnapshot = await loadJsonFile(paths.sourcePath);
  const tensorSources = explicitMintSource
    ? [{
      instrument: createExplicitMintInstrument(collection),
      assets: await fetchExplicitMintAssets(collection),
      pageSlug: null,
      collectionSlug: null,
      displayTitlePrefix: "",
    }]
    : await fetchTensorCollectionSet(collection);
  const instrument = tensorSources[0]?.instrument;
  const tensorLiveAssets = tensorSources.flatMap(({ assets }) => assets);
  const resolvedAssets = await resolveAssetMetadata(collection, tensorLiveAssets);
  validateCollectionSortValues(collection, resolvedAssets);
  resolvedAssets.sort((a, b) => compareResolvedAssets(collection, a, b));
  const groupedAssets = groupDuplicateAssets(resolvedAssets)
    .map((group, index) => ({ ...group, assetNumber: index + 1 }));
  const displayOrderedGroups = orderCollectionGroups(collection, groupedAssets);
  const { includedGroups, excludedGroups } = partitionCollectionGroups(
    collection,
    displayOrderedGroups,
  );
  const includedAssets = includedGroups.flatMap((group) => group.assets);
  const excludedAssets = excludedGroups.flatMap((group) => (
    group.assets.map((asset) => ({
      ...asset,
      groupKeyHash: createHash("sha256").update(group.key).digest("hex"),
      exclusionReason: getGroupExclusionReason(collection, group),
    }))
  ));
  const entries = await createCardEntries(collection, paths, includedGroups);

  await convertCardAssets(collection, paths, entries, previousSnapshot);
  await convertAnimatedAssets(collection, paths, entries, previousSnapshot);
  await convertSharedBack(collection, paths, previousSnapshot);
  await writeDataModules(collection, paths, entries);
  await writeSourceSnapshot({
    collection,
    paths,
    instrument,
    tensorSources,
    tensorLiveAssets: resolvedAssets,
    liveAssets: includedAssets,
    excludedAssets,
    entries,
  });
  await pruneGeneratedAssets(collection, paths, entries);

  const duplicateMintCount = includedAssets.length - entries.length;
  const metadataFailureCount = resolvedAssets
    .filter((asset) => asset.metadataFetchError)
    .length;
  console.log(
    `[${collection.id}] done: ${entries.length} cards from ${includedAssets.length} included live mints`
    + `${duplicateMintCount ? ` (${duplicateMintCount} duplicate editions grouped)` : ""}`
    + `${excludedAssets.length ? `; ${excludedAssets.length} configured mint excluded` : ""}`
    + `${metadataFailureCount ? `; ${metadataFailureCount} metadata requests used Tensor fallbacks` : ""}`,
  );
}

async function fetchTensorCollectionSet(collection) {
  const configuredSources = [
    {
      tensorPageSlug: collection.tensorPageSlug,
      tensorSlug: collection.tensorSlug,
      displayTitlePrefix: "",
      sortByTitleNumber: collection.sortByTitleNumber,
    },
    ...(collection.additionalTensorCollections || []),
  ];
  const sources = [];

  for (let sourceIndex = 0; sourceIndex < configuredSources.length; sourceIndex += 1) {
    const source = configuredSources[sourceIndex];
    const sourceCollection = {
      ...collection,
      id: sourceIndex === 0 ? collection.id : `${collection.id}/append-${sourceIndex}`,
      tensorPageSlug: source.tensorPageSlug,
      tensorSlug: source.tensorSlug,
    };
    activeTensorPageSlug = source.tensorPageSlug || "";
    const instrument = await fetchTensorInstrument(sourceCollection);
    if (instrument.slug !== source.tensorSlug) {
      throw new Error(
        `[${collection.id}] Tensor display slug ${source.tensorPageSlug} now resolves to `
        + `${instrument.slug}; expected ${source.tensorSlug}`,
      );
    }

    const fetchedAssets = await fetchTensorLiveAssets(sourceCollection);
    const assets = fetchedAssets.map((asset, sourceOrder) => {
      const titleNumber = getTitleNumber(asset.name);
      const displayTitlePrefix = cleanText(source.displayTitlePrefix);
      if (displayTitlePrefix && !Number.isInteger(titleNumber)) {
        throw new Error(
          `[${collection.id}] cannot create ${JSON.stringify(displayTitlePrefix)} title from `
          + `${JSON.stringify(asset.name)}`,
        );
      }
      return {
        ...asset,
        sourceCollectionOrder: sourceIndex,
        sourceCollectionSlug: source.tensorSlug,
        sourceOrder,
        sortByTitleNumber: Boolean(source.sortByTitleNumber),
        displayName: displayTitlePrefix ? `${displayTitlePrefix}${titleNumber}` : "",
      };
    });
    sources.push({
      instrument,
      assets,
      pageSlug: source.tensorPageSlug,
      collectionSlug: source.tensorSlug,
      displayTitlePrefix: cleanText(source.displayTitlePrefix),
    });
  }
  return sources;
}

function getCollectionPaths(collection) {
  const assetRoot = path.join(ROOT, "assets", collection.id);
  return {
    sourcePath: path.join(ROOT, `${collection.id}-source.json`),
    dataPath: path.join(ROOT, `${collection.id}-data.js`),
    traitsPath: path.join(ROOT, `${collection.id}-traits.js`),
    assetRoot,
    cardDir: path.join(assetRoot, "cards"),
    metadataDir: path.join(assetRoot, "metadata"),
    animatedDir: path.join(assetRoot, "animated"),
    animatedSpriteDir: path.join(assetRoot, "animated-sprites"),
    backDir: path.join(assetRoot, "backs"),
    backFile: `assets/${collection.id}/backs/${collection.id}-back.webp`,
    backPath: path.join(assetRoot, "backs", `${collection.id}-back.webp`),
  };
}

function createExplicitMintInstrument(collection) {
  const mintIds = [...(collection.sourceMintIds || [])];
  if (!mintIds.length) {
    throw new Error(`[${collection.id}] explicit-mints source has no configured mint IDs`);
  }
  const uniqueMintIds = new Set(mintIds);
  if (uniqueMintIds.size !== mintIds.length || mintIds.some((mint) => !cleanText(mint))) {
    throw new Error(`[${collection.id}] explicit-mints source has empty or duplicate mint IDs`);
  }
  return {
    id: `${collection.id}:explicit-mints`,
    slug: null,
    slugDisplay: null,
    name: collection.label,
    symbol: collection.modulePrefix,
    imageUri: null,
    description: "Curated explicit Solana mint set",
    tokenStandard: null,
    tokenProgram: null,
    compressed: null,
    statsV2: {
      numMints: null,
    },
  };
}

async function fetchExplicitMintAssets(collection) {
  const configuredMintIds = [...(collection.sourceMintIds || [])];
  const payload = await retry(
    () => solanaDasRpc("getAssetBatch", { ids: configuredMintIds }),
    RETRIES,
    `${collection.id} explicit mint batch`,
  );
  const assets = Array.isArray(payload) ? payload : null;
  if (!assets) {
    throw new Error(`[${collection.id}] DAS did not return an explicit mint array`);
  }
  const assetsById = new Map(
    assets
      .map((asset) => [cleanText(asset?.id), asset])
      .filter(([mint]) => mint),
  );
  return configuredMintIds.map((onchainId, sourceOrder) => {
    const asset = assetsById.get(onchainId);
    if (!asset) {
      throw new Error(`[${collection.id}] DAS did not return configured mint ${onchainId}`);
    }
    const content = asset?.content || {};
    const metadata = content?.metadata || {};
    const links = content?.links || {};
    const files = normalizeFiles(content?.files);
    const imageUri = normalizeUri(links.image)
      || getImageFile(files);
    if (!imageUri) {
      throw new Error(`[${collection.id}] configured mint ${onchainId} has no image`);
    }
    const animationUri = normalizeUri(
      links.animation_url
      || links.animation
      || links.external_url,
    );
    return {
      onchainId,
      sourceOrder,
      owner: cleanText(asset?.ownership?.owner),
      name: cleanText(metadata?.name || metadata?.json_name) || onchainId,
      imageUri,
      animationUri,
      metadataUri: normalizeUri(content?.json_uri),
      files,
      attributes: normalizeAttributes(metadata?.attributes),
      tokenProgram: asset?.interface === "MplCoreAsset" ? "MPL_CORE" : "",
      tokenStandard: cleanText(asset?.interface),
    };
  });
}

async function solanaDasRpc(method, params) {
  const response = await fetchWithTimeout(SOLANA_DAS_RPC_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "community-binder-sync",
      method,
      params,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.error || !payload) {
    throw new Error(
      `Solana DAS failed (${response.status}): `
      + `${JSON.stringify(payload?.error || payload || {})}`,
    );
  }
  return payload.result;
}

async function fetchTensorInstrument(collection) {
  const payload = await retry(
    () => tensorGraphql("Instrument", INSTRUMENT_QUERY, {
      slug: collection.tensorPageSlug,
    }),
    RETRIES,
    `${collection.id} Tensor instrument`,
  );
  const instrument = payload?.data?.instrumentTV2;
  if (!instrument?.slug) {
    throw new Error(`[${collection.id}] Tensor did not return an instrument`);
  }
  return instrument;
}

async function fetchTensorLiveAssets(collection) {
  const assets = [];
  const seenCursors = new Set();
  let cursor = null;
  let pageNumber = 1;

  while (true) {
    const payload = await retry(
      () => tensorGraphql("CollectionMintsV2", COLLECTION_MINTS_QUERY, {
        slug: collection.tensorSlug,
        sortBy: "OrdinalAsc",
        cursor,
        limit: TENSOR_PAGE_LIMIT,
      }),
      RETRIES,
      `${collection.id} Tensor page ${pageNumber}`,
    );
    const result = payload?.data?.collectionMintsV2;
    const pageMints = Array.isArray(result?.mints) ? result.mints : null;
    if (!pageMints) {
      throw new Error(`[${collection.id}] Tensor page ${pageNumber} did not include mints`);
    }

    for (const wrapper of pageMints) {
      const mint = wrapper?.mint;
      const onchainId = cleanText(mint?.onchainId);
      if (!onchainId) {
        throw new Error(`[${collection.id}] Tensor returned a mint without an onchain ID`);
      }
      assets.push({
        onchainId,
        owner: cleanText(mint?.owner),
        name: cleanText(mint?.name),
        imageUri: normalizeUri(mint?.imageUri),
        animationUri: normalizeUri(mint?.animationUri),
        metadataUri: normalizeUri(mint?.metadataUri),
        files: normalizeFiles(mint?.files),
        attributes: normalizeAttributes(mint?.attributes),
        tokenProgram: cleanText(mint?.tokenProgram),
        tokenStandard: cleanText(mint?.tokenStandard),
      });
    }

    console.log(`[${collection.id}] Tensor page ${pageNumber}: ${assets.length} mints`);
    if (!result?.page?.hasMore) break;

    const nextCursor = cleanText(result?.page?.endCursor);
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error(`[${collection.id}] Tensor pagination stalled on page ${pageNumber}`);
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
    pageNumber += 1;
  }

  const uniqueMints = new Set(assets.map((asset) => asset.onchainId));
  if (uniqueMints.size !== assets.length) {
    throw new Error(
      `[${collection.id}] Tensor returned ${assets.length - uniqueMints.size} duplicate mint IDs`,
    );
  }
  return assets;
}

async function tensorGraphql(operationName, query, variables) {
  if (FORCE_TENSOR_BROWSER) {
    return tensorGraphqlInBrowser(operationName, query, variables);
  }
  const response = await fetchWithTimeout(TENSOR_GRAPHQL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ operationName, variables, query }),
  });
  const responseText = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(responseText);
  } catch {
    // A browser-origin retry below handles Tensor's occasional edge challenge.
  }
  if (response.ok && payload && !payload.errors) return payload;
  if (
    response.status === 403
    || !payload
    || /cloudflare|just a moment|challenge/i.test(responseText)
  ) {
    return tensorGraphqlInBrowser(operationName, query, variables);
  }
  throw new Error(
    `Tensor GraphQL failed (${response.status}): `
    + `${JSON.stringify(payload?.errors || payload || responseText.slice(0, 500) || {})}`,
  );
}

async function tensorGraphqlInBrowser(operationName, query, variables) {
  const page = await getTensorBrowserPage();
  const response = await page.evaluate(async ({
    url,
    operationName: evaluatedOperationName,
    query: evaluatedQuery,
    variables: evaluatedVariables,
  }) => {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        operationName: evaluatedOperationName,
        query: evaluatedQuery,
        variables: evaluatedVariables,
      }),
    });
    return {
      ok: result.ok,
      status: result.status,
      text: await result.text(),
    };
  }, {
    url: TENSOR_GRAPHQL_URL,
    operationName,
    query,
    variables,
  });

  let payload = null;
  try {
    payload = JSON.parse(response.text);
  } catch {
    // Report the non-JSON response below.
  }
  if (!response.ok || payload?.errors || !payload) {
    throw new Error(
      `Tensor browser GraphQL failed (${response.status}): `
      + `${JSON.stringify(payload?.errors || response.text.slice(0, 500))}`,
    );
  }
  return payload;
}

async function getTensorBrowserPage() {
  if (!tensorBrowser) {
    const { chromium } = loadPlaywright();
    tensorBrowser = await chromium.launch({ headless: true });
    tensorBrowserPage = await tensorBrowser.newPage({
      viewport: { width: 1200, height: 800 },
    });
  }
  const displaySlug = activeTensorPageSlug || "mtg_nft";
  if (tensorBrowserPageSlug !== displaySlug) {
    await tensorBrowserPage.goto(
      `https://www.tensor.trade/trade/${encodeURIComponent(displaySlug)}`,
      { waitUntil: "domcontentloaded", timeout: REQUEST_TIMEOUT_MS },
    );
    await tensorBrowserPage.waitForTimeout(1000);
    tensorBrowserPageSlug = displaySlug;
  }
  return tensorBrowserPage;
}

async function resolveAssetMetadata(collection, assets) {
  return mapConcurrent(assets, METADATA_WORKERS, async (asset, index) => {
    let directMetadata = null;
    let metadataFetchError = "";
    if (asset.metadataUri) {
      try {
        directMetadata = await fetchJsonWithRetry(
          asset.metadataUri,
          `${collection.id} metadata ${asset.onchainId}`,
        );
      } catch (error) {
        metadataFetchError = error?.message || String(error);
      }
    }

    const metadataAttributes = normalizeAttributes(directMetadata?.attributes);
    const attributes = metadataAttributes.length
      ? metadataAttributes
      : asset.attributes;
    const sourceName = cleanText(directMetadata?.name) || asset.name || asset.onchainId;
    const name = cleanText(asset.displayName) || sourceName;
    const imageUri = getMetadataImage(directMetadata)
      || asset.imageUri
      || getImageFile(asset.files);
    if (!imageUri) {
      throw new Error(`[${collection.id}] ${asset.onchainId} has no usable image URI`);
    }

    const metadata = {
      ...(directMetadata && typeof directMetadata === "object" ? directMetadata : {}),
      name,
      image: imageUri,
      attributes,
    };
    if (!metadata.properties) {
      metadata.properties = {
        category: "image",
        files: [{ uri: imageUri, type: "image" }],
      };
    }

    if ((index + 1) % 50 === 0 || index + 1 === assets.length) {
      console.log(`[${collection.id}] metadata ${index + 1}/${assets.length}`);
    }
    return {
      ...asset,
      name,
      sourceName,
      imageUri,
      attributes,
      directMetadata: metadata,
      metadataFetchError,
    };
  });
}

function validateCollectionSortValues(collection, assets) {
  if (!collection.sortByTitleNumber && !collection.additionalTensorCollections?.length) return;
  const seenBySource = new Map();
  for (const asset of assets) {
    if (!asset.sortByTitleNumber && !(
      collection.sortByTitleNumber && Number(asset.sourceCollectionOrder || 0) === 0
    )) continue;
    const number = getTitleNumber(asset.name);
    if (!Number.isInteger(number)) {
      throw new Error(`[${collection.id}] cannot find a title number in ${JSON.stringify(asset.name)}`);
    }
    const sourceOrder = Number(asset.sourceCollectionOrder || 0);
    if (!seenBySource.has(sourceOrder)) seenBySource.set(sourceOrder, new Set());
    const seen = seenBySource.get(sourceOrder);
    if (seen.has(number)) {
      throw new Error(`[${collection.id}] duplicate title number ${number} in source ${sourceOrder}`);
    }
    seen.add(number);
  }
}

function compareResolvedAssets(collection, a, b) {
  const sourceDifference = Number(a.sourceCollectionOrder || 0)
    - Number(b.sourceCollectionOrder || 0);
  if (sourceDifference) return sourceDifference;
  if (collection.preserveConfiguredOrder) {
    return Number(a.sourceOrder) - Number(b.sourceOrder);
  }
  if (collection.sortByTitleNumber || a.sortByTitleNumber || b.sortByTitleNumber) {
    const numberDifference = getTitleNumber(a.name) - getTitleNumber(b.name);
    if (numberDifference) return numberDifference;
  }
  return a.name.localeCompare(b.name, undefined, {
    numeric: true,
    sensitivity: "base",
  }) || a.onchainId.localeCompare(b.onchainId);
}

function getTitleNumber(value) {
  const match = cleanText(value).match(/(\d+)\s*$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function groupDuplicateAssets(assets) {
  const groups = new Map();
  for (const asset of assets) {
    const key = JSON.stringify([
      normalizeUri(asset.imageUri),
      normalizeComparableText(asset.name),
      asset.attributes.map((attribute) => [
        normalizeComparableText(attribute.trait_type),
        normalizeComparableText(attribute.value),
      ]),
    ]);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(asset);
  }
  return [...groups.entries()].map(([key, grouped]) => ({ key, assets: grouped }));
}

function orderCollectionGroups(collection, groups) {
  if (!Array.isArray(collection.displayTitleOrder) || !collection.displayTitleOrder.length) {
    return groups;
  }

  const titleOrder = new Map();
  const expectedCounts = new Map();
  collection.displayTitleOrder.forEach((title, index) => {
    const key = normalizeComparableText(title);
    if (!titleOrder.has(key)) titleOrder.set(key, index);
    expectedCounts.set(key, (expectedCounts.get(key) || 0) + 1);
  });

  const actualCounts = new Map();
  for (const group of groups) {
    const key = normalizeComparableText(group.assets[0]?.name);
    if (!expectedCounts.has(key)) continue;
    actualCounts.set(key, (actualCounts.get(key) || 0) + 1);
  }
  for (const [key, expectedCount] of expectedCounts) {
    const actualCount = actualCounts.get(key) || 0;
    if (actualCount !== expectedCount) {
      throw new Error(
        `[${collection.id}] display order expects ${expectedCount} group(s) for ${JSON.stringify(key)}; found ${actualCount}`,
      );
    }
  }

  return [...groups].sort((a, b) => {
    const keyA = normalizeComparableText(a.assets[0]?.name);
    const keyB = normalizeComparableText(b.assets[0]?.name);
    const orderA = titleOrder.get(keyA) ?? Number.MAX_SAFE_INTEGER;
    const orderB = titleOrder.get(keyB) ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB || a.assetNumber - b.assetNumber;
  });
}

function partitionCollectionGroups(collection, groups) {
  const excludedMintIds = new Set(collection.excludedMintIds || []);
  const includedGroups = [];
  const excludedGroups = [];

  for (const group of groups) {
    const shouldExclude = group.assets.some((asset) => (
      excludedMintIds.has(asset.onchainId)
    ));
    (shouldExclude ? excludedGroups : includedGroups).push(group);
  }

  const matchedExcludedMints = new Set(
    excludedGroups.flatMap((group) => group.assets.map((asset) => asset.onchainId)),
  );
  for (const mint of excludedMintIds) {
    if (!matchedExcludedMints.has(mint)) {
      throw new Error(`[${collection.id}] configured exclusion mint was not found: ${mint}`);
    }
  }
  return { includedGroups, excludedGroups };
}

function getGroupExclusionReason(collection, group) {
  const excludedMintIds = new Set(collection.excludedMintIds || []);
  const matchedMint = group.assets.find((asset) => excludedMintIds.has(asset.onchainId));
  return matchedMint
    ? `configured mint exclusion: ${matchedMint.onchainId}`
    : "configured group exclusion";
}

async function createCardEntries(collection, paths, groups) {
  return mapConcurrent(groups, METADATA_WORKERS, async (group, index) => {
    const number = index + 1;
    const assetNumber = group.assetNumber || number;
    const representative = group.assets[0];
    const mints = group.assets.map((asset) => asset.onchainId);
    const metadataFile = metadataFileForNumber(collection, assetNumber);
    const metadataPath = path.join(ROOT, metadataFile);
    const metadata = {
      ...representative.directMetadata,
      collection_mints: mints,
    };
    await mkdir(path.dirname(metadataPath), { recursive: true });
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

    const groupKeyHash = createHash("sha256").update(group.key).digest("hex");
    const stableId = `${collection.id}:group-${groupKeyHash.slice(0, 24)}`;
    const sourceAnimatedGifUri = collection.preserveAnimatedGifs
      ? getAnimatedGifSourceUri(representative)
      : "";
    return {
      number,
      assetNumber,
      collection: collection.id,
      title: representative.name || `${collection.label} ${number}`,
      stableId,
      groupKeyHash,
      mint: mints[0],
      mints,
      file: cardFileForNumber(collection, assetNumber),
      metadataFile,
      sourceMetadataUri: representative.metadataUri,
      sourceCollectionOrder: Number(representative.sourceCollectionOrder || 0),
      sourceCollectionSlug: cleanText(representative.sourceCollectionSlug),
      sourceName: representative.sourceName || representative.name,
      sourceImageUri: representative.imageUri,
      sourceImageSignature: createHash("sha256")
        .update(representative.imageUri)
        .digest("hex"),
      sourceAnimatedGifUri,
      sourceAnimatedGifSignature: sourceAnimatedGifUri
        ? createHash("sha256").update(sourceAnimatedGifUri).digest("hex")
        : "",
      animation: null,
      width: collection.width,
      height: collection.height,
      traitEntries: representative.attributes.map((attribute) => ({
        category: attribute.trait_type,
        value: attribute.value,
      })),
    };
  }).then((entries) => {
    validateExpectedAnimatedEntries(collection, entries);
    return entries;
  });
}

function validateExpectedAnimatedEntries(collection, entries) {
  if (!collection.preserveAnimatedGifs) return;
  if (!Array.isArray(collection.expectedAnimatedGroupKeyHashes)) return;
  const actual = entries
    .filter((entry) => entry.sourceAnimatedGifUri)
    .map((entry) => entry.groupKeyHash)
    .sort();
  const expected = [...(collection.expectedAnimatedGroupKeyHashes || [])].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `[${collection.id}] animated GIF groups changed; expected ${expected.join(", ") || "none"}, `
      + `received ${actual.join(", ") || "none"}`,
    );
  }
}

async function convertCardAssets(collection, paths, entries, previousSnapshot) {
  const previousCards = new Map(
    (previousSnapshot?.cards || []).map((card) => [card.stableId, card]),
  );
  const settingsAreCurrent = hasCurrentConversionSettings(collection, previousSnapshot?.conversion);

  await mapConcurrent(entries, IMAGE_WORKERS, async (entry, index) => {
    const outputPath = path.join(ROOT, entry.file);
    await mkdir(path.dirname(outputPath), { recursive: true });
    const previousCard = previousCards.get(entry.stableId);
    const outputIsCurrent = await isCurrentConvertedImage(collection, outputPath);
    if (
      !FORCE_IMAGES
      && outputIsCurrent
      && (
        RESUME_IMAGES
        || (
          settingsAreCurrent
          && previousSnapshot?.assetRevision === collection.revision
          && previousCard?.sourceImageSignature === entry.sourceImageSignature
          && previousCard?.cardFile === entry.file
        )
      )
    ) {
      if ((index + 1) % 25 === 0 || index + 1 === entries.length) {
        console.log(`[${collection.id}] images ${index + 1}/${entries.length}`);
      }
      return;
    }

    const converted = await retry(
      () => convertRemoteCardImage(collection, entry),
      RETRIES,
      `${collection.id} card image ${entry.number}`,
    );
    await writeFile(outputPath, converted);
    if ((index + 1) % 25 === 0 || index + 1 === entries.length) {
      console.log(`[${collection.id}] images ${index + 1}/${entries.length}`);
    }
  });
}

async function convertAnimatedAssets(collection, paths, entries, previousSnapshot) {
  if (!collection.preserveAnimatedGifs) return;
  const animatedEntries = entries.filter((entry) => entry.sourceAnimatedGifUri);
  const previousCards = new Map(
    (previousSnapshot?.cards || []).map((card) => [card.stableId, card]),
  );
  const settingsAreCurrent = hasCurrentAnimationConversionSettings(
    collection,
    previousSnapshot?.animationConversion,
  );

  await mapConcurrent(
    animatedEntries,
    ANIMATED_IMAGE_WORKERS,
    async (entry, index) => {
      const animatedFile = animatedFileForNumber(collection, entry.assetNumber);
      const animatedSpriteFile = animatedSpriteFileForNumber(
        collection,
        entry.assetNumber,
      );
      const animatedPath = path.join(ROOT, animatedFile);
      const animatedSpritePath = path.join(ROOT, animatedSpriteFile);
      await Promise.all([
        mkdir(path.dirname(animatedPath), { recursive: true }),
        mkdir(path.dirname(animatedSpritePath), { recursive: true }),
      ]);

      const previousCard = previousCards.get(entry.stableId);
      const previousAnimation = previousCard?.animation;
      if (
        !FORCE_IMAGES
        && settingsAreCurrent
        && previousSnapshot?.animationRevision === collection.animationRevision
        && previousCard?.sourceAnimatedGifSignature === entry.sourceAnimatedGifSignature
        && previousAnimation?.file === animatedFile
        && previousAnimation?.sprite?.file === animatedSpriteFile
        && await isCurrentAnimatedImage(collection, animatedPath, previousAnimation)
        && await isCurrentAnimatedSprite(animatedSpritePath, previousAnimation.sprite)
      ) {
        entry.animation = previousAnimation;
      } else {
        const input = await retry(
          () => fetchOriginalImageBuffer(entry.sourceAnimatedGifUri),
          RETRIES,
          `${collection.id} animated source ${entry.title}`,
        );
        const converted = await convertAnimatedImage(collection, input);
        const sprite = await createAnimatedSpriteAtlas(collection, converted.buffer, {
          frames: converted.frames,
          delays: converted.delays,
        });
        await Promise.all([
          writeFile(animatedPath, converted.buffer),
          writeFile(animatedSpritePath, sprite.buffer),
        ]);
        entry.animation = {
          file: animatedFile,
          frames: converted.frames,
          delays: converted.delays,
          frameDuration: converted.frameDuration,
          loop: converted.loop,
          width: collection.width,
          height: collection.height,
          sprite: {
            file: animatedSpriteFile,
            frames: converted.frames,
            columns: sprite.columns,
            rows: sprite.rows,
            frameWidth: sprite.frameWidth,
            frameHeight: sprite.frameHeight,
            frameDuration: converted.frameDuration,
          },
        };
      }

      console.log(
        `[${collection.id}] animations ${index + 1}/${animatedEntries.length}: ${entry.title}`,
      );
    },
  );
}

function hasCurrentAnimationConversionSettings(collection, conversion) {
  return conversion?.format === "animated webp"
    && conversion.width === collection.width
    && conversion.height === collection.height
    && conversion.quality === ANIMATED_WEBP_QUALITY
    && conversion.effort === 4
    && conversion.fit === "contain"
    && conversion.background === CARD_PADDING_COLOR
    && conversion.spriteWidth === collection.animatedSpriteWidth
    && conversion.spriteQuality === ANIMATED_SPRITE_QUALITY;
}

async function convertAnimatedImage(collection, input) {
  const sourceMetadata = await sharp(input, {
    animated: true,
    limitInputPixels: false,
  }).metadata();
  const frames = sourceMetadata.pages || 1;
  if (sourceMetadata.format !== "gif" || frames < 2) {
    throw new Error("animated source was not a multi-frame GIF");
  }
  const delays = normalizeAnimationDelays(sourceMetadata.delay, frames);
  const distinctDelays = new Set(delays);
  if (distinctDelays.size !== 1) {
    throw new Error("non-uniform GIF timing is not supported by the 3D sprite player");
  }
  const loop = Number.isInteger(sourceMetadata.loop) ? sourceMetadata.loop : 0;
  const buffer = await sharp(input, {
    animated: true,
    limitInputPixels: false,
  })
    .resize({
      width: collection.width,
      height: collection.height,
      fit: "contain",
      background: CARD_PADDING_COLOR,
    })
    .flatten({ background: CARD_PADDING_COLOR })
    .webp({
      quality: ANIMATED_WEBP_QUALITY,
      effort: 4,
      loop,
      delay: delays,
    })
    .toBuffer();
  const outputMetadata = await sharp(buffer, {
    animated: true,
    limitInputPixels: false,
  }).metadata();
  const outputDelays = normalizeAnimationDelays(outputMetadata.delay, frames);
  if (
    outputMetadata.format !== "webp"
    || outputMetadata.pages !== frames
    || outputMetadata.width !== collection.width
    || outputMetadata.pageHeight !== collection.height
    || JSON.stringify(outputDelays) !== JSON.stringify(delays)
    || outputMetadata.loop !== loop
  ) {
    throw new Error("animated WebP conversion did not preserve frames or timing");
  }
  return {
    buffer,
    frames,
    delays,
    frameDuration: delays[0],
    loop,
  };
}

async function createAnimatedSpriteAtlas(collection, animatedBuffer, animation) {
  const frameWidth = collection.animatedSpriteWidth;
  const frameHeight = Math.round(
    frameWidth * collection.height / collection.width,
  );
  const columns = getAnimatedAtlasColumns(
    animation.frames,
    frameWidth,
    frameHeight,
  );
  const rows = Math.ceil(animation.frames / columns);
  const atlasWidth = columns * frameWidth;
  const atlasHeight = rows * frameHeight;
  if (atlasWidth > 4096 || atlasHeight > 4096) {
    throw new Error(`animated sprite atlas is too large: ${atlasWidth}x${atlasHeight}`);
  }

  const atlas = Buffer.alloc(atlasWidth * atlasHeight * 4, 0);
  for (let frame = 0; frame < animation.frames; frame += 1) {
    const raw = await sharp(animatedBuffer, {
      page: frame,
      pages: 1,
      limitInputPixels: false,
    })
      .resize({
        width: frameWidth,
        height: frameHeight,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const column = frame % columns;
    const row = Math.floor(frame / columns);
    copyFrameIntoAtlas({
      atlas,
      atlasWidth,
      frameData: raw.data,
      frameWidth: raw.info.width,
      frameHeight: raw.info.height,
      targetX: column * frameWidth,
      targetY: row * frameHeight,
    });
  }

  const buffer = await sharp(atlas, {
    raw: {
      width: atlasWidth,
      height: atlasHeight,
      channels: 4,
    },
  })
    .webp({ quality: ANIMATED_SPRITE_QUALITY, effort: 4 })
    .toBuffer();
  return {
    buffer,
    columns,
    rows,
    frameWidth,
    frameHeight,
  };
}

function getAnimatedAtlasColumns(frames, frameWidth, frameHeight) {
  return Math.max(
    1,
    Math.ceil(Math.sqrt(frames * frameHeight / frameWidth)),
  );
}

function copyFrameIntoAtlas({
  atlas,
  atlasWidth,
  frameData,
  frameWidth,
  frameHeight,
  targetX,
  targetY,
}) {
  const rowBytes = frameWidth * 4;
  for (let y = 0; y < frameHeight; y += 1) {
    const sourceStart = y * rowBytes;
    const targetStart = ((targetY + y) * atlasWidth + targetX) * 4;
    frameData.copy(
      atlas,
      targetStart,
      sourceStart,
      sourceStart + rowBytes,
    );
  }
}

function normalizeAnimationDelays(delays, frames) {
  const values = Array.isArray(delays)
    ? delays.slice(0, frames).map((delay) => Math.max(20, Number(delay) || 100))
    : [];
  while (values.length < frames) values.push(100);
  return values;
}

async function isCurrentAnimatedImage(collection, filePath, animation) {
  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile() || fileStats.size <= 0) return false;
    const metadata = await sharp(await readFile(filePath), {
      animated: true,
      limitInputPixels: false,
    }).metadata();
    return metadata.format === "webp"
      && metadata.width === collection.width
      && metadata.pageHeight === collection.height
      && metadata.pages === animation.frames
      && metadata.loop === animation.loop
      && JSON.stringify(normalizeAnimationDelays(metadata.delay, animation.frames))
        === JSON.stringify(animation.delays);
  } catch {
    return false;
  }
}

async function isCurrentAnimatedSprite(filePath, sprite) {
  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile() || fileStats.size <= 0) return false;
    const metadata = await sharp(await readFile(filePath)).metadata();
    return metadata.format === "webp"
      && metadata.width === sprite.columns * sprite.frameWidth
      && metadata.height === sprite.rows * sprite.frameHeight;
  } catch {
    return false;
  }
}

async function convertRemoteCardImage(collection, entry) {
  const extraction = getCardExtraction(collection, entry);
  if (extraction) {
    const input = extraction.preferOriginal
      ? await fetchOriginalStillImageBuffer(entry.sourceImageUri)
      : await fetchImageBuffer(entry.sourceImageUri);
    return convertExtractedCardImage(collection, input, extraction);
  }
  if (collection.removeExteriorWhite) {
    const input = await fetchOriginalStillImageBuffer(entry.sourceImageUri);
    return convertTransparentTrimmedCardImage(collection, input);
  }
  const input = await fetchImageBuffer(entry.sourceImageUri);
  return sharp(input, { animated: false, limitInputPixels: false })
    .rotate()
    .resize({
      width: collection.width,
      height: collection.height,
      fit: "contain",
      background: CARD_PADDING_COLOR,
    })
    .flatten({ background: CARD_PADDING_COLOR })
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
    })
    .toBuffer();
}

function getCardExtraction(collection, entry) {
  const extractions = collection.cardExtractions || {};
  for (const mint of entry.mints || [entry.mint]) {
    if (extractions[mint]) return extractions[mint];
  }
  return null;
}

async function convertExtractedCardImage(collection, input, extraction) {
  const source = await sharp(input, {
    animated: false,
    limitInputPixels: false,
  })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = source.info;
  const pixelCount = width * height;
  let cardMask;

  if (extraction.mode === "dark-exterior") {
    const foreground = new Uint8Array(pixelCount);
    for (let pixel = 0, offset = 0; pixel < pixelCount; pixel += 1, offset += channels) {
      const maximum = Math.max(
        source.data[offset],
        source.data[offset + 1],
        source.data[offset + 2],
      );
      foreground[pixel] = maximum > extraction.maximum ? 1 : 0;
    }
    const closedForeground = closeBinaryMask(
      foreground,
      width,
      height,
      extraction.closeRadius || 0,
    );
    const largestForeground = findLargestForegroundMask(
      closedForeground,
      width,
      height,
    );
    const exterior = findExteriorMask(largestForeground, width, height);
    cardMask = new Uint8Array(pixelCount);
    for (let pixel = 0; pixel < pixelCount; pixel += 1) {
      cardMask[pixel] = exterior[pixel] ? 0 : 1;
    }
  } else if (extraction.mode === "polygon") {
    cardMask = createNormalizedPolygonMask(
      width,
      height,
      extraction.points,
    );
    if (extraction.padding > 0) {
      cardMask = dilateBinaryMask(
        cardMask,
        width,
        height,
        extraction.padding,
      );
    }
  } else {
    throw new Error(`unsupported card extraction mode ${extraction.mode}`);
  }

  const alpha = new Uint8Array(pixelCount);
  for (let pixel = 0, offset = 0; pixel < pixelCount; pixel += 1, offset += channels) {
    alpha[pixel] = cardMask[pixel] ? source.data[offset + 3] : 0;
  }
  return renderTransparentCardImage(collection, source, alpha);
}

function createNormalizedPolygonMask(width, height, normalizedPoints) {
  if (!Array.isArray(normalizedPoints) || normalizedPoints.length < 3) {
    throw new Error("card extraction polygon needs at least three points");
  }
  const points = normalizedPoints.map(([x, y]) => ({
    x: Number(x) * (width - 1),
    y: Number(y) * (height - 1),
  }));
  const mask = new Uint8Array(width * height);
  const minimumX = Math.max(0, Math.floor(Math.min(...points.map(({ x }) => x))));
  const maximumX = Math.min(width - 1, Math.ceil(Math.max(...points.map(({ x }) => x))));
  const minimumY = Math.max(0, Math.floor(Math.min(...points.map(({ y }) => y))));
  const maximumY = Math.min(height - 1, Math.ceil(Math.max(...points.map(({ y }) => y))));

  for (let y = minimumY; y <= maximumY; y += 1) {
    for (let x = minimumX; x <= maximumX; x += 1) {
      let inside = false;
      for (
        let point = 0, previous = points.length - 1;
        point < points.length;
        previous = point, point += 1
      ) {
        const currentPoint = points[point];
        const previousPoint = points[previous];
        const intersects = (
          (currentPoint.y > y) !== (previousPoint.y > y)
          && x < (
            (previousPoint.x - currentPoint.x)
            * (y - currentPoint.y)
            / (previousPoint.y - currentPoint.y)
            + currentPoint.x
          )
        );
        if (intersects) inside = !inside;
      }
      if (inside) mask[y * width + x] = 1;
    }
  }
  return mask;
}

async function convertTransparentTrimmedCardImage(collection, input) {
  const source = await sharp(input, {
    animated: false,
    limitInputPixels: false,
  })
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const {
    width,
    height,
    channels,
  } = source.info;
  const pixelCount = width * height;
  const foreground = new Uint8Array(pixelCount);
  const backgroundLike = new Uint8Array(pixelCount);

  for (let pixel = 0, offset = 0; pixel < pixelCount; pixel += 1, offset += channels) {
    const red = source.data[offset];
    const green = source.data[offset + 1];
    const blue = source.data[offset + 2];
    const minimum = Math.min(red, green, blue);
    const maximum = Math.max(red, green, blue);
    const chroma = maximum - minimum;
    foreground[pixel] = (
      chroma >= collection.strongColorChroma
      || maximum <= collection.strongDarkMaximum
    ) ? 1 : 0;
    backgroundLike[pixel] = (
      minimum >= collection.whiteBackgroundMinimum
      && chroma <= collection.whiteBackgroundMaximumChroma
    ) ? 1 : 0;
  }

  const closedForeground = closeBinaryMask(
    foreground,
    width,
    height,
    collection.whiteCloseRadius,
  );
  const largestForeground = findLargestForegroundMask(
    closedForeground,
    width,
    height,
  );
  const exterior = findExteriorMask(largestForeground, width, height);
  const borderConnectedBackground = findBorderConnectedMask(
    backgroundLike,
    width,
    height,
  );
  const provisionalCardMask = new Uint8Array(pixelCount);
  const alpha = new Uint8Array(pixelCount);

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    provisionalCardMask[pixel] = (
      !exterior[pixel]
      && !borderConnectedBackground[pixel]
    ) ? 1 : 0;
  }
  const cardMask = findLargestForegroundMask(
    provisionalCardMask,
    width,
    height,
  );
  for (let pixel = 0, offset = 0; pixel < pixelCount; pixel += 1, offset += channels) {
    alpha[pixel] = cardMask[pixel] ? source.data[offset + 3] : 0;
  }

  return renderTransparentCardImage(collection, source, alpha);
}

function renderTransparentCardImage(collection, source, alpha) {
  const {
    width,
    height,
    channels,
  } = source.info;
  const bounds = findAlphaBounds(alpha, width, height, 8);
  if (!bounds) throw new Error("white-background removal did not find a card silhouette");
  const safety = Math.max(0, collection.trimSafety || 0);
  const left = Math.max(0, bounds.left - safety);
  const top = Math.max(0, bounds.top - safety);
  const right = Math.min(width - 1, bounds.right + safety);
  const bottom = Math.min(height - 1, bounds.bottom + safety);
  const croppedWidth = right - left + 1;
  const croppedHeight = bottom - top + 1;
  const cropped = Buffer.alloc(croppedWidth * croppedHeight * 4);

  for (let y = top; y <= bottom; y += 1) {
    for (let x = left; x <= right; x += 1) {
      const sourcePixel = y * width + x;
      const sourceOffset = sourcePixel * channels;
      const targetOffset = ((y - top) * croppedWidth + (x - left)) * 4;
      cropped[targetOffset] = source.data[sourceOffset];
      cropped[targetOffset + 1] = source.data[sourceOffset + 1];
      cropped[targetOffset + 2] = source.data[sourceOffset + 2];
      cropped[targetOffset + 3] = alpha[sourcePixel];
      if (!cropped[targetOffset + 3]) {
        cropped[targetOffset] = 0;
        cropped[targetOffset + 1] = 0;
        cropped[targetOffset + 2] = 0;
      }
    }
  }

  return sharp(cropped, {
    raw: {
      width: croppedWidth,
      height: croppedHeight,
      channels: 4,
      premultiplied: true,
    },
  })
    .resize({
      width: collection.width,
      height: collection.height,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({
      quality: WEBP_QUALITY,
      alphaQuality: 100,
      effort: 4,
      smartSubsample: true,
    })
    .toBuffer();
}

function closeBinaryMask(mask, width, height, radius) {
  if (!(radius > 0)) return mask;
  if (radius === 3) {
    return erodeEllipse7BinaryMask(
      dilateEllipse7BinaryMask(mask, width, height),
      width,
      height,
    );
  }
  if (radius === 2) {
    return erodeEllipse5BinaryMask(
      dilateEllipse5BinaryMask(mask, width, height),
      width,
      height,
    );
  }
  return erodeBinaryMask(
    dilateBinaryMask(mask, width, height, radius),
    width,
    height,
    radius,
  );
}

function dilateEllipse7BinaryMask(mask, width, height) {
  const horizontal2 = dilateHorizontalBinaryMask(mask, width, height, 2);
  const horizontal3 = dilateHorizontalBinaryMask(mask, width, height, 3);
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      output[y * width + x] = (
        (y >= 3 && mask[(y - 3) * width + x])
        || (y >= 2 && horizontal2[(y - 2) * width + x])
        || (y >= 1 && horizontal3[(y - 1) * width + x])
        || horizontal3[y * width + x]
        || (y + 1 < height && horizontal3[(y + 1) * width + x])
        || (y + 2 < height && horizontal2[(y + 2) * width + x])
        || (y + 3 < height && mask[(y + 3) * width + x])
      ) ? 1 : 0;
    }
  }
  return output;
}

function erodeEllipse7BinaryMask(mask, width, height) {
  const horizontal2 = erodeHorizontalBinaryMask(mask, width, height, 2);
  const horizontal3 = erodeHorizontalBinaryMask(mask, width, height, 3);
  const output = new Uint8Array(mask.length);
  for (let y = 3; y + 3 < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      output[y * width + x] = (
        mask[(y - 3) * width + x]
        && horizontal2[(y - 2) * width + x]
        && horizontal3[(y - 1) * width + x]
        && horizontal3[y * width + x]
        && horizontal3[(y + 1) * width + x]
        && horizontal2[(y + 2) * width + x]
        && mask[(y + 3) * width + x]
      ) ? 1 : 0;
    }
  }
  return output;
}

function dilateEllipse5BinaryMask(mask, width, height) {
  const horizontal = dilateHorizontalBinaryMask(mask, width, height, 2);
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      output[y * width + x] = (
        (y >= 2 && mask[(y - 2) * width + x])
        || (y >= 1 && horizontal[(y - 1) * width + x])
        || horizontal[y * width + x]
        || (y + 1 < height && horizontal[(y + 1) * width + x])
        || (y + 2 < height && mask[(y + 2) * width + x])
      ) ? 1 : 0;
    }
  }
  return output;
}

function erodeEllipse5BinaryMask(mask, width, height) {
  const horizontal = erodeHorizontalBinaryMask(mask, width, height, 2);
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    if (y < 2 || y + 2 >= height) continue;
    for (let x = 0; x < width; x += 1) {
      output[y * width + x] = (
        mask[(y - 2) * width + x]
        && horizontal[(y - 1) * width + x]
        && horizontal[y * width + x]
        && horizontal[(y + 1) * width + x]
        && mask[(y + 2) * width + x]
      ) ? 1 : 0;
    }
  }
  return output;
}

function dilateHorizontalBinaryMask(mask, width, height, radius) {
  const output = new Uint8Array(mask.length);
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;
    let count = 0;
    for (let x = 0; x <= radius && x < width; x += 1) {
      count += mask[rowOffset + x];
    }
    for (let x = 0; x < width; x += 1) {
      output[rowOffset + x] = count > 0 ? 1 : 0;
      const removeX = x - radius;
      const addX = x + radius + 1;
      if (removeX >= 0) count -= mask[rowOffset + removeX];
      if (addX < width) count += mask[rowOffset + addX];
    }
  }
  return output;
}

function erodeHorizontalBinaryMask(mask, width, height, radius) {
  const output = new Uint8Array(mask.length);
  const diameter = radius * 2 + 1;
  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;
    let count = 0;
    for (let x = 0; x <= radius && x < width; x += 1) {
      count += mask[rowOffset + x];
    }
    for (let x = 0; x < width; x += 1) {
      output[rowOffset + x] = (
        x >= radius
        && x + radius < width
        && count === diameter
      ) ? 1 : 0;
      const removeX = x - radius;
      const addX = x + radius + 1;
      if (removeX >= 0) count -= mask[rowOffset + removeX];
      if (addX < width) count += mask[rowOffset + addX];
    }
  }
  return output;
}

function dilateBinaryMask(mask, width, height, radius) {
  if (!(radius > 0)) return mask;
  const horizontal = new Uint8Array(mask.length);
  const output = new Uint8Array(mask.length);

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;
    let count = 0;
    for (let x = 0; x <= radius && x < width; x += 1) {
      count += mask[rowOffset + x];
    }
    for (let x = 0; x < width; x += 1) {
      horizontal[rowOffset + x] = count > 0 ? 1 : 0;
      const removeX = x - radius;
      const addX = x + radius + 1;
      if (removeX >= 0) count -= mask[rowOffset + removeX];
      if (addX < width) count += mask[rowOffset + addX];
    }
  }

  for (let x = 0; x < width; x += 1) {
    let count = 0;
    for (let y = 0; y <= radius && y < height; y += 1) {
      count += horizontal[y * width + x];
    }
    for (let y = 0; y < height; y += 1) {
      output[y * width + x] = count > 0 ? 1 : 0;
      const removeY = y - radius;
      const addY = y + radius + 1;
      if (removeY >= 0) count -= horizontal[removeY * width + x];
      if (addY < height) count += horizontal[addY * width + x];
    }
  }
  return output;
}

function erodeBinaryMask(mask, width, height, radius) {
  if (!(radius > 0)) return mask;
  const horizontal = new Uint8Array(mask.length);
  const output = new Uint8Array(mask.length);
  const diameter = radius * 2 + 1;

  for (let y = 0; y < height; y += 1) {
    const rowOffset = y * width;
    let count = 0;
    for (let x = 0; x <= radius && x < width; x += 1) {
      count += mask[rowOffset + x];
    }
    for (let x = 0; x < width; x += 1) {
      horizontal[rowOffset + x] = (
        x >= radius
        && x + radius < width
        && count === diameter
      ) ? 1 : 0;
      const removeX = x - radius;
      const addX = x + radius + 1;
      if (removeX >= 0) count -= mask[rowOffset + removeX];
      if (addX < width) count += mask[rowOffset + addX];
    }
  }

  for (let x = 0; x < width; x += 1) {
    let count = 0;
    for (let y = 0; y <= radius && y < height; y += 1) {
      count += horizontal[y * width + x];
    }
    for (let y = 0; y < height; y += 1) {
      output[y * width + x] = (
        y >= radius
        && y + radius < height
        && count === diameter
      ) ? 1 : 0;
      const removeY = y - radius;
      const addY = y + radius + 1;
      if (removeY >= 0) count -= horizontal[removeY * width + x];
      if (addY < height) count += horizontal[addY * width + x];
    }
  }
  return output;
}

function findExteriorMask(barrier, width, height) {
  const exterior = new Uint8Array(barrier.length);
  const queue = new Int32Array(barrier.length);
  let head = 0;
  let tail = 0;

  const push = (pixel) => {
    if (barrier[pixel] || exterior[pixel]) return;
    exterior[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };
  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    push(y * width);
    push(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    if (x > 0) push(pixel - 1);
    if (x + 1 < width) push(pixel + 1);
    if (pixel >= width) push(pixel - width);
    if (pixel + width < barrier.length) push(pixel + width);
  }
  return exterior;
}

function findBorderConnectedMask(mask, width, height) {
  const connected = new Uint8Array(mask.length);
  const queue = new Int32Array(mask.length);
  let head = 0;
  let tail = 0;
  const push = (pixel) => {
    if (!mask[pixel] || connected[pixel]) return;
    connected[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };
  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    push(y * width);
    push(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    if (x > 0) push(pixel - 1);
    if (x + 1 < width) push(pixel + 1);
    if (pixel >= width) push(pixel - width);
    if (pixel + width < mask.length) push(pixel + width);
    if (pixel >= width && x > 0) push(pixel - width - 1);
    if (pixel >= width && x + 1 < width) push(pixel - width + 1);
    if (pixel + width < mask.length && x > 0) push(pixel + width - 1);
    if (pixel + width < mask.length && x + 1 < width) push(pixel + width + 1);
  }
  return connected;
}

function findLargestForegroundMask(foreground, width, height) {
  const labels = new Int32Array(foreground.length);
  const queue = new Int32Array(foreground.length);
  let label = 0;
  let largestLabel = 0;
  let largestSize = 0;

  for (let start = 0; start < foreground.length; start += 1) {
    if (!foreground[start] || labels[start]) continue;
    label += 1;
    let head = 0;
    let tail = 0;
    labels[start] = label;
    queue[tail] = start;
    tail += 1;

    while (head < tail) {
      const pixel = queue[head];
      head += 1;
      const x = pixel % width;
      if (x > 0) {
        const neighbor = pixel - 1;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
      if (x + 1 < width) {
        const neighbor = pixel + 1;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
      if (pixel >= width) {
        const neighbor = pixel - width;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
      if (pixel + width < foreground.length) {
        const neighbor = pixel + width;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
      if (pixel >= width && x > 0) {
        const neighbor = pixel - width - 1;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
      if (pixel >= width && x + 1 < width) {
        const neighbor = pixel - width + 1;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
      if (pixel + width < foreground.length && x > 0) {
        const neighbor = pixel + width - 1;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
      if (pixel + width < foreground.length && x + 1 < width) {
        const neighbor = pixel + width + 1;
        if (foreground[neighbor] && !labels[neighbor]) {
          labels[neighbor] = label;
          queue[tail] = neighbor;
          tail += 1;
        }
      }
    }
    if (tail > largestSize) {
      largestSize = tail;
      largestLabel = label;
    }
  }

  if (!largestLabel) throw new Error("card matte has no foreground component");
  const output = new Uint8Array(foreground.length);
  for (let pixel = 0; pixel < labels.length; pixel += 1) {
    output[pixel] = labels[pixel] === largestLabel ? 1 : 0;
  }
  return output;
}

function findAlphaBounds(alpha, width, height, threshold) {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    if (alpha[pixel] <= threshold) continue;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }
  return right >= left && bottom >= top
    ? { left, top, right, bottom }
    : null;
}

async function fetchImageBuffer(sourceUrl) {
  const normalizedUrl = normalizeUri(sourceUrl);
  if (!normalizedUrl) throw new Error("missing image URL");
  const sourceCandidates = getImageSourceCandidates(normalizedUrl);
  let lastStatus = "";

  for (const candidate of sourceCandidates) {
    const cdnUrl = `${TENSOR_IMAGE_CDN_URL}/${encodeURIComponent(candidate)}`;
    const cdnResponse = await fetchWithTimeout(cdnUrl, {
      headers: { accept: "image/*,*/*;q=0.8" },
    }).catch(() => null);
    if (cdnResponse?.ok) {
      const buffer = Buffer.from(await cdnResponse.arrayBuffer());
      if (buffer.length) return buffer;
    }

    const sourceResponse = await fetchWithTimeout(candidate, {
      headers: { accept: "image/avif,image/webp,image/apng,image/gif,image/*,*/*;q=0.8" },
    }).catch(() => null);
    lastStatus = sourceResponse?.status || lastStatus;
    if (!sourceResponse?.ok) continue;
    const buffer = Buffer.from(await sourceResponse.arrayBuffer());
    if (buffer.length) return buffer;
  }

  throw new Error(`image fetch failed ${lastStatus || "network error"} ${normalizedUrl}`);
}

async function fetchOriginalImageBuffer(sourceUrl) {
  const normalizedUrl = normalizeUri(sourceUrl);
  if (!normalizedUrl) throw new Error("missing original image URL");
  let lastStatus = "";

  for (const candidate of getImageSourceCandidates(normalizedUrl)) {
    const response = await fetchWithTimeout(candidate, {
      headers: { accept: "image/gif,image/*,*/*;q=0.8" },
    }).catch(() => null);
    lastStatus = response?.status || lastStatus;
    if (!response?.ok) continue;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length && buffer.subarray(0, 3).toString("ascii") === "GIF") {
      return buffer;
    }
  }

  throw new Error(
    `original GIF fetch failed ${lastStatus || "network error"} ${normalizedUrl}`,
  );
}

async function fetchOriginalStillImageBuffer(sourceUrl) {
  const normalizedUrl = normalizeUri(sourceUrl);
  if (!normalizedUrl) throw new Error("missing original image URL");
  let lastStatus = "";

  for (const candidate of getImageSourceCandidates(normalizedUrl)) {
    const response = await fetchWithTimeout(candidate, {
      headers: { accept: "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8" },
    }).catch(() => null);
    lastStatus = response?.status || lastStatus;
    if (!response?.ok) continue;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length) return buffer;
  }

  throw new Error(
    `original image fetch failed ${lastStatus || "network error"} ${normalizedUrl}`,
  );
}

function getImageSourceCandidates(sourceUrl) {
  const candidates = [];
  try {
    const parsed = new URL(sourceUrl);
    // Irys' legacy CDN redirect decodes escaped path characters before issuing
    // its Location header. A filename containing `#` is then interpreted as a
    // URL fragment and the asset 404s. Preserve the escaping through that
    // redirect as a fallback while retaining the canonical URI in metadata.
    if (parsed.hostname === "gateway.irys.xyz" && /%[0-9a-f]{2}/i.test(parsed.pathname)) {
      candidates.push(
        `${parsed.origin}${parsed.pathname.replaceAll("%", "%25")}${parsed.search}`,
      );
    }
    if (parsed.hostname === "turbo-gateway.com") {
      const transactionId = parsed.pathname.replace(/^\/+|\/+$/g, "");
      if (transactionId) candidates.push(`https://arweave.net/${transactionId}`);
    }
  } catch {
    // The normalized source remains the only candidate.
  }
  candidates.push(sourceUrl);
  return [...new Set(candidates)];
}

async function convertSharedBack(collection, paths, previousSnapshot) {
  if (collection.backSource) {
    return;
  }

  if (
    !FORCE_IMAGES
    && previousSnapshot?.assetRevision === collection.revision
    && previousSnapshot?.sharedBack?.color === BACK_COLOR
    && await isCurrentConvertedImage(collection, paths.backPath)
  ) {
    return;
  }

  const buffer = await sharp({
    create: {
      width: collection.width,
      height: collection.height,
      channels: 3,
      background: BACK_COLOR,
    },
  })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
  await writeFile(paths.backPath, buffer);
}

function hasCurrentConversionSettings(collection, conversion) {
  return conversion?.format === "webp"
    && conversion.width === collection.width
    && conversion.height === collection.height
    && conversion.quality === WEBP_QUALITY
    && conversion.effort === 4
    && conversion.fit === "contain"
    && conversion.background === (
      collection.removeExteriorWhite ? "transparent" : CARD_PADDING_COLOR
    )
    && Boolean(conversion.removeExteriorWhite) === Boolean(collection.removeExteriorWhite)
    && JSON.stringify(conversion.cardExtractions || {})
      === JSON.stringify(collection.cardExtractions || {})
    && (
      !collection.removeExteriorWhite
      || (
        conversion.strongColorChroma === collection.strongColorChroma
        && conversion.strongDarkMaximum === collection.strongDarkMaximum
        && conversion.whiteBackgroundMinimum === collection.whiteBackgroundMinimum
        && conversion.whiteBackgroundMaximumChroma
          === collection.whiteBackgroundMaximumChroma
        && conversion.whiteCloseRadius === collection.whiteCloseRadius
        && conversion.trimSafety === collection.trimSafety
      )
    );
}

async function isCurrentConvertedImage(collection, filePath) {
  try {
    const fileStats = await stat(filePath);
    if (!fileStats.isFile() || fileStats.size <= 0) return false;
    const metadata = await sharp(await readFile(filePath)).metadata();
    return metadata.format === "webp"
      && metadata.width === collection.width
      && metadata.height === collection.height;
  } catch {
    return false;
  }
}

async function writeDataModules(collection, paths, entries) {
  const publicCards = entries.map((entry) => ({
    number: entry.number,
    collection: entry.collection,
    title: entry.title,
    stableId: entry.stableId,
    mint: entry.mint,
    ...(entry.mints.length > 1 ? { mints: entry.mints } : {}),
    file: `${entry.file}?v=${collection.revision}`,
    ...(entry.animation
      ? {
        animation: {
          file: `${entry.animation.file}?v=${collection.animationRevision}`,
          frames: entry.animation.frames,
          delays: entry.animation.delays,
          frameDuration: entry.animation.frameDuration,
          loop: entry.animation.loop,
          sprite: {
            ...entry.animation.sprite,
            file: `${entry.animation.sprite.file}?v=${collection.animationRevision}`,
          },
        },
      }
      : {}),
    width: entry.width,
    height: entry.height,
  }));
  const traitCategories = getTraitCategories(entries);
  const publicTraits = entries.map((entry) => ({
    metadata: entry.metadataFile,
    entries: entry.traitEntries,
  }));

  await Promise.all([
    writeFile(paths.dataPath, [
      "// Generated by scripts/sync-community-collections.mjs",
      `export const ${collection.modulePrefix}_CARDS = ${JSON.stringify(publicCards)};`,
      "",
    ].join("\n")),
    writeFile(paths.traitsPath, [
      "// Generated by scripts/sync-community-collections.mjs",
      `export const ${collection.modulePrefix}_TRAIT_CATEGORIES = ${JSON.stringify(traitCategories)};`,
      `export const ${collection.modulePrefix}_TRAITS = ${JSON.stringify(publicTraits)};`,
      "",
    ].join("\n")),
  ]);
}

function getTraitCategories(entries) {
  const categories = [];
  const seen = new Set();
  for (const entry of entries) {
    for (const trait of entry.traitEntries) {
      const key = normalizeComparableText(trait.category);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      categories.push(trait.category);
    }
  }
  return categories;
}

async function writeSourceSnapshot({
  collection,
  paths,
  instrument,
  tensorSources,
  tensorLiveAssets,
  liveAssets,
  excludedAssets,
  entries,
}) {
  const sortedMintIds = liveAssets.map((asset) => asset.onchainId).sort();
  const sortedTensorMintIds = tensorLiveAssets.map((asset) => asset.onchainId).sort();
  const metadataFailureCount = tensorLiveAssets
    .filter((asset) => asset.metadataFetchError)
    .length;
  const explicitMintSource = collection.sourceMode === "explicit-mints";
  const tensorCollectionRecords = explicitMintSource
    ? []
    : tensorSources.map((source, sourceIndex) => ({
      sourceOrder: sourceIndex,
      page: `https://www.tensor.trade/trade/${source.pageSlug}`,
      pageSlug: source.pageSlug,
      collectionSlug: source.collectionSlug,
      name: source.instrument?.name || "",
      displayTitlePrefix: source.displayTitlePrefix || "",
      fetchedMintCount: source.assets.length,
      reportedMintCount: Number(source.instrument?.statsV2?.numMints) || null,
    }));
  const snapshot = {
    fetchedAt: new Date().toISOString(),
    source: explicitMintSource ? SOLANA_DAS_RPC_URL : TENSOR_GRAPHQL_URL,
    tensorPage: explicitMintSource
      ? collection.sourcePage
      : `https://www.tensor.trade/trade/${collection.tensorPageSlug}`,
    collectionSlug: explicitMintSource ? null : collection.tensorSlug,
    collectionDisplaySlug: explicitMintSource ? null : collection.tensorPageSlug,
    membershipPolicy: explicitMintSource
      ? "Exactly the configured curated Solana mint IDs, in configured order"
      : tensorCollectionRecords.length > 1
        ? "Every live mint returned by the configured Tensor collections; appended collections retain their configured series order; exact duplicate editions share one binder card"
      : excludedAssets.length
        ? "Every live mint returned by Tensor except configured mint exclusions; exact duplicate editions share one binder card"
        : "Every live mint returned by Tensor; exact duplicate editions share one binder card",
    assetRevision: collection.revision,
    animationRevision: collection.animationRevision || null,
    liveMintCount: liveAssets.length,
    tensorFetchedMintCount: tensorLiveAssets.length,
    tensorReportedMintCount: tensorCollectionRecords.length === 1
      ? Number(instrument?.statsV2?.numMints) || null
      : null,
    tensorCollections: tensorCollectionRecords,
    excludedMintCount: excludedAssets.length,
    exclusionRules: {
      mintIds: [...(collection.excludedMintIds || [])],
    },
    cardCount: entries.length,
    groupedDuplicateMintCount: liveAssets.length - entries.length,
    metadataFetchFailureCount: metadataFailureCount,
    liveMintIdsSha256: createHash("sha256")
      .update(`${sortedMintIds.join("\n")}\n`)
      .digest("hex"),
    tensorLiveMintIdsSha256: createHash("sha256")
      .update(`${sortedTensorMintIds.join("\n")}\n`)
      .digest("hex"),
    instrument,
    conversion: {
      format: "webp",
      width: collection.width,
      height: collection.height,
      quality: WEBP_QUALITY,
      effort: 4,
      fit: "contain",
      background: collection.removeExteriorWhite ? "transparent" : CARD_PADDING_COLOR,
      removeExteriorWhite: Boolean(collection.removeExteriorWhite),
      cardExtractions: collection.cardExtractions || {},
      ...(collection.removeExteriorWhite
        ? {
          strongColorChroma: collection.strongColorChroma,
          strongDarkMaximum: collection.strongDarkMaximum,
          whiteBackgroundMinimum: collection.whiteBackgroundMinimum,
          whiteBackgroundMaximumChroma: collection.whiteBackgroundMaximumChroma,
          whiteCloseRadius: collection.whiteCloseRadius,
          trimSafety: collection.trimSafety,
          imageSource: "original metadata image URI",
        }
        : {
          imageProxy: TENSOR_IMAGE_CDN_URL,
        }),
    },
    animationConversion: collection.preserveAnimatedGifs
      ? {
        format: "animated webp",
        width: collection.width,
        height: collection.height,
        quality: ANIMATED_WEBP_QUALITY,
        effort: 4,
        fit: "contain",
        background: CARD_PADDING_COLOR,
        spriteWidth: collection.animatedSpriteWidth,
        spriteQuality: ANIMATED_SPRITE_QUALITY,
      }
      : null,
    sharedBack: {
      source: collection.backSource || "generated solid color",
      color: collection.backSource ? null : BACK_COLOR,
      file: paths.backFile,
      width: collection.backWidth || collection.width,
      height: collection.backHeight || collection.height,
    },
    liveAssets: liveAssets.map((asset) => ({
      onchainId: asset.onchainId,
      owner: asset.owner,
      name: asset.name,
      imageUri: asset.imageUri,
      animationUri: asset.animationUri,
      metadataUri: asset.metadataUri,
      files: asset.files,
      attributes: asset.attributes,
      tokenProgram: asset.tokenProgram,
      tokenStandard: asset.tokenStandard,
      metadataFetchError: asset.metadataFetchError,
      sourceCollectionOrder: Number(asset.sourceCollectionOrder || 0),
      sourceCollectionSlug: cleanText(asset.sourceCollectionSlug),
      sourceName: asset.sourceName || asset.name,
    })),
    excludedAssets: excludedAssets.map((asset) => ({
      onchainId: asset.onchainId,
      owner: asset.owner,
      name: asset.name,
      imageUri: asset.imageUri,
      animationUri: asset.animationUri,
      metadataUri: asset.metadataUri,
      files: asset.files,
      attributes: asset.attributes,
      tokenProgram: asset.tokenProgram,
      tokenStandard: asset.tokenStandard,
      metadataFetchError: asset.metadataFetchError,
      groupKeyHash: asset.groupKeyHash,
      exclusionReason: asset.exclusionReason,
    })),
    cards: entries.map((entry) => ({
      number: entry.number,
      assetNumber: entry.assetNumber,
      stableId: entry.stableId,
      groupKeyHash: entry.groupKeyHash,
      title: entry.title,
      sourceCollectionOrder: entry.sourceCollectionOrder,
      sourceCollectionSlug: entry.sourceCollectionSlug,
      sourceName: entry.sourceName,
      mints: entry.mints,
      sourceMetadataUri: entry.sourceMetadataUri,
      sourceImageUri: entry.sourceImageUri,
      sourceAnimatedGifUri: entry.sourceAnimatedGifUri,
      sourceAnimatedGifSignature: entry.sourceAnimatedGifSignature,
      sourceImageSignature: entry.sourceImageSignature,
      metadataFile: entry.metadataFile,
      cardFile: entry.file,
      animation: entry.animation,
    })),
  };
  await writeFile(paths.sourcePath, `${JSON.stringify(snapshot, null, 2)}\n`);
}

function cardFileForNumber(collection, number) {
  return `assets/${collection.id}/cards/${bucketForNumber(number)}/card-${number}.webp`;
}

function animatedFileForNumber(collection, number) {
  return `assets/${collection.id}/animated/${bucketForNumber(number)}/card-${number}.webp`;
}

function animatedSpriteFileForNumber(collection, number) {
  return `assets/${collection.id}/animated-sprites/${bucketForNumber(number)}/card-${number}.webp`;
}

function metadataFileForNumber(collection, number) {
  return `assets/${collection.id}/metadata/${bucketForNumber(number)}/card-${number}.json`;
}

function bucketForNumber(number) {
  return String(Math.floor((number - 1) / 1000) * 1000).padStart(4, "0");
}

async function pruneGeneratedAssets(collection, paths, entries) {
  const tasks = [
    pruneGeneratedDirectory(
      paths.cardDir,
      ".webp",
      new Set(entries.map((entry) => path.join(ROOT, entry.file))),
      `${collection.id} card`,
    ),
    pruneGeneratedDirectory(
      paths.metadataDir,
      ".json",
      new Set(entries.map((entry) => path.join(ROOT, entry.metadataFile))),
      `${collection.id} metadata`,
    ),
  ];
  if (collection.preserveAnimatedGifs) {
    const animatedEntries = entries.filter((entry) => entry.animation);
    tasks.push(
      pruneGeneratedDirectory(
        paths.animatedDir,
        ".webp",
        new Set(animatedEntries.map((entry) => path.join(ROOT, entry.animation.file))),
        `${collection.id} animated`,
      ),
      pruneGeneratedDirectory(
        paths.animatedSpriteDir,
        ".webp",
        new Set(
          animatedEntries.map((entry) => path.join(ROOT, entry.animation.sprite.file)),
        ),
        `${collection.id} animated sprite`,
      ),
    );
  }
  await Promise.all(tasks);
}

async function pruneGeneratedDirectory(directory, extension, allowedPaths, label) {
  const files = await listFilesRecursive(directory);
  let removed = 0;
  for (const filePath of files) {
    if (!filePath.toLowerCase().endsWith(extension)) continue;
    if (!/^card-\d+\.(?:webp|json)$/i.test(path.basename(filePath))) continue;
    if (allowedPaths.has(filePath)) continue;
    await unlink(filePath);
    removed += 1;
  }
  if (removed) console.log(`[prune] removed ${removed} stale ${label} file(s)`);
}

async function listFilesRecursive(directory) {
  let directoryEntries;
  try {
    directoryEntries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of directoryEntries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFilesRecursive(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }
  return files;
}

function getMetadataImage(metadata) {
  const direct = normalizeUri(metadata?.image);
  if (direct) return direct;
  const files = Array.isArray(metadata?.properties?.files)
    ? metadata.properties.files
    : [];
  return getImageFile(files);
}

function getImageFile(files) {
  const normalizedFiles = normalizeFiles(files);
  const image = normalizedFiles.find((file) => (
    !file.type || file.type.toLowerCase().startsWith("image")
  ));
  return image?.uri || "";
}

function getAnimatedGifSourceUri(asset) {
  const candidates = [];
  addGifCandidate(candidates, asset?.animationUri, "");
  addGifCandidate(candidates, asset?.directMetadata?.animation_url, "");
  addGifCandidate(candidates, asset?.directMetadata?.animation, "");

  const metadataFiles = Array.isArray(asset?.directMetadata?.properties?.files)
    ? asset.directMetadata.properties.files
    : [];
  for (const file of metadataFiles) {
    addGifCandidate(
      candidates,
      file?.uri || file?.url,
      file?.type || file?.mime || file?.mimeType,
    );
  }
  for (const file of asset?.files || []) {
    addGifCandidate(candidates, file?.uri, file?.type);
  }
  addGifCandidate(candidates, asset?.imageUri, "");
  addGifCandidate(candidates, asset?.directMetadata?.image, "");
  return candidates[0] || "";
}

function addGifCandidate(candidates, uriValue, typeValue) {
  const uri = normalizeUri(uriValue);
  const type = cleanText(typeValue).toLowerCase();
  if (!uri) return;
  const isGif = type.includes("gif")
    || /\.gif(?:$|[?#])/i.test(uri)
    || /[?&]ext=gif(?:&|$)/i.test(uri);
  if (isGif && !candidates.includes(uri)) candidates.push(uri);
}

function normalizeFiles(files) {
  if (!Array.isArray(files)) return [];
  return files
    .map((file) => ({
      type: cleanText(file?.type || file?.mime || file?.mimeType),
      uri: normalizeUri(file?.uri || file?.url),
    }))
    .filter((file) => file.type || file.uri);
}

function normalizeAttributes(attributes) {
  if (!Array.isArray(attributes)) return [];
  return attributes
    .map((attribute) => ({
      trait_type: cleanText(attribute?.trait_type || attribute?.traitType),
      value: cleanText(attribute?.value),
    }))
    .filter((attribute) => attribute.trait_type && attribute.value);
}

function normalizeUri(value) {
  const uri = cleanText(value);
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice("ipfs://".length).replace(/^ipfs\//, "")}`;
  }
  if (uri.startsWith("ar://")) {
    return `https://arweave.net/${uri.slice("ar://".length)}`;
  }
  return uri;
}

function cleanText(value) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value == null) return "";
  try {
    return JSON.stringify(value);
  } catch {
    return String(value).trim();
  }
}

function normalizeComparableText(value) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

async function fetchJsonWithRetry(url, label) {
  return retry(async () => {
    const response = await fetchWithTimeout(normalizeUri(url), {
      headers: { accept: "application/json,*/*;q=0.8" },
    });
    if (!response.ok) {
      throw new Error(`metadata fetch failed ${response.status} ${url}`);
    }
    const text = (await response.text()).replace(/^\uFEFF/, "");
    const payload = JSON.parse(text);
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error(`metadata response was not an object ${url}`);
    }
    return payload;
  }, RETRIES, label);
}

async function loadJsonFile(filePath) {
  try {
    const payload = JSON.parse(await readFile(filePath, "utf8"));
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function mapConcurrent(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) return;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(Math.max(1, concurrency), Math.max(1, items.length)) },
      () => worker(),
    ),
  );
  return results;
}

async function retry(task, tries, label) {
  let lastError;
  for (let attempt = 1; attempt <= Math.max(1, tries); attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < tries) await wait(500 * attempt);
    }
  }
  throw new Error(
    `${label} failed after ${tries} attempts: ${lastError?.message || lastError}`,
  );
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadSharp() {
  const candidates = [
    process.env.COMMUNITY_SHARP_MODULE,
    "sharp",
    "/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp",
  ].filter(Boolean);

  let lastError;
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    "Unable to load sharp. Install it or set COMMUNITY_SHARP_MODULE. "
    + `${lastError?.message || ""}`,
  );
}

function loadPlaywright() {
  const candidates = [
    process.env.COMMUNITY_PLAYWRIGHT_MODULE,
    "playwright",
    "/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
  ].filter(Boolean);

  let lastError;
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(
    "Unable to load Playwright for Tensor's browser-origin fallback. "
    + `${lastError?.message || ""}`,
  );
}
