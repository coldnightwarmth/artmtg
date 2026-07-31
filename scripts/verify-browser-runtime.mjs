import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { BROWSER_TRAIT_CATALOG } from "../browser-traits-catalog.js";
import { COMMUNITY_COLLECTIONS } from "./community-collections.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP_VERSION = "cardnft-321";
const STYLE_VERSION = "cardnft-131";
const THREE_VERSION = "three-r165-min-1";

const TRAIT_SPECS = [
  ["cardnft1", "cardnft-traits.js", "CARD_NFT_TRAIT_CATEGORIES", "CARD_NFT_TRAITS"],
  ["cardnft2", "cardnft2-traits.js", "CARD_NFT_2_TRAIT_CATEGORIES", "CARD_NFT_2_TRAITS"],
  ["poncho", "poncho-traits.js", "PONCHO_TRAIT_CATEGORIES", "PONCHO_TRAITS"],
  ["limited", "limited-traits.js", "LIMITED_TRAIT_CATEGORIES", "LIMITED_TRAITS"],
  ["cloudcastle", "cloudcastle-traits.js", "CLOUDCASTLE_TRAIT_CATEGORIES", "CLOUDCASTLE_TRAITS"],
  ["badhand", "badhand-traits.js", "BADHAND_TRAIT_CATEGORIES", "BADHAND_TRAITS"],
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
  cloudcastle: "community-2",
  badhand: "community-2",
  jpegs: "community-7",
  nolegs: "community-4",
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
const screensaverHorizontalImpulseCount = (
  app.match(/entry\.velocityX \+=/g) || []
).length;
const [
  cardNft1CoverStat,
  ponchoCoverStat,
  tableDisplayModelStat,
  lightTableTextureStat,
  tableCoinTextureStat,
] = await Promise.all([
  stat(path.join(ROOT, "assets", "ui", "cardnft1-logo-cover.webp")),
  stat(path.join(ROOT, "assets", "ui", "poncho-drifella-cover.webp")),
  stat(path.join(ROOT, "assets", "models", "table-white-mesh.glb")),
  stat(path.join(ROOT, "assets", "ui", "table-wood-light-seamless.png")),
  stat(path.join(ROOT, "assets", "ui", "table-swag-coin.png")),
]);
assert(cardNft1CoverStat.size < 60_000, "Card NFT 1 cover emblem is unexpectedly large");
assert(ponchoCoverStat.size < 120_000, "Poncho cover emblem is unexpectedly large");
assert(tableDisplayModelStat.size < 100_000, "Table display model is unexpectedly large");
assert(lightTableTextureStat.size < 320_000, "Light table texture is unexpectedly large");
assert(tableCoinTextureStat.size < 230_000, "Table coin texture is unexpectedly large");
assert(
  app.includes("const COLLECTION_DATA_SPECS")
    && app.includes("await import(INITIAL_COLLECTION_DATA_SPEC.module)")
    && !/from\s+["'][^"']+-data\.js/.test(app),
  "app does not lazy-load route collection data",
);
assert(
  app.includes("ensureCollectionTraits")
    && app.includes("browser-traits-catalog.js?v=browser-traits-5"),
  "app does not lazy-load packed browser traits",
);
assert(
  app.includes("function updateCardEffectMaterialBlending(")
    && app.includes('mesh.userData.cardEffectLayer = "shine"')
    && app.includes('mesh.userData.cardEffectLayer = "glare"')
    && app.includes("engravingAlpha = maskSample.a")
    && app.includes("CARD_NFT_2_SUPER_RARE_RANGES")
    && app.includes("function isCardNft2SuperRare(")
    && app.includes("https://cdn.lil.org/nft/card_nft_2")
    && /function getCardEffectUniformActivity\([^)]*\)\s*\{[\s\S]{0,180}CARD_EFFECT_MODE_CARD_NFT_2_RARE_HOLO_V[\s\S]{0,80}return 1;/.test(app)
    && app.includes("applyCardEffectProfile(CARDS[currentIndex], cardApplyToken)")
    && !app.includes('import { CARD_NFT_2_COMMON_IDS }'),
  "app does not scope the Card NFT 2 alpha-mask shader to metadata super rares",
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
    && app.includes("if (uUseEffectTextures > 0.001)")
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
    && /function getCardEffectUniformActivity\([^)]*\)\s*\{[\s\S]{0,180}return 1;[\s\S]{0,100}cardGlossActivity \* cardShuffleGlossOpacity/.test(app)
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
    && app.includes('return ACTIVE_COLLECTION?.introGroup === "evil"')
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
    && app.includes("function closeBinderToFrontCoverFromHold()")
    && app.includes("setBinderClosureTarget(-1)")
    && /function closeBinderToFrontCoverFromHold\(\)\s*\{[\s\S]{0,900}binderTargetTurn = 0;[\s\S]{0,80}binderTurn = 0;/.test(app)
    && styles.includes("animation: binder-first-page-hold-expand 1500ms linear forwards"),
  "binder first-page hold does not confirm with its visual animation and close to the front cover",
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
    && app.includes("const BINDER_TABLE_COIN_RADIUS = 0.5")
    && app.includes("const BINDER_TABLE_COIN_ROTATION = THREE.MathUtils.degToRad(-217)")
    && app.includes("const BINDER_TABLE_COIN_Y = 2.43")
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
    && app.includes("./vendor/GLTFLoader.js?v=three-r165-gltf-1")
    && app.includes("child.geometry.computeVertexNormals()")
    && app.includes("uprightRoot.rotation.x = Math.PI / 2")
    && app.includes("const BINDER_TABLE_DISPLAY_MODEL_HEIGHT = 1.16")
    && app.includes("const BINDER_TABLE_DISPLAY_MODEL_X = -3.1")
    && app.includes("THREE.MathUtils.degToRad(28)")
    && app.includes("const BINDER_TABLE_DISPLAY_MODEL_MAX_OPACITY = 0.76")
    && app.includes("new THREE.MeshPhysicalMaterial({")
    && app.includes("color: 0x8babe2")
    && app.includes("clearcoat: 0.92")
    && app.includes("specularColor: 0xeaf2ff")
    && app.includes("material.forceSinglePass = true")
    && app.includes("child.renderOrder = -70")
    && app.includes("material.opacity = BINDER_TABLE_DISPLAY_MODEL_MAX_OPACITY * opacity")
    && app.includes("function updateBinderTableDisplayModelVisibility(")
    && app.includes("BINDER_TABLE_DISPLAY_MODEL_REVEAL_DURATION_MS")
    && app.includes("BINDER_TABLE_DISPLAY_MODEL_SHADOW_OPACITY")
    && app.includes("tableDisplayModelFadeActive")
    && app.includes("void ensureBinderTableSurfaceTextures();")
    && app.includes("void ensureBinderTableDisplayModel();")
    && app.includes("function setBinderTableView(")
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
  dataFile: "cardnft2-data.js?v=cardnft2-2",
});
await verifyPage({
  pagePath: "cardnft1/index.html",
  prefix: "../",
  dataFile: "cardnft-data.js?v=cardnft1-1",
});
await verifyPage({
  pagePath: "poncho/index.html",
  prefix: "../",
  dataFile: "poncho-data.js?v=poncho-3",
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
  + `${COMMUNITY_COLLECTIONS.length + 3} binder routes.`,
);

async function verifyPage({ pagePath, prefix, dataFile }) {
  const page = await readFile(path.join(ROOT, pagePath), "utf8");
  const importMapIndex = page.indexOf('<script type="importmap">');
  const preloadIndex = page.indexOf('rel="modulepreload"');
  assert(importMapIndex >= 0 && preloadIndex > importMapIndex, `${pagePath} preloads precede its import map`);
  for (const value of [
    `${prefix}styles.css?v=${STYLE_VERSION}`,
    `${prefix}app.js?v=${APP_VERSION}`,
    `${prefix}vendor/three.module.min.js?v=${THREE_VERSION}`,
    `${prefix}browser-traits-catalog.js?v=browser-traits-5`,
    `${prefix}${dataFile}`,
    'id="binderTableViewButton"',
  ]) {
    assert(page.includes(value), `${pagePath} is missing ${value}`);
  }
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
