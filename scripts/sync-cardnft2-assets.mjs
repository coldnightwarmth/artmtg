import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require("/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");
const execFileAsync = promisify(execFile);

const ROOT = process.cwd();
const COLLECTION_URL = process.env.CARDNFT2_COLLECTION_URL || "https://cardnft2.taile73682.ts.net/collection";
const PINATA_GATEWAY = process.env.CARDNFT2_PINATA_GATEWAY || "https://silver-real-rhinoceros-781.mypinata.cloud/ipfs";
const METADATA_BASE_URL = process.env.CARDNFT2_METADATA_BASE_URL
  || "https://cdn.lil.org/nft/card_nft_2/json";
const CANONICAL_CARD_BASE_URL = process.env.CARDNFT2_CARD_BASE_URL
  || "https://cdn.lil.org/nft/card_nft_2/fronts";
const CANONICAL_CARD_COUNT = Number(process.env.CARDNFT2_CARD_COUNT || 11133);
const SOURCE_PATH = path.join(ROOT, "cardnft2-source.json");
const DATA_PATH = path.join(ROOT, "cardnft2-data.js");
const TRAITS_PATH = path.join(ROOT, "cardnft2-traits.js");
const ASSET_DIR = path.join(ROOT, "assets", "cardnft2", "cards");

const MAX_WIDTH = Number(process.env.CARDNFT2_MAX_WIDTH || 700);
const WEBP_QUALITY = Number(process.env.CARDNFT2_WEBP_QUALITY || 75);
const WORKERS = Number(process.env.CARDNFT2_WORKERS || 18);
const TRAIT_ENRICH_WORKERS = Number(process.env.CARDNFT2_TRAIT_ENRICH_WORKERS || 12);
const RETRIES = Number(process.env.CARDNFT2_RETRIES || 4);
const LIMIT = Number(process.env.CARDNFT2_LIMIT || 0);
const USE_RESIZE_CDN = process.env.CARDNFT2_USE_RESIZE_CDN !== "0";
const REQUEST_TIMEOUT_MS = Number(process.env.CARDNFT2_REQUEST_TIMEOUT_MS || 15000);
const USE_CURL = process.env.CARDNFT2_USE_CURL !== "0";
const EXTRA_IMAGE_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs",
  "https://ipfs.io/ipfs",
  "https://dweb.link/ipfs",
  "https://w3s.link/ipfs",
];
const EXCLUDED_EMPTY_IMAGE_NUMBERS = new Set(
  String(process.env.CARDNFT2_EXCLUDE_EMPTY_IMAGE_NUMBERS || "10022")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter(Number.isInteger),
);
const INTERNAL_TRAIT_CATEGORIES = new Set(["type", "redeemed"]);

await mkdir(ASSET_DIR, { recursive: true });

const liveAssets = await loadOrFetchCollection();
const entries = await buildEntries(liveAssets);
await writeModules(entries);
await convertAssets(entries);
await writeModules(entries);
await writeSourceSummary(liveAssets, entries);

console.log(`Done: ${entries.length} Card NFT 2 card entries synced.`);

async function loadOrFetchCollection() {
  try {
    const existing = JSON.parse(await readFile(SOURCE_PATH, "utf8"));
    if (Array.isArray(existing.liveAssets) && existing.liveAssets.length > 1000) {
      console.log(`Using cached Card NFT 2 collection snapshot with ${existing.liveAssets.length} assets.`);
      return existing.liveAssets;
    }
  } catch {
    // Fetch below.
  }

  const response = await fetch(COLLECTION_URL, {
    headers: { accept: "application/json,*/*;q=0.8" },
  });
  if (!response.ok) throw new Error(`Card NFT 2 collection fetch failed: ${response.status}`);
  const liveAssets = await response.json();
  if (!Array.isArray(liveAssets)) throw new Error("Card NFT 2 collection response was not an array");
  await writeFile(SOURCE_PATH, `${JSON.stringify({
    fetchedAt: new Date().toISOString(),
    source: COLLECTION_URL,
    liveAssets,
  }, null, 2)}\n`);
  return liveAssets;
}

