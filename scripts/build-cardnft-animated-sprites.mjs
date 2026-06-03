import { createRequire } from "node:module";
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CARD_NFT_ANIMATED } from "../cardnft-animated.js";

const require = createRequire(import.meta.url);
const sharp = require("/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CARD_NFT_DIR = ROOT;
const OUT_DIR = path.join(CARD_NFT_DIR, "assets", "animated-sprites");
const MANIFEST_PATH = path.join(CARD_NFT_DIR, "cardnft-animated-sprites.js");

const FRAME_WIDTH = Number(process.env.CARDNFT_SPRITE_WIDTH || 340);
const FRAME_HEIGHT = Number(process.env.CARDNFT_SPRITE_HEIGHT || Math.round(FRAME_WIDTH * 99 / 70));
const TARGET_FPS = Number(process.env.CARDNFT_SPRITE_FPS || 12);
const MAX_FRAMES = Number(process.env.CARDNFT_SPRITE_MAX_FRAMES || 96);
const MAX_ATLAS_DIMENSION = Number(process.env.CARDNFT_SPRITE_MAX_ATLAS || 4096);
const WEBP_QUALITY = Number(process.env.CARDNFT_SPRITE_QUALITY || 76);
const FORCE = process.env.CARDNFT_SPRITE_FORCE === "1";

await mkdir(OUT_DIR, { recursive: true });

const entries = Object.entries(CARD_NFT_ANIMATED);
const manifest = {};
let completed = 0;
let skipped = 0;

for (const [cardFile, animatedFile] of entries) {
  const inputPath = path.join(CARD_NFT_DIR, animatedFile);
  const outputFile = animatedFile.replace(/^assets\/animated\//, "assets/animated-sprites/");
  const outputPath = path.join(CARD_NFT_DIR, outputFile);
  await mkdir(path.dirname(outputPath), { recursive: true });

  const metadata = await sharp(inputPath, { animated: true, limitInputPixels: false }).metadata();
  const sourceFrames = metadata.pages || 1;
  const delays = normalizeDelays(metadata.delay, sourceFrames);
  const totalDuration = delays.reduce((sum, value) => sum + value, 0);
  const outputFrames = Math.max(1, Math.min(
    sourceFrames,
    MAX_FRAMES,
    Math.ceil(totalDuration / (1000 / TARGET_FPS)),
  ));
  const columns = getAtlasColumns(outputFrames);
  const rows = Math.ceil(outputFrames / columns);

  if (!FORCE && await exists(outputPath)) {
    skipped += 1;
  } else {
    await writeAtlas({
      inputPath,
      outputPath,
      sourceFrames,
      delays,
      totalDuration,
      outputFrames,
      columns,
      rows,
    });
  }

  manifest[cardFile] = {
    file: outputFile,
    frames: outputFrames,
    columns,
    rows,
    frameDuration: Math.max(50, Math.round(totalDuration / outputFrames)),
  };

  completed += 1;
  if (completed % 10 === 0 || completed === entries.length) {
    console.log(`Progress ${completed}/${entries.length} (${skipped} skipped)`);
  }
}

await writeManifest(manifest);
console.log(`Done: ${Object.keys(manifest).length} animated sprite atlases ready.`);

async function writeAtlas({
  inputPath,
  outputPath,
  delays,
  totalDuration,
  outputFrames,
  columns,
  rows,
}) {
  const atlasWidth = columns * FRAME_WIDTH;
  const atlasHeight = rows * FRAME_HEIGHT;
  const atlas = Buffer.alloc(atlasWidth * atlasHeight * 4, 0);
  const cumulativeDelays = [];
  let elapsed = 0;
  for (const delay of delays) {
    elapsed += delay;
    cumulativeDelays.push(elapsed);
  }

  for (let frame = 0; frame < outputFrames; frame += 1) {
    const sourceTime = (frame / outputFrames) * totalDuration;
    const sourcePage = Math.max(0, cumulativeDelays.findIndex((value) => value > sourceTime));
    const raw = await sharp(inputPath, {
      page: sourcePage,
      pages: 1,
      limitInputPixels: false,
    })
      .resize({ width: FRAME_WIDTH, height: FRAME_HEIGHT, fit: "fill" })
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
      targetX: column * FRAME_WIDTH,
      targetY: row * FRAME_HEIGHT,
    });
  }

  await sharp(atlas, {
    raw: {
      width: atlasWidth,
      height: atlasHeight,
      channels: 4,
    },
  })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outputPath);
}

function copyFrameIntoAtlas({ atlas, atlasWidth, frameData, frameWidth, frameHeight, targetX, targetY }) {
  const rowBytes = frameWidth * 4;
  for (let y = 0; y < frameHeight; y += 1) {
    const srcStart = y * rowBytes;
    const dstStart = ((targetY + y) * atlasWidth + targetX) * 4;
    frameData.copy(atlas, dstStart, srcStart, srcStart + rowBytes);
  }
}

function getAtlasColumns(frameCount) {
  let columns = Math.ceil(Math.sqrt(frameCount * FRAME_HEIGHT / FRAME_WIDTH));
  columns = Math.max(1, Math.min(columns, Math.floor(MAX_ATLAS_DIMENSION / FRAME_WIDTH)));

  while (columns < frameCount && Math.ceil(frameCount / columns) * FRAME_HEIGHT > MAX_ATLAS_DIMENSION) {
    columns += 1;
  }

  if (columns * FRAME_WIDTH > MAX_ATLAS_DIMENSION || Math.ceil(frameCount / columns) * FRAME_HEIGHT > MAX_ATLAS_DIMENSION) {
    throw new Error(`atlas too large for ${frameCount} frames at ${FRAME_WIDTH}x${FRAME_HEIGHT}`);
  }
  return columns;
}

function normalizeDelays(delays, frames) {
  const values = Array.isArray(delays) && delays.length
    ? delays.slice(0, frames).map((delay) => Math.max(20, Number(delay) || 100))
    : [];

  while (values.length < frames) values.push(100);
  return values;
}

async function writeManifest(manifest) {
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })),
  );
  const moduleText = [
    "// Generated by scripts/build-cardnft-animated-sprites.mjs",
    `export const CARD_NFT_ANIMATED_SPRITES = ${JSON.stringify(sorted, null, 2)};`,
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
