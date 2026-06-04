import * as THREE from "three";
import { CARD_NFTS } from "./cardnft-data.js";
import { CARD_NFT_OWNER_SNAPSHOT } from "./cardnft-owners.js?v=cardnft-2";
import { CARD_NFT_TRAIT_CATEGORIES, CARD_NFT_TRAITS } from "./cardnft-traits.js";
import { CARD_NFT_ANIMATED } from "./cardnft-animated.js";
import { CARD_NFT_ANIMATED_SPRITES } from "./cardnft-animated-sprites.js";

const CARDS = CARD_NFTS.map((card, index) => ({ ...card, setIndex: index }));
const CARD_NFT_MINT_TO_INDEX = new Map(CARDS
  .map((card, index) => [String(card?.mint || "").trim(), index])
  .filter(([mint]) => mint));
const CARD_NFT_TITLE_NUMBER_TO_INDEX = new Map(CARDS
  .map((card, index) => {
    const match = String(card?.title || "").match(/^card\s+#?\s*(\d+)$/i);
    return match ? [Number.parseInt(match[1], 10), index] : null;
  })
  .filter(Boolean));
const TRAIT_CATEGORY_INDEX = new Map(CARD_NFT_TRAIT_CATEGORIES.map((category, index) => [category, index]));
const HIDDEN_TRAIT_CATEGORIES = new Set(["98noise"]);
const EXCLUDED_SORT_TRAIT_VALUES = new Set(["no", "none", "null", "undefined"]);
const SITE_FONT_STACK = "Optima, Candara, \"Lucida Sans\", \"Lucida Grande\", \"Trebuchet MS\", Arial, sans-serif";
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const SOLANA_TOKEN_PROGRAM_IDS = [
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "TokenzQdBNbLqP5VEhdkAS6EP6KkQ6p3Msk3VQ5DA",
];
const CARD_NFT_COLLECTION_SYMBOL = "cardnft";
const MAGIC_EDEN_API_URL = "https://api-mainnet.magiceden.dev/v2";
const MAGIC_EDEN_WALLET_PAGE_LIMIT = 500;
const MAGIC_EDEN_WALLET_MAX_TOKENS = 10000;
const MAGIC_EDEN_WALLET_PAGE_DELAY_MS = 520;
const CARD_NFT_OWNER_TO_INDEXES = buildCardNftOwnerIndex(CARD_NFT_OWNER_SNAPSHOT);
const WALLET_SEARCH_REQUEST_TIMEOUT_MS = 9000;
const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const WALLET_SEARCH_PROMPT = "Enter a SOL address to view collected cards:";
const WALLET_SEARCH_EMPTY_MESSAGE = "No cards found, try again.";
const WALLET_SEARCH_BUSY_MESSAGE = "Checking wallet holdings...";
const WALLET_SEARCH_ERROR_MESSAGE = "Search failed, try again.";
const BINDER_INTRO_SPRITES = [
  {
    url: new URL("./assets/ui/drif-iii-card-back-square.png", import.meta.url).href,
    xRatio: 0,
    yRatio: 0.27,
    sizeRatio: 0.082,
  },
  {
    url: new URL("./assets/ui/drif-egg-sticker-square.png", import.meta.url).href,
    xRatio: -0.285,
    yRatio: -0.08,
    sizeRatio: 0.072,
  },
  {
    url: new URL("./assets/ui/drif-general-sprite-square.png", import.meta.url).href,
    xRatio: 0.29,
    yRatio: -0.08,
    sizeRatio: 0.074,
  },
];
const CARD_WIDTH = 2.5;
const CARD_HEIGHT = 3.54;
const CARD_DEPTH = 0.022;
const CARD_RADIUS = 0.12;
const INDIVIDUAL_CARD_WORLD_Y = 0.42;
const BINDER_FACE_WIDTH = 420;
const BINDER_FACE_HEIGHT = 594;
const BINDER_COLUMNS = 3;
const BINDER_ROWS = 3;
const BINDER_SIDE_SLOTS = BINDER_COLUMNS * BINDER_ROWS;
const BINDER_PAGE_SLOTS = BINDER_SIDE_SLOTS * 2;
const BINDER_SINGLE_PAGE_COVER_SIDE = -1;
const BINDER_CARD_WIDTH = 1.38;
const BINDER_CARD_HEIGHT = BINDER_CARD_WIDTH * (CARD_HEIGHT / CARD_WIDTH);
const BINDER_CARD_RADIUS = BINDER_CARD_WIDTH * (CARD_RADIUS / CARD_WIDTH);
const BINDER_POCKET_PAD = 0.12;
const BINDER_GRID_GAP = 0.055;
const BINDER_PAGE_INNER_MARGIN = 0.11;
const BINDER_PAGE_OUTER_MARGIN = 0.165;
const BINDER_PAGE_VERTICAL_MARGIN = 0.22;
const BINDER_CELL_WIDTH = BINDER_CARD_WIDTH + BINDER_POCKET_PAD * 2;
const BINDER_CELL_HEIGHT = BINDER_CARD_HEIGHT + BINDER_POCKET_PAD * 2;
const BINDER_PAGE_WIDTH = BINDER_PAGE_INNER_MARGIN
  + BINDER_PAGE_OUTER_MARGIN
  + BINDER_COLUMNS * BINDER_CELL_WIDTH
  + (BINDER_COLUMNS - 1) * BINDER_GRID_GAP;
const BINDER_PAGE_HEIGHT = BINDER_PAGE_VERTICAL_MARGIN * 2
  + BINDER_ROWS * BINDER_CELL_HEIGHT
  + (BINDER_ROWS - 1) * BINDER_GRID_GAP;
const BINDER_CARD_LIFT = 0.035;
const BINDER_PAGE_STACK_GAP = 0.026;
const BINDER_VISIBLE_STACK_GAP = 0.104;
const BINDER_LEFT_STACK_Z = 0.026;
const BINDER_RIGHT_STACK_Z = -0.026;
const BINDER_GAP_REVEAL_STACK_GAP = 0.028;
const BINDER_PAGE_COLUMN_BEND = 0.042;
const BINDER_ACTIVE_PAGE_LIFT = 0.22;
const BINDER_STACK_TRANSITION_START = 0.75;
const BINDER_VISIBLE_STACK_DEPTH = 1;
const BINDER_HIDDEN_STACK_DEPTH = 5;
const BINDER_DEEP_PAGE_FADE_POWER = 1.35;
const BINDER_COVER_OVERHANG = 0.14;
const BINDER_COVER_VERTICAL_OVERHANG = 0.22;
const BINDER_COVER_RADIUS = 0.15;
const BINDER_PLASTIC_REST_OPACITY = 0.066;
const BINDER_PLASTIC_ACTIVE_OPACITY = 0.13;
const BINDER_FROST_REST_OPACITY = 0.018;
const BINDER_FROST_ACTIVE_OPACITY = 0.038;
const BINDER_GLOSS_REST_OPACITY = 0.014;
const BINDER_GLOSS_ACTIVE_OPACITY = 0.034;
const BINDER_SEAM_REST_OPACITY = 0.28;
const BINDER_SEAM_ACTIVE_OPACITY = 0.44;
const BINDER_TOP_PAGE_RENDER_ORDER = 620;
const BINDER_FLIPPING_PAGE_RENDER_ORDER = 760;
const BINDER_FLIPPING_PAGE_CARD_RENDER_ORDER = 900;
const BINDER_GAP_REVEAL_PAGE_RENDER_ORDER = 600;
const BINDER_LEFT_STACK_RENDER_ORDER = 420;
const BINDER_RIGHT_STACK_RENDER_ORDER = 300;
const BINDER_STACK_RENDER_ORDER_STEP = 28;
const BINDER_TEXTURE_CONCURRENCY = 10;
const BINDER_ANIMATED_PRELOAD_PAGE_RADIUS = 1;
const BINDER_PAGE_WINDOW_RADIUS = 8;
const BINDER_PAGE_WINDOW_RECENTER_THRESHOLD = 4;
const BINDER_PRELOAD_PAGE_RADIUS = 4;
const BINDER_INITIAL_PRELOAD_IDLE_DELAY_MS = 180;
const BINDER_CARD_LOAD_FADE_MS = 280;
const BINDER_INTRO_LINK_URL = "https://x.com/bis__cut";
const BINDER_CARD_NFT_2_LINK_URL = "https://mons.shop";
const BINDER_INTRO_NOTE_FILTER_FADE_MS = 260;
const BINDER_CARD_VIEW_TRANSITION_MS = 820;
const INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD = 1560;
const BINDER_TO_INDIVIDUAL_WHEEL_THRESHOLD = 680;
const VIEW_SWITCH_WHEEL_IDLE_MS = 900;
const BINDER_FOCUS_ZOOM_OUT_LOCK_MS = 620;
const BINDER_TO_CARD_SCROLL_LOCK_BUFFER_MS = 120;
const BINDER_FOCUS_TRANSITION_LOCK_MS = BINDER_CARD_VIEW_TRANSITION_MS + BINDER_FOCUS_ZOOM_OUT_LOCK_MS;
const INDIVIDUAL_MAX_ZOOM_EPSILON = 0.035;
const CARD_CAMERA_DEFAULT_Z = 9.55;
const CARD_CAMERA_MIN_Z = 4.55;
const CARD_CAMERA_MAX_Z = 14.05;
const CARD_PAN_MODE_Z = 7.25;
const CARD_PAN_VISIBLE_MARGIN = 0.48;
const CARD_MOBILE_SCALE_MIN = 0.88;
const CARD_MOBILE_SCALE_FULL_WIDTH = 700;
const CARD_MOBILE_SCALE_MIN_WIDTH = 340;
const CARD_DEFAULT_HORIZONTAL_MARGIN_PX = 14;
const CARD_SWAP_DISTANCE = CARD_WIDTH * 1.08;
const CARD_SWAP_MIN_OPACITY = 0.1;
const CARD_SWAP_MS = 230;
const CARD_SHUFFLE_SPIN_MS = 520;
const CARD_SHUFFLE_SPIN_DIRECTION = -1;
const SHUFFLE_TOUCH_UNDO_HOLD_MS = 560;
const SHUFFLE_TOUCH_UNDO_SUPPRESS_MS = 1000;
const SHUFFLE_TOUCH_UNDO_MOVE_LIMIT = 14;
const BINDER_DOUBLE_TAP_MS = 420;
const BINDER_DOUBLE_TAP_DISTANCE = 28;
const SHUFFLE_HISTORY_LIMIT = 10;
const MAX_TEXTURE_CACHE_SIZE = 260;
const BINDER_ANIMATED_IDLE_MS = 84;
const BINDER_INTERACTION_ACTIVE_MS = 900;
const SESSION_VIEW_STATE_KEY = "cardnft:sessionView:v1";
const TENSOR_ITEM_URL_BASE = "https://www.tensor.trade/item/";
const SOLSCAN_TOKEN_URL_BASE = "https://solscan.io/token/";
const restoredSessionViewState = loadSessionViewState();

const els = {
  body: document.body,
  cardCanvas: document.querySelector("#cardCanvas"),
  previousButton: document.querySelector("#previousButton"),
  nextButton: document.querySelector("#nextButton"),
  shuffleButton: document.querySelector("#shuffleButton"),
  favoriteButton: document.querySelector("#favoriteButton"),
  traitInfoButton: document.querySelector("#traitInfoButton"),
  traitPanel: document.querySelector("#traitPanel"),
  traitGrid: document.querySelector("#traitGrid"),
  traitTensorButton: document.querySelector("#traitTensorButton"),
  traitSolscanButton: document.querySelector("#traitSolscanButton"),
  traitDownloadButton: document.querySelector("#traitDownloadButton"),
  cardFileName: document.querySelector("#cardFileName"),
  galleryToggleButton: document.querySelector("#galleryToggleButton"),
  galleryPanel: document.querySelector("#galleryPanel"),
  galleryGrid: document.querySelector("#galleryGrid"),
  binderPanel: document.querySelector("#binderPanel"),
  binderCanvas: document.querySelector("#binderCanvas"),
  binderLoading: document.querySelector("#binderLoading"),
  binderPageControls: document.querySelector("#binderPageControls"),
  binderZoomOutButton: document.querySelector("#binderZoomOutButton"),
  binderPreviousPageButton: document.querySelector("#binderPreviousPageButton"),
  binderNextPageButton: document.querySelector("#binderNextPageButton"),
  binderOpenCardButton: document.querySelector("#binderOpenCardButton"),
  binderFavoriteButton: document.querySelector("#binderFavoriteButton"),
  binderShuffleButton: document.querySelector("#binderShuffleButton"),
  binderPageStatus: document.querySelector("#binderPageStatus"),
  gallerySortControl: document.querySelector("#gallerySortControl"),
  traitSortSelect: document.querySelector("#traitSortSelect"),
  traitSearchButton: document.querySelector("#traitSearchButton"),
  traitSearchButtonLabel: document.querySelector("#traitSearchButtonLabel"),
  traitSearchPanel: document.querySelector("#traitSearchPanel"),
  traitSearchInput: document.querySelector("#traitSearchInput"),
  traitSearchGroups: document.querySelector("#traitSearchGroups"),
  traitSearchSidebar: document.querySelector("#traitSearchSidebar"),
  galleryClearFiltersButton: document.querySelector("#galleryClearFiltersButton"),
  favoriteFilterButton: document.querySelector("#favoriteFilterButton"),
  galleryViewToggleButton: document.querySelector("#galleryViewToggleButton"),
  walletSearchButton: document.querySelector("#walletSearchButton"),
  walletSearchPanel: document.querySelector("#walletSearchPanel"),
  walletSearchForm: document.querySelector("#walletSearchForm"),
  walletSearchMessage: document.querySelector("#walletSearchMessage"),
  walletAddressInput: document.querySelector("#walletAddressInput"),
  walletSearchSubmitButton: document.querySelector("#walletSearchSubmitButton"),
  themeToggle: document.querySelector("#themeToggle"),
  galleryEmpty: document.querySelector("#galleryEmpty"),
};

const textureLoader = new THREE.TextureLoader();
const nftTextureCache = new Map();
const animatedTextureRecords = new Set();
const favorites = loadSet("cardnft:favorites:v1");
const shuffleHistory = [];
const binderShuffleHistory = [];

let currentIndex = 0;
let galleryOpen = false;
let favoritesOnly = false;
let traitSortCategory = "all";
let activeTraitFilter = null;
let traitSearchOpen = false;
let traitSearchQuery = "";
let traitSortPickerOpen = false;
let traitSortPickerOpenedAt = 0;
let traitSortPickerSyncFrame = 0;
let sessionViewSaveFrame = 0;
let walletSearchOpen = false;
let walletSearchLoading = false;
let walletSearchToken = 0;
let walletFilterCardIndexes = null;
let walletFilterCardIndexSet = null;
let walletFilterAddress = "";
let isBinderMode = typeof restoredSessionViewState?.isBinderMode === "boolean"
  ? restoredSessionViewState.isBinderMode
  : true;
let cardRenderer;
let cardScene;
let cardCamera;
let cardGroup;
let cardFrontMesh;
let cardBackMesh;
let cardGlareMesh;
let cardBackGlareMesh;
let cardGradientMesh;
let cardBackGradientMesh;
let cardFrontNoiseMesh;
let cardBackNoiseMesh;
let cardPlaceholderTexture;
let cardSurfaceNoiseTexture;
let backTexturePromise;
let cardApplyToken = 0;
let dragState = null;
let currentRotationX = 0;
let currentRotationY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let targetCardOffsetX = 0;
let currentCardOffsetX = 0;
let targetPanX = 0;
let targetPanY = 0;
let currentPanX = 0;
let currentPanY = 0;
let cardSwapOffsetX = 0;
let cardSwapOpacity = 1;
let cardSwapIncomingGroup = null;
let cardSwapIncomingFrontMesh = null;
let cardSwapIncomingOffsetX = 0;
let cardSwapIncomingOpacity = 0;
let cardSwapAnimating = false;
let cardSwapToken = 0;
let cardShuffleSpinY = 0;
let cardShuffleSpinAnimating = false;
let cardShuffleSpinToken = 0;
let cardNameInput = null;
let shuffleTouchUndoTimer = 0;
let shuffleTouchUndoPointerId = null;
let shuffleTouchUndoStartX = 0;
let shuffleTouchUndoStartY = 0;
let shuffleTouchUndoTriggeredAt = 0;
let suppressNextShuffleClick = false;
let targetCameraZ = CARD_CAMERA_DEFAULT_Z;
let currentCameraZ = targetCameraZ;
let smoothZoomVelocity = 0;
let cardGlossActivity = 0;
let traitsOpen = false;
let individualWheelOutDistance = 0;
let individualWheelOutLastAt = 0;
let binderFocusWheelInDistance = 0;
let binderFocusWheelInLastAt = 0;
let resizeFrame = 0;

let binderRenderer;
let binderScene;
let binderCamera;
let binderRoot;
let binderCardGeometry = null;
let binderColumnSheetGeometry = null;
let binderColumnGlossGeometry = null;
let binderVerticalSeamGeometry = null;
let binderHorizontalSeamGeometry = null;
let binderCoverTexture = null;
let binderIntroNoteTexture = null;
let binderSleeveFrostTexture = null;
let paperRoughnessTexture = null;
let binderPlaceholderTexture = null;
let binderCardMeshes = [];
let binderCardMeshByPosition = new Map();
let binderIntroNoteGroup = null;
let binderIntroNoteMesh = null;
let binderIntroNoteModeOpacity = 1;
let binderIntroNoteModeTargetOpacity = 1;
let binderIntroNoteFadeLastAt = 0;
let binderIntroLinkMeshes = [];
let binderPages = [];
let binderVisibleIndexes = [];
let binderBuildToken = 0;
let binderIndexesKey = "";
let binderPageWindowKey = "";
let binderPageWindowCenter = 0;
let binderPageCount = 1;
let binderTurn = 0;
let binderTargetTurn = 0;
let binderBendDirection = 1;
let binderSinglePageSide = null;
let binderSinglePageSideTouched = false;
let binderResizeFrame = 0;
let binderLastWidth = 0;
let binderLastHeight = 0;
let binderAnimationFrame = 0;
let binderAnimationDelayTimer = 0;
let binderLastAnimationIdleOnly = false;
let binderRenderFrame = 0;
let binderMaintenanceTimer = 0;
let binderSpreadPreparationToken = 0;
let binderPreparingSpread = false;
let binderFocusPosition = -1;
let binderDrag = null;
let binderLastOpenTap = null;
let binderWheelFocusLockUntil = 0;
let binderFocusZoomOutLockUntil = 0;
let binderCameraReady = false;
let binderCardViewTransitionActive = false;
let binderTextureQueueKey = "";
let binderTextureTaskSequence = 0;
let binderTextureActiveLoads = 0;
let binderTextureActiveAnimatedLoads = 0;
let binderInteractionActiveUntil = 0;
let binderShuffleLoadingToken = 0;
let binderPageStatusInput = null;
let binderPageStatusEditMode = null;
const binderTextureQueue = [];
const binderTextureQueuedPositions = new Set();
const binderRaycaster = new THREE.Raycaster();
const binderPointer = new THREE.Vector2();
const binderDefaultCameraPosition = new THREE.Vector3(0, 0.24, 10);
const binderDefaultCameraLookAt = new THREE.Vector3(0, 0.24, 0);
const binderDesiredCameraPosition = new THREE.Vector3();
const binderDesiredCameraLookAt = new THREE.Vector3();
const binderCurrentCameraLookAt = binderDefaultCameraLookAt.clone();
const binderFocusWorldPosition = new THREE.Vector3();

init();

function init() {
  applyTheme(localStorage.getItem("cardnft:theme:v1") === "light");
  applyRestoredSessionViewState(restoredSessionViewState);
  updateGalleryViewModeButton();
  populateTraitSortOptions();
  initCardScene();
  initEvents();
  setCard(getRestoredSessionCardIndex(restoredSessionViewState));
  restoreSessionGalleryView(restoredSessionViewState);
  animateCard();
}

function initCardScene() {
  cardRenderer = new THREE.WebGLRenderer({
    canvas: els.cardCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  cardRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  cardRenderer.outputColorSpace = THREE.SRGBColorSpace;
  cardRenderer.setClearColor(0x000000, 0);

  cardScene = new THREE.Scene();
  cardCamera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  cardCamera.position.set(0, 0, targetCameraZ);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x2a2118, 1.18);
  cardScene.add(ambient);

  const key = new THREE.DirectionalLight(0xfff2d4, 1.72);
  key.position.set(-3.8, 4.2, 4.8);
  cardScene.add(key);

  const rim = new THREE.DirectionalLight(0xaec8d8, 0.72);
  rim.position.set(3.2, 1.8, -2.8);
  cardScene.add(rim);

  cardGroup = new THREE.Group();
  cardGroup.position.y = INDIVIDUAL_CARD_WORLD_Y;
  cardScene.add(cardGroup);

  const core = new THREE.Mesh(
    createRoundedCoreGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH, CARD_RADIUS),
    new THREE.MeshPhysicalMaterial({
      color: 0x14110e,
      roughness: 0.64,
      metalness: 0.02,
      clearcoat: 0.2,
      clearcoatRoughness: 0.5,
    }),
  );
  cardGroup.add(core);

  const faceGeometry = createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  cardFrontMesh = new THREE.Mesh(
    faceGeometry,
    new THREE.MeshBasicMaterial({ map: getCardPlaceholderTexture(), toneMapped: false }),
  );
  cardFrontMesh.position.z = CARD_DEPTH / 2 + 0.003;
  cardGroup.add(cardFrontMesh);

  cardBackMesh = new THREE.Mesh(
    faceGeometry.clone(),
    new THREE.MeshBasicMaterial({ map: getCardPlaceholderTexture(), toneMapped: false }),
  );
  cardBackMesh.position.z = -CARD_DEPTH / 2 - 0.003;
  cardBackMesh.rotation.y = Math.PI;
  cardGroup.add(cardBackMesh);

  cardFrontNoiseMesh = createCardSurfaceNoisePlane();
  cardFrontNoiseMesh.position.z = CARD_DEPTH / 2 + 0.005;
  cardGroup.add(cardFrontNoiseMesh);

  cardBackNoiseMesh = createCardSurfaceNoisePlane();
  cardBackNoiseMesh.rotation.y = Math.PI;
  cardBackNoiseMesh.position.z = -CARD_DEPTH / 2 - 0.005;
  cardGroup.add(cardBackNoiseMesh);

  cardGradientMesh = createCardGradientPlane(1);
  cardGradientMesh.position.z = CARD_DEPTH / 2 + 0.007;
  cardGroup.add(cardGradientMesh);

  cardBackGradientMesh = createCardGradientPlane(-1);
  cardBackGradientMesh.rotation.y = Math.PI;
  cardBackGradientMesh.position.z = -CARD_DEPTH / 2 - 0.007;
  cardGroup.add(cardBackGradientMesh);

  cardGlareMesh = createCardGlossPlane(1);
  cardGlareMesh.position.z = CARD_DEPTH / 2 + 0.009;
  cardGroup.add(cardGlareMesh);

  cardBackGlareMesh = createCardGlossPlane(-1);
  cardBackGlareMesh.rotation.y = Math.PI;
  cardBackGlareMesh.position.z = -CARD_DEPTH / 2 - 0.009;
  cardGroup.add(cardBackGlareMesh);

  resizeCardRenderer();
}

function initEvents() {
  els.previousButton.addEventListener("click", () => transitionAdjacentCard(-1).catch(console.error));
  els.nextButton.addEventListener("click", () => transitionAdjacentCard(1).catch(console.error));
  els.shuffleButton.addEventListener("click", (event) => {
    if (consumeSuppressedShuffleClick()) {
      event.preventDefault();
      return;
    }
    shuffleCard().catch(console.error);
  });
  els.shuffleButton.addEventListener("pointerdown", startShuffleTouchUndo);
  els.shuffleButton.addEventListener("pointermove", moveShuffleTouchUndo);
  els.shuffleButton.addEventListener("pointerup", cancelShuffleTouchUndo);
  els.shuffleButton.addEventListener("pointercancel", cancelShuffleTouchUndo);
  els.shuffleButton.addEventListener("pointerleave", cancelShuffleTouchUndo);
  els.shuffleButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (isRecentShuffleTouchUndo()) return;
    goBackInShuffleHistory();
  });
  els.favoriteButton.addEventListener("click", toggleCurrentFavorite);
  els.traitInfoButton.addEventListener("click", toggleTraitInfo);
  els.traitDownloadButton.addEventListener("click", () => {
    downloadCurrentCardArt().catch(console.error);
  });
  els.cardFileName.addEventListener("dblclick", startCardNameEdit);
  els.galleryToggleButton.addEventListener("click", () => setGalleryOpen(!galleryOpen, { resetFilters: !galleryOpen }));
  els.galleryViewToggleButton.addEventListener("click", toggleGalleryViewMode);
  els.galleryClearFiltersButton.addEventListener("click", clearGallerySortAndFilters);
  els.walletSearchButton.addEventListener("click", toggleWalletSearchPanel);
  els.walletSearchPanel.addEventListener("pointerdown", (event) => {
    if (event.target === els.walletSearchPanel) {
      setWalletSearchPanelOpen(false, { preserveMessage: true });
    }
  });
  els.walletSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitWalletSearch().catch(console.error);
  });
  els.walletAddressInput.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setWalletSearchPanelOpen(false, { preserveMessage: true });
  });
  els.favoriteFilterButton.addEventListener("click", toggleFavoriteFilter);
  els.traitSearchButton.addEventListener("click", toggleTraitSearch);
  els.traitSearchInput.addEventListener("input", updateTraitSearchQuery);
  els.gallerySortControl.addEventListener("click", (event) => {
    if (event.target === els.traitSortSelect) return;
    event.preventDefault();
    openTraitSortPicker();
  });
  els.traitSortSelect.addEventListener("pointerdown", () => {
    setTraitSortPickerOpen(true);
  });
  els.traitSortSelect.addEventListener("cancel", () => {
    setTraitSortPickerOpen(false);
  });
  els.traitSortSelect.addEventListener("blur", () => {
    setTraitSortPickerOpen(false);
  });
  els.traitSortSelect.addEventListener("keydown", (event) => {
    if ([" ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      setTraitSortPickerOpen(true);
    } else if (["Escape", "Enter", "Tab"].includes(event.key)) {
      requestAnimationFrame(() => setTraitSortPickerOpen(false));
    }
  });
  els.traitSortSelect.addEventListener("change", () => {
    setTraitSortPickerOpen(false);
    activeTraitFilter = null;
    traitSearchOpen = false;
    resetTraitSearchQuery();
    traitSortCategory = els.traitSortSelect.value || "all";
    updateTraitSearchState();
    resetBinderGalleryPosition();
    renderGallery();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!traitSortPickerOpen || els.gallerySortControl.contains(event.target)) return;
    requestAnimationFrame(() => setTraitSortPickerOpen(false));
  }, true);
  document.addEventListener("click", (event) => {
    if (!traitSortPickerOpen || els.gallerySortControl.contains(event.target)) return;
    requestAnimationFrame(() => setTraitSortPickerOpen(false));
  }, true);
  document.addEventListener("pointerdown", (event) => {
    if (!walletSearchOpen) return;
    if (els.walletSearchButton.contains(event.target) || els.walletSearchForm.contains(event.target)) return;
    setWalletSearchPanelOpen(false, { preserveMessage: true });
  }, true);
  document.addEventListener("pointerdown", (event) => {
    if (!cardNameInput || cardNameInput.contains(event.target)) return;
    closeCardNameEdit();
  }, true);
  document.addEventListener("pointerdown", (event) => {
    if (!binderPageStatusInput || binderPageStatusInput.contains(event.target)) return;
    closeBinderPageStatusEdit();
  }, true);
  window.addEventListener("blur", () => setTraitSortPickerOpen(false));
  els.themeToggle.addEventListener("change", () => applyTheme(els.themeToggle.checked));
  els.binderPreviousPageButton.addEventListener("click", previousBinderPage);
  els.binderNextPageButton.addEventListener("click", nextBinderPage);
  els.binderPageStatus.addEventListener("dblclick", startBinderPageStatusEdit);
  els.binderZoomOutButton.addEventListener("click", clearBinderFocus);
  els.binderOpenCardButton.addEventListener("click", () => {
    openFocusedBinderCard().catch(console.error);
  });
  els.binderFavoriteButton.addEventListener("click", toggleFocusedBinderFavorite);
  els.binderShuffleButton.addEventListener("click", () => {
    shuffleBinderSpread().catch(console.error);
  });
  els.binderShuffleButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    applyPreviousBinderSpread().catch(console.error);
  });

  els.cardCanvas.addEventListener("pointerdown", onCardPointerDown);
  els.cardCanvas.addEventListener("pointermove", onCardPointerMove);
  els.cardCanvas.addEventListener("pointerup", onCardPointerUp);
  els.cardCanvas.addEventListener("pointercancel", onCardPointerUp);
  els.cardCanvas.addEventListener("wheel", onCardWheel, { passive: false });

  els.binderCanvas.addEventListener("pointerdown", onBinderPointerDown);
  els.binderCanvas.addEventListener("pointermove", onBinderPointerMove);
  els.binderCanvas.addEventListener("pointerup", onBinderPointerUp);
  els.binderCanvas.addEventListener("pointercancel", onBinderPointerCancel);
  els.binderCanvas.addEventListener("pointerleave", clearBinderIntroLinkCursor);
  els.binderCanvas.addEventListener("dblclick", openFocusedBinderCardFromPointer);
  els.binderCanvas.addEventListener("wheel", handleBinderWheel, { passive: false });

  window.addEventListener("resize", requestResize);
  window.addEventListener("pagehide", saveSessionViewState);
}