async function buildEntries(liveAssets) {
  const liveCards = new Map();
  const receiptCards = new Map();
  const rangeCid = new Map();

  for (const asset of liveAssets) {
    const meta = asset?.content?.metadata || {};
    const name = String(meta.name || "");
    const number = cardNumberFromName(name);
    if (!Number.isInteger(number)) continue;

    const traits = getTraitMap(meta.attributes);
    const type = normalizeTrait(traits.get("type"));
    const redeemed = normalizeTrait(traits.get("redeemed")) === "true";
    const image = getImage(asset);

    if (type === "card") {
      liveCards.set(number, {
        mint: String(asset?.id || "").trim(),
        imageUri: image,
        status: redeemed ? "redeemed" : "pulled",
        traitEntries: getVisibleTraitEntries(meta.attributes),
      });
      const cid = cidFromImageUrl(image);
      if (cid) rangeCid.set(rangeStart(number), cid);
    } else if (type === "card receipt") {
      receiptCards.set(number, {
        mint: String(asset?.id || "").trim(),
        status: "redeemed",
        traitEntries: getVisibleTraitEntries(meta.attributes),
      });
    }
  }

  await enrichRedeemedReceiptTraits(receiptCards);

  const entries = [];
  for (let number = 1; number <= CANONICAL_CARD_COUNT; number += 1) {
    if (EXCLUDED_EMPTY_IMAGE_NUMBERS.has(number)) continue;
    const live = liveCards.get(number);
    const receipt = receiptCards.get(number);
    const title = `card ${number}`;
    const sourceImageUri = `${CANONICAL_CARD_BASE_URL}/${number}.webp`;
    const bucket = String(Math.floor((number - 1) / 1000) * 1000).padStart(4, "0");
    const file = `assets/cardnft2/cards/${bucket}/card-${number}.webp`;
    entries.push({
      number,
      collection: "cardnft2",
      title,
      stableId: `cardnft2:card-${number}`,
      mint: live?.mint || receipt?.mint || "",
      sourceImageUri,
      file,
      width: null,
      height: null,
      status: live?.status || receipt?.status || "in pack",
      traitEntries: mergeTraitEntries(live?.traitEntries, receipt?.traitEntries),
    });
  }

  const outputEntries = LIMIT > 0 ? entries.slice(0, LIMIT) : entries;
  await enrichInPackCardTraits(outputEntries);
  return outputEntries;
}

async function enrichInPackCardTraits(entries) {
  const queue = entries.filter((entry) => (
    entry.status === "in pack"
    && Number.isInteger(entry.number)
  ));
  if (!queue.length) return;

  const total = queue.length;
  let enriched = 0;
  let failed = 0;

  async function runWorker() {
    while (queue.length) {
      const entry = queue.shift();
      const existingCount = entry.traitEntries?.length || 0;

      try {
        const fetched = await fetchFutureCardTraitEntries(entry.number);
        if (fetched.length > existingCount) {
          entry.traitEntries = mergeTraitEntries(entry.traitEntries, fetched);
          enriched += 1;
        }
      } catch {
        failed += 1;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(TRAIT_ENRICH_WORKERS, Math.max(1, queue.length)) }, () => runWorker()),
  );

  console.log(`In-pack trait enrichment: ${enriched}/${total} cards updated (${failed} failed).`);
}

async function enrichRedeemedReceiptTraits(receiptCards) {
  const queue = [...receiptCards.entries()];
  if (!queue.length) return;

  let enriched = 0;
  let failed = 0;

  async function runWorker() {
    while (queue.length) {
      const [number, receipt] = queue.shift();
      const existingCount = receipt.traitEntries?.length || 0;

      try {
        const fetched = await fetchReceiptTraitEntries(number);
        if (fetched.length > existingCount) {
          receipt.traitEntries = mergeTraitEntries(receipt.traitEntries, fetched);
          enriched += 1;
        }
      } catch {
        failed += 1;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(TRAIT_ENRICH_WORKERS, Math.max(1, queue.length)) }, () => runWorker()),
  );

  console.log(`Redeemed trait enrichment: ${enriched}/${receiptCards.size} receipts updated (${failed} failed).`);
}

