import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const sharp = loadSharp();

const ROOT = process.cwd();
const TENSOR_GRAPHQL_URL = process.env.PONCHO_TENSOR_GRAPHQL_URL
  || "https://graphql.tensor.trade/graphql";
const TENSOR_COLLECTION_SLUG = process.env.PONCHO_TENSOR_COLLECTION_SLUG
  || "9aa9b85e-4e43-4900-be61-199e7cce1943";
const TENSOR_DISPLAY_SLUG = "poncho_drifella";
const TENSOR_PAGE_URL = "https://www.tensor.trade/trade/poncho_drifella";
const COLLECTION_ADDRESS = "JCTP3kK3xGtWs5mDHxJBuRro38HftaiCDdKsfkXuK2gH";
const CANONICAL_METADATA_BASE_URL = process.env.PONCHO_METADATA_BASE_URL
  || "https://cdn.lil.org/nft/poncho_drifella/json/figures";

const SOURCE_PATH = path.join(ROOT, "poncho-source.json");
const DATA_PATH = path.join(ROOT, "poncho-data.js");
const TRAITS_PATH = path.join(ROOT, "poncho-traits.js");
const ASSET_ROOT = path.join(ROOT, "assets", "poncho");
const CARD_DIR = path.join(ASSET_ROOT, "cards");
const METADATA_DIR = path.join(ASSET_ROOT, "metadata");
const BACK_DIR = path.join(ASSET_ROOT, "backs");
const BACK_FILE = "assets/poncho/backs/poncho-pack.webp";
const BACK_PATH = path.join(ROOT, BACK_FILE);
const ASSET_REVISION = process.env.PONCHO_ASSET_REVISION || "poncho-contain-2";
const BACK_SOURCE = "english pokemon card back";
const BACK_SOURCE_SIGNATURE = "manual:english-pokemon-card-back";
const BACK_WIDTH = 1024;
const BACK_HEIGHT = 1419;

const EXPECTED_LIVE_ASSET_COUNT = Number(process.env.PONCHO_EXPECTED_LIVE_COUNT || 194);
const CANONICAL_FIGURE_COUNT = Number(process.env.PONCHO_FIGURE_COUNT || 207);
const TENSOR_PAGE_LIMIT = Number(process.env.PONCHO_TENSOR_PAGE_LIMIT || 250);
const MAX_WIDTH = Number(process.env.PONCHO_MAX_WIDTH || 700);
const MAX_HEIGHT = Number(process.env.PONCHO_MAX_HEIGHT || 980);
const WEBP_QUALITY = Number(process.env.PONCHO_WEBP_QUALITY || 75);
const CARD_TRIM_BACKGROUND = process.env.PONCHO_TRIM_BACKGROUND || "#000000";
const CARD_TRIM_THRESHOLD = Number(process.env.PONCHO_TRIM_THRESHOLD || 5);
const BACK_COLOR = process.env.PONCHO_BACK_COLOR || "#242424";
const METADATA_WORKERS = Number(process.env.PONCHO_METADATA_WORKERS || 20);
const IMAGE_WORKERS = Number(process.env.PONCHO_IMAGE_WORKERS || 12);
const RETRIES = Number(process.env.PONCHO_RETRIES || 4);
const REQUEST_TIMEOUT_MS = Number(process.env.PONCHO_REQUEST_TIMEOUT_MS || 30000);
const FORCE_IMAGES = process.env.PONCHO_FORCE_IMAGES === "1";
const INTERNAL_TRAIT_CATEGORIES = new Set(["type", "redeemed"]);
const LIVE_ASSET_TYPES = new Set(["card", "card receipt", "1 card pack", "pack receipt"]);

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

await main();