function populateTraitSortOptions() {
  if (HIDDEN_TRAIT_CATEGORIES.has(traitSortCategory)) traitSortCategory = "all";

  const fragment = document.createDocumentFragment();
  for (const category of CARD_NFT_TRAIT_CATEGORIES) {
    if (HIDDEN_TRAIT_CATEGORIES.has(category)) continue;
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    fragment.append(option);
  }
  els.traitSortSelect.append(fragment);
  els.traitSortSelect.value = traitSortCategory;
  updateTraitSearchPlaceholder();
}

function updateTraitSearchPlaceholder() {
  if (!els.traitSearchInput) return;

  const traitTotal = getTraitSearchGroups()
    .reduce((total, group) => total + group.total, 0);
  els.traitSearchInput.placeholder = `search all ${traitTotal} traits`;
}

function openTraitSortPicker() {
  setTraitSortPickerOpen(true);
  els.traitSortSelect.focus();
  if (typeof els.traitSortSelect.showPicker === "function") {
    try {
      els.traitSortSelect.showPicker();
    } catch {
      requestAnimationFrame(() => setTraitSortPickerOpen(false));
    }
  }
}

function setTraitSortPickerOpen(open) {
  const nextOpen = Boolean(open);
  if (traitSortPickerOpen === nextOpen) return;
  traitSortPickerOpen = nextOpen;
  traitSortPickerOpenedAt = nextOpen ? performance.now() : 0;
  els.gallerySortControl.classList.toggle("is-open", traitSortPickerOpen);
  els.gallerySortControl.setAttribute("aria-expanded", String(traitSortPickerOpen));
  if (traitSortPickerOpen) {
    startTraitSortPickerSync();
  } else {
    stopTraitSortPickerSync();
  }
}

function startTraitSortPickerSync() {
  if (traitSortPickerSyncFrame) return;

  const sync = () => {
    traitSortPickerSyncFrame = 0;
    if (!traitSortPickerOpen) return;

    const nativeOpen = getTraitSortNativeOpenState();
    const stillOpening = performance.now() - traitSortPickerOpenedAt < 250;
    if (nativeOpen === false && !stillOpening) {
      setTraitSortPickerOpen(false);
      return;
    }

    traitSortPickerSyncFrame = requestAnimationFrame(sync);
  };

  traitSortPickerSyncFrame = requestAnimationFrame(sync);
}

function stopTraitSortPickerSync() {
  if (!traitSortPickerSyncFrame) return;
  cancelAnimationFrame(traitSortPickerSyncFrame);
  traitSortPickerSyncFrame = 0;
}

function getTraitSortNativeOpenState() {
  try {
    if (!CSS.supports("selector(select:open)")) return null;
    return els.traitSortSelect.matches(":open");
  } catch {
    return null;
  }
}

function setCard(index, options = {}) {
  if (!CARDS.length) {
    els.cardFileName.textContent = "Card NFT set not synced yet";
    return;
  }

  currentIndex = modulo(index, CARDS.length);
  const card = CARDS[currentIndex];
  const token = ++cardApplyToken;
  resetViewSwitchWheelDistances();

  if (options.frontTexture) {
    prepareTextureForImmediateDisplay(options.frontTexture);
    cardFrontMesh.material.map = options.frontTexture;
    cardFrontMesh.material.needsUpdate = true;
  } else {
    cardFrontMesh.material.map = getCardPlaceholderTexture();
    cardFrontMesh.material.needsUpdate = true;
    getCardTexture(card).then((texture) => {
      if (token !== cardApplyToken) return;
      prepareTextureForImmediateDisplay(texture);
      cardFrontMesh.material.map = texture;
      cardFrontMesh.material.needsUpdate = true;
    }).catch(console.error);
  }

  preloadAdjacentIndividualTextures(currentIndex);
  getBackTexture().then((texture) => {
    if (token !== cardApplyToken) return;
    prepareTextureForImmediateDisplay(texture);
    cardBackMesh.material.map = texture;
    cardBackMesh.material.needsUpdate = true;
  }).catch(console.error);

  targetRotationX = 0;
  targetRotationY = 0;
  resetCardPan(true);
  cardGlossActivity = 0;
  if (!options.preserveSwapVisuals) resetCardSwapVisualState();
  if (!options.preserveSpinVisuals) resetCardShuffleSpinVisualState();
  updateCardText();
  renderTraitPanel();
  updateFavoriteButtons();
  queueSessionViewStateSave();
}

async function transitionAdjacentCard(direction) {
  if (cardSwapAnimating || cardShuffleSpinAnimating || galleryOpen || !CARDS.length) return;

  cardSwapAnimating = true;
  const token = ++cardSwapToken;
  const nextIndex = modulo(currentIndex + direction, CARDS.length);
  setIndividualCardControlsDisabled(true);
  updateCardNameJumpState();
  try {
    if (token !== cardSwapToken) return;
    const [nextTexture, backTexture] = await Promise.all([
      getPreparedCardTexture(CARDS[nextIndex]).catch((error) => {
        console.error(error);
        return null;
      }),
      getBackTexture().catch((error) => {
        console.error(error);
        return getBackPlaceholderTexture();
      }),
    ]);
    if (token !== cardSwapToken) return;
    prepareCardSwapIncomingGroup(direction, nextTexture, backTexture);
    await tweenCardSwap(direction, nextIndex, nextTexture, token);
  } finally {
    if (token === cardSwapToken) {
      resetCardSwapVisualState();
      cardSwapAnimating = false;
      setIndividualCardControlsDisabled(false);
      updateCardNameJumpState();
    }
  }
}