async function fetchReceiptTraitEntries(number) {
  const candidates = [
    `${METADATA_BASE_URL}/rf${number}.json`,
    `${METADATA_BASE_URL}/f${number}.json`,
  ];

  for (const url of candidates) {
    const metadata = await fetchOptionalJson(url);
    const entries = getVisibleTraitEntries(metadata?.attributes);
    if (entries.length) return entries;
  }

  return [];
}

async function fetchFutureCardTraitEntries(number) {
  const metadata = await fetchOptionalJson(`${METADATA_BASE_URL}/f${number}.json`);
  return getVisibleTraitEntries(metadata?.attributes);
}

async function convertAssets(entries) {
  const queue = interleaveEntriesByShard(entries);
  let completed = entries.length - queue.length;
  let failed = 0;

  async function runWorker(workerIndex) {
    while (queue.length) {
      const entry = queue.shift();
      const outputPath = path.join(ROOT, entry.file);
      await mkdir(path.dirname(outputPath), { recursive: true });

      if (await exists(outputPath)) {
        await setExistingImageSize(entry, outputPath);
        completed += 1;
        if (completed % 250 === 0 || completed === entries.length) {
          console.log(`CardNFT2 ${completed}/${entries.length} (${failed} failed)`);
        }
        continue;
      }

      try {
        const converted = await retry(() => convertOne(entry.sourceImageUri), RETRIES, `convert ${entry.title}`);
        await writeFile(outputPath, converted.buffer);
        entry.width = converted.width;
        entry.height = converted.height;
      } catch (error) {
        failed += 1;
        console.warn(`Worker ${workerIndex} failed ${entry.title}: ${error.message}`);
      }

      completed += 1;
      if (completed % 50 === 0 || completed === entries.length) {
        console.log(`CardNFT2 ${completed}/${entries.length} (${failed} failed)`);
      }
    }
  }

  await Promise.all(Array.from(
    { length: Math.min(WORKERS, Math.max(1, entries.length)) },
    (_, index) => runWorker(index + 1),
  ));
}

function interleaveEntriesByShard(entries) {
  const groups = new Map();
  for (const entry of entries) {
    const number = cardNumberFromName(entry.title);
    const key = Number.isInteger(number) ? rangeStart(number) : 0;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  const orderedGroups = [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group);
  const interleaved = [];
  let offset = 0;
  while (interleaved.length < entries.length) {
    for (const group of orderedGroups) {
      if (group[offset]) interleaved.push(group[offset]);
    }
    offset += 1;
  }
  return interleaved;
}

async function convertOne(imageUri) {
  if (USE_RESIZE_CDN) {
    for (const url of imageGatewayUrls(imageUri)) {
      try {
        const input = await fetchImageBuffer(resizeCdnUrl(url));
        assertImageBuffer(input);
        const dimensions = await getImageDimensions(input);
        return {
          buffer: input,
          width: dimensions.width,
          height: dimensions.height,
        };
      } catch {
        // Fall back to the canonical source and local conversion below.
      }
    }
  }

  let input;
  let lastError;
  for (const url of imageGatewayUrls(imageUri)) {
    try {
      input = await fetchImageBuffer(url);
      assertImageBuffer(input);
      break;
    } catch (error) {
      lastError = error;
    }
  }
  if (!input) throw lastError || new Error("image fetch failed");

  try {
    const output = await sharp(input, { animated: false })
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: output.data,
      width: output.info.width,
      height: output.info.height,
    };
  } catch (error) {
    const dimensions = getWebpDimensions(input);
    if (!dimensions) throw error;
    return {
      buffer: input,
      width: dimensions.width,
      height: dimensions.height,
    };
  }
}

function imageGatewayUrls(imageUri) {
  const pathPart = String(imageUri || "").match(/\/ipfs\/(.+)$/)?.[1];
  if (!pathPart) return [imageUri];
  const urls = [imageUri];
  for (const gateway of EXTRA_IMAGE_GATEWAYS) {
    urls.push(`${gateway}/${pathPart}`);
  }
  return [...new Set(urls)];
}