async function main() {
  validateConfiguration();
  await Promise.all([
    mkdir(CARD_DIR, { recursive: true }),
    mkdir(METADATA_DIR, { recursive: true }),
    mkdir(BACK_DIR, { recursive: true }),
  ]);

  const previousSnapshot = await loadPreviousSourceSnapshot();
  const liveAssets = await fetchTensorLiveAssets();
  const [resolvedLiveAssets, canonicalFigures] = await Promise.all([
    fetchLiveAssetMetadata(liveAssets),
    fetchCanonicalFigures(),
  ]);

  const liveState = buildLiveFigureState(resolvedLiveAssets);
  const entries = buildCardEntries(canonicalFigures, liveState);

  await convertCardAssets(entries, previousSnapshot);
  const sharedBackSignature = await convertSharedBack(previousSnapshot);
  await writeDataModules(entries);
  await writeSourceSnapshot({
    liveAssets: resolvedLiveAssets,
    canonicalFigures,
    entries,
    liveState,
    sharedBackSignature,
  });

  const statusCounts = countBy(entries, (entry) => entry.status);
  console.log(
    `Done: ${entries.length} Poncho cards synced `
    + `(${statusCounts.pulled || 0} pulled, ${statusCounts.redeemed || 0} redeemed, `
    + `${statusCounts["in pack"] || 0} in pack).`,
  );
}

async function loadPreviousSourceSnapshot() {
  try {
    const snapshot = JSON.parse(await readFile(SOURCE_PATH, "utf8"));
    return snapshot && typeof snapshot === "object" ? snapshot : null;
  } catch {
    return null;
  }
}

function validateConfiguration() {
  const positiveIntegers = {
    PONCHO_EXPECTED_LIVE_COUNT: EXPECTED_LIVE_ASSET_COUNT,
    PONCHO_FIGURE_COUNT: CANONICAL_FIGURE_COUNT,
    PONCHO_TENSOR_PAGE_LIMIT: TENSOR_PAGE_LIMIT,
    PONCHO_MAX_WIDTH: MAX_WIDTH,
    PONCHO_MAX_HEIGHT: MAX_HEIGHT,
    PONCHO_METADATA_WORKERS: METADATA_WORKERS,
    PONCHO_IMAGE_WORKERS: IMAGE_WORKERS,
    PONCHO_RETRIES: RETRIES,
    PONCHO_REQUEST_TIMEOUT_MS: REQUEST_TIMEOUT_MS,
  };
  for (const [name, value] of Object.entries(positiveIntegers)) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new Error(`${name} must be a positive integer; received ${value}`);
    }
  }
  if (!Number.isInteger(WEBP_QUALITY) || WEBP_QUALITY < 1 || WEBP_QUALITY > 100) {
    throw new Error(`PONCHO_WEBP_QUALITY must be an integer from 1 to 100; received ${WEBP_QUALITY}`);
  }
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(ASSET_REVISION)) {
    throw new Error(`PONCHO_ASSET_REVISION contains unsupported characters: ${ASSET_REVISION}`);
  }
  if (!Number.isInteger(CARD_TRIM_THRESHOLD) || CARD_TRIM_THRESHOLD < 0 || CARD_TRIM_THRESHOLD > 255) {
    throw new Error(
      `PONCHO_TRIM_THRESHOLD must be an integer from 0 to 255; received ${CARD_TRIM_THRESHOLD}`,
    );
  }
  for (const [name, value] of [
    ["PONCHO_TRIM_BACKGROUND", CARD_TRIM_BACKGROUND],
    ["PONCHO_BACK_COLOR", BACK_COLOR],
  ]) {
    if (!/^#[0-9a-f]{6}$/i.test(value)) {
      throw new Error(`${name} must be a six-digit hex color; received ${value}`);
    }
  }
}

