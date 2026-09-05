#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = path.join(ROOT, "minotecurator", "minote-data.js");
const OPENSEA_GRAPHQL_URL = "https://gql.opensea.io/graphql";
const PAGE_SIZE = 100;
const MAX_ATTEMPTS = 5;

const COLLECTIONS = [
  { slug: "minote", name: "Mi Note" },
  { slug: "mi-note2", name: "Mi Note 2" },
  { slug: "mi-note-3", name: "Mi Note 3" },
];

const COLLECTION_ITEMS_QUERY = `
  query MinoteCuratorItems(
    $after: Cursor
    $collectionSlug: String!
    $limit: Int!
    $sort: CollectionItemsSort!
  ) {
    collectionItems(
      collectionSlug: $collectionSlug
      after: $after
      limit: $limit
      sort: $sort
    ) {
      items {
        id
        tokenId
        name
        imageUrl
        animationUrl
        contractAddress
        createdAt
        chain {
          identifier
        }
        collection {
          slug
          name
        }
      }
      nextPageCursor
    }
  }
`;

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function createRequestUrl(slug, cursor) {
  const url = new URL(OPENSEA_GRAPHQL_URL);
  url.searchParams.set("operationName", "MinoteCuratorItems");
  url.searchParams.set("query", COLLECTION_ITEMS_QUERY);
  url.searchParams.set(
    "variables",
    JSON.stringify({
      after: cursor,
      collectionSlug: slug,
      limit: PAGE_SIZE,
      sort: { by: "CREATED_DATE", direction: "ASC" },
    }),
  );
  url.searchParams.set("app_id", "os2-web");
  return url;
}

async function requestPage(slug, cursor, attempt = 1) {
  const response = await fetch(createRequestUrl(slug, cursor), {
    headers: {
      accept: "application/graphql-response+json, application/json",
      referer: `https://opensea.io/collection/${slug}`,
      "user-agent": "cards.art collection sync",
    },
  });

  if ((response.status === 429 || response.status >= 500) && attempt < MAX_ATTEMPTS) {
    const retryAfter = Number(response.headers.get("retry-after"));
    const delay = Number.isFinite(retryAfter)
      ? retryAfter * 1000
      : Math.min(1_000 * 2 ** (attempt - 1), 12_000);
    await wait(delay);
    return requestPage(slug, cursor, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(`OpenSea returned HTTP ${response.status} for ${slug}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(
      `OpenSea GraphQL error for ${slug}: ${payload.errors
        .map((error) => error.message)
        .join("; ")}`,
    );
  }

  const connection = payload.data?.collectionItems;
  if (!connection || !Array.isArray(connection.items)) {
    throw new Error(`OpenSea returned no collectionItems payload for ${slug}`);
  }
  return connection;
}

function normalizeItem(item, fallbackCollection) {
  const chain = item.chain?.identifier || "ethereum";
  const collection = item.collection?.slug || fallbackCollection.slug;
  const collectionName = item.collection?.name || fallbackCollection.name;
  const contractAddress = item.contractAddress || "";
  const tokenId = String(item.tokenId || "");

  return {
    id: `${chain}:${contractAddress.toLowerCase()}:${tokenId}`,
    name: item.name || `${collectionName} #${tokenId}`,
    imageUrl: item.imageUrl || "",
    collection,
    collectionName,
  };
}

async function fetchCollection(collection) {
  const items = [];
  const seenIds = new Set();
  const seenCursors = new Set();
  let cursor = null;

  do {
    const connection = await requestPage(collection.slug, cursor);
    for (const item of connection.items) {
      const normalized = normalizeItem(item, collection);
      if (!item.tokenId || seenIds.has(normalized.id)) continue;
      seenIds.add(normalized.id);
      items.push(normalized);
    }

    const nextCursor = connection.nextPageCursor || null;
    if (nextCursor && seenCursors.has(nextCursor)) {
      throw new Error(`OpenSea repeated a cursor while syncing ${collection.slug}`);
    }
    if (nextCursor) seenCursors.add(nextCursor);
    cursor = nextCursor;
    process.stdout.write(`\r${collection.name}: ${items.length} items`);
  } while (cursor);

  process.stdout.write("\n");
  return items;
}

async function main() {
  const collectionResults = [];
  const items = [];

  for (const collection of COLLECTIONS) {
    const collectionItems = await fetchCollection(collection);
    items.push(...collectionItems);
    collectionResults.push({ ...collection, count: collectionItems.length });
  }

  const missingImages = items.filter((item) => !item.imageUrl).length;
  const duplicateIds = items.length - new Set(items.map((item) => item.id)).size;
  if (duplicateIds > 0) {
    throw new Error(`Sync produced ${duplicateIds} duplicate item IDs`);
  }

  const generatedAt = new Date().toISOString();
  const header = `// Generated by scripts/sync-minote-curator.mjs on ${generatedAt}.\n`;
  const contents = `${header}export const MINOTE_CURATOR_META = ${JSON.stringify(
    { generatedAt, collections: collectionResults, total: items.length, missingImages },
    null,
    2,
  )};\n\nexport const MINOTE_CURATOR_ITEMS = ${JSON.stringify(items, null, 2)};\n`;

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, contents, "utf8");
  console.log(
    `Wrote ${items.length} items from ${collectionResults.length} collections to ${path.relative(
      ROOT,
      OUTPUT_PATH,
    )}.`,
  );
  if (missingImages) console.warn(`${missingImages} items do not currently have an image URL.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