function assertImageBuffer(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length <= 0) {
    throw new Error("image fetch returned an empty file");
  }
}

async function fetchImageBuffer(url) {
  if (USE_CURL) return curlImageBuffer(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) throw new Error(`image fetch failed ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function fetchOptionalJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json,*/*;q=0.8" },
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function curlImageBuffer(url) {
  const marker = Buffer.from("\n__HTTP_STATUS__:");
  const { stdout } = await execFileAsync("curl", [
    "-L",
    "-sS",
    "--max-time",
    String(Math.ceil(REQUEST_TIMEOUT_MS / 1000)),
    "-H",
    "accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "-w",
    "\n__HTTP_STATUS__:%{http_code}",
    url,
  ], {
    encoding: "buffer",
    maxBuffer: 16 * 1024 * 1024,
    timeout: REQUEST_TIMEOUT_MS + 4000,
  });
  const markerIndex = stdout.lastIndexOf(marker);
  if (markerIndex === -1) throw new Error("curl response missing status");
  const statusText = stdout.subarray(markerIndex + marker.length).toString("utf8").trim();
  const status = Number(statusText);
  if (!Number.isFinite(status) || status < 200 || status >= 300) {
    throw new Error(`image fetch failed ${statusText || "unknown"}`);
  }
  return stdout.subarray(0, markerIndex);
}

function resizeCdnUrl(imageUri) {
  return `https://images.weserv.nl/?url=${encodeURIComponent(imageUri)}&w=${MAX_WIDTH}&output=webp&q=${WEBP_QUALITY}`;
}

async function setExistingImageSize(entry, outputPath) {
  try {
    const buffer = await readFile(outputPath);
    const metadata = await getImageDimensions(buffer);
    entry.width = metadata.width || entry.width;
    entry.height = metadata.height || entry.height;
  } catch {
    // Dimensions are advisory only.
  }
}

async function getImageDimensions(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || null,
      height: metadata.height || null,
    };
  } catch (error) {
    const webpDimensions = getWebpDimensions(buffer);
    if (webpDimensions) return webpDimensions;
    throw error;
  }
}

function getWebpDimensions(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 30) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }

  const chunkType = buffer.toString("ascii", 12, 16);
  if (chunkType === "VP8X" && buffer.length >= 30) {
    return {
      width: 1 + buffer.readUIntLE(24, 3),
      height: 1 + buffer.readUIntLE(27, 3),
    };
  }

  if (chunkType === "VP8 " && buffer.length >= 30) {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunkType === "VP8L" && buffer.length >= 25 && buffer[20] === 0x2f) {
    const bits = buffer.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }

  return null;
}

async function writeModules(entries) {
  const publicEntries = entries.map(({ collection, title, stableId, mint, file, width, height, status }) => ({
    collection,
    title,
    stableId,
    mint,
    file,
    width,
    height,
    status,
  }));
  const traitCategories = getTraitCategories(entries);
  const traits = entries.map((entry) => {
    const displayEntries = [
      { category: "Status", value: statusLabel(entry.status) },
      ...entry.traitEntries,
    ];
    return {
      metadata: "",
      entries: displayEntries,
    };
  });

  await writeFile(DATA_PATH, [
    "// Generated by scripts/sync-cardnft2-assets.mjs",
    `export const CARD_NFT_2S = ${JSON.stringify(publicEntries, null, 2)};`,
    "",
  ].join("\n"));

  await writeFile(TRAITS_PATH, [
    "// Generated by scripts/sync-cardnft2-assets.mjs",
    `export const CARD_NFT_2_TRAIT_CATEGORIES = ${JSON.stringify(traitCategories, null, 2)};`,
    `export const CARD_NFT_2_TRAITS = ${JSON.stringify(traits, null, 2)};`,
    "",
  ].join("\n"));
}