async function fetchTensorLiveAssets() {
  const assets = [];
  const seenCursors = new Set();
  let cursor = null;
  let pageNumber = 1;

  while (true) {
    const payload = await retry(
      () => tensorGraphql(COLLECTION_MINTS_QUERY, {
        slug: TENSOR_COLLECTION_SLUG,
        sortBy: "OrdinalAsc",
        cursor,
        limit: TENSOR_PAGE_LIMIT,
      }),
      RETRIES,
      `Tensor collection page ${pageNumber}`,
    );
    const result = payload?.data?.collectionMintsV2;
    const pageMints = Array.isArray(result?.mints) ? result.mints : null;
    if (!pageMints) {
      throw new Error(`Tensor collection page ${pageNumber} did not contain a mints array`);
    }

    for (const wrapper of pageMints) {
      const mint = wrapper?.mint;
      const onchainId = cleanText(mint?.onchainId);
      if (!onchainId) {
        throw new Error(`Tensor collection page ${pageNumber} contained a mint without an onchainId`);
      }
      assets.push({
        onchainId,
        owner: cleanText(mint?.owner),
        name: cleanText(mint?.name),
        imageUri: cleanText(mint?.imageUri),
        metadataUri: normalizeUri(cleanText(mint?.metadataUri)),
        files: normalizeFiles(mint?.files),
        attributes: normalizeAttributes(mint?.attributes),
        tokenProgram: cleanText(mint?.tokenProgram),
        tokenStandard: cleanText(mint?.tokenStandard),
      });
    }

    console.log(`Tensor page ${pageNumber}: ${assets.length} live assets`);
    if (!result?.page?.hasMore) break;

    const nextCursor = cleanText(result?.page?.endCursor);
    if (!nextCursor || seenCursors.has(nextCursor)) {
      throw new Error(`Tensor collection pagination stalled on page ${pageNumber}`);
    }
    seenCursors.add(nextCursor);
    cursor = nextCursor;
    pageNumber += 1;
  }

  const uniqueIds = new Set(assets.map((asset) => asset.onchainId));
  if (uniqueIds.size !== assets.length) {
    throw new Error(`Tensor returned ${assets.length - uniqueIds.size} duplicate live mint IDs`);
  }
  if (assets.length !== EXPECTED_LIVE_ASSET_COUNT) {
    throw new Error(
      `Expected ${EXPECTED_LIVE_ASSET_COUNT} live Poncho assets from Tensor, received ${assets.length}. `
      + "Review the collection before changing PONCHO_EXPECTED_LIVE_COUNT.",
    );
  }

  return assets;
}

async function tensorGraphql(query, variables) {
  const response = await fetchWithTimeout(TENSOR_GRAPHQL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      operationName: "CollectionMintsV2",
      variables,
      query,
    }),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.errors) {
    throw new Error(
      `Tensor GraphQL failed (${response.status}): ${JSON.stringify(payload?.errors || payload || {})}`,
    );
  }
  return payload;
}

async function fetchLiveAssetMetadata(assets) {
  return mapConcurrent(assets, METADATA_WORKERS, async (asset, index) => {
    if (!asset.metadataUri) {
      throw new Error(`Live Poncho asset ${asset.onchainId} is missing metadataUri`);
    }
    const directMetadata = await fetchJsonWithRetry(
      asset.metadataUri,
      `live metadata ${asset.onchainId}`,
    );
    if ((index + 1) % 50 === 0 || index + 1 === assets.length) {
      console.log(`Live metadata ${index + 1}/${assets.length}`);
    }
    return {
      ...asset,
      directMetadata,
      resolvedType: getMetadataType(directMetadata),
    };
  });
}

async function fetchCanonicalFigures() {
  const numbers = Array.from({ length: CANONICAL_FIGURE_COUNT }, (_, index) => index + 1);
  return mapConcurrent(numbers, METADATA_WORKERS, async (number, index) => {
    const metadataUri = `${CANONICAL_METADATA_BASE_URL}/${number}.json`;
    const metadata = await fetchJsonWithRetry(metadataUri, `canonical figure ${number}`);
    const metadataNumber = cardNumberFromMetadata(metadata);
    if (Number.isInteger(metadataNumber) && metadataNumber !== number) {
      throw new Error(
        `Canonical figure ${number} metadata identifies itself as figure ${metadataNumber}`,
      );
    }

    const metadataFile = metadataFileForNumber(number);
    const metadataPath = path.join(ROOT, metadataFile);
    await mkdir(path.dirname(metadataPath), { recursive: true });
    await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

    const imageUri = getMetadataImage(metadata);
    if (!imageUri) {
      throw new Error(`Canonical figure ${number} metadata is missing an image`);
    }
    if ((index + 1) % 50 === 0 || index + 1 === numbers.length) {
      console.log(`Canonical metadata ${index + 1}/${numbers.length}`);
    }

    return {
      number,
      metadataUri,
      metadataFile,
      metadata,
      imageUri,
    };
  });
}

