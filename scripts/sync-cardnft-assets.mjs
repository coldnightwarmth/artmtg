import { createRequire } from "node:module";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const sharp = require("/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const ROOT = process.cwd();
const PAGE_URL = "https://www.tensor.trade/trade/card_nft";
const GRAPHQL_URL = "https://graphql.tensor.trade/graphql";
const COLLECTION_SLUG = "4d146b80-f705-4e17-92a5-4b03849abac2";
const OUT_DIR = path.join(ROOT, "cardnft");
const ASSET_DIR = path.join(OUT_DIR, "assets", "cards");
const SOURCE_PATH = path.join(OUT_DIR, "cardnft-source.json");
const DATA_PATH = path.join(OUT_DIR, "cardnft-data.js");
const PLAYWRIGHT_EXECUTABLE =
  "/Users/kyl/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-arm64/chrome-headless-shell";

const PAGE_LIMIT = Number(process.env.CARDNFT_PAGE_LIMIT || 250);
const MAX_WIDTH = Number(process.env.CARDNFT_MAX_WIDTH || 700);
const WEBP_QUALITY = Number(process.env.CARDNFT_WEBP_QUALITY || 0.75);
const WORKERS = Number(process.env.CARDNFT_WORKERS || 16);
const LIMIT = Number(process.env.CARDNFT_LIMIT || 0);
const RETRIES = Number(process.env.CARDNFT_RETRIES || 3);

const query = `
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
          imageUri
          metadataUri
          files {
            type
            uri
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

await mkdir(ASSET_DIR, { recursive: true });

let browser = null;

try {
  const manifest = await loadOrFetchManifest();
  const entries = buildEntries(manifest);
  await writeDataModule(entries);
  await convertAssets(entries);
  await writeDataModule(entries);
  console.log(`Done: ${entries.length} card NFT entries synced.`);
} finally {
  if (browser) await browser.close();
}

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
      executablePath: PLAYWRIGHT_EXECUTABLE,
    });
  }
  return browser;
}

async function loadOrFetchManifest() {
  try {
    const existing = JSON.parse(await readFile(SOURCE_PATH, "utf8"));
    if (Array.isArray(existing.mints) && existing.mints.length > 7000) {
      console.log(`Using cached Tensor manifest with ${existing.mints.length} mints.`);
      return existing.mints;
    }
  } catch {
    // Fetch below.
  }

  const browserInstance = await getBrowser();
  const page = await browserInstance.newPage({ viewport: { width: 1200, height: 800 } });
  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);

  const mints = [];
  let cursor = null;
  let pageNumber = 1;

  while (true) {
    const result = await page.evaluate(
      async ({ url, query, slug, cursor, limit }) => {
        const response = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            operationName: "CollectionMintsV2",
            variables: {
              slug,
              sortBy: "OrdinalAsc",
              cursor,
              limit,
            },
            query,
          }),
        });
        return {
          ok: response.ok,
          status: response.status,
          body: await response.json(),
        };
      },
      { url: GRAPHQL_URL, query, slug: COLLECTION_SLUG, cursor, limit: PAGE_LIMIT },
    );

    if (!result.ok || result.body.errors) {
      throw new Error(`Tensor GraphQL failed: ${result.status} ${JSON.stringify(result.body.errors || result.body)}`);
    }

    const pageData = result.body.data.collectionMintsV2;
    for (const record of pageData.mints) {
      mints.push(record.mint);
    }
    console.log(`Fetched page ${pageNumber}: ${mints.length} mints`);
    if (!pageData.page.hasMore) break;
    cursor = pageData.page.endCursor;
    pageNumber += 1;
  }

  await page.close();
  await writeFile(SOURCE_PATH, `${JSON.stringify({ fetchedAt: new Date().toISOString(), mints }, null, 2)}\n`);
  return mints;
}

function buildEntries(mints) {
  const seen = new Set();
  const unique = [];
  for (const mint of mints) {
    if (!mint?.onchainId || seen.has(mint.onchainId)) continue;
    seen.add(mint.onchainId);
    unique.push(mint);
  }

  unique.sort((a, b) => {
    const aNumber = titleNumber(a.name);
    const bNumber = titleNumber(b.name);
    if (aNumber !== null && bNumber !== null) return aNumber - bNumber;
    return String(a.name || "").localeCompare(String(b.name || ""), undefined, { numeric: true });
  });

  const limited = LIMIT > 0 ? unique.slice(0, LIMIT) : unique;
  return limited.map((mint, index) => {
    const title = String(mint.name || `card ${index + 1}`).trim();
    const number = titleNumber(title) ?? index + 1;
    const folder = String(Math.floor(Math.max(0, number) / 1000) * 1000).padStart(4, "0");
    const fileName = `${slugify(title || `card-${number}`)}.webp`;
    const file = `assets/cards/${folder}/${fileName}`;
    return {
      title,
      mint: mint.onchainId,
      imageUri: mint.imageUri || mint.files?.find((file) => file?.uri)?.uri,
      file,
      width: null,
      height: null,
    };
  });
}

async function convertAssets(entries) {
  const queue = entries.slice();
  let completed = entries.length - queue.length;
  let failed = 0;

  async function runWorker(workerIndex) {
    while (queue.length) {
      const entry = queue.shift();
      const outputPath = path.join(OUT_DIR, entry.file);
      await mkdir(path.dirname(outputPath), { recursive: true });

      if (await exists(outputPath)) {
        await setExistingImageSize(entry, outputPath);
        completed += 1;
        if (completed % 100 === 0 || completed === entries.length) {
          console.log(`Progress ${completed}/${entries.length} (${failed} failed)`);
        }
        continue;
      }

      try {
        const converted = await retry(
          () => convertOne(entry.imageUri),
          RETRIES,
          `convert ${entry.title}`,
        );
        await writeFile(outputPath, converted.buffer);
        entry.width = converted.width;
        entry.height = converted.height;
      } catch (error) {
        failed += 1;
        console.warn(`Worker ${workerIndex} failed ${entry.title}: ${error.message}`);
      }

      completed += 1;
      if (completed % 25 === 0 || completed === entries.length) {
        console.log(`Progress ${completed}/${entries.length} (${failed} failed)`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(WORKERS, entries.length) }, (_, index) => runWorker(index + 1)),
  );
}

async function setExistingImageSize(entry, outputPath) {
  try {
    const metadata = await sharp(outputPath).metadata();
    entry.width = metadata.width || entry.width;
    entry.height = metadata.height || entry.height;
  } catch {
    // Existing non-empty output will be used as-is; dimensions are only advisory.
  }
}

async function convertOne(imageUri) {
  if (!imageUri) throw new Error("missing image URL");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  let response;
  try {
    response = await fetch(imageUri, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`image fetch failed ${response.status}`);
  }

  const input = Buffer.from(await response.arrayBuffer());
  const output = await sharp(input, { animated: false })
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: Math.round(WEBP_QUALITY * 100), effort: 4 })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
  };
}

async function writeDataModule(entries) {
  const publicEntries = entries.map(({ title, mint, file, width, height }) => ({
    title,
    mint,
    file,
    width,
    height,
  }));
  const moduleText = [
    "// Generated by scripts/sync-cardnft-assets.mjs",
    `export const CARD_NFTS = ${JSON.stringify(publicEntries, null, 2)};`,
    "",
  ].join("\n");
  await writeFile(DATA_PATH, moduleText);
}

async function exists(filePath) {
  try {
    const fileStat = await stat(filePath);
    return fileStat.isFile() && fileStat.size > 0;
  } catch {
    return false;
  }
}

async function retry(task, tries, label) {
  let lastError;
  for (let attempt = 1; attempt <= Math.max(1, tries); attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt < tries) {
        await wait(500 * attempt);
      }
    }
  }
  throw new Error(`${label} failed after ${tries} attempts: ${lastError?.message || lastError}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function titleNumber(title) {
  const match = String(title || "").match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "card";
}
