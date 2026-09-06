import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { PONCHO_CARDS } from "../poncho-data.js";
import { PONCHO_TRAITS } from "../poncho-traits.js";

const require = createRequire(import.meta.url);
const sharp = loadSharp();
const root = process.cwd();
const source = JSON.parse(await readFile(path.join(root, "poncho-source.json"), "utf8"));

assert(PONCHO_CARDS.length === 207, `expected 207 cards, received ${PONCHO_CARDS.length}`);
assert(PONCHO_TRAITS.length === PONCHO_CARDS.length, "card and trait record counts differ");
assert(
  source.liveAssetCount === source.expectedLiveAssetCount,
  `expected ${source.expectedLiveAssetCount} Tensor assets, received ${source.liveAssetCount}`,
);
const calculatedLiveDigest = createHash("sha256")
  .update(`${source.liveAssets.map((asset) => asset.onchainId).sort().join("\n")}\n`)
  .digest("hex");
assert(
  source.liveMintIdsSha256 === calculatedLiveDigest,
  "Tensor live-mint digest does not match the source snapshot",
);
assert(
  source.conversion?.format === "webp"
  && source.conversion?.width === 700
  && source.conversion?.height === 980
  && source.conversion?.quality === 75
  && source.conversion?.fit === "contain"
  && source.conversion?.background === "transparent"
  && source.conversion?.trimBackground === "#000000"
  && source.conversion?.trimThreshold === 5,
  "Poncho crop/compression settings do not match the expected card-only WebP build",
);
assert(source.assetRevision === "poncho-contain-2", "Poncho card asset revision is stale");

const expectedStatuses = new Map([
  ["pulled", source.liveTypeCounts.card || 0],
  ["redeemed", source.liveTypeCounts["card receipt"] || 0],
  [
    "in pack",
    PONCHO_CARDS.length
      - (source.liveTypeCounts.card || 0)
      - (source.liveTypeCounts["card receipt"] || 0),
  ],
]);
const actualStatuses = countBy(PONCHO_CARDS, (card) => card.status);
for (const [status, count] of expectedStatuses) {
  assert(actualStatuses.get(status) === count, `expected ${count} ${status} cards`);
}

const stableIds = new Set();
const mints = new Set();
for (let index = 0; index < PONCHO_CARDS.length; index += 1) {
  const card = PONCHO_CARDS[index];
  assert(card.number === index + 1, `card order mismatch at index ${index}`);
  assert(card.collection === "poncho", `card ${card.number} has the wrong collection`);
  assert(card.stableId === `poncho:card-${card.number}`, `card ${card.number} has an unstable ID`);
  assert(card.file.endsWith("?v=poncho-contain-2"), `card ${card.number} has a stale asset URL`);
  assert(!stableIds.has(card.stableId), `duplicate stable ID ${card.stableId}`);
  stableIds.add(card.stableId);
  if (card.status === "in pack") {
    assert(!card.mint, `in-pack card ${card.number} unexpectedly has a mint`);
  } else {
    assert(card.mint, `${card.status} card ${card.number} is missing its current mint`);
    assert(!mints.has(card.mint), `duplicate mint ${card.mint}`);
    mints.add(card.mint);
  }

  const cardFilePath = path.join(root, card.file.split(/[?#]/, 1)[0]);
  await Promise.all([
    access(cardFilePath),
    access(path.join(root, PONCHO_TRAITS[index].metadata)),
  ]);
  const dimensions = await sharp(cardFilePath).metadata();
  assert(
    dimensions.width === 700 && dimensions.height === 980 && dimensions.format === "webp",
    `card ${card.number} has invalid image output`,
  );
  const { data: rgba, info } = await sharp(cardFilePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const visibleBounds = findVisibleBounds(rgba, info.width, info.height, info.channels, 8);
  assert(
    (
      visibleBounds.left <= 5
      && visibleBounds.right <= 5
    ) || (
      visibleBounds.top <= 5
      && visibleBounds.bottom <= 5
    ),
    `card ${card.number} is not tightly contained in its 5:7 frame`,
  );
}

const liveCardMints = new Set(source.liveAssets
  .filter((asset) => ["card", "card receipt"].includes(asset.resolvedType))
  .map((asset) => asset.onchainId));
const livePackMints = new Set(source.liveAssets
  .filter((asset) => ["1 card pack", "pack receipt"].includes(asset.resolvedType))
  .map((asset) => asset.onchainId));
assert(mints.size === liveCardMints.size, "generated mint count does not match Tensor card assets");
assert([...mints].every((mint) => liveCardMints.has(mint)), "generated data includes a non-card mint");
assert([...liveCardMints].every((mint) => mints.has(mint)), "generated data omits a live card mint");
assert([...mints].every((mint) => !livePackMints.has(mint)), "a pack mint was mapped to a card");

const card117Additives = PONCHO_TRAITS[116].entries
  .filter((entry) => entry.category === "card additives")
  .map((entry) => entry.value);
assert(card117Additives.length > 1, "card 117 did not preserve repeated additives");
assert(card117Additives.includes("egg emo"), "card 117 is missing its non-first egg emo additive");

const backPath = path.join(root, "assets/poncho/backs/poncho-pack.webp");
const back = await sharp(backPath).metadata();
assert(
  back.width === 1024 && back.height === 1419 && back.format === "webp",
  "invalid Poncho back",
);
assert(
  source.sharedBack?.source === "english pokemon card back",
  "Poncho back source is stale",
);

const page = await readFile(path.join(root, "poncho/index.html"), "utf8");
assert(page.includes('data-collection-id="poncho"'), "Poncho page has the wrong collection ID");
assert(page.includes("<title>cards.art</title>"), "Poncho page has the wrong tab title");
assert(
  page.includes('type="image/png" href="../cardnft.png"')
    && page.includes('rel="apple-touch-icon" href="../cardnft.png"'),
  "Poncho page has the wrong favicon URL",
);
assert(page.includes("../app.js?v=cardnft-380"), "Poncho page has a stale app cache key");
assert(page.includes("../styles.css?v=cardnft-155"), "Poncho page has a stale style cache key");
assert(page.includes("../wallet-auth.js?v=wallet-auth-5"), "Poncho page has a stale wallet auth cache key");
assert(page.includes('id="binderOrderEditButton"'), "Poncho page is missing the binder order editor");
assert(page.includes('id="binderTradeModeButton"'), "Poncho page is missing the trade marking control");
assert(
  page.includes("../vendor/three.module.min.js?v=three-r165-min-1"),
  "Poncho page is not using the optimized Three.js runtime",
);
assert(
  page.includes("../poncho-data.js?v=poncho-4"),
  "Poncho page is missing its data preload",
);
console.log(
  `Verified ${PONCHO_CARDS.length} Poncho cards: `
  + `${actualStatuses.get("pulled")} pulled, ${actualStatuses.get("redeemed")} redeemed, `
  + `${actualStatuses.get("in pack")} in pack.`,
);

function countBy(items, keyForItem) {
  const counts = new Map();
  for (const item of items) {
    const key = keyForItem(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function findVisibleBounds(data, width, height, channels, threshold) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] <= threshold) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  return {
    left: minX,
    right: width - 1 - maxX,
    top: minY,
    bottom: height - 1 - maxY,
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadSharp() {
  const candidates = [
    process.env.PONCHO_SHARP_MODULE,
    "sharp",
    "/Users/kyl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      return require(candidate);
    } catch {
      // Try the next workspace/runtime location.
    }
  }
  throw new Error("Unable to load sharp; install it or set PONCHO_SHARP_MODULE.");
}