function buildLiveFigureState(liveAssets) {
  const liveCards = new Map();
  const receiptCards = new Map();
  const unmappedLiveAssets = [];

  for (const asset of liveAssets) {
    const type = normalizeTrait(asset.resolvedType);
    if (!LIVE_ASSET_TYPES.has(type)) {
      throw new Error(
        `Live Poncho asset ${asset.onchainId} has unknown or missing type "${asset.resolvedType}"`,
      );
    }
    if (type !== "card" && type !== "card receipt") {
      unmappedLiveAssets.push(asset.onchainId);
      continue;
    }

    const number = cardNumberFromMetadata(asset.directMetadata, asset.name);
    if (!Number.isInteger(number) || number < 1 || number > CANONICAL_FIGURE_COUNT) {
      throw new Error(
        `Live ${type} ${asset.onchainId} has invalid canonical figure number ${number}`,
      );
    }

    const target = type === "card" ? liveCards : receiptCards;
    if (target.has(number)) {
      throw new Error(
        `Multiple live ${type} assets map to Poncho figure ${number}: `
        + `${target.get(number).onchainId} and ${asset.onchainId}`,
      );
    }
    target.set(number, asset);
  }

  const overlappingNumbers = [...liveCards.keys()].filter((number) => receiptCards.has(number));
  if (overlappingNumbers.length) {
    throw new Error(
      `Poncho figures are simultaneously live cards and receipts: ${overlappingNumbers.join(", ")}`,
    );
  }

  return {
    liveCards,
    receiptCards,
    unmappedLiveAssets,
  };
}

function buildCardEntries(canonicalFigures, liveState) {
  return canonicalFigures.map((figure) => {
    const liveCard = liveState.liveCards.get(figure.number);
    const receiptCard = liveState.receiptCards.get(figure.number);
    const currentAsset = liveCard || receiptCard || null;
    const status = liveCard ? "pulled" : receiptCard ? "redeemed" : "in pack";

    return {
      number: figure.number,
      collection: "poncho",
      title: cleanText(figure.metadata?.name) || `Poncho Drifella #${figure.number}`,
      stableId: `poncho:card-${figure.number}`,
      mint: currentAsset?.onchainId || "",
      file: cardFileForNumber(figure.number),
      metadataFile: figure.metadataFile,
      sourceMetadataUri: figure.metadataUri,
      sourceImageUri: figure.imageUri,
      width: null,
      height: null,
      status,
      traitEntries: getVisibleTraitEntries(figure.metadata?.attributes),
    };
  });
}

async function convertCardAssets(entries, previousSnapshot) {
  const previousFigures = new Map(
    (previousSnapshot?.canonicalFigures || []).map((figure) => [figure.number, figure]),
  );
  const reusableConversion = hasCurrentConversionSettings(previousSnapshot?.conversion);

  await mapConcurrent(entries, IMAGE_WORKERS, async (entry, index) => {
    const outputPath = path.join(ROOT, entry.file);
    await mkdir(path.dirname(outputPath), { recursive: true });

    entry.sourceImageSignature = await fetchRemoteImageSignature(entry.sourceImageUri);
    const previousFigure = previousFigures.get(entry.number);
    const sourceIsUnchanged = Boolean(entry.sourceImageSignature)
      && entry.sourceImageSignature === previousFigure?.sourceImageSignature;
    if (
      !FORCE_IMAGES
      && reusableConversion
      && sourceIsUnchanged
      && await setCurrentImageDimensions(entry, outputPath)
    ) {
      if ((index + 1) % 25 === 0 || index + 1 === entries.length) {
        console.log(`Card images ${index + 1}/${entries.length}`);
      }
      return;
    }

    const converted = await retry(
      () => convertRemoteCardImage(entry.sourceImageUri),
      RETRIES,
      `card image ${entry.number}`,
    );
    await writeFile(outputPath, converted.buffer);
    entry.width = converted.width;
    entry.height = converted.height;

    if ((index + 1) % 25 === 0 || index + 1 === entries.length) {
      console.log(`Card images ${index + 1}/${entries.length}`);
    }
  });
}