function getTraitCategories(entries) {
  const categories = ["Status"];
  const seen = new Set(categories.map((category) => category.toLowerCase()));
  for (const entry of getTraitCategoryOrderEntries(entries)) {
    addTraitCategories(entry.traitEntries, categories, seen);
  }
  return categories;
}

function getTraitCategoryOrderEntries(entries) {
  const revealed = entries.filter((entry) => entry.status !== "in pack");
  const inPack = entries.filter((entry) => entry.status === "in pack");
  return [...revealed, ...inPack];
}

function addTraitCategories(traits, categories, seen) {
  for (const trait of traits || []) {
    const key = trait.category.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    categories.push(trait.category);
  }
}

async function writeSourceSummary(liveAssets, entries) {
  const typeCounts = {};
  const imageRanges = new Map();

  for (const asset of liveAssets) {
    const meta = asset?.content?.metadata || {};
    const traits = getTraitMap(meta.attributes);
    const type = normalizeTrait(traits.get("type")) || "unknown";
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    if (type === "card") {
      const number = cardNumberFromName(meta.name);
      const cid = cidFromImageUrl(getImage(asset));
      if (Number.isInteger(number) && cid) imageRanges.set(rangeStart(number), cid);
    }
  }

  const statuses = entries.reduce((acc, entry) => {
    acc[entry.title.replace(/^card\s+/i, "")] = entry.status;
    return acc;
  }, {});

  await writeFile(SOURCE_PATH, `${JSON.stringify({
    fetchedAt: new Date().toISOString(),
    source: COLLECTION_URL,
    liveAssetCount: liveAssets.length,
    typeCounts,
    cardCount: entries.length,
    excludedEmptyImageNumbers: [...EXCLUDED_EMPTY_IMAGE_NUMBERS].sort((a, b) => a - b),
    imageRanges: [...imageRanges.entries()]
      .sort(([a], [b]) => a - b)
      .map(([start, cid]) => ({ start, end: start + 99, cid })),
    statuses,
  }, null, 2)}\n`);
}

function statusLabel(value) {
  if (value === "redeemed") return "Redeemed";
  if (value === "pulled") return "Pulled";
  return "Still in pack";
}

function getTraitMap(attributes) {
  const traits = new Map();
  for (const attribute of attributes || []) {
    const type = String(attribute?.trait_type || "").trim().toLowerCase();
    if (!type) continue;
    traits.set(type, attribute?.value);
  }
  return traits;
}

function getVisibleTraitEntries(attributes) {
  const entries = [];
  for (const attribute of attributes || []) {
    const category = String(attribute?.trait_type || "").trim();
    const value = String(attribute?.value ?? "").trim();
    if (!category || !value) continue;
    if (INTERNAL_TRAIT_CATEGORIES.has(category.toLowerCase())) continue;
    entries.push({ category, value });
  }
  return entries;
}

function mergeTraitEntries(...groups) {
  const merged = [];
  const seen = new Set();

  for (const group of groups) {
    for (const trait of group || []) {
      const category = String(trait?.category || "").trim();
      const value = String(trait?.value ?? "").trim();
      if (!category || !value) continue;

      const key = `${category.toLowerCase()}\u0000${value.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ category, value });
    }
  }

  return merged;
}

function getImage(asset) {
  const links = asset?.content?.links || {};
  if (links.image) return links.image;
  const files = asset?.content?.files || [];
  const image = files.find((file) => String(file?.mime || file?.type || "").startsWith("image"));
  return image?.uri || "";
}

function cardNumberFromName(value) {
  const matches = String(value || "").match(/\d+/g);
  return matches ? Number(matches[matches.length - 1]) : null;
}

function rangeStart(number) {
  return Math.floor((number - 1) / 100) * 100 + 1;
}

function cidFromImageUrl(url) {
  const match = String(url || "").match(/\/ipfs\/([^/]+)\//);
  return match?.[1] || "";
}

function normalizeTrait(value) {
  return String(value ?? "").trim().toLowerCase();
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
      if (attempt < tries) await wait(500 * attempt);
    }
  }
  throw new Error(`${label} failed after ${tries} attempts: ${lastError?.message || lastError}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
