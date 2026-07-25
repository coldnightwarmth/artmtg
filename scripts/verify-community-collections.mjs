import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import {
  COMMUNITY_COLLECTIONS,
  getCommunityCollection,
} from "./community-collections.mjs";
import { CARD_NFTS } from "../cardnft-data.js";
import { CARD_NFT_2S } from "../cardnft2-data.js";
import { PONCHO_CARDS } from "../poncho-data.js";

const require = createRequire(import.meta.url);
const sharp = loadSharp();
const root = process.cwd();
const expectedAppVersion = "cardnft-292";
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
const [app, styles] = await Promise.all([
  readFile(path.join(root, "app.js"), "utf8"),
  readFile(path.join(root, "styles.css"), "utf8"),
]);
const allStableIds = new Set();
const allMints = new Set();
let totalCards = 0;
let totalMints = 0;

seedExistingCollectionIdentity("cardnft1", CARD_NFTS);
seedExistingCollectionIdentity("cardnft2", CARD_NFT_2S);
seedExistingCollectionIdentity("poncho", PONCHO_CARDS);
verifySharedAppArchitecture();

for (const collection of collections) {
  const [dataModule, traitsModule, source, page] = await Promise.all([
    import(`../${collection.id}-data.js`),
    import(`../${collection.id}-traits.js`),
    readJson(path.join(root, `${collection.id}-source.json`)),
    readFile(path.join(root, collection.route, "index.html"), "utf8"),
  ]);
  const cards = dataModule[`${collection.modulePrefix}_CARDS`];
  const traitCategories = traitsModule[`${collection.modulePrefix}_TRAIT_CATEGORIES`];
  const traits = traitsModule[`${collection.modulePrefix}_TRAITS`];

  assert(Array.isArray(cards) && cards.length > 0, `${collection.id} has no cards`);
  assert(Array.isArray(traits), `${collection.id} traits are missing`);
  assert(Array.isArray(traitCategories), `${collection.id} trait categories are missing`);
  assert(Array.isArray(source.cards), `${collection.id} source cards are missing`);
  assert(Array.isArray(source.liveAssets), `${collection.id} source live assets are missing`);
  assert(cards.length === traits.length, `${collection.id} card and trait counts differ`);
  assert(cards.length === source.cards.length, `${collection.id} source card records differ`);
  assert(source.cardCount === cards.length, `${collection.id} source card count differs`);
  assert(
    source.liveMintCount === source.liveAssets.length,
    `${collection.id} source live-mint count differs`,
  );
  const excludedAssets = Array.isArray(source.excludedAssets)
    ? source.excludedAssets
    : [];
  const tensorFetchedMintCount = source.liveAssets.length + excludedAssets.length;
  assert(
    source.excludedMintCount === excludedAssets.length,
    `${collection.id} excluded-mint count differs`,
  );
  assert(
    source.tensorFetchedMintCount === tensorFetchedMintCount,
    `${collection.id} Tensor fetched-mint count differs`,
  );
  assert(
    !source.tensorReportedMintCount
      || source.tensorReportedMintCount === tensorFetchedMintCount,
    `${collection.id} Tensor count differs from the downloaded live set`,
  );
  assert(
    source.metadataFetchFailureCount === 0,
    `${collection.id} has ${source.metadataFetchFailureCount} metadata fallbacks`,
  );
  assert(
    source.conversion?.format === "webp"
      && source.conversion?.width === collection.width
      && source.conversion?.height === collection.height
      && source.conversion?.quality === 75
      && source.conversion?.effort === 4
      && source.conversion?.fit === "contain"
      && source.conversion?.background === (
        collection.removeExteriorWhite ? "transparent" : "#111111"
      )
      && Boolean(source.conversion?.removeExteriorWhite)
        === Boolean(collection.removeExteriorWhite)
      && JSON.stringify(source.conversion?.cardExtractions || {})
        === JSON.stringify(collection.cardExtractions || {})
      && (
        !collection.removeExteriorWhite
        || (
          source.conversion?.strongColorChroma === collection.strongColorChroma
          && source.conversion?.strongDarkMaximum === collection.strongDarkMaximum
          && source.conversion?.whiteBackgroundMinimum
            === collection.whiteBackgroundMinimum
          && source.conversion?.whiteBackgroundMaximumChroma
            === collection.whiteBackgroundMaximumChroma
          && source.conversion?.whiteCloseRadius === collection.whiteCloseRadius
          && source.conversion?.trimSafety === collection.trimSafety
        )
      ),
    `${collection.id} conversion settings differ`,
  );
  assert(
    source.assetRevision === collection.revision,
    `${collection.id} asset revision differs`,
  );

  const sourceMints = source.liveAssets.map((asset) => String(asset?.onchainId || ""));
  const sourceMintSet = new Set(sourceMints);
  const excludedMints = excludedAssets.map((asset) => String(asset?.onchainId || ""));
  const excludedMintSet = new Set(excludedMints);
  assert(
    sourceMintSet.size === sourceMints.length && !sourceMints.includes(""),
    `${collection.id} source contains empty or duplicate live mints`,
  );
  if (collection.preserveConfiguredOrder) {
    assertJsonEqual(
      sourceMints,
      [...(collection.sourceMintIds || [])],
      `${collection.id} curated mint order differs`,
    );
  }
  assert(
    excludedMintSet.size === excludedMints.length && !excludedMints.includes(""),
    `${collection.id} source contains empty or duplicate excluded mints`,
  );
  for (const mint of excludedMintSet) {
    assert(!sourceMintSet.has(mint), `${collection.id} includes excluded mint ${mint}`);
  }
  assertJsonEqual(
    [...excludedMintSet].sort(),
    [...(collection.excludedMintIds || [])].sort(),
    `${collection.id} configured exclusions differ`,
  );
  const digest = createHash("sha256")
    .update(`${[...sourceMints].sort().join("\n")}\n`)
    .digest("hex");
  assert(
    digest === source.liveMintIdsSha256,
    `${collection.id} live-mint digest differs`,
  );
  const tensorDigest = createHash("sha256")
    .update(`${[...sourceMints, ...excludedMints].sort().join("\n")}\n`)
    .digest("hex");
  assert(
    tensorDigest === source.tensorLiveMintIdsSha256,
    `${collection.id} Tensor live-mint digest differs`,
  );

  const collectionMints = new Set();
  const expectedCardFiles = [];
  const expectedMetadataFiles = [];
  const expectedAnimatedFiles = [];
  const expectedAnimatedSpriteFiles = [];
  const animatedGroupKeyHashes = [];
  const categoriesFromCards = [];
  const seenCategories = new Set();
  let previousTitleNumber = -Infinity;

  if (Array.isArray(collection.displayTitleOrder)) {
    assertJsonEqual(
      cards.map((card) => card.title),
      collection.displayTitleOrder,
      `${collection.id} default display order differs`,
    );
  }

  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const traitRecord = traits[index];
    const sourceCard = source.cards[index];
    const cardNumber = index + 1;
    const cardFile = stripUrlSuffix(card.file);

    assert(card.number === cardNumber, `${collection.id} card order differs at ${index}`);
    assert(sourceCard.number === cardNumber, `${collection.id} source card order differs at ${index}`);
    assert(
      Number.isInteger(sourceCard.assetNumber) && sourceCard.assetNumber > 0,
      `${collection.id} card ${cardNumber} has an invalid source asset number`,
    );
    assert(card.collection === collection.id, `${collection.id} card ${cardNumber} has wrong collection`);
    assert(card.title === sourceCard.title, `${collection.id} card ${cardNumber} title differs`);
    if (collection.sortByTitleNumber) {
      const titleNumber = getTitleNumber(card.title);
      assert(
        Number.isInteger(titleNumber) && titleNumber > previousTitleNumber,
        `${collection.id} title order is not strictly numeric at card ${cardNumber}`,
      );
      previousTitleNumber = titleNumber;
    }
    assert(card.file.endsWith(`?v=${collection.revision}`), `${collection.id} card ${cardNumber} has stale URL`);
    assert(cardFile === sourceCard.cardFile, `${collection.id} card ${cardNumber} file differs from source`);
    assert(
      card.width === collection.width && card.height === collection.height,
      `${collection.id} card ${cardNumber} declares invalid dimensions`,
    );
    assert(
      /^[0-9a-f]{64}$/.test(sourceCard.groupKeyHash),
      `${collection.id} card ${cardNumber} has an invalid group-key digest`,
    );
    assert(
      card.stableId === `${collection.id}:group-${sourceCard.groupKeyHash.slice(0, 24)}`
        && sourceCard.stableId === card.stableId,
      `${collection.id} card ${cardNumber} has an unstable group identity`,
    );
    assert(!allStableIds.has(card.stableId), `duplicate global stable ID ${card.stableId}`);
    allStableIds.add(card.stableId);

    const mints = Array.isArray(card.mints) && card.mints.length
      ? card.mints
      : [card.mint];
    assert(mints[0] === card.mint, `${collection.id} card ${cardNumber} has inconsistent primary mint`);
    assertJsonEqual(mints, sourceCard.mints, `${collection.id} card ${cardNumber} mint group differs`);
    for (const mint of mints) {
      assert(mint, `${collection.id} card ${cardNumber} has an empty mint`);
      assert(sourceMintSet.has(mint), `${collection.id} card ${cardNumber} includes a non-live mint ${mint}`);
      assert(!collectionMints.has(mint), `${collection.id} repeats mint ${mint}`);
      assert(!allMints.has(mint), `mint ${mint} appears in multiple collections`);
      collectionMints.add(mint);
      allMints.add(mint);
    }

    assert(
      traitRecord?.metadata === sourceCard.metadataFile,
      `${collection.id} card ${cardNumber} metadata path differs from source`,
    );
    assert(
      Array.isArray(traitRecord?.entries),
      `${collection.id} card ${cardNumber} has invalid trait entries`,
    );
    for (const trait of traitRecord.entries) {
      assert(
        traitCategories.includes(trait.category),
        `${collection.id} card ${cardNumber} uses unknown trait category ${trait.category}`,
      );
      const categoryKey = normalizeText(trait.category);
      if (!seenCategories.has(categoryKey)) {
        seenCategories.add(categoryKey);
        categoriesFromCards.push(trait.category);
      }
    }

    const cardPath = path.join(root, cardFile);
    const metadataPath = path.join(root, traitRecord.metadata);
    const [imageMetadata, metadata] = await Promise.all([
      sharp(cardPath).metadata(),
      readJson(metadataPath),
    ]);
    assert(
      imageMetadata.format === "webp"
        && imageMetadata.width === collection.width
        && imageMetadata.height === collection.height,
      `${collection.id} card ${cardNumber} has invalid optimized dimensions`,
    );
    assert(
      (imageMetadata.pages || 1) === 1,
      `${collection.id} card ${cardNumber} static fallback is unexpectedly animated`,
    );
    if (collection.removeExteriorWhite) {
      const { data: rgba, info } = await sharp(cardPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const alphaBounds = findAlphaBounds(rgba, info.width, info.height, info.channels, 8);
      assert(alphaBounds, `${collection.id} card ${cardNumber} has no visible alpha content`);
      assert(
        (
          alphaBounds.left <= 6
          && alphaBounds.right <= 6
        ) || (
          alphaBounds.top <= 6
          && alphaBounds.bottom <= 6
        ),
        `${collection.id} card ${cardNumber} was not tightly cropped before 5:7 containment`,
      );
      for (const [x, y] of [
        [0, 0],
        [info.width - 1, 0],
        [0, info.height - 1],
        [info.width - 1, info.height - 1],
      ]) {
        assert(
          rgba[(y * info.width + x) * info.channels + 3] <= 8,
          `${collection.id} card ${cardNumber} retained an opaque white corner`,
        );
      }
    }
    const cardExtraction = mints
      .map((mint) => collection.cardExtractions?.[mint])
      .find(Boolean);
    if (cardExtraction) {
      const { data: rgba, info } = await sharp(cardPath)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const alphaBounds = findAlphaBounds(rgba, info.width, info.height, info.channels, 8);
      assert(alphaBounds, `${collection.id} card ${cardNumber} has no extracted alpha content`);
      for (const [x, y] of [
        [0, 0],
        [info.width - 1, 0],
        [0, info.height - 1],
        [info.width - 1, info.height - 1],
      ]) {
        assert(
          rgba[(y * info.width + x) * info.channels + 3] <= 8,
          `${collection.id} card ${cardNumber} retained its photographed outer background`,
        );
      }
    }
    assertJsonEqual(
      metadata.collection_mints,
      mints,
      `${collection.id} card ${cardNumber} metadata mint group differs`,
    );
    assertJsonEqual(
      normalizeMetadataTraits(metadata.attributes),
      traitRecord.entries,
      `${collection.id} card ${cardNumber} trait module differs from metadata`,
    );

    expectedCardFiles.push(cardFile);
    expectedMetadataFiles.push(traitRecord.metadata);

    if (card.animation) {
      assert(sourceCard.sourceAnimatedGifUri, `${collection.id} card ${cardNumber} lacks a GIF source`);
      assert(
        sourceCard.animation?.width === collection.width
          && sourceCard.animation?.height === collection.height,
        `${collection.id} card ${cardNumber} source animation dimensions differ`,
      );
      const {
        width: sourceAnimationWidth,
        height: sourceAnimationHeight,
        ...sourcePublicAnimation
      } = sourceCard.animation;
      assertJsonEqual(
        {
          ...card.animation,
          file: stripUrlSuffix(card.animation.file),
          sprite: {
            ...card.animation.sprite,
            file: stripUrlSuffix(card.animation.sprite?.file),
          },
        },
        sourcePublicAnimation,
        `${collection.id} card ${cardNumber} animation differs from source`,
      );
      assert(
        card.animation.file.endsWith(`?v=${collection.animationRevision}`)
          && card.animation.sprite?.file.endsWith(`?v=${collection.animationRevision}`),
        `${collection.id} card ${cardNumber} has stale animation URLs`,
      );
      const animatedFile = stripUrlSuffix(card.animation.file);
      const animatedSpriteFile = stripUrlSuffix(card.animation.sprite.file);
      const [animatedMetadata, animatedSpriteMetadata] = await Promise.all([
        sharp(path.join(root, animatedFile), {
          animated: true,
          limitInputPixels: false,
        }).metadata(),
        sharp(path.join(root, animatedSpriteFile)).metadata(),
      ]);
      assert(
        animatedMetadata.format === "webp"
          && animatedMetadata.width === collection.width
          && animatedMetadata.pageHeight === collection.height
          && animatedMetadata.pages === card.animation.frames
          && animatedMetadata.loop === card.animation.loop,
        `${collection.id} card ${cardNumber} animated WebP is invalid`,
      );
      assertJsonEqual(
        normalizeAnimationDelays(animatedMetadata.delay, card.animation.frames),
        card.animation.delays,
        `${collection.id} card ${cardNumber} animation timing differs`,
      );
      await assertAnimatedFramesDiffer(
        path.join(root, animatedFile),
        card.animation.frames,
        `${collection.id} card ${cardNumber}`,
      );
      assert(
        animatedSpriteMetadata.format === "webp"
          && animatedSpriteMetadata.width
            === card.animation.sprite.columns * card.animation.sprite.frameWidth
          && animatedSpriteMetadata.height
            === card.animation.sprite.rows * card.animation.sprite.frameHeight,
        `${collection.id} card ${cardNumber} animated sprite atlas is invalid`,
      );
      animatedGroupKeyHashes.push(sourceCard.groupKeyHash);
      expectedAnimatedFiles.push(animatedFile);
      expectedAnimatedSpriteFiles.push(animatedSpriteFile);
    } else {
      assert(!sourceCard.animation, `${collection.id} card ${cardNumber} omits source animation`);
      assert(
        !sourceCard.sourceAnimatedGifUri,
        `${collection.id} card ${cardNumber} froze an original GIF`,
      );
    }
  }

  assertJsonEqual(
    categoriesFromCards,
    traitCategories,
    `${collection.id} trait category ordering differs`,
  );
  assert(
    collectionMints.size === sourceMintSet.size,
    `${collection.id} generated mint coverage differs`,
  );
  for (const mint of sourceMintSet) {
    assert(collectionMints.has(mint), `${collection.id} omits live mint ${mint}`);
  }
  for (const mint of excludedMintSet) {
    assert(!collectionMints.has(mint), `${collection.id} exposes excluded mint ${mint}`);
  }
  if (Array.isArray(collection.expectedAnimatedGroupKeyHashes)) {
    assertJsonEqual(
      animatedGroupKeyHashes.sort(),
      [...collection.expectedAnimatedGroupKeyHashes].sort(),
      `${collection.id} animated group coverage differs`,
    );
  }

  const backFile = `assets/${collection.id}/backs/${collection.id}-back.webp`;
  const backPath = path.join(root, backFile);
  const backMetadata = await sharp(backPath).metadata();
  const expectedBackWidth = collection.backWidth || collection.width;
  const expectedBackHeight = collection.backHeight || collection.height;
  assert(
    backMetadata.format === "webp"
      && backMetadata.width === expectedBackWidth
      && backMetadata.height === expectedBackHeight,
    `${collection.id} back is invalid`,
  );
  if (!collection.backSource) {
    const backStats = await sharp(backPath).stats();
    for (const channel of backStats.channels.slice(0, 3)) {
      assert(
        channel.min >= 34 && channel.max <= 38 && channel.stdev < 0.5,
        `${collection.id} back is not uniformly dark grey`,
      );
    }
  }

  await Promise.all([
    assertExactAssetFiles(
      path.join(root, "assets", collection.id, "cards"),
      ".webp",
      expectedCardFiles,
      `${collection.id} card assets`,
    ),
    assertExactAssetFiles(
      path.join(root, "assets", collection.id, "metadata"),
      ".json",
      expectedMetadataFiles,
      `${collection.id} metadata assets`,
    ),
    assertExactAssetFiles(
      path.join(root, "assets", collection.id, "backs"),
      ".webp",
      [backFile],
      `${collection.id} back assets`,
    ),
    ...(collection.preserveAnimatedGifs
      ? [
        assertExactAssetFiles(
          path.join(root, "assets", collection.id, "animated"),
          ".webp",
          expectedAnimatedFiles,
          `${collection.id} animated assets`,
        ),
        assertExactAssetFiles(
          path.join(root, "assets", collection.id, "animated-sprites"),
          ".webp",
          expectedAnimatedSpriteFiles,
          `${collection.id} animated sprite assets`,
        ),
      ]
      : []),
  ]);

  for (const value of [
    `data-collection-id="${collection.id}"`,
    "<title>cards.art</title>",
    'type="image/png" href="../cardnft.png"',
    'rel="apple-touch-icon" href="../cardnft.png"',
    `aria-label="3D ${collection.label} viewer"`,
    `aria-label="Rotatable ${collection.label}"`,
    `aria-label="${collection.label} gallery"`,
    `aria-label="3D ${collection.label} binder"`,
    `../app.js?v=${expectedAppVersion}`,
    "../vendor/three.module.min.js?v=three-r165-min-1",
    "../browser-traits-catalog.js?v=browser-traits-5",
    "../styles.css?v=cardnft-129",
  ]) {
    assert(page.includes(value), `${collection.id} page is missing ${JSON.stringify(value)}`);
  }
  assert(!page.includes("Card NFT"), `${collection.id} page retained template labels`);

  totalCards += cards.length;
  totalMints += collectionMints.size;
  console.log(
    `Verified ${collection.label}: ${cards.length} cards, ${collectionMints.size} mints, `
    + `${traitCategories.length} trait categories.`,
  );
}