async function convertSharedBack(previousSnapshot) {
  if (!FORCE_IMAGES) {
    const metadata = await readImageMetadata(BACK_PATH);
    if (
      metadata?.width === BACK_WIDTH
      && metadata?.height === BACK_HEIGHT
      && metadata?.format === "webp"
    ) {
      console.log(`Shared back already current: ${BACK_FILE}`);
      return BACK_SOURCE_SIGNATURE;
    }
  }

  const sourceSignature = `solid:${BACK_COLOR.toLowerCase()}`;
  const sourceIsUnchanged = Boolean(sourceSignature)
    && sourceSignature === previousSnapshot?.sharedBack?.sourceSignature;
  if (
    !FORCE_IMAGES
    && hasCurrentConversionSettings(previousSnapshot?.conversion)
    && sourceIsUnchanged
    && await isCurrentConvertedImage(BACK_PATH)
  ) {
    console.log(`Shared back already current: ${BACK_FILE}`);
    return sourceSignature;
  }

  const converted = await createSolidBackImage();
  await mkdir(path.dirname(BACK_PATH), { recursive: true });
  await writeFile(BACK_PATH, converted.buffer);
  console.log(`Shared back written: ${BACK_FILE}`);
  return sourceSignature;
}

async function readImageMetadata(filePath) {
  try {
    return await sharp(filePath).metadata();
  } catch {
    return null;
  }
}

async function fetchRemoteImageSignature(url) {
  try {
    const response = await fetchWithTimeout(normalizeUri(url), { method: "HEAD" });
    if (!response.ok) return "";
    const values = [
      response.headers.get("etag"),
      response.headers.get("last-modified"),
      response.headers.get("content-length"),
    ].map((value) => cleanText(value));
    return values.some(Boolean) ? values.join("|") : "";
  } catch {
    return "";
  }
}

function hasCurrentConversionSettings(conversion) {
  return conversion?.format === "webp"
    && conversion.width === MAX_WIDTH
    && conversion.height === MAX_HEIGHT
    && conversion.quality === WEBP_QUALITY
    && conversion.effort === 4
    && conversion.fit === "contain"
    && conversion.background === "transparent"
    && conversion.trimBackground === CARD_TRIM_BACKGROUND.toLowerCase()
    && conversion.trimThreshold === CARD_TRIM_THRESHOLD;
}

async function convertRemoteCardImage(url) {
  const input = await fetchImageBuffer(url);
  const output = await sharp(input, { animated: false, limitInputPixels: false })
    .trim({
      background: CARD_TRIM_BACKGROUND,
      threshold: CARD_TRIM_THRESHOLD,
    })
    .ensureAlpha()
    .resize({
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({
      quality: WEBP_QUALITY,
      alphaQuality: 100,
      effort: 4,
    })
    .toBuffer({ resolveWithObject: true });

  if (output.info.width !== MAX_WIDTH || output.info.height !== MAX_HEIGHT) {
    throw new Error(
      `Converted image has unexpected dimensions ${output.info.width}x${output.info.height}`,
    );
  }
  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
  };
}

async function createSolidBackImage() {
  const output = await sharp({
    create: {
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      channels: 3,
      background: BACK_COLOR,
    },
  })
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
    })
    .toBuffer({ resolveWithObject: true });

  return {
    buffer: output.data,
    width: output.info.width,
    height: output.info.height,
  };
}

