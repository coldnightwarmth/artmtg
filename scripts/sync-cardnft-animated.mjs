import { createRequire } from "node:module";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CARD_NFTS } from "../cardnft/cardnft-data.js";
import { CARD_NFT_TRAIT_CATEGORIES, CARD_NFT_TRAITS } from "../cardnft/cardnft-traits.js";

const require = createRequire(import.meta.url);
const sharp = require("/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARD_NFT_DIR = path.join(ROOT, "cardnft");
const ANIMATED_DIR = path.join(CARD_NFT_DIR, "assets", "animated");
const MANIFEST_PATH = path.join(CARD_NFT_DIR, "cardnft-animated.js");

const MAX_WIDTH = Number(process.env.CARDNFT_ANIMATED_MAX_WIDTH || 700);
const WEBP_QUALITY = Number(process.env.CARDNFT_ANIMATED_WEBP_QUALITY || 82);
const WORKERS = Number(process.env.CARDNFT_ANIMATED_WORKERS || 4);
const RETRIES = Number(process.env.CARDNFT_ANIMATED_RETRIES || 3);
const FORCE = process.env.CARDNFT_ANIMATED_FORCE === "1";

await mkdir(ANIMATED_DIR, { recursive: true });

const animatedCategoryIndex = CARD_NFT_TRAIT_CATEGORIES.indexOf("animated");
if (animatedCategoryIndex === -1) {
  throw new Error("No animated trait category found.");
}

const entries = await getAnimatedEntries();
const queue = entries.slice();
const synced = [];
let completed = 0;
let skipped = 0;
let failed = 0;

await Promise.all(
  Array.from({ length: Math.min(WORKERS, queue.length) }, (_, index) => runWorker(index + 1)),
);

await writeManifest(synced);
console.log(`Done: ${synced.length}/${entries.length} animated CardNFT assets synced (${skipped} skipped, ${failed} failed).`);

async function getAnimatedEntries() {
  const rows = [];
  for (let index = 0; index < CARD_NFT_TRAITS.length; index += 1) {
    const traitValue = CARD_NFT_TRAITS[index]?.values?.[animatedCategoryIndex];
    if (String(traitValue || "").trim().toLowerCase() !== "yes") continue;

    const card = CARD_NFTS[index];
    if (!card?.file) continue;

    const metadataPath = path.join(CARD_NFT_DIR, CARD_NFT_TRAITS[index].metadata);
    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));
    const candidateUrls = getAnimatedCandidates(metadata);
    if (!candidateUrls.length) {
      console.warn(`No animated URL candidates for ${card.title}`);
      continue;
    }

    rows.push({
      index,
      title: card.title,
      cardFile: card.file,
      animatedFile: card.file.replace(/^assets\/cards\//, "assets/animated/"),
      candidateUrls,
    });
  }
  return rows;
}

async function runWorker(workerIndex) {
  while (queue.length) {
    const entry = queue.shift();
    const outputPath = path.join(CARD_NFT_DIR, entry.animatedFile);
    await mkdir(path.dirname(outputPath), { recursive: true });

    if (!FORCE && await exists(outputPath)) {
      synced.push(entry);
      skipped += 1;
      completed += 1;
      logProgress();
      continue;
    }

    try {
      const gif = await retry(
        () => downloadFirstGif(entry.candidateUrls),
        RETRIES,
        `download ${entry.title}`,
      );
      const converted = await convertAnimatedGif(gif.buffer);
      await writeFile(outputPath, converted);
      synced.push(entry);
    } catch (error) {
      failed += 1;
      console.warn(`Worker ${workerIndex} failed ${entry.title}: ${error.message}`);
    }

    completed += 1;
    logProgress();
  }
}

function logProgress() {
  if (completed % 10 === 0 || completed === entries.length) {
    console.log(`Progress ${completed}/${entries.length} (${failed} failed)`);
  }
}

function getAnimatedCandidates(metadata) {
  const candidates = [];
  addCandidate(candidates, metadata.animation_url);
  addCandidate(candidates, metadata.animation);

  const files = Array.isArray(metadata.properties?.files) ? metadata.properties.files : [];
  for (const file of files) {
    const type = String(file?.type || file?.mime || file?.mimeType || "").toLowerCase();
    const uri = file?.uri || file?.url;
    if (type.includes("gif") || String(uri || "").toLowerCase().includes(".gif")) {
      addCandidate(candidates, uri);
    }
  }

  for (const file of files) addCandidate(candidates, file?.uri || file?.url);
  addCandidate(candidates, metadata.image);

  return [...new Set(candidates.map(normalizeUri).filter(Boolean))];
}

function addCandidate(candidates, value) {
  if (typeof value === "string" && value.trim()) candidates.push(value.trim());
}

function normalizeUri(uri) {
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice("ipfs://".length).replace(/^ipfs\//, "")}`;
  }
  if (uri.startsWith("ar://")) {
    return `https://arweave.net/${uri.slice("ar://".length)}`;
  }
  return uri;
}

async function downloadFirstGif(urls) {
  let lastError;
  for (const url of urls) {
    try {
      const buffer = await downloadUrl(url);
      if (isGif(buffer)) return { url, buffer };
      lastError = new Error(`not a GIF: ${url}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("no GIF candidate could be downloaded");
}

async function downloadUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  let response;
  try {
    response = await fetch(url, {
      headers: {
        accept: "image/gif,image/*,*/*;q=0.8",
      },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`fetch failed ${response.status} ${url}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

function isGif(buffer) {
  return buffer.subarray(0, 3).toString("ascii") === "GIF";
}

async function convertAnimatedGif(input) {
  const output = await sharp(input, { animated: true, limitInputPixels: false })
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4, loop: 0 })
    .toBuffer({ resolveWithObject: true });

  if ((output.info.pages || 1) < 2) {
    throw new Error("converted output was not animated");
  }
  return output.data;
}

async function writeManifest(entries) {
  entries.sort((a, b) => a.index - b.index);
  const map = Object.fromEntries(entries.map((entry) => [entry.cardFile, entry.animatedFile]));
  const moduleText = [
    "// Generated by scripts/sync-cardnft-animated.mjs",
    `export const CARD_NFT_ANIMATED = ${JSON.stringify(map, null, 2)};`,
    "",
  ].join("\n");
  await writeFile(MANIFEST_PATH, moduleText);
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

