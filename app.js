import * as THREE from "three";
import { CARD_NFTS as CARD_NFT_1S } from "./cardnft-data.js";
import { CARD_NFT_2S } from "./cardnft2-data.js";
import { CARD_NFT_OWNER_SNAPSHOT } from "./cardnft-owners.js?v=cardnft-2";
import { CARD_NFT_TRAIT_CATEGORIES as CARD_NFT_1_TRAIT_CATEGORIES, CARD_NFT_TRAITS as CARD_NFT_1_TRAITS } from "./cardnft-traits.js";
import { CARD_NFT_2_TRAIT_CATEGORIES, CARD_NFT_2_TRAITS } from "./cardnft2-traits.js";
import { CARD_NFT_2_COMMON_IDS } from "./cardnft2-common-ids.js";
import { CARD_NFT_ANIMATED } from "./cardnft-animated.js";
import { CARD_NFT_ANIMATED_SPRITES } from "./cardnft-animated-sprites.js";
import { TRAIT_THUMBNAILS } from "./trait-thumbnails.js";

const COLLECTION_CONFIGS = {
  cardnft1: {
    id: "cardnft1",
    label: "Card NFT",
    cards: CARD_NFT_1S,
    traitCategories: CARD_NFT_1_TRAIT_CATEGORIES,
    traits: CARD_NFT_1_TRAITS,
    traitFiltersEnabled: true,
    backImage: "./cardnft back.png",
  },
  cardnft2: {
    id: "cardnft2",
    label: "Card NFT 2",
    cards: CARD_NFT_2S,
    traitCategories: CARD_NFT_2_TRAIT_CATEGORIES,
    traits: CARD_NFT_2_TRAITS,
    traitFiltersEnabled: true,
    backImages: [
      "assets/cardnft2/backs/cardnft2-back-orange.webp",
      "assets/cardnft2/backs/cardnft2-back-purple.webp",
      "assets/cardnft2/backs/cardnft2-back-blue.webp",
      "assets/cardnft2/backs/cardnft2-back-red.webp",
    ],
  },
};
const ACTIVE_COLLECTION_ID = COLLECTION_CONFIGS[document.documentElement.dataset.collectionId]?.id || "cardnft2";
const ACTIVE_COLLECTION = COLLECTION_CONFIGS[ACTIVE_COLLECTION_ID];
const CARDS = Object.values(COLLECTION_CONFIGS).flatMap((collection) => (
  collection.cards.map((card, index) => ({
    ...card,
    collection: card.collection || collection.id,
    collectionIndex: index,
    stableId: card.stableId || `${collection.id}:${card.mint || card.title || index}`,
    setIndex: index,
  }))
));
const ACTIVE_COLLECTION_INDEXES = CARDS
  .map((card, index) => (card.collection === ACTIVE_COLLECTION_ID ? index : null))
  .filter(Number.isInteger);
const ACTIVE_TRAIT_CATEGORIES = ACTIVE_COLLECTION.traitCategories;
const ACTIVE_TRAITS = ACTIVE_COLLECTION.traits;
const TRAIT_FILTERS_ENABLED = Boolean(ACTIVE_COLLECTION.traitFiltersEnabled);
const CARD_NFT_MINT_TO_INDEX = new Map(CARDS
  .map((card, index) => [String(card?.mint || "").trim(), index])
  .filter(([mint]) => mint));
const CARD_NFT_TITLE_NUMBER_TO_INDEX = new Map(CARDS
  .map((card, index) => {
    const match = String(card?.title || "").match(/^card\s+#?\s*(\d+)$/i);
    return match && card?.collection === ACTIVE_COLLECTION_ID ? [Number.parseInt(match[1], 10), index] : null;
  })
  .filter(Boolean));
const HIDDEN_TRAIT_CATEGORIES = new Set([
  "98noise",
  "Collection",
  "Source File",
  "Source Card",
  "reconstructed",
  "pixel mosaic",
]);
const EXCLUDED_SORT_TRAIT_VALUES = new Set(["no", "none", "null", "undefined"]);
const CARD_NFT_2_COLLAPSED_TRAIT_CATEGORY_PREFIXES = [
  "rare addon - ",
  "top rare addon - ",
  "top top rare addon - ",
];
const CARD_NFT_2_OTHER_TRAIT_CATEGORIES = new Set([
  "blood energy sprite overlay",
  "blood energy sprite overlay - overlay paint engraving",
  "blood energy overlay",
  "blood energy sprite overlay - center",
  "under mask embryos",
  "under mask aura eggs",
  "archetype",
  "over mask gradient stars",
  "over mask gradient icons",
]);
const CARD_NFT_2_TRAIT_CATEGORY_ALIASES = new Map([
  ["pixel line outline", "pixel line overlay"],
]);
const CARD_NFT_2_TRAIT_DISPLAY_ORDER = [
  "status",
  "rarity",
  "altered",
  "base card",
  "border",
  "top left",
  "top center",
  "top right",
  "left",
  "center",
  "right",
  "bottom left",
  "bottom center",
  "bottom right",
  "overlay paint engraving",
  "hero",
  "sprite",
  "bw mask",
  "pixel line overlay",
  "color shapes",
  "gradient shapes",
  "background",
  "other",
];
const CARD_NFT_2_TRAIT_DISPLAY_ORDER_OVERRIDES = new Map(
  CARD_NFT_2_TRAIT_DISPLAY_ORDER.map((category, index) => [category, index])
);
const TRAIT_PANEL_CATEGORY_PRIORITY = new Map([
  ["base card", 0],
  ["rarity", 1],
  ["status", 2],
  ["altered", 3],
]);
const CARD_NFT_2_COMMON_ID_SET = new Set(CARD_NFT_2_COMMON_IDS);
const CARD_EFFECT_MODE_DEFAULT = 0;
const CARD_EFFECT_MODE_CARD_NFT_2_LIGHTING = 1;
const CARD_EFFECT_MODE_CARD_NFT_2_RARE_HOLO_V = 2;
const CARD_EFFECT_MODE_CARD_NFT_2_REGULAR_HOLO = 3;
const CARD_EFFECT_MODE_CARD_NFT_2_TRAINER_FULL_ART = 4;
const CARD_EFFECT_MODE_CARD_NFT_2_AMAZING_RARE = 5;
const CARD_NFT_2_HOLO_EFFECT_MODES_BY_REMAINDER = [
  CARD_EFFECT_MODE_CARD_NFT_2_RARE_HOLO_V,
  CARD_EFFECT_MODE_CARD_NFT_2_REGULAR_HOLO,
  CARD_EFFECT_MODE_CARD_NFT_2_TRAINER_FULL_ART,
  CARD_EFFECT_MODE_CARD_NFT_2_AMAZING_RARE,
];
const CARD_NFT_2_EFFECT_TEXTURE_GATEWAY = "https://silver-real-rhinoceros-781.mypinata.cloud/ipfs";
const CARD_NFT_2_EFFECT_TEXTURE_CIDS = {
  foil: "bafybeigzyk3qd7brxfd3uinftdywhwao65gdxuleqirv5zje3okftmxczy",
  mask: "bafybeiapwcv66aqu2wzh3f5mp4j4j6h7zej3no7paae4qcqxpu3mg436ia",
};
const MAX_CARD_NFT_2_EFFECT_TEXTURE_CACHE_SIZE = 160;
const CARD_NFT_2_EFFECT_DEFAULT_POINTER_X = 0.18;
const CARD_NFT_2_EFFECT_DEFAULT_POINTER_Y = 0.78;
const CARD_NFT_2_EFFECT_OFFCARD_POINTER_X = -1.25;
const CARD_NFT_2_EFFECT_OFFCARD_POINTER_Y = -1.25;
const CARD_NFT_2_EFFECT_POINTER_EXTENT = 0.72;
const CARD_NFT_2_EFFECT_EDGE_FADE_DISTANCE = 0.46;
const CARD_EFFECT_VIEW_TRANSITION_FADE_MS = 260;
const SITE_FONT_STACK = "Optima, Candara, \"Lucida Sans\", \"Lucida Grande\", \"Trebuchet MS\", Arial, sans-serif";
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const SOLANA_TOKEN_PROGRAM_IDS = [
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "TokenzQdBNbLqP5VEhdkAS6EP6KkQ6p3Msk3VQ5DA",
];
const CARD_NFT_COLLECTION_SYMBOLS = ["cardnft", "card_nft_2"];
const CARD_NFT_2_WALLET_API_URL = "https://cardnft2.taile73682.ts.net/wallet";
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
    focusTarget: true,
    focusHitboxWidthRatio: 0.26,
    focusHitboxHeightRatio: 0.24,
    focusHitboxYRatio: 0.19,
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
const INDIVIDUAL_CARD_WORLD_Y = 0.26;
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
const BINDER_CARD_NFT_1_LINK_URL = "/cardnft1/";
const BINDER_CARD_NFT_2_LINK_URL = "/";
const BINDER_INTRO_NOTE_FILTER_FADE_MS = 260;
const BINDER_INTRO_FOCUS_MARGIN_RATIO = 0.12;
const BINDER_INTRO_FOCUS_MOBILE_MARGIN_RATIO = 0.04;
const BINDER_INTRO_FOCUS_EXTRA_Z = 0.08;
const BINDER_CARD_VIEW_TRANSITION_MS = 820;
const INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD = 1560;
const BINDER_TO_INDIVIDUAL_WHEEL_THRESHOLD = 680;
const VIEW_SWITCH_WHEEL_IDLE_MS = 900;
const PINCH_WHEEL_DELTA_SCALE = 1120;
const PINCH_MIN_DISTANCE_PX = 28;
const PINCH_DELTA_EPSILON = 0.004;
const BINDER_FOCUS_SWIPE_MIN_DISTANCE = 46;
const BINDER_FOCUS_SWIPE_MAX_OFF_AXIS_RATIO = 0.86;
const DOUBLE_TAP_ZOOM_SUPPRESSION_MS = 320;
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
const MAX_WARMED_INDIVIDUAL_CARD_EFFECTS = 64;
const GALLERY_PRIORITY_ROWS = 4;
const GALLERY_CARD_HOVER_EXPAND_PX = 5;
const GALLERY_CARD_TILT_MAX_X_DEG = 12.5;
const GALLERY_CARD_TILT_MAX_Y_DEG = 15.5;
const GALLERY_CARD_TILT_SPRING = 0.14;
const GALLERY_CARD_TILT_DAMPING = 0.76;
const GALLERY_CARD_TILT_SETTLE_EPSILON = 0.02;
const TRAIT_SEARCH_TILE_RENDER_BATCH_SIZE = 320;
const SHUFFLE_TOUCH_UNDO_HOLD_MS = 560;
const SHUFFLE_TOUCH_UNDO_SUPPRESS_MS = 1000;
const SHUFFLE_TOUCH_UNDO_MOVE_LIMIT = 14;
const BINDER_DOUBLE_TAP_MS = 420;
const BINDER_DOUBLE_TAP_DISTANCE = 28;
const SHUFFLE_HISTORY_LIMIT = 10;
const MAX_TEXTURE_CACHE_SIZE = 260;
const BINDER_ANIMATED_IDLE_MS = 84;
const BINDER_INTERACTION_ACTIVE_MS = 900;
const BINDER_FRAME_MS = 1000 / 60;
const BINDER_MAX_FRAME_DELTA_MS = 34;
const BINDER_TURN_BASE_ALPHA = 0.16;
const BINDER_CAMERA_BASE_ALPHA = 0.1;
const BINDER_FOCUS_CAMERA_BASE_ALPHA = 0.12;
const SESSION_VIEW_STATE_KEY = `cardnft:${ACTIVE_COLLECTION_ID}:sessionView:v1`;
const TENSOR_ITEM_URL_BASE = "https://www.tensor.trade/item/";
const SOLSCAN_TOKEN_URL_BASE = "https://solscan.io/token/";
const restoredSessionViewState = loadSessionViewState();

const els = {
  body: document.body,
  cardCanvas: document.querySelector("#cardCanvas"),
  cardBinderReturnButton: document.querySelector("#cardBinderReturnButton"),
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
textureLoader.setCrossOrigin("anonymous");
const nftTextureCache = new Map();
const cardNft2EffectTextureCache = new Map();
const warmedIndividualCardEffectKeys = new Set();
const warmedIndividualCardEffectQueue = [];
const animatedTextureRecords = new Set();
const favorites = loadSet("cardnft:favorites:v1");
migrateLegacyFavorites(favorites);
const shuffleHistory = [];
const binderShuffleHistory = [];

let currentIndex = 0;
let galleryOpen = false;
let favoritesOnly = false;
let traitSortCategory = "all";
let activeTraitFilter = null;
let traitSearchOpen = false;
let traitSearchQuery = "";
const traitSearchCollapsedCategories = new Set();
const traitSearchGroupDataByKey = new Map();
let traitSearchRenderToken = 0;
let traitSearchRenderFrame = 0;
let traitSortPickerOpen = false;
let traitSortPickerOpenedAt = 0;
let traitSortPickerSyncFrame = 0;
let activeGalleryTiltCard = null;
let galleryTiltFrame = 0;
const galleryTiltStates = new Map();
let sessionViewSaveFrame = 0;
let lastTouchEndAt = 0;
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
const backTexturePromises = new Map();
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
let cardEffectPointerTargetX = CARD_NFT_2_EFFECT_OFFCARD_POINTER_X;
let cardEffectPointerTargetY = CARD_NFT_2_EFFECT_OFFCARD_POINTER_Y;
let cardEffectPointerTargetActive = 0;
let cardEffectPointerX = CARD_NFT_2_EFFECT_OFFCARD_POINTER_X;
let cardEffectPointerY = CARD_NFT_2_EFFECT_OFFCARD_POINTER_Y;
let cardEffectPointerActive = 0;
let cardEffectViewOpacity = 1;
let cardEffectViewTargetOpacity = 1;
let cardEffectViewStartOpacity = 1;
let cardEffectViewFadeStartedAt = 0;
let traitsOpen = false;
let individualWheelOutDistance = 0;
let individualWheelOutLastAt = 0;
let binderFocusWheelInDistance = 0;
let binderFocusWheelInLastAt = 0;
const cardTouchPointers = new Map();
const binderTouchPointers = new Map();
let cardPinchGesture = null;
let binderPinchGesture = null;
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
let binderIntroFocusMeshes = [];
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
let binderLastAnimationAt = 0;
let binderAnimationDelayTimer = 0;
let binderLastAnimationIdleOnly = false;
let binderRenderFrame = 0;
let binderMaintenanceTimer = 0;
let binderSpreadPreparationToken = 0;
let binderPreparingSpread = false;
let binderFocusPosition = -1;
let binderIntroFocused = false;
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
let rememberedBinderViewFocus = null;
const binderTextureQueue = [];
const binderTextureQueuedPositions = new Set();
const cardRaycaster = new THREE.Raycaster();
const cardPointer = new THREE.Vector2();
const binderRaycaster = new THREE.Raycaster();
const binderPointer = new THREE.Vector2();
const binderDefaultCameraPosition = new THREE.Vector3(0, 0.24, 10);
const binderDefaultCameraLookAt = new THREE.Vector3(0, 0.24, 0);
const binderDesiredCameraPosition = new THREE.Vector3();
const binderDesiredCameraLookAt = new THREE.Vector3();
const binderCurrentCameraLookAt = binderDefaultCameraLookAt.clone();
const binderFocusWorldPosition = new THREE.Vector3();
const binderIntroFocusWorldPosition = new THREE.Vector3();
const binderIntroFocusLocalPosition = new THREE.Vector3();
const binderIntroFocusWorldScale = new THREE.Vector3();

init();

function init() {
  applyTheme(localStorage.getItem("cardnft:theme:v1") === "light");
  els.body.classList.toggle("trait-filters-disabled", !TRAIT_FILTERS_ENABLED);
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
    new THREE.MeshBasicMaterial({
      map: getCardPlaceholderTexture(),
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    }),
  );
  cardFrontMesh.position.z = CARD_DEPTH / 2 + 0.003;
  cardFrontMesh.renderOrder = 22;
  cardGroup.add(cardFrontMesh);

  cardBackMesh = new THREE.Mesh(
    faceGeometry.clone(),
    new THREE.MeshBasicMaterial({
      map: getCardPlaceholderTexture(),
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    }),
  );
  cardBackMesh.position.z = -CARD_DEPTH / 2 - 0.003;
  cardBackMesh.rotation.y = Math.PI;
  cardBackMesh.renderOrder = 22;
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

function suppressDoubleTapZoom(event) {
  if (!event.changedTouches || event.changedTouches.length !== 1) {
    lastTouchEndAt = 0;
    return;
  }

  const now = performance.now();
  if (now - lastTouchEndAt <= DOUBLE_TAP_ZOOM_SUPPRESSION_MS) {
    event.preventDefault();
  }
  lastTouchEndAt = now;
}

function preventBrowserZoomGesture(event) {
  event.preventDefault();
}

function preventBrowserZoomWheel(event) {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
}

function preventBrowserZoomKeydown(event) {
  if (!event.ctrlKey && !event.metaKey) return;
  const key = event.key;
  const code = event.code;
  if (
    key === "+"
    || key === "-"
    || key === "="
    || key === "_"
    || key === "0"
    || code === "NumpadAdd"
    || code === "NumpadSubtract"
    || code === "Numpad0"
  ) {
    event.preventDefault();
  }
}

function initEvents() {
  document.addEventListener("touchend", suppressDoubleTapZoom, { passive: false });
  document.addEventListener("gesturestart", preventBrowserZoomGesture, { passive: false, capture: true });
  document.addEventListener("gesturechange", preventBrowserZoomGesture, { passive: false, capture: true });
  document.addEventListener("gestureend", preventBrowserZoomGesture, { passive: false, capture: true });
  document.addEventListener("wheel", preventBrowserZoomWheel, { passive: false, capture: true });
  document.addEventListener("keydown", preventBrowserZoomKeydown, { capture: true });
  els.cardBinderReturnButton.addEventListener("click", () => {
    transitionIndividualCardToFocusedBinder().catch(console.error);
  });
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
  els.galleryToggleButton.addEventListener("click", toggleCornerGalleryView);
  els.galleryViewToggleButton.addEventListener("click", toggleGalleryViewMode);
  els.galleryGrid.addEventListener("click", onGalleryGridClick);
  els.galleryGrid.addEventListener("pointerover", onGalleryGridTiltPointerMove);
  els.galleryGrid.addEventListener("pointermove", onGalleryGridTiltPointerMove);
  els.galleryGrid.addEventListener("pointerout", onGalleryGridTiltPointerOut);
  els.galleryGrid.addEventListener("pointerleave", releaseActiveGalleryCardTilt);
  els.galleryGrid.addEventListener("pointercancel", releaseActiveGalleryCardTilt);
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
  els.traitSearchGroups.addEventListener("click", onTraitSearchGroupsClick);
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
  window.addEventListener("blur", () => {
    setTraitSortPickerOpen(false);
    resetTouchGestures();
  });
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
  els.cardCanvas.addEventListener("pointerleave", clearCardEffectPointer);
  els.cardCanvas.addEventListener("mousemove", updateCardEffectPointerFromEvent);
  els.cardCanvas.addEventListener("mouseleave", clearCardEffectPointer);
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
  els.traitSortSelect.disabled = !TRAIT_FILTERS_ENABLED;
  els.traitSearchButton.disabled = !TRAIT_FILTERS_ENABLED;
  if (!TRAIT_FILTERS_ENABLED) {
    els.gallerySortControl.title = "Trait sorting is not available for this collection yet";
    els.traitSearchButton.title = "Trait search is not available for this collection yet";
  }

  const fragment = document.createDocumentFragment();
  for (const { category } of TRAIT_FILTERS_ENABLED ? getTraitDisplayCategoryOptions() : []) {
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
  if (!TRAIT_FILTERS_ENABLED) return;
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
  if (Object.prototype.hasOwnProperty.call(options, "effectTextures")) {
    applyLoadedIndividualCardEffect(card, options.effectTextures);
  } else {
    applyCardEffectProfile(card, token);
  }

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
  if (options.backTexture) {
    prepareTextureForImmediateDisplay(options.backTexture);
    cardBackMesh.material.map = options.backTexture;
    cardBackMesh.material.needsUpdate = true;
  } else {
    getBackTexture(card).then((texture) => {
      if (token !== cardApplyToken) return;
      prepareTextureForImmediateDisplay(texture);
      cardBackMesh.material.map = texture;
      cardBackMesh.material.needsUpdate = true;
    }).catch(console.error);
  }

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

function applyCardEffectProfile(card, token = cardApplyToken) {
  const frontProfile = getCardEffectProfile(card);
  const backProfile = frontProfile.effectMode === CARD_EFFECT_MODE_DEFAULT
    ? frontProfile
    : { ...frontProfile, effectMode: CARD_EFFECT_MODE_CARD_NFT_2_LIGHTING, needsEffectTextures: false };

  applyCardEffectProfileToMesh(cardGradientMesh, frontProfile);
  applyCardEffectProfileToMesh(cardGlareMesh, frontProfile);
  applyCardEffectProfileToMesh(cardBackGradientMesh, backProfile);
  applyCardEffectProfileToMesh(cardBackGlareMesh, backProfile);

  if (!frontProfile.needsEffectTextures) return;

  loadCardNft2EffectTextures(frontProfile.cardNumber)
    .then(({ foil, mask }) => {
      if (token !== cardApplyToken) return;
      applyCardEffectTexturesToMesh(cardGradientMesh, foil, mask);
      applyCardEffectTexturesToMesh(cardGlareMesh, foil, mask);
    })
    .catch(() => {
      if (token !== cardApplyToken) return;
      applyCardEffectTexturesToMesh(cardGradientMesh, null, null);
      applyCardEffectTexturesToMesh(cardGlareMesh, null, null);
    });
}

function getCardEffectProfile(card) {
  const cardNumber = getCardNft2Number(card);
  if (card?.collection !== "cardnft2" || !Number.isInteger(cardNumber)) {
    return {
      effectMode: CARD_EFFECT_MODE_DEFAULT,
      cardNumber: 0,
      needsEffectTextures: false,
    };
  }

  const common = CARD_NFT_2_COMMON_ID_SET.has(cardNumber);
  const effectMode = common
    ? CARD_EFFECT_MODE_CARD_NFT_2_LIGHTING
    : CARD_NFT_2_HOLO_EFFECT_MODES_BY_REMAINDER[modulo(cardNumber, CARD_NFT_2_HOLO_EFFECT_MODES_BY_REMAINDER.length)];

  return {
    effectMode,
    cardNumber,
    needsEffectTextures: effectMode !== CARD_EFFECT_MODE_CARD_NFT_2_LIGHTING,
  };
}

function applyCardEffectProfileToMesh(mesh, profile) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms) return;
  uniforms.uEffectMode.value = profile.effectMode;
  uniforms.uUseEffectTextures.value = 0;
  uniforms.uFoilTexture.value = getCardPlaceholderTexture();
  uniforms.uMaskTexture.value = getCardPlaceholderTexture();
}

function applyCardEffectTexturesToMesh(mesh, foilTexture, maskTexture) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms) return;
  uniforms.uFoilTexture.value = foilTexture || getCardPlaceholderTexture();
  uniforms.uMaskTexture.value = maskTexture || getCardPlaceholderTexture();
  uniforms.uUseEffectTextures.value = foilTexture && maskTexture ? 1 : 0;
}