function tweenCardSwap(direction, nextIndex, nextTexture, token) {
  const startedAt = performance.now();

  return new Promise((resolve) => {
    const step = (now) => {
      if (token !== cardSwapToken) {
        resolve();
        return;
      }

      const progress = clamp((now - startedAt) / CARD_SWAP_MS, 0, 1);
      const eased = easeInOutCubic(progress);
      cardSwapOffsetX = -direction * CARD_SWAP_DISTANCE * eased;
      cardSwapIncomingOffsetX = direction * CARD_SWAP_DISTANCE * (1 - eased);
      cardSwapOpacity = THREE.MathUtils.lerp(1, CARD_SWAP_MIN_OPACITY, eased);
      cardSwapIncomingOpacity = THREE.MathUtils.lerp(CARD_SWAP_MIN_OPACITY, 1, eased);
      applyCardSwapOpacity();

      if (progress >= 1) {
        setCard(nextIndex, { frontTexture: nextTexture, preserveSwapVisuals: true });
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function prepareCardSwapIncomingGroup(direction, frontTexture, backTexture) {
  removeCardSwapIncomingGroup();
  cardSwapIncomingGroup = createCardSwapGroup(frontTexture, backTexture);
  cardSwapIncomingFrontMesh = cardSwapIncomingGroup.userData.frontMesh || null;
  cardSwapIncomingOffsetX = direction * CARD_SWAP_DISTANCE;
  cardSwapIncomingOpacity = CARD_SWAP_MIN_OPACITY;
  cardScene.add(cardSwapIncomingGroup);
  updateCardSwapIncomingTransform();
  applyCardSwapOpacity();
}

function createCardSwapGroup(frontTexture, backTexture) {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    createRoundedCoreGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH, CARD_RADIUS),
    new THREE.MeshPhysicalMaterial({
      color: 0x14110e,
      roughness: 0.64,
      metalness: 0.02,
      clearcoat: 0.2,
      clearcoatRoughness: 0.5,
    }),
  );
  group.add(core);

  const faceGeometry = createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  const frontMesh = new THREE.Mesh(
    faceGeometry,
    new THREE.MeshBasicMaterial({
      map: frontTexture || getCardPlaceholderTexture(),
      transparent: true,
      toneMapped: false,
    }),
  );
  frontMesh.position.z = CARD_DEPTH / 2 + 0.003;
  group.add(frontMesh);

  const backMesh = new THREE.Mesh(
    faceGeometry.clone(),
    new THREE.MeshBasicMaterial({
      map: backTexture || getBackPlaceholderTexture(),
      transparent: true,
      toneMapped: false,
    }),
  );
  backMesh.position.z = -CARD_DEPTH / 2 - 0.003;
  backMesh.rotation.y = Math.PI;
  group.add(backMesh);

  const frontNoise = createCardSurfaceNoisePlane();
  frontNoise.position.z = CARD_DEPTH / 2 + 0.005;
  group.add(frontNoise);

  const backNoise = createCardSurfaceNoisePlane();
  backNoise.rotation.y = Math.PI;
  backNoise.position.z = -CARD_DEPTH / 2 - 0.005;
  group.add(backNoise);

  group.userData.frontMesh = frontMesh;
  return group;
}

function getPreparedCardTexture(card) {
  return getCardTexture(card).then((texture) => {
    prepareTextureForImmediateDisplay(texture);
    return texture;
  });
}

function preloadAdjacentIndividualTextures(index) {
  if (CARDS.length < 2) return;
  const indexes = new Set([
    modulo(index - 1, CARDS.length),
    modulo(index + 1, CARDS.length),
  ]);
  for (const adjacentIndex of indexes) {
    getCardTexture(CARDS[adjacentIndex]).catch(() => {});
  }
}

function resetCardSwapVisualState() {
  cardSwapOffsetX = 0;
  cardSwapOpacity = 1;
  cardSwapIncomingOffsetX = 0;
  cardSwapIncomingOpacity = 0;
  applyCardSwapOpacity();
  removeCardSwapIncomingGroup();
}

function setIndividualCardControlsDisabled(disabled) {
  els.previousButton.disabled = disabled;
  els.nextButton.disabled = disabled;
  els.shuffleButton.disabled = disabled;
}

function applyCardSwapOpacity() {
  applyCardGroupOpacity(cardGroup, cardSwapOpacity);
  applyCardGroupOpacity(cardSwapIncomingGroup, cardSwapIncomingOpacity);
}

function applyCardGroupOpacity(group, opacityValue) {
  if (!group) return;

  const opacity = clamp(opacityValue, 0, 1);
  group.traverse((object) => {
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (material.userData.baseOpacity === undefined) {
        material.userData.baseOpacity = material.opacity ?? 1;
        material.userData.baseTransparent = Boolean(material.transparent);
      }
      if (material.uniforms?.uTransitionOpacity) {
        material.uniforms.uTransitionOpacity.value = opacity;
      }
      if (material.opacity !== undefined) {
        const nextOpacity = material.userData.baseOpacity * opacity;
        if (Math.abs(material.opacity - nextOpacity) > 0.001) material.opacity = nextOpacity;
      }
      const nextTransparent = material.userData.baseTransparent || opacity < 0.999;
      if (material.transparent !== nextTransparent) {
        material.transparent = nextTransparent;
        material.needsUpdate = true;
      }
    }
  });
}

function updateCardSwapIncomingTransform() {
  if (!cardSwapIncomingGroup) return;
  cardSwapIncomingGroup.rotation.x = cardGroup.rotation.x;
  cardSwapIncomingGroup.rotation.y = cardGroup.rotation.y;
  cardSwapIncomingGroup.scale.copy(cardGroup.scale);
  cardSwapIncomingGroup.position.x = currentCardOffsetX + currentPanX + cardSwapIncomingOffsetX;
  cardSwapIncomingGroup.position.y = INDIVIDUAL_CARD_WORLD_Y + currentPanY;
  cardSwapIncomingGroup.position.z = cardGroup.position.z;
}

function removeCardSwapIncomingGroup() {
  if (!cardSwapIncomingGroup) return;
  cardScene.remove(cardSwapIncomingGroup);
  disposeCardSwapGroup(cardSwapIncomingGroup);
  cardSwapIncomingGroup = null;
  cardSwapIncomingFrontMesh = null;
}

function disposeCardSwapGroup(group) {
  group.traverse((object) => {
    object.geometry?.dispose();
    if (!object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material.dispose();
  });
}

async function shuffleCard() {
  if (CARDS.length < 2) return;

  let next = currentIndex;
  while (next === currentIndex) {
    next = Math.floor(Math.random() * CARDS.length);
  }

  await spinToCard(next, { recordHistory: true });
}

async function spinToCard(nextIndex, { recordHistory = false } = {}) {
  if (CARDS.length < 2 || cardSwapAnimating || cardShuffleSpinAnimating || galleryOpen) return false;

  const targetIndex = modulo(nextIndex, CARDS.length);
  if (targetIndex === currentIndex) return false;

  if (recordHistory) {
    shuffleHistory.push(currentIndex);
    if (shuffleHistory.length > SHUFFLE_HISTORY_LIMIT) shuffleHistory.shift();
  }

  getCardTexture(CARDS[targetIndex]).catch(() => {});
  cardShuffleSpinAnimating = true;
  const token = ++cardShuffleSpinToken;
  setIndividualCardControlsDisabled(true);
  updateCardNameJumpState();
  dragState = null;
  targetRotationX = 0;
  targetRotationY = 0;

  try {
    await tweenCardShuffleSpin(targetIndex, token);
    return true;
  } finally {
    if (token === cardShuffleSpinToken) {
      resetCardShuffleSpinVisualState();
      cardShuffleSpinAnimating = false;
      setIndividualCardControlsDisabled(false);
      updateCardNameJumpState();
    }
  }
}

function goBackInShuffleHistory() {
  const previous = shuffleHistory.pop();
  if (Number.isInteger(previous)) setCard(previous);
}

function startShuffleTouchUndo(event) {
  if (event.pointerType === "mouse" || event.button > 0 || els.shuffleButton.disabled) return;

  clearShuffleTouchUndoTimer();
  shuffleTouchUndoPointerId = event.pointerId;
  shuffleTouchUndoStartX = event.clientX;
  shuffleTouchUndoStartY = event.clientY;
  try {
    els.shuffleButton.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is best-effort; the timeout path still works without it.
  }

  shuffleTouchUndoTimer = window.setTimeout(() => {
    if (shuffleTouchUndoPointerId !== event.pointerId) return;
    shuffleTouchUndoTimer = 0;
    shuffleTouchUndoTriggeredAt = performance.now();
    suppressNextShuffleClick = true;
    goBackInShuffleHistory();
    window.setTimeout(() => {
      if (isRecentShuffleTouchUndo()) return;
      suppressNextShuffleClick = false;
    }, SHUFFLE_TOUCH_UNDO_SUPPRESS_MS);
  }, SHUFFLE_TOUCH_UNDO_HOLD_MS);
}

function moveShuffleTouchUndo(event) {
  if (shuffleTouchUndoPointerId !== event.pointerId) return;

  const distance = Math.hypot(
    event.clientX - shuffleTouchUndoStartX,
    event.clientY - shuffleTouchUndoStartY,
  );
  if (distance > SHUFFLE_TOUCH_UNDO_MOVE_LIMIT) cancelShuffleTouchUndo(event);
}

function cancelShuffleTouchUndo(event) {
  if (shuffleTouchUndoPointerId !== null && event.pointerId !== shuffleTouchUndoPointerId) return;

  clearShuffleTouchUndoTimer();
  try {
    if (shuffleTouchUndoPointerId !== null) els.shuffleButton.releasePointerCapture(shuffleTouchUndoPointerId);
  } catch {
    // Pointer capture may already be released by the browser.
  }
  shuffleTouchUndoPointerId = null;
}

function clearShuffleTouchUndoTimer() {
  if (!shuffleTouchUndoTimer) return;
  window.clearTimeout(shuffleTouchUndoTimer);
  shuffleTouchUndoTimer = 0;
}

function consumeSuppressedShuffleClick() {
  if (!suppressNextShuffleClick) return false;
  suppressNextShuffleClick = false;
  return isRecentShuffleTouchUndo();
}

function isRecentShuffleTouchUndo() {
  return performance.now() - shuffleTouchUndoTriggeredAt < SHUFFLE_TOUCH_UNDO_SUPPRESS_MS;
}

function tweenCardShuffleSpin(nextIndex, token) {
  const startedAt = performance.now();
  let swapped = false;

  return new Promise((resolve) => {
    const step = (now) => {
      if (token !== cardShuffleSpinToken) {
        resolve();
        return;
      }

      const progress = clamp((now - startedAt) / CARD_SHUFFLE_SPIN_MS, 0, 1);
      const eased = easeInOutCubic(progress);
      cardShuffleSpinY = CARD_SHUFFLE_SPIN_DIRECTION * eased * Math.PI * 2;

      if (!swapped && eased >= 0.5) {
        swapped = true;
        cardShuffleSpinY = CARD_SHUFFLE_SPIN_DIRECTION * Math.PI;
        setCard(nextIndex, { preserveSpinVisuals: true });
      }

      if (progress >= 1) {
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function resetCardShuffleSpinVisualState() {
  cardShuffleSpinY = 0;
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

function toggleCurrentFavorite() {
  const key = favoriteKey(currentIndex);
  if (favorites.has(key)) {
    favorites.delete(key);
  } else {
    favorites.add(key);
  }
  saveSet("cardnft:favorites:v1", favorites);
  updateFavoriteButtons();
  if (galleryOpen) renderGallery();
}

function toggleTraitInfo() {
  setTraitInfoOpen(!traitsOpen);
}

function setTraitInfoOpen(open) {
  traitsOpen = Boolean(open) && !galleryOpen;
  els.body.classList.toggle("traits-open", traitsOpen);
  els.traitInfoButton.setAttribute("aria-expanded", String(traitsOpen));
  els.traitPanel.setAttribute("aria-hidden", String(!traitsOpen));
  if (traitsOpen) renderTraitPanel();
}

function renderTraitPanel() {
  if (!els.traitGrid) return;

  const traits = getCardTraitEntries(currentIndex);
  const fragment = document.createDocumentFragment();
  for (const trait of traits) {
    const tile = document.createElement("button");
    tile.className = "trait-tile";
    tile.type = "button";
    tile.title = `Show cards with ${trait.value}`;
    tile.addEventListener("click", () => openTraitFilteredGallery(trait));

    const category = document.createElement("div");
    category.className = "trait-category";
    category.textContent = trait.category;

    const value = document.createElement("div");
    value.className = "trait-value";
    value.textContent = trait.value;

    const count = document.createElement("div");
    count.className = "trait-total";
    const total = getTraitOccurrenceCount(trait.category, trait.value);
    count.textContent = `${total} total`;

    tile.append(category, value, count);
    fragment.append(tile);
  }

  if (!traits.length) {
    const tile = document.createElement("article");
    tile.className = "trait-tile trait-tile-empty";
    const value = document.createElement("div");
    value.className = "trait-value";
    value.textContent = "No visible traits";
    tile.append(value);
    fragment.append(tile);
  }

  els.traitGrid.replaceChildren(fragment);
}

async function downloadCurrentCardArt() {
  const card = CARDS[currentIndex];
  if (!card) return;

  const assetPath = cardAssetPath(card);
  const url = cardAssetUrl(card);
  const extension = getAssetExtension(assetPath);
  const fileName = `${sanitizeDownloadFileName(card.title || `card ${currentIndex + 1}`)}.${extension}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1200);
  } catch {
    triggerDownload(url, fileName);
  }
}

function triggerDownload(href, fileName) {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
}

function sanitizeDownloadFileName(value) {
  return String(value || "")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120) || "card-nft";
}

function getAssetExtension(path) {
  const extension = String(path || "").split("?")[0].split("#")[0].split(".").pop();
  return extension && extension.length <= 5 ? extension.toLowerCase() : "webp";
}

function openTraitFilteredGallery(trait) {
  applyTraitFilter(trait.category, trait.value);
}

function applyTraitFilter(category, value) {
  activeTraitFilter = {
    category,
    value,
    normalizedValue: normalizeTraitValue(value),
  };
  traitSortCategory = category;
  els.traitSortSelect.value = category;
  favoritesOnly = false;
  traitSearchOpen = false;
  resetTraitSearchQuery();
  setGalleryViewMode(true, { render: false });
  updateFavoriteButtons();
  updateTraitSearchState();
  resetBinderGalleryPosition();
  setGalleryOpen(true);
}

function getCardTraitEntries(index) {
  const values = CARD_NFT_TRAITS[index]?.values || [];
  return CARD_NFT_TRAIT_CATEGORIES
    .map((category, categoryIndex) => ({
      category,
      value: String(values[categoryIndex] || "").trim(),
    }))
    .filter(({ category, value }) => !HIDDEN_TRAIT_CATEGORIES.has(category) && isVisibleTraitValue(value));
}

function getTraitOccurrenceCount(category, value) {
  const categoryIndex = TRAIT_CATEGORY_INDEX.get(category);
  const normalizedValue = normalizeTraitValue(value);
  if (!Number.isInteger(categoryIndex) || !normalizedValue) return 0;

  return CARD_NFT_TRAITS.reduce((total, traitRecord) => (
    normalizeTraitValue(traitRecord?.values?.[categoryIndex]) === normalizedValue
      ? total + 1
      : total
  ), 0);
}

function toggleFocusedBinderFavorite() {
  const cardIndex = getFocusedBinderCardIndex();
  if (!Number.isInteger(cardIndex)) return;

  const key = favoriteKey(cardIndex);
  if (favorites.has(key)) {
    favorites.delete(key);
  } else {
    favorites.add(key);
  }
  saveSet("cardnft:favorites:v1", favorites);
  updateFavoriteButtons();
  updateBinderFavoriteButton();
  if (galleryOpen) renderGallery();
}

function canEditCardName() {
  return Boolean(
    CARDS.length
    && !galleryOpen
    && !cardSwapAnimating
    && !cardShuffleSpinAnimating
    && !binderCardViewTransitionActive
  );
}

function startCardNameEdit(event) {
  event?.preventDefault();
  event?.stopPropagation();
  if (!canEditCardName()) return;

  if (cardNameInput) {
    cardNameInput.focus();
    cardNameInput.select();
    return;
  }

  const input = document.createElement("input");
  input.className = "card-name-jump-input";
  input.type = "text";
  input.inputMode = "numeric";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.value = String(currentIndex + 1);
  input.setAttribute("aria-label", "Go to card number");
  input.addEventListener("keydown", onCardNameInputKeydown);
  input.addEventListener("blur", () => closeCardNameEdit());
  input.addEventListener("pointerdown", (inputEvent) => inputEvent.stopPropagation());
  input.addEventListener("dblclick", (inputEvent) => inputEvent.stopPropagation());

  cardNameInput = input;
  els.cardFileName.classList.remove("is-card-jump-enabled");
  els.cardFileName.classList.add("is-editing");
  els.cardFileName.replaceChildren(input);
  requestAnimationFrame(() => {
    if (cardNameInput !== input) return;
    input.focus();
    input.select();
  });
}

function onCardNameInputKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    submitCardNameEdit();
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeCardNameEdit();
  }
}

function submitCardNameEdit() {
  const input = cardNameInput;
  if (!input) return;

  const targetIndex = parseCardNameJumpValue(input.value);
  if (!Number.isInteger(targetIndex)) {
    input.focus();
    input.select();
    return;
  }

  closeCardNameEdit();
  if (targetIndex === currentIndex) {
    updateCardNameJumpState();
    return;
  }
  spinToCard(targetIndex).catch(console.error);
}

function parseCardNameJumpValue(value) {
  const parsed = parseCardJumpNumber(value);
  if (!Number.isInteger(parsed)) return null;
  return CARD_NFT_TITLE_NUMBER_TO_INDEX.get(parsed) ?? null;
}

function parseCardNumberJumpValue(value, total) {
  const parsed = parseCardJumpNumber(value);
  if (!Number.isFinite(parsed) || total < 1) return null;
  return clamp(parsed, 1, total) - 1;
}

function parseCardJumpNumber(value) {
  const match = String(value || "").match(/^\s*(?:card\s*)?#?\s*(\d+)\s*$/i);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}

function closeCardNameEdit({ update = true } = {}) {
  if (!cardNameInput) return;
  cardNameInput = null;
  els.cardFileName.classList.remove("is-editing");
  els.cardFileName.replaceChildren();
  if (update) {
    updateCardText();
  } else {
    updateCardNameJumpState();
  }
}

function updateCardNameJumpState() {
  if (!els.cardFileName) return;
  els.cardFileName.classList.toggle("is-card-jump-enabled", !cardNameInput && canEditCardName());
}

function updateCardText() {
  const card = CARDS[currentIndex];
  if (!cardNameInput) els.cardFileName.textContent = card?.title || "";
  updateCardNameJumpState();
  updateTraitExternalLinks();
}

function updateTraitExternalLinks() {
  const card = CARDS[currentIndex];
  const mint = String(card?.mint || "").trim();
  const title = card?.title || "card";
  updateExternalCardLink(els.traitTensorButton, mint, `${TENSOR_ITEM_URL_BASE}${encodeURIComponent(mint)}`, `Open ${title} on Tensor`);
  updateExternalCardLink(els.traitSolscanButton, mint, `${SOLSCAN_TOKEN_URL_BASE}${encodeURIComponent(mint)}`, `Open ${title} on Solscan`);
}

function updateExternalCardLink(link, mint, href, label) {
  if (!link) return;
  if (!mint) {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.tabIndex = -1;
    return;
  }
  link.href = href;
  link.title = label;
  link.setAttribute("aria-label", label);
  link.setAttribute("aria-disabled", "false");
  link.tabIndex = 0;
}

function updateFavoriteButtons() {
  const active = favorites.has(favoriteKey(currentIndex));
  els.favoriteButton.setAttribute("aria-pressed", String(active));
  els.favoriteFilterButton.setAttribute("aria-pressed", String(favoritesOnly));
}

function updateBinderFavoriteButton() {
  const cardIndex = getFocusedBinderCardIndex();
  const active = Number.isInteger(cardIndex) && favorites.has(favoriteKey(cardIndex));
  els.binderFavoriteButton.setAttribute("aria-pressed", String(active));
  els.binderFavoriteButton.setAttribute(
    "title",
    active ? "Remove focused card from favorites" : "Add focused card to favorites",
  );
  els.binderFavoriteButton.setAttribute(
    "aria-label",
    active ? "Remove focused card from favorites" : "Add focused card to favorites",
  );
}

function setGalleryOpen(open, options = {}) {
  resetViewSwitchWheelDistances();
  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  if (open) closeCardNameEdit({ update: false });
  if (!open) closeBinderPageStatusEdit({ update: false });
  if (options.resetFilters) resetGalleryFilters();
  galleryOpen = open;
  if (open) setTraitInfoOpen(false);
  deactivateAllAnimatedRecords();
  els.body.classList.toggle("is-gallery", open);
  els.galleryToggleButton.setAttribute("aria-pressed", String(open));
  els.galleryPanel.hidden = !open;
  updateTraitSearchState();
  if (open) {
    clearBinderFocus({ silent: true });
    snapBinderToWholePage();
    renderGallery();
    startBinderRenderLoop();
  } else {
    clearBinderFocus({ silent: true });
    snapBinderToWholePage();
    clearBinderIntroLinkCursor();
    stopBinderRenderLoop();
  }
  updateCardNameJumpState();
  queueSessionViewStateSave();
}

function resetGalleryFilters({ preserveFavorites = false } = {}) {
  activeTraitFilter = null;
  if (!preserveFavorites) favoritesOnly = false;
  traitSearchOpen = false;
  resetTraitSearchQuery();
  traitSortCategory = "all";
  resetWalletCardFilter();
  if (els.traitSortSelect) els.traitSortSelect.value = "all";
  updateFavoriteButtons();
  updateTraitSearchState();
}

function clearGallerySortAndFilters() {
  setTraitSortPickerOpen(false);
  resetGalleryFilters({ preserveFavorites: true });
  resetBinderGalleryPosition();
  renderGallery();
}

function toggleFavoriteFilter() {
  favoritesOnly = !favoritesOnly;
  traitSearchOpen = false;
  updateTraitSearchState();
  updateFavoriteButtons();
  resetBinderGalleryPosition();
  renderGallery();
}

function toggleTraitSearch() {
  traitSearchOpen = !traitSearchOpen;
  if (traitSearchOpen) {
    clearBinderFocus({ silent: true });
    deactivateAllAnimatedRecords();
  } else {
    resetTraitSearchQuery();
  }
  updateTraitSearchState();
  renderGallery();
}

function updateTraitSearchQuery() {
  traitSearchQuery = els.traitSearchInput.value;
  renderTraitSearch();
  els.traitSearchGroups.scrollTop = 0;
}

function resetTraitSearchQuery() {
  traitSearchQuery = "";
  if (els.traitSearchInput) els.traitSearchInput.value = "";
}

function updateTraitSearchState() {
  const open = galleryOpen && traitSearchOpen;
  els.body.classList.toggle("trait-search-open", open);
  els.traitSearchPanel.hidden = !open;
  els.traitSearchButton.setAttribute("aria-pressed", String(open));
  updateTraitSearchButtonLabel();
  if (open) {
    els.traitSearchInput.value = traitSearchQuery;
  }
  updateGalleryViewModeButton();
  updateWalletSearchState();
  updateGalleryFilterClearButton();
}

function updateGalleryFilterClearButton() {
  if (!els.galleryClearFiltersButton) return;

  const active = hasActiveGallerySortOrFilter();
  els.galleryClearFiltersButton.hidden = !galleryOpen || !active;
}

function hasActiveGallerySortOrFilter() {
  return Boolean(
    activeTraitFilter
    || walletFilterCardIndexSet
    || traitSortCategory !== "all"
  );
}

function hasActiveBinderIntroSuppressor() {
  return favoritesOnly || hasActiveGallerySortOrFilter();
}

function updateTraitSearchButtonLabel() {
  if (!els.traitSearchButton) return;

  const label = activeTraitFilter?.value || "traits";
  const labelElement = els.traitSearchButtonLabel || els.traitSearchButton;
  labelElement.textContent = label;
  els.traitSearchButton.classList.toggle("has-active-trait", Boolean(activeTraitFilter));
  els.traitSearchButton.title = activeTraitFilter
    ? `Selected trait: ${activeTraitFilter.value}`
    : "Search traits";
  els.traitSearchButton.setAttribute(
    "aria-label",
    activeTraitFilter ? `Selected trait: ${activeTraitFilter.value}` : "Search traits",
  );
}

function toggleWalletSearchPanel() {
  if (!walletSearchOpen && traitSearchOpen) {
    traitSearchOpen = false;
    resetTraitSearchQuery();
    updateTraitSearchState();
    renderGallery();
  }
  setWalletSearchPanelOpen(!walletSearchOpen);
}

function setWalletSearchPanelOpen(open, options = {}) {
  const nextOpen = Boolean(open) && galleryOpen;
  walletSearchOpen = nextOpen;
  if (els.walletSearchPanel) {
    els.walletSearchPanel.hidden = !nextOpen;
    els.walletSearchPanel.setAttribute("aria-hidden", String(!nextOpen));
    els.walletSearchPanel.setAttribute("aria-busy", String(walletSearchLoading && nextOpen));
  }
  if (els.walletSearchButton) {
    els.walletSearchButton.setAttribute("aria-expanded", String(nextOpen));
  }

  if (!nextOpen) {
    walletSearchToken += 1;
    setWalletSearchLoading(false);
    return;
  }

  if (!options.preserveMessage) {
    els.walletSearchMessage.textContent = WALLET_SEARCH_PROMPT;
  }
  setWalletSearchLoading(false);
  requestAnimationFrame(() => els.walletAddressInput.focus());
}

function updateWalletSearchState() {
  if (!els.walletSearchButton) return;

  const visible = galleryOpen;
  els.walletSearchButton.hidden = !visible;
  els.walletSearchButton.setAttribute("aria-pressed", String(Boolean(walletFilterCardIndexSet)));
  els.walletSearchButton.title = walletFilterCardIndexSet && walletFilterAddress
    ? `Wallet filter: ${shortenSolAddress(walletFilterAddress)}`
    : "Search wallet holdings";
  els.walletSearchButton.setAttribute("aria-label", "Search wallet holdings");

  if (!visible && walletSearchOpen) {
    setWalletSearchPanelOpen(false, { preserveMessage: true });
  }
}

function setWalletSearchLoading(loading) {
  walletSearchLoading = Boolean(loading);
  els.walletAddressInput.disabled = walletSearchLoading;
  els.walletSearchSubmitButton.disabled = walletSearchLoading;
  els.walletSearchPanel.setAttribute("aria-busy", String(walletSearchLoading && walletSearchOpen));
}

async function submitWalletSearch() {
  const address = els.walletAddressInput.value.trim();
  if (!isPossibleSolanaAddress(address)) {
    els.walletSearchMessage.textContent = WALLET_SEARCH_EMPTY_MESSAGE;
    els.walletAddressInput.focus();
    return;
  }

  const token = ++walletSearchToken;
  setWalletSearchLoading(true);
  els.walletSearchMessage.textContent = WALLET_SEARCH_BUSY_MESSAGE;

  try {
    const cardIndexes = await findWalletCardIndexes(address);
    if (token !== walletSearchToken) return;

    if (!cardIndexes.length) {
      els.walletSearchMessage.textContent = WALLET_SEARCH_EMPTY_MESSAGE;
      els.walletAddressInput.focus();
      return;
    }

    applyWalletCardFilter(address, cardIndexes);
    setWalletSearchPanelOpen(false, { preserveMessage: true });
  } catch {
    if (token !== walletSearchToken) return;
    els.walletSearchMessage.textContent = WALLET_SEARCH_ERROR_MESSAGE;
    els.walletAddressInput.focus();
  } finally {
    if (token === walletSearchToken) setWalletSearchLoading(false);
  }
}

function applyWalletCardFilter(address, cardIndexes) {
  walletFilterAddress = address;
  walletFilterCardIndexes = [...new Set(cardIndexes)].sort(compareCardIndexes);
  walletFilterCardIndexSet = new Set(walletFilterCardIndexes);
  favoritesOnly = false;
  activeTraitFilter = null;
  traitSearchOpen = false;
  resetTraitSearchQuery();
  traitSortCategory = "all";
  if (els.traitSortSelect) els.traitSortSelect.value = "all";
  setGalleryViewMode(true, { render: false });
  updateFavoriteButtons();
  updateTraitSearchState();
  resetBinderGalleryPosition();
  renderGallery();
}

function resetWalletCardFilter() {
  walletFilterCardIndexes = null;
  walletFilterCardIndexSet = null;
  walletFilterAddress = "";
  updateWalletSearchState();
}

async function findWalletCardIndexes(address) {
  const snapshotIndexes = getSnapshotWalletCardIndexes(address);
  if (snapshotIndexes.length) return snapshotIndexes;

  const magicEdenIndexes = await fetchMagicEdenWalletCardIndexes(address).catch(() => null);
  if (magicEdenIndexes?.length) return magicEdenIndexes;

  const tokenAccountIndexes = await fetchWalletTokenAccountCardIndexes(address).catch(() => null);
  if (tokenAccountIndexes?.length) return tokenAccountIndexes;
  return [];
}

function getSnapshotWalletCardIndexes(address) {
  return CARD_NFT_OWNER_TO_INDEXES.get(String(address || "").trim()) || [];
}

function buildCardNftOwnerIndex(snapshot) {
  const ownerIndex = new Map();
  const owners = snapshot?.owners;
  if (!owners || typeof owners !== "object") return ownerIndex;

  for (const [owner, cards] of Object.entries(owners)) {
    if (!owner || !Array.isArray(cards)) continue;
    const indexes = [];

    for (const card of cards) {
      const index = Number.isInteger(card)
        ? card
        : CARD_NFT_MINT_TO_INDEX.get(String(card || "").trim());
      if (Number.isInteger(index) && index >= 0 && index < CARDS.length) {
        indexes.push(index);
      }
    }

    if (indexes.length) {
      ownerIndex.set(owner, [...new Set(indexes)].sort(compareCardIndexes));
    }
  }

  return ownerIndex;
}

async function fetchMagicEdenWalletCardIndexes(address) {
  const indexes = [];
  let offset = 0;

  while (offset < MAGIC_EDEN_WALLET_MAX_TOKENS) {
    const tokens = await magicEdenApi(
      `/wallets/${encodeURIComponent(address)}/tokens?collection_symbol=${encodeURIComponent(CARD_NFT_COLLECTION_SYMBOL)}&offset=${offset}&limit=${MAGIC_EDEN_WALLET_PAGE_LIMIT}&listStatus=both`,
    );
    const page = Array.isArray(tokens) ? tokens : tokens?.results || [];

    for (const token of page) {
      const index = CARD_NFT_MINT_TO_INDEX.get(String(token?.mintAddress || "").trim());
      if (Number.isInteger(index)) indexes.push(index);
    }

    if (page.length < MAGIC_EDEN_WALLET_PAGE_LIMIT) break;
    offset += MAGIC_EDEN_WALLET_PAGE_LIMIT;
    await delay(MAGIC_EDEN_WALLET_PAGE_DELAY_MS);
  }

  return indexes;
}

async function fetchWalletTokenAccountCardIndexes(address) {
  const ownedMints = await fetchWalletTokenMints(address);
  return getCardIndexesForMints(ownedMints);
}

function getCardIndexesForMints(mints) {
  const indexes = [];
  for (const mint of mints) {
    const index = CARD_NFT_MINT_TO_INDEX.get(mint);
    if (Number.isInteger(index)) indexes.push(index);
  }
  return indexes;
}

async function magicEdenApi(path) {
  const response = await fetchWithTimeout(`${MAGIC_EDEN_API_URL}${path}`);
  if (!response.ok) throw new Error(`Magic Eden API failed: ${response.status}`);
  return response.json();
}

async function fetchWalletTokenMints(address) {
  const results = await Promise.all(SOLANA_TOKEN_PROGRAM_IDS.map((programId) => (
    solanaRpc("getParsedTokenAccountsByOwner", [
      address,
      { programId },
      { encoding: "jsonParsed", commitment: "confirmed" },
    ])
      .then((result) => ({ ok: true, result }))
      .catch(() => ({ ok: false, result: null }))
  )));
  if (!results.some((entry) => entry.ok)) {
    throw new Error("Solana RPC search failed");
  }

  const ownedMints = new Set();

  for (const { result } of results) {
    for (const entry of result?.value || []) {
      const mint = getOwnedTokenMint(entry);
      if (mint) ownedMints.add(mint);
    }
  }

  return ownedMints;
}

async function solanaRpc(method, params) {
  const response = await fetchWithTimeout(SOLANA_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${method}-${Date.now()}`,
      method,
      params,
    }),
  });
  if (!response.ok) throw new Error(`Solana RPC failed: ${response.status}`);

  const payload = await response.json();
  if (payload?.error) throw new Error(payload.error.message || "Solana RPC error");
  return payload.result;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WALLET_SEARCH_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function getOwnedTokenMint(entry) {
  const info = entry?.account?.data?.parsed?.info;
  if (!info?.mint || !hasPositiveTokenBalance(info?.tokenAmount)) return "";
  return String(info.mint);
}

function hasPositiveTokenBalance(tokenAmount) {
  try {
    return BigInt(String(tokenAmount?.amount || "0")) > 0n;
  } catch {
    return false;
  }
}

function isPossibleSolanaAddress(value) {
  return SOLANA_ADDRESS_PATTERN.test(String(value || "").trim());
}

function shortenSolAddress(value) {
  const address = String(value || "");
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function withWalletStatusLabel(value) {
  if (!walletFilterCardIndexSet || !walletFilterAddress) return value;
  return `${shortenSolAddress(walletFilterAddress)}\u00a0\u00a0\u00a0${value}`;
}

function resetBinderGalleryPosition() {
  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  binderTargetTurn = 0;
  binderTurn = 0;
  binderSinglePageSide = null;
  binderSinglePageSideTouched = false;
  binderFocusPosition = -1;
  binderTextureQueueKey = "";
}

function getVisibleIndexes() {
  let indexes = CARDS.map((_, index) => index);
  if (favoritesOnly) {
    indexes = indexes.filter((index) => favorites.has(favoriteKey(index)));
  }
  if (walletFilterCardIndexSet) {
    indexes = indexes.filter((index) => walletFilterCardIndexSet.has(index));
  }
  if (activeTraitFilter) {
    indexes = indexes.filter((index) => (
      normalizeTraitValue(getCardTraitValue(index, activeTraitFilter.category))
        === activeTraitFilter.normalizedValue
    ));
  }
  if (traitSortCategory === "all") return indexes;
  return getTraitGroupedIndexes(indexes, traitSortCategory);
}

function getTraitGroupedIndexes(indexes, category) {
  const groups = new Map();
  for (const index of indexes) {
    const value = getCardTraitValue(index, category);
    if (!isVisibleTraitValue(value)) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(index);
  }

  return [...groups.keys()]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
    .flatMap((value) => groups.get(value).sort(compareCardIndexes));
}

function getCardTraitValue(index, category) {
  const categoryIndex = TRAIT_CATEGORY_INDEX.get(category);
  if (!Number.isInteger(categoryIndex)) return "";
  return CARD_NFT_TRAITS[index]?.values?.[categoryIndex] || "";
}

function isVisibleTraitValue(value) {
  const normalized = normalizeTraitValue(value);
  return Boolean(normalized) && !EXCLUDED_SORT_TRAIT_VALUES.has(normalized);
}

function normalizeTraitValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getTraitSearchGroups() {
  return CARD_NFT_TRAIT_CATEGORIES
    .map((category, categoryIndex) => {
      if (HIDDEN_TRAIT_CATEGORIES.has(category)) return null;

      const traits = new Map();
      for (const traitRecord of CARD_NFT_TRAITS) {
        const value = String(traitRecord?.values?.[categoryIndex] || "").trim();
        if (!isVisibleTraitValue(value)) continue;

        const normalized = normalizeTraitValue(value);
        const existing = traits.get(normalized);
        if (existing) {
          existing.count += 1;
        } else {
          traits.set(normalized, { value, count: 1 });
        }
      }

      if (!traits.size) return null;
      return {
        category,
        total: traits.size,
        traits: [...traits.values()].sort((a, b) => (
          a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: "base" })
        )),
      };
    })
    .filter(Boolean);
}

function renderTraitSearch() {
  const groupFragment = document.createDocumentFragment();
  const sidebarFragment = document.createDocumentFragment();
  const query = normalizeTraitSearchQuery(traitSearchQuery);
  const groups = getFilteredTraitSearchGroups(getTraitSearchGroups(), query);

  if (!groups.length) {
    const empty = document.createElement("div");
    empty.className = "trait-search-empty";
    empty.textContent = "No traits found";
    els.traitSearchGroups.replaceChildren(empty);
    els.traitSearchSidebar.replaceChildren();
    return;
  }

  for (const group of groups) {
    const section = document.createElement("section");
    section.className = "trait-search-group";
    const sectionId = `trait-search-${slugifyTraitSearchId(group.category)}`;
    section.id = sectionId;

    const heading = document.createElement("h2");
    heading.className = "trait-search-heading";
    const headingCount = query
      ? `${group.traits.length} ${group.traits.length === 1 ? "match" : "matches"}`
      : `${group.total} total`;
    heading.textContent = `${group.category} (${headingCount})`;

    const jump = document.createElement("button");
    jump.className = "trait-search-sidebar-button";
    jump.type = "button";
    jump.textContent = group.category;
    jump.addEventListener("click", () => {
      section.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    sidebarFragment.append(jump);

    const grid = document.createElement("div");
    grid.className = "trait-search-tile-grid";

    for (const trait of group.traits) {
      const tile = document.createElement("button");
      tile.className = "trait-search-tile";
      tile.type = "button";
      tile.title = `Show cards with ${trait.value}`;
      tile.addEventListener("click", () => applyTraitFilter(group.category, trait.value));

      const value = document.createElement("div");
      value.className = "trait-search-value";
      value.textContent = trait.value;

      const count = document.createElement("div");
      count.className = "trait-search-count";
      count.textContent = `${trait.count} ${trait.count === 1 ? "card" : "cards"}`;

      tile.append(value, count);
      grid.append(tile);
    }

    section.append(heading, grid);
    groupFragment.append(section);
  }

  els.traitSearchGroups.replaceChildren(groupFragment);
  els.traitSearchSidebar.replaceChildren(sidebarFragment);
}

function getFilteredTraitSearchGroups(groups, query) {
  if (!query) return groups;

  return groups
    .map((group) => {
      const categoryMatches = normalizeTraitSearchQuery(group.category).includes(query);
      const traits = categoryMatches
        ? group.traits
        : group.traits.filter((trait) => (
          normalizeTraitSearchQuery(`${group.category} ${trait.value}`).includes(query)
        ));
      return traits.length ? { ...group, traits } : null;
    })
    .filter(Boolean);
}

function normalizeTraitSearchQuery(value) {
  return normalizeTraitValue(value).replace(/\s+/g, " ");
}

function slugifyTraitSearchId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "category";
}

function compareCardIndexes(a, b) {
  return titleNumber(CARDS[a]?.title) - titleNumber(CARDS[b]?.title)
    || String(CARDS[a]?.title || "").localeCompare(String(CARDS[b]?.title || ""), undefined, {
      numeric: true,
      sensitivity: "base",
    });
}

function titleNumber(title) {
  const match = String(title || "").match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function renderGallery() {
  updateTraitSearchState();
  updateGalleryViewModeButton();
  syncBinderIntroNoteModeTarget();
  if (traitSearchOpen) {
    renderTraitSearch();
    els.galleryEmpty.hidden = true;
    els.galleryGrid.hidden = true;
    els.binderPanel.hidden = true;
    els.binderPageControls.hidden = true;
    els.binderPageStatus.hidden = true;
    els.binderPageStatus.textContent = "";
    stopBinderRenderLoop();
    deactivateAllAnimatedRecords();
    queueSessionViewStateSave();
    return;
  }

  const indexes = getVisibleIndexes();
  const empty = indexes.length === 0;
  if (binderFocusPosition >= indexes.length) binderFocusPosition = -1;
  els.galleryEmpty.hidden = !empty;
  els.galleryEmpty.textContent = favoritesOnly ? "No favorites yet" : "No cards for this trait";
  els.favoriteFilterButton.setAttribute("aria-pressed", String(favoritesOnly));
  updateGalleryViewModeButton();

  if (empty) {
    els.galleryGrid.hidden = true;
    els.binderPanel.hidden = true;
    els.binderPageControls.hidden = true;
    els.binderPageStatus.hidden = true;
    els.binderPageStatus.textContent = "";
    queueSessionViewStateSave();
    return;
  }

  els.binderPanel.hidden = !isBinderMode;
  els.galleryGrid.hidden = isBinderMode;
  if (isBinderMode) {
    updateBinderItems(indexes);
    startBinderRenderLoop();
  } else {
    stopBinderRenderLoop();
    deactivateAllAnimatedRecords();
    renderGrid(indexes);
    updateBinderPageControls();
  }
  queueSessionViewStateSave();
}

function toggleGalleryViewMode() {
  setGalleryViewMode(!isBinderMode);
}

function setGalleryViewMode(useBinder, options = {}) {
  isBinderMode = Boolean(useBinder);
  if (!isBinderMode) closeBinderPageStatusEdit({ update: false });
  localStorage.setItem("cardnft:binderMode:v1", isBinderMode ? "binder" : "grid");
  updateGalleryViewModeButton();
  if (options.render === false || !galleryOpen) return;

  traitSearchOpen = false;
  resetTraitSearchQuery();
  updateTraitSearchState();
  deactivateAllAnimatedRecords();
  renderGallery();
}

function updateGalleryViewModeButton() {
  if (!els.galleryViewToggleButton) return;
  const showingSimpleGallery = !isBinderMode;
  els.body.classList.toggle("is-binder-view", isBinderMode);
  els.galleryViewToggleButton.hidden = !galleryOpen;
  els.galleryViewToggleButton.setAttribute("aria-pressed", String(showingSimpleGallery));
  els.galleryViewToggleButton.title = showingSimpleGallery ? "Show 3D binder" : "Show simple gallery";
  els.galleryViewToggleButton.setAttribute(
    "aria-label",
    showingSimpleGallery ? "Show 3D binder" : "Show simple gallery",
  );
}

function renderGrid(indexes) {
  closeBinderPageStatusEdit({ update: false });
  els.galleryGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const index of indexes) {
    const card = CARDS[index];
    const button = document.createElement("button");
    button.className = "gallery-card";
    button.type = "button";
    button.title = card.title;
    button.addEventListener("click", () => {
      setCard(index);
      setGalleryOpen(false);
    });

    const image = document.createElement("img");
    image.loading = "lazy";
    image.decoding = "async";
    image.alt = card.title;
    image.src = cardAssetUrl(card);
    button.append(image);
    fragment.append(button);
  }
  els.galleryGrid.append(fragment);
  els.binderPageStatus.textContent = withWalletStatusLabel(`${indexes.length} cards`);
}

function initBinderScene() {
  if (binderRenderer) return;

  binderRenderer = new THREE.WebGLRenderer({
    canvas: els.binderCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  binderRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  binderRenderer.outputColorSpace = THREE.SRGBColorSpace;
  binderRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  binderRenderer.toneMappingExposure = 0.96;
  binderRenderer.setClearColor(0x000000, 0);

  binderScene = new THREE.Scene();
  binderCamera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  binderCamera.up.set(0, 1, 0);

  const ambient = new THREE.HemisphereLight(0xffffff, 0x15110d, 1.38);
  binderScene.add(ambient);

  const key = new THREE.DirectionalLight(0xffefd1, 2.15);
  key.position.set(2.6, 4.3, 7.4);
  binderScene.add(key);

  const rim = new THREE.DirectionalLight(0x9ebfc6, 1.1);
  rim.position.set(-4.6, 2.1, 3.8);
  binderScene.add(rim);

  binderRoot = new THREE.Group();
  binderRoot.rotation.x = 0;
  binderRoot.position.y = 0.84;
  binderScene.add(binderRoot);

  warmBinderInteractionGeometry();
  resizeBinderRenderer();
}

function updateBinderItems(indexes) {
  initBinderScene();
  resizeBinderRenderer();

  const focusedCardIndex = getFocusedBinderCardIndex();
  binderVisibleIndexes = indexes.slice();
  if (Number.isInteger(focusedCardIndex)) {
    const nextFocusPosition = binderVisibleIndexes.indexOf(focusedCardIndex);
    if (nextFocusPosition === -1) {
      clearBinderFocus({ silent: true });
    } else {
      binderFocusPosition = nextFocusPosition;
      binderTargetTurn = getBinderTurnForPosition(binderFocusPosition);
    }
  } else if (binderFocusPosition >= binderVisibleIndexes.length) {
    clearBinderFocus({ silent: true });
  }

  const nextKey = indexes.map((index) => favoriteKey(index)).join("\u001f");
  if (nextKey === binderIndexesKey) {
    updateBinderPageControls();
    ensureBinderPageWindow();
    queueBinderTextureLoads(binderBuildToken, { force: true });
    return;
  }

  const token = ++binderBuildToken;
  binderIndexesKey = nextKey;
  els.binderLoading.hidden = false;

  clearBinderRoot();
  binderPageCount = Math.max(1, Math.ceil(indexes.length / BINDER_PAGE_SLOTS));
  binderPageWindowCenter = getDesiredBinderPageWindowCenter();
  binderRoot.add(createBinderModel(indexes, getBinderPlaceholderTexture()));
  if (isBinderFocused()) {
    binderTargetTurn = getBinderTurnForPosition(binderFocusPosition);
  }
  binderTargetTurn = clamp(binderTargetTurn, 0, binderPageCount);
  binderTurn = clamp(binderTurn, 0, binderPageCount);
  els.binderLoading.hidden = true;
  loadBinderBackTexture(token);
  updateBinderPageControls();
  resizeBinderRenderer();
  renderBinderSceneOnce({ includePreload: false });
  queueBinderTextureLoads(token, { force: true, includePreload: false });
  requestBinderMaintenance(BINDER_INITIAL_PRELOAD_IDLE_DELAY_MS);
}

function createBinderModel(indexes, placeholderTexture) {
  const model = new THREE.Group();
  model.add(createBinderShell());

  const materials = createBinderPageMaterials();
  const pageIndexes = getBinderPageWindowIndexes();
  binderPageWindowKey = pageIndexes.join(",");
  for (const pageIndex of pageIndexes) {
    const page = createBinderPage(pageIndex, indexes, placeholderTexture, materials);
    model.add(page.group);
    binderPages.push(page);
  }
  if (materials.plastic) materials.plastic.dispose();
  if (materials.seam) materials.seam.dispose();

  updateBinderPageTransforms();
  return model;
}

function createBinderShell() {
  const shell = new THREE.Group();
  binderIntroNoteGroup = null;
  binderIntroNoteMesh = null;
  binderIntroLinkMeshes = [];
  const coverMaterial = createBinderCoverMaterial();
  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x171615,
    roughness: 0.28,
    metalness: 0.68,
    clearcoat: 0.34,
    clearcoatRoughness: 0.22,
  });
  const coverWidth = BINDER_PAGE_WIDTH + BINDER_COVER_OVERHANG * 2;
  const coverHeight = BINDER_PAGE_HEIGHT + BINDER_COVER_VERTICAL_OVERHANG;
  const spineHeight = coverHeight - 0.26;
  const coverZ = -0.34;
  const backCoverGeometry = createRoundedCoreGeometry(coverWidth, coverHeight, 0.14, BINDER_COVER_RADIUS);
  const frontCoverGeometry = createRoundedCoreGeometry(coverWidth, coverHeight, 0.12, BINDER_COVER_RADIUS);

  const leftCover = new THREE.Mesh(backCoverGeometry, coverMaterial);
  leftCover.position.set(-BINDER_PAGE_WIDTH / 2 - BINDER_COVER_OVERHANG * 0.42, 0, coverZ);
  shell.add(leftCover);
  const introNote = createBinderIntroNote(coverWidth, coverHeight);
  introNote.position.set(leftCover.position.x, 0, coverZ + 0.14 / 2 + 0.008);
  shell.add(introNote);

  const rightCover = new THREE.Mesh(backCoverGeometry.clone(), coverMaterial.clone());
  rightCover.position.set(BINDER_PAGE_WIDTH / 2 + BINDER_COVER_OVERHANG * 0.42, 0, coverZ);
  shell.add(rightCover);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.42, spineHeight, 0.36, 1, 1, 2), coverMaterial.clone());
  spine.position.set(0, 0, coverZ + 0.04);
  shell.add(spine);

  const frontPivot = new THREE.Group();
  frontPivot.position.set(0, 0, -0.12);
  frontPivot.rotation.y = -2.78;
  const frontCover = new THREE.Mesh(frontCoverGeometry, coverMaterial.clone());
  frontCover.position.x = -coverWidth / 2;
  frontPivot.add(frontCover);
  shell.add(frontPivot);

  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, spineHeight * 0.94, 0.012),
    new THREE.MeshBasicMaterial({ color: 0x050505, depthWrite: true, depthTest: true }),
  );
  seam.position.set(0, 0, 0.075);
  shell.add(seam);

  for (const y of [-BINDER_PAGE_HEIGHT * 0.32, 0, BINDER_PAGE_HEIGHT * 0.32]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 12, 46), ringMaterial);
    ring.position.set(0, y, 0.065);
    ring.rotation.x = Math.PI / 2;
    ring.scale.x = 0.52;
    shell.add(ring);
  }

  return shell;
}

