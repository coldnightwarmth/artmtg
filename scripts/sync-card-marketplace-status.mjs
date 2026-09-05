import { writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUTPUT_PATH = path.join(ROOT, "marketplace-status.js");
const TENSOR_GRAPHQL_URL = "https://graphql.tensor.trade/graphql";
const PAGE_LIMIT = Number(process.env.TENSOR_LISTING_PAGE_LIMIT || 250);
const RETRIES = Number(process.env.TENSOR_LISTING_RETRIES || 4);

const COLLECTIONS = [
  { id: "cardnft1", module: "cardnft-data.js", exportName: "CARD_NFTS", tensorSlug: "4d146b80-f705-4e17-92a5-4b03849abac2" },
  { id: "cardnft2", module: "cardnft2-data.js", exportName: "CARD_NFT_2S", tensorSlug: "0ae22a03-5109-4179-ad81-6f842f2b06a6" },
  { id: "poncho", module: "poncho-data.js", exportName: "PONCHO_CARDS", tensorSlug: "9aa9b85e-4e43-4900-be61-199e7cce1943" },
  { id: "limited", module: "limited-data.js", exportName: "LIMITED_CARDS" },
  { id: "cloudcastle", module: "cloudcastle-data.js", exportName: "CLOUDCASTLE_CARDS", tensorSlug: "c1e9a55a-90f7-4619-9b59-f797afbac1b7" },
  { id: "badhand", module: "badhand-data.js", exportName: "BADHAND_CARDS", tensorSlug: "842fccf9-8f14-4165-90c9-1c21b99087b9" },
  { id: "badhand2", module: "badhand2-data.js", exportName: "BADHAND2_CARDS", tensorSlug: "3afd0857-0fde-4fe6-8a75-bea756209527" },
  { id: "jpegs", module: "jpegs-data.js", exportName: "JPEGS_CARDS", tensorSlug: "a3c76257-af97-435c-813e-da16844c15ae" },
  {
    id: "nolegs",
    module: "nolegs-data.js",
    exportName: "NOLEGS_CARDS",
    tensorSlugs: [
      "792ebef0-ff71-4f1f-ac3e-03f9c22a53d1",
      "cca8e9f1-630a-4dd4-9364-75d1ee33c1ba",
    ],
  },
  { id: "playcards", module: "playcards-data.js", exportName: "PLAYCARDS_CARDS", tensorSlug: "884d3590-b68b-40b6-8fbf-fb2c311c1edd" },
  { id: "kardmane", module: "kardmane-data.js", exportName: "KARDMANE_CARDS", tensorSlug: "232ea192-8926-475c-b498-0648b63586e5" },
  { id: "cloudcastles", module: "cloudcastles-data.js", exportName: "CLOUDCASTLES_CARDS", tensorSlug: "0eef25ae-2aed-4040-9886-9bad0d985a1a" },
  { id: "sweetcurse", module: "sweetcurse-data.js", exportName: "SWEETCURSE_CARDS", tensorSlug: "4fc402e3-0fc7-45ae-87aa-28d62017b8f5" },
  { id: "winloop", module: "winloop-data.js", exportName: "WINLOOP_CARDS", tensorSlug: "670aec14-c20d-438d-bdcd-3360e6dca49c" },
  { id: "mtgnft", module: "mtgnft-data.js", exportName: "MTGNFT_CARDS", tensorSlug: "e8165ab4-2b5b-4d3d-80c9-a3af6b934428" },
  { id: "igorsquest", module: "igorsquest-data.js", exportName: "IGORSQUEST_CARDS", tensorSlug: "1dc4ee22-d777-4b8b-acea-308dd62a60f0" },
  {
    id: "clear",
    module: "clear-data.js",
    exportName: "CLEAR_CARDS",
    tensorSlug: "2d2bceeb-51ae-4d2a-a57e-cdb5509d6300",
  },
];

const COLLECTION_LISTINGS_QUERY = `
  query CollectionMintsV2(
    $slug: String!
    $sortBy: CollectionMintsSortBy!
    $filters: CollectionMintsFilters
    $cursor: String
    $limit: Int
  ) {
    collectionMintsV2(
      slug: $slug
      sortBy: $sortBy
      filters: $filters
      cursor: $cursor
      limit: $limit
    ) {
      mints {
        mint {
          onchainId
        }
      }
      page {
        endCursor
        hasMore
      }
    }
  }
`;

const MINT_LISTINGS_QUERY = `
  query MintListings($mint: String!) {
    mint(mint: $mint) {
      onchainId
      activeListings {
        tx {
          txKey
        }
      }
    }
  }
`;

const listedCardIds = [];
const listedCardMints = [];
const summaries = {};

for (const collection of COLLECTIONS) {
  const moduleUrl = pathToFileURL(path.join(ROOT, collection.module));
  moduleUrl.searchParams.set("status", String(Date.now()));
  const sourceModule = await import(moduleUrl.href);
  const cards = sourceModule[collection.exportName];
  if (!Array.isArray(cards)) throw new Error(`Invalid card data for ${collection.id}`);

  const cardByMint = new Map();
  cards.forEach((card, index) => {
    const stableId = String(
      card?.stableId || `${collection.id}:${card?.mint || card?.title || index}`,
    ).trim();
    for (const mint of [card?.mint, ...(Array.isArray(card?.mints) ? card.mints : [])]) {
      const normalizedMint = String(mint || "").trim();
      if (normalizedMint) cardByMint.set(normalizedMint, { card, stableId });
    }
  });

  const tensorSlugs = collection.tensorSlugs
    || (collection.tensorSlug ? [collection.tensorSlug] : []);
  const listedMints = tensorSlugs.length
    ? await fetchCollectionSetListedMints(tensorSlugs)
    : await fetchIndividuallyListedMints(cardByMint.keys());
  const matchedIds = new Set();
  const matchedMintById = new Map();
  for (const mint of listedMints) {
    const { stableId = "" } = cardByMint.get(mint) || {};
    if (!stableId) continue;
    matchedIds.add(stableId);
    if (!matchedMintById.has(stableId)) matchedMintById.set(stableId, mint);
  }
  listedCardIds.push(...matchedIds);
  listedCardMints.push(...matchedMintById);
  summaries[collection.id] = {
    cards: cards.length,
    marketplaceListings: listedMints.size,
    listedCards: matchedIds.size,
    unmatchedMarketplaceListings: listedMints.size - matchedIds.size,
  };
  console.log(
    `${collection.id}: ${matchedIds.size}/${cards.length} binder cards listed `
    + `(${listedMints.size} collection listings)`,
  );
}

await writeFile(OUTPUT_PATH, [
  "// Generated by scripts/sync-card-marketplace-status.mjs",
  `export const TENSOR_LISTING_STATUS_UPDATED_AT = ${JSON.stringify(new Date().toISOString())};`,
  `export const TENSOR_LISTING_SUMMARIES = ${JSON.stringify(summaries, null, 2)};`,
  `export const TENSOR_LISTED_CARD_IDS = new Set(${JSON.stringify(listedCardIds, null, 2)});`,
  `export const TENSOR_LISTED_CARD_MINTS = new Map(${JSON.stringify(listedCardMints, null, 2)});`,
  "",
].join("\n"));

console.log(`Done: ${listedCardIds.length} unique binder cards are currently listed on Tensor.`);

async function fetchCollectionSetListedMints(slugs) {
  const listed = new Set();
  for (const slug of slugs) {
    const collectionListings = await fetchCollectionListedMints(slug);
    for (const mint of collectionListings) listed.add(mint);
  }
  return listed;
}

async function fetchCollectionListedMints(slug) {
  const mints = new Set();
  const seenCursors = new Set();
  let cursor = null;

  while (true) {
    const payload = await retry(
      () => tensorGraphql(COLLECTION_LISTINGS_QUERY, {
        slug,
        sortBy: "ListingPriceAsc",
        filters: { onlyListings: true },
        cursor,
        limit: PAGE_LIMIT,
      }),
      RETRIES,
      `Tensor listings for ${slug}`,
    );
    const result = payload?.data?.collectionMintsV2;
    const pageMints = Array.isArray(result?.mints) ? result.mints : null;
    if (!pageMints) throw new Error(`Tensor listings for ${slug} did not return mints`);

    for (const wrapper of pageMints) {
      const mint = String(wrapper?.mint?.onchainId || "").trim();
      if (mint) mints.add(mint);
    }
    if (!result?.page?.hasMore) break;

    const nextCursor = String(result?.page?.endCursor || "").trim();
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error(`Tensor listing pagination stalled for ${slug}`);
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
  }

  return mints;
}

async function fetchIndividuallyListedMints(mints) {
  const listed = new Set();
  await mapConcurrent([...mints], 8, async (mint) => {
    const payload = await retry(
      () => tensorGraphql(MINT_LISTINGS_QUERY, { mint }),
      RETRIES,
      `Tensor mint listings for ${mint}`,
    );
    const activeListings = payload?.data?.mint?.activeListings;
    if (Array.isArray(activeListings) && activeListings.length) listed.add(mint);
  });
  return listed;
}

async function tensorGraphql(query, variables) {
  const response = await fetch(TENSOR_GRAPHQL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors || !payload) {
    throw new Error(
      `Tensor GraphQL failed (${response.status}): `
      + `${JSON.stringify(payload?.errors || payload || {})}`,
    );
  }
  return payload;
}

async function retry(task, tries, label) {
  let lastError;
  for (let attempt = 1; attempt <= Math.max(1, tries); attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < tries) await wait(350 * attempt);
    }
  }
  throw new Error(`${label} failed after ${tries} attempts: ${lastError?.message || lastError}`);
}

async function mapConcurrent(items, concurrency, task) {
  const queue = items.slice();
  await Promise.all(Array.from(
    { length: Math.min(Math.max(1, concurrency), Math.max(1, queue.length)) },
    async () => {
      while (queue.length) await task(queue.shift());
    },
  ));
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