function applyLoadedIndividualCardEffect(card, textures = null) {
  const frontProfile = getCardEffectProfile(card);
  const backProfile = frontProfile.effectMode === CARD_EFFECT_MODE_DEFAULT
    ? frontProfile
    : { ...frontProfile, effectMode: CARD_EFFECT_MODE_CARD_NFT_2_LIGHTING, needsEffectTextures: false };

  applyCardEffectProfileToMesh(cardGradientMesh, frontProfile);
  applyCardEffectProfileToMesh(cardGlareMesh, frontProfile);
  applyCardEffectProfileToMesh(cardBackGradientMesh, backProfile);
  applyCardEffectProfileToMesh(cardBackGlareMesh, backProfile);
  if (frontProfile.needsEffectTextures) {
    applyCardEffectTexturesToMesh(cardGradientMesh, textures?.foil, textures?.mask);
    applyCardEffectTexturesToMesh(cardGlareMesh, textures?.foil, textures?.mask);
  }
}

function loadCardEffectTexturesForProfile(profile) {
  if (!profile?.needsEffectTextures) return Promise.resolve(null);
  return loadCardNft2EffectTextures(profile.cardNumber);
}

function preloadCardEffectTextures(card) {
  const profile = getCardEffectProfile(card);
  if (!profile.needsEffectTextures) return;
  loadCardEffectTexturesForProfile(profile).catch(() => {});
}

function getCardNft2Number(card) {
  if (!card) return null;
  const values = [card.title, card.stableId, card.file];
  for (const value of values) {
    const match = String(value || "").match(/card[-\s#]*(\d+)/i);
    if (match) return Number.parseInt(match[1], 10);
  }
  return null;
}

async function transitionAdjacentCard(direction) {
  if (cardSwapAnimating || cardShuffleSpinAnimating || galleryOpen || !CARDS.length) return;

  cardSwapAnimating = true;
  const token = ++cardSwapToken;
  const nextIndex = getAdjacentIndividualCardIndex(direction);
  const nextCard = CARDS[nextIndex];
  const nextEffectProfile = getCardEffectProfile(nextCard);
  setIndividualCardControlsDisabled(true);
  updateCardNameJumpState();
  try {
    if (token !== cardSwapToken) return;
    const [nextTexture, backTexture, effectTextures] = await Promise.all([
      getPreparedCardTexture(nextCard).catch((error) => {
        console.error(error);
        return null;
      }),
      getBackTexture(nextCard).catch((error) => {
        console.error(error);
        return getBackPlaceholderTexture();
      }),
      loadCardEffectTexturesForProfile(nextEffectProfile).catch(() => null),
    ]);
    if (token !== cardSwapToken) return;
    prewarmIndividualCardEffect(nextCard, nextTexture, backTexture, effectTextures);
    prepareCardSwapIncomingGroup(direction, nextTexture, backTexture, nextCard, effectTextures);
    await tweenCardSwap(direction, nextIndex, nextTexture, backTexture, effectTextures, token);
  } finally {
    if (token === cardSwapToken) {
      resetCardSwapVisualState();
      cardSwapAnimating = false;
      setIndividualCardControlsDisabled(false);
      updateCardNameJumpState();
    }
  }
}

function tweenCardSwap(direction, nextIndex, nextTexture, backTexture, effectTextures, token) {
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
        setCard(nextIndex, {
          frontTexture: nextTexture,
          backTexture,
          effectTextures,
          preserveSwapVisuals: true,
        });
        resolve();
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function prepareCardSwapIncomingGroup(direction, frontTexture, backTexture, card, effectTextures) {
  removeCardSwapIncomingGroup();
  cardSwapIncomingGroup = createCardSwapGroup(frontTexture, backTexture, card, effectTextures);
  cardSwapIncomingFrontMesh = cardSwapIncomingGroup.userData.frontMesh || null;
  cardSwapIncomingOffsetX = direction * CARD_SWAP_DISTANCE;
  cardSwapIncomingOpacity = CARD_SWAP_MIN_OPACITY;
  cardScene.add(cardSwapIncomingGroup);
  updateCardSwapIncomingTransform();
  applyCardSwapOpacity();
}

function createCardSwapGroup(frontTexture, backTexture, card = null, effectTextures = null) {
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
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    }),
  );
  frontMesh.position.z = CARD_DEPTH / 2 + 0.003;
  frontMesh.renderOrder = 22;
  group.add(frontMesh);

  const backMesh = new THREE.Mesh(
    faceGeometry.clone(),
    new THREE.MeshBasicMaterial({
      map: backTexture || getBackPlaceholderTexture(),
      transparent: true,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    }),
  );
  backMesh.position.z = -CARD_DEPTH / 2 - 0.003;
  backMesh.rotation.y = Math.PI;
  backMesh.renderOrder = 22;
  group.add(backMesh);

  const frontNoise = createCardSurfaceNoisePlane();
  frontNoise.position.z = CARD_DEPTH / 2 + 0.005;
  group.add(frontNoise);

  const backNoise = createCardSurfaceNoisePlane();
  backNoise.rotation.y = Math.PI;
  backNoise.position.z = -CARD_DEPTH / 2 - 0.005;
  group.add(backNoise);

  const effectMeshes = createCardSwapEffectMeshes(card, effectTextures);
  for (const effectMesh of effectMeshes) group.add(effectMesh);

  group.userData.frontMesh = frontMesh;
  group.userData.effectMeshes = effectMeshes;
  return group;
}

function createCardSwapEffectMeshes(card, effectTextures = null) {
  const frontProfile = getCardEffectProfile(card);
  const backProfile = frontProfile.effectMode === CARD_EFFECT_MODE_DEFAULT
    ? frontProfile
    : { ...frontProfile, effectMode: CARD_EFFECT_MODE_CARD_NFT_2_LIGHTING, needsEffectTextures: false };

  const frontGradient = createCardGradientPlane(1);
  frontGradient.position.z = CARD_DEPTH / 2 + 0.007;
  const frontGlare = createCardGlossPlane(1);
  frontGlare.position.z = CARD_DEPTH / 2 + 0.009;

  const backGradient = createCardGradientPlane(-1);
  backGradient.rotation.y = Math.PI;
  backGradient.position.z = -CARD_DEPTH / 2 - 0.007;
  const backGlare = createCardGlossPlane(-1);
  backGlare.rotation.y = Math.PI;
  backGlare.position.z = -CARD_DEPTH / 2 - 0.009;

  applyCardEffectProfileToMesh(frontGradient, frontProfile);
  applyCardEffectProfileToMesh(frontGlare, frontProfile);
  applyCardEffectProfileToMesh(backGradient, backProfile);
  applyCardEffectProfileToMesh(backGlare, backProfile);
  if (frontProfile.needsEffectTextures) {
    applyCardEffectTexturesToMesh(frontGradient, effectTextures?.foil, effectTextures?.mask);
    applyCardEffectTexturesToMesh(frontGlare, effectTextures?.foil, effectTextures?.mask);
  }

  return [frontGradient, frontGlare, backGradient, backGlare];
}

function getPreparedCardTexture(card) {
  return getCardTexture(card).then((texture) => {
    prepareTextureForImmediateDisplay(texture);
    return texture;
  });
}

function preloadAdjacentIndividualTextures(index) {
  if (CARDS.length < 2) return;
  const sequence = getIndividualCardSequenceIndexes();
  const position = sequence.indexOf(index);
  if (position === -1 || sequence.length < 2) return;
  const indexes = new Set([
    sequence[modulo(position - 1, sequence.length)],
    sequence[modulo(position + 1, sequence.length)],
  ]);
  for (const adjacentIndex of indexes) {
    const card = CARDS[adjacentIndex];
    const effectProfile = getCardEffectProfile(card);
    Promise.all([
      getPreparedCardTexture(card).catch(() => null),
      getBackTexture(card).catch(() => null),
      loadCardEffectTexturesForProfile(effectProfile).catch(() => null),
    ]).then(([frontTexture, backTexture, effectTextures]) => {
      prewarmIndividualCardEffect(card, frontTexture, backTexture, effectTextures);
    }).catch(() => {});
  }
}

function prewarmIndividualCardEffect(card, frontTexture, backTexture, effectTextures = null) {
  warmTextureForImmediateDisplay(frontTexture);
  warmTextureForImmediateDisplay(backTexture);
  warmTextureForImmediateDisplay(effectTextures?.foil);
  warmTextureForImmediateDisplay(effectTextures?.mask);

  if (!card || !cardRenderer || !cardScene || !cardCamera) return;
  const key = getIndividualCardEffectWarmKey(card, effectTextures);
  if (warmedIndividualCardEffectKeys.has(key)) return;

  const group = createCardSwapGroup(frontTexture, backTexture, card, effectTextures);
  group.position.set(10000, 10000, 0);
  if (cardGroup) {
    group.rotation.copy(cardGroup.rotation);
    group.scale.copy(cardGroup.scale);
  }
  group.traverse((object) => {
    object.frustumCulled = false;
  });

  cardScene.add(group);
  try {
    updateCardEffectUniformsForGroup(group);
    if (typeof cardRenderer.compile === "function") cardRenderer.compile(cardScene, cardCamera);
    cardRenderer.render(cardScene, cardCamera);
    rememberWarmedIndividualCardEffectKey(key);
  } catch {
    // If the driver refuses an eager compile, the normal render path still works.
  } finally {
    cardScene.remove(group);
    disposeCardSwapGroup(group);
  }
}

function warmTextureForImmediateDisplay(texture) {
  if (!texture) return;
  prepareTextureForImmediateDisplay(texture);
  if (typeof cardRenderer?.initTexture !== "function") return;
  try {
    cardRenderer.initTexture(texture);
  } catch {
    // Some WebGL drivers only allow upload during render; the offscreen pass handles that.
  }
}

function getIndividualCardEffectWarmKey(card, effectTextures = null) {
  const profile = getCardEffectProfile(card);
  const cardKey = card?.stableId || `${card?.collection || ACTIVE_COLLECTION_ID}:${card?.mint || card?.title || card?.setIndex || 0}`;
  const textureState = profile.needsEffectTextures
    ? (effectTextures?.foil && effectTextures?.mask ? "textures" : "fallback")
    : "none";
  return `${cardKey}:${profile.effectMode}:${textureState}`;
}

function rememberWarmedIndividualCardEffectKey(key) {
  if (warmedIndividualCardEffectKeys.has(key)) return;
  warmedIndividualCardEffectKeys.add(key);
  warmedIndividualCardEffectQueue.push(key);
  while (warmedIndividualCardEffectQueue.length > MAX_WARMED_INDIVIDUAL_CARD_EFFECTS) {
    const oldest = warmedIndividualCardEffectQueue.shift();
    warmedIndividualCardEffectKeys.delete(oldest);
  }
}

function getAdjacentIndividualCardIndex(direction) {
  const sequence = getIndividualCardSequenceIndexes();
  if (!sequence.length) return currentIndex;
  const position = sequence.indexOf(currentIndex);
  const currentPosition = position === -1 ? 0 : position;
  return sequence[modulo(currentPosition + Math.sign(direction || 1), sequence.length)];
}

function getIndividualCardSequenceIndexes() {
  if (ACTIVE_COLLECTION_INDEXES.includes(currentIndex)) return ACTIVE_COLLECTION_INDEXES;
  return CARDS.map((_, index) => index);
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
  els.cardBinderReturnButton.disabled = disabled;
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
  const sequence = getIndividualCardSequenceIndexes();
  if (sequence.length < 2) return;

  let next = currentIndex;
  while (next === currentIndex) {
    next = sequence[Math.floor(Math.random() * sequence.length)];
  }

  await spinToCard(next, { recordHistory: true });
}