function createBinderIntroNote(coverWidth, coverHeight) {
  const noteWidth = coverWidth * 0.7;
  const noteHeight = coverHeight * 0.31;
  const { texture, linkBounds } = createBinderIntroNoteTexture();
  const note = new THREE.Group();

  const noteMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(noteWidth, noteHeight),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      toneMapped: false,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
    }),
  );
  noteMesh.renderOrder = 66;
  noteMesh.userData.binderIntroNoteText = true;
  note.add(noteMesh);
  for (const spriteMesh of createBinderIntroSpriteMeshes(coverWidth, coverHeight)) {
    note.add(spriteMesh);
  }
  binderIntroNoteGroup = note;
  binderIntroNoteMesh = noteMesh;

  const introLinkBounds = Array.isArray(linkBounds) ? linkBounds : [linkBounds];
  for (const bounds of introLinkBounds) {
    const linkWidth = noteWidth * bounds.width;
    const linkHeight = noteHeight * bounds.height;
    const linkHitbox = new THREE.Mesh(
      new THREE.PlaneGeometry(linkWidth, linkHeight),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
      }),
    );
    linkHitbox.position.set(
      noteWidth * (bounds.x + bounds.width / 2 - 0.5),
      noteHeight * (0.5 - bounds.y - bounds.height / 2),
      0.004,
    );
    linkHitbox.userData.binderIntroLinkUrl = bounds.url || BINDER_INTRO_LINK_URL;
    linkHitbox.renderOrder = 67;
    note.add(linkHitbox);
    binderIntroLinkMeshes.push(linkHitbox);
  }

  return note;
}

function createBinderIntroSpriteMeshes(coverWidth, coverHeight) {
  const textureLoader = new THREE.TextureLoader();
  return BINDER_INTRO_SPRITES.map((sprite) => {
    const size = coverHeight * sprite.sizeRatio;
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0.92,
      toneMapped: false,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
    });
    textureLoader.load(
      sprite.url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        material.map = texture;
        material.needsUpdate = true;
        requestBinderRenderOnce();
      },
    );

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    mesh.position.set(coverWidth * sprite.xRatio, coverHeight * sprite.yRatio, 0.006);
    mesh.renderOrder = 68;
    return mesh;
  });
}

function createBinderPageMaterials() {
  const plastic = new THREE.MeshBasicMaterial({
    color: 0xdceefa,
    transparent: true,
    opacity: BINDER_PLASTIC_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  });
  plastic.forceSinglePass = true;

  const seam = new THREE.MeshBasicMaterial({
    color: 0x111615,
    transparent: true,
    opacity: BINDER_SEAM_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  });
  seam.forceSinglePass = true;

  return { plastic, seam };
}

function createBinderPage(pageIndex, indexes, placeholderTexture, materials) {
  const group = new THREE.Group();
  group.position.set(0, 0, -pageIndex * BINDER_PAGE_STACK_GAP);
  group.userData.pageIndex = pageIndex;

  const cells = [];
  const cardMeshes = [];
  const columnPivots = createBinderColumnPivots(group);
  for (let row = 0; row < BINDER_ROWS; row += 1) {
    for (let column = 0; column < BINDER_COLUMNS; column += 1) {
      const frontSlot = row * BINDER_COLUMNS + column;
      const backSlot = getBackSideSlot(row, column);
      const cell = createBinderCell(row, column);
      const frontOffset = pageIndex * BINDER_PAGE_SLOTS + frontSlot;
      const backOffset = pageIndex * BINDER_PAGE_SLOTS + BINDER_SIDE_SLOTS + backSlot;
      const frontCardIndex = indexes[frontOffset];
      const backCardIndex = indexes[backOffset];
      const hasFrontCard = Number.isInteger(frontCardIndex);
      const hasBackCard = Number.isInteger(backCardIndex);

      if (hasFrontCard) {
        const card = createBinderCard(placeholderTexture, frontCardIndex, 1, frontOffset);
        cell.group.add(card);
        cardMeshes.push(card);
      }

      if (hasBackCard) {
        const card = createBinderCard(placeholderTexture, backCardIndex, -1, backOffset);
        cell.group.add(card);
        cardMeshes.push(card);
      } else if (hasFrontCard) {
        const card = createBinderBackCard(placeholderTexture);
        cell.group.add(card);
        cardMeshes.push(card);
      }

      addBinderCellToColumn(columnPivots, cell);
      cells.push(cell);
    }
  }

  addBinderPageSheets(group, columnPivots, materials);
  addBinderPageSeams(group, columnPivots, materials.seam);
  return {
    group,
    cells,
    cardMeshes,
    columnPivots,
    pageIndex,
    sheetMeshes: collectBinderSheetMeshes(group),
  };
}

function createBinderColumnPivots(group) {
  const middleCreaseX = getBinderColumnCreaseX(1);
  const outerCreaseX = getBinderColumnCreaseX(2);
  const middlePivot = new THREE.Group();
  const outerPivot = new THREE.Group();

  middlePivot.position.set(middleCreaseX, 0, 0);
  outerPivot.position.set(outerCreaseX - middleCreaseX, 0, 0);
  middlePivot.add(outerPivot);
  group.add(middlePivot);

  return [
    { group, anchorX: 0 },
    { group: middlePivot, anchorX: middleCreaseX },
    { group: outerPivot, anchorX: outerCreaseX },
  ];
}

function getBinderColumnCreaseX(column) {
  return BINDER_PAGE_INNER_MARGIN
    + column * BINDER_CELL_WIDTH
    + (column - 0.5) * BINDER_GRID_GAP;
}

function addBinderCellToColumn(columnPivots, cell) {
  const columnPivot = columnPivots[cell.column] || columnPivots[0];
  cell.group.position.x -= columnPivot.anchorX;
  columnPivot.group.add(cell.group);
}

function getBackSideSlot(row, column) {
  return row * BINDER_COLUMNS + (BINDER_COLUMNS - 1 - column);
}

function createBinderCell(row, column) {
  const group = new THREE.Group();
  const x = BINDER_PAGE_INNER_MARGIN
    + column * (BINDER_CELL_WIDTH + BINDER_GRID_GAP)
    + BINDER_CELL_WIDTH / 2;
  const y = BINDER_PAGE_HEIGHT / 2
    - BINDER_PAGE_VERTICAL_MARGIN
    - row * (BINDER_CELL_HEIGHT + BINDER_GRID_GAP)
    - BINDER_CELL_HEIGHT / 2;

  group.position.set(x, y, 0);
  return { group, row, column };
}

function addBinderPageSheets(group, columnPivots, materials) {
  const frostMaterial = new THREE.MeshBasicMaterial({
    color: 0xf4f8f4,
    map: createBinderSleeveFrostTexture(),
    transparent: true,
    opacity: BINDER_FROST_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  });
  frostMaterial.forceSinglePass = true;

  const glossMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: BINDER_GLOSS_REST_OPACITY,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
  });
  glossMaterial.forceSinglePass = true;

  for (let column = 0; column < BINDER_COLUMNS; column += 1) {
    const columnPivot = columnPivots[column] || columnPivots[0];
    const x = getBinderColumnSheetCenterX(column) - columnPivot.anchorX;

    const plasticMaterial = materials.plastic.clone();
    plasticMaterial.opacity = BINDER_PLASTIC_REST_OPACITY;
    const sheet = new THREE.Mesh(getBinderColumnSheetGeometry(), plasticMaterial);
    sheet.position.set(x, 0, 0.018);
    sheet.renderOrder = 5;
    markBinderSheetLayer(sheet, BINDER_PLASTIC_REST_OPACITY, BINDER_PLASTIC_ACTIVE_OPACITY);
    columnPivot.group.add(sheet);

    const frost = new THREE.Mesh(getBinderColumnSheetGeometry(), frostMaterial.clone());
    frost.position.set(x, 0, 0.049);
    frost.renderOrder = 17;
    markBinderSheetLayer(frost, BINDER_FROST_REST_OPACITY, BINDER_FROST_ACTIVE_OPACITY);
    columnPivot.group.add(frost);

    const gloss = new THREE.Mesh(getBinderColumnGlossGeometry(), glossMaterial.clone());
    gloss.position.set(x, 0, 0.052);
    gloss.renderOrder = 18;
    markBinderSheetLayer(gloss, BINDER_GLOSS_REST_OPACITY, BINDER_GLOSS_ACTIVE_OPACITY);
    columnPivot.group.add(gloss);
  }
}

function getBinderColumnSheetCenterX(column) {
  return BINDER_PAGE_INNER_MARGIN
    + column * (BINDER_CELL_WIDTH + BINDER_GRID_GAP)
    + BINDER_CELL_WIDTH / 2;
}

function getBinderCardGeometry() {
  if (!binderCardGeometry) {
    binderCardGeometry = createRoundedPlaneGeometry(BINDER_CARD_WIDTH, BINDER_CARD_HEIGHT, BINDER_CARD_RADIUS);
    binderCardGeometry.userData.sharedBinderGeometry = true;
  }
  return binderCardGeometry;
}

function getBinderColumnSheetGeometry() {
  if (!binderColumnSheetGeometry) {
    binderColumnSheetGeometry = new THREE.PlaneGeometry(BINDER_CELL_WIDTH, getBinderColumnSheetHeight(), 1, 1);
    binderColumnSheetGeometry.userData.sharedBinderGeometry = true;
  }
  return binderColumnSheetGeometry;
}

function getBinderColumnGlossGeometry() {
  if (!binderColumnGlossGeometry) {
    binderColumnGlossGeometry = new THREE.PlaneGeometry(
      BINDER_CELL_WIDTH * 0.92,
      getBinderColumnSheetHeight() * 0.95,
      1,
      1,
    );
    binderColumnGlossGeometry.userData.sharedBinderGeometry = true;
  }
  return binderColumnGlossGeometry;
}

function getBinderVerticalSeamGeometry() {
  if (!binderVerticalSeamGeometry) {
    binderVerticalSeamGeometry = new THREE.PlaneGeometry(
      0.014,
      BINDER_PAGE_HEIGHT - BINDER_PAGE_VERTICAL_MARGIN * 1.4,
      1,
      1,
    );
    binderVerticalSeamGeometry.userData.sharedBinderGeometry = true;
  }
  return binderVerticalSeamGeometry;
}

function getBinderHorizontalSeamGeometry() {
  if (!binderHorizontalSeamGeometry) {
    binderHorizontalSeamGeometry = new THREE.PlaneGeometry(BINDER_CELL_WIDTH, 0.014, 1, 1);
    binderHorizontalSeamGeometry.userData.sharedBinderGeometry = true;
  }
  return binderHorizontalSeamGeometry;
}

function warmBinderInteractionGeometry() {
  const geometries = [
    getBinderCardGeometry(),
    getBinderColumnSheetGeometry(),
    getBinderColumnGlossGeometry(),
    getBinderVerticalSeamGeometry(),
    getBinderHorizontalSeamGeometry(),
  ];

  for (const geometry of geometries) {
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    if (!geometry.boundingBox) geometry.computeBoundingBox();
  }
}

function getBinderColumnSheetHeight() {
  return BINDER_ROWS * BINDER_CELL_HEIGHT + (BINDER_ROWS - 1) * BINDER_GRID_GAP;
}

function addBinderPageSeams(group, columnPivots, seamMaterial) {
  for (let column = 1; column < BINDER_COLUMNS; column += 1) {
    const columnPivot = columnPivots[column];
    const material = seamMaterial.clone();
    material.opacity = BINDER_SEAM_REST_OPACITY;
    const seam = new THREE.Mesh(getBinderVerticalSeamGeometry(), material);
    seam.position.set(0, 0, 0.006);
    seam.renderOrder = 20;
    markBinderSheetLayer(seam, BINDER_SEAM_REST_OPACITY, BINDER_SEAM_ACTIVE_OPACITY);
    columnPivot.group.add(seam);
  }

  for (let row = 1; row < BINDER_ROWS; row += 1) {
    const y = BINDER_PAGE_HEIGHT / 2
      - BINDER_PAGE_VERTICAL_MARGIN
      - row * BINDER_CELL_HEIGHT
      - (row - 0.5) * BINDER_GRID_GAP;

    for (let column = 0; column < BINDER_COLUMNS; column += 1) {
      const columnPivot = columnPivots[column] || columnPivots[0];
      const material = seamMaterial.clone();
      material.opacity = BINDER_SEAM_REST_OPACITY;
      const seam = new THREE.Mesh(getBinderHorizontalSeamGeometry(), material);
      seam.position.set(
        BINDER_PAGE_INNER_MARGIN
          + column * (BINDER_CELL_WIDTH + BINDER_GRID_GAP)
          + BINDER_CELL_WIDTH / 2
          - columnPivot.anchorX,
        y,
        0.006,
      );
      seam.renderOrder = 20;
      markBinderSheetLayer(seam, BINDER_SEAM_REST_OPACITY, BINDER_SEAM_ACTIVE_OPACITY);
      columnPivot.group.add(seam);
    }
  }
}

function markBinderSheetLayer(mesh, restOpacity, activeOpacity) {
  mesh.userData.binderSheetLayer = true;
  mesh.userData.restOpacity = restOpacity;
  mesh.userData.activeOpacity = activeOpacity;
}

function collectBinderSheetMeshes(group) {
  const sheetMeshes = [];
  group.traverse((child) => {
    if (child.isMesh && child.userData.binderSheetLayer) {
      sheetMeshes.push(child);
    }
  });
  return sheetMeshes;
}

function createBinderCard(texture, cardIndex, side, binderPosition = -1) {
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.62,
    roughnessMap: createPaperRoughnessTexture(),
    metalness: 0.01,
    clearcoat: 0.2,
    clearcoatRoughness: 0.52,
    transparent: true,
    opacity: Number.isInteger(cardIndex) ? 0 : 1,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const card = new THREE.Mesh(getBinderCardGeometry(), material);

  card.position.z = side * BINDER_CARD_LIFT;
  if (side < 0) card.rotation.y = Math.PI;
  card.renderOrder = 12;
  if (Number.isInteger(cardIndex)) {
    card.userData.cardIndex = cardIndex;
    card.userData.binderPosition = binderPosition;
    card.userData.binderCard = true;
    card.userData.textureLoaded = false;
    binderCardMeshes.push(card);
    binderCardMeshByPosition.set(binderPosition, card);
  }
  return card;
}

function createBinderBackCard(texture) {
  const card = createBinderCard(texture, null, -1);
  card.userData.binderBackCard = true;
  return card;
}

function loadVisibleBinderTextures(token) {
  for (const position of getVisibleBinderPositions()) {
    loadBinderTextureForPosition(position, token, { renderOnApply: true, priority: 0 });
  }
}

function preloadBinderTextures(token) {
  const visiblePositions = getVisibleBinderPositions();
  for (const position of getBinderPreloadPositions()) {
    if (visiblePositions.has(position)) continue;
    const cardIndex = binderVisibleIndexes[position];
    const distance = getBinderPositionPageDistance(position);
    const isAnimated = isAnimatedCard(CARDS[cardIndex]);
    if (isAnimated && distance > BINDER_ANIMATED_PRELOAD_PAGE_RADIUS) continue;
    loadBinderTextureForPosition(position, token, {
      renderOnApply: false,
      priority: 10 + distance + (isAnimated ? 6 : 0),
    });
  }
}

function queueBinderTextureLoads(token, { force = false, includePreload = true } = {}) {
  if (!binderVisibleIndexes.length) return;

  const turn = clamp(binderTurn, 0, binderPageCount);
  const lowerTurn = Math.floor(turn);
  const isTurning = turn - lowerTurn > 0.001 && lowerTurn < binderPageCount;
  const targetTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  const focusPosition = isBinderFocused() ? binderFocusPosition : "";
  const queueKey = [
    binderPageWindowKey,
    lowerTurn,
    isTurning ? 1 : 0,
    targetTurn,
    focusPosition,
    binderVisibleIndexes.length,
    includePreload ? "preload" : "visible"
  ].join("|");

  if (!force && queueKey === binderTextureQueueKey) return;
  binderTextureQueueKey = queueKey;
  loadVisibleBinderTextures(token);
  if (includePreload) preloadBinderTextures(token);
}

function loadBinderTextureForPosition(position, token, { renderOnApply = false, priority = 20 } = {}) {
  const cardIndex = binderVisibleIndexes[position];
  if (!Number.isInteger(cardIndex)) return;

  const mesh = binderCardMeshByPosition.get(position);
  if (!mesh || mesh.userData.textureLoaded) return;
  if (mesh.userData.textureLoading) {
    mesh.userData.renderOnApply = mesh.userData.renderOnApply || renderOnApply;
    if (renderOnApply) promoteBinderTextureTask(position, priority);
    return;
  }

  mesh.userData.textureLoading = true;
  mesh.userData.renderOnApply = Boolean(renderOnApply);
  if (binderTextureQueuedPositions.has(position)) return;
  binderTextureQueuedPositions.add(position);
  binderTextureQueue.push({
    position,
    token,
    priority,
    animated: isAnimatedCard(CARDS[cardIndex]),
    sequence: binderTextureTaskSequence += 1
  });
  binderTextureQueue.sort((a, b) => a.priority - b.priority || a.sequence - b.sequence);
  pumpBinderTextureQueue();
}

function promoteBinderTextureTask(position, priority) {
  const task = binderTextureQueue.find((entry) => entry.position === position);
  if (!task || task.priority <= priority) return;
  task.priority = priority;
  task.sequence = binderTextureTaskSequence += 1;
  binderTextureQueue.sort((a, b) => a.priority - b.priority || a.sequence - b.sequence);
}

function pumpBinderTextureQueue() {
  if (isBinderTurnMoving()) {
    requestBinderMaintenance(120);
    return;
  }

  const concurrencyLimit = BINDER_TEXTURE_CONCURRENCY;
  while (binderTextureActiveLoads < concurrencyLimit && binderTextureQueue.length) {
    const taskIndex = binderTextureQueue.findIndex((entry) => (
      !entry.animated || binderTextureActiveAnimatedLoads < 1
    ));
    if (taskIndex === -1) break;
    const [task] = binderTextureQueue.splice(taskIndex, 1);
    binderTextureQueuedPositions.delete(task.position);
    binderTextureActiveLoads += 1;
    if (task.animated) binderTextureActiveAnimatedLoads += 1;
    loadQueuedBinderTexture(task);
  }
}

async function loadQueuedBinderTexture(task) {
  try {
    if (task.token !== binderBuildToken) return;
    const cardIndex = binderVisibleIndexes[task.position];
    const mesh = binderCardMeshByPosition.get(task.position);
    if (!Number.isInteger(cardIndex) || !mesh || mesh.userData.textureLoaded) return;

    const texture = await getBinderTexture(CARDS[cardIndex]);
    if (task.token !== binderBuildToken) return;
    const currentMesh = binderCardMeshByPosition.get(task.position);
    if (currentMesh) {
      if (isBinderTurnMoving()) {
        currentMesh.userData.textureLoading = false;
        requestBinderMaintenance(120);
        return;
      }

      prepareTextureForImmediateDisplay(texture);
      currentMesh.material.map = texture;
      currentMesh.material.opacity = 0;
      currentMesh.material.needsUpdate = true;
      currentMesh.userData.textureLoaded = true;
      currentMesh.userData.textureLoading = false;
      currentMesh.userData.textureFadeStartedAt = performance.now();
      currentMesh.userData.textureFadeComplete = false;
      const shouldRender = currentMesh.userData.renderOnApply || isBinderPositionVisible(task.position);
      currentMesh.userData.renderOnApply = false;
      if (shouldRender) {
        startBinderRenderLoop();
      }
    }
  } catch (error) {
    const currentMesh = binderCardMeshByPosition.get(task.position);
    if (currentMesh) currentMesh.userData.textureLoading = false;
    console.error(error);
  } finally {
    binderTextureActiveLoads = Math.max(0, binderTextureActiveLoads - 1);
    if (task.animated) {
      binderTextureActiveAnimatedLoads = Math.max(0, binderTextureActiveAnimatedLoads - 1);
    }
    pumpBinderTextureQueue();
  }
}

function loadBinderBackTexture(token) {
  getBackTexture().then((texture) => {
    if (token !== binderBuildToken) return;
    if (isBinderTurnMoving()) {
      requestBinderMaintenance(120);
      return;
    }
    binderRoot.traverse((child) => {
      if (!child.isMesh || !child.userData.binderBackCard) return;
      child.material.map = texture;
      child.material.needsUpdate = true;
    });
    requestBinderRenderOnce();
  }).catch(console.error);
}

function ensureBinderPageWindow({
  force = false,
  center = null,
  queueTextures = true,
  updateTransforms = true,
} = {}) {
  if (!binderRoot || !binderVisibleIndexes.length) return;

  const desiredCenter = Number.isFinite(center)
    ? clamp(Math.round(center), 0, Math.max(0, binderPageCount - 1))
    : getDesiredBinderPageWindowCenter();
  if (
    force
    || !binderPageWindowKey
    || Math.abs(desiredCenter - binderPageWindowCenter) > BINDER_PAGE_WINDOW_RECENTER_THRESHOLD
  ) {
    binderPageWindowCenter = desiredCenter;
  }

  const nextKey = getBinderPageWindowIndexes().join(",");
  if (nextKey === binderPageWindowKey) return;

  const desiredIndexes = getBinderPageWindowIndexes();
  const desiredPages = new Set(desiredIndexes);
  const existingPages = new Set(binderPages.map((page) => page.pageIndex));
  const pageParent = binderPages[0]?.group.parent || binderRoot;
  const placeholderTexture = getBinderPlaceholderTexture();
  const materials = createBinderPageMaterials();

  for (const pageIndex of desiredIndexes) {
    if (existingPages.has(pageIndex)) continue;
    const page = createBinderPage(pageIndex, binderVisibleIndexes, placeholderTexture, materials);
    pageParent.add(page.group);
    binderPages.push(page);
  }

  if (materials.plastic) materials.plastic.dispose();
  if (materials.seam) materials.seam.dispose();

  for (const page of binderPages.slice()) {
    if (desiredPages.has(page.pageIndex)) continue;
    removeBinderPage(page);
  }

  binderPages.sort((a, b) => a.pageIndex - b.pageIndex);
  binderPageWindowKey = desiredIndexes.join(",");
  binderTextureQueueKey = "";
  const token = binderBuildToken;
  loadBinderBackTexture(token);
  if (updateTransforms) updateBinderPageTransforms();
  if (queueTextures) queueBinderTextureLoads(token, { force: true });
}

function getDesiredBinderPageWindowCenter() {
  if (binderPageCount <= 1) return 0;
  if (isBinderFocused()) {
    return clamp(Math.floor(binderFocusPosition / BINDER_PAGE_SLOTS), 0, binderPageCount - 1);
  }

  const turn = Number.isFinite(binderTargetTurn) ? binderTargetTurn : binderTurn;
  const roundedTurn = Math.round(clamp(turn, 0, binderPageCount));
  return clamp(roundedTurn >= binderPageCount ? binderPageCount - 1 : roundedTurn, 0, binderPageCount - 1);
}

function getBinderPageWindowIndexes(center = binderPageWindowCenter, radius = BINDER_PAGE_WINDOW_RADIUS) {
  const pages = new Set();
  const addPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < binderPageCount) pages.add(pageIndex);
  };
  const pageCenter = clamp(Math.round(center), 0, Math.max(0, binderPageCount - 1));
  for (let pageIndex = pageCenter - radius; pageIndex <= pageCenter + radius; pageIndex += 1) {
    addPage(pageIndex);
  }

  if (isBinderFocused()) {
    const focusPage = Math.floor(binderFocusPosition / BINDER_PAGE_SLOTS);
    for (let pageIndex = focusPage - 1; pageIndex <= focusPage + 1; pageIndex += 1) {
      addPage(pageIndex);
    }
  }

  if (!pages.size) addPage(0);
  return Array.from(pages).sort((a, b) => a - b);
}

function getBinderPreloadPositions() {
  const positions = new Set(getVisibleBinderPositions());
  const addPage = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= binderPageCount) return;
    const start = pageIndex * BINDER_PAGE_SLOTS;
    const end = Math.min(start + BINDER_PAGE_SLOTS, binderVisibleIndexes.length);
    for (let position = start; position < end; position += 1) positions.add(position);
  };

  const center = getDesiredBinderPageWindowCenter();
  for (const pageIndex of getCenteredBinderPageOrder(center, BINDER_PRELOAD_PAGE_RADIUS)) {
    addPage(pageIndex);
  }

  if (isBinderFocused()) {
    addPage(Math.floor(binderFocusPosition / BINDER_PAGE_SLOTS));
  }

  return positions;
}

function getCenteredBinderPageOrder(center, radius) {
  const pageCenter = clamp(Math.round(center), 0, Math.max(0, binderPageCount - 1));
  const pageIndexes = [];
  for (let distance = 0; distance <= radius; distance += 1) {
    if (distance === 0) {
      pageIndexes.push(pageCenter);
    } else {
      pageIndexes.push(pageCenter + distance, pageCenter - distance);
    }
  }
  return pageIndexes;
}

function getBinderPositionPageDistance(position) {
  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  return Math.abs(pageIndex - getDesiredBinderPageWindowCenter());
}

function getVisibleBinderPositions() {
  const positions = new Set();
  const addSide = (pageIndex, backSide) => {
    if (pageIndex < 0 || pageIndex >= binderPageCount) return;
    const start = pageIndex * BINDER_PAGE_SLOTS + (backSide ? BINDER_SIDE_SLOTS : 0);
    for (let slot = 0; slot < BINDER_SIDE_SLOTS; slot += 1) {
      const position = start + slot;
      if (position < binderVisibleIndexes.length) positions.add(position);
    }
  };

  const turn = clamp(binderTurn, 0, binderPageCount);
  const lowerTurn = Math.floor(turn);
  const isTurning = turn - lowerTurn > 0.001 && lowerTurn < binderPageCount;
  if (isTurning) {
    addSide(lowerTurn, false);
    addSide(lowerTurn, true);
  }

  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  if (currentTurn <= 0) {
    addSide(0, false);
  } else if (currentTurn >= binderPageCount) {
    addSide(binderPageCount - 1, true);
  } else {
    addSide(currentTurn - 1, true);
    addSide(currentTurn, false);
  }

  if (isBinderFocused()) positions.add(binderFocusPosition);
  return positions;
}

function isBinderPositionVisible(position) {
  if (!Number.isInteger(position) || position < 0) return false;

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  const isBackSide = sideSlot >= BINDER_SIDE_SLOTS;
  const turn = clamp(binderTurn, 0, binderPageCount);
  const lowerTurn = Math.floor(turn);
  const isTurning = turn - lowerTurn > 0.001 && lowerTurn < binderPageCount;

  if (isTurning && pageIndex === lowerTurn) return true;

  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  return (
    (currentTurn <= 0 && pageIndex === 0 && !isBackSide)
    || (currentTurn >= binderPageCount && pageIndex === binderPageCount - 1 && isBackSide)
    || (pageIndex === currentTurn - 1 && isBackSide)
    || (pageIndex === currentTurn && !isBackSide)
    || (isBinderFocused() && position === binderFocusPosition)
  );
}