async function fetchImageBuffer(url) {
  const normalizedUrl = normalizeUri(url);
  if (!normalizedUrl) throw new Error("missing image URL");

  const response = await fetchWithTimeout(normalizedUrl, {
    headers: {
      accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`image fetch failed ${response.status} ${normalizedUrl}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!buffer.length) throw new Error(`image fetch returned an empty file ${normalizedUrl}`);
  return buffer;
}

async function setCurrentImageDimensions(entry, outputPath) {
  if (!await isCurrentConvertedImage(outputPath)) return false;
  entry.width = MAX_WIDTH;
  entry.height = MAX_HEIGHT;
  return true;
}

async function isCurrentConvertedImage(filePath) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile() || fileStat.size <= 0) return false;
    const metadata = await sharp(await readFile(filePath)).metadata();
    return metadata.width === MAX_WIDTH
      && metadata.height === MAX_HEIGHT
      && metadata.format === "webp";
  } catch {
    return false;
  }
}

async function writeDataModules(entries) {
  const publicCards = entries.map((entry) => ({
    number: entry.number,
    collection: entry.collection,
    title: entry.title,
    stableId: entry.stableId,
    mint: entry.mint,
    file: `${entry.file}?v=${ASSET_REVISION}`,
    width: entry.width,
    height: entry.height,
    status: entry.status,
  }));
  const traitCategories = getTraitCategories(entries);
  const publicTraits = entries.map((entry) => ({
    metadata: entry.metadataFile,
    entries: [
      {
        category: "Status",
        value: statusLabel(entry.status),
      },
      ...entry.traitEntries,
    ],
  }));

  await Promise.all([
    writeFile(DATA_PATH, [
      "// Generated by scripts/sync-poncho-assets.mjs",
      `export const PONCHO_CARDS = ${JSON.stringify(publicCards, null, 2)};`,
      "",
    ].join("\n")),
    writeFile(TRAITS_PATH, [
      "// Generated by scripts/sync-poncho-assets.mjs",
      `export const PONCHO_TRAIT_CATEGORIES = ${JSON.stringify(traitCategories, null, 2)};`,
      `export const PONCHO_TRAITS = ${JSON.stringify(publicTraits, null, 2)};`,
      "",
    ].join("\n")),
  ]);
}

function getTraitCategories(entries) {
  const categories = ["Status"];
  const seen = new Set(["status"]);
  for (const entry of entries) {
    for (const trait of entry.traitEntries) {
      const key = normalizeTrait(trait.category);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      categories.push(trait.category);
    }
  }
  return categories;
}

async function writeSourceSnapshot({
  liveAssets,
  canonicalFigures,
  entries,
  liveState,
  sharedBackSignature,
}) {
  const liveTypeCounts = countBy(
    liveAssets,
    (asset) => asset.resolvedType || "unknown",
  );
  const statusCounts = countBy(entries, (entry) => entry.status);
  const liveMintIds = liveAssets.map((asset) => asset.onchainId);
  const sortedLiveMintIds = [...liveMintIds].sort();

  const snapshot = {
    fetchedAt: new Date().toISOString(),
    source: TENSOR_GRAPHQL_URL,
    tensorPage: TENSOR_PAGE_URL,
    collectionSlug: TENSOR_COLLECTION_SLUG,
    collectionDisplaySlug: TENSOR_DISPLAY_SLUG,
    collectionAddress: COLLECTION_ADDRESS,
    membershipPolicy: "Tensor live allowlist; card and card receipt assets map to canonical figures",
    assetRevision: ASSET_REVISION,
    liveAssetCount: liveAssets.length,
    expectedLiveAssetCount: EXPECTED_LIVE_ASSET_COUNT,
    liveMintIdsSha256: createHash("sha256")
      .update(`${sortedLiveMintIds.join("\n")}\n`)
      .digest("hex"),
    liveTypeCounts,
    mappedLiveCardCount: liveState.liveCards.size,
    mappedLiveReceiptCount: liveState.receiptCards.size,
    unmappedLiveAssetCount: liveState.unmappedLiveAssets.length,
    unmappedLiveMintIds: liveState.unmappedLiveAssets,
    canonicalFigureCount: canonicalFigures.length,
    statusCounts,
    conversion: {
      format: "webp",
      width: MAX_WIDTH,
      height: MAX_HEIGHT,
      quality: WEBP_QUALITY,
      effort: 4,
      fit: "contain",
      background: "transparent",
      trimBackground: CARD_TRIM_BACKGROUND.toLowerCase(),
      trimThreshold: CARD_TRIM_THRESHOLD,
    },
    sharedBack: {
      source: sharedBackSignature === BACK_SOURCE_SIGNATURE ? BACK_SOURCE : "generated solid color",
      sourceSignature: sharedBackSignature,
      color: sharedBackSignature === BACK_SOURCE_SIGNATURE ? null : BACK_COLOR.toLowerCase(),
      file: BACK_FILE,
      width: sharedBackSignature === BACK_SOURCE_SIGNATURE ? BACK_WIDTH : MAX_WIDTH,
      height: sharedBackSignature === BACK_SOURCE_SIGNATURE ? BACK_HEIGHT : MAX_HEIGHT,
    },
    liveAssets,
    canonicalFigures: canonicalFigures.map((figure) => ({
      number: figure.number,
      metadataUri: figure.metadataUri,
      imageUri: figure.imageUri,
      sourceImageSignature: entries[figure.number - 1]?.sourceImageSignature || "",
      metadataFile: figure.metadataFile,
      cardFile: cardFileForNumber(figure.number),
    })),
    statuses: Object.fromEntries(entries.map((entry) => [entry.number, entry.status])),
  };

  await writeFile(SOURCE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`);
}

function getVisibleTraitEntries(attributes) {
  const entries = [];
  for (const attribute of attributes || []) {
    const category = cleanText(attribute?.trait_type);
    const value = cleanText(attribute?.value);
    if (!category || !value) continue;
    if (INTERNAL_TRAIT_CATEGORIES.has(normalizeTrait(category))) continue;
    entries.push({ category, value });
  }
  return entries;
}

function getMetadataType(metadata) {
  const attribute = (metadata?.attributes || []).find((candidate) => (
    normalizeTrait(candidate?.trait_type) === "type"
  ));
  return cleanText(attribute?.value);
}

function getMetadataImage(metadata) {
  const direct = normalizeUri(cleanText(metadata?.image));
  if (direct) return direct;
  const files = Array.isArray(metadata?.properties?.files)
    ? metadata.properties.files
    : [];
  const imageFile = files.find((file) => (
    cleanText(file?.type || file?.mime || file?.mimeType).toLowerCase().startsWith("image")
  ));
  return normalizeUri(cleanText(imageFile?.uri || imageFile?.url));
}

function cardNumberFromMetadata(metadata, fallbackName = "") {
  const metadataId = Number(metadata?.id);
  if (Number.isInteger(metadataId)) return metadataId;
  return cardNumberFromName(metadata?.name || fallbackName);
}

function cardNumberFromName(value) {
  const matches = cleanText(value).match(/\d+/g);
  return matches?.length ? Number(matches.at(-1)) : null;
}

function cardFileForNumber(number) {
  return `assets/poncho/cards/${bucketForNumber(number)}/card-${number}.webp`;
}

function metadataFileForNumber(number) {
  return `assets/poncho/metadata/${bucketForNumber(number)}/card-${number}.json`;
}

function bucketForNumber(number) {
  return String(Math.floor((number - 1) / 1000) * 1000).padStart(4, "0");
}

function statusLabel(status) {
  if (status === "pulled") return "Pulled";
  if (status === "redeemed") return "Redeemed";
  return "Still in pack";
}

function normalizeFiles(files) {
  if (!Array.isArray(files)) return [];
  return files
    .map((file) => ({
      type: cleanText(file?.type),
      uri: normalizeUri(cleanText(file?.uri)),
    }))
    .filter((file) => file.type || file.uri);
}

function normalizeAttributes(attributes) {
  if (!Array.isArray(attributes)) return [];
  return attributes
    .map((attribute) => ({
      trait_type: cleanText(attribute?.trait_type),
      value: cleanText(attribute?.value),
    }))
    .filter((attribute) => attribute.trait_type);
}

function normalizeUri(value) {
  const uri = cleanText(value);
  if (uri.startsWith("https://assets.mons.link/drops/poncho/")) {
    return uri.replace(
      "https://assets.mons.link/drops/poncho/",
      "https://cdn.lil.org/nft/poncho_drifella/",
    );
  }
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice("ipfs://".length).replace(/^ipfs\//, "")}`;
  }
  if (uri.startsWith("ar://")) {
    return `https://arweave.net/${uri.slice("ar://".length)}`;
  }
  return uri;
}

function normalizeTrait(value) {
  return cleanText(value).toLowerCase().replace(/\s+/g, " ");
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function countBy(items, keyForItem) {
  const counts = {};
  for (const item of items) {
    const key = cleanText(keyForItem(item)) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

async function fetchJsonWithRetry(url, label) {
  return retry(async () => {
    const response = await fetchWithTimeout(normalizeUri(url), {
      headers: {
        accept: "application/json,*/*;q=0.8",
      },
    });
    if (!response.ok) throw new Error(`metadata fetch failed ${response.status} ${url}`);
    const payload = await response.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error(`metadata response was not an object ${url}`);
    }
    return payload;
  }, RETRIES, label);
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
  throw new Error(`${label} failed after ${tries} attempts: ${lastError?.message || lastError}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadSharp() {
  const candidates = [
    process.env.PONCHO_SHARP_MODULE,
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
    "Unable to load sharp. Install sharp or set PONCHO_SHARP_MODULE to its module path. "
    + `${lastError?.message || ""}`,
  );
}