async function spinToCard(nextIndex, { recordHistory = false } = {}) {
  if (CARDS.length < 2 || cardSwapAnimating || cardShuffleSpinAnimating || galleryOpen) return false;

  const targetIndex = clamp(nextIndex, 0, CARDS.length - 1);
  if (targetIndex === currentIndex) return false;

  if (recordHistory) {
    shuffleHistory.push(currentIndex);
    if (shuffleHistory.length > SHUFFLE_HISTORY_LIMIT) shuffleHistory.shift();
  }

  cardShuffleSpinAnimating = true;
  const token = ++cardShuffleSpinToken;
  setIndividualCardControlsDisabled(true);
  updateCardNameJumpState();
  dragState = null;
  targetRotationX = 0;
  targetRotationY = 0;

  try {
    const [frontTexture, backTexture] = await Promise.all([
      getPreparedCardTexture(CARDS[targetIndex]).catch((error) => {
        console.error(error);
        return null;
      }),
      getBackTexture(CARDS[targetIndex]).catch((error) => {
        console.error(error);
        return null;
      }),
    ]);
    if (token !== cardShuffleSpinToken) return false;

    await tweenCardShuffleSpin(targetIndex, frontTexture, token);
    if (token !== cardShuffleSpinToken) return false;
    setCard(targetIndex, {
      frontTexture,
      backTexture,
      preserveSpinVisuals: true,
    });
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

function tweenCardShuffleSpin(nextIndex, frontTexture, token) {
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
        applyShuffleFrontFace(nextIndex, frontTexture);
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

function applyShuffleFrontFace(nextIndex, frontTexture) {
  const card = CARDS[nextIndex];
  if (frontTexture) {
    prepareTextureForImmediateDisplay(frontTexture);
    cardFrontMesh.material.map = frontTexture;
    cardFrontMesh.material.needsUpdate = true;
  } else {
    cardFrontMesh.material.map = getCardPlaceholderTexture();
    cardFrontMesh.material.needsUpdate = true;
  }
  applyCardFrontEffectProfile(card, cardApplyToken, { loadTextures: false });
}

function applyCardFrontEffectProfile(card, token = cardApplyToken, { loadTextures = true } = {}) {
  const profile = getCardEffectProfile(card);
  applyCardEffectProfileToMesh(cardGradientMesh, profile);
  applyCardEffectProfileToMesh(cardGlareMesh, profile);

  if (!profile.needsEffectTextures || !loadTextures) return;

  loadCardNft2EffectTextures(profile.cardNumber)
    .then(({ foil, mask }) => {
      if (token !== cardApplyToken) return;
      applyCardEffectTexturesToMesh(cardGradientMesh, foil, mask);
      applyCardEffectTexturesToMesh(cardGlareMesh, foil, mask);
    })
    .catch(() => {
      if (token !== cardApplyToken) return;
      applyCardEffectTexturesToMesh(cardGradientMesh, null, null);
      applyCardEffectTexturesToMesh(cardGlareMesh, null, null);
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

  updateTraitExternalLinks();
  const traits = getCardTraitEntries(currentIndex);
  const fragment = document.createDocumentFragment();
  for (const trait of traits) {
    const tile = document.createElement("button");
    tile.className = "trait-tile";
    tile.type = "button";
    if (TRAIT_FILTERS_ENABLED) {
      tile.title = `Show cards with ${trait.value}`;
      tile.addEventListener("click", () => openTraitFilteredGallery(trait));
    } else {
      tile.disabled = true;
    }

    const category = document.createElement("div");
    category.className = "trait-category";
    category.textContent = getTraitCategoryDisplayLabel(trait.category);

    const value = document.createElement("div");
    value.className = "trait-value";
    value.textContent = trait.value;

    const count = document.createElement("div");
    count.className = "trait-total";
    const total = getTraitOccurrenceCount(trait.category, trait.value, trait.collection);
    count.textContent = `${total} total`;

    const thumbnail = createTraitThumbnailImage(
      trait.collection,
      trait.category,
      trait.value,
      "trait-thumbnail"
    );
    if (thumbnail) {
      tile.classList.add("has-trait-thumbnail");
      tile.append(category, value, count, thumbnail);
    } else {
      tile.append(category, value, count);
    }
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
  applyTraitFilter(trait.category, trait.value, { sourceCategories: trait.sourceCategories });
}

function applyTraitFilter(category, value, options = {}) {
  if (!TRAIT_FILTERS_ENABLED) return;
  const displayCategory = getTraitSearchDisplayCategory(category);
  const sourceCategories = getValidTraitFilterSourceCategories(options.sourceCategories, category);
  activeTraitFilter = {
    category: displayCategory,
    value,
    normalizedValue: normalizeTraitValue(value),
    sourceCategories,
  };
  traitSortCategory = displayCategory;
  els.traitSortSelect.value = displayCategory;
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
  const card = CARDS[index];
  const collection = getCollectionConfigForCard(card);
  const traitRecord = collection.traits[card?.collectionIndex] || {};
  if (Array.isArray(traitRecord.entries)) {
    const entries = traitRecord.entries
      .map((entry) => ({
        collection: collection.id,
        category: String(entry?.category || "").trim(),
        value: String(entry?.value || "").trim(),
      }))
      .filter(({ category, value }) => !HIDDEN_TRAIT_CATEGORIES.has(category) && isVisibleTraitValue(value));
    return orderTraitPanelEntries(entries);
  }

  const values = traitRecord.values || [];
  const entries = collection.traitCategories
    .map((category, categoryIndex) => ({
      collection: collection.id,
      category,
      value: String(values[categoryIndex] || "").trim(),
    }))
    .filter(({ category, value }) => !HIDDEN_TRAIT_CATEGORIES.has(category) && isVisibleTraitValue(value));
  return orderTraitPanelEntries(entries);
}

function orderTraitPanelEntries(entries) {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const orderA = getTraitPanelDisplayCategoryOrder(a.entry);
      const orderB = getTraitPanelDisplayCategoryOrder(b.entry);
      if (orderA !== orderB) return orderA - orderB;
      const sourceOrderA = getTraitPanelSourceCategoryOrder(a.entry);
      const sourceOrderB = getTraitPanelSourceCategoryOrder(b.entry);
      if (sourceOrderA !== sourceOrderB) return sourceOrderA - sourceOrderB;
      return a.index - b.index;
    })
    .map(({ entry }) => entry);
}

function getTraitPanelDisplayCategoryOrder(entry) {
  const collection = COLLECTION_CONFIGS[entry.collection] || ACTIVE_COLLECTION;
  const displayCategory = getTraitSearchDisplayCategory(entry.category, collection.id);
  return getTraitDisplayCategoryOrder({
    category: displayCategory || entry.category,
    sourceCategories: getTraitPanelDisplaySourceCategories(entry, collection),
  }, collection.id);
}

function getTraitPanelDisplaySourceCategories(entry, collection = ACTIVE_COLLECTION) {
  const displayCategory = getTraitSearchDisplayCategory(entry.category, collection.id);
  const normalizedDisplayCategory = normalizeTraitValue(displayCategory);
  const sourceCategories = collection.traitCategories.filter((sourceCategory) => (
    !HIDDEN_TRAIT_CATEGORIES.has(sourceCategory)
    && normalizeTraitValue(getTraitSearchDisplayCategory(sourceCategory, collection.id)) === normalizedDisplayCategory
  ));
  return sourceCategories.length ? sourceCategories : [entry.category].filter(Boolean);
}

function getTraitPanelSourceCategoryOrder(entry) {
  const collection = COLLECTION_CONFIGS[entry.collection] || ACTIVE_COLLECTION;
  const normalizedCategory = String(entry.category || "").trim().toLowerCase();
  const categoryIndex = collection.traitCategories.findIndex((category) => (
    String(category || "").trim().toLowerCase() === normalizedCategory
  ));
  return categoryIndex >= 0 ? categoryIndex : Number.MAX_SAFE_INTEGER;
}

function getTraitOccurrenceCount(category, value, collectionId = ACTIVE_COLLECTION_ID) {
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  const normalizedValue = normalizeTraitValue(value);
  const sourceCategories = getTraitOccurrenceSourceCategories(collection, category);
  if (!sourceCategories.length || !normalizedValue) return 0;

  return collection.traits.reduce((total, traitRecord) => {
    const hasTrait = sourceCategories.some((sourceCategory) => {
      const categoryIndex = collection.traitCategories.indexOf(sourceCategory);
      if (categoryIndex < 0) return false;

      if (Array.isArray(traitRecord?.entries)) {
        return traitRecord.entries.some((entry) => (
          String(entry?.category || "").trim() === sourceCategory
          && normalizeTraitValue(entry?.value) === normalizedValue
        ));
      }

      return normalizeTraitValue(traitRecord?.values?.[categoryIndex]) === normalizedValue;
    });
    return hasTrait ? total + 1 : total;
  }, 0);
}

function getTraitOccurrenceSourceCategories(collection, category) {
  const trimmed = String(category || "").trim();
  if (!trimmed) return [];

  if (collection.id !== "cardnft2") {
    return collection.traitCategories.includes(trimmed) ? [trimmed] : [];
  }

  const displayCategory = getTraitSearchDisplayCategory(trimmed, collection.id);
  const normalizedDisplayCategory = normalizeTraitValue(displayCategory);
  return collection.traitCategories.filter((sourceCategory) => (
    !HIDDEN_TRAIT_CATEGORIES.has(sourceCategory)
    && normalizeTraitValue(getTraitSearchDisplayCategory(sourceCategory, collection.id)) === normalizedDisplayCategory
  ));
}

function getCollectionConfigForCard(card) {
  return COLLECTION_CONFIGS[card?.collection] || ACTIVE_COLLECTION;
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
  input.value = String(getCardJumpDisplayNumber(currentIndex));
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

function getCardJumpDisplayNumber(index) {
  const parsed = parseCardJumpNumber(CARDS[index]?.title);
  if (Number.isInteger(parsed)) return parsed;
  const position = getIndividualCardSequenceIndexes().indexOf(index);
  return position >= 0 ? position + 1 : index + 1;
}

function parseCardNumberJumpValue(value, total) {
  const parsed = parseCardJumpNumber(value);
  if (!Number.isFinite(parsed) || total < 1) return null;
  return clamp(parsed, 1, total) - 1;
}

function parseFocusedBinderNumberJumpValue(value, total) {
  const parsed = parseCardJumpNumber(value);
  if (!Number.isFinite(parsed) || total < 1 || parsed < 0) return null;
  if (parsed === 0) return BINDER_SINGLE_PAGE_COVER_SIDE;
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
    link.hidden = true;
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.tabIndex = -1;
    return;
  }
  link.hidden = false;
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
  if (isBinderIntroFocused()) {
    els.binderFavoriteButton.setAttribute("aria-pressed", "false");
    els.binderFavoriteButton.setAttribute("title", "No card to favorite");
    els.binderFavoriteButton.setAttribute("aria-label", "No card to favorite");
    return;
  }

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

function toggleCornerGalleryView() {
  const nextOpen = !galleryOpen;
  if (!nextOpen && !rememberCurrentBinderViewFocus()) {
    clearRememberedBinderViewFocus();
  }

  setGalleryOpen(nextOpen, { resetFilters: nextOpen && !hasActiveGalleryMode() });
  if (nextOpen && restoreRememberedBinderViewFocus()) {
    queueSessionViewStateSave();
  }
}

function rememberCurrentBinderViewFocus() {
  if (!galleryOpen || !isBinderMode || !isBinderFocusView()) return false;

  if (isBinderIntroFocused()) {
    rememberedBinderViewFocus = { type: "intro" };
    return true;
  }

  const cardIndex = getFocusedBinderCardIndex();
  if (!Number.isInteger(cardIndex)) return false;
  rememberedBinderViewFocus = { type: "card", cardIndex };
  return true;
}

function clearRememberedBinderViewFocus() {
  rememberedBinderViewFocus = null;
}

function restoreRememberedBinderViewFocus() {
  if (!rememberedBinderViewFocus || !galleryOpen || !isBinderMode || traitSearchOpen) return false;

  if (rememberedBinderViewFocus.type === "intro") {
    if (!focusBinderIntroNote({ immediate: true })) return false;
    renderBinderSceneOnce({ immediateCamera: true });
    return true;
  }

  const cardIndex = rememberedBinderViewFocus.cardIndex;
  if (!Number.isInteger(cardIndex)) return false;
  const focusPosition = binderVisibleIndexes.indexOf(cardIndex);
  if (focusPosition === -1) return false;

  focusBinderPosition(focusPosition, { immediate: true });
  renderBinderSceneOnce({ immediateCamera: true });
  return true;
}

function setGalleryOpen(open, options = {}) {
  resetViewSwitchWheelDistances();
  resetTouchGestures();
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
    clearGalleryCardTilts();
    clearBinderIntroLinkCursor();
    stopBinderRenderLoop();
    if (!binderCardViewTransitionActive) {
      setCardEffectViewTargetOpacity(1, { immediate: true });
    }
  }
  updateCardNameJumpState();
  queueSessionViewStateSave();
}

function resetGalleryFilters({ preserveFavorites = false } = {}) {
  activeTraitFilter = null;
  if (!preserveFavorites) favoritesOnly = false;
  traitSearchOpen = false;
  cancelTraitSearchRender();
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
  if (!TRAIT_FILTERS_ENABLED) return;
  traitSearchOpen = !traitSearchOpen;
  if (traitSearchOpen) {
    clearBinderFocus({ silent: true });
    deactivateAllAnimatedRecords();
  } else {
    resetTraitSearchQuery();
    cancelTraitSearchRender();
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
  if (!open) cancelTraitSearchRender();
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

function hasActiveGalleryMode() {
  return Boolean(
    favoritesOnly
    || traitSearchOpen
    || hasActiveGallerySortOrFilter()
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
  const indexes = new Set(getSnapshotWalletCardIndexes(address));
  const [magicEdenIndexes, tokenAccountIndexes, cardNft2Indexes] = await Promise.all([
    fetchMagicEdenWalletCardIndexes(address).catch(() => []),
    fetchWalletTokenAccountCardIndexes(address).catch(() => []),
    fetchCardNft2WalletCardIndexes(address).catch(() => []),
  ]);
  for (const index of magicEdenIndexes || []) indexes.add(index);
  for (const index of tokenAccountIndexes || []) indexes.add(index);
  for (const index of cardNft2Indexes || []) indexes.add(index);
  return [...indexes].sort(compareCardIndexes);
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
  for (const symbol of CARD_NFT_COLLECTION_SYMBOLS) {
    let offset = 0;

    while (offset < MAGIC_EDEN_WALLET_MAX_TOKENS) {
      const tokens = await magicEdenApi(
        `/wallets/${encodeURIComponent(address)}/tokens?collection_symbol=${encodeURIComponent(symbol)}&offset=${offset}&limit=${MAGIC_EDEN_WALLET_PAGE_LIMIT}&listStatus=both`,
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
  }

  return indexes;
}

async function fetchWalletTokenAccountCardIndexes(address) {
  const ownedMints = await fetchWalletTokenMints(address);
  return getCardIndexesForMints(ownedMints);
}

async function fetchCardNft2WalletCardIndexes(address) {
  const payload = await fetchCardNft2Wallet(address);
  return getCardIndexesForMints(getCardNft2WalletMints(payload));
}

async function fetchCardNft2Wallet(address) {
  const url = `${CARD_NFT_2_WALLET_API_URL}?address=${encodeURIComponent(address)}`;
  const response = await fetchWithTimeout(url, { headers: { accept: "application/json,*/*;q=0.8" } });
  if (!response.ok) throw new Error(`Card NFT 2 wallet API failed: ${response.status}`);
  return response.json();
}

function getCardNft2WalletMints(payload) {
  const candidates = Array.isArray(payload?.mints)
    ? payload.mints
    : Array.isArray(payload?.assets)
      ? payload.assets
      : Array.isArray(payload)
        ? payload
        : [];

  const mints = new Set();
  for (const candidate of candidates) {
    const mint = typeof candidate === "string"
      ? candidate
      : candidate?.mint
        || candidate?.mintAddress
        || candidate?.id
        || candidate?.assetId
        || "";
    if (mint) mints.add(String(mint).trim());
  }
  return mints;
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
  let indexes = (favoritesOnly || walletFilterCardIndexSet)
    ? CARDS.map((_, index) => index)
    : ACTIVE_COLLECTION_INDEXES.slice();
  if (favoritesOnly) {
    indexes = indexes.filter((index) => favorites.has(favoriteKey(index)));
  }
  if (walletFilterCardIndexSet) {
    indexes = indexes.filter((index) => walletFilterCardIndexSet.has(index));
  }
  if (activeTraitFilter) {
    const sourceCategories = getTraitFilterSourceCategories(activeTraitFilter);
    indexes = indexes.filter((index) => (
      cardHasTraitValue(index, sourceCategories, activeTraitFilter.normalizedValue)
    ));
  }
  if (traitSortCategory === "all") return indexes;
  if (activeTraitFilter && traitSortCategory === activeTraitFilter.category) {
    return indexes.sort(compareCardIndexes);
  }
  return getTraitGroupedIndexes(indexes, traitSortCategory);
}

function getTraitGroupedIndexes(indexes, category) {
  const groups = new Map();
  const sourceCategories = getTraitSortSourceCategories(category);
  for (const index of indexes) {
    const value = getFirstCardTraitValue(index, sourceCategories);
    if (!isVisibleTraitValue(value)) continue;
    const normalized = normalizeTraitValue(value);
    if (!groups.has(normalized)) {
      groups.set(normalized, {
        value,
        indexes: [],
      });
    }
    groups.get(normalized).indexes.push(index);
  }

  return [...groups.values()]
    .sort((a, b) => a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: "base" }))
    .flatMap((group) => group.indexes.sort(compareCardIndexes));
}

function cardHasTraitValue(index, categories, normalizedValue) {
  if (!normalizedValue) return false;
  return categories.some((category) => (
    normalizeTraitValue(getCardTraitValue(index, category)) === normalizedValue
  ));
}

function getFirstCardTraitValue(index, categories) {
  for (const category of categories) {
    const value = getCardTraitValue(index, category);
    if (isVisibleTraitValue(value)) return value;
  }
  return "";
}

function getCardTraitValue(index, category) {
  const card = CARDS[index];
  const collection = getCollectionConfigForCard(card);
  const categoryIndex = collection.traitCategories.indexOf(category);
  if (categoryIndex < 0) return "";
  const traitRecord = collection.traits[card?.collectionIndex] || {};
  if (Array.isArray(traitRecord.entries)) {
    const matched = traitRecord.entries.find((entry) => (
      String(entry?.category || "").trim() === category
    ));
    return String(matched?.value || "").trim();
  }
  return traitRecord.values?.[categoryIndex] || "";
}

function isVisibleTraitValue(value) {
  const normalized = normalizeTraitValue(value);
  return Boolean(normalized) && !EXCLUDED_SORT_TRAIT_VALUES.has(normalized);
}

function normalizeTraitValue(value) {
  return String(value || "").normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
}

function getTraitValueLookupKeys(value) {
  const keys = [normalizeTraitValue(value)];
  const decomposed = String(value || "").normalize("NFD").trim().toLowerCase().replace(/\s+/g, " ");
  if (decomposed && !keys.includes(decomposed)) keys.push(decomposed);
  return keys;
}

function getTraitCategoryDisplayLabel(category) {
  const normalizedCategory = normalizeTraitValue(category);
  if (normalizedCategory === "status" || normalizedCategory === "rarity") {
    return normalizedCategory;
  }
  return category;
}

function getTraitRecordValue(traitRecord, category, categoryIndex) {
  if (Array.isArray(traitRecord?.entries)) {
    const matched = traitRecord.entries.find((entry) => (
      String(entry?.category || "").trim() === category
    ));
    return String(matched?.value || "").trim();
  }
  return String(traitRecord?.values?.[categoryIndex] || "").trim();
}

function getTraitFilterSourceCategories(filter) {
  return getValidTraitFilterSourceCategories(filter?.sourceCategories, filter?.category);
}

function getValidTraitFilterSourceCategories(sourceCategories, fallbackCategory) {
  const validCategories = new Set(ACTIVE_TRAIT_CATEGORIES);
  const categories = Array.isArray(sourceCategories)
    ? sourceCategories
    : [];
  const result = categories
    .map((category) => String(category || "").trim())
    .filter((category) => (
      category
      && validCategories.has(category)
      && !HIDDEN_TRAIT_CATEGORIES.has(category)
    ));
  if (result.length) return [...new Set(result)];

  const displaySources = getTraitSortSourceCategories(fallbackCategory);
  if (displaySources.length) return displaySources;

  if (
    fallbackCategory
    && validCategories.has(fallbackCategory)
    && !HIDDEN_TRAIT_CATEGORIES.has(fallbackCategory)
  ) {
    return [fallbackCategory];
  }
  return [];
}

function getTraitDisplayCategoryOptions() {
  const options = new Map();
  ACTIVE_TRAIT_CATEGORIES.forEach((sourceCategory) => {
    if (HIDDEN_TRAIT_CATEGORIES.has(sourceCategory)) return;

    const category = getTraitSearchDisplayCategory(sourceCategory);
    if (!category) return;
    if (!options.has(category)) {
      options.set(category, {
        category,
        sourceCategories: [],
      });
    }
    const option = options.get(category);
    if (!option.sourceCategories.includes(sourceCategory)) {
      option.sourceCategories.push(sourceCategory);
    }
  });

  return [...options.values()].sort(compareTraitDisplayCategoryOptions);
}

function compareTraitDisplayCategoryOptions(a, b) {
  const orderA = getTraitDisplayCategoryOrder(a);
  const orderB = getTraitDisplayCategoryOrder(b);
  return orderA - orderB
    || a.category.localeCompare(b.category, undefined, { numeric: true, sensitivity: "base" });
}

function getTraitDisplayCategoryOrder(option, collectionId = ACTIVE_COLLECTION_ID) {
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  const traitCategories = collection.traitCategories;
  const normalizedCategory = normalizeTraitValue(option?.category);
  if (normalizedCategory === "other") return Number.MAX_SAFE_INTEGER;
  if (
    collection.id === "cardnft2"
    && CARD_NFT_2_TRAIT_DISPLAY_ORDER_OVERRIDES.has(normalizedCategory)
  ) {
    return CARD_NFT_2_TRAIT_DISPLAY_ORDER_OVERRIDES.get(normalizedCategory);
  }
  const indexes = (option?.sourceCategories || [])
    .map((category) => traitCategories.indexOf(category))
    .filter((index) => index >= 0);
  return indexes.length ? Math.min(...indexes) : Number.MAX_SAFE_INTEGER - 1;
}

function getTraitSortSourceCategories(category) {
  if (!category || category === "all") return [];
  const normalizedCategory = normalizeTraitValue(category);
  const option = getTraitDisplayCategoryOptions()
    .find((candidate) => normalizeTraitValue(candidate.category) === normalizedCategory);
  return option?.sourceCategories || [];
}

function getTraitSearchDisplayCategory(category, collectionId = ACTIVE_COLLECTION_ID) {
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  const trimmed = String(category || "").trim();
  if (collection.id !== "cardnft2") return getTraitCategoryDisplayLabel(trimmed);

  const normalized = normalizeTraitValue(trimmed);
  if (normalized === "status" || normalized === "rarity") return normalized;
  if (CARD_NFT_2_OTHER_TRAIT_CATEGORIES.has(normalized)) return "other";
  if (CARD_NFT_2_TRAIT_CATEGORY_ALIASES.has(normalized)) {
    return CARD_NFT_2_TRAIT_CATEGORY_ALIASES.get(normalized);
  }

  const matchedPrefix = CARD_NFT_2_COLLAPSED_TRAIT_CATEGORY_PREFIXES
    .find((prefix) => normalized.startsWith(prefix));
  if (!matchedPrefix) return trimmed;

  const baseCategory = trimmed.slice(matchedPrefix.length).trim();
  return collection.traitCategories.find((candidate) => (
    normalizeTraitValue(candidate) === normalizeTraitValue(baseCategory)
  )) || baseCategory;
}

function getTraitThumbnailPath(collectionId, category, value, sourceCategories = []) {
  const collectionThumbnails = TRAIT_THUMBNAILS[collectionId];
  if (!collectionThumbnails) return "";
  const categories = [category, ...sourceCategories]
    .map((sourceCategory) => String(sourceCategory || "").trim())
    .filter(Boolean);
  const valueKeys = getTraitValueLookupKeys(value);
  for (const sourceCategory of [...new Set(categories)]) {
    const categoryKey = normalizeTraitValue(sourceCategory);
    for (const valueKey of valueKeys) {
      const path = collectionThumbnails[`${categoryKey}|${valueKey}`];
      if (path) return path;
    }
  }
  return "";
}

function createTraitThumbnailImage(collectionId, category, value, className, sourceCategories = []) {
  const path = getTraitThumbnailPath(collectionId, category, value, sourceCategories);
  if (!path) return null;

  const image = document.createElement("img");
  image.className = className;
  image.src = new URL(path, import.meta.url).href;
  image.alt = "";
  image.loading = "lazy";
  image.decoding = "async";
  image.setAttribute("aria-hidden", "true");
  return image;
}

function getTraitSearchGroups() {
  const groups = new Map();

  ACTIVE_TRAIT_CATEGORIES.forEach((category, categoryIndex) => {
    if (HIDDEN_TRAIT_CATEGORIES.has(category)) return;

    const displayCategory = getTraitSearchDisplayCategory(category);
    if (!displayCategory) return;

    if (!groups.has(displayCategory)) {
      groups.set(displayCategory, {
        category: displayCategory,
        sourceCategories: [],
        traits: new Map(),
      });
    }

    const group = groups.get(displayCategory);
    if (!group.sourceCategories.includes(category)) group.sourceCategories.push(category);

    ACTIVE_TRAITS.forEach((traitRecord, traitRecordIndex) => {
      const value = getTraitRecordValue(traitRecord, category, categoryIndex);
      if (!isVisibleTraitValue(value)) return;

      const normalized = normalizeTraitValue(value);
      const existing = group.traits.get(normalized);
      if (existing) {
        existing.cardIndexes.add(traitRecordIndex);
        if (!existing.sourceCategories.includes(category)) existing.sourceCategories.push(category);
      } else {
        group.traits.set(normalized, {
          value,
          cardIndexes: new Set([traitRecordIndex]),
          sourceCategories: [category],
        });
      }
    });
  });

  return [...groups.values()]
    .map((group) => {
      const traits = [...group.traits.values()]
        .map((trait) => ({
          value: trait.value,
          count: trait.cardIndexes.size,
          sourceCategories: trait.sourceCategories,
        }))
        .sort((a, b) => (
          a.value.localeCompare(b.value, undefined, { numeric: true, sensitivity: "base" })
        ));

      if (!traits.length) return null;
      return {
        category: group.category,
        sourceCategories: group.sourceCategories,
        total: traits.length,
        traits,
      };
    })
    .filter(Boolean)
    .sort(compareTraitDisplayCategoryOptions);
}

function renderTraitSearch() {
  const renderToken = startTraitSearchRender();
  const groupFragment = document.createDocumentFragment();
  const sidebarFragment = document.createDocumentFragment();
  const query = normalizeTraitSearchQuery(traitSearchQuery);
  const groups = getFilteredTraitSearchGroups(getTraitSearchGroups(), query);
  traitSearchGroupDataByKey.clear();

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
    const gridId = `${sectionId}-tiles`;
    const collapsed = isTraitSearchCategoryCollapsed(group.category);
    const categoryKey = getTraitSearchCollapseKey(group.category);
    section.id = sectionId;
    section.dataset.traitCategoryKey = categoryKey;
    section.classList.toggle("is-collapsed", collapsed);
    traitSearchGroupDataByKey.set(categoryKey, group);

    const heading = document.createElement("h2");
    heading.className = "trait-search-heading";
    const headingCount = query
      ? `${group.traits.length} ${group.traits.length === 1 ? "match" : "matches"}`
      : `${group.total} total`;
    const headingButton = document.createElement("button");
    headingButton.className = "trait-search-heading-button";
    headingButton.type = "button";
    headingButton.textContent = `${group.category} (${headingCount})`;
    headingButton.dataset.traitCategory = group.category;
    headingButton.setAttribute("aria-expanded", String(!collapsed));
    headingButton.setAttribute("aria-controls", gridId);
    heading.append(headingButton);

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
    grid.id = gridId;
    grid.dataset.renderState = "pending";
    grid.hidden = collapsed;

    section.append(heading, grid);
    groupFragment.append(section);
  }

  els.traitSearchGroups.replaceChildren(groupFragment);
  els.traitSearchSidebar.replaceChildren(sidebarFragment);
  scheduleTraitSearchTileRender(groups, renderToken);
}

function startTraitSearchRender() {
  cancelTraitSearchRender();
  return traitSearchRenderToken;
}

function cancelTraitSearchRender() {
  if (traitSearchRenderFrame) {
    cancelAnimationFrame(traitSearchRenderFrame);
    traitSearchRenderFrame = 0;
  }
  traitSearchRenderToken += 1;
}

function scheduleTraitSearchTileRender(groups, renderToken) {
  const queue = groups
    .filter((group) => group.traits.length)
    .map((group) => ({
      group,
      nextIndex: document.getElementById(getTraitSearchGridId(group.category))?.children.length || 0,
    }))
    .filter((item) => item.nextIndex < item.group.traits.length);

  if (!queue.length) {
    traitSearchRenderFrame = 0;
    return;
  }

  const renderBatch = () => {
    if (renderToken !== traitSearchRenderToken) return;

    let remaining = TRAIT_SEARCH_TILE_RENDER_BATCH_SIZE;
    while (queue.length && remaining > 0) {
      const item = queue[0];
      const grid = document.getElementById(getTraitSearchGridId(item.group.category));
      if (!grid) {
        queue.shift();
        continue;
      }
      if (isTraitSearchCategoryCollapsed(item.group.category)) {
        grid.dataset.renderState = "pending";
        queue.shift();
        continue;
      }

      const rendered = appendTraitSearchTiles(grid, item.group, item.nextIndex, remaining);
      remaining -= rendered;
      item.nextIndex += rendered;

      if (item.nextIndex >= item.group.traits.length) {
        grid.dataset.renderState = "complete";
        queue.shift();
      }
    }

    if (queue.length) {
      traitSearchRenderFrame = requestAnimationFrame(renderBatch);
    } else {
      traitSearchRenderFrame = 0;
    }
  };

  traitSearchRenderFrame = requestAnimationFrame(renderBatch);
}

function appendTraitSearchTiles(grid, group, startIndex, limit) {
  const fragment = document.createDocumentFragment();
  const endIndex = Math.min(group.traits.length, startIndex + limit);
  for (let index = startIndex; index < endIndex; index += 1) {
    fragment.append(createTraitSearchTile(group, group.traits[index], index));
  }
  grid.append(fragment);
  return endIndex - startIndex;
}

function createTraitSearchTile(group, trait, traitIndex) {
  const sourceCategories = trait.sourceCategories || group.sourceCategories;
  const tile = document.createElement("button");
  tile.className = "trait-search-tile";
  tile.type = "button";
  tile.title = `Show cards with ${trait.value}`;
  tile.dataset.traitCategoryKey = getTraitSearchCollapseKey(group.category);
  tile.dataset.traitIndex = String(traitIndex);

  const value = document.createElement("div");
  value.className = "trait-search-value";
  value.textContent = trait.value;

  const count = document.createElement("div");
  count.className = "trait-search-count";
  count.textContent = `${trait.count} ${trait.count === 1 ? "card" : "cards"}`;

  const thumbnail = createTraitThumbnailImage(
    ACTIVE_COLLECTION_ID,
    group.category,
    trait.value,
    "trait-search-thumbnail",
    sourceCategories
  );
  if (thumbnail) {
    tile.classList.add("has-trait-thumbnail");
    tile.append(value, count, thumbnail);
  } else {
    tile.append(value, count);
  }
  return tile;
}

function getTraitSearchGridId(category) {
  return `trait-search-${slugifyTraitSearchId(category)}-tiles`;
}

function onTraitSearchGroupsClick(event) {
  const headingButton = event.target.closest(".trait-search-heading-button");
  if (headingButton && els.traitSearchGroups.contains(headingButton)) {
    toggleTraitSearchCategoryCollapse(headingButton.dataset.traitCategory || "");
    return;
  }

  const tile = event.target.closest(".trait-search-tile");
  if (!tile || !els.traitSearchGroups.contains(tile)) return;

  const group = traitSearchGroupDataByKey.get(tile.dataset.traitCategoryKey);
  const trait = group?.traits?.[Number.parseInt(tile.dataset.traitIndex || "", 10)];
  if (!group || !trait) return;

  applyTraitFilter(
    group.category,
    trait.value,
    { sourceCategories: trait.sourceCategories || group.sourceCategories }
  );
}

function isTraitSearchCategoryCollapsed(category) {
  return traitSearchCollapsedCategories.has(getTraitSearchCollapseKey(category));
}

function toggleTraitSearchCategoryCollapse(category) {
  const key = getTraitSearchCollapseKey(category);
  if (traitSearchCollapsedCategories.has(key)) {
    traitSearchCollapsedCategories.delete(key);
  } else {
    traitSearchCollapsedCategories.add(key);
  }

  const collapsed = traitSearchCollapsedCategories.has(key);
  const section = getTraitSearchSectionByKey(key);
  if (!section) return;

  const grid = section.querySelector(".trait-search-tile-grid");
  const headingButton = section.querySelector(".trait-search-heading-button");
  section.classList.toggle("is-collapsed", collapsed);
  if (grid) grid.hidden = collapsed;
  if (headingButton) headingButton.setAttribute("aria-expanded", String(!collapsed));

  const group = traitSearchGroupDataByKey.get(key);
  if (
    !collapsed
    && group
    && grid
    && grid.dataset.renderState !== "complete"
    && !traitSearchRenderFrame
  ) {
    scheduleTraitSearchTileRender([group], startTraitSearchRender());
  }
}

function getTraitSearchCollapseKey(category) {
  return normalizeTraitValue(category);
}

function getTraitSearchSectionByKey(key) {
  for (const section of els.traitSearchGroups.querySelectorAll(".trait-search-group")) {
    if (section.dataset.traitCategoryKey === key) return section;
  }
  return null;
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
    clearGalleryCardTilts();
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
    clearGalleryCardTilts();
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
    clearGalleryCardTilts();
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
  clearGalleryCardTilts();
  els.galleryGrid.style.setProperty("--gallery-card-hover-expand", `${GALLERY_CARD_HOVER_EXPAND_PX}px`);
  els.galleryGrid.replaceChildren();
  const fragment = document.createDocumentFragment();
  const priorityImageCount = getGalleryPriorityImageCount(indexes.length);
  indexes.forEach((index, position) => {
    const card = CARDS[index];
    const button = document.createElement("button");
    button.className = "gallery-card";
    button.type = "button";
    button.title = card.title;
    button.dataset.cardIndex = String(index);

    const image = document.createElement("img");
    const priorityImage = position < priorityImageCount;
    image.loading = priorityImage ? "eager" : "lazy";
    image.decoding = "async";
    if (priorityImage) {
      image.fetchPriority = "high";
      image.setAttribute("fetchpriority", "high");
    }
    image.alt = card.title;
    image.src = cardAssetUrl(card);
    const tiltSurface = document.createElement("span");
    tiltSurface.className = "gallery-card-tilt";
    tiltSurface.append(image);
    button.append(tiltSurface);
    fragment.append(button);
  });
  els.galleryGrid.append(fragment);
  els.binderPageStatus.textContent = withWalletStatusLabel(`${indexes.length} cards`);
}

function onGalleryGridClick(event) {
  if (!galleryOpen || isBinderMode) return;
  const cardButton = getGalleryCardFromEventTarget(event.target);
  if (!cardButton) return;

  const index = Number.parseInt(cardButton.dataset.cardIndex || "", 10);
  if (!Number.isInteger(index) || !CARDS[index]) return;
  setCard(index);
  setGalleryOpen(false);
}

function onGalleryGridTiltPointerMove(event) {
  if (!isGalleryTiltPointer(event)) return;
  const card = getGalleryCardFromEventTarget(event.target);
  if (!card) {
    releaseActiveGalleryCardTilt();
    return;
  }
  updateGalleryCardTiltTarget(card, event);
}

function onGalleryGridTiltPointerOut(event) {
  if (!isGalleryTiltPointer(event)) return;
  const card = getGalleryCardFromEventTarget(event.target);
  if (!card) return;

  const relatedCard = getGalleryCardFromEventTarget(event.relatedTarget);
  if (relatedCard === card) return;
  releaseGalleryCardTilt(card);
}

function isGalleryTiltPointer(event) {
  if (!galleryOpen || isBinderMode || !event || event.pointerType === "touch") return false;
  return !window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
}

function getGalleryCardFromEventTarget(target) {
  if (!(target instanceof Element)) return null;
  const card = target.closest(".gallery-card");
  return card && els.galleryGrid.contains(card) ? card : null;
}

function updateGalleryCardTiltTarget(card, event) {
  if (activeGalleryTiltCard && activeGalleryTiltCard !== card) {
    releaseGalleryCardTilt(activeGalleryTiltCard);
  }
  activeGalleryTiltCard = card;

  const state = getGalleryCardTiltState(card);
  const rect = card.getBoundingClientRect();
  const localX = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
  const localY = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);

  state.hovering = true;
  state.targetX = (0.5 - localY) * GALLERY_CARD_TILT_MAX_X_DEG;
  state.targetY = (localX - 0.5) * GALLERY_CARD_TILT_MAX_Y_DEG;
  card.classList.add("is-gallery-tilting");
  startGalleryCardTiltAnimation();
}

function getGalleryCardTiltState(card) {
  let state = galleryTiltStates.get(card);
  if (!state) {
    state = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      targetX: 0,
      targetY: 0,
      hovering: false,
    };
    galleryTiltStates.set(card, state);
  }
  return state;
}

function releaseActiveGalleryCardTilt() {
  releaseGalleryCardTilt(activeGalleryTiltCard);
}

function releaseGalleryCardTilt(card) {
  if (!card) return;
  const state = galleryTiltStates.get(card);
  if (!state) return;

  state.hovering = false;
  state.targetX = 0;
  state.targetY = 0;
  if (activeGalleryTiltCard === card) activeGalleryTiltCard = null;
  startGalleryCardTiltAnimation();
}

function startGalleryCardTiltAnimation() {
  if (galleryTiltFrame || !galleryTiltStates.size) return;
  galleryTiltFrame = requestAnimationFrame(animateGalleryCardTilts);
}

function animateGalleryCardTilts() {
  galleryTiltFrame = 0;
  let keepAnimating = false;

  for (const [card, state] of galleryTiltStates) {
    if (!card.isConnected) {
      galleryTiltStates.delete(card);
      if (activeGalleryTiltCard === card) activeGalleryTiltCard = null;
      continue;
    }

    state.vx = (state.vx + (state.targetX - state.x) * GALLERY_CARD_TILT_SPRING) * GALLERY_CARD_TILT_DAMPING;
    state.vy = (state.vy + (state.targetY - state.y) * GALLERY_CARD_TILT_SPRING) * GALLERY_CARD_TILT_DAMPING;
    state.x += state.vx;
    state.y += state.vy;

    const settled = isGalleryCardTiltSettled(state);
    if (!state.hovering && settled) {
      resetGalleryCardTilt(card);
      galleryTiltStates.delete(card);
      continue;
    }

    applyGalleryCardTilt(card, state);
    keepAnimating = true;
  }

  if (keepAnimating) galleryTiltFrame = requestAnimationFrame(animateGalleryCardTilts);
}

function isGalleryCardTiltSettled(state) {
  return Math.abs(state.x) < GALLERY_CARD_TILT_SETTLE_EPSILON
    && Math.abs(state.y) < GALLERY_CARD_TILT_SETTLE_EPSILON
    && Math.abs(state.vx) < GALLERY_CARD_TILT_SETTLE_EPSILON
    && Math.abs(state.vy) < GALLERY_CARD_TILT_SETTLE_EPSILON;
}

function applyGalleryCardTilt(card, state) {
  card.style.setProperty("--gallery-card-tilt-x", `${state.x.toFixed(3)}deg`);
  card.style.setProperty("--gallery-card-tilt-y", `${state.y.toFixed(3)}deg`);
}

function resetGalleryCardTilt(card) {
  card.classList.remove("is-gallery-tilting");
  card.style.removeProperty("--gallery-card-tilt-x");
  card.style.removeProperty("--gallery-card-tilt-y");
}

function clearGalleryCardTilts() {
  if (galleryTiltFrame) {
    cancelAnimationFrame(galleryTiltFrame);
    galleryTiltFrame = 0;
  }
  for (const card of galleryTiltStates.keys()) {
    if (card.isConnected) resetGalleryCardTilt(card);
  }
  galleryTiltStates.clear();
  activeGalleryTiltCard = null;
}

function getGalleryPriorityImageCount(totalCards) {
  if (!totalCards) return 0;

  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const columns = width <= 520
    ? 2
    : (width <= 720 ? 3 : 5);
  return Math.min(totalCards, columns * GALLERY_PRIORITY_ROWS);
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
  if (binderIntroFocused && hasActiveBinderIntroSuppressor()) {
    clearBinderFocus({ silent: true });
  }
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
  } else if (isBinderIntroFocused()) {
    binderTargetTurn = 0;
  }
  binderTargetTurn = clamp(binderTargetTurn, 0, binderPageCount);
  binderTurn = clamp(binderTurn, 0, binderPageCount);
  els.binderLoading.hidden = true;
  loadBinderBackTexture(token);
  updateBinderPageControls();
  resizeBinderRenderer();
  renderBinderSceneOnce({ includePreload: false, immediateCamera: true });
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
  binderIntroFocusMeshes = [];
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
  const { texture, linkBounds, focusBounds } = createBinderIntroNoteTexture();
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
  noteMesh.userData.binderIntroFocusBounds = focusBounds;
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
  return BINDER_INTRO_SPRITES.flatMap((sprite) => {
    const size = coverHeight * sprite.sizeRatio;
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      toneMapped: false,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
    });
    textureLoader.load(
      sprite.url,
      (texture) => {
        configureDisplayTexture(texture);
        material.map = texture;
        material.opacity = 0.92;
        material.needsUpdate = true;
        requestBinderRenderOnce();
      },
    );

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    mesh.position.set(coverWidth * sprite.xRatio, coverHeight * sprite.yRatio, 0.006);
    mesh.renderOrder = 68;
    if (!sprite.focusTarget) return [mesh];

    const focusHitbox = new THREE.Mesh(
      new THREE.PlaneGeometry(
        coverWidth * (sprite.focusHitboxWidthRatio || sprite.sizeRatio),
        coverHeight * (sprite.focusHitboxHeightRatio || sprite.sizeRatio),
      ),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        toneMapped: false,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false,
      }),
    );
    focusHitbox.position.set(
      coverWidth * sprite.xRatio,
      coverHeight * (sprite.focusHitboxYRatio ?? sprite.yRatio),
      0.008,
    );
    focusHitbox.renderOrder = 69;
    focusHitbox.userData.binderIntroFocusHitbox = true;
    binderIntroFocusMeshes.push(focusHitbox);
    return [mesh, focusHitbox];
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
        const card = createBinderBackCard(placeholderTexture, frontCardIndex);
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
  const hasCard = Number.isInteger(cardIndex);
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.62,
    roughnessMap: createPaperRoughnessTexture(),
    metalness: 0.01,
    clearcoat: 0.2,
    clearcoatRoughness: 0.52,
    transparent: true,
    opacity: hasCard ? 0 : 1,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const card = new THREE.Mesh(getBinderCardGeometry(), material);

  card.position.z = side * BINDER_CARD_LIFT;
  if (side < 0) card.rotation.y = Math.PI;
  card.renderOrder = 12;
  if (hasCard) {
    card.userData.cardIndex = cardIndex;
    card.userData.binderPosition = binderPosition;
    card.userData.binderCard = true;
    card.userData.textureLoaded = false;
    binderCardMeshes.push(card);
    binderCardMeshByPosition.set(binderPosition, card);
  }
  return card;
}

function createBinderBackCard(texture, sourceCardIndex = null) {
  const card = createBinderCard(texture, null, -1);
  card.userData.binderBackCard = true;
  card.userData.binderBackCardIndex = sourceCardIndex;
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
  const backCards = [];
  binderRoot.traverse((child) => {
    if (child.isMesh && child.userData.binderBackCard) {
      backCards.push(child);
    }
  });

  for (const child of backCards) {
    const card = Number.isInteger(child.userData.binderBackCardIndex)
      ? CARDS[child.userData.binderBackCardIndex]
      : null;
    getBackTexture(card).then((texture) => {
      if (token !== binderBuildToken || !child.parent) return;
      if (isBinderTurnMoving()) {
        requestBinderMaintenance(120);
        return;
      }
      child.material.map = texture;
      child.material.needsUpdate = true;
      requestBinderRenderOnce();
    }).catch(console.error);
  }
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
  binderIntroFocusMeshes = [];
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

  if (isBinderFocusView()) {
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
  if (!galleryOpen || !isBinderMode || isBinderFocusView() || binderPageCount < 1) return;

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
  if (!galleryOpen || !isBinderMode || isBinderFocusView()) return;

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

  if (isBinderIntroFocused()) return binderVisibleIndexes.length > 0 ? "focus-card" : null;
  if (isBinderFocused()) return binderVisibleIndexes.length > 0 ? "focus-card" : null;
  return "page";
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
    ? String(isBinderIntroFocused() ? 0 : binderFocusPosition + 1)
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
    const targetPosition = parseFocusedBinderNumberJumpValue(input.value, binderVisibleIndexes.length);
    if (!Number.isInteger(targetPosition)) {
      input.focus();
      input.select();
      return;
    }

    closeBinderPageStatusEdit({ update: false });
    if (targetPosition === BINDER_SINGLE_PAGE_COVER_SIDE) {
      focusBinderIntroNote({ immediate: true });
    } else if (isBinderIntroFocused()) {
      focusBinderPosition(targetPosition, { immediate: true });
    } else {
      jumpFocusedBinderCard(targetPosition).catch(console.error);
    }
    return;
  }

  const rawValue = input.value.trim();
  if (!/^\d+$/.test(rawValue)) {
    input.focus();
    input.select();
    return;
  }

  const totalSides = getBinderTotalPageSides();
  const pageNumber = clamp(Number.parseInt(rawValue, 10), 0, totalSides);
  const targetSide = pageNumber === 0 ? BINDER_SINGLE_PAGE_COVER_SIDE : pageNumber - 1;
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
  if (isBinderSinglePageView()) {
    const singlePageSide = getBinderSinglePageSide();
    return singlePageSide === BINDER_SINGLE_PAGE_COVER_SIDE ? 0 : singlePageSide + 1;
  }

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

  const introFocused = isBinderIntroFocused();
  const focused = isBinderFocused() || introFocused;
  if (binderPageStatusInput && !canEditBinderPageStatus()) closeBinderPageStatusEdit({ update: false });
  els.binderPageStatus.classList.toggle("is-page-jump-enabled", !binderPageStatusInput && canEditBinderPageStatus());
  els.binderPageControls.classList.toggle("is-focused", focused);
  els.binderPageControls.classList.toggle("is-intro-focused", introFocused);
  els.binderZoomOutButton.hidden = !focused;
  els.binderOpenCardButton.hidden = !focused;
  els.binderFavoriteButton.hidden = !focused;
  els.binderOpenCardButton.disabled = introFocused;
  els.binderFavoriteButton.disabled = introFocused;
  els.binderOpenCardButton.setAttribute("aria-disabled", String(introFocused));
  els.binderFavoriteButton.setAttribute("aria-disabled", String(introFocused));
  els.binderOpenCardButton.setAttribute("title", introFocused ? "No card to open" : "Open card view");
  els.binderOpenCardButton.setAttribute("aria-label", introFocused ? "No card to open" : "Open card view");
  els.binderShuffleButton.hidden = focused;
  updateBinderFavoriteButton();
  updateBinderPageStatus(focused);

  if (focused) {
    const hasCards = binderVisibleIndexes.length > 0;
    els.binderPreviousPageButton.disabled = !hasCards;
    els.binderNextPageButton.disabled = !hasCards;
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

function updateBinderPageStatus(focused = isBinderFocusView()) {
  if (binderPageStatusInput) return;

  if (focused) {
    const number = isBinderIntroFocused() ? 0 : binderFocusPosition + 1;
    els.binderPageStatus.textContent = withWalletStatusLabel(`${number} / ${binderVisibleIndexes.length}`);
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

function isBinderIntroFocused() {
  return binderIntroFocused;
}

function isBinderFocusView() {
  return isBinderFocused() || isBinderIntroFocused();
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
    && !isBinderFocusView()
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
  binderIntroFocused = false;
  binderFocusPosition = position;
  binderSinglePageSide = getBinderSinglePageSideForPosition(position);
  binderSinglePageSideTouched = true;
  binderTargetTurn = nextTurn;
  binderTextureQueueKey = "";
  if (immediate) binderTurn = binderTargetTurn;
  ensureBinderPageWindow({
    force: true,
    center: Math.floor(position / BINDER_PAGE_SLOTS),
    queueTextures: false,
  });
  els.body.classList.add("binder-focused");
  els.binderPanel.classList.add("is-focused");
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

function focusBinderIntroNote({ immediate = false } = {}) {
  if (hasActiveBinderIntroSuppressor()) return false;

  markBinderInteractionActive();
  binderIntroFocused = true;
  binderFocusPosition = -1;
  binderLastOpenTap = null;
  binderSinglePageSide = BINDER_SINGLE_PAGE_COVER_SIDE;
  binderSinglePageSideTouched = true;
  if (binderTargetTurn !== 0) binderBendDirection = Math.sign(-binderTargetTurn) || binderBendDirection;
  binderTargetTurn = 0;
  binderTextureQueueKey = "";
  if (immediate) binderTurn = 0;
  ensureBinderPageWindow({ force: true, center: 0, queueTextures: false });
  els.body.classList.add("binder-focused");
  els.binderPanel.classList.add("is-focused");
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
  return true;
}

function clearBinderFocus(options = {}) {
  markBinderInteractionActive();
  const introFocused = isBinderIntroFocused();
  const focusedSide = isBinderFocused() ? getBinderSinglePageSideForPosition(binderFocusPosition) : null;
  binderIntroFocused = false;
  binderFocusPosition = -1;
  binderLastOpenTap = null;
  els.body.classList.remove("binder-focused");
  els.binderPanel.classList.remove("is-focused");
  if (introFocused) {
    binderSinglePageSide = BINDER_SINGLE_PAGE_COVER_SIDE;
    binderSinglePageSideTouched = true;
    binderTargetTurn = 0;
  } else if (Number.isInteger(focusedSide)) {
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
  if (!binderVisibleIndexes.length) {
    focusBinderIntroNote();
    return;
  }

  if (isBinderIntroFocused()) {
    focusBinderPosition(direction < 0 ? binderVisibleIndexes.length - 1 : 0);
    return;
  }

  if (!isBinderFocused()) return;

  if (direction < 0 && binderFocusPosition <= 0) {
    focusBinderIntroNote({ immediate: true });
    return;
  }

  if (direction > 0 && binderFocusPosition >= binderVisibleIndexes.length - 1) {
    focusBinderIntroNote({ immediate: true });
    return;
  }

  const nextPosition = clamp(
    binderFocusPosition + direction,
    0,
    Math.max(0, binderVisibleIndexes.length - 1),
  );
  if (nextPosition === binderFocusPosition) return;
  focusBinderPosition(nextPosition);
}

function getBinderFocusedGridPosition(position = binderFocusPosition) {
  if (!Number.isInteger(position) || position < 0 || position >= binderVisibleIndexes.length) return null;

  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  const isBackSide = sideSlot >= BINDER_SIDE_SLOTS;
  const localSlot = sideSlot - (isBackSide ? BINDER_SIDE_SLOTS : 0);
  const row = Math.floor(localSlot / BINDER_COLUMNS);
  const rawColumn = localSlot % BINDER_COLUMNS;
  return {
    pageIndex,
    isBackSide,
    row,
    column: isBackSide ? BINDER_COLUMNS - 1 - rawColumn : rawColumn,
    spreadColumn: isBackSide
      ? BINDER_COLUMNS - 1 - rawColumn
      : BINDER_COLUMNS + rawColumn,
    turn: getBinderTurnForPosition(position),
  };
}

function getBinderPositionForGridSpot(gridSpot) {
  if (!gridSpot) return -1;
  const { pageIndex, isBackSide, row, column } = gridSpot;
  if (
    !Number.isInteger(pageIndex)
    || !Number.isInteger(row)
    || !Number.isInteger(column)
    || pageIndex < 0
    || pageIndex >= binderPageCount
    || row < 0
    || row >= BINDER_ROWS
    || column < 0
    || column >= BINDER_COLUMNS
  ) {
    return -1;
  }

  const localColumn = isBackSide ? BINDER_COLUMNS - 1 - column : column;
  const sideOffset = isBackSide ? BINDER_SIDE_SLOTS : 0;
  const position = pageIndex * BINDER_PAGE_SLOTS
    + sideOffset
    + row * BINDER_COLUMNS
    + localColumn;
  return position < binderVisibleIndexes.length ? position : -1;
}

function getBinderPositionForSpreadSpot(spreadSpot) {
  if (!spreadSpot) return -1;
  const { turn, row, spreadColumn } = spreadSpot;
  if (
    !Number.isInteger(turn)
    || !Number.isInteger(row)
    || !Number.isInteger(spreadColumn)
    || turn < 0
    || turn > binderPageCount
    || row < 0
    || row >= BINDER_ROWS
    || spreadColumn < 0
    || spreadColumn >= BINDER_COLUMNS * 2
  ) {
    return -1;
  }

  const isBackSide = spreadColumn < BINDER_COLUMNS;
  const pageIndex = isBackSide ? turn - 1 : turn;
  const column = isBackSide ? spreadColumn : spreadColumn - BINDER_COLUMNS;
  return getBinderPositionForGridSpot({
    pageIndex,
    isBackSide,
    row,
    column,
  });
}

function moveBinderFocusSpatially(rowDirection, columnDirection) {
  if (!isBinderFocused()) return false;
  const currentSpot = getBinderFocusedGridPosition();
  if (!currentSpot) return false;
  const nextPosition = getBinderPositionForSpreadSpot({
    turn: currentSpot.turn,
    row: currentSpot.row + rowDirection,
    spreadColumn: currentSpot.spreadColumn + columnDirection,
  });
  if (nextPosition < 0 || nextPosition === binderFocusPosition) return false;
  focusBinderPosition(nextPosition);
  return true;
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
  binderIntroFocused = false;
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
    binderIntroFocused = false;
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
  setCardEffectViewTargetOpacity(0);
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
    renderBinderSceneOnce({ immediateCamera: true });
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
  renderBinderSceneOnce({ immediateCamera: true });
  return true;
}

async function transitionFocusedBinderCardToIndividual(cardIndex, focusedMesh) {
  binderCardViewTransitionActive = true;
  if (!focusedMesh.userData.textureLoaded) {
    const card = CARDS[cardIndex];
    await getBinderTexture(card).then((texture) => {
      prepareTextureForImmediateDisplay(texture);
      focusedMesh.material.map = texture;
      focusedMesh.material.opacity = getBinderPageOpacityForPosition(focusedMesh.userData.binderPosition);
      focusedMesh.material.needsUpdate = true;
      focusedMesh.userData.textureLoaded = true;
      focusedMesh.userData.textureLoading = false;
      renderBinderSceneOnce({ immediateCamera: true });
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
    setCardEffectViewTargetOpacity(0, { immediate: true });
    const card = CARDS[cardIndex];
    const effectProfile = getCardEffectProfile(card);
    const effectTexturesPromise = loadCardEffectTexturesForProfile(effectProfile).catch(() => null);
    setCard(cardIndex);
    currentRotationX = 0;
    currentRotationY = 0;
    targetRotationX = 0;
    targetRotationY = 0;
    cardShuffleSpinY = 0;
    cardGroup.rotation.x = 0;
    cardGroup.rotation.y = 0;
    await Promise.all([
      getCardTexture(card),
      effectTexturesPromise,
    ]).then(([texture, effectTextures]) => {
      prepareTextureForImmediateDisplay(texture);
      applyLoadedIndividualCardEffect(card, effectTextures);
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
    setCardEffectViewTargetOpacity(1);
    els.body.classList.add("binder-card-transition-show-card");
    await delay(BINDER_CARD_VIEW_TRANSITION_MS * 0.54);

    rememberCurrentBinderViewFocus();
    binderIntroFocused = false;
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
  const radius = getTransitionCardRadius(rect);
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
  element.style.borderRadius = `${radius}px`;
}

function getTransitionCardRadius(rect) {
  if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height)) return 8;
  return Math.max(
    0,
    Math.min(
      rect.width * (CARD_RADIUS / CARD_WIDTH),
      rect.height * (CARD_RADIUS / CARD_HEIGHT),
    ),
  );
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCardEffectPlaneUvFromCurrentRay() {
  if (!cardGroup || !cardRaycaster?.ray) return null;

  const inverseMatrix = new THREE.Matrix4().copy(cardGroup.matrixWorld).invert();
  const localOrigin = cardRaycaster.ray.origin.clone().applyMatrix4(inverseMatrix);
  const localDirection = cardRaycaster.ray.direction.clone().transformDirection(inverseMatrix);
  if (Math.abs(localDirection.z) < 0.00001) return null;

  const surfaces = [
    { z: CARD_DEPTH / 2 + 0.003, back: false },
    { z: -CARD_DEPTH / 2 - 0.003, back: true },
  ];
  let closest = null;
  for (const surface of surfaces) {
    const distance = (surface.z - localOrigin.z) / localDirection.z;
    if (distance < 0 || (closest && distance >= closest.distance)) continue;
    const localX = localOrigin.x + localDirection.x * distance;
    const localY = localOrigin.y + localDirection.y * distance;
    const frontUvX = (localX + CARD_WIDTH / 2) / CARD_WIDTH;
    closest = {
      distance,
      x: surface.back ? 1 - frontUvX : frontUvX,
      y: (localY + CARD_HEIGHT / 2) / CARD_HEIGHT,
    };
  }

  return closest;
}

function getCardEffectOutsideDistance(x, y) {
  return Math.max(0, -x, x - 1, -y, y - 1);
}

function getCardEffectEdgeActivity(x, y) {
  const fade = clamp(1 - getCardEffectOutsideDistance(x, y) / CARD_NFT_2_EFFECT_EDGE_FADE_DISTANCE, 0, 1);
  return fade * fade * (3 - fade * 2);
}

function setCardEffectPointerTarget(x, y, active, snapWhenInactive = false) {
  const nextX = clamp(x, -CARD_NFT_2_EFFECT_POINTER_EXTENT, 1 + CARD_NFT_2_EFFECT_POINTER_EXTENT);
  const nextY = clamp(y, -CARD_NFT_2_EFFECT_POINTER_EXTENT, 1 + CARD_NFT_2_EFFECT_POINTER_EXTENT);
  if (snapWhenInactive && cardEffectPointerTargetActive < 0.5) {
    cardEffectPointerX = nextX;
    cardEffectPointerY = nextY;
  }
  cardEffectPointerTargetX = nextX;
  cardEffectPointerTargetY = nextY;
  cardEffectPointerTargetActive = clamp(active, 0, 1);
}

function updateCardEffectPointerFromEvent(event) {
  if (!cardCamera || !els.cardCanvas || !cardFrontMesh || !cardBackMesh) return;

  const rect = els.cardCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  cardGroup?.updateMatrixWorld(true);
  cardCamera.updateMatrixWorld(true);
  cardPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  cardPointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  cardRaycaster.setFromCamera(cardPointer, cardCamera);
  const hit = cardRaycaster.intersectObjects([cardFrontMesh, cardBackMesh], false)[0];

  if (!hit?.uv) {
    const planeUv = getCardEffectPlaneUvFromCurrentRay();
    if (planeUv) {
      const edgeActivity = getCardEffectEdgeActivity(planeUv.x, planeUv.y);
      setCardEffectPointerTarget(planeUv.x, planeUv.y, edgeActivity, false);
    } else if (!dragState) {
      clearCardEffectPointer(event);
    }
    return;
  }

  const nextX = clamp(hit.uv.x, 0, 1);
  const nextY = clamp(hit.uv.y, 0, 1);
  setCardEffectPointerTarget(nextX, nextY, 1, true);
}

function clearCardEffectPointer(event) {
  if (event?.clientX != null && cardCamera && els.cardCanvas && cardGroup) {
    const rect = els.cardCanvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      cardGroup.updateMatrixWorld(true);
      cardCamera.updateMatrixWorld(true);
      cardPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      cardPointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
      cardRaycaster.setFromCamera(cardPointer, cardCamera);
      const planeUv = getCardEffectPlaneUvFromCurrentRay();
      if (planeUv) {
        setCardEffectPointerTarget(planeUv.x, planeUv.y, 0, false);
        return;
      }
    }
  }

  const directionX = cardEffectPointerX - 0.5;
  const directionY = cardEffectPointerY - 0.5;
  const length = Math.hypot(directionX, directionY);
  if (length > 0.001) {
    setCardEffectPointerTarget(
      cardEffectPointerX + (directionX / length) * CARD_NFT_2_EFFECT_POINTER_EXTENT,
      cardEffectPointerY + (directionY / length) * CARD_NFT_2_EFFECT_POINTER_EXTENT,
      0,
      false,
    );
    return;
  }

  setCardEffectPointerTarget(
    CARD_NFT_2_EFFECT_OFFCARD_POINTER_X,
    CARD_NFT_2_EFFECT_OFFCARD_POINTER_Y,
    0,
    false,
  );
}

function updateCardEffectPointer() {
  const activeAlpha = cardEffectPointerTargetActive > cardEffectPointerActive ? 0.2 : 0.1;
  const positionAlpha = cardEffectPointerTargetActive > cardEffectPointerActive ? 0.24 : 0.18;
  cardEffectPointerX += (cardEffectPointerTargetX - cardEffectPointerX) * positionAlpha;
  cardEffectPointerY += (cardEffectPointerTargetY - cardEffectPointerY) * positionAlpha;
  cardEffectPointerActive += (cardEffectPointerTargetActive - cardEffectPointerActive) * activeAlpha;
  if (cardEffectPointerActive < 0.002 && cardEffectPointerTargetActive === 0) cardEffectPointerActive = 0;
}

function onCardPointerDown(event) {
  if (cardSwapAnimating || cardShuffleSpinAnimating) return;
  updateCardEffectPointerFromEvent(event);
  els.cardCanvas.setPointerCapture(event.pointerId);

  if (isTouchLikePointer(event)) {
    trackTouchPointer(cardTouchPointers, event);
    if (cardTouchPointers.size >= 2) {
      dragState = null;
      beginCardPinchGesture();
      event.preventDefault();
      return;
    }
  }

  if (cardPinchGesture) {
    event.preventDefault();
    return;
  }

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
  updateCardEffectPointerFromEvent(event);

  if (isTouchLikePointer(event)) {
    updateTouchPointer(cardTouchPointers, event);
    if (cardPinchGesture || cardTouchPointers.size >= 2) {
      dragState = null;
      updateCardPinchGesture();
      event.preventDefault();
      return;
    }
  }

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
  if (isTouchLikePointer(event)) clearCardEffectPointer();

  if (isTouchLikePointer(event)) {
    removeTouchPointer(cardTouchPointers, event);
    if (cardPinchGesture) {
      if (cardTouchPointers.size >= 2) {
        beginCardPinchGesture();
      } else {
        cardPinchGesture = null;
      }
      event.preventDefault();
      return;
    }
  }

  if (!dragState || event.pointerId !== dragState.pointerId) return;
  dragState = null;
  if (!isTouchLikePointer(event)) updateCardEffectPointerFromEvent(event);
  if (!isCardPanMode()) {
    targetRotationX = 0;
    targetRotationY = 0;
  }
}

function onCardWheel(event) {
  event.preventDefault();
  event.stopImmediatePropagation();

  const normalizedDelta = normalizeWheelDelta(event.deltaY || 0, event);
  handleIndividualZoomInput(normalizedDelta);
}

function handleIndividualZoomInput(normalizedDelta) {
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

function isTouchLikePointer(event) {
  return event.pointerType && event.pointerType !== "mouse";
}

function trackTouchPointer(pointerMap, event) {
  pointerMap.set(event.pointerId, {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  });
}

function updateTouchPointer(pointerMap, event) {
  if (!pointerMap.has(event.pointerId)) return;
  pointerMap.set(event.pointerId, {
    id: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  });
}

function removeTouchPointer(pointerMap, event) {
  pointerMap.delete(event.pointerId);
}

function getTouchPointerPair(pointerMap) {
  const pointers = Array.from(pointerMap.values());
  return pointers.length >= 2 ? [pointers[0], pointers[1]] : null;
}

function getTouchPairDistance(pair) {
  if (!pair) return 0;
  return Math.hypot(pair[0].x - pair[1].x, pair[0].y - pair[1].y);
}

function getTouchPairCenter(pair) {
  return {
    clientX: (pair[0].x + pair[1].x) / 2,
    clientY: (pair[0].y + pair[1].y) / 2,
  };
}

function getPinchWheelDelta(lastDistance, nextDistance) {
  if (lastDistance < PINCH_MIN_DISTANCE_PX || nextDistance < PINCH_MIN_DISTANCE_PX) return 0;
  const ratio = nextDistance / lastDistance;
  if (!Number.isFinite(ratio) || ratio <= 0 || Math.abs(ratio - 1) < PINCH_DELTA_EPSILON) return 0;
  return clamp(-Math.log(ratio) * PINCH_WHEEL_DELTA_SCALE, -900, 900);
}

function beginCardPinchGesture() {
  const pair = getTouchPointerPair(cardTouchPointers);
  const distance = getTouchPairDistance(pair);
  cardPinchGesture = distance >= PINCH_MIN_DISTANCE_PX
    ? { lastDistance: distance }
    : null;
}

function updateCardPinchGesture() {
  const pair = getTouchPointerPair(cardTouchPointers);
  const distance = getTouchPairDistance(pair);
  if (!pair || distance < PINCH_MIN_DISTANCE_PX) return;
  if (!cardPinchGesture) {
    cardPinchGesture = { lastDistance: distance };
    return;
  }

  const delta = getPinchWheelDelta(cardPinchGesture.lastDistance, distance);
  cardPinchGesture.lastDistance = distance;
  if (Math.abs(delta) < 0.5) return;
  handleIndividualZoomInput(delta);
}

function cancelBinderDragForPinch() {
  if (!binderDrag) return;

  binderDrag = null;
  binderLastOpenTap = null;
  if (!isBinderFocusView()) {
    binderTargetTurn = Math.round(binderTargetTurn);
    if (isBinderSinglePageView()) binderSinglePageSide = deriveBinderSinglePageSideFromTurn(binderTargetTurn);
    updateBinderPageControls();
    startBinderRenderLoop();
  }
}

function beginBinderPinchGesture() {
  const pair = getTouchPointerPair(binderTouchPointers);
  const distance = getTouchPairDistance(pair);
  binderPinchGesture = distance >= PINCH_MIN_DISTANCE_PX
    ? { lastDistance: distance }
    : null;
}

function updateBinderPinchGesture() {
  const pair = getTouchPointerPair(binderTouchPointers);
  const distance = getTouchPairDistance(pair);
  if (!pair || distance < PINCH_MIN_DISTANCE_PX) return;
  if (!binderPinchGesture) {
    binderPinchGesture = { lastDistance: distance };
    return;
  }

  const delta = getPinchWheelDelta(binderPinchGesture.lastDistance, distance);
  binderPinchGesture.lastDistance = distance;
  if (Math.abs(delta) < 0.5) return;
  handleBinderZoomInput(delta, getTouchPairCenter(pair));
}

function resetTouchGestures() {
  cardTouchPointers.clear();
  binderTouchPointers.clear();
  cardPinchGesture = null;
  binderPinchGesture = null;
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

  if (isTouchLikePointer(event)) {
    trackTouchPointer(binderTouchPointers, event);
    if (binderTouchPointers.size >= 2) {
      cancelBinderDragForPinch();
      beginBinderPinchGesture();
      event.preventDefault();
      return;
    }
  }

  if (binderPinchGesture) {
    event.preventDefault();
    return;
  }

  binderDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    startTurn: binderTargetTurn,
    startSinglePageSide: isBinderSinglePageView() ? getBinderSinglePageSide() : null,
    moved: false,
  };
  binderWheelFocusLockUntil = 0;
  event.preventDefault();
}

function onBinderPointerMove(event) {
  if (isTouchLikePointer(event)) {
    updateTouchPointer(binderTouchPointers, event);
    if (binderPinchGesture || binderTouchPointers.size >= 2) {
      cancelBinderDragForPinch();
      updateBinderPinchGesture();
      event.preventDefault();
      return;
    }
  }

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

  if (!isBinderFocusView() && !(isBinderSinglePageView() && isTouchLikePointer(event))) {
    const pageDelta = -(deltaX / Math.max(rect.width, 1)) / 0.26;
    binderTargetTurn = clamp(binderDrag.startTurn + pageDelta, 0, binderPageCount);
    if (Math.abs(pageDelta) > 0.002) {
      binderSinglePageSideTouched = true;
      binderBendDirection = Math.sign(pageDelta);
    }
    binderTurn = binderTargetTurn;
    updateBinderPageTransforms();
    updateBinderPageControls();
    renderBinderSceneOnce({ immediateCamera: true });
  }
  event.preventDefault();
}

function onBinderPointerUp(event) {
  if (isTouchLikePointer(event)) {
    removeTouchPointer(binderTouchPointers, event);
    if (binderPinchGesture) {
      if (binderTouchPointers.size >= 2) {
        beginBinderPinchGesture();
      } else {
        binderPinchGesture = null;
      }
      event.preventDefault();
      return;
    }
  }

  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;

  markBinderInteractionActive();
  const finishedDrag = binderDrag;
  const wasClick = !finishedDrag.moved;
  binderDrag = null;
  if (els.binderCanvas.hasPointerCapture(event.pointerId)) {
    els.binderCanvas.releasePointerCapture(event.pointerId);
  }

  if (wasClick) {
    if (handleBinderIntroLinkTap(event)) return;
    if (handleBinderIntroNoteTap(event)) return;
    if (handleFocusedBinderCardTap(event)) return;
    if (selectBinderCard(event)) return;
    handleFocusedBinderBackgroundTap(event);
  } else if (isBinderFocused()) {
    handleFocusedBinderSwipe(finishedDrag, event);
  } else if (!isBinderFocusView()) {
    if (handleBinderSinglePageSwipe(finishedDrag, event)) return;
    binderTargetTurn = Math.round(binderTargetTurn);
    if (isBinderSinglePageView()) binderSinglePageSide = deriveBinderSinglePageSideFromTurn(binderTargetTurn);
    updateBinderPageControls();
    startBinderRenderLoop();
  }
}

function onBinderPointerCancel(event) {
  if (isTouchLikePointer(event)) {
    removeTouchPointer(binderTouchPointers, event);
    if (binderPinchGesture && binderTouchPointers.size < 2) binderPinchGesture = null;
  }
  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;
  markBinderInteractionActive();
  binderDrag = null;
  if (!isBinderFocusView()) binderTargetTurn = Math.round(binderTargetTurn);
  if (!isBinderFocusView() && isBinderSinglePageView()) binderSinglePageSide = deriveBinderSinglePageSideFromTurn(binderTargetTurn);
  updateBinderPageControls();
  startBinderRenderLoop();
}

function handleBinderWheel(event) {
  if (!galleryOpen || !isBinderMode || binderPageCount < 1) return;

  event.preventDefault();
  markBinderInteractionActive();
  const wheelDelta = getDominantNormalizedWheelDelta(event);
  handleBinderZoomInput(wheelDelta, event);
}

function handleBinderZoomInput(wheelDelta, event) {
  if (!galleryOpen || !isBinderMode || binderPageCount < 1) return;

  markBinderInteractionActive();
  if (Math.abs(wheelDelta) < 0.5) return;

  const now = performance.now();
  if (now < binderWheelFocusLockUntil) return;

  if (isBinderFocusView()) {
    if (isBinderIntroFocused()) {
      resetBinderFocusWheelInDistance();
      if (wheelDelta < 0 || binderCardViewTransitionActive || now < binderFocusZoomOutLockUntil) return;
      binderWheelFocusLockUntil = now + 700;
      clearBinderFocus();
      return;
    }

    if (wheelDelta < 0) {
      if (focusBinderWheelHitCard(event, now)) return;

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

  if (getBinderIntroNoteHit(event)) {
    binderWheelFocusLockUntil = now + 700;
    focusBinderIntroNote();
    return;
  }

  const hit = getBinderCardHit(event);
  if (!hit) return;

  binderWheelFocusLockUntil = now + 700;
  focusBinderPosition(hit.object.userData.binderPosition);
}

function focusBinderWheelHitCard(event, now = performance.now()) {
  if (!isBinderFocused()) return false;

  const hit = getBinderCardHit(event);
  const position = hit?.object?.userData?.binderPosition;
  if (!Number.isInteger(position) || position === binderFocusPosition) return false;

  resetBinderFocusWheelInDistance();
  binderWheelFocusLockUntil = now + 700;
  binderLastOpenTap = null;
  focusBinderPosition(position);
  return true;
}

function handleFocusedBinderSwipe(drag, event) {
  if (!drag || !isBinderFocused()) return false;
  if (!isTouchLikePointer(event)) return false;

  const deltaX = event.clientX - drag.startX;
  const deltaY = event.clientY - drag.startY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < BINDER_FOCUS_SWIPE_MIN_DISTANCE) return false;

  const horizontal = Math.abs(deltaX) >= Math.abs(deltaY);
  const primary = horizontal ? deltaX : deltaY;
  const offAxis = horizontal ? Math.abs(deltaY) : Math.abs(deltaX);
  if (offAxis / Math.max(1, Math.abs(primary)) > BINDER_FOCUS_SWIPE_MAX_OFF_AXIS_RATIO) return false;

  binderLastOpenTap = null;
  if (horizontal) {
    moveBinderFocusSpatially(0, primary < 0 ? 1 : -1);
  } else {
    moveBinderFocusSpatially(primary < 0 ? 1 : -1, 0);
  }
  return true;
}

function handleBinderSinglePageSwipe(drag, event) {
  if (!drag || !isTouchLikePointer(event) || !isBinderSinglePageView()) return false;

  const deltaX = event.clientX - drag.startX;
  const deltaY = event.clientY - drag.startY;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < BINDER_FOCUS_SWIPE_MIN_DISTANCE) return false;
  if (Math.abs(deltaX) < Math.abs(deltaY)) return false;
  if (Math.abs(deltaY) / Math.max(1, Math.abs(deltaX)) > BINDER_FOCUS_SWIPE_MAX_OFF_AXIS_RATIO) return false;

  const currentSide = Number.isInteger(drag.startSinglePageSide)
    ? drag.startSinglePageSide
    : getBinderSinglePageSide();
  const nextSide = clamp(
    currentSide + (deltaX < 0 ? 1 : -1),
    BINDER_SINGLE_PAGE_COVER_SIDE,
    getBinderTotalPageSides() - 1,
  );
  if (nextSide === currentSide) {
    updateBinderPageControls();
    startBinderRenderLoop();
    return true;
  }

  binderLastOpenTap = null;
  return showBinderSinglePageSide(nextSide);
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

function handleBinderIntroNoteTap(event) {
  const linkHit = getBinderIntroLinkHit(event);
  const noteHit = getBinderIntroNoteHit(event);
  if (!linkHit && !noteHit) return false;

  if (isBinderIntroFocused()) {
    if (linkHit) {
      window.open(linkHit.object.userData.binderIntroLinkUrl || BINDER_INTRO_LINK_URL, "_blank", "noopener,noreferrer");
    }
    return true;
  }

  return focusBinderIntroNote();
}

function updateBinderIntroLinkCursor(event) {
  if (event.pointerType && event.pointerType !== "mouse") {
    clearBinderIntroLinkCursor();
    return;
  }
  const hasPointerTarget = getBinderCardHit(event)
    || getBinderIntroLinkHit(event)
    || (!isBinderIntroFocused() && getBinderIntroNoteHit(event));
  els.binderCanvas.style.cursor = hasPointerTarget ? "pointer" : "";
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

function getBinderIntroNoteHit(event) {
  if (!binderCamera || !binderIntroNoteMesh || !isVisibleThroughParents(binderIntroNoteMesh)) return null;
  if (hasActiveBinderIntroSuppressor()) return null;
  if (Math.abs(binderTurn) > 0.08 || Math.abs(binderTargetTurn) > 0.08) return null;

  setBinderRaycasterFromEvent(event);
  const focusMeshes = binderIntroFocusMeshes.filter((mesh) => isVisibleThroughParents(mesh));
  if (focusMeshes.length) {
    const focusHit = binderRaycaster.intersectObjects(focusMeshes, false)[0] || null;
    if (focusHit) return focusHit;
  }

  const hit = binderRaycaster.intersectObject(binderIntroNoteMesh, false)[0] || null;
  if (!hit || !isBinderIntroFocusUv(hit.uv, binderIntroNoteMesh.userData.binderIntroFocusBounds)) return null;
  return hit;
}

function isBinderIntroFocusUv(uv, bounds) {
  if (!uv || !bounds) return false;

  const textureX = uv.x;
  const textureY = 1 - uv.y;
  return textureX >= bounds.x
    && textureX <= bounds.x + bounds.width
    && textureY >= bounds.y
    && textureY <= bounds.y + bounds.height;
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
  if (!isBinderFocusView() || binderCardViewTransitionActive) return false;
  if (getBinderFocusBlockingHit(event)) return false;

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

function getBinderFocusBlockingHit(event) {
  if (!binderCamera || !binderRoot) return null;

  const meshes = [];
  binderRoot.traverse((child) => {
    if (!child.isMesh || !isVisibleThroughParents(child)) return;
    if (!isBinderFocusBlockingMesh(child)) return;
    meshes.push(child);
  });
  if (!meshes.length) return null;

  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(meshes, false)[0] || null;
}

function isBinderFocusBlockingMesh(mesh) {
  return Boolean(
    mesh?.userData?.binderCard
    || mesh?.userData?.binderBackCard
    || mesh?.userData?.binderSheetLayer
    || mesh?.userData?.binderIntroNoteText
    || mesh?.userData?.binderIntroLinkUrl
    || mesh?.userData?.binderIntroFocusHitbox
  );
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
  updateCardEffectPointer();
  updateCardEffectViewOpacity();
  updateCardGlossUniforms(cardGradientMesh);
  updateCardGlossUniforms(cardBackGradientMesh);
  updateCardGlossUniforms(cardGlareMesh);
  updateCardGlossUniforms(cardBackGlareMesh);
  updateCardSwapIncomingEffectUniforms();
  if (!galleryOpen) {
    updateAnimatedTextureRecords(getIndividualAnimatedTextureRecords());
  }
  cardRenderer.render(cardScene, cardCamera);
}

function getTraitCardOffsetX() {
  if (!traitsOpen || galleryOpen || isTraitPanelCompact()) return 0;

  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  if (viewportWidth <= 820 || viewportWidth / Math.max(1, viewportHeight) < 1.12) return 0;

  const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(cardCamera.fov) / 2) * currentCameraZ;
  const visibleWidth = visibleHeight * cardCamera.aspect;
  const isIntermediateWidth = viewportWidth <= 1280;
  const pixelShift = isIntermediateWidth
    ? clamp(viewportWidth * 0.22, 205, 350)
    : 264;
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
  if (uniforms.uPointer) uniforms.uPointer.value.set(cardEffectPointerX, cardEffectPointerY);
  if (uniforms.uPointerActive) uniforms.uPointerActive.value = cardEffectPointerActive;
  uniforms.uActivity.value = getCardEffectUniformActivity(uniforms.uEffectMode?.value || CARD_EFFECT_MODE_DEFAULT);
}

function updateCardSwapIncomingEffectUniforms() {
  updateCardEffectUniformsForGroup(cardSwapIncomingGroup);
}

function updateCardEffectUniformsForGroup(group) {
  const effectMeshes = group?.userData?.effectMeshes || [];
  if (!effectMeshes.length) return;

  const time = performance.now() * 0.001;
  for (const mesh of effectMeshes) {
    const uniforms = mesh?.material?.uniforms;
    if (!uniforms) continue;
    uniforms.uCameraPosition.value.copy(cardCamera.position);
    uniforms.uTime.value = time;
    if (uniforms.uPointer) uniforms.uPointer.value.set(cardEffectPointerX, cardEffectPointerY);
    if (uniforms.uPointerActive) uniforms.uPointerActive.value = cardEffectPointerActive;
    uniforms.uActivity.value = getCardEffectUniformActivity(uniforms.uEffectMode?.value || CARD_EFFECT_MODE_DEFAULT);
  }
}

function updateCardEffectViewOpacity(now = performance.now()) {
  if (cardEffectViewOpacity === cardEffectViewTargetOpacity) {
    setIndividualCardEffectOpacity(cardEffectViewOpacity);
    return;
  }

  const progress = CARD_EFFECT_VIEW_TRANSITION_FADE_MS <= 0
    ? 1
    : clamp((now - cardEffectViewFadeStartedAt) / CARD_EFFECT_VIEW_TRANSITION_FADE_MS, 0, 1);
  cardEffectViewOpacity = THREE.MathUtils.lerp(
    cardEffectViewStartOpacity,
    cardEffectViewTargetOpacity,
    easeInOutCubic(progress),
  );
  if (progress >= 1) cardEffectViewOpacity = cardEffectViewTargetOpacity;
  setIndividualCardEffectOpacity(cardEffectViewOpacity);
}

function setCardEffectViewTargetOpacity(opacity, { immediate = false } = {}) {
  const nextOpacity = clamp(opacity, 0, 1);
  cardEffectViewTargetOpacity = nextOpacity;
  if (immediate) {
    cardEffectViewOpacity = nextOpacity;
    cardEffectViewStartOpacity = nextOpacity;
    cardEffectViewFadeStartedAt = performance.now();
    setIndividualCardEffectOpacity(nextOpacity);
    return;
  }

  cardEffectViewStartOpacity = cardEffectViewOpacity;
  cardEffectViewFadeStartedAt = performance.now();
}

function setIndividualCardEffectOpacity(opacity) {
  const nextOpacity = clamp(opacity, 0, 1) * clamp(cardSwapOpacity, 0, 1);
  for (const mesh of [cardGradientMesh, cardBackGradientMesh, cardGlareMesh, cardBackGlareMesh]) {
    const uniforms = mesh?.material?.uniforms;
    if (!uniforms?.uTransitionOpacity) continue;
    uniforms.uTransitionOpacity.value = nextOpacity;
  }
}

function getCardEffectUniformActivity(effectMode) {
  if (effectMode > CARD_EFFECT_MODE_DEFAULT + 0.5) return 1;
  return cardGlossActivity;
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
  binderLastAnimationAt = 0;
  if (binderAnimationDelayTimer) {
    window.clearTimeout(binderAnimationDelayTimer);
    binderAnimationDelayTimer = 0;
  }

  const renderFrame = (frameTime) => {
    if (!galleryOpen || !isBinderMode || els.binderPanel.hidden) {
      binderAnimationFrame = 0;
      binderAnimationDelayTimer = 0;
      binderLastAnimationAt = 0;
      return;
    }
    const keepAnimating = updateBinderAnimation(frameTime);
    if (!keepAnimating) {
      binderAnimationFrame = 0;
      binderLastAnimationAt = 0;
      return;
    }
    if (binderLastAnimationIdleOnly) {
      binderAnimationFrame = 0;
      binderLastAnimationAt = 0;
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
  binderLastAnimationAt = 0;
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
    if (isBinderTurnMoving() || isBinderCameraMoving() || binderPreparingSpread) {
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

function getBinderAnimationDeltaMs(now) {
  if (!binderLastAnimationAt) {
    binderLastAnimationAt = now;
    return BINDER_FRAME_MS;
  }

  const deltaMs = clamp(now - binderLastAnimationAt, 1, BINDER_MAX_FRAME_DELTA_MS);
  binderLastAnimationAt = now;
  return deltaMs;
}

function getFrameDampedAlpha(baseAlpha, deltaMs) {
  const frameCount = clamp(deltaMs / BINDER_FRAME_MS, 0.25, BINDER_MAX_FRAME_DELTA_MS / BINDER_FRAME_MS);
  return 1 - Math.pow(1 - baseAlpha, frameCount);
}

function updateBinderAnimation(frameTime = performance.now()) {
  const wasIdleOnly = binderLastAnimationIdleOnly;
  binderLastAnimationIdleOnly = false;
  if (!binderRenderer || !binderScene || !binderCamera || !galleryOpen || !isBinderMode) {
    return false;
  }

  const now = Number.isFinite(frameTime) ? frameTime : performance.now();
  const deltaMs = getBinderAnimationDeltaMs(now);
  let turnActive = Boolean(binderDrag);
  if (!binderDrag) {
    const delta = binderTargetTurn - binderTurn;
    if (Math.abs(delta) > 0.0015) binderBendDirection = Math.sign(delta);
    binderTurn += delta * getFrameDampedAlpha(BINDER_TURN_BASE_ALPHA, deltaMs);
    turnActive = Math.abs(delta) >= 0.0015;
    if (!turnActive) binderTurn = binderTargetTurn;
  }

  const interactionActive = now < binderInteractionActiveUntil;
  const introNoteFadeActive = updateBinderIntroNoteModeOpacity(now);
  if (turnActive || interactionActive || !wasIdleOnly || introNoteFadeActive) {
    updateBinderPageTransforms();
  }
  updateBinderCameraFrame(false, deltaMs);
  const cameraMoving = isBinderCameraMoving();
  const animatedRecords = getBinderVisibleAnimatedTextureRecords();
  const fadeActive = updateBinderCardLoadFades(now) || introNoteFadeActive;
  if (!turnActive && !cameraMoving && animatedRecords.size && !interactionActive && !fadeActive) {
    const animatedUpdated = updateAnimatedTextureRecords(animatedRecords);
    if (animatedUpdated) {
      binderRenderer.render(binderScene, binderCamera);
    }
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
  const focused = isBinderFocusView();
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
  if (targetOpacity === 0 && isBinderIntroFocused()) {
    clearBinderFocus();
  }
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

function updateBinderCameraFrame(immediate = false, deltaMs = BINDER_FRAME_MS) {
  if (!binderCamera) return;

  updateBinderDefaultCameraFrame();
  binderDesiredCameraPosition.copy(binderDefaultCameraPosition);
  binderDesiredCameraLookAt.copy(binderDefaultCameraLookAt);

  const introFocusFrame = getBinderIntroFocusFrame();
  if (introFocusFrame) {
    const focusDistance = getBinderIntroFocusDistance(introFocusFrame);
    binderDesiredCameraLookAt.copy(introFocusFrame.center);
    binderDesiredCameraPosition.set(
      introFocusFrame.center.x,
      introFocusFrame.center.y,
      introFocusFrame.center.z + focusDistance,
    );
  } else {
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
  }

  if (immediate || !binderCameraReady) {
    binderCamera.position.copy(binderDesiredCameraPosition);
    binderCurrentCameraLookAt.copy(binderDesiredCameraLookAt);
    binderCamera.lookAt(binderCurrentCameraLookAt);
    binderCameraReady = true;
    return;
  }

  const alpha = getFrameDampedAlpha(
    isBinderFocusView() ? BINDER_FOCUS_CAMERA_BASE_ALPHA : BINDER_CAMERA_BASE_ALPHA,
    deltaMs,
  );
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
  const singlePage = isBinderSinglePageViewport(width, height) && !isBinderFocusView();
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

function getBinderIntroFocusFrame() {
  if (!isBinderIntroFocused() || !binderRoot || !binderIntroNoteMesh || !isVisibleThroughParents(binderIntroNoteMesh)) {
    return null;
  }

  const bounds = binderIntroNoteMesh.userData.binderIntroFocusBounds;
  const width = binderIntroNoteMesh.geometry?.parameters?.width || 1;
  const height = binderIntroNoteMesh.geometry?.parameters?.height || 1;
  const focusBounds = bounds && Number.isFinite(bounds.width) && Number.isFinite(bounds.height)
    ? bounds
    : { x: 0, y: 0, width: 1, height: 1 };
  const worldScale = binderIntroNoteMesh.getWorldScale(binderIntroFocusWorldScale);

  binderRoot.updateMatrixWorld(true);
  binderIntroNoteMesh.updateWorldMatrix(true, false);
  binderIntroFocusLocalPosition.set(
    width * (focusBounds.x + focusBounds.width / 2 - 0.5),
    height * (0.5 - focusBounds.y - focusBounds.height / 2),
    0,
  );
  binderIntroFocusWorldPosition.copy(binderIntroFocusLocalPosition).applyMatrix4(binderIntroNoteMesh.matrixWorld);

  return {
    center: binderIntroFocusWorldPosition,
    width: Math.max(0.1, width * focusBounds.width * Math.abs(worldScale.x || 1)),
    height: Math.max(0.1, height * focusBounds.height * Math.abs(worldScale.y || 1)),
  };
}

function getBinderIntroFocusDistance(frame) {
  const fov = THREE.MathUtils.degToRad(binderCamera.fov);
  const aspect = Math.max(binderCamera.aspect || 1, 0.1);
  const marginRatio = getBinderIntroFocusMarginRatio();
  const usableRatio = Math.max(0.1, 1 - marginRatio * 2);
  const distanceForHeight = frame.height / (2 * Math.tan(fov / 2) * usableRatio);
  const distanceForWidth = frame.width / (2 * Math.tan(fov / 2) * aspect * usableRatio);
  return Math.max(distanceForHeight, distanceForWidth) + BINDER_INTRO_FOCUS_EXTRA_Z;
}

function getBinderIntroFocusMarginRatio() {
  return isBinderSinglePageViewport()
    ? BINDER_INTRO_FOCUS_MOBILE_MARGIN_RATIO
    : BINDER_INTRO_FOCUS_MARGIN_RATIO;
}

function renderBinderSceneOnce({
  includePreload = !isBinderTurnMoving(),
  immediateCamera = false,
} = {}) {
  if (!binderRenderer || !binderScene || !binderCamera) return;
  updateBinderPageTransforms();
  updateBinderCameraFrame(immediateCamera || !binderCameraReady);
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
  updateBinderCameraFrame(!isBinderFocusView() || !binderCameraReady);
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
      focusBounds: binderIntroNoteTexture.userData.focusBounds,
    };
  }

  const width = 1024;
  const height = 584;
  const surface = document.createElement("canvas");
  surface.width = width;
  surface.height = height;
  const ctx = surface.getContext("2d");
  const noteBounds = drawBinderIntroNoteSurface(ctx);

  const texture = new THREE.CanvasTexture(surface);
  configureDisplayTexture(texture);
  texture.userData.linkBounds = noteBounds.linkBounds;
  texture.userData.focusBounds = noteBounds.focusBounds;
  texture.userData.surfaceContext = ctx;
  binderIntroNoteTexture = texture;
  return {
    texture,
    linkBounds: texture.userData.linkBounds,
    focusBounds: texture.userData.focusBounds,
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
  const binderName = ACTIVE_COLLECTION_ID === "cardnft2" ? "card nft 2" : "card nft";
  const firstLinePrefix = `this is a 3d binder viewer for ${binderName} by  `;
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
    "navigate by tapping, swiping, zooming, and/or the ui buttons",
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

  const linkBounds = [evilBiscuitLinkBounds];
  let focusBottomY = 390 + textOffsetY + 42 * 0.48;
  if (ACTIVE_COLLECTION_ID === "cardnft1") {
    const cardNft2LinkBounds = drawBinderIntroLinkedLine(ctx, {
      prefix: "card nft 2 out now. ",
      linkText: "click here",
      suffix: " to view",
      y: 510 + textOffsetY,
      maxWidth: maxTextWidth,
      fontSize: 32,
      fontStack,
      textFillStyle,
      linkFillStyle,
      url: BINDER_CARD_NFT_2_LINK_URL,
    });
    linkBounds.push(cardNft2LinkBounds);
    focusBottomY = 510 + textOffsetY + 32 * 0.48;
  } else if (ACTIVE_COLLECTION_ID === "cardnft2") {
    const cardNft1LinkBounds = drawBinderIntroLinkedLine(ctx, {
      prefix: "to view the card nft 1 collection ",
      linkText: "click here",
      y: 510 + textOffsetY,
      maxWidth: maxTextWidth,
      fontSize: 32,
      fontStack,
      textFillStyle,
      linkFillStyle,
      url: BINDER_CARD_NFT_1_LINK_URL,
    });
    linkBounds.push(cardNft1LinkBounds);
    focusBottomY = 510 + textOffsetY + 32 * 0.48;
  }

  const focusTop = Math.max(0, (144 + textOffsetY - baseFontSize * 1.28) / height);
  const focusBottom = Math.min(1, focusBottomY / height);
  return {
    linkBounds,
    focusBounds: {
      x: 0.04,
      y: focusTop,
      width: 0.92,
      height: focusBottom - focusTop,
    },
  };
}

function drawBinderIntroLinkedLine(
  ctx,
  { prefix, linkText, suffix = "", y, maxWidth, fontSize, fontStack, textFillStyle, linkFillStyle, url },
) {
  let size = fontSize;
  while (size > 18) {
    ctx.font = `400 ${size}px ${fontStack}`;
    if (ctx.measureText(prefix + linkText + suffix).width <= maxWidth) break;
    size -= 1;
  }

  ctx.font = `400 ${size}px ${fontStack}`;
  const prefixWidth = ctx.measureText(prefix).width;
  const linkWidth = ctx.measureText(linkText).width;
  const suffixWidth = ctx.measureText(suffix).width;
  const lineStartX = (ctx.canvas.width - prefixWidth - linkWidth - suffixWidth) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = textFillStyle;
  ctx.fillText(prefix, lineStartX, y);
  ctx.fillStyle = linkFillStyle;
  ctx.fillText(linkText, lineStartX + prefixWidth, y);
  if (suffix) {
    ctx.fillStyle = textFillStyle;
    ctx.fillText(suffix, lineStartX + prefixWidth + linkWidth, y);
  }

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

  const size = 256;
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
  configureDisplayTexture(binderPlaceholderTexture);
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
  configureDisplayTexture(texture, { colorSpace: THREE.NoColorSpace });
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

function getBackTexture(card = null) {
  const assetPath = cardBackAssetPath(card);
  if (backTexturePromises.has(assetPath)) {
    return backTexturePromises.get(assetPath);
  }

  const promise = loadTexture(new URL(assetPath, import.meta.url).href).catch((error) => {
    backTexturePromises.delete(assetPath);
    throw error;
  });
  backTexturePromises.set(assetPath, promise);
  return promise;
}

function cardBackAssetPath(card = null) {
  const collection = getCollectionConfigForCard(card);
  const backImages = Array.isArray(collection.backImages) ? collection.backImages : [];
  if (backImages.length) {
    return backImages[getStableCardBackIndex(card, backImages.length)];
  }
  return collection.backImage || "./cardnft back.png";
}

function getStableCardBackIndex(card, length) {
  if (!length) return 0;
  const key = card?.stableId
    || card?.mint
    || card?.title
    || card?.file
    || `${card?.collection || ACTIVE_COLLECTION_ID}:${card?.collectionIndex || 0}`;
  return stableHash(key) % length;
}

function stableHash(value) {
  let hash = 0x811c9dc5;
  const input = String(value || "");
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d) >>> 0;
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0;
}

function configureDisplayTexture(texture, { colorSpace = THREE.SRGBColorSpace } = {}) {
  texture.colorSpace = colorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

function loadTexture(url, options = {}) {
  return new Promise((resolve, reject) => {
    textureLoader.load(url, (texture) => {
      resolve(configureDisplayTexture(texture, options));
    }, undefined, reject);
  });
}

function loadCardNft2EffectTextures(cardNumber) {
  return Promise.all([
    getCardNft2EffectTexture("foil", cardNumber),
    getCardNft2EffectTexture("mask", cardNumber),
  ]).then(([foil, mask]) => ({ foil, mask }));
}

function getCardNft2EffectTexture(kind, cardNumber) {
  const normalizedNumber = Number(cardNumber);
  if (!Number.isInteger(normalizedNumber) || !CARD_NFT_2_EFFECT_TEXTURE_CIDS[kind]) {
    return Promise.reject(new Error("Invalid CardNFT2 effect texture"));
  }

  const key = `${kind}:${normalizedNumber}`;
  if (cardNft2EffectTextureCache.has(key)) {
    const promise = cardNft2EffectTextureCache.get(key);
    cardNft2EffectTextureCache.delete(key);
    cardNft2EffectTextureCache.set(key, promise);
    return promise;
  }

  const url = cardNft2EffectTextureUrl(kind, normalizedNumber);
  const options = kind === "mask" ? { colorSpace: THREE.NoColorSpace } : undefined;
  const promise = loadTexture(url, options).catch((error) => {
    cardNft2EffectTextureCache.delete(key);
    throw error;
  });
  cardNft2EffectTextureCache.set(key, promise);
  trimCardNft2EffectTextureCache();
  return promise;
}

function cardNft2EffectTextureUrl(kind, cardNumber) {
  const id = String(cardNumber).padStart(4, "0");
  return `${CARD_NFT_2_EFFECT_TEXTURE_GATEWAY}/${CARD_NFT_2_EFFECT_TEXTURE_CIDS[kind]}/${id}.webp`;
}

function trimCardNft2EffectTextureCache() {
  const protectedKeys = getProtectedCardEffectTextureKeys();
  let protectedScans = 0;
  while (
    cardNft2EffectTextureCache.size > MAX_CARD_NFT_2_EFFECT_TEXTURE_CACHE_SIZE
    && protectedScans < cardNft2EffectTextureCache.size
  ) {
    const oldest = cardNft2EffectTextureCache.entries().next().value;
    if (!oldest) return;
    const [key, promise] = oldest;
    cardNft2EffectTextureCache.delete(key);
    if (protectedKeys.has(key)) {
      cardNft2EffectTextureCache.set(key, promise);
      protectedScans += 1;
      continue;
    }
    protectedScans = 0;
    Promise.resolve(promise).then(disposeNftTexture).catch(() => {});
  }
}

function getProtectedCardEffectTextureKeys() {
  const keys = new Set();
  if (Number.isInteger(currentIndex) && CARDS[currentIndex]) {
    addCardEffectTextureCacheKeys(keys, CARDS[currentIndex]);
  }

  if (binderVisibleIndexes.length) {
    for (const position of getBinderPreloadPositions()) {
      const cardIndex = binderVisibleIndexes[position];
      if (Number.isInteger(cardIndex) && CARDS[cardIndex]) {
        addCardEffectTextureCacheKeys(keys, CARDS[cardIndex]);
      }
    }
  }

  return keys;
}

function addCardEffectTextureCacheKeys(keys, card) {
  const profile = getCardEffectProfile(card);
  if (!profile.needsEffectTextures) return;
  keys.add(`foil:${profile.cardNumber}`);
  keys.add(`mask:${profile.cardNumber}`);
}

function loadAnimatedTexture(card) {
  const sprite = getAnimatedSpriteInfo(card);
  if (!sprite) return loadTexture(cardAssetUrl(card));

  return loadTexture(new URL(sprite.file, import.meta.url).href).then((texture) => {
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
  configureDisplayTexture(cardPlaceholderTexture);
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
  configureDisplayTexture(cardSurfaceNoiseTexture);
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
      uEffectMode: { value: CARD_EFFECT_MODE_DEFAULT },
      uUseEffectTextures: { value: 0 },
      uFoilTexture: { value: getCardPlaceholderTexture() },
      uMaskTexture: { value: getCardPlaceholderTexture() },
      uPointer: { value: new THREE.Vector2(CARD_NFT_2_EFFECT_OFFCARD_POINTER_X, CARD_NFT_2_EFFECT_OFFCARD_POINTER_Y) },
      uPointerActive: { value: 0 },
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
      uniform float uEffectMode;
      uniform float uUseEffectTextures;
      uniform vec2 uPointer;
      uniform float uPointerActive;
      uniform sampler2D uFoilTexture;
      uniform sampler2D uMaskTexture;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      float stripe(float value, float width) {
        return smoothstep(width, 0.0, abs(fract(value) - 0.5));
      }

      vec3 rainbow(float value) {
        return 0.5 + 0.5 * cos(6.2831853 * (value + vec3(0.0, 0.33, 0.67)));
      }

      void main() {
        vec3 normal = normalize(vWorldNormal) * uNormalDirection;
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float facing = abs(dot(normal, viewDir));
        float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 1.18);
        vec3 reflected = reflect(-viewDir, normal);
        vec2 centered = vUv - 0.5;

        if (uEffectMode > 0.5) {
          vec2 motionPointer = clamp(vec2(0.5 + reflected.x * 0.62, 0.5 - reflected.y * 0.56), 0.0, 1.0);
          vec2 background = clamp(vec2(0.37 + motionPointer.x * 0.26, 0.33 + motionPointer.y * 0.34), 0.0, 1.0);
          float motionFromCenter = clamp(length(motionPointer - 0.5) / 0.5, 0.0, 1.0);
          float motionRadial = smoothstep(0.92, 0.0, distance(vUv, motionPointer));
          float motionCore = smoothstep(0.2, 0.0, distance(vUv, motionPointer));
          float grain = fract(sin(dot(vUv * vec2(811.3, 1247.1), vec2(12.9898, 78.233))) * 43758.5453);
          float fine = fract(sin(dot((vUv + background) * vec2(315.7, 924.6), vec2(37.719, 11.137))) * 24634.6345);

          if (uEffectMode < 1.5) {
            gl_FragColor = vec4(0.0);
            return;
          }

          float maskValue = 1.0;
          float textureBlend = smoothstep(0.0, 1.0, uUseEffectTextures);
          if (uUseEffectTextures > 0.5) {
            vec4 maskSample = texture2D(uMaskTexture, vUv);
            float maskLight = dot(maskSample.rgb, vec3(0.299, 0.587, 0.114));
            maskValue = mix(0.96, 1.08, maskLight);
          }
          vec3 proceduralFoil = mix(
            vec3(0.12, 0.14, 0.18),
            vec3(0.88, 0.92, 0.9),
            stripe((vUv.x - vUv.y) * 5.4 + background.x * 1.8, 0.16)
          );
          vec3 textureFoil = uUseEffectTextures > 0.5 ? texture2D(uFoilTexture, vUv).rgb : proceduralFoil;
          vec3 foil = mix(proceduralFoil, max(textureFoil, proceduralFoil * 0.72), 0.36 * textureBlend);
          vec3 sunPillar = rainbow(vUv.y * 6.8 + background.y * 7.0);
          vec3 reverseSunPillar = rainbow(-vUv.y * 4.2 - background.y * 5.0 + background.x * 1.2);
          float metalLine = stripe((vUv.x * 0.74 - vUv.y * 0.54) * 5.8 + background.x * 2.2 + background.y * 0.85, 0.075);
          float metalBand = stripe((vUv.x * 0.74 - vUv.y * 0.54) * 2.35 + background.x * 1.15, 0.18);
          float scan = stripe(vUv.y * 145.0 + background.y * 3.0, 0.18);
          float barsA = stripe(vUv.x * 8.8 + background.y * 4.0, 0.08);
          float barsB = stripe(vUv.x * 5.6 - background.y * 3.0 + background.x * 2.2, 0.11);
          float radialDark = smoothstep(0.08, 0.92, distance(vUv, motionPointer));
          vec3 color = vec3(0.0);
          float alpha = 0.0;

          if (uEffectMode < 2.5) {
            vec3 metal = mix(vec3(0.015, 0.028, 0.075), vec3(0.58, 0.68, 0.68), metalLine);
            color = mix(metal, sunPillar, 0.46);
            color = mix(color, reverseSunPillar, metalBand * 0.28);
            color = color * mix(0.76, 1.18, grain) + foil * 0.12;
            color = mix(color, vec3(0.93, 0.96, 1.0), motionCore * 0.16);
            color *= mix(0.78, 1.0, radialDark);
            alpha = (0.135 + metalLine * 0.135 + metalBand * 0.055 + motionRadial * 0.045) * maskValue;
          } else if (uEffectMode < 3.5) {
            vec3 holo = rainbow(((0.5 - background.x) * 2.6) + ((0.5 - background.y) * 3.5) + vUv.x * 1.2 + vUv.y * 3.4);
            float scanMix = mix(0.42, 1.0, scan);
            color = holo * scanMix;
            color = mix(color, vec3(0.72), (barsA + barsB) * 0.16);
            color = mix(color, vec3(0.98, 1.0, 1.0), motionCore * 0.18);
            alpha = (0.16 + barsA * 0.07 + barsB * 0.055 + motionRadial * 0.075) * maskValue;
          } else if (uEffectMode < 4.5) {
            vec3 support = mix(foil, sunPillar, 0.38);
            support = mix(support, reverseSunPillar, metalLine * 0.22);
            color = support * mix(0.72, 1.28, motionFromCenter * 0.55 + motionRadial * 0.35);
            color = mix(color, vec3(1.0, 0.94, 0.98), motionCore * 0.22);
            alpha = (0.12 + metalLine * 0.085 + motionRadial * 0.11 + motionFromCenter * 0.035) * maskValue;
          } else {
            float sparkle = step(0.982, fine) * smoothstep(0.9, 0.0, distance(vUv, motionPointer));
            float glitter = step(0.975, grain);
            vec3 amazing = mix(vec3(0.08, 0.18, 0.12), rainbow((vUv.x - vUv.y) * 2.1 + background.x * 3.0), 0.58);
            color = amazing + foil * 0.18 + (sparkle + glitter * 0.38) * vec3(1.0, 0.92, 0.65);
            color = mix(color, sunPillar, metalBand * 0.18);
            alpha = (0.13 + metalLine * 0.045 + motionRadial * 0.1 + sparkle * 0.28 + glitter * 0.04) * maskValue;
          }

          alpha *= mix(0.88, 1.08, grain);
          gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.34) * uActivity * uTransitionOpacity);
          return;
        }

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
      uEffectMode: { value: CARD_EFFECT_MODE_DEFAULT },
      uUseEffectTextures: { value: 0 },
      uFoilTexture: { value: getCardPlaceholderTexture() },
      uMaskTexture: { value: getCardPlaceholderTexture() },
      uPointer: { value: new THREE.Vector2(CARD_NFT_2_EFFECT_OFFCARD_POINTER_X, CARD_NFT_2_EFFECT_OFFCARD_POINTER_Y) },
      uPointerActive: { value: 0 },
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
      uniform float uEffectMode;
      uniform float uUseEffectTextures;
      uniform vec2 uPointer;
      uniform float uPointerActive;
      uniform sampler2D uFoilTexture;
      uniform sampler2D uMaskTexture;
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      varying vec3 vWorldPosition;

      float stripe(float value, float width) {
        return smoothstep(width, 0.0, abs(fract(value) - 0.5));
      }

      void main() {
        vec3 normal = normalize(vWorldNormal) * uNormalDirection;
        vec3 viewDir = normalize(uCameraPosition - vWorldPosition);
        float facing = abs(dot(normal, viewDir));
        float fresnel = pow(1.0 - clamp(facing, 0.0, 1.0), 1.18);
        vec3 reflected = reflect(-viewDir, normal);
        vec2 centered = vUv - 0.5;

        if (uEffectMode > 0.5) {
          vec2 spotlightPointer = uPointer;
          vec2 motionPointer = clamp(vec2(0.5 + reflected.x * 0.62, 0.5 - reflected.y * 0.56), 0.0, 1.0);
          vec2 background = clamp(vec2(0.37 + motionPointer.x * 0.26, 0.33 + motionPointer.y * 0.34), 0.0, 1.0);
          float radial = smoothstep(0.88, 0.0, distance(vUv, spotlightPointer));
          float inner = smoothstep(0.22, 0.0, distance(vUv, spotlightPointer));
          float spotlight = smoothstep(0.01, 0.85, uPointerActive) * 0.74;
          float maskValue = 1.0;
          if (uUseEffectTextures > 0.5) {
            vec4 maskSample = texture2D(uMaskTexture, vUv);
            float maskLight = dot(maskSample.rgb, vec3(0.299, 0.587, 0.114));
            maskValue = mix(0.97, 1.06, maskLight);
          }
          float fineGrain = fract(sin(dot(vUv * vec2(811.3, 1247.1), vec2(12.9898, 78.233))) * 43758.5453);
          vec3 baseColor = vec3(1.0);
          vec3 spotColor = vec3(1.0);
          float baseAlpha = 0.0;
          float spotAlpha = 0.0;

          if (uEffectMode < 1.5) {
            spotColor = mix(vec3(1.0), vec3(0.78, 0.82, 0.88), radial * 0.34);
            spotAlpha = (inner * 0.2 + radial * 0.13) * 0.56 * spotlight;
          } else if (uEffectMode < 2.5) {
            float sweep = stripe((vUv.x * 0.92 - vUv.y * 0.52) * 3.8 + background.x * 2.2 + background.y * 1.1, 0.1);
            baseAlpha = (0.045 + sweep * 0.09) * 0.5 * maskValue;
            spotAlpha = (radial * 0.14 + inner * 0.17) * 0.5 * spotlight * maskValue;
            baseColor = mix(vec3(0.36, 0.38, 0.42), vec3(1.0), sweep * 0.34);
            spotColor = mix(vec3(0.78, 0.84, 0.96), vec3(1.0), inner * 0.7);
          } else if (uEffectMode < 3.5) {
            float bars = stripe(vUv.x * 8.0 + background.y * 3.0, 0.1);
            baseAlpha = (0.06 + bars * 0.055) * 0.8 * maskValue;
            spotAlpha = (radial * 0.17 + inner * 0.19) * 0.8 * spotlight * maskValue;
            baseColor = mix(vec3(0.68, 0.88, 0.95), vec3(1.0), bars * 0.22);
            spotColor = mix(vec3(0.8, 0.9, 0.98), vec3(1.0), inner * 0.72);
          } else if (uEffectMode < 4.5) {
            baseAlpha = 0.052 * 0.74 * maskValue;
            spotAlpha = (radial * 0.18 + inner * 0.16) * 0.74 * spotlight * maskValue;
            baseColor = vec3(0.44, 0.42, 0.48);
            spotColor = mix(vec3(0.78, 0.78, 0.86), vec3(1.0, 0.82, 0.94), inner * 0.68);
          } else {
            baseAlpha = 0.052 * 0.72 * maskValue;
            spotAlpha = (radial * 0.14 + inner * 0.17) * 0.72 * spotlight * maskValue;
            baseColor = vec3(0.5, 0.68, 0.54);
            spotColor = mix(vec3(0.76, 0.88, 0.72), vec3(1.0, 0.95, 0.72), inner * 0.62);
          }

          float grainAdjust = mix(0.9, 1.06, fineGrain);
          baseAlpha *= grainAdjust;
          spotAlpha *= grainAdjust;
          float alpha = clamp(baseAlpha + spotAlpha, 0.0, 0.42);
          vec3 color = alpha > 0.0001
            ? ((baseColor * baseAlpha) + (spotColor * spotAlpha)) / max(baseAlpha + spotAlpha, 0.0001)
            : vec3(0.0);
          gl_FragColor = vec4(color, alpha * uActivity * uTransitionOpacity);
          return;
        }

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
  return card?.stableId || `${card?.collection || ACTIVE_COLLECTION_ID}:${card?.mint || card?.title || index}`;
}

function migrateLegacyFavorites(set) {
  let changed = false;
  for (const card of CARDS) {
    const legacyKeys = [card?.mint, card?.title].filter(Boolean);
    const nextKey = card?.stableId;
    if (!nextKey) continue;
    for (const legacyKey of legacyKeys) {
      if (!set.has(legacyKey)) continue;
      set.add(nextKey);
      changed = true;
    }
  }
  if (changed) saveSet("cardnft:favorites:v1", set);
}

function applyRestoredSessionViewState(state) {
  if (!state || typeof state !== "object") return;

  if (typeof state.isBinderMode === "boolean") isBinderMode = state.isBinderMode;
  favoritesOnly = Boolean(state.favoritesOnly);
  traitSearchOpen = TRAIT_FILTERS_ENABLED && Boolean(state.traitSearchOpen);
  traitSortCategory = TRAIT_FILTERS_ENABLED ? getValidTraitSortCategory(state.traitSortCategory) : "all";
  activeTraitFilter = TRAIT_FILTERS_ENABLED ? getValidSessionTraitFilter(state.activeTraitFilter) : null;
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

  if (state.binderIntroFocused && !hasActiveBinderIntroSuppressor()) {
    focusBinderIntroNote({ immediate: true });
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
  renderBinderSceneOnce({ immediateCamera: true });
  queueSessionViewStateSave();
}

function getRestoredSessionCardIndex(state) {
  const fallback = ACTIVE_COLLECTION_INDEXES[0] || 0;
  if (!Number.isInteger(state?.currentIndex) || !CARDS.length) return fallback;
  const index = clamp(state.currentIndex, 0, CARDS.length - 1);
  return CARDS[index]?.collection === ACTIVE_COLLECTION_ID ? index : fallback;
}

function getValidTraitSortCategory(category) {
  if (category === "all") return "all";
  const matched = getTraitDisplayCategoryOptions()
    .find((option) => normalizeTraitValue(option.category) === normalizeTraitValue(category));
  if (matched) return matched.category;
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
    sourceCategories: getValidTraitFilterSourceCategories(filter.sourceCategories, category),
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
      ? {
        category: activeTraitFilter.category,
        value: activeTraitFilter.value,
        sourceCategories: activeTraitFilter.sourceCategories,
      }
      : null,
    binderTargetTurn: Math.round(binderTargetTurn),
    binderSinglePageSide: Number.isInteger(binderSinglePageSide) ? binderSinglePageSide : null,
    binderSinglePageSideTouched,
    binderFocusedCardIndex: Number.isInteger(focusedCardIndex) ? focusedCardIndex : null,
    binderIntroFocused: isBinderIntroFocused(),
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