console.log(
  `Verified ${collections.length} community binders: `
  + `${totalCards} cards representing ${totalMints} live mints.`,
);

function seedExistingCollectionIdentity(collectionId, cards) {
  for (let index = 0; index < cards.length; index += 1) {
    const card = cards[index];
    const stableId = card?.stableId
      || `${collectionId}:${card?.mint || card?.title || index}`;
    assert(!allStableIds.has(stableId), `existing collections repeat stable ID ${stableId}`);
    allStableIds.add(stableId);
    const cardMints = new Set([
      card?.mint,
      ...(Array.isArray(card?.mints) ? card.mints : []),
    ]);
    for (const mint of cardMints) {
      if (!mint) continue;
      assert(!allMints.has(mint), `existing collections repeat mint ${mint}`);
      allMints.add(mint);
    }
  }
}

function verifySharedAppArchitecture() {
  assert(
    app.includes("function registerCollectionCards(collectionId, cards)")
      && app.includes("CARDS.push(card)")
      && app.includes("async function ensureAllCollectionCards()"),
    "app does not build one shared cross-collection card index",
  );
  assert(
    app.includes("[card?.mint, ...(Array.isArray(card?.mints) ? card.mints : [])]"),
    "app does not index every grouped edition mint",
  );
  assert(
    app.includes('const FAVORITES_STORAGE_KEY = "cardnft:favorites:v1"'),
    "app does not use the shared favorites store",
  );
  assert(
    app.includes("card?.animation?.file")
      && app.includes("card?.animation?.sprite"),
    "app does not expose community animations in gallery and 3D views",
  );
  assert(
    app.includes("const CARD_HEIGHT = 3.5;")
      && !app.includes("ACTIVE_CARD_ASPECT_SOURCE"),
    "app does not lock physical cards and binder slots to 2.5x3.5",
  );
  assert(
    app.includes("const frontMesh = group.userData.frontMesh;")
      && app.includes("frontMesh.scale.set("),
    "app does not contain front artwork independently from fixed card geometry",
  );
  assert(
    styles.includes("--card-aspect-padding: 140%;")
      && !styles.includes('html[data-collection-id="cardnft1"]')
      && /\.binder-card-transition-card\s*\{[\s\S]*?object-fit:\s*contain;/.test(styles)
      && /\.gallery-card img\s*\{[\s\S]*?object-fit:\s*contain;/.test(styles),
    "shared DOM card slots do not use fixed 5:7 contain sizing",
  );
  assert(
    app.includes('if (ACTIVE_COLLECTION.introGroup !== "evil")')
      && app.includes("collection.id !== ACTIVE_COLLECTION_ID")
      && app.includes('collection.introGroup === "evil"'),
    "app binder-cover collection-link grouping differs",
  );
  assert(
    app.includes("function navigateBinderIntroLink(url)")
      && app.includes("destination.origin === window.location.origin")
      && app.includes("window.location.assign(destination.href)")
      && app.includes("navigateBinderIntroLink(hit.object.userData.binderIntroLinkUrl)")
      && app.includes("navigateBinderIntroLink(linkHit.object.userData.binderIntroLinkUrl)"),
    "cross-binder intro links do not navigate in the current tab",
  );
  assert(
    app.includes("traitFiltersEnabledForCollection(trait.collection)")
      && app.includes("if (!traitFiltersEnabledForCollection(collectionId)) return;"),
    "cross-collection trait navigation is disabled on traitless binder routes",
  );
  assert(
    app.includes(`const COMMUNITY_COVER_COLLECTION_ORDER = [
  "cardnft1",
  "cardnft2",
  "poncho",
  "limited",
  "cloudcastle",
  "cloudcastles",
  "badhand",
  "jpegs",
  "nolegs",
  "mtgnft",
  "playcards",
  "kardmane",
  "winloop",
  "sweetcurse",
  "igorsquest",
];`),
    "inside-cover collection order differs",
  );
  assert(
    app.includes("const firstRowY = 92;")
      && app.includes("const lastRowY = 512;"),
    "community inside-cover links do not use the expanded vertical spacing",
  );
  for (const collection of COMMUNITY_COLLECTIONS) {
    assert(
      app.includes(`id: "${collection.id}"`)
        && app.includes(`path: "/${collection.route}/"`)
        && app.includes(`introLabel: "${collection.introLabel}"`)
        && app.includes('introGroup: "community"'),
      `app is missing the ${collection.id} collection configuration`,
    );
  }
}

function getTitleNumber(value) {
  const match = String(value || "").trim().match(/(\d+)\s*$/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function findAlphaBounds(data, width, height, channels, threshold) {
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
  return maxX >= minX && maxY >= minY
    ? {
      left: minX,
      right: width - 1 - maxX,
      top: minY,
      bottom: height - 1 - maxY,
    }
    : null;
}

function normalizeMetadataTraits(attributes) {
  if (!Array.isArray(attributes)) return [];
  return attributes
    .map((attribute) => ({
      category: String(attribute?.trait_type || attribute?.traitType || "").trim(),
      value: String(attribute?.value ?? "").trim(),
    }))
    .filter(({ category, value }) => category && value);
}

function normalizeAnimationDelays(delays, frames) {
  const values = Array.isArray(delays)
    ? delays.slice(0, frames).map((delay) => Math.max(20, Number(delay) || 100))
    : [];
  while (values.length < frames) values.push(100);
  return values;
}

async function assertAnimatedFramesDiffer(filePath, frames, label) {
  const hashes = new Set();
  for (let page = 0; page < frames; page += 1) {
    const frame = await sharp(filePath, {
      page,
      pages: 1,
      limitInputPixels: false,
    })
      .resize({ width: 64, height: 90, fit: "fill" })
      .raw()
      .toBuffer();
    hashes.add(createHash("sha256").update(frame).digest("hex"));
  }
  assert(hashes.size > 1, `${label} animation frames are visually identical`);
}

async function assertExactAssetFiles(directory, extension, expectedFiles, label) {
  const actualFiles = (await listFilesRecursive(directory))
    .filter((file) => file.toLowerCase().endsWith(extension))
    .map((file) => toRootRelative(file))
    .sort();
  const expected = [...expectedFiles].sort();
  assertJsonEqual(actualFiles, expected, `${label} contain missing or stale files`);
}

async function listFilesRecursive(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFilesRecursive(filePath));
    } else if (entry.isFile()) {
      files.push(filePath);
    }
  }
  return files;
}

function toRootRelative(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function stripUrlSuffix(value) {
  return String(value || "").split(/[?#]/, 1)[0];
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function assertJsonEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), message);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function loadSharp() {
  const candidates = [
    process.env.COMMUNITY_SHARP_MODULE,
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
  throw new Error("Unable to load sharp; install it or set COMMUNITY_SHARP_MODULE.");
}
