import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BROWSER_TRAIT_CATALOG } from "../browser-traits-catalog.js";
import { CLEAR_CARDS } from "../clear-data.js";
import { NOLEGS_CARDS } from "../nolegs-data.js";
import {
  TENSOR_LISTED_CARD_IDS,
  TENSOR_LISTED_CARD_MINTS,
  TENSOR_LISTING_STATUS_UPDATED_AT,
  TENSOR_LISTING_SUMMARIES,
} from "../marketplace-status.js";
import { COMMUNITY_COLLECTIONS } from "./community-collections.mjs";
import { SWAG_PACK_TRANSPARENT_STICKER_FILES } from "../swag-pack-stickers.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_VERSION = "cardnft-380";
const STYLE_VERSION = "cardnft-155";
const THREE_VERSION = "three-r165-min-1";

const TRAIT_SPECS = [
  ["cardnft1", "cardnft-traits.js", "CARD_NFT_TRAIT_CATEGORIES", "CARD_NFT_TRAITS"],
  ["cardnft2", "cardnft2-traits.js", "CARD_NFT_2_TRAIT_CATEGORIES", "CARD_NFT_2_TRAITS"],
  ["poncho", "poncho-traits.js", "PONCHO_TRAIT_CATEGORIES", "PONCHO_TRAITS"],
  ["limited", "limited-traits.js", "LIMITED_TRAIT_CATEGORIES", "LIMITED_TRAITS"],
  ["cloudcastle", "cloudcastle-traits.js", "CLOUDCASTLE_TRAIT_CATEGORIES", "CLOUDCASTLE_TRAITS"],
  ["badhand", "badhand-traits.js", "BADHAND_TRAIT_CATEGORIES", "BADHAND_TRAITS"],
  ["badhand2", "badhand2-traits.js", "BADHAND2_TRAIT_CATEGORIES", "BADHAND2_TRAITS"],
  ["jpegs", "jpegs-traits.js", "JPEGS_TRAIT_CATEGORIES", "JPEGS_TRAITS"],
  ["nolegs", "nolegs-traits.js", "NOLEGS_TRAIT_CATEGORIES", "NOLEGS_TRAITS"],
  ["playcards", "playcards-traits.js", "PLAYCARDS_TRAIT_CATEGORIES", "PLAYCARDS_TRAITS"],
  ["kardmane", "kardmane-traits.js", "KARDMANE_TRAIT_CATEGORIES", "KARDMANE_TRAITS"],
  ["cloudcastles", "cloudcastles-traits.js", "CLOUDCASTLES_TRAIT_CATEGORIES", "CLOUDCASTLES_TRAITS"],
  ["sweetcurse", "sweetcurse-traits.js", "SWEETCURSE_TRAIT_CATEGORIES", "SWEETCURSE_TRAITS"],
  ["winloop", "winloop-traits.js", "WINLOOP_TRAIT_CATEGORIES", "WINLOOP_TRAITS"],
  ["mtgnft", "mtgnft-traits.js", "MTGNFT_TRAIT_CATEGORIES", "MTGNFT_TRAITS"],
  ["igorsquest", "igorsquest-traits.js", "IGORSQUEST_TRAIT_CATEGORIES", "IGORSQUEST_TRAITS"],
];

const DATA_REVISIONS = Object.freeze({
  cloudcastle: "community-3",
  badhand: "community-2",
  badhand2: "community-1",
  jpegs: "community-7",
  nolegs: "community-5",
  playcards: "community-2",
  kardmane: "community-2",
  cloudcastles: "community-5",
  sweetcurse: "community-5",
  winloop: "community-5",
  mtgnft: "community-5",
  igorsquest: "community-5",
  limited: "community-8",
});

for (const [id, sourceFile, categoriesExport, traitsExport] of TRAIT_SPECS) {
  const source = await import(new URL(`../${sourceFile}`, import.meta.url));
  const packed = await import(new URL(`../browser-traits/${id}.js`, import.meta.url));
  const categories = source[categoriesExport];
  const records = source[traitsExport];
  const catalog = BROWSER_TRAIT_CATALOG[id];

  assert(Array.isArray(categories), `${id} source categories are invalid`);
  assert(Array.isArray(records), `${id} source traits are invalid`);
  assertJsonEqual(catalog?.categories, categories, `${id} browser categories differ`);
  assert(catalog?.records === records.length, `${id} browser record count differs`);
  assert(
    packed.TRAIT_ROWS.length === records.length,
    `${id} packed trait rows have the wrong length`,
  );

  for (let recordIndex = 0; recordIndex < records.length; recordIndex += 1) {
    const expected = getSourceTraitPairs(records[recordIndex], categories);
    const actual = getPackedTraitPairs(
      packed.TRAIT_ROWS[recordIndex],
      categories,
      packed.TRAIT_VALUE_DICTIONARY,
    );
    assertJsonEqual(actual, expected, `${id} trait row ${recordIndex} differs`);
  }
}

const { CARD_NFT_2_TRAITS } = await import("../cardnft2-traits.js");
const superRareCardNumbers = CARD_NFT_2_TRAITS.flatMap((record, index) => (
  record?.entries?.some((entry) => (
    String(entry?.category || "").toLowerCase() === "rarity"
    && String(entry?.value || "").toLowerCase() === "super rare"
  ))
    ? [index + 1]
    : []
));
assertJsonEqual(
  collapseIntegerRanges(superRareCardNumbers),
  [[7009, 10999], [11111, 11132]],
  "Card NFT 2 super-rare shader ranges differ from metadata",
);