function clearBinderRoot() {
  if (!binderRoot) return;
  if (binderMaintenanceTimer) {
    window.clearTimeout(binderMaintenanceTimer);
    binderMaintenanceTimer = 0;
  }
  for (const child of binderRoot.children) disposeObject(child);
  binderRoot.clear();
  binderPages = [];
  binderCardMeshes = [];
  binderCardMeshByPosition = new Map();
  binderIntroNoteGroup = null;
  binderIntroNoteMesh = null;
  binderIntroLinkMeshes = [];
  clearBinderIntroLinkCursor();
  binderPageWindowKey = "";
  binderTextureQueueKey = "";
  binderTextureQueue.length = 0;
  binderTextureQueuedPositions.clear();
}

function removeBinderPage(page) {
  if (!page) return;
  binderPages = binderPages.filter((entry) => entry !== page);
  page.group.traverse((child) => {
    if (!child.isMesh || !child.userData.binderCard) return;
    const position = child.userData.binderPosition;
    if (Number.isInteger(position)) binderCardMeshByPosition.delete(position);
  });
  binderCardMeshes = binderCardMeshes.filter((mesh) => {
    const pageIndex = Math.floor((mesh.userData.binderPosition ?? -1) / BINDER_PAGE_SLOTS);
    return pageIndex !== page.pageIndex;
  });
  page.group.removeFromParent();
  disposeObject(page.group);
}

function disposeObject(object) {
  object.traverse((child) => {
    if (!child.isMesh) return;
    if (child.geometry && !child.geometry.userData?.sharedBinderGeometry) {
      child.geometry.dispose();
    }
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    for (const material of materials) {
      if (material) material.dispose();
    }
  });
}

function nextBinderPage() {
  turnBinderPage(1);
}

function previousBinderPage() {
  turnBinderPage(-1);
}