const app = await readFile(path.join(ROOT, "app.js"), "utf8");
const styles = await readFile(path.join(ROOT, "styles.css"), "utf8");
const walletAuth = await readFile(path.join(ROOT, "wallet-auth.js"), "utf8");
const walletRouteShell = await readFile(path.join(ROOT, "404.html"), "utf8");
const walletWorker = await readFile(path.join(ROOT, "worker", "src", "index.js"), "utf8");
const liveDataWorker = await readFile(path.join(ROOT, "worker", "src", "live-data.js"), "utf8");
const walletWorkerConfig = await readFile(path.join(ROOT, "worker", "wrangler-worker.jsonc"), "utf8");
const liveDataMigration = await readFile(
  path.join(ROOT, "worker", "migrations", "0003_live_card_statuses.sql"),
  "utf8",
);
const clearLiveDataMigration = await readFile(
  path.join(ROOT, "worker", "migrations", "0004_clear_card_statuses.sql"),
  "utf8",
);
const screensaverHorizontalImpulseCount = (
  app.match(/entry\.velocityX \+=/g) || []
).length;
const [
  cardNft1CoverStat,
  ponchoCoverStat,
  tableDisplayModelStat,
  tableSquishyModelStat,
  tableAngelgotchiModelStat,
  lightTableTextureStat,
  tableCoinTextureStat,
  tradeStickerStat,
  listedStickerStat,
  clearCardBackStat,
  dracoDecoderStat,
  roomEnvironmentStat,
] = await Promise.all([
  stat(path.join(ROOT, "assets", "ui", "cardnft1-logo-cover.webp")),
  stat(path.join(ROOT, "assets", "ui", "poncho-drifella-cover.webp")),
  stat(path.join(ROOT, "assets", "models", "table-white-mesh.glb")),
  stat(path.join(ROOT, "assets", "models", "table-display", "squishy.glb")),
  stat(path.join(ROOT, "assets", "models", "table-display", "angelgotchi.glb")),
  stat(path.join(ROOT, "assets", "ui", "table-wood-light-seamless.png")),
  stat(path.join(ROOT, "assets", "ui", "table-swag-coin.png")),
  stat(path.join(ROOT, "assets", "ui", "trade-sticker.png")),
  stat(path.join(ROOT, "assets", "ui", "listed-sticker.png")),
  stat(path.join(ROOT, "assets", "clear", "backs", "clear-card-back.webp")),
  stat(path.join(ROOT, "vendor", "draco", "r165", "draco_decoder.wasm")),
  stat(path.join(ROOT, "vendor", "RoomEnvironment.js")),
]);
assert(cardNft1CoverStat.size < 60_000, "Card NFT 1 cover emblem is unexpectedly large");
assert(ponchoCoverStat.size < 120_000, "Poncho cover emblem is unexpectedly large");
assert(tableDisplayModelStat.size < 100_000, "Table display model is unexpectedly large");
assert(tableSquishyModelStat.size < 3_000_000, "Squishy table model is unexpectedly large");
assert(tableAngelgotchiModelStat.size < 120_000, "Angelgotchi table model is unexpectedly large");
assert(lightTableTextureStat.size < 320_000, "Light table texture is unexpectedly large");
assert(tableCoinTextureStat.size < 230_000, "Table coin texture is unexpectedly large");
assert(tradeStickerStat.size > 0, "Trade sticker is empty");
assert(listedStickerStat.size > 0, "Listed sticker is empty");
assert(clearCardBackStat.size < 180_000, "Clear card back WebP is unexpectedly large");
assert(dracoDecoderStat.size < 250_000, "Draco decoder is unexpectedly large");
assert(roomEnvironmentStat.size < 10_000, "Room environment runtime is unexpectedly large");
assert(
  SWAG_PACK_TRANSPARENT_STICKER_FILES.length === 467
    && new Set(SWAG_PACK_TRANSPARENT_STICKER_FILES).size === 467,
  "Swag Pack transparent sticker manifest does not contain 467 unique designs",
);
const transparentStickerStats = await Promise.all(
  SWAG_PACK_TRANSPARENT_STICKER_FILES.map((filename) => (
    stat(path.join(ROOT, "assets", "swag-pack", "transparent", filename))
  )),
);
assert(
  transparentStickerStats.every((entry) => entry.size > 0 && entry.size < 600_000),
  "Swag Pack transparent sticker outputs are missing or unexpectedly large",
);
assert(
  styles.includes('#galleryViewToggleButton[aria-pressed="true"] .gallery-view-grid-icon')
    && styles.includes('#galleryViewToggleButton[aria-pressed="true"] .gallery-view-binder-icon')
    && styles.includes('#galleryViewToggleButton .gallery-view-mode-icon')
    && /#galleryToggleButton\[aria-pressed="true"\],[\s\S]{0,80}#galleryViewToggleButton\[aria-pressed="true"\]/.test(styles),
  "simple gallery control does not swap to the neutral binder icon",
);
assert(
  app.includes('from "./wallet-auth.js?v=wallet-auth-5"')
    && app.includes("async function startWalletSignIn(")
    && app.includes("async function loadWalletBinderRoute(")
    && app.includes("walletFilterCardIndexes.slice()")
    && app.includes("liveCardNft1OwnershipAvailable")
    && app.includes('error?.code === "binder_not_found"')
    && app.includes('const WALLET_TRADE_FILTER_VALUE = "marked-for-trade"')
    && app.includes('const LISTED_SORT_VALUE = "listed-first"')
    && app.includes('const COLLECTION_SORT_VALUE = "collection"')
    && app.includes('Number(isCardMarkedForTrade(CARDS[right]))')
    && app.includes("async function refreshGlobalTradeStatuses(options = {})")
    && app.includes("function syncGlobalTradeMarks(previousIds, nextIds)")
    && app.includes('listedOption.textContent = "listed"')
    && app.includes('collectionOption.textContent = "collection"')
    && app.includes("function renderMixedCollectionFilterPicker()")
    && app.includes('traitsButton.textContent = "view all traits"')
    && app.includes("function applyMixedCollectionFilter(collectionId)")
    && app.includes("activeCollectionFilter\n    || activeTraitFilter")
    && app.includes('? "redeem status"')
    && app.includes('traitSortCategory === LISTED_SORT_VALUE')
    && app.includes('const GALLERY_SORT_QUERY_PARAM = "sort"')
    && app.includes('const GALLERY_TRAIT_CATEGORY_QUERY_PARAM = "trait"')
    && app.includes('const GALLERY_TRAIT_VALUE_QUERY_PARAM = "trait-value"')
    && app.includes("function updateGalleryUrlFromState(")
    && app.includes("async function handleGalleryUrlNavigation(")
    && app.includes("walletTradeCardStableIds.has")
    && app.includes("toggleBinderTradeMarkingMode")
    && app.includes('return "https://api.cards.art/api"')
    && walletAuth.includes("wallet-standard:app-ready")
    && walletAuth.includes("solana:signIn")
    && walletAuth.includes("solana:signMessage")
    && walletAuth.includes("tradeCardIds: document.tradeCardIds || []")
    && walletAuth.includes("async function getGlobalTradeStatuses(")
    && walletWorker.includes('`${API_PREFIX}/trade-statuses`')
    && walletWorker.includes("function buildGlobalTradeStatusDocument(")
    && walletAuth.includes('hasOwnProperty.call(properties, "accounts")')
    && !walletAuth.includes("signTransaction")
    && styles.includes(".wallet-connect-button")
    && styles.includes(".wallet-provider-list")
    && styles.includes(".binder-order-card.is-marked-for-trade")
    && styles.includes('background: url("./assets/ui/trade-sticker.png?v=binder-stickers-1") center / contain no-repeat')
    && styles.includes(".binder-order-assistive")
    && app.includes("BINDER_ORDER_AUTO_SCROLL_OVERSHOOT_PX = 170")
    && app.includes("BINDER_ORDER_AUTO_SCROLL_EDGE_PX_PER_SECOND = 820")
    && app.includes("BINDER_ORDER_AUTO_SCROLL_MAX_PX_PER_SECOND = 1800")
    && app.includes('? "marking for trade"')
    && walletRouteShell.includes('<base href="/">')
    && walletRouteShell.includes('content="noindex, nofollow"'),
  "app does not include the transaction-free wallet sign-in and public binder route",
);
assert(
  app.includes("async function fetchLiveWalletCardMatches(address)")
    && app.includes("async function refreshWalletBinderHoldings(options = {})")
    && app.includes("Object.keys(COLLECTION_CONFIGS).map(ensureCollectionCards)")
    && app.includes("WALLET_HOLDINGS_AUTO_REFRESH_MS = 5 * 60 * 1000")
    && app.includes("window.addEventListener(\"focus\", refreshLiveDataAfterFocus)")
    && app.includes("async function refreshLiveCardStatuses(options = {})")
    && app.includes("function applyLiveCardStatusCollection(collectionId)")
    && app.includes("LIVE_CARD_STATUS_REFRESH_MS = 12 * 60 * 60 * 1000")
    && app.includes("normalizeTraitValue(category) === \"status\"")
    && app.includes("function getCardMatchesForReferences(references)")
    && app.includes("function getCardMatchForDasAsset(asset)")
    && app.includes("CLEAR_CARD_COLLECTION_MINT")
    && walletWorker.includes("fetchLiveWalletHoldings")
    && walletWorker.includes('`${API_PREFIX}/card-statuses`')
    && liveDataWorker.includes('"getAssetsByOwner"')
    && liveDataWorker.includes('"getAssetsByGroup"')
    && liveDataWorker.includes("buildClearStatusCards")
    && liveDataWorker.includes("cardRefs: dasHoldings.cardRefs")
    && liveDataWorker.includes('["cardnft2", "poncho", "clear"]')
    && liveDataWorker.includes("refreshLiveCardStatuses")
    && liveDataWorker.includes("LIVE_STATUS_REFRESH_MS = 12 * 60 * 60 * 1000")
    && walletWorkerConfig.includes('"17 */12 * * *"')
    && liveDataMigration.includes("CREATE TABLE live_card_status_snapshots")
    && clearLiveDataMigration.includes("'cardnft2', 'poncho', 'clear'"),
  "live wallet holdings and automatic redemption status refresh are incomplete",
);
assert(
  app.includes('const PONCHO_COLLECTION_MINT = "JCTP3kK3xGtWs5mDHxJBuRro38HftaiCDdKsfkXuK2gH"')
    && app.includes('collectionIds.includes(PONCHO_COLLECTION_MINT)')
    && (app.match(/const seenAssetIds = new Set\(\);/g) || []).length >= 2
    && !app.includes("Number.isFinite(total) && fetched >= total")
    && liveDataWorker.includes('return ponchoRecord ? ["poncho", ponchoRecord[0], ponchoRecord[2]] : null')
    && (liveDataWorker.match(/const seenAssetIds = new Set\(\);/g) || []).length >= 2
    && !liveDataWorker.includes("Number.isFinite(total) && fetched >= total")
    && !liveDataWorker.includes("Number.isFinite(total) && assets.length >= total"),
  "wallet DAS pagination or on-chain Poncho fallback is incomplete",
);
assert(
  app.indexOf("let liveCardStatusSnapshot = null")
    < app.indexOf("registerCollectionCards(ACTIVE_COLLECTION_ID, INITIAL_COLLECTION_CARDS)"),
  "live card status state must initialize before the first collection registers",
);
assert(
  app.includes("function isCurrentWalletBinderOwner()")
    && app.includes("sessionAddress === WALLET_ROUTE_ADDRESS")
    && app.includes("async function openBinderOrderEditor()")
    && app.includes("getOwnerWalletBinder(WALLET_AUTH_API_BASE_URL)")
    && app.includes("updateOwnerWalletBinder(")
    && app.includes("getBinderOrderStableIds()")
    && app.includes("mergeBinderOrderWithUndetectedStableIds(")
    && app.includes("BINDER_SIDE_SLOTS")
    && app.includes("button.animate(")
    && app.includes("binderOrderHasChanges()")
    && app.includes("function invalidateWalletAuthSession(")
    && app.includes('return getPublicWalletBinder(WALLET_AUTH_API_BASE_URL, address)')
    && walletAuth.includes("getOwnerWalletBinder")
    && walletAuth.includes("updateOwnerWalletBinder")
    && walletAuth.includes('"/me/binder"')
    && styles.includes("grid-template-columns: repeat(3, minmax(0, 1fr))")
    && styles.includes(".binder-order-card.is-dragging")
    && styles.includes(".binder-order-confirm-button"),
  "app does not include the owner-only animated binder order editor",
);
assert(
  app.includes("const binderOrderCardNodes = new Map()")
    && app.includes("function syncBinderOrderEditorCardPositions(")
    && app.includes("function stepBinderOrderDragFrame(timestamp)")
    && app.includes("function getBinderOrderAutoScrollVelocity(")
    && app.includes("BINDER_ORDER_AUTO_SCROLL_MAX_PX_PER_SECOND")
    && app.includes("velocity * elapsedSeconds")
    && app.includes("binderOrderDrag.ghost.style.transform")
    && app.includes("binderOrderCardNodes.get(stableId)")
    && !app.includes("document.elementFromPoint(clientX, clientY)")
    && !app.includes("renderBinderOrderEditorCards({")
    && styles.includes(".binder-order-card.is-shifting")
    && styles.includes("overflow-anchor: none")
    && styles.includes("will-change: transform")
    && !styles.includes("will-change: left, top;"),
  "binder order dragging does not use the stable frame-synchronized interaction path",
);
assert(
  app.includes("function setBinderCustomizationMode(mode")
    && app.includes("async function createBinderCoverArtworkDataUrl(file)")
    && app.includes('function startBinderCoverArtworkDrag(event, side = "front")')
    && app.includes("function startBinderInsideTextBoxDrag(event)")
    && app.includes("function addBinderInsideTextLink()")
    && app.includes("function createBinderWalletCoverArtwork(")
    && app.includes("function createBinderWalletBackCoverArtwork(")
    && app.includes("function drawBinderCustomInsideText(")
    && app.includes("function getBinderCoverColorPalette(")
    && app.includes("function createBinderCustomCoverTexture(")
    && app.includes("function handleBinderBaseColorInput()")
    && app.includes("function handleBinderCoverTextColorInput()")
    && app.includes("function handleBinderCoverArtworkRotation(")
    && app.includes("function renderBinderOutsideTextEditor(")
    && app.includes("function startBinderCoverTextBoxInteraction(")
    && app.includes("function drawRotatedBinderCustomText(")
    && app.includes("frontTextRotation")
    && app.includes("function updateBinderInsideLinkPopover()")
    && app.includes("function finishBinderInsideTextSelection(event)")
    && app.includes("function handleBinderInsideTextClick()")
    && app.includes('document.addEventListener("selectionchange", handleBinderInsideTextSelectionChange)')
    && app.includes("const noteWidth = coverWidth * (walletCover ? 1 : 0.7)")
    && app.includes("!WALLET_ROUTE_ADDRESS && walletFilterCardIndexSet")
    && app.includes("refreshWalletBinderCoverRendering()")
    && walletAuth.includes("cover: document.cover || {}")
    && walletWorker.includes("validateBinderArtworkDataUrl")
    && walletWorker.includes("validateBinderInsideLinks")
    && walletWorker.includes("validateBinderCoverRotation")
    && walletWorker.includes('["http:", "https:"].includes(new URL(value).protocol)')
    && styles.includes(".binder-cover-preview-grid")
    && styles.includes(".binder-cover-text-resize")
    && styles.includes(".binder-outside-text-controls")
    && styles.includes(".binder-cover-color-label")
    && styles.includes(".binder-cover-link-popover")
    && styles.includes("body.is-light .binder-cover-text-control textarea")
    && styles.includes("body.is-light .binder-cover-link-row input")
    && styles.includes("body.is-light .binder-cover-link-popover::after")
    && styles.includes("body.is-light .binder-cover-link-row button:disabled")
    && styles.includes(".binder-cover-mode-button"),
  "wallet binder cover artwork and linked inside-cover text editor are incomplete",
);
assert(
  app.includes('const SWAG_PACK_COLLECTION_MINT = "C22esis7kQMbX9JGWsMaKvsh1X5GeBmHPju28jiKDyAP"')
    && app.includes('from "./swag-pack-stickers.js?v=swag-pack-transparent-1"')
    && app.includes("function getTransparentSwagPackStickerImageUrl(")
    && app.includes("const byImage = new Map()")
    && app.includes("function normalizeBinderCoverStickers(")
    && app.includes("async function openBinderStickerPicker(")
    && app.includes("async function fetchWalletSwagPackAssets(")
    && app.includes("function startBinderCoverStickerInteraction(")
    && app.includes('type: rotating ? "sticker-rotate"')
    && app.includes("function handleBinderCoverStickerKeyboard(")
    && app.includes("function positionBinderCoverStickerRemoveButton(")
    && app.includes("stickerRect.bottom - previewRect.top + 13")
    && app.includes("const BINDER_COVER_UNDO_LIMIT = 50")
    && app.includes("function captureBinderCoverUndoState(")
    && app.includes("function recordBinderCoverUndoState(")
    && app.includes("function undoBinderCoverChange(")
    && app.includes("function handleBinderCoverUndoKeydown(")
    && app.includes('String(event.key || "").toLowerCase() !== "z"')
    && app.includes("resetBinderCoverUndoHistory();")
    && app.includes("function createBinderCoverSurfaceTexture(")
    && app.includes("function renderWalletBinderInsideStickers(")
    && app.includes("material.userData.binderColorFaithful = colorFaithful")
    && walletWorker.includes("authorizeBinderCoverStickers")
    && walletWorker.includes('"sticker_not_owned"')
    && liveDataWorker.includes("SWAG_PACK_COLLECTION_MINT")
    && liveDataWorker.includes("swagPackAssets: dasHoldings.swagPackAssets")
    && styles.includes(".binder-cover-sticker-resize")
    && styles.includes(".binder-cover-sticker-rotate")
    && styles.includes(".binder-cover-sticker-remove")
    && styles.includes("box-sizing: border-box")
    && styles.includes("translateY(-3px)")
    && styles.includes("translateY(3px)")
    && styles.includes("width: 6px")
    && styles.includes(".binder-sticker-picker-gallery"),
  "wallet binder Swag Pack stickers or cover color parity are incomplete",
);
assert(
  app.includes('els.binderOrderPages.addEventListener("dblclick", startBinderOrderPositionEdit)')
    && app.includes("function beginBinderOrderPositionEdit(")
    && app.includes('input.inputMode = "numeric"')
    && app.includes('input.pattern = "[0-9]*"')
    && app.includes("function commitBinderOrderPositionEdit(")
    && app.includes("requestedPosition - 1")
    && app.includes("moveBinderOrderDraftItem(currentPosition, targetPosition")
    && app.includes("function cancelBinderOrderPositionEdit(")
    && app.includes('event.key === "F2"')
    && styles.includes(".binder-order-position-input")
    && styles.includes(".binder-order-card.is-position-editing")
    && styles.includes("pointer-events: auto"),
  "binder order numbers do not support stable inline position editing",
);
assert(
  app.includes("const COLLECTION_DATA_SPECS")
    && app.includes("await import(INITIAL_COLLECTION_DATA_SPEC.module)")
    && !/from\s+["'][^"']+-data\.js/.test(app),
  "app does not lazy-load route collection data",
);
assert(
  Number.isFinite(Date.parse(TENSOR_LISTING_STATUS_UPDATED_AT))
    && TENSOR_LISTED_CARD_IDS instanceof Set
    && TENSOR_LISTED_CARD_IDS.size > 0
    && TENSOR_LISTED_CARD_MINTS instanceof Map
    && TENSOR_LISTED_CARD_MINTS.size === TENSOR_LISTED_CARD_IDS.size
    && Object.keys(TENSOR_LISTING_SUMMARIES).length === 17
    && app.includes('from "./marketplace-status.js?v=marketplace-status-6"')
    && app.includes("card.listed = TENSOR_LISTED_CARD_IDS.has(card.stableId)")
    && app.includes("card.listedMint = TENSOR_LISTED_CARD_MINTS.get(card.stableId)")
    && app.includes('category: "listed?"')
    && app.includes('if (normalizedCategory === "listed?") return "listed"')
    && app.includes('value: card?.listed ? "true" : "false"')
    && app.includes("function getBinderCardStickerKinds(card)")
    && app.includes("function isCardMarkedForTrade(card)")
    && app.includes('if (card?.listed) kinds.push("listed")')
    && app.includes('kinds.push("trade")')
    && app.includes("function createBinderCardSticker(kind")
    && app.includes('const raisedAboveTrade = kind === "listed" && isCardMarkedForTrade(card)')
    && app.includes("BINDER_STICKER_SIZES.trade[1] + BINDER_STICKER_GAP")
    && app.includes("card.add(sticker)")
    && app.includes("function setBinderCardStickerOpacity(")
    && app.includes("sticker.visible = false")
    && app.includes("const ready = Boolean(card?.userData?.textureLoaded)")
    && app.includes("&& !card?.userData?.textureLoadFailed")
    && app.includes("const baseOpacity = ready ? clamp(opacity, 0, 1) : 0")
    && app.includes("child.userData.binderCardSticker")
    && app.includes("function configureBinderStickerTexture(texture)")
    && app.includes("texture.minFilter = THREE.LinearMipmapLinearFilter")
    && app.includes("texture.magFilter = THREE.LinearFilter")
    && app.includes("texture.generateMipmaps = true")
    && app.includes("function getBinderStickerRotation(card, kind)")
    && app.includes("unit * 10 - 5")
    && app.includes("function syncFixedClearBinderStickerLayout(cardMesh, card)")
    && app.includes("sticker.rotation.z = inverseRotation")
    && app.includes("width / (quarterTurn ? scaleY : scaleX)")
    && app.includes("height / (quarterTurn ? scaleX : scaleY)")
    && app.includes("CLEAR_BINDER_COVERED_STICKER_OPACITY = 1 - CLEAR_BINDER_PAGE_OPACITY")
    && app.includes("function getBinderPageStickerCoverOpacity(")
    && app.includes('const isClearListedSticker = cardData?.collection === "clear"')
    && app.includes("baseOpacity * (isClearListedSticker ? clamp(coverOpacity, 0, 1) : 1)")
    && app.includes("function createBinderTransitionStickers(card, rect)")
    && app.includes("updateBinderTransitionStickers(transitionStickers, targetRect, { visible: true })")
    && app.includes("document.body.append(transitionCard, ...transitionStickers.map")
    && app.includes("function handleBinderListedStickerTap(event)")
    && app.includes("function getBinderListedStickerHit(event)")
    && app.includes("function getBinderStickerScreenBounds(sticker, canvasRect)")
    && app.includes("card?.listedMint || card?.mint")
    && app.includes("if (handleBinderListedStickerTap(event)) return")
    && app.includes("./assets/ui/trade-sticker.png?v=binder-stickers-1")
    && app.includes("./assets/ui/listed-sticker.png?v=binder-stickers-1")
    && styles.includes(".binder-card-transition-sticker")
    && styles.includes("z-index: 91")
    && styles.includes("image-rendering: auto"),
  "live Tensor listing metadata and page-bound binder stickers are incomplete",
);
assert(
  app.includes("ensureCollectionTraits")
    && app.includes("browser-traits-catalog.js?v=browser-traits-9"),
  "app does not lazy-load packed browser traits",
);
assert(
  app.includes('clear: { module: "./clear-data.js?v=clear-8"')
    && app.includes('backImage: "assets/clear/backs/clear-card-back.webp?v=clear-5"')
    && app.includes("showUnpairedBinderBacks: false")
    && app.includes("hasFrontCard && ACTIVE_COLLECTION.showUnpairedBinderBacks !== false")
    && app.includes("function syncIndividualCardModel(")
    && app.includes("function loadIndividualCardModelSource(")
    && app.includes("./vendor/DRACOLoader.js?v=three-r165-draco-1")
    && app.includes("./vendor/RoomEnvironment.js?v=three-r165-room-env-1")
    && app.includes("INDIVIDUAL_CARD_DRACO_DECODER_PATH")
    && app.includes('els.cardCanvas.dataset.modelState = "ready"')
    && app.includes("function updateIndividualCardTransmissionBackdrop(")
    && app.includes("function prepareIndividualCardModelRenderingProfile(")
    && app.includes("new THREE.PMREMGenerator(cardRenderer)")
    && app.includes("THREE.ACESFilmicToneMapping")
    && app.includes("cardRenderer.toneMappingExposure = 1.25")
    && app.includes("INDIVIDUAL_CARD_CLEAR_ENVIRONMENT_ROTATION_DEG = 121")
    && app.includes("backdropAlpha: { value: 0.3 }")
    && app.includes("new THREE.Color(0x191919)")
    && app.includes("new THREE.PointLight(0xffffff, 17, 0, 0.4)")
    && app.includes("cardClearResinPointLight.position.set(-6.5, 1.2, 3)")
    && app.includes("cardClearResinPointLight.position.set(-3.9, 5.5, 3)")
    && app.includes("new THREE.SpotLight(")
    && app.includes("function applyBinderCardAspectFit(mesh, card, texture = null)")
    && app.includes("function getLoadedCardTextureDimensions(texture)")
    && app.includes('card?.collection === "clear"')
    && app.includes('card.collection === "clear"')
    && app.includes("loadedDimensions.width > loadedDimensions.height")
    && app.includes("swapDimensions: rotateLandscape")
    && app.includes("(CARD_HEIGHT / CARD_WIDTH) * fittedDisplayScale.y")
    && app.includes("(CARD_WIDTH / CARD_HEIGHT) * fittedDisplayScale.x")
    && app.includes("rotateLandscape ? -Math.PI / 2 : 0")
    && app.includes("texture.userData.cardFrameWidth = sourceFrameWidth")
    && app.includes("const CLEAR_BINDER_PAGE_COLOR = 0x111315")
    && app.includes("const CLEAR_BINDER_PAGE_OPACITY = 0.84")
    && app.includes("const CLEAR_BINDER_POCKET_OPACITY = 1")
    && app.includes('ACTIVE_COLLECTION_ID === "clear"')
    && app.includes("function addClearBinderPageBacking(group, sourceMaterial)")
    && app.includes("backing.userData.clearBinderPageBacking = true")
    && app.includes("CLEAR_BINDER_PAGE_OPACITY * pageOpacity")
    && app.includes("function usesDedicatedClearBinderPageBacking(indexes)")
    && app.includes("&& !favoritesOnly")
    && app.includes("&& !walletFilterCardIndexSet")
    && app.includes('indexes.every((index) => CARDS[index]?.collection === "clear")')
    && app.includes("function addClearBinderPocketBacking(")
    && app.includes("function getBinderPocketBackingGeometry()")
    && app.includes("createBinderPageMaterials(binderVisibleIndexes)")
    && app.includes("BINDER_CELL_WIDTH,")
    && app.includes("BINDER_CELL_HEIGHT,")
    && app.includes("backing.userData.clearBinderPocketBacking = true")
    && app.includes("CLEAR_BINDER_POCKET_OPACITY * pageOpacity")
    && app.includes("|| child.userData.clearBinderPocketBacking")
    && app.includes("hideProceduralWhileLoading")
    && app.includes("group.userData.individualCardModelReadyPromise = readyPromise")
    && app.includes("function prewarmIndividualCardModelAssets(card)")
    && app.includes("prewarmIndividualCardModelAssets(focusedCard)")
    && app.includes("const waitForClearModel = card.collection")
    && app.includes("individualModelReadyPromise || Promise.resolve(false)")
    && styles.includes('html[data-collection-id="clear"] .binder-card-transition-card')
    && /html\[data-collection-id="clear"\] \.binder-card-transition-card[\s\S]{0,220}border-radius: 0;[\s\S]{0,120}box-shadow: none;/.test(styles)
    && !app.includes("modelOpacity")
    && !styles.includes("--individual-card-model-opacity"),
  "app does not reproduce the scoped mons.shop clear-resin rendering profile",
);
assert(
  CLEAR_CARDS.length === 192
    && CLEAR_CARDS.every((card, index) => {
      const number = index + 1;
      return card.number === number
        && card.collection === "clear"
        && card.title === `Card #${number}`
        && card.stableId === `clear:card-${number}`
        && card.file === `https://cdn.lil.org/nft/clear_cards/cards/clean_dark/${number}.webp`
        && card.model === `https://cdn.lil.org/nft/clear_cards/cards/${number}.glb`
        && card.metadata === `https://cdn.lil.org/nft/clear_cards/json/f${number}.json`
        && card.modelRenderProfile === "mons-clear-resin"
        && card.width === 963
        && card.height === 1400;
    }),
  "Clear Cards does not map all 192 CDN image, model, and metadata records",
);
assert(
  CLEAR_CARDS.filter((card) => card.mint).length >= 86
    && CLEAR_CARDS.filter((card) => card.status === "redeemed").length >= 4
    && CLEAR_CARDS.filter((card) => card.mint).every((card) => (
      /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(card.mint)
    )),
  "Clear Cards does not include its current wallet-matchable card and receipt mints",
);
const customNoLegsCards = NOLEGS_CARDS.filter((card) => /^CUSTOM #\d+$/.test(card.title));
assert(
  customNoLegsCards.length === 13
    && customNoLegsCards.every((card) => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(card.mint)),
  "the appended CUSTOM no-legs collection is not wallet-matchable",
);
assert(
  app.includes('import { CARD_NFT_2_COMMON_IDS } from "./cardnft2-common-ids.js?v=cardnft2-common-1"')
    && app.includes("const CARD_NFT_2_COMMON_ID_SET = new Set(CARD_NFT_2_COMMON_IDS)")
    && app.includes("const CARD_NFT_2_RARE_CARD_ID_MAX = 7008")
    && app.includes("function isCardNft2Rare(")
    && /function isCardNft2Rare\([^)]*\)\s*\{[\s\S]{0,220}!CARD_NFT_2_COMMON_ID_SET\.has\(cardNumber\)/.test(app)
    && /function getCardEffectProfile\([^)]*\)\s*\{[\s\S]{0,260}!isCardNft2Rare\(cardNumber\)[\s\S]{0,80}!isCardNft2SuperRare\(cardNumber\)/.test(app)
    && app.includes("function updateCardEffectMaterialBlending(")
    && app.includes("&& effectMode < CARD_EFFECT_MODE_CARD_NFT_2_AMAZING_RARE")
    && app.includes('mesh.userData.cardEffectLayer = "shine"')
    && app.includes('mesh.userData.cardEffectLayer = "glare"')
    && app.includes("engravingAlpha = maskSample.a")
    && app.includes("needsEffectTextures: superRare")
    && app.includes("usesProceduralHolo: !superRare")
    && app.includes("usesEngravingMask: superRare")
    && app.includes("effectStrength: superRare ? 1 : 0.42")
    && app.includes("uniform float uUseEngravingMask")
    && app.includes("profile.usesEngravingMask ? 1 : 0")
    && app.includes("profile.usesProceduralHolo ? 1 : 0")
    && app.includes("uUseEffectTextures > 0.001 && uUseEngravingMask > 0.001")
    && app.includes("* smoothstep(0.0, 1.0, uUseEngravingMask)")
    && app.includes("CARD_NFT_2_SUPER_RARE_RANGES")
    && app.includes("function isCardNft2SuperRare(")
    && app.includes("https://cdn.lil.org/nft/card_nft_2")
    && app.includes("float maximumAlpha = uEffectMode >= 4.5 ? 0.22 : 0.38")
    && app.includes("if (uEffectMode >= 3.5 && uEffectMode < 4.5)")
    && /function getCardEffectUniformActivity\([^)]*\)\s*\{[\s\S]{0,240}CARD_EFFECT_MODE_CARD_NFT_2_RARE_HOLO_V[\s\S]{0,180}Math\.max\(cardEffectPointerActive, motionActivity\)/.test(app)
    && !/function getCardEffectUniformActivity\([^)]*\)\s*\{[\s\S]{0,180}CARD_EFFECT_MODE_CARD_NFT_2_RARE_HOLO_V[\s\S]{0,80}return 1;/.test(app)
    && app.includes("applyCardEffectProfile(CARDS[currentIndex], cardApplyToken)"),
  "app does not keep normal Card NFT 2 rares procedural while reserving engraving masks for super rares",
);
assert(
  app.includes("const CARD_EFFECT_TEXTURE_FADE_MS = 180")
    && app.includes("function setCardEffectTextureUsage(")
    && app.includes("function updateCardEffectTextureUsage(")
    && app.includes("preloadCardEffectTextures(card),")
    && app.includes("const prepared = { frontTexture, backTexture, effectTextures }")
    && app.includes("prewarmIndividualCardEffect(card, frontTexture, backTexture, effectTextures)")
    && app.includes("applyShuffleFrontFace(nextIndex, frontTexture, effectTextures)")
    && app.includes("function loadHighPriorityTexture(")
    && app.includes('loadTextureImage(url, { fetchPriority: "high" })')
    && app.includes("entry.promise = loadHighPriorityTexture(url, options)")
    && app.includes("applyLoadedIndividualCardEffect(CARDS[currentIndex], state.effectTextures, { immediate: true })")
    && app.includes("if (uUseEffectTextures > 0.001 && uUseEngravingMask > 0.001)")
    && app.includes("vec2 effectPointer = mix(")
    && app.includes("reflectedPointer,")
    && app.includes("vec2 pointerUv = clamp(uPointer, 0.0, 1.0)")
    && app.includes("float spotlightStrength = mix(0.68, 1.0, hoverActivity)")
    && app.includes("const CARD_NFT_2_EFFECT_EDGE_FADE_DISTANCE = 0.46")
    && app.includes('document.addEventListener("pointermove", onGlobalCardEffectPointerMove')
    && app.includes('document.addEventListener("mousemove", onGlobalCardEffectPointerMove')
    && app.includes("function updateCardEffectRayFromClientPosition(")
    && app.includes("function updateCardEffectRayFromEvent(")
    && app.includes("function getCardEffectEdgeActivity(")
    && app.includes("setCardEffectPointerTarget(\n      planeUv.x,\n      planeUv.y,\n      getCardEffectEdgeActivity(planeUv.x, planeUv.y)")
    && app.includes("function onGlobalCardEffectPointerMove(")
    && app.includes("function refreshCardEffectPointerProjection(")
    && app.includes("refreshCardEffectPointerProjection();")
    && app.includes("const positionAlpha = rotationTracking")
    && (app.match(/vec2 spotlightPointer = mix\(/g) || []).length === 2
    && app.includes("distance(vUv, spotlightPointer)")
    && /function clearCardEffectPointer\(\)\s*\{[\s\S]{0,180}cardEffectPointerTargetX,[\s\S]{0,80}cardEffectPointerTargetY/.test(app)
    && !app.includes("CARD_NFT_2_EFFECT_OFFCARD_POINTER"),
  "app does not continuously reproject the pointer through 3D rotation while keeping reflection and spotlight motion separate",
);
assert(
  app.includes("function updateIndividualCardHoverTiltTarget(")
    && app.includes("function setIndividualCardHoverTiltTargetFromCurrentRay(")
    && app.includes("function refreshIndividualCardHoverTiltTarget(")
    && /function refreshIndividualCardHoverTiltTarget\(\)\s*\{[\s\S]{0,420}updateCardEffectRayFromClientPosition\([\s\S]{0,180}setIndividualCardHoverTiltTargetFromCurrentRay\(\)/.test(app)
    && app.includes("function updateIndividualCardHoverTilt()")
    && app.includes("function releaseIndividualCardHoverTilt(")
    && app.includes("isCardPanMode()")
    && app.includes("individualCardHoverTiltX"),
  "app does not include cursor-surface-relative hover tilt in zoomed pan mode",
);
assert(
  app.includes("const CARD_PAN_CLIP_TOLERANCE_PX = 1")
    && app.includes("function isUnrotatedCardFullyVisibleInViewport(")
    && app.includes("return !isUnrotatedCardFullyVisibleInViewport()")
    && app.includes("function getCardPanAxisRange(")
    && app.includes("currentCardOffsetX")
    && app.includes("INDIVIDUAL_CARD_WORLD_Y")
    && !app.includes("CARD_PAN_MODE_Z"),
  "app does not choose rotation versus panning from the card's actual viewport visibility",
);
assert(
  app.includes("const CARD_SHUFFLE_GLOSS_FADE_IN_START = 0.08")
    && app.includes("const CARD_SHUFFLE_GLOSS_FADE_IN_END = 0.22")
    && app.includes("const CARD_SHUFFLE_GLOSS_FADE_START = 0.62")
    && app.includes("const CARD_SHUFFLE_GLOSS_FADE_END = 0.94")
    && /cardShuffleSpinAnimating = true;\s*cardShuffleGlossOpacity = 0;/.test(app)
    && app.includes("function getCardShuffleGlossEnvelopeOpacity(")
    && app.includes("cardShuffleGlossOpacity = getCardShuffleGlossEnvelopeOpacity(progress)")
    && app.includes("return easeInOutCubic(fadeInProgress)")
    && /function getCardEffectUniformActivity\([^)]*\)\s*\{[\s\S]{0,120}cardGlossActivity \* cardShuffleGlossOpacity[\s\S]{0,360}return motionActivity;/.test(app)
    && /function resetCardShuffleSpinVisualState\(\)\s*\{[\s\S]{0,100}cardShuffleGlossOpacity = 1;/.test(app),
  "app does not keep ordinary gloss hidden while loading and fade it smoothly within the shuffle rotation",
);
assert(
  app.includes("function scheduleIndividualBinderSpreadPrewarm(")
    && app.includes("function getIndividualBinderSpreadPrewarmIndexes(")
    && app.includes("function prewarmIndividualBinderSpread(")
    && app.includes("function cancelIndividualBinderSpreadPrewarm(")
    && app.includes("INDIVIDUAL_BINDER_SPREAD_PREWARM_CONCURRENCY")
    && /function scheduleIndividualBinderSpreadPrewarm\([^)]*\)\s*\{[\s\S]{0,500}const sequence = getVisibleIndexes\(\)/.test(app)
    && app.includes("scheduleIndividualBinderSpreadPrewarm(currentIndex)")
    && app.includes("cancelIndividualBinderSpreadPrewarm({ preserveProtectedKeys: true })")
    && app.includes("function getReadyBinderTexture(")
    && app.includes("new Set(individualBinderSpreadPrewarmKeys)")
    && app.includes("{ textureLoaded: Boolean(readyTexture) }"),
  "app does not prewarm and synchronously hydrate the individual card's binder spread",
);
assert(
  app.includes("const binderFullResolutionMeshes = new Set()")
    && app.includes("const FOCUSED_BINDER_CARD_PREWARM_DELAY_MS = 0")
    && app.includes("function getFocusedBinderSharpPositions(")
    && app.includes("function getFocusedBinderFullyVisiblePositions(")
    && app.includes("function getFocusedBinderHorizontalNeighborPosition(")
    && app.includes("if (isBinderFocused()) return new Set(getFocusedBinderSharpPositions())")
    && app.includes("...neighborEntries.map((entry) => loadEntry(entry))")
    && app.includes("function prewarmFocusedBinderSharpPositions(")
    && app.includes("function restoreBinderFullResolutionTexturesExcept(")
    && app.includes("getBinderSpreadPositionsForTurn(")
    && app.includes("getBinderMeshScreenRect(mesh, projectionCamera, canvasRect)")
    && app.includes('getCardTexture(card, { fetchPriority: "high" })')
    && app.includes("prewarmBinderFocusCandidate(event)")
    && app.includes("spreadColumn = focusedSpot.spreadColumn + horizontalDirection")
    && app.includes("await Promise.all([")
    && app.includes("binderFullResolutionMeshes.add(mesh)")
    && app.includes("for (const mesh of binderFullResolutionMeshes)"),
  "app does not immediately sharpen every fully visible card around the focused binder card",
);
assert(
  app.includes("function revealPreparedTraitPanel(openToken)")
    && app.includes("function scheduleTraitUiPrewarm(collectionId)")
    && app.includes("void els.traitPanel.offsetHeight")
    && app.includes("setTraitInfoOpen(!traitInfoOpenRequested)")
    && styles.includes("transform: translate3d(22px, -50%, 0)")
    && styles.includes("will-change: opacity, transform")
    && styles.includes("contain: layout style"),
  "trait details panel does not prepare stable geometry before its composited transition",
);
assert(
  app.includes("const SCREENSAVER_HOLD_MS = 2000")
    && app.includes("const SCREENSAVER_EXIT_BUFFER_MS = 2000")
    && app.includes("const SCREENSAVER_MAX_CARD_COUNT = MEMORY_CONSTRAINED_DEVICE ? 22 : 34")
    && app.includes("const SCREENSAVER_PREWARM_CARD_COUNT = MEMORY_CONSTRAINED_DEVICE ? 7 : 12")
    && app.includes("const SCREENSAVER_READY_CARD_COUNT = MEMORY_CONSTRAINED_DEVICE ? 8 : 16")
    && app.includes("const SCREENSAVER_ACTIVE_PREPARE_CONCURRENCY = 1")
    && app.includes("const SCREENSAVER_PREPARE_IDLE_TIMEOUT_MS = 900")
    && app.includes("const SCREENSAVER_WARMUP_TARGET_SIZE = 8")
    && app.includes("const SCREENSAVER_SPAWN_INTERVAL_MS = MEMORY_CONSTRAINED_DEVICE ? 540 : 380")
    && app.includes("const SCREENSAVER_SPAWN_INTERVAL_JITTER = 0.16")
    && app.includes("const SCREENSAVER_SPAWN_RETRY_MS = 120")
    && app.includes("const SCREENSAVER_DEPTH_MIN = -3.8")
    && app.includes("const SCREENSAVER_DEPTH_MAX = 3.8")
    && app.includes("const SCREENSAVER_DEPTH_LAYER_COUNT = 4")
    && app.includes("const SCREENSAVER_DEPTH_JITTER = 0.24")
    && app.includes("const SCREENSAVER_FALL_SPEED_JITTER = 0.04")
    && app.includes("const SCREENSAVER_SPAWN_POSITION_CANDIDATES = 40")
    && app.includes("const SCREENSAVER_SPAWN_TRAJECTORY_SAMPLE_COUNT = 7")
    && app.includes("const SCREENSAVER_SPAWN_TRAJECTORY_SAMPLE_STEP_SECONDS = 1.4")
    && app.includes("const SCREENSAVER_HORIZONTAL_CENTER_LIMIT = 0.5")
    && app.includes("const SCREENSAVER_NORMALIZED_FALL_SPEED = 0.115")
    && app.includes("const SCREENSAVER_FRONT_FACING_PROBABILITY = 0.88")
    && app.includes("const SCREENSAVER_EVIL_COLLECTION_SPAWN_WEIGHTS")
    && app.includes("poncho: 2")
    && app.includes("const SCREENSAVER_CARDNFT1_ANIMATED_SPAWN_CHANCE = 0.06")
    && app.includes("const SCREENSAVER_POINTER_ACTIVE_MS = 260")
    && app.includes("const SCREENSAVER_POINTER_FORCE = 3.75")
    && app.includes("const SCREENSAVER_POINTER_ROTATION_FORCE = 30")
    && app.includes("const SCREENSAVER_POINTER_AMBIENT_VIEWPORT_RATIO = 0.64")
    && app.includes("const SCREENSAVER_POINTER_AMBIENT_STRENGTH = 0.23")
    && app.includes("const SCREENSAVER_POINTER_WAKE_DURATION_MS = 680")
    && app.includes("const SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY = 6")
    && app.includes("const SCREENSAVER_POINTER_WAKE_FORCE_SCALE = 0.18")
    && app.includes("const SCREENSAVER_POINTER_WAKE_RADIUS_SCALE = 1.08")
    && app.includes("const SCREENSAVER_POINTER_HOVER_RAYCAST_INTERVAL_MS = 50")
    && app.includes("const SCREENSAVER_POINTER_CLICK_HALF_DIAGONAL_SCALE = 0.66")
    && app.includes("const SCREENSAVER_DIAGNOSTIC_INTERVAL_MS = 1000")
    && app.includes("const SCREENSAVER_POINTER_SELECTION_GRACE_MS = 900")
    && app.includes("const SCREENSAVER_COLLISION_RADIUS_FACTOR = 0.46")
    && app.includes("const SCREENSAVER_COLLISION_ACTIVATION_OVERSCAN = 3.2")
    && app.includes("const SCREENSAVER_PREPARE_POINTER_COOLDOWN_MS = 420")
    && app.includes("const SCREENSAVER_PREPARE_ACTIVATION_GRACE_MS = 900")
    && app.includes("const SCREENSAVER_PREPARE_MIN_IDLE_BUDGET_MS = 8")
    && app.includes("const SCREENSAVER_MAX_MOTION_DELTA_SECONDS = 1 / 60")
    && app.includes("const SCREENSAVER_DIAGNOSTICS_ENABLED = (")
    && app.includes("function initScreensaverHoldButton(")
    && app.includes("function prewarmScreensaverMode(")
    && app.includes("function addScreensaverSceneLights(")
    && app.includes("new THREE.WebGLRenderTarget(")
    && app.includes("screensaverWarmupScene.add(group)")
    && app.includes("function waitForScreensaverPreparationIdle(")
    && app.includes("function isScreensaverPointerMotionBusy(")
    && app.includes("now < screensaverPreparationBlockedUntil")
    && app.includes("screensaverLastFrameAt + SCREENSAVER_PREPARE_ACTIVATION_GRACE_MS")
    && app.includes("screensaverReadyCards.findIndex((entry) => entry.recycled)")
    && app.includes("count + (entry.recycled ? 0 : 1)")
    && app.includes("recycled: true")
    && app.includes("deadline.timeRemaining() < SCREENSAVER_PREPARE_MIN_IDLE_BUDGET_MS")
    && app.includes("function warmScreensaverCardGpuResources(")
    && app.includes("screensaverRenderer.setRenderTarget(screensaverWarmupTarget)")
    && app.includes("function takeScreensaverCardNft1AnimatedIndex(")
    && app.includes("screensaverCardNft1AnimatedIndexes")
    && app.includes("screensaverOverlay.dataset.cardNft1AnimatedSpawnChance")
    && app.includes("screensaverOverlay.dataset.cardNft1AnimatedPool")
    && app.includes("function activateScreensaverMode(")
    && app.includes("function deactivateScreensaverMode(")
    && app.includes("function requestScreensaverFullscreen(")
    && app.includes("function exitScreensaverFullscreen(")
    && app.includes("document.fullscreenElement || document.webkitFullscreenElement")
    && app.includes("const fullscreenPromise = requestScreensaverFullscreen()")
    && app.includes("function waitForScreensaverViewportSettle()")
    && app.includes("void exitScreensaverFullscreen()")
    && app.includes("function animateScreensaver(")
    && app.includes("SCREENSAVER_MAX_MOTION_DELTA_SECONDS,")
    && app.includes("return usesEvilBinderPresentation()")
    && app.includes('? ["cardnft1", "cardnft2", "poncho"]')
    && app.includes("prepareIndividualCardFor3D(card)")
    && app.includes("createCardSwapGroup(")
    && app.includes("function makeScreensaverCardGroupSolid(")
    && app.includes("material.depthTest = true")
    && app.includes("material.depthWrite = true")
    && app.includes("group.userData.screensaverEffectActivity = 1")
    && app.includes("function getScreensaverVisibleWorldSize(depth = 0)")
    && app.includes("screensaverNextSpawnAt = now + getNextScreensaverSpawnInterval()")
    && app.includes("function getNextScreensaverSpawnInterval(")
    && app.includes("function takeScreensaverSpawnTrack(")
    && app.includes("function refillScreensaverSpawnTrackBag(")
    && app.includes("function chooseScreensaverSpawnPosition(")
    && app.includes("arrivalSeconds: scheduledLeadSeconds")
    && app.includes("sampleIndex < SCREENSAVER_SPAWN_TRAJECTORY_SAMPLE_COUNT")
    && app.includes("blocker.positionY - blocker.speed * sampleSeconds")
    && app.includes("blockerMaximumOverlap")
    && app.includes("const crowdingPenalty = recentScreenXs.reduce(")
    && app.includes("if (maximumOverlap > SCREENSAVER_SPAWN_MAX_OVERLAP) continue")
    && app.includes("recentScreenXs.map((screenX) => Math.abs(candidate - screenX))")
    && app.includes("function handleScreensaverPointerMove(")
    && app.includes("function getScreensaverPointerForceFrame(")
    && app.includes("function applyScreensaverPointerForce(")
    && app.includes("function applyScreensaverPointerSampleForce(")
    && app.includes("function getActiveScreensaverPointerWakeCount(")
    && app.includes("function recordScreensaverPointerWake(")
    && app.includes("function processScreensaverPointerInput(")
    && app.includes("screensaverPointerInputPending = true")
    && app.includes("sample.frameFreshness = Math.pow(")
    && app.includes("const screensaverPointerForceFrame = {")
    && app.includes("const screensaverViewportRect = {")
    && app.includes("rect.ambientRadius")
    && app.includes("entry.pointerWorldPerPixelX")
    && app.includes("screensaverOverlay.dataset.activeWakeSamples")
    && app.includes("function updateScreensaverCardMomentum(")
    && app.includes("function updateScreensaverCollisionFrame(")
    && !app.includes("function resolveScreensaverCardCollisions(")
    && !app.includes("first.velocityX += direction * impulse")
    && !app.includes("first.velocityY += direction * impulse")
    && screensaverHorizontalImpulseCount === 1
    && app.includes("entry.pointerInfluence = pointerProgress")
    && !app.includes("collisionCorrectionX")
    && app.includes("const linearDamping = Math.exp(")
    && app.includes("const rotationDamping = Math.exp(")
    && app.includes("now >= screensaverDiagnosticsNextAt")
    && app.includes("function flushScreensaverCardDiagnostics(")
    && app.includes("screensaverNextSpawnAt = now + SCREENSAVER_SPAWN_RETRY_MS")
    && app.includes("function suppressScreensaverTooltips(")
    && app.includes("function restoreScreensaverTooltips(")
    && app.includes('attributeFilter: ["title"]')
    && app.includes("suppressScreensaverTooltips();")
    && app.includes("restoreScreensaverTooltips();")
    && app.includes("function getScreensaverCardEntryAtPoint(")
    && app.includes("function getRecentScreensaverHoveredCardEntry(")
    && app.includes("function updateScreensaverPointerHoverIfNeeded(")
    && app.includes("function updateScreensaverPointerHoverAt(")
    && app.includes("if (previousHoveredCardIndex === screensaverHoveredCardIndex) return")
    && app.includes("function setScreensaverCtrlSelectionActive(")
    && app.includes("function handleScreensaverControlKeyUp(")
    && app.includes('event.key === "Control"')
    && app.includes("screensaverCtrlSelectionActive || event.ctrlKey")
    && app.includes('document.addEventListener("keyup", handleScreensaverControlKeyUp')
    && app.includes("screensaverCtrlSelectionActive")
    && app.includes("screensaverPointerWakeCount = 0")
    && app.includes("if (ctrlSelecting && !selectedEntry)")
    && app.includes("function openScreensaverCardInIndividualView(")
    && app.includes("const screensaverRaycastMeshScratch = []")
    && app.includes("group.userData.screensaverEntry = entry")
    && app.includes("screensaverRaycaster.intersectObjects(cardFaceMeshes, false)")
    && app.includes("if (refreshMatrices) {")
    && app.includes("function getScreensaverEntryFromObject(")
    && app.includes("const hitEntry = getScreensaverEntryFromObject(hit.object)")
    && app.includes("function getScreensaverCardEntryAtProjectedPoint(")
    && app.includes("const hoveredEntry = getScreensaverCardEntryAtProjectedPoint(clientX, clientY)")
    && app.includes("? getScreensaverCardEntryAtProjectedPoint(clientX, clientY)")
    && app.includes("selectedCardIndex: selectedEntry?.index")
    && app.includes("&& !selectedEntry")
    && app.includes("screensaverOverlay.dataset.selectedCardPath = window.location.pathname")
    && app.includes('historyMode: "push"')
    && app.includes('event.type !== "pointerdown" && event.type !== "keydown"')
    && app.includes('document.addEventListener("pointermove", handleScreensaverPointerMove')
    && !app.includes('document.addEventListener("pointermove", handleScreensaverActivity')
    && !app.includes('document.addEventListener("wheel", handleScreensaverActivity')
    && !app.includes("driftAmplitude")
    && !app.includes("driftSpeed")
    && app.includes("const frontFacing = Math.random() < SCREENSAVER_FRONT_FACING_PROBABILITY")
    && app.includes("entry.group.rotation.y = naturalRotationY + entry.rotationOffsetY")
    && app.includes("function refillScreensaverCollectionPickBag(")
    && app.includes('screensaverOverlay.dataset.collectionSampling = collectionIds.length > 1 ? "weighted" : "active"')
    && app.includes('screensaverOverlay.dataset.ponchoSpawnShare = (')
    && app.includes("updateAnimatedTextureRecords(getScreensaverAnimatedTextureRecords())")
    && app.includes("const records = screensaverAnimatedTextureRecordScratch")
    && app.includes("function recordScreensaverFrameTiming(")
    && app.includes("screensaverOverlay.dataset.averageFrameMs")
    && app.includes("screensaverOverlay.dataset.readyCards")
    && app.includes("screensaverOverlay.dataset.animatedCards")
    && app.includes("for (const entry of [...screensaverCards, ...screensaverReadyCards])")
    && styles.includes(".icon-button.is-screensaver-hold")
    && styles.includes("animation: card-rain-hold-progress 2000ms linear forwards")
    && styles.includes(".card-rain-screensaver.is-visible")
    && styles.includes("body.screensaver-mode >")
    && styles.includes('body.screensaver-mode [role="tooltip"]'),
  "app does not include the prewarmed hold-to-activate 3D card-rain screensaver",
);
assert(
  app.includes('event.animationName !== "binder-first-page-hold-expand"')
    && app.includes("function confirmBinderFirstPageHold()")
    && app.includes("function returnBinderToFirstInsidePageFromHold()")
    && /function returnBinderToFirstInsidePageFromHold\(\)\s*\{[\s\S]{0,900}binderSinglePageSide = 0;[\s\S]{0,300}binderTargetTurn = 0;[\s\S]{0,80}binderTurn = 0;[\s\S]{0,80}binderTargetClosure = 0;[\s\S]{0,80}binderClosure = 0;/.test(app)
    && styles.includes("animation: binder-first-page-hold-expand 1500ms linear forwards"),
  "binder first-page hold does not confirm with its visual animation and return to the first inside spread",
);
assert(
  app.includes("function usesEvilBinderPresentation()")
    && app.includes('return !WALLET_ROUTE_ADDRESS && ACTIVE_COLLECTION?.introGroup === "evil"')
    && app.includes("function drawWalletBinderIntroNote(")
    && app.includes("normalizeBinderCoverSettings(walletRouteProfile?.cover)")
    && app.includes("if (!settings.insideText)")
    && /function createEvilBinderTableSet\(\)[\s\S]{0,360}!usesEvilBinderPresentation\(\)/.test(app)
    && /function createBinderFrontCoverEmblem\([\s\S]{0,420}!WALLET_ROUTE_ADDRESS/.test(app)
    && /function createBinderIntroSpriteMeshes\([^)]*\)\s*\{[\s\S]{0,100}!usesEvilBinderPresentation\(\)/.test(app)
    && /function getScreensaverCardIndexes\(\)[\s\S]{0,320}indexes: \(walletFilterCardIndexes \|\| \[\]\)\.slice\(\)/.test(app),
  "wallet binders still inherit Evil Biscuit cover, table, intro, or screensaver presentation",
);
assert(
  app.includes("function updateBinderShellTransforms()")
    && app.includes("BINDER_COVER_SPINE_SEGMENTS")
    && app.includes("BINDER_COVER_SPINE_WIDTH")
    && app.includes("BINDER_CLOSED_COVER_CENTER_X")
    && app.includes("function createBinderCoverPanelGeometry(")
    && app.includes("function setBinderIntroCoverLayer(active)")
    && app.includes("function updateBinderRootHorizontalCentering(")
    && app.includes("function handleBinderClosureNavigation(direction)")
    && app.includes("function beginBinderOuterFlip(direction)")
    && app.includes("function beginBinderOuterFlipDrag(direction)")
    && app.includes("function applyBinderOuterFlipProgress(state, progress)")
    && app.includes("const BINDER_TABLE_OUTER_FLIP_LIFT = BINDER_CLOSED_COVER_CENTER_X + 0.08")
    && app.includes("tableView: binderTableViewTarget > 0.5")
    && app.includes("? BINDER_TABLE_OUTER_FLIP_LIFT")
    && app.includes("function getBinderDragNavigationMode(drag, pageDelta)")
    && app.includes("function createBinderLoadingRing(card, side, binderPosition)")
    && app.includes("function updateBinderLoadingRings(")
    && app.includes("BINDER_LOADING_RING_IDLE_MS")
    && app.includes("BINDER_TEXTURE_TARGET_PRIORITY")
    && app.includes("function prioritizeBinderTargetTextureWork(")
    && app.includes("function shouldYieldBinderTextureToTarget(position)")
    && app.includes("allowTurn: urgent,")
    && !app.includes("allowTurn: urgent && !forApply")
    && app.includes("binderTextureActiveTasks")
    && app.includes("await preloadCollectionBackTextures(ACTIVE_COLLECTION_ID)")
    && app.includes("function preloadAllConfiguredBackTextures()")
    && app.includes("function getCachedBackTexture(card = null)")
    && app.includes("function warmCachedBinderBackTextures()")
    && app.includes("addTurnCoverage(binderTurn)")
    && app.includes("addTurnCoverage(binderTargetTurn)")
    && app.includes("loadBackTextures: false")
    && app.includes("function updateBinderOuterFlip(")
    && app.includes("const physicalAngle = Math.PI * state.progress")
    && app.includes("const rotationDirection = -state.direction")
    && app.includes("function getBinderVirtualTurn(")
    && app.includes("binderTargetClosure: getBinderTargetClosedSide()")
    && app.includes("function createBinderTable()")
    && app.includes("table-wood-seamless.png?v=table-wood-1")
    && app.includes("table-wood-light-seamless.png?v=table-wood-light-1")
    && app.includes("texture.wrapS = THREE.MirroredRepeatWrapping")
    && app.includes("texture.wrapT = THREE.MirroredRepeatWrapping")
    && app.includes("BINDER_TABLE_SURFACE_REPEAT_X")
    && app.includes("BINDER_TABLE_SURFACE_REPEAT_Y")
    && app.includes("texture.minFilter = THREE.LinearMipmapLinearFilter")
    && app.includes("texture.anisotropy = Math.min(")
    && app.includes("function ensureBinderTableSurfaceTextures()")
    && app.includes("function loadBinderTableSurfaceTexture(url)")
    && app.includes("function updateBinderTableSurfaceTheme(")
    && app.includes('binderTableSurfaceTextures.set("dark", darkTexture)')
    && app.includes('binderTableSurfaceTextures.set("light", lightTexture)')
    && app.includes("updateBinderTableSurfaceTheme(isLight)")
    && app.includes("table-white-mesh.glb?v=table-model-1")
    && app.includes("table-display/squishy.glb?v=table-display-1")
    && app.includes("table-display/angelgotchi.glb?v=table-display-1")
    && app.includes('id: "omom"')
    && app.includes('id: "squishy"')
    && app.includes("yawOffset: Math.PI / 2 - THREE.MathUtils.degToRad(35)")
    && app.includes('id: "angelgotchi"')
    && app.includes("pitchOffset: -Math.PI / 2")
    && app.includes("scaleMultiplier: 1.24")
    && app.includes("positionYOffset: -0.14")
    && app.includes("table-swag-coin.png?v=table-coin-1")
    && app.includes("function createBinderTableAccessories()")
    && app.includes("function createBinderTableDieGeometry(size)")
    && app.includes("function createBinderTableDie({")
    && app.includes("function addBinderTableDieFacePips(")
    && app.includes("function getRandomBinderTableDieFace(")
    && app.includes("function beginBinderTableDieToss(index)")
    && app.includes("function updateBinderTableDice(")
    && app.includes("function handleBinderTableDieTap(event)")
    && app.includes("function ensureBinderTableAccessories()")
    && app.includes("function updateBinderTableAccessoryVisibility(")
    && app.includes("new THREE.CylinderGeometry(")
    && app.includes("new THREE.CircleGeometry(BINDER_TABLE_COIN_RADIUS - 0.018, 64)")
    && app.includes('coinFace.name = "binder-table-swag-coin-face"')
    && app.includes("const BINDER_TABLE_COIN_RADIUS = 0.45")
    && app.includes("const BINDER_TABLE_COIN_THICKNESS = 0.063")
    && app.includes("const BINDER_TABLE_COIN_X = -4.88")
    && app.includes("const BINDER_TABLE_COIN_ROTATION = THREE.MathUtils.degToRad(-217)")
    && app.includes("const BINDER_TABLE_COIN_Y = 2.43")
    && app.includes("surfaceZ + BINDER_TABLE_COIN_THICKNESS / 2")
    && app.includes("const BINDER_TABLE_DIE_SIZE = 0.36")
    && app.includes("const BINDER_TABLE_DIE_TOSS_DURATION_MS = 920")
    && app.includes("toneMapped: false")
    && app.includes("coinGlazeMaterial.userData.tableAccessoryMaxOpacity = 0.14")
    && app.includes("new THREE.TorusGeometry(")
    && app.includes("color: 0xb91f27")
    && app.includes("color: 0xffffff")
    && app.includes("alphaHash: true")
    && app.includes("Math.random() * Math.PI * 2")
    && app.includes("void ensureBinderTableAccessories();")
    && app.includes("tableAccessoryFadeActive")
    && app.includes("function ensureBinderTableDisplayModel()")
    && app.includes("loader.setDRACOLoader(dracoLoader)")
    && app.includes("dracoLoader.setDecoderPath(INDIVIDUAL_CARD_DRACO_DECODER_PATH)")
    && app.includes("function createBinderTableDisplayModelEntry(")
    && app.includes("function preserveBinderTableDisplayModelMaterials(")
    && app.includes("async function warmBinderTableDisplayModelEntries(entries)")
    && app.includes('typeof binderRenderer.initTexture !== "function"')
    && app.includes("await binderRenderer.compileAsync(binderScene, binderCamera)")
    && app.includes("binderRenderer.getContext()?.finish?.()")
    && app.includes("entry.root.visible = true")
    && app.includes("material.transparent = true")
    && app.includes("material.depthWrite = true")
    && app.includes('usesResinMaterial: spec.materialProfile === "blue-resin"')
    && app.includes("-placedBounds.min.z")
    && app.includes("function cycleBinderTableDisplayModel()")
    && app.includes("function getBinderTableDisplayModelHit(")
    && app.includes("function handleBinderTableDisplayModelTap(")
    && app.includes("if (handleBinderTableDisplayModelTap(event)) return")
    && app.includes("|| getBinderTableDisplayModelHit(event)")
    && app.includes("./vendor/GLTFLoader.js?v=three-r165-gltf-1")
    && app.includes("child.geometry.computeVertexNormals()")
    && app.includes("uprightRoot.rotation.x = Math.PI / 2")
    && app.includes("const BINDER_TABLE_DISPLAY_MODEL_HEIGHT = 1.04")
    && app.includes("const BINDER_TABLE_DISPLAY_MODEL_X = -3.1")
    && app.includes("const BINDER_TABLE_DISPLAY_MODEL_Y = 2.78")
    && app.includes("const localCorrection = worldCorrection.applyQuaternion(")
    && app.includes("model.position.add(localCorrection)")
    && app.includes("THREE.MathUtils.degToRad(28)")
    && app.includes("const BINDER_TABLE_DISPLAY_MODEL_MAX_OPACITY = 0.76")
    && app.includes("new THREE.MeshPhysicalMaterial({")
    && app.includes("color: 0x8babe2")
    && app.includes("clearcoat: 0.92")
    && app.includes("specularColor: 0xeaf2ff")
    && app.includes("material.forceSinglePass = true")
    && app.includes("child.renderOrder = -70")
    && app.includes("material.opacity = baseOpacity * BINDER_TABLE_DISPLAY_MODEL_MAX_OPACITY * opacity")
    && app.includes("material.opacity = baseOpacity * opacity")
    && app.includes("return opacity > 0.001 && revealProgress < 1")
    && app.includes("function updateBinderTableDisplayModelVisibility(")
    && app.includes("BINDER_TABLE_DISPLAY_MODEL_REVEAL_DURATION_MS")
    && !app.includes("BINDER_TABLE_DISPLAY_MODEL_SHADOW_OPACITY")
    && !app.includes('binder-table-display-model-shadow')
    && app.includes("root.visible = tableOpacity > 0.001")
    && app.includes("tableDisplayModelFadeActive")
    && app.includes("void ensureBinderTableSurfaceTextures();")
    && app.includes("void ensureBinderTableDisplayModel();")
    && app.includes("function setBinderTableView(")
    && app.includes("binderTableView: binderTableViewTarget > 0.5")
    && app.includes("const restoreTableView = Boolean(state.binderTableView)")
    && app.includes("setBinderTableView(restoreTableView, { immediate: true, updateControls: false })")
    && app.includes("function updateBinderTableViewAnimation(")
    && app.includes("function applyBinderTableViewProgress()")
    && app.includes("function applyBinderTableCoverVisibility(")
    && app.includes("const BINDER_TO_TABLE_WHEEL_THRESHOLD = INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD")
    && app.includes("function addBinderTableWheelOutDistance(")
    && app.includes("setBinderTableView(true);")
    && app.includes("const BINDER_TABLE_TO_FOCUS_DURATION_MS = 420")
    && app.includes("durationMs: BINDER_TABLE_TO_FOCUS_DURATION_MS")
    && app.includes('easing: "out"')
    && app.includes("const EVIL_BINDER_TABLE_SIDE_COLLECTIONS")
    && app.includes('cardnft1: ["cardnft2", "poncho"]')
    && app.includes('cardnft2: ["cardnft1", "poncho"]')
    && app.includes('poncho: ["cardnft1", "cardnft2"]')
    && app.includes("function createEvilBinderTableSet(")
    && app.includes("function createEvilBinderTableProxy(")
    && app.includes("function createBinderCoverShellModel(")
    && app.includes("applyBinderShellClosureGeometry(shellState, -1)")
    && app.includes("shell.position.x = -BINDER_CLOSED_COVER_CENTER_X")
    && app.includes("function getSwappedEvilBinderTableCollectionOrder(")
    && app.includes("nextCollectionOrder: getSwappedEvilBinderTableCollectionOrder(collectionId)")
    && app.includes("evilBinderTableCollectionOrder: binderEvilTableCollectionOrder.slice()")
    && app.includes("function beginEvilBinderTableSwap(")
    && app.includes("function updateEvilBinderTableSwap(")
    && app.includes("function commitActiveEvilBinderCollection(")
    && app.includes("prepareBinder: false")
    && app.includes("if (prepareBinder) initBinderScene()")
    && app.includes("if (prepareBinder) {")
    && app.includes("function openClosedTableBinderFromPointer(")
    && app.includes("binderCanvas.addEventListener(\"dblclick\", handleBinderCanvasDoubleClick)")
    && app.includes("coverEmblemScale: 0.78")
    && app.includes('COLLECTION_CONFIGS[collectionId]?.introGroup === "evil"')
    && app.includes("function getBinderFrontCoverEmblemYRatio(")
    && !app.includes("const swapOpacity = isUnselected")
    && app.includes("window.history.pushState(")
    && app.includes("function handleEvilBinderHistoryNavigation(")
    && app.includes("collectionPromise: Promise.all([")
    && !app.includes("function navigateToEvilBinderTableCollection(")
    && app.includes("&& !binderEvilTableSwapState")
    && app.includes("cardnft1-logo-cover.webp?v=cardnft1-cover-1")
    && app.includes("poncho-drifella-cover.webp?v=poncho-cover-1")
    && app.includes("const BINDER_COVER_THICKNESS = 0.09")
    && app.includes("const BINDER_TABLE_RING_DEPTH_SCALE = 0.68")
    && app.includes("const BINDER_RING_VISIBLE_ARC = Math.PI")
    && app.includes("new THREE.MeshStandardMaterial({")
    && app.includes("BINDER_RING_VISIBLE_ARC,")
    && app.includes("const ringOpacity = hardwareOpacity * hardwareOpacity")
    && app.includes("if (isBinderTableViewActive()) return focusBinderIntroNote();")
    && app.includes("const BINDER_GAP_REVEAL_STACK_GAP = BINDER_VISIBLE_STACK_GAP")
    && app.includes("const tableSeamZ = binderShellState.coverZ")
    && app.includes("binderActivePlacementRoot.add(binderRoot)")
    && app.includes("const tableViewActive = updateBinderTableViewAnimation(now)"),
  "app does not include the shared curved-spine binder closure and table-view runtime",
);

const originalThreePath = path.join(ROOT, "vendor", "three.module.js");
const optimizedThreePath = path.join(ROOT, "vendor", "three.module.min.js");
const [originalThreeStat, optimizedThreeStat, optimizedThreeSource, optimizedThree] = await Promise.all([
  stat(originalThreePath),
  stat(optimizedThreePath),
  readFile(optimizedThreePath, "utf8"),
  import(new URL("../vendor/three.module.min.js", import.meta.url)),
]);
assert(optimizedThree.REVISION === "165", "optimized Three.js revision differs");
assert(typeof optimizedThree.WebGLRenderer === "function", "optimized Three.js exports are invalid");
assert(optimizedThreeSource.includes("@license"), "optimized Three.js license banner is missing");
assert(
  optimizedThreeStat.size < originalThreeStat.size * 0.6,
  "optimized Three.js runtime is unexpectedly large",
);

await verifyPage({
  pagePath: "index.html",
  prefix: "./",
  dataFile: "cardnft2-data.js?v=cardnft2-3",
});
await verifyPage({
  pagePath: "cardnft1/index.html",
  prefix: "../",
  dataFile: "cardnft-data.js?v=cardnft1-1",
});
await verifyPage({
  pagePath: "poncho/index.html",
  prefix: "../",
  dataFile: "poncho-data.js?v=poncho-4",
});
await verifyPage({
  pagePath: "clear/index.html",
  prefix: "../",
  dataFile: "clear-data.js?v=clear-8",
});
for (const collection of COMMUNITY_COLLECTIONS) {
  await verifyPage({
    pagePath: `${collection.route}/index.html`,
    prefix: "../",
    dataFile: `${collection.id}-data.js?v=${DATA_REVISIONS[collection.id]}`,
  });
}

console.log(
  `Verified optimized browser runtime: ${TRAIT_SPECS.length} packed trait sets and `
  + `${COMMUNITY_COLLECTIONS.length + 4} binder routes.`,
);

async function verifyPage({ pagePath, prefix, dataFile }) {
  const page = await readFile(path.join(ROOT, pagePath), "utf8");
  const importMapIndex = page.indexOf('<script type="importmap">');
  const preloadIndex = page.indexOf('rel="modulepreload"');
  assert(importMapIndex >= 0 && preloadIndex > importMapIndex, `${pagePath} preloads precede its import map`);
  for (const value of [
    `${prefix}styles.css?v=${STYLE_VERSION}`,
    `${prefix}app.js?v=${APP_VERSION}`,
    `${prefix}wallet-auth.js?v=wallet-auth-5`,
    `${prefix}swag-pack-stickers.js?v=swag-pack-transparent-1`,
    `${prefix}vendor/three.module.min.js?v=${THREE_VERSION}`,
    `${prefix}browser-traits-catalog.js?v=browser-traits-9`,
    `${prefix}${dataFile}`,
    'id="binderTableViewButton"',
    'id="walletConnectButton"',
    'id="walletConnectButtonLabel"',
    'id="walletProviderList"',
    'id="walletConnectStatus"',
    'id="walletSignOutButton"',
    'class="wallet-search-divider"',
    'id="binderOrderEditButton"',
    'id="binderOrderEditor"',
    'id="binderOrderDialog"',
    'id="binderOrderCloseButton"',
    'id="binderOrderScroller"',
    'id="binderOrderPages"',
    'id="binderOrderStatus"',
    'id="binderOrderConfirmButton"',
    'id="binderTradeModeButton"',
    'id="binderCoverModeButton"',
    'id="binderCoverEditor"',
    'id="binderFrontCoverPreview"',
    'id="binderFrontCoverUpload"',
    'id="binderFrontCoverZoom"',
    'id="binderFrontCoverRotation"',
    'id="binderFrontTextBox"',
    'id="binderFrontTextInput"',
    'id="binderFrontTextRotation"',
    'id="binderBackCoverPreview"',
    'id="binderBackCoverUpload"',
    'id="binderBackCoverZoom"',
    'id="binderBackCoverRotation"',
    'id="binderBackTextBox"',
    'id="binderBackTextInput"',
    'id="binderBackTextRotation"',
    'id="binderInsideCoverPreview"',
    'id="binderInsideTextBox"',
    'id="binderInsideFontSize"',
    'id="binderInsideTextRotation"',
    'id="binderInsideTextInput"',
    'id="binderInsideLinkUrl"',
    'id="binderInsideLinkApply"',
    'id="binderInsideLinkPopover"',
    'id="binderInsideLinkRemove"',
    'id="binderBaseColor"',
    'id="binderCoverTextColor"',
    'data-sticker-surface="front"',
    'data-sticker-surface="back"',
    'data-sticker-surface="inside"',
    'id="binderStickerPicker"',
    'id="binderStickerPickerClose"',
    'id="binderStickerPickerStatus"',
    'id="binderStickerPickerGallery"',
    '<h2 id="binderOrderTitle">Customize Binder</h2>',
    'class="binder-order-instructions binder-order-assistive"',
    'class="binder-order-status binder-order-assistive"',
  ]) {
    assert(page.includes(value), `${pagePath} is missing ${value}`);
  }
  assert(!page.includes("binder-order-kicker"), `${pagePath} still shows the binder editor kicker`);
  assert(!page.includes("binder-cover-sticker-size"), `${pagePath} still shows the old sticker size slider`);
  assert(!page.includes("binder-cover-sticker-rotation"), `${pagePath} still shows the old sticker rotation slider`);
  assert(!page.includes("binder-cover-remove-sticker"), `${pagePath} still shows the old sticker remove button`);
  assert(!page.includes("binder-cover-link-controls"), `${pagePath} still shows link controls as a separate row`);
  assert(!page.includes("Edit card order"), `${pagePath} has the old binder editor title`);
  assert(
    /id="traitSortSelect"[^>]*>[\s\S]*?<option value="marked-for-trade">marked for trade<\/option>[\s\S]*?<option value="listed-first">listed<\/option>[\s\S]*?<option value="all">default<\/option>/.test(page),
    `${pagePath} does not put marked-for-trade and listed before default`,
  );
  assert(
    /id="walletSearchButton"[\s\S]{0,260}<circle cx="12" cy="7\.5" r="4\.5"><\/circle>[\s\S]{0,120}<path d="M4 20a8 8 0 0 1 16 0"><\/path>/.test(page),
    `${pagePath} is missing the wallet user icon`,
  );
  assert(
    /id="galleryViewToggleButton"[\s\S]{0,700}gallery-view-grid-icon[\s\S]{0,700}gallery-view-binder-icon/.test(page),
    `${pagePath} is missing the simple gallery icon swap`,
  );
  if (pagePath === "index.html") {
    assert(
      page.includes('<link rel="preconnect" href="https://cdn.lil.org" crossorigin>'),
      "Card NFT 2 page does not preconnect its super-rare texture origin",
    );
  }
}

function getSourceTraitPairs(record, categories) {
  if (Array.isArray(record?.entries)) {
    return record.entries
      .map((entry) => [
        String(entry?.category ?? "").trim(),
        String(entry?.value ?? "").trim(),
      ])
      .filter(([category, value]) => categories.includes(category) && value);
  }

  return (record?.values || [])
    .map((value, categoryIndex) => [
      String(categories[categoryIndex] ?? "").trim(),
      String(value ?? "").trim(),
    ])
    .filter(([category, value]) => category && value);
}

function getPackedTraitPairs(row, categories, dictionary) {
  const pairs = [];
  for (let offset = 0; offset + 1 < row.length; offset += 2) {
    pairs.push([
      String(categories[row[offset]] ?? "").trim(),
      String(dictionary[row[offset + 1]] ?? "").trim(),
    ]);
  }
  return pairs;
}

function assertJsonEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), message);
}

function collapseIntegerRanges(values) {
  const ranges = [];
  for (const value of values) {
    const last = ranges.at(-1);
    if (!last || value !== last[1] + 1) {
      ranges.push([value, value]);
    } else {
      last[1] = value;
    }
  }
  return ranges;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