function turnBinderSinglePage(direction) {
  const totalSides = getBinderTotalPageSides();
  const currentSide = getBinderSinglePageSide();
  const nextSide = clamp(currentSide + direction, BINDER_SINGLE_PAGE_COVER_SIDE, totalSides - 1);
  if (nextSide === currentSide) return;

  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  binderSinglePageSide = nextSide;
  binderSinglePageSideTouched = true;
  const nextTurn = getBinderTurnForSinglePageSide(nextSide);
  if (nextTurn !== binderTargetTurn) binderBendDirection = Math.sign(nextTurn - binderTargetTurn) || binderBendDirection;
  binderTargetTurn = nextTurn;
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function turnBinderPage(direction) {
  if (!galleryOpen || !isBinderMode || binderPageCount < 1) return;

  if (isBinderFocused()) {
    moveBinderFocus(direction);
    return;
  }

  if (isBinderSinglePageView()) {
    turnBinderSinglePage(direction);
    return;
  }

  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  const currentPage = Math.round(binderTargetTurn);
  const nextTurn = clamp(currentPage + direction, 0, binderPageCount);
  if (nextTurn !== binderTargetTurn) {
    binderSinglePageSideTouched = true;
    binderBendDirection = Math.sign(nextTurn - binderTargetTurn);
  }
  binderTargetTurn = nextTurn;
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

async function shuffleBinderSpread() {
  if (!galleryOpen || !isBinderMode || isBinderFocused() || binderPageCount < 1) return;

  const currentPage = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  let nextTurn = currentPage;
  if (binderPageCount > 0) {
    while (nextTurn === currentPage) {
      nextTurn = Math.floor(Math.random() * (binderPageCount + 1));
    }
  }

  binderShuffleHistory.push(currentPage);
  if (binderShuffleHistory.length > SHUFFLE_HISTORY_LIMIT) binderShuffleHistory.shift();
  const loadingToken = beginBinderShuffleLoading();
  try {
    const moved = await prepareAndMoveBinderToSpreadAfterCardsLoad(nextTurn, currentPage, loadingToken);
    if (moved) await waitForBinderShuffleFlipDone(loadingToken, nextTurn);
  } finally {
    endBinderShuffleLoading(loadingToken);
  }
}

async function applyPreviousBinderSpread() {
  if (!galleryOpen || !isBinderMode || isBinderFocused()) return;

  const previousTurn = binderShuffleHistory.pop();
  if (Number.isInteger(previousTurn)) {
    const loadingToken = beginBinderShuffleLoading();
    try {
      const moved = await prepareAndMoveBinderToSpreadAfterCardsLoad(
        previousTurn,
        clamp(Math.round(binderTargetTurn), 0, binderPageCount),
        loadingToken,
      );
      if (moved) await waitForBinderShuffleFlipDone(loadingToken, previousTurn);
    } finally {
      endBinderShuffleLoading(loadingToken);
    }
  }
}

function beginBinderShuffleLoading() {
  const token = ++binderShuffleLoadingToken;
  setBinderShuffleLoading(true);
  return token;
}

function endBinderShuffleLoading(token) {
  if (token !== binderShuffleLoadingToken) return;
  setBinderShuffleLoading(false);
}

function setBinderShuffleLoading(loading) {
  els.binderShuffleButton.classList.toggle("is-loading", loading);
  els.binderShuffleButton.setAttribute("aria-busy", String(loading));
}

function waitForBinderShuffleFlipDone(token, turn) {
  const targetTurn = clamp(Math.round(turn), 0, binderPageCount);
  startBinderRenderLoop();

  return new Promise((resolve) => {
    const check = () => {
      if (token !== binderShuffleLoadingToken) {
        resolve();
        return;
      }

      const activeTarget = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
      const turnSettled = activeTarget === targetTurn
        && Math.abs(binderTargetTurn - binderTurn) <= 0.035
        && !binderDrag
        && !binderPreparingSpread;
      if (turnSettled) {
        resolve();
        return;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

function prepareAndMoveBinderToSpread(turn, currentPage) {
  const prepared = prepareBinderSpreadWindow(turn, currentPage);
  if (!prepared) return false;

  clearBinderSpreadPreparation(prepared.token);
  moveBinderToSpread(prepared.nextTurn, { startTurn: prepared.startTurn });
  queueBinderTextureLoads(binderBuildToken, { force: true, includePreload: false });
  requestBinderMaintenance(120);
  return true;
}

async function prepareAndMoveBinderToSpreadAfterCardsLoad(turn, currentPage, loadingToken) {
  const prepared = prepareBinderSpreadWindow(turn, currentPage);
  if (!prepared) return false;

  try {
    const positions = getBinderFlipReadyPositions(prepared.startTurn, prepared.nextTurn);
    queueBinderTextureLoadsForPositions(positions, binderBuildToken, { priority: -4 });
    const ready = await waitForBinderPositionsLoaded(positions, {
      loadingToken,
      preparationToken: prepared.token,
    });
    if (!ready || prepared.token !== binderSpreadPreparationToken) return false;

    clearBinderSpreadPreparation(prepared.token);
    moveBinderToSpread(prepared.nextTurn, { startTurn: prepared.startTurn });
    queueBinderTextureLoads(binderBuildToken, { force: true, includePreload: false });
    requestBinderMaintenance(120);
    return true;
  } finally {
    clearBinderSpreadPreparation(prepared.token);
  }
}

function prepareBinderSpreadWindow(turn, currentPage) {
  const nextTurn = clamp(Math.round(turn), 0, binderPageCount);
  if (nextTurn === clamp(Math.round(binderTargetTurn), 0, binderPageCount)) return null;

  const token = ++binderSpreadPreparationToken;
  const direction = Math.sign(nextTurn - currentPage) || 1;
  const startTurn = clamp(nextTurn - direction, 0, binderPageCount);

  binderPreparingSpread = true;
  ensureBinderPageWindow({
    force: true,
    center: getBinderPageWindowCenterForTurn(nextTurn),
    queueTextures: false,
    updateTransforms: false,
  });
  if (token !== binderSpreadPreparationToken) {
    clearBinderSpreadPreparation(token);
    return null;
  }

  return { nextTurn, startTurn, token };
}

function clearBinderSpreadPreparation(token) {
  if (token === binderSpreadPreparationToken) binderPreparingSpread = false;
}

function getBinderFlipReadyPositions(startTurn, targetTurn) {
  const positions = new Set();
  for (const position of getBinderSpreadPositionsForTurn(startTurn)) positions.add(position);
  for (const position of getBinderSpreadPositionsForTurn(targetTurn)) positions.add(position);
  return positions;
}

function getBinderSpreadPositionsForTurn(turn) {
  const positions = new Set();
  const addSide = (pageIndex, backSide) => {
    if (pageIndex < 0 || pageIndex >= binderPageCount) return;
    const start = pageIndex * BINDER_PAGE_SLOTS + (backSide ? BINDER_SIDE_SLOTS : 0);
    for (let slot = 0; slot < BINDER_SIDE_SLOTS; slot += 1) {
      const position = start + slot;
      if (position < binderVisibleIndexes.length) positions.add(position);
    }
  };

  const currentTurn = clamp(Math.round(turn), 0, binderPageCount);
  if (currentTurn <= 0) {
    addSide(0, false);
  } else if (currentTurn >= binderPageCount) {
    addSide(binderPageCount - 1, true);
  } else {
    addSide(currentTurn - 1, true);
    addSide(currentTurn, false);
  }

  return positions;
}

function queueBinderTextureLoadsForPositions(positions, token, { priority = 0 } = {}) {
  for (const position of positions) {
    loadBinderTextureForPosition(position, token, { renderOnApply: false, priority });
  }
}

function waitForBinderPositionsLoaded(positions, { loadingToken = null, preparationToken = null } = {}) {
  if (!positions.size || areBinderPositionsLoaded(positions)) return Promise.resolve(true);

  return new Promise((resolve) => {
    const check = () => {
      if (
        (Number.isInteger(loadingToken) && loadingToken !== binderShuffleLoadingToken)
        || (Number.isInteger(preparationToken) && preparationToken !== binderSpreadPreparationToken)
        || !galleryOpen
        || !isBinderMode
        || !binderVisibleIndexes.length
      ) {
        resolve(false);
        return;
      }

      queueBinderTextureLoadsForPositions(positions, binderBuildToken, { priority: -4 });
      if (areBinderPositionsLoaded(positions)) {
        resolve(true);
        return;
      }

      requestAnimationFrame(check);
    };

    requestAnimationFrame(check);
  });
}

function areBinderPositionsLoaded(positions) {
  for (const position of positions) {
    const cardIndex = binderVisibleIndexes[position];
    if (!Number.isInteger(cardIndex)) continue;

    const mesh = binderCardMeshByPosition.get(position);
    if (!mesh?.userData.textureLoaded) return false;
  }
  return true;
}

function getBinderPageWindowCenterForTurn(turn) {
  const roundedTurn = clamp(Math.round(turn), 0, binderPageCount);
  return clamp(roundedTurn >= binderPageCount ? binderPageCount - 1 : roundedTurn, 0, Math.max(0, binderPageCount - 1));
}

function moveBinderToSpread(turn, { startTurn = null } = {}) {
  const nextTurn = clamp(Math.round(turn), 0, binderPageCount);
  if (nextTurn !== binderTargetTurn) {
    binderBendDirection = Math.sign(nextTurn - binderTargetTurn) || binderBendDirection;
  }
  if (Number.isFinite(startTurn)) {
    binderTurn = clamp(startTurn, 0, binderPageCount);
    binderBendDirection = Math.sign(nextTurn - binderTurn) || binderBendDirection;
  }
  binderTargetTurn = nextTurn;
  if (isBinderSinglePageView()) binderSinglePageSide = deriveBinderSinglePageSideFromTurn(nextTurn);
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function canEditBinderPageStatus() {
  return Boolean(getBinderPageStatusEditMode());
}

function getBinderPageStatusEditMode() {
  const canEditBase = galleryOpen
    && isBinderMode
    && !traitSearchOpen
    && !els.binderPageStatus.hidden
    && binderPageCount >= 1;
  if (!canEditBase) return null;

  if (isBinderFocused()) return binderVisibleIndexes.length > 0 ? "focus-card" : null;
  if (!isBinderSinglePageView()) return "page";
  return null;
}

function startBinderPageStatusEdit(event) {
  event?.preventDefault();
  event?.stopPropagation();
  const editMode = getBinderPageStatusEditMode();
  if (!editMode) return;

  if (binderPageStatusInput) {
    binderPageStatusInput.focus();
    binderPageStatusInput.select();
    return;
  }

  const input = document.createElement("input");
  input.className = editMode === "focus-card"
    ? "binder-page-jump-input is-card-jump"
    : "binder-page-jump-input";
  input.type = "text";
  input.inputMode = editMode === "focus-card" ? "text" : "numeric";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.value = editMode === "focus-card"
    ? String(binderFocusPosition + 1)
    : String(getCurrentBinderPageStatusNumber());
  input.setAttribute("aria-label", editMode === "focus-card" ? "Go to binder card" : "Go to binder page");
  input.addEventListener("keydown", onBinderPageStatusInputKeydown);
  input.addEventListener("blur", () => closeBinderPageStatusEdit());
  input.addEventListener("pointerdown", (inputEvent) => inputEvent.stopPropagation());
  input.addEventListener("dblclick", (inputEvent) => inputEvent.stopPropagation());

  binderPageStatusInput = input;
  binderPageStatusEditMode = editMode;
  els.binderPageStatus.classList.remove("is-page-jump-enabled");
  els.binderPageStatus.classList.add("is-editing");
  els.binderPageStatus.classList.toggle("is-card-editing", editMode === "focus-card");
  els.binderPageStatus.replaceChildren(input);
  requestAnimationFrame(() => {
    if (binderPageStatusInput !== input) return;
    input.focus();
    input.select();
  });
}

function onBinderPageStatusInputKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    submitBinderPageStatusEdit();
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeBinderPageStatusEdit();
  }
}

function submitBinderPageStatusEdit() {
  const input = binderPageStatusInput;
  if (!input) return;

  const editMode = binderPageStatusEditMode;
  if (editMode === "focus-card") {
    const targetPosition = parseCardNumberJumpValue(input.value, binderVisibleIndexes.length);
    if (!Number.isInteger(targetPosition)) {
      input.focus();
      input.select();
      return;
    }

    closeBinderPageStatusEdit({ update: false });
    jumpFocusedBinderCard(targetPosition).catch(console.error);
    return;
  }

  const rawValue = input.value.trim();
  if (!/^\d+$/.test(rawValue)) {
    input.focus();
    input.select();
    return;
  }

  const totalSides = getBinderTotalPageSides();
  const pageNumber = clamp(Number.parseInt(rawValue, 10), 1, totalSides);
  const targetSide = pageNumber - 1;
  const nextTurn = getBinderTurnForSinglePageSide(targetSide);
  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  closeBinderPageStatusEdit({ update: false });
  binderSinglePageSide = targetSide;
  binderSinglePageSideTouched = true;

  if (nextTurn === currentTurn) {
    updateBinderPageControls();
    return;
  }

  const moved = prepareAndMoveBinderToSpread(nextTurn, currentTurn);
  if (!moved) updateBinderPageControls();
}

function closeBinderPageStatusEdit({ update = true } = {}) {
  if (!binderPageStatusInput) return;
  binderPageStatusInput = null;
  binderPageStatusEditMode = null;
  els.binderPageStatus.classList.remove("is-editing");
  els.binderPageStatus.classList.remove("is-card-editing");
  els.binderPageStatus.replaceChildren();
  if (update) updateBinderPageControls();
}

function getCurrentBinderPageStatusNumber() {
  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  const totalSides = getBinderTotalPageSides();
  if (currentTurn <= 0 || totalSides <= 1) return 1;
  if (currentTurn >= binderPageCount) return totalSides;
  return currentTurn * 2;
}

function updateBinderPageControls() {
  const controlsHidden = traitSearchOpen || !galleryOpen || !isBinderMode || els.binderPanel.hidden || binderPageCount < 1;
  els.binderPageControls.hidden = controlsHidden;
  els.binderPageStatus.hidden = controlsHidden;
  if (controlsHidden) {
    els.binderPageStatus.classList.remove("is-page-jump-enabled");
    closeBinderPageStatusEdit({ update: false });
    queueSessionViewStateSave();
    return;
  }

  const focused = isBinderFocused();
  if (binderPageStatusInput && !canEditBinderPageStatus()) closeBinderPageStatusEdit({ update: false });
  els.binderPageStatus.classList.toggle("is-page-jump-enabled", !binderPageStatusInput && canEditBinderPageStatus());
  els.binderPageControls.classList.toggle("is-focused", focused);
  els.binderZoomOutButton.hidden = !focused;
  els.binderOpenCardButton.hidden = !focused;
  els.binderFavoriteButton.hidden = !focused;
  els.binderShuffleButton.hidden = focused;
  updateBinderFavoriteButton();
  updateBinderPageStatus(focused);

  if (focused) {
    els.binderPreviousPageButton.disabled = binderFocusPosition <= 0;
    els.binderNextPageButton.disabled = binderFocusPosition >= binderVisibleIndexes.length - 1;
    els.binderPreviousPageButton.setAttribute("title", "Previous card in binder");
    els.binderPreviousPageButton.setAttribute("aria-label", "Previous card in binder");
    els.binderNextPageButton.setAttribute("title", "Next card in binder");
    els.binderNextPageButton.setAttribute("aria-label", "Next card in binder");
    queueSessionViewStateSave();
    return;
  }

  if (isBinderSinglePageView()) {
    const currentSide = getBinderSinglePageSide();
    els.binderPreviousPageButton.disabled = currentSide <= BINDER_SINGLE_PAGE_COVER_SIDE;
    els.binderNextPageButton.disabled = currentSide >= getBinderTotalPageSides() - 1;
    els.binderPreviousPageButton.setAttribute("title", "Previous binder page side");
    els.binderPreviousPageButton.setAttribute("aria-label", "Previous binder page side");
    els.binderNextPageButton.setAttribute("title", "Next binder page side");
    els.binderNextPageButton.setAttribute("aria-label", "Next binder page side");
    queueSessionViewStateSave();
    return;
  }

  const currentPage = Math.round(binderTargetTurn);
  els.binderPreviousPageButton.disabled = currentPage <= 0;
  els.binderNextPageButton.disabled = currentPage >= binderPageCount;
  els.binderPreviousPageButton.setAttribute("title", "Previous binder page");
  els.binderPreviousPageButton.setAttribute("aria-label", "Previous binder page");
  els.binderNextPageButton.setAttribute("title", "Next binder page");
  els.binderNextPageButton.setAttribute("aria-label", "Next binder page");
  queueSessionViewStateSave();
}

function updateBinderPageStatus(focused = isBinderFocused()) {
  if (binderPageStatusInput) return;

  if (focused) {
    els.binderPageStatus.textContent = withWalletStatusLabel(`${binderFocusPosition + 1} / ${binderVisibleIndexes.length}`);
    return;
  }

  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  const totalPageSides = Math.max(1, binderPageCount * 2);
  if (isBinderSinglePageView()) {
    const singlePageSide = getBinderSinglePageSide();
    const singlePageNumber = singlePageSide === BINDER_SINGLE_PAGE_COVER_SIDE
      ? 0
      : singlePageSide + 1;
    els.binderPageStatus.textContent = withWalletStatusLabel(`${singlePageNumber} / ${totalPageSides}`);
    return;
  }

  if (currentTurn <= 0 || totalPageSides <= 1) {
    els.binderPageStatus.textContent = withWalletStatusLabel(`1 / ${totalPageSides}`);
  } else if (currentTurn >= binderPageCount) {
    els.binderPageStatus.textContent = withWalletStatusLabel(`${totalPageSides} / ${totalPageSides}`);
  } else {
    const leftPageSide = currentTurn * 2;
    els.binderPageStatus.textContent = withWalletStatusLabel(`${leftPageSide}-${leftPageSide + 1} / ${totalPageSides}`);
  }
}

function isBinderFocused() {
  return binderFocusPosition >= 0 && binderFocusPosition < binderVisibleIndexes.length;
}

function getFocusedBinderCardIndex() {
  return isBinderFocused() ? binderVisibleIndexes[binderFocusPosition] : null;
}

function getBinderTurnForPosition(position) {
  if (!Number.isInteger(position) || position < 0) {
    return clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  }

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  return clamp(pageIndex + (sideSlot >= BINDER_SIDE_SLOTS ? 1 : 0), 0, binderPageCount);
}

function getBinderSinglePageSideForPosition(position) {
  if (!Number.isInteger(position) || position < 0) return null;

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  return clamp(
    pageIndex * 2 + (sideSlot >= BINDER_SIDE_SLOTS ? 1 : 0),
    0,
    getBinderTotalPageSides() - 1,
  );
}

function showBinderSinglePageSide(side, { immediate = false } = {}) {
  if (!Number.isInteger(side)) return false;

  const nextSide = clamp(side, BINDER_SINGLE_PAGE_COVER_SIDE, getBinderTotalPageSides() - 1);
  const nextTurn = getBinderTurnForSinglePageSide(nextSide);
  const changed = nextSide !== binderSinglePageSide || nextTurn !== clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  binderSinglePageSide = nextSide;
  binderSinglePageSideTouched = true;
  if (nextTurn !== binderTargetTurn) binderBendDirection = Math.sign(nextTurn - binderTargetTurn) || binderBendDirection;
  binderTargetTurn = nextTurn;
  if (immediate) binderTurn = nextTurn;

  if (changed || immediate) {
    markBinderInteractionActive();
    updateBinderPageControls();
    startBinderRenderLoop();
    updateBinderAnimation();
  }

  return true;
}

function isBinderSinglePageView(width = binderLastWidth, height = binderLastHeight) {
  return galleryOpen
    && isBinderMode
    && !isBinderFocused()
    && isBinderSinglePageViewport(width, height);
}

function isBinderSinglePageViewport(width = binderLastWidth, height = binderLastHeight) {
  const viewportWidth = width || window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = height || window.innerHeight || document.documentElement.clientHeight || 0;
  return viewportWidth <= 760 || viewportWidth / Math.max(1, viewportHeight) <= 0.86;
}

function getBinderTotalPageSides() {
  return Math.max(1, binderPageCount * 2);
}

function getBinderSinglePageSide() {
  const totalSides = getBinderTotalPageSides();
  if (Number.isInteger(binderSinglePageSide)) {
    binderSinglePageSide = clamp(binderSinglePageSide, BINDER_SINGLE_PAGE_COVER_SIDE, totalSides - 1);
    const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
    const isUntouchedFirstInsidePage = currentTurn <= 0
      && binderSinglePageSide === 0
      && !binderSinglePageSideTouched;
    if (
      !isUntouchedFirstInsidePage
      && getBinderTurnForSinglePageSide(binderSinglePageSide) === currentTurn
    ) {
      return binderSinglePageSide;
    }
  }

  binderSinglePageSide = deriveBinderSinglePageSideFromTurn(binderTargetTurn);
  return binderSinglePageSide;
}

function deriveBinderSinglePageSideFromTurn(turn = binderTargetTurn) {
  const totalSides = getBinderTotalPageSides();
  const currentTurn = clamp(Math.round(turn), 0, binderPageCount);
  if (currentTurn <= 0) {
    if (binderSinglePageSide === BINDER_SINGLE_PAGE_COVER_SIDE) return BINDER_SINGLE_PAGE_COVER_SIDE;
    return binderSinglePageSideTouched ? 0 : BINDER_SINGLE_PAGE_COVER_SIDE;
  }
  if (currentTurn >= binderPageCount) return totalSides - 1;

  const leftSide = currentTurn * 2 - 1;
  const rightSide = currentTurn * 2;
  if (binderSinglePageSide === leftSide || binderSinglePageSide === rightSide) {
    return binderSinglePageSide;
  }
  return clamp(binderBendDirection < 0 ? rightSide : leftSide, 0, totalSides - 1);
}

function getBinderTurnForSinglePageSide(side) {
  const clampedSide = clamp(Math.round(side), BINDER_SINGLE_PAGE_COVER_SIDE, getBinderTotalPageSides() - 1);
  if (clampedSide === BINDER_SINGLE_PAGE_COVER_SIDE) return 0;
  return clampedSide % 2 === 0
    ? clamp(clampedSide / 2, 0, binderPageCount)
    : clamp((clampedSide + 1) / 2, 0, binderPageCount);
}

function getBinderSinglePageCenterX(side = getBinderSinglePageSide()) {
  if (side === BINDER_SINGLE_PAGE_COVER_SIDE) return -BINDER_PAGE_WIDTH / 2;
  return side % 2 === 0 ? BINDER_PAGE_WIDTH / 2 : -BINDER_PAGE_WIDTH / 2;
}

function focusBinderPosition(position, { immediate = false } = {}) {
  if (!Number.isInteger(position) || position < 0 || position >= binderVisibleIndexes.length) return;

  markBinderInteractionActive();
  const nextTurn = getBinderTurnForPosition(position);
  if (nextTurn !== binderTargetTurn) binderBendDirection = Math.sign(nextTurn - binderTargetTurn);
  binderFocusPosition = position;
  binderSinglePageSide = getBinderSinglePageSideForPosition(position);
  binderSinglePageSideTouched = true;
  binderTargetTurn = nextTurn;
  binderTextureQueueKey = "";
  if (immediate) binderTurn = binderTargetTurn;
  els.body.classList.add("binder-focused");
  els.binderPanel.classList.add("is-focused");
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function clearBinderFocus(options = {}) {
  markBinderInteractionActive();
  const focusedSide = getBinderSinglePageSideForPosition(binderFocusPosition);
  binderFocusPosition = -1;
  binderLastOpenTap = null;
  els.body.classList.remove("binder-focused");
  els.binderPanel.classList.remove("is-focused");
  if (Number.isInteger(focusedSide)) {
    binderSinglePageSide = focusedSide;
    binderSinglePageSideTouched = true;
    binderTargetTurn = getBinderTurnForSinglePageSide(focusedSide);
  } else {
    binderTargetTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  }
  if (options.silent) return;
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function snapBinderToWholePage() {
  binderTargetTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  binderTurn = binderTargetTurn;
  binderWheelFocusLockUntil = 0;
}

function markBinderInteractionActive(duration = BINDER_INTERACTION_ACTIVE_MS) {
  binderInteractionActiveUntil = Math.max(
    binderInteractionActiveUntil,
    performance.now() + duration,
  );
}

function lockBinderFocusZoomOut(duration = BINDER_FOCUS_ZOOM_OUT_LOCK_MS) {
  binderFocusZoomOutLockUntil = Math.max(
    binderFocusZoomOutLockUntil,
    performance.now() + duration,
  );
}

function moveBinderFocus(direction) {
  const nextPosition = clamp(
    binderFocusPosition + direction,
    0,
    Math.max(0, binderVisibleIndexes.length - 1),
  );
  if (nextPosition === binderFocusPosition) return;
  focusBinderPosition(nextPosition);
}

async function jumpFocusedBinderCard(position) {
  if (!galleryOpen || !isBinderMode || !isBinderFocused() || !Number.isInteger(position)) return false;

  const nextPosition = clamp(position, 0, Math.max(0, binderVisibleIndexes.length - 1));
  if (nextPosition === binderFocusPosition) {
    updateBinderPageControls();
    return false;
  }

  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  const nextTurn = getBinderTurnForPosition(nextPosition);
  if (nextTurn === currentTurn) {
    focusBinderPosition(nextPosition);
    return true;
  }

  const loadingToken = beginBinderShuffleLoading();
  try {
    leaveBinderFocusForCardJump();
    const moved = prepareAndMoveBinderToSpread(nextTurn, currentTurn);
    if (moved) await waitForBinderShuffleFlipDone(loadingToken, nextTurn);
    focusBinderPosition(nextPosition);
    return true;
  } finally {
    endBinderShuffleLoading(loadingToken);
  }
}

function leaveBinderFocusForCardJump() {
  markBinderInteractionActive();
  binderFocusPosition = -1;
  binderLastOpenTap = null;
  binderSinglePageSide = null;
  els.body.classList.remove("binder-focused");
  els.binderPanel.classList.remove("is-focused");
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

async function openFocusedBinderCard() {
  if (binderCardViewTransitionActive || !isBinderFocused()) return;
  resetViewSwitchWheelDistances();

  const cardIndex = getFocusedBinderCardIndex();
  if (!Number.isInteger(cardIndex)) return;

  const focusedMesh = getBinderFocusedMesh();
  if (!focusedMesh) {
    resetIndividualCardZoom();
    setCard(cardIndex);
    binderFocusPosition = -1;
    setGalleryOpen(false);
    return;
  }

  await transitionFocusedBinderCardToIndividual(cardIndex, focusedMesh);
}

async function transitionIndividualCardToFocusedBinder() {
  if (binderCardViewTransitionActive || !Number.isInteger(currentIndex)) return;

  const cardIndex = currentIndex;
  lockBinderFocusZoomOut(BINDER_FOCUS_TRANSITION_LOCK_MS);
  const transitionCard = document.createElement("img");
  transitionCard.className = "binder-card-transition-card";
  transitionCard.alt = "";
  transitionCard.decoding = "async";
  transitionCard.src = getIndividualTransitionImageSource();

  const sourceRect = getIndividualCardScreenRect() || getCenteredFallbackRect();
  binderCardViewTransitionActive = true;
  els.body.classList.add(
    "binder-card-transitioning",
    "binder-card-transition-away",
    "binder-card-transition-show-card",
  );
  applyTransitionRect(transitionCard, sourceRect);
  document.body.append(transitionCard);
  transitionCard.getBoundingClientRect();

  try {
    const prepared = await openFocusedBinderGalleryForCard(cardIndex);
    const focusedMesh = prepared ? getBinderFocusedMesh() : null;
    renderBinderSceneOnce();
    const targetRect = getBinderMeshScreenRect(focusedMesh) || getCenteredFallbackRect();

    requestAnimationFrame(() => {
      els.body.classList.remove("binder-card-transition-away", "binder-card-transition-show-card");
      applyTransitionRect(transitionCard, targetRect);
    });

    await delay(BINDER_CARD_VIEW_TRANSITION_MS);
    transitionCard.classList.add("is-dissolving");
    lockBinderFocusZoomOut();
    await delay(220);
  } finally {
    transitionCard.remove();
    els.body.classList.remove(
      "binder-card-transitioning",
      "binder-card-transition-away",
      "binder-card-transition-show-card",
    );
    binderCardViewTransitionActive = false;
  }
}

async function openFocusedBinderGalleryForCard(cardIndex) {
  if (!Number.isInteger(cardIndex)) return false;

  traitSearchOpen = false;
  setGalleryViewMode(true, { render: false });
  galleryOpen = true;
  els.body.classList.add("is-gallery");
  els.galleryToggleButton.setAttribute("aria-pressed", "true");
  els.galleryPanel.hidden = false;
  updateFavoriteButtons();
  updateTraitSearchState();

  const indexes = getVisibleIndexes();
  els.galleryGrid.replaceChildren();
  els.galleryGrid.hidden = true;
  els.binderPanel.hidden = indexes.length === 0;
  els.galleryEmpty.hidden = indexes.length > 0;
  if (!indexes.length) {
    els.binderPageControls.hidden = true;
    els.binderPageStatus.hidden = true;
    stopBinderRenderLoop();
    return false;
  }

  els.binderPageControls.hidden = false;
  updateBinderItems(indexes);
  const focusPosition = binderVisibleIndexes.indexOf(cardIndex);
  if (focusPosition === -1) return false;

  focusBinderPosition(focusPosition, { immediate: true });
  renderBinderSceneOnce();
  return true;
}

async function transitionFocusedBinderCardToIndividual(cardIndex, focusedMesh) {
  binderCardViewTransitionActive = true;
  if (!focusedMesh.userData.textureLoaded) {
    await getBinderTexture(CARDS[cardIndex]).then((texture) => {
      prepareTextureForImmediateDisplay(texture);
      focusedMesh.material.map = texture;
      focusedMesh.material.opacity = getBinderPageOpacityForPosition(focusedMesh.userData.binderPosition);
      focusedMesh.material.needsUpdate = true;
      focusedMesh.userData.textureLoaded = true;
      focusedMesh.userData.textureLoading = false;
      renderBinderSceneOnce();
    }).catch(console.error);
  }

  const transitionCard = document.createElement("img");
  transitionCard.className = "binder-card-transition-card";
  transitionCard.alt = "";
  transitionCard.decoding = "async";
  transitionCard.src = getBinderTransitionImageSource(focusedMesh, cardIndex);

  const sourceRect = getBinderMeshScreenRect(focusedMesh) || getCenteredFallbackRect();
  els.body.classList.add("binder-card-transitioning");
  els.body.classList.remove("binder-card-transition-away", "binder-card-transition-show-card");
  applyTransitionRect(transitionCard, sourceRect);
  document.body.append(transitionCard);
  transitionCard.getBoundingClientRect();

  try {
    resetIndividualCardZoom();
    setCard(cardIndex);
    currentRotationX = 0;
    currentRotationY = 0;
    targetRotationX = 0;
    targetRotationY = 0;
    cardShuffleSpinY = 0;
    cardGroup.rotation.x = 0;
    cardGroup.rotation.y = 0;
    await getCardTexture(CARDS[cardIndex]).then((texture) => {
      prepareTextureForImmediateDisplay(texture);
      cardFrontMesh.material.map = texture;
      cardFrontMesh.material.needsUpdate = true;
    }).catch(console.error);
    resizeCardRenderer();
    cardRenderer.render(cardScene, cardCamera);

    const targetRect = getIndividualCardScreenRect() || getCenteredFallbackRect();
    requestAnimationFrame(() => {
      els.body.classList.add("binder-card-transition-away");
      applyTransitionRect(transitionCard, targetRect);
    });

    await delay(BINDER_CARD_VIEW_TRANSITION_MS * 0.46);
    els.body.classList.add("binder-card-transition-show-card");
    await delay(BINDER_CARD_VIEW_TRANSITION_MS * 0.54);

    binderFocusPosition = -1;
    setGalleryOpen(false);
    transitionCard.classList.add("is-dissolving");
    await delay(240);
  } finally {
    transitionCard.remove();
    els.body.classList.remove(
      "binder-card-transitioning",
      "binder-card-transition-away",
      "binder-card-transition-show-card",
    );
    binderCardViewTransitionActive = false;
  }
}

function getBinderTransitionImageSource(mesh, cardIndex) {
  const texture = mesh.material?.map;
  if (texture?.userData?.animatedRecord) return cardStillAssetUrl(CARDS[cardIndex]);

  const image = texture?.image;
  if (image?.toDataURL) {
    try {
      return image.toDataURL("image/png");
    } catch {
      // Fall through to the static asset when the canvas cannot be exported.
    }
  }
  return image?.currentSrc || image?.src || cardAssetUrl(CARDS[cardIndex]);
}

function getIndividualTransitionImageSource() {
  const texture = cardFrontMesh?.material?.map;
  if (texture?.userData?.animatedRecord) return cardStillAssetUrl(CARDS[currentIndex]);

  const image = texture?.image;
  if (image?.toDataURL) {
    try {
      return image.toDataURL("image/png");
    } catch {
      // Fall through to the static asset when the canvas cannot be exported.
    }
  }
  return image?.currentSrc || image?.src || cardAssetUrl(CARDS[currentIndex]);
}

function getBinderMeshScreenRect(mesh) {
  if (!mesh || !binderCamera || !els.binderCanvas || !binderRoot) return null;

  binderRoot.updateMatrixWorld(true);
  const canvasRect = els.binderCanvas.getBoundingClientRect();
  const corners = [
    new THREE.Vector3(-BINDER_CARD_WIDTH / 2, -BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(BINDER_CARD_WIDTH / 2, -BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(BINDER_CARD_WIDTH / 2, BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(-BINDER_CARD_WIDTH / 2, BINDER_CARD_HEIGHT / 2, 0),
  ].map((corner) => {
    const projected = corner.applyMatrix4(mesh.matrixWorld).project(binderCamera);
    return {
      x: canvasRect.left + (projected.x + 1) * canvasRect.width / 2,
      y: canvasRect.top + (1 - projected.y) * canvasRect.height / 2,
    };
  });

  const left = Math.min(...corners.map((corner) => corner.x));
  const right = Math.max(...corners.map((corner) => corner.x));
  const top = Math.min(...corners.map((corner) => corner.y));
  const bottom = Math.max(...corners.map((corner) => corner.y));
  if (right - left < 12 || bottom - top < 12) return null;

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function getIndividualCardScreenRect() {
  if (!cardGroup || !cardCamera || !els.cardCanvas) return null;

  cardGroup.updateMatrixWorld(true);
  const canvasRect = els.cardCanvas.getBoundingClientRect();
  const z = CARD_DEPTH / 2 + 0.006;
  const corners = [
    new THREE.Vector3(-CARD_WIDTH / 2, -CARD_HEIGHT / 2, z),
    new THREE.Vector3(CARD_WIDTH / 2, -CARD_HEIGHT / 2, z),
    new THREE.Vector3(CARD_WIDTH / 2, CARD_HEIGHT / 2, z),
    new THREE.Vector3(-CARD_WIDTH / 2, CARD_HEIGHT / 2, z),
  ].map((corner) => {
    const projected = corner.applyMatrix4(cardGroup.matrixWorld).project(cardCamera);
    return {
      x: canvasRect.left + (projected.x + 1) * canvasRect.width / 2,
      y: canvasRect.top + (1 - projected.y) * canvasRect.height / 2,
    };
  });

  const left = Math.min(...corners.map((corner) => corner.x));
  const right = Math.max(...corners.map((corner) => corner.x));
  const top = Math.min(...corners.map((corner) => corner.y));
  const bottom = Math.max(...corners.map((corner) => corner.y));
  if (right - left < 12 || bottom - top < 12) return null;

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function getCenteredFallbackRect() {
  const width = Math.min(window.innerWidth * 0.42, 360);
  const height = width * (CARD_HEIGHT / CARD_WIDTH);
  return {
    left: window.innerWidth / 2 - width / 2,
    top: window.innerHeight / 2 - height / 2,
    width,
    height,
  };
}

function applyTransitionRect(element, rect) {
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function onCardPointerDown(event) {
  if (cardSwapAnimating || cardShuffleSpinAnimating) return;
  els.cardCanvas.setPointerCapture(event.pointerId);
  const panMode = isCardPanMode();
  dragState = {
    pointerId: event.pointerId,
    mode: panMode ? "pan" : "rotate",
    x: event.clientX,
    y: event.clientY,
    rotationX: targetRotationX,
    rotationY: targetRotationY,
    panX: targetPanX,
    panY: targetPanY,
  };
}

function onCardPointerMove(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const dx = event.clientX - dragState.x;
  const dy = event.clientY - dragState.y;
  if (dragState.mode === "pan" || isCardPanMode()) {
    dragState.mode = "pan";
    targetRotationX = 0;
    targetRotationY = 0;
    const worldPerPixel = getCardWorldUnitsPerPixel();
    const limitedPan = clampCardPan(
      dragState.panX + dx * worldPerPixel.x,
      dragState.panY - dy * worldPerPixel.y,
    );
    targetPanX = limitedPan.x;
    targetPanY = limitedPan.y;
    return;
  }

  targetRotationY = dragState.rotationY + dx * 0.008;
  targetRotationX = clamp(dragState.rotationX + dy * 0.008, -1.2, 1.2);
}

function onCardPointerUp(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  dragState = null;
  if (!isCardPanMode()) {
    targetRotationX = 0;
    targetRotationY = 0;
  }
}

function onCardWheel(event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  const normalizedDelta = normalizeWheelDelta(event.deltaY || 0, event);

  if (
    normalizedDelta > 0
    && !galleryOpen
    && Number.isInteger(currentIndex)
    && !binderCardViewTransitionActive
  ) {
    if (isIndividualAtMaxZoomOut()) {
      if (addIndividualWheelOutDistance(normalizedDelta, performance.now())) {
        smoothZoomVelocity = 0;
        resetViewSwitchWheelDistances();
        transitionIndividualCardToFocusedBinder().catch(console.error);
        return;
      }
    } else {
      resetIndividualWheelOutDistance();
    }
  } else if (normalizedDelta < 0) {
    resetIndividualWheelOutDistance();
  }

  smoothZoomVelocity = clamp(
    smoothZoomVelocity + normalizedDelta * 0.000045,
    -0.18,
    0.18,
  );
}

function onBinderPointerDown(event) {
  if (!galleryOpen || !isBinderMode || binderPageCount < 1) return;

  clearBinderIntroLinkCursor();
  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  markBinderInteractionActive();
  initBinderScene();
  startBinderRenderLoop();
  els.binderCanvas.setPointerCapture(event.pointerId);
  binderDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    startTurn: binderTargetTurn,
    moved: false,
  };
  binderWheelFocusLockUntil = 0;
  event.preventDefault();
}

function onBinderPointerMove(event) {
  if (!binderDrag) {
    updateBinderIntroLinkCursor(event);
    return;
  }
  if (binderDrag.pointerId !== event.pointerId) return;

  clearBinderIntroLinkCursor();
  markBinderInteractionActive(420);
  const rect = els.binderCanvas.getBoundingClientRect();
  const deltaX = event.clientX - binderDrag.startX;
  const deltaY = event.clientY - binderDrag.startY;
  binderDrag.lastX = event.clientX;
  binderDrag.moved = binderDrag.moved || Math.hypot(deltaX, deltaY) > 7;

  if (!isBinderFocused()) {
    const pageDelta = -(deltaX / Math.max(rect.width, 1)) / 0.26;
    binderTargetTurn = clamp(binderDrag.startTurn + pageDelta, 0, binderPageCount);
    if (Math.abs(pageDelta) > 0.002) {
      binderSinglePageSideTouched = true;
      binderBendDirection = Math.sign(pageDelta);
    }
    binderTurn = binderTargetTurn;
    updateBinderPageTransforms();
    updateBinderPageControls();
    renderBinderSceneOnce();
  }
  event.preventDefault();
}

function onBinderPointerUp(event) {
  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;

  markBinderInteractionActive();
  const wasClick = !binderDrag.moved;
  binderDrag = null;
  if (els.binderCanvas.hasPointerCapture(event.pointerId)) {
    els.binderCanvas.releasePointerCapture(event.pointerId);
  }

  if (wasClick) {
    if (handleBinderIntroLinkTap(event)) return;
    if (handleFocusedBinderCardTap(event)) return;
    if (selectBinderCard(event)) return;
    handleFocusedBinderBackgroundTap(event);
  } else if (!isBinderFocused()) {
    binderTargetTurn = Math.round(binderTargetTurn);
    if (isBinderSinglePageView()) binderSinglePageSide = deriveBinderSinglePageSideFromTurn(binderTargetTurn);
    updateBinderPageControls();
    startBinderRenderLoop();
  }
}

function onBinderPointerCancel(event) {
  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;
  markBinderInteractionActive();
  binderDrag = null;
  if (!isBinderFocused()) binderTargetTurn = Math.round(binderTargetTurn);
  if (!isBinderFocused() && isBinderSinglePageView()) binderSinglePageSide = deriveBinderSinglePageSideFromTurn(binderTargetTurn);
  updateBinderPageControls();
  startBinderRenderLoop();
}

function handleBinderWheel(event) {
  if (!galleryOpen || !isBinderMode || binderPageCount < 1) return;

  event.preventDefault();
  markBinderInteractionActive();
  const wheelDelta = getDominantNormalizedWheelDelta(event);
  if (Math.abs(wheelDelta) < 0.5) return;

  const now = performance.now();
  if (now < binderWheelFocusLockUntil) return;

  if (isBinderFocused()) {
    if (wheelDelta < 0) {
      if (addBinderFocusWheelInDistance(-wheelDelta, now)) {
        binderWheelFocusLockUntil = now + BINDER_CARD_VIEW_TRANSITION_MS + BINDER_TO_CARD_SCROLL_LOCK_BUFFER_MS;
        resetViewSwitchWheelDistances();
        openFocusedBinderCard().catch(console.error);
      }
      return;
    }

    resetBinderFocusWheelInDistance();
    if (binderCardViewTransitionActive || now < binderFocusZoomOutLockUntil) {
      return;
    }
    binderWheelFocusLockUntil = now + 700;
    clearBinderFocus();
    return;
  }

  resetBinderFocusWheelInDistance();
  if (wheelDelta >= 0) return;
  const hit = getBinderCardHit(event);
  if (!hit) return;

  binderWheelFocusLockUntil = now + 700;
  focusBinderPosition(hit.object.userData.binderPosition);
}

function selectBinderCard(event) {
  const hit = getBinderCardHit(event);
  if (!hit) return false;
  const position = hit.object.userData.binderPosition;
  if (showOtherVisibleBinderSinglePageSide(position)) return true;
  focusBinderPosition(position);
  rememberBinderOpenTap(event, position);
  return true;
}

function handleBinderIntroLinkTap(event) {
  const hit = getBinderIntroLinkHit(event);
  if (!hit) return false;

  window.open(hit.object.userData.binderIntroLinkUrl || BINDER_INTRO_LINK_URL, "_blank", "noopener,noreferrer");
  return true;
}

function updateBinderIntroLinkCursor(event) {
  if (event.pointerType && event.pointerType !== "mouse") {
    clearBinderIntroLinkCursor();
    return;
  }
  els.binderCanvas.style.cursor = getBinderIntroLinkHit(event) ? "pointer" : "";
}

function clearBinderIntroLinkCursor() {
  if (els.binderCanvas) els.binderCanvas.style.cursor = "";
}

function getBinderIntroLinkHit(event) {
  if (!binderCamera || !binderIntroLinkMeshes.length) return null;
  if (Math.abs(binderTurn) > 0.08 || Math.abs(binderTargetTurn) > 0.08) return null;

  const meshes = binderIntroLinkMeshes.filter((mesh) => (
    mesh.userData.binderIntroLinkUrl
    && isVisibleThroughParents(mesh)
  ));
  if (!meshes.length) return null;

  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(meshes, false)[0] || null;
}

function showOtherVisibleBinderSinglePageSide(position) {
  if (!isBinderSinglePageView()) return false;

  const side = getBinderSinglePageSideForPosition(position);
  if (!Number.isInteger(side) || side === getBinderSinglePageSide()) return false;

  binderLastOpenTap = null;
  return showBinderSinglePageSide(side);
}

function handleFocusedBinderCardTap(event) {
  if (!isBinderFocused()) return false;

  const hit = getBinderCardHit(event);
  const position = hit?.object?.userData?.binderPosition;
  if (position !== binderFocusPosition) {
    binderLastOpenTap = null;
    return false;
  }

  const now = performance.now();
  const lastTap = binderLastOpenTap;
  rememberBinderOpenTap(event, position, now);

  if (
    lastTap
    && lastTap.position === position
    && now - lastTap.time <= BINDER_DOUBLE_TAP_MS
    && Math.hypot(event.clientX - lastTap.x, event.clientY - lastTap.y) <= BINDER_DOUBLE_TAP_DISTANCE
  ) {
    binderLastOpenTap = null;
    openFocusedBinderCard().catch(console.error);
    return true;
  }

  return false;
}

function handleFocusedBinderBackgroundTap(event) {
  if (!isBinderFocused() || binderCardViewTransitionActive) return false;
  if (getBinderObjectHit(event)) return false;

  binderLastOpenTap = null;
  clearBinderFocus();
  return true;
}

function rememberBinderOpenTap(event, position, time = performance.now()) {
  binderLastOpenTap = {
    position,
    time,
    x: event.clientX,
    y: event.clientY,
  };
}

function openFocusedBinderCardFromPointer(event) {
  if (!isBinderFocused() || binderCardViewTransitionActive) return;

  const hit = getBinderCardHit(event);
  if (hit?.object?.userData?.binderPosition !== binderFocusPosition) return;

  event.preventDefault();
  binderLastOpenTap = null;
  openFocusedBinderCard().catch(console.error);
}

function getBinderCardHit(event) {
  if (!binderCamera || !binderCardMeshes.length) return null;

  const cardMeshes = getBinderCardRaycastMeshes();
  if (!cardMeshes.length) return null;
  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(cardMeshes, false)[0] || null;
}

function getBinderCardRaycastMeshes() {
  return binderCardMeshes.filter((mesh) => (
    Number.isInteger(mesh.userData.cardIndex)
    && isVisibleThroughParents(mesh)
    && isBinderCardOnCurrentPages(mesh)
  ));
}

function getBinderObjectHit(event) {
  if (!binderCamera || !binderRoot) return null;

  const meshes = [];
  binderRoot.traverse((child) => {
    if (child.isMesh && isVisibleThroughParents(child)) meshes.push(child);
  });
  if (!meshes.length) return null;

  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(meshes, false)[0] || null;
}

function setBinderRaycasterFromEvent(event) {
  const rect = els.binderCanvas.getBoundingClientRect();
  binderPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  binderPointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  binderRaycaster.setFromCamera(binderPointer, binderCamera);
}

function isVisibleThroughParents(object) {
  let current = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}

function isBinderCardOnCurrentPages(mesh) {
  const position = mesh?.userData?.binderPosition;
  if (!Number.isInteger(position) || position < 0) return false;

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  const isBackSide = sideSlot >= BINDER_SIDE_SLOTS;
  const turn = clamp(binderTurn, 0, binderPageCount);
  const lowerTurn = Math.floor(turn);
  const isTurning = turn - lowerTurn > 0.001 && lowerTurn < binderPageCount;

  if (isTurning && pageIndex === lowerTurn) return true;

  const currentPage = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  return (
    (pageIndex === currentPage - 1 && isBackSide)
    || (pageIndex === currentPage && !isBackSide)
  );
}

function animateCard() {
  requestAnimationFrame(animateCard);
  resizeCardRenderer();
  updateSmoothZoom();
  currentRotationX += (targetRotationX - currentRotationX) * 0.14;
  currentRotationY += (targetRotationY - currentRotationY) * 0.14;
  cardGroup.rotation.x = currentRotationX;
  cardGroup.rotation.y = currentRotationY + cardShuffleSpinY;
  cardGroup.scale.setScalar(getResponsiveIndividualCardScale());
  targetCardOffsetX = getTraitCardOffsetX();
  currentCardOffsetX += (targetCardOffsetX - currentCardOffsetX) * 0.16;
  if (Math.abs(currentCardOffsetX) < 0.001 && targetCardOffsetX === 0) currentCardOffsetX = 0;
  currentCameraZ += (targetCameraZ - currentCameraZ) * 0.12;
  cardCamera.position.z = currentCameraZ;
  updateCardPan();
  cardGroup.position.x = currentCardOffsetX + currentPanX + cardSwapOffsetX;
  cardGroup.position.y = INDIVIDUAL_CARD_WORLD_Y + currentPanY;
  updateCardSwapIncomingTransform();
  applyCardSwapOpacity();
  updateCardGlossActivity();
  updateCardGlossUniforms(cardGradientMesh);
  updateCardGlossUniforms(cardBackGradientMesh);
  updateCardGlossUniforms(cardGlareMesh);
  updateCardGlossUniforms(cardBackGlareMesh);
  if (!galleryOpen) {
    updateAnimatedTextureRecords(getIndividualAnimatedTextureRecords());
  }
  cardRenderer.render(cardScene, cardCamera);
}

function getTraitCardOffsetX() {
  if (!traitsOpen || galleryOpen || isTraitPanelCompact()) return 0;

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportWidth < 820 || viewportWidth / Math.max(1, viewportHeight) < 1.12) return 0;

  const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(cardCamera.fov) / 2) * currentCameraZ;
  const visibleWidth = visibleHeight * cardCamera.aspect;
  const pixelShift = clamp(viewportWidth * 0.2, 190, 330);
  return -(visibleWidth * pixelShift) / Math.max(1, viewportWidth);
}

function updateCardPan() {
  if (isCardPanMode()) {
    targetRotationX += (0 - targetRotationX) * 0.16;
    targetRotationY += (0 - targetRotationY) * 0.16;
    const limitedPan = clampCardPan(targetPanX, targetPanY);
    targetPanX = limitedPan.x;
    targetPanY = limitedPan.y;
  } else {
    resetCardPan(false);
  }

  currentPanX += (targetPanX - currentPanX) * 0.18;
  currentPanY += (targetPanY - currentPanY) * 0.18;
  if (Math.abs(currentPanX) < 0.001 && targetPanX === 0) currentPanX = 0;
  if (Math.abs(currentPanY) < 0.001 && targetPanY === 0) currentPanY = 0;
}

function isCardPanMode() {
  return currentCameraZ <= CARD_PAN_MODE_Z || targetCameraZ <= CARD_PAN_MODE_Z;
}

function resetCardPan(immediate = false) {
  targetPanX = 0;
  targetPanY = 0;
  if (immediate) {
    currentPanX = 0;
    currentPanY = 0;
  }
}

function resetIndividualCardZoom() {
  targetCameraZ = CARD_CAMERA_DEFAULT_Z;
  currentCameraZ = CARD_CAMERA_DEFAULT_Z;
  smoothZoomVelocity = 0;
  resetCardPan(true);
  if (cardCamera) {
    cardCamera.position.z = CARD_CAMERA_DEFAULT_Z;
    cardCamera.updateMatrixWorld(true);
  }
  if (cardGroup) {
    cardGroup.scale.setScalar(getResponsiveIndividualCardScale());
    cardGroup.position.x = getTraitCardOffsetX();
    cardGroup.position.y = INDIVIDUAL_CARD_WORLD_Y;
    cardGroup.updateMatrixWorld(true);
  }
}

function clampCardPan(x, y) {
  const view = getCardVisibleWorldSize();
  const cardScale = getResponsiveIndividualCardScale();
  const maxX = Math.max(0, (CARD_WIDTH * cardScale) / 2 + CARD_PAN_VISIBLE_MARGIN - view.width / 2);
  const maxY = Math.max(0, (CARD_HEIGHT * cardScale) / 2 + CARD_PAN_VISIBLE_MARGIN - view.height / 2);
  return {
    x: clamp(x, -maxX, maxX),
    y: clamp(y, -maxY, maxY),
  };
}

function getResponsiveIndividualCardScale() {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || CARD_MOBILE_SCALE_FULL_WIDTH;
  const progress = clamp(
    (viewportWidth - CARD_MOBILE_SCALE_MIN_WIDTH) / (CARD_MOBILE_SCALE_FULL_WIDTH - CARD_MOBILE_SCALE_MIN_WIDTH),
    0,
    1,
  );
  const responsiveScale = CARD_MOBILE_SCALE_MIN + (1 - CARD_MOBILE_SCALE_MIN) * progress;
  return Math.min(responsiveScale, getDefaultCardHorizontalFitScale());
}

function getDefaultCardHorizontalFitScale() {
  const rect = els.cardCanvas?.getBoundingClientRect();
  const viewportWidth = rect?.width
    || window.innerWidth
    || document.documentElement.clientWidth
    || CARD_MOBILE_SCALE_FULL_WIDTH;
  const viewportHeight = rect?.height
    || window.innerHeight
    || document.documentElement.clientHeight
    || viewportWidth;
  const aspect = Math.max(0.1, viewportWidth / Math.max(1, viewportHeight));
  const fov = THREE.MathUtils.degToRad(cardCamera?.fov || 34);
  const visibleHeight = 2 * Math.tan(fov / 2) * CARD_CAMERA_DEFAULT_Z;
  const visibleWidth = visibleHeight * aspect;
  const marginWidthRatio = clamp((CARD_DEFAULT_HORIZONTAL_MARGIN_PX * 2) / Math.max(1, viewportWidth), 0, 0.35);
  const availableWidth = visibleWidth * (1 - marginWidthRatio);
  return Math.max(0.03, availableWidth / CARD_WIDTH);
}

function getCardWorldUnitsPerPixel() {
  const view = getCardVisibleWorldSize();
  const rect = els.cardCanvas.getBoundingClientRect();
  return {
    x: view.width / Math.max(1, rect.width),
    y: view.height / Math.max(1, rect.height),
  };
}

function getCardVisibleWorldSize() {
  const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(cardCamera.fov) / 2) * currentCameraZ;
  return {
    width: visibleHeight * cardCamera.aspect,
    height: visibleHeight,
  };
}

function isTraitPanelCompact() {
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  return viewportWidth < 820 || viewportWidth / Math.max(1, viewportHeight) < 1.12;
}

function updateCardGlossActivity() {
  const rotationAmount = Math.max(
    Math.abs(currentRotationX),
    Math.abs(currentRotationY),
    Math.abs(targetRotationX),
    Math.abs(targetRotationY),
  );
  const rotationActivity = clamp((rotationAmount - 0.018) / 0.34, 0, 1);
  const targetActivity = dragState || cardShuffleSpinAnimating ? 1 : rotationActivity;
  cardGlossActivity += (targetActivity - cardGlossActivity) * (targetActivity > cardGlossActivity ? 0.22 : 0.12);
  if (cardGlossActivity < 0.002 && targetActivity === 0) cardGlossActivity = 0;
}

function updateCardGlossUniforms(mesh) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms) return;
  uniforms.uCameraPosition.value.copy(cardCamera.position);
  uniforms.uTime.value = performance.now() * 0.001;
  uniforms.uActivity.value = cardGlossActivity;
}

function renderBinderScene() {
  renderBinderSceneOnce();
}

function startBinderRenderLoop() {
  if (!galleryOpen || !isBinderMode || els.binderPanel.hidden) return;

  if (binderRenderFrame) {
    cancelAnimationFrame(binderRenderFrame);
    binderRenderFrame = 0;
  }

  if (binderAnimationFrame) {
    cancelAnimationFrame(binderAnimationFrame);
    binderAnimationFrame = 0;
  }
  if (binderAnimationDelayTimer) {
    window.clearTimeout(binderAnimationDelayTimer);
    binderAnimationDelayTimer = 0;
  }

  const renderFrame = () => {
    if (!galleryOpen || !isBinderMode || els.binderPanel.hidden) {
      binderAnimationFrame = 0;
      binderAnimationDelayTimer = 0;
      return;
    }
    const keepAnimating = updateBinderAnimation();
    if (!keepAnimating) {
      binderAnimationFrame = 0;
      return;
    }
    if (binderLastAnimationIdleOnly) {
      binderAnimationFrame = 0;
      binderAnimationDelayTimer = window.setTimeout(() => {
        binderAnimationDelayTimer = 0;
        binderAnimationFrame = requestAnimationFrame(renderFrame);
      }, BINDER_ANIMATED_IDLE_MS);
      return;
    }
    binderAnimationFrame = requestAnimationFrame(renderFrame);
  };

  binderAnimationFrame = requestAnimationFrame(renderFrame);
}

function stopBinderRenderLoop() {
  if (binderAnimationFrame) {
    cancelAnimationFrame(binderAnimationFrame);
    binderAnimationFrame = 0;
  }
  if (binderAnimationDelayTimer) {
    window.clearTimeout(binderAnimationDelayTimer);
    binderAnimationDelayTimer = 0;
  }
}

function isBinderTurnMoving() {
  return Boolean(binderDrag) || Math.abs(binderTargetTurn - binderTurn) > 0.0015;
}

function requestBinderMaintenance(delay = 90) {
  if (binderMaintenanceTimer) return;

  binderMaintenanceTimer = window.setTimeout(() => {
    binderMaintenanceTimer = 0;
    if (!galleryOpen || !isBinderMode || els.binderPanel.hidden) return;
    if (isBinderTurnMoving() || binderPreparingSpread) {
      requestBinderMaintenance(delay);
      return;
    }

    ensureBinderPageWindow();
    loadBinderBackTexture(binderBuildToken);
    queueBinderTextureLoads(binderBuildToken, { force: true, includePreload: true });
    pumpBinderTextureQueue();
    requestBinderRenderOnce();
  }, delay);
}

function updateBinderAnimation() {
  const wasIdleOnly = binderLastAnimationIdleOnly;
  binderLastAnimationIdleOnly = false;
  if (!binderRenderer || !binderScene || !binderCamera || !galleryOpen || !isBinderMode) {
    return false;
  }

  const now = performance.now();
  let turnActive = Boolean(binderDrag);
  if (!binderDrag) {
    const delta = binderTargetTurn - binderTurn;
    if (Math.abs(delta) > 0.0015) binderBendDirection = Math.sign(delta);
    binderTurn += delta * 0.16;
    turnActive = Math.abs(delta) >= 0.0015;
    if (!turnActive) binderTurn = binderTargetTurn;
  }

  const interactionActive = now < binderInteractionActiveUntil;
  const introNoteFadeActive = updateBinderIntroNoteModeOpacity(now);
  if (turnActive || interactionActive || !wasIdleOnly || introNoteFadeActive) {
    updateBinderPageTransforms();
  }
  updateBinderCameraFrame(false);
  const cameraMoving = isBinderCameraMoving();
  const animatedRecords = getBinderVisibleAnimatedTextureRecords();
  const fadeActive = updateBinderCardLoadFades(now) || introNoteFadeActive;
  if (!turnActive && !cameraMoving && animatedRecords.size && !interactionActive && !fadeActive) {
    const animatedUpdated = updateAnimatedTextureRecords(animatedRecords);
    if (animatedUpdated) binderRenderer.render(binderScene, binderCamera);
    binderLastAnimationIdleOnly = true;
    return true;
  }

  if (turnActive || cameraMoving || interactionActive) {
    queueBinderTextureLoads(binderBuildToken, { includePreload: false });
  }
  const cameraActive = isBinderCameraMoving();
  const animatedUpdated = updateAnimatedTextureRecords(animatedRecords);
  if (turnActive || cameraActive || animatedUpdated || interactionActive || fadeActive) {
    binderRenderer.render(binderScene, binderCamera);
  }
  const keepAnimating = turnActive || cameraActive || interactionActive || animatedRecords.size > 0 || fadeActive;
  binderLastAnimationIdleOnly = !turnActive && !cameraActive && !interactionActive && !fadeActive && animatedRecords.size > 0;
  if (!keepAnimating) requestBinderMaintenance();
  return keepAnimating;
}

function isBinderCameraMoving() {
  return !binderCameraReady
    || binderCamera.position.distanceToSquared(binderDesiredCameraPosition) > 0.00008
    || binderCurrentCameraLookAt.distanceToSquared(binderDesiredCameraLookAt) > 0.00008;
}

function updateBinderPageTransforms() {
  const turn = clamp(binderTurn, 0, binderPageCount);
  updateBinderIntroNoteOpacity(turn);
  const lowerTurn = Math.floor(turn);
  const turnFraction = turn - lowerTurn;
  const isTurning = turnFraction > 0.001 && lowerTurn < binderPageCount;
  const activeIndex = isTurning ? lowerTurn : -1;
  const restingTurn = clamp(Math.round(turn), 0, binderPageCount);
  const stackProgress = getBinderStackRestProgress(turnFraction, isTurning);

  for (const page of binderPages) {
    const rawTurn = clamp(turn - page.pageIndex, 0, 1);
    const easedTurn = easeInOut(rawTurn);
    const isActivePage = page.pageIndex === activeIndex;
    const restLayout = isTurning && !isActivePage
      ? getBlendedBinderRestLayout(page.pageIndex, lowerTurn, lowerTurn + 1, stackProgress)
      : getBinderRestPageLayout(page.pageIndex, restingTurn);

    page.group.rotation.y = -Math.PI * easedTurn;

    const activeLift = Math.sin(rawTurn * Math.PI) * BINDER_ACTIVE_PAGE_LIFT;
    const activeRestZ = THREE.MathUtils.lerp(BINDER_RIGHT_STACK_Z, BINDER_LEFT_STACK_Z, easedTurn);
    let pageZ;
    if (isActivePage) {
      pageZ = activeRestZ + activeLift;
    } else {
      pageZ = restLayout.z;
    }
    page.group.position.x = 0;
    page.group.position.z = pageZ;
    setBinderPageRenderOrder(
      page,
      getBinderPageRenderOrder(
        isActivePage,
        restLayout.isLeftStack,
        restLayout.leftStackDepth,
        restLayout.rightStackDepth,
        restLayout.isGapRevealPage,
      ),
      { activePage: isActivePage },
    );
    const turnActivity = Math.sin(rawTurn * Math.PI);
    const sheetVisibility = isActivePage
      ? getBinderSheetVisibilityFactor({
        isActivePage,
        isLeftStack: restLayout.isLeftStack,
        leftStackDepth: restLayout.leftStackDepth,
        rightStackDepth: restLayout.rightStackDepth,
        isGapRevealPage: restLayout.isGapRevealPage,
        turnActivity,
      })
      : restLayout.sheetVisibility;
    const pageVisibility = isActivePage ? 1 : restLayout.pageVisibility;
    page.group.visible = isActivePage || pageVisibility > 0.001;
    setBinderSheetOpacity(page, turnActivity, sheetVisibility * pageVisibility);
    setBinderPageOpacity(page, pageVisibility);
    applyBinderColumnBend(page, rawTurn);
  }
}

function getBinderRestPageLayout(pageIndex, restTurn) {
  const currentTurn = clamp(Math.round(restTurn), 0, binderPageCount);
  const leftIndex = currentTurn - 1;
  const rightIndex = currentTurn;
  const isLeftStack = pageIndex <= leftIndex;
  const leftStackDepth = Math.max(0, leftIndex - pageIndex);
  const rightStackDepth = Math.max(0, pageIndex - rightIndex);
  const isLeftGapRevealPage = isLeftStack && pageIndex === currentTurn - 2;
  const isRightGapRevealPage = !isLeftStack && pageIndex === currentTurn + 1;
  const isGapRevealPage = isLeftGapRevealPage || isRightGapRevealPage;
  let z;

  if (isLeftGapRevealPage) {
    z = BINDER_LEFT_STACK_Z - BINDER_GAP_REVEAL_STACK_GAP;
  } else if (isRightGapRevealPage) {
    z = BINDER_RIGHT_STACK_Z - BINDER_GAP_REVEAL_STACK_GAP;
  } else if (isLeftStack) {
    z = BINDER_LEFT_STACK_Z - leftStackDepth * BINDER_VISIBLE_STACK_GAP;
  } else {
    z = BINDER_RIGHT_STACK_Z - rightStackDepth * BINDER_VISIBLE_STACK_GAP;
  }

  return {
    isLeftStack,
    leftStackDepth,
    rightStackDepth,
    isGapRevealPage,
    z,
    pageVisibility: getBinderRestPageVisibility(
      getBinderStackDepth({ isLeftStack, leftStackDepth, rightStackDepth })
    ),
    sheetVisibility: getBinderSheetVisibilityFactor({
      isActivePage: false,
      isLeftStack,
      leftStackDepth,
      rightStackDepth,
      isGapRevealPage,
    }),
  };
}

function getBlendedBinderRestLayout(pageIndex, fromTurn, toTurn, progress) {
  const startLayout = getBinderRestPageLayout(pageIndex, fromTurn);
  const endLayout = getBinderRestPageLayout(pageIndex, toTurn);
  const displayLayout = progress < 0.5 ? startLayout : endLayout;

  return {
    ...displayLayout,
    z: THREE.MathUtils.lerp(startLayout.z, endLayout.z, progress),
    pageVisibility: THREE.MathUtils.lerp(
      startLayout.pageVisibility,
      endLayout.pageVisibility,
      progress,
    ),
    sheetVisibility: THREE.MathUtils.lerp(
      startLayout.sheetVisibility,
      endLayout.sheetVisibility,
      progress,
    ),
  };
}

function getBinderStackDepth({ isLeftStack, leftStackDepth, rightStackDepth }) {
  return isLeftStack ? leftStackDepth : rightStackDepth;
}

function getBinderRestPageVisibility(depth) {
  if (depth <= BINDER_VISIBLE_STACK_DEPTH) return 1;
  if (depth >= BINDER_HIDDEN_STACK_DEPTH) return 0;

  const progress = clamp(
    (depth - BINDER_VISIBLE_STACK_DEPTH) / (BINDER_HIDDEN_STACK_DEPTH - BINDER_VISIBLE_STACK_DEPTH),
    0,
    1,
  );
  return Math.pow(1 - progress, BINDER_DEEP_PAGE_FADE_POWER);
}

function getBinderStackRestProgress(turnFraction, isTurning) {
  if (!isTurning) return 0;

  if (binderBendDirection >= 0) {
    return easeInOut(clamp(
      (turnFraction - BINDER_STACK_TRANSITION_START) / (1 - BINDER_STACK_TRANSITION_START),
      0,
      1,
    ));
  }

  return 1 - easeInOut(clamp(
    ((1 - BINDER_STACK_TRANSITION_START) - turnFraction) / (1 - BINDER_STACK_TRANSITION_START),
    0,
    1,
  ));
}

function applyBinderColumnBend(page, rawTurn) {
  const bend = BINDER_PAGE_COLUMN_BEND * Math.sin(rawTurn * Math.PI) * 1.3 * -Math.sign(binderBendDirection || 1);
  const middlePivot = page.columnPivots?.[1]?.group;
  const outerPivot = page.columnPivots?.[2]?.group;
  if (middlePivot) middlePivot.rotation.y = bend * 0.58;
  if (outerPivot) outerPivot.rotation.y = bend * 0.72;
}

function getBinderStackCoverProgress({ pageIndex, activeIndex, easedTurn, isTurning, forwardTurn }) {
  if (!isTurning || activeIndex < 0) return 0;
  if (forwardTurn && pageIndex === activeIndex - 1) return easeInOut(clamp(easedTurn, 0, 1));
  if (!forwardTurn && pageIndex === activeIndex + 1) return easeInOut(clamp(1 - easedTurn, 0, 1));
  return 0;
}

function getBinderSheetVisibilityFactor({
  isActivePage,
  isLeftStack,
  leftStackDepth,
  rightStackDepth,
  isGapRevealPage,
  turnActivity = 0,
  stackCoverProgress = 0,
}) {
  const focused = isBinderFocused();
  const currentPageFactor = focused ? 0.68 : 1;
  if (stackCoverProgress > 0) {
    return THREE.MathUtils.lerp(currentPageFactor, getBinderUnderlyingSheetVisibility(1, focused), stackCoverProgress);
  }
  if (isActivePage) {
    return THREE.MathUtils.lerp(currentPageFactor, focused ? 0.86 : 1, easeInOut(clamp(turnActivity, 0, 1)));
  }
  if (isGapRevealPage) return focused ? 0.24 : 0.42;
  if (isLeftStack) {
    if (leftStackDepth === 0) return currentPageFactor;
    return getBinderUnderlyingSheetVisibility(leftStackDepth, focused);
  }
  if (rightStackDepth === 0) return currentPageFactor;
  return getBinderUnderlyingSheetVisibility(rightStackDepth, focused);
}

function getBinderUnderlyingSheetVisibility(depth, focused) {
  const start = focused ? 0.24 : 0.42;
  const falloff = focused ? 0.045 : 0.07;
  const floor = focused ? 0.075 : 0.13;
  return Math.max(floor, start - Math.max(0, depth - 1) * falloff);
}

function setBinderSheetOpacity(page, turnActivity, visibilityFactor = 1) {
  const activity = easeInOut(clamp(turnActivity, 0, 1));
  const visibleOpacity = clamp(visibilityFactor, 0, 1);
  for (const mesh of page.sheetMeshes || []) {
    const material = mesh.material;
    if (!material) continue;
    const opacity = visibleOpacity * THREE.MathUtils.lerp(
      mesh.userData.restOpacity,
      mesh.userData.activeOpacity,
      activity,
    );
    if (Math.abs(material.opacity - opacity) > 0.0005) {
      material.opacity = opacity;
    }
  }
}

function setBinderPageOpacity(page, visibilityFactor = 1, now = performance.now()) {
  const opacity = clamp(visibilityFactor, 0, 1);
  const previousOpacity = page.cardOpacity ?? 1;
  const pageOpacityChanged = Math.abs(previousOpacity - opacity) > 0.0005;
  page.cardOpacity = opacity;
  for (const mesh of page.cardMeshes || []) {
    const material = mesh.material;
    if (!material) continue;
    const cardOpacity = getBinderCardRenderedOpacity(mesh, opacity, now);
    if (pageOpacityChanged || Math.abs((material.opacity ?? 1) - cardOpacity) > 0.0005) {
      material.opacity = cardOpacity;
    }
  }
}

function getBinderCardRenderedOpacity(mesh, pageOpacity, now = performance.now()) {
  if (!mesh.userData.binderCard) return pageOpacity;
  if (!mesh.userData.textureLoaded) return 0;
  if (mesh.userData.textureFadeComplete) return pageOpacity;

  const startedAt = mesh.userData.textureFadeStartedAt;
  if (!Number.isFinite(startedAt)) {
    mesh.userData.textureFadeComplete = true;
    return pageOpacity;
  }

  const progress = clamp((now - startedAt) / BINDER_CARD_LOAD_FADE_MS, 0, 1);
  if (progress >= 1) {
    mesh.userData.textureFadeComplete = true;
    return pageOpacity;
  }

  return pageOpacity * easeInOutCubic(progress);
}

function updateBinderCardLoadFades(now = performance.now()) {
  let fadeActive = false;
  for (const mesh of binderCardMeshes) {
    if (!mesh.visible || !mesh.userData.textureLoaded || mesh.userData.textureFadeComplete) continue;
    const material = mesh.material;
    if (!material) continue;
    const targetOpacity = getBinderPageOpacityForPosition(mesh.userData.binderPosition);
    const opacity = getBinderCardRenderedOpacity(mesh, targetOpacity, now);
    if (Math.abs((material.opacity ?? 1) - opacity) > 0.0005) {
      material.opacity = opacity;
    }
    if (!mesh.userData.textureFadeComplete) fadeActive = true;
  }
  return fadeActive;
}

function updateBinderIntroNoteOpacity(turn) {
  if (!binderIntroNoteGroup || !binderIntroNoteMesh?.material) return;

  const pageOpacity = 1 - easeInOut(clamp(turn, 0, 1));
  const opacity = pageOpacity * binderIntroNoteModeOpacity;
  binderIntroNoteGroup.visible = opacity > 0.001;
  binderIntroNoteMesh.material.opacity = opacity;
  binderIntroNoteMesh.material.transparent = true;
  binderIntroNoteMesh.material.needsUpdate = true;
  for (const mesh of binderIntroLinkMeshes) {
    mesh.visible = opacity > 0.08;
  }
  if (opacity <= 0.08) clearBinderIntroLinkCursor();
}

function updateBinderIntroNoteModeOpacity(now = performance.now()) {
  syncBinderIntroNoteModeTarget(now);
  const delta = binderIntroNoteModeTargetOpacity - binderIntroNoteModeOpacity;
  if (Math.abs(delta) <= 0.001) {
    binderIntroNoteModeOpacity = binderIntroNoteModeTargetOpacity;
    binderIntroNoteFadeLastAt = now;
    return false;
  }

  const elapsed = binderIntroNoteFadeLastAt ? Math.max(0, now - binderIntroNoteFadeLastAt) : 16.7;
  binderIntroNoteFadeLastAt = now;
  const step = Math.max(0, elapsed / BINDER_INTRO_NOTE_FILTER_FADE_MS);
  binderIntroNoteModeOpacity += Math.sign(delta) * Math.min(Math.abs(delta), step);
  return Math.abs(binderIntroNoteModeTargetOpacity - binderIntroNoteModeOpacity) > 0.001;
}

function syncBinderIntroNoteModeTarget(now = performance.now()) {
  const targetOpacity = hasActiveBinderIntroSuppressor() ? 0 : 1;
  if (binderIntroNoteModeTargetOpacity === targetOpacity) return false;

  binderIntroNoteModeTargetOpacity = targetOpacity;
  binderIntroNoteFadeLastAt = now;
  return true;
}

function getBinderPageOpacityForPosition(position) {
  if (!Number.isInteger(position) || position < 0) return 1;

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const page = binderPages.find((entry) => entry.pageIndex === pageIndex);
  return page?.cardOpacity ?? 1;
}

function getBinderPageRenderOrder(isActivePage, isLeftStack, leftStackDepth, rightStackDepth, isGapRevealPage = false) {
  if (isActivePage) return BINDER_FLIPPING_PAGE_RENDER_ORDER;
  if (isGapRevealPage) return BINDER_GAP_REVEAL_PAGE_RENDER_ORDER;
  if (isLeftStack) {
    return leftStackDepth === 0
      ? BINDER_TOP_PAGE_RENDER_ORDER
      : BINDER_LEFT_STACK_RENDER_ORDER - leftStackDepth * BINDER_STACK_RENDER_ORDER_STEP;
  }
  return rightStackDepth === 0
    ? BINDER_TOP_PAGE_RENDER_ORDER
    : BINDER_RIGHT_STACK_RENDER_ORDER - rightStackDepth * BINDER_STACK_RENDER_ORDER_STEP;
}

function setBinderPageRenderOrder(page, baseOrder, { activePage = false } = {}) {
  if (page.renderOrderBase === baseOrder && page.renderOrderActivePage === activePage) return;
  page.renderOrderBase = baseOrder;
  page.renderOrderActivePage = activePage;
  page.group.traverse((child) => {
    if (!child.isMesh) return;
    if (child.userData.binderRenderOffset === undefined) {
      child.userData.binderRenderOffset = child.renderOrder || 0;
    }
    const renderBase = activePage && (child.userData.binderCard || child.userData.binderBackCard)
      ? BINDER_FLIPPING_PAGE_CARD_RENDER_ORDER
      : baseOrder;
    child.renderOrder = renderBase + child.userData.binderRenderOffset;
  });
}

function updateBinderCameraFrame(immediate = false) {
  if (!binderCamera) return;

  updateBinderDefaultCameraFrame();
  binderDesiredCameraPosition.copy(binderDefaultCameraPosition);
  binderDesiredCameraLookAt.copy(binderDefaultCameraLookAt);

  const focusMesh = getBinderFocusedMesh();
  if (focusMesh && binderRoot) {
    binderRoot.updateMatrixWorld(true);
    focusMesh.getWorldPosition(binderFocusWorldPosition);
    const focusDistance = getBinderFocusDistance();
    binderDesiredCameraLookAt.copy(binderFocusWorldPosition);
    binderDesiredCameraPosition.set(
      binderFocusWorldPosition.x,
      binderFocusWorldPosition.y,
      binderFocusWorldPosition.z + focusDistance,
    );
  }

  if (immediate || !binderCameraReady) {
    binderCamera.position.copy(binderDesiredCameraPosition);
    binderCurrentCameraLookAt.copy(binderDesiredCameraLookAt);
    binderCamera.lookAt(binderCurrentCameraLookAt);
    binderCameraReady = true;
    return;
  }

  const alpha = isBinderFocused() ? 0.12 : 0.1;
  binderCamera.position.lerp(binderDesiredCameraPosition, alpha);
  binderCurrentCameraLookAt.lerp(binderDesiredCameraLookAt, alpha);
  binderCamera.lookAt(binderCurrentCameraLookAt);
}

function updateBinderDefaultCameraFrame() {
  if (!binderCamera) return;

  const width = binderLastWidth || els.binderPanel?.getBoundingClientRect().width || window.innerWidth || 1;
  const height = binderLastHeight || els.binderPanel?.getBoundingClientRect().height || window.innerHeight || 1;
  const aspect = Math.max(width / Math.max(1, height), 0.1);
  const fov = THREE.MathUtils.degToRad(binderCamera.fov);
  const singlePage = isBinderSinglePageViewport(width, height) && !isBinderFocused();
  const singlePageSide = singlePage ? getBinderSinglePageSide() : null;
  const centerX = singlePage ? getBinderSinglePageCenterX(singlePageSide) : 0;
  const fitHeight = BINDER_PAGE_HEIGHT + (
    singlePage
      ? (height < 640 ? 0.92 : 0.72)
      : (height < 640 ? 1.62 : 1.35)
  );
  const fitWidth = BINDER_PAGE_WIDTH * (
    singlePage
      ? (width < 520 ? 1.24 : 1.18)
      : (width < 620 ? 2.34 : 2.22)
  );
  const distanceForHeight = fitHeight / (2 * Math.tan(fov / 2));
  const distanceForWidth = fitWidth / (2 * Math.tan(fov / 2) * aspect);
  const distance = Math.max(distanceForHeight, distanceForWidth) + (singlePage ? 0.42 : 0.88);
  binderDefaultCameraPosition.set(centerX, 0.24, distance);
  binderDefaultCameraLookAt.set(centerX, 0.24, 0);
}

function getBinderFocusedMesh() {
  if (!isBinderFocused()) return null;
  return binderCardMeshByPosition.get(binderFocusPosition) || null;
}

function getBinderFocusDistance() {
  const fov = THREE.MathUtils.degToRad(binderCamera.fov);
  const aspect = Math.max(binderCamera.aspect || 1, 0.1);
  const distanceForHeight = BINDER_CARD_HEIGHT / (2 * Math.tan(fov / 2) * 0.59);
  const distanceForWidth = BINDER_CARD_WIDTH / (2 * Math.tan(fov / 2) * aspect * 0.42);
  return Math.max(distanceForHeight, distanceForWidth) + 0.16;
}

function renderBinderSceneOnce({ includePreload = !isBinderTurnMoving() } = {}) {
  if (!binderRenderer || !binderScene || !binderCamera) return;
  updateBinderPageTransforms();
  updateBinderCameraFrame(true);
  queueBinderTextureLoads(binderBuildToken, { includePreload });
  updateAnimatedTextureRecords(getBinderVisibleAnimatedTextureRecords());
  binderRenderer.render(binderScene, binderCamera);
}

function requestBinderRenderOnce() {
  if (
    binderAnimationFrame
    || binderRenderFrame
    || binderPreparingSpread
    || !galleryOpen
    || !isBinderMode
    || els.binderPanel.hidden
  ) {
    return;
  }

  binderRenderFrame = requestAnimationFrame(() => {
    binderRenderFrame = 0;
    renderBinderSceneOnce();
  });
}

function requestResize() {
  if (resizeFrame) cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    resizeCardRenderer();
  });
  if (binderResizeFrame) cancelAnimationFrame(binderResizeFrame);
  binderResizeFrame = requestAnimationFrame(() => {
    binderResizeFrame = 0;
    resizeBinderRenderer();
    renderBinderSceneOnce();
  });
}

function resizeCardRenderer() {
  const rect = els.cardCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  if (els.cardCanvas.width === Math.floor(width * cardRenderer.getPixelRatio())
    && els.cardCanvas.height === Math.floor(height * cardRenderer.getPixelRatio())) {
    return;
  }
  cardRenderer.setSize(width, height, false);
  cardCamera.aspect = width / height;
  cardCamera.updateProjectionMatrix();
}

function resizeBinderRenderer() {
  if (!binderRenderer || !els.binderPanel || els.binderPanel.hidden) return;

  const rect = els.binderPanel.getBoundingClientRect();
  const width = Math.round(rect.width);
  const height = Math.round(rect.height);
  if (!width || !height) return;

  if (width !== binderLastWidth || height !== binderLastHeight) {
    binderRenderer.setSize(width, height, false);
    binderCamera.aspect = width / height;
    binderCamera.updateProjectionMatrix();
    binderLastWidth = width;
    binderLastHeight = height;
  }

  updateBinderDefaultCameraFrame();
  updateBinderCameraFrame(!isBinderFocused() || !binderCameraReady);
  updateBinderPageControls();
}

function createBinderCoverMaterial() {
  const map = createBinderCoverTexture();
  return new THREE.MeshStandardMaterial({
    color: 0x11100d,
    map,
    roughness: 0.9,
    metalness: 0.015,
    emissive: 0x040302,
    emissiveIntensity: 0.28,
  });
}

function createBinderCoverTexture() {
  if (binderCoverTexture) return binderCoverTexture;

  const size = 256;
  const surface = document.createElement("canvas");
  surface.width = size;
  surface.height = size;
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(size, size);
  let seed = 0x8d4f3b21;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const index = (y * size + x) * 4;
      const grain = (seed >>> 24) % 34;
      const weave = x % 9 === 0 || y % 11 === 0 ? 10 : 0;
      const value = 14 + grain + weave;
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 3.2);
  texture.needsUpdate = true;
  binderCoverTexture = texture;
  return binderCoverTexture;
}

function createBinderIntroNoteTexture() {
  if (binderIntroNoteTexture) {
    return {
      texture: binderIntroNoteTexture,
      linkBounds: binderIntroNoteTexture.userData.linkBounds,
    };
  }

  const width = 1024;
  const height = 584;
  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const ctx = surface.getContext("2d");
  const linkBounds = drawBinderIntroNoteSurface(ctx);

  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  texture.userData.linkBounds = linkBounds;
  texture.userData.surfaceContext = ctx;
  binderIntroNoteTexture = texture;
  return {
    texture,
    linkBounds: texture.userData.linkBounds,
  };
}

function drawBinderIntroNoteSurface(ctx) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(156, 153, 146, 0.74)";

  const fontStack = SITE_FONT_STACK;
  const baseFontSize = 33;
  const linkText = "evil biscuit";
  const firstLinePrefix = "this is a 3d binder viewer for card nft by  ";
  const maxTextWidth = width * 0.9;
  const textFillStyle = "rgba(156, 153, 146, 0.74)";
  const linkFillStyle = "rgba(176, 172, 164, 0.9)";
  const textOffsetY = -54;

  const evilBiscuitLinkBounds = drawBinderIntroLinkedLine(ctx, {
    prefix: firstLinePrefix,
    linkText,
    y: 144 + textOffsetY,
    maxWidth: maxTextWidth,
    fontSize: baseFontSize,
    fontStack,
    textFillStyle,
    linkFillStyle,
    url: BINDER_INTRO_LINK_URL,
  });

  ctx.fillStyle = textFillStyle;
  drawCenteredBinderIntroText(
    ctx,
    "you can navigate with swiping, zooming, and/or the ui buttons",
    width / 2,
    224 + textOffsetY,
    maxTextWidth,
    31,
    fontStack,
  );
  drawCenteredBinderIntroText(
    ctx,
    "please explore and enjoy :)",
    width / 2,
    300 + textOffsetY,
    maxTextWidth,
    32,
    fontStack,
  );

  ctx.font = `400 42px ${fontStack}`;
  ctx.fillStyle = "rgba(150, 146, 139, 0.78)";
  ctx.textAlign = "center";
  ctx.fillText("🩸", width / 2, 390 + textOffsetY);

  const cardNft2LinkBounds = drawBinderIntroLinkedLine(ctx, {
    prefix: "card nft 2 coming soon to ",
    linkText: "mons.shop",
    y: 510 + textOffsetY,
    maxWidth: maxTextWidth,
    fontSize: 32,
    fontStack,
    textFillStyle,
    linkFillStyle,
    url: BINDER_CARD_NFT_2_LINK_URL,
  });
  return [evilBiscuitLinkBounds, cardNft2LinkBounds];
}

function drawBinderIntroLinkedLine(
  ctx,
  { prefix, linkText, y, maxWidth, fontSize, fontStack, textFillStyle, linkFillStyle, url },
) {
  let size = fontSize;
  while (size > 18) {
    ctx.font = `400 ${size}px ${fontStack}`;
    if (ctx.measureText(prefix + linkText).width <= maxWidth) break;
    size -= 1;
  }

  ctx.font = `400 ${size}px ${fontStack}`;
  const prefixWidth = ctx.measureText(prefix).width;
  const linkWidth = ctx.measureText(linkText).width;
  const lineStartX = (ctx.canvas.width - prefixWidth - linkWidth) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = textFillStyle;
  ctx.fillText(prefix, lineStartX, y);
  ctx.fillStyle = linkFillStyle;
  ctx.fillText(linkText, lineStartX + prefixWidth, y);

  const underlineY = y + Math.max(8, size * 0.25);
  ctx.globalAlpha = 0.55;
  ctx.fillRect(lineStartX + prefixWidth, underlineY, linkWidth, Math.max(2, size * 0.06));
  ctx.globalAlpha = 1;

  return {
    x: (lineStartX + prefixWidth) / ctx.canvas.width,
    y: (y - size * 0.94) / ctx.canvas.height,
    width: linkWidth / ctx.canvas.width,
    height: (size * 1.25) / ctx.canvas.height,
    url,
  };
}

function drawCenteredBinderIntroText(ctx, text, x, y, maxWidth, fontSize, fontStack) {
  let size = fontSize;
  while (size > 18) {
    ctx.font = `400 ${size}px ${fontStack}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  ctx.textAlign = "center";
  ctx.fillText(text, x, y);
}

function createBinderSleeveFrostTexture() {
  if (binderSleeveFrostTexture) return binderSleeveFrostTexture;

  const size = 192;
  const surface = document.createElement("canvas");
  surface.width = size;
  surface.height = size;
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(size, size);
  let seed = 0xa5847c31;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const index = (y * size + x) * 4;
      const cloudy = 218 + ((seed >>> 24) % 34);
      imageData.data[index] = cloudy;
      imageData.data[index + 1] = cloudy;
      imageData.data[index + 2] = cloudy;
      imageData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.8, 3.6);
  texture.needsUpdate = true;
  binderSleeveFrostTexture = texture;
  return binderSleeveFrostTexture;
}

function getBinderPlaceholderTexture() {
  if (binderPlaceholderTexture) return binderPlaceholderTexture;

  const surface = document.createElement("canvas");
  surface.width = BINDER_FACE_WIDTH;
  surface.height = BINDER_FACE_HEIGHT;
  const ctx = surface.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, surface.width, surface.height);
  gradient.addColorStop(0, "#1d1b16");
  gradient.addColorStop(0.52, "#25221b");
  gradient.addColorStop(1, "#14130f");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, surface.width, surface.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.035)";
  for (let y = 0; y < surface.height; y += 3) {
    ctx.fillRect(0, y, surface.width, 1);
  }
  addPaperNoise(ctx, surface.width, surface.height, 0.045);

  binderPlaceholderTexture = new THREE.CanvasTexture(surface);
  binderPlaceholderTexture.colorSpace = THREE.SRGBColorSpace;
  binderPlaceholderTexture.needsUpdate = true;
  return binderPlaceholderTexture;
}

function createPaperRoughnessTexture() {
  if (paperRoughnessTexture) return paperRoughnessTexture;

  const size = 256;
  const surface = document.createElement("canvas");
  surface.width = size;
  surface.height = Math.round(size * 1.4);
  const ctx = surface.getContext("2d");
  const imageData = ctx.createImageData(surface.width, surface.height);
  let seed = 0x2c6fe96d;

  for (let i = 0; i < imageData.data.length; i += 4) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const value = 178 + ((seed >>> 24) % 58);
    imageData.data[i] = value;
    imageData.data[i + 1] = value;
    imageData.data[i + 2] = value;
    imageData.data[i + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(surface);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  paperRoughnessTexture = texture;
  return paperRoughnessTexture;
}

function normalizeWheelDelta(delta, event) {
  return clamp(delta * getWheelDeltaScale(event), -900, 900);
}

function getDominantNormalizedWheelDelta(event) {
  const delta = Math.abs(event.deltaY || 0) >= Math.abs(event.deltaX || 0)
    ? event.deltaY || 0
    : event.deltaX || 0;
  return normalizeWheelDelta(delta, event);
}

function getWheelDeltaScale(event) {
  return event.deltaMode === 1
    ? 16
    : event.deltaMode === 2
      ? window.innerHeight
      : 1;
}

function updateSmoothZoom() {
  if (Math.abs(smoothZoomVelocity) < 0.00001) {
    smoothZoomVelocity = 0;
    return;
  }

  const nextCameraZ = clamp(
    currentCameraZ * Math.exp(smoothZoomVelocity),
    CARD_CAMERA_MIN_Z,
    CARD_CAMERA_MAX_Z,
  );
  currentCameraZ = nextCameraZ;
  targetCameraZ = nextCameraZ;
  smoothZoomVelocity *= 0.82;
}

function isIndividualAtMaxZoomOut() {
  return currentCameraZ >= CARD_CAMERA_MAX_Z - INDIVIDUAL_MAX_ZOOM_EPSILON;
}

function addIndividualWheelOutDistance(amount, now) {
  if (now - individualWheelOutLastAt > VIEW_SWITCH_WHEEL_IDLE_MS) {
    individualWheelOutDistance = 0;
  }
  individualWheelOutLastAt = now;
  individualWheelOutDistance += amount;
  return individualWheelOutDistance >= INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD;
}

function addBinderFocusWheelInDistance(amount, now) {
  if (now - binderFocusWheelInLastAt > VIEW_SWITCH_WHEEL_IDLE_MS) {
    binderFocusWheelInDistance = 0;
  }
  binderFocusWheelInLastAt = now;
  binderFocusWheelInDistance += amount;
  return binderFocusWheelInDistance >= BINDER_TO_INDIVIDUAL_WHEEL_THRESHOLD;
}

function resetIndividualWheelOutDistance() {
  individualWheelOutDistance = 0;
  individualWheelOutLastAt = 0;
}

function resetBinderFocusWheelInDistance() {
  binderFocusWheelInDistance = 0;
  binderFocusWheelInLastAt = 0;
}

function resetViewSwitchWheelDistances() {
  resetIndividualWheelOutDistance();
  resetBinderFocusWheelInDistance();
}

function easeInOut(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getCardTexture(card) {
  return getCachedNftTexture(card);
}

function getBinderTexture(card) {
  return getCachedNftTexture(card);
}

function getCachedNftTexture(card) {
  const key = textureAssetPath(card);
  if (nftTextureCache.has(key)) {
    const promise = nftTextureCache.get(key);
    nftTextureCache.delete(key);
    nftTextureCache.set(key, promise);
    return promise;
  }

  const promise = (
    getAnimatedSpriteInfo(card)
      ? loadAnimatedTexture(card)
      : loadTexture(cardAssetUrl(card))
  ).catch((error) => {
    nftTextureCache.delete(key);
    throw error;
  });
  nftTextureCache.set(key, promise);
  trimNftTextureCache();
  return promise;
}

function trimNftTextureCache() {
  const protectedKeys = getProtectedTextureKeys();
  let protectedScans = 0;
  while (nftTextureCache.size > MAX_TEXTURE_CACHE_SIZE && protectedScans < nftTextureCache.size) {
    const oldest = nftTextureCache.entries().next().value;
    if (!oldest) return;
    const [key, promise] = oldest;
    nftTextureCache.delete(key);
    if (protectedKeys.has(key)) {
      nftTextureCache.set(key, promise);
      protectedScans += 1;
      continue;
    }
    protectedScans = 0;
    Promise.resolve(promise).then(disposeNftTexture).catch(() => {});
  }
}

function getProtectedTextureKeys() {
  const keys = new Set();
  if (Number.isInteger(currentIndex) && CARDS[currentIndex]) {
    keys.add(textureAssetPath(CARDS[currentIndex]));
  }

  if (binderVisibleIndexes.length) {
    for (const position of getBinderPreloadPositions()) {
      const cardIndex = binderVisibleIndexes[position];
      if (Number.isInteger(cardIndex) && CARDS[cardIndex]) {
        keys.add(textureAssetPath(CARDS[cardIndex]));
      }
    }
  }

  return keys;
}

function getBackTexture() {
  if (!backTexturePromise) {
    backTexturePromise = loadTexture(new URL("./cardnft back.png", import.meta.url).href);
  }
  return backTexturePromise;
}

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    textureLoader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;
      resolve(texture);
    }, undefined, reject);
  });
}

function loadAnimatedTexture(card) {
  const sprite = getAnimatedSpriteInfo(card);
  if (!sprite) return loadTexture(cardAssetUrl(card));

  return loadTexture(new URL(sprite.file, import.meta.url).href).then((texture) => {
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1 / sprite.columns, 1 / sprite.rows);
    texture.offset.set(0, 1 - (1 / sprite.rows));
    texture.needsUpdate = true;

    const record = {
      texture,
      frames: sprite.frames,
      columns: sprite.columns,
      rows: sprite.rows,
      frameDuration: sprite.frameDuration,
      startedAt: performance.now(),
      frameIndex: 0,
      disposed: false,
    };
    texture.userData.animatedRecord = record;
    animatedTextureRecords.add(record);
    return texture;
  });
}

function getCardPlaceholderTexture() {
  if (cardPlaceholderTexture) return cardPlaceholderTexture;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 724;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#25231f");
  gradient.addColorStop(0.55, "#171612");
  gradient.addColorStop(1, "#2a2417");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  addPaperNoise(ctx, canvas.width, canvas.height, 0.045);
  cardPlaceholderTexture = new THREE.CanvasTexture(canvas);
  cardPlaceholderTexture.colorSpace = THREE.SRGBColorSpace;
  return cardPlaceholderTexture;
}

function getBackPlaceholderTexture() {
  return getCardPlaceholderTexture();
}

function createCardSurfaceNoisePlane() {
  const material = new THREE.MeshBasicMaterial({
    map: createCardSurfaceNoiseTexture(),
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    depthTest: false,
    side: THREE.FrontSide,
    toneMapped: false,
  });
  material.forceSinglePass = true;

  const mesh = new THREE.Mesh(
    createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS),
    material,
  );
  mesh.renderOrder = 26;
  return mesh;
}

function createCardSurfaceNoiseTexture() {
  if (cardSurfaceNoiseTexture) return cardSurfaceNoiseTexture;

  const width = 512;
  const height = 724;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const imageData = ctx.createImageData(width, height);
  let seed = 0x7a56d3c1;

  for (let i = 0; i < imageData.data.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const value = seed >>> 24;
    const isLight = value > 126;
    const grain = isLight ? 238 + (value % 18) : 16 + (value % 32);
    imageData.data[i] = grain;
    imageData.data[i + 1] = grain;
    imageData.data[i + 2] = grain;
    imageData.data[i + 3] = 7 + (value % 16);
  }

  ctx.putImageData(imageData, 0, 0);
  ctx.globalCompositeOperation = "source-over";
  for (let y = 0; y < height; y += 5) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const alpha = 0.018 + ((seed >>> 24) / 255) * 0.024;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, y, width, 1);
  }
  for (let y = 2; y < height; y += 7) {
    seed = (Math.imul(seed, 1103515245) + 12345) >>> 0;
    const alpha = 0.012 + ((seed >>> 24) / 255) * 0.018;
    ctx.fillStyle = `rgba(0,0,0,${alpha})`;
    ctx.fillRect(0, y, width, 1);
  }

  cardSurfaceNoiseTexture = new THREE.CanvasTexture(canvas);
  cardSurfaceNoiseTexture.colorSpace = THREE.SRGBColorSpace;
  cardSurfaceNoiseTexture.minFilter = THREE.LinearMipmapLinearFilter;
  cardSurfaceNoiseTexture.magFilter = THREE.LinearFilter;
  cardSurfaceNoiseTexture.wrapS = THREE.ClampToEdgeWrapping;
  cardSurfaceNoiseTexture.wrapT = THREE.ClampToEdgeWrapping;
  cardSurfaceNoiseTexture.generateMipmaps = true;
  cardSurfaceNoiseTexture.needsUpdate = true;
  return cardSurfaceNoiseTexture;
}

function createCardGradientPlane(normalDirection) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.NormalBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.FrontSide,
    uniforms: {
      uCameraPosition: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uNormalDirection: { value: normalDirection },
      uActivity: { value: 0 },
      uTransitionOpacity: { value: 1 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uCameraPosition;
      uniform float uTime;
      uniform float uNormalDirection;
      uniform float uActivity;
      uniform float uTransitionOpacity;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normal = normalize(vWorldNormal) * uNormalDirection;
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float facing = abs(dot(normal, viewDir));
        float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 1.18);
        vec3 reflected = reflect(-viewDir, normal);
        vec2 centered = vUv - 0.5;
        float lightShift = reflected.x * 0.32 - reflected.y * 0.22 - 0.34;
        float wash = smoothstep(-0.76, 0.82, centered.x * -0.84 + centered.y * 0.58 + lightShift);
        float counterWash = smoothstep(-0.68, 0.78, centered.x * 0.7 + centered.y * 0.36 - reflected.x * 0.18 + 0.12);
        float diagonalBloom = smoothstep(0.58, 0.04, abs(centered.x * 0.74 - centered.y * 0.52 + reflected.x * 0.28 - reflected.y * 0.18 - 0.4));
        float softVignette = smoothstep(0.82, 0.28, length(centered * vec2(0.8, 0.58)));
        vec3 cool = vec3(0.44, 0.68, 0.98);
        vec3 warm = vec3(1.0, 0.78, 0.34);
        vec3 rose = vec3(0.96, 0.48, 0.86);
        vec3 color = mix(cool, warm, wash);
        color = mix(color, rose, counterWash * 0.26);
        color = mix(color, vec3(0.98, 0.92, 0.7), diagonalBloom * 0.16);
        float alpha = 0.08 + wash * 0.065 + counterWash * 0.04 + diagonalBloom * 0.055 + fresnel * 0.055;
        alpha *= softVignette;
        gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.24) * uActivity * uTransitionOpacity);
      }
    `,
  });
  material.forceSinglePass = true;

  const mesh = new THREE.Mesh(
    createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS),
    material,
  );
  mesh.renderOrder = 27;
  return mesh;
}

function createCardGlossPlane(normalDirection) {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.FrontSide,
    uniforms: {
      uCameraPosition: { value: new THREE.Vector3() },
      uTime: { value: 0 },
      uNormalDirection: { value: normalDirection },
      uActivity: { value: 0 },
      uTransitionOpacity: { value: 1 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vUv = uv;
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uCameraPosition;
      uniform float uTime;
      uniform float uNormalDirection;
      uniform float uActivity;
      uniform float uTransitionOpacity;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normal = normalize(vWorldNormal) * uNormalDirection;
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float facing = abs(dot(normal, viewDir));
        float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 1.18);
        vec3 reflected = reflect(-viewDir, normal);
        vec2 centered = vUv - 0.5;
        float sweepAxis = centered.x * 0.92 - centered.y * 0.52 + reflected.x * 0.72 + reflected.y * 0.42 - 0.36 + sin(uTime * 0.38) * 0.025;
        float sharpSweep = smoothstep(0.11, 0.0, abs(sweepAxis));
        float broadSweep = smoothstep(0.5, 0.0, abs(sweepAxis + centered.y * 0.18));
        float verticalEdge = smoothstep(0.36, 0.52, abs(centered.x));
        float wash = smoothstep(-0.82, 0.82, centered.x * -0.72 + centered.y * 0.54 + reflected.x * 0.36 - reflected.y * 0.24);
        float counterWash = smoothstep(-0.7, 0.72, centered.x * 0.64 + centered.y * 0.42 - reflected.x * 0.24);
        float fineGrain = fract(sin(dot(vUv * vec2(811.3, 1247.1), vec2(12.9898, 78.233))) * 43758.5453);
        float sheen = clamp(fresnel * 0.52 + sharpSweep * 0.42 + broadSweep * 0.22 + verticalEdge * 0.06, 0.0, 0.74);
        sheen *= mix(0.88, 1.09, fineGrain);
        vec3 cool = vec3(0.54, 0.7, 0.86);
        vec3 warm = vec3(0.96, 0.78, 0.38);
        vec3 pearl = vec3(1.0, 0.96, 0.78);
        vec3 color = mix(cool, warm, wash);
        color = mix(color, vec3(0.72, 0.84, 0.7), counterWash * 0.22);
        color = mix(color, pearl, sharpSweep * 0.32 + broadSweep * 0.14);
        float alpha = clamp(sheen * 0.34, 0.0, 0.34) * uActivity * uTransitionOpacity;
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
  material.forceSinglePass = true;

  const mesh = new THREE.Mesh(
    createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS),
    material,
  );
  mesh.renderOrder = 28;
  return mesh;
}

function createRoundedPlaneGeometry(width, height, radius) {
  const geometry = new THREE.ShapeGeometry(createRoundedShape(width, height, radius), 18);
  const position = geometry.getAttribute("position");
  const uvs = [];
  for (let i = 0; i < position.count; i += 1) {
    uvs.push((position.getX(i) + width / 2) / width, (position.getY(i) + height / 2) / height);
  }
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  return geometry;
}

function createRoundedCoreGeometry(width, height, depth, radius) {
  const geometry = new THREE.ExtrudeGeometry(createRoundedShape(width, height, radius), {
    depth,
    bevelEnabled: false,
    curveSegments: 18,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function createRoundedShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}

function addPaperNoise(ctx, width, height, opacity) {
  const imageData = ctx.createImageData(width, height);
  let seed = 0x9d3f72a1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const index = (y * width + x) * 4;
      const value = 210 + ((seed >>> 24) % 44);
      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = Math.round(255 * opacity);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function cardAssetUrl(card) {
  return new URL(cardAssetPath(card), import.meta.url).href;
}

function cardStillAssetUrl(card) {
  return new URL(card?.file || cardAssetPath(card), import.meta.url).href;
}

function cardAssetPath(card) {
  return CARD_NFT_ANIMATED[card?.file] || card?.file || "";
}

function textureAssetPath(card) {
  return getAnimatedSpriteInfo(card)?.file || cardAssetPath(card);
}

function isAnimatedCard(card) {
  return Boolean(CARD_NFT_ANIMATED[card?.file]);
}

function getAnimatedSpriteInfo(card) {
  return CARD_NFT_ANIMATED_SPRITES[card?.file] || null;
}

function getIndividualAnimatedTextureRecords() {
  const records = new Set();
  addAnimatedTextureRecord(records, cardFrontMesh?.material?.map);
  addAnimatedTextureRecord(records, cardSwapIncomingFrontMesh?.material?.map);
  return records;
}

function getBinderVisibleAnimatedTextureRecords() {
  const records = new Set();
  if (!binderRoot || !binderVisibleIndexes.length) return records;
  for (const position of getVisibleBinderPositions()) {
    const mesh = binderCardMeshByPosition.get(position);
    if (!mesh?.visible || !mesh.material?.map || !isVisibleThroughParents(mesh)) continue;
    addAnimatedTextureRecord(records, mesh.material.map);
  }
  return records;
}

function addAnimatedTextureRecord(records, texture) {
  const record = texture?.userData?.animatedRecord;
  if (record && !record.disposed) records.add(record);
}

function updateAnimatedTextureRecords(visibleRecords) {
  if (!animatedTextureRecords.size) return false;

  const now = performance.now();
  let updated = false;
  for (const record of visibleRecords) {
    if (record.disposed) continue;
    const frameIndex = Math.floor((now - record.startedAt) / record.frameDuration) % record.frames;
    if (frameIndex === record.frameIndex) continue;
    setAnimatedTextureFrame(record, frameIndex);
    updated = true;
  }
  return updated;
}

function prepareTextureForImmediateDisplay(texture) {
  const record = texture?.userData?.animatedRecord;
  if (!record || record.disposed) return;
  const frameIndex = Math.floor((performance.now() - record.startedAt) / record.frameDuration) % record.frames;
  setAnimatedTextureFrame(record, frameIndex);
}

function setAnimatedTextureFrame(record, frameIndex) {
  record.frameIndex = frameIndex;
  const column = frameIndex % record.columns;
  const row = Math.floor(frameIndex / record.columns);
  record.texture.offset.set(
    column / record.columns,
    1 - ((row + 1) / record.rows),
  );
}

function deactivateAllAnimatedRecords() {
  // Sprite-atlas animations do not hold live DOM decoders, so there is nothing to pause.
}

function disposeNftTexture(texture) {
  const record = texture?.userData?.animatedRecord;
  if (record) {
    record.disposed = true;
    animatedTextureRecords.delete(record);
  }
  texture?.dispose();
}

function favoriteKey(index) {
  const card = CARDS[index];
  return card?.mint || card?.title || String(index);
}

function applyRestoredSessionViewState(state) {
  if (!state || typeof state !== "object") return;

  if (typeof state.isBinderMode === "boolean") isBinderMode = state.isBinderMode;
  favoritesOnly = Boolean(state.favoritesOnly);
  traitSearchOpen = Boolean(state.traitSearchOpen);
  traitSortCategory = getValidTraitSortCategory(state.traitSortCategory);
  activeTraitFilter = getValidSessionTraitFilter(state.activeTraitFilter);
  if (activeTraitFilter) traitSortCategory = activeTraitFilter.category;
}

function restoreSessionGalleryView(state) {
  if (!state?.galleryOpen) {
    if (!state) {
      isBinderMode = true;
      resetBinderGalleryPosition();
      binderSinglePageSide = BINDER_SINGLE_PAGE_COVER_SIDE;
      binderSinglePageSideTouched = false;
      setGalleryOpen(true);
    }
    return;
  }

  setGalleryOpen(true);
  if (!isBinderMode || traitSearchOpen) {
    queueSessionViewStateSave();
    return;
  }

  const focusedCardIndex = Number.isInteger(state.binderFocusedCardIndex)
    ? state.binderFocusedCardIndex
    : -1;
  if (focusedCardIndex >= 0) {
    const focusPosition = binderVisibleIndexes.indexOf(focusedCardIndex);
    if (focusPosition !== -1) {
      focusBinderPosition(focusPosition, { immediate: true });
      queueSessionViewStateSave();
      return;
    }
  }

  const turn = Number.isFinite(Number(state.binderTargetTurn))
    ? Math.round(Number(state.binderTargetTurn))
    : 0;
  binderTargetTurn = clamp(turn, 0, binderPageCount);
  binderTurn = binderTargetTurn;
  binderSinglePageSideTouched = Boolean(state.binderSinglePageSideTouched);
  if (
    Number.isInteger(state.binderSinglePageSide)
    && (
      binderSinglePageSideTouched
      || binderTargetTurn > 0
      || state.binderSinglePageSide === BINDER_SINGLE_PAGE_COVER_SIDE
    )
  ) {
    binderSinglePageSide = clamp(state.binderSinglePageSide, BINDER_SINGLE_PAGE_COVER_SIDE, getBinderTotalPageSides() - 1);
  } else {
    binderSinglePageSide = null;
  }
  ensureBinderPageWindow({ force: true });
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
  renderBinderSceneOnce();
  queueSessionViewStateSave();
}

function getRestoredSessionCardIndex(state) {
  if (!Number.isInteger(state?.currentIndex) || !CARDS.length) return 0;
  return clamp(state.currentIndex, 0, CARDS.length - 1);
}

function getValidTraitSortCategory(category) {
  if (category === "all") return "all";
  if (CARD_NFT_TRAIT_CATEGORIES.includes(category) && !HIDDEN_TRAIT_CATEGORIES.has(category)) {
    return category;
  }
  return "all";
}

function getValidSessionTraitFilter(filter) {
  if (!filter || typeof filter !== "object") return null;
  const category = getValidTraitSortCategory(filter.category);
  if (category === "all") return null;
  const value = String(filter.value ?? "").trim();
  if (!value) return null;
  return {
    category,
    value,
    normalizedValue: normalizeTraitValue(value),
  };
}

function getSessionViewState() {
  const focusedCardIndex = getFocusedBinderCardIndex();
  return {
    currentIndex,
    galleryOpen,
    isBinderMode,
    favoritesOnly,
    traitSearchOpen,
    traitSortCategory,
    activeTraitFilter: activeTraitFilter
      ? { category: activeTraitFilter.category, value: activeTraitFilter.value }
      : null,
    binderTargetTurn: Math.round(binderTargetTurn),
    binderSinglePageSide: Number.isInteger(binderSinglePageSide) ? binderSinglePageSide : null,
    binderSinglePageSideTouched,
    binderFocusedCardIndex: Number.isInteger(focusedCardIndex) ? focusedCardIndex : null,
  };
}

function queueSessionViewStateSave() {
  if (sessionViewSaveFrame) return;
  sessionViewSaveFrame = requestAnimationFrame(() => {
    sessionViewSaveFrame = 0;
    saveSessionViewState();
  });
}

function loadSessionViewState() {
  try {
    const value = JSON.parse(sessionStorage.getItem(SESSION_VIEW_STATE_KEY) || "null");
    return value && typeof value === "object" ? value : null;
  } catch {
    return null;
  }
}

function saveSessionViewState() {
  try {
    sessionStorage.setItem(SESSION_VIEW_STATE_KEY, JSON.stringify(getSessionViewState()));
  } catch {
    // Session restore is a convenience only; private browsing/storage failures can be ignored.
  }
}

function applyTheme(isLight) {
  els.themeToggle.checked = isLight;
  els.body.classList.toggle("is-light", isLight);
  localStorage.setItem("cardnft:theme:v1", isLight ? "light" : "dark");
}

function loadSet(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
}

function modulo(value, length) {
  return ((value % length) + length) % length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
