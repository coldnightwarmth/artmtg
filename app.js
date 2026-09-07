import * as THREE from "three";
import { BROWSER_TRAIT_CATALOG } from "./browser-traits-catalog.js?v=browser-traits-9";
import { CARD_NFT_ANIMATED } from "./cardnft-animated.js";
import { CARD_NFT_ANIMATED_SPRITES } from "./cardnft-animated-sprites.js";
import {
  TENSOR_LISTED_CARD_IDS,
  TENSOR_LISTED_CARD_MINTS,
} from "./marketplace-status.js?v=marketplace-status-6";
import {
  disconnectSolanaWallet,
  getCompatibleSolanaWallets,
  getGlobalTradeStatuses,
  getOwnerWalletBinder,
  getPublicWalletBinder,
  getPublicWalletBinderCover,
  getPublicWalletBinders,
  getWalletAuthSession,
  isCanonicalSolanaAddress,
  signInWithSolanaWallet,
  signOutWalletAuthSession,
  subscribeToWalletAccountChanges,
  updateOwnerWalletBinder,
  watchCompatibleSolanaWallets,
} from "./wallet-auth.js?v=wallet-auth-8";
import { CARD_NFT_2_COMMON_IDS } from "./cardnft2-common-ids.js?v=cardnft2-common-1";
import { SWAG_PACK_TRANSPARENT_STICKER_FILES } from "./swag-pack-stickers.js?v=swag-pack-transparent-1";

const COLLECTION_DATA_SPECS = {
  cardnft1: { module: "./cardnft-data.js?v=cardnft1-1", exportName: "CARD_NFTS" },
  cardnft2: { module: "./cardnft2-data.js?v=cardnft2-3", exportName: "CARD_NFT_2S" },
  poncho: { module: "./poncho-data.js?v=poncho-4", exportName: "PONCHO_CARDS" },
  limited: { module: "./limited-data.js?v=community-8", exportName: "LIMITED_CARDS" },
  cloudcastle: { module: "./cloudcastle-data.js?v=community-3", exportName: "CLOUDCASTLE_CARDS" },
  badhand: { module: "./badhand-data.js?v=community-2", exportName: "BADHAND_CARDS" },
  badhand2: { module: "./badhand2-data.js?v=community-1", exportName: "BADHAND2_CARDS" },
  jpegs: { module: "./jpegs-data.js?v=community-7", exportName: "JPEGS_CARDS" },
  nolegs: { module: "./nolegs-data.js?v=community-5", exportName: "NOLEGS_CARDS" },
  playcards: { module: "./playcards-data.js?v=community-2", exportName: "PLAYCARDS_CARDS" },
  kardmane: { module: "./kardmane-data.js?v=community-2", exportName: "KARDMANE_CARDS" },
  cloudcastles: { module: "./cloudcastles-data.js?v=community-5", exportName: "CLOUDCASTLES_CARDS" },
  sweetcurse: { module: "./sweetcurse-data.js?v=community-5", exportName: "SWEETCURSE_CARDS" },
  winloop: { module: "./winloop-data.js?v=community-5", exportName: "WINLOOP_CARDS" },
  mtgnft: { module: "./mtgnft-data.js?v=community-5", exportName: "MTGNFT_CARDS" },
  igorsquest: { module: "./igorsquest-data.js?v=community-5", exportName: "IGORSQUEST_CARDS" },
  clear: { module: "./clear-data.js?v=clear-8", exportName: "CLEAR_CARDS" },
};
const REQUESTED_COLLECTION_ID = COLLECTION_DATA_SPECS[document.documentElement.dataset.collectionId]
  ? document.documentElement.dataset.collectionId
  : "cardnft2";
const INITIAL_COLLECTION_DATA_SPEC = COLLECTION_DATA_SPECS[REQUESTED_COLLECTION_ID];
const INITIAL_COLLECTION_DATA_MODULE = await import(INITIAL_COLLECTION_DATA_SPEC.module);
const INITIAL_COLLECTION_CARDS = INITIAL_COLLECTION_DATA_MODULE[INITIAL_COLLECTION_DATA_SPEC.exportName];
if (!Array.isArray(INITIAL_COLLECTION_CARDS)) {
  throw new Error(`Unable to load ${REQUESTED_COLLECTION_ID} card data`);
}

function getInitialCollectionCards(collectionId) {
  return collectionId === REQUESTED_COLLECTION_ID ? INITIAL_COLLECTION_CARDS : [];
}

function getBrowserTraitConfig(collectionId) {
  return BROWSER_TRAIT_CATALOG[collectionId] || {
    categories: [],
    module: "",
    records: 0,
  };
}

const COLLECTION_CONFIGS = {
  cardnft1: {
    id: "cardnft1",
    label: "Card NFT",
    introLabel: "card nft 1",
    cards: getInitialCollectionCards("cardnft1"),
    traitCategories: getBrowserTraitConfig("cardnft1").categories,
    traitModule: getBrowserTraitConfig("cardnft1").module,
    traits: null,
    traitFiltersEnabled: true,
    backImage: "./cardnft back.png",
    coverEmblem: "assets/ui/cardnft1-logo-cover.webp?v=cardnft1-cover-1",
    coverEmblemAspect: 321 / 128,
    coverEmblemScale: 0.78,
    coverEmblemYRatio: 0.045,
    path: "/cardnft1/",
    introGroup: "evil",
  },
  cardnft2: {
    id: "cardnft2",
    label: "Card NFT 2",
    introLabel: "card nft 2",
    cards: getInitialCollectionCards("cardnft2"),
    traitCategories: getBrowserTraitConfig("cardnft2").categories,
    traitModule: getBrowserTraitConfig("cardnft2").module,
    traits: null,
    traitFiltersEnabled: true,
    backImages: [
      "assets/cardnft2/backs/cardnft2-back-orange.webp",
      "assets/cardnft2/backs/cardnft2-back-purple.webp",
      "assets/cardnft2/backs/cardnft2-back-blue.webp",
      "assets/cardnft2/backs/cardnft2-back-red.webp",
    ],
    path: "/",
    introGroup: "evil",
  },
  poncho: {
    id: "poncho",
    label: "Poncho Drifella",
    introLabel: "poncho drifella",
    cards: getInitialCollectionCards("poncho"),
    traitCategories: getBrowserTraitConfig("poncho").categories,
    traitModule: getBrowserTraitConfig("poncho").module,
    traits: null,
    traitFiltersEnabled: true,
    backImage: "assets/poncho/backs/poncho-pack.webp?v=pokemon-english-1",
    coverEmblem: "assets/ui/poncho-drifella-cover.webp?v=poncho-cover-1",
    coverEmblemAspect: 545 / 704,
    coverEmblemScale: 0.78,
    coverEmblemYRatio: 0.035,
    path: "/poncho/",
    introGroup: "evil",
  },
  limited: {
    id: "limited",
    label: "Limited 1/1s",
    introLabel: "limited 1/1s",
    cards: getInitialCollectionCards("limited"),
    traitCategories: getBrowserTraitConfig("limited").categories,
    traitModule: getBrowserTraitConfig("limited").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("limited").categories.length > 0,
    backImage: "assets/limited/backs/limited-back.webp?v=yugioh-english-2",
    path: "/limited/",
    introGroup: "community",
  },
  cloudcastle: {
    id: "cloudcastle",
    label: "Cloudcastle Dessert Oasis 月下の夜想曲",
    introLabel: "cloudcastle dessert oasis",
    cards: getInitialCollectionCards("cloudcastle"),
    traitCategories: getBrowserTraitConfig("cloudcastle").categories,
    traitModule: getBrowserTraitConfig("cloudcastle").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("cloudcastle").categories.length > 0,
    backImage: "assets/cloudcastle/backs/cloudcastle-back.webp?v=yugioh-english-2",
    path: "/cloudcastle/",
    introGroup: "community",
  },
  badhand: {
    id: "badhand",
    label: "BAD HAND",
    introLabel: "bad hand",
    cards: getInitialCollectionCards("badhand"),
    traitCategories: getBrowserTraitConfig("badhand").categories,
    traitModule: getBrowserTraitConfig("badhand").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("badhand").categories.length > 0,
    backImage: "assets/badhand/backs/badhand-back.webp?v=yugioh-english-2",
    path: "/badhand/",
    introGroup: "community",
  },
  badhand2: {
    id: "badhand2",
    label: "BAD HAND 2",
    introLabel: "bad hand 2",
    cards: getInitialCollectionCards("badhand2"),
    traitCategories: getBrowserTraitConfig("badhand2").categories,
    traitModule: getBrowserTraitConfig("badhand2").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("badhand2").categories.length > 0,
    backImage: "assets/badhand2/backs/badhand2-back.webp?v=yugioh-english-2",
    path: "/badhand2/",
    introGroup: "community",
  },
  jpegs: {
    id: "jpegs",
    label: "judgement",
    introLabel: "jpegs.cool",
    cards: getInitialCollectionCards("jpegs"),
    traitCategories: getBrowserTraitConfig("jpegs").categories,
    traitModule: getBrowserTraitConfig("jpegs").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("jpegs").categories.length > 0,
    backImage: "assets/jpegs/backs/jpegs-back.webp?v=jpegs-cards-logo-1",
    path: "/jpegs/",
    introGroup: "community",
  },
  nolegs: {
    id: "nolegs",
    label: "CARDS",
    introLabel: "cards (no legs)",
    cards: getInitialCollectionCards("nolegs"),
    traitCategories: getBrowserTraitConfig("nolegs").categories,
    traitModule: getBrowserTraitConfig("nolegs").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("nolegs").categories.length > 0,
    backImage: "assets/nolegs/backs/nolegs-back.webp?v=nolegs-transparent-4",
    path: "/nolegs/",
    introGroup: "community",
  },
  playcards: {
    id: "playcards",
    label: "play cards alpha",
    introLabel: "play cards alpha",
    cards: getInitialCollectionCards("playcards"),
    traitCategories: getBrowserTraitConfig("playcards").categories,
    traitModule: getBrowserTraitConfig("playcards").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("playcards").categories.length > 0,
    backImage: "assets/playcards/backs/playcards-back.webp?v=playcards-purple-back-1",
    path: "/playcards/",
    introGroup: "community",
  },
  kardmane: {
    id: "kardmane",
    label: "Kardmane",
    introLabel: "kardmane",
    cards: getInitialCollectionCards("kardmane"),
    traitCategories: getBrowserTraitConfig("kardmane").categories,
    traitModule: getBrowserTraitConfig("kardmane").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("kardmane").categories.length > 0,
    backImage: "assets/kardmane/backs/kardmane-back.webp?v=kardmane-old-world-1",
    path: "/kardmane/",
    introGroup: "community",
  },
  cloudcastles: {
    id: "cloudcastles",
    label: "Cloudcastle ☆ Limited Edition Alpha",
    introLabel: "cloudcastle ☆ limited edition alpha",
    cards: getInitialCollectionCards("cloudcastles"),
    traitCategories: getBrowserTraitConfig("cloudcastles").categories,
    traitModule: getBrowserTraitConfig("cloudcastles").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("cloudcastles").categories.length > 0,
    backImage: "assets/cloudcastles/backs/cloudcastles-back.webp?v=yugioh-english-2",
    path: "/cloudcastles/",
    introGroup: "community",
  },
  sweetcurse: {
    id: "sweetcurse",
    label: "Sweet Curse",
    introLabel: "sweet curse",
    cards: getInitialCollectionCards("sweetcurse"),
    traitCategories: getBrowserTraitConfig("sweetcurse").categories,
    traitModule: getBrowserTraitConfig("sweetcurse").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("sweetcurse").categories.length > 0,
    backImage: "assets/sweetcurse/backs/sweetcurse-back.webp?v=sweetcurse-1",
    path: "/sweetcurse/",
    introGroup: "community",
  },
  winloop: {
    id: "winloop",
    label: "Win Loop, hi Miya Maker",
    introLabel: "win loop, hi miya maker",
    cards: getInitialCollectionCards("winloop"),
    traitCategories: getBrowserTraitConfig("winloop").categories,
    traitModule: getBrowserTraitConfig("winloop").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("winloop").categories.length > 0,
    backImage: "assets/winloop/backs/winloop-back.webp?v=yugioh-english-2",
    path: "/winloop/",
    introGroup: "community",
  },
  mtgnft: {
    id: "mtgnft",
    label: "MTG NFT",
    introLabel: "mtg nft",
    cards: getInitialCollectionCards("mtgnft"),
    traitCategories: getBrowserTraitConfig("mtgnft").categories,
    traitModule: getBrowserTraitConfig("mtgnft").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("mtgnft").categories.length > 0,
    backImage: "assets/mtgnft/backs/mtgnft-back.webp?v=mtgnft-1",
    path: "/mtgnft/",
    introGroup: "community",
  },
  igorsquest: {
    id: "igorsquest",
    label: "Igors Quest",
    introLabel: "igors quest",
    cards: getInitialCollectionCards("igorsquest"),
    traitCategories: getBrowserTraitConfig("igorsquest").categories,
    traitModule: getBrowserTraitConfig("igorsquest").module,
    traits: null,
    traitFiltersEnabled: getBrowserTraitConfig("igorsquest").categories.length > 0,
    backImage: "assets/igorsquest/backs/igorsquest-back.webp?v=igorsquest-1",
    path: "/igorsquest/",
    introGroup: "community",
  },
  clear: {
    id: "clear",
    label: "Clear Cards",
    introLabel: "clear cards",
    cards: getInitialCollectionCards("clear"),
    traitCategories: getBrowserTraitConfig("clear").categories,
    traitModule: getBrowserTraitConfig("clear").module,
    traits: null,
    traitFiltersEnabled: false,
    backImage: "assets/clear/backs/clear-card-back.webp?v=clear-5",
    showUnpairedBinderBacks: false,
    path: "/clear/",
    introGroup: "community",
  },
};
const COMMUNITY_COVER_COLLECTION_ORDER = [
  "cardnft1",
  "cardnft2",
  "poncho",
  "limited",
  "cloudcastle",
  "cloudcastles",
  "badhand",
  "badhand2",
  "jpegs",
  "clear",
  "nolegs",
  "mtgnft",
  "playcards",
  "kardmane",
  "winloop",
  "sweetcurse",
  "igorsquest",
];
const MIXED_COLLECTION_SORT_ORDER = new Map(
  COMMUNITY_COVER_COLLECTION_ORDER.map((collectionId, index) => [collectionId, index]),
);
let ACTIVE_COLLECTION_ID = REQUESTED_COLLECTION_ID;
let ACTIVE_COLLECTION = COLLECTION_CONFIGS[ACTIVE_COLLECTION_ID];
const EVIL_BINDER_TABLE_SIDE_COLLECTIONS = Object.freeze({
  cardnft1: ["cardnft2", "poncho"],
  cardnft2: ["cardnft1", "poncho"],
  poncho: ["cardnft1", "cardnft2"],
});
const CARDS = [];
let ACTIVE_COLLECTION_INDEXES = [];
const CARD_NFT_MINT_TO_INDEX = new Map();
const CARD_NUMBER_TO_INDEX = new Map();
const CARD_STABLE_ID_TO_INDEX = new Map();
let liveCardStatusSnapshot = null;
let liveCardStatusRefreshPromise = null;
let liveCardStatusLastFetchedAt = 0;
let liveCardStatusRefreshTimer = 0;
let globalTradeCardStableIds = new Set();
let globalTradeStatusRefreshPromise = null;
let globalTradeStatusLastFetchedAt = 0;
let globalTradeStatusRefreshTimer = 0;

function registerCollectionCards(collectionId, cards) {
  const collection = COLLECTION_CONFIGS[collectionId];
  if (!collection || collection.cardsLoaded || !Array.isArray(cards)) return collection?.cards || [];

  collection.cards = cards;
  collection.globalIndexes = [];
  cards.forEach((card, collectionIndex) => {
    card.collection = card.collection || collectionId;
    card.collectionIndex = collectionIndex;
    card.stableId = card.stableId || `${collectionId}:${card.mint || card.title || collectionIndex}`;
    card.setIndex = collectionIndex;
    card.listed = TENSOR_LISTED_CARD_IDS.has(card.stableId);
    card.listedMint = TENSOR_LISTED_CARD_MINTS.get(card.stableId) || "";

    const globalIndex = CARDS.length;
    CARDS.push(card);
    collection.globalIndexes.push(globalIndex);
    if (collectionId === ACTIVE_COLLECTION_ID) ACTIVE_COLLECTION_INDEXES.push(globalIndex);

    for (const mint of [card?.mint, ...(Array.isArray(card?.mints) ? card.mints : [])]) {
      const normalizedMint = String(mint || "").trim();
      if (normalizedMint) CARD_NFT_MINT_TO_INDEX.set(normalizedMint, globalIndex);
    }

    const titleMatch = String(card?.title || "").match(/^card\s+#?\s*(\d+)$/i);
    const number = Number.isInteger(card?.number)
      ? card.number
      : titleMatch
        ? Number.parseInt(titleMatch[1], 10)
        : null;
    if (Number.isInteger(number)) CARD_NUMBER_TO_INDEX.set(`${collectionId}:${number}`, globalIndex);

    const stableId = String(card?.stableId || "").trim();
    if (!stableId || stableId.length > 256 || CARD_STABLE_ID_TO_INDEX.has(stableId)) {
      throw new Error(`Invalid or duplicate card stable ID: ${stableId || "(empty)"}`);
    }
    CARD_STABLE_ID_TO_INDEX.set(stableId, globalIndex);
  });
  collection.cardsLoaded = true;
  applyLiveCardStatusCollection(collectionId);
  return collection.cards;
}

registerCollectionCards(ACTIVE_COLLECTION_ID, INITIAL_COLLECTION_CARDS);

async function ensureCollectionCards(collectionId) {
  const collection = COLLECTION_CONFIGS[collectionId];
  const spec = COLLECTION_DATA_SPECS[collectionId];
  if (!collection || !spec) return [];
  if (collection.cardsLoaded) return collection.cards;
  if (!collection.cardsPromise) {
    collection.cardsPromise = import(spec.module)
      .then((module) => {
        const cards = module[spec.exportName];
        if (!Array.isArray(cards)) throw new Error(`Invalid ${collectionId} card data`);
        return registerCollectionCards(collectionId, cards);
      })
      .catch((error) => {
        collection.cardsPromise = null;
        throw error;
      });
  }
  const cards = await collection.cardsPromise;
  migrateLegacyFavorites(favorites, cards);
  return cards;
}

async function ensureAllCollectionCards() {
  await Promise.all(Object.keys(COLLECTION_CONFIGS).map(ensureCollectionCards));
  return CARDS;
}

async function ensureFavoriteCollectionCards() {
  const collectionIds = new Set([ACTIVE_COLLECTION_ID]);
  for (const key of favorites) {
    const collectionId = String(key || "").split(":", 1)[0];
    if (COLLECTION_CONFIGS[collectionId]) collectionIds.add(collectionId);
  }
  await Promise.all([...collectionIds].map(ensureCollectionCards));
  return CARDS;
}

let ACTIVE_TRAIT_CATEGORIES = ACTIVE_COLLECTION.traitCategories;
let TRAIT_FILTERS_ENABLED = Boolean(ACTIVE_COLLECTION.traitFiltersEnabled);
const traitFiltersEnabledForCollection = (collectionId) => (
  Boolean(COLLECTION_CONFIGS[collectionId]?.traitFiltersEnabled)
);

async function ensureCollectionTraits(collectionId) {
  const collection = COLLECTION_CONFIGS[collectionId];
  if (!collection) return null;
  if (collection.traits) return collection.traits;
  if (!collection.traitModule || !collection.traitCategories.length) {
    collection.traits = { dictionary: [], rows: [] };
    return collection.traits;
  }
  if (!collection.traitsPromise) {
    collection.traitsPromise = import(collection.traitModule)
      .then((module) => {
        const dictionary = module.TRAIT_VALUE_DICTIONARY;
        const rows = module.TRAIT_ROWS;
        if (!Array.isArray(dictionary) || !Array.isArray(rows)) {
          throw new Error(`Invalid ${collectionId} trait data`);
        }
        const expectedRecords = getBrowserTraitConfig(collectionId).records;
        if (expectedRecords && rows.length !== expectedRecords) {
          throw new Error(`Unexpected ${collectionId} trait record count`);
        }
        collection.traits = { dictionary, rows };
        collection.traitSearchGroupsCache = null;
        collection.traitOccurrenceCountCache = null;
        return collection.traits;
      })
      .catch((error) => {
        collection.traitsPromise = null;
        collection.traitsError = error;
        throw error;
      });
  }
  return collection.traitsPromise;
}

let traitThumbnails = null;
let traitThumbnailsPromise = null;

async function ensureTraitThumbnails() {
  if (traitThumbnails) return traitThumbnails;
  if (!traitThumbnailsPromise) {
    traitThumbnailsPromise = import("./trait-thumbnails.js?v=browser-traits-1")
      .then((module) => {
        traitThumbnails = module.TRAIT_THUMBNAILS || {};
        return traitThumbnails;
      })
      .catch((error) => {
        console.warn("Trait thumbnails could not be loaded", error);
        traitThumbnails = {};
        return traitThumbnails;
      });
  }
  return traitThumbnailsPromise;
}

async function ensureTraitUiData(collectionId) {
  const [traits] = await Promise.all([
    ensureCollectionTraits(collectionId),
    ensureTraitThumbnails(),
  ]);
  return traits;
}
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
const CARD_EFFECT_MODE_DEFAULT = 0;
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
const CARD_NFT_2_COMMON_ID_SET = new Set(CARD_NFT_2_COMMON_IDS);
// IDs through 7008 are the rare/common release block; the shop's common list
// separates neutral commons from rares that receive the masked holo effects.
const CARD_NFT_2_RARE_CARD_ID_MAX = 7008;
const CARD_NFT_2_SUPER_RARE_RANGES = Object.freeze([
  Object.freeze([7009, 10999]),
  Object.freeze([11111, 11132]),
]);
const CARD_NFT_2_EFFECT_TEXTURE_BASE_URL = "https://cdn.lil.org/nft/card_nft_2";
const MEMORY_CONSTRAINED_DEVICE = (
  (Number(navigator.deviceMemory) > 0 && Number(navigator.deviceMemory) <= 4)
  || window.matchMedia?.("(max-width: 720px)")?.matches
);
const MEBIBYTE = 1024 * 1024;
const NFT_TEXTURE_CACHE_BUDGET_BYTES = (MEMORY_CONSTRAINED_DEVICE ? 64 : 144) * MEBIBYTE;
const BINDER_TEXTURE_CACHE_BUDGET_BYTES = (MEMORY_CONSTRAINED_DEVICE ? 72 : 144) * MEBIBYTE;
const CARD_EFFECT_TEXTURE_CACHE_BUDGET_BYTES = (MEMORY_CONSTRAINED_DEVICE ? 48 : 96) * MEBIBYTE;
const MAX_RENDER_BUFFER_PIXELS = MEMORY_CONSTRAINED_DEVICE ? 3_500_000 : 8_300_000;
const MAX_RENDERER_PIXEL_RATIO = 2;
const MAX_CARD_NFT_2_EFFECT_TEXTURE_CACHE_SIZE = MEMORY_CONSTRAINED_DEVICE ? 12 : 24;
const CARD_NFT_2_EFFECT_DEFAULT_POINTER_X = 0.18;
const CARD_NFT_2_EFFECT_DEFAULT_POINTER_Y = 0.78;
const CARD_NFT_2_EFFECT_POINTER_EXTENT = 0.72;
const CARD_NFT_2_EFFECT_EDGE_FADE_DISTANCE = 0.46;
const CARD_EFFECT_VIEW_TRANSITION_FADE_MS = 260;
const CARD_EFFECT_TEXTURE_FADE_MS = 180;
const SITE_FONT_STACK = "Optima, Candara, \"Lucida Sans\", \"Lucida Grande\", \"Trebuchet MS\", Arial, sans-serif";
const UI_BUTTON_TILT_SELECTOR = ".icon-button, .gallery-clear-filters-button";
const UI_BUTTON_TILT_HOVER_QUERY = "(hover: hover) and (pointer: fine)";
const UI_BUTTON_TILT_MAX_DEGREES = 5.5;
const SOLANA_RPC_URL = "https://api.mainnet-beta.solana.com";
const SOLANA_DAS_RPC_URL = "https://lauraine-qytyxk-fast-mainnet.helius-rpc.com";
const TENSOR_GRAPHQL_URL = "https://graphql.tensor.trade/graphql";
const PONCHO_COLLECTION_MINT = "JCTP3kK3xGtWs5mDHxJBuRro38HftaiCDdKsfkXuK2gH";
const CLEAR_CARD_COLLECTION_MINT = "3fYe95cviaHzka38Q82q64JLhhddKQm37Jt4dQSxPKxz";
const SWAG_PACK_COLLECTION_MINT = "C22esis7kQMbX9JGWsMaKvsh1X5GeBmHPju28jiKDyAP";
const SWAG_PACK_IMAGE_BUNDLE_PATH = "/_9RePBUya-xCV91FMTJU7lUpU87tkf4MtJTF4qpgE9k/";
const SWAG_PACK_TRANSPARENT_STICKER_FILE_SET = new Set(
  SWAG_PACK_TRANSPARENT_STICKER_FILES,
);
const SOLANA_TOKEN_PROGRAM_IDS = [
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
];
const CARD_NFT_COLLECTION_SYMBOLS = ["cardnft", "card_nft_2", "poncho_drifella"];
const CARD_NFT_2_WALLET_API_URL = "https://cardnft2.taile73682.ts.net/wallet";
const MAGIC_EDEN_API_URL = "https://api-mainnet.magiceden.dev/v2";
const FAVORITES_STORAGE_KEY = "cardnft:favorites:v1";
const MAGIC_EDEN_WALLET_PAGE_LIMIT = 500;
const MAGIC_EDEN_WALLET_MAX_TOKENS = 10000;
const MAGIC_EDEN_WALLET_PAGE_DELAY_MS = 520;
const DAS_WALLET_PAGE_LIMIT = 1000;
const DAS_WALLET_MAX_ASSETS = 10000;
let cardNftOwnerToIndexes = null;
let cardNftOwnerIndexPromise = null;
const WALLET_SEARCH_REQUEST_TIMEOUT_MS = 9000;
const LIVE_DATA_REQUEST_TIMEOUT_MS = 30000;
const LIVE_CARD_STATUS_REFRESH_MS = 12 * 60 * 60 * 1000;
const GLOBAL_TRADE_STATUS_REFRESH_MS = 60 * 1000;
const WALLET_HOLDINGS_AUTO_REFRESH_MS = 5 * 60 * 1000;
const WALLET_HOLDINGS_FOCUS_REFRESH_MS = 60 * 1000;
const SOLANA_ADDRESS_PATTERN = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const WALLET_SEARCH_PROMPT = "Enter a SOL address to view collected cards:";
const WALLET_SEARCH_EMPTY_MESSAGE = "Enter a valid Solana wallet address.";
const WALLET_SEARCH_BUSY_MESSAGE = "Checking wallet holdings...";
const WALLET_SEARCH_ERROR_MESSAGE = "Search failed, try again.";
const WALLET_CONNECT_PROMPT = "Connect a Solana wallet to create or open its binder.";
const WALLET_CONNECT_NO_EXTENSION_MESSAGE = "No compatible Solana wallet extension found.";
const WALLET_CONNECT_BUSY_MESSAGE = "Approve the connection and login message in your wallet...";
const WALLET_BINDER_DIRECTORY_PAGE_SIZE = 18;
const WALLET_BINDER_DIRECTORY_HOLDINGS_CONCURRENCY = 4;
const WALLET_BINDER_DIRECTORY_TRANSITION_MS = 430;
const WALLET_BINDER_DIRECTORY_COVER_MIN_LOADING_MS = 1050;
const WALLET_BINDER_DIRECTORY_TRANSITION_STORAGE_KEY = "cardnft:walletBinderDirectoryTransition:v1";
const WALLET_PUBLIC_API_BASE_URL = "https://api.cards.art/api";
const WALLET_TRADE_FILTER_VALUE = "marked-for-trade";
const LISTED_SORT_VALUE = "listed-first";
const COLLECTION_SORT_VALUE = "collection";
const GALLERY_SORT_QUERY_PARAM = "sort";
const GALLERY_COLLECTION_FILTER_QUERY_PARAM = "collection";
const GALLERY_TRAIT_CATEGORY_QUERY_PARAM = "trait";
const GALLERY_TRAIT_VALUE_QUERY_PARAM = "trait-value";
const GALLERY_TRAIT_COLLECTION_QUERY_PARAM = "trait-collection";
const WALLET_ROUTE_ADDRESS = getWalletAddressFromPathname(window.location.pathname);
const WALLET_AUTH_API_BASE_URL = getWalletAuthApiBaseUrl();
const WALLET_BINDER_DIRECTORY_ARRIVAL = readWalletBinderDirectoryArrival(WALLET_ROUTE_ADDRESS);

function usesEvilBinderPresentation() {
  return !WALLET_ROUTE_ADDRESS && ACTIVE_COLLECTION?.introGroup === "evil";
}

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
const CARD_HEIGHT = 3.5;
const CARD_DEPTH = 0.022;
const CARD_RADIUS = 0.12;
const INDIVIDUAL_CARD_WORLD_Y = 0.26;
const INDIVIDUAL_CARD_MODEL_SCALE = 0.985;
const INDIVIDUAL_CARD_CLEAR_RESIN_PROFILE = "mons-clear-resin";
const INDIVIDUAL_CARD_CLEAR_ENVIRONMENT_ROTATION_DEG = 121;
const INDIVIDUAL_CARD_DRACO_DECODER_PATH = new URL(
  "./vendor/draco/r165/",
  import.meta.url,
).href;
const BINDER_FACE_WIDTH = 420;
const BINDER_FACE_HEIGHT = 594;
const BINDER_COLUMNS = 3;
const BINDER_ROWS = 3;
const BINDER_SIDE_SLOTS = BINDER_COLUMNS * BINDER_ROWS;
const BINDER_PAGE_SLOTS = BINDER_SIDE_SLOTS * 2;
const BINDER_ORDER_DRAG_THRESHOLD_PX = 5;
const BINDER_ORDER_AUTO_SCROLL_EDGE_PX = 96;
const BINDER_ORDER_AUTO_SCROLL_OVERSHOOT_PX = 170;
const BINDER_ORDER_AUTO_SCROLL_MIN_PX_PER_SECOND = 110;
const BINDER_ORDER_AUTO_SCROLL_EDGE_PX_PER_SECOND = 820;
const BINDER_ORDER_AUTO_SCROLL_MAX_PX_PER_SECOND = 1800;
const BINDER_ORDER_AUTO_SCROLL_MAX_FRAME_MS = 34;
const BINDER_ORDER_TARGET_HYSTERESIS_PX = 12;
const BINDER_ORDER_FLIP_DURATION_MS = 170;
const BINDER_COVER_ARTWORK_MAX_FILE_BYTES = 16 * 1024 * 1024;
const BINDER_COVER_ARTWORK_MAX_DATA_URL_LENGTH = 1_350_000;
const BINDER_COVER_ARTWORK_MAX_WIDTH = 1400;
const BINDER_COVER_ARTWORK_MAX_HEIGHT = 1900;
const BINDER_COVER_INSIDE_TEXT_MAX_LENGTH = 2000;
const BINDER_COVER_STICKER_MAX_COUNT = 24;
const BINDER_COVER_UNDO_LIMIT = 50;
const BINDER_COVER_STICKER_DEFAULT_SCALE = 0.32;
const BINDER_COVER_STICKER_MIN_SCALE = 0.08;
const BINDER_COVER_STICKER_MAX_SCALE = 1.5;
const BINDER_COVER_ROTATION_MIN_DEGREES = -180;
const BINDER_COVER_ROTATION_MAX_DEGREES = 180;
const BINDER_COVER_STICKER_SURFACES = Object.freeze(["front", "back", "inside"]);
const BINDER_COVER_DEFAULT_COLOR_HEX = "#11100d";
const BINDER_COVER_DEFAULT_TEXT_COLOR_HEX = "#9c9992";
const BINDER_SINGLE_PAGE_COVER_SIDE = -1;
const BINDER_CARD_WIDTH = 1.38;
const BINDER_CARD_HEIGHT = BINDER_CARD_WIDTH * (CARD_HEIGHT / CARD_WIDTH);
const BINDER_CARD_RADIUS = BINDER_CARD_WIDTH * (CARD_RADIUS / CARD_WIDTH);
const BINDER_TRADE_STICKER_TEXTURE_URL = new URL(
  "./assets/ui/trade-sticker.png?v=binder-stickers-1",
  import.meta.url,
).href;
const BINDER_LISTED_STICKER_TEXTURE_URL = new URL(
  "./assets/ui/listed-sticker.png?v=binder-stickers-1",
  import.meta.url,
).href;
const BINDER_STICKER_RIGHT_EDGE = BINDER_CARD_WIDTH * 0.54;
const BINDER_STICKER_BOTTOM_EDGE = -BINDER_CARD_HEIGHT * 0.52;
const BINDER_STICKER_GAP = BINDER_CARD_WIDTH * 0.018;
const BINDER_STICKER_SIZES = Object.freeze({
  listed: Object.freeze([BINDER_CARD_WIDTH * 0.26, BINDER_CARD_WIDTH * 0.172]),
  trade: Object.freeze([BINDER_CARD_WIDTH * 0.225, BINDER_CARD_WIDTH * 0.225]),
});
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
const BINDER_GAP_REVEAL_STACK_GAP = BINDER_VISIBLE_STACK_GAP;
const BINDER_PAGE_COLUMN_BEND = 0.042;
const BINDER_ACTIVE_PAGE_LIFT = 0.22;
const BINDER_STACK_TRANSITION_START = 0.75;
const BINDER_VISIBLE_STACK_DEPTH = 1;
const BINDER_HIDDEN_STACK_DEPTH = 5;
const BINDER_DEEP_PAGE_FADE_POWER = 1.35;
const BINDER_COVER_OVERHANG = 0.14;
const BINDER_COVER_VERTICAL_OVERHANG = 0.22;
const BINDER_COVER_RADIUS = 0.15;
const BINDER_COVER_SPINE_WIDTH = 0.42;
const BINDER_COVER_SPINE_ARC_LENGTH = 0.72;
const BINDER_COVER_Z = -0.34;
const BINDER_COVER_OUTER_X = BINDER_PAGE_WIDTH + BINDER_COVER_OVERHANG * 1.42;
const BINDER_CLOSED_COVER_CENTER_X = (
  BINDER_COVER_OUTER_X + BINDER_COVER_SPINE_WIDTH / 2
) / 2;
const BINDER_CLOSED_COVER_CENTER_Z = (
  BINDER_COVER_Z + BINDER_COVER_SPINE_ARC_LENGTH / Math.PI
);
const BINDER_COVER_SPINE_SEGMENTS = 24;
const BINDER_COVER_THICKNESS = 0.09;
const BINDER_SPINE_SEAM_HEIGHT_RATIO = 0.9;
const BINDER_RING_SCALE_X = 0.52;
const BINDER_RING_VISIBLE_ARC = Math.PI;
const BINDER_TABLE_RING_DEPTH_SCALE = 0.68;
const BINDER_CLOSURE_BASE_ALPHA = 0.115;
const BINDER_CLOSURE_SETTLE_EPSILON = 0.0015;
const BINDER_CLOSING_COVER_RENDER_ORDER = 1400;
const BINDER_OUTER_FLIP_DURATION_MS = 780;
const BINDER_OUTER_FLIP_MIN_SETTLE_MS = 160;
const BINDER_OUTER_FLIP_LIFT = 0.3;
const BINDER_TABLE_OUTER_FLIP_LIFT = BINDER_CLOSED_COVER_CENTER_X + 0.08;
const BINDER_OUTER_FLIP_TILT = 0.065;
const BINDER_OUTER_FLIP_COMMIT_PROGRESS = 0.5;
const BINDER_TABLE_VIEW_DURATION_MS = 920;
const BINDER_TABLE_TO_FOCUS_DURATION_MS = 420;
const BINDER_TABLE_VIEW_TILT = -THREE.MathUtils.degToRad(42);
const BINDER_TABLE_VIEW_SCALE = 0.64;
const BINDER_TABLE_VIEW_Y = -0.12;
const BINDER_TABLE_VIEW_Z = 0.28;
const BINDER_TABLE_WIDTH = 13.8;
const BINDER_TABLE_HEIGHT = 7.8;
const BINDER_TABLE_DEPTH = 0.24;
const BINDER_TABLE_RADIUS = 0.42;
const BINDER_TABLE_SURFACE_TEXTURE_URL = new URL(
  "./assets/ui/table-wood-seamless.png?v=table-wood-1",
  import.meta.url,
).href;
const BINDER_TABLE_SURFACE_LIGHT_TEXTURE_URL = new URL(
  "./assets/ui/table-wood-light-seamless.png?v=table-wood-light-1",
  import.meta.url,
).href;
const BINDER_TABLE_SURFACE_REPEAT_X = 2.4;
const BINDER_TABLE_SURFACE_REPEAT_Y = 2.7;
const BINDER_TABLE_DISPLAY_MODEL_HEIGHT = 1.04;
const BINDER_TABLE_DISPLAY_MODEL_SPECS = Object.freeze([
  Object.freeze({
    id: "omom",
    url: new URL("./assets/models/table-white-mesh.glb?v=table-model-1", import.meta.url).href,
    materialProfile: "blue-resin",
  }),
  Object.freeze({
    id: "squishy",
    url: new URL("./assets/models/table-display/squishy.glb?v=table-display-1", import.meta.url).href,
    materialProfile: "embedded",
    yawOffset: Math.PI / 2 - THREE.MathUtils.degToRad(35),
  }),
  Object.freeze({
    id: "angelgotchi",
    url: new URL("./assets/models/table-display/angelgotchi.glb?v=table-display-1", import.meta.url).href,
    materialProfile: "embedded",
    pitchOffset: -Math.PI / 2,
    scaleMultiplier: 1.24,
    positionYOffset: -0.14,
  }),
]);
const BINDER_TABLE_DISPLAY_MODEL_X = -3.1;
const BINDER_TABLE_DISPLAY_MODEL_Y = 2.78;
const BINDER_TABLE_DISPLAY_MODEL_YAW = THREE.MathUtils.degToRad(28);
const BINDER_TABLE_DISPLAY_MODEL_MAX_OPACITY = 0.76;
const BINDER_TABLE_DISPLAY_MODEL_REVEAL_DURATION_MS = 360;
const BINDER_TABLE_COIN_TEXTURE_URL = new URL(
  "./assets/ui/table-swag-coin.png?v=table-coin-1",
  import.meta.url,
).href;
const BINDER_TABLE_COIN_RADIUS = 0.45;
const BINDER_TABLE_COIN_THICKNESS = 0.063;
const BINDER_TABLE_COIN_X = -4.88;
const BINDER_TABLE_COIN_Y = 2.43;
const BINDER_TABLE_COIN_ROTATION = THREE.MathUtils.degToRad(-217);
const BINDER_TABLE_DIE_SIZE = 0.36;
const BINDER_TABLE_DIE_POSITIONS = Object.freeze([
  Object.freeze([2.22, 2.5]),
  Object.freeze([3.02, 2.42]),
]);
const BINDER_TABLE_DIE_TOSS_DURATION_MS = 920;
const BINDER_TABLE_DIE_TOSS_HEIGHT = 1.55;
const BINDER_TABLE_ACCESSORY_REVEAL_DURATION_MS = 320;
const BINDER_TABLE_ACCESSORY_SHADOW_OPACITY = 0.11;
const BINDER_TABLE_Y = 0.62;
const BINDER_TABLE_Z = -1.45;
const BINDER_COVER_BASE_COLOR = new THREE.Color(0x11100d);
const BINDER_COVER_TABLE_COLOR = new THREE.Color(0x716958);
const BINDER_COVER_BASE_EMISSIVE = new THREE.Color(0x040302);
const BINDER_COVER_TABLE_EMISSIVE = new THREE.Color(0x252019);
const binderCoverCustomBaseColor = new THREE.Color(BINDER_COVER_BASE_COLOR);
const binderCoverCustomTableColor = new THREE.Color(BINDER_COVER_TABLE_COLOR);
const binderCoverCustomBaseEmissive = new THREE.Color(BINDER_COVER_BASE_EMISSIVE);
const binderCoverCustomTableEmissive = new THREE.Color(BINDER_COVER_TABLE_EMISSIVE);
let binderCoverColorPaletteSource = "";
const BINDER_COVER_BASE_EMISSIVE_INTENSITY = 0.28;
const BINDER_COVER_TABLE_EMISSIVE_INTENSITY = 1.05;
const BINDER_TABLE_COVER_RENDER_ORDER = 12;
const BINDER_FRONT_COVER_EMBLEM_DEFAULT_ASSET = "assets/ui/crucidrifella-statue-cover.webp?v=crucidrifella-cover-1";
const BINDER_FRONT_COVER_EMBLEM_DEFAULT_ASPECT = 1142 / 1500;
const BINDER_FRONT_COVER_EMBLEM_HEIGHT_RATIO = 0.74;
const BINDER_FRONT_COVER_EMBLEM_Y_RATIO = -0.035;
const BINDER_FRONT_COVER_EMBLEM_VISIBLE_PROGRESS = 0.52;
const BINDER_EVIL_TABLE_SIDE_X = 6.45;
const BINDER_EVIL_TABLE_SIDE_SCALE = 0.82;
const BINDER_EVIL_TABLE_SIDE_Z = 0;
const BINDER_EVIL_TABLE_SIDE_FADE_START = 0.14;
const BINDER_EVIL_TABLE_SIDE_FADE_END = 0.78;
const BINDER_EVIL_TABLE_SWAP_DURATION_MS = 940;
const BINDER_EVIL_TABLE_SWAP_ACTIVE_LIFT = 0.64;
const BINDER_EVIL_TABLE_SWAP_SELECTED_LIFT = 1.72;
const BINDER_EVIL_TABLE_SWAP_PATH_BEND = 0.82;
const BINDER_EVIL_TABLE_SWAP_STORAGE_KEY = "cardnft:evilBinderTableSwap:v1";
const BINDER_EVIL_TABLE_SWAP_ARRIVAL_MAX_AGE_MS = 15_000;
const BINDER_PLASTIC_REST_OPACITY = 0.066;
const BINDER_PLASTIC_ACTIVE_OPACITY = 0.13;
const CLEAR_BINDER_PAGE_COLOR = 0x111315;
const CLEAR_BINDER_PAGE_OPACITY = 0.84;
const CLEAR_BINDER_POCKET_OPACITY = 1;
const CLEAR_BINDER_COVERED_STICKER_OPACITY = 1 - CLEAR_BINDER_PAGE_OPACITY;
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
const BINDER_TEXTURE_CONCURRENCY = MEMORY_CONSTRAINED_DEVICE ? 4 : 6;
const BINDER_TEXTURE_URGENT_PRIORITY = 0;
const BINDER_TEXTURE_TARGET_PRIORITY = -8;
const BINDER_TEXTURE_URGENT_RESERVE = 2;
const BINDER_TEXTURE_APPLY_IDLE_BUDGET = 2;
const BINDER_TEXTURE_APPLY_BATCH_DELAY_MS = 34;
const BINDER_TEXTURE_APPLY_DEFER_MS = 120;
const BINDER_TEXTURE_MAX_RETRIES = 3;
const BINDER_TEXTURE_RETRY_BASE_MS = 900;
const BINDER_TEXTURE_RETRY_MAX_MS = 12_000;
const BINDER_SHUFFLE_PRELOAD_CONCURRENCY = 6;
const BINDER_ANIMATED_PRELOAD_PAGE_RADIUS = 1;
const BINDER_PAGE_WINDOW_RADIUS = MEMORY_CONSTRAINED_DEVICE ? 2 : 4;
const BINDER_PAGE_WINDOW_RECENTER_THRESHOLD = MEMORY_CONSTRAINED_DEVICE ? 1 : 3;
const BINDER_PRELOAD_PAGE_RADIUS = MEMORY_CONSTRAINED_DEVICE ? 1 : 2;
const BINDER_INITIAL_PRELOAD_IDLE_DELAY_MS = 180;
const BINDER_TEXTURE_FRAME_WIDTH = MEMORY_CONSTRAINED_DEVICE ? 180 : 260;
const BINDER_CARD_LOAD_FADE_MS = 280;
const BINDER_CARD_PLACEHOLDER_OPACITY = 0.24;
const BINDER_LOADING_RING_RADIUS = BINDER_CARD_WIDTH * 0.085;
const BINDER_LOADING_RING_THICKNESS = BINDER_CARD_WIDTH * 0.012;
const BINDER_LOADING_RING_SPEED = Math.PI * 0.00115;
const BINDER_LOADING_RING_IDLE_MS = 42;
const BINDER_INTRO_LINK_URL = "https://x.com/bis__cut";
const BINDER_INTRO_LINK_UNDERLINE_ALPHA = 0.5;
const BINDER_INTRO_LINK_UNDERLINE_MIN_HEIGHT = 3;
const BINDER_INTRO_LINK_UNDERLINE_HEIGHT_RATIO = 0.08;
const BINDER_INTRO_NOTE_FILTER_FADE_MS = 260;
const BINDER_INTRO_FOCUS_MARGIN_RATIO = 0.12;
const BINDER_INTRO_FOCUS_MOBILE_MARGIN_RATIO = 0.04;
const BINDER_INTRO_FOCUS_EXTRA_Z = 0.08;
const BINDER_CARD_VIEW_TRANSITION_MS = 820;
const INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD = 1240;
const BINDER_TO_TABLE_WHEEL_THRESHOLD = INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD;
const BINDER_TO_INDIVIDUAL_WHEEL_THRESHOLD = 540;
const VIEW_SWITCH_WHEEL_IDLE_MS = 900;
const VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS = 360;
const PINCH_WHEEL_DELTA_SCALE = 1120;
const PINCH_MIN_DISTANCE_PX = 28;
const PINCH_DELTA_EPSILON = 0.004;
const BINDER_FOCUS_SWIPE_MIN_DISTANCE = 46;
const BINDER_FOCUS_SWIPE_MAX_OFF_AXIS_RATIO = 0.86;
const DOUBLE_TAP_ZOOM_SUPPRESSION_MS = 320;
const BINDER_FOCUS_ZOOM_OUT_LOCK_MS = VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
const BINDER_FOCUS_TRANSITION_LOCK_MS = BINDER_CARD_VIEW_TRANSITION_MS + BINDER_FOCUS_ZOOM_OUT_LOCK_MS;
const INDIVIDUAL_MAX_ZOOM_EPSILON = 0.035;
const CARD_CAMERA_DEFAULT_Z = 9.55;
const CARD_CAMERA_MIN_Z = 4.55;
const CARD_CAMERA_MAX_Z = 14.05;
const CARD_PAN_CLIP_TOLERANCE_PX = 1;
const CARD_PAN_VISIBLE_MARGIN = 0.48;
const INDIVIDUAL_CARD_HOVER_TILT_MAX_X_DEG = 12.5;
const INDIVIDUAL_CARD_HOVER_TILT_MAX_Y_DEG = 15.5;
const INDIVIDUAL_CARD_HOVER_TILT_SPRING = 0.14;
const INDIVIDUAL_CARD_HOVER_TILT_DAMPING = 0.76;
const CARD_MOBILE_SCALE_MIN = 0.88;
const CARD_MOBILE_SCALE_FULL_WIDTH = 700;
const CARD_MOBILE_SCALE_MIN_WIDTH = 340;
const CARD_DEFAULT_HORIZONTAL_MARGIN_PX = 14;
const CARD_SWAP_DISTANCE = CARD_WIDTH * 1.12;
const CARD_SWAP_MIN_OPACITY = 0;
const CARD_SWAP_MS = 285;
const CARD_SWAP_LOADING_DELAY_MS = 300;
const BINDER_OPEN_CARD_LOADING_DELAY_MS = CARD_SWAP_LOADING_DELAY_MS;
const CARD_SHUFFLE_LOADING_DELAY_MS = CARD_SWAP_LOADING_DELAY_MS;
const CARD_SHUFFLE_SPIN_MS = 520;
const CARD_SHUFFLE_SPIN_DIRECTION = -1;
const CARD_SHUFFLE_GLOSS_FADE_IN_START = 0.08;
const CARD_SHUFFLE_GLOSS_FADE_IN_END = 0.22;
const CARD_SHUFFLE_GLOSS_FADE_START = 0.62;
const CARD_SHUFFLE_GLOSS_FADE_END = 0.94;
const MAX_WARMED_INDIVIDUAL_CARD_EFFECTS = 16;
const MAX_PREPARED_INDIVIDUAL_CARDS = 18;
const INDIVIDUAL_CARD_PREWARM_RADIUS = 2;
const INDIVIDUAL_CARD_PREWARM_STEP_DELAY_MS = 90;
const INDIVIDUAL_BINDER_SPREAD_PREWARM_IDLE_TIMEOUT_MS = 900;
const INDIVIDUAL_BINDER_SPREAD_PREWARM_FALLBACK_DELAY_MS = 180;
const INDIVIDUAL_BINDER_SPREAD_PREWARM_CONCURRENCY = MEMORY_CONSTRAINED_DEVICE ? 1 : 2;
const FOCUSED_BINDER_CARD_PREWARM_DELAY_MS = 0;
const FOCUSED_BINDER_FULLY_VISIBLE_EDGE_TOLERANCE_PX = 2;
const GALLERY_PRIORITY_ROWS = 4;
const GALLERY_INITIAL_RENDER_MIN = 36;
const GALLERY_RENDER_BATCH_SIZE = 72;
const GALLERY_RENDER_IDLE_TIMEOUT_MS = 120;
const GALLERY_RENDER_FALLBACK_DELAY_MS = 32;
const GALLERY_RENDER_PREFETCH_MARGIN_PX = 1200;
const GALLERY_CARD_HOVER_EXPAND_PX = 5;
const GALLERY_CARD_TILT_MAX_X_DEG = 12.5;
const GALLERY_CARD_TILT_MAX_Y_DEG = 15.5;
const GALLERY_CARD_TILT_SPRING = 0.14;
const GALLERY_CARD_TILT_DAMPING = 0.76;
const GALLERY_CARD_TILT_SETTLE_EPSILON = 0.02;
const TRAIT_SEARCH_TILE_RENDER_BATCH_SIZE = 80;
const SCREENSAVER_HOLD_MS = 2000;
const SCREENSAVER_HOLD_MOVE_LIMIT = 14;
const SCREENSAVER_PREWARM_DELAY_MS = 220;
const SCREENSAVER_EXIT_BUFFER_MS = 2000;
const SCREENSAVER_FADE_MS = 520;
const SCREENSAVER_CONTEXT_MENU_SUPPRESSION_MS = 1200;
const SCREENSAVER_INITIAL_CARD_COUNT = MEMORY_CONSTRAINED_DEVICE ? 4 : 7;
const SCREENSAVER_MAX_CARD_COUNT = MEMORY_CONSTRAINED_DEVICE ? 22 : 34;
const SCREENSAVER_PREWARM_CARD_COUNT = MEMORY_CONSTRAINED_DEVICE ? 7 : 12;
const SCREENSAVER_READY_CARD_COUNT = MEMORY_CONSTRAINED_DEVICE ? 8 : 16;
const SCREENSAVER_PREPARE_CONCURRENCY = MEMORY_CONSTRAINED_DEVICE ? 1 : 2;
const SCREENSAVER_ACTIVE_PREPARE_CONCURRENCY = 1;
const SCREENSAVER_PREPARE_IDLE_TIMEOUT_MS = 900;
const SCREENSAVER_WARMUP_TARGET_SIZE = 8;
const SCREENSAVER_SPAWN_INTERVAL_MS = MEMORY_CONSTRAINED_DEVICE ? 540 : 380;
const SCREENSAVER_SPAWN_INTERVAL_JITTER = 0.16;
const SCREENSAVER_SPAWN_RETRY_MS = 120;
const SCREENSAVER_OFFSCREEN_LEAD_SECONDS = 0.48;
const SCREENSAVER_DEPTH_MIN = -3.8;
const SCREENSAVER_DEPTH_MAX = 3.8;
const SCREENSAVER_DEPTH_LAYER_COUNT = 4;
const SCREENSAVER_DEPTH_JITTER = 0.24;
const SCREENSAVER_FALL_SPEED_JITTER = 0.04;
const SCREENSAVER_SPAWN_SPACING_HISTORY = 4;
const SCREENSAVER_SPAWN_POSITION_CANDIDATES = 40;
const SCREENSAVER_SPAWN_TRAJECTORY_SAMPLE_COUNT = 7;
const SCREENSAVER_SPAWN_TRAJECTORY_SAMPLE_STEP_SECONDS = 1.4;
const SCREENSAVER_SPAWN_SCORE_RANDOMNESS = 0.14;
const SCREENSAVER_SPAWN_MAX_OVERLAP = 0.18;
const SCREENSAVER_HORIZONTAL_CENTER_LIMIT = 0.5;
const SCREENSAVER_NORMALIZED_FALL_SPEED = 0.115;
const SCREENSAVER_FRONT_FACING_PROBABILITY = 0.88;
const SCREENSAVER_EVIL_COLLECTION_SPAWN_WEIGHTS = Object.freeze({
  cardnft1: 3,
  cardnft2: 3,
  poncho: 2,
});
const SCREENSAVER_CARDNFT1_ANIMATED_SPAWN_CHANCE = 0.06;
const SCREENSAVER_POINTER_ACTIVE_MS = 260;
const SCREENSAVER_POINTER_MIN_SPEED_PX_S = 20;
const SCREENSAVER_POINTER_MAX_SPEED_PX_S = 2400;
const SCREENSAVER_POINTER_FORCE = 3.75;
const SCREENSAVER_POINTER_ROTATION_FORCE = 30;
const SCREENSAVER_POINTER_CORE_RADIUS_MIN = 138;
const SCREENSAVER_POINTER_CORE_RADIUS_MAX = 330;
const SCREENSAVER_POINTER_AMBIENT_RADIUS_MIN = 430;
const SCREENSAVER_POINTER_AMBIENT_RADIUS_MAX = 1100;
const SCREENSAVER_POINTER_AMBIENT_VIEWPORT_RATIO = 0.64;
const SCREENSAVER_POINTER_AMBIENT_STRENGTH = 0.23;
const SCREENSAVER_POINTER_WAKE_DURATION_MS = 680;
const SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY = 6;
const SCREENSAVER_POINTER_WAKE_SAMPLE_SPACING_PX = 72;
const SCREENSAVER_POINTER_WAKE_MAX_INTERPOLATED_SAMPLES = 3;
const SCREENSAVER_POINTER_WAKE_FORCE_SCALE = 0.18;
const SCREENSAVER_POINTER_WAKE_RADIUS_SCALE = 1.08;
const SCREENSAVER_POINTER_SELECTION_GRACE_MS = 900;
const SCREENSAVER_POINTER_LINEAR_SPRING = 2.15;
const SCREENSAVER_POINTER_LINEAR_DAMPING = 2.85;
const SCREENSAVER_POINTER_ROTATION_SPRING = 2.5;
const SCREENSAVER_POINTER_ROTATION_DAMPING = 3.1;
const SCREENSAVER_POINTER_MAX_OFFSET_RATIO = 0.33;
const SCREENSAVER_POINTER_MAX_VELOCITY_RATIO = 0.76;
const SCREENSAVER_POINTER_MAX_ANGULAR_VELOCITY = 6;
const SCREENSAVER_POINTER_HOVER_RAYCAST_INTERVAL_MS = 50;
const SCREENSAVER_POINTER_CLICK_HALF_DIAGONAL_SCALE = 0.66;
const SCREENSAVER_COLLISION_RADIUS_FACTOR = 0.46;
const SCREENSAVER_COLLISION_ACTIVATION_OVERSCAN = 3.2;
const SCREENSAVER_COLLISION_CARD_DIAGONAL = Math.hypot(CARD_WIDTH, CARD_HEIGHT);
const SCREENSAVER_CAMERA_FOV = 36;
const SCREENSAVER_CAMERA_Z = 13;
const SCREENSAVER_EFFECT_OVERSCAN_CARD_HEIGHTS = 1;
const SCREENSAVER_PREPARE_POINTER_COOLDOWN_MS = 420;
const SCREENSAVER_PREPARE_ACTIVATION_GRACE_MS = 900;
const SCREENSAVER_PREPARE_MIN_IDLE_BUDGET_MS = 8;
const SCREENSAVER_MAX_MOTION_DELTA_SECONDS = 1 / 60;
const SCREENSAVER_DIAGNOSTIC_INTERVAL_MS = 1000;
const SCREENSAVER_FRAME_SAMPLE_SIZE = 120;
const SCREENSAVER_LONG_FRAME_MS = 24;
const SCREENSAVER_DIAGNOSTICS_ENABLED = (
  new URLSearchParams(window.location.search).has("perf")
);
const BINDER_FIRST_PAGE_HOLD_MS = 1500;
const BINDER_FIRST_PAGE_HOLD_SUPPRESS_MS = 1000;
const BINDER_FIRST_PAGE_HOLD_MOVE_LIMIT = 14;
const BINDER_DOUBLE_TAP_MS = 420;
const BINDER_DOUBLE_TAP_DISTANCE = 28;
const SHUFFLE_HISTORY_LIMIT = 10;
const MAX_TEXTURE_CACHE_SIZE = MEMORY_CONSTRAINED_DEVICE ? 32 : 72;
const BINDER_ANIMATED_IDLE_MS = 84;
const BINDER_INTERACTION_ACTIVE_MS = 900;
const BINDER_FRAME_MS = 1000 / 60;
const BINDER_MAX_FRAME_DELTA_MS = 34;
const BINDER_TURN_BASE_ALPHA = 0.16;
const BINDER_CAMERA_BASE_ALPHA = 0.1;
const BINDER_FOCUS_CAMERA_BASE_ALPHA = 0.12;
let SESSION_VIEW_STATE_KEY = WALLET_ROUTE_ADDRESS
  ? `cardnft:wallet:${WALLET_ROUTE_ADDRESS}:sessionView:v1`
  : `cardnft:${ACTIVE_COLLECTION_ID}:sessionView:v1`;
const TENSOR_ITEM_URL_BASE = "https://www.tensor.trade/item/";
const SOLSCAN_TOKEN_URL_BASE = "https://solscan.io/token/";
const restoredEvilBinderTableSwap = consumeEvilBinderTableSwapArrival();
const restoredSessionViewState = WALLET_ROUTE_ADDRESS ? null : loadSessionViewState();

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
  binderTableViewButton: document.querySelector("#binderTableViewButton"),
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
  traitSearchFilter: document.querySelector(".trait-search-filter"),
  traitSearchInput: document.querySelector("#traitSearchInput"),
  traitSearchGroups: document.querySelector("#traitSearchGroups"),
  traitSearchSidebar: document.querySelector("#traitSearchSidebar"),
  galleryClearFiltersButton: document.querySelector("#galleryClearFiltersButton"),
  favoriteFilterButton: document.querySelector("#favoriteFilterButton"),
  galleryViewToggleButton: document.querySelector("#galleryViewToggleButton"),
  walletSearchButton: document.querySelector("#walletSearchButton"),
  walletSearchPanel: document.querySelector("#walletSearchPanel"),
  walletSearchForm: document.querySelector("#walletSearchForm"),
  walletBinderDirectoryButton: document.querySelector("#walletBinderDirectoryButton"),
  walletBinderDirectoryButtonCount: document.querySelector("#walletBinderDirectoryButtonCount"),
  walletBinderDirectory: document.querySelector("#walletBinderDirectory"),
  walletBinderDirectoryBackButton: document.querySelector("#walletBinderDirectoryBackButton"),
  walletBinderDirectoryCount: document.querySelector("#walletBinderDirectoryCount"),
  walletBinderDirectoryGallery: document.querySelector("#walletBinderDirectoryGallery"),
  walletBinderDirectoryStatus: document.querySelector("#walletBinderDirectoryStatus"),
  walletConnectButton: document.querySelector("#walletConnectButton"),
  walletConnectButtonLabel: document.querySelector("#walletConnectButtonLabel"),
  walletProviderList: document.querySelector("#walletProviderList"),
  walletConnectStatus: document.querySelector("#walletConnectStatus"),
  walletSignOutButton: document.querySelector("#walletSignOutButton"),
  walletSearchMessage: document.querySelector("#walletSearchMessage"),
  walletAddressInput: document.querySelector("#walletAddressInput"),
  walletSearchSubmitButton: document.querySelector("#walletSearchSubmitButton"),
  binderOrderEditButton: document.querySelector("#binderOrderEditButton"),
  binderOrderEditor: document.querySelector("#binderOrderEditor"),
  binderOrderDialog: document.querySelector("#binderOrderDialog"),
  binderOrderCloseButton: document.querySelector("#binderOrderCloseButton"),
  binderOrderScroller: document.querySelector("#binderOrderScroller"),
  binderOrderPages: document.querySelector("#binderOrderPages"),
  binderOrderStatus: document.querySelector("#binderOrderStatus"),
  binderOrderConfirmButton: document.querySelector("#binderOrderConfirmButton"),
  binderTradeModeButton: document.querySelector("#binderTradeModeButton"),
  binderOrderInstructions: document.querySelector("#binderOrderInstructions"),
  binderOrderTitle: document.querySelector("#binderOrderTitle"),
  binderCoverModeButton: document.querySelector("#binderCoverModeButton"),
  binderCoverEditor: document.querySelector("#binderCoverEditor"),
  binderFrontCoverPreview: document.querySelector("#binderFrontCoverPreview"),
  binderFrontCoverImage: document.querySelector("#binderFrontCoverImage"),
  binderFrontCoverBlank: document.querySelector("#binderFrontCoverBlank"),
  binderFrontCoverUpload: document.querySelector("#binderFrontCoverUpload"),
  binderFrontCoverRemove: document.querySelector("#binderFrontCoverRemove"),
  binderFrontCoverZoom: document.querySelector("#binderFrontCoverZoom"),
  binderFrontCoverRotation: document.querySelector("#binderFrontCoverRotation"),
  binderFrontTextBox: document.querySelector("#binderFrontTextBox"),
  binderFrontTextPreview: document.querySelector("#binderFrontTextPreview"),
  binderFrontTextControls: document.querySelector("#binderFrontTextControls"),
  binderFrontTextInput: document.querySelector("#binderFrontTextInput"),
  binderFrontTextFontSize: document.querySelector("#binderFrontTextFontSize"),
  binderFrontTextRotation: document.querySelector("#binderFrontTextRotation"),
  binderFrontTextColor: document.querySelector("#binderFrontTextColor"),
  binderFrontTextRemove: document.querySelector("#binderFrontTextRemove"),
  binderBackCoverPreview: document.querySelector("#binderBackCoverPreview"),
  binderBackCoverImage: document.querySelector("#binderBackCoverImage"),
  binderBackCoverBlank: document.querySelector("#binderBackCoverBlank"),
  binderBackCoverUpload: document.querySelector("#binderBackCoverUpload"),
  binderBackCoverRemove: document.querySelector("#binderBackCoverRemove"),
  binderBackCoverZoom: document.querySelector("#binderBackCoverZoom"),
  binderBackCoverRotation: document.querySelector("#binderBackCoverRotation"),
  binderBackTextBox: document.querySelector("#binderBackTextBox"),
  binderBackTextPreview: document.querySelector("#binderBackTextPreview"),
  binderBackTextControls: document.querySelector("#binderBackTextControls"),
  binderBackTextInput: document.querySelector("#binderBackTextInput"),
  binderBackTextFontSize: document.querySelector("#binderBackTextFontSize"),
  binderBackTextRotation: document.querySelector("#binderBackTextRotation"),
  binderBackTextColor: document.querySelector("#binderBackTextColor"),
  binderBackTextRemove: document.querySelector("#binderBackTextRemove"),
  binderInsideCoverPreview: document.querySelector("#binderInsideCoverPreview"),
  binderInsideTextBox: document.querySelector("#binderInsideTextBox"),
  binderInsideTextPreview: document.querySelector("#binderInsideTextPreview"),
  binderInsideCoverBlank: document.querySelector("#binderInsideCoverBlank"),
  binderInsideFontSize: document.querySelector("#binderInsideFontSize"),
  binderInsideTextRotation: document.querySelector("#binderInsideTextRotation"),
  binderInsideTextInput: document.querySelector("#binderInsideTextInput"),
  binderInsideLinkPopover: document.querySelector("#binderInsideLinkPopover"),
  binderInsideLinkUrl: document.querySelector("#binderInsideLinkUrl"),
  binderInsideLinkApply: document.querySelector("#binderInsideLinkApply"),
  binderInsideLinkRemove: document.querySelector("#binderInsideLinkRemove"),
  binderBaseColor: document.querySelector("#binderBaseColor"),
  binderCoverTextColor: document.querySelector("#binderCoverTextColor"),
  binderCoverStickerControls: [...document.querySelectorAll(".binder-cover-sticker-controls")],
  binderStickerPicker: document.querySelector("#binderStickerPicker"),
  binderStickerPickerClose: document.querySelector("#binderStickerPickerClose"),
  binderStickerPickerTitle: document.querySelector("#binderStickerPickerTitle"),
  binderStickerPickerStatus: document.querySelector("#binderStickerPickerStatus"),
  binderStickerPickerGallery: document.querySelector("#binderStickerPickerGallery"),
  themeToggle: document.querySelector("#themeToggle"),
  galleryEmpty: document.querySelector("#galleryEmpty"),
};

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin("anonymous");
const nftTextureCache = new Map();
const binderTextureCache = new Map();
const binderStickerTextures = new Map();
const cardNft2EffectTextureCache = new Map();
const preparedIndividualCardPromises = new Map();
const preparedIndividualCardResults = new Map();
const warmedIndividualCardEffectKeys = new Set();
const warmedIndividualCardEffectQueue = [];
const animatedTextureRecords = new Set();
const favorites = loadSet(FAVORITES_STORAGE_KEY);
migrateLegacyFavorites(favorites);
window.addEventListener("storage", (event) => {
  syncFavoritesFromStorage(event).catch(console.error);
});
const shuffleHistory = [];
const binderShuffleHistory = [];

let activeUiButtonTiltTarget = null;
let currentIndex = 0;
let galleryOpen = false;
let favoritesOnly = false;
let traitSortCategory = "all";
let activeCollectionFilter = "";
let activeTraitFilter = null;
let traitSearchOpen = false;
let traitSearchQuery = "";
let traitSearchCollectionId = "";
const traitSearchCollapsedCategories = new Set();
const traitSearchGroupDataByKey = new Map();
let traitSearchRenderToken = 0;
let traitSearchRenderFrame = 0;
let traitSearchQueryFrame = 0;
let traitSearchRenderObserver = null;
const traitSearchRenderStates = new Map();
let traitSortPickerOpen = false;
let traitSortPickerOpenedAt = 0;
let traitSortPickerSyncFrame = 0;
let galleryUrlNavigationToken = 0;
let activeGalleryTiltCard = null;
let galleryTiltFrame = 0;
let galleryRenderToken = 0;
let galleryRenderIdleCallback = 0;
let galleryRenderTimer = 0;
let galleryRenderObserver = null;
let galleryRenderSentinel = null;
const galleryTiltStates = new Map();
let sessionViewSaveFrame = 0;
let lastTouchEndAt = 0;
let walletSearchOpen = false;
let walletSearchLoading = false;
let walletSearchToken = 0;
let walletBinderDirectoryOpen = false;
let walletBinderDirectoryLoading = false;
let walletBinderDirectoryToken = 0;
let walletBinderDirectoryNextCursor = null;
let walletBinderDirectoryTotal = null;
let walletBinderDirectoryEntries = [];
let walletBinderDirectoryUnverifiedCount = 0;
const walletBinderDirectoryCardCountCache = new Map();
let walletBinderDirectoryTransitioning = false;
let walletBinderDirectoryCoverObserver = null;
let walletBinderDirectoryArrivalBridge = null;
let walletAuthLoading = false;
let walletAuthSession = null;
let walletAuthWallet = null;
let walletAuthAccountAddress = "";
let compatibleSolanaWallets = [];
let walletProviderListOpen = false;
let walletConnectMessage = WALLET_CONNECT_PROMPT;
let walletRegistryUnsubscribe = null;
let walletAccountUnsubscribe = null;
let walletRouteLoading = false;
let walletRouteLoadFailed = false;
let walletRouteLoadErrorMessage = "";
let walletRouteProfile = null;
let walletHoldingsRefreshTimer = 0;
let walletHoldingsRefreshPromise = null;
let walletHoldingsLastFetchedAt = 0;
let walletFilterCardIndexes = null;
let walletFilterCardIndexSet = null;
let walletFilterAddress = "";
let walletMatchedMintByCardIndex = new Map();
let walletTradeCardStableIds = new Set();
let binderOrderEditorOpen = false;
let binderOrderEditorLoading = false;
let binderOrderEditorSaving = false;
let binderOrderEditorToken = 0;
let binderOrderOwnerDocument = null;
let binderOrderDraftIndexes = [];
let binderOrderInitialStableIds = [];
let binderTradeMarkingMode = false;
let binderTradeDraftStableIds = new Set();
let binderTradeInitialStableIds = new Set();
let binderOrderReturnFocus = null;
let binderOrderDrag = null;
let binderOrderDragFrame = 0;
const binderOrderCardNodes = new Map();
let binderOrderKeyboardStableId = "";
let binderOrderPositionEdit = null;
let binderOrderSuppressClickUntil = 0;
let binderCustomizationMode = "cards";
let binderCoverDraft = null;
let binderCoverInitialJson = "";
let binderCoverInteraction = null;
let binderCoverUndoStack = [];
let binderCoverUndoCoalesceKey = "";
const binderOutsideTextBoxEnabled = { front: false, back: false };
let binderCoverPreviewResizeObserver = null;
let binderInsideLinkSelection = null;
let binderInsideTextPointerSelection = null;
let binderInsideTextPointerClickHandled = false;
let binderCoverSelectedStickerMint = "";
let binderStickerPickerOpen = false;
let binderStickerPickerSurface = "front";
let binderStickerPickerLoading = false;
let binderStickerPickerToken = 0;
let walletSwagPackAssets = [];
let walletSwagPackAssetsFetchedAt = 0;
let binderWalletCoverArtworkTexture = null;
let binderWalletCoverArtworkToken = 0;
let binderWalletCoverArtworkPromise = null;
let binderWalletCoverArtworkSource = "";
let binderWalletBackCoverArtworkTexture = null;
let binderWalletBackCoverArtworkPromise = null;
let binderWalletBackCoverArtworkSource = "";
let isBinderMode = typeof restoredSessionViewState?.isBinderMode === "boolean"
  ? restoredSessionViewState.isBinderMode
  : true;
let cardRenderer;
let cardScene;
let cardCamera;
let cardAnimationFrame = 0;
let cardContextLost = false;
let individualCardAssetsDeferred = false;
let cardGroup;
let cardFrontMesh;
let cardBackMesh;
let cardGlareMesh;
let cardBackGlareMesh;
let cardGradientMesh;
let cardBackGradientMesh;
let cardFrontNoiseMesh;
let cardBackNoiseMesh;
let cardTransmissionBackdrop;
let cardDefaultLights = [];
let cardClearResinLights = [];
let cardClearResinPointLight;
let cardClearResinEnvironmentTarget;
let cardClearResinEnvironmentPromise = null;
let activeIndividualCardModelRenderProfile = "";
let cardPlaceholderTexture;
let cardSurfaceNoiseTexture;
let individualCardModelLoaderModulesPromise = null;
const individualCardModelSourcePromises = new Map();
const backTexturePromises = new Map();
const backTextures = new Map();
let allBackTexturesPreloadPromise = null;
const binderIntroSpriteTexturePromises = new Map();
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
let lastAppliedCardSwapOpacity = Number.NaN;
let lastAppliedCardSwapIncomingOpacity = Number.NaN;
let cardSwapAnimating = false;
let cardSwapToken = 0;
let cardSwapTweenState = null;
let cardSwapLoadingTimer = 0;
let cardSwapLoadingButton = null;
let individualCardPrewarmTimer = 0;
let individualCardPrewarmToken = 0;
let individualBinderSpreadPrewarmIdleCallback = 0;
let individualBinderSpreadPrewarmTimer = 0;
let individualBinderSpreadPrewarmToken = 0;
let individualBinderSpreadPrewarmKeys = new Set();
let focusedBinderCardPrewarmTimer = 0;
let focusedBinderCardPrewarmToken = 0;
let binderOpenCardLoadingTimer = 0;
let binderOpenCardLoadingToken = 0;
let cardShuffleLoadingTimer = 0;
let cardShuffleLoadingButton = null;
let cardShuffleSpinY = 0;
let cardShuffleGlossOpacity = 1;
let cardShuffleSpinAnimating = false;
let cardShuffleSpinToken = 0;
let cardNameInput = null;
let screensaverHoldState = null;
let screensaverActivationButton = null;
let screensaverSuppressedButton = null;
let screensaverSuppressedClickUntil = 0;
let screensaverPrewarmTimer = 0;
let screensaverPrewarmPromise = null;
let screensaverOverlay = null;
let screensaverCanvas = null;
let screensaverRenderer = null;
let screensaverScene = null;
let screensaverWarmupScene = null;
let screensaverWarmupTarget = null;
let screensaverCamera = null;
let screensaverAnimationFrame = 0;
let screensaverActive = false;
let screensaverPreparing = false;
let screensaverFullscreenRequested = false;
let screensaverOwnsFullscreen = false;
let screensaverExitArmedAt = 0;
let screensaverExitTimer = 0;
let screensaverLastFrameAt = 0;
let screensaverFrameSampleCount = 0;
let screensaverFrameSampleTotalMs = 0;
let screensaverFrameSampleMaximumMs = 0;
let screensaverFrameSampleLongFrames = 0;
let screensaverNextSpawnAt = 0;
let screensaverPrepareToken = 0;
let screensaverPrepareActiveCount = 0;
let screensaverPreparationBlockedUntil = 0;
let screensaverCardIndexes = [];
let screensaverCardBag = [];
let screensaverSourceCollectionIds = [];
const screensaverCollectionCardBags = new Map();
let screensaverCollectionPickBag = [];
let screensaverCardNft1AnimatedIndexes = [];
let screensaverCardNft1AnimatedBag = [];
let screensaverSpawnTrackBag = [];
let screensaverLastSpawnTrackKey = "";
let screensaverSourceKey = "";
let screensaverPointerClientX = Number.NaN;
let screensaverPointerClientY = Number.NaN;
let screensaverPointerVelocityX = 0;
let screensaverPointerVelocityY = 0;
let screensaverPointerLastAt = 0;
let screensaverPointerForceApplications = 0;
let screensaverCtrlSelectionActive = false;
let screensaverContextMenuSuppressedUntil = 0;
let screensaverSpawnSequence = 0;
let screensaverPendingPointerX = Number.NaN;
let screensaverPendingPointerY = Number.NaN;
let screensaverPendingPointerAt = 0;
let screensaverPointerInputPending = false;
let screensaverPointerHoverDirty = false;
let screensaverPointerHoverNextAt = 0;
let screensaverDiagnosticsNextAt = 0;
let screensaverCardDiagnosticsDirty = true;
let screensaverHoveredCardIndex = null;
let screensaverHoveredCardAt = 0;
let screensaverHoveredCardClientX = Number.NaN;
let screensaverHoveredCardClientY = Number.NaN;
const screensaverPointerWakeSamples = Array.from(
  { length: SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY },
  () => ({
    clientX: 0,
    clientY: 0,
    velocityX: 0,
    velocityY: 0,
    speed: 0,
    createdAt: 0,
    frameFreshness: 0,
  }),
);
let screensaverPointerWakeCursor = 0;
let screensaverPointerWakeCount = 0;
const screensaverSuppressedTitles = new Map();
let screensaverTooltipObserver = null;
const screensaverCards = [];
const screensaverReadyCards = [];
const screensaverAnimatedTextureRecordScratch = new Set();
const screensaverRaycastMeshScratch = [];
const screensaverViewportRect = {
  left: 0,
  top: 0,
  width: 1,
  height: 1,
  ambientRadius: SCREENSAVER_POINTER_AMBIENT_RADIUS_MIN,
};
const screensaverPointerForceFrame = {
  rect: screensaverViewportRect,
  clientX: 0,
  clientY: 0,
  velocityX: 0,
  velocityY: 0,
  speed: 0,
  freshness: 0,
  activeWakeCount: 0,
};
let binderFirstPageHoldTimer = 0;
let binderFirstPageHoldPointerId = null;
let binderFirstPageHoldStartX = 0;
let binderFirstPageHoldStartY = 0;
let binderFirstPageHoldConfirmed = false;
let binderFirstPageHoldTriggeredAt = 0;
let suppressNextBinderPreviousPageClick = false;
let targetCameraZ = CARD_CAMERA_DEFAULT_Z;
let currentCameraZ = targetCameraZ;
let smoothZoomVelocity = 0;
let individualCardHoverTiltX = 0;
let individualCardHoverTiltY = 0;
let individualCardHoverTiltVelocityX = 0;
let individualCardHoverTiltVelocityY = 0;
let individualCardHoverTiltTargetX = 0;
let individualCardHoverTiltTargetY = 0;
let cardGlossActivity = 0;
let cardEffectPointerTargetX = CARD_NFT_2_EFFECT_DEFAULT_POINTER_X;
let cardEffectPointerTargetY = CARD_NFT_2_EFFECT_DEFAULT_POINTER_Y;
let cardEffectPointerTargetActive = 0;
let cardEffectPointerX = CARD_NFT_2_EFFECT_DEFAULT_POINTER_X;
let cardEffectPointerY = CARD_NFT_2_EFFECT_DEFAULT_POINTER_Y;
let cardEffectPointerActive = 0;
let cardEffectPointerClientX = Number.NaN;
let cardEffectPointerClientY = Number.NaN;
let cardEffectViewOpacity = 1;
let cardEffectViewTargetOpacity = 1;
let cardEffectViewStartOpacity = 1;
let cardEffectViewFadeStartedAt = 0;
let traitsOpen = false;
let traitInfoOpenRequested = false;
let traitPanelOpenToken = 0;
let traitPanelOpenFrame = 0;
let traitUiPrewarmIdleCallback = 0;
let traitUiPrewarmTimer = 0;
let traitUiPrewarmCollectionId = "";
let individualWheelOutDistance = 0;
let individualWheelOutLastAt = 0;
let binderTableWheelOutDistance = 0;
let binderTableWheelOutLastAt = 0;
let binderFocusWheelInDistance = 0;
let binderFocusWheelInLastAt = 0;
const cardTouchPointers = new Map();
const binderTouchPointers = new Map();
let cardPinchGesture = null;
let binderPinchGesture = null;
let resizeFrame = 0;
let cardLastWidth = 0;
let cardLastHeight = 0;
let appViewportWidth = 0;
let appViewportHeight = 0;
let appViewportLeft = 0;
let appViewportTop = 0;

let binderRenderer;
let binderScene;
let binderCamera;
let binderContextLost = false;
let binderPresentationRoot;
let binderActivePlacementRoot;
let binderRoot;
let binderTableGroup;
let binderTableMaterials = [];
let binderTableSurfaceMaterial = null;
let binderTableSurfaceTexturesPromise = null;
const binderTableSurfaceTextures = new Map();
let binderTableDisplayModelRoot = null;
let binderTableDisplayModelPromise = null;
let binderTableDisplayModelEntries = [];
let binderTableDisplayModelIndex = 0;
let binderTableDisplayModelLoadedAt = 0;
let binderTableAccessoryRoot = null;
let binderTableAccessoryMaterials = [];
let binderTableAccessoryShadowMaterials = [];
let binderTableDice = [];
let binderTableCoinTopMaterial = null;
let binderTableAccessoryPromise = null;
let binderTableAccessoriesLoadedAt = 0;
let binderEvilTableSetRoot;
let binderEvilTableEntries = [];
let binderEvilTableCollectionOrder = null;
let binderEvilTableSetOpacity = 0;
let binderEvilTableSwapState = null;
let binderTableViewProgress = 0;
let binderTableViewTarget = 0;
let binderTableViewAnimation = null;
let binderCardGeometry = null;
let binderPocketBackingGeometry = null;
let binderStickerGeometry = null;
let binderColumnSheetGeometry = null;
let binderColumnGlossGeometry = null;
let binderVerticalSeamGeometry = null;
let binderHorizontalSeamGeometry = null;
let binderLoadingRingGeometry = null;
let binderLoadingRingMaterial = null;
let binderCoverTexture = null;
let binderCustomCoverTexture = null;
const binderFrontCoverEmblemTextures = new Map();
const binderFrontCoverEmblemTexturePromises = new Map();
let binderIntroNoteTexture = null;
let binderSleeveFrostTexture = null;
let paperRoughnessTexture = null;
let binderPlaceholderTexture = null;
let binderCardMeshes = [];
let binderCardMeshByPosition = new Map();
let binderLoadingRings = [];
const binderFullResolutionMeshes = new Set();
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
let binderClosure = 0;
let binderTargetClosure = 0;
let binderShellState = null;
let binderOuterFlipState = null;
let binderBendDirection = 1;
let binderSinglePageSide = null;
let binderSinglePageSideTouched = false;
let binderLastWidth = 0;
let binderLastHeight = 0;
let binderAnimationFrame = 0;
let binderLastAnimationAt = 0;
let binderAnimationDelayTimer = 0;
let binderLastAnimationIdleOnly = false;
let binderAnimationIdleDelayMs = BINDER_ANIMATED_IDLE_MS;
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
let binderTextureApplyFrame = 0;
let binderTextureApplyTimer = 0;
let binderInteractionActiveUntil = 0;
let binderShuffleLoadingToken = 0;
let binderPageStatusInput = null;
let binderPageStatusEditMode = null;
let rememberedBinderViewFocus = null;
const binderTextureQueue = [];
const binderTextureQueuedPositions = new Set();
const binderTextureActiveTasks = new Map();
const binderTextureApplyQueue = [];
const binderTextureApplyPositions = new Set();
const binderTextureFailures = new Map();
const cardRaycaster = new THREE.Raycaster();
const cardPointer = new THREE.Vector2();
const binderRaycaster = new THREE.Raycaster();
const binderPointer = new THREE.Vector2();
const screensaverRaycaster = new THREE.Raycaster();
const screensaverPointer = new THREE.Vector2();
const binderDefaultCameraPosition = new THREE.Vector3(0, 0.24, 10);
const binderDefaultCameraLookAt = new THREE.Vector3(0, 0.24, 0);
const binderDesiredCameraPosition = new THREE.Vector3();
const binderDesiredCameraLookAt = new THREE.Vector3();
const binderCurrentCameraLookAt = binderDefaultCameraLookAt.clone();
const binderFocusWorldPosition = new THREE.Vector3();
const binderIntroFocusWorldPosition = new THREE.Vector3();
const binderIntroFocusLocalPosition = new THREE.Vector3();
const binderIntroFocusWorldScale = new THREE.Vector3();

init().catch((error) => {
  dismissWalletBinderDirectoryArrivalBridge();
  console.error("Binder initialization failed", error);
});

async function init() {
  installWalletBinderDirectoryArrivalBridge();
  const initialGalleryUrlState = readGalleryUrlState();
  await Promise.all([
    prepareRestoredLazyData(restoredSessionViewState),
    prepareGalleryUrlState(initialGalleryUrlState),
  ]);
  updateAppViewportVars();
  applyTheme(readStorageValue(getBrowserStorage("localStorage"), "cardnft:theme:v1") === "light");
  els.body.classList.toggle("trait-filters-disabled", !TRAIT_FILTERS_ENABLED);
  applyRestoredSessionViewState(restoredSessionViewState);
  if (restoredEvilBinderTableSwap) applyEvilBinderTableSwapViewDefaults();
  const initialGalleryUrlApplied = !WALLET_ROUTE_ADDRESS
    && applyGalleryUrlState(initialGalleryUrlState);
  updateGalleryViewModeButton();
  populateTraitSortOptions();
  initCardScene();
  initEvents();
  initializeEvilBinderHistoryState();
  initializeLiveDataRefresh();
  await preloadCollectionBackTextures(ACTIVE_COLLECTION_ID);
  const startsInGallery = Boolean(WALLET_ROUTE_ADDRESS)
    || initialGalleryUrlApplied
    || !restoredSessionViewState
    || Boolean(restoredSessionViewState.galleryOpen);
  setCard(getRestoredSessionCardIndex(restoredSessionViewState), {
    deferAssets: startsInGallery,
  });
  if (WALLET_ROUTE_ADDRESS) {
    primeWalletBinderRoute(WALLET_ROUTE_ADDRESS);
    setGalleryOpen(true);
    loadWalletBinderRoute(WALLET_ROUTE_ADDRESS).catch((error) => {
      console.error("Wallet binder could not load", error);
    });
  } else if (initialGalleryUrlApplied) {
    setGalleryOpen(true);
  } else if (restoredEvilBinderTableSwap) {
    restoreEvilBinderTableSwapArrival();
  } else {
    restoreSessionGalleryView(restoredSessionViewState);
  }
  initializeWalletAuth().catch(() => {
    updateWalletAuthUi();
  });
  preloadAllConfiguredBackTextures().catch(console.error);
  if (!galleryOpen) startCardRenderLoop();
}

async function prepareRestoredLazyData(state) {
  if (!state || typeof state !== "object") return;

  if (state.favoritesOnly) {
    await ensureFavoriteCollectionCards();
  } else if (
    Array.isArray(state.walletFilterCardStableIds)
    && state.walletFilterCardStableIds.length
  ) {
    await ensureAllCollectionCards();
  } else {
    const stableId = String(state.currentCardStableId || "");
    const collectionId = stableId.slice(0, stableId.indexOf(":"));
    if (COLLECTION_CONFIGS[collectionId]) await ensureCollectionCards(collectionId);
  }

  const restoredCollectionFilterId = COLLECTION_CONFIGS[state.activeCollectionFilter]?.id || "";
  if (restoredCollectionFilterId) await ensureCollectionCards(restoredCollectionFilterId);

  const traitCollectionId = COLLECTION_CONFIGS[state.traitSearchCollectionId]?.id
    || COLLECTION_CONFIGS[state.activeTraitFilter?.collectionId]?.id
    || ACTIVE_COLLECTION_ID;
  const restoredSortCategory = String(state.traitSortCategory || "all");
  const traitSortRequested = ![
    "all",
    COLLECTION_SORT_VALUE,
    LISTED_SORT_VALUE,
    WALLET_TRADE_FILTER_VALUE,
  ].includes(restoredSortCategory);
  if (
    state.activeTraitFilter
    || traitSortRequested
    || (state.traitSearchOpen && state.traitSearchCollectionId)
  ) {
    await Promise.all([
      ensureCollectionCards(traitCollectionId),
      ensureCollectionTraits(traitCollectionId),
    ]);
    if (state.traitSearchOpen) await ensureTraitThumbnails();
  }
}

function updateAppViewportVars() {
  const visualViewport = window.visualViewport;
  const layoutWidth = document.documentElement.clientWidth || window.innerWidth || CARD_MOBILE_SCALE_FULL_WIDTH;
  const layoutHeight = document.documentElement.clientHeight || window.innerHeight || layoutWidth;
  const width = Math.max(1, Math.round(visualViewport?.width || window.innerWidth || layoutWidth));
  const height = Math.max(1, Math.round(visualViewport?.height || window.innerHeight || layoutHeight));
  const left = Math.max(0, Math.round(visualViewport?.offsetLeft || 0));
  const top = Math.max(0, Math.round(visualViewport?.offsetTop || 0));
  const rightInset = Math.max(0, Math.round(layoutWidth - width - left));
  const bottomInset = Math.max(0, Math.round(layoutHeight - height - top));
  const centerX = left + width / 2;
  const centerY = top + height / 2;

  appViewportWidth = width;
  appViewportHeight = height;
  appViewportLeft = left;
  appViewportTop = top;

  const style = document.documentElement.style;
  style.setProperty("--app-vw", `${width}px`);
  style.setProperty("--app-vh", `${height}px`);
  style.setProperty("--app-left", `${left}px`);
  style.setProperty("--app-top", `${top}px`);
  style.setProperty("--app-center-x", `${centerX}px`);
  style.setProperty("--app-center-y", `${centerY}px`);
  style.setProperty("--app-right-inset", `${rightInset}px`);
  style.setProperty("--app-bottom-inset", `${bottomInset}px`);
  style.setProperty("--app-vw-05", `${width * 0.05}px`);
  style.setProperty("--app-vw-13", `${width * 0.13}px`);
  style.setProperty("--app-vw-16", `${width * 0.16}px`);
  style.setProperty("--app-vw-50", `${width * 0.5}px`);
  style.setProperty("--app-vw-54", `${width * 0.54}px`);
  style.setProperty("--app-vw-86", `${width * 0.86}px`);
  style.setProperty("--app-vw-92", `${width * 0.92}px`);
  style.setProperty("--app-vh-048", `${height * 0.048}px`);
  style.setProperty("--app-vh-08", `${height * 0.08}px`);
  style.setProperty("--app-vh-088", `${height * 0.088}px`);
  style.setProperty("--app-vh-10", `${height * 0.1}px`);
  style.setProperty("--app-vh-112", `${height * 0.112}px`);
  style.setProperty("--app-vh-115", `${height * 0.115}px`);
  style.setProperty("--app-vh-12", `${height * 0.12}px`);
  style.setProperty("--app-vh-126", `${height * 0.126}px`);
  style.setProperty("--app-vh-128", `${height * 0.128}px`);
  style.setProperty("--app-vh-13", `${height * 0.13}px`);
  style.setProperty("--app-vh-15", `${height * 0.15}px`);
  style.setProperty("--app-vh-16", `${height * 0.16}px`);
  style.setProperty("--app-vh-18", `${height * 0.18}px`);
  style.setProperty("--app-vh-21", `${height * 0.21}px`);
  style.setProperty("--app-vh-22", `${height * 0.22}px`);
  style.setProperty("--app-vh-435", `${height * 0.435}px`);
  style.setProperty("--app-vh-62", `${height * 0.62}px`);
}

function getAppViewportWidth() {
  return appViewportWidth || window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth || 0;
}

function getAppViewportHeight() {
  return appViewportHeight || window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
}

function initCardScene() {
  cardRenderer = new THREE.WebGLRenderer({
    canvas: els.cardCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  cardRenderer.setPixelRatio(getRendererPixelRatio(getAppViewportWidth(), getAppViewportHeight()));
  cardRenderer.outputColorSpace = THREE.SRGBColorSpace;
  cardRenderer.setClearColor(0x000000, 0);
  cardRenderer.transmissionResolutionScale = 1;
  cardRenderer.toneMapping = THREE.NoToneMapping;
  cardRenderer.toneMappingExposure = 1;

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

  cardDefaultLights = [ambient, key, rim];

  const clearHemisphere = new THREE.HemisphereLight(0xdce8ff, 0x2c2018, 0.65);
  cardClearResinPointLight = new THREE.PointLight(0xffffff, 17, 0, 0.4);
  cardClearResinPointLight.position.set(-3.9, 5.5, 3);
  const clearSpot = new THREE.SpotLight(
    0xc8ddff,
    110,
    0,
    THREE.MathUtils.degToRad(34),
    0.65,
    2,
  );
  clearSpot.position.set(-3, 4, 4);
  const clearSpotTarget = new THREE.Object3D();
  clearSpotTarget.position.set(0, 0, 0);
  clearSpot.target = clearSpotTarget;
  cardClearResinLights = [clearHemisphere, cardClearResinPointLight, clearSpot];
  for (const light of cardClearResinLights) light.visible = false;
  cardScene.add(clearHemisphere, cardClearResinPointLight, clearSpot, clearSpotTarget);

  const transmissionBackdropMaterial = new THREE.ShaderMaterial({
    uniforms: {
      backdropColor: { value: new THREE.Color(0x191919) },
      backdropAlpha: { value: 0.3 },
    },
    vertexShader: `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 backdropColor;
      uniform float backdropAlpha;

      void main() {
        gl_FragColor = vec4(backdropColor, backdropAlpha);
      }
    `,
    depthTest: false,
    depthWrite: false,
  });
  cardTransmissionBackdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    transmissionBackdropMaterial,
  );
  cardTransmissionBackdrop.position.z = -10;
  cardTransmissionBackdrop.renderOrder = -1000;
  cardTransmissionBackdrop.visible = false;
  cardTransmissionBackdrop.onBeforeRender = (renderer) => {
    transmissionBackdropMaterial.colorWrite = renderer.getRenderTarget() !== null;
  };
  cardScene.add(cardTransmissionBackdrop);

  cardGroup = new THREE.Group();
  cardGroup.position.y = INDIVIDUAL_CARD_WORLD_Y;
  cardScene.add(cardGroup);

  const core = new THREE.Mesh(
    createRoundedCoreGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH, CARD_RADIUS),
    createCardCoreMaterial(),
  );
  cardGroup.add(core);

  const faceGeometry = createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  cardFrontMesh = new THREE.Mesh(
    faceGeometry,
    createCardFaceMaterial(getCardPlaceholderTexture()),
  );
  cardFrontMesh.position.z = CARD_DEPTH / 2 + 0.003;
  cardFrontMesh.renderOrder = 22;
  cardGroup.add(cardFrontMesh);
  cardGroup.userData.frontMesh = cardFrontMesh;

  cardBackMesh = new THREE.Mesh(
    faceGeometry.clone(),
    createCardFaceMaterial(getCardPlaceholderTexture()),
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
  cardGroup.userData.proceduralCardChildren = [...cardGroup.children];

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

function initUiButtonHoverTilt() {
  const hoverMedia = typeof window.matchMedia === "function"
    ? window.matchMedia(UI_BUTTON_TILT_HOVER_QUERY)
    : null;
  const reducedMotion = typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  if (hoverMedia && !hoverMedia.matches) return;
  if (reducedMotion?.matches) return;

  document.addEventListener("pointerover", onUiButtonTiltPointerMove, { passive: true });
  document.addEventListener("pointermove", onUiButtonTiltPointerMove, { passive: true });
  document.addEventListener("pointerout", onUiButtonTiltPointerOut, { passive: true });
  document.addEventListener("pointercancel", clearActiveUiButtonTilt, { passive: true, capture: true });
  window.addEventListener("blur", clearActiveUiButtonTilt);
}

function onUiButtonTiltPointerMove(event) {
  if (!isHoverTiltPointer(event)) return;
  const button = getUiButtonTiltTarget(event.target);
  if (!button) {
    clearActiveUiButtonTilt();
    return;
  }

  if (activeUiButtonTiltTarget && activeUiButtonTiltTarget !== button) {
    resetUiButtonTilt(activeUiButtonTiltTarget);
  }
  activeUiButtonTiltTarget = button;
  updateUiButtonTilt(button, event);
}

function onUiButtonTiltPointerOut(event) {
  const button = getUiButtonTiltTarget(event.target);
  if (!button) return;
  const relatedTarget = event.relatedTarget;
  if (relatedTarget instanceof Node && button.contains(relatedTarget)) return;
  resetUiButtonTilt(button);
  if (activeUiButtonTiltTarget === button) activeUiButtonTiltTarget = null;
}

function clearActiveUiButtonTilt() {
  if (!activeUiButtonTiltTarget) return;
  resetUiButtonTilt(activeUiButtonTiltTarget);
  activeUiButtonTiltTarget = null;
}

function getUiButtonTiltTarget(target) {
  if (!(target instanceof Element)) return null;
  const button = target.closest(UI_BUTTON_TILT_SELECTOR);
  if (!button || !document.documentElement.contains(button)) return null;
  if (button.matches(":disabled, [aria-disabled='true']")) return null;
  return button;
}

function isHoverTiltPointer(event) {
  return !event.pointerType || event.pointerType === "mouse" || event.pointerType === "pen";
}

function updateUiButtonTilt(button, event) {
  const rect = button.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
  const tiltX = (0.5 - y) * UI_BUTTON_TILT_MAX_DEGREES * 2;
  const tiltY = (x - 0.5) * UI_BUTTON_TILT_MAX_DEGREES * 2;

  button.style.setProperty("--ui-button-tilt-x", `${tiltX.toFixed(2)}deg`);
  button.style.setProperty("--ui-button-tilt-y", `${tiltY.toFixed(2)}deg`);
  button.style.setProperty("--ui-button-shine-x", `${(x * 100).toFixed(1)}%`);
  button.style.setProperty("--ui-button-shine-y", `${(y * 100).toFixed(1)}%`);
}

function resetUiButtonTilt(button) {
  button.style.removeProperty("--ui-button-tilt-x");
  button.style.removeProperty("--ui-button-tilt-y");
  button.style.removeProperty("--ui-button-shine-x");
  button.style.removeProperty("--ui-button-shine-y");
}

function initEvents() {
  document.addEventListener("touchend", suppressDoubleTapZoom, { passive: false });
  document.addEventListener("gesturestart", preventBrowserZoomGesture, { passive: false, capture: true });
  document.addEventListener("gesturechange", preventBrowserZoomGesture, { passive: false, capture: true });
  document.addEventListener("gestureend", preventBrowserZoomGesture, { passive: false, capture: true });
  document.addEventListener("wheel", preventBrowserZoomWheel, { passive: false, capture: true });
  document.addEventListener("keydown", preventBrowserZoomKeydown, { capture: true });
  document.addEventListener("keydown", handleBinderCoverUndoKeydown, { capture: true });
  window.addEventListener("popstate", () => {
    handleGalleryUrlNavigation().catch(console.error);
  });
  window.addEventListener("focus", refreshLiveDataAfterFocus);
  document.addEventListener("visibilitychange", refreshLiveDataAfterFocus);
  document.addEventListener("pointerdown", handleScreensaverActivity, { capture: true });
  document.addEventListener("pointermove", handleScreensaverPointerMove, { capture: true, passive: true });
  document.addEventListener("keydown", handleScreensaverActivity, { capture: true });
  document.addEventListener("keyup", handleScreensaverControlKeyUp, { capture: true });
  document.addEventListener("contextmenu", suppressScreensaverSelectionContextMenu, {
    capture: true,
  });
  initUiButtonHoverTilt();
  els.cardBinderReturnButton.addEventListener("click", () => {
    transitionIndividualCardToFocusedBinder().catch(console.error);
  });
  els.previousButton.addEventListener("click", (event) => {
    transitionAdjacentCard(-1, event.currentTarget).catch(console.error);
  });
  els.nextButton.addEventListener("click", (event) => {
    transitionAdjacentCard(1, event.currentTarget).catch(console.error);
  });
  els.shuffleButton.addEventListener("click", (event) => {
    if (consumeScreensaverHoldClick(event.currentTarget)) {
      event.preventDefault();
      return;
    }
    shuffleCard().catch(console.error);
  });
  initScreensaverHoldButton(els.shuffleButton);
  els.shuffleButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (screensaverHoldState?.button === els.shuffleButton) return;
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
  els.walletBinderDirectoryButton.addEventListener("click", openWalletBinderDirectory);
  els.walletBinderDirectoryBackButton.addEventListener("click", () => {
    setWalletBinderDirectoryOpen(false);
  });
  els.walletBinderDirectoryGallery.addEventListener("click", handleWalletBinderDirectoryClick);
  els.walletBinderDirectoryGallery.addEventListener("scroll", maybeLoadMoreWalletBinders, {
    passive: true,
  });
  els.walletConnectButton.addEventListener("click", handleWalletConnectButtonClick);
  els.walletProviderList.addEventListener("click", handleWalletProviderListClick);
  els.walletSignOutButton.addEventListener("click", () => {
    signOutCurrentWallet().catch(console.error);
  });
  els.binderOrderEditButton.addEventListener("click", () => {
    openBinderOrderEditor().catch(console.error);
  });
  els.binderOrderCloseButton.addEventListener("click", closeBinderOrderEditor);
  els.binderOrderConfirmButton.addEventListener("click", () => {
    confirmBinderOrder().catch(console.error);
  });
  els.binderTradeModeButton.addEventListener("click", toggleBinderTradeMarkingMode);
  els.binderCoverModeButton.addEventListener("click", toggleBinderCoverEditorMode);
  els.binderFrontCoverUpload.addEventListener("change", () => {
    handleBinderCoverArtworkUpload("front").catch(console.error);
  });
  els.binderFrontCoverRemove.addEventListener("click", () => removeBinderCoverArtwork("front"));
  els.binderFrontCoverZoom.addEventListener("input", () => handleBinderCoverArtworkZoom("front"));
  els.binderFrontCoverRotation.addEventListener("input", () => handleBinderCoverArtworkRotation("front"));
  els.binderFrontCoverPreview.addEventListener("pointerdown", (event) => {
    startBinderCoverPreviewInteraction(event, "front");
  });
  els.binderBackCoverUpload.addEventListener("change", () => {
    handleBinderCoverArtworkUpload("back").catch(console.error);
  });
  els.binderBackCoverRemove.addEventListener("click", () => removeBinderCoverArtwork("back"));
  els.binderBackCoverZoom.addEventListener("input", () => handleBinderCoverArtworkZoom("back"));
  els.binderBackCoverRotation.addEventListener("input", () => handleBinderCoverArtworkRotation("back"));
  els.binderBackCoverPreview.addEventListener("pointerdown", (event) => {
    startBinderCoverPreviewInteraction(event, "back");
  });
  els.binderInsideTextInput.addEventListener("input", handleBinderInsideTextInput);
  els.binderInsideTextInput.addEventListener("select", updateBinderInsideLinkPopover);
  els.binderInsideTextInput.addEventListener("keyup", updateBinderInsideLinkPopover);
  els.binderInsideTextInput.addEventListener("pointerdown", startBinderInsideTextSelection);
  els.binderInsideTextInput.addEventListener("click", handleBinderInsideTextClick);
  els.binderInsideFontSize.addEventListener("input", handleBinderInsideFontSizeInput);
  els.binderInsideTextRotation.addEventListener("input", handleBinderInsideTextRotationInput);
  els.binderInsideTextBox.addEventListener("pointerdown", startBinderInsideTextBoxDrag);
  els.binderInsideCoverPreview.addEventListener("pointerdown", (event) => {
    startBinderCoverPreviewInteraction(event, "inside");
  });
  els.binderInsideLinkApply.addEventListener("click", addBinderInsideTextLink);
  els.binderInsideLinkRemove.addEventListener("click", removeBinderInsideTextLink);
  els.binderBaseColor.addEventListener("input", handleBinderBaseColorInput);
  els.binderCoverTextColor.addEventListener("input", handleBinderCoverTextColorInput);
  els.binderCoverEditor.addEventListener("click", handleBinderCoverStickerControlsClick);
  els.binderCoverEditor.addEventListener("input", handleBinderCoverStickerControlsInput);
  els.binderCoverEditor.addEventListener("change", endBinderCoverUndoCoalescing);
  els.binderCoverEditor.addEventListener("keydown", handleBinderCoverStickerKeyboard);
  els.binderStickerPickerClose.addEventListener("click", closeBinderStickerPicker);
  els.binderStickerPicker.addEventListener("pointerdown", (event) => {
    if (event.target === els.binderStickerPicker) closeBinderStickerPicker();
  });
  els.binderStickerPickerGallery.addEventListener("click", handleBinderStickerPickerClick);
  els.binderOrderEditor.addEventListener("pointerdown", (event) => {
    if (event.target === els.binderOrderEditor) closeBinderOrderEditor();
  });
  els.binderOrderPages.addEventListener("pointerdown", startBinderOrderDrag);
  els.binderOrderEditor.addEventListener("lostpointercapture", cancelBinderOrderDrag);
  els.binderOrderPages.addEventListener("click", handleBinderOrderCardClick);
  els.binderOrderPages.addEventListener("dblclick", startBinderOrderPositionEdit);
  els.binderOrderPages.addEventListener("keydown", handleBinderOrderCardKeydown);
  document.addEventListener("pointermove", moveBinderOrderDrag, { passive: false, capture: true });
  document.addEventListener("pointerup", finishBinderOrderDrag, { capture: true });
  document.addEventListener("pointercancel", cancelBinderOrderDrag, { capture: true });
  document.addEventListener("pointermove", moveBinderCoverInteraction, { passive: false, capture: true });
  document.addEventListener("pointerup", finishBinderCoverInteraction, { capture: true });
  document.addEventListener("pointerup", finishBinderInsideTextSelection, { capture: true });
  document.addEventListener("pointercancel", finishBinderCoverInteraction, { capture: true });
  document.addEventListener("pointercancel", finishBinderInsideTextSelection, { capture: true });
  document.addEventListener("pointerdown", dismissBinderInsideLinkPopoverOnPointerDown);
  document.addEventListener("selectionchange", handleBinderInsideTextSelectionChange);
  window.addEventListener("blur", cancelBinderOrderDrag);
  window.addEventListener("blur", finishBinderCoverInteraction);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelBinderOrderDrag();
  });
  document.addEventListener("keydown", handleBinderOrderEditorKeydown, { capture: true });
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
  els.walletBinderDirectory.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    setWalletBinderDirectoryOpen(false);
  });
  els.favoriteFilterButton.addEventListener("click", () => {
    toggleFavoriteFilter().catch(console.error);
  });
  els.traitSearchButton.addEventListener("click", () => {
    toggleTraitSearch().catch(console.error);
  });
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
    applyTraitSortSelection().catch(console.error);
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
  document.addEventListener("pointerdown", (event) => {
    if (!binderOrderPositionEdit?.input || binderOrderPositionEdit.input.contains(event.target)) return;
    commitBinderOrderPositionEdit({ restoreFocus: false });
  }, true);
  window.addEventListener("blur", () => {
    setTraitSortPickerOpen(false);
    cancelBinderOrderDrag();
    cancelInterruptedPointerInteractions();
    cancelBinderFirstPageHold();
    cancelScreensaverHold();
  });
  els.themeToggle.addEventListener("change", () => applyTheme(els.themeToggle.checked));
  els.binderPreviousPageButton.addEventListener("click", (event) => {
    if (consumeSuppressedBinderPreviousPageClick()) {
      event.preventDefault();
      return;
    }
    previousBinderPage();
  });
  els.binderPreviousPageButton.addEventListener("pointerdown", startBinderFirstPageHold);
  els.binderPreviousPageButton.addEventListener("pointermove", moveBinderFirstPageHold);
  els.binderPreviousPageButton.addEventListener("pointerup", finishBinderFirstPageHold);
  els.binderPreviousPageButton.addEventListener("pointercancel", cancelBinderFirstPageHold);
  els.binderPreviousPageButton.addEventListener("pointerleave", cancelPendingBinderFirstPageHold);
  els.binderPreviousPageButton.addEventListener("lostpointercapture", cancelPendingBinderFirstPageHold);
  els.binderPreviousPageButton.addEventListener(
    "animationend",
    confirmBinderFirstPageHoldFromAnimation,
  );
  els.binderPreviousPageButton.addEventListener("contextmenu", (event) => {
    if (binderFirstPageHoldPointerId !== null || isRecentBinderFirstPageHold()) {
      event.preventDefault();
    }
  });
  els.binderNextPageButton.addEventListener("click", nextBinderPage);
  els.binderPageStatus.addEventListener("dblclick", startBinderPageStatusEdit);
  els.binderTableViewButton.addEventListener("click", toggleBinderTableView);
  els.binderZoomOutButton.addEventListener("click", clearBinderFocus);
  els.binderOpenCardButton.addEventListener("click", () => {
    openFocusedBinderCard().catch(console.error);
  });
  els.binderFavoriteButton.addEventListener("click", toggleFocusedBinderFavorite);
  els.binderShuffleButton.addEventListener("click", (event) => {
    if (consumeScreensaverHoldClick(event.currentTarget)) {
      event.preventDefault();
      return;
    }
    shuffleBinderSpread().catch(console.error);
  });
  initScreensaverHoldButton(els.binderShuffleButton);
  els.binderShuffleButton.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (screensaverHoldState?.button === els.binderShuffleButton) return;
    applyPreviousBinderSpread().catch(console.error);
  });

  els.cardCanvas.addEventListener("pointerdown", onCardPointerDown);
  els.cardCanvas.addEventListener("pointermove", onCardPointerMove);
  els.cardCanvas.addEventListener("pointerup", onCardPointerUp);
  els.cardCanvas.addEventListener("pointercancel", onCardPointerUp);
  els.cardCanvas.addEventListener("lostpointercapture", onCardPointerCaptureLost);
  els.cardCanvas.addEventListener("pointerleave", onCardPointerLeave);
  els.cardCanvas.addEventListener("mouseleave", onCardPointerLeave);
  els.cardCanvas.addEventListener("wheel", onCardWheel, { passive: false });
  els.cardCanvas.addEventListener("webglcontextlost", handleCardContextLost, { passive: false });
  els.cardCanvas.addEventListener("webglcontextrestored", handleCardContextRestored);
  document.addEventListener("pointermove", onGlobalCardEffectPointerMove, { passive: true });
  document.addEventListener("mousemove", onGlobalCardEffectPointerMove, { passive: true });

  els.binderCanvas.addEventListener("pointerdown", onBinderPointerDown);
  els.binderCanvas.addEventListener("pointermove", onBinderPointerMove);
  els.binderCanvas.addEventListener("pointerup", onBinderPointerUp);
  els.binderCanvas.addEventListener("pointercancel", onBinderPointerCancel);
  els.binderCanvas.addEventListener("lostpointercapture", onBinderPointerCaptureLost);
  els.binderCanvas.addEventListener("pointerleave", clearBinderIntroLinkCursor);
  els.binderCanvas.addEventListener("dblclick", handleBinderCanvasDoubleClick);
  els.binderCanvas.addEventListener("wheel", handleBinderWheel, { passive: false });
  els.binderCanvas.addEventListener("webglcontextlost", handleBinderContextLost, { passive: false });
  els.binderCanvas.addEventListener("webglcontextrestored", handleBinderContextRestored);

  window.addEventListener("resize", requestResize);
  window.addEventListener("orientationchange", requestResize);
  window.visualViewport?.addEventListener("resize", requestResize);
  window.visualViewport?.addEventListener("scroll", requestResize);
  document.addEventListener("visibilitychange", handleDocumentVisibilityChange);
  window.addEventListener("pageshow", handleDocumentVisibilityChange);
  window.addEventListener("online", retryFailedBinderTextures);
  window.addEventListener("pagehide", saveSessionViewState);
}

function handleDocumentVisibilityChange() {
  if (document.hidden) {
    stopCardRenderLoop();
    stopBinderRenderLoop();
    stopScreensaverAnimation();
    cancelIndividualCardPrewarmQueue();
    cancelFocusedBinderCardPrewarm();
    return;
  }

  requestResize();
  if (screensaverActive) {
    screensaverLastFrameAt = performance.now();
    startScreensaverAnimation();
    return;
  }
  if (galleryOpen && isBinderMode && !els.binderPanel.hidden) {
    startBinderRenderLoop();
    requestBinderMaintenance(0);
  } else if (!galleryOpen) {
    if (individualCardAssetsDeferred) setCard(currentIndex);
    startCardRenderLoop();
  }
}

function handleCardContextLost(event) {
  event.preventDefault();
  cardContextLost = true;
  stopCardRenderLoop();
}

function handleCardContextRestored() {
  cardContextLost = false;
  refreshSceneGpuResources(cardScene);
  cardRenderer?.resetState();
  requestResize();
  if (!galleryOpen) startCardRenderLoop();
}

function handleBinderContextLost(event) {
  event.preventDefault();
  binderContextLost = true;
  stopBinderRenderLoop();
}

function handleBinderContextRestored() {
  binderContextLost = false;
  refreshSceneGpuResources(binderScene);
  binderRenderer?.resetState();
  requestResize();
  if (galleryOpen && isBinderMode && !els.binderPanel.hidden) {
    startBinderRenderLoop();
    requestBinderMaintenance(0);
  }
}

function refreshSceneGpuResources(scene) {
  scene?.traverse((object) => {
    const geometry = object.geometry;
    if (geometry) {
      for (const attribute of Object.values(geometry.attributes || {})) {
        if (attribute) attribute.needsUpdate = true;
      }
      if (geometry.index) geometry.index.needsUpdate = true;
    }

    const materials = Array.isArray(object.material)
      ? object.material
      : (object.material ? [object.material] : []);
    for (const material of materials) {
      material.needsUpdate = true;
      for (const value of Object.values(material)) {
        if (value?.isTexture) value.needsUpdate = true;
      }
      for (const uniform of Object.values(material.uniforms || {})) {
        if (uniform?.value?.isTexture) uniform.value.needsUpdate = true;
      }
    }
  });
}

function retryFailedBinderTextures() {
  if (!binderTextureFailures.size) return;
  binderTextureFailures.clear();
  for (const mesh of binderCardMeshes) {
    if (!mesh.userData.textureLoadFailed) continue;
    mesh.userData.textureLoadFailed = false;
    mesh.userData.textureLoaded = false;
    mesh.userData.textureLoading = false;
  }
  if (galleryOpen && isBinderMode) {
    binderTextureQueueKey = "";
    queueBinderTextureLoads(binderBuildToken, { force: true });
  }
}

function readGalleryUrlState(url = new URL(window.location.href)) {
  const params = url.searchParams;
  const sortCategory = String(params.get(GALLERY_SORT_QUERY_PARAM) || "").trim();
  const collectionFilterId = String(
    params.get(GALLERY_COLLECTION_FILTER_QUERY_PARAM) || "",
  ).trim();
  const traitCategory = String(params.get(GALLERY_TRAIT_CATEGORY_QUERY_PARAM) || "").trim();
  const traitValue = String(params.get(GALLERY_TRAIT_VALUE_QUERY_PARAM) || "").trim();
  const traitCollectionId = String(
    params.get(GALLERY_TRAIT_COLLECTION_QUERY_PARAM) || ACTIVE_COLLECTION_ID,
  ).trim();
  return {
    sortCategory,
    collectionFilterId,
    traitCategory,
    traitValue,
    traitCollectionId,
    hasParameters: [
      GALLERY_SORT_QUERY_PARAM,
      GALLERY_COLLECTION_FILTER_QUERY_PARAM,
      GALLERY_TRAIT_CATEGORY_QUERY_PARAM,
      GALLERY_TRAIT_VALUE_QUERY_PARAM,
      GALLERY_TRAIT_COLLECTION_QUERY_PARAM,
    ].some((name) => params.has(name)),
  };
}

async function prepareGalleryUrlState(state) {
  if (!state?.hasParameters) return;
  if (COLLECTION_CONFIGS[state.collectionFilterId]) {
    await ensureCollectionCards(state.collectionFilterId);
  }
  const collectionId = COLLECTION_CONFIGS[state.traitCollectionId]?.id || ACTIVE_COLLECTION_ID;
  if (state.traitCategory && state.traitValue && traitFiltersEnabledForCollection(collectionId)) {
    await Promise.all([
      ensureCollectionCards(collectionId),
      ensureCollectionTraits(collectionId),
    ]);
    return;
  }
  if (
    state.sortCategory
    && ![
      "all",
      COLLECTION_SORT_VALUE,
      LISTED_SORT_VALUE,
      WALLET_TRADE_FILTER_VALUE,
    ].includes(state.sortCategory)
    && TRAIT_FILTERS_ENABLED
  ) {
    await ensureCollectionTraits(ACTIVE_COLLECTION_ID);
  }
}

function applyGalleryUrlState(state) {
  const requestedSortCategory = getValidGallerySortCategory(state?.sortCategory);
  const preserveMixedSource = isMixedCollectionGallery();
  const collectionId = COLLECTION_CONFIGS[state?.traitCollectionId]?.id || ACTIVE_COLLECTION_ID;
  const requestedCollectionFilter = COLLECTION_CONFIGS[state?.collectionFilterId]?.id || "";
  const requestedTraitCategory = String(state?.traitCategory || "").trim();
  const requestedTraitValue = String(state?.traitValue || "").trim();
  let nextTraitFilter = null;

  if (
    requestedTraitCategory
    && requestedTraitValue
    && traitFiltersEnabledForCollection(collectionId)
  ) {
    const matchedCategory = getTraitDisplayCategoryOptions(collectionId)
      .find((option) => (
        normalizeTraitValue(option.category) === normalizeTraitValue(requestedTraitCategory)
      ));
    if (matchedCategory) {
      nextTraitFilter = {
        collectionId,
        category: matchedCategory.category,
        value: requestedTraitValue,
        normalizedValue: normalizeTraitValue(requestedTraitValue),
        sourceCategories: getValidTraitFilterSourceCategories(
          matchedCategory.sourceCategories,
          matchedCategory.category,
          collectionId,
        ),
      };
    }
  }

  activeTraitFilter = nextTraitFilter;
  activeCollectionFilter = preserveMixedSource
    ? (nextTraitFilter?.collectionId || requestedCollectionFilter)
    : "";
  if (!preserveMixedSource) favoritesOnly = false;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  resetTraitSearchQuery();
  traitSortCategory = nextTraitFilter
    ? (preserveMixedSource
      ? requestedSortCategory
      : (collectionId === ACTIVE_COLLECTION_ID ? nextTraitFilter.category : "all"))
    : requestedSortCategory;
  if (els.traitSortSelect) els.traitSortSelect.value = traitSortCategory;
  updateFavoriteButtons();
  updateTraitSearchState();
  return Boolean(
    nextTraitFilter
    || activeCollectionFilter
    || requestedSortCategory !== "all"
  );
}

function getValidGallerySortCategory(category) {
  const value = String(category || "").trim();
  if (!value || value === "all") return "all";
  if (value === COLLECTION_SORT_VALUE) {
    return isMixedCollectionGallery() ? COLLECTION_SORT_VALUE : "all";
  }
  if (value === LISTED_SORT_VALUE) return LISTED_SORT_VALUE;
  if (value === WALLET_TRADE_FILTER_VALUE) return WALLET_TRADE_FILTER_VALUE;
  return TRAIT_FILTERS_ENABLED ? getValidTraitSortCategory(value) : "all";
}

function updateGalleryUrlFromState({ replace = false } = {}) {
  const url = new URL(window.location.href);
  url.searchParams.delete(GALLERY_SORT_QUERY_PARAM);
  url.searchParams.delete(GALLERY_COLLECTION_FILTER_QUERY_PARAM);
  url.searchParams.delete(GALLERY_TRAIT_CATEGORY_QUERY_PARAM);
  url.searchParams.delete(GALLERY_TRAIT_VALUE_QUERY_PARAM);
  url.searchParams.delete(GALLERY_TRAIT_COLLECTION_QUERY_PARAM);

  if (activeTraitFilter) {
    url.searchParams.set(GALLERY_TRAIT_CATEGORY_QUERY_PARAM, activeTraitFilter.category);
    url.searchParams.set(GALLERY_TRAIT_VALUE_QUERY_PARAM, activeTraitFilter.value);
    if (activeTraitFilter.collectionId !== ACTIVE_COLLECTION_ID) {
      url.searchParams.set(GALLERY_TRAIT_COLLECTION_QUERY_PARAM, activeTraitFilter.collectionId);
    }
  } else if (activeCollectionFilter) {
    url.searchParams.set(GALLERY_COLLECTION_FILTER_QUERY_PARAM, activeCollectionFilter);
  }
  if (
    traitSortCategory !== "all"
    && (!activeTraitFilter || isMixedCollectionGallery())
  ) {
    url.searchParams.set(GALLERY_SORT_QUERY_PARAM, traitSortCategory);
  }

  if (url.href === window.location.href) return;
  const method = replace ? "replaceState" : "pushState";
  window.history[method](window.history.state, "", url.href);
}

function activeCollectionMatchesCurrentPath() {
  if (WALLET_ROUTE_ADDRESS) return window.location.pathname === `/${WALLET_ROUTE_ADDRESS}`;
  const expected = new URL(ACTIVE_COLLECTION.path, window.location.origin).pathname.replace(/\/+$/, "");
  const current = window.location.pathname.replace(/\/+$/, "");
  return current === expected;
}

async function handleGalleryUrlNavigation() {
  if (!activeCollectionMatchesCurrentPath()) return;
  const token = ++galleryUrlNavigationToken;
  const state = readGalleryUrlState();
  await prepareGalleryUrlState(state);
  if (token !== galleryUrlNavigationToken || !activeCollectionMatchesCurrentPath()) return;
  applyGalleryUrlState(state);
  resetBinderGalleryPosition();
  if (!galleryOpen && state.hasParameters) {
    setGalleryOpen(true);
  } else if (galleryOpen) {
    renderGallery();
  }
  queueSessionViewStateSave();
}

function isMixedCollectionGallery() {
  return Boolean(favoritesOnly || walletFilterCardIndexSet);
}

function galleryCollectionFiltersAvailable() {
  return isMixedCollectionGallery() || TRAIT_FILTERS_ENABLED;
}

function populateTraitSortOptions() {
  const mixedCollections = isMixedCollectionGallery();
  const generalSortValues = new Set([
    "all",
    COLLECTION_SORT_VALUE,
    LISTED_SORT_VALUE,
    WALLET_TRADE_FILTER_VALUE,
  ]);
  if (
    HIDDEN_TRAIT_CATEGORIES.has(traitSortCategory)
    || (mixedCollections && !generalSortValues.has(traitSortCategory))
    || (!mixedCollections && traitSortCategory === COLLECTION_SORT_VALUE)
  ) {
    traitSortCategory = "all";
  }
  const filtersAvailable = galleryCollectionFiltersAvailable();
  els.body.classList.toggle("trait-filters-disabled", !filtersAvailable);
  els.traitSortSelect.disabled = false;
  els.traitSortSelect.replaceChildren();
  els.traitSearchButton.disabled = !filtersAvailable;
  if (!filtersAvailable) {
    els.gallerySortControl.title = "Trait sorting is not available for this collection yet";
    els.traitSearchButton.title = "Trait search is not available for this collection yet";
  } else {
    els.gallerySortControl.removeAttribute("title");
  }

  const tradeOption = document.createElement("option");
  tradeOption.value = WALLET_TRADE_FILTER_VALUE;
  tradeOption.textContent = "marked for trade";
  els.traitSortSelect.append(tradeOption);
  const listedOption = document.createElement("option");
  listedOption.value = LISTED_SORT_VALUE;
  listedOption.textContent = "listed";
  els.traitSortSelect.append(listedOption);
  if (mixedCollections) {
    const collectionOption = document.createElement("option");
    collectionOption.value = COLLECTION_SORT_VALUE;
    collectionOption.textContent = "collection";
    els.traitSortSelect.append(collectionOption);
  }
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "default";
  els.traitSortSelect.append(allOption);
  const fragment = document.createDocumentFragment();
  const traitOptions = !mixedCollections && TRAIT_FILTERS_ENABLED
    ? getTraitDisplayCategoryOptions()
    : [];
  for (const { category } of traitOptions) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = normalizeTraitValue(category) === "status"
      ? "redeem status"
      : category;
    fragment.append(option);
  }
  els.traitSortSelect.append(fragment);
  els.traitSortSelect.value = traitSortCategory;
  updateTraitSearchPlaceholder();
}

function updateTraitSearchPlaceholder() {
  if (!els.traitSearchInput) return;
  if (isMixedCollectionGallery() && !traitSearchCollectionId) {
    els.traitSearchInput.placeholder = "choose a collection";
    return;
  }
  const collectionId = traitSearchCollectionId || ACTIVE_COLLECTION_ID;
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  if (!collection.traits) {
    els.traitSearchInput.placeholder = "search traits";
    return;
  }
  const traitTotal = getTraitSearchGroups(collectionId)
    .reduce((total, group) => total + group.total, 0);
  els.traitSearchInput.placeholder = `search all ${traitTotal} ${collection.label} traits`;
}

async function applyTraitSortSelection() {
  setTraitSortPickerOpen(false);
  const nextCategory = els.traitSortSelect.value || "all";
  if (
    nextCategory !== "all"
    && nextCategory !== COLLECTION_SORT_VALUE
    && nextCategory !== WALLET_TRADE_FILTER_VALUE
    && nextCategory !== LISTED_SORT_VALUE
  ) {
    els.traitSortSelect.disabled = true;
    try {
      await ensureCollectionTraits(ACTIVE_COLLECTION_ID);
    } finally {
      els.traitSortSelect.disabled = false;
    }
  }
  if (!isMixedCollectionGallery()) {
    activeTraitFilter = null;
    activeCollectionFilter = "";
  }
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  resetTraitSearchQuery();
  traitSortCategory = nextCategory;
  updateGalleryUrlFromState();
  updateTraitSearchState();
  resetBinderGalleryPosition();
  renderGallery();
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
  applyCardAspectFitToGroup(cardGroup, card);
  const token = ++cardApplyToken;
  resetViewSwitchWheelDistances();
  const deferAssets = Boolean(options.deferAssets);
  individualCardAssetsDeferred = deferAssets;
  syncIndividualCardModel(card, cardGroup, token, { load: !deferAssets });
  applyLoadedIndividualCardEffect(card, options.effectTextures || null, {
    immediate: Boolean(options.effectTextures),
  });

  if (options.frontTexture) {
    prepareTextureForImmediateDisplay(options.frontTexture);
    cardFrontMesh.material.map = options.frontTexture;
  } else {
    cardFrontMesh.material.map = getCardPlaceholderTexture();
  }

  if (options.backTexture) {
    prepareTextureForImmediateDisplay(options.backTexture);
    cardBackMesh.material.map = options.backTexture;
  } else {
    cardBackMesh.material.map = getBackPlaceholderTexture();
  }

  if (deferAssets) {
    cancelIndividualCardPrewarmQueue();
    cancelIndividualBinderSpreadPrewarm();
  } else {
    individualCardAssetsDeferred = false;
    if (!options.frontTexture) {
      getCardTexture(card).then((texture) => {
        if (token !== cardApplyToken) return;
        prepareTextureForImmediateDisplay(texture);
        cardFrontMesh.material.map = texture;
      }).catch(console.error);
    }
    if (!options.backTexture) {
      getBackTexture(card).then((texture) => {
        if (token !== cardApplyToken) return;
        prepareTextureForImmediateDisplay(texture);
        cardBackMesh.material.map = texture;
      }).catch(console.error);
    }

    if (!options.effectTextures) {
      const effectProfile = getCardEffectProfile(card);
      loadCardEffectTexturesForProfile(effectProfile)
        .then((effectTextures) => {
          if (token !== cardApplyToken || !effectTextures) return;
          applyLoadedIndividualCardEffect(card, effectTextures);
        })
        .catch(() => {});
    }

    prepareIndividualCardFor3D(card).then(({ frontTexture, backTexture }) => {
      if (token !== cardApplyToken) return;
      if (!options.frontTexture && frontTexture) {
        prepareTextureForImmediateDisplay(frontTexture);
        cardFrontMesh.material.map = frontTexture;
      }
      if (!options.backTexture && backTexture) {
        prepareTextureForImmediateDisplay(backTexture);
        cardBackMesh.material.map = backTexture;
      }
    }).catch(console.error);
    preloadAdjacentIndividualTextures(currentIndex);
    scheduleIndividualBinderSpreadPrewarm(currentIndex);
  }

  targetRotationX = 0;
  targetRotationY = 0;
  releaseIndividualCardHoverTilt({ immediate: true });
  resetCardPan(true);
  cardGlossActivity = 0;
  if (!options.preserveSwapVisuals) resetCardSwapVisualState();
  if (!options.preserveSpinVisuals) resetCardShuffleSpinVisualState();
  updateCardText();
  scheduleTraitUiPrewarm(card.collection || ACTIVE_COLLECTION_ID);
  if (traitsOpen) renderTraitPanel();
  updateFavoriteButtons();
  queueSessionViewStateSave();
}

function applyCardEffectProfile(card, token = cardApplyToken) {
  const frontProfile = getCardEffectProfile(card);
  const backProfile = getCardBackEffectProfile(frontProfile);

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
  if (
    card?.collection !== "cardnft2"
    || !Number.isInteger(cardNumber)
    || (!isCardNft2Rare(cardNumber) && !isCardNft2SuperRare(cardNumber))
  ) {
    return {
      effectMode: CARD_EFFECT_MODE_DEFAULT,
      cardNumber: 0,
      needsEffectTextures: false,
      usesProceduralHolo: false,
      usesEngravingMask: false,
      effectStrength: 1,
    };
  }

  const superRare = isCardNft2SuperRare(cardNumber);
  const effectMode = CARD_NFT_2_HOLO_EFFECT_MODES_BY_REMAINDER[
    modulo(cardNumber, CARD_NFT_2_HOLO_EFFECT_MODES_BY_REMAINDER.length)
  ];

  return {
    effectMode,
    cardNumber,
    // Normal rares use the same moving holo families without the card-specific
    // engraving pass. The downloaded foil + alpha mask remains SR-only.
    needsEffectTextures: superRare,
    usesProceduralHolo: !superRare,
    usesEngravingMask: superRare,
    effectStrength: superRare ? 1 : 0.42,
  };
}

function isCardNft2Rare(cardNumber) {
  return cardNumber >= 1
    && cardNumber <= CARD_NFT_2_RARE_CARD_ID_MAX
    && !CARD_NFT_2_COMMON_ID_SET.has(cardNumber);
}

function isCardNft2SuperRare(cardNumber) {
  return CARD_NFT_2_SUPER_RARE_RANGES.some(([first, last]) => (
    cardNumber >= first && cardNumber <= last
  ));
}

function getCardBackEffectProfile(frontProfile) {
  return {
    effectMode: CARD_EFFECT_MODE_DEFAULT,
    cardNumber: frontProfile?.cardNumber || 0,
    needsEffectTextures: false,
    usesProceduralHolo: false,
    usesEngravingMask: false,
    effectStrength: 1,
  };
}

function applyCardEffectProfileToMesh(mesh, profile) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms) return;
  uniforms.uEffectMode.value = profile.effectMode;
  uniforms.uEffectStrength.value = profile.effectStrength ?? 1;
  uniforms.uUseEngravingMask.value = profile.usesEngravingMask ? 1 : 0;
  uniforms.uFoilTexture.value = getCardPlaceholderTexture();
  uniforms.uMaskTexture.value = getCardPlaceholderTexture();
  setCardEffectTextureUsage(mesh, profile.usesProceduralHolo ? 1 : 0, { immediate: true });
  updateCardEffectMaterialBlending(mesh, profile.effectMode);
}

function updateCardEffectMaterialBlending(mesh, effectMode) {
  const material = mesh?.material;
  const layer = mesh?.userData?.cardEffectLayer;
  if (!material || !layer) return;

  let nextBlending = layer === "glare"
    ? THREE.AdditiveBlending
    : THREE.NormalBlending;
  if (effectMode >= CARD_EFFECT_MODE_CARD_NFT_2_RARE_HOLO_V) {
    if (layer === "shine") {
      // The source applies color-dodge to both spectrum and trainer foil.
      nextBlending = effectMode >= CARD_EFFECT_MODE_CARD_NFT_2_REGULAR_HOLO
        && effectMode <= CARD_EFFECT_MODE_CARD_NFT_2_AMAZING_RARE
        ? THREE.AdditiveBlending
        : THREE.NormalBlending;
    } else {
      // The trainer profile uses multiply in mons.shop. Amazing Rare uses an
      // overlay pass, approximated separately with low-opacity normal blending.
      nextBlending = effectMode >= CARD_EFFECT_MODE_CARD_NFT_2_TRAINER_FULL_ART
        && effectMode < CARD_EFFECT_MODE_CARD_NFT_2_AMAZING_RARE
        ? THREE.MultiplyBlending
        : THREE.NormalBlending;
    }
  }
  if (material.blending === nextBlending) return;
  material.blending = nextBlending;
  material.needsUpdate = true;
}

function applyCardEffectTexturesToMesh(mesh, foilTexture, maskTexture, { immediate = false } = {}) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms) return;
  const texturesReady = Boolean(foilTexture && maskTexture);
  if (texturesReady) {
    warmTextureForImmediateDisplay(foilTexture);
    warmTextureForImmediateDisplay(maskTexture);
  }
  uniforms.uFoilTexture.value = foilTexture || getCardPlaceholderTexture();
  uniforms.uMaskTexture.value = maskTexture || getCardPlaceholderTexture();
  setCardEffectTextureUsage(mesh, texturesReady ? 1 : 0, {
    immediate: immediate || !texturesReady,
  });
}

function setCardEffectTextureUsage(mesh, target, { immediate = false } = {}) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms?.uUseEffectTextures) return;

  const nextTarget = clamp(target, 0, 1);
  const current = clamp(uniforms.uUseEffectTextures.value, 0, 1);
  mesh.userData.cardEffectTextureUsageStart = immediate ? nextTarget : current;
  mesh.userData.cardEffectTextureUsageTarget = nextTarget;
  mesh.userData.cardEffectTextureUsageStartedAt = performance.now();
  if (immediate) uniforms.uUseEffectTextures.value = nextTarget;
}

function updateCardEffectTextureUsage(mesh, now = performance.now()) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms?.uUseEffectTextures) return;

  const target = clamp(mesh.userData.cardEffectTextureUsageTarget ?? 0, 0, 1);
  const start = clamp(mesh.userData.cardEffectTextureUsageStart ?? target, 0, 1);
  if (uniforms.uUseEffectTextures.value === target) return;
  const progress = CARD_EFFECT_TEXTURE_FADE_MS <= 0
    ? 1
    : clamp(
      (now - (mesh.userData.cardEffectTextureUsageStartedAt || now))
        / CARD_EFFECT_TEXTURE_FADE_MS,
      0,
      1,
    );
  uniforms.uUseEffectTextures.value = THREE.MathUtils.lerp(
    start,
    target,
    easeOutCubic(progress),
  );
  if (progress >= 1) uniforms.uUseEffectTextures.value = target;
}

function applyLoadedIndividualCardEffect(card, textures = null, { immediate = false } = {}) {
  const frontProfile = getCardEffectProfile(card);
  const backProfile = getCardBackEffectProfile(frontProfile);

  applyCardEffectProfileToMesh(cardGradientMesh, frontProfile);
  applyCardEffectProfileToMesh(cardGlareMesh, frontProfile);
  applyCardEffectProfileToMesh(cardBackGradientMesh, backProfile);
  applyCardEffectProfileToMesh(cardBackGlareMesh, backProfile);
  if (frontProfile.needsEffectTextures) {
    applyCardEffectTexturesToMesh(cardGradientMesh, textures?.foil, textures?.mask, { immediate });
    applyCardEffectTexturesToMesh(cardGlareMesh, textures?.foil, textures?.mask, { immediate });
  }
}

function loadCardEffectTexturesForProfile(profile) {
  if (!profile?.needsEffectTextures) return Promise.resolve(null);
  return loadCardNft2EffectTextures(profile.cardNumber);
}

function preloadCardEffectTextures(card) {
  const profile = getCardEffectProfile(card);
  if (!profile.needsEffectTextures) return Promise.resolve(null);
  return loadCardEffectTexturesForProfile(profile).catch(() => null);
}

function prepareIndividualCardFor3D(card) {
  if (!card) {
    return Promise.resolve({
      frontTexture: null,
      backTexture: getBackPlaceholderTexture(),
      effectTextures: null,
    });
  }

  const key = getPreparedIndividualCardKey(card);
  if (preparedIndividualCardPromises.has(key)) {
    const promise = preparedIndividualCardPromises.get(key);
    preparedIndividualCardPromises.delete(key);
    preparedIndividualCardPromises.set(key, promise);
    return promise;
  }

  const promise = Promise.all([
    getPreparedCardTexture(card).catch((error) => {
      console.error(error);
      return null;
    }),
    getBackTexture(card).catch((error) => {
      console.error(error);
      return getBackPlaceholderTexture();
    }),
    preloadCardEffectTextures(card),
  ]).then(([frontTexture, backTexture, effectTextures]) => {
    const prepared = { frontTexture, backTexture, effectTextures };
    rememberPreparedIndividualCardResult(key, prepared);
    return prepared;
  });

  preparedIndividualCardPromises.set(key, promise);
  trimPreparedIndividualCardPromises();
  return promise;
}

function getPreparedIndividualCardKey(card) {
  return card?.stableId || `${card?.collection || ACTIVE_COLLECTION_ID}:${card?.mint || card?.title || card?.setIndex || card?.file || 0}`;
}

function trimPreparedIndividualCardPromises() {
  while (preparedIndividualCardPromises.size > MAX_PREPARED_INDIVIDUAL_CARDS) {
    const oldestKey = preparedIndividualCardPromises.keys().next().value;
    if (oldestKey === undefined) break;
    preparedIndividualCardPromises.delete(oldestKey);
    preparedIndividualCardResults.delete(oldestKey);
  }

  while (preparedIndividualCardResults.size > MAX_PREPARED_INDIVIDUAL_CARDS) {
    const oldestKey = preparedIndividualCardResults.keys().next().value;
    if (oldestKey === undefined) break;
    preparedIndividualCardResults.delete(oldestKey);
    preparedIndividualCardPromises.delete(oldestKey);
  }
}

function rememberPreparedIndividualCardResult(key, prepared) {
  preparedIndividualCardResults.delete(key);
  preparedIndividualCardResults.set(key, prepared);
  trimPreparedIndividualCardPromises();
}

function getPreparedIndividualCardResult(card) {
  if (!card) return null;
  const key = getPreparedIndividualCardKey(card);
  if (!preparedIndividualCardResults.has(key)) return null;
  const prepared = preparedIndividualCardResults.get(key);
  preparedIndividualCardResults.delete(key);
  preparedIndividualCardResults.set(key, prepared);
  return prepared;
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

async function transitionAdjacentCard(direction, loadingButton = null) {
  if (cardSwapAnimating || cardShuffleSpinAnimating || galleryOpen || !CARDS.length) return;

  cardSwapAnimating = true;
  const token = ++cardSwapToken;
  const nextIndex = getAdjacentIndividualCardIndex(direction);
  const nextCard = CARDS[nextIndex];
  setIndividualCardControlsDisabled(true);
  beginCardSwapButtonLoading(loadingButton, token);
  updateCardNameJumpState();
  try {
    if (token !== cardSwapToken) return;
    const {
      frontTexture: nextTexture,
      backTexture,
      effectTextures,
    } = await prepareIndividualCardFor3D(nextCard);
    if (token !== cardSwapToken) return;
    prepareCardSwapIncomingGroup(direction, nextTexture, backTexture, nextCard, effectTextures);
    await warmPreparedCardSwapIncomingGroup(token);
    if (token !== cardSwapToken) return;
    await tweenCardSwap(direction, nextIndex, nextTexture, backTexture, effectTextures, token);
  } finally {
    if (token === cardSwapToken) {
      cardSwapAnimating = false;
      resetCardSwapVisualState();
      endCardSwapButtonLoading(token);
      setIndividualCardControlsDisabled(false);
      updateCardNameJumpState();
    }
  }
}

function beginCardSwapButtonLoading(button, token) {
  clearCardSwapButtonLoading();
  if (!(button instanceof HTMLElement)) return;
  cardSwapLoadingButton = button;
  cardSwapLoadingTimer = window.setTimeout(() => {
    cardSwapLoadingTimer = 0;
    if (token !== cardSwapToken || !cardSwapAnimating || cardSwapLoadingButton !== button) return;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
  }, CARD_SWAP_LOADING_DELAY_MS);
}

function endCardSwapButtonLoading(token) {
  if (token !== cardSwapToken) return;
  clearCardSwapButtonLoading();
}

function clearCardSwapButtonLoading() {
  if (cardSwapLoadingTimer) {
    window.clearTimeout(cardSwapLoadingTimer);
    cardSwapLoadingTimer = 0;
  }
  if (cardSwapLoadingButton) {
    cardSwapLoadingButton.classList.remove("is-loading");
    cardSwapLoadingButton.setAttribute("aria-busy", "false");
    cardSwapLoadingButton = null;
  }
}

function beginBinderOpenCardButtonLoading(token) {
  clearBinderOpenCardButtonLoading();
  binderOpenCardLoadingToken = token;
  binderOpenCardLoadingTimer = window.setTimeout(() => {
    binderOpenCardLoadingTimer = 0;
    if (token !== binderOpenCardLoadingToken) return;
    els.binderOpenCardButton.classList.add("is-loading");
    els.binderOpenCardButton.setAttribute("aria-busy", "true");
  }, BINDER_OPEN_CARD_LOADING_DELAY_MS);
}

function markBinderOpenCardPrepared(token) {
  if (token !== binderOpenCardLoadingToken) return;
  if (els.binderOpenCardButton.classList.contains("is-loading")) return;
  if (!binderOpenCardLoadingTimer) return;
  window.clearTimeout(binderOpenCardLoadingTimer);
  binderOpenCardLoadingTimer = 0;
}

function endBinderOpenCardButtonLoading(token) {
  if (token !== binderOpenCardLoadingToken) return;
  clearBinderOpenCardButtonLoading();
}

function clearBinderOpenCardButtonLoading() {
  if (binderOpenCardLoadingTimer) {
    window.clearTimeout(binderOpenCardLoadingTimer);
    binderOpenCardLoadingTimer = 0;
  }
  els.binderOpenCardButton.classList.remove("is-loading");
  els.binderOpenCardButton.setAttribute("aria-busy", "false");
}

function beginCardShuffleButtonLoading(button, token) {
  clearCardShuffleButtonLoading();
  if (!(button instanceof HTMLElement)) return;
  cardShuffleLoadingButton = button;
  cardShuffleLoadingTimer = window.setTimeout(() => {
    cardShuffleLoadingTimer = 0;
    if (token !== cardShuffleSpinToken || !cardShuffleSpinAnimating || cardShuffleLoadingButton !== button) return;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
  }, CARD_SHUFFLE_LOADING_DELAY_MS);
}

function markCardShufflePrepared(token) {
  if (token !== cardShuffleSpinToken) return;
  if (!cardShuffleLoadingTimer) return;
  window.clearTimeout(cardShuffleLoadingTimer);
  cardShuffleLoadingTimer = 0;
}

function endCardShuffleButtonLoading(token) {
  if (token !== cardShuffleSpinToken) return;
  clearCardShuffleButtonLoading();
}

function clearCardShuffleButtonLoading() {
  if (cardShuffleLoadingTimer) {
    window.clearTimeout(cardShuffleLoadingTimer);
    cardShuffleLoadingTimer = 0;
  }
  if (!cardShuffleLoadingButton) return;
  cardShuffleLoadingButton.classList.remove("is-loading");
  cardShuffleLoadingButton.setAttribute("aria-busy", "false");
  cardShuffleLoadingButton = null;
}

function tweenCardSwap(direction, nextIndex, nextTexture, backTexture, effectTextures, token) {
  return new Promise((resolve) => {
    if (cardSwapTweenState?.resolve) {
      cardSwapTweenState.resolve();
    }
    cardSwapTweenState = {
      direction,
      nextIndex,
      nextTexture,
      backTexture,
      effectTextures,
      token,
      startedAt: performance.now(),
      resolve,
    };
  });
}

function updateCardSwapTween(now) {
  const state = cardSwapTweenState;
  if (!state) return;
  if (state.token !== cardSwapToken) {
    cardSwapTweenState = null;
    state.resolve();
    return;
  }

  const progress = clamp((now - state.startedAt) / CARD_SWAP_MS, 0, 1);
  const outgoingEase = easeOutCubic(progress);
  const incomingProgress = clamp((progress - 0.06) / 0.94, 0, 1);
  const incomingEase = easeOutCubic(incomingProgress);
  cardSwapOffsetX = -state.direction * CARD_SWAP_DISTANCE * outgoingEase;
  cardSwapIncomingOffsetX = state.direction * CARD_SWAP_DISTANCE * (1 - incomingEase);
  cardSwapOpacity = 1 - outgoingEase;
  cardSwapIncomingOpacity = THREE.MathUtils.lerp(CARD_SWAP_MIN_OPACITY, 1, incomingEase);
  applyCardSwapOpacity();

  if (progress < 1) return;

  promoteCardSwapIncomingGroup(state);
  cardSwapTweenState = null;
  state.resolve();
}

function promoteCardSwapIncomingGroup(state) {
  if (!cardSwapIncomingGroup) return;

  const oldCardGroup = cardGroup;
  const nextGroup = cardSwapIncomingGroup;
  updateCardSwapIncomingTransform();
  cardScene.remove(oldCardGroup);

  cardGroup = nextGroup;
  cardGroup.rotation.x = currentRotationX;
  cardGroup.rotation.y = currentRotationY + cardShuffleSpinY;
  cardGroup.scale.setScalar(getResponsiveIndividualCardScale());
  cardFrontMesh = nextGroup.userData.frontMesh || cardFrontMesh;
  cardBackMesh = nextGroup.userData.backMesh || cardBackMesh;
  cardFrontNoiseMesh = nextGroup.userData.frontNoiseMesh || cardFrontNoiseMesh;
  cardBackNoiseMesh = nextGroup.userData.backNoiseMesh || cardBackNoiseMesh;
  cardGradientMesh = nextGroup.userData.frontGradientMesh || cardGradientMesh;
  cardGlareMesh = nextGroup.userData.frontGlareMesh || cardGlareMesh;
  cardBackGradientMesh = nextGroup.userData.backGradientMesh || cardBackGradientMesh;
  cardBackGlareMesh = nextGroup.userData.backGlareMesh || cardBackGlareMesh;

  cardSwapIncomingGroup = null;
  cardSwapIncomingFrontMesh = null;
  lastAppliedCardSwapIncomingOpacity = Number.NaN;

  currentIndex = modulo(state.nextIndex, CARDS.length);
  cardApplyToken += 1;
  syncIndividualCardModel(
    CARDS[currentIndex],
    cardGroup,
    cardApplyToken,
    { load: true },
  );
  if (state.effectTextures) {
    applyLoadedIndividualCardEffect(CARDS[currentIndex], state.effectTextures, { immediate: true });
  } else {
    applyCardEffectProfile(CARDS[currentIndex], cardApplyToken);
  }
  resetViewSwitchWheelDistances();
  preloadAdjacentIndividualTextures(currentIndex);
  scheduleIndividualBinderSpreadPrewarm(currentIndex);

  targetRotationX = 0;
  targetRotationY = 0;
  releaseIndividualCardHoverTilt({ immediate: true });
  resetCardPan(true);
  cardGlossActivity = 0;
  cardSwapOffsetX = 0;
  cardSwapOpacity = 1;
  cardSwapIncomingOffsetX = 0;
  cardSwapIncomingOpacity = 0;
  lastAppliedCardSwapOpacity = Number.NaN;
  applyCardSwapOpacity({ force: true });
  setIndividualCardEffectOpacity(cardEffectViewOpacity);

  updateCardText();
  scheduleTraitUiPrewarm(
    CARDS[currentIndex]?.collection || ACTIVE_COLLECTION_ID,
  );
  renderTraitPanel();
  updateFavoriteButtons();
  queueSessionViewStateSave();

  disposeCardSwapGroup(oldCardGroup);
}

function prepareCardSwapIncomingGroup(direction, frontTexture, backTexture, card, effectTextures) {
  removeCardSwapIncomingGroup();
  cardSwapIncomingGroup = createCardSwapGroup(frontTexture, backTexture, card, effectTextures);
  cardSwapIncomingFrontMesh = cardSwapIncomingGroup.userData.frontMesh || null;
  cardSwapIncomingOffsetX = direction * CARD_SWAP_DISTANCE;
  cardSwapIncomingOpacity = CARD_SWAP_MIN_OPACITY;
  cardScene.add(cardSwapIncomingGroup);
  updateCardSwapIncomingTransform();
  applyCardSwapOpacity({ force: true });
}

async function warmPreparedCardSwapIncomingGroup(token) {
  if (!cardSwapIncomingGroup || token !== cardSwapToken) return;

  cardSwapIncomingGroup.traverse((object) => {
    object.frustumCulled = false;
  });
  updateCardSwapIncomingTransform();
  updateCardEffectUniformsForGroup(cardSwapIncomingGroup, performance.now() * 0.001);

  try {
    if (typeof cardRenderer.compileAsync === "function") {
      await cardRenderer.compileAsync(cardScene, cardCamera);
    } else if (typeof cardRenderer.compile === "function") {
      cardRenderer.compile(cardScene, cardCamera);
    }
  } catch {
    // The render warmup below still gives the incoming card a prepared frame.
  }
  if (token !== cardSwapToken || !cardSwapIncomingGroup) return;

  resizeCardRenderer();
  cardRenderer.render(cardScene, cardCamera);
  await nextAnimationFrame();
  if (token !== cardSwapToken || !cardSwapIncomingGroup) return;

  updateCardSwapIncomingTransform();
  updateCardEffectUniformsForGroup(cardSwapIncomingGroup, performance.now() * 0.001);
  cardRenderer.render(cardScene, cardCamera);
}

function createCardSwapGroup(frontTexture, backTexture, card = null, effectTextures = null) {
  const group = new THREE.Group();

  const core = new THREE.Mesh(
    createRoundedCoreGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_DEPTH, CARD_RADIUS),
    createCardCoreMaterial(),
  );
  group.add(core);

  const faceGeometry = createRoundedPlaneGeometry(CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  const frontMesh = new THREE.Mesh(
    faceGeometry,
    createCardFaceMaterial(frontTexture || getCardPlaceholderTexture()),
  );
  frontMesh.position.z = CARD_DEPTH / 2 + 0.003;
  frontMesh.renderOrder = 22;
  group.add(frontMesh);

  const backMesh = new THREE.Mesh(
    faceGeometry.clone(),
    createCardFaceMaterial(backTexture || getBackPlaceholderTexture()),
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
  const [frontGradientMesh, frontGlareMesh, backGradientMesh, backGlareMesh] = effectMeshes;

  group.userData.frontMesh = frontMesh;
  group.userData.backMesh = backMesh;
  group.userData.frontNoiseMesh = frontNoise;
  group.userData.backNoiseMesh = backNoise;
  group.userData.frontGradientMesh = frontGradientMesh || null;
  group.userData.frontGlareMesh = frontGlareMesh || null;
  group.userData.backGradientMesh = backGradientMesh || null;
  group.userData.backGlareMesh = backGlareMesh || null;
  group.userData.effectMeshes = effectMeshes;
  group.userData.proceduralCardChildren = [...group.children];
  applyCardAspectFitToGroup(group, card);
  return group;
}

function syncIndividualCardModel(
  card,
  group,
  applyToken,
  { load = true } = {},
) {
  const requestToken = (group?.userData?.individualCardModelToken || 0) + 1;
  if (!group) return Promise.resolve(false);
  group.userData.individualCardModelToken = requestToken;
  removeIndividualCardModel(group);
  const modelPath = String(card?.model || "").trim();
  const hideProceduralWhileLoading = load
    && modelPath
    && getIndividualCardModelRenderingProfile(card) === INDIVIDUAL_CARD_CLEAR_RESIN_PROFILE;
  setProceduralCardGroupVisible(group, !hideProceduralWhileLoading);
  resetIndividualCardModelRenderingProfile();
  els.cardCanvas.dataset.modelState = "none";
  delete els.cardCanvas.dataset.model;
  updateIndividualCardTransmissionBackdrop();

  if (!modelPath || !load) {
    const unavailablePromise = Promise.resolve(false);
    group.userData.individualCardModelReadyPromise = unavailablePromise;
    return unavailablePromise;
  }
  const modelUrl = new URL(modelPath, import.meta.url).href;
  els.cardCanvas.dataset.modelState = "loading";

  const readyPromise = Promise.all([
    loadIndividualCardModelSource(modelUrl),
    prepareIndividualCardModelRenderingProfile(card),
  ])
    .then(async ([source]) => {
      if (
        group !== cardGroup
        || applyToken !== cardApplyToken
        || group.userData.individualCardModelToken !== requestToken
        || CARDS[currentIndex] !== card
      ) {
        return false;
      }

      const modelRoot = createIndividualCardModelInstance(source);
      group.userData.individualCardModelRoot = modelRoot;
      group.add(modelRoot);
      setProceduralCardGroupVisible(group, false);
      applyIndividualCardModelRenderingProfile(card);
      updateIndividualCardTransmissionBackdrop();

      try {
        resizeCardRenderer();
        if (typeof cardRenderer.compileAsync === "function") {
          await cardRenderer.compileAsync(cardScene, cardCamera);
        } else if (typeof cardRenderer.compile === "function") {
          cardRenderer.compile(cardScene, cardCamera);
        }
        cardRenderer.render(cardScene, cardCamera);
        await nextAnimationFrame();
      } catch {
        // The normal render loop remains a safe fallback if eager preparation fails.
      }
      if (
        group !== cardGroup
        || applyToken !== cardApplyToken
        || group.userData.individualCardModelToken !== requestToken
        || CARDS[currentIndex] !== card
      ) {
        return false;
      }

      els.cardCanvas.dataset.modelState = "ready";
      els.cardCanvas.dataset.model = modelUrl;
      startCardRenderLoop();
      return true;
    })
    .catch((error) => {
      if (group.userData.individualCardModelToken !== requestToken) return false;
      console.warn(`Unable to load individual card model: ${modelPath}`, error);
      setProceduralCardGroupVisible(group, true);
      resetIndividualCardModelRenderingProfile();
      els.cardCanvas.dataset.modelState = "error";
      updateIndividualCardTransmissionBackdrop();
      return false;
    });
  group.userData.individualCardModelReadyPromise = readyPromise;
  return readyPromise;
}

function prewarmIndividualCardModelAssets(card) {
  const modelPath = String(card?.model || "").trim();
  if (!modelPath) return Promise.resolve(false);
  const modelUrl = new URL(modelPath, import.meta.url).href;
  return Promise.all([
    loadIndividualCardModelSource(modelUrl),
    prepareIndividualCardModelRenderingProfile(card),
  ]).then(() => true);
}

function loadIndividualCardModelSource(url) {
  if (individualCardModelSourcePromises.has(url)) {
    return individualCardModelSourcePromises.get(url);
  }

  if (!individualCardModelLoaderModulesPromise) {
    individualCardModelLoaderModulesPromise = Promise.all([
      import("./vendor/GLTFLoader.js?v=three-r165-gltf-1"),
      import("./vendor/DRACOLoader.js?v=three-r165-draco-1"),
    ]);
  }

  const promise = individualCardModelLoaderModulesPromise
    .then(([{ GLTFLoader }, { DRACOLoader }]) => {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(INDIVIDUAL_CARD_DRACO_DECODER_PATH);
      dracoLoader.setWorkerLimit(1);
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      return loader.loadAsync(url).finally(() => dracoLoader.dispose());
    })
    .then((gltf) => {
      if (!gltf?.scene) throw new Error("The GLB does not contain a scene");
      return gltf.scene;
    })
    .catch((error) => {
      individualCardModelSourcePromises.delete(url);
      throw error;
    });

  individualCardModelSourcePromises.set(url, promise);
  return promise;
}

function createIndividualCardModelInstance(source) {
  const model = source.clone(true);
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry = object.geometry.clone();
    object.material = Array.isArray(object.material)
      ? object.material.map((material) => material.clone())
      : object.material.clone();
    object.castShadow = false;
    object.receiveShadow = false;
    object.frustumCulled = true;
  });

  let bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = Math.min(
    CARD_WIDTH * INDIVIDUAL_CARD_MODEL_SCALE / Math.max(0.001, size.x),
    CARD_HEIGHT * INDIVIDUAL_CARD_MODEL_SCALE / Math.max(0.001, size.y),
  );
  model.scale.setScalar(scale);
  bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  model.position.sub(center);

  const root = new THREE.Group();
  root.name = "individual-card-model";
  root.add(model);
  return root;
}

function getIndividualCardModelRenderingProfile(card) {
  return String(card?.modelRenderProfile || "").trim();
}

function prepareIndividualCardModelRenderingProfile(card) {
  if (getIndividualCardModelRenderingProfile(card) !== INDIVIDUAL_CARD_CLEAR_RESIN_PROFILE) {
    return Promise.resolve(null);
  }
  if (cardClearResinEnvironmentTarget) {
    return Promise.resolve(cardClearResinEnvironmentTarget);
  }
  if (!cardClearResinEnvironmentPromise) {
    cardClearResinEnvironmentPromise = import(
      "./vendor/RoomEnvironment.js?v=three-r165-room-env-1"
    )
      .then(({ RoomEnvironment }) => {
        const roomEnvironment = new RoomEnvironment();
        const pmremGenerator = new THREE.PMREMGenerator(cardRenderer);
        pmremGenerator.compileEquirectangularShader();
        const environmentTarget = pmremGenerator.fromScene(roomEnvironment);
        roomEnvironment.dispose();
        pmremGenerator.dispose();
        cardClearResinEnvironmentTarget = environmentTarget;
        return environmentTarget;
      })
      .catch((error) => {
        cardClearResinEnvironmentPromise = null;
        throw error;
      });
  }
  return cardClearResinEnvironmentPromise;
}

function applyIndividualCardModelRenderingProfile(card) {
  const profile = getIndividualCardModelRenderingProfile(card);
  activeIndividualCardModelRenderProfile = profile;
  const isClearResin = profile === INDIVIDUAL_CARD_CLEAR_RESIN_PROFILE;
  for (const light of cardDefaultLights) light.visible = !isClearResin;
  for (const light of cardClearResinLights) light.visible = isClearResin;

  if (isClearResin) {
    updateIndividualCardClearResinPointLight();
    cardRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    cardRenderer.toneMappingExposure = 1.25;
    cardScene.environment = cardClearResinEnvironmentTarget?.texture || null;
    cardScene.environmentIntensity = 1;
    cardScene.environmentRotation.set(
      0,
      THREE.MathUtils.degToRad(INDIVIDUAL_CARD_CLEAR_ENVIRONMENT_ROTATION_DEG),
      0,
    );
  } else {
    cardRenderer.toneMapping = THREE.NoToneMapping;
    cardRenderer.toneMappingExposure = 1;
    cardScene.environment = null;
    cardScene.environmentIntensity = 1;
    cardScene.environmentRotation.set(0, 0, 0);
  }

  cardScene.traverse((object) => {
    if (!object.isMesh && !object.isPoints) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material.needsUpdate = true;
  });
  updateIndividualCardTransmissionBackdrop();
}

function resetIndividualCardModelRenderingProfile() {
  applyIndividualCardModelRenderingProfile(null);
}

function updateIndividualCardClearResinPointLight() {
  if (!cardClearResinPointLight) return;
  if (els.body.classList.contains("is-light")) {
    cardClearResinPointLight.position.set(-6.5, 1.2, 3);
  } else {
    cardClearResinPointLight.position.set(-3.9, 5.5, 3);
  }
}

function removeIndividualCardModel(group) {
  const modelRoot = group?.userData?.individualCardModelRoot;
  if (!modelRoot) return;
  group.remove(modelRoot);
  disposeCardSwapGroup(modelRoot);
  group.userData.individualCardModelRoot = null;
}

function setProceduralCardGroupVisible(group, visible) {
  for (const child of group?.userData?.proceduralCardChildren || []) {
    child.visible = visible;
  }
}

function updateIndividualCardTransmissionBackdrop() {
  if (!cardTransmissionBackdrop) return;
  cardTransmissionBackdrop.visible = Boolean(
    cardGroup?.userData?.individualCardModelRoot
      && activeIndividualCardModelRenderProfile === INDIVIDUAL_CARD_CLEAR_RESIN_PROFILE,
  );
}

function createCardCoreMaterial() {
  return stabilizeCardTransitionMaterial(new THREE.MeshPhysicalMaterial({
    color: 0x14110e,
    roughness: 0.64,
    metalness: 0.02,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
  }));
}

function createCardFaceMaterial(texture) {
  return stabilizeCardTransitionMaterial(new THREE.MeshBasicMaterial({
    map: texture || getCardPlaceholderTexture(),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  }));
}

function stabilizeCardTransitionMaterial(material) {
  material.transparent = true;
  material.depthWrite = false;
  material.userData.baseTransparent = true;
  material.userData.transitionTransparencyLocked = true;
  return material;
}

function createCardSwapEffectMeshes(card, effectTextures = null) {
  const frontProfile = getCardEffectProfile(card);
  const backProfile = getCardBackEffectProfile(frontProfile);

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
    applyCardEffectTexturesToMesh(
      frontGradient,
      effectTextures?.foil,
      effectTextures?.mask,
      { immediate: true },
    );
    applyCardEffectTexturesToMesh(
      frontGlare,
      effectTextures?.foil,
      effectTextures?.mask,
      { immediate: true },
    );
  }

  return [frontGradient, frontGlare, backGradient, backGlare];
}

function getPreparedCardTexture(card) {
  return getCardTexture(card, { fetchPriority: "high" }).then((texture) => {
    prepareTextureForImmediateDisplay(texture);
    return texture;
  });
}

function preloadAdjacentIndividualTextures(index) {
  cancelIndividualCardPrewarmQueue();
  if (CARDS.length < 2) return;
  const sequence = getIndividualCardSequenceIndexes();
  const position = sequence.indexOf(index);
  if (position === -1 || sequence.length < 2) return;

  const indexes = getNearbyIndividualCardPrewarmIndexes(sequence, position);
  if (!indexes.length) return;

  const token = ++individualCardPrewarmToken;
  preloadNextIndividualCardTexture(indexes, token);
}

function getNearbyIndividualCardPrewarmIndexes(sequence, position) {
  const indexes = [];
  const seen = new Set([sequence[position]]);
  const radius = Math.min(INDIVIDUAL_CARD_PREWARM_RADIUS, sequence.length - 1);

  for (let distance = 1; distance <= radius; distance += 1) {
    const previous = sequence[modulo(position - distance, sequence.length)];
    if (!seen.has(previous)) {
      seen.add(previous);
      indexes.push(previous);
    }

    const next = sequence[modulo(position + distance, sequence.length)];
    if (!seen.has(next)) {
      seen.add(next);
      indexes.push(next);
    }
  }

  return indexes;
}

function preloadNextIndividualCardTexture(indexes, token, offset = 0) {
  if (token !== individualCardPrewarmToken || offset >= indexes.length) return;

  const card = CARDS[indexes[offset]];
  Promise.resolve()
    .then(() => prepareIndividualCardFor3D(card))
    .then(({ frontTexture, backTexture, effectTextures }) => {
      prewarmIndividualCardEffect(card, frontTexture, backTexture, effectTextures);
    })
    .catch(() => {})
    .finally(() => {
      if (token !== individualCardPrewarmToken) return;
      individualCardPrewarmTimer = window.setTimeout(() => {
        individualCardPrewarmTimer = 0;
        preloadNextIndividualCardTexture(indexes, token, offset + 1);
      }, INDIVIDUAL_CARD_PREWARM_STEP_DELAY_MS);
    });
}

function cancelIndividualCardPrewarmQueue() {
  individualCardPrewarmToken += 1;
  if (!individualCardPrewarmTimer) return;
  window.clearTimeout(individualCardPrewarmTimer);
  individualCardPrewarmTimer = 0;
}

function scheduleIndividualBinderSpreadPrewarm(cardIndex = currentIndex) {
  cancelIndividualBinderSpreadPrewarm();
  if (galleryOpen || !Number.isInteger(cardIndex) || !CARDS[cardIndex]) return;

  const sequence = getVisibleIndexes();
  const position = sequence.indexOf(cardIndex);
  if (position === -1) return;

  const indexes = getIndividualBinderSpreadPrewarmIndexes(sequence, position);
  if (!indexes.length) return;

  individualBinderSpreadPrewarmKeys = new Set(
    indexes.map((index) => textureAssetPath(CARDS[index])),
  );
  const token = ++individualBinderSpreadPrewarmToken;

  prepareIndividualCardFor3D(CARDS[cardIndex])
    .catch(() => null)
    .then(() => {
      if (
        token !== individualBinderSpreadPrewarmToken
        || galleryOpen
        || currentIndex !== cardIndex
      ) {
        return;
      }

      const run = () => {
        individualBinderSpreadPrewarmIdleCallback = 0;
        individualBinderSpreadPrewarmTimer = 0;
        if (
          token !== individualBinderSpreadPrewarmToken
          || galleryOpen
          || currentIndex !== cardIndex
        ) {
          return;
        }
        prewarmIndividualBinderSpread(indexes, token).catch(() => {});
      };

      if (typeof window.requestIdleCallback === "function") {
        individualBinderSpreadPrewarmIdleCallback = window.requestIdleCallback(run, {
          timeout: INDIVIDUAL_BINDER_SPREAD_PREWARM_IDLE_TIMEOUT_MS,
        });
      } else {
        individualBinderSpreadPrewarmTimer = window.setTimeout(
          run,
          INDIVIDUAL_BINDER_SPREAD_PREWARM_FALLBACK_DELAY_MS,
        );
      }
    });
}

function getIndividualBinderSpreadPrewarmIndexes(sequence, position) {
  if (!Array.isArray(sequence) || !sequence.length || position < 0 || position >= sequence.length) {
    return [];
  }

  const pageCount = Math.max(1, Math.ceil(sequence.length / BINDER_PAGE_SLOTS));
  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const sideSlot = position % BINDER_PAGE_SLOTS;
  const turn = clamp(
    pageIndex + (sideSlot >= BINDER_SIDE_SLOTS ? 1 : 0),
    0,
    pageCount,
  );
  const positions = [];
  const addSide = (targetPageIndex, backSide) => {
    if (targetPageIndex < 0 || targetPageIndex >= pageCount) return;
    const start = targetPageIndex * BINDER_PAGE_SLOTS
      + (backSide ? BINDER_SIDE_SLOTS : 0);
    for (let slot = 0; slot < BINDER_SIDE_SLOTS; slot += 1) {
      const targetPosition = start + slot;
      if (targetPosition < sequence.length) positions.push(targetPosition);
    }
  };

  if (turn <= 0) {
    addSide(0, false);
  } else if (turn >= pageCount) {
    addSide(pageCount - 1, true);
  } else {
    addSide(turn - 1, true);
    addSide(turn, false);
  }

  positions.sort((a, b) => (
    (a === position ? -1 : b === position ? 1 : 0)
    || Math.abs(a - position) - Math.abs(b - position)
  ));
  return positions.map((targetPosition) => sequence[targetPosition]);
}

async function prewarmIndividualBinderSpread(indexes, token) {
  let offset = 0;
  const worker = async () => {
    while (
      token === individualBinderSpreadPrewarmToken
      && !galleryOpen
      && offset < indexes.length
    ) {
      const cardIndex = indexes[offset];
      offset += 1;
      if (!Number.isInteger(cardIndex) || !CARDS[cardIndex]) continue;
      try {
        await getBinderTexture(CARDS[cardIndex]);
      } catch {
        // The visible binder queue retains its normal retry behavior.
      }
    }
  };

  const workerCount = Math.min(
    INDIVIDUAL_BINDER_SPREAD_PREWARM_CONCURRENCY,
    indexes.length,
  );
  await Promise.all(Array.from({ length: workerCount }, worker));
}

function cancelIndividualBinderSpreadPrewarm({ preserveProtectedKeys = false } = {}) {
  individualBinderSpreadPrewarmToken += 1;
  if (
    individualBinderSpreadPrewarmIdleCallback
    && typeof window.cancelIdleCallback === "function"
  ) {
    window.cancelIdleCallback(individualBinderSpreadPrewarmIdleCallback);
  }
  if (individualBinderSpreadPrewarmTimer) {
    window.clearTimeout(individualBinderSpreadPrewarmTimer);
  }
  individualBinderSpreadPrewarmIdleCallback = 0;
  individualBinderSpreadPrewarmTimer = 0;
  if (!preserveProtectedKeys) individualBinderSpreadPrewarmKeys = new Set();
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
  if (favoritesOnly || walletFilterCardIndexSet || activeTraitFilter) {
    const visibleIndexes = getVisibleIndexes();
    if (visibleIndexes.length) return visibleIndexes;
  }
  return ACTIVE_COLLECTION_INDEXES;
}

function resetCardSwapVisualState() {
  cardSwapTweenState = null;
  cardSwapOffsetX = 0;
  cardSwapOpacity = 1;
  cardSwapIncomingOffsetX = 0;
  cardSwapIncomingOpacity = 0;
  applyCardSwapOpacity({ force: true });
  removeCardSwapIncomingGroup();
}

function setIndividualCardControlsDisabled(disabled) {
  els.cardBinderReturnButton.disabled = disabled;
  els.previousButton.disabled = disabled;
  els.nextButton.disabled = disabled;
  els.shuffleButton.disabled = disabled;
}

function applyCardSwapOpacity(options = {}) {
  const force = Boolean(options.force);
  if (force || Math.abs(cardSwapOpacity - lastAppliedCardSwapOpacity) > 0.0005) {
    applyCardGroupOpacity(cardGroup, cardSwapOpacity, { forceTransparent: cardSwapAnimating });
    lastAppliedCardSwapOpacity = cardSwapOpacity;
  }
  if (force || Math.abs(cardSwapIncomingOpacity - lastAppliedCardSwapIncomingOpacity) > 0.0005) {
    applyCardGroupOpacity(cardSwapIncomingGroup, cardSwapIncomingOpacity, { forceTransparent: cardSwapAnimating });
    lastAppliedCardSwapIncomingOpacity = cardSwapIncomingOpacity;
  }
}

function applyCardGroupOpacity(group, opacityValue, options = {}) {
  if (!group) return;

  const forceTransparent = Boolean(options.forceTransparent);
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
      const nextTransparent = material.userData.transitionTransparencyLocked
        || material.userData.baseTransparent
        || forceTransparent
        || opacity < 0.999;
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
  lastAppliedCardSwapIncomingOpacity = Number.NaN;
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

  await spinToCard(next, { recordHistory: true, loadingButton: els.shuffleButton });
}

async function spinToCard(nextIndex, { recordHistory = false, loadingButton = null } = {}) {
  if (CARDS.length < 2 || cardSwapAnimating || cardShuffleSpinAnimating || galleryOpen) return false;

  const targetIndex = clamp(nextIndex, 0, CARDS.length - 1);
  if (targetIndex === currentIndex) return false;
  const targetCard = CARDS[targetIndex];

  if (recordHistory) {
    shuffleHistory.push(currentIndex);
    if (shuffleHistory.length > SHUFFLE_HISTORY_LIMIT) shuffleHistory.shift();
  }

  cardShuffleSpinAnimating = true;
  cardShuffleGlossOpacity = 0;
  const token = ++cardShuffleSpinToken;
  setIndividualCardControlsDisabled(true);
  updateCardNameJumpState();
  dragState = null;
  targetRotationX = 0;
  targetRotationY = 0;
  beginCardShuffleButtonLoading(loadingButton, token);

  try {
    let preparedResult = getPreparedIndividualCardResult(targetCard);
    const preparedPromise = prepareIndividualCardFor3D(targetCard)
      .then((result) => {
        preparedResult = result;
        return result;
      })
      .catch((error) => {
        console.error(error);
        return null;
      });
    if (!preparedResult && getCardEffectProfile(targetCard).needsEffectTextures) {
      preparedResult = await preparedPromise;
      if (token !== cardShuffleSpinToken) return false;
    }
    const frontTexture = preparedResult?.frontTexture || (
      await getPreparedCardTexture(targetCard).catch((error) => {
        console.error(error);
        return null;
      })
    );
    if (preparedResult) {
      prewarmIndividualCardEffect(
        targetCard,
        preparedResult.frontTexture,
        preparedResult.backTexture,
        preparedResult.effectTextures,
      );
    }
    markCardShufflePrepared(token);
    if (token !== cardShuffleSpinToken) return false;

    await tweenCardShuffleSpin(
      targetIndex,
      frontTexture,
      preparedResult?.effectTextures || null,
      token,
    );
    if (token !== cardShuffleSpinToken) return false;
    preparedResult = preparedResult || getPreparedIndividualCardResult(targetCard);
    const cardOptions = {
      frontTexture: preparedResult?.frontTexture || frontTexture,
      preserveSpinVisuals: true,
    };
    if (preparedResult?.backTexture) cardOptions.backTexture = preparedResult.backTexture;
    if (preparedResult) cardOptions.effectTextures = preparedResult.effectTextures;
    setCard(targetIndex, cardOptions);
    return true;
  } finally {
    if (token === cardShuffleSpinToken) {
      resetCardShuffleSpinVisualState();
      cardShuffleSpinAnimating = false;
      endCardShuffleButtonLoading(token);
      setIndividualCardControlsDisabled(false);
      updateCardNameJumpState();
    }
  }
}

function goBackInShuffleHistory() {
  const previous = shuffleHistory.pop();
  if (Number.isInteger(previous)) setCard(previous);
}

function initScreensaverHoldButton(button) {
  if (!button) return;
  button.addEventListener("pointerdown", startScreensaverHold);
  button.addEventListener("pointermove", moveScreensaverHold);
  button.addEventListener("pointerup", finishScreensaverHold);
  button.addEventListener("pointercancel", cancelScreensaverHold);
  button.addEventListener("lostpointercapture", finishScreensaverHold);
}

function getDocumentFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

async function requestScreensaverFullscreen() {
  if (getDocumentFullscreenElement()) return false;
  const root = document.documentElement;
  const requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen;
  if (typeof requestFullscreen !== "function") return false;

  screensaverFullscreenRequested = true;
  try {
    await requestFullscreen.call(root);
    screensaverFullscreenRequested = false;
    screensaverOwnsFullscreen = getDocumentFullscreenElement() === root;
    if (screensaverOwnsFullscreen && !screensaverActive && !screensaverPreparing) {
      await exitScreensaverFullscreen();
    }
    return screensaverOwnsFullscreen;
  } catch {
    screensaverFullscreenRequested = false;
    screensaverOwnsFullscreen = false;
    return false;
  }
}

async function exitScreensaverFullscreen() {
  if (!screensaverOwnsFullscreen && !screensaverFullscreenRequested) return false;
  screensaverFullscreenRequested = false;
  screensaverOwnsFullscreen = false;
  if (!getDocumentFullscreenElement()) return false;

  const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
  if (typeof exitFullscreen !== "function") return false;
  try {
    await exitFullscreen.call(document);
    return true;
  } catch {
    return false;
  }
}

function startScreensaverHold(event) {
  const button = event.currentTarget;
  if (
    screensaverActive
    || screensaverPreparing
    || button?.disabled
    || event.button !== 0
    || !event.isPrimary
  ) {
    return;
  }

  cancelScreensaverHold();
  screensaverHoldState = {
    button,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    timer: 0,
    triggered: false,
  };
  button.classList.add("is-screensaver-hold");
  button.setAttribute("aria-label", "Hold to start card rain");
  try {
    button.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is best-effort; movement and release listeners still cancel the hold.
  }

  screensaverPrewarmTimer = window.setTimeout(() => {
    screensaverPrewarmTimer = 0;
    screensaverPrewarmPromise = prewarmScreensaverMode().catch((error) => {
      console.error("Screensaver prewarm failed", error);
      return false;
    });
  }, SCREENSAVER_PREWARM_DELAY_MS);

  screensaverHoldState.timer = window.setTimeout(() => {
    const state = screensaverHoldState;
    if (!state || state.pointerId !== event.pointerId) return;
    state.timer = 0;
    state.triggered = true;
    state.button.classList.remove("is-screensaver-hold");
    state.button.classList.add("is-screensaver-confirmed");
    screensaverActivationButton = state.button;
    screensaverSuppressedButton = state.button;
    screensaverSuppressedClickUntil = performance.now() + 1200;
    const fullscreenPromise = requestScreensaverFullscreen();
    activateScreensaverMode({ fullscreenPromise }).catch((error) => {
      console.error("Screensaver activation failed", error);
      screensaverPreparing = false;
      void exitScreensaverFullscreen();
      state.button.classList.remove("is-screensaver-confirmed");
      restoreShuffleButtonLabel(state.button);
      if (screensaverActivationButton === state.button) screensaverActivationButton = null;
    });
  }, SCREENSAVER_HOLD_MS);
}

function moveScreensaverHold(event) {
  const state = screensaverHoldState;
  if (!state || state.pointerId !== event.pointerId || state.triggered) return;
  const distance = Math.hypot(
    event.clientX - state.startX,
    event.clientY - state.startY,
  );
  if (distance > SCREENSAVER_HOLD_MOVE_LIMIT) cancelScreensaverHold(event);
}

function finishScreensaverHold(event) {
  const state = screensaverHoldState;
  if (!state || (event?.pointerId != null && event.pointerId !== state.pointerId)) return;
  if (state.triggered) {
    releaseScreensaverHoldPointer(state);
    screensaverHoldState = null;
    return;
  }
  cancelScreensaverHold(event);
}

function cancelScreensaverHold(event = null) {
  const state = screensaverHoldState;
  if (
    state
    && event?.pointerId != null
    && event.pointerId !== state.pointerId
  ) {
    return;
  }

  if (screensaverPrewarmTimer) {
    window.clearTimeout(screensaverPrewarmTimer);
    screensaverPrewarmTimer = 0;
  }
  if (!state) return;
  if (state.timer) window.clearTimeout(state.timer);
  state.button.classList.remove("is-screensaver-hold", "is-screensaver-confirmed");
  restoreShuffleButtonLabel(state.button);
  releaseScreensaverHoldPointer(state);
  screensaverHoldState = null;
}

function releaseScreensaverHoldPointer(state) {
  try {
    if (state.button.hasPointerCapture(state.pointerId)) {
      state.button.releasePointerCapture(state.pointerId);
    }
  } catch {
    // The browser can release capture before lostpointercapture is delivered.
  }
}

function restoreShuffleButtonLabel(button) {
  if (button === els.shuffleButton) {
    button.setAttribute("aria-label", "Shuffle card");
  } else if (button === els.binderShuffleButton) {
    button.setAttribute("aria-label", "Shuffle binder spread");
  }
}

function consumeScreensaverHoldClick(button) {
  if (
    button !== screensaverSuppressedButton
    || performance.now() > screensaverSuppressedClickUntil
  ) {
    return false;
  }
  screensaverSuppressedButton = null;
  screensaverSuppressedClickUntil = 0;
  return true;
}

function getScreensaverCollectionIds() {
  if (WALLET_ROUTE_ADDRESS) {
    return [...new Set(
      (walletFilterCardIndexes || [])
        .map((index) => CARDS[index]?.collection)
        .filter((collectionId) => COLLECTION_CONFIGS[collectionId]),
    )];
  }
  return usesEvilBinderPresentation()
    ? ["cardnft1", "cardnft2", "poncho"]
    : [ACTIVE_COLLECTION_ID];
}

async function getScreensaverCardIndexes() {
  const collectionIds = getScreensaverCollectionIds();
  if (WALLET_ROUTE_ADDRESS) {
    return {
      collectionIds,
      indexes: (walletFilterCardIndexes || []).slice(),
    };
  }
  await Promise.all(collectionIds.map(ensureCollectionCards));
  return {
    collectionIds,
    indexes: collectionIds.flatMap((collectionId) => (
      COLLECTION_CONFIGS[collectionId]?.globalIndexes || []
    )),
  };
}

function ensureScreensaverScene() {
  if (screensaverRenderer && screensaverScene && screensaverCamera) return;

  if (!screensaverOverlay) {
    screensaverOverlay = document.createElement("div");
    screensaverOverlay.className = "card-rain-screensaver";
    screensaverOverlay.setAttribute("aria-hidden", "true");
    screensaverCanvas = document.createElement("canvas");
    screensaverCanvas.className = "card-rain-screensaver-canvas";
    screensaverOverlay.append(screensaverCanvas);
    document.body.append(screensaverOverlay);
  }

  screensaverRenderer = new THREE.WebGLRenderer({
    canvas: screensaverCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  screensaverRenderer.setPixelRatio(
    getRendererPixelRatio(getAppViewportWidth(), getAppViewportHeight()),
  );
  screensaverRenderer.outputColorSpace = THREE.SRGBColorSpace;
  screensaverRenderer.setClearColor(0x000000, 0);
  screensaverWarmupTarget = new THREE.WebGLRenderTarget(
    SCREENSAVER_WARMUP_TARGET_SIZE,
    SCREENSAVER_WARMUP_TARGET_SIZE,
    {
      depthBuffer: true,
      stencilBuffer: false,
    },
  );

  screensaverScene = new THREE.Scene();
  screensaverWarmupScene = new THREE.Scene();
  screensaverCamera = new THREE.PerspectiveCamera(
    SCREENSAVER_CAMERA_FOV,
    1,
    0.1,
    100,
  );
  screensaverCamera.position.set(0, 0, SCREENSAVER_CAMERA_Z);
  addScreensaverSceneLights(screensaverScene);
  addScreensaverSceneLights(screensaverWarmupScene);

  screensaverCanvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    stopScreensaverAnimation();
  }, { passive: false });
  screensaverCanvas.addEventListener("webglcontextrestored", () => {
    refreshSceneGpuResources(screensaverScene);
    refreshSceneGpuResources(screensaverWarmupScene);
    screensaverRenderer?.resetState();
    if (screensaverActive) startScreensaverAnimation();
  });
  resizeScreensaverRenderer(true);
}

function addScreensaverSceneLights(scene) {
  const ambient = new THREE.HemisphereLight(0xffffff, 0x211a14, 1.16);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff2d4, 1.62);
  key.position.set(-4.4, 5.4, 6.2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9ebfd5, 0.78);
  rim.position.set(4.6, 1.2, -3.4);
  scene.add(rim);
}

async function prewarmScreensaverMode() {
  ensureScreensaverScene();
  const { collectionIds, indexes } = await getScreensaverCardIndexes();
  if (!indexes.length) return false;

  const sourceKey = `${collectionIds.join(",")}:${indexes.length}`;
  screensaverOverlay.dataset.collectionIds = collectionIds.join(",");
  screensaverOverlay.dataset.cardCount = String(indexes.length);
  screensaverOverlay.dataset.maximumCards = String(SCREENSAVER_MAX_CARD_COUNT);
  screensaverOverlay.dataset.spawnIntervalMs = String(SCREENSAVER_SPAWN_INTERVAL_MS);
  screensaverOverlay.dataset.spawnIntervalJitter = String(SCREENSAVER_SPAWN_INTERVAL_JITTER);
  screensaverOverlay.dataset.depthJitter = String(SCREENSAVER_DEPTH_JITTER);
  screensaverOverlay.dataset.pointerForce = String(SCREENSAVER_POINTER_FORCE);
  screensaverOverlay.dataset.pointerWakeDurationMs = String(
    SCREENSAVER_POINTER_WAKE_DURATION_MS,
  );
  screensaverOverlay.dataset.pointerWakeCapacity = String(
    SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY,
  );
  screensaverOverlay.dataset.collectionSampling = collectionIds.length > 1 ? "weighted" : "active";
  screensaverOverlay.dataset.ponchoSpawnShare = (
    collectionIds.length > 1 && collectionIds.includes("poncho")
  ) ? "0.25" : "0";
  screensaverOverlay.dataset.cardNft1AnimatedSpawnChance = (
    collectionIds.length > 1 && collectionIds.includes("cardnft1")
  ) ? String(SCREENSAVER_CARDNFT1_ANIMATED_SPAWN_CHANCE) : "0";
  delete screensaverOverlay.dataset.selectedCardIndex;
  delete screensaverOverlay.dataset.selectedCardCollection;
  delete screensaverOverlay.dataset.selectedCardStableId;
  delete screensaverOverlay.dataset.selectedCardPath;
  if (screensaverSourceKey !== sourceKey) {
    clearScreensaverCards({ includeReady: true });
    screensaverSourceKey = sourceKey;
    screensaverCardIndexes = [...indexes];
    screensaverCardBag = [];
    screensaverSourceCollectionIds = [...collectionIds];
    screensaverCollectionCardBags.clear();
    screensaverCollectionPickBag = [];
    screensaverCardNft1AnimatedIndexes = (
      COLLECTION_CONFIGS.cardnft1?.globalIndexes || []
    ).filter((index) => isAnimatedCard(CARDS[index]));
    screensaverCardNft1AnimatedBag = [];
    screensaverSpawnTrackBag = [];
    screensaverLastSpawnTrackKey = "";
    screensaverSpawnSequence = 0;
    screensaverPrepareToken += 1;
  }
  screensaverOverlay.dataset.cardNft1AnimatedPool = String(
    screensaverCardNft1AnimatedIndexes.length,
  );

  const token = screensaverPrepareToken;
  const targetCount = Math.min(SCREENSAVER_PREWARM_CARD_COUNT, indexes.length);
  while (
    token === screensaverPrepareToken
    && screensaverReadyCards.length < targetCount
  ) {
    const batchSize = Math.min(
      SCREENSAVER_PREPARE_CONCURRENCY,
      targetCount - screensaverReadyCards.length,
    );
    await Promise.all(
      Array.from({ length: batchSize }, () => prepareScreensaverCardGroup(token)),
    );
  }
  return screensaverReadyCards.length > 0;
}

function refillScreensaverCardBag() {
  screensaverCardBag = [...screensaverCardIndexes];
  shuffleScreensaverArray(screensaverCardBag);
}

function refillScreensaverCollectionPickBag() {
  const useEvilCollectionWeights = usesEvilBinderPresentation();
  screensaverCollectionPickBag = screensaverSourceCollectionIds.flatMap((collectionId) => {
    const weight = useEvilCollectionWeights
      ? (SCREENSAVER_EVIL_COLLECTION_SPAWN_WEIGHTS[collectionId] || 1)
      : 1;
    return Array.from({ length: weight }, () => collectionId);
  });
  shuffleScreensaverArray(screensaverCollectionPickBag);
}

function takeScreensaverCardIndex() {
  if (screensaverSourceCollectionIds.length > 1) {
    if (!screensaverCollectionPickBag.length) refillScreensaverCollectionPickBag();
    const collectionId = screensaverCollectionPickBag.pop();
    if (
      collectionId === "cardnft1"
      && screensaverCardNft1AnimatedIndexes.length
      && Math.random() < SCREENSAVER_CARDNFT1_ANIMATED_SPAWN_CHANCE
    ) {
      return takeScreensaverCardNft1AnimatedIndex();
    }
    let collectionBag = screensaverCollectionCardBags.get(collectionId);
    if (!collectionBag?.length) {
      collectionBag = [...(COLLECTION_CONFIGS[collectionId]?.globalIndexes || [])];
      shuffleScreensaverArray(collectionBag);
      screensaverCollectionCardBags.set(collectionId, collectionBag);
    }
    if (collectionBag.length) return collectionBag.pop();
  }
  if (!screensaverCardBag.length) refillScreensaverCardBag();
  return screensaverCardBag.pop();
}

function takeScreensaverCardNft1AnimatedIndex() {
  if (!screensaverCardNft1AnimatedBag.length) {
    screensaverCardNft1AnimatedBag = [...screensaverCardNft1AnimatedIndexes];
    shuffleScreensaverArray(screensaverCardNft1AnimatedBag);
  }
  return screensaverCardNft1AnimatedBag.pop();
}

function shuffleScreensaverArray(values) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }
  return values;
}

async function prepareScreensaverCardGroup(token) {
  const index = takeScreensaverCardIndex();
  const card = CARDS[index];
  if (!card) return null;
  if (screensaverActive && !await waitForScreensaverPreparationIdle(token)) {
    return null;
  }

  const prepared = await prepareIndividualCardFor3D(card);
  if (
    token !== screensaverPrepareToken
    || !screensaverScene
    || !screensaverWarmupScene
  ) {
    return null;
  }
  if (!await waitForScreensaverPreparationIdle(token)) return null;

  const group = createCardSwapGroup(
    prepared.frontTexture,
    prepared.backTexture,
    card,
    prepared.effectTextures,
  );
  makeScreensaverCardGroupSolid(group);
  group.position.set(0, 0, 0);
  group.visible = true;
  group.userData.screensaverCardIndex = index;
  group.userData.screensaverEffectActivity = 1;
  group.traverse((object) => {
    object.frustumCulled = false;
  });
  screensaverWarmupScene.add(group);
  updateCardEffectUniformsForGroup(
    group,
    performance.now() * 0.001,
    screensaverCamera,
  );

  try {
    if (typeof screensaverRenderer.compileAsync === "function") {
      await screensaverRenderer.compileAsync(screensaverWarmupScene, screensaverCamera);
    } else if (typeof screensaverRenderer.compile === "function") {
      screensaverRenderer.compile(screensaverWarmupScene, screensaverCamera);
    }
  } catch {
    // The tiny render-target pass below still warms older WebGL implementations.
  }
  if (token !== screensaverPrepareToken) {
    screensaverWarmupScene.remove(group);
    disposeCardSwapGroup(group);
    return null;
  }
  if (!await waitForScreensaverPreparationIdle(token)) {
    screensaverWarmupScene.remove(group);
    disposeCardSwapGroup(group);
    return null;
  }

  warmScreensaverCardGpuResources();
  screensaverWarmupScene.remove(group);
  group.visible = false;
  const recycledIndex = screensaverReadyCards.findIndex((entry) => entry.recycled);
  if (recycledIndex >= 0) {
    const [recycled] = screensaverReadyCards.splice(recycledIndex, 1);
    disposeCardSwapGroup(recycled.group);
  }
  screensaverReadyCards.push({ group, card, index, recycled: false });
  updateScreensaverCardDiagnostics();
  return group;
}

function waitForScreensaverPreparationIdle(token) {
  if (!screensaverActive || typeof window.requestIdleCallback !== "function") {
    return Promise.resolve(token === screensaverPrepareToken);
  }
  return new Promise((resolve) => {
    const waitForIdle = () => {
      window.requestIdleCallback(
        (deadline) => {
          if (token !== screensaverPrepareToken || !screensaverActive) {
            resolve(false);
            return;
          }
          if (
            isScreensaverPointerMotionBusy()
            || deadline.timeRemaining() < SCREENSAVER_PREPARE_MIN_IDLE_BUDGET_MS
          ) {
            window.setTimeout(waitForIdle, 48);
            return;
          }
          resolve(true);
        },
        { timeout: SCREENSAVER_PREPARE_IDLE_TIMEOUT_MS },
      );
    };
    waitForIdle();
  });
}

function warmScreensaverCardGpuResources() {
  if (
    !screensaverRenderer
    || !screensaverWarmupScene
    || !screensaverWarmupTarget
    || !screensaverCamera
  ) {
    return;
  }
  const previousTarget = screensaverRenderer.getRenderTarget();
  try {
    screensaverRenderer.setRenderTarget(screensaverWarmupTarget);
    screensaverRenderer.clear();
    screensaverRenderer.render(screensaverWarmupScene, screensaverCamera);
  } finally {
    screensaverRenderer.setRenderTarget(previousTarget);
  }
}

function makeScreensaverCardGroupSolid(group) {
  const frontMesh = group?.userData?.frontMesh;
  const backMesh = group?.userData?.backMesh;
  group?.traverse((object) => {
    const materials = Array.isArray(object.material)
      ? object.material
      : (object.material ? [object.material] : []);
    for (const material of materials) {
      material.depthTest = true;
      if (material.isMeshPhysicalMaterial) {
        material.transparent = false;
        material.opacity = 1;
        material.depthWrite = true;
      } else if (object === frontMesh || object === backMesh) {
        material.transparent = true;
        material.alphaTest = 0.015;
        material.depthWrite = true;
      } else {
        material.depthWrite = false;
      }
      material.needsUpdate = true;
    }
  });
}

async function activateScreensaverMode({ fullscreenPromise = null } = {}) {
  if (screensaverActive || screensaverPreparing) return;
  screensaverPreparing = true;
  if (screensaverPrewarmTimer) {
    window.clearTimeout(screensaverPrewarmTimer);
    screensaverPrewarmTimer = 0;
  }

  const ready = await (screensaverPrewarmPromise || prewarmScreensaverMode());
  screensaverPrewarmPromise = null;
  if (!ready) {
    screensaverPreparing = false;
    void exitScreensaverFullscreen();
    cancelScreensaverHold();
    screensaverActivationButton?.classList.remove("is-screensaver-confirmed");
    if (screensaverActivationButton) restoreShuffleButtonLabel(screensaverActivationButton);
    screensaverActivationButton = null;
    return;
  }
  if (fullscreenPromise) {
    await fullscreenPromise.catch(() => false);
  }
  await waitForScreensaverViewportSettle();

  suppressScreensaverTooltips();
  screensaverActive = true;
  screensaverPreparing = false;
  screensaverExitArmedAt = performance.now() + SCREENSAVER_EXIT_BUFFER_MS;
  screensaverLastFrameAt = performance.now();
  screensaverPreparationBlockedUntil = (
    screensaverLastFrameAt + SCREENSAVER_PREPARE_ACTIVATION_GRACE_MS
  );
  resetScreensaverFrameDiagnostics();
  resetScreensaverPointerInteraction();
  if (screensaverExitTimer) {
    window.clearTimeout(screensaverExitTimer);
    screensaverExitTimer = 0;
  }

  stopCardRenderLoop();
  stopBinderRenderLoop();
  clearActiveUiButtonTilt();

  resizeScreensaverRenderer(true);
  const initialCount = Math.min(
    SCREENSAVER_INITIAL_CARD_COUNT,
    screensaverReadyCards.length,
  );
  for (let index = 0; index < initialCount; index += 1) {
    spawnReadyScreensaverCard({ initialOrder: index });
  }
  flushScreensaverCardDiagnostics();
  screensaverNextSpawnAt = screensaverLastFrameAt
    + getNextScreensaverSpawnInterval();
  maintainScreensaverReadyCards();

  screensaverOverlay.classList.add("is-mounted");
  screensaverOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("screensaver-mode");
  requestAnimationFrame(() => {
    if (screensaverActive) screensaverOverlay.classList.add("is-visible");
  });
  startScreensaverAnimation();

  const heldButton = screensaverActivationButton || screensaverHoldState?.button;
  heldButton?.classList.remove("is-screensaver-confirmed");
  if (heldButton) restoreShuffleButtonLabel(heldButton);
  screensaverActivationButton = null;
}

function waitForScreensaverViewportSettle() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        updateAppViewportVars();
        resolve();
      });
    });
  });
}

function spawnReadyScreensaverCard({ initialOrder = null } = {}) {
  const prepared = screensaverReadyCards.shift();
  if (!prepared || !screensaverScene || !screensaverCamera) return false;

  const track = takeScreensaverSpawnTrack();
  const depth = track.depth + randomBetween(
    -SCREENSAVER_DEPTH_JITTER,
    SCREENSAVER_DEPTH_JITTER,
  );
  const view = getScreensaverVisibleWorldSize(depth);
  const scale = randomBetween(0.39, 0.47);
  const speedMultiplier = randomBetween(
    1 - SCREENSAVER_FALL_SPEED_JITTER,
    1 + SCREENSAVER_FALL_SPEED_JITTER,
  );
  const speed = view.height * SCREENSAVER_NORMALIZED_FALL_SPEED * speedMultiplier;
  const halfCardHeight = CARD_HEIGHT * scale * 0.62;
  const scheduledLeadSeconds = SCREENSAVER_OFFSCREEN_LEAD_SECONDS
    + (
      initialOrder === null
        ? 0
        : initialOrder
          * SCREENSAVER_SPAWN_INTERVAL_MS
          * randomBetween(0.78, 1.22)
          / 1000
    );
  const startOffset = speed * scheduledLeadSeconds;
  const group = prepared.group;
  const startY = view.height / 2 + halfCardHeight + startOffset;
  const spawnPosition = chooseScreensaverSpawnPosition({
    view,
    startY,
    scale,
    speed,
    arrivalSeconds: scheduledLeadSeconds,
  });
  if (!spawnPosition) {
    screensaverReadyCards.unshift(prepared);
    return false;
  }
  const { baseX, screenX } = spawnPosition;
  const frontFacing = Math.random() < SCREENSAVER_FRONT_FACING_PROBABILITY;
  const baseRotationX = randomBetween(-0.32, 0.32);
  const baseRotationY = frontFacing
    ? randomBetween(-0.34, 0.34)
    : Math.PI + randomBetween(-0.3, 0.3);
  const baseRotationZ = randomBetween(-0.55, 0.55);

  group.visible = true;
  group.scale.setScalar(scale);
  group.position.set(baseX, startY, depth);
  group.rotation.set(baseRotationX, baseRotationY, baseRotationZ);
  screensaverScene.add(group);
  const entry = {
    ...prepared,
    spawnSequence: screensaverSpawnSequence += 1,
    trackKey: track.key,
    screenX,
    depth,
    viewWidth: view.width,
    viewHeight: view.height,
    viewInverseWidth: 1 / view.width,
    viewInverseHeight: 1 / view.height,
    pointerWorldPerPixelX: view.width / screensaverViewportRect.width,
    pointerWorldPerPixelY: view.height / screensaverViewportRect.height,
    projectedCardHeightPx: (
      CARD_HEIGHT * scale / view.height * screensaverViewportRect.height
    ),
    scale,
    speed,
    speedMultiplier,
    naturalX: baseX,
    naturalY: startY,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    rotationOffsetX: 0,
    rotationOffsetY: 0,
    rotationOffsetZ: 0,
    angularVelocityX: 0,
    angularVelocityY: 0,
    angularVelocityZ: 0,
    lastPointerForceAt: 0,
    frontFacing,
    baseRotationX,
    baseRotationY,
    baseRotationZ,
    rotationAmplitudeX: randomBetween(0.12, 0.38),
    rotationAmplitudeY: randomBetween(0.18, 0.48),
    rotationAmplitudeZ: randomBetween(0.08, 0.28),
    rotationFrequencyX: randomBetween(0.32, 0.58),
    rotationFrequencyY: randomBetween(0.22, 0.46),
    rotationFrequencyZ: randomBetween(0.28, 0.52),
    rotationPhaseX: randomBetween(0, Math.PI * 2),
    rotationPhaseY: randomBetween(0, Math.PI * 2),
    rotationPhaseZ: randomBetween(0, Math.PI * 2),
    age: 0,
  };
  group.userData.screensaverEntry = entry;
  updateScreensaverCollisionFrame(entry);
  screensaverCards.push(entry);
  updateScreensaverCardDiagnostics();
  return true;
}

function takeScreensaverSpawnTrack() {
  if (!screensaverSpawnTrackBag.length) refillScreensaverSpawnTrackBag();
  const track = screensaverSpawnTrackBag.pop();
  screensaverLastSpawnTrackKey = track.key;
  return track;
}

function refillScreensaverSpawnTrackBag() {
  const tracks = [];
  for (let depthIndex = 0; depthIndex < SCREENSAVER_DEPTH_LAYER_COUNT; depthIndex += 1) {
    const depthProgress = depthIndex / Math.max(1, SCREENSAVER_DEPTH_LAYER_COUNT - 1);
    const depth = THREE.MathUtils.lerp(
      SCREENSAVER_DEPTH_MIN,
      SCREENSAVER_DEPTH_MAX,
      depthProgress,
    );
    tracks.push({
      key: String(depthIndex),
      depth,
    });
  }
  shuffleScreensaverArray(tracks);
  if (
    tracks.length > 1
    && tracks.at(-1)?.key === screensaverLastSpawnTrackKey
  ) {
    [tracks[0], tracks[tracks.length - 1]] = [tracks[tracks.length - 1], tracks[0]];
  }
  screensaverSpawnTrackBag = tracks;
}

function chooseScreensaverSpawnPosition({
  view,
  startY,
  scale,
  speed,
  arrivalSeconds,
}) {
  const normalizedLimit = SCREENSAVER_HORIZONTAL_CENTER_LIMIT;
  const newHalfDiagonal = (
    Math.hypot(CARD_WIDTH, CARD_HEIGHT) * scale * 0.5
  );
  const newHalfWidth = newHalfDiagonal / view.width;
  const newHalfHeight = newHalfDiagonal / view.height;
  const blockers = screensaverCards
    .map((entry) => {
      const entryViewWidth = entry.viewWidth || getScreensaverVisibleWorldSize(entry.depth).width;
      const entryViewHeight = entry.viewHeight || getScreensaverVisibleWorldSize(entry.depth).height;
      const halfDiagonal = Math.hypot(CARD_WIDTH, CARD_HEIGHT) * entry.scale * 0.5;
      return {
        screenX: entry.group.position.x / entryViewWidth,
        positionY: entry.group.position.y,
        speed: entry.speed,
        viewHeight: entryViewHeight,
        halfWidth: halfDiagonal / entryViewWidth,
        halfHeight: halfDiagonal / entryViewHeight,
      };
    });
  const recentScreenXs = screensaverCards
    .slice(-SCREENSAVER_SPAWN_SPACING_HISTORY)
    .map((entry) => (
      entry.group.position.x
        / (entry.viewWidth || getScreensaverVisibleWorldSize(entry.depth).width)
    ));
  const candidates = [];
  for (let index = 0; index < SCREENSAVER_SPAWN_POSITION_CANDIDATES; index += 1) {
    candidates.push(randomBetween(-normalizedLimit, normalizedLimit));
  }

  let bestCandidate = null;
  let bestScore = -Infinity;
  const spacingPreference = randomBetween(0.38, 0.72);
  for (const candidate of candidates) {
    const spacingScore = recentScreenXs.length
      ? Math.min(...recentScreenXs.map((screenX) => Math.abs(candidate - screenX)))
      : normalizedLimit - Math.abs(candidate) * 0.25;
    const crowdingPenalty = recentScreenXs.reduce((total, screenX) => {
      const distance = Math.abs(candidate - screenX);
      return total + Math.max(0, 0.18 - distance) / 0.18;
    }, 0);
    let overlapPenalty = 0;
    let maximumOverlap = 0;
    for (const blocker of blockers) {
      const horizontalRange = (newHalfWidth + blocker.halfWidth) * 0.94;
      const verticalRange = (newHalfHeight + blocker.halfHeight) * 0.94;
      const horizontalOverlap = clamp(
        1 - Math.abs(candidate - blocker.screenX) / Math.max(0.001, horizontalRange),
        0,
        1,
      );
      if (horizontalOverlap <= 0) continue;
      let blockerMaximumOverlap = 0;
      for (
        let sampleIndex = 0;
        sampleIndex < SCREENSAVER_SPAWN_TRAJECTORY_SAMPLE_COUNT;
        sampleIndex += 1
      ) {
        const sampleSeconds = arrivalSeconds
          + sampleIndex * SCREENSAVER_SPAWN_TRAJECTORY_SAMPLE_STEP_SECONDS;
        const newScreenY = (startY - speed * sampleSeconds) / view.height;
        if (
          newScreenY > 0.5 + newHalfHeight * 1.4
          || newScreenY < -0.5 - newHalfHeight * 1.4
        ) {
          continue;
        }
        const blockerScreenY = (
          blocker.positionY - blocker.speed * sampleSeconds
        ) / blocker.viewHeight;
        const verticalOverlap = clamp(
          1 - Math.abs(newScreenY - blockerScreenY)
            / Math.max(0.001, verticalRange),
          0,
          1,
        );
        blockerMaximumOverlap = Math.max(
          blockerMaximumOverlap,
          horizontalOverlap * verticalOverlap,
        );
      }
      overlapPenalty += blockerMaximumOverlap;
      maximumOverlap = Math.max(maximumOverlap, blockerMaximumOverlap);
    }
    const edgePenalty = normalizedLimit > 0
      ? Math.pow(Math.abs(candidate) / normalizedLimit, 3) * 0.02
      : 0;
    if (maximumOverlap > SCREENSAVER_SPAWN_MAX_OVERLAP) continue;
    const score = spacingScore * spacingPreference
      - crowdingPenalty * 0.055
      - overlapPenalty * 0.2
      - edgePenalty
      + Math.random() * SCREENSAVER_SPAWN_SCORE_RANDOMNESS;
    if (score > bestScore) {
      bestScore = score;
      bestCandidate = candidate;
    }
  }

  if (!Number.isFinite(bestCandidate)) return null;
  return {
    baseX: bestCandidate * view.width,
    screenX: bestCandidate,
  };
}

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function getNextScreensaverSpawnInterval() {
  return SCREENSAVER_SPAWN_INTERVAL_MS * randomBetween(
    1 - SCREENSAVER_SPAWN_INTERVAL_JITTER,
    1 + SCREENSAVER_SPAWN_INTERVAL_JITTER,
  );
}

function getScreensaverVisibleWorldSize(depth = 0) {
  if (!screensaverCamera) return { width: 1, height: 1 };
  const height = 2 * Math.tan(
    THREE.MathUtils.degToRad(screensaverCamera.fov) / 2,
  ) * Math.max(0.1, screensaverCamera.position.z - depth);
  return { width: height * screensaverCamera.aspect, height };
}

function maintainScreensaverReadyCards() {
  if (!screensaverActive) return;
  if (isScreensaverPointerMotionBusy()) return;
  const target = Math.min(
    SCREENSAVER_READY_CARD_COUNT,
    screensaverCardIndexes.length,
  );
  const preparedReadyCount = screensaverReadyCards.reduce(
    (count, entry) => count + (entry.recycled ? 0 : 1),
    0,
  );
  const token = screensaverPrepareToken;
  while (
    screensaverPrepareActiveCount < SCREENSAVER_ACTIVE_PREPARE_CONCURRENCY
    && preparedReadyCount + screensaverPrepareActiveCount < target
  ) {
    screensaverPrepareActiveCount += 1;
    updateScreensaverCardDiagnostics();
    prepareScreensaverCardGroup(token)
      .catch((error) => console.error("Screensaver card preparation failed", error))
      .finally(() => {
        screensaverPrepareActiveCount = Math.max(0, screensaverPrepareActiveCount - 1);
        updateScreensaverCardDiagnostics();
        if (screensaverActive && token === screensaverPrepareToken) {
          maintainScreensaverReadyCards();
        }
      });
  }
}

function isScreensaverPointerMotionBusy(now = performance.now()) {
  return (
    screensaverActive
    && (
      now < screensaverPreparationBlockedUntil
      || (
        screensaverPointerLastAt > 0
        && now - screensaverPointerLastAt < SCREENSAVER_PREPARE_POINTER_COOLDOWN_MS
      )
    )
  );
}

function startScreensaverAnimation() {
  if (
    screensaverAnimationFrame
    || !screensaverActive
    || document.hidden
    || !screensaverRenderer
  ) {
    return;
  }
  screensaverAnimationFrame = requestAnimationFrame(animateScreensaver);
}

function stopScreensaverAnimation() {
  if (!screensaverAnimationFrame) return;
  cancelAnimationFrame(screensaverAnimationFrame);
  screensaverAnimationFrame = 0;
}

function getScreensaverPointerForceFrame(now) {
  if (
    screensaverCtrlSelectionActive
    ||
    !screensaverCanvas
    || !Number.isFinite(screensaverPointerClientX)
    || !Number.isFinite(screensaverPointerClientY)
  ) {
    return null;
  }
  const age = now - screensaverPointerLastAt;
  const speed = Math.hypot(
    screensaverPointerVelocityX,
    screensaverPointerVelocityY,
  );
  const headIsActive = (
    age >= 0
    && age <= SCREENSAVER_POINTER_ACTIVE_MS
    && speed >= SCREENSAVER_POINTER_MIN_SPEED_PX_S
  );
  const activeWakeCount = getActiveScreensaverPointerWakeCount(now);
  if (!headIsActive && activeWakeCount === 0) return null;
  if (!screensaverViewportRect.width || !screensaverViewportRect.height) return null;
  screensaverPointerForceFrame.clientX = screensaverPointerClientX;
  screensaverPointerForceFrame.clientY = screensaverPointerClientY;
  screensaverPointerForceFrame.velocityX = screensaverPointerVelocityX;
  screensaverPointerForceFrame.velocityY = screensaverPointerVelocityY;
  screensaverPointerForceFrame.speed = speed;
  screensaverPointerForceFrame.freshness = headIsActive
    ? 1 - clamp(age / SCREENSAVER_POINTER_ACTIVE_MS, 0, 1)
    : 0;
  screensaverPointerForceFrame.activeWakeCount = activeWakeCount;
  return screensaverPointerForceFrame;
}

function applyScreensaverPointerForce(
  entry,
  pointerFrame,
  now,
  deltaSeconds,
  entryInfluence = 1,
) {
  if (!pointerFrame || !screensaverCamera) return false;
  const { rect } = pointerFrame;
  const cardScreenX = rect.left
    + (0.5 + entry.group.position.x * entry.viewInverseWidth) * rect.width;
  const cardScreenY = rect.top
    + (0.5 - entry.group.position.y * entry.viewInverseHeight) * rect.height;
  const fallbackView = (
    Number.isFinite(entry.viewWidth) && Number.isFinite(entry.viewHeight)
  ) ? null : getScreensaverVisibleWorldSize(entry.depth);
  const entryViewWidth = entry.viewWidth || fallbackView.width;
  const entryViewHeight = entry.viewHeight || fallbackView.height;
  const worldPerPixelX = entry.pointerWorldPerPixelX
    || entryViewWidth / rect.width;
  const worldPerPixelY = entry.pointerWorldPerPixelY
    || entryViewHeight / rect.height;
  const projectedHeight = entry.projectedCardHeightPx
    || CARD_HEIGHT * entry.scale / entryViewHeight * rect.height;
  const baseCoreRadius = clamp(
    projectedHeight * 0.92 + 72,
    SCREENSAVER_POINTER_CORE_RADIUS_MIN,
    SCREENSAVER_POINTER_CORE_RADIUS_MAX,
  );
  const baseAmbientRadius = rect.ambientRadius;
  let applied = false;
  if (pointerFrame.freshness > 0) {
    applied = applyScreensaverPointerSampleForce(
      entry,
      cardScreenX,
      cardScreenY,
      worldPerPixelX,
      worldPerPixelY,
      baseCoreRadius,
      baseAmbientRadius,
      pointerFrame.clientX,
      pointerFrame.clientY,
      pointerFrame.velocityX,
      pointerFrame.velocityY,
      pointerFrame.speed,
      pointerFrame.freshness,
      entryInfluence,
      1,
      deltaSeconds,
    );
  }

  for (let offset = 0; offset < pointerFrame.activeWakeCount; offset += 1) {
    const sampleIndex = (
      screensaverPointerWakeCursor - 1 - offset
      + SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY
    ) % SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY;
    const sample = screensaverPointerWakeSamples[sampleIndex];
    applied = applyScreensaverPointerSampleForce(
      entry,
      cardScreenX,
      cardScreenY,
      worldPerPixelX,
      worldPerPixelY,
      baseCoreRadius,
      baseAmbientRadius,
      sample.clientX,
      sample.clientY,
      sample.velocityX,
      sample.velocityY,
      sample.speed,
      sample.frameFreshness,
      SCREENSAVER_POINTER_WAKE_FORCE_SCALE * entryInfluence,
      SCREENSAVER_POINTER_WAKE_RADIUS_SCALE,
      deltaSeconds,
    ) || applied;
  }

  if (applied) {
    entry.lastPointerForceAt = now;
    screensaverPointerForceApplications += 1;
  }
  return applied;
}

function applyScreensaverPointerSampleForce(
  entry,
  cardScreenX,
  cardScreenY,
  worldPerPixelX,
  worldPerPixelY,
  baseCoreRadius,
  baseAmbientRadius,
  clientX,
  clientY,
  velocityX,
  velocityY,
  speed,
  freshness,
  forceScale,
  radiusScale,
  deltaSeconds,
) {
  const deltaX = cardScreenX - clientX;
  const deltaY = cardScreenY - clientY;
  const distance = Math.hypot(deltaX, deltaY);
  const coreRadius = baseCoreRadius * radiusScale;
  const ambientRadius = baseAmbientRadius * radiusScale;
  if (distance >= ambientRadius) return false;

  const coreDistance = clamp(distance / Math.max(1, coreRadius), 0, 1);
  const ambientDistance = clamp(distance / Math.max(1, ambientRadius), 0, 1);
  const coreFalloff = 1 - coreDistance * coreDistance;
  const ambientFalloff = 1 - ambientDistance;
  const coreInfluence = coreFalloff * coreFalloff;
  const ambientInfluence = ambientFalloff * ambientFalloff
    * (3 - 2 * (1 - ambientDistance))
    * SCREENSAVER_POINTER_AMBIENT_STRENGTH;
  const influence = (coreInfluence + ambientInfluence) * freshness * forceScale;
  const awayScreenX = distance > 0.01 ? deltaX / distance : 0;
  const awayScreenY = distance > 0.01 ? deltaY / distance : -1;
  const motionWorldX = velocityX * worldPerPixelX;
  const motionWorldY = -velocityY * worldPerPixelY;
  const awayWorldX = awayScreenX * speed * worldPerPixelX;
  const awayWorldY = -awayScreenY * speed * worldPerPixelY;
  const forceStep = SCREENSAVER_POINTER_FORCE * influence * deltaSeconds;
  const directShare = coreInfluence / Math.max(0.001, coreInfluence + ambientInfluence);
  const awayShare = 0.12 + directShare * 0.2;
  const motionShare = 1 - awayShare;

  entry.velocityX += (motionWorldX * motionShare + awayWorldX * awayShare) * forceStep;
  entry.velocityY += (motionWorldY * motionShare + awayWorldY * awayShare) * forceStep;

  const normalizedVelocityX = velocityX / SCREENSAVER_POINTER_MAX_SPEED_PX_S;
  const normalizedVelocityY = velocityY / SCREENSAVER_POINTER_MAX_SPEED_PX_S;
  const rotationStep = SCREENSAVER_POINTER_ROTATION_FORCE * influence * deltaSeconds;
  entry.angularVelocityX += normalizedVelocityY * rotationStep;
  entry.angularVelocityY += normalizedVelocityX * rotationStep;
  entry.angularVelocityZ += (
    awayScreenX * normalizedVelocityY
    - awayScreenY * normalizedVelocityX
  ) * rotationStep * 0.78;
  return true;
}

function getActiveScreensaverPointerWakeCount(now) {
  let activeCount = 0;
  for (let offset = 0; offset < screensaverPointerWakeCount; offset += 1) {
    const sampleIndex = (
      screensaverPointerWakeCursor - 1 - offset
      + SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY
    ) % SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY;
    const sample = screensaverPointerWakeSamples[sampleIndex];
    const age = now - sample.createdAt;
    if (age > SCREENSAVER_POINTER_WAKE_DURATION_MS) break;
    if (age < 0) continue;
    sample.frameFreshness = Math.pow(
      1 - age / SCREENSAVER_POINTER_WAKE_DURATION_MS,
      1.35,
    );
    activeCount += 1;
  }
  return activeCount;
}

function recordScreensaverPointerWake(
  fromX,
  fromY,
  fromAt,
  toX,
  toY,
  toAt,
) {
  const speed = Math.hypot(
    screensaverPointerVelocityX,
    screensaverPointerVelocityY,
  );
  if (speed < SCREENSAVER_POINTER_MIN_SPEED_PX_S) return;

  if (screensaverPointerWakeCount > 0) {
    const latestIndex = (
      screensaverPointerWakeCursor - 1
      + SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY
    ) % SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY;
    const latestSample = screensaverPointerWakeSamples[latestIndex];
    const distanceFromLatest = Math.hypot(
      toX - latestSample.clientX,
      toY - latestSample.clientY,
    );
    if (
      distanceFromLatest < SCREENSAVER_POINTER_WAKE_SAMPLE_SPACING_PX * 0.58
      && toAt - latestSample.createdAt < 70
    ) {
      latestSample.velocityX = screensaverPointerVelocityX;
      latestSample.velocityY = screensaverPointerVelocityY;
      latestSample.speed = speed;
      return;
    }
  }

  const hasStart = Number.isFinite(fromX) && Number.isFinite(fromY);
  const distance = hasStart ? Math.hypot(toX - fromX, toY - fromY) : 0;
  const sampleCount = clamp(
    Math.max(1, Math.ceil(distance / SCREENSAVER_POINTER_WAKE_SAMPLE_SPACING_PX)),
    1,
    SCREENSAVER_POINTER_WAKE_MAX_INTERPOLATED_SAMPLES,
  );
  const elapsed = Number.isFinite(fromAt)
    ? clamp(toAt - fromAt, 0, 80)
    : 0;

  for (let step = 1; step <= sampleCount; step += 1) {
    const progress = step / sampleCount;
    const sample = screensaverPointerWakeSamples[screensaverPointerWakeCursor];
    sample.clientX = hasStart
      ? THREE.MathUtils.lerp(fromX, toX, progress)
      : toX;
    sample.clientY = hasStart
      ? THREE.MathUtils.lerp(fromY, toY, progress)
      : toY;
    sample.velocityX = screensaverPointerVelocityX;
    sample.velocityY = screensaverPointerVelocityY;
    sample.speed = speed;
    sample.createdAt = toAt - elapsed * (1 - progress);
    screensaverPointerWakeCursor = (
      screensaverPointerWakeCursor + 1
    ) % SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY;
    screensaverPointerWakeCount = Math.min(
      SCREENSAVER_POINTER_WAKE_SAMPLE_CAPACITY,
      screensaverPointerWakeCount + 1,
    );
  }
}

function updateScreensaverCardMomentum(
  entry,
  deltaSeconds,
  linearDamping,
  rotationDamping,
) {
  const fallbackView = (
    Number.isFinite(entry.viewWidth) && Number.isFinite(entry.viewHeight)
  ) ? null : getScreensaverVisibleWorldSize(entry.depth);
  const viewWidth = entry.viewWidth || fallbackView.width;
  const viewHeight = entry.viewHeight || fallbackView.height;
  entry.velocityX -= entry.offsetX * SCREENSAVER_POINTER_LINEAR_SPRING * deltaSeconds;
  entry.velocityY -= entry.offsetY * SCREENSAVER_POINTER_LINEAR_SPRING * deltaSeconds;
  entry.velocityX *= linearDamping;
  entry.velocityY *= linearDamping;
  entry.velocityX = clamp(
    entry.velocityX,
    -viewWidth * SCREENSAVER_POINTER_MAX_VELOCITY_RATIO,
    viewWidth * SCREENSAVER_POINTER_MAX_VELOCITY_RATIO,
  );
  entry.velocityY = clamp(
    entry.velocityY,
    -viewHeight * SCREENSAVER_POINTER_MAX_VELOCITY_RATIO,
    viewHeight * SCREENSAVER_POINTER_MAX_VELOCITY_RATIO,
  );
  entry.offsetX += entry.velocityX * deltaSeconds;
  entry.offsetY += entry.velocityY * deltaSeconds;

  const maxOffsetX = viewWidth * SCREENSAVER_POINTER_MAX_OFFSET_RATIO;
  const maxOffsetY = viewHeight * SCREENSAVER_POINTER_MAX_OFFSET_RATIO;
  entry.offsetX = clamp(entry.offsetX, -maxOffsetX, maxOffsetX);
  entry.offsetY = clamp(entry.offsetY, -maxOffsetY, maxOffsetY);

  entry.angularVelocityX -= (
    entry.rotationOffsetX * SCREENSAVER_POINTER_ROTATION_SPRING * deltaSeconds
  );
  entry.angularVelocityY -= (
    entry.rotationOffsetY * SCREENSAVER_POINTER_ROTATION_SPRING * deltaSeconds
  );
  entry.angularVelocityZ -= (
    entry.rotationOffsetZ * SCREENSAVER_POINTER_ROTATION_SPRING * deltaSeconds
  );
  entry.angularVelocityX *= rotationDamping;
  entry.angularVelocityY *= rotationDamping;
  entry.angularVelocityZ *= rotationDamping;
  entry.angularVelocityX = clamp(
    entry.angularVelocityX,
    -SCREENSAVER_POINTER_MAX_ANGULAR_VELOCITY,
    SCREENSAVER_POINTER_MAX_ANGULAR_VELOCITY,
  );
  entry.angularVelocityY = clamp(
    entry.angularVelocityY,
    -SCREENSAVER_POINTER_MAX_ANGULAR_VELOCITY,
    SCREENSAVER_POINTER_MAX_ANGULAR_VELOCITY,
  );
  entry.angularVelocityZ = clamp(
    entry.angularVelocityZ,
    -SCREENSAVER_POINTER_MAX_ANGULAR_VELOCITY,
    SCREENSAVER_POINTER_MAX_ANGULAR_VELOCITY,
  );
  entry.rotationOffsetX += entry.angularVelocityX * deltaSeconds;
  entry.rotationOffsetY += entry.angularVelocityY * deltaSeconds;
  entry.rotationOffsetZ += entry.angularVelocityZ * deltaSeconds;
  entry.rotationOffsetX = clamp(entry.rotationOffsetX, -1.35, 1.35);
  entry.rotationOffsetY = clamp(entry.rotationOffsetY, -1.6, 1.6);
  entry.rotationOffsetZ = clamp(entry.rotationOffsetZ, -1.35, 1.35);
}

function updateScreensaverCollisionFrame(entry) {
  const collisionRadius = SCREENSAVER_COLLISION_CARD_DIAGONAL
    * entry.scale
    * SCREENSAVER_COLLISION_RADIUS_FACTOR;
  const inverseWidth = entry.viewInverseWidth || 1 / (entry.viewWidth || 1);
  const inverseHeight = entry.viewInverseHeight || 1 / (entry.viewHeight || 1);
  entry.screenX = entry.group.position.x * inverseWidth;
  entry.screenY = entry.group.position.y * inverseHeight;
  entry.collisionHalfX = collisionRadius * inverseWidth;
  entry.collisionHalfY = collisionRadius * inverseHeight;
  const pointerRampStart = 0.5 + entry.collisionHalfY * 1.8;
  const pointerRampEnd = 0.5 + entry.collisionHalfY * 0.2;
  const pointerProgress = clamp(
    (pointerRampStart - Math.abs(entry.screenY))
      / Math.max(0.001, pointerRampStart - pointerRampEnd),
    0,
    1,
  );
  entry.pointerInfluence = pointerProgress
    * pointerProgress
    * (3 - 2 * pointerProgress);
  entry.collisionActive = (
    Math.abs(entry.screenY)
    <= 0.5
      + entry.collisionHalfY * SCREENSAVER_COLLISION_ACTIVATION_OVERSCAN
  );
}

function animateScreensaver(now = performance.now()) {
  screensaverAnimationFrame = 0;
  if (!screensaverActive || document.hidden || !screensaverRenderer) return;

  resizeScreensaverRenderer();
  const frameDeltaMs = Math.max(0, now - screensaverLastFrameAt);
  recordScreensaverFrameTiming(frameDeltaMs);
  const deltaSeconds = Math.min(
    SCREENSAVER_MAX_MOTION_DELTA_SECONDS,
    frameDeltaMs / 1000,
  );
  screensaverLastFrameAt = now;
  const cardEffectTime = now * 0.001;
  processScreensaverPointerInput(now);
  const pointerFrame = getScreensaverPointerForceFrame(now);
  const linearDamping = Math.exp(
    -SCREENSAVER_POINTER_LINEAR_DAMPING * deltaSeconds,
  );
  const rotationDamping = Math.exp(
    -SCREENSAVER_POINTER_ROTATION_DAMPING * deltaSeconds,
  );

  for (let index = screensaverCards.length - 1; index >= 0; index -= 1) {
    const entry = screensaverCards[index];
    entry.age += deltaSeconds;
    entry.naturalY -= entry.speed * deltaSeconds;
    if (entry.pointerInfluence > 0.001) {
      applyScreensaverPointerForce(
        entry,
        pointerFrame,
        now,
        deltaSeconds,
        entry.pointerInfluence,
      );
    }
    updateScreensaverCardMomentum(
      entry,
      deltaSeconds,
      linearDamping,
      rotationDamping,
    );
    const naturalRotationX = entry.baseRotationX
      + Math.sin(entry.age * entry.rotationFrequencyX + entry.rotationPhaseX)
        * entry.rotationAmplitudeX;
    const naturalRotationY = entry.baseRotationY
      + Math.sin(entry.age * entry.rotationFrequencyY + entry.rotationPhaseY)
        * entry.rotationAmplitudeY;
    const naturalRotationZ = entry.baseRotationZ
      + Math.sin(entry.age * entry.rotationFrequencyZ + entry.rotationPhaseZ)
        * entry.rotationAmplitudeZ;
    entry.group.position.x = entry.naturalX + entry.offsetX;
    entry.group.position.y = entry.naturalY + entry.offsetY;
    entry.group.rotation.x = naturalRotationX + entry.rotationOffsetX;
    entry.group.rotation.y = naturalRotationY + entry.rotationOffsetY;
    entry.group.rotation.z = naturalRotationZ + entry.rotationOffsetZ;
    updateScreensaverCollisionFrame(entry);
    const effectOverscan = CARD_HEIGHT
      * entry.scale
      * SCREENSAVER_EFFECT_OVERSCAN_CARD_HEIGHTS;
    if (
      Math.abs(entry.group.position.y)
      <= entry.viewHeight / 2 + effectOverscan
    ) {
      updateCardEffectUniformsForGroup(entry.group, cardEffectTime, screensaverCamera);
    }
  }

  updateScreensaverPointerHoverIfNeeded(now);

  for (let index = screensaverCards.length - 1; index >= 0; index -= 1) {
    const entry = screensaverCards[index];
    const entryViewHeight = entry.viewHeight
      || getScreensaverVisibleWorldSize(entry.depth).height;
    if (entry.group.position.y < -(entryViewHeight / 2 + CARD_HEIGHT * entry.scale + 1)) {
      screensaverScene.remove(entry.group);
      entry.group.visible = false;
      entry.group.userData.screensaverEntry = null;
      screensaverReadyCards.push({
        group: entry.group,
        card: entry.card,
        index: entry.index,
        recycled: true,
      });
      screensaverCards.splice(index, 1);
      updateScreensaverCardDiagnostics();
    }
  }

  if (
    now >= screensaverNextSpawnAt
    && screensaverCards.length < SCREENSAVER_MAX_CARD_COUNT
  ) {
    if (spawnReadyScreensaverCard()) {
      screensaverNextSpawnAt = now + getNextScreensaverSpawnInterval();
      maintainScreensaverReadyCards();
    } else {
      screensaverNextSpawnAt = now + SCREENSAVER_SPAWN_RETRY_MS;
    }
  }

  updateAnimatedTextureRecords(getScreensaverAnimatedTextureRecords());
  if (
    SCREENSAVER_DIAGNOSTICS_ENABLED
    && screensaverOverlay
    && now >= screensaverDiagnosticsNextAt
  ) {
    screensaverDiagnosticsNextAt = now + SCREENSAVER_DIAGNOSTIC_INTERVAL_MS;
    flushScreensaverCardDiagnostics();
    const pointerForces = String(screensaverPointerForceApplications);
    if (screensaverOverlay.dataset.pointerForces !== pointerForces) {
      screensaverOverlay.dataset.pointerForces = pointerForces;
    }
    const activeWakeSamples = String(pointerFrame?.activeWakeCount || 0);
    if (screensaverOverlay.dataset.activeWakeSamples !== activeWakeSamples) {
      screensaverOverlay.dataset.activeWakeSamples = activeWakeSamples;
    }
  }
  screensaverRenderer.render(screensaverScene, screensaverCamera);
  maintainScreensaverReadyCards();
  screensaverAnimationFrame = requestAnimationFrame(animateScreensaver);
}

function resetScreensaverFrameDiagnostics() {
  screensaverFrameSampleCount = 0;
  screensaverFrameSampleTotalMs = 0;
  screensaverFrameSampleMaximumMs = 0;
  screensaverFrameSampleLongFrames = 0;
  if (!screensaverOverlay) return;
  delete screensaverOverlay.dataset.averageFrameMs;
  delete screensaverOverlay.dataset.maximumFrameMs;
  delete screensaverOverlay.dataset.longFrames;
}

function recordScreensaverFrameTiming(frameDeltaMs) {
  if (!SCREENSAVER_DIAGNOSTICS_ENABLED) return;
  if (!Number.isFinite(frameDeltaMs) || frameDeltaMs <= 0) return;
  screensaverFrameSampleCount += 1;
  screensaverFrameSampleTotalMs += frameDeltaMs;
  screensaverFrameSampleMaximumMs = Math.max(
    screensaverFrameSampleMaximumMs,
    frameDeltaMs,
  );
  if (frameDeltaMs > SCREENSAVER_LONG_FRAME_MS) screensaverFrameSampleLongFrames += 1;
  if (screensaverFrameSampleCount < SCREENSAVER_FRAME_SAMPLE_SIZE) return;

  if (screensaverOverlay) {
    screensaverOverlay.dataset.averageFrameMs = (
      screensaverFrameSampleTotalMs / screensaverFrameSampleCount
    ).toFixed(2);
    screensaverOverlay.dataset.maximumFrameMs = screensaverFrameSampleMaximumMs.toFixed(2);
    screensaverOverlay.dataset.longFrames = String(screensaverFrameSampleLongFrames);
  }
  screensaverFrameSampleCount = 0;
  screensaverFrameSampleTotalMs = 0;
  screensaverFrameSampleMaximumMs = 0;
  screensaverFrameSampleLongFrames = 0;
}

function getScreensaverAnimatedTextureRecords() {
  const records = screensaverAnimatedTextureRecordScratch;
  records.clear();
  for (const entry of screensaverCards) {
    addAnimatedTextureRecord(records, entry.group?.userData?.frontMesh?.material?.map);
  }
  return records;
}

function updateScreensaverCardDiagnostics() {
  screensaverCardDiagnosticsDirty = true;
}

function flushScreensaverCardDiagnostics() {
  if (
    !SCREENSAVER_DIAGNOSTICS_ENABLED
    || !screensaverCardDiagnosticsDirty
    || !screensaverOverlay
  ) {
    return;
  }
  screensaverCardDiagnosticsDirty = false;
  screensaverOverlay.dataset.activeCards = String(screensaverCards.length);
  screensaverOverlay.dataset.readyCards = String(screensaverReadyCards.length);
  screensaverOverlay.dataset.preparingCards = String(screensaverPrepareActiveCount);
  screensaverOverlay.dataset.frontFacingCards = String(
    screensaverCards.reduce((total, entry) => total + Number(entry.frontFacing), 0),
  );
  screensaverOverlay.dataset.ponchoCards = String(
    screensaverCards.reduce(
      (total, entry) => total + Number(entry.card?.collection === "poncho"),
      0,
    ),
  );
  screensaverOverlay.dataset.animatedCards = String(
    screensaverCards.reduce(
      (total, entry) => total + Number(isAnimatedCard(entry.card)),
      0,
    ),
  );
}

function setScreensaverCtrlSelectionActive(active, now = performance.now()) {
  const nextActive = Boolean(active && screensaverActive);
  if (screensaverCtrlSelectionActive === nextActive) return;
  screensaverCtrlSelectionActive = nextActive;
  screensaverPointerVelocityX = 0;
  screensaverPointerVelocityY = 0;
  screensaverPointerWakeCursor = 0;
  screensaverPointerWakeCount = 0;
  screensaverPointerLastAt = (
    Number.isFinite(screensaverPointerClientX)
    && Number.isFinite(screensaverPointerClientY)
  ) ? now : 0;
  if (screensaverOverlay) {
    screensaverOverlay.dataset.ctrlSelectionActive = String(nextActive);
    screensaverOverlay.dataset.activeWakeSamples = "0";
  }
}

function handleScreensaverControlKeyUp(event) {
  if (
    !screensaverActive
    || event.key !== "Control"
  ) {
    return;
  }
  setScreensaverCtrlSelectionActive(false);
  if (event.cancelable) event.preventDefault();
  event.stopImmediatePropagation();
}

function handleScreensaverPointerMove(event) {
  if (
    !screensaverActive
    || (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen")
  ) {
    return;
  }
  event.stopPropagation();
  setScreensaverCtrlSelectionActive(event.ctrlKey);
  screensaverPendingPointerX = event.clientX;
  screensaverPendingPointerY = event.clientY;
  screensaverPendingPointerAt = performance.now();
  screensaverPointerInputPending = true;
  screensaverPointerHoverDirty = true;
}

function processScreensaverPointerInput(now) {
  if (!screensaverPointerInputPending) return false;
  screensaverPointerInputPending = false;
  const nextClientX = screensaverPendingPointerX;
  const nextClientY = screensaverPendingPointerY;
  const inputAt = Math.min(now, screensaverPendingPointerAt || now);
  const previousClientX = screensaverPointerClientX;
  const previousClientY = screensaverPointerClientY;
  const previousPointerAt = screensaverPointerLastAt;
  const deltaSeconds = (inputAt - screensaverPointerLastAt) / 1000;
  if (screensaverCtrlSelectionActive) {
    screensaverPointerVelocityX = 0;
    screensaverPointerVelocityY = 0;
    screensaverPointerWakeCursor = 0;
    screensaverPointerWakeCount = 0;
    screensaverPointerClientX = nextClientX;
    screensaverPointerClientY = nextClientY;
    screensaverPointerLastAt = inputAt;
    return true;
  }
  if (
    !Number.isFinite(screensaverPointerClientX)
    || !Number.isFinite(screensaverPointerClientY)
    || deltaSeconds <= 0
    || deltaSeconds > 0.18
  ) {
    screensaverPointerVelocityX = 0;
    screensaverPointerVelocityY = 0;
  } else {
    let velocityX = (nextClientX - screensaverPointerClientX) / deltaSeconds;
    let velocityY = (nextClientY - screensaverPointerClientY) / deltaSeconds;
    const speed = Math.hypot(velocityX, velocityY);
    if (speed > SCREENSAVER_POINTER_MAX_SPEED_PX_S) {
      const scale = SCREENSAVER_POINTER_MAX_SPEED_PX_S / speed;
      velocityX *= scale;
      velocityY *= scale;
    }
    const velocityAlpha = clamp(deltaSeconds * 22, 0.28, 0.72);
    screensaverPointerVelocityX = THREE.MathUtils.lerp(
      screensaverPointerVelocityX,
      velocityX,
      velocityAlpha,
    );
    screensaverPointerVelocityY = THREE.MathUtils.lerp(
      screensaverPointerVelocityY,
      velocityY,
      velocityAlpha,
    );
  }
  recordScreensaverPointerWake(
    previousClientX,
    previousClientY,
    previousPointerAt,
    nextClientX,
    nextClientY,
    inputAt,
  );
  screensaverPointerClientX = nextClientX;
  screensaverPointerClientY = nextClientY;
  screensaverPointerLastAt = inputAt;
  return true;
}

function handleScreensaverActivity(event) {
  if (!screensaverActive) return;
  if (event.type !== "pointerdown" && event.type !== "keydown") return;
  if (event.type === "keydown" && event.key === "Control") {
    setScreensaverCtrlSelectionActive(true);
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  const ctrlSelecting = (
    event.type === "pointerdown"
    && (screensaverCtrlSelectionActive || event.ctrlKey)
  );
  if (ctrlSelecting) {
    screensaverContextMenuSuppressedUntil = (
      performance.now() + SCREENSAVER_CONTEXT_MENU_SUPPRESSION_MS
    );
  }
  const selectedEntry = event.type === "pointerdown"
    ? (
      getScreensaverCardEntryAtPoint(
        event.clientX,
        event.clientY,
        true,
      )
      || getRecentScreensaverHoveredCardEntry(event)
    )
    : null;
  if (ctrlSelecting && !selectedEntry) {
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  if (
    performance.now() < screensaverExitArmedAt
    && !selectedEntry
  ) {
    return;
  }
  if (event.cancelable) event.preventDefault();
  event.stopImmediatePropagation();
  deactivateScreensaverMode({
    selectedCardIndex: selectedEntry?.index,
  });
}

function suppressScreensaverSelectionContextMenu(event) {
  const suppressDuringScreensaver = (
    (screensaverActive || screensaverPreparing)
    && (screensaverCtrlSelectionActive || event.ctrlKey)
  );
  const suppressDuringCardTransition = (
    performance.now() < screensaverContextMenuSuppressedUntil
  );
  if (!suppressDuringScreensaver && !suppressDuringCardTransition) return;

  screensaverContextMenuSuppressedUntil = 0;
  if (event.cancelable) event.preventDefault();
  event.stopImmediatePropagation();
}

function updateScreensaverPointerHoverIfNeeded(now) {
  if (
    !screensaverPointerHoverDirty
    || now < screensaverPointerHoverNextAt
    || !Number.isFinite(screensaverPointerClientX)
    || !Number.isFinite(screensaverPointerClientY)
  ) {
    return;
  }
  screensaverPointerHoverDirty = false;
  screensaverPointerHoverNextAt = now
    + SCREENSAVER_POINTER_HOVER_RAYCAST_INTERVAL_MS;
  updateScreensaverPointerHoverAt(
    screensaverPointerClientX,
    screensaverPointerClientY,
    now,
  );
}

function updateScreensaverPointerHoverAt(clientX, clientY, now) {
  const previousHoveredCardIndex = screensaverHoveredCardIndex;
  // Hover runs during every mouse-wind gesture, so keep it on the cached
  // screen-space card bounds. The precise raycast is reserved for clicks.
  const hoveredEntry = getScreensaverCardEntryAtProjectedPoint(clientX, clientY);
  if (hoveredEntry) {
    screensaverHoveredCardIndex = hoveredEntry.index;
    screensaverHoveredCardAt = now;
    screensaverHoveredCardClientX = clientX;
    screensaverHoveredCardClientY = clientY;
  } else {
    screensaverHoveredCardIndex = null;
    screensaverHoveredCardAt = 0;
  }
  if (previousHoveredCardIndex === screensaverHoveredCardIndex) return;
  if (screensaverCanvas) screensaverCanvas.style.cursor = hoveredEntry ? "pointer" : "";
  if (screensaverOverlay) {
    if (hoveredEntry) {
      screensaverOverlay.dataset.hoveredCardIndex = String(hoveredEntry.index);
      screensaverOverlay.dataset.hoveredCardCollection = (
        hoveredEntry.card?.collection || ACTIVE_COLLECTION_ID
      );
    } else {
      delete screensaverOverlay.dataset.hoveredCardIndex;
      delete screensaverOverlay.dataset.hoveredCardCollection;
    }
  }
}

function getRecentScreensaverHoveredCardEntry(event) {
  if (
    !Number.isInteger(screensaverHoveredCardIndex)
    || performance.now() - screensaverHoveredCardAt > SCREENSAVER_POINTER_SELECTION_GRACE_MS
    || Math.hypot(
      event.clientX - screensaverHoveredCardClientX,
      event.clientY - screensaverHoveredCardClientY,
    ) > 22
  ) {
    return null;
  }
  return screensaverCards.find((entry) => entry.index === screensaverHoveredCardIndex) || null;
}

function getScreensaverCardEntryAtPoint(
  clientX,
  clientY,
  refreshMatrices = false,
) {
  if (
    !screensaverCanvas
    || !screensaverCamera
    || !screensaverScene
    || !Number.isFinite(clientX)
    || !Number.isFinite(clientY)
  ) {
    return null;
  }

  const rect = screensaverViewportRect;
  if (!rect.width || !rect.height) return null;
  screensaverPointer.set(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -(((clientY - rect.top) / rect.height) * 2 - 1),
  );
  if (refreshMatrices) {
    screensaverCamera.updateMatrixWorld(true);
    screensaverScene.updateMatrixWorld(true);
  }
  screensaverRaycaster.setFromCamera(screensaverPointer, screensaverCamera);

  const cardFaceMeshes = screensaverRaycastMeshScratch;
  cardFaceMeshes.length = 0;
  for (const entry of screensaverCards) {
    if (!entry.collisionActive) continue;
    const frontMesh = entry.group?.userData?.frontMesh;
    const backMesh = entry.group?.userData?.backMesh;
    if (frontMesh?.visible !== false) cardFaceMeshes.push(frontMesh);
    if (backMesh?.visible !== false) cardFaceMeshes.push(backMesh);
  }
  const hit = screensaverRaycaster.intersectObjects(cardFaceMeshes, false)[0];
  if (hit?.object) {
    const hitEntry = getScreensaverEntryFromObject(hit.object);
    if (hitEntry) return hitEntry;
  }
  return refreshMatrices
    ? getScreensaverCardEntryAtProjectedPoint(clientX, clientY)
    : null;
}

function getScreensaverEntryFromObject(object) {
  let current = object;
  while (current && current !== screensaverScene) {
    if (current.userData?.screensaverEntry) {
      return current.userData.screensaverEntry;
    }
    current = current.parent;
  }
  return null;
}

function getScreensaverCardEntryAtProjectedPoint(clientX, clientY) {
  const rect = screensaverViewportRect;
  let bestEntry = null;
  let bestScore = Infinity;
  for (const entry of screensaverCards) {
    if (!entry.collisionActive) continue;
    const centerX = rect.left + (0.5 + entry.screenX) * rect.width;
    const centerY = rect.top + (0.5 - entry.screenY) * rect.height;
    const hitRadius = Math.max(
      10,
      entry.projectedCardHeightPx
        * SCREENSAVER_POINTER_CLICK_HALF_DIAGONAL_SCALE,
    );
    const normalizedDistance = Math.hypot(
      clientX - centerX,
      clientY - centerY,
    ) / hitRadius;
    if (normalizedDistance > 1) continue;
    const depthPreference = entry.depth * 0.012;
    const score = normalizedDistance - depthPreference;
    if (score >= bestScore) continue;
    bestScore = score;
    bestEntry = entry;
  }
  return bestEntry;
}

function openScreensaverCardInIndividualView(cardIndex) {
  if (!Number.isInteger(cardIndex) || !CARDS[cardIndex]) return false;
  const card = CARDS[cardIndex];
  const collectionId = card.collection || ACTIVE_COLLECTION_ID;

  if (
    collectionId !== ACTIVE_COLLECTION_ID
    && usesEvilBinderPresentation()
    && COLLECTION_CONFIGS[collectionId]?.introGroup === "evil"
  ) {
    commitActiveEvilBinderCollection(collectionId, {
      historyMode: "push",
      prepareBinder: false,
      tableCollectionOrder: normalizeEvilBinderTableCollectionOrder(
        binderEvilTableCollectionOrder,
        collectionId,
      ),
    });
  }

  resetIndividualCardZoom();
  setGalleryOpen(false);
  const prepared = getPreparedIndividualCardResult(card);
  const cardOptions = {};
  if (prepared?.frontTexture) cardOptions.frontTexture = prepared.frontTexture;
  if (prepared?.backTexture) cardOptions.backTexture = prepared.backTexture;
  if (prepared) cardOptions.effectTextures = prepared.effectTextures;
  setCard(cardIndex, cardOptions);
  currentRotationX = 0;
  currentRotationY = 0;
  targetRotationX = 0;
  targetRotationY = 0;
  cardShuffleSpinY = 0;
  cardGroup.rotation.set(0, 0, 0);
  resizeCardRenderer();
  setCardEffectViewTargetOpacity(1, { immediate: true });
  if (screensaverOverlay) {
    screensaverOverlay.dataset.selectedCardIndex = String(cardIndex);
    screensaverOverlay.dataset.selectedCardCollection = collectionId;
    screensaverOverlay.dataset.selectedCardStableId = card.stableId || "";
    screensaverOverlay.dataset.selectedCardPath = window.location.pathname;
  }
  queueSessionViewStateSave();
  return true;
}

function resetScreensaverPointerInteraction() {
  screensaverCtrlSelectionActive = false;
  screensaverPointerClientX = Number.NaN;
  screensaverPointerClientY = Number.NaN;
  screensaverPointerVelocityX = 0;
  screensaverPointerVelocityY = 0;
  screensaverPointerLastAt = 0;
  screensaverPointerForceApplications = 0;
  screensaverPendingPointerX = Number.NaN;
  screensaverPendingPointerY = Number.NaN;
  screensaverPendingPointerAt = 0;
  screensaverPointerInputPending = false;
  screensaverPointerHoverDirty = false;
  screensaverPointerHoverNextAt = 0;
  screensaverDiagnosticsNextAt = 0;
  screensaverHoveredCardIndex = null;
  screensaverHoveredCardAt = 0;
  screensaverHoveredCardClientX = Number.NaN;
  screensaverHoveredCardClientY = Number.NaN;
  screensaverPointerWakeCursor = 0;
  screensaverPointerWakeCount = 0;
  screensaverRaycastMeshScratch.length = 0;
  if (screensaverCanvas) screensaverCanvas.style.cursor = "";
  if (screensaverOverlay) screensaverOverlay.dataset.pointerForces = "0";
  if (screensaverOverlay) screensaverOverlay.dataset.activeWakeSamples = "0";
  if (screensaverOverlay) screensaverOverlay.dataset.ctrlSelectionActive = "false";
  if (screensaverOverlay) delete screensaverOverlay.dataset.hoveredCardIndex;
  if (screensaverOverlay) delete screensaverOverlay.dataset.hoveredCardCollection;
}

function deactivateScreensaverMode({ selectedCardIndex = null } = {}) {
  if (!screensaverActive && !screensaverPreparing) return;
  const openSelectedCard = Number.isInteger(selectedCardIndex)
    && Boolean(CARDS[selectedCardIndex]);
  let selectedCardOpened = false;
  screensaverActive = false;
  screensaverPreparing = false;
  void exitScreensaverFullscreen();
  screensaverExitArmedAt = 0;
  screensaverPrepareToken += 1;
  resetScreensaverPointerInteraction();
  stopScreensaverAnimation();
  document.body.classList.remove("screensaver-mode");
  screensaverOverlay?.classList.remove("is-visible");
  if (openSelectedCard) {
    try {
      selectedCardOpened = openScreensaverCardInIndividualView(selectedCardIndex);
    } catch (error) {
      console.error("Unable to open selected screensaver card", error);
    }
  }

  if (screensaverExitTimer) window.clearTimeout(screensaverExitTimer);
  screensaverExitTimer = window.setTimeout(() => {
    screensaverExitTimer = 0;
    screensaverOverlay?.classList.remove("is-mounted");
    screensaverOverlay?.setAttribute("aria-hidden", "true");
    restoreScreensaverTooltips();
    clearScreensaverCards({ includeReady: true });
    screensaverPrewarmPromise = null;
  }, SCREENSAVER_FADE_MS + 80);

  requestResize();
  if (selectedCardOpened) {
    startCardRenderLoop();
  } else if (galleryOpen && isBinderMode && !els.binderPanel.hidden) {
    startBinderRenderLoop();
    requestBinderMaintenance(0);
  } else if (!galleryOpen) {
    startCardRenderLoop();
  }
}

function suppressScreensaverTooltips() {
  const suppressTitle = (element) => {
    if (!(element instanceof Element) || !element.hasAttribute("title")) return;
    screensaverSuppressedTitles.set(element, element.getAttribute("title") || "");
    element.removeAttribute("title");
  };
  const suppressTitlesWithin = (root) => {
    if (!(root instanceof Element)) return;
    suppressTitle(root);
    for (const element of root.querySelectorAll("[title]")) suppressTitle(element);
  };

  suppressTitlesWithin(document.body);
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();

  screensaverTooltipObserver?.disconnect();
  screensaverTooltipObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes") {
        suppressTitle(mutation.target);
        continue;
      }
      for (const node of mutation.addedNodes) suppressTitlesWithin(node);
    }
  });
  screensaverTooltipObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["title"],
    childList: true,
    subtree: true,
  });
}

function restoreScreensaverTooltips() {
  screensaverTooltipObserver?.disconnect();
  screensaverTooltipObserver = null;
  for (const [element, title] of screensaverSuppressedTitles) {
    if (element.isConnected) element.setAttribute("title", title);
  }
  screensaverSuppressedTitles.clear();
}

function clearScreensaverCards({ includeReady = false } = {}) {
  for (const entry of screensaverCards.splice(0)) {
    screensaverScene?.remove(entry.group);
    disposeCardSwapGroup(entry.group);
  }
  if (includeReady) {
    for (const entry of screensaverReadyCards.splice(0)) {
      screensaverScene?.remove(entry.group);
      disposeCardSwapGroup(entry.group);
    }
  }
  screensaverPrepareActiveCount = 0;
  updateScreensaverCardDiagnostics();
}

function resizeScreensaverRenderer(force = false) {
  if (!screensaverRenderer || !screensaverCamera || !screensaverCanvas) return;
  const width = Math.max(1, Math.floor(getAppViewportWidth()));
  const height = Math.max(1, Math.floor(getAppViewportHeight()));
  screensaverViewportRect.left = appViewportLeft || 0;
  screensaverViewportRect.top = appViewportTop || 0;
  screensaverViewportRect.width = width;
  screensaverViewportRect.height = height;
  screensaverViewportRect.ambientRadius = clamp(
    Math.hypot(width, height) * SCREENSAVER_POINTER_AMBIENT_VIEWPORT_RATIO,
    SCREENSAVER_POINTER_AMBIENT_RADIUS_MIN,
    SCREENSAVER_POINTER_AMBIENT_RADIUS_MAX,
  );
  const pixelRatio = getRendererPixelRatio(width, height);
  if (Math.abs(screensaverRenderer.getPixelRatio() - pixelRatio) > 0.001) {
    screensaverRenderer.setPixelRatio(pixelRatio);
    force = true;
  }
  if (
    !force
    && screensaverCanvas.width === Math.floor(width * pixelRatio)
    && screensaverCanvas.height === Math.floor(height * pixelRatio)
  ) {
    return;
  }
  screensaverRenderer.setSize(width, height, false);
  screensaverCamera.aspect = width / height;
  screensaverCamera.updateProjectionMatrix();
  for (const entry of screensaverCards) {
    const previousViewWidth = entry.viewWidth || 1;
    const previousViewHeight = entry.viewHeight || 1;
    const normalizedNaturalX = entry.naturalX / previousViewWidth;
    const normalizedNaturalY = entry.naturalY / previousViewHeight;
    const normalizedOffsetX = entry.offsetX / previousViewWidth;
    const normalizedOffsetY = entry.offsetY / previousViewHeight;
    const normalizedVelocityX = entry.velocityX / previousViewWidth;
    const normalizedVelocityY = entry.velocityY / previousViewHeight;
    const view = getScreensaverVisibleWorldSize(entry.depth);
    entry.viewWidth = view.width;
    entry.viewHeight = view.height;
    entry.viewInverseWidth = 1 / view.width;
    entry.viewInverseHeight = 1 / view.height;
    entry.pointerWorldPerPixelX = view.width / width;
    entry.pointerWorldPerPixelY = view.height / height;
    entry.projectedCardHeightPx = CARD_HEIGHT * entry.scale / view.height * height;
    entry.speed = view.height
      * SCREENSAVER_NORMALIZED_FALL_SPEED
      * (entry.speedMultiplier || 1);
    entry.naturalX = normalizedNaturalX * view.width;
    entry.naturalY = normalizedNaturalY * view.height;
    entry.offsetX = normalizedOffsetX * view.width;
    entry.offsetY = normalizedOffsetY * view.height;
    entry.velocityX = normalizedVelocityX * view.width;
    entry.velocityY = normalizedVelocityY * view.height;
    entry.group.position.x = entry.naturalX + entry.offsetX;
    entry.group.position.y = entry.naturalY + entry.offsetY;
    updateScreensaverCollisionFrame(entry);
  }
}

function tweenCardShuffleSpin(nextIndex, frontTexture, effectTextures, token) {
  const startedAt = performance.now();
  let swapped = false;
  cardShuffleGlossOpacity = 0;

  return new Promise((resolve) => {
    const step = (now) => {
      if (token !== cardShuffleSpinToken) {
        resolve();
        return;
      }

      const progress = clamp((now - startedAt) / CARD_SHUFFLE_SPIN_MS, 0, 1);
      const eased = easeInOutCubic(progress);
      cardShuffleSpinY = CARD_SHUFFLE_SPIN_DIRECTION * eased * Math.PI * 2;
      cardShuffleGlossOpacity = getCardShuffleGlossEnvelopeOpacity(progress);

      if (!swapped && eased >= 0.5) {
        swapped = true;
        cardShuffleSpinY = CARD_SHUFFLE_SPIN_DIRECTION * Math.PI;
        applyShuffleFrontFace(nextIndex, frontTexture, effectTextures);
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

function getCardShuffleGlossEnvelopeOpacity(progress) {
  const fadeInProgress = clamp(
    (progress - CARD_SHUFFLE_GLOSS_FADE_IN_START)
      / (CARD_SHUFFLE_GLOSS_FADE_IN_END - CARD_SHUFFLE_GLOSS_FADE_IN_START),
    0,
    1,
  );
  const fadeOutProgress = clamp(
    (progress - CARD_SHUFFLE_GLOSS_FADE_START)
      / (CARD_SHUFFLE_GLOSS_FADE_END - CARD_SHUFFLE_GLOSS_FADE_START),
    0,
    1,
  );
  return easeInOutCubic(fadeInProgress)
    * (1 - easeInOutCubic(fadeOutProgress));
}

function applyShuffleFrontFace(nextIndex, frontTexture, effectTextures = null) {
  const card = CARDS[nextIndex];
  if (frontTexture) {
    prepareTextureForImmediateDisplay(frontTexture);
    cardFrontMesh.material.map = frontTexture;
  } else {
    cardFrontMesh.material.map = getCardPlaceholderTexture();
  }
  applyCardFrontEffectProfile(card, cardApplyToken, { loadTextures: false });
  if (effectTextures) {
    applyCardEffectTexturesToMesh(
      cardGradientMesh,
      effectTextures.foil,
      effectTextures.mask,
      { immediate: true },
    );
    applyCardEffectTexturesToMesh(
      cardGlareMesh,
      effectTextures.foil,
      effectTextures.mask,
      { immediate: true },
    );
  }
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
  cardShuffleGlossOpacity = 1;
}

function easeInOutCubic(progress) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - ((-2 * progress + 2) ** 3) / 2;
}

function easeOutCubic(progress) {
  return 1 - ((1 - clamp(progress, 0, 1)) ** 3);
}

function toggleCurrentFavorite() {
  const key = favoriteKey(currentIndex);
  if (favorites.has(key)) {
    favorites.delete(key);
  } else {
    favorites.add(key);
  }
  saveSet(FAVORITES_STORAGE_KEY, favorites);
  updateFavoriteButtons();
  if (galleryOpen) renderGallery();
}

function toggleTraitInfo() {
  setTraitInfoOpen(!traitInfoOpenRequested);
}

function setTraitInfoOpen(open) {
  const shouldOpen = Boolean(open) && !galleryOpen;
  traitInfoOpenRequested = shouldOpen;
  const openToken = ++traitPanelOpenToken;
  if (traitPanelOpenFrame) {
    cancelAnimationFrame(traitPanelOpenFrame);
    traitPanelOpenFrame = 0;
  }

  els.traitInfoButton.setAttribute("aria-expanded", String(shouldOpen));
  if (!shouldOpen) {
    traitsOpen = false;
    els.body.classList.remove("traits-open");
    els.traitPanel.setAttribute("aria-hidden", "true");
    return;
  }

  els.traitPanel.setAttribute("aria-hidden", "true");
  const collectionId = CARDS[currentIndex]?.collection || ACTIVE_COLLECTION_ID;
  ensureTraitUiData(collectionId)
    .then(() => {
      if (!traitInfoOpenRequested || openToken !== traitPanelOpenToken) return;
      const currentCollectionId = (
        CARDS[currentIndex]?.collection || ACTIVE_COLLECTION_ID
      );
      if (currentCollectionId !== collectionId) {
        setTraitInfoOpen(true);
        return;
      }
      revealPreparedTraitPanel(openToken);
    })
    .catch((error) => {
      console.error(error);
      if (!traitInfoOpenRequested || openToken !== traitPanelOpenToken) return;
      const currentCollectionId = (
        CARDS[currentIndex]?.collection || ACTIVE_COLLECTION_ID
      );
      if (currentCollectionId !== collectionId) {
        setTraitInfoOpen(true);
        return;
      }
      revealPreparedTraitPanel(openToken);
    });
}

function revealPreparedTraitPanel(openToken) {
  if (!traitInfoOpenRequested || openToken !== traitPanelOpenToken) return;
  renderTraitPanel();

  // Commit the final tile geometry while the panel is still transparent.
  // Its entrance can then animate as one stable composited layer.
  void els.traitPanel.offsetHeight;
  traitPanelOpenFrame = requestAnimationFrame(() => {
    traitPanelOpenFrame = 0;
    if (!traitInfoOpenRequested || openToken !== traitPanelOpenToken) return;
    traitsOpen = true;
    els.body.classList.add("traits-open");
    els.traitPanel.setAttribute("aria-hidden", "false");
  });
}

function scheduleTraitUiPrewarm(collectionId) {
  if (!COLLECTION_CONFIGS[collectionId]) return;
  if (
    traitUiPrewarmCollectionId === collectionId
    && (traitUiPrewarmIdleCallback || traitUiPrewarmTimer)
  ) {
    return;
  }

  if (
    traitUiPrewarmIdleCallback
    && typeof window.cancelIdleCallback === "function"
  ) {
    window.cancelIdleCallback(traitUiPrewarmIdleCallback);
  }
  if (traitUiPrewarmTimer) clearTimeout(traitUiPrewarmTimer);
  traitUiPrewarmIdleCallback = 0;
  traitUiPrewarmTimer = 0;
  traitUiPrewarmCollectionId = collectionId;

  const prewarm = () => {
    traitUiPrewarmIdleCallback = 0;
    traitUiPrewarmTimer = 0;
    ensureTraitUiData(collectionId).catch((error) => {
      console.warn("Trait panel prewarm failed", error);
    });
  };
  if (typeof window.requestIdleCallback === "function") {
    traitUiPrewarmIdleCallback = window.requestIdleCallback(prewarm, {
      timeout: 700,
    });
  } else {
    traitUiPrewarmTimer = window.setTimeout(prewarm, 120);
  }
}

function renderTraitPanel() {
  if (!els.traitGrid) return;

  updateTraitExternalLinks();
  const collection = getCollectionConfigForCard(CARDS[currentIndex]);
  if (collection.traitCategories.length && !collection.traits) {
    const tile = document.createElement("article");
    tile.className = "trait-tile trait-tile-empty";
    const value = document.createElement("div");
    value.className = "trait-value";
    value.textContent = collection.traitsError ? "Traits unavailable" : "Loading traits…";
    tile.append(value);
    els.traitGrid.replaceChildren(tile);
    return;
  }

  const traits = getCardTraitEntries(currentIndex);
  const fragment = document.createDocumentFragment();
  for (const trait of traits) {
    const tile = document.createElement("button");
    tile.className = "trait-tile";
    tile.type = "button";
    if (trait.filterable !== false && traitFiltersEnabledForCollection(trait.collection)) {
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
  applyTraitFilter(trait.category, trait.value, {
    collectionId: trait.collection,
    sourceCategories: trait.sourceCategories,
  });
}

function applyTraitFilter(category, value, options = {}) {
  const collectionId = COLLECTION_CONFIGS[options.collectionId]?.id || ACTIVE_COLLECTION_ID;
  if (!traitFiltersEnabledForCollection(collectionId)) return;
  const preserveMixedSource = isMixedCollectionGallery();
  const displayCategory = getTraitSearchDisplayCategory(category, collectionId);
  const sourceCategories = getValidTraitFilterSourceCategories(
    options.sourceCategories,
    category,
    collectionId,
  );
  activeTraitFilter = {
    collectionId,
    category: displayCategory,
    value,
    normalizedValue: normalizeTraitValue(value),
    sourceCategories,
  };
  activeCollectionFilter = preserveMixedSource ? collectionId : "";
  const canShowSortCategory = collectionId === ACTIVE_COLLECTION_ID
    && !preserveMixedSource
    && getValidTraitSortCategory(displayCategory) !== "all";
  if (!preserveMixedSource) {
    traitSortCategory = canShowSortCategory ? displayCategory : "all";
  }
  els.traitSortSelect.value = traitSortCategory;
  if (!preserveMixedSource) {
    favoritesOnly = false;
    if (!WALLET_ROUTE_ADDRESS) resetWalletCardFilter();
  }
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  resetTraitSearchQuery();
  setGalleryViewMode(true, { render: false });
  updateFavoriteButtons();
  updateTraitSearchState();
  if (options.updateUrl !== false) updateGalleryUrlFromState();
  resetBinderGalleryPosition();
  setGalleryOpen(true);
}

function getCardTraitEntries(index) {
  const card = CARDS[index];
  const collection = getCollectionConfigForCard(card);
  const row = collection.traits?.rows?.[card?.collectionIndex] || [];
  const dictionary = collection.traits?.dictionary || [];
  const entries = [];
  for (let offset = 0; offset + 1 < row.length; offset += 2) {
    const category = String(collection.traitCategories[row[offset]] || "").trim();
    const value = String(dictionary[row[offset + 1]] || "").trim();
    if (
      !category
      || HIDDEN_TRAIT_CATEGORIES.has(category)
      || normalizeTraitValue(category) === "status"
      || !isVisibleTraitValue(value)
    ) continue;
    entries.push({
      collection: collection.id,
      category,
      value,
    });
  }
  const orderedEntries = orderTraitPanelEntries(entries);
  const statusValue = getCardStatusTraitValue(card?.status);
  if (statusValue) {
    orderedEntries.unshift({
      collection: collection.id,
      category: "Status",
      value: statusValue,
      filterable: false,
    });
  }
  orderedEntries.push({
    collection: collection.id,
    category: "listed?",
    value: card?.listed ? "true" : "false",
    filterable: false,
  });
  return orderedEntries;
}

function getCardStatusTraitValue(status) {
  const normalizedStatus = normalizeTraitValue(status);
  if (normalizedStatus === "in pack") return "Still in pack";
  if (normalizedStatus === "redeemed") return "Redeemed";
  if (normalizedStatus === "pulled") return "Pulled";
  return "";
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
  if (normalizeTraitValue(category) === "listed?") {
    return (collection.cards || []).reduce((total, card) => (
      total + (String(Boolean(card?.listed)) === normalizedValue ? 1 : 0)
    ), 0);
  }
  if (normalizeTraitValue(category) === "status") {
    return (collection.cards || []).reduce((total, card) => (
      total + (
        normalizeTraitValue(getCardStatusTraitValue(card?.status)) === normalizedValue
          ? 1
          : 0
      )
    ), 0);
  }
  if (!collection.traits || !normalizedValue) return 0;
  if (!collection.traitOccurrenceCountCache) buildTraitOccurrenceCountCache(collection);
  const displayCategory = getTraitSearchDisplayCategory(category, collection.id);
  return collection.traitOccurrenceCountCache.get(
    `${normalizeTraitValue(displayCategory)}\u0000${normalizedValue}`,
  ) || 0;
}

function buildTraitOccurrenceCountCache(collection) {
  const counts = new Map();
  const dictionary = collection.traits?.dictionary || [];
  for (const row of collection.traits?.rows || []) {
    const seen = new Set();
    for (let offset = 0; offset + 1 < row.length; offset += 2) {
      const category = String(collection.traitCategories[row[offset]] || "").trim();
      const value = String(dictionary[row[offset + 1]] || "").trim();
      if (!category || HIDDEN_TRAIT_CATEGORIES.has(category) || !isVisibleTraitValue(value)) continue;
      const displayCategory = getTraitSearchDisplayCategory(category, collection.id);
      const key = `${normalizeTraitValue(displayCategory)}\u0000${normalizeTraitValue(value)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  collection.traitOccurrenceCountCache = counts;
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
  saveSet(FAVORITES_STORAGE_KEY, favorites);
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
  const collectionId = CARDS[currentIndex]?.collection || ACTIVE_COLLECTION_ID;
  return CARD_NUMBER_TO_INDEX.get(`${collectionId}:${parsed}`) ?? null;
}

function getCardJumpDisplayNumber(index) {
  if (Number.isInteger(CARDS[index]?.number)) return CARDS[index].number;
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
  const mint = String(
    walletMatchedMintByCardIndex.get(currentIndex)
    || card?.mint
    || "",
  ).trim();
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
  if (!open && binderOrderEditorOpen) {
    closeBinderOrderEditor({ restoreFocus: false });
  }
  resetViewSwitchWheelDistances();
  resetTouchGestures();
  binderOuterFlipState = null;
  resetBinderOuterFlipTransform();
  resetEvilBinderTableSwap();
  if (!open) setBinderTableView(false, { immediate: true, updateControls: false });
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
    stopCardRenderLoop();
    cancelIndividualCardPrewarmQueue();
    cancelIndividualBinderSpreadPrewarm({ preserveProtectedKeys: true });
    clearBinderFocus({ silent: true });
    snapBinderToWholePage();
    renderGallery();
    startBinderRenderLoop();
  } else {
    cancelGalleryRender();
    els.galleryGrid.replaceChildren();
    clearBinderFocus({ silent: true });
    snapBinderToWholePage();
    clearGalleryCardTilts();
    clearBinderIntroLinkCursor();
    stopBinderRenderLoop();
    if (individualCardAssetsDeferred) setCard(currentIndex);
    else scheduleIndividualBinderSpreadPrewarm(currentIndex);
    if (!binderCardViewTransitionActive) {
      setCardEffectViewTargetOpacity(1, { immediate: true });
    }
    startCardRenderLoop();
  }
  updateCardNameJumpState();
  updateBinderOrderEditorAvailability();
  queueSessionViewStateSave();
}

function resetGalleryFilters({ preserveFavorites = false } = {}) {
  activeCollectionFilter = "";
  activeTraitFilter = null;
  if (!preserveFavorites) favoritesOnly = false;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
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
  activeCollectionFilter = "";
  activeTraitFilter = null;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  cancelTraitSearchRender();
  resetTraitSearchQuery();
  traitSortCategory = "all";
  if (els.traitSortSelect) els.traitSortSelect.value = "all";
  updateGalleryUrlFromState();
  updateTraitSearchState();
  resetBinderGalleryPosition();
  renderGallery();
}

async function toggleFavoriteFilter() {
  const nextFavoritesOnly = !favoritesOnly;
  if (nextFavoritesOnly) await ensureFavoriteCollectionCards();
  favoritesOnly = nextFavoritesOnly;
  activeCollectionFilter = "";
  activeTraitFilter = null;
  traitSortCategory = "all";
  if (favoritesOnly) {
    resetWalletCardFilter();
  }
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  resetTraitSearchQuery();
  populateTraitSortOptions();
  updateGalleryUrlFromState();
  updateTraitSearchState();
  updateFavoriteButtons();
  resetBinderGalleryPosition();
  renderGallery();
  queueSessionViewStateSave();
}

async function toggleTraitSearch() {
  if (!galleryCollectionFiltersAvailable()) return;
  const nextOpen = !traitSearchOpen;
  if (nextOpen) {
    const mixedCollections = isMixedCollectionGallery();
    traitSearchCollectionId = "";
    els.traitSearchButton.disabled = true;
    els.traitSearchButton.setAttribute("aria-busy", "true");
    try {
      if (!mixedCollections) await ensureTraitUiData(ACTIVE_COLLECTION_ID);
      updateTraitSearchPlaceholder();
    } finally {
      els.traitSearchButton.disabled = !galleryCollectionFiltersAvailable();
      els.traitSearchButton.removeAttribute("aria-busy");
    }
  }
  traitSearchOpen = nextOpen;
  if (traitSearchOpen) {
    cancelGalleryRender();
    clearBinderFocus({ silent: true });
    deactivateAllAnimatedRecords();
  } else {
    traitSearchCollectionId = "";
    resetTraitSearchQuery();
    cancelTraitSearchRender();
  }
  updateTraitSearchState();
  renderGallery();
}

function updateTraitSearchQuery() {
  traitSearchQuery = els.traitSearchInput.value;
  if (traitSearchQueryFrame) return;
  traitSearchQueryFrame = requestAnimationFrame(() => {
    traitSearchQueryFrame = 0;
    if (!traitSearchOpen) return;
    renderTraitSearch();
    els.traitSearchGroups.scrollTop = 0;
  });
}

function resetTraitSearchQuery() {
  if (traitSearchQueryFrame) {
    cancelAnimationFrame(traitSearchQueryFrame);
    traitSearchQueryFrame = 0;
  }
  traitSearchQuery = "";
  if (els.traitSearchInput) els.traitSearchInput.value = "";
}

function updateTraitSearchState() {
  const open = galleryOpen && traitSearchOpen;
  const collectionPickerOpen = open
    && isMixedCollectionGallery()
    && !traitSearchCollectionId;
  if (!open) cancelTraitSearchRender();
  els.body.classList.toggle("trait-search-open", open);
  els.body.classList.toggle("mixed-collection-filter-picker", collectionPickerOpen);
  els.traitSearchPanel.hidden = !open;
  els.traitSearchPanel.setAttribute(
    "aria-label",
    collectionPickerOpen ? "Collection filters" : "Trait filters",
  );
  if (els.traitSearchFilter) els.traitSearchFilter.hidden = collectionPickerOpen;
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
    activeCollectionFilter
    || activeTraitFilter
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
  return Boolean(
    favoritesOnly
    || (!WALLET_ROUTE_ADDRESS && walletFilterCardIndexSet)
  );
}

function updateTraitSearchButtonLabel() {
  if (!els.traitSearchButton) return;

  const mixedCollections = isMixedCollectionGallery();
  const activeFilter = Boolean(activeCollectionFilter || activeTraitFilter);
  const label = mixedCollections ? "filter" : (activeTraitFilter?.value || "traits");
  const labelElement = els.traitSearchButtonLabel || els.traitSearchButton;
  labelElement.textContent = label;
  els.traitSearchButton.classList.toggle("has-active-trait", activeFilter);
  const selectedCollectionLabel = COLLECTION_CONFIGS[activeCollectionFilter]?.label || "";
  els.traitSearchButton.title = mixedCollections
    ? activeTraitFilter
      ? `Filtered by ${selectedCollectionLabel}: ${activeTraitFilter.value}`
      : selectedCollectionLabel
        ? `Filtered by ${selectedCollectionLabel}`
        : "Filter cards"
    : activeTraitFilter
      ? `Selected trait: ${activeTraitFilter.value}`
      : "Search traits";
  els.traitSearchButton.setAttribute(
    "aria-label",
    els.traitSearchButton.title,
  );
}

function toggleWalletSearchPanel() {
  if (!walletSearchOpen && traitSearchOpen) {
    traitSearchOpen = false;
    traitSearchCollectionId = "";
    resetTraitSearchQuery();
    updateTraitSearchState();
    renderGallery();
  }
  if (!walletSearchOpen) refreshCompatibleSolanaWallets();
  setWalletSearchPanelOpen(!walletSearchOpen);
}

function setWalletSearchPanelOpen(open, options = {}) {
  const nextOpen = Boolean(open) && galleryOpen;
  walletSearchOpen = nextOpen;
  if (els.walletSearchPanel) {
    els.walletSearchPanel.hidden = !nextOpen;
    els.walletSearchPanel.setAttribute("aria-hidden", String(!nextOpen));
    els.walletSearchPanel.setAttribute(
      "aria-busy",
      String((walletSearchLoading || walletAuthLoading || walletBinderDirectoryLoading) && nextOpen),
    );
  }
  if (els.walletSearchButton) {
    els.walletSearchButton.setAttribute("aria-expanded", String(nextOpen));
  }

  if (!nextOpen) {
    setWalletBinderDirectoryOpen(false, { restoreFocus: false });
    walletSearchToken += 1;
    walletProviderListOpen = false;
    setWalletSearchLoading(false);
    updateWalletAuthUi();
    return;
  }

  if (!options.preserveMessage) {
    els.walletSearchMessage.textContent = WALLET_SEARCH_PROMPT;
  }
  setWalletSearchLoading(false);
  refreshCompatibleSolanaWallets();
  updateWalletAuthUi();
  prefetchWalletBinderDirectory();
  requestAnimationFrame(() => {
    els.walletBinderDirectoryButton.focus();
  });
}

function prefetchWalletBinderDirectory() {
  if (walletBinderDirectoryLoading || walletBinderDirectoryTotal != null) return;
  loadWalletBinderDirectory({ reset: true }).catch(() => {
    // Opening the directory will expose its retry control if this warmup fails.
  });
}

function openWalletBinderDirectory() {
  if (!walletSearchOpen || walletBinderDirectoryTransitioning) return;
  setWalletBinderDirectoryOpen(true);
}

function setWalletBinderDirectoryOpen(open, options = {}) {
  const nextOpen = Boolean(open) && walletSearchOpen;
  walletBinderDirectoryOpen = nextOpen;
  els.walletSearchForm.classList.toggle("is-directory-open", nextOpen);
  els.walletBinderDirectory.hidden = !nextOpen;
  els.walletBinderDirectoryButton.setAttribute("aria-expanded", String(nextOpen));
  if (!nextOpen) {
    if (options.restoreFocus !== false && walletSearchOpen) {
      requestAnimationFrame(() => els.walletBinderDirectoryButton.focus());
    }
    return;
  }

  walletProviderListOpen = false;
  updateWalletAuthUi();
  requestAnimationFrame(() => els.walletBinderDirectoryBackButton.focus());
  if (walletBinderDirectoryTotal == null) {
    loadWalletBinderDirectory({ reset: true }).catch(console.error);
  } else {
    updateWalletBinderDirectorySummary();
    requestAnimationFrame(maybeLoadMoreWalletBinders);
  }
}

async function loadWalletBinderDirectory({ reset = false } = {}) {
  if (walletBinderDirectoryLoading) return;
  if (!reset && !walletBinderDirectoryNextCursor) return;
  const token = reset ? ++walletBinderDirectoryToken : walletBinderDirectoryToken;
  if (reset) {
    walletBinderDirectoryEntries = [];
    walletBinderDirectoryNextCursor = null;
    walletBinderDirectoryTotal = null;
    walletBinderDirectoryUnverifiedCount = 0;
    renderWalletBinderDirectorySkeletons();
  }
  walletBinderDirectoryLoading = true;
  updateWalletBinderDirectorySummary();
  updateWalletDialogBusyState();

  try {
    const payload = await getPublicWalletBinders(WALLET_PUBLIC_API_BASE_URL, {
      limit: WALLET_BINDER_DIRECTORY_PAGE_SIZE,
      cursor: reset ? "" : walletBinderDirectoryNextCursor,
      version: "2",
    });
    if (token !== walletBinderDirectoryToken) return;
    const knownAddresses = new Set(
      walletBinderDirectoryEntries.map((entry) => entry.walletAddress),
    );
    const candidateEntries = (Array.isArray(payload?.binders) ? payload.binders : [])
      .filter((entry) => (
        isPossibleSolanaAddress(entry?.walletAddress)
        && !knownAddresses.has(entry.walletAddress)
      ));
    const checkedEntries = await getNonemptyWalletBinderDirectoryEntries(
      candidateEntries,
      token,
    );
    if (token !== walletBinderDirectoryToken) return;
    const newEntries = checkedEntries.filter((entry) => !entry.holdingsUnverified);
    const unverifiedEntries = checkedEntries.filter((entry) => entry.holdingsUnverified);
    if (reset) els.walletBinderDirectoryGallery.replaceChildren();
    walletBinderDirectoryEntries.push(...newEntries, ...unverifiedEntries);
    walletBinderDirectoryUnverifiedCount += unverifiedEntries.length;
    walletBinderDirectoryTotal = walletBinderDirectoryEntries.length;
    walletBinderDirectoryNextCursor = typeof payload?.nextCursor === "string"
      && payload.nextCursor
      ? payload.nextCursor
      : null;
    appendWalletBinderDirectoryEntries([...newEntries, ...unverifiedEntries]);
  } catch (error) {
    if (token !== walletBinderDirectoryToken) return;
    if (reset) els.walletBinderDirectoryGallery.replaceChildren();
    walletBinderDirectoryTotal = null;
    walletBinderDirectoryNextCursor = null;
    els.walletBinderDirectoryStatus.replaceChildren(
      createWalletBinderDirectoryRetryButton(),
    );
    throw error;
  } finally {
    if (token !== walletBinderDirectoryToken) return;
    walletBinderDirectoryLoading = false;
    updateWalletBinderDirectorySummary();
    updateWalletDialogBusyState();
    requestAnimationFrame(maybeLoadMoreWalletBinders);
  }
}

async function getNonemptyWalletBinderDirectoryEntries(entries, token) {
  if (!entries.length) return [];
  const checked = new Array(entries.length);
  const unresolvedEntries = [];
  entries.forEach((entry, index) => {
    if (Number.isInteger(entry.supportedCardCount) && entry.supportedCardCount >= 0) {
      checked[index] = entry.supportedCardCount > 0
        ? { ...entry, cardCount: entry.supportedCardCount }
        : null;
    } else {
      unresolvedEntries.push({ entry, index });
    }
  });
  if (!unresolvedEntries.length) return checked.filter(Boolean);

  // Older or newly-created profiles may not have a server summary yet. Only
  // those profiles need the slower live ownership lookup and full card index.
  await ensureAllCollectionCards();
  let nextIndex = 0;
  const workerCount = Math.min(
    WALLET_BINDER_DIRECTORY_HOLDINGS_CONCURRENCY,
    unresolvedEntries.length,
  );
  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < unresolvedEntries.length) {
      const unresolved = unresolvedEntries[nextIndex];
      nextIndex += 1;
      if (token !== walletBinderDirectoryToken) return;
      const { entry, index } = unresolved;
      try {
        const cardCount = await getWalletBinderDirectoryCardCount(entry.walletAddress);
        checked[index] = cardCount > 0 ? { ...entry, cardCount } : null;
      } catch (error) {
        const savedCardCount = Math.max(0, Number(entry.savedCardCount) || 0);
        console.warn(`Unable to verify holdings for ${entry.walletAddress}`, error);
        checked[index] = savedCardCount > 0
          ? { ...entry, cardCount: savedCardCount, holdingsUnverified: true }
          : null;
      }
    }
  }));
  return checked.filter(Boolean);
}

async function getWalletBinderDirectoryCardCount(address) {
  const cached = walletBinderDirectoryCardCountCache.get(address);
  if (cached && Date.now() - cached.checkedAt < WALLET_HOLDINGS_FOCUS_REFRESH_MS) {
    return cached.cardCount;
  }
  const payload = await fetchLiveWalletHoldingsPayload(
    address,
    WALLET_PUBLIC_API_BASE_URL,
  );
  const indexes = new Set();
  addWalletCardMatches(indexes, new Map(), [
    ...getCardMatchesForMints(payload.mints),
    ...getCardMatchesForReferences(payload.cardRefs),
  ]);
  const cardCount = indexes.size;
  walletBinderDirectoryCardCountCache.set(address, {
    cardCount,
    checkedAt: Date.now(),
  });
  return cardCount;
}

function renderWalletBinderDirectorySkeletons() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 8; index += 1) {
    const skeleton = document.createElement("div");
    skeleton.className = "wallet-binder-directory-skeleton";
    skeleton.setAttribute("aria-hidden", "true");
    fragment.append(skeleton);
  }
  els.walletBinderDirectoryGallery.replaceChildren(fragment);
}

function appendWalletBinderDirectoryEntries(entries) {
  if (!entries.length) return;
  const fragment = document.createDocumentFragment();
  for (const entry of entries) fragment.append(createWalletBinderDirectoryCard(entry));
  els.walletBinderDirectoryGallery.append(fragment);
}

function createWalletBinderDirectoryCard(entry) {
  const address = entry.walletAddress;
  const link = document.createElement("a");
  link.className = "wallet-binder-directory-card";
  link.href = new URL(`/${address}`, window.location.origin).href;
  link.dataset.walletAddress = address;
  link.setAttribute("role", "listitem");
  link.setAttribute("aria-label", `Open wallet binder ${address}`);
  link.title = address;

  const cover = document.createElement("div");
  cover.className = "wallet-binder-directory-cover is-loading";
  cover.dataset.loadingStartedAt = String(performance.now());
  cover.dataset.baseColor = entry.cover?.baseColor || BINDER_COVER_DEFAULT_COLOR_HEX;
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = Math.round(canvas.width * 7.286 / 5.234);
  canvas.setAttribute("aria-hidden", "true");
  cover.append(canvas);

  const name = document.createElement("span");
  name.className = "wallet-binder-directory-wallet-name";
  name.textContent = shortenSolAddress(address);
  const cardCount = document.createElement("span");
  cardCount.className = "wallet-binder-directory-card-count";
  cardCount.textContent = `${entry.cardCount} card${entry.cardCount === 1 ? "" : "s"}`;
  const tradeCardCount = Math.max(0, Number(entry.tradeCardCount) || 0);
  const tradeCount = document.createElement("span");
  tradeCount.className = "wallet-binder-directory-trade-count";
  tradeCount.classList.toggle("is-empty", tradeCardCount === 0);
  tradeCount.textContent = `${tradeCardCount} card${tradeCardCount === 1 ? "" : "s"} available for trade`;
  link.setAttribute(
    "aria-label",
    `Open wallet binder ${address}, ${entry.cardCount} cards, ${tradeCount.textContent}`,
  );
  link.append(cover, name, cardCount, tradeCount);

  renderWalletBinderDirectoryCover(canvas, entry.cover)
    .catch(() => {
      drawDefaultWalletBinderDirectoryCover(canvas);
    })
    .then(() => {
      if (entry.hasCustomArtwork) {
        queueWalletBinderDirectoryCover(canvas, address);
      } else {
        settleWalletBinderDirectoryCover(canvas);
      }
    });
  return link;
}

function settleWalletBinderDirectoryCover(canvas) {
  const cover = canvas?.closest?.(".wallet-binder-directory-cover");
  if (!cover?.classList.contains("is-loading")) return;
  const loadingStartedAt = Number(cover.dataset.loadingStartedAt);
  const loadingElapsed = Number.isFinite(loadingStartedAt)
    ? performance.now() - loadingStartedAt
    : WALLET_BINDER_DIRECTORY_COVER_MIN_LOADING_MS;
  if (loadingElapsed < WALLET_BINDER_DIRECTORY_COVER_MIN_LOADING_MS) {
    if (cover.dataset.loadingSettleScheduled === "true") return;
    cover.dataset.loadingSettleScheduled = "true";
    window.setTimeout(() => {
      delete cover.dataset.loadingSettleScheduled;
      settleWalletBinderDirectoryCover(canvas);
    }, WALLET_BINDER_DIRECTORY_COVER_MIN_LOADING_MS - loadingElapsed);
    return;
  }
  const currentOpacity = window.getComputedStyle(canvas).opacity;
  cover.classList.remove("is-loading");
  cover.classList.add("is-ready");
  delete cover.dataset.loadingStartedAt;
  if (
    typeof canvas.animate === "function"
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    canvas.animate(
      [{ opacity: currentOpacity }, { opacity: 1 }],
      {
        duration: 280,
        easing: "cubic-bezier(0.2, 0.76, 0.2, 1)",
      },
    );
  }
}

function queueWalletBinderDirectoryCover(canvas, address) {
  if (typeof window.IntersectionObserver !== "function") {
    loadWalletBinderDirectoryCover(canvas, address);
    return;
  }
  if (!walletBinderDirectoryCoverObserver) {
    walletBinderDirectoryCoverObserver = new IntersectionObserver((records) => {
      for (const record of records) {
        if (!record.isIntersecting) continue;
        walletBinderDirectoryCoverObserver.unobserve(record.target);
        const walletAddress = record.target.dataset.walletAddress || "";
        if (isPossibleSolanaAddress(walletAddress)) {
          loadWalletBinderDirectoryCover(record.target, walletAddress);
        }
      }
    }, {
      root: els.walletBinderDirectoryGallery,
      rootMargin: "160px 0px",
    });
  }
  canvas.dataset.walletAddress = address;
  walletBinderDirectoryCoverObserver.observe(canvas);
}

async function loadWalletBinderDirectoryCover(canvas, address) {
  try {
    const payload = await getPublicWalletBinderCover(WALLET_PUBLIC_API_BASE_URL, address);
    if (!canvas.isConnected || payload?.walletAddress !== address) return;
    await renderWalletBinderDirectoryCover(canvas, payload.cover);
  } catch {
    // The lightweight cover already rendered, so an artwork failure is non-blocking.
  } finally {
    if (canvas.isConnected && canvas.dataset.walletAddress === address) {
      settleWalletBinderDirectoryCover(canvas);
    }
  }
}

function createWalletBinderDirectoryRetryButton() {
  const button = document.createElement("button");
  button.className = "wallet-binder-directory-retry";
  button.type = "button";
  button.textContent = "Wallet binder gallery could not load. Try again.";
  button.addEventListener("click", () => {
    loadWalletBinderDirectory({ reset: true }).catch(console.error);
  }, { once: true });
  return button;
}

function updateWalletBinderDirectorySummary() {
  const loaded = walletBinderDirectoryEntries.length;
  const total = walletBinderDirectoryTotal;
  const totalKnown = Number.isFinite(total);
  els.walletBinderDirectoryButtonCount.hidden = !totalKnown;
  if (totalKnown) els.walletBinderDirectoryButtonCount.textContent = String(total);
  els.walletBinderDirectoryCount.textContent = totalKnown
    ? `${total} public binder${total === 1 ? "" : "s"}`
    : "Public binder covers";
  if (!walletBinderDirectoryOpen) return;
  if (walletBinderDirectoryLoading) {
    els.walletBinderDirectoryStatus.textContent = loaded
      ? `Loading more binders… ${loaded} shown`
      : "Loading public binder covers…";
  } else if (totalKnown && total === 0) {
    els.walletBinderDirectoryStatus.textContent = "No public wallet binders have been created yet.";
  } else if (walletBinderDirectoryNextCursor) {
    els.walletBinderDirectoryStatus.textContent = `${loaded} of ${total} binders`;
  } else if (totalKnown) {
    els.walletBinderDirectoryStatus.textContent = walletBinderDirectoryUnverifiedCount
      ? `${total} public wallet binder${total === 1 ? "" : "s"} · ${walletBinderDirectoryUnverifiedCount} awaiting a fresh holdings check`
      : `${total} public wallet binder${total === 1 ? "" : "s"}`;
  }
}

function maybeLoadMoreWalletBinders() {
  if (
    !walletBinderDirectoryOpen
    || walletBinderDirectoryLoading
    || !walletBinderDirectoryNextCursor
  ) return;
  const gallery = els.walletBinderDirectoryGallery;
  if (gallery.scrollHeight - gallery.scrollTop - gallery.clientHeight > 320) return;
  loadWalletBinderDirectory().catch(console.error);
}

function handleWalletBinderDirectoryClick(event) {
  const link = event.target.closest("a[data-wallet-address]");
  if (!link || !els.walletBinderDirectoryGallery.contains(link)) return;
  if (event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const address = link.dataset.walletAddress || "";
  if (!isPossibleSolanaAddress(address)) return;
  event.preventDefault();
  transitionFromWalletBinderDirectory(link, address).catch(() => {
    navigateToWalletBinder(address);
  });
}

async function transitionFromWalletBinderDirectory(link, address) {
  if (walletBinderDirectoryTransitioning) return;
  walletBinderDirectoryTransitioning = true;
  const cover = link.querySelector(".wallet-binder-directory-cover");
  writeWalletBinderDirectoryArrival(address, cover);
  if (!cover || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    navigateToWalletBinder(address);
    return;
  }

  const sourceRect = cover.getBoundingClientRect();
  const aspect = sourceRect.width / Math.max(1, sourceRect.height);
  const target = getWalletBinderDirectoryTransitionTarget(aspect);

  const flight = cloneWalletBinderDirectoryCover(cover);
  flight.classList.add("wallet-binder-directory-flight");
  Object.assign(flight.style, {
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
  });
  document.body.classList.add("is-wallet-binder-directory-transitioning");
  document.body.append(flight);
  const timing = {
    duration: WALLET_BINDER_DIRECTORY_TRANSITION_MS,
    easing: "cubic-bezier(0.2, 0.82, 0.2, 1)",
    fill: "forwards",
  };
  const targetScale = target.width / Math.max(1, sourceRect.width);
  const translateX = target.left + target.width / 2
    - (sourceRect.left + sourceRect.width / 2);
  const translateY = target.top + target.height / 2
    - (sourceRect.top + sourceRect.height / 2);
  const animation = flight.animate([
    {
      transform: "translate3d(0, 0, 0) scale(1) rotate(0deg)",
    },
    {
      transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${targetScale}) rotate(-0.35deg)`,
    },
  ], timing);
  await animation.finished.catch(() => {});
  navigateToWalletBinder(address);
}

function cloneWalletBinderDirectoryCover(cover) {
  const clone = cover.cloneNode(true);
  clone.classList.remove("is-loading");
  clone.classList.add("is-ready");
  const sourceCanvas = cover.querySelector("canvas");
  const cloneCanvas = clone.querySelector("canvas");
  if (sourceCanvas && cloneCanvas) {
    cloneCanvas.width = sourceCanvas.width;
    cloneCanvas.height = sourceCanvas.height;
    cloneCanvas.getContext("2d")?.drawImage(sourceCanvas, 0, 0);
    cloneCanvas.style.animation = "none";
    cloneCanvas.style.opacity = "1";
  }
  return clone;
}

function getWalletBinderDirectoryTransitionTarget(aspect) {
  const safeAspect = Number.isFinite(aspect) && aspect > 0 ? aspect : 5.234 / 7.286;
  const maximumWidth = Math.min(window.innerWidth * 0.56, 430);
  const maximumHeight = window.innerHeight * 0.76;
  const width = Math.min(maximumWidth, maximumHeight * safeAspect);
  const height = width / safeAspect;
  return {
    width,
    height,
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
  };
}

function writeWalletBinderDirectoryArrival(address, cover) {
  try {
    const canvas = cover?.querySelector("canvas");
    let previewDataUrl = "";
    try {
      previewDataUrl = canvas?.toDataURL("image/webp", 0.86) || "";
    } catch {
      // Cross-origin sticker art can make a canvas unreadable; the bridge is optional.
    }
    sessionStorage.setItem(
      WALLET_BINDER_DIRECTORY_TRANSITION_STORAGE_KEY,
      JSON.stringify({
        address,
        createdAt: Date.now(),
        previewDataUrl,
        baseColor: cover?.dataset.baseColor || BINDER_COVER_DEFAULT_COLOR_HEX,
        light: els.body.classList.contains("is-light"),
      }),
    );
  } catch {
    // The destination still works when private browsing disables session storage.
  }
}

function readWalletBinderDirectoryArrival(address) {
  if (!address) return null;
  try {
    const stored = sessionStorage.getItem(WALLET_BINDER_DIRECTORY_TRANSITION_STORAGE_KEY);
    sessionStorage.removeItem(WALLET_BINDER_DIRECTORY_TRANSITION_STORAGE_KEY);
    const arrival = JSON.parse(stored || "null");
    return arrival?.address === address
      && Date.now() - Number(arrival.createdAt || 0) >= 0
      && Date.now() - Number(arrival.createdAt || 0) < 15_000
      ? arrival
      : null;
  } catch {
    return null;
  }
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
  updateWalletDialogBusyState();
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
  await Promise.resolve();
  if (token !== walletSearchToken) return;
  navigateToWalletBinder(address);
}

function applyWalletCardFilter(address, { indexes, matchedMints }, options = {}) {
  walletFilterAddress = address;
  walletFilterCardIndexes = orderWalletCardIndexes(indexes, options.cardOrder);
  walletFilterCardIndexSet = new Set(walletFilterCardIndexes);
  walletMatchedMintByCardIndex = new Map(matchedMints);
  walletTradeCardStableIds = normalizeBinderStableIdSet(options.tradeCardIds);
  favoritesOnly = false;
  activeCollectionFilter = "";
  activeTraitFilter = null;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  resetTraitSearchQuery();
  traitSortCategory = "all";
  populateTraitSortOptions();
  setGalleryViewMode(true, { render: false });
  updateFavoriteButtons();
  updateTraitSearchState();
  resetBinderGalleryPosition();
  if (options.startAtFrontCover) {
    binderTargetClosure = -1;
    binderClosure = -1;
    binderSinglePageSide = BINDER_SINGLE_PAGE_COVER_SIDE;
    binderSinglePageSideTouched = true;
  }
  renderGallery();
  updateBinderOrderEditorAvailability();
}

function updateWalletDialogBusyState() {
  const busy = walletSearchLoading || walletAuthLoading;
  els.walletAddressInput.disabled = busy;
  els.walletSearchSubmitButton.disabled = busy;
  els.walletConnectButton.disabled = busy;
  els.walletBinderDirectoryButton.disabled = busy;
  els.walletProviderList.toggleAttribute("inert", busy);
  els.walletSearchPanel.setAttribute(
    "aria-busy",
    String((busy || walletBinderDirectoryLoading) && walletSearchOpen),
  );
}

function refreshCompatibleSolanaWallets() {
  compatibleSolanaWallets = getCompatibleSolanaWallets();
  if (!compatibleSolanaWallets.length) walletProviderListOpen = false;
  renderWalletProviderList();
}

async function initializeWalletAuth() {
  refreshCompatibleSolanaWallets();
  walletRegistryUnsubscribe?.();
  walletRegistryUnsubscribe = watchCompatibleSolanaWallets((wallets) => {
    compatibleSolanaWallets = wallets;
    if (!wallets.length) walletProviderListOpen = false;
    renderWalletProviderList();
    updateWalletAuthUi();
  });

  try {
    const session = await getWalletAuthSession(WALLET_AUTH_API_BASE_URL);
    if (session?.authenticated) {
      walletAuthSession = session;
      walletAuthAccountAddress = session.profile?.walletAddress || "";
      walletConnectMessage = `Wallet verified: ${shortenSolAddress(walletAuthAccountAddress)}`;
    }
  } catch {
    // Public wallet browsing remains available while the optional login API is unavailable.
  }
  updateWalletAuthUi();
}

function handleWalletConnectButtonClick() {
  if (walletAuthLoading) return;
  const sessionAddress = walletAuthSession?.profile?.walletAddress;
  if (walletAuthSession?.authenticated && isPossibleSolanaAddress(sessionAddress)) {
    navigateToWalletBinder(sessionAddress);
    return;
  }

  refreshCompatibleSolanaWallets();
  if (!compatibleSolanaWallets.length) {
    walletConnectMessage = WALLET_CONNECT_NO_EXTENSION_MESSAGE;
    walletProviderListOpen = false;
    updateWalletAuthUi();
    return;
  }
  if (compatibleSolanaWallets.length === 1) {
    startWalletSignIn(compatibleSolanaWallets[0]).catch(console.error);
    return;
  }

  walletProviderListOpen = !walletProviderListOpen;
  walletConnectMessage = walletProviderListOpen
    ? "Choose an installed wallet:"
    : WALLET_CONNECT_PROMPT;
  updateWalletAuthUi();
  if (walletProviderListOpen) {
    requestAnimationFrame(() => els.walletProviderList.querySelector("button")?.focus());
  }
}

function handleWalletProviderListClick(event) {
  const button = event.target.closest("button[data-wallet-index]");
  if (!button || !els.walletProviderList.contains(button)) return;
  const wallet = compatibleSolanaWallets[Number(button.dataset.walletIndex)];
  if (wallet) startWalletSignIn(wallet).catch(console.error);
}

async function startWalletSignIn(wallet) {
  walletAuthLoading = true;
  walletProviderListOpen = false;
  walletConnectMessage = WALLET_CONNECT_BUSY_MESSAGE;
  updateWalletAuthUi();
  ensureAllCollectionCards().catch(() => {});

  try {
    const result = await signInWithSolanaWallet(wallet, WALLET_AUTH_API_BASE_URL);
    const address = result.session?.profile?.walletAddress || result.account?.address || "";
    if (!isPossibleSolanaAddress(address)) throw new Error("Wallet returned an invalid address");
    walletAuthSession = result.session;
    walletAuthWallet = result.wallet;
    walletAuthAccountAddress = address;
    bindWalletAccountChanges(result.wallet);
    walletConnectMessage = `Wallet verified: ${shortenSolAddress(address)}`;
    walletAuthLoading = false;
    updateWalletAuthUi();
    navigateToWalletBinder(address);
  } catch (error) {
    walletConnectMessage = getWalletConnectErrorMessage(error);
    walletAuthLoading = false;
    updateWalletAuthUi();
  }
}

function bindWalletAccountChanges(wallet) {
  walletAccountUnsubscribe?.();
  walletAccountUnsubscribe = subscribeToWalletAccountChanges(wallet, (account) => {
    if (account?.address === walletAuthAccountAddress) return;
    signOutCurrentWallet({
      disconnect: false,
      message: "Wallet account changed. Sign in again to edit its binder.",
    }).catch(console.error);
  });
}

async function signOutCurrentWallet(options = {}) {
  const session = walletAuthSession;
  const wallet = walletAuthWallet;
  walletAccountUnsubscribe?.();
  walletAccountUnsubscribe = null;
  walletAuthSession = null;
  walletAuthWallet = null;
  walletAuthAccountAddress = "";
  walletProviderListOpen = false;
  walletConnectMessage = options.message || WALLET_CONNECT_PROMPT;
  updateWalletAuthUi();

  try {
    if (session?.authenticated) {
      await signOutWalletAuthSession(WALLET_AUTH_API_BASE_URL, session.csrfToken || "");
    }
  } catch {
    // Local owner controls are cleared even if an already-expired session cannot be revoked.
  }
  if (options.disconnect !== false) await disconnectSolanaWallet(wallet);
}

function updateWalletAuthUi() {
  if (!els.walletConnectButton) return;
  const address = walletAuthSession?.profile?.walletAddress || "";
  const authenticated = Boolean(walletAuthSession?.authenticated && address);
  els.walletConnectButton.classList.toggle("is-connected", authenticated);
  els.walletConnectButton.setAttribute("aria-expanded", String(walletProviderListOpen));
  els.walletConnectButtonLabel.textContent = authenticated
    ? `Open ${shortenSolAddress(address)}`
    : walletAuthLoading
      ? "Waiting for wallet..."
      : "Connect Solana wallet";
  els.walletConnectStatus.textContent = walletConnectMessage;
  els.walletSignOutButton.hidden = !authenticated;
  renderWalletProviderList();
  updateWalletDialogBusyState();
  updateBinderOrderEditorAvailability();
}

function isCurrentWalletBinderOwner() {
  const sessionAddress = walletAuthSession?.profile?.walletAddress || "";
  return Boolean(
    WALLET_ROUTE_ADDRESS
    && galleryOpen
    && !walletRouteLoading
    && !walletRouteLoadFailed
    && Array.isArray(walletFilterCardIndexes)
    && walletAuthSession?.authenticated
    && sessionAddress === WALLET_ROUTE_ADDRESS,
  );
}

function updateBinderOrderEditorAvailability() {
  if (!els.binderOrderEditButton) return;
  const available = isCurrentWalletBinderOwner();
  els.binderOrderEditButton.hidden = !available;
  els.binderOrderEditButton.setAttribute("aria-expanded", String(binderOrderEditorOpen));
  if (!available && binderOrderEditorOpen) {
    closeBinderOrderEditor({ force: true, restoreFocus: false });
  }
}

async function openBinderOrderEditor() {
  if (!isCurrentWalletBinderOwner() || binderOrderEditorOpen) return;
  if (walletSearchOpen) setWalletSearchPanelOpen(false, { preserveMessage: true });
  if (traitSearchOpen) {
    traitSearchOpen = false;
    traitSearchCollectionId = "";
    resetTraitSearchQuery();
    updateTraitSearchState();
    renderGallery();
  }

  binderOrderReturnFocus = document.activeElement instanceof HTMLElement
    ? document.activeElement
    : els.binderOrderEditButton;
  binderOrderEditorOpen = true;
  binderOrderEditorLoading = true;
  binderOrderEditorSaving = false;
  binderOrderOwnerDocument = null;
  binderOrderDraftIndexes = [];
  binderOrderInitialStableIds = [];
  binderTradeMarkingMode = false;
  binderTradeDraftStableIds = new Set();
  binderTradeInitialStableIds = new Set();
  binderOrderKeyboardStableId = "";
  binderCustomizationMode = "cards";
  binderCoverDraft = null;
  binderCoverInitialJson = "";
  resetBinderCoverUndoHistory();
  binderOutsideTextBoxEnabled.front = false;
  binderOutsideTextBoxEnabled.back = false;
  binderCoverSelectedStickerMint = "";
  binderStickerPickerOpen = false;
  binderStickerPickerLoading = false;
  const token = ++binderOrderEditorToken;

  els.body.classList.add("is-binder-order-editor");
  els.binderOrderEditor.hidden = false;
  els.binderOrderEditor.setAttribute("aria-hidden", "false");
  els.binderOrderEditButton.setAttribute("aria-expanded", "true");
  els.binderOrderDialog.classList.add("is-loading");
  els.binderOrderDialog.classList.remove("is-trade-marking", "is-cover-editing");
  els.binderOrderDialog.setAttribute("aria-busy", "true");
  els.binderTradeModeButton.setAttribute("aria-pressed", "false");
  els.binderTradeModeButton.textContent = "mark for trade";
  setBinderCustomizationMode("cards", { focus: false });
  els.binderOrderInstructions.textContent = "Drag cards into place, or double-click an order number to type a new position. On touch, use the dotted handle. Each group of nine is one binder page.";
  renderBinderOrderEditorMessage("Loading your held cards…");
  setBinderOrderStatus("Loading your binder…");
  refreshBinderOrderConfirmButton();
  requestAnimationFrame(() => els.binderOrderCloseButton.focus());

  try {
    const ownerDocument = await getOwnerWalletBinder(WALLET_AUTH_API_BASE_URL);
    if (token !== binderOrderEditorToken || !binderOrderEditorOpen) return;
    if (
      ownerDocument?.walletAddress !== WALLET_ROUTE_ADDRESS
      || !isCurrentWalletBinderOwner()
    ) {
      throw new Error("This wallet session does not own the binder being viewed.");
    }

    binderOrderOwnerDocument = ownerDocument;
    syncWalletAuthCsrfToken(ownerDocument.csrfToken);
    binderOrderDraftIndexes = orderWalletCardIndexes(
      walletFilterCardIndexes,
      ownerDocument.cardOrder,
    );
    binderOrderInitialStableIds = getBinderOrderStableIds(binderOrderDraftIndexes);
    binderTradeDraftStableIds = normalizeBinderStableIdSet(ownerDocument.tradeCardIds);
    binderTradeInitialStableIds = new Set(binderTradeDraftStableIds);
    binderCoverDraft = normalizeBinderCoverSettings(ownerDocument.cover);
    resetBinderCoverUndoHistory();
    binderOutsideTextBoxEnabled.front = Boolean(binderCoverDraft.frontText);
    binderOutsideTextBoxEnabled.back = Boolean(binderCoverDraft.backText);
    binderCoverInitialJson = serializeBinderCoverSettings(binderCoverDraft);
    binderOrderEditorLoading = false;
    els.binderOrderDialog.classList.remove("is-loading");
    els.binderOrderDialog.setAttribute("aria-busy", "false");
    renderBinderOrderEditorCards();
    refreshBinderOrderConfirmButton();
    const pageCount = Math.ceil(binderOrderDraftIndexes.length / BINDER_SIDE_SLOTS);
    setBinderOrderStatus(
      binderOrderDraftIndexes.length
        ? `${binderOrderDraftIndexes.length} held card${binderOrderDraftIndexes.length === 1 ? "" : "s"} across ${pageCount} page${pageCount === 1 ? "" : "s"}.`
        : "No supported cards are currently held by this wallet.",
    );
  } catch (error) {
    if (token !== binderOrderEditorToken || !binderOrderEditorOpen) return;
    if (error?.code === "authentication_required") {
      invalidateWalletAuthSession("Wallet login expired. Reconnect to edit your binder.");
      return;
    }
    binderOrderEditorLoading = false;
    els.binderOrderDialog.classList.remove("is-loading");
    els.binderOrderDialog.setAttribute("aria-busy", "false");
    renderBinderOrderEditorMessage("Your card order could not be loaded.");
    setBinderOrderStatus(getBinderOrderErrorMessage(error, "load"), { error: true });
    refreshBinderOrderConfirmButton();
  }
}

function closeBinderOrderEditor(options = {}) {
  if (!binderOrderEditorOpen) return;
  if (binderOrderEditorSaving && !options.force) return;
  binderOrderEditorToken += 1;
  closeBinderStickerPicker({ restoreFocus: false });
  cancelBinderOrderPositionEdit({ restoreFocus: false });
  cancelBinderOrderDrag();
  binderOrderEditorOpen = false;
  binderOrderEditorLoading = false;
  binderOrderEditorSaving = false;
  binderOrderOwnerDocument = null;
  binderOrderDraftIndexes = [];
  binderOrderInitialStableIds = [];
  binderTradeMarkingMode = false;
  binderTradeDraftStableIds = new Set();
  binderTradeInitialStableIds = new Set();
  binderOrderKeyboardStableId = "";
  binderCustomizationMode = "cards";
  finishBinderCoverInteraction();
  hideBinderInsideLinkPopover();
  binderCoverPreviewResizeObserver?.disconnect();
  binderCoverPreviewResizeObserver = null;
  binderCoverDraft = null;
  binderCoverInitialJson = "";
  resetBinderCoverUndoHistory();
  binderOutsideTextBoxEnabled.front = false;
  binderOutsideTextBoxEnabled.back = false;
  binderCoverSelectedStickerMint = "";
  els.body.classList.remove("is-binder-order-editor");
  els.binderOrderEditor.hidden = true;
  els.binderOrderEditor.setAttribute("aria-hidden", "true");
  els.binderOrderDialog.classList.remove("is-loading", "is-saving", "is-trade-marking", "is-cover-editing");
  els.binderOrderDialog.setAttribute("aria-busy", "false");
  els.binderOrderEditButton.setAttribute("aria-expanded", "false");
  stopBinderOrderCardAnimations();
  els.binderOrderPages.replaceChildren();
  binderOrderCardNodes.clear();
  els.binderOrderConfirmButton.hidden = true;
  els.binderOrderConfirmButton.disabled = false;
  els.binderTradeModeButton.disabled = false;
  els.binderTradeModeButton.setAttribute("aria-pressed", "false");
  els.binderTradeModeButton.textContent = "mark for trade";
  els.binderCoverModeButton.textContent = "edit cover";
  els.binderCoverEditor.hidden = true;
  els.binderOrderScroller.hidden = false;
  els.binderTradeModeButton.hidden = false;
  els.binderFrontCoverUpload.value = "";
  els.binderBackCoverUpload.value = "";
  els.binderOrderCloseButton.disabled = false;

  const returnFocus = binderOrderReturnFocus;
  binderOrderReturnFocus = null;
  if (
    options.restoreFocus !== false
    && returnFocus instanceof HTMLElement
    && returnFocus.isConnected
    && !returnFocus.hidden
  ) {
    requestAnimationFrame(() => returnFocus.focus());
  }
}

function renderBinderOrderEditorMessage(message) {
  binderOrderCardNodes.clear();
  const paragraph = document.createElement("p");
  paragraph.className = "binder-order-empty";
  paragraph.textContent = message;
  els.binderOrderPages.replaceChildren(paragraph);
}

function renderBinderOrderEditorCards() {
  if (!binderOrderEditorOpen || binderOrderEditorLoading) return;
  if (!binderOrderDraftIndexes.length) {
    renderBinderOrderEditorMessage("No supported cards found in this wallet.");
    return;
  }

  binderOrderCardNodes.clear();
  const fragment = document.createDocumentFragment();
  const totalCards = binderOrderDraftIndexes.length;
  const totalPages = Math.ceil(totalCards / BINDER_SIDE_SLOTS);
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex += 1) {
    const section = document.createElement("section");
    section.className = "binder-order-page";
    section.setAttribute("aria-label", `Binder page ${pageIndex + 1}`);

    const heading = document.createElement("h3");
    heading.className = "binder-order-page-heading";
    heading.textContent = `Page ${pageIndex + 1}`;

    const grid = document.createElement("div");
    grid.className = "binder-order-page-grid";
    const start = pageIndex * BINDER_SIDE_SLOTS;
    const end = Math.min(start + BINDER_SIDE_SLOTS, totalCards);
    for (let position = start; position < end; position += 1) {
      const cardIndex = binderOrderDraftIndexes[position];
      const card = CARDS[cardIndex];
      if (!card) continue;
      const stableId = String(card.stableId || "");
      const button = createBinderOrderCardButton(cardIndex, position);
      updateBinderOrderCardButton(button, cardIndex, position);
      binderOrderCardNodes.set(stableId, button);
      grid.append(button);
    }
    section.append(heading, grid);
    fragment.append(section);
  }
  els.binderOrderPages.replaceChildren(fragment);
}

function createBinderOrderCardButton(cardIndex, position) {
  const card = CARDS[cardIndex];
  const button = document.createElement("div");
  button.className = "binder-order-card";
  button.tabIndex = 0;
  button.setAttribute("role", "button");
  button.setAttribute("aria-keyshortcuts", "Enter Space F2 ArrowLeft ArrowRight ArrowUp ArrowDown PageUp PageDown");

  const image = document.createElement("img");
  image.alt = "";
  image.decoding = "async";
  image.draggable = false;
  image.loading = position < BINDER_PAGE_SLOTS ? "eager" : "lazy";
  if (position < BINDER_PAGE_SLOTS) image.fetchPriority = "high";
  image.src = cardStillAssetUrl(card);

  const positionLabel = createBinderOrderPositionLabel(position);

  const handle = document.createElement("span");
  handle.className = "binder-order-card-handle";
  handle.setAttribute("aria-hidden", "true");
  handle.textContent = "⠿";
  button.append(image, positionLabel, handle);
  return button;
}

function createBinderOrderPositionLabel(position) {
  const label = document.createElement("span");
  label.className = "binder-order-card-position";
  label.setAttribute("aria-hidden", "true");
  label.title = "Double-click to edit position";
  label.textContent = String(position + 1);
  return label;
}

function updateBinderOrderCardButton(button, cardIndex, position) {
  const card = CARDS[cardIndex];
  if (!button || !card) return;
  const stableId = String(card.stableId || "");
  const markedForTrade = binderTradeDraftStableIds.has(stableId);
  button.dataset.cardIndex = String(cardIndex);
  button.dataset.stableId = stableId;
  button.dataset.orderPosition = String(position);
  button.setAttribute(
    "aria-keyshortcuts",
    binderTradeMarkingMode
      ? "Space Enter"
      : "Space F2 ArrowLeft ArrowRight ArrowUp ArrowDown PageUp PageDown",
  );
  button.setAttribute("aria-posinset", String(position + 1));
  button.setAttribute("aria-setsize", String(binderOrderDraftIndexes.length));
  button.setAttribute(
    "aria-label",
    binderTradeMarkingMode
      ? `${card.title}. ${markedForTrade ? "Marked" : "Not marked"} for trade. Press Space or Enter to toggle.`
      : `${card.title}. Position ${position + 1} of ${binderOrderDraftIndexes.length}. Double-click the position number or press F2 to enter a position. Press Space, then use arrow keys to move.`,
  );
  button.setAttribute(
    "aria-pressed",
    String(binderTradeMarkingMode ? markedForTrade : stableId === binderOrderKeyboardStableId),
  );
  button.classList.toggle("is-keyboard-selected", stableId === binderOrderKeyboardStableId);
  button.classList.toggle("is-marked-for-trade", markedForTrade);
  button.classList.toggle("is-dragging", stableId === binderOrderDrag?.stableId);
  const positionLabel = button.querySelector(".binder-order-card-position");
  if (positionLabel) positionLabel.textContent = String(position + 1);
}

function startBinderOrderPositionEdit(event) {
  if (
    !binderOrderEditorOpen
    || binderOrderEditorLoading
    || binderOrderEditorSaving
    || binderTradeMarkingMode
    || binderOrderDrag
  ) return;
  const label = event.target.closest(".binder-order-card-position");
  const cardNode = label?.closest(".binder-order-card");
  if (!label || !cardNode || !els.binderOrderPages.contains(cardNode)) return;
  event.preventDefault();
  event.stopPropagation();
  beginBinderOrderPositionEdit(cardNode, label);
}

function beginBinderOrderPositionEdit(cardNode, positionLabel = null) {
  if (
    !cardNode
    || binderOrderEditorLoading
    || binderOrderEditorSaving
    || binderTradeMarkingMode
  ) return;
  if (binderOrderPositionEdit?.cardNode === cardNode) {
    binderOrderPositionEdit.input.select();
    return;
  }
  if (binderOrderPositionEdit) {
    commitBinderOrderPositionEdit({ restoreFocus: false });
  }

  const stableId = String(cardNode.dataset.stableId || "");
  const position = binderOrderDraftIndexes.findIndex((index) => (
    CARDS[index]?.stableId === stableId
  ));
  const label = positionLabel || cardNode.querySelector(".binder-order-card-position");
  if (!stableId || position < 0 || !label) return;

  cancelBinderOrderDrag();
  binderOrderKeyboardStableId = "";
  renderBinderOrderKeyboardSelection();

  const input = document.createElement("input");
  input.type = "text";
  input.className = "binder-order-position-input";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.maxLength = String(binderOrderDraftIndexes.length).length;
  input.value = String(position + 1);
  input.setAttribute("aria-label", `Move card to position, from 1 to ${binderOrderDraftIndexes.length}`);
  label.replaceWith(input);
  cardNode.classList.add("is-position-editing");
  binderOrderPositionEdit = { input, cardNode, stableId };

  input.addEventListener("keydown", (inputEvent) => {
    if (inputEvent.key === "Enter") {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
      commitBinderOrderPositionEdit({ restoreFocus: true });
    } else if (inputEvent.key === "Escape") {
      inputEvent.preventDefault();
      inputEvent.stopPropagation();
      cancelBinderOrderPositionEdit({ restoreFocus: true });
    }
  });
  input.addEventListener("blur", () => {
    if (binderOrderPositionEdit?.input === input) {
      commitBinderOrderPositionEdit({ restoreFocus: false });
    }
  });
  input.focus({ preventScroll: true });
  input.select();
  setBinderOrderStatus(`Enter a position from 1 to ${binderOrderDraftIndexes.length}, then press Enter.`);
}

function commitBinderOrderPositionEdit({ restoreFocus = false } = {}) {
  const edit = binderOrderPositionEdit;
  if (!edit) return false;
  const currentPosition = binderOrderDraftIndexes.findIndex((index) => (
    CARDS[index]?.stableId === edit.stableId
  ));
  const rawPosition = edit.input.value.trim();
  const requestedPosition = /^\d+$/.test(rawPosition)
    ? Number.parseInt(rawPosition, 10)
    : Number.NaN;
  const valid = Number.isSafeInteger(requestedPosition) && requestedPosition > 0;
  const targetPosition = valid
    ? clamp(requestedPosition - 1, 0, binderOrderDraftIndexes.length - 1)
    : currentPosition;

  finishBinderOrderPositionEdit(currentPosition, { restoreFocus: false });
  if (!valid) {
    setBinderOrderStatus(`Enter a whole number from 1 to ${binderOrderDraftIndexes.length}.`, { error: true });
  } else if (currentPosition === targetPosition) {
    setBinderOrderStatus(`Card is already at position ${currentPosition + 1}.`);
  } else {
    moveBinderOrderDraftItem(currentPosition, targetPosition, {
      activeStableId: edit.stableId,
    });
  }

  if (restoreFocus) {
    requestAnimationFrame(() => {
      const movedCard = findBinderOrderCardButton(edit.stableId);
      if (!movedCard?.isConnected) return;
      movedCard.focus({ preventScroll: true });
      movedCard.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }
  return valid;
}

function cancelBinderOrderPositionEdit({ restoreFocus = false } = {}) {
  const edit = binderOrderPositionEdit;
  if (!edit) return;
  const currentPosition = binderOrderDraftIndexes.findIndex((index) => (
    CARDS[index]?.stableId === edit.stableId
  ));
  finishBinderOrderPositionEdit(currentPosition, { restoreFocus });
  setBinderOrderStatus("Position edit canceled. Confirm to save any other changes.");
}

function finishBinderOrderPositionEdit(position, { restoreFocus = false } = {}) {
  const edit = binderOrderPositionEdit;
  if (!edit) return;
  binderOrderPositionEdit = null;
  edit.cardNode.classList.remove("is-position-editing");
  if (edit.input.isConnected) {
    edit.input.replaceWith(createBinderOrderPositionLabel(Math.max(0, position)));
  }
  if (restoreFocus) {
    requestAnimationFrame(() => {
      if (edit.cardNode.isConnected) edit.cardNode.focus({ preventScroll: true });
    });
  }
}

function refreshBinderOrderEditorCardStates() {
  for (let position = 0; position < binderOrderDraftIndexes.length; position += 1) {
    const cardIndex = binderOrderDraftIndexes[position];
    const stableId = String(CARDS[cardIndex]?.stableId || "");
    updateBinderOrderCardButton(binderOrderCardNodes.get(stableId), cardIndex, position);
  }
}

function getBinderOrderStableIds(indexes = binderOrderDraftIndexes) {
  return (indexes || [])
    .map((index) => String(CARDS[index]?.stableId || "").trim())
    .filter(Boolean);
}

function normalizeBinderStableIdSet(values) {
  return new Set(
    (Array.isArray(values) ? values : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean),
  );
}

function binderCardOrderHasChanges() {
  const current = getBinderOrderStableIds();
  return current.length !== binderOrderInitialStableIds.length
    || current.some((stableId, index) => stableId !== binderOrderInitialStableIds[index]);
}

function binderTradeMarksHaveChanges() {
  if (binderTradeDraftStableIds.size !== binderTradeInitialStableIds.size) return true;
  return [...binderTradeDraftStableIds]
    .some((stableId) => !binderTradeInitialStableIds.has(stableId));
}

function binderCoverHasChanges() {
  return Boolean(
    binderCoverDraft
    && serializeBinderCoverSettings(binderCoverDraft) !== binderCoverInitialJson
  );
}

function binderOrderHasChanges() {
  return binderCardOrderHasChanges()
    || binderTradeMarksHaveChanges()
    || binderCoverHasChanges();
}

function refreshBinderOrderConfirmButton() {
  const dirty = binderOrderHasChanges();
  els.binderOrderConfirmButton.hidden = !dirty;
  els.binderOrderConfirmButton.disabled = (
    !dirty
    || binderOrderEditorLoading
    || binderOrderEditorSaving
  );
  els.binderOrderCloseButton.disabled = binderOrderEditorSaving;
  els.binderTradeModeButton.disabled = binderOrderEditorLoading || binderOrderEditorSaving;
  els.binderCoverModeButton.disabled = binderOrderEditorLoading || binderOrderEditorSaving;
}

function setBinderOrderStatus(message, options = {}) {
  if (els.binderOrderStatus.textContent !== message) {
    els.binderOrderStatus.textContent = message;
  }
  els.binderOrderStatus.classList.toggle("is-error", Boolean(options.error));
}

function toggleBinderTradeMarkingMode() {
  if (binderOrderEditorLoading || binderOrderEditorSaving) return;
  if (binderOrderPositionEdit) commitBinderOrderPositionEdit({ restoreFocus: false });
  cancelBinderOrderDrag();
  binderTradeMarkingMode = !binderTradeMarkingMode;
  binderOrderKeyboardStableId = "";
  els.binderOrderDialog.classList.toggle("is-trade-marking", binderTradeMarkingMode);
  els.binderTradeModeButton.setAttribute("aria-pressed", String(binderTradeMarkingMode));
  els.binderTradeModeButton.textContent = binderTradeMarkingMode
    ? "marking for trade"
    : "mark for trade";
  els.binderOrderInstructions.textContent = binderTradeMarkingMode
    ? "Select any cards that are available for trade. Reordering is paused until you leave this mode."
    : "Drag cards into place, or double-click an order number to type a new position. On touch, use the dotted handle. Each group of nine is one binder page.";
  refreshBinderOrderEditorCardStates();
  const markedCount = getBinderOrderStableIds()
    .filter((stableId) => binderTradeDraftStableIds.has(stableId)).length;
  setBinderOrderStatus(
    binderTradeMarkingMode
      ? `${markedCount} held card${markedCount === 1 ? " is" : "s are"} marked for trade. Confirm to save changes.`
      : "Reordering restored. Confirm to save any changes.",
  );
}

function toggleBinderCoverEditorMode() {
  if (binderOrderEditorLoading || binderOrderEditorSaving) return;
  setBinderCustomizationMode(binderCustomizationMode === "cover" ? "cards" : "cover");
}

function setBinderCustomizationMode(mode, options = {}) {
  binderCustomizationMode = mode === "cover" ? "cover" : "cards";
  const editingCover = binderCustomizationMode === "cover";
  if (!editingCover) {
    hideBinderInsideLinkPopover();
    closeBinderStickerPicker({ restoreFocus: false });
  }
  if (editingCover && binderTradeMarkingMode) toggleBinderTradeMarkingMode();
  els.binderOrderDialog.classList.toggle("is-cover-editing", editingCover);
  els.binderCoverEditor.hidden = !editingCover;
  els.binderOrderScroller.hidden = editingCover;
  els.binderTradeModeButton.hidden = editingCover;
  els.binderCoverModeButton.textContent = editingCover ? "edit cards" : "edit cover";
  els.binderOrderTitle.textContent = editingCover ? "Edit Binder Cover" : "Customize Binder";
  els.binderOrderInstructions.textContent = editingCover
    ? "Customize all three cover areas with art, movable linked text, and held Swag Pack stickers. Ctrl/Cmd+Z undoes up to 50 cover changes."
    : "Drag cards into place; on touch, use the dotted handle. Each group of nine is one binder page.";
  if (editingCover) {
    if (!binderCoverDraft) binderCoverDraft = normalizeBinderCoverSettings();
    renderBinderCoverEditor();
    if (!binderCoverPreviewResizeObserver && typeof ResizeObserver === "function") {
      binderCoverPreviewResizeObserver = new ResizeObserver(() => {
        renderBinderInsideTextBox();
        positionBinderCoverStickerRemoveButton();
      });
      binderCoverPreviewResizeObserver.observe(els.binderFrontCoverPreview);
      binderCoverPreviewResizeObserver.observe(els.binderBackCoverPreview);
      binderCoverPreviewResizeObserver.observe(els.binderInsideCoverPreview);
    }
  }
  refreshBinderOrderConfirmButton();
  if (options.focus !== false) {
    requestAnimationFrame(() => (
      editingCover ? els.binderFrontCoverPreview : els.binderOrderScroller
    ).focus());
  }
}

function resetBinderCoverUndoHistory() {
  binderCoverUndoStack = [];
  binderCoverUndoCoalesceKey = "";
}

function captureBinderCoverUndoState() {
  if (!binderCoverDraft) return null;
  return {
    settings: {
      ...binderCoverDraft,
      insideLinks: binderCoverDraft.insideLinks.map((link) => ({ ...link })),
      stickers: binderCoverDraft.stickers.map((sticker) => ({ ...sticker })),
    },
    outsideTextEnabled: { ...binderOutsideTextBoxEnabled },
    selectedStickerMint: binderCoverSelectedStickerMint,
  };
}

function recordBinderCoverUndoState(actionKey = "", options = {}) {
  if (!binderCoverDraft) return false;
  const coalesce = Boolean(options.coalesce);
  if (coalesce && actionKey && binderCoverUndoCoalesceKey === actionKey) return false;
  const snapshot = options.snapshot || captureBinderCoverUndoState();
  if (!snapshot) return false;
  binderCoverUndoStack.push(snapshot);
  if (binderCoverUndoStack.length > BINDER_COVER_UNDO_LIMIT) {
    binderCoverUndoStack.splice(0, binderCoverUndoStack.length - BINDER_COVER_UNDO_LIMIT);
  }
  binderCoverUndoCoalesceKey = coalesce ? actionKey : "";
  return true;
}

function endBinderCoverUndoCoalescing() {
  binderCoverUndoCoalesceKey = "";
}

function handleBinderCoverUndoKeydown(event) {
  if (
    !binderOrderEditorOpen
    || binderCustomizationMode !== "cover"
    || binderOrderEditorLoading
    || binderOrderEditorSaving
    || event.altKey
    || (!event.ctrlKey && !event.metaKey)
    || String(event.key || "").toLowerCase() !== "z"
  ) return;
  event.preventDefault();
  event.stopPropagation();
  if (event.shiftKey) {
    setBinderOrderStatus("Redo is not available. Ctrl/Cmd+Z steps back through cover changes.");
    return;
  }
  undoBinderCoverChange();
}

function undoBinderCoverChange() {
  const snapshot = binderCoverUndoStack.pop();
  if (!snapshot) {
    setBinderOrderStatus("No earlier cover changes remain since the last confirm.");
    return false;
  }
  finishBinderCoverInteraction();
  closeBinderStickerPicker({ restoreFocus: false });
  binderCoverUndoCoalesceKey = "";
  binderCoverDraft = normalizeBinderCoverSettings(snapshot.settings);
  binderOutsideTextBoxEnabled.front = Boolean(snapshot.outsideTextEnabled.front);
  binderOutsideTextBoxEnabled.back = Boolean(snapshot.outsideTextEnabled.back);
  binderCoverSelectedStickerMint = binderCoverDraft.stickers.some((sticker) => (
    sticker.mint === snapshot.selectedStickerMint
  )) ? snapshot.selectedStickerMint : "";
  hideBinderInsideLinkPopover();
  renderBinderCoverEditor();
  refreshBinderOrderConfirmButton();
  setBinderOrderStatus(
    `Cover change undone. ${binderCoverUndoStack.length} earlier action${binderCoverUndoStack.length === 1 ? "" : "s"} available.`,
  );
  return true;
}

function normalizeBinderCoverSettings(settings = {}) {
  const source = settings && typeof settings === "object" && !Array.isArray(settings)
    ? settings
    : {};
  const artworkDataUrl = /^data:image\/(?:png|jpe?g|webp);base64,/i.test(source.artworkDataUrl || "")
    ? String(source.artworkDataUrl).slice(0, BINDER_COVER_ARTWORK_MAX_DATA_URL_LENGTH)
    : "";
  const backArtworkDataUrl = /^data:image\/(?:png|jpe?g|webp);base64,/i.test(source.backArtworkDataUrl || "")
    ? String(source.backArtworkDataUrl).slice(0, BINDER_COVER_ARTWORK_MAX_DATA_URL_LENGTH)
    : "";
  const baseColor = /^#[0-9a-f]{6}$/i.test(source.baseColor || "")
    ? String(source.baseColor).toLowerCase()
    : BINDER_COVER_DEFAULT_COLOR_HEX;
  const insideTextColor = /^#[0-9a-f]{6}$/i.test(source.insideTextColor || "")
    ? String(source.insideTextColor).toLowerCase()
    : BINDER_COVER_DEFAULT_TEXT_COLOR_HEX;
  const insideText = String(source.insideText || "").slice(0, BINDER_COVER_INSIDE_TEXT_MAX_LENGTH);
  const frontText = String(source.frontText || "").slice(0, BINDER_COVER_INSIDE_TEXT_MAX_LENGTH);
  const backText = String(source.backText || "").slice(0, BINDER_COVER_INSIDE_TEXT_MAX_LENGTH);
  const frontTextColor = /^#[0-9a-f]{6}$/i.test(source.frontTextColor || "")
    ? String(source.frontTextColor).toLowerCase()
    : BINDER_COVER_DEFAULT_TEXT_COLOR_HEX;
  const backTextColor = /^#[0-9a-f]{6}$/i.test(source.backTextColor || "")
    ? String(source.backTextColor).toLowerCase()
    : BINDER_COVER_DEFAULT_TEXT_COLOR_HEX;
  const stickers = normalizeBinderCoverStickers(source.stickers);
  return {
    ...source,
    baseColor,
    insideTextColor,
    artworkDataUrl,
    artworkX: clampFiniteNumber(source.artworkX, 0.5, -0.5, 1.5),
    artworkY: clampFiniteNumber(source.artworkY, 0.5, -0.5, 1.5),
    artworkScale: clampFiniteNumber(source.artworkScale, 1, 0.25, 4),
    artworkRotation: clampFiniteNumber(source.artworkRotation, 0, BINDER_COVER_ROTATION_MIN_DEGREES, BINDER_COVER_ROTATION_MAX_DEGREES),
    backArtworkDataUrl,
    backArtworkX: clampFiniteNumber(source.backArtworkX, 0.5, -0.5, 1.5),
    backArtworkY: clampFiniteNumber(source.backArtworkY, 0.5, -0.5, 1.5),
    backArtworkScale: clampFiniteNumber(source.backArtworkScale, 1, 0.25, 4),
    backArtworkRotation: clampFiniteNumber(source.backArtworkRotation, 0, BINDER_COVER_ROTATION_MIN_DEGREES, BINDER_COVER_ROTATION_MAX_DEGREES),
    frontText,
    frontTextColor,
    frontTextX: clampFiniteNumber(source.frontTextX, 0.5, 0.1, 0.9),
    frontTextY: clampFiniteNumber(source.frontTextY, 0.5, 0.06, 0.94),
    frontTextWidth: clampFiniteNumber(source.frontTextWidth, 0.72, 0.2, 0.94),
    frontTextHeight: clampFiniteNumber(source.frontTextHeight, 0.3, 0.1, 0.9),
    frontFontSize: Math.round(clampFiniteNumber(source.frontFontSize, 42, 18, 96)),
    frontTextRotation: clampFiniteNumber(source.frontTextRotation, 0, BINDER_COVER_ROTATION_MIN_DEGREES, BINDER_COVER_ROTATION_MAX_DEGREES),
    backText,
    backTextColor,
    backTextX: clampFiniteNumber(source.backTextX, 0.5, 0.1, 0.9),
    backTextY: clampFiniteNumber(source.backTextY, 0.5, 0.06, 0.94),
    backTextWidth: clampFiniteNumber(source.backTextWidth, 0.72, 0.2, 0.94),
    backTextHeight: clampFiniteNumber(source.backTextHeight, 0.3, 0.1, 0.9),
    backFontSize: Math.round(clampFiniteNumber(source.backFontSize, 42, 18, 96)),
    backTextRotation: clampFiniteNumber(source.backTextRotation, 0, BINDER_COVER_ROTATION_MIN_DEGREES, BINDER_COVER_ROTATION_MAX_DEGREES),
    insideText,
    insideTextX: clampFiniteNumber(source.insideTextX, 0.5, 0.1, 0.9),
    insideTextY: clampFiniteNumber(source.insideTextY, 0.5, 0.06, 0.94),
    insideTextWidth: clampFiniteNumber(source.insideTextWidth, 0.72, 0.2, 0.94),
    insideTextHeight: clampFiniteNumber(source.insideTextHeight, 0.3, 0.1, 0.9),
    insideFontSize: Math.round(clampFiniteNumber(source.insideFontSize, 42, 18, 96)),
    insideTextRotation: clampFiniteNumber(source.insideTextRotation, 0, BINDER_COVER_ROTATION_MIN_DEGREES, BINDER_COVER_ROTATION_MAX_DEGREES),
    insideLinks: normalizeBinderInsideLinks(source.insideLinks, insideText),
    stickers,
  };
}

function normalizeBinderCoverStickers(stickers) {
  const normalized = [];
  const seenMints = new Set();
  for (const candidate of Array.isArray(stickers) ? stickers : []) {
    const mint = String(candidate?.mint || "").trim();
    const surface = BINDER_COVER_STICKER_SURFACES.includes(candidate?.surface)
      ? candidate.surface
      : "front";
    const sourceImageUrl = normalizeBinderStickerImageUrl(candidate?.imageUrl);
    const imageUrl = getTransparentSwagPackStickerImageUrl(sourceImageUrl) || sourceImageUrl;
    if (
      !isPossibleSolanaAddress(mint)
      || seenMints.has(mint)
      || !imageUrl
    ) continue;
    seenMints.add(mint);
    normalized.push({
      mint,
      name: String(candidate?.name || "Swag Pack sticker").trim().slice(0, 120)
        || "Swag Pack sticker",
      imageUrl,
      surface,
      x: clampFiniteNumber(candidate?.x, 0.5, -0.25, 1.25),
      y: clampFiniteNumber(candidate?.y, 0.5, -0.25, 1.25),
      scale: clampFiniteNumber(
        candidate?.scale,
        BINDER_COVER_STICKER_DEFAULT_SCALE,
        BINDER_COVER_STICKER_MIN_SCALE,
        BINDER_COVER_STICKER_MAX_SCALE,
      ),
      rotation: clampFiniteNumber(
        candidate?.rotation,
        0,
        BINDER_COVER_ROTATION_MIN_DEGREES,
        BINDER_COVER_ROTATION_MAX_DEGREES,
      ),
    });
    if (normalized.length === BINDER_COVER_STICKER_MAX_COUNT) break;
  }
  return normalized;
}

function normalizeBinderStickerImageUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    const sameOriginTransparentAsset = (
      url.origin === window.location.origin
      && /^\/assets\/swag-pack\/transparent\/\d+\.webp$/i.test(url.pathname)
    );
    return (
      (url.protocol === "https:" || sameOriginTransparentAsset)
      && url.href.length <= 2048
    ) ? url.href : "";
  } catch {
    return "";
  }
}

function getTransparentSwagPackStickerImageUrl(sourceImageUrl) {
  try {
    const url = new URL(sourceImageUrl);
    const localMatch = url.pathname.match(
      /^\/assets\/swag-pack\/transparent\/(\d+)\.webp$/i,
    );
    const sourceMatch = url.pathname.includes(SWAG_PACK_IMAGE_BUNDLE_PATH)
      ? url.pathname.match(/\/(\d+)\.(?:png|jpe?g|webp)$/i)
      : null;
    const assetNumber = localMatch?.[1] || sourceMatch?.[1] || "";
    const filename = assetNumber ? `${assetNumber}.webp` : "";
    if (!SWAG_PACK_TRANSPARENT_STICKER_FILE_SET.has(filename)) return "";
    return new URL(
      `./assets/swag-pack/transparent/${filename}?v=swag-pack-transparent-1`,
      import.meta.url,
    ).href;
  } catch {
    return "";
  }
}

function clampFiniteNumber(value, fallback, minimum, maximum) {
  const number = Number(value);
  return clamp(Number.isFinite(number) ? number : fallback, minimum, maximum);
}

function normalizeBinderCoverRotation(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const normalized = ((number + 180) % 360 + 360) % 360 - 180;
  return normalized === -180 && number > 0 ? 180 : normalized;
}

function normalizeBinderInsideLinks(links, text) {
  const normalized = [];
  for (const candidate of Array.isArray(links) ? links : []) {
    const start = Math.max(0, Math.floor(Number(candidate?.start)));
    const end = Math.min(text.length, Math.floor(Number(candidate?.end)));
    const url = normalizeBinderCoverLinkUrl(candidate?.url, { addProtocol: false });
    if (!url || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    normalized.push({ start, end, url });
  }
  normalized.sort((left, right) => left.start - right.start || left.end - right.end);
  const nonOverlapping = [];
  for (const link of normalized) {
    if (nonOverlapping.length && link.start < nonOverlapping.at(-1).end) continue;
    nonOverlapping.push(link);
    if (nonOverlapping.length === 24) break;
  }
  return nonOverlapping;
}

function normalizeBinderCoverLinkUrl(value, { addProtocol = true } = {}) {
  let candidate = String(value || "").trim();
  if (!candidate) return "";
  if (addProtocol && !/^[a-z][a-z0-9+.-]*:/i.test(candidate)) candidate = `https://${candidate}`;
  try {
    const url = new URL(candidate);
    return ["http:", "https:"].includes(url.protocol) && url.href.length <= 2048
      ? url.href
      : "";
  } catch {
    return "";
  }
}

function serializeBinderCoverSettings(settings) {
  return JSON.stringify(getBinderCoverPayload(settings));
}

function getBinderCoverPayload(settings = binderCoverDraft) {
  const normalized = normalizeBinderCoverSettings(settings);
  const {
    baseColor,
    insideTextColor,
    artworkDataUrl,
    artworkX,
    artworkY,
    artworkScale,
    artworkRotation,
    backArtworkDataUrl,
    backArtworkX,
    backArtworkY,
    backArtworkScale,
    backArtworkRotation,
    frontText,
    frontTextColor,
    frontTextX,
    frontTextY,
    frontTextWidth,
    frontTextHeight,
    frontFontSize,
    frontTextRotation,
    backText,
    backTextColor,
    backTextX,
    backTextY,
    backTextWidth,
    backTextHeight,
    backFontSize,
    backTextRotation,
    insideText,
    insideTextX,
    insideTextY,
    insideTextWidth,
    insideTextHeight,
    insideFontSize,
    insideTextRotation,
    insideLinks,
    stickers,
    ...existing
  } = normalized;
  const payload = { ...existing };
  if (baseColor !== BINDER_COVER_DEFAULT_COLOR_HEX) payload.baseColor = baseColor;
  if (insideTextColor !== BINDER_COVER_DEFAULT_TEXT_COLOR_HEX) {
    payload.insideTextColor = insideTextColor;
  }
  if (artworkDataUrl) {
    Object.assign(payload, { artworkDataUrl, artworkX, artworkY, artworkScale, artworkRotation });
  }
  if (backArtworkDataUrl) {
    Object.assign(payload, {
      backArtworkDataUrl,
      backArtworkX,
      backArtworkY,
      backArtworkScale,
      backArtworkRotation,
    });
  }
  if (frontText) {
    Object.assign(payload, {
      frontText,
      frontTextColor,
      frontTextX,
      frontTextY,
      frontTextWidth,
      frontTextHeight,
      frontFontSize,
      frontTextRotation,
    });
  }
  if (backText) {
    Object.assign(payload, {
      backText,
      backTextColor,
      backTextX,
      backTextY,
      backTextWidth,
      backTextHeight,
      backFontSize,
      backTextRotation,
    });
  }
  if (insideText) {
    Object.assign(payload, {
      insideText,
      insideTextX,
      insideTextY,
      insideTextWidth,
      insideTextHeight,
      insideFontSize,
      insideTextRotation,
      insideLinks,
    });
  }
  if (stickers.length) {
    payload.stickers = stickers.map(({ mint, surface, x, y, scale, rotation }) => ({
      mint,
      surface,
      x,
      y,
      scale,
      rotation,
    }));
  }
  return payload;
}

function renderBinderCoverEditor() {
  if (!binderCoverDraft) return;
  renderBinderCoverArtworkEditor("front");
  renderBinderCoverArtworkEditor("back");
  renderBinderOutsideTextEditor("front");
  renderBinderOutsideTextEditor("back");
  renderBinderCoverStickers();
  els.binderBaseColor.value = binderCoverDraft.baseColor;
  els.binderCoverTextColor.value = binderCoverDraft.insideTextColor;
  for (const preview of [
    els.binderFrontCoverPreview,
    els.binderBackCoverPreview,
    els.binderInsideCoverPreview,
  ]) {
    preview.style.backgroundColor = binderCoverDraft.baseColor;
  }
  els.binderInsideTextInput.value = binderCoverDraft.insideText;
  els.binderInsideFontSize.value = String(binderCoverDraft.insideFontSize);
  els.binderInsideTextRotation.value = String(binderCoverDraft.insideTextRotation);
  renderBinderInsideTextBox();
  updateBinderInsideLinkPopover();
}

function getBinderCoverArtworkEditor(side = "front") {
  const isBack = side === "back";
  return {
    side: isBack ? "back" : "front",
    dataUrlKey: isBack ? "backArtworkDataUrl" : "artworkDataUrl",
    xKey: isBack ? "backArtworkX" : "artworkX",
    yKey: isBack ? "backArtworkY" : "artworkY",
    scaleKey: isBack ? "backArtworkScale" : "artworkScale",
    rotationKey: isBack ? "backArtworkRotation" : "artworkRotation",
    preview: isBack ? els.binderBackCoverPreview : els.binderFrontCoverPreview,
    image: isBack ? els.binderBackCoverImage : els.binderFrontCoverImage,
    blank: isBack ? els.binderBackCoverBlank : els.binderFrontCoverBlank,
    upload: isBack ? els.binderBackCoverUpload : els.binderFrontCoverUpload,
    remove: isBack ? els.binderBackCoverRemove : els.binderFrontCoverRemove,
    zoom: isBack ? els.binderBackCoverZoom : els.binderFrontCoverZoom,
    rotation: isBack ? els.binderBackCoverRotation : els.binderFrontCoverRotation,
  };
}

function renderBinderCoverArtworkEditor(side) {
  const editor = getBinderCoverArtworkEditor(side);
  const hasArtwork = Boolean(binderCoverDraft[editor.dataUrlKey]);
  if (hasArtwork && editor.image.src !== binderCoverDraft[editor.dataUrlKey]) {
    editor.image.src = binderCoverDraft[editor.dataUrlKey];
  } else if (!hasArtwork) {
    editor.image.removeAttribute("src");
  }
  editor.image.hidden = !hasArtwork;
  editor.blank.hidden = hasArtwork
    || binderOutsideTextBoxEnabled[editor.side]
    || binderCoverDraft.stickers.some((sticker) => sticker.surface === editor.side);
  editor.remove.hidden = !hasArtwork;
  editor.zoom.disabled = !hasArtwork;
  editor.rotation.disabled = !hasArtwork;
  editor.zoom.value = String(binderCoverDraft[editor.scaleKey]);
  editor.rotation.value = String(binderCoverDraft[editor.rotationKey]);
  editor.image.style.left = `${binderCoverDraft[editor.xKey] * 100}%`;
  editor.image.style.top = `${binderCoverDraft[editor.yKey] * 100}%`;
  editor.image.style.transform = `translate(-50%, -50%) rotate(${binderCoverDraft[editor.rotationKey]}deg) scale(${binderCoverDraft[editor.scaleKey]})`;
}

function getBinderOutsideTextEditor(side = "front") {
  const isBack = side === "back";
  const prefix = isBack ? "back" : "front";
  return {
    side: prefix,
    textKey: `${prefix}Text`,
    colorKey: `${prefix}TextColor`,
    xKey: `${prefix}TextX`,
    yKey: `${prefix}TextY`,
    widthKey: `${prefix}TextWidth`,
    heightKey: `${prefix}TextHeight`,
    fontSizeKey: `${prefix}FontSize`,
    rotationKey: `${prefix}TextRotation`,
    preview: isBack ? els.binderBackCoverPreview : els.binderFrontCoverPreview,
    box: isBack ? els.binderBackTextBox : els.binderFrontTextBox,
    canvas: isBack ? els.binderBackTextPreview : els.binderFrontTextPreview,
    controls: isBack ? els.binderBackTextControls : els.binderFrontTextControls,
    input: isBack ? els.binderBackTextInput : els.binderFrontTextInput,
    fontSize: isBack ? els.binderBackTextFontSize : els.binderFrontTextFontSize,
    rotation: isBack ? els.binderBackTextRotation : els.binderFrontTextRotation,
    color: isBack ? els.binderBackTextColor : els.binderFrontTextColor,
    remove: isBack ? els.binderBackTextRemove : els.binderFrontTextRemove,
    add: els.binderCoverEditor.querySelector(`.binder-cover-add-text[data-text-surface="${prefix}"]`),
  };
}

function renderBinderOutsideTextEditor(side = "front") {
  if (!binderCoverDraft) return;
  const editor = getBinderOutsideTextEditor(side);
  const enabled = binderOutsideTextBoxEnabled[editor.side];
  editor.add.hidden = enabled;
  editor.controls.hidden = !enabled;
  editor.box.hidden = !enabled;
  editor.input.value = binderCoverDraft[editor.textKey];
  editor.fontSize.value = String(binderCoverDraft[editor.fontSizeKey]);
  editor.rotation.value = String(binderCoverDraft[editor.rotationKey]);
  editor.color.value = binderCoverDraft[editor.colorKey];
  if (!enabled) return;
  editor.box.style.left = `${binderCoverDraft[editor.xKey] * 100}%`;
  editor.box.style.top = `${binderCoverDraft[editor.yKey] * 100}%`;
  editor.box.style.width = `${binderCoverDraft[editor.widthKey] * 100}%`;
  editor.box.style.height = `${binderCoverDraft[editor.heightKey] * 100}%`;
  editor.box.style.transform = `translate(-50%, -50%) rotate(${binderCoverDraft[editor.rotationKey]}deg)`;
  renderBinderCoverTextPreview(editor.canvas, {
    text: binderCoverDraft[editor.textKey] || "type here",
    width: binderCoverDraft[editor.widthKey],
    height: binderCoverDraft[editor.heightKey],
    fontSize: binderCoverDraft[editor.fontSizeKey],
    color: binderCoverDraft[editor.colorKey],
  });
  const artwork = getBinderCoverArtworkEditor(editor.side);
  artwork.blank.hidden = true;
}

function renderBinderInsideTextBox() {
  if (!binderCoverDraft || !els.binderInsideTextBox) return;
  const settings = binderCoverDraft;
  const hasText = Boolean(settings.insideText);
  els.binderInsideTextBox.hidden = !hasText;
  els.binderInsideCoverBlank.hidden = hasText || binderCoverDraft.stickers.some((sticker) => (
    sticker.surface === "inside"
  ));
  if (!hasText) {
    const context = els.binderInsideTextPreview.getContext("2d");
    context.clearRect(0, 0, els.binderInsideTextPreview.width, els.binderInsideTextPreview.height);
    return;
  }
  els.binderInsideTextBox.style.left = `${settings.insideTextX * 100}%`;
  els.binderInsideTextBox.style.top = `${settings.insideTextY * 100}%`;
  els.binderInsideTextBox.style.width = `${settings.insideTextWidth * 100}%`;
  els.binderInsideTextBox.style.height = `${settings.insideTextHeight * 100}%`;
  els.binderInsideTextBox.style.transform = `translate(-50%, -50%) rotate(${settings.insideTextRotation}deg)`;
  renderBinderInsideRichTextPreview();
}

function renderBinderCoverTextPreview(canvas, { text, width, height, fontSize, color, links = [] }) {
  const coverWidth = BINDER_COVER_OUTER_X - BINDER_COVER_SPINE_WIDTH / 2;
  const coverHeight = BINDER_PAGE_HEIGHT + BINDER_COVER_VERTICAL_OVERHANG;
  const surfaceWidth = 1024;
  const surfaceHeight = Math.max(1, Math.round(surfaceWidth * coverHeight / coverWidth));
  canvas.width = Math.max(1, Math.round(width * surfaceWidth));
  canvas.height = Math.max(1, Math.round(height * surfaceHeight));
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBinderCustomInsideText(context, {
    text,
    links,
    box: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    fontSize,
    fontStack: SITE_FONT_STACK,
    textFillStyle: color,
    linkFillStyle: color,
  });
}

function renderBinderCoverStickers() {
  if (!binderCoverDraft) return;
  const stickerMints = new Set(binderCoverDraft.stickers.map((sticker) => sticker.mint));
  if (binderCoverSelectedStickerMint && !stickerMints.has(binderCoverSelectedStickerMint)) {
    binderCoverSelectedStickerMint = "";
  }
  for (const surface of BINDER_COVER_STICKER_SURFACES) {
    const preview = getBinderCoverPreview(surface);
    if (!preview) continue;
    const existing = new Map(
      [...preview.querySelectorAll(".binder-cover-sticker")]
        .map((node) => [node.dataset.mint || "", node]),
    );
    const surfaceStickers = binderCoverDraft.stickers.filter((sticker) => (
      sticker.surface === surface
    ));
    surfaceStickers.forEach((sticker, layerIndex) => {
      let node = existing.get(sticker.mint);
      if (!node) {
        node = document.createElement("div");
        node.className = "binder-cover-sticker";
        node.tabIndex = 0;
        node.setAttribute("role", "button");
        const image = document.createElement("img");
        image.alt = "";
        image.draggable = false;
        image.decoding = "async";
        const resizeHandle = document.createElement("button");
        resizeHandle.type = "button";
        resizeHandle.className = "binder-cover-sticker-resize";
        resizeHandle.setAttribute("aria-label", "Resize sticker");
        const rotateHandle = document.createElement("button");
        rotateHandle.type = "button";
        rotateHandle.className = "binder-cover-sticker-rotate";
        rotateHandle.tabIndex = 0;
        rotateHandle.setAttribute("role", "slider");
        rotateHandle.setAttribute("aria-label", "Rotate sticker");
        rotateHandle.setAttribute("aria-valuemin", String(BINDER_COVER_ROTATION_MIN_DEGREES));
        rotateHandle.setAttribute("aria-valuemax", String(BINDER_COVER_ROTATION_MAX_DEGREES));
        image.addEventListener("load", positionBinderCoverStickerRemoveButton);
        node.append(image, resizeHandle, rotateHandle);
        preview.append(node);
      }
      existing.delete(sticker.mint);
      node.dataset.mint = sticker.mint;
      node.dataset.surface = surface;
      node.style.left = `${sticker.x * 100}%`;
      node.style.top = `${sticker.y * 100}%`;
      node.style.width = `${sticker.scale * 100}%`;
      node.style.transform = `translate(-50%, -50%) rotate(${sticker.rotation}deg)`;
      node.style.setProperty("--sticker-counter-rotation", `${-sticker.rotation}deg`);
      node.style.zIndex = String(3 + layerIndex);
      node.classList.toggle("is-selected", sticker.mint === binderCoverSelectedStickerMint);
      node.setAttribute("aria-pressed", String(sticker.mint === binderCoverSelectedStickerMint));
      node.setAttribute("aria-label", `${sticker.name}. Drag to move; use the corner handles to resize or rotate.`);
      const rotateHandle = node.querySelector(".binder-cover-sticker-rotate");
      rotateHandle?.setAttribute("aria-valuenow", String(Math.round(sticker.rotation)));
      const image = node.querySelector("img");
      if (image && image.src !== sticker.imageUrl) image.src = sticker.imageUrl;
    });
    for (const node of existing.values()) node.remove();
  }
  renderBinderCoverStickerRemoveButton();
}

function renderBinderCoverStickerRemoveButton() {
  const selected = getBinderCoverSelectedSticker();
  let button = els.binderCoverEditor.querySelector(".binder-cover-sticker-remove");
  if (!selected) {
    button?.remove();
    return;
  }
  const preview = getBinderCoverPreview(selected.surface);
  const stickerNode = preview?.querySelector(
    `.binder-cover-sticker[data-mint="${selected.mint}"]`,
  );
  if (!preview || !stickerNode) {
    button?.remove();
    return;
  }
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "binder-cover-sticker-remove";
    button.setAttribute("aria-label", "Remove selected sticker");
    button.textContent = "×";
  }
  if (button.parentElement !== preview) preview.append(button);
  button.dataset.mint = selected.mint;
  button.dataset.surface = selected.surface;
  positionBinderCoverStickerRemoveButton();
}

function positionBinderCoverStickerRemoveButton() {
  const button = els.binderCoverEditor.querySelector(".binder-cover-sticker-remove");
  if (!button) return;
  const preview = getBinderCoverPreview(button.dataset.surface);
  const stickerNode = preview?.querySelector(
    `.binder-cover-sticker[data-mint="${button.dataset.mint}"]`,
  );
  if (!preview || !stickerNode) return;
  const previewRect = preview.getBoundingClientRect();
  const stickerRect = stickerNode.getBoundingClientRect();
  const controlRadius = 16;
  button.style.left = `${clamp(
    stickerRect.left + stickerRect.width / 2 - previewRect.left,
    controlRadius,
    Math.max(controlRadius, previewRect.width - controlRadius),
  )}px`;
  button.style.top = `${clamp(
    stickerRect.bottom - previewRect.top + 13,
    controlRadius,
    Math.max(controlRadius, previewRect.height - controlRadius),
  )}px`;
}

function getBinderCoverPreview(surface) {
  if (surface === "back") return els.binderBackCoverPreview;
  if (surface === "inside") return els.binderInsideCoverPreview;
  return els.binderFrontCoverPreview;
}

function getBinderCoverSelectedSticker() {
  return binderCoverDraft?.stickers.find((sticker) => (
    sticker.mint === binderCoverSelectedStickerMint
  )) || null;
}

function renderBinderInsideRichTextPreview() {
  const settings = binderCoverDraft;
  if (!settings?.insideText) return;
  const coverWidth = BINDER_COVER_OUTER_X - BINDER_COVER_SPINE_WIDTH / 2;
  const coverHeight = BINDER_PAGE_HEIGHT + BINDER_COVER_VERTICAL_OVERHANG;
  const surfaceWidth = 1024;
  const surfaceHeight = Math.max(1, Math.round(surfaceWidth * coverHeight / coverWidth));
  const canvas = els.binderInsideTextPreview;
  canvas.width = Math.max(1, Math.round(settings.insideTextWidth * surfaceWidth));
  canvas.height = Math.max(1, Math.round(settings.insideTextHeight * surfaceHeight));
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBinderCustomInsideText(context, {
    text: settings.insideText,
    links: settings.insideLinks,
    box: { x: 0, y: 0, width: canvas.width, height: canvas.height },
    fontSize: settings.insideFontSize,
    fontStack: SITE_FONT_STACK,
    textFillStyle: settings.insideTextColor,
    linkFillStyle: settings.insideTextColor,
  });
}

async function handleBinderCoverArtworkUpload(side = "front") {
  const editor = getBinderCoverArtworkEditor(side);
  const file = editor.upload.files?.[0];
  editor.upload.value = "";
  if (!file || binderOrderEditorLoading || binderOrderEditorSaving) return;
  if (!file.type.startsWith("image/") || file.size > BINDER_COVER_ARTWORK_MAX_FILE_BYTES) {
    setBinderOrderStatus("Choose a PNG, JPEG, WebP, GIF, or AVIF image under 16 MB.", { error: true });
    return;
  }
  const token = binderOrderEditorToken;
  els.binderCoverModeButton.disabled = true;
  setBinderOrderStatus("Preparing cover artwork…");
  try {
    const artworkDataUrl = await createBinderCoverArtworkDataUrl(file);
    if (token !== binderOrderEditorToken || !binderOrderEditorOpen) return;
    recordBinderCoverUndoState(`artwork-upload-${editor.side}`);
    binderCoverDraft = normalizeBinderCoverSettings({
      ...binderCoverDraft,
      [editor.dataUrlKey]: artworkDataUrl,
      [editor.xKey]: 0.5,
      [editor.yKey]: 0.5,
      [editor.scaleKey]: 1,
      [editor.rotationKey]: 0,
    });
    renderBinderCoverEditor();
    setBinderOrderStatus(`${editor.side === "back" ? "Back" : "Front"} cover image ready. Drag to place it and confirm to save.`);
    refreshBinderOrderConfirmButton();
  } catch (error) {
    setBinderOrderStatus(error?.message || "That image could not be prepared.", { error: true });
  } finally {
    if (token === binderOrderEditorToken && binderOrderEditorOpen) refreshBinderOrderConfirmButton();
  }
}

async function createBinderCoverArtworkDataUrl(file) {
  const source = await createImageBitmap(file);
  try {
    let scale = Math.min(
      1,
      BINDER_COVER_ARTWORK_MAX_WIDTH / source.width,
      BINDER_COVER_ARTWORK_MAX_HEIGHT / source.height,
    );
    let width = Math.max(1, Math.round(source.width * scale));
    let height = Math.max(1, Math.round(source.height * scale));
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: true });
      context.clearRect(0, 0, width, height);
      context.drawImage(source, 0, 0, width, height);
      const quality = Math.max(0.7, 0.94 - attempt * 0.04);
      const dataUrl = canvas.toDataURL("image/webp", quality);
      if (dataUrl.length <= BINDER_COVER_ARTWORK_MAX_DATA_URL_LENGTH) return dataUrl;
      width = Math.max(320, Math.round(width * 0.82));
      height = Math.max(320, Math.round(height * 0.82));
    }
  } finally {
    source.close?.();
  }
  throw new Error("This image is too detailed to fit. Try a smaller image.");
}

function removeBinderCoverArtwork(side = "front") {
  if (!binderCoverDraft || binderOrderEditorSaving) return;
  const editor = getBinderCoverArtworkEditor(side);
  if (!binderCoverDraft[editor.dataUrlKey]) return;
  recordBinderCoverUndoState(`artwork-remove-${editor.side}`);
  binderCoverDraft[editor.dataUrlKey] = "";
  binderCoverDraft[editor.xKey] = 0.5;
  binderCoverDraft[editor.yKey] = 0.5;
  binderCoverDraft[editor.scaleKey] = 1;
  binderCoverDraft[editor.rotationKey] = 0;
  renderBinderCoverEditor();
  setBinderOrderStatus(`${editor.side === "back" ? "Back" : "Front"} cover artwork removed. Confirm to save.`);
  refreshBinderOrderConfirmButton();
}

function handleBinderCoverStickerControlsClick(event) {
  const stickerRemoveButton = event.target.closest(".binder-cover-sticker-remove");
  if (stickerRemoveButton) {
    binderCoverSelectedStickerMint = String(stickerRemoveButton.dataset.mint || "");
    removeSelectedBinderCoverSticker(stickerRemoveButton.dataset.surface || "front");
    return;
  }
  const addTextButton = event.target.closest(".binder-cover-add-text");
  if (addTextButton) {
    addBinderOutsideTextBox(addTextButton.dataset.textSurface);
    return;
  }
  const textControls = event.target.closest(".binder-outside-text-controls");
  if (textControls && event.target.closest(".binder-cover-remove-text")) {
    removeBinderOutsideTextBox(textControls.dataset.textSurface);
    return;
  }
  const controls = event.target.closest(".binder-cover-sticker-controls");
  if (!controls || !els.binderCoverEditor.contains(controls)) return;
  const surface = BINDER_COVER_STICKER_SURFACES.includes(controls.dataset.stickerSurface)
    ? controls.dataset.stickerSurface
    : "front";
  if (event.target.closest(".binder-cover-add-sticker")) {
    openBinderStickerPicker(surface).catch(console.error);
    return;
  }
}

function handleBinderCoverStickerControlsInput(event) {
  const textControls = event.target.closest(".binder-outside-text-controls");
  if (textControls) {
    handleBinderOutsideTextControlsInput(event, textControls.dataset.textSurface);
    return;
  }
}

function handleBinderCoverStickerKeyboard(event) {
  const rotateHandle = event.target.closest(".binder-cover-sticker-rotate");
  if (!rotateHandle || !binderCoverDraft || binderOrderEditorSaving) return;
  const stickerNode = rotateHandle.closest(".binder-cover-sticker");
  const sticker = binderCoverDraft.stickers.find((entry) => (
    entry.mint === stickerNode?.dataset.mint
  ));
  if (!sticker) return;
  let delta = 0;
  if (event.key === "ArrowLeft" || event.key === "ArrowDown") delta = event.shiftKey ? -10 : -1;
  else if (event.key === "ArrowRight" || event.key === "ArrowUp") delta = event.shiftKey ? 10 : 1;
  else if (event.key !== "Home") return;
  const nextRotation = delta
    ? normalizeBinderCoverRotation(sticker.rotation + delta)
    : 0;
  if (nextRotation === sticker.rotation) return;
  event.preventDefault();
  recordBinderCoverUndoState(`sticker-rotate-key-${sticker.mint}`);
  binderCoverSelectedStickerMint = sticker.mint;
  sticker.rotation = nextRotation;
  renderBinderCoverStickers();
  refreshBinderOrderConfirmButton();
  requestAnimationFrame(() => (
    getBinderCoverPreview(sticker.surface)
      ?.querySelector(`.binder-cover-sticker[data-mint="${sticker.mint}"] .binder-cover-sticker-rotate`)
      ?.focus({ preventScroll: true })
  ));
}

function addBinderOutsideTextBox(side = "front") {
  if (!binderCoverDraft || binderOrderEditorSaving) return;
  const editor = getBinderOutsideTextEditor(side);
  if (binderOutsideTextBoxEnabled[editor.side]) return;
  recordBinderCoverUndoState(`text-add-${editor.side}`);
  binderOutsideTextBoxEnabled[editor.side] = true;
  renderBinderCoverEditor();
  setBinderOrderStatus(`${editor.side === "back" ? "Back" : "Front"} cover text box added. Type below, then drag or resize it in the preview.`);
  requestAnimationFrame(() => editor.input.focus());
}

function removeBinderOutsideTextBox(side = "front") {
  if (!binderCoverDraft || binderOrderEditorSaving) return;
  const editor = getBinderOutsideTextEditor(side);
  if (!binderOutsideTextBoxEnabled[editor.side]) return;
  recordBinderCoverUndoState(`text-remove-${editor.side}`);
  binderOutsideTextBoxEnabled[editor.side] = false;
  binderCoverDraft[editor.textKey] = "";
  binderCoverDraft[editor.xKey] = 0.5;
  binderCoverDraft[editor.yKey] = 0.5;
  binderCoverDraft[editor.widthKey] = 0.72;
  binderCoverDraft[editor.heightKey] = 0.3;
  binderCoverDraft[editor.fontSizeKey] = 42;
  binderCoverDraft[editor.rotationKey] = 0;
  binderCoverDraft[editor.colorKey] = BINDER_COVER_DEFAULT_TEXT_COLOR_HEX;
  renderBinderCoverEditor();
  refreshBinderOrderConfirmButton();
  setBinderOrderStatus(`${editor.side === "back" ? "Back" : "Front"} cover text removed. Confirm to save.`);
}

function handleBinderOutsideTextControlsInput(event, side = "front") {
  if (!binderCoverDraft || binderOrderEditorSaving) return;
  const editor = getBinderOutsideTextEditor(side);
  const target = event.target;
  if (target === editor.input) {
    const value = target.value.slice(0, BINDER_COVER_INSIDE_TEXT_MAX_LENGTH);
    if (value === binderCoverDraft[editor.textKey]) return;
    recordBinderCoverUndoState(`text-input-${editor.side}`, { coalesce: true });
    binderCoverDraft[editor.textKey] = value;
  } else if (target === editor.fontSize) {
    const value = Math.round(clampFiniteNumber(target.value, 42, 18, 96));
    if (value === binderCoverDraft[editor.fontSizeKey]) return;
    recordBinderCoverUndoState(`text-font-${editor.side}`, { coalesce: true });
    binderCoverDraft[editor.fontSizeKey] = value;
  } else if (target === editor.rotation) {
    const value = clampFiniteNumber(
      target.value,
      0,
      BINDER_COVER_ROTATION_MIN_DEGREES,
      BINDER_COVER_ROTATION_MAX_DEGREES,
    );
    if (value === binderCoverDraft[editor.rotationKey]) return;
    recordBinderCoverUndoState(`text-rotation-${editor.side}`, { coalesce: true });
    binderCoverDraft[editor.rotationKey] = value;
  } else if (target === editor.color) {
    const color = String(target.value || "").toLowerCase();
    if (!/^#[0-9a-f]{6}$/.test(color) || color === binderCoverDraft[editor.colorKey]) return;
    recordBinderCoverUndoState(`text-color-${editor.side}`, { coalesce: true });
    binderCoverDraft[editor.colorKey] = color;
  } else {
    return;
  }
  renderBinderOutsideTextEditor(editor.side);
  refreshBinderOrderConfirmButton();
}

function removeSelectedBinderCoverSticker(surface) {
  const selected = getBinderCoverSelectedSticker();
  if (!selected || selected.surface !== surface || binderOrderEditorSaving) return;
  recordBinderCoverUndoState(`sticker-remove-${selected.mint}`);
  binderCoverDraft.stickers = binderCoverDraft.stickers.filter((sticker) => (
    sticker.mint !== selected.mint
  ));
  binderCoverSelectedStickerMint = "";
  renderBinderCoverEditor();
  refreshBinderOrderConfirmButton();
  setBinderOrderStatus(`${selected.name} removed. Confirm to save.`);
}

async function openBinderStickerPicker(surface = "front") {
  if (!binderCoverDraft || binderOrderEditorSaving || binderStickerPickerOpen) return;
  const requestToken = ++binderStickerPickerToken;
  binderStickerPickerSurface = BINDER_COVER_STICKER_SURFACES.includes(surface) ? surface : "front";
  binderStickerPickerOpen = true;
  binderStickerPickerLoading = true;
  els.binderStickerPicker.hidden = false;
  els.binderStickerPicker.setAttribute("aria-hidden", "false");
  els.binderStickerPickerTitle.textContent = `Add sticker to ${getBinderCoverSurfaceLabel(binderStickerPickerSurface)}`;
  els.binderStickerPickerStatus.textContent = "Checking your wallet for Swag Pack pieces…";
  renderBinderStickerPickerGallery();
  requestAnimationFrame(() => els.binderStickerPickerClose.focus());

  const editorToken = binderOrderEditorToken;
  try {
    walletSwagPackAssets = await fetchWalletSwagPackAssets(WALLET_ROUTE_ADDRESS, { force: true });
    walletSwagPackAssetsFetchedAt = Date.now();
    if (
      !binderStickerPickerOpen
      || requestToken !== binderStickerPickerToken
      || editorToken !== binderOrderEditorToken
    ) return;
    binderStickerPickerLoading = false;
    renderBinderStickerPickerGallery();
  } catch {
    if (
      !binderStickerPickerOpen
      || requestToken !== binderStickerPickerToken
      || editorToken !== binderOrderEditorToken
    ) return;
    binderStickerPickerLoading = false;
    els.binderStickerPickerGallery.replaceChildren();
    els.binderStickerPickerStatus.textContent = "Swag Pack holdings could not be checked. Try again.";
  }
}

function closeBinderStickerPicker({ restoreFocus = true } = {}) {
  if (!binderStickerPickerOpen) return;
  const surface = binderStickerPickerSurface;
  binderStickerPickerOpen = false;
  binderStickerPickerLoading = false;
  binderStickerPickerToken += 1;
  els.binderStickerPicker.hidden = true;
  els.binderStickerPicker.setAttribute("aria-hidden", "true");
  els.binderStickerPickerGallery.replaceChildren();
  if (!restoreFocus) return;
  requestAnimationFrame(() => {
    const controls = els.binderCoverStickerControls.find((entry) => (
      entry.dataset.stickerSurface === surface
    ));
    controls?.querySelector(".binder-cover-add-sticker")?.focus();
  });
}

function renderBinderStickerPickerGallery() {
  els.binderStickerPickerGallery.replaceChildren();
  if (binderStickerPickerLoading) return;
  if (!walletSwagPackAssets.length) {
    els.binderStickerPickerStatus.textContent = "This wallet does not currently hold any Swag Pack pieces.";
    return;
  }
  const placedByMint = new Map(
    binderCoverDraft.stickers.map((sticker) => [sticker.mint, sticker]),
  );
  const fragment = document.createDocumentFragment();
  for (const asset of walletSwagPackAssets) {
    const placed = placedByMint.get(asset.mint);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "binder-sticker-picker-item";
    button.dataset.mint = asset.mint;
    button.classList.toggle("is-placed", Boolean(placed));
    button.setAttribute(
      "aria-label",
      placed
        ? `${asset.name}, currently on ${getBinderCoverSurfaceLabel(placed.surface)}. Move it to ${getBinderCoverSurfaceLabel(binderStickerPickerSurface)}.`
        : `Add ${asset.name} to ${getBinderCoverSurfaceLabel(binderStickerPickerSurface)}`,
    );
    const image = document.createElement("img");
    image.src = asset.imageUrl;
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    const name = document.createElement("span");
    name.textContent = asset.name;
    button.append(image, name);
    if (placed) {
      const status = document.createElement("small");
      status.textContent = `on ${getBinderCoverSurfaceLabel(placed.surface)}`;
      button.append(status);
    }
    fragment.append(button);
  }
  els.binderStickerPickerGallery.append(fragment);
  els.binderStickerPickerStatus.textContent = `${walletSwagPackAssets.length} held Swag Pack piece${walletSwagPackAssets.length === 1 ? "" : "s"}. Select one to place it.`;
}

function handleBinderStickerPickerClick(event) {
  const button = event.target.closest(".binder-sticker-picker-item");
  if (!button || binderStickerPickerLoading || !binderCoverDraft) return;
  const asset = walletSwagPackAssets.find((entry) => entry.mint === button.dataset.mint);
  if (!asset) return;
  let sticker = binderCoverDraft.stickers.find((entry) => entry.mint === asset.mint);
  if (!sticker && binderCoverDraft.stickers.length >= BINDER_COVER_STICKER_MAX_COUNT) {
    els.binderStickerPickerStatus.textContent = `A binder can have up to ${BINDER_COVER_STICKER_MAX_COUNT} stickers.`;
    return;
  }
  if (!sticker || sticker.surface !== binderStickerPickerSurface) {
    recordBinderCoverUndoState(`sticker-place-${asset.mint}`);
  }
  if (sticker) {
    sticker.surface = binderStickerPickerSurface;
  } else {
    sticker = {
      ...asset,
      surface: binderStickerPickerSurface,
      x: 0.5,
      y: 0.5,
      scale: BINDER_COVER_STICKER_DEFAULT_SCALE,
      rotation: 0,
    };
    binderCoverDraft.stickers.push(sticker);
  }
  binderCoverSelectedStickerMint = sticker.mint;
  const name = sticker.name;
  const surface = sticker.surface;
  closeBinderStickerPicker({ restoreFocus: false });
  renderBinderCoverEditor();
  refreshBinderOrderConfirmButton();
  setBinderOrderStatus(`${name} placed on ${getBinderCoverSurfaceLabel(surface)}. Select it to move, resize, rotate, or remove it directly in the preview.`);
  requestAnimationFrame(() => {
    const node = getBinderCoverPreview(surface)?.querySelector(
      `.binder-cover-sticker[data-mint="${sticker.mint}"]`,
    );
    node?.focus({ preventScroll: true });
  });
}

function getBinderCoverSurfaceLabel(surface) {
  if (surface === "back") return "back cover";
  if (surface === "inside") return "inside cover";
  return "front cover";
}

function handleBinderCoverArtworkZoom(side = "front") {
  const editor = getBinderCoverArtworkEditor(side);
  if (!binderCoverDraft?.[editor.dataUrlKey]) return;
  const value = clampFiniteNumber(
    editor.zoom.value,
    1,
    0.25,
    4,
  );
  if (value === binderCoverDraft[editor.scaleKey]) return;
  recordBinderCoverUndoState(`artwork-zoom-${editor.side}`, { coalesce: true });
  binderCoverDraft[editor.scaleKey] = value;
  renderBinderCoverEditor();
  refreshBinderOrderConfirmButton();
}

function handleBinderCoverArtworkRotation(side = "front") {
  const editor = getBinderCoverArtworkEditor(side);
  if (!binderCoverDraft?.[editor.dataUrlKey]) return;
  const value = clampFiniteNumber(
    editor.rotation.value,
    0,
    BINDER_COVER_ROTATION_MIN_DEGREES,
    BINDER_COVER_ROTATION_MAX_DEGREES,
  );
  if (value === binderCoverDraft[editor.rotationKey]) return;
  recordBinderCoverUndoState(`artwork-rotation-${editor.side}`, { coalesce: true });
  binderCoverDraft[editor.rotationKey] = value;
  renderBinderCoverArtworkEditor(editor.side);
  refreshBinderOrderConfirmButton();
}

function startBinderCoverPreviewInteraction(event, side = "front") {
  if (event.target.closest(".binder-cover-sticker-remove")) return;
  const stickerNode = event.target.closest(".binder-cover-sticker");
  if (stickerNode) {
    startBinderCoverStickerInteraction(event, side, stickerNode);
    return;
  }
  if (event.target.closest(".binder-cover-text-box")) {
    startBinderCoverTextBoxInteraction(event, side);
    return;
  }
  if (binderCoverSelectedStickerMint) {
    binderCoverSelectedStickerMint = "";
    renderBinderCoverStickers();
  }
  if (side !== "inside") startBinderCoverArtworkDrag(event, side);
}

function startBinderCoverStickerInteraction(event, surface, stickerNode) {
  if (event.button > 0 || binderOrderEditorSaving || !binderCoverDraft) return;
  const mint = String(stickerNode.dataset.mint || "");
  const sticker = binderCoverDraft.stickers.find((entry) => entry.mint === mint);
  if (!sticker || sticker.surface !== surface) return;
  event.preventDefault();
  event.stopPropagation();
  binderCoverSelectedStickerMint = mint;
  renderBinderCoverStickers();
  const preview = getBinderCoverPreview(surface);
  const activeNode = preview?.querySelector(`.binder-cover-sticker[data-mint="${mint}"]`);
  const rect = activeNode?.getBoundingClientRect();
  const resizing = Boolean(event.target.closest(".binder-cover-sticker-resize"));
  const rotating = Boolean(event.target.closest(".binder-cover-sticker-rotate"));
  const centerX = rect ? rect.left + rect.width / 2 : event.clientX;
  const centerY = rect ? rect.top + rect.height / 2 : event.clientY;
  binderCoverInteraction = {
    type: rotating ? "sticker-rotate" : resizing ? "sticker-resize" : "sticker-move",
    surface,
    stickerMint: mint,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: sticker.x,
    startY: sticker.y,
    startScale: sticker.scale,
    startRotation: sticker.rotation,
    centerX,
    centerY,
    startAngle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
    startDistance: rect
      ? Math.max(12, Math.hypot(event.clientX - centerX, event.clientY - centerY))
      : 12,
    undoSnapshot: captureBinderCoverUndoState(),
    undoRecorded: false,
  };
  activeNode?.setPointerCapture?.(event.pointerId);
  activeNode?.classList.add(rotating ? "is-rotating" : resizing ? "is-resizing" : "is-dragging");
}

function startBinderCoverArtworkDrag(event, side = "front") {
  const editor = getBinderCoverArtworkEditor(side);
  if (event.button > 0 || !binderCoverDraft?.[editor.dataUrlKey] || binderOrderEditorSaving) return;
  event.preventDefault();
  binderCoverInteraction = {
    type: "artwork",
    side: editor.side,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: binderCoverDraft[editor.xKey],
    startY: binderCoverDraft[editor.yKey],
    undoSnapshot: captureBinderCoverUndoState(),
    undoRecorded: false,
  };
  editor.preview.setPointerCapture?.(event.pointerId);
  editor.preview.classList.add("is-dragging");
}

function handleBinderInsideTextInput() {
  if (!binderCoverDraft) return;
  const previousText = binderCoverDraft.insideText;
  const nextText = els.binderInsideTextInput.value.slice(0, BINDER_COVER_INSIDE_TEXT_MAX_LENGTH);
  if (nextText === previousText) return;
  recordBinderCoverUndoState("inside-text-input", { coalesce: true });
  binderCoverDraft.insideLinks = remapBinderInsideLinksAfterEdit(
    previousText,
    nextText,
    binderCoverDraft.insideLinks,
  );
  binderCoverDraft.insideText = nextText;
  hideBinderInsideLinkPopover();
  renderBinderInsideTextBox();
  refreshBinderOrderConfirmButton();
}

function remapBinderInsideLinksAfterEdit(previousText, nextText, links) {
  if (previousText === nextText) return links;
  let prefixLength = 0;
  while (
    prefixLength < previousText.length
    && prefixLength < nextText.length
    && previousText[prefixLength] === nextText[prefixLength]
  ) prefixLength += 1;
  let suffixLength = 0;
  while (
    suffixLength < previousText.length - prefixLength
    && suffixLength < nextText.length - prefixLength
    && previousText[previousText.length - 1 - suffixLength]
      === nextText[nextText.length - 1 - suffixLength]
  ) suffixLength += 1;
  const oldEditEnd = previousText.length - suffixLength;
  const delta = nextText.length - previousText.length;
  return links.flatMap((link) => {
    if (link.end <= prefixLength) return [link];
    if (link.start >= oldEditEnd) {
      return [{ ...link, start: link.start + delta, end: link.end + delta }];
    }
    return [];
  });
}

function handleBinderInsideFontSizeInput() {
  if (!binderCoverDraft) return;
  const value = Math.round(clampFiniteNumber(
    els.binderInsideFontSize.value,
    42,
    18,
    96,
  ));
  if (value === binderCoverDraft.insideFontSize) return;
  recordBinderCoverUndoState("inside-text-font", { coalesce: true });
  binderCoverDraft.insideFontSize = value;
  renderBinderInsideTextBox();
  refreshBinderOrderConfirmButton();
}

function handleBinderInsideTextRotationInput() {
  if (!binderCoverDraft) return;
  const value = clampFiniteNumber(
    els.binderInsideTextRotation.value,
    0,
    BINDER_COVER_ROTATION_MIN_DEGREES,
    BINDER_COVER_ROTATION_MAX_DEGREES,
  );
  if (value === binderCoverDraft.insideTextRotation) return;
  recordBinderCoverUndoState("inside-text-rotation", { coalesce: true });
  binderCoverDraft.insideTextRotation = value;
  renderBinderInsideTextBox();
  refreshBinderOrderConfirmButton();
}

function handleBinderBaseColorInput() {
  if (!binderCoverDraft || binderOrderEditorSaving) return;
  const color = String(els.binderBaseColor.value || "").toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(color) || color === binderCoverDraft.baseColor) return;
  recordBinderCoverUndoState("binder-base-color", { coalesce: true });
  binderCoverDraft.baseColor = color;
  renderBinderCoverEditor();
  refreshBinderOrderConfirmButton();
}

function handleBinderCoverTextColorInput() {
  if (!binderCoverDraft || binderOrderEditorSaving) return;
  const color = String(els.binderCoverTextColor.value || "").toLowerCase();
  if (!/^#[0-9a-f]{6}$/.test(color) || color === binderCoverDraft.insideTextColor) return;
  recordBinderCoverUndoState("inside-text-color", { coalesce: true });
  binderCoverDraft.insideTextColor = color;
  renderBinderInsideTextBox();
  refreshBinderOrderConfirmButton();
}

function startBinderInsideTextBoxDrag(event) {
  startBinderCoverTextBoxInteraction(event, "inside");
}

function getBinderCoverTextEditor(surface = "inside") {
  if (surface !== "inside") return getBinderOutsideTextEditor(surface);
  return {
    side: "inside",
    textKey: "insideText",
    xKey: "insideTextX",
    yKey: "insideTextY",
    widthKey: "insideTextWidth",
    heightKey: "insideTextHeight",
    rotationKey: "insideTextRotation",
    preview: els.binderInsideCoverPreview,
    box: els.binderInsideTextBox,
  };
}

function startBinderCoverTextBoxInteraction(event, surface = "inside") {
  const editor = getBinderCoverTextEditor(surface);
  const enabled = editor.side === "inside"
    ? Boolean(binderCoverDraft?.insideText)
    : binderOutsideTextBoxEnabled[editor.side];
  if (event.button > 0 || !enabled || binderOrderEditorSaving) return;
  event.preventDefault();
  event.stopPropagation();
  const resizing = Boolean(event.target.closest(".binder-cover-text-resize"));
  binderCoverInteraction = {
    type: resizing ? "cover-text-resize" : "cover-text-move",
    surface: editor.side,
    pointerId: event.pointerId,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startX: binderCoverDraft[editor.xKey],
    startY: binderCoverDraft[editor.yKey],
    startWidth: binderCoverDraft[editor.widthKey],
    startHeight: binderCoverDraft[editor.heightKey],
    startRotation: binderCoverDraft[editor.rotationKey],
    undoSnapshot: captureBinderCoverUndoState(),
    undoRecorded: false,
  };
  editor.box.setPointerCapture?.(event.pointerId);
  editor.box.classList.add(resizing ? "is-resizing" : "is-dragging");
}

function moveBinderCoverInteraction(event) {
  if (!binderCoverInteraction || event.pointerId !== binderCoverInteraction.pointerId) return;
  event.preventDefault();
  const interaction = binderCoverInteraction;
  if (
    !interaction.undoRecorded
    && (event.clientX !== interaction.startClientX || event.clientY !== interaction.startClientY)
  ) {
    interaction.undoRecorded = recordBinderCoverUndoState(
      `preview-${interaction.type}-${interaction.stickerMint || interaction.side || interaction.surface || "cover"}`,
      { snapshot: interaction.undoSnapshot },
    );
  }
  if (
    interaction.type === "sticker-move"
    || interaction.type === "sticker-resize"
    || interaction.type === "sticker-rotate"
  ) {
    const sticker = binderCoverDraft.stickers.find((entry) => (
      entry.mint === interaction.stickerMint
    ));
    const preview = getBinderCoverPreview(interaction.surface);
    if (!sticker || !preview) return;
    const rect = preview.getBoundingClientRect();
    if (interaction.type === "sticker-move") {
      sticker.x = clamp(
        interaction.startX + (event.clientX - interaction.startClientX) / Math.max(1, rect.width),
        -0.25,
        1.25,
      );
      sticker.y = clamp(
        interaction.startY + (event.clientY - interaction.startClientY) / Math.max(1, rect.height),
        -0.25,
        1.25,
      );
    } else if (interaction.type === "sticker-resize") {
      const stickerNode = preview.querySelector(
        `.binder-cover-sticker[data-mint="${interaction.stickerMint}"]`,
      );
      const stickerRect = stickerNode?.getBoundingClientRect();
      const centerX = stickerRect ? stickerRect.left + stickerRect.width / 2 : interaction.startClientX;
      const centerY = stickerRect ? stickerRect.top + stickerRect.height / 2 : interaction.startClientY;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      sticker.scale = clamp(
        interaction.startScale * distance / interaction.startDistance,
        BINDER_COVER_STICKER_MIN_SCALE,
        BINDER_COVER_STICKER_MAX_SCALE,
      );
    } else {
      const angle = Math.atan2(
        event.clientY - interaction.centerY,
        event.clientX - interaction.centerX,
      );
      sticker.rotation = normalizeBinderCoverRotation(
        interaction.startRotation + (angle - interaction.startAngle) * 180 / Math.PI,
      );
    }
    renderBinderCoverStickers();
    return;
  }
  if (interaction.type === "artwork") {
    const editor = getBinderCoverArtworkEditor(interaction.side);
    const rect = editor.preview.getBoundingClientRect();
    binderCoverDraft[editor.xKey] = clamp(
      interaction.startX + (event.clientX - interaction.startClientX) / Math.max(1, rect.width),
      -0.5,
      1.5,
    );
    binderCoverDraft[editor.yKey] = clamp(
      interaction.startY + (event.clientY - interaction.startClientY) / Math.max(1, rect.height),
      -0.5,
      1.5,
    );
    renderBinderCoverEditor();
    return;
  }
  if (interaction.type !== "cover-text-move" && interaction.type !== "cover-text-resize") return;
  const editor = getBinderCoverTextEditor(interaction.surface);
  const rect = editor.preview.getBoundingClientRect();
  const deltaX = (event.clientX - interaction.startClientX) / Math.max(1, rect.width);
  const deltaY = (event.clientY - interaction.startClientY) / Math.max(1, rect.height);
  if (interaction.type === "cover-text-move") {
    const halfWidth = binderCoverDraft[editor.widthKey] / 2;
    const halfHeight = binderCoverDraft[editor.heightKey] / 2;
    binderCoverDraft[editor.xKey] = clamp(interaction.startX + deltaX, halfWidth, 1 - halfWidth);
    binderCoverDraft[editor.yKey] = clamp(interaction.startY + deltaY, halfHeight, 1 - halfHeight);
  } else {
    const radians = interaction.startRotation * Math.PI / 180;
    const pixelDeltaX = event.clientX - interaction.startClientX;
    const pixelDeltaY = event.clientY - interaction.startClientY;
    const localDeltaX = (
      pixelDeltaX * Math.cos(radians) + pixelDeltaY * Math.sin(radians)
    ) / Math.max(1, rect.width);
    const localDeltaY = (
      -pixelDeltaX * Math.sin(radians) + pixelDeltaY * Math.cos(radians)
    ) / Math.max(1, rect.height);
    const left = interaction.startX - interaction.startWidth / 2;
    const top = interaction.startY - interaction.startHeight / 2;
    binderCoverDraft[editor.widthKey] = clamp(interaction.startWidth + localDeltaX, 0.2, 0.94 - left);
    binderCoverDraft[editor.heightKey] = clamp(interaction.startHeight + localDeltaY, 0.1, 0.9 - top);
    binderCoverDraft[editor.xKey] = left + binderCoverDraft[editor.widthKey] / 2;
    binderCoverDraft[editor.yKey] = top + binderCoverDraft[editor.heightKey] / 2;
  }
  if (editor.side === "inside") renderBinderInsideTextBox();
  else renderBinderOutsideTextEditor(editor.side);
}

function finishBinderCoverInteraction(event = null) {
  if (
    !binderCoverInteraction
    || (event?.pointerId != null && event.pointerId !== binderCoverInteraction.pointerId)
  ) return;
  binderCoverInteraction = null;
  els.binderFrontCoverPreview?.classList.remove("is-dragging");
  els.binderBackCoverPreview?.classList.remove("is-dragging");
  els.binderCoverEditor?.querySelectorAll(".binder-cover-text-box")
    .forEach((node) => node.classList.remove("is-dragging", "is-resizing"));
  els.binderCoverEditor?.querySelectorAll(".binder-cover-sticker")
    .forEach((node) => node.classList.remove("is-dragging", "is-resizing", "is-rotating"));
  refreshBinderOrderConfirmButton();
}

function updateBinderInsideLinkPopover() {
  if (
    !binderCoverDraft?.insideText
    || binderCustomizationMode !== "cover"
    || binderOrderEditorLoading
    || binderOrderEditorSaving
  ) {
    hideBinderInsideLinkPopover();
    return;
  }
  const start = els.binderInsideTextInput.selectionStart;
  const end = els.binderInsideTextInput.selectionEnd;
  if (!Number.isInteger(start) || !Number.isInteger(end) || end <= start) {
    hideBinderInsideLinkPopover();
    return;
  }

  const existingLinkIndex = binderCoverDraft.insideLinks.findIndex((link) => (
    link.start < end && link.end > start
  ));
  const selectionChanged = (
    !binderInsideLinkSelection
    || binderInsideLinkSelection.start !== start
    || binderInsideLinkSelection.end !== end
    || binderInsideLinkSelection.existingLinkIndex !== existingLinkIndex
  );
  binderInsideLinkSelection = { start, end, existingLinkIndex };
  const existingLink = binderCoverDraft.insideLinks[existingLinkIndex];
  if (selectionChanged) els.binderInsideLinkUrl.value = existingLink?.url || "";
  els.binderInsideLinkApply.textContent = existingLink ? "update" : "add link";
  els.binderInsideLinkRemove.hidden = !existingLink;
  els.binderInsideLinkPopover.hidden = false;
}

function handleBinderInsideTextSelectionChange() {
  if (document.activeElement !== els.binderInsideTextInput) return;
  updateBinderInsideLinkPopover();
}

function startBinderInsideTextSelection(event) {
  if (event.button > 0) return;
  binderInsideTextPointerClickHandled = false;
  binderInsideTextPointerSelection = {
    pointerId: event.pointerId,
    start: els.binderInsideTextInput.selectionStart,
    end: els.binderInsideTextInput.selectionEnd,
    popoverWasOpen: !els.binderInsideLinkPopover.hidden,
  };
}

function finishBinderInsideTextSelection(event) {
  const previous = binderInsideTextPointerSelection;
  if (!previous || event.pointerId !== previous.pointerId) return;
  binderInsideTextPointerSelection = null;
  binderInsideTextPointerClickHandled = true;
  if (event.type === "pointercancel") {
    hideBinderInsideLinkPopover();
    return;
  }
  const start = els.binderInsideTextInput.selectionStart;
  const end = els.binderInsideTextInput.selectionEnd;
  const collapsed = !Number.isInteger(start) || !Number.isInteger(end) || end <= start;
  const unchanged = start === previous.start && end === previous.end;
  if (previous.popoverWasOpen && (collapsed || unchanged)) {
    hideBinderInsideLinkPopover();
    return;
  }
  updateBinderInsideLinkPopover();
}

function handleBinderInsideTextClick() {
  if (binderInsideTextPointerClickHandled) {
    binderInsideTextPointerClickHandled = false;
    return;
  }
  if (!els.binderInsideLinkPopover.hidden) {
    hideBinderInsideLinkPopover();
    return;
  }
  updateBinderInsideLinkPopover();
}

function hideBinderInsideLinkPopover() {
  binderInsideLinkSelection = null;
  els.binderInsideLinkPopover.hidden = true;
  els.binderInsideLinkRemove.hidden = true;
}

function dismissBinderInsideLinkPopoverOnPointerDown(event) {
  if (
    els.binderInsideLinkPopover.hidden
    || event.target === els.binderInsideTextInput
    || els.binderInsideLinkPopover.contains(event.target)
  ) return;
  hideBinderInsideLinkPopover();
}

function addBinderInsideTextLink() {
  if (!binderCoverDraft?.insideText || binderOrderEditorSaving) return;
  const start = binderInsideLinkSelection?.start;
  const end = binderInsideLinkSelection?.end;
  if (!Number.isInteger(start) || !Number.isInteger(end) || end <= start) {
    setBinderOrderStatus("Select the words in the text box that should become a link.", { error: true });
    els.binderInsideTextInput.focus();
    return;
  }
  const url = normalizeBinderCoverLinkUrl(els.binderInsideLinkUrl.value);
  if (!url) {
    setBinderOrderStatus("Enter a valid http or https link.", { error: true });
    els.binderInsideLinkUrl.focus();
    return;
  }
  recordBinderCoverUndoState("inside-text-link-add");
  binderCoverDraft.insideLinks = normalizeBinderInsideLinks([
    ...binderCoverDraft.insideLinks.filter((link) => link.end <= start || link.start >= end),
    { start, end, url },
  ], binderCoverDraft.insideText);
  els.binderInsideLinkUrl.value = "";
  hideBinderInsideLinkPopover();
  renderBinderInsideTextBox();
  refreshBinderOrderConfirmButton();
  setBinderOrderStatus("Selected text linked. Confirm to save.");
}

function removeBinderInsideTextLink() {
  if (!binderCoverDraft) return;
  const index = binderInsideLinkSelection?.existingLinkIndex;
  if (!Number.isInteger(index) || index < 0 || index >= binderCoverDraft.insideLinks.length) return;
  recordBinderCoverUndoState("inside-text-link-remove");
  binderCoverDraft.insideLinks.splice(index, 1);
  hideBinderInsideLinkPopover();
  renderBinderInsideTextBox();
  refreshBinderOrderConfirmButton();
  setBinderOrderStatus("Link removed. Confirm to save.");
}

function toggleBinderTradeCard(button) {
  const stableId = String(button?.dataset?.stableId || "").trim();
  if (!stableId) return;
  const marked = !binderTradeDraftStableIds.has(stableId);
  if (marked) binderTradeDraftStableIds.add(stableId);
  else binderTradeDraftStableIds.delete(stableId);
  button.classList.toggle("is-marked-for-trade", marked);
  button.setAttribute("aria-pressed", String(marked));
  const cardIndex = Number(button.dataset.cardIndex);
  const title = CARDS[cardIndex]?.title || "Card";
  button.setAttribute(
    "aria-label",
    `${title}. ${marked ? "Marked" : "Not marked"} for trade. Press Space or Enter to toggle.`,
  );
  refreshBinderOrderConfirmButton();
  setBinderOrderStatus(`${title} ${marked ? "marked" : "unmarked"} for trade. Confirm to save changes.`);
}

function startBinderOrderDrag(event) {
  if (
    !binderOrderEditorOpen
    || binderOrderEditorLoading
    || binderOrderEditorSaving
    || binderTradeMarkingMode
    || binderOrderPositionEdit
    || binderOrderDrag
    || event.isPrimary === false
    || (event.pointerType !== "touch" && event.button !== 0)
  ) return;
  const button = event.target.closest(".binder-order-card");
  if (!button || !els.binderOrderPages.contains(button)) return;
  if (event.target.closest(".binder-order-card-position, .binder-order-position-input")) return;
  if (event.pointerType === "touch" && !event.target.closest(".binder-order-card-handle")) {
    return;
  }
  event.preventDefault();
  button.focus({ preventScroll: true });
  binderOrderKeyboardStableId = "";
  renderBinderOrderKeyboardSelection();
  const rect = button.getBoundingClientRect();
  binderOrderDrag = {
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    stableId: button.dataset.stableId || "",
    cardNode: button,
    startX: event.clientX,
    startY: event.clientY,
    clientX: event.clientX,
    clientY: event.clientY,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
    started: false,
    ghost: null,
    layout: null,
    lastFrameTime: 0,
  };
  try {
    els.binderOrderEditor.setPointerCapture(event.pointerId);
  } catch {
    // Document-level pointer listeners still keep the drag usable when capture is unavailable.
  }
}

function moveBinderOrderDrag(event) {
  if (!binderOrderDrag || event.pointerId !== binderOrderDrag.pointerId) return;
  binderOrderDrag.clientX = event.clientX;
  binderOrderDrag.clientY = event.clientY;
  if (!binderOrderDrag.started) {
    const distance = Math.hypot(
      event.clientX - binderOrderDrag.startX,
      event.clientY - binderOrderDrag.startY,
    );
    if (distance < BINDER_ORDER_DRAG_THRESHOLD_PX) return;
    beginBinderOrderDrag();
  }
  if (event.cancelable) event.preventDefault();
}

function beginBinderOrderDrag() {
  if (!binderOrderDrag || binderOrderDrag.started) return;
  binderOrderDrag.started = true;
  stopBinderOrderCardAnimations();
  binderOrderDrag.layout = measureBinderOrderDragLayout();
  const image = binderOrderDrag.cardNode.querySelector("img");
  const ghost = document.createElement("div");
  ghost.className = "binder-order-drag-ghost";
  ghost.style.width = `${binderOrderDrag.width}px`;
  ghost.style.height = `${binderOrderDrag.height}px`;
  const ghostImage = document.createElement("img");
  ghostImage.alt = "";
  ghostImage.src = image?.currentSrc || image?.src || "";
  ghost.append(ghostImage);
  document.body.append(ghost);
  binderOrderDrag.ghost = ghost;
  binderOrderDrag.cardNode.classList.add("is-dragging");
  document.body.classList.add("is-reordering-binder");
  positionBinderOrderDragGhost();
  requestBinderOrderDragFrame();
}

function positionBinderOrderDragGhost() {
  if (!binderOrderDrag?.ghost) return;
  const x = binderOrderDrag.clientX - binderOrderDrag.offsetX;
  const y = binderOrderDrag.clientY - binderOrderDrag.offsetY;
  binderOrderDrag.ghost.style.transform = (
    `translate3d(${x}px, ${y}px, 0) rotate(1.25deg) scale(1.035)`
  );
}

function reorderBinderOrderAtPoint(clientX, clientY) {
  if (!binderOrderDrag?.started) return;
  const targetPosition = getBinderOrderPositionAtPoint(clientX, clientY);
  const currentPosition = binderOrderDraftIndexes.findIndex((index) => (
    CARDS[index]?.stableId === binderOrderDrag.stableId
  ));
  if (targetPosition < 0 || currentPosition < 0 || targetPosition === currentPosition) return;
  moveBinderOrderDraftItem(currentPosition, targetPosition, {
    activeStableId: binderOrderDrag.stableId,
    announce: false,
  });
}

function getBinderOrderPositionAtPoint(clientX, clientY) {
  const scrollerRect = els.binderOrderScroller.getBoundingClientRect();
  ensureBinderOrderDragLayout(scrollerRect);
  const layout = binderOrderDrag?.layout;
  if (!layout?.slots?.length) return -1;
  const horizontalAllowance = (binderOrderDrag?.width || 0) * 0.35;
  const verticalAllowance = binderOrderDrag?.height || 0;
  if (
    clientX < scrollerRect.left - horizontalAllowance
    || clientX > scrollerRect.right + horizontalAllowance
    || clientY < scrollerRect.top - verticalAllowance
    || clientY > scrollerRect.bottom + verticalAllowance
  ) return -1;

  const contentX = clientX - scrollerRect.left + els.binderOrderScroller.scrollLeft;
  const clampedClientY = clamp(clientY, scrollerRect.top, scrollerRect.bottom);
  const contentY = clampedClientY - scrollerRect.top + els.binderOrderScroller.scrollTop;
  let nearestPosition = -1;
  let nearestDistanceSquared = Number.POSITIVE_INFINITY;
  for (const slot of layout.slots) {
    if (!slot) continue;
    const deltaX = contentX - slot.centerX;
    const deltaY = contentY - slot.centerY;
    const distanceSquared = deltaX * deltaX + deltaY * deltaY;
    if (distanceSquared >= nearestDistanceSquared) continue;
    nearestDistanceSquared = distanceSquared;
    nearestPosition = slot.position;
  }

  const currentPosition = binderOrderDraftIndexes.findIndex((index) => (
    CARDS[index]?.stableId === binderOrderDrag?.stableId
  ));
  const currentSlot = layout.slots[currentPosition];
  if (nearestPosition !== currentPosition && currentSlot) {
    const currentDistance = Math.hypot(
      contentX - currentSlot.centerX,
      contentY - currentSlot.centerY,
    );
    const nearestDistance = Math.sqrt(nearestDistanceSquared);
    if (currentDistance - nearestDistance < BINDER_ORDER_TARGET_HYSTERESIS_PX) {
      return currentPosition;
    }
  }
  return nearestPosition;
}

function measureBinderOrderDragLayout(scrollerRect = els.binderOrderScroller.getBoundingClientRect()) {
  const scrollLeft = els.binderOrderScroller.scrollLeft;
  const scrollTop = els.binderOrderScroller.scrollTop;
  const slots = [];
  for (const button of binderOrderCardNodes.values()) {
    const position = Number(button.dataset.orderPosition);
    if (!Number.isInteger(position)) continue;
    const rect = button.getBoundingClientRect();
    slots[position] = {
      position,
      centerX: rect.left - scrollerRect.left + scrollLeft + rect.width / 2,
      centerY: rect.top - scrollerRect.top + scrollTop + rect.height / 2,
    };
  }
  return {
    viewportLeft: scrollerRect.left,
    viewportTop: scrollerRect.top,
    viewportWidth: scrollerRect.width,
    viewportHeight: scrollerRect.height,
    slots,
  };
}

function ensureBinderOrderDragLayout(scrollerRect) {
  if (!binderOrderDrag?.started) return;
  const layout = binderOrderDrag.layout;
  const changed = !layout
    || Math.abs(layout.viewportLeft - scrollerRect.left) > 0.5
    || Math.abs(layout.viewportTop - scrollerRect.top) > 0.5
    || Math.abs(layout.viewportWidth - scrollerRect.width) > 0.5
    || Math.abs(layout.viewportHeight - scrollerRect.height) > 0.5;
  if (!changed) return;
  stopBinderOrderCardAnimations();
  binderOrderDrag.layout = measureBinderOrderDragLayout(scrollerRect);
}

function captureBinderOrderFlipRects(fromPosition, toPosition, activeStableId) {
  const previousRects = new Map();
  if (prefersReducedBinderOrderMotion()) return previousRects;
  const scrollerRect = els.binderOrderScroller.getBoundingClientRect();
  const first = Math.min(fromPosition, toPosition);
  const last = Math.max(fromPosition, toPosition);
  for (let position = first; position <= last; position += 1) {
    const stableId = String(CARDS[binderOrderDraftIndexes[position]]?.stableId || "");
    if (!stableId || stableId === activeStableId || previousRects.has(stableId)) continue;
    const button = binderOrderCardNodes.get(stableId);
    if (!button) continue;
    const rect = button.getBoundingClientRect();
    if (
      rect.bottom >= scrollerRect.top - rect.height * 2
      && rect.top <= scrollerRect.bottom + rect.height * 2
    ) {
      previousRects.set(stableId, rect);
    }
    stopBinderOrderCardAnimation(button);
  }
  return previousRects;
}

function syncBinderOrderEditorCardPositions(fromPosition, toPosition) {
  const first = Math.min(fromPosition, toPosition);
  const last = Math.max(fromPosition, toPosition);
  const firstPage = Math.floor(first / BINDER_SIDE_SLOTS);
  const lastPage = Math.floor(last / BINDER_SIDE_SLOTS);
  const grids = els.binderOrderPages.querySelectorAll(".binder-order-page-grid");

  for (let pageIndex = firstPage; pageIndex <= lastPage; pageIndex += 1) {
    const grid = grids[pageIndex];
    if (!grid) continue;
    const start = pageIndex * BINDER_SIDE_SLOTS;
    const end = Math.min(start + BINDER_SIDE_SLOTS, binderOrderDraftIndexes.length);
    for (let position = start; position < end; position += 1) {
      const stableId = String(CARDS[binderOrderDraftIndexes[position]]?.stableId || "");
      const desiredNode = binderOrderCardNodes.get(stableId);
      if (!desiredNode) continue;
      const localPosition = position - start;
      const currentNode = grid.children[localPosition] || null;
      if (currentNode !== desiredNode) grid.insertBefore(desiredNode, currentNode);
    }
  }

  for (let position = first; position <= last; position += 1) {
    const cardIndex = binderOrderDraftIndexes[position];
    const stableId = String(CARDS[cardIndex]?.stableId || "");
    updateBinderOrderCardButton(binderOrderCardNodes.get(stableId), cardIndex, position);
  }
}

function animateBinderOrderCards(previousRects) {
  if (!previousRects.size || prefersReducedBinderOrderMotion()) return;
  for (const [stableId, previousRect] of previousRects) {
    const button = binderOrderCardNodes.get(stableId);
    if (!button || typeof button.animate !== "function") continue;
    const nextRect = button.getBoundingClientRect();
    const deltaX = previousRect.left - nextRect.left;
    const deltaY = previousRect.top - nextRect.top;
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) continue;
    const animation = button.animate(
      [
        { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
        { transform: "translate3d(0, 0, 0)" },
      ],
      {
        duration: BINDER_ORDER_FLIP_DURATION_MS,
        easing: "cubic-bezier(0.2, 0.82, 0.2, 1)",
      },
    );
    button.binderOrderFlipAnimation = animation;
    button.classList.add("is-shifting");
    animation.finished.catch(() => {}).finally(() => {
      if (button.binderOrderFlipAnimation !== animation) return;
      button.binderOrderFlipAnimation = null;
      button.classList.remove("is-shifting");
    });
  }
}

function stopBinderOrderCardAnimation(button) {
  if (!button) return;
  const animation = button.binderOrderFlipAnimation;
  button.binderOrderFlipAnimation = null;
  if (animation) animation.cancel();
  else button.getAnimations?.().forEach((activeAnimation) => activeAnimation.cancel());
  button.classList.remove("is-shifting");
}

function stopBinderOrderCardAnimations() {
  for (const button of binderOrderCardNodes.values()) {
    stopBinderOrderCardAnimation(button);
  }
}

function moveBinderOrderDraftItem(fromPosition, toPosition, options = {}) {
  if (
    !Number.isInteger(fromPosition)
    || !Number.isInteger(toPosition)
    || fromPosition === toPosition
    || fromPosition < 0
    || fromPosition >= binderOrderDraftIndexes.length
    || toPosition < 0
    || toPosition >= binderOrderDraftIndexes.length
  ) return false;
  const activeStableId = options.activeStableId
    || String(CARDS[binderOrderDraftIndexes[fromPosition]]?.stableId || "");
  const previousRects = captureBinderOrderFlipRects(
    fromPosition,
    toPosition,
    activeStableId,
  );
  const [cardIndex] = binderOrderDraftIndexes.splice(fromPosition, 1);
  binderOrderDraftIndexes.splice(toPosition, 0, cardIndex);
  syncBinderOrderEditorCardPositions(fromPosition, toPosition);
  animateBinderOrderCards(previousRects);
  refreshBinderOrderConfirmButton();
  if (options.announce !== false) announceBinderOrderMove(cardIndex, toPosition);
  else setBinderOrderStatus("Order changed. Confirm to save it for every viewer.");
  return true;
}

function announceBinderOrderMove(cardIndex, position) {
  const page = Math.floor(position / BINDER_SIDE_SLOTS) + 1;
  const slot = (position % BINDER_SIDE_SLOTS) + 1;
  setBinderOrderStatus(
    `${CARDS[cardIndex]?.title || "Card"} moved to page ${page}, slot ${slot}.`,
  );
}

function requestBinderOrderDragFrame() {
  if (binderOrderDragFrame || !binderOrderDrag?.started) return;
  binderOrderDragFrame = requestAnimationFrame(stepBinderOrderDragFrame);
}

function stepBinderOrderDragFrame(timestamp) {
  binderOrderDragFrame = 0;
  if (!binderOrderDrag?.started) return;
  const rect = els.binderOrderScroller.getBoundingClientRect();
  ensureBinderOrderDragLayout(rect);
  positionBinderOrderDragGhost();

  const previousTimestamp = binderOrderDrag.lastFrameTime || timestamp;
  const elapsedSeconds = clamp(
    timestamp - previousTimestamp,
    0,
    BINDER_ORDER_AUTO_SCROLL_MAX_FRAME_MS,
  ) / 1000;
  binderOrderDrag.lastFrameTime = timestamp;
  const velocity = getBinderOrderAutoScrollVelocity(rect);
  if (velocity && elapsedSeconds) {
    const maxScrollTop = Math.max(
      0,
      els.binderOrderScroller.scrollHeight - els.binderOrderScroller.clientHeight,
    );
    els.binderOrderScroller.scrollTop = clamp(
      els.binderOrderScroller.scrollTop + velocity * elapsedSeconds,
      0,
      maxScrollTop,
    );
  }
  reorderBinderOrderAtPoint(binderOrderDrag.clientX, binderOrderDrag.clientY);
  requestBinderOrderDragFrame();
}

function getBinderOrderAutoScrollVelocity(scrollerRect) {
  if (!binderOrderDrag?.started) return 0;
  const cardTop = binderOrderDrag.clientY - binderOrderDrag.offsetY;
  const cardBottom = cardTop + binderOrderDrag.height;
  const topStrength = clamp(
    (scrollerRect.top + BINDER_ORDER_AUTO_SCROLL_EDGE_PX - cardTop)
      / BINDER_ORDER_AUTO_SCROLL_EDGE_PX,
    0,
    1,
  );
  const bottomStrength = clamp(
    (cardBottom - (scrollerRect.bottom - BINDER_ORDER_AUTO_SCROLL_EDGE_PX))
      / BINDER_ORDER_AUTO_SCROLL_EDGE_PX,
    0,
    1,
  );
  if (!topStrength && !bottomStrength) return 0;
  const direction = bottomStrength > topStrength ? 1 : -1;
  const strength = Math.max(topStrength, bottomStrength);
  const easedStrength = strength * strength;
  const overshootStrength = direction < 0
    ? clamp(
      (scrollerRect.top - cardTop) / BINDER_ORDER_AUTO_SCROLL_OVERSHOOT_PX,
      0,
      1,
    )
    : clamp(
      (cardBottom - scrollerRect.bottom) / BINDER_ORDER_AUTO_SCROLL_OVERSHOOT_PX,
      0,
      1,
    );
  const easedOvershootStrength = overshootStrength * overshootStrength;
  return direction * (
    BINDER_ORDER_AUTO_SCROLL_MIN_PX_PER_SECOND
    + (BINDER_ORDER_AUTO_SCROLL_EDGE_PX_PER_SECOND
      - BINDER_ORDER_AUTO_SCROLL_MIN_PX_PER_SECOND) * easedStrength
    + (BINDER_ORDER_AUTO_SCROLL_MAX_PX_PER_SECOND
      - BINDER_ORDER_AUTO_SCROLL_EDGE_PX_PER_SECOND) * easedOvershootStrength
  );
}

function finishBinderOrderDrag(event) {
  if (!binderOrderDrag || event?.pointerId !== binderOrderDrag.pointerId) return;
  if (binderOrderDrag.started) {
    binderOrderDrag.clientX = event.clientX;
    binderOrderDrag.clientY = event.clientY;
    positionBinderOrderDragGhost();
    reorderBinderOrderAtPoint(event.clientX, event.clientY);
  }
  const draggedCardIndex = binderOrderDraftIndexes.find((index) => (
    CARDS[index]?.stableId === binderOrderDrag.stableId
  ));
  const finalPosition = binderOrderDraftIndexes.indexOf(draggedCardIndex);
  const didDrag = binderOrderDrag.started;
  cleanupBinderOrderDrag();
  if (!didDrag) return;
  binderOrderSuppressClickUntil = performance.now() + 320;
  if (Number.isInteger(draggedCardIndex) && finalPosition >= 0) {
    announceBinderOrderMove(draggedCardIndex, finalPosition);
  }
}

function cancelBinderOrderDrag(event) {
  if (!binderOrderDrag) return;
  if (event?.pointerId != null && event.pointerId !== binderOrderDrag.pointerId) return;
  const didDrag = binderOrderDrag.started;
  cleanupBinderOrderDrag();
  if (didDrag) binderOrderSuppressClickUntil = performance.now() + 320;
}

function cleanupBinderOrderDrag() {
  const pointerId = binderOrderDrag?.pointerId;
  if (binderOrderDragFrame) cancelAnimationFrame(binderOrderDragFrame);
  binderOrderDragFrame = 0;
  binderOrderDrag?.ghost?.remove();
  binderOrderDrag?.cardNode?.classList.remove("is-dragging");
  els.binderOrderPages?.querySelectorAll(".is-dragging")
    .forEach((node) => node.classList.remove("is-dragging"));
  document.body.classList.remove("is-reordering-binder");
  binderOrderDrag = null;
  try {
    if (pointerId != null && els.binderOrderEditor.hasPointerCapture(pointerId)) {
      els.binderOrderEditor.releasePointerCapture(pointerId);
    }
  } catch {
    // Pointer capture may already be released by pointerup or pointercancel.
  }
}

function handleBinderOrderCardClick(event) {
  if (performance.now() < binderOrderSuppressClickUntil) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  if (!binderTradeMarkingMode || binderOrderEditorLoading || binderOrderEditorSaving) return;
  const button = event.target.closest(".binder-order-card");
  if (!button || !els.binderOrderPages.contains(button)) return;
  event.preventDefault();
  toggleBinderTradeCard(button);
}

function handleBinderOrderCardKeydown(event) {
  if (binderOrderEditorLoading || binderOrderEditorSaving) return;
  if (event.target.closest(".binder-order-position-input")) return;
  const button = event.target.closest(".binder-order-card");
  if (!button || !els.binderOrderPages.contains(button)) return;
  const stableId = button.dataset.stableId || "";
  if (binderTradeMarkingMode) {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    toggleBinderTradeCard(button);
    return;
  }
  if (event.key === "F2") {
    event.preventDefault();
    beginBinderOrderPositionEdit(button);
    return;
  }
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    binderOrderKeyboardStableId = binderOrderKeyboardStableId === stableId ? "" : stableId;
    renderBinderOrderKeyboardSelection();
    setBinderOrderStatus(
      binderOrderKeyboardStableId
        ? "Card selected. Use arrow keys to move it, then press Space to release."
        : "Card released. Confirm to save any changes.",
    );
    return;
  }
  if (binderOrderKeyboardStableId !== stableId) return;

  const currentPosition = binderOrderDraftIndexes.findIndex((index) => (
    CARDS[index]?.stableId === stableId
  ));
  let targetPosition = currentPosition;
  if (event.key === "ArrowLeft") targetPosition -= 1;
  else if (event.key === "ArrowRight") targetPosition += 1;
  else if (event.key === "ArrowUp") targetPosition -= BINDER_COLUMNS;
  else if (event.key === "ArrowDown") targetPosition += BINDER_COLUMNS;
  else if (event.key === "PageUp") targetPosition -= BINDER_SIDE_SLOTS;
  else if (event.key === "PageDown") targetPosition += BINDER_SIDE_SLOTS;
  else return;

  event.preventDefault();
  targetPosition = clamp(targetPosition, 0, binderOrderDraftIndexes.length - 1);
  if (!moveBinderOrderDraftItem(currentPosition, targetPosition)) return;
  requestAnimationFrame(() => {
    const movedButton = findBinderOrderCardButton(stableId);
    movedButton?.focus({ preventScroll: true });
    movedButton?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

function renderBinderOrderKeyboardSelection() {
  for (const button of binderOrderCardNodes.values()) {
    if (binderTradeMarkingMode) {
      const marked = binderTradeDraftStableIds.has(button.dataset.stableId || "");
      button.classList.remove("is-keyboard-selected");
      button.classList.toggle("is-marked-for-trade", marked);
      button.setAttribute("aria-pressed", String(marked));
      continue;
    }
    const selected = button.dataset.stableId === binderOrderKeyboardStableId;
    button.classList.toggle("is-keyboard-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  }
}

function findBinderOrderCardButton(stableId) {
  return binderOrderCardNodes.get(stableId) || null;
}

function handleBinderOrderEditorKeydown(event) {
  if (!binderOrderEditorOpen) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopImmediatePropagation();
    if (binderStickerPickerOpen) {
      closeBinderStickerPicker();
      return;
    }
    if (!els.binderInsideLinkPopover.hidden) {
      hideBinderInsideLinkPopover();
      els.binderInsideTextInput.focus();
      return;
    }
    if (binderCustomizationMode === "cover") {
      setBinderCustomizationMode("cards");
      return;
    }
    if (binderOrderPositionEdit) {
      cancelBinderOrderPositionEdit({ restoreFocus: true });
      return;
    }
    if (binderOrderDrag) {
      cancelBinderOrderDrag();
      return;
    }
    if (binderTradeMarkingMode) {
      toggleBinderTradeMarkingMode();
      return;
    }
    if (binderOrderKeyboardStableId) {
      binderOrderKeyboardStableId = "";
      renderBinderOrderKeyboardSelection();
      setBinderOrderStatus("Card released. Confirm to save any changes.");
      return;
    }
    closeBinderOrderEditor();
    return;
  }
  if (event.key !== "Tab") return;
  const focusScope = binderStickerPickerOpen
    ? els.binderStickerPicker
    : els.binderOrderDialog;
  const focusable = [...focusScope.querySelectorAll(
    'button:not(:disabled):not([hidden]), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element.getClientRects().length > 0);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  } else if (!focusScope.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  }
}

async function confirmBinderOrder() {
  if (
    !binderOrderEditorOpen
    || binderOrderEditorLoading
    || binderOrderEditorSaving
    || !binderOrderOwnerDocument
    || !binderOrderHasChanges()
  ) return;
  const token = binderOrderEditorToken;
  const cardOrder = mergeBinderOrderWithUndetectedStableIds(
    getBinderOrderStableIds(),
    binderOrderOwnerDocument.cardOrder,
  );
  const tradeCardIds = [...binderTradeDraftStableIds];
  const cover = getBinderCoverPayload();
  binderOrderEditorSaving = true;
  els.binderOrderDialog.classList.add("is-saving");
  els.binderOrderDialog.setAttribute("aria-busy", "true");
  setBinderOrderStatus("Saving binder changes for every viewer…");
  refreshBinderOrderConfirmButton();

  try {
    const savedDocument = await saveBinderOrderDocument(cardOrder, tradeCardIds, cover);
    if (token !== binderOrderEditorToken || !binderOrderEditorOpen) return;
    binderOrderOwnerDocument = savedDocument;
    syncWalletAuthCsrfToken(savedDocument.csrfToken);
    binderOrderInitialStableIds = cardOrder.slice();
    binderTradeDraftStableIds = normalizeBinderStableIdSet(savedDocument.tradeCardIds);
    binderTradeInitialStableIds = new Set(binderTradeDraftStableIds);
    syncGlobalTradeMarks(walletTradeCardStableIds, binderTradeDraftStableIds);
    walletTradeCardStableIds = new Set(binderTradeDraftStableIds);
    binderCoverDraft = normalizeBinderCoverSettings(savedDocument.cover);
    binderCoverInitialJson = serializeBinderCoverSettings(binderCoverDraft);
    resetBinderCoverUndoHistory();
    walletRouteProfile = { ...walletRouteProfile, ...savedDocument };

    const currentIndexes = walletFilterCardIndexes.slice();
    walletFilterCardIndexes = orderWalletCardIndexes(
      currentIndexes,
      savedDocument.cardOrder,
    );
    walletFilterCardIndexSet = new Set(walletFilterCardIndexes);
    refreshWalletBinderCoverRendering();
    renderGallery();
    binderOrderEditorSaving = false;
    els.binderOrderDialog.classList.remove("is-saving");
    els.binderOrderDialog.setAttribute("aria-busy", "false");
    setBinderOrderStatus("Binder changes saved.");
    refreshBinderOrderConfirmButton();
    closeBinderOrderEditor();
  } catch (error) {
    if (token !== binderOrderEditorToken || !binderOrderEditorOpen) return;
    if (error?.code === "authentication_required") {
      invalidateWalletAuthSession("Wallet login expired. Reconnect to edit your binder.");
      return;
    }
    binderOrderEditorSaving = false;
    els.binderOrderDialog.classList.remove("is-saving");
    els.binderOrderDialog.setAttribute("aria-busy", "false");
    setBinderOrderStatus(getBinderOrderErrorMessage(error, "save"), { error: true });
    refreshBinderOrderConfirmButton();
  }
}

async function saveBinderOrderDocument(cardOrder, tradeCardIds, cover) {
  let ownerDocument = binderOrderOwnerDocument;
  try {
    return await updateOwnerWalletBinder(
      WALLET_AUTH_API_BASE_URL,
      { ...ownerDocument, cardOrder, tradeCardIds, cover },
      ownerDocument.csrfToken || walletAuthSession?.csrfToken || "",
    );
  } catch (error) {
    if (error?.code === "revision_conflict") throw error;
    if (error?.code !== "csrf_invalid") throw error;
  }

  ownerDocument = await getOwnerWalletBinder(WALLET_AUTH_API_BASE_URL);
  if (
    ownerDocument?.walletAddress !== WALLET_ROUTE_ADDRESS
    || !isCurrentWalletBinderOwner()
  ) {
    throw new Error("This wallet session no longer owns the binder being viewed.");
  }
  binderOrderOwnerDocument = ownerDocument;
  syncWalletAuthCsrfToken(ownerDocument.csrfToken);
  return updateOwnerWalletBinder(
    WALLET_AUTH_API_BASE_URL,
    { ...ownerDocument, cardOrder, tradeCardIds, cover },
    ownerDocument.csrfToken || walletAuthSession?.csrfToken || "",
  );
}

function refreshWalletBinderCoverRendering() {
  if (!WALLET_ROUTE_ADDRESS) return;
  binderWalletCoverArtworkToken += 1;
  if (binderWalletCoverArtworkTexture) {
    binderWalletCoverArtworkTexture.dispose();
    binderWalletCoverArtworkTexture = null;
  }
  if (binderWalletBackCoverArtworkTexture) {
    binderWalletBackCoverArtworkTexture.dispose();
    binderWalletBackCoverArtworkTexture = null;
  }
  binderWalletCoverArtworkPromise = null;
  binderWalletCoverArtworkSource = "";
  binderWalletBackCoverArtworkPromise = null;
  binderWalletBackCoverArtworkSource = "";
  if (binderIntroNoteTexture) {
    binderIntroNoteTexture.dispose();
    binderIntroNoteTexture = null;
  }
  binderIndexesKey = "";
}

function syncWalletAuthCsrfToken(csrfToken) {
  if (!csrfToken || !walletAuthSession) return;
  walletAuthSession = { ...walletAuthSession, csrfToken };
}

function mergeBinderOrderWithUndetectedStableIds(draftOrder, previousOrder) {
  const draft = [...new Set((draftOrder || []).map((value) => String(value || "").trim()).filter(Boolean))];
  const draftSet = new Set(draft);
  const previous = [...new Set(
    (previousOrder || [])
      .map((value) => String(value || "").trim())
      .filter((stableId) => stableId && CARD_STABLE_ID_TO_INDEX.has(stableId)),
  )];
  const merged = [];
  let draftPosition = 0;
  for (const stableId of previous) {
    if (draftSet.has(stableId)) {
      const replacement = draft[draftPosition++];
      if (replacement) merged.push(replacement);
    } else {
      merged.push(stableId);
    }
  }
  while (draftPosition < draft.length) merged.push(draft[draftPosition++]);
  return merged;
}

function invalidateWalletAuthSession(message = WALLET_CONNECT_PROMPT) {
  walletAccountUnsubscribe?.();
  walletAccountUnsubscribe = null;
  walletAuthSession = null;
  walletAuthWallet = null;
  walletAuthAccountAddress = "";
  walletProviderListOpen = false;
  walletConnectMessage = message;
  closeBinderOrderEditor({ force: true, restoreFocus: false });
  updateWalletAuthUi();
}

function getBinderOrderErrorMessage(error, action) {
  if (error?.code === "authentication_required") {
    return "Your wallet login expired. Reconnect, then try again.";
  }
  if (error?.code === "revision_conflict") {
    return "This binder changed in another session. Close and reopen the editor before saving.";
  }
  if (["api_unavailable", "api_timeout"].includes(error?.code)) {
    return "The binder service is temporarily unavailable. Your changes are still here.";
  }
  const message = String(error?.message || "").trim();
  if (message) return message;
  return action === "load"
    ? "Unable to load your saved order. Close this menu and try again."
    : "The order could not be saved. Your changes are still here.";
}

function prefersReducedBinderOrderMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function renderWalletProviderList() {
  if (!els.walletProviderList) return;
  els.walletProviderList.replaceChildren();
  const visible = walletProviderListOpen
    && !walletAuthSession?.authenticated
    && compatibleSolanaWallets.length > 1;
  els.walletProviderList.hidden = !visible;
  if (!visible) return;

  compatibleSolanaWallets.forEach((wallet, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "wallet-provider-button";
    button.dataset.walletIndex = String(index);
    const icon = document.createElement("img");
    icon.className = "wallet-provider-icon";
    icon.alt = "";
    icon.setAttribute("aria-hidden", "true");
    if (/^data:image\//i.test(String(wallet.icon || ""))) icon.src = wallet.icon;
    else icon.hidden = true;
    const label = document.createElement("span");
    label.textContent = String(wallet.name || "Solana wallet");
    button.append(icon, label);
    els.walletProviderList.append(button);
  });
}

function getWalletConnectErrorMessage(error) {
  if (error?.code === "api_unavailable") {
    return "Wallet login is temporarily unavailable. Address search still works.";
  }
  if (["connect_rejected", "signature_rejected"].includes(error?.code)) {
    return "Wallet login cancelled. No transaction was submitted.";
  }
  return String(error?.message || "Wallet login failed. Try again.");
}

function initializeLiveDataRefresh() {
  refreshLiveCardStatuses().catch((error) => {
    console.warn("Live card statuses could not be refreshed", error);
  });
  refreshGlobalTradeStatuses().catch((error) => {
    console.warn("Global trade statuses could not be refreshed", error);
  });
  scheduleLiveCardStatusRefresh();
  scheduleGlobalTradeStatusRefresh();
}

function scheduleLiveCardStatusRefresh() {
  if (liveCardStatusRefreshTimer) window.clearTimeout(liveCardStatusRefreshTimer);
  const elapsed = liveCardStatusLastFetchedAt
    ? Date.now() - liveCardStatusLastFetchedAt
    : 0;
  const delay = Math.max(60_000, LIVE_CARD_STATUS_REFRESH_MS - elapsed);
  liveCardStatusRefreshTimer = window.setTimeout(() => {
    liveCardStatusRefreshTimer = 0;
    refreshLiveCardStatuses({ force: true }).catch((error) => {
      console.warn("Live card statuses could not be refreshed", error);
    });
  }, delay);
}

async function refreshLiveCardStatuses(options = {}) {
  const force = Boolean(options.force);
  if (
    !force
    && liveCardStatusLastFetchedAt
    && Date.now() - liveCardStatusLastFetchedAt < LIVE_CARD_STATUS_REFRESH_MS
  ) {
    return false;
  }
  if (liveCardStatusRefreshPromise) return liveCardStatusRefreshPromise;

  liveCardStatusRefreshPromise = (async () => {
    const response = await fetchWithTimeout(`${WALLET_AUTH_API_BASE_URL}/card-statuses`, {
      headers: { accept: "application/json" },
      cache: "no-cache",
      timeoutMs: LIVE_DATA_REQUEST_TIMEOUT_MS,
    });
    if (!response.ok) throw new Error(`Live card status fetch failed: ${response.status}`);
    const snapshot = await response.json();
    if (!snapshot?.collections || typeof snapshot.collections !== "object") {
      throw new Error("Live card status response is invalid");
    }
    liveCardStatusSnapshot = snapshot;
    liveCardStatusLastFetchedAt = Date.now();
    let changed = false;
    for (const collectionId of Object.keys(snapshot.collections)) {
      changed = applyLiveCardStatusCollection(collectionId) || changed;
    }
    if (changed && options.render !== false) {
      if (traitsOpen || traitInfoOpenRequested) renderTraitPanel();
      if (galleryOpen) renderGallery();
    }
    return changed;
  })().finally(() => {
    liveCardStatusRefreshPromise = null;
    scheduleLiveCardStatusRefresh();
  });
  return liveCardStatusRefreshPromise;
}

function scheduleGlobalTradeStatusRefresh() {
  if (globalTradeStatusRefreshTimer) window.clearTimeout(globalTradeStatusRefreshTimer);
  const elapsed = globalTradeStatusLastFetchedAt
    ? Date.now() - globalTradeStatusLastFetchedAt
    : 0;
  const delay = Math.max(15_000, GLOBAL_TRADE_STATUS_REFRESH_MS - elapsed);
  globalTradeStatusRefreshTimer = window.setTimeout(() => {
    globalTradeStatusRefreshTimer = 0;
    refreshGlobalTradeStatuses({ force: true }).catch((error) => {
      console.warn("Global trade statuses could not be refreshed", error);
    });
  }, delay);
}

async function refreshGlobalTradeStatuses(options = {}) {
  if (
    !options.force
    && globalTradeStatusLastFetchedAt
    && Date.now() - globalTradeStatusLastFetchedAt < GLOBAL_TRADE_STATUS_REFRESH_MS
  ) return false;
  if (globalTradeStatusRefreshPromise) return globalTradeStatusRefreshPromise;

  globalTradeStatusRefreshPromise = (async () => {
    const payload = await getGlobalTradeStatuses(WALLET_AUTH_API_BASE_URL);
    if (!Array.isArray(payload?.tradeCardIds)) {
      throw new Error("Global trade status response is invalid");
    }
    const nextTradeIds = normalizeBinderStableIdSet(payload.tradeCardIds);
    const changed = !sameStringSet(nextTradeIds, globalTradeCardStableIds);
    globalTradeCardStableIds = nextTradeIds;
    globalTradeStatusLastFetchedAt = Date.now();
    if (changed && options.render !== false && galleryOpen) renderGallery();
    return changed;
  })().finally(() => {
    globalTradeStatusRefreshPromise = null;
    scheduleGlobalTradeStatusRefresh();
  });
  return globalTradeStatusRefreshPromise;
}

function applyLiveCardStatusCollection(collectionId) {
  const collection = COLLECTION_CONFIGS[collectionId];
  const snapshot = liveCardStatusSnapshot?.collections?.[collectionId];
  if (!collection?.cardsLoaded || !Array.isArray(snapshot?.cards)) return false;

  let changed = false;
  for (const record of snapshot.cards) {
    const number = Number(record?.[0]);
    const status = String(record?.[1] || "").trim();
    const mint = String(record?.[2] || "").trim();
    const globalIndex = CARD_NUMBER_TO_INDEX.get(`${collectionId}:${number}`);
    const card = CARDS[globalIndex];
    if (!card || !["in pack", "pulled", "redeemed"].includes(status)) continue;

    const previousMint = String(card.mint || "").trim();
    if (card.status !== status || previousMint !== mint) changed = true;
    if (previousMint && previousMint !== mint && CARD_NFT_MINT_TO_INDEX.get(previousMint) === globalIndex) {
      CARD_NFT_MINT_TO_INDEX.delete(previousMint);
    }
    card.status = status;
    card.mint = mint;
    if (mint) CARD_NFT_MINT_TO_INDEX.set(mint, globalIndex);
  }

  if (changed) {
    collection.traitOccurrenceCountCache = null;
    collection.traitSearchGroupsCache = null;
  }
  return changed;
}

function refreshLiveDataAfterFocus() {
  if (document.hidden) return;
  if (Date.now() - liveCardStatusLastFetchedAt >= LIVE_CARD_STATUS_REFRESH_MS) {
    refreshLiveCardStatuses({ force: true }).catch(() => {});
  }
  if (Date.now() - globalTradeStatusLastFetchedAt >= GLOBAL_TRADE_STATUS_REFRESH_MS) {
    refreshGlobalTradeStatuses({ force: true }).catch(() => {});
  }
  if (
    WALLET_ROUTE_ADDRESS
    && Date.now() - walletHoldingsLastFetchedAt >= WALLET_HOLDINGS_FOCUS_REFRESH_MS
  ) {
    refreshWalletBinderHoldings({ force: true }).catch(() => {});
  }
}

function primeWalletBinderRoute(address) {
  walletRouteLoading = true;
  walletRouteLoadFailed = false;
  walletRouteLoadErrorMessage = "";
  walletFilterAddress = address;
  walletFilterCardIndexes = [];
  walletFilterCardIndexSet = new Set();
  walletMatchedMintByCardIndex = new Map();
  walletTradeCardStableIds = new Set();
  walletSwagPackAssets = [];
  walletSwagPackAssetsFetchedAt = 0;
  favoritesOnly = false;
  activeCollectionFilter = "";
  activeTraitFilter = null;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  traitSortCategory = "all";
  isBinderMode = true;
  document.title = `${shortenSolAddress(address)} — cards.art`;
  ensureWalletCanonicalLink(address);
  populateTraitSortOptions();
  updateBinderOrderEditorAvailability();
}

async function loadWalletBinderRoute(address) {
  try {
    const [profile] = await Promise.all([
      getWalletBinderProfile(address),
      ensureAllCollectionCards(),
      refreshLiveCardStatuses({ render: false }).catch(() => null),
    ]);
    walletRouteProfile = profile;
    const result = await findWalletCardIndexes(address);
    walletHoldingsLastFetchedAt = Date.now();
    walletRouteLoading = false;
    walletRouteLoadFailed = false;
    walletRouteLoadErrorMessage = "";
    applyWalletCardFilter(address, result, {
      cardOrder: profile?.cardOrder,
      tradeCardIds: profile?.tradeCardIds,
      startAtFrontCover: WALLET_BINDER_DIRECTORY_ARRIVAL,
    });
    if (WALLET_BINDER_DIRECTORY_ARRIVAL) {
      animateWalletBinderDirectoryArrival().catch(() => {
        dismissWalletBinderDirectoryArrivalBridge();
      });
    }
    if (readGalleryUrlState().hasParameters) {
      await handleGalleryUrlNavigation();
    }
  } catch (error) {
    dismissWalletBinderDirectoryArrivalBridge();
    walletRouteLoading = false;
    walletRouteLoadFailed = true;
    walletRouteLoadErrorMessage = error?.code === "binder_not_found"
      ? "This wallet binder is private."
      : "Wallet binder could not load. Try again.";
    updateBinderOrderEditorAvailability();
    renderGallery();
    throw error;
  } finally {
    scheduleWalletHoldingsRefresh();
  }
}

function scheduleWalletHoldingsRefresh() {
  if (walletHoldingsRefreshTimer) window.clearTimeout(walletHoldingsRefreshTimer);
  if (!WALLET_ROUTE_ADDRESS) return;
  const elapsed = walletHoldingsLastFetchedAt
    ? Date.now() - walletHoldingsLastFetchedAt
    : 0;
  const delay = Math.max(15_000, WALLET_HOLDINGS_AUTO_REFRESH_MS - elapsed);
  walletHoldingsRefreshTimer = window.setTimeout(() => {
    walletHoldingsRefreshTimer = 0;
    refreshWalletBinderHoldings({ force: true }).catch(() => {});
  }, delay);
}

async function refreshWalletBinderHoldings(options = {}) {
  if (
    !WALLET_ROUTE_ADDRESS
    || document.hidden
    || binderOrderEditorOpen
    || walletRouteLoading
  ) {
    scheduleWalletHoldingsRefresh();
    return false;
  }
  if (
    !options.force
    && walletHoldingsLastFetchedAt
    && Date.now() - walletHoldingsLastFetchedAt < WALLET_HOLDINGS_AUTO_REFRESH_MS
  ) {
    scheduleWalletHoldingsRefresh();
    return false;
  }
  if (walletHoldingsRefreshPromise) return walletHoldingsRefreshPromise;

  walletHoldingsRefreshPromise = (async () => {
    await ensureAllCollectionCards();
    const statusesChanged = await refreshLiveCardStatuses({ render: false }).catch(() => false);
    const [profile, result] = await Promise.all([
      getWalletBinderProfile(WALLET_ROUTE_ADDRESS),
      findWalletCardIndexes(WALLET_ROUTE_ADDRESS),
    ]);
    const nextIndexes = orderWalletCardIndexes(result.indexes, profile?.cardOrder);
    const holdingsChanged = !sameNumberArray(nextIndexes, walletFilterCardIndexes || []);
    const tradeIds = normalizeBinderStableIdSet(profile?.tradeCardIds);
    const tradeMarksChanged = !sameStringSet(tradeIds, walletTradeCardStableIds);
    const coverChanged = JSON.stringify(profile?.cover || {})
      !== JSON.stringify(walletRouteProfile?.cover || {});

    walletRouteProfile = profile;
    walletFilterAddress = WALLET_ROUTE_ADDRESS;
    walletFilterCardIndexes = nextIndexes;
    walletFilterCardIndexSet = new Set(nextIndexes);
    walletMatchedMintByCardIndex = new Map(result.matchedMints);
    syncGlobalTradeMarks(walletTradeCardStableIds, tradeIds);
    walletTradeCardStableIds = tradeIds;
    walletHoldingsLastFetchedAt = Date.now();
    walletRouteLoading = false;
    walletRouteLoadFailed = false;
    walletRouteLoadErrorMessage = "";

    if (coverChanged) refreshWalletBinderCoverRendering();
    if (holdingsChanged || tradeMarksChanged || statusesChanged || coverChanged) renderGallery();
    updateWalletSearchState();
    updateBinderOrderEditorAvailability();
    return holdingsChanged || tradeMarksChanged || statusesChanged || coverChanged;
  })().finally(() => {
    walletHoldingsRefreshPromise = null;
    scheduleWalletHoldingsRefresh();
  });
  return walletHoldingsRefreshPromise;
}

function sameNumberArray(left, right) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function sameStringSet(left, right) {
  return left.size === right.size && [...left].every((value) => right.has(value));
}

function syncGlobalTradeMarks(previousIds, nextIds) {
  for (const stableId of previousIds || []) globalTradeCardStableIds.delete(stableId);
  for (const stableId of nextIds || []) globalTradeCardStableIds.add(stableId);
}

async function getWalletBinderProfile(address) {
  if (WALLET_BINDER_DIRECTORY_ARRIVAL) {
    return getPublicWalletBinder(WALLET_PUBLIC_API_BASE_URL, address, {
      credentials: "omit",
    });
  }
  const profile = await getPublicWalletBinder(WALLET_AUTH_API_BASE_URL, address);
  if (profile?.exists || WALLET_AUTH_API_BASE_URL === WALLET_PUBLIC_API_BASE_URL) {
    return profile;
  }
  return getPublicWalletBinder(WALLET_PUBLIC_API_BASE_URL, address, {
    credentials: "omit",
  });
}

function orderWalletCardIndexes(indexes, cardOrder = []) {
  const owned = new Set((indexes || []).filter((index) => Number.isInteger(index) && CARDS[index]));
  const ordered = [];
  for (const stableId of Array.isArray(cardOrder) ? cardOrder : []) {
    const index = CARD_STABLE_ID_TO_INDEX.get(String(stableId || "").trim());
    if (!owned.delete(index)) continue;
    ordered.push(index);
  }
  return ordered.concat([...owned].sort(compareWalletCardIndexes));
}

function compareWalletCardIndexes(leftIndex, rightIndex) {
  const left = CARDS[leftIndex];
  const right = CARDS[rightIndex];
  const collectionOrder = Object.keys(COLLECTION_CONFIGS);
  return collectionOrder.indexOf(left?.collection) - collectionOrder.indexOf(right?.collection)
    || compareCardIndexes(leftIndex, rightIndex)
    || Number(left?.collectionIndex || 0) - Number(right?.collectionIndex || 0);
}

function navigateToWalletBinder(address) {
  const destination = new URL(`/${address}`, window.location.origin);
  window.location.assign(destination.href);
}

function installWalletBinderDirectoryArrivalBridge() {
  const arrival = WALLET_BINDER_DIRECTORY_ARRIVAL;
  if (!arrival || (!arrival.previewDataUrl && !arrival.baseColor)) {
    clearWalletBinderDirectoryArrivalBootstrap();
    return;
  }
  const target = getWalletBinderDirectoryTransitionTarget(5.234 / 7.286);
  const layer = document.createElement("div");
  layer.className = "wallet-binder-directory-arrival-layer";
  layer.classList.toggle("is-light", Boolean(arrival.light));
  layer.setAttribute("aria-hidden", "true");
  const cover = document.createElement("div");
  cover.className = "wallet-binder-directory-arrival-cover";
  Object.assign(cover.style, {
    left: `${target.left}px`,
    top: `${target.top}px`,
    width: `${target.width}px`,
    height: `${target.height}px`,
    backgroundColor: /^#[0-9a-f]{6}$/i.test(arrival.baseColor || "")
      ? arrival.baseColor
      : BINDER_COVER_DEFAULT_COLOR_HEX,
  });
  if (arrival.previewDataUrl) {
    const image = document.createElement("img");
    image.src = arrival.previewDataUrl;
    image.alt = "";
    cover.append(image);
  }
  els.binderCanvas.style.opacity = "0";
  document.body.append(layer, cover);
  walletBinderDirectoryArrivalBridge = { layer, cover };
  clearWalletBinderDirectoryArrivalBootstrap();
}

function clearWalletBinderDirectoryArrivalBootstrap() {
  const root = document.documentElement;
  root.classList.remove(
    "wallet-binder-arrival-bootstrap",
    "wallet-binder-arrival-bootstrap-light",
  );
  root.style.removeProperty("--wallet-binder-arrival-base-color");
  root.style.removeProperty("--wallet-binder-arrival-preview");
}

async function animateWalletBinderDirectoryArrival() {
  const bridge = walletBinderDirectoryArrivalBridge;
  const coverTexturePromise = binderWalletCoverArtworkPromise;
  if (coverTexturePromise) {
    await Promise.race([
      coverTexturePromise.catch(() => null),
      delay(2200),
    ]);
  }
  await nextAnimationFrame();
  await nextAnimationFrame();
  if (
    typeof els.binderCanvas?.animate !== "function"
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    dismissWalletBinderDirectoryArrivalBridge();
    return;
  }
  els.binderCanvas.style.opacity = "1";
  const timing = {
    duration: 380,
    easing: "cubic-bezier(0.2, 0.82, 0.2, 1)",
    fill: "forwards",
  };
  const binderAnimation = els.binderCanvas.animate(
    [
      { opacity: 0, transform: "scale(0.985)" },
      { opacity: 1, transform: "scale(1)" },
    ],
    timing,
  );
  if (!bridge) {
    await binderAnimation.finished.catch(() => {});
    return;
  }
  const layerAnimation = bridge.layer.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    timing,
  );
  const coverAnimation = bridge.cover.animate(
    [
      { opacity: 1, transform: "scale(1) rotate(-0.35deg)" },
      { opacity: 0, transform: "scale(1.025) rotate(0deg)" },
    ],
    timing,
  );
  await Promise.all([
    binderAnimation.finished.catch(() => {}),
    layerAnimation.finished.catch(() => {}),
    coverAnimation.finished.catch(() => {}),
  ]);
  dismissWalletBinderDirectoryArrivalBridge();
}

function dismissWalletBinderDirectoryArrivalBridge() {
  walletBinderDirectoryArrivalBridge?.layer.remove();
  walletBinderDirectoryArrivalBridge?.cover.remove();
  walletBinderDirectoryArrivalBridge = null;
  clearWalletBinderDirectoryArrivalBootstrap();
  if (els.binderCanvas) els.binderCanvas.style.opacity = "";
}

function ensureWalletCanonicalLink(address) {
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.append(canonical);
  }
  canonical.href = new URL(`/${address}`, window.location.origin).href;
}

function resetWalletCardFilter() {
  walletFilterCardIndexes = null;
  walletFilterCardIndexSet = null;
  walletFilterAddress = "";
  walletMatchedMintByCardIndex = new Map();
  walletTradeCardStableIds = new Set();
  walletSwagPackAssets = [];
  walletSwagPackAssetsFetchedAt = 0;
  updateWalletSearchState();
}

async function findWalletCardIndexes(address) {
  try {
    const matches = await fetchLiveWalletCardMatches(address);
    const indexes = new Set();
    const matchedMints = new Map();
    addWalletCardMatches(indexes, matchedMints, matches);
    return {
      indexes: [...indexes].sort(compareCardIndexes),
      matchedMints,
    };
  } catch {
    // The direct sources below preserve wallet browsing if the API Worker is unavailable.
  }

  const indexes = new Set();
  const matchedMints = new Map();
  const [
    magicEdenResult,
    dasResult,
    tensorCoreResult,
    tokenAccountResult,
    cardNft2Result,
  ] = await Promise.all([
    settleWalletMatchSource(fetchMagicEdenWalletCardMatches(address)),
    settleWalletMatchSource(fetchWalletDasCardMatches(address)),
    settleWalletMatchSource(fetchTensorMplCoreWalletCardMatches(address)),
    settleWalletMatchSource(fetchWalletTokenAccountCardMatches(address)),
    settleWalletMatchSource(fetchCardNft2WalletCardMatches(address)),
  ]);
  const liveResults = [
    magicEdenResult,
    dasResult,
    tensorCoreResult,
    tokenAccountResult,
    cardNft2Result,
  ];
  for (const result of liveResults) {
    addWalletCardMatches(indexes, matchedMints, result.matches);
  }
  const liveCardNft1OwnershipAvailable = magicEdenResult.ok
    || dasResult.ok
    || tokenAccountResult.ok;
  if (!liveCardNft1OwnershipAvailable) {
    for (const index of await getSnapshotWalletCardIndexes(address)) {
      indexes.add(index);
      const mint = String(CARDS[index]?.mint || "").trim();
      if (mint) matchedMints.set(index, mint);
    }
  }
  if (!liveResults.some((result) => result.ok) && !indexes.size) {
    throw new Error("All live wallet sources failed");
  }
  return {
    indexes: [...indexes].sort(compareCardIndexes),
    matchedMints,
  };
}

async function fetchLiveWalletCardMatches(address) {
  const payload = await fetchLiveWalletHoldingsPayload(address);
  walletSwagPackAssets = normalizeWalletSwagPackAssets(payload.swagPackAssets);
  walletSwagPackAssetsFetchedAt = Date.now();
  return [
    ...getCardMatchesForMints(payload.mints),
    ...getCardMatchesForReferences(payload.cardRefs),
  ];
}

async function fetchLiveWalletHoldingsPayload(address, apiBaseUrl = WALLET_AUTH_API_BASE_URL) {
  const url = `${apiBaseUrl}/wallets/${encodeURIComponent(address)}/holdings`;
  const response = await fetchWithTimeout(url, {
    headers: { accept: "application/json" },
    cache: "no-store",
    timeoutMs: LIVE_DATA_REQUEST_TIMEOUT_MS,
  });
  if (!response.ok) throw new Error(`Live wallet holdings failed: ${response.status}`);
  const payload = await response.json();
  if (!Array.isArray(payload?.mints)) throw new Error("Live wallet holdings are invalid");
  return payload;
}

async function fetchWalletSwagPackAssets(address, options = {}) {
  if (
    !options.force
    && walletSwagPackAssetsFetchedAt
    && Date.now() - walletSwagPackAssetsFetchedAt < WALLET_HOLDINGS_FOCUS_REFRESH_MS
  ) return walletSwagPackAssets.slice();
  try {
    const payload = await fetchLiveWalletHoldingsPayload(address);
    return normalizeWalletSwagPackAssets(payload.swagPackAssets);
  } catch {
    return fetchWalletDasSwagPackAssets(address);
  }
}

function normalizeWalletSwagPackAssets(assets) {
  const byImage = new Map();
  for (const candidate of Array.isArray(assets) ? assets : []) {
    const mint = String(candidate?.mint || "").trim();
    const sourceImageUrl = normalizeBinderStickerImageUrl(candidate?.imageUrl);
    const imageUrl = getTransparentSwagPackStickerImageUrl(sourceImageUrl) || sourceImageUrl;
    if (!isPossibleSolanaAddress(mint) || !imageUrl || byImage.has(imageUrl)) continue;
    byImage.set(imageUrl, {
      mint,
      name: String(candidate?.name || "Swag Pack sticker").trim().slice(0, 120)
        || "Swag Pack sticker",
      imageUrl,
    });
  }
  return [...byImage.values()].sort((left, right) => (
    left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: "base" })
      || left.mint.localeCompare(right.mint)
  ));
}

async function fetchWalletDasSwagPackAssets(address) {
  const assets = [];
  const seenAssetIds = new Set();
  let page = 1;
  let fetched = 0;
  while (fetched < DAS_WALLET_MAX_ASSETS) {
    const result = await solanaDasRpc("getAssetsByOwner", {
      ownerAddress: address,
      page,
      limit: DAS_WALLET_PAGE_LIMIT,
      displayOptions: {
        showFungible: false,
        showNativeBalance: false,
      },
    });
    const items = Array.isArray(result?.items) ? result.items : [];
    let newAssetCount = 0;
    for (const asset of items) {
      const mint = String(asset?.id || "").trim();
      if (mint && seenAssetIds.has(mint)) continue;
      if (mint) {
        seenAssetIds.add(mint);
        newAssetCount += 1;
      }
      const record = getSwagPackAssetForDas(asset);
      if (record) assets.push(record);
    }
    fetched += items.length;
    if (
      items.length < DAS_WALLET_PAGE_LIMIT
      || (items.length > 0 && newAssetCount === 0)
    ) break;
    page += 1;
  }
  return normalizeWalletSwagPackAssets(assets);
}

function getSwagPackAssetForDas(asset) {
  const belongsToSwagPack = (asset?.grouping || []).some((group) => (
    String(group?.group_key || "").trim() === "collection"
    && String(group?.group_value || "").trim() === SWAG_PACK_COLLECTION_MINT
  ));
  if (!belongsToSwagPack) return null;
  const mint = String(asset?.id || "").trim();
  const metadata = asset?.content?.metadata || {};
  const imageUrl = normalizeBinderStickerImageUrl(
    asset?.content?.links?.image
      || (asset?.content?.files || []).find((file) => (
        String(file?.mime || "").startsWith("image/")
      ))?.uri,
  );
  if (!isPossibleSolanaAddress(mint) || !imageUrl) return null;
  return {
    mint,
    name: String(metadata.json_name || metadata.name || "Swag Pack sticker").trim().slice(0, 120),
    imageUrl,
  };
}

function addWalletCardMatches(indexes, matchedMints, matches) {
  for (const match of matches || []) {
    if (!Number.isInteger(match?.index)) continue;
    indexes.add(match.index);
    if (!matchedMints.has(match.index) && match.mint) {
      matchedMints.set(match.index, match.mint);
    }
  }
}

async function settleWalletMatchSource(promise) {
  try {
    return { ok: true, matches: await promise || [] };
  } catch {
    return { ok: false, matches: [] };
  }
}

async function getSnapshotWalletCardIndexes(address) {
  if (!cardNftOwnerToIndexes) {
    if (!cardNftOwnerIndexPromise) {
      cardNftOwnerIndexPromise = Promise.all([
        import("./cardnft-owners.js?v=cardnft-3"),
        ensureCollectionCards("cardnft1"),
      ]).then(([module]) => {
        cardNftOwnerToIndexes = buildCardNftOwnerIndex(module.CARD_NFT_OWNER_SNAPSHOT);
        return cardNftOwnerToIndexes;
      }).catch((error) => {
        cardNftOwnerIndexPromise = null;
        throw error;
      });
    }
    await cardNftOwnerIndexPromise;
  }
  return cardNftOwnerToIndexes.get(String(address || "").trim()) || [];
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
        ? COLLECTION_CONFIGS.cardnft1?.globalIndexes?.[card]
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

async function fetchMagicEdenWalletCardMatches(address) {
  const matches = [];
  let successfulCollectionRequests = 0;
  for (const symbol of CARD_NFT_COLLECTION_SYMBOLS) {
    try {
      let offset = 0;
      let collectionResponded = false;

      while (offset < MAGIC_EDEN_WALLET_MAX_TOKENS) {
        const tokens = await magicEdenApi(
          `/wallets/${encodeURIComponent(address)}/tokens?collection_symbol=${encodeURIComponent(symbol)}&offset=${offset}&limit=${MAGIC_EDEN_WALLET_PAGE_LIMIT}&listStatus=both`,
        );
        if (!collectionResponded) {
          collectionResponded = true;
          successfulCollectionRequests += 1;
        }
        const page = Array.isArray(tokens) ? tokens : tokens?.results || [];

        for (const token of page) {
          const mint = String(token?.mintAddress || "").trim();
          const index = CARD_NFT_MINT_TO_INDEX.get(mint);
          if (Number.isInteger(index)) matches.push({ index, mint });
        }

        if (page.length < MAGIC_EDEN_WALLET_PAGE_LIMIT) break;
        offset += MAGIC_EDEN_WALLET_PAGE_LIMIT;
        await delay(MAGIC_EDEN_WALLET_PAGE_DELAY_MS);
      }
    } catch {
      // One unavailable marketplace collection should not hide holdings from the others.
    }
  }
  if (!successfulCollectionRequests) throw new Error("Magic Eden wallet lookup failed");
  return matches;
}

async function fetchWalletTokenAccountCardMatches(address) {
  const ownedMints = await fetchWalletTokenMints(address);
  return getCardMatchesForMints(ownedMints);
}

async function fetchWalletDasCardMatches(address) {
  const matches = new Map();
  const seenAssetIds = new Set();
  let page = 1;
  let fetched = 0;

  while (fetched < DAS_WALLET_MAX_ASSETS) {
    const result = await solanaDasRpc("getAssetsByOwner", {
      ownerAddress: address,
      page,
      limit: DAS_WALLET_PAGE_LIMIT,
      displayOptions: {
        showFungible: false,
        showNativeBalance: false,
      },
    });
    const items = Array.isArray(result?.items) ? result.items : [];
    let newAssetCount = 0;
    for (const asset of items) {
      const mint = String(asset?.id || "").trim();
      if (mint && seenAssetIds.has(mint)) continue;
      if (mint) {
        seenAssetIds.add(mint);
        newAssetCount += 1;
      }
      const match = getCardMatchForDasAsset(asset);
      if (match && !matches.has(match.index)) matches.set(match.index, match.mint);
    }

    fetched += items.length;
    if (
      items.length < DAS_WALLET_PAGE_LIMIT
      || (items.length > 0 && newAssetCount === 0)
    ) {
      break;
    }
    page += 1;
  }

  return [...matches].map(([index, mint]) => ({ index, mint }));
}

async function fetchTensorMplCoreWalletCardMatches(address) {
  const response = await fetchWithTimeout(TENSOR_GRAPHQL_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      operationName: "MplCoreMints",
      variables: { owner: address },
      query: `
        query MplCoreMints($owner: String!) {
          mplCoreMints(owner: $owner) {
            mints {
              mint {
                onchainId
              }
            }
          }
        }
      `,
    }),
  });
  if (!response.ok) throw new Error(`Tensor wallet search failed: ${response.status}`);

  const payload = await response.json();
  if (payload?.errors) {
    throw new Error(payload.errors[0]?.message || "Tensor wallet search error");
  }
  const mints = (payload?.data?.mplCoreMints?.mints || [])
    .map((entry) => String(entry?.mint?.onchainId || "").trim())
    .filter(Boolean);
  return getCardMatchesForMints(mints);
}

async function fetchCardNft2WalletCardMatches(address) {
  const payload = await fetchCardNft2Wallet(address);
  return getCardMatchesForMints(getCardNft2WalletMints(payload));
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

function getCardMatchesForMints(mints) {
  const matches = [];
  for (const mint of mints) {
    const normalizedMint = String(mint || "").trim();
    const index = CARD_NFT_MINT_TO_INDEX.get(normalizedMint);
    if (Number.isInteger(index)) matches.push({ index, mint: normalizedMint });
  }
  return matches;
}

function getCardMatchesForReferences(references) {
  const matches = [];
  for (const reference of Array.isArray(references) ? references : []) {
    const collectionId = String(reference?.[0] || "").trim();
    const number = Number(reference?.[1]);
    const mint = String(reference?.[2] || "").trim();
    const index = CARD_NUMBER_TO_INDEX.get(`${collectionId}:${number}`);
    if (Number.isInteger(index) && mint) matches.push({ index, mint });
  }
  return matches;
}

function getCardMatchForDasAsset(asset) {
  const mint = String(asset?.id || "").trim();
  if (!mint) return null;
  const knownIndex = CARD_NFT_MINT_TO_INDEX.get(mint);
  if (Number.isInteger(knownIndex)) return { index: knownIndex, mint };

  const collectionIds = (asset?.grouping || [])
    .filter((group) => String(group?.group_key || "").trim() === "collection")
    .map((group) => String(group?.group_value || "").trim());
  const collectionId = collectionIds.includes(CLEAR_CARD_COLLECTION_MINT)
    ? "clear"
    : collectionIds.includes(PONCHO_COLLECTION_MINT)
      ? "poncho"
      : "";
  if (!collectionId) return null;

  const attributes = asset?.content?.metadata?.attributes || [];
  const type = String(attributes.find((attribute) => (
    String(attribute?.trait_type || "").trim().toLowerCase() === "type"
  ))?.value || "").trim().toLowerCase();
  if (type !== "card" && type !== "card receipt") return null;

  const metadataUri = String(asset?.content?.json_uri || "").trim();
  const name = String(asset?.content?.metadata?.name || "").trim();
  const numberMatch = collectionId === "clear"
    ? (
      metadataUri.match(/\/(?:r?f)(\d+)\.json(?:$|[?#])/i)
        || name.match(/(?:card\s*#?\s*)(\d+)\s*$/i)
    )
    : (
      metadataUri.match(/\/(?:figures|receipts\/figures)\/(\d+)\.json(?:$|[?#])/i)
        || name.match(/(?:card\s*#?\s*)(\d+)\s*$/i)
    );
  const number = numberMatch ? Number.parseInt(numberMatch[1], 10) : null;
  const index = CARD_NUMBER_TO_INDEX.get(`${collectionId}:${number}`);
  return Number.isInteger(index) ? { index, mint } : null;
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

async function solanaDasRpc(method, params) {
  const response = await fetchWithTimeout(SOLANA_DAS_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: `${method}-${Date.now()}`,
      method,
      params,
    }),
  });
  if (!response.ok) throw new Error(`Solana DAS RPC failed: ${response.status}`);

  const payload = await response.json();
  if (payload?.error) throw new Error(payload.error.message || "Solana DAS RPC error");
  return payload.result;
}

async function fetchWithTimeout(url, options = {}) {
  const timeoutMs = Number(options.timeoutMs) || WALLET_SEARCH_REQUEST_TIMEOUT_MS;
  const { timeoutMs: _timeoutMs, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...fetchOptions, signal: controller.signal });
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
  const address = String(value || "").trim();
  return SOLANA_ADDRESS_PATTERN.test(address) && isCanonicalSolanaAddress(address);
}

function getWalletAddressFromPathname(pathname) {
  const segments = String(pathname || "").split("/").filter(Boolean);
  if (segments.length !== 1) return "";
  let address;
  try {
    address = decodeURIComponent(segments[0]);
  } catch {
    return "";
  }
  if (!isPossibleSolanaAddress(address)) return "";
  if (window.location.pathname !== `/${address}`) {
    window.history.replaceState(window.history.state, "", `/${address}${window.location.search}${window.location.hash}`);
  }
  return address;
}

function getWalletAuthApiBaseUrl() {
  const configured = document.querySelector('meta[name="cards-art-auth-api"]')?.content?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (isLoopbackBrowserHostname(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:8787/api`;
  }
  return "https://api.cards.art/api";
}

function isLoopbackBrowserHostname(hostname) {
  const normalized = String(hostname || "").toLowerCase();
  if (
    normalized === "localhost"
    || normalized.endsWith(".localhost")
    || normalized === "::1"
    || normalized === "[::1]"
  ) {
    return true;
  }
  const octets = normalized.split(".");
  return octets.length === 4
    && octets[0] === "127"
    && octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) <= 255);
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
  binderOuterFlipState = null;
  resetBinderOuterFlipTransform();
  resetEvilBinderTableSwap();
  setBinderTableView(false, { immediate: true, updateControls: false });
  cancelFocusedBinderCardPrewarm();
  binderTargetTurn = 0;
  binderTurn = 0;
  binderTargetClosure = 0;
  binderClosure = 0;
  binderSinglePageSide = null;
  binderSinglePageSideTouched = false;
  binderFocusPosition = -1;
  binderTextureQueueKey = "";
}

function getVisibleIndexes() {
  const traitCollectionId = activeTraitFilter?.collectionId;
  let indexes = walletFilterCardIndexes
    ? walletFilterCardIndexes.slice()
    : (favoritesOnly || (traitCollectionId && traitCollectionId !== ACTIVE_COLLECTION_ID))
      ? CARDS.map((_, index) => index)
      : ACTIVE_COLLECTION_INDEXES.slice();
  if (favoritesOnly) {
    indexes = indexes.filter((index) => favorites.has(favoriteKey(index)));
  }
  if (walletFilterCardIndexSet) {
    indexes = indexes.filter((index) => walletFilterCardIndexSet.has(index));
  }
  if (activeCollectionFilter) {
    indexes = indexes.filter((index) => CARDS[index]?.collection === activeCollectionFilter);
  }
  if (activeTraitFilter) {
    const sourceCategories = getTraitFilterSourceCategories(activeTraitFilter);
    indexes = indexes.filter((index) => {
      const matchesCollection = !traitCollectionId
        || CARDS[index]?.collection === traitCollectionId;
      return matchesCollection
        && cardHasTraitValue(index, sourceCategories, activeTraitFilter.normalizedValue);
    });
  }
  if (traitSortCategory === WALLET_TRADE_FILTER_VALUE) {
    return indexes.sort((left, right) => (
      Number(isCardMarkedForTrade(CARDS[right]))
      - Number(isCardMarkedForTrade(CARDS[left]))
    ));
  }
  if (traitSortCategory === LISTED_SORT_VALUE) {
    return indexes.sort((left, right) => (
      Number(Boolean(CARDS[right]?.listed)) - Number(Boolean(CARDS[left]?.listed))
    ));
  }
  if (traitSortCategory === COLLECTION_SORT_VALUE) {
    return indexes.sort(compareMixedCollectionCardIndexes);
  }
  if (traitSortCategory === "all") return indexes;
  if (activeTraitFilter && traitSortCategory === activeTraitFilter.category) {
    return indexes.sort(compareCardIndexes);
  }
  return getTraitGroupedIndexes(indexes, traitSortCategory);
}

function compareMixedCollectionCardIndexes(leftIndex, rightIndex) {
  const leftCollectionId = CARDS[leftIndex]?.collection || ACTIVE_COLLECTION_ID;
  const rightCollectionId = CARDS[rightIndex]?.collection || ACTIVE_COLLECTION_ID;
  return (MIXED_COLLECTION_SORT_ORDER.get(leftCollectionId) ?? Number.MAX_SAFE_INTEGER)
    - (MIXED_COLLECTION_SORT_ORDER.get(rightCollectionId) ?? Number.MAX_SAFE_INTEGER)
    || leftCollectionId.localeCompare(rightCollectionId)
    || compareCardIndexes(leftIndex, rightIndex);
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
    getCardTraitValues(index, category)
      .some((value) => normalizeTraitValue(value) === normalizedValue)
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
  return getCardTraitValues(index, category)[0] || "";
}

function getCardTraitValues(index, category) {
  const card = CARDS[index];
  if (normalizeTraitValue(category) === "status") {
    const status = getCardStatusTraitValue(card?.status);
    return status ? [status] : [];
  }
  const collection = getCollectionConfigForCard(card);
  const categoryIndex = collection.traitCategories.indexOf(category);
  if (categoryIndex < 0 || !collection.traits) return [];
  return getPackedTraitRecordValues(collection, card?.collectionIndex, categoryIndex);
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
  if (normalizedCategory === "listed?") return "listed";
  if (normalizedCategory === "status" || normalizedCategory === "rarity") {
    return normalizedCategory;
  }
  return category;
}

function getPackedTraitRecordValues(collection, recordIndex, categoryIndex) {
  const row = collection.traits?.rows?.[recordIndex] || [];
  const dictionary = collection.traits?.dictionary || [];
  const values = [];
  for (let offset = 0; offset + 1 < row.length; offset += 2) {
    if (row[offset] !== categoryIndex) continue;
    const value = String(dictionary[row[offset + 1]] || "").trim();
    if (value) values.push(value);
  }
  return values;
}

function getTraitFilterSourceCategories(filter) {
  return getValidTraitFilterSourceCategories(
    filter?.sourceCategories,
    filter?.category,
    filter?.collectionId,
  );
}

function getValidTraitFilterSourceCategories(
  sourceCategories,
  fallbackCategory,
  collectionId = ACTIVE_COLLECTION_ID,
) {
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  const validCategories = new Set(collection.traitCategories);
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

  const displaySources = getTraitSortSourceCategories(fallbackCategory, collection.id);
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

function getTraitDisplayCategoryOptions(collectionId = ACTIVE_COLLECTION_ID) {
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  const options = new Map();
  collection.traitCategories.forEach((sourceCategory) => {
    if (HIDDEN_TRAIT_CATEGORIES.has(sourceCategory)) return;

    const category = getTraitSearchDisplayCategory(sourceCategory, collection.id);
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

  return [...options.values()].sort((a, b) => compareTraitDisplayCategoryOptions(a, b, collection.id));
}

function compareTraitDisplayCategoryOptions(a, b, collectionId = ACTIVE_COLLECTION_ID) {
  const orderA = getTraitDisplayCategoryOrder(a, collectionId);
  const orderB = getTraitDisplayCategoryOrder(b, collectionId);
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

function getTraitSortSourceCategories(category, collectionId = ACTIVE_COLLECTION_ID) {
  if (!category || category === "all") return [];
  const normalizedCategory = normalizeTraitValue(category);
  const option = getTraitDisplayCategoryOptions(collectionId)
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
  const collectionThumbnails = traitThumbnails?.[collectionId];
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

function getTraitSearchGroups(collectionId = ACTIVE_COLLECTION_ID) {
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  if (collection.traitSearchGroupsCache) {
    return collection.traitSearchGroupsCache;
  }
  if (!collection.traits) return [];

  const groups = new Map();
  const dictionary = collection.traits.dictionary;
  collection.traits.rows.forEach((row, traitRecordIndex) => {
    const seenValues = new Set();
    for (let offset = 0; offset + 1 < row.length; offset += 2) {
      const category = String(collection.traitCategories[row[offset]] || "").trim();
      const sourceValue = String(dictionary[row[offset + 1]] || "").trim();
      const value = normalizeTraitValue(category) === "status"
        ? getCardStatusTraitValue(collection.cards[traitRecordIndex]?.status)
        : sourceValue;
      if (!category || HIDDEN_TRAIT_CATEGORIES.has(category) || !isVisibleTraitValue(value)) continue;

      const displayCategory = getTraitSearchDisplayCategory(category, collection.id);
      if (!displayCategory) continue;
      if (!groups.has(displayCategory)) {
        groups.set(displayCategory, {
          collectionId: collection.id,
          category: displayCategory,
          sourceCategories: [],
          traits: new Map(),
        });
      }

      const group = groups.get(displayCategory);
      if (!group.sourceCategories.includes(category)) group.sourceCategories.push(category);
      const normalized = normalizeTraitValue(value);
      const seenKey = `${normalizeTraitValue(displayCategory)}\u0000${normalized}`;
      if (seenValues.has(seenKey)) continue;
      seenValues.add(seenKey);

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
    }
  });

  const result = [...groups.values()]
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
        collectionId: group.collectionId,
        category: group.category,
        sourceCategories: group.sourceCategories,
        total: traits.length,
        traits,
      };
    })
    .filter(Boolean)
    .sort((left, right) => compareTraitDisplayCategoryOptions(left, right, collection.id));
  collection.traitSearchGroupsCache = result;
  return result;
}

function renderTraitSearch() {
  if (isMixedCollectionGallery() && !traitSearchCollectionId) {
    renderMixedCollectionFilterPicker();
    return;
  }
  const renderToken = startTraitSearchRender();
  const groupFragment = document.createDocumentFragment();
  const sidebarFragment = document.createDocumentFragment();
  const query = normalizeTraitSearchQuery(traitSearchQuery);
  const collectionId = traitSearchCollectionId || ACTIVE_COLLECTION_ID;
  const groups = getFilteredTraitSearchGroups(getTraitSearchGroups(collectionId), query);
  traitSearchGroupDataByKey.clear();

  if (!groups.length) {
    if (isMixedCollectionGallery() && traitSearchCollectionId) {
      groupFragment.append(createMixedTraitSearchHeader(collectionId));
    }
    const empty = document.createElement("div");
    empty.className = "trait-search-empty";
    empty.textContent = "No traits found";
    groupFragment.append(empty);
    els.traitSearchGroups.replaceChildren(groupFragment);
    els.traitSearchSidebar.replaceChildren();
    return;
  }

  if (isMixedCollectionGallery() && traitSearchCollectionId) {
    groupFragment.append(createMixedTraitSearchHeader(collectionId));
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

function renderMixedCollectionFilterPicker() {
  startTraitSearchRender();
  traitSearchGroupDataByKey.clear();
  els.traitSearchSidebar.replaceChildren();

  const options = getMixedCollectionFilterOptions();
  if (!options.length) {
    const empty = document.createElement("div");
    empty.className = "trait-search-empty";
    empty.textContent = "No collections found";
    els.traitSearchGroups.replaceChildren(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  const heading = document.createElement("div");
  heading.className = "mixed-collection-filter-heading";
  heading.textContent = "filter by collection";
  fragment.append(heading);

  const grid = document.createElement("div");
  grid.className = "mixed-collection-filter-grid";
  for (const option of options) {
    const tile = document.createElement("article");
    tile.className = "mixed-collection-filter-tile";
    tile.classList.toggle("is-active", activeCollectionFilter === option.collection.id);

    const filterButton = document.createElement("button");
    filterButton.className = "mixed-collection-filter-button";
    filterButton.type = "button";
    filterButton.title = `Show ${option.collection.label} cards`;
    filterButton.setAttribute(
      "aria-pressed",
      String(activeCollectionFilter === option.collection.id),
    );

    const card = CARDS[option.firstIndex];
    if (card) {
      const image = document.createElement("img");
      image.className = "mixed-collection-filter-thumbnail";
      image.src = cardStillAssetUrl(card);
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      image.setAttribute("aria-hidden", "true");
      filterButton.append(image);
    }

    const label = document.createElement("span");
    label.className = "mixed-collection-filter-label";
    label.textContent = option.collection.label;
    const count = document.createElement("span");
    count.className = "mixed-collection-filter-count";
    count.textContent = `${option.count} ${option.count === 1 ? "card" : "cards"}`;
    filterButton.append(label, count);
    filterButton.addEventListener("click", () => {
      applyMixedCollectionFilter(option.collection.id);
    });

    const traitsButton = document.createElement("button");
    traitsButton.className = "mixed-collection-traits-button";
    traitsButton.type = "button";
    traitsButton.textContent = "view all traits";
    traitsButton.disabled = !traitFiltersEnabledForCollection(option.collection.id);
    traitsButton.title = traitsButton.disabled
      ? `Trait filters are not available for ${option.collection.label}`
      : `View all ${option.collection.label} traits`;
    traitsButton.addEventListener("click", () => {
      openMixedCollectionTraitSearch(option.collection.id, traitsButton).catch((error) => {
        console.warn("Collection traits could not be opened", error);
      });
    });

    tile.append(filterButton, traitsButton);
    grid.append(tile);
  }
  fragment.append(grid);
  els.traitSearchGroups.replaceChildren(fragment);
}

function getMixedCollectionFilterOptions() {
  let indexes = walletFilterCardIndexes
    ? walletFilterCardIndexes.slice()
    : CARDS.map((_, index) => index);
  if (favoritesOnly) {
    indexes = indexes.filter((index) => favorites.has(favoriteKey(index)));
  }

  const byCollection = new Map();
  for (const index of indexes) {
    const collectionId = CARDS[index]?.collection;
    if (!COLLECTION_CONFIGS[collectionId]) continue;
    if (!byCollection.has(collectionId)) {
      byCollection.set(collectionId, { count: 0, firstIndex: index });
    }
    byCollection.get(collectionId).count += 1;
  }

  return COMMUNITY_COVER_COLLECTION_ORDER
    .map((collectionId) => {
      const entry = byCollection.get(collectionId);
      const collection = COLLECTION_CONFIGS[collectionId];
      return entry && collection ? { collection, ...entry } : null;
    })
    .filter(Boolean);
}

function createMixedTraitSearchHeader(collectionId) {
  const collection = COLLECTION_CONFIGS[collectionId] || ACTIVE_COLLECTION;
  const header = document.createElement("div");
  header.className = "mixed-trait-search-header";

  const backButton = document.createElement("button");
  backButton.className = "mixed-trait-search-back";
  backButton.type = "button";
  backButton.textContent = "collections";
  backButton.title = "Back to collection filters";
  backButton.addEventListener("click", () => {
    traitSearchCollectionId = "";
    resetTraitSearchQuery();
    updateTraitSearchState();
    renderGallery();
  });

  const label = document.createElement("div");
  label.className = "mixed-trait-search-title";
  label.textContent = `${collection.label} traits`;
  header.append(backButton, label);
  return header;
}

function applyMixedCollectionFilter(collectionId) {
  if (!isMixedCollectionGallery() || !COLLECTION_CONFIGS[collectionId]) return;
  activeCollectionFilter = collectionId;
  activeTraitFilter = null;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  cancelTraitSearchRender();
  resetTraitSearchQuery();
  updateGalleryUrlFromState();
  updateTraitSearchState();
  resetBinderGalleryPosition();
  renderGallery();
}

async function openMixedCollectionTraitSearch(collectionId, trigger) {
  if (
    !isMixedCollectionGallery()
    || !traitFiltersEnabledForCollection(collectionId)
  ) return;
  if (trigger) {
    trigger.disabled = true;
    trigger.setAttribute("aria-busy", "true");
  }
  try {
    await ensureTraitUiData(collectionId);
    traitSearchCollectionId = collectionId;
    resetTraitSearchQuery();
    updateTraitSearchPlaceholder();
    updateTraitSearchState();
    renderGallery();
  } finally {
    if (trigger?.isConnected) {
      trigger.disabled = false;
      trigger.removeAttribute("aria-busy");
    }
  }
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
  traitSearchRenderObserver?.disconnect();
  traitSearchRenderObserver = null;
  traitSearchRenderStates.clear();
  for (const sentinel of els.traitSearchGroups?.querySelectorAll(".trait-search-render-sentinel") || []) {
    sentinel.remove();
  }
  traitSearchRenderToken += 1;
}

function scheduleTraitSearchTileRender(groups, renderToken) {
  if (typeof window.IntersectionObserver !== "function") {
    scheduleTraitSearchTileRenderFallback(groups, renderToken);
    return;
  }

  if (!traitSearchRenderObserver) {
    traitSearchRenderObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const state = traitSearchRenderStates.get(entry.target);
        if (!state || state.renderToken !== traitSearchRenderToken) continue;
        traitSearchRenderObserver?.unobserve(entry.target);
        renderObservedTraitSearchBatch(state);
      }
    }, {
      root: els.traitSearchGroups,
      rootMargin: "700px 0px",
    });
  }

  for (const group of groups) {
    const grid = document.getElementById(getTraitSearchGridId(group.category));
    if (!grid || !group.traits.length || isTraitSearchCategoryCollapsed(group.category)) continue;
    const nextIndex = grid.querySelectorAll(".trait-search-tile").length;
    if (nextIndex >= group.traits.length) {
      grid.dataset.renderState = "complete";
      continue;
    }

    let sentinel = grid.querySelector(".trait-search-render-sentinel");
    if (!sentinel) {
      sentinel = document.createElement("div");
      sentinel.className = "trait-search-render-sentinel";
      sentinel.setAttribute("aria-hidden", "true");
      grid.append(sentinel);
    }
    traitSearchRenderStates.set(sentinel, {
      grid,
      group,
      nextIndex,
      renderToken,
      sentinel,
    });
    traitSearchRenderObserver.observe(sentinel);
  }
}

function renderObservedTraitSearchBatch(state) {
  if (
    state.renderToken !== traitSearchRenderToken
    || !state.grid.isConnected
    || isTraitSearchCategoryCollapsed(state.group.category)
  ) {
    return;
  }

  const rendered = appendTraitSearchTiles(
    state.grid,
    state.group,
    state.nextIndex,
    TRAIT_SEARCH_TILE_RENDER_BATCH_SIZE,
    state.sentinel,
  );
  state.nextIndex += rendered;
  if (state.nextIndex >= state.group.traits.length) {
    state.grid.dataset.renderState = "complete";
    traitSearchRenderStates.delete(state.sentinel);
    state.sentinel.remove();
    return;
  }

  traitSearchRenderFrame = requestAnimationFrame(() => {
    traitSearchRenderFrame = 0;
    if (
      state.renderToken === traitSearchRenderToken
      && traitSearchRenderObserver
      && state.sentinel.isConnected
    ) {
      traitSearchRenderObserver.observe(state.sentinel);
    }
  });
}

function scheduleTraitSearchTileRenderFallback(groups, renderToken) {
  const queue = groups
    .filter((group) => group.traits.length && !isTraitSearchCategoryCollapsed(group.category))
    .map((group) => ({
      group,
      grid: document.getElementById(getTraitSearchGridId(group.category)),
      nextIndex: document.getElementById(getTraitSearchGridId(group.category))
        ?.querySelectorAll(".trait-search-tile").length || 0,
    }))
    .filter((item) => item.grid && item.nextIndex < item.group.traits.length);

  const renderBatch = () => {
    traitSearchRenderFrame = 0;
    if (renderToken !== traitSearchRenderToken || !queue.length) return;
    const item = queue[0];
    const rendered = appendTraitSearchTiles(
      item.grid,
      item.group,
      item.nextIndex,
      TRAIT_SEARCH_TILE_RENDER_BATCH_SIZE,
    );
    item.nextIndex += rendered;
    if (item.nextIndex >= item.group.traits.length) {
      item.grid.dataset.renderState = "complete";
      queue.shift();
    }
    if (queue.length) traitSearchRenderFrame = requestAnimationFrame(renderBatch);
  };
  if (queue.length) traitSearchRenderFrame = requestAnimationFrame(renderBatch);
}

function appendTraitSearchTiles(grid, group, startIndex, limit, before = null) {
  const fragment = document.createDocumentFragment();
  const endIndex = Math.min(group.traits.length, startIndex + limit);
  for (let index = startIndex; index < endIndex; index += 1) {
    fragment.append(createTraitSearchTile(group, group.traits[index], index));
  }
  grid.insertBefore(fragment, before);
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
    group.collectionId || ACTIVE_COLLECTION_ID,
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
    {
      collectionId: group.collectionId,
      sourceCategories: trait.sourceCategories || group.sourceCategories,
    }
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
  const sentinel = grid?.querySelector(".trait-search-render-sentinel");
  if (collapsed && sentinel) traitSearchRenderObserver?.unobserve(sentinel);

  const group = traitSearchGroupDataByKey.get(key);
  if (
    !collapsed
    && group
    && grid
    && grid.dataset.renderState !== "complete"
  ) {
    scheduleTraitSearchTileRender([group], traitSearchRenderToken);
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
    cancelGalleryRender();
    els.galleryGrid.replaceChildren();
    cancelFocusedBinderCardPrewarm();
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
  els.galleryEmpty.textContent = walletRouteLoading
    ? "Loading wallet binder..."
    : walletRouteLoadFailed
      ? walletRouteLoadErrorMessage || "Wallet binder could not load. Try again."
      : favoritesOnly
        ? "No favorites yet"
        : walletFilterCardIndexSet
          ? "No supported cards found in this wallet"
          : "No cards for this trait";
  els.favoriteFilterButton.setAttribute("aria-pressed", String(favoritesOnly));
  updateGalleryViewModeButton();

  if (empty) {
    cancelGalleryRender();
    els.galleryGrid.replaceChildren();
    cancelFocusedBinderCardPrewarm();
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
    cancelGalleryRender();
    els.galleryGrid.replaceChildren();
    clearGalleryCardTilts();
    updateBinderItems(indexes);
    startBinderRenderLoop();
  } else {
    cancelFocusedBinderCardPrewarm();
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
  if (!isBinderMode) {
    closeBinderPageStatusEdit({ update: false });
    setBinderTableView(false, { immediate: true, updateControls: false });
  }
  writeStorageValue(
    getBrowserStorage("localStorage"),
    "cardnft:binderMode:v1",
    isBinderMode ? "binder" : "grid",
  );
  updateGalleryViewModeButton();
  if (options.render === false || !galleryOpen) return;

  traitSearchOpen = false;
  traitSearchCollectionId = "";
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
  cancelGalleryRender();
  els.galleryGrid.style.setProperty("--gallery-card-hover-expand", `${GALLERY_CARD_HOVER_EXPAND_PX}px`);
  els.galleryGrid.replaceChildren();
  const priorityImageCount = getGalleryPriorityImageCount(indexes.length);
  const initialCount = Math.min(
    indexes.length,
    Math.max(priorityImageCount, GALLERY_INITIAL_RENDER_MIN),
  );
  appendGalleryCardRange(indexes, 0, initialCount, priorityImageCount);
  els.binderPageStatus.textContent = withWalletStatusLabel(`${indexes.length} cards`);
  if (initialCount < indexes.length) {
    const token = ++galleryRenderToken;
    els.galleryGrid.setAttribute("aria-busy", "true");
    beginGalleryIncrementalRender({
      indexes,
      position: initialCount,
      priorityImageCount,
      token,
    });
  }
}

function appendGalleryCardRange(indexes, start, end, priorityImageCount, before = null) {
  const fragment = document.createDocumentFragment();
  for (let position = start; position < end; position += 1) {
    const index = indexes[position];
    const card = CARDS[index];
    if (!card) continue;

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
  }
  els.galleryGrid.insertBefore(fragment, before);
}

function beginGalleryIncrementalRender(state) {
  if (typeof window.IntersectionObserver !== "function") {
    scheduleGalleryCardBatch(state);
    return;
  }

  const sentinel = document.createElement("div");
  sentinel.className = "gallery-render-sentinel";
  sentinel.setAttribute("aria-hidden", "true");
  els.galleryGrid.append(sentinel);
  galleryRenderSentinel = sentinel;
  state.observerDriven = true;
  galleryRenderObserver = new IntersectionObserver((entries) => {
    if (
      state.token !== galleryRenderToken
      || !entries.some((entry) => entry.isIntersecting)
      || !galleryRenderObserver
      || galleryRenderSentinel !== sentinel
    ) {
      return;
    }
    galleryRenderObserver.unobserve(sentinel);
    scheduleGalleryCardBatch(state);
  }, {
    root: els.galleryGrid,
    rootMargin: `${GALLERY_RENDER_PREFETCH_MARGIN_PX}px 0px`,
  });
  galleryRenderObserver.observe(sentinel);
}

function scheduleGalleryCardBatch(state) {
  const run = (deadline = null) => {
    galleryRenderIdleCallback = 0;
    galleryRenderTimer = 0;
    if (
      state.token !== galleryRenderToken
      || !galleryOpen
      || isBinderMode
      || els.galleryGrid.hidden
    ) {
      return;
    }

    const start = state.position;
    const hardEnd = Math.min(state.indexes.length, start + GALLERY_RENDER_BATCH_SIZE);
    let end = start;
    while (end < hardEnd) {
      if (
        end > start + 11
        && deadline
        && !deadline.didTimeout
        && deadline.timeRemaining() < 2
      ) {
        break;
      }
      end += 1;
    }
    appendGalleryCardRange(
      state.indexes,
      start,
      end,
      state.priorityImageCount,
      state.observerDriven ? galleryRenderSentinel : null,
    );
    state.position = end;

    if (state.position >= state.indexes.length) {
      els.galleryGrid.removeAttribute("aria-busy");
      galleryRenderObserver?.disconnect();
      galleryRenderObserver = null;
      galleryRenderSentinel?.remove();
      galleryRenderSentinel = null;
      return;
    }
    if (state.observerDriven) {
      galleryRenderTimer = window.setTimeout(() => {
        galleryRenderTimer = 0;
        if (
          state.token === galleryRenderToken
          && galleryRenderObserver
          && galleryRenderSentinel
        ) {
          galleryRenderObserver.observe(galleryRenderSentinel);
        }
      }, 0);
      return;
    }
    queueGalleryCardBatch(state, run);
  };
  queueGalleryCardBatch(state, run);
}

function queueGalleryCardBatch(state, callback) {
  if (typeof window.requestIdleCallback === "function") {
    galleryRenderIdleCallback = window.requestIdleCallback(callback, {
      timeout: GALLERY_RENDER_IDLE_TIMEOUT_MS,
    });
  } else {
    galleryRenderTimer = window.setTimeout(
      () => callback(),
      GALLERY_RENDER_FALLBACK_DELAY_MS,
    );
  }
}

function cancelGalleryRender() {
  galleryRenderToken += 1;
  galleryRenderObserver?.disconnect();
  galleryRenderObserver = null;
  galleryRenderSentinel?.remove();
  galleryRenderSentinel = null;
  if (galleryRenderIdleCallback && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(galleryRenderIdleCallback);
  }
  if (galleryRenderTimer) window.clearTimeout(galleryRenderTimer);
  galleryRenderIdleCallback = 0;
  galleryRenderTimer = 0;
  els.galleryGrid?.removeAttribute("aria-busy");
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

  const width = getAppViewportWidth();
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
  binderRenderer.setPixelRatio(getRendererPixelRatio(getAppViewportWidth(), getAppViewportHeight()));
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

  binderPresentationRoot = new THREE.Group();
  binderPresentationRoot.name = "binder-presentation";
  binderScene.add(binderPresentationRoot);

  binderActivePlacementRoot = new THREE.Group();
  binderActivePlacementRoot.name = "binder-active-placement";
  binderPresentationRoot.add(binderActivePlacementRoot);

  binderRoot = new THREE.Group();
  binderRoot.rotation.x = 0;
  binderRoot.position.y = 0.84;
  binderActivePlacementRoot.add(binderRoot);

  binderEvilTableSetRoot = createEvilBinderTableSet();
  binderPresentationRoot.add(binderEvilTableSetRoot);

  binderTableGroup = createBinderTable();
  binderScene.add(binderTableGroup);
  applyBinderTableViewProgress();

  warmBinderInteractionGeometry();
  warmCachedBinderBackTextures();
  resizeBinderRenderer();
}

function createBinderTable() {
  const table = new THREE.Group();
  table.name = "binder-table";

  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x170e09,
    roughness: 0.96,
    metalness: 0,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const surfaceMaterial = new THREE.MeshStandardMaterial({
    color: 0x29170e,
    roughness: 0.88,
    metalness: 0,
    emissive: 0x2d180d,
    emissiveIntensity: 0.18,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  binderTableSurfaceMaterial = surfaceMaterial;
  binderTableMaterials = [edgeMaterial, surfaceMaterial];

  const core = new THREE.Mesh(
    createRoundedCoreGeometry(
      BINDER_TABLE_WIDTH,
      BINDER_TABLE_HEIGHT,
      BINDER_TABLE_DEPTH,
      BINDER_TABLE_RADIUS,
    ),
    edgeMaterial,
  );
  core.renderOrder = -110;
  table.add(core);

  const surface = new THREE.Mesh(
    createRoundedPlaneGeometry(
      BINDER_TABLE_WIDTH - 0.08,
      BINDER_TABLE_HEIGHT - 0.08,
      BINDER_TABLE_RADIUS - 0.04,
    ),
    surfaceMaterial,
  );
  surface.position.z = BINDER_TABLE_DEPTH / 2 + 0.006;
  surface.renderOrder = -100;
  table.add(surface);

  binderTableDisplayModelRoot = new THREE.Group();
  binderTableDisplayModelRoot.name = "binder-table-display-model";
  binderTableDisplayModelRoot.position.set(
    BINDER_TABLE_DISPLAY_MODEL_X,
    BINDER_TABLE_DISPLAY_MODEL_Y,
    BINDER_TABLE_DEPTH / 2 + 0.012,
  );
  binderTableDisplayModelRoot.rotation.z = BINDER_TABLE_DISPLAY_MODEL_YAW;
  binderTableDisplayModelRoot.visible = false;
  table.add(binderTableDisplayModelRoot);

  binderTableAccessoryRoot = createBinderTableAccessories();
  table.add(binderTableAccessoryRoot);

  return table;
}

function createBinderTableAccessories() {
  const root = new THREE.Group();
  root.name = "binder-table-accessories";
  root.visible = false;
  binderTableDice = [];

  const silverMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xc8cdd5,
    roughness: 0.18,
    metalness: 0.9,
    clearcoat: 0.82,
    clearcoatRoughness: 0.12,
    alphaHash: true,
    opacity: 0,
    depthWrite: true,
  });
  binderTableCoinTopMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    alphaHash: true,
    opacity: 0,
    depthWrite: true,
    toneMapped: false,
  });
  const coinGlazeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdfe8f5,
    roughness: 0.08,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  coinGlazeMaterial.userData.tableAccessoryMaxOpacity = 0.14;
  const dieMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xb91f27,
    roughness: 0.3,
    metalness: 0.04,
    clearcoat: 0.68,
    clearcoatRoughness: 0.2,
    alphaHash: true,
    opacity: 0,
    depthWrite: true,
  });
  const pipMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.38,
    metalness: 0,
    emissive: 0x242424,
    emissiveIntensity: 0.08,
    alphaHash: true,
    opacity: 0,
    depthWrite: true,
  });
  binderTableAccessoryMaterials = [
    silverMaterial,
    binderTableCoinTopMaterial,
    coinGlazeMaterial,
    dieMaterial,
    pipMaterial,
  ];

  const shadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x110907,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  binderTableAccessoryShadowMaterials = [shadowMaterial];
  const surfaceZ = BINDER_TABLE_DEPTH / 2 + 0.014;

  const coin = new THREE.Group();
  coin.name = "binder-table-swag-coin";
  coin.position.set(
    BINDER_TABLE_COIN_X,
    BINDER_TABLE_COIN_Y,
    surfaceZ + BINDER_TABLE_COIN_THICKNESS / 2,
  );
  coin.rotation.z = BINDER_TABLE_COIN_ROTATION;
  const coinBody = new THREE.Mesh(
    new THREE.CylinderGeometry(
      BINDER_TABLE_COIN_RADIUS,
      BINDER_TABLE_COIN_RADIUS,
      BINDER_TABLE_COIN_THICKNESS,
      64,
      1,
      false,
    ),
    silverMaterial,
  );
  coinBody.rotation.x = Math.PI / 2;
  coinBody.renderOrder = -70;
  coin.add(coinBody);
  const coinFace = new THREE.Mesh(
    new THREE.CircleGeometry(BINDER_TABLE_COIN_RADIUS - 0.018, 64),
    binderTableCoinTopMaterial,
  );
  coinFace.name = "binder-table-swag-coin-face";
  coinFace.position.z = BINDER_TABLE_COIN_THICKNESS / 2 + 0.008;
  coinFace.renderOrder = -69;
  coin.add(coinFace);
  const coinGlaze = new THREE.Mesh(
    new THREE.CircleGeometry(BINDER_TABLE_COIN_RADIUS - 0.021, 64),
    coinGlazeMaterial,
  );
  coinGlaze.name = "binder-table-swag-coin-glaze";
  coinGlaze.position.z = BINDER_TABLE_COIN_THICKNESS / 2 + 0.011;
  coinGlaze.renderOrder = -68;
  coin.add(coinGlaze);
  const coinRim = new THREE.Mesh(
    new THREE.TorusGeometry(
      BINDER_TABLE_COIN_RADIUS - 0.025,
      0.014,
      8,
      56,
    ),
    silverMaterial,
  );
  coinRim.position.z = BINDER_TABLE_COIN_THICKNESS / 2 + 0.008;
  coinRim.renderOrder = -68;
  coin.add(coinRim);
  root.add(coin);
  root.add(createBinderTableAccessoryShadow(
    BINDER_TABLE_COIN_X,
    BINDER_TABLE_COIN_Y,
    BINDER_TABLE_COIN_RADIUS * 0.92,
    0.5,
    surfaceZ - 0.008,
    shadowMaterial,
  ));

  const dieGeometry = createBinderTableDieGeometry(BINDER_TABLE_DIE_SIZE);
  const pipGeometry = new THREE.SphereGeometry(
    BINDER_TABLE_DIE_SIZE * 0.066,
    10,
    7,
  );
  const firstTopFace = getRandomBinderTableDieFace();
  const secondTopFace = getRandomBinderTableDieFace(firstTopFace);
  [firstTopFace, secondTopFace].forEach((topFace, index) => {
    const [x, y] = BINDER_TABLE_DIE_POSITIONS[index];
    const die = createBinderTableDie({
      dieGeometry,
      pipGeometry,
      dieMaterial,
      pipMaterial,
      topFace,
    });
    die.position.x = x;
    die.position.y = y;
    const bounds = new THREE.Box3().setFromObject(die);
    die.position.z = surfaceZ - bounds.min.z + 0.004;
    die.userData.binderTableDieIndex = index;
    die.userData.binderTableDieTopFace = topFace;
    die.traverse((child) => {
      if (child.isMesh) child.userData.binderTableDieIndex = index;
    });
    root.add(die);
    const dieShadowMaterial = shadowMaterial.clone();
    dieShadowMaterial.userData.tableAccessoryOpacityFactor = 1;
    binderTableAccessoryShadowMaterials.push(dieShadowMaterial);
    const dieShadow = createBinderTableAccessoryShadow(
      x,
      y,
      BINDER_TABLE_DIE_SIZE * 0.52,
      0.7,
      surfaceZ - 0.008,
      dieShadowMaterial,
    );
    root.add(dieShadow);
    binderTableDice.push({
      group: die,
      shadow: dieShadow,
      shadowMaterial: dieShadowMaterial,
      baseZ: die.position.z,
      animation: null,
    });
  });

  return root;
}

function createBinderTableAccessoryShadow(
  x,
  y,
  radius,
  scaleY,
  z,
  material,
) {
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(radius, 24), material);
  shadow.position.set(x, y, z);
  shadow.scale.y = scaleY;
  shadow.renderOrder = -90;
  return shadow;
}

function createBinderTableDieGeometry(size) {
  const bevel = size * 0.05;
  const coreSize = size - bevel * 2;
  const geometry = new THREE.ExtrudeGeometry(
    createRoundedShape(coreSize, coreSize, size * 0.08),
    {
      depth: coreSize,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: bevel,
      bevelThickness: bevel,
      curveSegments: 7,
    },
  );
  geometry.translate(0, 0, -coreSize / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function createBinderTableDie({
  dieGeometry,
  pipGeometry,
  dieMaterial,
  pipMaterial,
  topFace,
}) {
  const die = new THREE.Group();
  die.name = `binder-table-die-${topFace}`;
  const body = new THREE.Mesh(dieGeometry, dieMaterial);
  body.renderOrder = -68;
  die.add(body);

  const faces = [
    { value: 1, normal: new THREE.Vector3(0, 1, 0) },
    { value: 6, normal: new THREE.Vector3(0, -1, 0) },
    { value: 2, normal: new THREE.Vector3(0, 0, 1) },
    { value: 5, normal: new THREE.Vector3(0, 0, -1) },
    { value: 3, normal: new THREE.Vector3(1, 0, 0) },
    { value: 4, normal: new THREE.Vector3(-1, 0, 0) },
  ];
  for (const face of faces) {
    addBinderTableDieFacePips(
      die,
      pipGeometry,
      pipMaterial,
      face.normal,
      face.value,
    );
  }

  const topFaceNormal = faces.find((face) => face.value === topFace).normal;
  const tableNormal = new THREE.Vector3(0, 0, 1);
  const alignFace = new THREE.Quaternion().setFromUnitVectors(
    topFaceNormal,
    tableNormal,
  );
  const randomSpin = new THREE.Quaternion().setFromAxisAngle(
    tableNormal,
    Math.random() * Math.PI * 2,
  );
  die.quaternion.copy(randomSpin).multiply(alignFace);
  return die;
}

function addBinderTableDieFacePips(
  die,
  geometry,
  material,
  normal,
  value,
) {
  const patterns = {
    1: [[0, 0]],
    2: [[-1, 1], [1, -1]],
    3: [[-1, 1], [0, 0], [1, -1]],
    4: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
    5: [[-1, 1], [1, 1], [0, 0], [-1, -1], [1, -1]],
    6: [[-1, 1], [-1, 0], [-1, -1], [1, 1], [1, 0], [1, -1]],
  };
  const reference = Math.abs(normal.z) > 0.9
    ? new THREE.Vector3(0, 1, 0)
    : new THREE.Vector3(0, 0, 1);
  const axisX = reference.clone().cross(normal).normalize();
  const axisY = normal.clone().cross(axisX).normalize();
  const faceOffset = normal.clone().multiplyScalar(
    BINDER_TABLE_DIE_SIZE / 2 - 0.012,
  );
  const pipSpacing = BINDER_TABLE_DIE_SIZE * 0.23;

  for (const [column, row] of patterns[value]) {
    const pip = new THREE.Mesh(geometry, material);
    pip.position.copy(faceOffset)
      .addScaledVector(axisX, column * pipSpacing)
      .addScaledVector(axisY, row * pipSpacing);
    pip.renderOrder = -67;
    die.add(pip);
  }
}

function getRandomBinderTableDieFace(excludedFace = 0) {
  let face = 1 + Math.floor(Math.random() * 6);
  if (face === excludedFace) face = face % 6 + 1;
  return face;
}

function getBinderTableDieLandingQuaternion(topFace) {
  const faceNormals = {
    1: new THREE.Vector3(0, 1, 0),
    6: new THREE.Vector3(0, -1, 0),
    2: new THREE.Vector3(0, 0, 1),
    5: new THREE.Vector3(0, 0, -1),
    3: new THREE.Vector3(1, 0, 0),
    4: new THREE.Vector3(-1, 0, 0),
  };
  const tableNormal = new THREE.Vector3(0, 0, 1);
  const alignFace = new THREE.Quaternion().setFromUnitVectors(
    faceNormals[topFace] || faceNormals[1],
    tableNormal,
  );
  const randomSpin = new THREE.Quaternion().setFromAxisAngle(
    tableNormal,
    Math.random() * Math.PI * 2,
  );
  return randomSpin.multiply(alignFace);
}

function getBinderTableDieHit(event) {
  if (
    !binderCamera
    || !binderTableAccessoryRoot
    || binderTableViewProgress < 0.82
    || !isVisibleThroughParents(binderTableAccessoryRoot)
  ) {
    return null;
  }

  const meshes = [];
  for (const entry of binderTableDice) {
    entry.group.traverse((child) => {
      if (child.isMesh && isVisibleThroughParents(child)) meshes.push(child);
    });
  }
  if (!meshes.length) return null;

  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(meshes, false)[0] || null;
}

function handleBinderTableDieTap(event) {
  const hit = getBinderTableDieHit(event);
  const index = hit?.object?.userData?.binderTableDieIndex;
  if (!Number.isInteger(index)) return false;
  beginBinderTableDieToss(index);
  return true;
}

function getBinderTableDisplayModelHit(event) {
  const entry = binderTableDisplayModelEntries[binderTableDisplayModelIndex];
  if (
    !binderCamera
    || !binderTableDisplayModelRoot
    || !entry
    || binderTableViewProgress < 0.82
    || !isVisibleThroughParents(entry.root)
  ) {
    return null;
  }

  const meshes = [];
  entry.root.traverse((child) => {
    if (child.isMesh && isVisibleThroughParents(child)) meshes.push(child);
  });
  if (!meshes.length) return null;

  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(meshes, false)[0] || null;
}

function handleBinderTableDisplayModelTap(event) {
  if (!getBinderTableDisplayModelHit(event)) return false;
  return cycleBinderTableDisplayModel();
}

function beginBinderTableDieToss(index) {
  const entry = binderTableDice[index];
  if (!entry || entry.animation) return false;

  const currentTopFace = entry.group.userData.binderTableDieTopFace || 0;
  const nextTopFace = getRandomBinderTableDieFace(currentTopFace);
  const spinAxis = new THREE.Vector3(
    Math.random() * 1.6 - 0.8,
    Math.random() * 1.6 - 0.8,
    Math.random() * 1.2 - 0.6,
  );
  if (Math.abs(spinAxis.x) + Math.abs(spinAxis.y) < 0.35) {
    spinAxis.x += spinAxis.x < 0 ? -0.65 : 0.65;
  }
  spinAxis.normalize();
  entry.animation = {
    startedAt: performance.now(),
    startQuaternion: entry.group.quaternion.clone(),
    targetQuaternion: getBinderTableDieLandingQuaternion(nextTopFace),
    spinAxis,
    spinTurns: 2.6 + Math.random() * 2.1,
    topFace: nextTopFace,
  };
  markBinderInteractionActive(BINDER_TABLE_DIE_TOSS_DURATION_MS + 160);
  startBinderRenderLoop();
  return true;
}

function updateBinderTableDice(now = performance.now()) {
  let active = false;
  for (const entry of binderTableDice) {
    const animation = entry.animation;
    if (!animation) continue;
    active = true;

    const progress = clamp(
      (now - animation.startedAt) / BINDER_TABLE_DIE_TOSS_DURATION_MS,
      0,
      1,
    );
    const height = (
      4
      * BINDER_TABLE_DIE_TOSS_HEIGHT
      * progress
      * (1 - progress)
    );
    entry.group.position.z = entry.baseZ + height;

    const spinQuaternion = new THREE.Quaternion().setFromAxisAngle(
      animation.spinAxis,
      animation.spinTurns * Math.PI * 2 * progress,
    );
    const airborneQuaternion = animation.startQuaternion
      .clone()
      .multiply(spinQuaternion);
    const landingProgress = easeInOutCubic(
      clamp((progress - 0.62) / 0.38, 0, 1),
    );
    airborneQuaternion.slerp(animation.targetQuaternion, landingProgress);
    entry.group.quaternion.copy(airborneQuaternion);

    const heightProgress = height / BINDER_TABLE_DIE_TOSS_HEIGHT;
    entry.shadowMaterial.userData.tableAccessoryOpacityFactor = (
      1 - heightProgress * 0.76
    );
    entry.shadow.scale.x = 1 + heightProgress * 0.36;
    entry.shadow.scale.y = 0.7 + heightProgress * 0.18;

    if (progress < 1) continue;

    entry.group.position.z = entry.baseZ;
    entry.group.quaternion.copy(animation.targetQuaternion);
    entry.group.userData.binderTableDieTopFace = animation.topFace;
    entry.shadowMaterial.userData.tableAccessoryOpacityFactor = 1;
    entry.shadow.scale.set(1, 0.7, 1);
    entry.animation = null;
  }
  return active;
}

function ensureBinderTableAccessories() {
  if (binderTableAccessoryPromise) return binderTableAccessoryPromise;
  if (!binderTableAccessoryRoot || !binderTableCoinTopMaterial) {
    return Promise.resolve(null);
  }

  binderTableAccessoryPromise = new Promise((resolve, reject) => {
    textureLoader.load(
      BINDER_TABLE_COIN_TEXTURE_URL,
      resolve,
      undefined,
      reject,
    );
  })
    .then((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = Math.min(
        8,
        binderRenderer?.capabilities?.getMaxAnisotropy?.() || 1,
      );
      texture.needsUpdate = true;
      binderTableCoinTopMaterial.map = texture;
      binderTableCoinTopMaterial.needsUpdate = true;
      binderTableAccessoriesLoadedAt = performance.now();
      applyBinderTableViewProgress();
      markBinderInteractionActive(BINDER_TABLE_ACCESSORY_REVEAL_DURATION_MS + 120);
      startBinderRenderLoop();
      return binderTableAccessoryRoot;
    })
    .catch((error) => {
      binderTableAccessoryPromise = null;
      console.warn("Unable to load the binder table accessories", error);
      return null;
    });

  return binderTableAccessoryPromise;
}

function updateBinderTableAccessoryVisibility(now = performance.now()) {
  if (!binderTableAccessoryRoot || !binderTableAccessoriesLoadedAt) return false;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const revealProgress = reducedMotion
    ? 1
    : clamp(
      (now - binderTableAccessoriesLoadedAt)
        / BINDER_TABLE_ACCESSORY_REVEAL_DURATION_MS,
      0,
      1,
    );
  const opacity = (
    clamp(binderTableViewProgress / 0.72, 0, 1)
    * easeOutCubic(revealProgress)
  );
  for (const material of binderTableAccessoryMaterials) {
    material.opacity = opacity
      * (material.userData.tableAccessoryMaxOpacity ?? 1);
  }
  for (const material of binderTableAccessoryShadowMaterials) {
    material.opacity = (
      BINDER_TABLE_ACCESSORY_SHADOW_OPACITY
      * opacity
      * (material.userData.tableAccessoryOpacityFactor ?? 1)
    );
  }
  binderTableAccessoryRoot.visible = opacity > 0.001;
  return opacity > 0.001 && revealProgress < 1;
}

function ensureBinderTableSurfaceTextures() {
  if (binderTableSurfaceTexturesPromise) return binderTableSurfaceTexturesPromise;
  if (!binderTableSurfaceMaterial) return Promise.resolve(binderTableSurfaceTextures);

  binderTableSurfaceTexturesPromise = Promise.all([
    loadBinderTableSurfaceTexture(BINDER_TABLE_SURFACE_TEXTURE_URL),
    loadBinderTableSurfaceTexture(BINDER_TABLE_SURFACE_LIGHT_TEXTURE_URL),
  ])
    .then(([darkTexture, lightTexture]) => {
      binderTableSurfaceTextures.set("dark", darkTexture);
      binderTableSurfaceTextures.set("light", lightTexture);
      updateBinderTableSurfaceTheme();
      return binderTableSurfaceTextures;
    })
    .catch((error) => {
      binderTableSurfaceTexturesPromise = null;
      console.warn("Unable to load the binder table surface textures", error);
      return binderTableSurfaceTextures;
    });

  return binderTableSurfaceTexturesPromise;
}

function loadBinderTableSurfaceTexture(url) {
  return new Promise((resolve, reject) => {
    textureLoader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.MirroredRepeatWrapping;
        texture.wrapT = THREE.MirroredRepeatWrapping;
        texture.repeat.set(
          BINDER_TABLE_SURFACE_REPEAT_X,
          BINDER_TABLE_SURFACE_REPEAT_Y,
        );
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        texture.anisotropy = Math.min(
          8,
          binderRenderer?.capabilities?.getMaxAnisotropy?.() || 1,
        );
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

function updateBinderTableSurfaceTheme(
  isLight = els.body.classList.contains("is-light"),
) {
  if (!binderTableSurfaceMaterial) return;
  const texture = binderTableSurfaceTextures.get(isLight ? "light" : "dark");
  if (!texture || binderTableSurfaceMaterial.map === texture) return;

  binderTableSurfaceMaterial.color.setHex(0xffffff);
  binderTableSurfaceMaterial.map = texture;
  binderTableSurfaceMaterial.emissiveMap = texture;
  binderTableSurfaceMaterial.needsUpdate = true;
  requestBinderRenderOnce();
}

function ensureBinderTableDisplayModel() {
  if (binderTableDisplayModelPromise) return binderTableDisplayModelPromise;
  if (!binderTableDisplayModelRoot) return Promise.resolve(null);

  binderTableDisplayModelPromise = Promise.all([
    import("./vendor/GLTFLoader.js?v=three-r165-gltf-1"),
    import("./vendor/DRACOLoader.js?v=three-r165-draco-1"),
  ]).then(([{ GLTFLoader }, { DRACOLoader }]) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(INDIVIDUAL_CARD_DRACO_DECODER_PATH);
    dracoLoader.setWorkerLimit(1);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    return Promise.all(BINDER_TABLE_DISPLAY_MODEL_SPECS.map((spec) => (
      new Promise((resolve, reject) => {
        loader.load(spec.url, resolve, undefined, reject);
      }).then((gltf) => createBinderTableDisplayModelEntry(gltf, spec))
    ))).finally(() => dracoLoader.dispose());
  }).then(async (entries) => {
    if (!binderTableDisplayModelRoot) return null;
    binderTableDisplayModelEntries = entries.filter(Boolean);
    if (!binderTableDisplayModelEntries.length) return null;
    for (const entry of binderTableDisplayModelEntries) {
      binderTableDisplayModelRoot.add(entry.root);
    }
    await warmBinderTableDisplayModelEntries(binderTableDisplayModelEntries);
    binderTableDisplayModelIndex = 0;
    applyBinderTableDisplayModelSelection();
    binderTableDisplayModelLoadedAt = performance.now();
    applyBinderTableViewProgress();
    markBinderInteractionActive(BINDER_TABLE_DISPLAY_MODEL_REVEAL_DURATION_MS + 120);
    startBinderRenderLoop();
    return binderTableDisplayModelRoot;
    })
    .catch((error) => {
      binderTableDisplayModelPromise = null;
      console.warn("Unable to load the binder table display model", error);
      return null;
    });

  return binderTableDisplayModelPromise;
}

function createBinderTableDisplayModelEntry(gltf, spec) {
  const model = gltf?.scene;
  if (!model) return null;
  model.rotation.y += spec.yawOffset || 0;
  model.updateMatrixWorld(true);

  const materials = spec.materialProfile === "blue-resin"
    ? applyBinderTableBlueResinMaterial(model)
    : preserveBinderTableDisplayModelMaterials(model);
  model.traverse((child) => {
    if (!child.isMesh) return;
    if (!child.geometry.getAttribute("normal")) child.geometry.computeVertexNormals();
    child.frustumCulled = true;
    child.renderOrder = -70;
  });

  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const scale = (
    BINDER_TABLE_DISPLAY_MODEL_HEIGHT
    / Math.max(0.001, size.y)
    * (spec.scaleMultiplier || 1)
  );
  model.scale.setScalar(scale);

  const uprightRoot = new THREE.Group();
  uprightRoot.name = `binder-table-display-model-${spec.id}`;
  uprightRoot.rotation.x = Math.PI / 2 + (spec.pitchOffset || 0);
  uprightRoot.userData.binderTableDisplayModelId = spec.id;
  uprightRoot.add(model);
  uprightRoot.updateMatrixWorld(true);
  const placedBounds = new THREE.Box3().setFromObject(uprightRoot);
  const placedCenter = placedBounds.getCenter(new THREE.Vector3());
  const worldCorrection = new THREE.Vector3(
    -placedCenter.x,
    -placedCenter.y,
    -placedBounds.min.z,
  );
  const localCorrection = worldCorrection.applyQuaternion(
    uprightRoot.quaternion.clone().invert(),
  );
  model.position.add(localCorrection);
  uprightRoot.position.y = spec.positionYOffset || 0;
  return {
    id: spec.id,
    root: uprightRoot,
    materials,
    usesResinMaterial: spec.materialProfile === "blue-resin",
  };
}

function applyBinderTableBlueResinMaterial(model) {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x8babe2,
    roughness: 0.2,
    metalness: 0,
    clearcoat: 0.92,
    clearcoatRoughness: 0.12,
    ior: 1.46,
    specularIntensity: 1,
    specularColor: 0xeaf2ff,
    emissive: 0x14213a,
    emissiveIntensity: 0.16,
    side: THREE.FrontSide,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    dithering: true,
  });
  material.forceSinglePass = true;
  material.userData.tableDisplayBaseOpacity = 1;
  model.traverse((child) => {
    if (child.isMesh) child.material = material;
  });
  return [material];
}

function preserveBinderTableDisplayModelMaterials(model) {
  const materialClones = new Map();
  model.traverse((child) => {
    if (!child.isMesh) return;
    const sourceMaterials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    const displayMaterials = sourceMaterials.map((sourceMaterial) => {
      if (!sourceMaterial) return sourceMaterial;
      if (materialClones.has(sourceMaterial)) return materialClones.get(sourceMaterial);
      const material = sourceMaterial.clone();
      material.userData.tableDisplayBaseOpacity = clamp(sourceMaterial.opacity ?? 1, 0, 1);
      material.transparent = true;
      material.opacity = 1;
      material.depthWrite = true;
      material.dithering = true;
      material.forceSinglePass = true;
      material.needsUpdate = true;
      materialClones.set(sourceMaterial, material);
      return material;
    });
    child.material = Array.isArray(child.material) ? displayMaterials : displayMaterials[0];
  });
  return [...materialClones.values()];
}

async function warmBinderTableDisplayModelEntries(entries) {
  if (!binderRenderer || !binderScene || !binderCamera || !binderTableDisplayModelRoot) return;

  const rootWasVisible = binderTableDisplayModelRoot.visible;
  const entryStates = entries.map((entry) => ({
    entry,
    visible: entry.root.visible,
    materials: entry.materials.map((material) => ({
      material,
      opacity: material.opacity,
      depthWrite: material.depthWrite,
    })),
  }));

  binderTableDisplayModelRoot.visible = true;
  for (const { entry } of entryStates) {
    entry.root.visible = true;
    entry.root.traverse((object) => {
      if (object.isMesh) object.frustumCulled = false;
    });
    for (const material of entry.materials) {
      material.opacity = 0;
      material.depthWrite = false;
      if (typeof binderRenderer.initTexture !== "function") continue;
      for (const value of Object.values(material)) {
        if (!value?.isTexture) continue;
        try {
          binderRenderer.initTexture(value);
        } catch {
          // The compile pass below is the fallback for drivers that defer uploads.
        }
      }
    }
  }

  try {
    if (typeof binderRenderer.compileAsync === "function") {
      await binderRenderer.compileAsync(binderScene, binderCamera);
    } else if (typeof binderRenderer.compile === "function") {
      binderRenderer.compile(binderScene, binderCamera);
    }
    binderRenderer.render(binderScene, binderCamera);
    await nextAnimationFrame();
    binderRenderer.render(binderScene, binderCamera);
    binderRenderer.getContext()?.finish?.();
  } catch {
    // Normal rendering remains available if eager GPU preparation is unsupported.
  } finally {
    binderTableDisplayModelRoot.visible = rootWasVisible;
    for (const state of entryStates) {
      state.entry.root.visible = state.visible;
      state.entry.root.traverse((object) => {
        if (object.isMesh) object.frustumCulled = true;
      });
      for (const materialState of state.materials) {
        materialState.material.opacity = materialState.opacity;
        materialState.material.depthWrite = materialState.depthWrite;
      }
    }
  }
}

function applyBinderTableDisplayModelSelection() {
  binderTableDisplayModelEntries.forEach((entry, index) => {
    const selected = index === binderTableDisplayModelIndex;
    // Keep every model in the render pass at zero opacity so its embedded maps
    // remain decoded, uploaded, and shader-ready between clicks.
    entry.root.visible = true;
    if (selected) return;
    for (const material of entry.materials) {
      material.opacity = 0;
      material.depthWrite = false;
    }
  });
}

function cycleBinderTableDisplayModel() {
  if (binderTableDisplayModelEntries.length < 2) return false;
  binderTableDisplayModelIndex = modulo(
    binderTableDisplayModelIndex + 1,
    binderTableDisplayModelEntries.length,
  );
  applyBinderTableDisplayModelSelection();
  const entry = binderTableDisplayModelEntries[binderTableDisplayModelIndex];
  for (const material of entry.materials) {
    material.opacity = 0;
    material.depthWrite = !entry.usesResinMaterial;
  }
  binderTableDisplayModelLoadedAt = performance.now();
  markBinderInteractionActive(BINDER_TABLE_DISPLAY_MODEL_REVEAL_DURATION_MS + 120);
  startBinderRenderLoop();
  return true;
}

function updateBinderTableDisplayModelVisibility(now = performance.now()) {
  const entry = binderTableDisplayModelEntries[binderTableDisplayModelIndex];
  const root = binderTableDisplayModelRoot;
  if (!entry || !root || !binderTableDisplayModelLoadedAt) return false;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const revealProgress = reducedMotion
    ? 1
    : clamp(
      (now - binderTableDisplayModelLoadedAt)
        / BINDER_TABLE_DISPLAY_MODEL_REVEAL_DURATION_MS,
      0,
      1,
    );
  const revealOpacity = easeOutCubic(revealProgress);
  const tableOpacity = clamp(binderTableViewProgress / 0.72, 0, 1);
  const opacity = tableOpacity * revealOpacity;

  for (const material of entry.materials) {
    const baseOpacity = material.userData.tableDisplayBaseOpacity ?? 1;
    if (entry.usesResinMaterial) {
      material.depthWrite = false;
      material.opacity = baseOpacity * BINDER_TABLE_DISPLAY_MODEL_MAX_OPACITY * opacity;
    } else {
      // Embedded models fade with their final depth mode already active, so
      // self-occlusion never changes or pops at the end of the transition.
      material.depthWrite = true;
      material.opacity = baseOpacity * opacity;
    }
  }
  // Keep the shared root stable while the selected model fades.
  root.visible = tableOpacity > 0.001;
  return opacity > 0.001 && revealProgress < 1;
}

function createEvilBinderTableSet() {
  const root = new THREE.Group();
  root.name = "evil-binder-table-set";
  binderEvilTableEntries = [];

  const collectionOrder = getEvilBinderTableCollectionOrder();
  if (!usesEvilBinderPresentation() || collectionOrder.length !== 3) {
    root.visible = false;
    return root;
  }

  for (const slot of [-1, 1]) {
    const collectionId = collectionOrder[slot + 1];
    const entry = createEvilBinderTableProxy(collectionId, slot);
    binderEvilTableEntries.push(entry);
    root.add(entry.group);
  }
  applyEvilBinderTableSetVisibility();
  return root;
}

function getDefaultEvilBinderTableCollectionOrder(
  activeCollectionId = ACTIVE_COLLECTION_ID,
) {
  const sideCollections = EVIL_BINDER_TABLE_SIDE_COLLECTIONS[activeCollectionId] || [];
  return sideCollections.length === 2
    ? [sideCollections[0], activeCollectionId, sideCollections[1]]
    : [];
}

function normalizeEvilBinderTableCollectionOrder(
  collectionOrder,
  activeCollectionId = ACTIVE_COLLECTION_ID,
) {
  const expectedCollections = Object.keys(EVIL_BINDER_TABLE_SIDE_COLLECTIONS);
  const proposedOrder = Array.isArray(collectionOrder) ? collectionOrder : [];
  const uniqueCollections = new Set(proposedOrder);
  const valid = proposedOrder.length === expectedCollections.length
    && uniqueCollections.size === expectedCollections.length
    && proposedOrder[1] === activeCollectionId
    && expectedCollections.every((collectionId) => uniqueCollections.has(collectionId));
  return valid
    ? proposedOrder.slice()
    : getDefaultEvilBinderTableCollectionOrder(activeCollectionId);
}

function getEvilBinderTableCollectionOrder() {
  binderEvilTableCollectionOrder = normalizeEvilBinderTableCollectionOrder(
    binderEvilTableCollectionOrder,
  );
  return binderEvilTableCollectionOrder;
}

function getSwappedEvilBinderTableCollectionOrder(collectionId) {
  const nextOrder = getEvilBinderTableCollectionOrder().slice();
  const selectedIndex = nextOrder.indexOf(collectionId);
  if (selectedIndex < 0 || selectedIndex === 1) return nextOrder;
  [nextOrder[1], nextOrder[selectedIndex]] = [
    nextOrder[selectedIndex],
    nextOrder[1],
  ];
  return nextOrder;
}

function createEvilBinderTableProxy(collectionId, slot) {
  const group = new THREE.Group();
  group.name = `evil-binder-proxy-${collectionId}`;
  const baseX = slot * BINDER_EVIL_TABLE_SIDE_X;
  const baseY = 0.84;
  const baseZ = BINDER_EVIL_TABLE_SIDE_Z;
  group.position.set(baseX, baseY, baseZ);
  group.scale.setScalar(BINDER_EVIL_TABLE_SIDE_SCALE);

  const shellState = createBinderCoverShellModel({
    collectionId,
    emblemActive: true,
  });
  const {
    shell,
    leftPivot,
    leftCover,
    frontCoverEmblem: emblem,
    rightCover,
    spine,
    coverWidth,
    coverHeight,
  } = shellState;
  const fadedMaterials = [];

  const prepareCoverLayer = (mesh, {
    depthWrite,
    renderOrder,
  }) => {
    const material = mesh.material;
    material.color.copy(BINDER_COVER_TABLE_COLOR);
    material.emissive.copy(BINDER_COVER_TABLE_EMISSIVE);
    material.emissiveIntensity = BINDER_COVER_TABLE_EMISSIVE_INTENSITY;
    material.transparent = true;
    material.opacity = 0;
    material.depthWrite = false;
    material.needsUpdate = true;
    mesh.renderOrder = renderOrder;
    fadedMaterials.push({
      material,
      baseOpacity: 1,
      targetTransparent: true,
      targetDepthWrite: depthWrite,
    });
  };

  applyBinderShellClosureGeometry(shellState, -1);
  shell.position.x = -BINDER_CLOSED_COVER_CENTER_X;
  prepareCoverLayer(leftCover, {
    depthWrite: false,
    renderOrder: BINDER_CLOSING_COVER_RENDER_ORDER,
  });
  prepareCoverLayer(rightCover, {
    depthWrite: true,
    renderOrder: BINDER_TABLE_COVER_RENDER_ORDER,
  });
  prepareCoverLayer(spine, {
    depthWrite: true,
    renderOrder: BINDER_TABLE_COVER_RENDER_ORDER,
  });
  setBinderFrontCoverEmblemLayer(emblem, true);
  setBinderFrontCoverEmblemOpacity(emblem, 0);

  const hitMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(coverWidth, coverHeight),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
    }),
  );
  hitMesh.rotation.y = Math.PI;
  hitMesh.position.set(
    leftCover.position.x,
    0,
    -BINDER_COVER_THICKNESS / 2 - 0.03,
  );
  hitMesh.userData.evilBinderTableCollectionId = collectionId;
  hitMesh.userData.evilBinderTableSlot = slot;
  leftPivot.add(hitMesh);
  group.add(shell);

  return {
    collectionId,
    slot,
    group,
    hitMesh,
    emblem,
    shellState,
    fadedMaterials,
    baseX,
    baseY,
    baseZ,
  };
}

function getEvilBinderTableSetBaseOpacity() {
  if (
    !usesEvilBinderPresentation()
    || binderTableViewProgress <= 0.001
  ) {
    return 0;
  }

  const closureProgress = clamp(
    (
      Math.abs(binderClosure) - BINDER_EVIL_TABLE_SIDE_FADE_START
    ) / (
      BINDER_EVIL_TABLE_SIDE_FADE_END - BINDER_EVIL_TABLE_SIDE_FADE_START
    ),
    0,
    1,
  );
  return easeInOutCubic(closureProgress) * clamp(binderTableViewProgress, 0, 1);
}

function setEvilBinderTableEntryOpacity(entry, opacity) {
  const nextOpacity = clamp(opacity, 0, 1);
  entry.group.visible = nextOpacity > 0.001;
  for (const {
    material,
    baseOpacity,
    targetTransparent = false,
    targetDepthWrite = true,
  } of entry.fadedMaterials) {
    material.opacity = baseOpacity * nextOpacity;
    const fullyVisible = nextOpacity >= 0.999;
    const transparent = fullyVisible ? targetTransparent : true;
    const depthWrite = fullyVisible ? targetDepthWrite : false;
    if (
      material.transparent !== transparent
      || material.depthWrite !== depthWrite
    ) {
      material.transparent = transparent;
      material.depthWrite = depthWrite;
      material.needsUpdate = true;
    }
  }
  setBinderFrontCoverEmblemOpacity(entry.emblem, 0.92 * nextOpacity);
}

function applyEvilBinderTableSetVisibility() {
  if (!binderEvilTableSetRoot || !binderEvilTableEntries.length) return;

  const baseOpacity = getEvilBinderTableSetBaseOpacity();
  binderEvilTableSetOpacity = baseOpacity;
  for (const entry of binderEvilTableEntries) {
    // Once the three-binder set is visible, keep every binder fully solid
    // while they trade places. Position and lift communicate the swap.
    setEvilBinderTableEntryOpacity(entry, baseOpacity);
  }
  binderEvilTableSetRoot.visible = binderEvilTableEntries.some(
    (entry) => entry.group.visible,
  );
}

function canStartEvilBinderTableSwap() {
  return Boolean(
    usesEvilBinderPresentation()
    && binderTableViewTarget > 0.5
    && binderTableViewProgress >= 0.985
    && Math.abs(binderClosure) >= 0.985
    && Math.abs(binderTargetClosure) >= 0.5
    && !binderEvilTableSwapState
    && !binderOuterFlipState
    && !binderDrag
    && !isBinderFocusView()
  );
}

function beginEvilBinderTableSwap(collectionId) {
  if (!canStartEvilBinderTableSwap()) return false;
  const selectedEntry = binderEvilTableEntries.find(
    (entry) => entry.collectionId === collectionId,
  );
  const destination = COLLECTION_CONFIGS[collectionId];
  if (!selectedEntry || destination?.introGroup !== "evil") return false;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  binderEvilTableSwapState = {
    collectionId,
    selectedEntry,
    nextCollectionOrder: getSwappedEvilBinderTableCollectionOrder(collectionId),
    startedAt: performance.now(),
    duration: reducedMotion ? 260 : BINDER_EVIL_TABLE_SWAP_DURATION_MS,
    progress: 0,
    committing: false,
    collectionPromise: Promise.all([
      ensureCollectionCards(collectionId),
      preloadCollectionBackTextures(collectionId),
    ]),
  };
  binderLastOpenTap = null;
  clearBinderIntroLinkCursor();
  els.body.classList.add("binder-table-swapping");
  markBinderInteractionActive(binderEvilTableSwapState.duration + 600);
  updateBinderPageControls();
  startBinderRenderLoop();
  return true;
}

function updateEvilBinderTableSwap(now = performance.now()) {
  const state = binderEvilTableSwapState;
  if (!state || !binderActivePlacementRoot) return false;

  const linearProgress = clamp(
    (now - state.startedAt) / Math.max(1, state.duration),
    0,
    1,
  );
  const easedProgress = easeInOutCubic(linearProgress);
  const arc = Math.sin(linearProgress * Math.PI);
  const entry = state.selectedEntry;
  state.progress = easedProgress;

  binderActivePlacementRoot.position.set(
    THREE.MathUtils.lerp(0, entry.baseX, easedProgress),
    -entry.slot * BINDER_EVIL_TABLE_SWAP_PATH_BEND * arc,
    BINDER_EVIL_TABLE_SWAP_ACTIVE_LIFT * arc,
  );
  binderActivePlacementRoot.scale.setScalar(
    THREE.MathUtils.lerp(1, BINDER_EVIL_TABLE_SIDE_SCALE, easedProgress),
  );
  entry.group.position.set(
    THREE.MathUtils.lerp(entry.baseX, 0, easedProgress),
    entry.baseY + entry.slot * BINDER_EVIL_TABLE_SWAP_PATH_BEND * arc,
    entry.baseZ + BINDER_EVIL_TABLE_SWAP_SELECTED_LIFT * arc,
  );
  entry.group.scale.setScalar(
    THREE.MathUtils.lerp(BINDER_EVIL_TABLE_SIDE_SCALE, 1, easedProgress),
  );
  applyEvilBinderTableSetVisibility();

  if (linearProgress >= 1 && !state.committing) {
    state.committing = true;
    completeEvilBinderTableSwap(state).catch((error) => {
      console.error(error);
      if (binderEvilTableSwapState !== state) return;
      resetEvilBinderTableSwap();
      updateBinderPageControls();
      requestBinderRenderOnce();
    });
  }
  return true;
}

function resetEvilBinderTableSwap() {
  binderEvilTableSwapState = null;
  els.body.classList.remove("binder-table-swapping");
  if (binderActivePlacementRoot) {
    binderActivePlacementRoot.position.set(0, 0, 0);
    binderActivePlacementRoot.scale.setScalar(1);
  }
  for (const entry of binderEvilTableEntries) {
    entry.group.position.set(entry.baseX, entry.baseY, entry.baseZ);
    entry.group.scale.setScalar(BINDER_EVIL_TABLE_SIDE_SCALE);
  }
  applyEvilBinderTableSetVisibility();
}

async function completeEvilBinderTableSwap(state) {
  await state.collectionPromise;
  if (binderEvilTableSwapState !== state) return;
  commitActiveEvilBinderCollection(state.collectionId, {
    historyMode: "push",
    tableCollectionOrder: state.nextCollectionOrder,
  });
}

function commitActiveEvilBinderCollection(
  collectionId,
  {
    historyMode = "push",
    prepareBinder = true,
    tableCollectionOrder = null,
  } = {},
) {
  const destination = COLLECTION_CONFIGS[collectionId];
  if (
    !destination
    || destination.introGroup !== "evil"
    || !destination.cardsLoaded
    || !Array.isArray(destination.globalIndexes)
  ) {
    throw new Error(`Unable to activate ${collectionId} binder`);
  }
  if (prepareBinder) initBinderScene();

  saveSessionViewState();
  binderEvilTableSwapState = null;
  els.body.classList.remove("binder-table-swapping");
  if (binderActivePlacementRoot) {
    binderActivePlacementRoot.position.set(0, 0, 0);
    binderActivePlacementRoot.scale.setScalar(1);
  }

  if (binderEvilTableSetRoot) {
    binderEvilTableSetRoot.removeFromParent();
    disposeObject(binderEvilTableSetRoot);
  }
  binderEvilTableEntries = [];
  binderEvilTableSetOpacity = 0;

  binderEvilTableCollectionOrder = normalizeEvilBinderTableCollectionOrder(
    tableCollectionOrder,
    collectionId,
  );
  ACTIVE_COLLECTION_ID = collectionId;
  ACTIVE_COLLECTION = destination;
  ACTIVE_COLLECTION_INDEXES = destination.globalIndexes.slice();
  ACTIVE_TRAIT_CATEGORIES = destination.traitCategories;
  TRAIT_FILTERS_ENABLED = Boolean(destination.traitFiltersEnabled);
  SESSION_VIEW_STATE_KEY = `cardnft:${ACTIVE_COLLECTION_ID}:sessionView:v1`;
  document.documentElement.dataset.collectionId = collectionId;
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) canonicalLink.href = destination.path;

  if (historyMode === "push") {
    window.history.pushState(
      {
        ...(window.history.state || {}),
        evilBinderCollectionId: collectionId,
        evilBinderTableCollectionOrder: binderEvilTableCollectionOrder.slice(),
      },
      "",
      new URL(destination.path, window.location.origin).href,
    );
  } else if (historyMode === "replace") {
    window.history.replaceState(
      {
        ...(window.history.state || {}),
        evilBinderCollectionId: collectionId,
        evilBinderTableCollectionOrder: binderEvilTableCollectionOrder.slice(),
      },
      "",
      new URL(destination.path, window.location.origin).href,
    );
  }

  if (binderIntroNoteTexture) {
    binderIntroNoteTexture.dispose();
    binderIntroNoteTexture = null;
  }
  binderIntroNoteModeOpacity = 1;
  binderIntroNoteModeTargetOpacity = 1;
  binderIntroNoteFadeLastAt = 0;

  isBinderMode = true;
  resetGalleryFilters();
  setTraitInfoOpen(false);
  els.body.classList.toggle("trait-filters-disabled", !TRAIT_FILTERS_ENABLED);
  populateTraitSortOptions();
  updateGalleryViewModeButton();

  binderOuterFlipState = null;
  resetBinderOuterFlipTransform();
  binderTargetTurn = 0;
  binderTurn = 0;
  binderTargetClosure = -1;
  binderClosure = -1;
  binderSinglePageSide = BINDER_SINGLE_PAGE_COVER_SIDE;
  binderSinglePageSideTouched = true;
  binderFocusPosition = -1;
  binderIntroFocused = false;
  binderIndexesKey = "";
  binderTextureQueueKey = "";
  els.body.classList.remove("binder-focused");
  els.binderPanel.classList.remove("is-focused");

  if (binderPresentationRoot) {
    binderEvilTableSetRoot = createEvilBinderTableSet();
    binderPresentationRoot.add(binderEvilTableSetRoot);
    setBinderTableView(true, { immediate: true, updateControls: false });
  }

  if (prepareBinder) {
    const firstCardIndex = ACTIVE_COLLECTION_INDEXES[0] ?? 0;
    setCard(firstCardIndex, { deferAssets: true });
    renderGallery();
    updateBinderPageControls();
    renderBinderSceneOnce({ includePreload: false, immediateCamera: true });
  }
  queueSessionViewStateSave();
}

function initializeEvilBinderHistoryState() {
  if (!usesEvilBinderPresentation()) return;
  const collectionOrder = getEvilBinderTableCollectionOrder();
  const nextState = {
    ...(window.history.state || {}),
    evilBinderCollectionId: ACTIVE_COLLECTION_ID,
    evilBinderTableCollectionOrder: collectionOrder.slice(),
  };
  window.history.replaceState(nextState, "", window.location.href);
  window.addEventListener("popstate", handleEvilBinderHistoryNavigation);
}

function handleEvilBinderHistoryNavigation(event) {
  const collectionId = event.state?.evilBinderCollectionId
    || getEvilBinderCollectionIdForPath(window.location.pathname);
  const tableCollectionOrder = normalizeEvilBinderTableCollectionOrder(
    event.state?.evilBinderTableCollectionOrder,
    collectionId,
  );
  if (
    !collectionId
    || COLLECTION_CONFIGS[collectionId]?.introGroup !== "evil"
  ) {
    return;
  }
  if (collectionId === ACTIVE_COLLECTION_ID) return;

  Promise.all([
    ensureCollectionCards(collectionId),
    preloadCollectionBackTextures(collectionId),
  ])
    .then(() => {
      commitActiveEvilBinderCollection(collectionId, {
        historyMode: "none",
        tableCollectionOrder,
      });
      handleGalleryUrlNavigation().catch(console.error);
    })
    .catch(console.error);
}

function getEvilBinderCollectionIdForPath(pathname) {
  const normalizedPath = pathname === "/"
    ? "/"
    : `${pathname.replace(/\/+$/, "")}/`;
  return Object.values(COLLECTION_CONFIGS)
    .find((collection) => (
      collection.introGroup === "evil"
      && collection.path === normalizedPath
    ))
    ?.id || "";
}

function isBinderTableViewActive() {
  return binderTableViewTarget > 0.5
    || binderTableViewProgress > 0.001
    || Boolean(binderTableViewAnimation);
}

function toggleBinderTableView() {
  if (isBinderFocusView() || binderEvilTableSwapState) return;
  setBinderTableView(binderTableViewTarget < 0.5);
}

function setBinderTableView(active, {
  immediate = false,
  updateControls = true,
  durationMs = BINDER_TABLE_VIEW_DURATION_MS,
  easing = "in-out",
} = {}) {
  const nextTarget = active ? 1 : 0;
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  binderTableViewTarget = nextTarget;
  els.body.classList.toggle("binder-table-view", Boolean(nextTarget));
  queueSessionViewStateSave();
  if (active) {
    void ensureBinderTableSurfaceTextures();
    void ensureBinderTableDisplayModel();
    void ensureBinderTableAccessories();
  }

  if (immediate || reducedMotion || !binderRenderer) {
    binderTableViewProgress = nextTarget;
    binderTableViewAnimation = null;
    applyBinderTableViewProgress();
    if (updateControls) updateBinderPageControls();
    requestBinderRenderOnce();
    return;
  }

  if (
    binderTableViewAnimation
    && Math.abs(binderTableViewAnimation.to - nextTarget) < 0.001
  ) {
    if (updateControls) updateBinderPageControls();
    return;
  }
  if (
    !binderTableViewAnimation
    && Math.abs(binderTableViewProgress - nextTarget) < 0.001
  ) {
    if (updateControls) updateBinderPageControls();
    return;
  }

  binderTableViewAnimation = {
    from: binderTableViewProgress,
    to: nextTarget,
    startedAt: performance.now(),
    easing,
    duration: Math.max(
      Math.min(260, durationMs),
      durationMs * Math.abs(nextTarget - binderTableViewProgress),
    ),
  };
  if (updateControls) updateBinderPageControls();
  markBinderInteractionActive(durationMs + 120);
  startBinderRenderLoop();
}

function updateBinderTableViewAnimation(now = performance.now()) {
  const animation = binderTableViewAnimation;
  if (!animation) return false;

  const elapsed = Math.max(0, now - animation.startedAt);
  const linearProgress = clamp(elapsed / Math.max(1, animation.duration), 0, 1);
  const easedProgress = animation.easing === "out"
    ? 1 - Math.pow(1 - linearProgress, 3)
    : linearProgress < 0.5
      ? 4 * linearProgress * linearProgress * linearProgress
      : 1 - Math.pow(-2 * linearProgress + 2, 3) / 2;
  binderTableViewProgress = THREE.MathUtils.lerp(
    animation.from,
    animation.to,
    easedProgress,
  );
  if (linearProgress >= 1) {
    binderTableViewProgress = animation.to;
    binderTableViewAnimation = null;
  }
  applyBinderTableViewProgress();
  return true;
}

function applyBinderTableViewProgress() {
  if (!binderPresentationRoot || !binderTableGroup) return;

  const progress = clamp(binderTableViewProgress, 0, 1);
  const settle = progress;
  const scale = THREE.MathUtils.lerp(1, BINDER_TABLE_VIEW_SCALE, settle);
  binderPresentationRoot.position.set(
    0,
    THREE.MathUtils.lerp(0, BINDER_TABLE_VIEW_Y, settle),
    THREE.MathUtils.lerp(0, BINDER_TABLE_VIEW_Z, settle),
  );
  binderPresentationRoot.rotation.set(
    THREE.MathUtils.lerp(0, BINDER_TABLE_VIEW_TILT, settle),
    0,
    0,
  );
  binderPresentationRoot.scale.setScalar(scale);

  binderTableGroup.visible = progress > 0.001;
  binderTableGroup.position.set(
    0,
    THREE.MathUtils.lerp(BINDER_TABLE_Y + 0.38, BINDER_TABLE_Y, settle),
    THREE.MathUtils.lerp(BINDER_TABLE_Z - 0.34, BINDER_TABLE_Z, settle),
  );
  binderTableGroup.rotation.set(
    BINDER_TABLE_VIEW_TILT - THREE.MathUtils.degToRad(3) * (1 - settle),
    0,
    0,
  );
  const tableScale = THREE.MathUtils.lerp(0.965, 1, settle);
  binderTableGroup.scale.setScalar(tableScale);
  const tableOpacity = clamp(progress / 0.72, 0, 1);
  const tableOpaque = progress >= 0.999 && binderTableViewTarget > 0.5;
  for (let index = 0; index < binderTableMaterials.length; index += 1) {
    const material = binderTableMaterials[index];
    const transparent = !tableOpaque;
    if (material.transparent !== transparent || material.depthWrite === transparent) {
      material.transparent = transparent;
      material.depthWrite = !transparent;
      material.needsUpdate = true;
    }
    material.opacity = tableOpaque
      ? 1
      : tableOpacity * (index === 0 ? 0.94 : 0.985);
  }
  updateBinderTableDisplayModelVisibility();
  updateBinderTableAccessoryVisibility();
  applyEvilBinderTableSetVisibility();
}

function applyBinderTableCoverVisibility(progress) {
  if (!binderShellState) return;

  const visibility = clamp(progress, 0, 1);
  const palette = getBinderCoverColorPalette();
  for (const mesh of [
    binderShellState.leftCover,
    binderShellState.rightCover,
    binderShellState.spine,
  ]) {
    const material = mesh?.material;
    if (!material) continue;
    if (material.userData.binderColorFaithful) {
      material.color.setRGB(0, 0, 0);
      material.emissive.lerpColors(
        palette.base,
        palette.table,
        visibility,
      );
      material.emissiveIntensity = 1;
      continue;
    }
    material.color.lerpColors(
      palette.base,
      palette.table,
      visibility,
    );
    material.emissive.lerpColors(
      palette.baseEmissive,
      palette.tableEmissive,
      visibility,
    );
    material.emissiveIntensity = THREE.MathUtils.lerp(
      BINDER_COVER_BASE_EMISSIVE_INTENSITY,
      BINDER_COVER_TABLE_EMISSIVE_INTENSITY,
      visibility,
    );
  }
  const ringDepthScale = THREE.MathUtils.lerp(
    1,
    BINDER_TABLE_RING_DEPTH_SCALE,
    visibility,
  );
  for (const ring of binderShellState.rings) {
    ring.scale.set(BINDER_RING_SCALE_X, ringDepthScale, 1);
  }
  const tableSeamZ = binderShellState.coverZ + BINDER_COVER_THICKNESS / 2 + 0.013;
  binderShellState.seam.position.z = THREE.MathUtils.lerp(
    0.075,
    tableSeamZ,
    visibility,
  );
  binderShellState.seam.renderOrder = visibility > 0.001
    ? BINDER_TABLE_COVER_RENDER_ORDER + 1
    : 0;
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

  const nextKey = indexes.map((index) => (
    `${favoriteKey(index)}:${getBinderCardStickerKinds(CARDS[index]).join(",")}`
  )).join("\u001f");
  if (nextKey === binderIndexesKey) {
    updateBinderPageControls();
    if (isBinderFocused()) {
      scheduleFocusedBinderCardPrewarm();
    } else {
      cancelFocusedBinderCardPrewarm();
    }
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
  binderTargetClosure = clamp(binderTargetClosure, -1, 1);
  binderClosure = clamp(binderClosure, -1, 1);
  if (binderTargetClosure < 0) binderTargetTurn = 0;
  if (binderTargetClosure > 0) binderTargetTurn = binderPageCount;
  if (binderClosure < 0) binderTurn = 0;
  if (binderClosure > 0) binderTurn = binderPageCount;
  els.binderLoading.hidden = true;
  loadBinderBackTexture(token);
  updateBinderPageControls();
  if (isBinderFocused()) {
    scheduleFocusedBinderCardPrewarm();
  } else {
    cancelFocusedBinderCardPrewarm();
  }
  resizeBinderRenderer();
  renderBinderSceneOnce({ includePreload: false, immediateCamera: true });
  queueBinderTextureLoads(token, { force: true, includePreload: false });
  requestBinderMaintenance(BINDER_INITIAL_PRELOAD_IDLE_DELAY_MS);
}

function createBinderModel(indexes, placeholderTexture) {
  const model = new THREE.Group();
  model.add(createBinderShell());

  const materials = createBinderPageMaterials(indexes);
  const pageIndexes = getBinderPageWindowIndexes();
  binderPageWindowKey = pageIndexes.join(",");
  for (const pageIndex of pageIndexes) {
    const page = createBinderPage(pageIndex, indexes, placeholderTexture, materials);
    model.add(page.group);
    binderPages.push(page);
  }
  if (materials.plastic) materials.plastic.dispose();
  if (materials.seam) materials.seam.dispose();
  if (materials.pageBacking) materials.pageBacking.dispose();
  if (materials.pocketBacking) materials.pocketBacking.dispose();

  updateBinderPageTransforms();
  return model;
}

function createBinderShell() {
  binderShellState = null;
  binderIntroNoteGroup = null;
  binderIntroNoteMesh = null;
  binderIntroLinkMeshes = [];
  binderIntroFocusMeshes = [];
  binderShellState = createBinderCoverShellModel({
    collectionId: ACTIVE_COLLECTION_ID,
    includeIntroNote: true,
  });
  updateBinderShellTransforms();
  return binderShellState.shell;
}

function createBinderCoverShellModel({
  collectionId = ACTIVE_COLLECTION_ID,
  includeIntroNote = false,
  emblemActive = false,
} = {}) {
  const shell = new THREE.Group();
  const coverMaterial = createBinderCoverMaterial();
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2927,
    roughness: 0.82,
    metalness: 0.12,
    emissive: 0x020202,
    emissiveIntensity: 0.08,
    transparent: true,
    depthWrite: false,
  });
  const spineHalfWidth = BINDER_COVER_SPINE_WIDTH / 2;
  const coverWidth = BINDER_COVER_OUTER_X - spineHalfWidth;
  const coverHeight = BINDER_PAGE_HEIGHT + BINDER_COVER_VERTICAL_OVERHANG;
  const spineHeight = coverHeight - 0.04;
  const coverZ = BINDER_COVER_Z;
  const leftCoverGeometry = createBinderCoverPanelGeometry(
    coverWidth,
    coverHeight,
    BINDER_COVER_THICKNESS,
    BINDER_COVER_RADIUS,
    -1,
  );
  const rightCoverGeometry = createBinderCoverPanelGeometry(
    coverWidth,
    coverHeight,
    BINDER_COVER_THICKNESS,
    BINDER_COVER_RADIUS,
    1,
  );

  const leftPivot = new THREE.Group();
  leftPivot.position.set(-spineHalfWidth, 0, coverZ);
  const leftCover = new THREE.Mesh(leftCoverGeometry, coverMaterial);
  leftCover.position.x = -coverWidth / 2;
  leftPivot.add(leftCover);
  const frontCoverEmblem = createBinderFrontCoverEmblem(
    coverWidth,
    coverHeight,
    collectionId,
    { active: emblemActive },
  );
  frontCoverEmblem.rotation.y = Math.PI;
  frontCoverEmblem.position.set(
    leftCover.position.x,
    coverHeight * getBinderFrontCoverEmblemYRatio(collectionId),
    -BINDER_COVER_THICKNESS / 2 - 0.012,
  );
  leftPivot.add(frontCoverEmblem);
  const walletCoverArtwork = createBinderWalletCoverArtwork(
    coverWidth,
    coverHeight,
    { active: emblemActive },
  );
  walletCoverArtwork.rotation.y = Math.PI;
  walletCoverArtwork.position.set(
    leftCover.position.x,
    0,
    -BINDER_COVER_THICKNESS / 2 - 0.014,
  );
  leftPivot.add(walletCoverArtwork);
  if (includeIntroNote) {
    const introNote = createBinderIntroNote(coverWidth, coverHeight);
    introNote.position.set(
      leftCover.position.x,
      0,
      BINDER_COVER_THICKNESS / 2 + 0.008,
    );
    leftPivot.add(introNote);
  }
  shell.add(leftPivot);

  const rightPivot = new THREE.Group();
  rightPivot.position.set(spineHalfWidth, 0, coverZ);
  const rightCover = new THREE.Mesh(rightCoverGeometry, coverMaterial.clone());
  rightCover.position.x = coverWidth / 2;
  rightPivot.add(rightCover);
  const walletBackCoverArtwork = createBinderWalletBackCoverArtwork(
    coverWidth,
    coverHeight,
    { active: emblemActive },
  );
  walletBackCoverArtwork.rotation.y = Math.PI;
  walletBackCoverArtwork.position.set(
    rightCover.position.x,
    0,
    -BINDER_COVER_THICKNESS / 2 - 0.014,
  );
  rightPivot.add(walletBackCoverArtwork);
  shell.add(rightPivot);

  const spineGeometry = new THREE.PlaneGeometry(
    BINDER_COVER_SPINE_WIDTH,
    spineHeight,
    BINDER_COVER_SPINE_SEGMENTS,
    1,
  );
  const spineMaterial = coverMaterial.clone();
  spineMaterial.side = THREE.DoubleSide;
  const spine = new THREE.Mesh(spineGeometry, spineMaterial);
  shell.add(spine);

  const seam = new THREE.Mesh(
    new THREE.BoxGeometry(
      0.035,
      spineHeight * BINDER_SPINE_SEAM_HEIGHT_RATIO,
      0.012,
    ),
    new THREE.MeshBasicMaterial({
      color: 0x050505,
      depthWrite: true,
      depthTest: true,
      transparent: true,
    }),
  );
  seam.position.set(0, 0, 0.075);
  shell.add(seam);

  const rings = [];
  for (const y of [-BINDER_PAGE_HEIGHT * 0.32, 0, BINDER_PAGE_HEIGHT * 0.32]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(
        0.24,
        0.018,
        12,
        28,
        BINDER_RING_VISIBLE_ARC,
      ),
      ringMaterial,
    );
    ring.position.set(0, y, 0.065);
    ring.rotation.x = Math.PI / 2;
    ring.scale.x = BINDER_RING_SCALE_X;
    shell.add(ring);
    rings.push(ring);
  }

  return {
    shell,
    leftPivot,
    leftCover,
    frontCoverEmblem,
    walletCoverArtwork,
    rightPivot,
    rightCover,
    walletBackCoverArtwork,
    spine,
    spineGeometry,
    seam,
    rings,
    ringMaterial,
    coverZ,
    spineHalfWidth,
    coverWidth,
    coverHeight,
  };
}

function updateBinderShellTransforms() {
  if (!binderShellState) return;

  const { direction, progress } = applyBinderShellClosureGeometry(
    binderShellState,
    binderClosure,
  );
  const {
    leftCover,
    frontCoverEmblem,
    walletCoverArtwork,
    rightCover,
    walletBackCoverArtwork,
    spine,
  } = binderShellState;

  setBinderClosingShellLayer(leftCover, direction < 0 && progress > 0.001);
  setBinderFrontCoverEmblemLayer(
    frontCoverEmblem,
    direction < 0 && progress >= BINDER_FRONT_COVER_EMBLEM_VISIBLE_PROGRESS,
  );
  setBinderWalletCoverArtworkLayer(
    walletCoverArtwork,
    direction < 0 && progress >= BINDER_FRONT_COVER_EMBLEM_VISIBLE_PROGRESS,
  );
  setBinderClosingShellLayer(rightCover, direction > 0 && progress > 0.001);
  setBinderWalletBackCoverArtworkLayer(
    walletBackCoverArtwork,
    direction > 0 && progress >= BINDER_FRONT_COVER_EMBLEM_VISIBLE_PROGRESS,
  );
  setBinderClosingShellLayer(spine, false);
  setBinderIntroCoverLayer(direction < 0 && progress > 0.001);
  updateBinderRootHorizontalCentering(direction, progress);
  applyEvilBinderTableSetVisibility();
  updateBinderDefaultCameraFrame();
}

function applyBinderShellClosureGeometry(shellState, closure) {
  const {
    leftPivot,
    rightPivot,
    spine,
    spineGeometry,
    seam,
    rings,
    ringMaterial,
    coverZ,
    spineHalfWidth,
  } = shellState;
  const signedClosure = clamp(closure, -1, 1);
  const direction = Math.sign(signedClosure);
  const progress = easeInOut(Math.abs(signedClosure));
  const angle = Math.PI * progress;
  const hasArc = angle > 0.00001;
  const currentArcLength = THREE.MathUtils.lerp(
    BINDER_COVER_SPINE_WIDTH,
    BINDER_COVER_SPINE_ARC_LENGTH,
    progress,
  );
  const radius = hasArc ? currentArcLength / angle : 0;

  leftPivot.position.set(-spineHalfWidth, 0, coverZ);
  leftPivot.rotation.set(0, 0, 0);
  rightPivot.position.set(spineHalfWidth, 0, coverZ);
  rightPivot.rotation.set(0, 0, 0);

  if (direction < 0 && hasArc) {
    leftPivot.position.set(
      spineHalfWidth - radius * Math.sin(angle),
      0,
      coverZ + radius * (1 - Math.cos(angle)),
    );
    leftPivot.rotation.y = angle;
  } else if (direction > 0 && hasArc) {
    rightPivot.position.set(
      -spineHalfWidth + radius * Math.sin(angle),
      0,
      coverZ + radius * (1 - Math.cos(angle)),
    );
    rightPivot.rotation.y = -angle;
  }

  const positions = spineGeometry.getAttribute("position");
  const columns = BINDER_COVER_SPINE_SEGMENTS + 1;
  for (let index = 0; index < positions.count; index += 1) {
    const u = (index % columns) / BINDER_COVER_SPINE_SEGMENTS;
    let x = -spineHalfWidth + u * BINDER_COVER_SPINE_WIDTH;
    let z = coverZ;
    if (direction < 0 && hasArc) {
      const arcProgress = 1 - u;
      x = spineHalfWidth - radius * Math.sin(angle * arcProgress);
      z = coverZ + radius * (1 - Math.cos(angle * arcProgress));
    } else if (direction > 0 && hasArc) {
      const arcProgress = u;
      x = -spineHalfWidth + radius * Math.sin(angle * arcProgress);
      z = coverZ + radius * (1 - Math.cos(angle * arcProgress));
    }
    positions.setX(index, x);
    positions.setZ(index, z);
  }
  positions.needsUpdate = true;
  spineGeometry.computeVertexNormals();
  spine.visible = true;

  const hardwareOpacity = 1 - easeInOut(clamp(progress * 1.35, 0, 1));
  seam.material.opacity = hardwareOpacity;
  seam.visible = hardwareOpacity > 0.01;
  const ringOpacity = hardwareOpacity * hardwareOpacity;
  ringMaterial.opacity = ringOpacity;
  for (const ring of rings) ring.visible = ringOpacity > 0.01;
  return { direction, progress };
}

function updateBinderRootHorizontalCentering(direction, progress) {
  if (!binderRoot) return;

  if (binderOuterFlipState) {
    const visualSide = binderOuterFlipState.swapped
      ? binderOuterFlipState.toSide
      : binderOuterFlipState.fromSide;
    const localCenterX = -visualSide * BINDER_CLOSED_COVER_CENTER_X;
    const rotationY = binderRoot.rotation.y;
    const projectedCenterX = Math.cos(rotationY) * localCenterX
      + Math.sin(rotationY) * BINDER_CLOSED_COVER_CENTER_Z;
    binderRoot.position.x = -projectedCenterX;
    return;
  }

  binderRoot.position.x = direction
    * BINDER_CLOSED_COVER_CENTER_X
    * progress;
}

function setBinderClosingShellLayer(mesh, active, orderOffset = 0) {
  if (!mesh?.material) return;
  const tableLayer = !active && binderTableViewProgress > 0.001;
  const transparent = active || tableLayer;
  const depthWrite = !active;
  mesh.renderOrder = active
    ? BINDER_CLOSING_COVER_RENDER_ORDER + orderOffset
    : tableLayer
      ? BINDER_TABLE_COVER_RENDER_ORDER
      : 0;
  if (
    mesh.material.transparent === transparent
    && mesh.material.depthWrite === depthWrite
  ) {
    return;
  }
  mesh.material.transparent = transparent;
  mesh.material.opacity = 1;
  mesh.material.depthWrite = depthWrite;
  mesh.material.needsUpdate = true;
}

function createBinderWalletCoverArtwork(
  coverWidth,
  coverHeight,
  { active = false } = {},
) {
  const settings = normalizeBinderCoverSettings(walletRouteProfile?.cover);
  const source = getBinderCoverSurfaceTextureKey(settings, "front");
  const enabled = Boolean(WALLET_ROUTE_ADDRESS && source);
  const cachedTexture = enabled && binderWalletCoverArtworkSource === source
    ? binderWalletCoverArtworkTexture
    : null;
  const material = new THREE.MeshBasicMaterial({
    map: cachedTexture,
    transparent: true,
    opacity: 1,
    toneMapped: false,
    side: THREE.FrontSide,
    depthWrite: false,
    depthTest: true,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(coverWidth, coverHeight), material);
  mesh.userData.binderWalletCoverArtworkActive = Boolean(enabled && active);
  mesh.userData.binderWalletCoverArtworkLoaded = Boolean(cachedTexture);
  mesh.visible = Boolean(mesh.userData.binderWalletCoverArtworkActive && cachedTexture);

  if (enabled && !cachedTexture) {
    getBinderWalletCoverArtworkTexture(settings, coverWidth, coverHeight)
      .then((texture) => {
        if (!mesh.parent) return;
        material.map = texture;
        material.needsUpdate = true;
        mesh.userData.binderWalletCoverArtworkLoaded = true;
        mesh.visible = Boolean(mesh.userData.binderWalletCoverArtworkActive);
        requestBinderRenderOnce();
      })
      .catch((error) => {
        if (!/changed while loading/i.test(error?.message || "")) console.error(error);
      });
  }
  return mesh;
}

function setBinderWalletCoverArtworkLayer(mesh, active) {
  if (!mesh) return;
  mesh.userData.binderWalletCoverArtworkActive = Boolean(active);
  mesh.visible = Boolean(active && mesh.userData.binderWalletCoverArtworkLoaded);
  mesh.renderOrder = active ? BINDER_CLOSING_COVER_RENDER_ORDER + 2 : 0;
}

function getBinderWalletCoverArtworkTexture(settings, coverWidth, coverHeight) {
  const source = getBinderCoverSurfaceTextureKey(settings, "front");
  if (binderWalletCoverArtworkTexture && binderWalletCoverArtworkSource === source) {
    return Promise.resolve(binderWalletCoverArtworkTexture);
  }
  if (binderWalletCoverArtworkPromise && binderWalletCoverArtworkSource === source) {
    return binderWalletCoverArtworkPromise;
  }

  const token = binderWalletCoverArtworkToken;
  binderWalletCoverArtworkSource = source;
  binderWalletCoverArtworkPromise = createBinderCoverSurfaceTexture(
    settings,
    "front",
    coverWidth,
    coverHeight,
  )
    .then((texture) => {
      if (token !== binderWalletCoverArtworkToken || source !== binderWalletCoverArtworkSource) {
        texture.dispose();
        throw new Error("Binder cover artwork changed while loading");
      }
      binderWalletCoverArtworkTexture?.dispose();
      binderWalletCoverArtworkTexture = texture;
      return texture;
    })
    .finally(() => {
      if (source === binderWalletCoverArtworkSource) binderWalletCoverArtworkPromise = null;
    });
  return binderWalletCoverArtworkPromise;
}

function createBinderWalletBackCoverArtwork(
  coverWidth,
  coverHeight,
  { active = false } = {},
) {
  const settings = normalizeBinderCoverSettings(walletRouteProfile?.cover);
  const source = getBinderCoverSurfaceTextureKey(settings, "back");
  const enabled = Boolean(WALLET_ROUTE_ADDRESS && source);
  const cachedTexture = enabled
    && binderWalletBackCoverArtworkSource === source
    ? binderWalletBackCoverArtworkTexture
    : null;
  const material = new THREE.MeshBasicMaterial({
    map: cachedTexture,
    transparent: true,
    opacity: 1,
    toneMapped: false,
    side: THREE.FrontSide,
    depthWrite: false,
    depthTest: true,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(coverWidth, coverHeight), material);
  mesh.userData.binderWalletBackCoverArtworkActive = Boolean(enabled && active);
  mesh.userData.binderWalletBackCoverArtworkLoaded = Boolean(cachedTexture);
  mesh.visible = Boolean(mesh.userData.binderWalletBackCoverArtworkActive && cachedTexture);

  if (enabled && !cachedTexture) {
    getBinderWalletBackCoverArtworkTexture(settings, coverWidth, coverHeight)
      .then((texture) => {
        if (!mesh.parent) return;
        material.map = texture;
        material.needsUpdate = true;
        mesh.userData.binderWalletBackCoverArtworkLoaded = true;
        mesh.visible = Boolean(mesh.userData.binderWalletBackCoverArtworkActive);
        requestBinderRenderOnce();
      })
      .catch((error) => {
        if (!/changed while loading/i.test(error?.message || "")) console.error(error);
      });
  }
  return mesh;
}

function setBinderWalletBackCoverArtworkLayer(mesh, active) {
  if (!mesh) return;
  mesh.userData.binderWalletBackCoverArtworkActive = Boolean(active);
  mesh.visible = Boolean(active && mesh.userData.binderWalletBackCoverArtworkLoaded);
  mesh.renderOrder = active ? BINDER_CLOSING_COVER_RENDER_ORDER + 2 : 0;
}

function getBinderWalletBackCoverArtworkTexture(settings, coverWidth, coverHeight) {
  const source = getBinderCoverSurfaceTextureKey(settings, "back");
  if (
    binderWalletBackCoverArtworkTexture
    && binderWalletBackCoverArtworkSource === source
  ) {
    return Promise.resolve(binderWalletBackCoverArtworkTexture);
  }
  if (
    binderWalletBackCoverArtworkPromise
    && binderWalletBackCoverArtworkSource === source
  ) {
    return binderWalletBackCoverArtworkPromise;
  }

  const token = binderWalletCoverArtworkToken;
  binderWalletBackCoverArtworkSource = source;
  binderWalletBackCoverArtworkPromise = createBinderCoverSurfaceTexture(
    settings,
    "back",
    coverWidth,
    coverHeight,
  )
    .then((texture) => {
      if (
        token !== binderWalletCoverArtworkToken
        || source !== binderWalletBackCoverArtworkSource
      ) {
        texture.dispose();
        throw new Error("Binder back cover artwork changed while loading");
      }
      binderWalletBackCoverArtworkTexture?.dispose();
      binderWalletBackCoverArtworkTexture = texture;
      return texture;
    })
    .finally(() => {
      if (source === binderWalletBackCoverArtworkSource) {
        binderWalletBackCoverArtworkPromise = null;
      }
    });
  return binderWalletBackCoverArtworkPromise;
}

function getBinderCoverSurfaceTextureKey(settings, surface) {
  const stickers = settings.stickers.filter((sticker) => sticker.surface === surface);
  const text = getBinderOutsideCoverTextSettings(settings, surface);
  const artwork = surface === "back"
    ? {
      dataUrl: settings.backArtworkDataUrl,
      x: settings.backArtworkX,
      y: settings.backArtworkY,
      scale: settings.backArtworkScale,
      rotation: settings.backArtworkRotation,
    }
    : {
      dataUrl: settings.artworkDataUrl,
      x: settings.artworkX,
      y: settings.artworkY,
      scale: settings.artworkScale,
      rotation: settings.artworkRotation,
    };
  if (!artwork.dataUrl && !text.text && !stickers.length) return "";
  return JSON.stringify({ surface, artwork, text, stickers });
}

function getBinderOutsideCoverTextSettings(settings, surface = "front") {
  const isBack = surface === "back";
  return {
    text: isBack ? settings.backText : settings.frontText,
    color: isBack ? settings.backTextColor : settings.frontTextColor,
    x: isBack ? settings.backTextX : settings.frontTextX,
    y: isBack ? settings.backTextY : settings.frontTextY,
    width: isBack ? settings.backTextWidth : settings.frontTextWidth,
    height: isBack ? settings.backTextHeight : settings.frontTextHeight,
    fontSize: isBack ? settings.backFontSize : settings.frontFontSize,
    rotation: isBack ? settings.backTextRotation : settings.frontTextRotation,
  };
}

async function createBinderCoverSurfaceTexture(settings, surfaceName, coverWidth, coverHeight) {
  const surface = document.createElement("canvas");
  surface.width = 1024;
  surface.height = Math.max(1, Math.round(surface.width * coverHeight / coverWidth));
  const context = surface.getContext("2d", { alpha: true });
  context.clearRect(0, 0, surface.width, surface.height);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  await drawBinderCoverSurfaceContent(context, settings, surfaceName);
  return configureDisplayTexture(new THREE.CanvasTexture(surface));
}

async function renderWalletBinderDirectoryCover(canvas, rawSettings) {
  const settings = normalizeBinderCoverSettings(rawSettings);
  drawDefaultWalletBinderDirectoryCover(canvas, settings.baseColor);
  const context = canvas.getContext("2d", { alpha: false });
  await drawBinderCoverSurfaceContent(context, settings, "front", {
    fetchPriority: "auto",
    ignoreImageErrors: true,
  });
}

function drawDefaultWalletBinderDirectoryCover(
  canvas,
  baseColor = BINDER_COVER_DEFAULT_COLOR_HEX,
) {
  const context = canvas.getContext("2d", { alpha: false });
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = /^#[0-9a-f]{6}$/i.test(baseColor)
    ? baseColor
    : BINDER_COVER_DEFAULT_COLOR_HEX;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const glow = context.createRadialGradient(
    canvas.width * 0.32,
    canvas.height * 0.22,
    0,
    canvas.width * 0.32,
    canvas.height * 0.22,
    canvas.width * 0.88,
  );
  glow.addColorStop(0, "rgba(255,255,255,0.085)");
  glow.addColorStop(0.48, "rgba(255,255,255,0.018)");
  glow.addColorStop(1, "rgba(0,0,0,0.19)");
  context.fillStyle = glow;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

async function drawBinderCoverSurfaceContent(
  context,
  settings,
  surfaceName,
  { fetchPriority = "high", ignoreImageErrors = false } = {},
) {
  const surface = context.canvas;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  const artworkUrl = surfaceName === "back"
    ? settings.backArtworkDataUrl
    : settings.artworkDataUrl;
  const artworkImage = artworkUrl
    ? await loadTextureImage(artworkUrl, { fetchPriority }).catch((error) => {
      if (ignoreImageErrors) return null;
      throw error;
    })
    : null;
  if (artworkImage) {
    const imageWidth = artworkImage.naturalWidth || artworkImage.width;
    const imageHeight = artworkImage.naturalHeight || artworkImage.height;
    const containScale = Math.min(
      surface.width / Math.max(1, imageWidth),
      surface.height / Math.max(1, imageHeight),
    );
    const artworkScale = surfaceName === "back"
      ? settings.backArtworkScale
      : settings.artworkScale;
    const artworkRotation = surfaceName === "back"
      ? settings.backArtworkRotation
      : settings.artworkRotation;
    const centerX = (surfaceName === "back" ? settings.backArtworkX : settings.artworkX)
      * surface.width;
    const centerY = (surfaceName === "back" ? settings.backArtworkY : settings.artworkY)
      * surface.height;
    const width = imageWidth * containScale * artworkScale;
    const height = imageHeight * containScale * artworkScale;
    context.save();
    context.translate(centerX, centerY);
    context.rotate(artworkRotation * Math.PI / 180);
    context.drawImage(artworkImage, -width / 2, -height / 2, width, height);
    context.restore();
  }

  const text = getBinderOutsideCoverTextSettings(settings, surfaceName);
  if (text.text) {
    const box = {
      x: (text.x - text.width / 2) * surface.width,
      y: (text.y - text.height / 2) * surface.height,
      width: text.width * surface.width,
      height: text.height * surface.height,
    };
    drawRotatedBinderCustomText(context, {
      text: text.text,
      links: [],
      box,
      fontSize: text.fontSize * context.canvas.width / 1024,
      fontStack: SITE_FONT_STACK,
      textFillStyle: text.color,
      linkFillStyle: text.color,
    }, text.rotation);
  }

  const stickers = settings.stickers.filter((sticker) => sticker.surface === surfaceName);
  const stickerImages = await Promise.all(stickers.map((sticker) => (
    loadTextureImage(sticker.imageUrl, { fetchPriority })
      .then((image) => ({ sticker, image }))
      .catch(() => null)
  )));
  for (const entry of stickerImages) {
    if (entry) drawBinderCoverStickerImage(context, entry.sticker, entry.image);
  }
}

function drawBinderCoverStickerImage(context, sticker, image) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const width = sticker.scale * context.canvas.width;
  const height = width * imageHeight / Math.max(1, imageWidth);
  const centerX = sticker.x * context.canvas.width;
  const centerY = sticker.y * context.canvas.height;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(sticker.rotation * Math.PI / 180);
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();
}

function createBinderFrontCoverEmblem(
  coverWidth,
  coverHeight,
  collectionId = ACTIVE_COLLECTION_ID,
  { active = false } = {},
) {
  const emblemEnabled = (
    !WALLET_ROUTE_ADDRESS
    &&
    COLLECTION_CONFIGS[collectionId]?.introGroup === "evil"
  );
  const emblemAspect = getBinderFrontCoverEmblemAspect(collectionId);
  let emblemHeight = coverHeight * BINDER_FRONT_COVER_EMBLEM_HEIGHT_RATIO;
  let emblemWidth = emblemHeight * emblemAspect;
  const maxWidth = coverWidth * 0.76;
  if (emblemWidth > maxWidth) {
    emblemWidth = maxWidth;
    emblemHeight = emblemWidth / emblemAspect;
  }
  const emblemScale = getBinderFrontCoverEmblemScale(collectionId);
  emblemWidth *= emblemScale;
  emblemHeight *= emblemScale;

  const cachedTexture = emblemEnabled
    ? binderFrontCoverEmblemTextures.get(collectionId) || null
    : null;
  const material = new THREE.MeshBasicMaterial({
    map: cachedTexture,
    transparent: true,
    opacity: cachedTexture ? 0.92 : 0,
    toneMapped: false,
    side: THREE.FrontSide,
    depthWrite: false,
    depthTest: true,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(emblemWidth, emblemHeight), material);
  mesh.visible = Boolean(emblemEnabled && active && cachedTexture);
  mesh.userData.binderFrontCoverEmblemLoaded = Boolean(cachedTexture);
  mesh.userData.binderFrontCoverEmblemActive = Boolean(
    emblemEnabled && active
  );
  mesh.userData.binderFrontCoverEmblemOpacity = 0.92;
  mesh.userData.binderFrontCoverEmblemCollectionId = collectionId;

  if (emblemEnabled) {
    getBinderFrontCoverEmblemTexture(collectionId)
      .then((texture) => {
        if (!mesh.parent) return;
        material.map = texture;
        material.opacity = mesh.userData.binderFrontCoverEmblemOpacity;
        material.needsUpdate = true;
        mesh.userData.binderFrontCoverEmblemLoaded = true;
        mesh.visible = Boolean(mesh.userData.binderFrontCoverEmblemActive);
        requestBinderRenderOnce();
      })
      .catch(console.error);
  }

  return mesh;
}

function getBinderFrontCoverEmblemAsset(collectionId = ACTIVE_COLLECTION_ID) {
  return COLLECTION_CONFIGS[collectionId]?.coverEmblem
    || BINDER_FRONT_COVER_EMBLEM_DEFAULT_ASSET;
}

function getBinderFrontCoverEmblemAspect(collectionId = ACTIVE_COLLECTION_ID) {
  const aspect = Number(COLLECTION_CONFIGS[collectionId]?.coverEmblemAspect);
  return Number.isFinite(aspect) && aspect > 0
    ? aspect
    : BINDER_FRONT_COVER_EMBLEM_DEFAULT_ASPECT;
}

function getBinderFrontCoverEmblemScale(collectionId = ACTIVE_COLLECTION_ID) {
  const scale = Number(COLLECTION_CONFIGS[collectionId]?.coverEmblemScale);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

function getBinderFrontCoverEmblemYRatio(collectionId = ACTIVE_COLLECTION_ID) {
  const yRatio = Number(COLLECTION_CONFIGS[collectionId]?.coverEmblemYRatio);
  return Number.isFinite(yRatio) ? yRatio : BINDER_FRONT_COVER_EMBLEM_Y_RATIO;
}

function getBinderFrontCoverEmblemTexture(collectionId = ACTIVE_COLLECTION_ID) {
  const cachedTexture = binderFrontCoverEmblemTextures.get(collectionId);
  if (cachedTexture) return Promise.resolve(cachedTexture);
  const cachedPromise = binderFrontCoverEmblemTexturePromises.get(collectionId);
  if (cachedPromise) return cachedPromise;

  const url = new URL(getBinderFrontCoverEmblemAsset(collectionId), import.meta.url).href;
  const texturePromise = loadTexture(url)
    .then((texture) => {
      binderFrontCoverEmblemTextures.set(collectionId, texture);
      binderFrontCoverEmblemTexturePromises.delete(collectionId);
      return texture;
    })
    .catch((error) => {
      binderFrontCoverEmblemTexturePromises.delete(collectionId);
      throw error;
    });
  binderFrontCoverEmblemTexturePromises.set(collectionId, texturePromise);
  return texturePromise;
}

function setBinderFrontCoverEmblemLayer(mesh, active) {
  if (!mesh) return;
  mesh.userData.binderFrontCoverEmblemActive = active;
  mesh.visible = Boolean(active && mesh.userData.binderFrontCoverEmblemLoaded);
  mesh.renderOrder = active ? BINDER_CLOSING_COVER_RENDER_ORDER + 1 : 0;
}

function setBinderFrontCoverEmblemOpacity(mesh, opacity) {
  if (!mesh?.material) return;
  const nextOpacity = clamp(opacity, 0, 0.92);
  mesh.userData.binderFrontCoverEmblemOpacity = nextOpacity;
  mesh.material.opacity = nextOpacity;
  mesh.visible = Boolean(
    nextOpacity > 0.001
    && mesh.userData.binderFrontCoverEmblemActive
    && mesh.userData.binderFrontCoverEmblemLoaded
  );
}

function setBinderIntroCoverLayer(active) {
  if (!binderIntroNoteGroup) return;
  binderIntroNoteGroup.traverse((child) => {
    if (!child.isMesh) return;
    if (!Number.isFinite(child.userData.binderIntroBaseRenderOrder)) {
      child.userData.binderIntroBaseRenderOrder = child.renderOrder;
    }
    child.renderOrder = active
      ? BINDER_CLOSING_COVER_RENDER_ORDER + 2 + child.userData.binderIntroBaseRenderOrder
      : child.userData.binderIntroBaseRenderOrder;
  });
}

function createBinderIntroNote(coverWidth, coverHeight) {
  const walletCover = Boolean(WALLET_ROUTE_ADDRESS);
  const noteWidth = coverWidth * (walletCover ? 1 : 0.7);
  const noteHeight = coverHeight * (walletCover ? 1 : 0.31);
  const { texture, linkBounds, focusBounds } = createBinderIntroNoteTexture(
    coverWidth,
    coverHeight,
  );
  const note = new THREE.Group();

  const noteMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(noteWidth, noteHeight),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      toneMapped: false,
      side: THREE.FrontSide,
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
  if (!usesEvilBinderPresentation()) return [];

  const textureLoader = new THREE.TextureLoader();
  return BINDER_INTRO_SPRITES.flatMap((sprite) => {
    const size = coverHeight * sprite.sizeRatio;
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      toneMapped: false,
      side: THREE.FrontSide,
      depthWrite: false,
      depthTest: true,
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
    getBinderIntroSpriteTexture(sprite.url)
      .then((texture) => {
        if (!mesh.parent) return;
        material.map = texture;
        material.opacity = 0.92;
        material.needsUpdate = true;
        requestBinderRenderOnce();
      })
      .catch(console.error);

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

function createBinderPageMaterials(indexes = []) {
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

  const pageBacking = usesDedicatedClearBinderPageBacking(indexes)
    ? new THREE.MeshBasicMaterial({
      color: CLEAR_BINDER_PAGE_COLOR,
      transparent: true,
      opacity: CLEAR_BINDER_PAGE_OPACITY,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
    })
    : null;
  if (pageBacking) pageBacking.forceSinglePass = true;

  const pocketBacking = !pageBacking && indexes.some((index) => (
    CARDS[index]?.collection === "clear"
  ))
    ? new THREE.MeshBasicMaterial({
      color: CLEAR_BINDER_PAGE_COLOR,
      transparent: true,
      opacity: CLEAR_BINDER_POCKET_OPACITY,
      side: THREE.FrontSide,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
    })
    : null;
  if (pocketBacking) pocketBacking.forceSinglePass = true;

  return { plastic, seam, pageBacking, pocketBacking };
}

function usesDedicatedClearBinderPageBacking(indexes) {
  return ACTIVE_COLLECTION_ID === "clear"
    && !favoritesOnly
    && !walletFilterCardIndexSet
    && indexes.length > 0
    && indexes.every((index) => CARDS[index]?.collection === "clear");
}

function createBinderPage(pageIndex, indexes, placeholderTexture, materials) {
  const group = new THREE.Group();
  group.position.set(0, 0, -pageIndex * BINDER_PAGE_STACK_GAP);
  group.userData.pageIndex = pageIndex;

  if (materials.pageBacking) addClearBinderPageBacking(group, materials.pageBacking);

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
        addClearBinderPocketBacking(
          cell.group,
          materials.pocketBacking,
          frontCardIndex,
          1,
          frontOffset,
        );
        const readyTexture = getReadyBinderTexture(CARDS[frontCardIndex]);
        const card = createBinderCard(
          readyTexture || placeholderTexture,
          frontCardIndex,
          1,
          frontOffset,
          { textureLoaded: Boolean(readyTexture) },
        );
        cell.group.add(card);
        cell.group.add(createBinderLoadingRing(card, 1, frontOffset));
        cardMeshes.push(card);
      }

      if (hasBackCard) {
        addClearBinderPocketBacking(
          cell.group,
          materials.pocketBacking,
          backCardIndex,
          -1,
          backOffset,
        );
        const readyTexture = getReadyBinderTexture(CARDS[backCardIndex]);
        const card = createBinderCard(
          readyTexture || placeholderTexture,
          backCardIndex,
          -1,
          backOffset,
          { textureLoaded: Boolean(readyTexture) },
        );
        cell.group.add(card);
        cell.group.add(createBinderLoadingRing(card, -1, backOffset));
        cardMeshes.push(card);
      } else if (hasFrontCard && ACTIVE_COLLECTION.showUnpairedBinderBacks !== false) {
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

function addClearBinderPageBacking(group, sourceMaterial) {
  const backing = new THREE.Mesh(
    new THREE.PlaneGeometry(BINDER_PAGE_WIDTH, BINDER_PAGE_HEIGHT, 1, 1),
    sourceMaterial.clone(),
  );
  backing.position.set(BINDER_PAGE_WIDTH / 2, 0, 0);
  backing.renderOrder = 1;
  markBinderSheetLayer(backing, CLEAR_BINDER_PAGE_OPACITY, CLEAR_BINDER_PAGE_OPACITY);
  backing.userData.clearBinderPageBacking = true;
  group.add(backing);
}

function addClearBinderPocketBacking(group, sourceMaterial, cardIndex, side, binderPosition) {
  if (!sourceMaterial || CARDS[cardIndex]?.collection !== "clear") return null;

  const backing = new THREE.Mesh(
    getBinderPocketBackingGeometry(),
    sourceMaterial.clone(),
  );
  backing.position.z = side * (BINDER_CARD_LIFT - 0.006);
  if (side < 0) backing.rotation.y = Math.PI;
  backing.renderOrder = 11;
  markBinderSheetLayer(backing, CLEAR_BINDER_POCKET_OPACITY, CLEAR_BINDER_POCKET_OPACITY);
  backing.userData.clearBinderPocketBacking = true;
  backing.userData.cardIndex = cardIndex;
  backing.userData.binderPosition = binderPosition;
  group.add(backing);
  return backing;
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

function getBinderPocketBackingGeometry() {
  if (!binderPocketBackingGeometry) {
    binderPocketBackingGeometry = new THREE.PlaneGeometry(
      BINDER_CELL_WIDTH,
      BINDER_CELL_HEIGHT,
      1,
      1,
    );
    binderPocketBackingGeometry.userData.sharedBinderGeometry = true;
  }
  return binderPocketBackingGeometry;
}

function getBinderStickerGeometry() {
  if (!binderStickerGeometry) {
    binderStickerGeometry = new THREE.CircleGeometry(0.5, 48);
    binderStickerGeometry.userData.sharedBinderGeometry = true;
  }
  return binderStickerGeometry;
}

function getBinderStickerTexture(kind) {
  if (binderStickerTextures.has(kind)) return binderStickerTextures.get(kind);
  const url = getBinderStickerTextureUrl(kind);
  const texture = textureLoader.load(url, (loadedTexture) => {
    configureBinderStickerTexture(loadedTexture);
    if (typeof binderRenderer?.initTexture === "function") {
      try {
        binderRenderer.initTexture(loadedTexture);
      } catch {
        // The next binder render will upload the texture normally.
      }
    }
    renderBinderSceneOnce();
  }, undefined, (error) => {
    console.warn(`Unable to load ${kind} binder sticker`, error);
  });
  binderStickerTextures.set(kind, texture);
  return texture;
}

function getBinderStickerTextureUrl(kind) {
  return kind === "trade"
    ? BINDER_TRADE_STICKER_TEXTURE_URL
    : BINDER_LISTED_STICKER_TEXTURE_URL;
}

function configureBinderStickerTexture(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.max(
    1,
    binderRenderer?.capabilities?.getMaxAnisotropy?.() || 1,
  );
  texture.needsUpdate = true;
  return texture;
}

function getBinderCardStickerKinds(card) {
  const kinds = [];
  if (card?.listed) kinds.push("listed");
  if (isCardMarkedForTrade(card)) kinds.push("trade");
  return kinds;
}

function isCardMarkedForTrade(card) {
  const stableId = String(card?.stableId || "");
  return globalTradeCardStableIds.has(stableId) || walletTradeCardStableIds.has(stableId);
}

function createBinderCardSticker(kind, slotIndex = 0, card = null) {
  const [width, height] = BINDER_STICKER_SIZES[kind] || BINDER_STICKER_SIZES.trade;
  const raisedAboveTrade = kind === "listed" && isCardMarkedForTrade(card);
  const verticalOffset = raisedAboveTrade
    ? BINDER_STICKER_SIZES.trade[1] + BINDER_STICKER_GAP
    : 0;
  const material = new THREE.MeshBasicMaterial({
    map: getBinderStickerTexture(kind),
    transparent: true,
    opacity: 0,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    side: THREE.FrontSide,
  });
  const sticker = new THREE.Mesh(getBinderStickerGeometry(), material);
  sticker.scale.set(width, height, 1);
  sticker.position.set(
    BINDER_STICKER_RIGHT_EDGE - width / 2,
    BINDER_STICKER_BOTTOM_EDGE + height / 2 + verticalOffset,
    raisedAboveTrade ? 0.014 : 0.012,
  );
  sticker.rotation.z = getBinderStickerRotation(card, kind);
  sticker.renderOrder = raisedAboveTrade ? 25 : 24;
  sticker.visible = false;
  sticker.userData.binderCardSticker = kind;
  return sticker;
}

function syncFixedClearBinderStickerLayout(cardMesh, card) {
  if (!cardMesh || card?.collection !== "clear") return;

  const scaleX = Math.max(Math.abs(cardMesh.scale.x), 0.0001);
  const scaleY = Math.max(Math.abs(cardMesh.scale.y), 0.0001);
  const cardRotation = cardMesh.rotation.z || 0;
  const inverseRotation = -cardRotation;
  const cos = Math.cos(inverseRotation);
  const sin = Math.sin(inverseRotation);
  const quarterTurn = Math.abs(Math.sin(cardRotation)) > 0.5;
  const visibleHalfWidth = quarterTurn
    ? BINDER_CARD_HEIGHT * scaleY / 2
    : BINDER_CARD_WIDTH * scaleX / 2;
  const visibleHalfHeight = quarterTurn
    ? BINDER_CARD_WIDTH * scaleX / 2
    : BINDER_CARD_HEIGHT * scaleY / 2;
  const rightEdgeOutset = BINDER_STICKER_RIGHT_EDGE - BINDER_CARD_WIDTH / 2;
  const bottomEdgeOutset = BINDER_STICKER_BOTTOM_EDGE + BINDER_CARD_HEIGHT / 2;

  for (const sticker of cardMesh.userData.binderStickerMeshes || []) {
    const kind = sticker.userData.binderCardSticker;
    const [width, height] = BINDER_STICKER_SIZES[kind] || BINDER_STICKER_SIZES.trade;
    const verticalOffset = kind === "trade" && card.listed
      ? BINDER_STICKER_SIZES.listed[1] + BINDER_STICKER_GAP
      : 0;
    const targetX = visibleHalfWidth + rightEdgeOutset - width / 2;
    const targetY = -visibleHalfHeight + bottomEdgeOutset + height / 2 + verticalOffset;
    const unrotatedX = targetX * cos - targetY * sin;
    const unrotatedY = targetX * sin + targetY * cos;

    sticker.position.x = unrotatedX / scaleX;
    sticker.position.y = unrotatedY / scaleY;
    sticker.rotation.z = inverseRotation;
    sticker.scale.set(
      width / (quarterTurn ? scaleY : scaleX),
      height / (quarterTurn ? scaleX : scaleY),
      1,
    );
  }
}

function getBinderStickerRotation(card, kind) {
  const stableId = String(card?.stableId || card?.mint || card?.title || "card");
  const unit = stableHash(`${stableId}:${kind}:binder-sticker`) / 0xffffffff;
  return THREE.MathUtils.degToRad(unit * 10 - 5);
}

function getBinderLoadingRingGeometry() {
  if (!binderLoadingRingGeometry) {
    binderLoadingRingGeometry = new THREE.RingGeometry(
      BINDER_LOADING_RING_RADIUS - BINDER_LOADING_RING_THICKNESS,
      BINDER_LOADING_RING_RADIUS,
      24,
      1,
      0,
      Math.PI * 1.58,
    );
    binderLoadingRingGeometry.userData.sharedBinderGeometry = true;
  }
  return binderLoadingRingGeometry;
}

function getBinderLoadingRingMaterial() {
  if (!binderLoadingRingMaterial) {
    binderLoadingRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xd9d3c5,
      transparent: true,
      opacity: 0.76,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
      side: THREE.FrontSide,
    });
    binderLoadingRingMaterial.userData.sharedBinderMaterial = true;
  }
  return binderLoadingRingMaterial;
}

function createBinderLoadingRing(card, side, binderPosition) {
  const ring = new THREE.Mesh(
    getBinderLoadingRingGeometry(),
    getBinderLoadingRingMaterial(),
  );
  ring.position.z = side * (BINDER_CARD_LIFT + 0.006);
  if (side < 0) ring.rotation.y = Math.PI;
  ring.renderOrder = 16;
  ring.userData.binderLoadingRing = true;
  ring.userData.binderCardMesh = card;
  ring.userData.binderPosition = binderPosition;
  ring.userData.binderSide = side;
  card.userData.loadingRing = ring;
  binderLoadingRings.push(ring);
  return ring;
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
    getBinderPocketBackingGeometry(),
    getBinderColumnSheetGeometry(),
    getBinderColumnGlossGeometry(),
    getBinderVerticalSeamGeometry(),
    getBinderHorizontalSeamGeometry(),
    getBinderLoadingRingGeometry(),
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

function createBinderCard(
  texture,
  cardIndex,
  side,
  binderPosition = -1,
  { textureLoaded = false } = {},
) {
  const hasCard = Number.isInteger(cardIndex);
  const material = new THREE.MeshPhysicalMaterial({
    map: texture,
    roughness: 0.62,
    roughnessMap: createPaperRoughnessTexture(),
    metalness: 0.01,
    clearcoat: 0.2,
    clearcoatRoughness: 0.52,
    transparent: true,
    opacity: hasCard && !textureLoaded ? BINDER_CARD_PLACEHOLDER_OPACITY : 1,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
  });
  const card = new THREE.Mesh(getBinderCardGeometry(), material);
  if (hasCard) {
    applyBinderCardAspectFit(card, CARDS[cardIndex], textureLoaded ? texture : null);
  }

  card.position.z = side * BINDER_CARD_LIFT;
  if (side < 0) card.rotation.y = Math.PI;
  card.renderOrder = 12;
  if (hasCard) {
    card.userData.cardIndex = cardIndex;
    card.userData.binderPosition = binderPosition;
    card.userData.binderCard = true;
    card.userData.textureLoaded = Boolean(textureLoaded);
    card.userData.textureFadeComplete = Boolean(textureLoaded);
    const stickerKinds = getBinderCardStickerKinds(CARDS[cardIndex]);
    card.userData.binderStickerMeshes = stickerKinds.map((kind, slotIndex) => {
      const sticker = createBinderCardSticker(kind, slotIndex, CARDS[cardIndex]);
      sticker.userData.cardIndex = cardIndex;
      sticker.userData.binderPosition = binderPosition;
      card.add(sticker);
      return sticker;
    });
    syncFixedClearBinderStickerLayout(card, CARDS[cardIndex]);
    binderCardMeshes.push(card);
    binderCardMeshByPosition.set(binderPosition, card);
  }
  return card;
}

function createBinderBackCard(texture, sourceCardIndex = null) {
  const sourceCard = Number.isInteger(sourceCardIndex)
    ? CARDS[sourceCardIndex]
    : null;
  const backTexture = getCachedBackTexture(sourceCard) || texture;
  prepareTextureForImmediateDisplay(backTexture);
  const card = createBinderCard(backTexture, null, -1);
  card.userData.binderBackCard = true;
  card.userData.binderBackCardIndex = sourceCardIndex;
  return card;
}

function getLoadedCardTextureDimensions(texture) {
  const image = texture?.image || texture?.source?.data;
  return {
    width: Number(
      texture?.userData?.cardFrameWidth
        || image?.naturalWidth
        || image?.videoWidth
        || image?.width,
    ),
    height: Number(
      texture?.userData?.cardFrameHeight
        || image?.naturalHeight
        || image?.videoHeight
        || image?.height,
    ),
  };
}

function getCardAspectFitScale(
  card,
  texture = null,
  { swapDimensions = false } = {},
) {
  const loadedDimensions = getLoadedCardTextureDimensions(texture);
  const useLoadedClearAspect = card?.collection === "clear"
    && loadedDimensions.width > 0
    && loadedDimensions.height > 0;
  let width = useLoadedClearAspect ? loadedDimensions.width : Number(card?.width);
  let height = useLoadedClearAspect ? loadedDimensions.height : Number(card?.height);
  if (swapDimensions) [width, height] = [height, width];
  if (!(width > 0) || !(height > 0)) return { x: 1, y: 1 };
  const activeAspect = CARD_HEIGHT / CARD_WIDTH;
  const aspectRatio = (height / width) / activeAspect;
  return aspectRatio >= 1
    ? { x: 1 / aspectRatio, y: 1 }
    : { x: 1, y: aspectRatio };
}

function applyBinderCardAspectFit(mesh, card, texture = null) {
  if (!mesh || !card) return;
  const loadedDimensions = getLoadedCardTextureDimensions(texture);
  const rotateLandscape = card.collection === "clear"
    && loadedDimensions.width > loadedDimensions.height
    && loadedDimensions.height > 0;
  const fittedDisplayScale = getCardAspectFitScale(card, texture, {
    swapDimensions: rotateLandscape,
  });
  const aspectScale = rotateLandscape
    ? {
      x: (CARD_HEIGHT / CARD_WIDTH) * fittedDisplayScale.y,
      y: (CARD_WIDTH / CARD_HEIGHT) * fittedDisplayScale.x,
    }
    : fittedDisplayScale;
  mesh.scale.set(aspectScale.x, aspectScale.y, 1);
  mesh.rotation.z = rotateLandscape ? -Math.PI / 2 : 0;
  mesh.userData.cardAspectScale = aspectScale;
  mesh.userData.binderLandscapeRotated = rotateLandscape;
  syncFixedClearBinderStickerLayout(mesh, card);
}

function applyCardAspectFitToGroup(group, card) {
  if (!group) return;
  const frontMesh = group.userData.frontMesh;
  if (!frontMesh) return;
  const aspectScale = getCardAspectFitScale(card);
  if (!frontMesh.userData.cardAspectBaseScale) {
    frontMesh.userData.cardAspectBaseScale = frontMesh.scale.clone();
  }
  const baseScale = frontMesh.userData.cardAspectBaseScale;
  frontMesh.scale.set(
    baseScale.x * aspectScale.x,
    baseScale.y * aspectScale.y,
    baseScale.z,
  );
  group.userData.cardAspectScale = aspectScale;
}

function loadVisibleBinderTextures(token) {
  const targetPositions = getBinderPriorityTexturePositions();
  prioritizeBinderTargetTextureWork(targetPositions);
  for (const position of targetPositions) {
    loadBinderTextureForPosition(position, token, {
      renderOnApply: true,
      priority: BINDER_TEXTURE_TARGET_PRIORITY,
    });
  }
  for (const position of getVisibleBinderPositions()) {
    if (targetPositions.has(position)) continue;
    loadBinderTextureForPosition(position, token, { renderOnApply: true, priority: 0 });
  }
}

function getBinderPriorityTexturePositions() {
  if (getBinderTargetClosedSide()) return new Set();
  if (isBinderFocused()) return new Set(getFocusedBinderSharpPositions());
  return getBinderSpreadPositionsForTurn(binderTargetTurn);
}

function hasUnloadedBinderPositions(positions) {
  for (const position of positions) {
    const cardIndex = binderVisibleIndexes[position];
    if (!Number.isInteger(cardIndex)) continue;
    const mesh = binderCardMeshByPosition.get(position);
    if (!mesh?.userData.textureLoaded) return true;
  }
  return false;
}

function prioritizeBinderTargetTextureWork(targetPositions) {
  if (!targetPositions.size || !hasUnloadedBinderPositions(targetPositions)) return;

  for (let index = binderTextureQueue.length - 1; index >= 0; index -= 1) {
    const task = binderTextureQueue[index];
    if (targetPositions.has(task.position)) continue;
    binderTextureQueue.splice(index, 1);
    binderTextureQueuedPositions.delete(task.position);
    const mesh = binderCardMeshByPosition.get(task.position);
    if (mesh && !mesh.userData.textureLoaded) mesh.userData.textureLoading = false;
  }

  for (let index = binderTextureApplyQueue.length - 1; index >= 0; index -= 1) {
    const entry = binderTextureApplyQueue[index];
    if (targetPositions.has(entry.position)) continue;
    binderTextureApplyQueue.splice(index, 1);
    binderTextureApplyPositions.delete(entry.position);
    const mesh = binderCardMeshByPosition.get(entry.position);
    if (mesh && !mesh.userData.textureLoaded) mesh.userData.textureLoading = false;
  }
}

function shouldYieldBinderTextureToTarget(position) {
  const targetPositions = getBinderPriorityTexturePositions();
  return targetPositions.size > 0
    && !targetPositions.has(position)
    && hasUnloadedBinderPositions(targetPositions);
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
  const assetKey = textureAssetPath(CARDS[cardIndex]);
  const failure = binderTextureFailures.get(assetKey);
  if (failure?.attempts >= BINDER_TEXTURE_MAX_RETRIES) {
    mesh.userData.textureLoaded = true;
    mesh.userData.textureLoading = false;
    mesh.userData.textureLoadFailed = true;
    return;
  }
  if (failure?.retryAfter > performance.now()) {
    mesh.userData.textureLoading = false;
    requestBinderMaintenance(Math.ceil(failure.retryAfter - performance.now()));
    return;
  }
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
    assetKey,
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
  if (!binderTextureQueue.length || document.hidden) return;

  const now = performance.now();
  const hasRunnableTask = binderTextureQueue.some((entry) => !shouldDeferBinderTextureEntry(entry, now));
  if (!hasRunnableTask) {
    requestBinderMaintenance(120);
    return;
  }

  const urgentTaskQueued = binderTextureQueue.some((entry) => (
    isUrgentBinderTexturePriority(entry.priority)
    && !shouldDeferBinderTextureEntry(entry, now)
  ));
  const targetPositions = getBinderPriorityTexturePositions();
  const staleLoadActive = Array.from(binderTextureActiveTasks.values()).some(
    (task) => (
      task.token !== binderBuildToken
      || !targetPositions.has(task.position)
    ),
  );
  const concurrencyLimit = BINDER_TEXTURE_CONCURRENCY
    + (
      urgentTaskQueued && staleLoadActive
        ? BINDER_TEXTURE_URGENT_RESERVE
        : 0
    );
  while (binderTextureActiveLoads < concurrencyLimit && binderTextureQueue.length) {
    const taskIndex = binderTextureQueue.findIndex((entry) => (
      !shouldDeferBinderTextureEntry(entry, now)
      && (!entry.animated || binderTextureActiveAnimatedLoads < 1)
    ));
    if (taskIndex === -1) break;
    const [task] = binderTextureQueue.splice(taskIndex, 1);
    binderTextureQueuedPositions.delete(task.position);
    binderTextureActiveLoads += 1;
    binderTextureActiveTasks.set(task.sequence, task);
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
    binderTextureFailures.delete(task.assetKey);
    const currentMesh = binderCardMeshByPosition.get(task.position);
    if (currentMesh) {
      queueBinderTextureApply(task, texture);
    }
  } catch (error) {
    const currentMesh = binderCardMeshByPosition.get(task.position);
    const previous = binderTextureFailures.get(task.assetKey) || { attempts: 0, retryAfter: 0 };
    const attempts = previous.attempts + 1;
    const retryDelay = Math.min(
      BINDER_TEXTURE_RETRY_MAX_MS,
      BINDER_TEXTURE_RETRY_BASE_MS * (2 ** (attempts - 1)),
    );
    binderTextureFailures.set(task.assetKey, {
      attempts,
      retryAfter: performance.now() + retryDelay,
    });
    if (currentMesh) {
      currentMesh.userData.textureLoading = false;
      if (attempts >= BINDER_TEXTURE_MAX_RETRIES) {
        currentMesh.userData.textureLoaded = true;
        currentMesh.userData.textureLoadFailed = true;
      }
    }
    if (attempts < BINDER_TEXTURE_MAX_RETRIES) requestBinderMaintenance(retryDelay);
    console.error(error);
  } finally {
    binderTextureActiveLoads = Math.max(0, binderTextureActiveLoads - 1);
    binderTextureActiveTasks.delete(task.sequence);
    if (task.animated) {
      binderTextureActiveAnimatedLoads = Math.max(0, binderTextureActiveAnimatedLoads - 1);
    }
    pumpBinderTextureQueue();
  }
}

function queueBinderTextureApply(task, texture) {
  const currentMesh = binderCardMeshByPosition.get(task.position);
  if (!currentMesh || currentMesh.userData.textureLoaded) return;
  if (shouldYieldBinderTextureToTarget(task.position)) {
    currentMesh.userData.textureLoading = false;
    return;
  }

  const existing = binderTextureApplyQueue.find((entry) => entry.position === task.position);
  if (existing) {
    existing.texture = texture;
    existing.token = task.token;
    existing.priority = Math.min(existing.priority, task.priority);
  } else {
    binderTextureApplyQueue.push({
      position: task.position,
      token: task.token,
      texture,
      priority: task.priority,
      sequence: task.sequence,
    });
    binderTextureApplyPositions.add(task.position);
  }

  binderTextureApplyQueue.sort((a, b) => a.priority - b.priority || a.sequence - b.sequence);
  requestBinderTextureApplyFlush();
}

function shouldDeferBinderTextureWork(now = performance.now(), options = {}) {
  return binderCardViewTransitionActive
    || (!options.allowPreparingSpread && binderPreparingSpread)
    || (!options.allowTurn && isBinderTurnMoving())
    || (!options.allowCamera && isBinderCameraMoving())
    || (!options.allowInteraction && now < binderInteractionActiveUntil);
}

function shouldDeferBinderTextureEntry(
  entry,
  now = performance.now(),
) {
  const urgent = isUrgentBinderTexturePriority(entry?.priority);
  return shouldDeferBinderTextureWork(now, {
    allowPreparingSpread: urgent,
    allowTurn: urgent,
    allowCamera: urgent,
    allowInteraction: urgent,
  });
}

function isUrgentBinderTexturePriority(priority) {
  return Number.isFinite(priority) && priority < BINDER_TEXTURE_URGENT_PRIORITY;
}

function requestBinderTextureApplyFlush(delay = 0) {
  if (!binderTextureApplyQueue.length || binderTextureApplyFrame || binderTextureApplyTimer) return;

  if (delay > 0) {
    binderTextureApplyTimer = window.setTimeout(() => {
      binderTextureApplyTimer = 0;
      requestBinderTextureApplyFlush();
    }, delay);
    return;
  }

  binderTextureApplyFrame = requestAnimationFrame(flushBinderTextureApplyQueue);
}

function flushBinderTextureApplyQueue(now = performance.now()) {
  binderTextureApplyFrame = 0;
  if (!binderTextureApplyQueue.length) return;

  if (!galleryOpen || !isBinderMode || !binderRoot || els.binderPanel.hidden) {
    clearBinderTextureApplyQueue();
    return;
  }

  const hasRunnableEntry = binderTextureApplyQueue.some(
    (entry) => !shouldDeferBinderTextureEntry(entry, now),
  );
  if (!hasRunnableEntry) {
    requestBinderTextureApplyFlush(BINDER_TEXTURE_APPLY_DEFER_MS);
    return;
  }

  let applied = 0;
  while (applied < BINDER_TEXTURE_APPLY_IDLE_BUDGET && binderTextureApplyQueue.length) {
    const entryIndex = binderTextureApplyQueue.findIndex(
      (candidate) => !shouldDeferBinderTextureEntry(candidate, now),
    );
    if (entryIndex === -1) break;
    const [entry] = binderTextureApplyQueue.splice(entryIndex, 1);
    binderTextureApplyPositions.delete(entry.position);
    if (applyQueuedBinderTexture(entry, now)) applied += 1;
  }

  if (applied > 0) startBinderRenderLoop();
  if (binderTextureApplyQueue.length) {
    requestBinderTextureApplyFlush(BINDER_TEXTURE_APPLY_BATCH_DELAY_MS);
  }
  pumpBinderTextureQueue();
}

function applyQueuedBinderTexture(entry, now = performance.now()) {
  const currentMesh = binderCardMeshByPosition.get(entry.position);
  if (entry.token !== binderBuildToken || !currentMesh || currentMesh.userData.textureLoaded) {
    if (currentMesh) currentMesh.userData.textureLoading = false;
    return false;
  }

  const targetOpacity = getBinderPageOpacityForPosition(entry.position);
  const visibleFloor = getBinderUnloadedCardOpacity(targetOpacity);
  const startOpacity = clamp(
    Math.max(currentMesh.material.opacity ?? 0, visibleFloor),
    0,
    Math.max(targetOpacity, visibleFloor),
  );
  prepareTextureForImmediateDisplay(entry.texture);
  currentMesh.material.map = entry.texture;
  applyBinderCardAspectFit(
    currentMesh,
    CARDS[currentMesh.userData.cardIndex],
    entry.texture,
  );
  currentMesh.material.opacity = startOpacity;
  currentMesh.userData.textureLoaded = true;
  currentMesh.userData.textureLoading = false;
  currentMesh.userData.textureFadeStartedAt = now;
  currentMesh.userData.textureFadeStartOpacity = startOpacity;
  currentMesh.userData.textureFadeComplete = false;
  currentMesh.userData.renderOnApply = false;
  return true;
}

function clearBinderTextureApplyQueue() {
  if (binderTextureApplyFrame) {
    cancelAnimationFrame(binderTextureApplyFrame);
    binderTextureApplyFrame = 0;
  }
  if (binderTextureApplyTimer) {
    window.clearTimeout(binderTextureApplyTimer);
    binderTextureApplyTimer = 0;
  }
  for (const entry of binderTextureApplyQueue) {
    const mesh = binderCardMeshByPosition.get(entry.position);
    if (mesh && !mesh.userData.textureLoaded) mesh.userData.textureLoading = false;
  }
  binderTextureApplyQueue.length = 0;
  binderTextureApplyPositions.clear();
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
    const cachedTexture = getCachedBackTexture(card);
    if (cachedTexture) {
      applyBinderBackTexture(child, cachedTexture);
      continue;
    }
    getBackTexture(card).then((texture) => {
      if (token !== binderBuildToken || !child.parent) return;
      applyBinderBackTexture(child, texture);
      requestBinderRenderOnce();
    }).catch(console.error);
  }
}

function applyBinderBackTexture(mesh, texture) {
  if (!mesh?.material || !texture) return;
  prepareTextureForImmediateDisplay(texture);
  mesh.material.map = texture;
}

function ensureBinderPageWindow({
  force = false,
  center = null,
  queueTextures = true,
  updateTransforms = true,
  loadBackTextures = true,
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
  const materials = createBinderPageMaterials(binderVisibleIndexes);

  for (const pageIndex of desiredIndexes) {
    if (existingPages.has(pageIndex)) continue;
    const page = createBinderPage(pageIndex, binderVisibleIndexes, placeholderTexture, materials);
    pageParent.add(page.group);
    binderPages.push(page);
  }

  if (materials.plastic) materials.plastic.dispose();
  if (materials.seam) materials.seam.dispose();
  if (materials.pageBacking) materials.pageBacking.dispose();
  if (materials.pocketBacking) materials.pocketBacking.dispose();

  for (const page of binderPages.slice()) {
    if (desiredPages.has(page.pageIndex)) continue;
    removeBinderPage(page);
  }

  binderPages.sort((a, b) => a.pageIndex - b.pageIndex);
  binderPageWindowKey = desiredIndexes.join(",");
  binderTextureQueueKey = "";
  const token = binderBuildToken;
  if (loadBackTextures) loadBinderBackTexture(token);
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

  const addTurnCoverage = (turn) => {
    const lowerTurn = Math.floor(clamp(turn, 0, binderPageCount));
    for (
      let pageIndex = lowerTurn - 1;
      pageIndex <= lowerTurn + 1;
      pageIndex += 1
    ) {
      addPage(pageIndex);
    }
  };
  addTurnCoverage(binderTurn);
  addTurnCoverage(binderTargetTurn);

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
  binderOuterFlipState = null;
  resetBinderOuterFlipTransform();
  resetEvilBinderTableSwap();
  binderFullResolutionMeshes.clear();
  if (binderMaintenanceTimer) {
    window.clearTimeout(binderMaintenanceTimer);
    binderMaintenanceTimer = 0;
  }
  for (const child of binderRoot.children) disposeObject(child);
  binderRoot.clear();
  binderPages = [];
  binderCardMeshes = [];
  binderCardMeshByPosition = new Map();
  binderLoadingRings = [];
  binderShellState = null;
  binderIntroNoteGroup = null;
  binderIntroNoteMesh = null;
  binderIntroLinkMeshes = [];
  binderIntroFocusMeshes = [];
  clearBinderIntroLinkCursor();
  binderPageWindowKey = "";
  binderTextureQueueKey = "";
  binderTextureQueue.length = 0;
  binderTextureQueuedPositions.clear();
  clearBinderTextureApplyQueue();
}

function removeBinderPage(page) {
  if (!page) return;
  for (const mesh of binderFullResolutionMeshes) {
    if (page.group.getObjectById(mesh.id)) binderFullResolutionMeshes.delete(mesh);
  }
  binderPages = binderPages.filter((entry) => entry !== page);
  const removedLoadingRings = new Set();
  page.group.traverse((child) => {
    if (child.userData.binderLoadingRing) removedLoadingRings.add(child);
    if (!child.isMesh || !child.userData.binderCard) return;
    const position = child.userData.binderPosition;
    if (Number.isInteger(position)) binderCardMeshByPosition.delete(position);
  });
  binderCardMeshes = binderCardMeshes.filter((mesh) => {
    const pageIndex = Math.floor((mesh.userData.binderPosition ?? -1) / BINDER_PAGE_SLOTS);
    return pageIndex !== page.pageIndex;
  });
  binderLoadingRings = binderLoadingRings.filter(
    (ring) => !removedLoadingRings.has(ring),
  );
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
      if (material && !material.userData?.sharedBinderMaterial) {
        material.dispose();
      }
    }
  });
}

function nextBinderPage() {
  turnBinderPage(1);
}

function previousBinderPage() {
  turnBinderPage(-1);
}

function startBinderFirstPageHold(event) {
  if (!canStartBinderFirstPageHold(event)) return;

  cancelBinderFirstPageHold();
  binderFirstPageHoldPointerId = event.pointerId;
  binderFirstPageHoldStartX = event.clientX;
  binderFirstPageHoldStartY = event.clientY;
  binderFirstPageHoldConfirmed = false;
  setBinderFirstPageHoldButtonState("loading");

  try {
    els.binderPreviousPageButton.setPointerCapture(event.pointerId);
  } catch {
    // Pointer capture is best-effort; release/cancel still clears the hold state.
  }

  // The CSS animationend event is the normal confirmation path. This timer
  // is only a fallback for browsers that suppress pseudo-element animation
  // events while a pointer remains captured.
  binderFirstPageHoldTimer = window.setTimeout(
    confirmBinderFirstPageHold,
    BINDER_FIRST_PAGE_HOLD_MS + 120,
  );
}

function confirmBinderFirstPageHoldFromAnimation(event) {
  if (event.animationName !== "binder-first-page-hold-expand") return;
  confirmBinderFirstPageHold();
}

function confirmBinderFirstPageHold() {
  if (binderFirstPageHoldPointerId === null || binderFirstPageHoldConfirmed) return;
  clearBinderFirstPageHoldTimer();
  if (!isBinderFirstPageHoldContextValid()) {
    cancelBinderFirstPageHold();
    return;
  }
  binderFirstPageHoldConfirmed = true;
  setBinderFirstPageHoldButtonState("confirmed");
}

function moveBinderFirstPageHold(event) {
  if (binderFirstPageHoldPointerId !== event.pointerId || binderFirstPageHoldConfirmed) return;

  const distance = Math.hypot(
    event.clientX - binderFirstPageHoldStartX,
    event.clientY - binderFirstPageHoldStartY,
  );
  if (distance > BINDER_FIRST_PAGE_HOLD_MOVE_LIMIT) {
    cancelBinderFirstPageHold(event);
  }
}

function finishBinderFirstPageHold(event) {
  if (binderFirstPageHoldPointerId !== event.pointerId) return;

  const confirmed = binderFirstPageHoldConfirmed;
  cancelBinderFirstPageHold(event);
  if (!confirmed) return;

  event.preventDefault();
  event.stopPropagation();
  suppressNextBinderPreviousPageClick = true;
  binderFirstPageHoldTriggeredAt = performance.now();
  window.setTimeout(() => {
    if (isRecentBinderFirstPageHold()) return;
    suppressNextBinderPreviousPageClick = false;
  }, BINDER_FIRST_PAGE_HOLD_SUPPRESS_MS);
  returnBinderToFirstInsidePageFromHold();
}

function cancelPendingBinderFirstPageHold(event = null) {
  if (binderFirstPageHoldConfirmed) return;
  cancelBinderFirstPageHold(event);
}

function cancelBinderFirstPageHold(event = null) {
  if (
    binderFirstPageHoldPointerId !== null
    && event?.pointerId != null
    && event.pointerId !== binderFirstPageHoldPointerId
  ) {
    return;
  }

  clearBinderFirstPageHoldTimer();
  try {
    if (binderFirstPageHoldPointerId !== null) {
      els.binderPreviousPageButton.releasePointerCapture(binderFirstPageHoldPointerId);
    }
  } catch {
    // Pointer capture may already be released by the browser.
  }
  binderFirstPageHoldPointerId = null;
  binderFirstPageHoldConfirmed = false;
  setBinderFirstPageHoldButtonState("idle");
}

function clearBinderFirstPageHoldTimer() {
  if (!binderFirstPageHoldTimer) return;
  window.clearTimeout(binderFirstPageHoldTimer);
  binderFirstPageHoldTimer = 0;
}

function setBinderFirstPageHoldButtonState(state) {
  const loading = state === "loading";
  const confirmed = state === "confirmed";
  els.binderPreviousPageButton.classList.toggle("is-hold-loading", loading);
  els.binderPreviousPageButton.classList.toggle("is-confirmed", confirmed);
  els.binderPreviousPageButton.setAttribute("aria-busy", String(loading));
}

function canStartBinderFirstPageHold(event) {
  if (event.button > 0 || event.isPrimary === false) return false;
  if (els.binderPreviousPageButton.disabled || els.binderPreviousPageButton.hidden) return false;
  return isBinderFirstPageHoldContextValid();
}

function isBinderFirstPageHoldContextValid() {
  return Boolean(
    galleryOpen
      && isBinderMode
      && !isBinderFocusView()
      && !traitSearchOpen
      && !binderOuterFlipState
      && !binderPreparingSpread
      && !getBinderTargetClosedSide()
      && !els.binderPageControls.hidden
      && binderPageCount >= 1,
  );
}

function returnBinderToFirstInsidePageFromHold() {
  if (!isBinderFirstPageHoldContextValid()) return false;

  closeBinderPageStatusEdit({ update: false });
  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  binderLastOpenTap = null;
  binderBendDirection = -1;
  binderSinglePageSide = 0;
  binderSinglePageSideTouched = true;
  // A hold-return is a stack action, not normal page-by-page navigation.
  // Collapse every turned page in the same frame, but leave the binder open
  // on the first inside spread instead of continuing to the front cover.
  binderTargetTurn = 0;
  binderTurn = 0;
  binderTargetClosure = 0;
  binderClosure = 0;
  binderTextureQueueKey = "";
  ensureBinderPageWindow({
    force: true,
    center: 0,
    queueTextures: false,
    updateTransforms: false,
  });
  markBinderInteractionActive();
  updateBinderDefaultCameraFrame();
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
  queueBinderTextureLoads(binderBuildToken, {
    force: true,
    includePreload: false,
  });
  requestBinderMaintenance(90);
  queueSessionViewStateSave();
  return true;
}

function consumeSuppressedBinderPreviousPageClick() {
  if (!suppressNextBinderPreviousPageClick) return false;
  suppressNextBinderPreviousPageClick = false;
  return isRecentBinderFirstPageHold();
}

function isRecentBinderFirstPageHold() {
  return binderFirstPageHoldTriggeredAt > 0
    && performance.now() - binderFirstPageHoldTriggeredAt < BINDER_FIRST_PAGE_HOLD_SUPPRESS_MS;
}

function getBinderTargetClosedSide() {
  if (binderTargetClosure <= -0.5) return -1;
  if (binderTargetClosure >= 0.5) return 1;
  return 0;
}

function setBinderClosureTarget(side, { immediate = false, update = true } = {}) {
  const nextClosure = clamp(Math.sign(Number(side) || 0), -1, 1);
  const changed = nextClosure !== binderTargetClosure
    || (immediate && nextClosure !== binderClosure);
  binderTargetClosure = nextClosure;
  if (nextClosure < 0) binderTargetTurn = 0;
  if (nextClosure > 0) binderTargetTurn = binderPageCount;
  if (immediate) {
    binderClosure = nextClosure;
    if (nextClosure < 0) binderTurn = 0;
    if (nextClosure > 0) binderTurn = binderPageCount;
  }
  binderLastOpenTap = null;

  if (update && changed) {
    markBinderInteractionActive();
    updateBinderDefaultCameraFrame();
    updateBinderPageControls();
    startBinderRenderLoop();
    updateBinderAnimation();
  }
  return changed;
}

function handleBinderClosureNavigation(direction) {
  if (binderOuterFlipState) return true;

  const closedSide = getBinderTargetClosedSide();
  if (closedSide) {
    if (direction === -closedSide) {
      setBinderClosureTarget(0);
    } else if (direction === closedSide) {
      beginBinderOuterFlip(direction);
    }
    return true;
  }

  const currentTurn = clamp(Math.round(binderTargetTurn), 0, binderPageCount);
  if (currentTurn <= 0 && direction < 0) {
    setBinderClosureTarget(-1);
    return true;
  }
  if (currentTurn >= binderPageCount && direction > 0) {
    setBinderClosureTarget(1);
    return true;
  }
  return false;
}

function beginBinderOuterFlip(direction) {
  const flipState = createBinderOuterFlipState(direction);
  if (!flipState) return false;

  startBinderOuterFlipSettle(flipState, 1, {
    duration: BINDER_OUTER_FLIP_DURATION_MS,
  });
  return true;
}

function beginBinderOuterFlipDrag(direction) {
  const flipState = createBinderOuterFlipState(direction, { dragging: true });
  if (!flipState) return null;

  applyBinderOuterFlipProgress(flipState, 0);
  return flipState;
}

function createBinderOuterFlipState(direction, { dragging = false } = {}) {
  const fromSide = getBinderTargetClosedSide();
  const flipDirection = Math.sign(direction);
  if (
    binderOuterFlipState
    || !fromSide
    || flipDirection !== fromSide
    || !binderRoot
  ) {
    return null;
  }

  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  binderLastOpenTap = null;
  closeBinderPageStatusEdit({ update: false });
  setBinderClosureTarget(fromSide, { immediate: true, update: false });
  const flipState = {
    fromSide,
    toSide: -fromSide,
    direction: flipDirection,
    tableView: binderTableViewTarget > 0.5,
    swapped: false,
    dragging,
    progress: 0,
    settleFromProgress: 0,
    settleTargetProgress: dragging ? 0 : 1,
    settleStartedAt: performance.now(),
    settleDuration: BINDER_OUTER_FLIP_DURATION_MS,
  };
  binderOuterFlipState = flipState;
  markBinderInteractionActive(
    dragging ? 420 : BINDER_OUTER_FLIP_DURATION_MS + 180,
  );
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
  return flipState;
}

function setBinderOuterFlipVisualSide(state, swapped) {
  if (!state || state.swapped === swapped) return;

  state.swapped = swapped;
  const visualSide = swapped ? state.toSide : state.fromSide;
  setBinderClosureTarget(visualSide, { immediate: true, update: false });
  binderSinglePageSide = visualSide < 0
    ? BINDER_SINGLE_PAGE_COVER_SIDE
    : getBinderTotalPageSides() - 1;
  binderSinglePageSideTouched = true;
}

function applyBinderOuterFlipProgress(state, progress) {
  if (!state || !binderRoot) return;

  state.progress = clamp(progress, 0, 1);
  setBinderOuterFlipVisualSide(state, state.progress >= 0.5);

  const physicalAngle = Math.PI * state.progress;
  const rotationDirection = -state.direction;
  binderRoot.rotation.y = rotationDirection * (
    physicalAngle < Math.PI * 0.5
      ? physicalAngle
      : physicalAngle - Math.PI
  );
  const lift = Math.sin(state.progress * Math.PI);
  const liftDistance = state.tableView
    ? BINDER_TABLE_OUTER_FLIP_LIFT
    : BINDER_OUTER_FLIP_LIFT;
  binderRoot.rotation.x = lift * BINDER_OUTER_FLIP_TILT;
  binderRoot.position.z = lift * liftDistance;
  updateBinderDefaultCameraFrame();
}

function startBinderOuterFlipSettle(
  state,
  targetProgress,
  { duration = null } = {},
) {
  if (!state || state !== binderOuterFlipState) return false;

  state.dragging = false;
  state.settleFromProgress = state.progress;
  state.settleTargetProgress = clamp(targetProgress, 0, 1);
  state.settleStartedAt = performance.now();
  const remainingProgress = Math.abs(
    state.settleTargetProgress - state.settleFromProgress,
  );
  state.settleDuration = Number.isFinite(duration)
    ? Math.max(1, duration)
    : Math.max(
      BINDER_OUTER_FLIP_MIN_SETTLE_MS,
      BINDER_OUTER_FLIP_DURATION_MS * remainingProgress,
    );
  markBinderInteractionActive(state.settleDuration + 180);
  startBinderRenderLoop();
  return true;
}

function settleDraggedBinderOuterFlip(state) {
  if (!state || !state.dragging) return false;
  const shouldComplete = state.progress >= BINDER_OUTER_FLIP_COMMIT_PROGRESS;
  return startBinderOuterFlipSettle(state, shouldComplete ? 1 : 0);
}

function finishBinderOuterFlip(state) {
  if (!state || state !== binderOuterFlipState) return;

  const completed = state.settleTargetProgress >= 0.5;
  setBinderOuterFlipVisualSide(state, completed);
  const finalSide = completed ? state.toSide : state.fromSide;
  setBinderClosureTarget(finalSide, { immediate: true, update: false });
  binderSinglePageSide = finalSide < 0
    ? BINDER_SINGLE_PAGE_COVER_SIDE
    : getBinderTotalPageSides() - 1;
  binderSinglePageSideTouched = true;
  resetBinderOuterFlipTransform();
  binderOuterFlipState = null;
  ensureBinderPageWindow({
    force: true,
    center: finalSide < 0 ? 0 : binderPageCount - 1,
    queueTextures: true,
    updateTransforms: false,
  });
  updateBinderDefaultCameraFrame();
  updateBinderPageControls();
  queueSessionViewStateSave();
}

function updateBinderOuterFlip(now = performance.now()) {
  const state = binderOuterFlipState;
  if (!state || !binderRoot) return false;

  if (state.dragging) {
    applyBinderOuterFlipProgress(state, state.progress);
    return true;
  }

  const settleProgress = clamp(
    (now - state.settleStartedAt) / Math.max(1, state.settleDuration),
    0,
    1,
  );
  const progress = THREE.MathUtils.lerp(
    state.settleFromProgress,
    state.settleTargetProgress,
    easeInOutCubic(settleProgress),
  );
  applyBinderOuterFlipProgress(state, progress);
  if (settleProgress < 1) return true;

  finishBinderOuterFlip(state);
  return true;
}

function resetBinderOuterFlipTransform() {
  if (!binderRoot) return;
  binderRoot.rotation.x = 0;
  binderRoot.rotation.y = 0;
  binderRoot.position.x = 0;
  binderRoot.position.z = 0;
}

function getBinderVirtualTurn(
  turn = binderTargetTurn,
  closure = binderTargetClosure,
) {
  if (closure < 0) return closure;
  if (closure > 0) return binderPageCount + closure;
  return clamp(turn, 0, binderPageCount);
}

function setBinderVirtualTurn(value, { immediate = false } = {}) {
  const virtualTurn = clamp(value, -1, binderPageCount + 1);
  if (virtualTurn < 0) {
    binderTargetTurn = 0;
    binderTargetClosure = virtualTurn;
  } else if (virtualTurn > binderPageCount) {
    binderTargetTurn = binderPageCount;
    binderTargetClosure = virtualTurn - binderPageCount;
  } else {
    binderTargetTurn = virtualTurn;
    binderTargetClosure = 0;
  }
  if (immediate) {
    binderTurn = binderTargetTurn;
    binderClosure = binderTargetClosure;
  }
}

function snapBinderNavigationState() {
  const snappedVirtualTurn = Math.round(getBinderVirtualTurn());
  setBinderVirtualTurn(snappedVirtualTurn);
  if (isBinderSinglePageView() && !getBinderTargetClosedSide()) {
    binderSinglePageSide = deriveBinderSinglePageSideFromTurn(binderTargetTurn);
  }
  updateBinderDefaultCameraFrame();
}

function turnBinderSinglePage(direction) {
  if (handleBinderClosureNavigation(direction)) return;

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
  binderTargetClosure = 0;
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
  if (handleBinderClosureNavigation(direction)) return;

  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  const currentPage = Math.round(binderTargetTurn);
  const nextTurn = clamp(currentPage + direction, 0, binderPageCount);
  if (nextTurn !== binderTargetTurn) {
    binderSinglePageSideTouched = true;
    binderBendDirection = Math.sign(nextTurn - binderTargetTurn);
  }
  binderTargetClosure = 0;
  binderTargetTurn = nextTurn;
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
}

async function shuffleBinderSpread() {
  if (
    !galleryOpen
    || !isBinderMode
    || isBinderFocusView()
    || binderOuterFlipState
    || binderPageCount < 1
  ) {
    return;
  }

  setBinderClosureTarget(0);
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
  const prepared = beginBinderSpreadPreparation(turn, currentPage);
  if (!prepared) return false;

  try {
    const positions = getBinderFlipReadyPositions(prepared.startTurn, prepared.nextTurn);
    const preloadedTextures = await preloadBinderTexturesForPositions(positions, {
      loadingToken,
      preparationToken: prepared.token,
    });
    if (!preloadedTextures || prepared.token !== binderSpreadPreparationToken) return false;

    ensureBinderPageWindow({
      force: true,
      center: getBinderPageWindowCenterForTurn(prepared.nextTurn),
      queueTextures: false,
      updateTransforms: false,
    });
    if (prepared.token !== binderSpreadPreparationToken) return false;
    applyPreloadedBinderTexturesForPositions(preloadedTextures);

    if (!areBinderPositionsLoaded(positions)) {
      queueBinderTextureLoadsForPositions(positions, binderBuildToken, { priority: -4 });
      const ready = await waitForBinderPositionsLoaded(positions, {
        loadingToken,
        preparationToken: prepared.token,
      });
      if (!ready || prepared.token !== binderSpreadPreparationToken) return false;
    }

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
  const prepared = beginBinderSpreadPreparation(turn, currentPage);
  if (!prepared) return null;

  ensureBinderPageWindow({
    force: true,
    center: getBinderPageWindowCenterForTurn(prepared.nextTurn),
    queueTextures: false,
    updateTransforms: false,
  });
  if (prepared.token !== binderSpreadPreparationToken) {
    clearBinderSpreadPreparation(prepared.token);
    return null;
  }

  return prepared;
}

function beginBinderSpreadPreparation(turn, currentPage) {
  const nextTurn = clamp(Math.round(turn), 0, binderPageCount);
  if (nextTurn === clamp(Math.round(binderTargetTurn), 0, binderPageCount)) return null;

  const token = ++binderSpreadPreparationToken;
  const direction = Math.sign(nextTurn - currentPage) || 1;
  const startTurn = clamp(nextTurn - direction, 0, binderPageCount);
  binderPreparingSpread = true;
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

async function preloadBinderTexturesForPositions(positions, { loadingToken = null, preparationToken = null } = {}) {
  const entries = Array.from(positions)
    .map((position) => ({ position, cardIndex: binderVisibleIndexes[position] }))
    .filter(({ cardIndex }) => Number.isInteger(cardIndex));
  if (!entries.length) return new Map();

  const textures = new Map();
  let nextEntry = 0;
  let cancelled = false;
  const isCancelled = () => (
    (Number.isInteger(loadingToken) && loadingToken !== binderShuffleLoadingToken)
    || (Number.isInteger(preparationToken) && preparationToken !== binderSpreadPreparationToken)
    || !galleryOpen
    || !isBinderMode
    || !binderVisibleIndexes.length
  );

  const worker = async () => {
    while (!cancelled) {
      if (isCancelled()) {
        cancelled = true;
        return;
      }

      const entry = entries[nextEntry];
      nextEntry += 1;
      if (!entry) return;

      try {
        const texture = await getBinderTexture(CARDS[entry.cardIndex]);
        if (isCancelled()) {
          cancelled = true;
          return;
        }
        textures.set(entry.position, texture);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const workerCount = Math.min(BINDER_SHUFFLE_PRELOAD_CONCURRENCY, entries.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
  if (cancelled || isCancelled()) return null;
  return textures;
}

function applyPreloadedBinderTexturesForPositions(textures) {
  const now = performance.now();
  for (const [position, texture] of textures) {
    removePendingBinderTextureApplyPosition(position);
    applyQueuedBinderTexture({
      position,
      token: binderBuildToken,
      texture,
      priority: -4,
      sequence: binderTextureTaskSequence += 1,
    }, now);
  }
}

function removePendingBinderTextureApplyPosition(position) {
  const entryIndex = binderTextureApplyQueue.findIndex((entry) => entry.position === position);
  if (entryIndex !== -1) binderTextureApplyQueue.splice(entryIndex, 1);
  binderTextureApplyPositions.delete(position);
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
  binderTargetClosure = 0;
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
    && !getBinderTargetClosedSide()
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
  binderTargetClosure = 0;
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
  const closedSide = getBinderTargetClosedSide();
  const flippingOuterCover = Boolean(binderOuterFlipState);
  const swappingTableBinder = Boolean(binderEvilTableSwapState);
  els.binderPanel.classList.toggle("is-closed", closedSide !== 0);
  els.binderPanel.classList.toggle("is-flipping-outer-cover", flippingOuterCover);
  els.binderPanel.classList.toggle("is-swapping-table-binder", swappingTableBinder);
  els.binderPanel.dataset.closedSide = closedSide < 0
    ? "start"
    : closedSide > 0
      ? "end"
      : "";
  els.binderCanvas.setAttribute(
    "aria-label",
    swappingTableBinder
      ? `3D card binder, switching to ${COLLECTION_CONFIGS[binderEvilTableSwapState.collectionId]?.label || "selected"} binder`
      : flippingOuterCover
      ? `3D card binder, flipping to ${binderOuterFlipState.toSide < 0 ? "front" : "back"} cover`
      : closedSide
      ? `3D card binder, ${closedSide < 0 ? "front" : "back"} cover`
      : "3D card binder",
  );
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
  els.binderTableViewButton.hidden = focused;
  els.binderTableViewButton.disabled = flippingOuterCover || swappingTableBinder;
  els.binderTableViewButton.setAttribute("aria-pressed", String(binderTableViewTarget > 0.5));
  const tableViewLabel = binderTableViewTarget > 0.5
    ? "Return binder to upright view"
    : "Place binder on table";
  els.binderTableViewButton.setAttribute("title", tableViewLabel);
  els.binderTableViewButton.setAttribute("aria-label", tableViewLabel);
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
  els.binderShuffleButton.disabled = flippingOuterCover || swappingTableBinder;
  updateBinderFavoriteButton();
  updateBinderPageStatus(focused);

  if (flippingOuterCover || swappingTableBinder) {
    els.binderPreviousPageButton.disabled = true;
    els.binderNextPageButton.disabled = true;
    const busyLabel = swappingTableBinder ? "Switching binder" : "Flipping binder";
    els.binderPreviousPageButton.setAttribute("title", busyLabel);
    els.binderPreviousPageButton.setAttribute("aria-label", busyLabel);
    els.binderNextPageButton.setAttribute("title", busyLabel);
    els.binderNextPageButton.setAttribute("aria-label", busyLabel);
    queueSessionViewStateSave();
    return;
  }

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
    const atStart = currentSide <= BINDER_SINGLE_PAGE_COVER_SIDE;
    const atEnd = currentSide >= getBinderTotalPageSides() - 1;
    els.binderPreviousPageButton.disabled = false;
    els.binderNextPageButton.disabled = false;
    const previousLabel = closedSide < 0
      ? "Flip to back cover"
      : closedSide > 0
        ? "Open binder"
        : atStart
          ? "Close binder"
          : "Previous binder page side";
    const nextLabel = closedSide > 0
      ? "Flip to front cover"
      : closedSide < 0
        ? "Open binder"
        : atEnd
          ? "Close binder"
          : "Next binder page side";
    els.binderPreviousPageButton.setAttribute("title", previousLabel);
    els.binderPreviousPageButton.setAttribute("aria-label", previousLabel);
    els.binderNextPageButton.setAttribute("title", nextLabel);
    els.binderNextPageButton.setAttribute("aria-label", nextLabel);
    queueSessionViewStateSave();
    return;
  }

  const currentPage = Math.round(binderTargetTurn);
  const atStart = currentPage <= 0;
  const atEnd = currentPage >= binderPageCount;
  els.binderPreviousPageButton.disabled = false;
  els.binderNextPageButton.disabled = false;
  const previousLabel = closedSide < 0
    ? "Flip to back cover"
    : closedSide > 0
      ? "Open binder"
      : atStart
        ? "Close binder"
        : "Previous binder page";
  const nextLabel = closedSide > 0
    ? "Flip to front cover"
    : closedSide < 0
      ? "Open binder"
      : atEnd
        ? "Close binder"
        : "Next binder page";
  els.binderPreviousPageButton.setAttribute("title", previousLabel);
  els.binderPreviousPageButton.setAttribute("aria-label", previousLabel);
  els.binderNextPageButton.setAttribute("title", nextLabel);
  els.binderNextPageButton.setAttribute("aria-label", nextLabel);
  queueSessionViewStateSave();
}

function updateBinderPageStatus(focused = isBinderFocusView()) {
  if (binderPageStatusInput) return;

  if (!focused && binderEvilTableSwapState) {
    els.binderPageStatus.textContent = withWalletStatusLabel("switching");
    return;
  }

  if (!focused && binderOuterFlipState) {
    els.binderPageStatus.textContent = withWalletStatusLabel("flipping");
    return;
  }

  const closedSide = getBinderTargetClosedSide();
  if (!focused && closedSide) {
    els.binderPageStatus.textContent = withWalletStatusLabel(
      closedSide < 0 ? "front" : "back",
    );
    return;
  }

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

function scheduleFocusedBinderCardPrewarm() {
  cancelFocusedBinderCardPrewarm();
  if (!galleryOpen || !isBinderMode || !isBinderFocused()) return;

  const focusPosition = binderFocusPosition;
  const sharpPositions = getFocusedBinderSharpPositions(focusPosition);
  if (!sharpPositions.length) return;
  restoreBinderFullResolutionTexturesExcept(new Set(sharpPositions));

  const token = ++focusedBinderCardPrewarmToken;
  const beginPrewarm = () => {
    if (token !== focusedBinderCardPrewarmToken) return;
    if (!galleryOpen || !isBinderMode || binderFocusPosition !== focusPosition) return;
    prewarmFocusedBinderSharpPositions(sharpPositions, focusPosition, token).catch(console.error);
  };

  if (FOCUSED_BINDER_CARD_PREWARM_DELAY_MS <= 0) {
    beginPrewarm();
    return;
  }

  focusedBinderCardPrewarmTimer = window.setTimeout(() => {
    focusedBinderCardPrewarmTimer = 0;
    beginPrewarm();
  }, FOCUSED_BINDER_CARD_PREWARM_DELAY_MS);
}

function getFocusedBinderSharpPositions(position = binderFocusPosition) {
  const focusedSpot = getBinderFocusedGridPosition(position);
  if (!focusedSpot) return [];

  const positions = new Set([position]);
  for (const direction of [-1, 1]) {
    const neighborPosition = getFocusedBinderHorizontalNeighborPosition(
      focusedSpot,
      direction,
    );
    if (neighborPosition >= 0) positions.add(neighborPosition);
  }
  for (const visiblePosition of getFocusedBinderFullyVisiblePositions(position)) {
    positions.add(visiblePosition);
  }
  return [...positions];
}

function getFocusedBinderFullyVisiblePositions(position = binderFocusPosition) {
  const focusedMesh = binderCardMeshByPosition.get(position);
  if (!focusedMesh || !binderCamera || !binderRoot || !els.binderCanvas) return [];

  binderRoot.updateMatrixWorld(true);
  const focusWorldPosition = focusedMesh.getWorldPosition(new THREE.Vector3());
  const projectionCamera = binderCamera.clone();
  projectionCamera.position.set(
    focusWorldPosition.x,
    focusWorldPosition.y,
    focusWorldPosition.z + getBinderFocusDistance(),
  );
  projectionCamera.lookAt(focusWorldPosition);
  projectionCamera.updateMatrixWorld(true);
  projectionCamera.updateProjectionMatrix();

  const canvasRect = els.binderCanvas.getBoundingClientRect();
  if (canvasRect.width < 1 || canvasRect.height < 1) return [];

  const edgeTolerance = FOCUSED_BINDER_FULLY_VISIBLE_EDGE_TOLERANCE_PX;
  const positions = [];
  for (const candidatePosition of getBinderSpreadPositionsForTurn(
    getBinderTurnForPosition(position),
  )) {
    const mesh = binderCardMeshByPosition.get(candidatePosition);
    if (!mesh || !isVisibleThroughParents(mesh)) continue;

    const rect = getBinderMeshScreenRect(mesh, projectionCamera, canvasRect);
    if (!rect) continue;
    const fullyVisible = (
      rect.left >= canvasRect.left - edgeTolerance
      && rect.top >= canvasRect.top - edgeTolerance
      && rect.left + rect.width <= canvasRect.right + edgeTolerance
      && rect.top + rect.height <= canvasRect.bottom + edgeTolerance
    );
    if (fullyVisible) positions.push(candidatePosition);
  }
  return positions;
}

function getFocusedBinderHorizontalNeighborPosition(focusedSpot, direction) {
  const horizontalDirection = Math.sign(direction);
  if (!focusedSpot || !horizontalDirection) return -1;

  let turn = focusedSpot.turn;
  let spreadColumn = focusedSpot.spreadColumn + horizontalDirection;
  const spreadColumnCount = BINDER_COLUMNS * 2;

  // The six-column spread is continuous through the center spine. At its
  // outer edges, continue into the neighboring spread so the sharp trio also
  // survives a physical page boundary.
  if (spreadColumn < 0 || spreadColumn >= spreadColumnCount) {
    turn += horizontalDirection;
    spreadColumn = horizontalDirection < 0 ? spreadColumnCount - 1 : 0;
  }

  return getBinderPositionForSpreadSpot({
    turn,
    row: focusedSpot.row,
    spreadColumn,
  });
}

async function prewarmFocusedBinderSharpPositions(positions, focusPosition, token) {
  const entries = positions
    .map((position) => ({ position, cardIndex: binderVisibleIndexes[position] }))
    .filter(({ cardIndex }) => Number.isInteger(cardIndex) && CARDS[cardIndex]);
  const focusedEntry = entries.find((entry) => entry.position === focusPosition);
  const neighborEntries = entries.filter((entry) => entry !== focusedEntry);

  if (focusedEntry) {
    // The full 3D preparation can include card backs and effect maps. Start it
    // now, but let the front image become sharp as soon as that single asset is
    // ready instead of holding the binder texture behind the extra work.
    const focusedCard = CARDS[focusedEntry.cardIndex];
    prepareIndividualCardFor3D(focusedCard).catch(console.error);
    prewarmIndividualCardModelAssets(focusedCard).catch(console.error);
  }

  const loadEntry = async (entry) => {
    const frontTexture = await getPreparedCardTexture(CARDS[entry.cardIndex]);
    if (
      token !== focusedBinderCardPrewarmToken
      || binderFocusPosition !== focusPosition
      || !positions.includes(entry.position)
    ) {
      return;
    }
    upgradeFocusedBinderTexture(entry.position, frontTexture);
  };

  // Do not make the adjacent cards wait for the focused card's 3D/effect
  // preparation. This is especially noticeable when a neighbor crosses the
  // spine onto the other physical page.
  await Promise.all([
    focusedEntry ? loadEntry(focusedEntry) : Promise.resolve(),
    ...neighborEntries.map((entry) => loadEntry(entry)),
  ]);
}

function upgradeFocusedBinderTexture(position, texture) {
  const mesh = binderCardMeshByPosition.get(position);
  if (!mesh || !texture) return;
  binderFullResolutionMeshes.add(mesh);
  pinBinderFocusedCardTexture(mesh, texture);
  requestBinderRenderOnce();
}

function restoreBinderMeshThumbnail(mesh) {
  if (!mesh?.parent || !Number.isInteger(mesh.userData?.cardIndex)) {
    binderFullResolutionMeshes.delete(mesh);
    return;
  }
  const card = CARDS[mesh.userData.cardIndex];
  const position = mesh.userData.binderPosition;
  const readyTexture = getReadyBinderTexture(card);
  binderFullResolutionMeshes.delete(mesh);
  if (readyTexture) {
    prepareTextureForImmediateDisplay(readyTexture);
    mesh.material.map = readyTexture;
    applyBinderCardAspectFit(mesh, card, readyTexture);
    mesh.material.opacity = 1;
    mesh.userData.textureLoaded = true;
    mesh.userData.textureLoading = false;
    mesh.userData.textureFadeComplete = true;
    requestBinderRenderOnce();
    return;
  }

  mesh.material.map = getBinderPlaceholderTexture();
  mesh.userData.textureLoaded = false;
  getBinderTexture(card).then((texture) => {
    if (!mesh.parent || mesh.userData.binderPosition !== position) return;
    mesh.material.map = texture;
    applyBinderCardAspectFit(mesh, card, texture);
    mesh.userData.textureLoaded = true;
    requestBinderRenderOnce();
  }).catch(() => {});
}

function clearBinderFullResolutionTexture() {
  for (const mesh of Array.from(binderFullResolutionMeshes)) {
    restoreBinderMeshThumbnail(mesh);
  }
}

function restoreBinderFullResolutionTexturesExcept(positions) {
  for (const mesh of Array.from(binderFullResolutionMeshes)) {
    if (!positions.has(mesh.userData?.binderPosition)) restoreBinderMeshThumbnail(mesh);
  }
}

function cancelFocusedBinderCardPrewarm() {
  focusedBinderCardPrewarmToken += 1;
  if (!focusedBinderCardPrewarmTimer) return;
  window.clearTimeout(focusedBinderCardPrewarmTimer);
  focusedBinderCardPrewarmTimer = 0;
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
  const changed = nextSide !== binderSinglePageSide
    || nextTurn !== clamp(Math.round(binderTargetTurn), 0, binderPageCount)
    || binderTargetClosure !== 0;
  binderSinglePageSide = nextSide;
  binderSinglePageSideTouched = true;
  if (nextTurn !== binderTargetTurn) binderBendDirection = Math.sign(nextTurn - binderTargetTurn) || binderBendDirection;
  binderTargetClosure = 0;
  if (immediate) binderClosure = 0;
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
  const viewportWidth = width || getAppViewportWidth();
  const viewportHeight = height || getAppViewportHeight();
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
  if (binderOuterFlipState) return 0;

  const rootOffsetX = binderRoot?.position.x || 0;
  const closedSide = getBinderTargetClosedSide();
  if (closedSide) {
    return -closedSide * BINDER_CLOSED_COVER_CENTER_X + rootOffsetX;
  }
  if (side === BINDER_SINGLE_PAGE_COVER_SIDE) {
    return -BINDER_PAGE_WIDTH / 2 + rootOffsetX;
  }
  return (side % 2 === 0 ? BINDER_PAGE_WIDTH / 2 : -BINDER_PAGE_WIDTH / 2)
    + rootOffsetX;
}

function focusBinderPosition(position, { immediate = false, pinnedTexture = null } = {}) {
  if (!Number.isInteger(position) || position < 0 || position >= binderVisibleIndexes.length) return;

  if (isBinderTableViewActive()) {
    setBinderTableView(false, {
      durationMs: BINDER_TABLE_TO_FOCUS_DURATION_MS,
      easing: "out",
    });
  }
  markBinderInteractionActive();
  const nextTurn = getBinderTurnForPosition(position);
  binderTargetClosure = 0;
  if (immediate) binderClosure = 0;
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
  if (pinnedTexture) pinBinderFocusedCardTexture(getBinderFocusedMesh(), pinnedTexture);
  els.body.classList.add("binder-focused");
  els.binderPanel.classList.add("is-focused");
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
  scheduleFocusedBinderCardPrewarm();
}

function focusBinderIntroNote({ immediate = false } = {}) {
  if (hasActiveBinderIntroSuppressor()) return false;

  if (isBinderTableViewActive()) {
    setBinderTableView(false, {
      durationMs: BINDER_TABLE_TO_FOCUS_DURATION_MS,
      easing: "out",
    });
  }
  markBinderInteractionActive();
  binderIntroFocused = true;
  binderFocusPosition = -1;
  binderLastOpenTap = null;
  binderSinglePageSide = BINDER_SINGLE_PAGE_COVER_SIDE;
  binderSinglePageSideTouched = true;
  if (binderTargetTurn !== 0) binderBendDirection = Math.sign(-binderTargetTurn) || binderBendDirection;
  binderTargetClosure = 0;
  if (immediate) binderClosure = 0;
  binderTargetTurn = 0;
  binderTextureQueueKey = "";
  if (immediate) binderTurn = 0;
  ensureBinderPageWindow({ force: true, center: 0, queueTextures: false });
  els.body.classList.add("binder-focused");
  els.binderPanel.classList.add("is-focused");
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
  cancelFocusedBinderCardPrewarm();
  return true;
}

function clearBinderFocus(options = {}) {
  markBinderInteractionActive();
  clearBinderFullResolutionTexture();
  const introFocused = isBinderIntroFocused();
  const focusedSide = isBinderFocused() ? getBinderSinglePageSideForPosition(binderFocusPosition) : null;
  binderIntroFocused = false;
  binderFocusPosition = -1;
  binderLastOpenTap = null;
  els.body.classList.remove("binder-focused");
  els.binderPanel.classList.remove("is-focused");
  cancelFocusedBinderCardPrewarm();
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
  binderTargetClosure = clamp(Math.round(binderTargetClosure), -1, 1);
  binderClosure = binderTargetClosure;
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
  cancelFocusedBinderCardPrewarm();
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

  const loadingToken = binderOpenCardLoadingToken + 1;
  beginBinderOpenCardButtonLoading(loadingToken);
  try {
    await transitionFocusedBinderCardToIndividual(cardIndex, focusedMesh, { loadingToken });
  } finally {
    endBinderOpenCardButtonLoading(loadingToken);
  }
}

async function transitionIndividualCardToFocusedBinder() {
  if (binderCardViewTransitionActive || !Number.isInteger(currentIndex)) return;

  const cardIndex = currentIndex;
  const returnTexture = getIndividualCardReturnTexture(cardIndex);
  lockBinderFocusZoomOut(BINDER_FOCUS_TRANSITION_LOCK_MS);
  setCardEffectViewTargetOpacity(0);
  const transitionCard = document.createElement("img");
  transitionCard.className = "binder-card-transition-card";
  transitionCard.alt = "";
  transitionCard.decoding = "async";
  transitionCard.src = getIndividualTransitionImageSource();

  const sourceRect = getIndividualCardScreenRect() || getCenteredFallbackRect();
  const transitionStickers = createBinderTransitionStickers(CARDS[cardIndex], sourceRect);
  binderCardViewTransitionActive = true;
  els.body.classList.add(
    "binder-card-transitioning",
    "binder-card-transition-away",
    "binder-card-transition-show-card",
  );
  applyTransitionRect(transitionCard, sourceRect);
  document.body.append(transitionCard, ...transitionStickers.map(({ element }) => element));
  transitionCard.getBoundingClientRect();
  transitionStickers.forEach(({ element }) => element.getBoundingClientRect());

  try {
    const prepared = await openFocusedBinderGalleryForCard(cardIndex, { pinnedTexture: returnTexture });
    const focusedMesh = prepared ? getBinderFocusedMesh() : null;
    pinBinderFocusedCardTexture(focusedMesh, returnTexture);
    const targetRect = getBinderMeshScreenRect(focusedMesh) || getCenteredFallbackRect();

    requestAnimationFrame(() => {
      els.body.classList.remove("binder-card-transition-away", "binder-card-transition-show-card");
      applyTransitionRect(transitionCard, targetRect);
      updateBinderTransitionStickers(transitionStickers, targetRect, { visible: true });
    });

    await delay(BINDER_CARD_VIEW_TRANSITION_MS);
    transitionCard.classList.add("is-dissolving");
    transitionStickers.forEach(({ element }) => element.classList.add("is-dissolving"));
    lockBinderFocusZoomOut();
    await delay(220);
  } finally {
    transitionCard.remove();
    transitionStickers.forEach(({ element }) => element.remove());
    els.body.classList.remove(
      "binder-card-transitioning",
      "binder-card-transition-away",
      "binder-card-transition-show-card",
    );
    binderCardViewTransitionActive = false;
  }
}

function createBinderTransitionStickers(card, rect) {
  return getBinderCardStickerKinds(card).map((kind, slotIndex) => {
    const element = document.createElement("img");
    element.className = "binder-card-transition-sticker";
    element.alt = "";
    element.decoding = "async";
    element.src = getBinderStickerTextureUrl(kind);
    const sticker = {
      element,
      kind,
      slotIndex,
      hasTradeSticker: isCardMarkedForTrade(card),
      hasListedSticker: Boolean(card?.listed),
      fixedClearLayout: card?.collection === "clear",
      rotation: card?.collection === "clear" ? 0 : getBinderStickerRotation(card, kind),
    };
    applyBinderTransitionStickerRect(sticker, rect);
    return sticker;
  });
}

function updateBinderTransitionStickers(stickers, rect, { visible = false } = {}) {
  for (const sticker of stickers) {
    applyBinderTransitionStickerRect(sticker, rect);
    sticker.element.classList.toggle("is-visible", visible);
  }
}

function applyBinderTransitionStickerRect(sticker, cardRect) {
  const [width, height] = BINDER_STICKER_SIZES[sticker.kind] || BINDER_STICKER_SIZES.trade;
  const verticalOffset = sticker.fixedClearLayout
    ? sticker.kind === "trade" && sticker.hasListedSticker
      ? BINDER_STICKER_SIZES.listed[1] + BINDER_STICKER_GAP
      : 0
    : sticker.kind === "listed" && sticker.hasTradeSticker
      ? BINDER_STICKER_SIZES.trade[1] + BINDER_STICKER_GAP
      : 0;
  const widthRatio = width / BINDER_CARD_WIDTH;
  const heightRatio = height / BINDER_CARD_HEIGHT;
  const rightRatio = 0.5 + BINDER_STICKER_RIGHT_EDGE / BINDER_CARD_WIDTH;
  const bottomRatio = 0.5
    - (BINDER_STICKER_BOTTOM_EDGE + verticalOffset) / BINDER_CARD_HEIGHT;
  Object.assign(sticker.element.style, {
    left: `${cardRect.left + cardRect.width * (rightRatio - widthRatio)}px`,
    top: `${cardRect.top + cardRect.height * (bottomRatio - heightRatio)}px`,
    width: `${cardRect.width * widthRatio}px`,
    height: `${cardRect.height * heightRatio}px`,
    transform: `translateZ(0) rotate(${-THREE.MathUtils.radToDeg(sticker.rotation)}deg)`,
  });
}

function getIndividualCardReturnTexture(cardIndex = currentIndex) {
  const currentTexture = cardFrontMesh?.material?.map || null;
  if (currentTexture && currentTexture !== getCardPlaceholderTexture()) return currentTexture;
  return getPreparedIndividualCardResult(CARDS[cardIndex])?.frontTexture || null;
}

function pinBinderFocusedCardTexture(mesh, texture) {
  if (!mesh || !texture) return false;

  const position = mesh.userData.binderPosition;
  if (Number.isInteger(position)) {
    removePendingBinderTextureApplyPosition(position);
  }

  const targetOpacity = 1;
  prepareTextureForImmediateDisplay(texture);
  mesh.material.map = texture;
  applyBinderCardAspectFit(mesh, CARDS[mesh.userData.cardIndex], texture);
  mesh.material.opacity = Math.max(mesh.material.opacity ?? 0, targetOpacity);
  mesh.userData.textureLoaded = true;
  mesh.userData.textureLoading = false;
  mesh.userData.renderOnApply = false;
  mesh.userData.textureFadeStartedAt = performance.now();
  mesh.userData.textureFadeStartOpacity = mesh.material.opacity;
  mesh.userData.textureFadeComplete = true;
  return true;
}

async function openFocusedBinderGalleryForCard(cardIndex, options = {}) {
  if (!Number.isInteger(cardIndex)) return false;

  traitSearchOpen = false;
  traitSearchCollectionId = "";
  setGalleryViewMode(true, { render: false });
  galleryOpen = true;
  stopCardRenderLoop();
  els.body.classList.add("is-gallery");
  els.galleryToggleButton.setAttribute("aria-pressed", "true");
  els.galleryPanel.hidden = false;
  updateFavoriteButtons();
  updateTraitSearchState();

  const indexes = getVisibleIndexes();
  cancelGalleryRender();
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

  focusBinderPosition(focusPosition, { immediate: true, pinnedTexture: options.pinnedTexture });
  pinBinderFocusedCardTexture(getBinderFocusedMesh(), options.pinnedTexture);
  renderBinderSceneOnce({ includePreload: false, immediateCamera: true });
  return true;
}

async function transitionFocusedBinderCardToIndividual(cardIndex, focusedMesh, { loadingToken = 0 } = {}) {
  binderCardViewTransitionActive = true;
  if (!focusedMesh.userData.textureLoaded) {
    loadBinderTextureForPosition(
      focusedMesh.userData.binderPosition,
      binderBuildToken,
      { renderOnApply: true, priority: 0 },
    );
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
    const prepared = getPreparedIndividualCardResult(card);
    const frontTexture = prepared?.frontTexture || getImmediateBinderMeshTexture(focusedMesh);
    const backTexture = prepared?.backTexture || null;
    const effectTextures = prepared?.effectTextures || null;
    const cardOptions = {};
    if (frontTexture) cardOptions.frontTexture = frontTexture;
    if (backTexture) cardOptions.backTexture = backTexture;
    if (prepared) cardOptions.effectTextures = effectTextures;
    setCard(cardIndex, cardOptions);
    const waitForClearModel = card.collection === "clear"
      && getIndividualCardModelRenderingProfile(card) === INDIVIDUAL_CARD_CLEAR_RESIN_PROFILE;
    const individualModelReadyPromise = waitForClearModel
      ? cardGroup.userData.individualCardModelReadyPromise
      : null;
    currentRotationX = 0;
    currentRotationY = 0;
    targetRotationX = 0;
    targetRotationY = 0;
    cardShuffleSpinY = 0;
    cardGroup.rotation.x = 0;
    cardGroup.rotation.y = 0;
    resizeCardRenderer();

    const targetRect = getIndividualCardScreenRect() || getCenteredFallbackRect();
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        markBinderOpenCardPrepared(loadingToken);
        resolve();
      });
    });
    requestAnimationFrame(() => {
      els.body.classList.add("binder-card-transition-away");
      applyTransitionRect(transitionCard, targetRect);
    });

    if (waitForClearModel) {
      await Promise.all([
        delay(BINDER_CARD_VIEW_TRANSITION_MS),
        individualModelReadyPromise || Promise.resolve(false),
      ]);
    } else {
      await delay(BINDER_CARD_VIEW_TRANSITION_MS * 0.46);
      setCardEffectViewTargetOpacity(1);
      els.body.classList.add("binder-card-transition-show-card");
      await delay(BINDER_CARD_VIEW_TRANSITION_MS * 0.54);
    }

    rememberCurrentBinderViewFocus();
    binderIntroFocused = false;
    binderFocusPosition = -1;
    setCardEffectViewTargetOpacity(1);
    els.body.classList.add("binder-card-transition-show-card");
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
  if (!mesh?.userData?.textureLoaded) return cardAssetUrl(CARDS[cardIndex]);

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

function getImmediateBinderMeshTexture(mesh) {
  if (!mesh?.userData?.textureLoaded) return null;
  return mesh.material?.map || null;
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

function getBinderMeshScreenRect(
  mesh,
  projectionCamera = binderCamera,
  canvasRect = els.binderCanvas?.getBoundingClientRect(),
) {
  if (!mesh || !projectionCamera || !canvasRect || !binderRoot) return null;

  binderRoot.updateMatrixWorld(true);
  const corners = [
    new THREE.Vector3(-BINDER_CARD_WIDTH / 2, -BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(BINDER_CARD_WIDTH / 2, -BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(BINDER_CARD_WIDTH / 2, BINDER_CARD_HEIGHT / 2, 0),
    new THREE.Vector3(-BINDER_CARD_WIDTH / 2, BINDER_CARD_HEIGHT / 2, 0),
  ].map((corner) => {
    const projected = corner.applyMatrix4(mesh.matrixWorld).project(projectionCamera);
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
  const aspectScale = getCardAspectFitScale(CARDS[currentIndex]);
  const halfWidth = CARD_WIDTH * aspectScale.x / 2;
  const halfHeight = CARD_HEIGHT * aspectScale.y / 2;
  const corners = [
    new THREE.Vector3(-halfWidth, -halfHeight, z),
    new THREE.Vector3(halfWidth, -halfHeight, z),
    new THREE.Vector3(halfWidth, halfHeight, z),
    new THREE.Vector3(-halfWidth, halfHeight, z),
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
  const viewportWidth = getAppViewportWidth() || window.innerWidth || 1;
  const viewportHeight = getAppViewportHeight() || window.innerHeight || viewportWidth;
  const width = Math.min(viewportWidth * 0.42, 360);
  const height = width * (CARD_HEIGHT / CARD_WIDTH);
  return {
    left: appViewportLeft + viewportWidth / 2 - width / 2,
    top: appViewportTop + viewportHeight / 2 - height / 2,
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

function nextAnimationFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
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
  const fade = clamp(
    1 - getCardEffectOutsideDistance(x, y) / CARD_NFT_2_EFFECT_EDGE_FADE_DISTANCE,
    0,
    1,
  );
  return fade * fade * (3 - 2 * fade);
}

function setCardEffectPointerTarget(x, y, active) {
  const nextX = clamp(x, -CARD_NFT_2_EFFECT_POINTER_EXTENT, 1 + CARD_NFT_2_EFFECT_POINTER_EXTENT);
  const nextY = clamp(y, -CARD_NFT_2_EFFECT_POINTER_EXTENT, 1 + CARD_NFT_2_EFFECT_POINTER_EXTENT);
  cardEffectPointerTargetX = nextX;
  cardEffectPointerTargetY = nextY;
  cardEffectPointerTargetActive = clamp(active, 0, 1);
}

function updateCardEffectRayFromClientPosition(clientX, clientY) {
  if (
    !Number.isFinite(clientX)
    || !Number.isFinite(clientY)
    || !cardCamera
    || !els.cardCanvas
    || !cardFrontMesh
    || !cardBackMesh
  ) return false;
  const rect = els.cardCanvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return false;

  cardGroup?.updateMatrixWorld(true);
  cardCamera.updateMatrixWorld(true);
  cardPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  cardPointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
  cardRaycaster.setFromCamera(cardPointer, cardCamera);
  return true;
}

function updateCardEffectPointerFromCurrentRay() {
  const hit = cardRaycaster.intersectObjects([cardFrontMesh, cardBackMesh], false)[0];

  if (hit?.uv) {
    const nextX = clamp(hit.uv.x, 0, 1);
    const nextY = clamp(hit.uv.y, 0, 1);
    setCardEffectPointerTarget(nextX, nextY, 1);
    return;
  }

  const planeUv = getCardEffectPlaneUvFromCurrentRay();
  if (planeUv) {
    setCardEffectPointerTarget(
      planeUv.x,
      planeUv.y,
      getCardEffectEdgeActivity(planeUv.x, planeUv.y),
    );
    return;
  }

  clearCardEffectPointer();
}

function updateCardEffectRayFromEvent(event) {
  if (!event) return false;
  return updateCardEffectRayFromClientPosition(event.clientX, event.clientY);
}

function updateCardEffectPointerFromEvent(event) {
  if (!event) return;
  if (
    event.pointerType !== "touch"
    && Number.isFinite(event.clientX)
    && Number.isFinite(event.clientY)
  ) {
    cardEffectPointerClientX = event.clientX;
    cardEffectPointerClientY = event.clientY;
  }
  if (!updateCardEffectRayFromEvent(event)) return;
  updateCardEffectPointerFromCurrentRay();
}

function refreshCardEffectPointerProjection() {
  if (
    cardEffectPointerTargetActive <= 0.002
    && cardEffectPointerActive <= 0.002
  ) return;
  if (!updateCardEffectRayFromClientPosition(
    cardEffectPointerClientX,
    cardEffectPointerClientY,
  )) return;
  updateCardEffectPointerFromCurrentRay();
}

function clearCardEffectPointer() {
  setCardEffectPointerTarget(
    cardEffectPointerTargetX,
    cardEffectPointerTargetY,
    0,
  );
}

function onGlobalCardEffectPointerMove(event) {
  if (
    event.pointerType === "touch"
    || galleryOpen
    || isBinderMode
    || !cardFrontMesh
    || !cardBackMesh
  ) return;
  updateCardEffectPointerFromEvent(event);
}

function updateCardEffectPointer() {
  const activeAlpha = cardEffectPointerTargetActive > cardEffectPointerActive ? 0.2 : 0.1;
  const rotationTracking = (
    dragState
    || Math.abs(currentRotationX - targetRotationX) > 0.001
    || Math.abs(currentRotationY - targetRotationY) > 0.001
    || Math.abs(individualCardHoverTiltVelocityX) > 0.0001
    || Math.abs(individualCardHoverTiltVelocityY) > 0.0001
  );
  const positionAlpha = rotationTracking
    ? 0.68
    : cardEffectPointerTargetActive > cardEffectPointerActive
      ? 0.24
      : 0.18;
  cardEffectPointerX += (cardEffectPointerTargetX - cardEffectPointerX) * positionAlpha;
  cardEffectPointerY += (cardEffectPointerTargetY - cardEffectPointerY) * positionAlpha;
  cardEffectPointerActive += (cardEffectPointerTargetActive - cardEffectPointerActive) * activeAlpha;
  if (cardEffectPointerActive < 0.002 && cardEffectPointerTargetActive === 0) cardEffectPointerActive = 0;
}

function onCardPointerDown(event) {
  if (cardSwapAnimating || cardShuffleSpinAnimating) return;
  updateCardEffectPointerFromEvent(event);
  releaseIndividualCardHoverTilt();
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
  updateIndividualCardHoverTiltTarget(event);

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
  } else if (!isTouchLikePointer(event)) {
    updateIndividualCardHoverTiltTarget(event);
  }
}

function onCardPointerCaptureLost(event) {
  if (isTouchLikePointer(event)) {
    removeTouchPointer(cardTouchPointers, event);
    if (cardPinchGesture && cardTouchPointers.size < 2) cardPinchGesture = null;
  }
  if (!dragState || dragState.pointerId !== event.pointerId) return;
  dragState = null;
  releaseIndividualCardHoverTilt();
  if (!isCardPanMode()) {
    targetRotationX = 0;
    targetRotationY = 0;
  }
}

function onCardPointerLeave(event) {
  if (isTouchLikePointer(event)) {
    clearCardEffectPointer();
  } else {
    updateCardEffectPointerFromEvent(event);
  }
  releaseIndividualCardHoverTilt();
}

function updateIndividualCardHoverTiltTarget(event) {
  if (
    !event
    || event.pointerType === "touch"
    || dragState
    || galleryOpen
    || isBinderMode
    || !isCardPanMode()
    || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  ) {
    releaseIndividualCardHoverTilt();
    return;
  }

  if (!setIndividualCardHoverTiltTargetFromCurrentRay()) {
    releaseIndividualCardHoverTilt();
  }
}

function setIndividualCardHoverTiltTargetFromCurrentRay() {
  const uv = getCardEffectPlaneUvFromCurrentRay();
  if (!uv || getCardEffectOutsideDistance(uv.x, uv.y) > 0) {
    return false;
  }

  const horizontal = clamp((uv.x - 0.5) * 2, -1, 1);
  const vertical = clamp((uv.y - 0.5) * 2, -1, 1);
  individualCardHoverTiltTargetX = THREE.MathUtils.degToRad(
    -vertical * INDIVIDUAL_CARD_HOVER_TILT_MAX_X_DEG,
  );
  individualCardHoverTiltTargetY = THREE.MathUtils.degToRad(
    horizontal * INDIVIDUAL_CARD_HOVER_TILT_MAX_Y_DEG,
  );
  return true;
}

function refreshIndividualCardHoverTiltTarget() {
  if (
    dragState
    || galleryOpen
    || isBinderMode
    || !isCardPanMode()
    || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  ) return;
  if (!updateCardEffectRayFromClientPosition(
    cardEffectPointerClientX,
    cardEffectPointerClientY,
  )) return;
  if (!setIndividualCardHoverTiltTargetFromCurrentRay()) {
    releaseIndividualCardHoverTilt();
  }
}

function releaseIndividualCardHoverTilt({ immediate = false } = {}) {
  individualCardHoverTiltTargetX = 0;
  individualCardHoverTiltTargetY = 0;
  if (!immediate) return;
  individualCardHoverTiltX = 0;
  individualCardHoverTiltY = 0;
  individualCardHoverTiltVelocityX = 0;
  individualCardHoverTiltVelocityY = 0;
}

function updateIndividualCardHoverTilt() {
  if (!isCardPanMode() || galleryOpen || isBinderMode || dragState) {
    individualCardHoverTiltTargetX = 0;
    individualCardHoverTiltTargetY = 0;
  }

  individualCardHoverTiltVelocityX = (
    individualCardHoverTiltVelocityX
    + (individualCardHoverTiltTargetX - individualCardHoverTiltX)
      * INDIVIDUAL_CARD_HOVER_TILT_SPRING
  ) * INDIVIDUAL_CARD_HOVER_TILT_DAMPING;
  individualCardHoverTiltVelocityY = (
    individualCardHoverTiltVelocityY
    + (individualCardHoverTiltTargetY - individualCardHoverTiltY)
      * INDIVIDUAL_CARD_HOVER_TILT_SPRING
  ) * INDIVIDUAL_CARD_HOVER_TILT_DAMPING;
  individualCardHoverTiltX += individualCardHoverTiltVelocityX;
  individualCardHoverTiltY += individualCardHoverTiltVelocityY;

  if (
    individualCardHoverTiltTargetX === 0
    && Math.abs(individualCardHoverTiltX) < 0.00005
    && Math.abs(individualCardHoverTiltVelocityX) < 0.00005
  ) {
    individualCardHoverTiltX = 0;
    individualCardHoverTiltVelocityX = 0;
  }
  if (
    individualCardHoverTiltTargetY === 0
    && Math.abs(individualCardHoverTiltY) < 0.00005
    && Math.abs(individualCardHoverTiltVelocityY) < 0.00005
  ) {
    individualCardHoverTiltY = 0;
    individualCardHoverTiltVelocityY = 0;
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

  const draggedOuterFlip = binderOuterFlipState?.dragging
    ? binderOuterFlipState
    : null;
  binderDrag = null;
  binderLastOpenTap = null;
  if (draggedOuterFlip) {
    startBinderOuterFlipSettle(draggedOuterFlip, 0);
    return;
  }
  if (!isBinderFocusView()) {
    snapBinderNavigationState();
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

function cancelInterruptedPointerInteractions() {
  const cardPointerId = dragState?.pointerId;
  const binderPointerId = binderDrag?.pointerId;
  const draggedOuterFlip = binderOuterFlipState?.dragging
    ? binderOuterFlipState
    : null;
  dragState = null;
  targetRotationX = 0;
  targetRotationY = 0;
  binderDrag = null;
  binderLastOpenTap = null;
  resetTouchGestures();
  clearCardEffectPointer();
  clearBinderIntroLinkCursor();
  if (draggedOuterFlip) startBinderOuterFlipSettle(draggedOuterFlip, 0);

  try {
    if (cardPointerId != null && els.cardCanvas.hasPointerCapture(cardPointerId)) {
      els.cardCanvas.releasePointerCapture(cardPointerId);
    }
  } catch {
    // The browser may have already released capture while the window was losing focus.
  }
  try {
    if (binderPointerId != null && els.binderCanvas.hasPointerCapture(binderPointerId)) {
      els.binderCanvas.releasePointerCapture(binderPointerId);
    }
  } catch {
    // The browser may have already released capture while the window was losing focus.
  }

  if (binderPointerId != null && !draggedOuterFlip && !isBinderFocusView()) {
    snapBinderNavigationState();
    updateBinderPageControls();
    startBinderRenderLoop();
  }
}

function getBinderDragNavigationMode(drag, pageDelta) {
  if (!drag || Math.abs(pageDelta) < 0.002) return "";

  const startVirtualTurn = drag.startVirtualTurn;
  const startClosedSide = drag.startClosedSide;
  if (
    startClosedSide
    && Math.sign(pageDelta) === startClosedSide
  ) {
    return "outer-flip";
  }
  if (
    startVirtualTurn < 0
    || (Math.abs(startVirtualTurn) < 0.001 && pageDelta < 0)
  ) {
    return "front-closure";
  }
  if (
    startVirtualTurn > binderPageCount
    || (
      Math.abs(startVirtualTurn - binderPageCount) < 0.001
      && pageDelta > 0
    )
  ) {
    return "back-closure";
  }
  return "pages";
}

function getBinderDragVirtualTurn(drag, pageDelta) {
  const rawVirtualTurn = drag.startVirtualTurn + pageDelta;
  if (drag.navigationMode === "front-closure") {
    return clamp(rawVirtualTurn, -1, 0);
  }
  if (drag.navigationMode === "back-closure") {
    return clamp(rawVirtualTurn, binderPageCount, binderPageCount + 1);
  }
  return clamp(rawVirtualTurn, 0, binderPageCount);
}

function onBinderPointerDown(event) {
  if (
    !galleryOpen
    || !isBinderMode
    || binderOuterFlipState
    || binderEvilTableSwapState
    || binderPageCount < 1
  ) {
    return;
  }

  clearBinderIntroLinkCursor();
  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  markBinderInteractionActive();
  initBinderScene();
  startBinderRenderLoop();
  try {
    els.binderCanvas.setPointerCapture(event.pointerId);
  } catch {
    // Keep the drag usable if pointer capture is unavailable or was interrupted.
  }

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

  prewarmBinderFocusCandidate(event);
  binderDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    startTurn: binderTargetTurn,
    startVirtualTurn: getBinderVirtualTurn(),
    startClosedSide: getBinderTargetClosedSide(),
    startSinglePageSide: isBinderSinglePageView() ? getBinderSinglePageSide() : null,
    navigationMode: "",
    outerFlipState: null,
    moved: false,
  };
  binderWheelFocusLockUntil = 0;
  event.preventDefault();
}

function prewarmBinderFocusCandidate(event) {
  if (isBinderFocusView() || isBinderTableViewActive() || getBinderTargetClosedSide()) return;

  const hit = getBinderCardHit(event);
  const cardIndex = hit?.object?.userData?.cardIndex;
  if (!Number.isInteger(cardIndex) || !CARDS[cardIndex]) return;
  getPreparedCardTexture(CARDS[cardIndex]).catch(() => {});
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

  if (!isBinderFocusView()) {
    const pageDelta = -(deltaX / Math.max(rect.width, 1)) / 0.26;
    if (!binderDrag.navigationMode && binderDrag.moved) {
      binderDrag.navigationMode = getBinderDragNavigationMode(
        binderDrag,
        pageDelta,
      );
    }

    if (binderDrag.navigationMode === "outer-flip") {
      if (!binderDrag.outerFlipState) {
        binderDrag.outerFlipState = beginBinderOuterFlipDrag(
          binderDrag.startClosedSide,
        );
      }
      if (binderDrag.outerFlipState) {
        const outerFlipProgress = clamp(
          binderDrag.startClosedSide * pageDelta,
          0,
          1,
        );
        applyBinderOuterFlipProgress(
          binderDrag.outerFlipState,
          outerFlipProgress,
        );
      }
    } else if (
      binderDrag.navigationMode
      && !(isBinderSinglePageView() && isTouchLikePointer(event))
    ) {
      const virtualTurn = getBinderDragVirtualTurn(binderDrag, pageDelta);
      setBinderVirtualTurn(virtualTurn, { immediate: true });
      binderSinglePageSideTouched = true;
      binderBendDirection = Math.sign(pageDelta);
      binderTurn = binderTargetTurn;
      updateBinderPageControls();
    }
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

  if (finishedDrag.outerFlipState) {
    settleDraggedBinderOuterFlip(finishedDrag.outerFlipState);
    return;
  }

  if (wasClick) {
    if (handleBinderListedStickerTap(event)) return;
    if (handleBinderTableDisplayModelTap(event)) return;
    if (handleBinderTableDieTap(event)) return;
    if (handleEvilBinderTableSideTap(event)) return;
    if (handleBinderIntroLinkTap(event)) return;
    if (handleBinderIntroNoteTap(event)) return;
    if (handleFocusedBinderCardTap(event)) return;
    if (selectBinderCard(event)) return;
    handleFocusedBinderBackgroundTap(event);
  } else if (isBinderFocused()) {
    handleFocusedBinderSwipe(finishedDrag, event);
  } else if (!isBinderFocusView()) {
    if (handleBinderSinglePageSwipe(finishedDrag, event)) return;
    snapBinderNavigationState();
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
  const draggedOuterFlip = binderDrag.outerFlipState;
  binderDrag = null;
  if (draggedOuterFlip) {
    startBinderOuterFlipSettle(draggedOuterFlip, 0);
    return;
  }
  if (!isBinderFocusView()) snapBinderNavigationState();
  updateBinderPageControls();
  startBinderRenderLoop();
}

function onBinderPointerCaptureLost(event) {
  if (isTouchLikePointer(event)) {
    removeTouchPointer(binderTouchPointers, event);
    if (binderPinchGesture && binderTouchPointers.size < 2) binderPinchGesture = null;
  }
  if (!binderDrag || binderDrag.pointerId !== event.pointerId) return;
  onBinderPointerCancel(event);
}

function handleBinderWheel(event) {
  if (
    !galleryOpen
    || !isBinderMode
    || binderEvilTableSwapState
    || binderPageCount < 1
  ) {
    return;
  }

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
    resetBinderTableWheelOutDistance();
    if (isBinderIntroFocused()) {
      resetBinderFocusWheelInDistance();
      if (wheelDelta < 0 || binderCardViewTransitionActive || now < binderFocusZoomOutLockUntil) return;
      binderWheelFocusLockUntil = now + VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
      clearBinderFocus();
      return;
    }

    if (wheelDelta < 0) {
      if (binderCardViewTransitionActive) return;
      if (focusBinderWheelHitCard(event, now)) return;

      if (addBinderFocusWheelInDistance(-wheelDelta, now)) {
        binderWheelFocusLockUntil = now + VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
        resetViewSwitchWheelDistances();
        openFocusedBinderCard().catch(console.error);
      }
      return;
    }

    resetBinderFocusWheelInDistance();
    if (binderCardViewTransitionActive || now < binderFocusZoomOutLockUntil) {
      return;
    }
    binderWheelFocusLockUntil = now + VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
    clearBinderFocus();
    return;
  }

  resetBinderFocusWheelInDistance();
  if (wheelDelta > 0) {
    if (
      !isBinderTableViewActive()
      && addBinderTableWheelOutDistance(wheelDelta, now)
    ) {
      binderWheelFocusLockUntil = now + VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
      resetViewSwitchWheelDistances();
      setBinderTableView(true);
    }
    return;
  }

  resetBinderTableWheelOutDistance();
  if (wheelDelta === 0) return;

  if (getBinderIntroNoteHit(event)) {
    binderWheelFocusLockUntil = now + VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
    focusBinderIntroNote();
    return;
  }

  const hit = getBinderCardHit(event);
  if (!hit) return;

  binderWheelFocusLockUntil = now + VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
  focusBinderPosition(hit.object.userData.binderPosition);
}

function focusBinderWheelHitCard(event, now = performance.now()) {
  if (!isBinderFocused()) return false;

  const hit = getBinderCardHit(event);
  const position = hit?.object?.userData?.binderPosition;
  if (!Number.isInteger(position) || position === binderFocusPosition) return false;

  resetBinderFocusWheelInDistance();
  binderWheelFocusLockUntil = now + VIEW_SWITCH_CONTINUOUS_STEP_DELAY_MS;
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
  binderLastOpenTap = null;
  binderSinglePageSide = currentSide;
  binderSinglePageSideTouched = true;
  turnBinderSinglePage(deltaX < 0 ? 1 : -1);
  return true;
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

  if (isBinderTableViewActive()) return focusBinderIntroNote();
  navigateBinderIntroLink(hit.object.userData.binderIntroLinkUrl);
  return true;
}

function handleBinderIntroNoteTap(event) {
  const linkHit = getBinderIntroLinkHit(event);
  const noteHit = getBinderIntroNoteHit(event);
  if (!linkHit && !noteHit) return false;

  if (isBinderIntroFocused()) {
    if (linkHit) {
      navigateBinderIntroLink(linkHit.object.userData.binderIntroLinkUrl);
    }
    return true;
  }

  return focusBinderIntroNote();
}

function navigateBinderIntroLink(url) {
  const destination = new URL(url || BINDER_INTRO_LINK_URL, window.location.href);
  if (destination.origin === window.location.origin) {
    window.location.assign(destination.href);
    return;
  }
  window.open(destination.href, "_blank", "noopener,noreferrer");
}

function updateBinderIntroLinkCursor(event) {
  if (event.pointerType && event.pointerType !== "mouse") {
    clearBinderIntroLinkCursor();
    return;
  }
  const hasPointerTarget = getBinderTableDieHit(event)
    || getBinderTableDisplayModelHit(event)
    || getEvilBinderTableSideHit(event)
    || getBinderCardHit(event)
    || getBinderIntroLinkHit(event)
    || (!isBinderIntroFocused() && getBinderIntroNoteHit(event));
  els.binderCanvas.style.cursor = hasPointerTarget ? "pointer" : "";
}

function clearBinderIntroLinkCursor() {
  if (els.binderCanvas) els.binderCanvas.style.cursor = "";
}

function handleEvilBinderTableSideTap(event) {
  const hit = getEvilBinderTableSideHit(event);
  const collectionId = hit?.object?.userData?.evilBinderTableCollectionId;
  return collectionId ? beginEvilBinderTableSwap(collectionId) : false;
}

function getEvilBinderTableSideHit(event) {
  if (
    !binderCamera
    || binderEvilTableSetOpacity < 0.55
    || !canStartEvilBinderTableSwap()
  ) {
    return null;
  }

  const hitMeshes = binderEvilTableEntries
    .map((entry) => entry.hitMesh)
    .filter((mesh) => isVisibleThroughParents(mesh));
  if (!hitMeshes.length) return null;

  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(hitMeshes, false)[0] || null;
}

function getBinderIntroLinkHit(event) {
  if (!binderCamera || !binderIntroLinkMeshes.length) return null;
  if (Math.abs(binderClosure) > 0.08 || Math.abs(binderTargetClosure) > 0.08) return null;
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
  if (Math.abs(binderClosure) > 0.08 || Math.abs(binderTargetClosure) > 0.08) return null;
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

function handleBinderCanvasDoubleClick(event) {
  if (openClosedTableBinderFromPointer(event)) return;
  openFocusedBinderCardFromPointer(event);
}

function openClosedTableBinderFromPointer(event) {
  const closedSide = getBinderTargetClosedSide();
  if (
    !closedSide
    || !binderCamera
    || !binderShellState
    || binderTableViewTarget <= 0.5
    || binderTableViewProgress < 0.985
    || Math.abs(binderClosure) < 0.985
    || binderOuterFlipState
    || binderEvilTableSwapState
    || binderDrag
    || isBinderFocusView()
  ) {
    return false;
  }

  const activeCover = closedSide < 0
    ? binderShellState.leftCover
    : binderShellState.rightCover;
  if (!activeCover || !isVisibleThroughParents(activeCover)) return false;

  setBinderRaycasterFromEvent(event);
  if (!binderRaycaster.intersectObject(activeCover, false).length) return false;

  event.preventDefault();
  event.stopPropagation();
  closeBinderPageStatusEdit({ update: false });
  binderSpreadPreparationToken += 1;
  binderPreparingSpread = false;
  binderLastOpenTap = null;
  binderSinglePageSide = 0;
  binderSinglePageSideTouched = true;
  binderBendDirection = -closedSide;
  binderTargetTurn = 0;
  binderTurn = 0;
  binderTextureQueueKey = "";
  ensureBinderPageWindow({
    force: true,
    center: 0,
    queueTextures: false,
    updateTransforms: false,
  });
  setBinderClosureTarget(0);
  queueBinderTextureLoads(binderBuildToken, {
    force: true,
    includePreload: false,
  });
  requestBinderMaintenance(90);
  queueSessionViewStateSave();
  return true;
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
  if (Math.abs(binderClosure) > 0.08 || Math.abs(binderTargetClosure) > 0.08) return null;

  const cardMeshes = getBinderCardRaycastMeshes();
  if (!cardMeshes.length) return null;
  setBinderRaycasterFromEvent(event);
  return binderRaycaster.intersectObjects(cardMeshes, false)[0] || null;
}

function handleBinderListedStickerTap(event) {
  const hit = getBinderListedStickerHit(event);
  const cardIndex = hit?.object?.userData?.cardIndex;
  if (!Number.isInteger(cardIndex)) return false;

  const card = CARDS[cardIndex];
  const mint = String(card?.listedMint || card?.mint || "").trim();
  if (!mint) return false;

  event.preventDefault();
  event.stopPropagation();
  binderLastOpenTap = null;
  window.open(
    `${TENSOR_ITEM_URL_BASE}${encodeURIComponent(mint)}`,
    "_blank",
    "noopener,noreferrer",
  );
  return true;
}

function getBinderListedStickerHit(event) {
  if (!binderCamera || !binderCardMeshes.length) return null;
  if (Math.abs(binderClosure) > 0.08 || Math.abs(binderTargetClosure) > 0.08) return null;

  const stickers = binderCardMeshes.flatMap((card) => (
    isBinderCardOnCurrentPages(card)
      ? (card.userData.binderStickerMeshes || []).filter((sticker) => (
        sticker.userData.binderCardSticker === "listed"
        && isVisibleThroughParents(sticker)
      ))
      : []
  ));
  if (!stickers.length) return null;

  binderRoot?.updateMatrixWorld(true);
  const canvasRect = els.binderCanvas.getBoundingClientRect();
  for (const sticker of stickers) {
    const bounds = getBinderStickerScreenBounds(sticker, canvasRect);
    if (!bounds) continue;
    if (
      event.clientX >= bounds.left
      && event.clientX <= bounds.right
      && event.clientY >= bounds.top
      && event.clientY <= bounds.bottom
    ) {
      return { object: sticker };
    }
  }
  return null;
}

function getBinderStickerScreenBounds(sticker, canvasRect) {
  if (!sticker || !binderCamera || !canvasRect) return null;
  const corners = [
    new THREE.Vector3(-0.5, -0.5, 0),
    new THREE.Vector3(0.5, -0.5, 0),
    new THREE.Vector3(0.5, 0.5, 0),
    new THREE.Vector3(-0.5, 0.5, 0),
  ].map((corner) => {
    const projected = corner.applyMatrix4(sticker.matrixWorld).project(binderCamera);
    return {
      x: canvasRect.left + (projected.x + 1) * canvasRect.width / 2,
      y: canvasRect.top + (1 - projected.y) * canvasRect.height / 2,
    };
  });
  return {
    left: Math.min(...corners.map(({ x }) => x)),
    right: Math.max(...corners.map(({ x }) => x)),
    top: Math.min(...corners.map(({ y }) => y)),
    bottom: Math.max(...corners.map(({ y }) => y)),
  };
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

function startCardRenderLoop() {
  if (
    cardAnimationFrame
    || galleryOpen
    || document.hidden
    || cardContextLost
    || !cardRenderer
  ) {
    return;
  }
  cardAnimationFrame = requestAnimationFrame(animateCard);
}

function stopCardRenderLoop() {
  if (!cardAnimationFrame) return;
  cancelAnimationFrame(cardAnimationFrame);
  cardAnimationFrame = 0;
}

function animateCard(now = performance.now()) {
  cardAnimationFrame = 0;
  if (galleryOpen || document.hidden || cardContextLost || !cardRenderer) return;
  resizeCardRenderer();
  updateSmoothZoom();
  currentRotationX += (targetRotationX - currentRotationX) * 0.14;
  currentRotationY += (targetRotationY - currentRotationY) * 0.14;
  updateIndividualCardHoverTilt();
  cardGroup.rotation.x = currentRotationX + individualCardHoverTiltX;
  cardGroup.rotation.y = currentRotationY + individualCardHoverTiltY + cardShuffleSpinY;
  cardGroup.scale.setScalar(getResponsiveIndividualCardScale());
  targetCardOffsetX = getTraitCardOffsetX();
  currentCardOffsetX += (targetCardOffsetX - currentCardOffsetX) * 0.16;
  if (Math.abs(currentCardOffsetX) < 0.001 && targetCardOffsetX === 0) currentCardOffsetX = 0;
  currentCameraZ += (targetCameraZ - currentCameraZ) * 0.12;
  cardCamera.position.z = currentCameraZ;
  updateCardPan();
  updateCardSwapTween(now);
  cardGroup.position.x = currentCardOffsetX + currentPanX + cardSwapOffsetX;
  cardGroup.position.y = INDIVIDUAL_CARD_WORLD_Y + currentPanY;
  updateCardSwapIncomingTransform();
  applyCardSwapOpacity();
  const cardEffectTime = now * 0.001;
  updateCardGlossActivity();
  refreshCardEffectPointerProjection();
  refreshIndividualCardHoverTiltTarget();
  updateCardEffectPointer();
  updateCardEffectViewOpacity(now);
  updateCardGlossUniforms(cardGradientMesh, cardEffectTime);
  updateCardGlossUniforms(cardBackGradientMesh, cardEffectTime);
  updateCardGlossUniforms(cardGlareMesh, cardEffectTime);
  updateCardGlossUniforms(cardBackGlareMesh, cardEffectTime);
  updateCardSwapIncomingEffectUniforms(cardEffectTime);
  if (!galleryOpen) {
    updateAnimatedTextureRecords(getIndividualAnimatedTextureRecords());
  }
  cardRenderer.render(cardScene, cardCamera);
  cardAnimationFrame = requestAnimationFrame(animateCard);
}

function getTraitCardOffsetX() {
  if (!traitsOpen || galleryOpen || isTraitPanelCompact()) return 0;

  const viewportWidth = getAppViewportWidth();
  const viewportHeight = getAppViewportHeight();
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
  return !isUnrotatedCardFullyVisibleInViewport();
}

function isUnrotatedCardFullyVisibleInViewport() {
  if (!cardCamera || !els.cardCanvas) return true;
  const view = getCardVisibleWorldSize();
  const rect = els.cardCanvas.getBoundingClientRect();
  if (!view.width || !view.height || !rect.width || !rect.height) return true;

  const cardScale = getResponsiveIndividualCardScale();
  const halfCardWidth = (CARD_WIDTH * cardScale) / 2;
  const halfCardHeight = (CARD_HEIGHT * cardScale) / 2;
  const halfViewWidth = view.width / 2;
  const halfViewHeight = view.height / 2;
  const toleranceX = (view.width / rect.width) * CARD_PAN_CLIP_TOLERANCE_PX;
  const toleranceY = (view.height / rect.height) * CARD_PAN_CLIP_TOLERANCE_PX;
  const centerX = currentCardOffsetX;
  const centerY = INDIVIDUAL_CARD_WORLD_Y;

  return (
    centerX - halfCardWidth >= -halfViewWidth - toleranceX
    && centerX + halfCardWidth <= halfViewWidth + toleranceX
    && centerY - halfCardHeight >= -halfViewHeight - toleranceY
    && centerY + halfCardHeight <= halfViewHeight + toleranceY
  );
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
  releaseIndividualCardHoverTilt({ immediate: true });
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
  const xRange = getCardPanAxisRange(
    CARD_WIDTH * cardScale,
    view.width,
    currentCardOffsetX,
  );
  const yRange = getCardPanAxisRange(
    CARD_HEIGHT * cardScale,
    view.height,
    INDIVIDUAL_CARD_WORLD_Y,
  );
  return {
    x: clamp(x, xRange.min, xRange.max),
    y: clamp(y, yRange.min, yRange.max),
  };
}

function getCardPanAxisRange(cardSize, viewSize, baseCenter) {
  const overflow = cardSize - viewSize;
  if (overflow > 0) {
    const travel = overflow / 2 + CARD_PAN_VISIBLE_MARGIN;
    return {
      min: -travel - baseCenter,
      max: travel - baseCenter,
    };
  }

  const centerTravel = Math.max(0, (viewSize - cardSize) / 2);
  return {
    min: -centerTravel - baseCenter,
    max: centerTravel - baseCenter,
  };
}

function getResponsiveIndividualCardScale() {
  const viewportWidth = getAppViewportWidth() || CARD_MOBILE_SCALE_FULL_WIDTH;
  const progress = clamp(
    (viewportWidth - CARD_MOBILE_SCALE_MIN_WIDTH) / (CARD_MOBILE_SCALE_FULL_WIDTH - CARD_MOBILE_SCALE_MIN_WIDTH),
    0,
    1,
  );
  const responsiveScale = CARD_MOBILE_SCALE_MIN + (1 - CARD_MOBILE_SCALE_MIN) * progress;
  return Math.min(responsiveScale, getDefaultCardHorizontalFitScale());
}

function getDefaultCardHorizontalFitScale() {
  const viewportWidth = cardLastWidth
    || getAppViewportWidth()
    || CARD_MOBILE_SCALE_FULL_WIDTH;
  const viewportHeight = cardLastHeight
    || getAppViewportHeight()
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
  const viewportWidth = getAppViewportWidth();
  const viewportHeight = getAppViewportHeight();
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

function updateCardGlossUniforms(mesh, time = performance.now() * 0.001) {
  const uniforms = mesh?.material?.uniforms;
  if (!uniforms) return;
  updateCardEffectTextureUsage(mesh, time * 1000);
  uniforms.uCameraPosition.value.copy(cardCamera.position);
  uniforms.uTime.value = time;
  if (uniforms.uPointer) uniforms.uPointer.value.set(cardEffectPointerX, cardEffectPointerY);
  if (uniforms.uPointerActive) uniforms.uPointerActive.value = cardEffectPointerActive;
  uniforms.uActivity.value = getCardEffectUniformActivity(uniforms.uEffectMode?.value || CARD_EFFECT_MODE_DEFAULT);
}

function updateCardSwapIncomingEffectUniforms(time) {
  updateCardEffectUniformsForGroup(cardSwapIncomingGroup, time);
}

function updateCardEffectUniformsForGroup(
  group,
  time = performance.now() * 0.001,
  camera = cardCamera,
) {
  const effectMeshes = group?.userData?.effectMeshes || [];
  if (!effectMeshes.length) return;
  const screensaverActivity = group?.userData?.screensaverEffectActivity;
  const usesIndependentPointer = Number.isFinite(screensaverActivity);

  for (const mesh of effectMeshes) {
    const uniforms = mesh?.material?.uniforms;
    if (!uniforms) continue;
    updateCardEffectTextureUsage(mesh, time * 1000);
    uniforms.uCameraPosition.value.copy(camera.position);
    uniforms.uTime.value = time;
    if (uniforms.uPointer) {
      uniforms.uPointer.value.set(
        usesIndependentPointer ? CARD_NFT_2_EFFECT_DEFAULT_POINTER_X : cardEffectPointerX,
        usesIndependentPointer ? CARD_NFT_2_EFFECT_DEFAULT_POINTER_Y : cardEffectPointerY,
      );
    }
    if (uniforms.uPointerActive) {
      uniforms.uPointerActive.value = usesIndependentPointer ? 0 : cardEffectPointerActive;
    }
    uniforms.uActivity.value = usesIndependentPointer
      ? screensaverActivity
      : getCardEffectUniformActivity(uniforms.uEffectMode?.value || CARD_EFFECT_MODE_DEFAULT);
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
  const motionActivity = cardGlossActivity * cardShuffleGlossOpacity;
  if (effectMode >= CARD_EFFECT_MODE_CARD_NFT_2_RARE_HOLO_V) {
    // mons.shop springs --card-opacity up while the card is interacting and
    // back to zero afterward; keep its stronger holo profiles dormant at rest.
    return Math.max(cardEffectPointerActive, motionActivity);
  }
  return motionActivity;
}

function renderBinderScene() {
  renderBinderSceneOnce();
}

function startBinderRenderLoop() {
  if (
    !galleryOpen
    || !isBinderMode
    || els.binderPanel.hidden
    || document.hidden
    || binderContextLost
  ) {
    return;
  }
  if (binderAnimationFrame) return;
  if (binderRenderFrame) {
    cancelAnimationFrame(binderRenderFrame);
    binderRenderFrame = 0;
  }
  binderLastAnimationAt = 0;
  if (binderAnimationDelayTimer) {
    window.clearTimeout(binderAnimationDelayTimer);
    binderAnimationDelayTimer = 0;
  }

  const renderFrame = (frameTime) => {
    if (!galleryOpen || !isBinderMode || els.binderPanel.hidden || binderContextLost) {
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
      }, binderAnimationIdleDelayMs);
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
  return Boolean(binderDrag)
    || Boolean(binderOuterFlipState)
    || Boolean(binderEvilTableSwapState)
    || Boolean(binderTableViewAnimation)
    || Math.abs(binderTargetTurn - binderTurn) > 0.0015
    || Math.abs(binderTargetClosure - binderClosure) > BINDER_CLOSURE_SETTLE_EPSILON;
}

function requestBinderMaintenance(delay = 90) {
  if (binderMaintenanceTimer) return;

  binderMaintenanceTimer = window.setTimeout(() => {
    binderMaintenanceTimer = 0;
    if (document.hidden) return;
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
  if (
    binderContextLost
    || !binderRenderer
    || !binderScene
    || !binderCamera
    || !galleryOpen
    || !isBinderMode
  ) {
    return false;
  }

  const now = Number.isFinite(frameTime) ? frameTime : performance.now();
  const deltaMs = getBinderAnimationDeltaMs(now);
  const tableViewActive = updateBinderTableViewAnimation(now);
  const tableDisplayModelFadeActive = updateBinderTableDisplayModelVisibility(now);
  const tableDiceActive = updateBinderTableDice(now);
  const tableAccessoryFadeActive = updateBinderTableAccessoryVisibility(now);
  const outerFlipActive = updateBinderOuterFlip(now);
  let turnActive = Boolean(binderDrag) || outerFlipActive || tableDiceActive;
  if (!binderDrag) {
    const turnDelta = binderTargetTurn - binderTurn;
    if (Math.abs(turnDelta) > 0.0015) binderBendDirection = Math.sign(turnDelta);
    binderTurn += turnDelta * getFrameDampedAlpha(BINDER_TURN_BASE_ALPHA, deltaMs);
    const pageTurnActive = Math.abs(turnDelta) >= 0.0015;
    if (!pageTurnActive) binderTurn = binderTargetTurn;

    const closureDelta = binderTargetClosure - binderClosure;
    binderClosure += closureDelta * getFrameDampedAlpha(BINDER_CLOSURE_BASE_ALPHA, deltaMs);
    const closureActive = Math.abs(closureDelta) >= BINDER_CLOSURE_SETTLE_EPSILON;
    if (!closureActive) binderClosure = binderTargetClosure;
    turnActive = turnActive || pageTurnActive || closureActive;
  }
  const evilTableSwapActive = updateEvilBinderTableSwap(now);
  turnActive = turnActive || evilTableSwapActive;

  const interactionActive = now < binderInteractionActiveUntil;
  const introNoteFadeActive = updateBinderIntroNoteModeOpacity(now);
  if (turnActive && !outerFlipActive) {
    ensureBinderPageWindow({
      center: getDesiredBinderPageWindowCenter(),
      queueTextures: false,
      updateTransforms: false,
      loadBackTextures: false,
    });
  }
  if (turnActive || tableViewActive || !wasIdleOnly || introNoteFadeActive) {
    updateBinderPageTransforms();
  }
  updateBinderCameraFrame(false, deltaMs);
  const cameraMoving = isBinderCameraMoving();
  const animatedRecords = getBinderVisibleAnimatedTextureRecords();
  const fadeActive = (
    updateBinderCardLoadFades(now)
    || introNoteFadeActive
    || tableDisplayModelFadeActive
    || tableAccessoryFadeActive
  );
  const loadingRingState = updateBinderLoadingRings(now);
  const loadingRingActive = (loadingRingState & 1) !== 0;
  const loadingRingChanged = (loadingRingState & 2) !== 0;
  const idleVisualActive = animatedRecords.size > 0 || loadingRingActive;
  binderAnimationIdleDelayMs = loadingRingActive
    ? BINDER_LOADING_RING_IDLE_MS
    : BINDER_ANIMATED_IDLE_MS;
  if (!turnActive && !tableViewActive && !cameraMoving && idleVisualActive && !fadeActive) {
    const animatedUpdated = updateAnimatedTextureRecords(animatedRecords);
    if (animatedUpdated || loadingRingActive || loadingRingChanged) {
      binderRenderer.render(binderScene, binderCamera);
    }
    binderLastAnimationIdleOnly = true;
    return true;
  }

  if ((turnActive || cameraMoving) && !outerFlipActive) {
    queueBinderTextureLoads(binderBuildToken, { includePreload: false });
  }
  const cameraActive = isBinderCameraMoving();
  const animatedUpdated = updateAnimatedTextureRecords(animatedRecords);
  if (
    turnActive
    || tableViewActive
    || cameraActive
    || animatedUpdated
    || fadeActive
    || loadingRingActive
    || loadingRingChanged
  ) {
    binderRenderer.render(binderScene, binderCamera);
  }
  const keepAnimating = turnActive
    || tableViewActive
    || cameraActive
    || animatedRecords.size > 0
    || fadeActive
    || loadingRingActive;
  binderLastAnimationIdleOnly = !turnActive
    && !tableViewActive
    && !cameraActive
    && !fadeActive
    && idleVisualActive;
  if (!turnActive && !cameraActive && !interactionActive) {
    if (binderTextureApplyQueue.length) requestBinderTextureApplyFlush();
    pumpBinderTextureQueue();
  }
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
  updateBinderShellTransforms();
  updateBinderIntroNoteOpacity(turn);
  const lowerTurn = Math.floor(turn);
  const turnFraction = turn - lowerTurn;
  const isTurning = turnFraction > 0.001 && lowerTurn < binderPageCount;
  const activeIndex = isTurning ? lowerTurn : -1;
  const restingTurn = clamp(Math.round(turn), 0, binderPageCount);
  const stackProgress = getBinderStackRestProgress(turnFraction, isTurning);
  const activeTurnProgress = easeInOut(turnFraction);

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
    const stickerCoverOpacity = getBinderPageStickerCoverOpacity({
      pageIndex: page.pageIndex,
      activeIndex,
      activeTurnProgress,
      isTurning,
      isActivePage,
      restLayout,
    });
    page.group.visible = !binderOuterFlipState
      && !binderEvilTableSwapState
      && (isActivePage || pageVisibility > 0.001);
    setBinderSheetOpacity(
      page,
      turnActivity,
      sheetVisibility * pageVisibility,
      pageVisibility,
    );
    setBinderPageOpacity(page, pageVisibility, stickerCoverOpacity);
    applyBinderColumnBend(page, rawTurn);
  }
  applyBinderTableCoverVisibility(binderTableViewProgress);
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

function getBinderPageStickerCoverOpacity({
  pageIndex,
  activeIndex,
  activeTurnProgress,
  isTurning,
  isActivePage,
  restLayout,
}) {
  if (isActivePage) return 1;
  if (isTurning && pageIndex === activeIndex - 1) {
    return THREE.MathUtils.lerp(1, CLEAR_BINDER_COVERED_STICKER_OPACITY, activeTurnProgress);
  }
  if (isTurning && pageIndex === activeIndex + 1) {
    return THREE.MathUtils.lerp(CLEAR_BINDER_COVERED_STICKER_OPACITY, 1, activeTurnProgress);
  }
  return getBinderStackDepth(restLayout) === 0
    ? 1
    : CLEAR_BINDER_COVERED_STICKER_OPACITY;
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

function setBinderSheetOpacity(
  page,
  turnActivity,
  visibilityFactor = 1,
  pageVisibilityFactor = 1,
) {
  const activity = easeInOut(clamp(turnActivity, 0, 1));
  const visibleOpacity = clamp(visibilityFactor, 0, 1);
  const pageOpacity = clamp(pageVisibilityFactor, 0, 1);
  for (const mesh of page.sheetMeshes || []) {
    const material = mesh.material;
    if (!material) continue;
    const opacity = mesh.userData.clearBinderPageBacking
      ? CLEAR_BINDER_PAGE_OPACITY * pageOpacity
      : mesh.userData.clearBinderPocketBacking
        ? CLEAR_BINDER_POCKET_OPACITY * pageOpacity
        : visibleOpacity * THREE.MathUtils.lerp(
        mesh.userData.restOpacity,
        mesh.userData.activeOpacity,
        activity,
      );
    if (Math.abs(material.opacity - opacity) > 0.0005) {
      material.opacity = opacity;
    }
  }
}

function setBinderPageOpacity(
  page,
  visibilityFactor = 1,
  stickerCoverOpacity = 1,
  now = performance.now(),
) {
  const opacity = clamp(visibilityFactor, 0, 1);
  const previousOpacity = page.cardOpacity ?? 1;
  const pageOpacityChanged = Math.abs(previousOpacity - opacity) > 0.0005;
  page.cardOpacity = opacity;
  page.stickerCoverOpacity = clamp(stickerCoverOpacity, 0, 1);
  for (const mesh of page.cardMeshes || []) {
    const material = mesh.material;
    if (!material) continue;
    const cardOpacity = getBinderCardRenderedOpacity(mesh, opacity, now);
    if (pageOpacityChanged || Math.abs((material.opacity ?? 1) - cardOpacity) > 0.0005) {
      material.opacity = cardOpacity;
    }
    setBinderCardStickerOpacity(mesh, cardOpacity, page.stickerCoverOpacity);
  }
}

function setBinderCardStickerOpacity(
  card,
  opacity,
  coverOpacity = getBinderStickerCoverOpacityForPosition(card?.userData?.binderPosition),
) {
  const ready = Boolean(card?.userData?.textureLoaded)
    && !card?.userData?.textureLoadFailed;
  const baseOpacity = ready ? clamp(opacity, 0, 1) : 0;
  const cardData = CARDS[card?.userData?.cardIndex];
  for (const sticker of card?.userData?.binderStickerMeshes || []) {
    const isClearListedSticker = cardData?.collection === "clear"
      && sticker.userData.binderCardSticker === "listed";
    const stickerOpacity = baseOpacity * (isClearListedSticker ? clamp(coverOpacity, 0, 1) : 1);
    if (sticker.material) sticker.material.opacity = stickerOpacity;
    sticker.visible = stickerOpacity > 0.001;
  }
}

function getBinderStickerCoverOpacityForPosition(position) {
  if (!Number.isInteger(position) || position < 0) return 1;
  const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
  const page = binderPages.find((entry) => entry.pageIndex === pageIndex);
  return page?.stickerCoverOpacity ?? 1;
}

function getBinderCardRenderedOpacity(mesh, pageOpacity, now = performance.now()) {
  if (!mesh.userData.binderCard) return pageOpacity;
  if (!mesh.userData.textureLoaded) return getBinderUnloadedCardOpacity(pageOpacity);
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

  const startOpacity = Number.isFinite(mesh.userData.textureFadeStartOpacity)
    ? clamp(mesh.userData.textureFadeStartOpacity, 0, Math.max(pageOpacity, 1))
    : getBinderUnloadedCardOpacity(pageOpacity);
  return THREE.MathUtils.lerp(
    Math.min(startOpacity, pageOpacity),
    pageOpacity,
    easeInOutCubic(progress),
  );
}

function getBinderUnloadedCardOpacity(pageOpacity) {
  return clamp(pageOpacity, 0, 1) * BINDER_CARD_PLACEHOLDER_OPACITY;
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
    setBinderCardStickerOpacity(mesh, opacity);
    if (!mesh.userData.textureFadeComplete) fadeActive = true;
  }
  return fadeActive;
}

function updateBinderLoadingRings(now = performance.now()) {
  let state = 0;
  const rotation = now * BINDER_LOADING_RING_SPEED;

  for (const ring of binderLoadingRings) {
    const card = ring.userData.binderCardMesh;
    const position = ring.userData.binderPosition;
    const pageIndex = Math.floor(position / BINDER_PAGE_SLOTS);
    const page = binderPages.find((entry) => entry.pageIndex === pageIndex);
    const shouldShow = Boolean(
      ring.parent
      && card?.parent
      && !card.userData.textureLoaded
      && !card.userData.textureLoadFailed
      && page?.group.visible
      && (page.cardOpacity ?? 1) > 0.02
      && isBinderPositionVisible(position)
    );

    if (ring.visible !== shouldShow) {
      ring.visible = shouldShow;
      state |= 2;
    }
    if (!shouldShow) continue;

    ring.rotation.z = ring.userData.binderSide < 0 ? -rotation : rotation;
    state |= 1;
  }

  return state;
}

function updateBinderIntroNoteOpacity(turn) {
  if (!binderIntroNoteGroup || !binderIntroNoteMesh?.material) return;

  const pageOpacity = 1 - easeInOut(clamp(turn, 0, 1));
  const opacity = pageOpacity * binderIntroNoteModeOpacity;
  binderIntroNoteGroup.visible = opacity > 0.001;
  binderIntroNoteMesh.material.opacity = opacity;
  binderIntroNoteMesh.material.transparent = true;
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
    const renderBase = activePage && (
      child.userData.binderCard
      || child.userData.binderBackCard
      || child.userData.binderCardSticker
      || child.userData.clearBinderPocketBacking
    )
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

  const width = binderLastWidth || els.binderPanel?.getBoundingClientRect().width || getAppViewportWidth() || 1;
  const height = binderLastHeight || els.binderPanel?.getBoundingClientRect().height || getAppViewportHeight() || 1;
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
  if (binderContextLost || !binderRenderer || !binderScene || !binderCamera) return;
  applyBinderTableViewProgress();
  updateBinderPageTransforms();
  updateBinderCameraFrame(immediateCamera || !binderCameraReady);
  queueBinderTextureLoads(binderBuildToken, { includePreload });
  updateAnimatedTextureRecords(getBinderVisibleAnimatedTextureRecords());
  const loadingRingState = updateBinderLoadingRings();
  binderRenderer.render(binderScene, binderCamera);
  if ((loadingRingState & 1) !== 0) startBinderRenderLoop();
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
  if (resizeFrame) return;
  resizeFrame = requestAnimationFrame(() => {
    resizeFrame = 0;
    updateAppViewportVars();
    resizeCardRenderer();
    resizeBinderRenderer();
    resizeScreensaverRenderer();
    if (galleryOpen && isBinderMode && !els.binderPanel.hidden) {
      renderBinderSceneOnce();
    }
  });
}

function resizeCardRenderer() {
  const rect = els.cardCanvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  const pixelRatio = getRendererPixelRatio(width, height);
  if (Math.abs(cardRenderer.getPixelRatio() - pixelRatio) > 0.001) {
    cardRenderer.setPixelRatio(pixelRatio);
  }
  cardLastWidth = width;
  cardLastHeight = height;
  if (els.cardCanvas.width === Math.floor(width * pixelRatio)
    && els.cardCanvas.height === Math.floor(height * pixelRatio)) {
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

  const pixelRatio = getRendererPixelRatio(width, height);
  if (Math.abs(binderRenderer.getPixelRatio() - pixelRatio) > 0.001) {
    binderRenderer.setPixelRatio(pixelRatio);
    binderLastWidth = 0;
    binderLastHeight = 0;
  }
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
  const palette = getBinderCoverColorPalette();
  const map = palette.custom
    ? createBinderCustomCoverTexture()
    : createBinderCoverTexture();
  const colorFaithful = Boolean(WALLET_ROUTE_ADDRESS);
  const material = new THREE.MeshStandardMaterial({
    color: colorFaithful ? 0x000000 : palette.base,
    map,
    roughness: 0.9,
    metalness: 0.015,
    emissive: colorFaithful ? palette.base : palette.baseEmissive,
    emissiveMap: colorFaithful ? map : null,
    emissiveIntensity: colorFaithful ? 1 : BINDER_COVER_BASE_EMISSIVE_INTENSITY,
  });
  material.userData.binderColorFaithful = colorFaithful;
  return material;
}

function getBinderCoverColorPalette() {
  const settings = normalizeBinderCoverSettings(walletRouteProfile?.cover);
  const hasCustomColor = Boolean(
    WALLET_ROUTE_ADDRESS
    && settings.baseColor !== BINDER_COVER_DEFAULT_COLOR_HEX
  );
  const source = hasCustomColor ? settings.baseColor : BINDER_COVER_DEFAULT_COLOR_HEX;
  if (source === binderCoverColorPaletteSource) {
    return {
      base: binderCoverCustomBaseColor,
      table: binderCoverCustomTableColor,
      baseEmissive: binderCoverCustomBaseEmissive,
      tableEmissive: binderCoverCustomTableEmissive,
      custom: binderCoverColorPaletteSource !== BINDER_COVER_DEFAULT_COLOR_HEX,
    };
  }

  binderCoverColorPaletteSource = source;
  if (hasCustomColor) {
    binderCoverCustomBaseColor.set(source);
    binderCoverCustomTableColor.copy(binderCoverCustomBaseColor);
    binderCoverCustomBaseEmissive.copy(binderCoverCustomBaseColor).multiplyScalar(0.36);
    binderCoverCustomTableEmissive.copy(binderCoverCustomBaseColor).multiplyScalar(0.26);
  } else {
    binderCoverCustomBaseColor.copy(BINDER_COVER_BASE_COLOR);
    binderCoverCustomTableColor.copy(BINDER_COVER_TABLE_COLOR);
    binderCoverCustomBaseEmissive.copy(BINDER_COVER_BASE_EMISSIVE);
    binderCoverCustomTableEmissive.copy(BINDER_COVER_TABLE_EMISSIVE);
  }
  return {
    base: binderCoverCustomBaseColor,
    table: binderCoverCustomTableColor,
    baseEmissive: binderCoverCustomBaseEmissive,
    tableEmissive: binderCoverCustomTableEmissive,
    custom: hasCustomColor,
  };
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

function createBinderCustomCoverTexture() {
  if (binderCustomCoverTexture) return binderCustomCoverTexture;

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
      const grain = (seed >>> 24) % 14;
      const weave = x % 9 === 0 || y % 11 === 0 ? 4 : 0;
      const value = Math.min(255, 238 + grain + weave);
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
  binderCustomCoverTexture = texture;
  return binderCustomCoverTexture;
}

function createBinderIntroNoteTexture(coverWidth = 1, coverHeight = 1) {
  if (binderIntroNoteTexture) {
    return {
      texture: binderIntroNoteTexture,
      linkBounds: binderIntroNoteTexture.userData.linkBounds,
      focusBounds: binderIntroNoteTexture.userData.focusBounds,
    };
  }

  const width = 1024;
  const height = WALLET_ROUTE_ADDRESS
    ? Math.max(1, Math.round(width * coverHeight / coverWidth))
    : 584;
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
  if (WALLET_ROUTE_ADDRESS) {
    renderWalletBinderInsideStickers(texture, ctx).catch((error) => {
      console.error("Unable to render inside-cover stickers", error);
    });
  }
  return {
    texture,
    linkBounds: texture.userData.linkBounds,
    focusBounds: texture.userData.focusBounds,
  };
}

async function renderWalletBinderInsideStickers(texture, context) {
  const settings = normalizeBinderCoverSettings(walletRouteProfile?.cover);
  const stickers = settings.stickers.filter((sticker) => sticker.surface === "inside");
  if (!stickers.length) return;
  const token = binderWalletCoverArtworkToken;
  const sourceKey = JSON.stringify(stickers);
  const images = await Promise.all(stickers.map((sticker) => (
    loadTextureImage(sticker.imageUrl, { fetchPriority: "high" })
      .then((image) => ({ sticker, image }))
      .catch(() => null)
  )));
  if (
    token !== binderWalletCoverArtworkToken
    || texture !== binderIntroNoteTexture
    || sourceKey !== JSON.stringify(
      normalizeBinderCoverSettings(walletRouteProfile?.cover).stickers
        .filter((sticker) => sticker.surface === "inside"),
    )
  ) return;
  drawBinderIntroNoteSurface(context);
  for (const entry of images) {
    if (entry) drawBinderCoverStickerImage(context, entry.sticker, entry.image);
  }
  texture.needsUpdate = true;
  requestBinderRenderOnce();
}

function drawBinderIntroNoteSurface(ctx) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(156, 153, 146, 0.74)";

  const fontStack = SITE_FONT_STACK;
  const maxTextWidth = width * 0.9;
  const textFillStyle = "rgba(156, 153, 146, 0.74)";
  const linkFillStyle = "rgba(176, 172, 164, 0.9)";
  if (WALLET_ROUTE_ADDRESS) {
    return drawWalletBinderIntroNote(ctx, {
      fontStack,
      textFillStyle,
    });
  }
  if (!usesEvilBinderPresentation()) {
    return drawCommunityBinderIntroLinks(ctx, {
      fontStack,
      textFillStyle,
      linkFillStyle,
    });
  }

  const baseFontSize = 33;
  const linkText = "evil biscuit";
  const binderName = ACTIVE_COLLECTION.label.toLowerCase();
  const firstLinePrefix = `this is a 3d binder viewer for ${binderName} by  `;
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
  const otherCollections = Object.values(COLLECTION_CONFIGS)
    .filter((collection) => (
      collection.introGroup === "evil"
      && collection.id !== ACTIVE_COLLECTION_ID
    ));
  const collectionLinksY = 505 + textOffsetY;
  ctx.fillStyle = textFillStyle;
  drawCenteredBinderIntroText(
    ctx,
    "/",
    width / 2,
    collectionLinksY,
    maxTextWidth,
    30,
    fontStack,
  );
  otherCollections.forEach((collection, index) => {
    const centerX = width * (index === 0 ? 0.36 : 0.64);
    const collectionLinkBounds = drawBinderIntroLinkedLine(ctx, {
      prefix: "",
      linkText: collection.introLabel,
      y: collectionLinksY,
      centerX,
      maxWidth: width * 0.38,
      fontSize: 30,
      fontStack,
      textFillStyle,
      linkFillStyle,
      url: collection.path,
    });
    linkBounds.push(collectionLinkBounds);
    focusBottomY = collectionLinksY + 30 * 0.48;
  });

  const limitedCollection = COLLECTION_CONFIGS.limited;
  const limitedLinkY = collectionLinksY + 64;
  const limitedLinkBounds = drawBinderIntroLinkedLine(ctx, {
    prefix: "",
    linkText: "+",
    y: limitedLinkY,
    centerX: width / 2,
    maxWidth: width * 0.16,
    fontSize: 36,
    fontStack,
    textFillStyle,
    linkFillStyle,
    url: limitedCollection?.path || "/limited/",
    underline: false,
    hitMinWidth: 72,
    hitMinHeight: 58,
  });
  linkBounds.push(limitedLinkBounds);
  focusBottomY = Math.max(focusBottomY, limitedLinkY + 36 * 0.55);

  if (!otherCollections.length) {
    focusBottomY = Math.max(focusBottomY, 390 + textOffsetY + 42 * 0.48);
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

function drawWalletBinderIntroNote(
  ctx,
  { fontStack, textFillStyle },
) {
  const { width, height } = ctx.canvas;
  const settings = normalizeBinderCoverSettings(walletRouteProfile?.cover);
  if (!settings.insideText) {
    return {
      linkBounds: [],
      focusBounds: { x: 0, y: 0, width: 0, height: 0 },
    };
  }

  const box = {
    x: (settings.insideTextX - settings.insideTextWidth / 2) * width,
    y: (settings.insideTextY - settings.insideTextHeight / 2) * height,
    width: settings.insideTextWidth * width,
    height: settings.insideTextHeight * height,
  };
  const linkBounds = drawRotatedBinderCustomText(ctx, {
    text: settings.insideText,
    links: settings.insideLinks,
    box,
    fontSize: settings.insideFontSize,
    fontStack,
    textFillStyle: settings.insideTextColor || textFillStyle,
    linkFillStyle: settings.insideTextColor || textFillStyle,
  }, settings.insideTextRotation);

  const [focusBounds] = rotateBinderCanvasBounds(
    [{
      x: box.x / width,
      y: box.y / height,
      width: box.width / width,
      height: box.height / height,
    }],
    box.x + box.width / 2,
    box.y + box.height / 2,
    settings.insideTextRotation,
    ctx.canvas,
  );

  return {
    linkBounds,
    focusBounds: {
      x: clamp(focusBounds.x, 0, 1),
      y: clamp(focusBounds.y, 0, 1),
      width: clamp(focusBounds.width, 0, 1),
      height: clamp(focusBounds.height, 0, 1),
    },
  };
}

function drawRotatedBinderCustomText(ctx, options, rotation = 0) {
  const { box } = options;
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation * Math.PI / 180);
  ctx.translate(-centerX, -centerY);
  const bounds = drawBinderCustomInsideText(ctx, options);
  ctx.restore();
  return rotateBinderCanvasBounds(bounds, centerX, centerY, rotation, ctx.canvas);
}

function rotateBinderCanvasBounds(bounds, centerX, centerY, rotation, canvas) {
  if (!rotation) return bounds;
  const radians = rotation * Math.PI / 180;
  const cosine = Math.cos(radians);
  const sine = Math.sin(radians);
  return bounds.map((bound) => {
    const left = bound.x * canvas.width;
    const top = bound.y * canvas.height;
    const right = left + bound.width * canvas.width;
    const bottom = top + bound.height * canvas.height;
    const corners = [[left, top], [right, top], [right, bottom], [left, bottom]].map(([x, y]) => ({
      x: centerX + (x - centerX) * cosine - (y - centerY) * sine,
      y: centerY + (x - centerX) * sine + (y - centerY) * cosine,
    }));
    const minimumX = Math.min(...corners.map((point) => point.x));
    const maximumX = Math.max(...corners.map((point) => point.x));
    const minimumY = Math.min(...corners.map((point) => point.y));
    const maximumY = Math.max(...corners.map((point) => point.y));
    return {
      ...bound,
      x: minimumX / canvas.width,
      y: minimumY / canvas.height,
      width: (maximumX - minimumX) / canvas.width,
      height: (maximumY - minimumY) / canvas.height,
    };
  });
}

function drawBinderCustomInsideText(
  ctx,
  {
    text,
    links,
    box,
    fontSize,
    fontStack,
    textFillStyle,
    linkFillStyle,
  },
) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();
  ctx.font = `400 ${fontSize}px ${fontStack}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  const lines = layoutBinderCustomTextLines(ctx, text, box.width * 0.96);
  const lineHeight = fontSize * 1.22;
  const totalHeight = lines.length * lineHeight;
  let baseline = box.y + (box.height - totalHeight) / 2 + fontSize;
  const bounds = [];

  for (const line of lines) {
    if (baseline - fontSize <= box.y + box.height && baseline >= box.y) {
      const lineWidth = ctx.measureText(line.text).width;
      let x = box.x + (box.width - lineWidth) / 2;
      const segments = splitBinderCustomTextLineByLinks(line, links);
      for (const segment of segments) {
        const segmentWidth = ctx.measureText(segment.text).width;
        ctx.fillStyle = segment.url ? linkFillStyle : textFillStyle;
        ctx.fillText(segment.text, x, baseline);
        if (segment.url && segmentWidth > 0) {
          drawBinderIntroLinkUnderline(
            ctx,
            x,
            baseline + Math.max(6, fontSize * 0.2),
            segmentWidth,
            fontSize,
          );
          bounds.push({
            x: x / ctx.canvas.width,
            y: (baseline - fontSize) / ctx.canvas.height,
            width: segmentWidth / ctx.canvas.width,
            height: lineHeight / ctx.canvas.height,
            url: segment.url,
          });
        }
        x += segmentWidth;
      }
    }
    baseline += lineHeight;
  }
  ctx.restore();
  return bounds;
}

function layoutBinderCustomTextLines(ctx, text, maxWidth) {
  const lines = [];
  let start = 0;
  let index = 0;
  let line = "";
  while (index < text.length) {
    const character = text[index];
    if (character === "\n") {
      lines.push({ text: line, start, end: index });
      index += 1;
      start = index;
      line = "";
      continue;
    }
    const candidate = line + character;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push({ text: line, start, end: index });
      start = index;
      line = character;
    } else {
      line = candidate;
    }
    index += 1;
  }
  lines.push({ text: line, start, end: text.length });
  return lines;
}

function splitBinderCustomTextLineByLinks(line, links) {
  const segments = [];
  let cursor = line.start;
  for (const link of links) {
    const start = Math.max(line.start, link.start);
    const end = Math.min(line.end, link.end);
    if (end <= start) continue;
    if (start > cursor) {
      segments.push({ text: line.text.slice(cursor - line.start, start - line.start), url: "" });
    }
    segments.push({ text: line.text.slice(start - line.start, end - line.start), url: link.url });
    cursor = end;
  }
  if (cursor < line.end) {
    segments.push({ text: line.text.slice(cursor - line.start), url: "" });
  }
  if (!segments.length) segments.push({ text: line.text, url: "" });
  return segments;
}

function drawCommunityBinderIntroLinks(
  ctx,
  { fontStack, textFillStyle, linkFillStyle },
) {
  const { width, height } = ctx.canvas;
  const linkedCollections = COMMUNITY_COVER_COLLECTION_ORDER
    .map((collectionId) => COLLECTION_CONFIGS[collectionId])
    .filter((collection) => collection.id !== ACTIVE_COLLECTION_ID);
  const rowCount = Math.ceil(linkedCollections.length / 2);
  const firstRowY = 92;
  const lastRowY = 512;
  const rowGap = rowCount > 1 ? (lastRowY - firstRowY) / (rowCount - 1) : 0;
  const fontSize = 29;
  const linkBounds = [];

  ctx.fillStyle = textFillStyle;
  linkedCollections.forEach((collection, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const bounds = drawBinderIntroLinkedLine(ctx, {
      prefix: "",
      linkText: collection.introLabel,
      y: firstRowY + row * rowGap,
      centerX: width * (column === 0 ? 0.28 : 0.72),
      maxWidth: width * 0.41,
      fontSize,
      fontStack,
      textFillStyle,
      linkFillStyle,
      url: collection.path,
    });
    linkBounds.push(bounds);
  });

  const focusTop = Math.max(0, (firstRowY - fontSize * 1.35) / height);
  const focusBottom = Math.min(
    1,
    (firstRowY + Math.max(0, rowCount - 1) * rowGap + fontSize * 0.55) / height,
  );
  return {
    linkBounds,
    focusBounds: {
      x: 0.03,
      y: focusTop,
      width: 0.94,
      height: focusBottom - focusTop,
    },
  };
}

function drawBinderIntroLinkedLine(
  ctx,
  {
    prefix,
    linkText,
    suffix = "",
    y,
    centerX = ctx.canvas.width / 2,
    maxWidth,
    fontSize,
    fontStack,
    textFillStyle,
    linkFillStyle,
    url,
    underline = true,
    hitMinWidth = 0,
    hitMinHeight = 0,
  },
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
  const lineStartX = centerX - (prefixWidth + linkWidth + suffixWidth) / 2;
  ctx.textAlign = "left";
  ctx.fillStyle = textFillStyle;
  ctx.fillText(prefix, lineStartX, y);
  ctx.fillStyle = linkFillStyle;
  ctx.fillText(linkText, lineStartX + prefixWidth, y);
  if (suffix) {
    ctx.fillStyle = textFillStyle;
    ctx.fillText(suffix, lineStartX + prefixWidth + linkWidth, y);
  }

  if (underline) {
    drawBinderIntroLinkUnderline(
      ctx,
      lineStartX + prefixWidth,
      y + Math.max(8, size * 0.25),
      linkWidth,
      size,
    );
  }

  const linkX = lineStartX + prefixWidth;
  const linkHeight = size * 1.25;
  const hitWidth = Math.max(linkWidth, hitMinWidth);
  const hitHeight = Math.max(linkHeight, hitMinHeight);
  const hitX = linkX + linkWidth / 2 - hitWidth / 2;
  const hitY = y - size * 0.94 + linkHeight / 2 - hitHeight / 2;

  return {
    x: hitX / ctx.canvas.width,
    y: hitY / ctx.canvas.height,
    width: hitWidth / ctx.canvas.width,
    height: hitHeight / ctx.canvas.height,
    url,
  };
}

function drawBinderIntroLinkUnderline(ctx, x, y, width, fontSize) {
  const snappedX = Math.round(x);
  const snappedRight = Math.round(x + width);
  const snappedWidth = Math.max(1, snappedRight - snappedX);
  const snappedY = Math.round(y);
  const snappedHeight = Math.max(
    BINDER_INTRO_LINK_UNDERLINE_MIN_HEIGHT,
    Math.round(fontSize * BINDER_INTRO_LINK_UNDERLINE_HEIGHT_RATIO),
  );

  ctx.save();
  ctx.globalAlpha *= BINDER_INTRO_LINK_UNDERLINE_ALPHA;
  ctx.fillRect(snappedX, snappedY, snappedWidth, snappedHeight);
  ctx.restore();
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
      ? getAppViewportHeight()
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
  if (individualWheelOutDistance < INDIVIDUAL_TO_BINDER_WHEEL_THRESHOLD) return false;
  individualWheelOutDistance = 0;
  individualWheelOutLastAt = now;
  return true;
}

function addBinderFocusWheelInDistance(amount, now) {
  if (now - binderFocusWheelInLastAt > VIEW_SWITCH_WHEEL_IDLE_MS) {
    binderFocusWheelInDistance = 0;
  }
  binderFocusWheelInLastAt = now;
  binderFocusWheelInDistance += amount;
  if (binderFocusWheelInDistance < BINDER_TO_INDIVIDUAL_WHEEL_THRESHOLD) return false;
  binderFocusWheelInDistance = 0;
  binderFocusWheelInLastAt = now;
  return true;
}

function addBinderTableWheelOutDistance(amount, now) {
  if (now - binderTableWheelOutLastAt > VIEW_SWITCH_WHEEL_IDLE_MS) {
    binderTableWheelOutDistance = 0;
  }
  binderTableWheelOutLastAt = now;
  binderTableWheelOutDistance += amount;
  if (binderTableWheelOutDistance < BINDER_TO_TABLE_WHEEL_THRESHOLD) return false;
  binderTableWheelOutDistance = 0;
  binderTableWheelOutLastAt = now;
  return true;
}

function resetIndividualWheelOutDistance() {
  individualWheelOutDistance = 0;
  individualWheelOutLastAt = 0;
}

function resetBinderTableWheelOutDistance() {
  binderTableWheelOutDistance = 0;
  binderTableWheelOutLastAt = 0;
}

function resetBinderFocusWheelInDistance() {
  binderFocusWheelInDistance = 0;
  binderFocusWheelInLastAt = 0;
}

function resetViewSwitchWheelDistances() {
  resetIndividualWheelOutDistance();
  resetBinderTableWheelOutDistance();
  resetBinderFocusWheelInDistance();
}

function easeInOut(value) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function getCardTexture(card, options = {}) {
  return getCachedNftTexture(card, options);
}

function getBinderTexture(card) {
  return getCachedBinderTexture(card);
}

function getCachedNftTexture(card, { fetchPriority = "auto" } = {}) {
  const key = textureAssetPath(card);
  if (nftTextureCache.has(key)) {
    const entry = nftTextureCache.get(key);
    nftTextureCache.delete(key);
    nftTextureCache.set(key, entry);
    return entry.promise;
  }

  const entry = {
    texture: null,
    bytes: estimateFullCardTextureBytes(card),
    promise: null,
  };
  entry.promise = (
    getAnimatedSpriteInfo(card)
      ? loadAnimatedTexture(card, { fetchPriority })
      : fetchPriority === "high"
        ? loadHighPriorityTexture(cardAssetUrl(card))
        : loadTexture(cardAssetUrl(card))
  ).then((texture) => {
    entry.texture = texture;
    entry.bytes = getDecodedTextureBytes(texture, entry.bytes);
    trimNftTextureCache();
    return texture;
  }).catch((error) => {
    if (nftTextureCache.get(key) === entry) nftTextureCache.delete(key);
    throw error;
  });
  nftTextureCache.set(key, entry);
  trimNftTextureCache();
  return entry.promise;
}

function getCachedBinderTexture(card) {
  const key = textureAssetPath(card);
  if (binderTextureCache.has(key)) {
    const entry = binderTextureCache.get(key);
    binderTextureCache.delete(key);
    binderTextureCache.set(key, entry);
    return entry.promise;
  }

  const entry = {
    texture: null,
    bytes: estimateBinderTextureBytes(card),
    promise: null,
  };
  entry.promise = loadBinderDisplayTexture(card)
    .then((texture) => {
      entry.texture = texture;
      entry.bytes = getDecodedTextureBytes(texture, entry.bytes);
      trimBinderTextureCache();
      return texture;
    })
    .catch((error) => {
      if (binderTextureCache.get(key) === entry) binderTextureCache.delete(key);
      throw error;
    });
  binderTextureCache.set(key, entry);
  trimBinderTextureCache();
  return entry.promise;
}

function getReadyBinderTexture(card) {
  const key = textureAssetPath(card);
  const entry = binderTextureCache.get(key);
  if (!entry?.texture) return null;
  binderTextureCache.delete(key);
  binderTextureCache.set(key, entry);
  return entry.texture;
}

function trimNftTextureCache() {
  const protectedKeys = getProtectedTextureKeys();
  let protectedScans = 0;
  while (
    (
      nftTextureCache.size > MAX_TEXTURE_CACHE_SIZE
      || getTextureCacheBytes(nftTextureCache) > NFT_TEXTURE_CACHE_BUDGET_BYTES
    )
    && protectedScans < nftTextureCache.size
  ) {
    const oldest = nftTextureCache.entries().next().value;
    if (!oldest) return;
    const [key, entry] = oldest;
    nftTextureCache.delete(key);
    if (!entry.texture || protectedKeys.has(key) || isTextureAttachedToCardScene(entry.texture)) {
      nftTextureCache.set(key, entry);
      protectedScans += 1;
      continue;
    }
    protectedScans = 0;
    invalidatePreparedIndividualCardsForTexture(entry.texture);
    disposeNftTexture(entry.texture);
  }
}

function getRendererPixelRatio(width, height) {
  const nativeRatio = Math.min(Number(window.devicePixelRatio) || 1, MAX_RENDERER_PIXEL_RATIO);
  const pixelBudgetRatio = Math.sqrt(
    MAX_RENDER_BUFFER_PIXELS / Math.max(1, Number(width) * Number(height)),
  );
  return clamp(Math.min(nativeRatio, pixelBudgetRatio), 1, MAX_RENDERER_PIXEL_RATIO);
}

function trimBinderTextureCache() {
  const protectedKeys = getProtectedBinderTextureKeys();
  let protectedScans = 0;
  while (
    getTextureCacheBytes(binderTextureCache) > BINDER_TEXTURE_CACHE_BUDGET_BYTES
    && protectedScans < binderTextureCache.size
  ) {
    const oldest = binderTextureCache.entries().next().value;
    if (!oldest) return;
    const [key, entry] = oldest;
    binderTextureCache.delete(key);
    if (!entry.texture || protectedKeys.has(key)) {
      binderTextureCache.set(key, entry);
      protectedScans += 1;
      continue;
    }
    protectedScans = 0;
    detachBinderTexture(entry.texture);
    disposeNftTexture(entry.texture);
  }
}

function getProtectedTextureKeys() {
  const keys = new Set();
  if (Number.isInteger(currentIndex) && CARDS[currentIndex]) {
    keys.add(textureAssetPath(CARDS[currentIndex]));
  }
  return keys;
}

function getProtectedBinderTextureKeys() {
  const keys = new Set(individualBinderSpreadPrewarmKeys);
  if (galleryOpen && isBinderMode && binderVisibleIndexes.length) {
    for (const position of getBinderPreloadPositions()) {
      const cardIndex = binderVisibleIndexes[position];
      if (Number.isInteger(cardIndex) && CARDS[cardIndex]) {
        keys.add(textureAssetPath(CARDS[cardIndex]));
      }
    }
  }

  return keys;
}

function getTextureCacheBytes(cache) {
  let total = 0;
  for (const entry of cache.values()) total += Number(entry?.bytes) || 0;
  return total;
}

function getDecodedTextureBytes(texture, fallback = 0) {
  const image = texture?.image || texture?.source?.data;
  const width = Number(image?.naturalWidth || image?.videoWidth || image?.width);
  const height = Number(image?.naturalHeight || image?.videoHeight || image?.height);
  return width > 0 && height > 0 ? width * height * 4 : fallback;
}

function estimateFullCardTextureBytes(card) {
  const sprite = getAnimatedSpriteInfo(card);
  if (sprite) {
    const frameWidth = Number(sprite.frameWidth || card?.width || 700);
    const frameHeight = Number(sprite.frameHeight || card?.height || 980);
    return frameWidth * frameHeight * Math.max(1, sprite.columns || 1) * Math.max(1, sprite.rows || 1) * 4;
  }
  return Math.max(1, Number(card?.width) || 700) * Math.max(1, Number(card?.height) || 980) * 4;
}

function estimateBinderTextureBytes(card) {
  const sprite = getAnimatedSpriteInfo(card);
  const sourceWidth = Number(sprite?.frameWidth || card?.width || 700);
  const sourceHeight = Number(sprite?.frameHeight || card?.height || 980);
  const frameWidth = Math.min(BINDER_TEXTURE_FRAME_WIDTH, sourceWidth);
  const frameHeight = Math.max(1, Math.round(frameWidth * sourceHeight / Math.max(1, sourceWidth)));
  return frameWidth
    * frameHeight
    * Math.max(1, sprite?.columns || 1)
    * Math.max(1, sprite?.rows || 1)
    * 4;
}

function isTextureAttachedToCardScene(texture) {
  if (!texture) return false;
  if (cardFrontMesh?.material?.map === texture || cardBackMesh?.material?.map === texture) return true;
  for (const mesh of binderFullResolutionMeshes) {
    if (mesh?.material?.map === texture) return true;
  }
  let attached = false;
  cardSwapIncomingGroup?.traverse((object) => {
    if (object?.material?.map === texture) attached = true;
  });
  if (!attached) {
    for (const entry of [...screensaverCards, ...screensaverReadyCards]) {
      entry.group?.traverse((object) => {
        if (object?.material?.map === texture) attached = true;
      });
      if (attached) break;
    }
  }
  return attached;
}

function invalidatePreparedIndividualCardsForTexture(texture) {
  for (const [key, prepared] of preparedIndividualCardResults) {
    if (
      prepared?.frontTexture === texture
      || prepared?.backTexture === texture
      || prepared?.effectTextures?.foil === texture
      || prepared?.effectTextures?.mask === texture
    ) {
      preparedIndividualCardResults.delete(key);
      preparedIndividualCardPromises.delete(key);
    }
  }
}

function detachBinderTexture(texture) {
  for (const mesh of binderCardMeshes) {
    if (mesh?.material?.map !== texture) continue;
    mesh.material.map = getBinderPlaceholderTexture();
    mesh.userData.textureLoaded = false;
    mesh.userData.textureLoading = false;
    mesh.userData.textureFadeComplete = true;
  }
}

function getBackTexture(card = null) {
  return getBackTextureForAssetPath(cardBackAssetPath(card));
}

function getBackTextureForAssetPath(assetPath) {
  if (backTextures.has(assetPath)) {
    return Promise.resolve(backTextures.get(assetPath));
  }
  if (backTexturePromises.has(assetPath)) {
    return backTexturePromises.get(assetPath);
  }

  const promise = loadTexture(new URL(assetPath, import.meta.url).href)
    .then((texture) => {
      backTextures.set(assetPath, texture);
      warmBackTextureForImmediateDisplay(texture);
      return texture;
    })
    .catch((error) => {
      backTexturePromises.delete(assetPath);
      throw error;
    });
  backTexturePromises.set(assetPath, promise);
  return promise;
}

function getCachedBackTexture(card = null) {
  return backTextures.get(cardBackAssetPath(card)) || null;
}

function getCollectionBackAssetPaths(collectionId) {
  const collection = COLLECTION_CONFIGS[collectionId];
  if (!collection) return [];
  const backImages = Array.isArray(collection.backImages)
    ? collection.backImages.filter(Boolean)
    : [];
  if (backImages.length) return [...new Set(backImages)];
  return collection.backImage ? [collection.backImage] : [];
}

function preloadCollectionBackTextures(collectionId) {
  return Promise.allSettled(
    getCollectionBackAssetPaths(collectionId).map(getBackTextureForAssetPath),
  ).then((results) => {
    for (const result of results) {
      if (result.status === "rejected") console.error(result.reason);
    }
    return results;
  });
}

function preloadAllConfiguredBackTextures() {
  if (allBackTexturesPreloadPromise) return allBackTexturesPreloadPromise;

  const assetPaths = new Set(getCollectionBackAssetPaths(ACTIVE_COLLECTION_ID));
  for (const collectionId of Object.keys(COLLECTION_CONFIGS)) {
    for (const assetPath of getCollectionBackAssetPaths(collectionId)) {
      assetPaths.add(assetPath);
    }
  }
  allBackTexturesPreloadPromise = Promise.allSettled(
    [...assetPaths].map(getBackTextureForAssetPath),
  ).then((results) => {
    for (const result of results) {
      if (result.status === "rejected") console.error(result.reason);
    }
    return results;
  });
  return allBackTexturesPreloadPromise;
}

function warmBackTextureForImmediateDisplay(texture) {
  if (!texture) return;
  prepareTextureForImmediateDisplay(texture);
  for (const renderer of [cardRenderer, binderRenderer]) {
    if (typeof renderer?.initTexture !== "function") continue;
    try {
      renderer.initTexture(texture);
    } catch {
      // Normal rendering will upload it if eager GPU initialization is unavailable.
    }
  }
}

function warmCachedBinderBackTextures() {
  if (typeof binderRenderer?.initTexture !== "function") return;
  for (const texture of backTextures.values()) {
    try {
      binderRenderer.initTexture(texture);
    } catch {
      // Continue warming any remaining backs; normal rendering is the fallback.
    }
  }
}

function getBinderIntroSpriteTexture(url) {
  if (binderIntroSpriteTexturePromises.has(url)) {
    return binderIntroSpriteTexturePromises.get(url);
  }
  const promise = loadTexture(url).catch((error) => {
    binderIntroSpriteTexturePromises.delete(url);
    throw error;
  });
  binderIntroSpriteTexturePromises.set(url, promise);
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

async function loadBinderDisplayTexture(card) {
  const sprite = getAnimatedSpriteInfo(card);
  const sourceUrl = sprite
    ? new URL(sprite.file, import.meta.url).href
    : cardAssetUrl(card);
  const image = await loadTextureImage(sourceUrl);
  const columns = Math.max(1, Number(sprite?.columns) || 1);
  const rows = Math.max(1, Number(sprite?.rows) || 1);
  const sourceFrameWidth = Math.max(1, image.naturalWidth / columns);
  const sourceFrameHeight = Math.max(1, image.naturalHeight / rows);
  let frameWidth = Math.min(BINDER_TEXTURE_FRAME_WIDTH, Math.round(sourceFrameWidth));
  let frameHeight = Math.max(1, Math.round(frameWidth * sourceFrameHeight / sourceFrameWidth));

  const maxTextureSize = Math.max(1024, binderRenderer?.capabilities?.maxTextureSize || 4096);
  const atlasScale = Math.min(
    1,
    maxTextureSize / Math.max(1, frameWidth * columns),
    maxTextureSize / Math.max(1, frameHeight * rows),
  );
  frameWidth = Math.max(1, Math.floor(frameWidth * atlasScale));
  frameHeight = Math.max(1, Math.floor(frameHeight * atlasScale));

  const surface = document.createElement("canvas");
  surface.width = frameWidth * columns;
  surface.height = frameHeight * rows;
  const context = surface.getContext("2d", { alpha: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, surface.width, surface.height);

  const texture = configureDisplayTexture(new THREE.CanvasTexture(surface));
  texture.userData.cardFrameWidth = sourceFrameWidth;
  texture.userData.cardFrameHeight = sourceFrameHeight;
  if (sprite) configureAnimatedTexture(texture, sprite);
  return texture;
}

function loadTextureImage(url, { fetchPriority = "auto" } = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    if ("fetchPriority" in image) image.fetchPriority = fetchPriority;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load texture ${url}`));
    image.src = url;
  });
}

async function loadHighPriorityTexture(url, options = {}) {
  const image = await loadTextureImage(url, { fetchPriority: "high" });
  if (typeof image.decode === "function") {
    await image.decode().catch(() => {});
  }
  return configureDisplayTexture(new THREE.Texture(image), options);
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
  if (!Number.isInteger(normalizedNumber) || !["foil", "mask"].includes(kind)) {
    return Promise.reject(new Error("Invalid CardNFT2 effect texture"));
  }

  const key = `${kind}:${normalizedNumber}`;
  if (cardNft2EffectTextureCache.has(key)) {
    const entry = cardNft2EffectTextureCache.get(key);
    cardNft2EffectTextureCache.delete(key);
    cardNft2EffectTextureCache.set(key, entry);
    return entry.promise;
  }

  const url = cardNft2EffectTextureUrl(kind, normalizedNumber);
  const options = kind === "mask" ? { colorSpace: THREE.NoColorSpace } : undefined;
  const entry = {
    texture: null,
    bytes: 1000 * 1400 * 4,
    promise: null,
  };
  entry.promise = loadHighPriorityTexture(url, options).then((texture) => {
    entry.texture = texture;
    entry.bytes = getDecodedTextureBytes(texture, entry.bytes);
    trimCardNft2EffectTextureCache();
    return texture;
  }).catch((error) => {
    if (cardNft2EffectTextureCache.get(key) === entry) cardNft2EffectTextureCache.delete(key);
    throw error;
  });
  cardNft2EffectTextureCache.set(key, entry);
  trimCardNft2EffectTextureCache();
  return entry.promise;
}

function cardNft2EffectTextureUrl(kind, cardNumber) {
  const id = String(cardNumber).padStart(4, "0");
  const directory = kind === "foil" ? "foils" : "masks";
  return `${CARD_NFT_2_EFFECT_TEXTURE_BASE_URL}/${directory}/${id}.webp`;
}

function trimCardNft2EffectTextureCache() {
  const protectedKeys = getProtectedCardEffectTextureKeys();
  let protectedScans = 0;
  while (
    (
      cardNft2EffectTextureCache.size > MAX_CARD_NFT_2_EFFECT_TEXTURE_CACHE_SIZE
      || getTextureCacheBytes(cardNft2EffectTextureCache) > CARD_EFFECT_TEXTURE_CACHE_BUDGET_BYTES
    )
    && protectedScans < cardNft2EffectTextureCache.size
  ) {
    const oldest = cardNft2EffectTextureCache.entries().next().value;
    if (!oldest) return;
    const [key, entry] = oldest;
    cardNft2EffectTextureCache.delete(key);
    if (!entry.texture || protectedKeys.has(key) || isEffectTextureAttached(entry.texture)) {
      cardNft2EffectTextureCache.set(key, entry);
      protectedScans += 1;
      continue;
    }
    protectedScans = 0;
    invalidatePreparedIndividualCardsForTexture(entry.texture);
    disposeNftTexture(entry.texture);
  }
}

function getProtectedCardEffectTextureKeys() {
  const keys = new Set();
  if (Number.isInteger(currentIndex) && CARDS[currentIndex]) {
    addCardEffectTextureCacheKeys(keys, CARDS[currentIndex]);
  }

  return keys;
}

function isEffectTextureAttached(texture) {
  if (!texture) return false;
  const meshes = [
    cardGradientMesh,
    cardBackGradientMesh,
    cardGlareMesh,
    cardBackGlareMesh,
  ];
  let attached = meshes.some((mesh) => (
    mesh?.material?.uniforms?.uFoilTexture?.value === texture
    || mesh?.material?.uniforms?.uMaskTexture?.value === texture
  ));
  if (attached) return true;
  cardSwapIncomingGroup?.traverse((object) => {
    const uniforms = object?.material?.uniforms;
    if (uniforms?.uFoilTexture?.value === texture || uniforms?.uMaskTexture?.value === texture) {
      attached = true;
    }
  });
  if (!attached) {
    for (const entry of [...screensaverCards, ...screensaverReadyCards]) {
      entry.group?.traverse((object) => {
        const uniforms = object?.material?.uniforms;
        if (
          uniforms?.uFoilTexture?.value === texture
          || uniforms?.uMaskTexture?.value === texture
        ) {
          attached = true;
        }
      });
      if (attached) break;
    }
  }
  return attached;
}

function addCardEffectTextureCacheKeys(keys, card) {
  const profile = getCardEffectProfile(card);
  if (!profile.needsEffectTextures) return;
  keys.add(`foil:${profile.cardNumber}`);
  keys.add(`mask:${profile.cardNumber}`);
}

function loadAnimatedTexture(card, { fetchPriority = "auto" } = {}) {
  const sprite = getAnimatedSpriteInfo(card);
  const load = fetchPriority === "high" ? loadHighPriorityTexture : loadTexture;
  if (!sprite) return load(cardAssetUrl(card));

  return load(new URL(sprite.file, import.meta.url).href).then((texture) => {
    configureAnimatedTexture(texture, sprite);
    return texture;
  });
}

function configureAnimatedTexture(texture, sprite) {
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
      uEffectStrength: { value: 1 },
      uUseEffectTextures: { value: 0 },
      uUseEngravingMask: { value: 0 },
      uFoilTexture: { value: getCardPlaceholderTexture() },
      uMaskTexture: { value: getCardPlaceholderTexture() },
      uPointer: { value: new THREE.Vector2(CARD_NFT_2_EFFECT_DEFAULT_POINTER_X, CARD_NFT_2_EFFECT_DEFAULT_POINTER_Y) },
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
      uniform float uEffectStrength;
      uniform float uUseEffectTextures;
      uniform float uUseEngravingMask;
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
          vec2 reflectedPointer = clamp(
            vec2(0.5 + reflected.x * 0.78, 0.5 - reflected.y * 0.7),
            0.0,
            1.0
          );
          float hoverActivity = smoothstep(0.01, 0.82, uPointerActive);
          vec2 pointerUv = clamp(uPointer, 0.0, 1.0);
          vec2 effectPointer = mix(
            reflectedPointer,
            pointerUv,
            0.5
          );
          vec2 spotlightPointer = mix(
            effectPointer,
            pointerUv,
            hoverActivity
          );
          vec2 background = vec2(
            mix(0.37, 0.63, effectPointer.x),
            mix(0.33, 0.67, effectPointer.y)
          );
          float pointerFromCenter = clamp(length(effectPointer - 0.5) / 0.5, 0.0, 1.0);
          float spotlightStrength = mix(0.68, 1.0, hoverActivity);
          float motionRadial = smoothstep(0.92, 0.0, distance(vUv, spotlightPointer))
            * spotlightStrength;
          float motionCore = smoothstep(0.2, 0.0, distance(vUv, spotlightPointer))
            * spotlightStrength;
          float grain = fract(sin(dot(vUv * vec2(811.3, 1247.1), vec2(12.9898, 78.233))) * 43758.5453);
          float fine = fract(sin(dot((vUv + background) * vec2(315.7, 924.6), vec2(37.719, 11.137))) * 24634.6345);

          if (uEffectMode < 1.5) {
            gl_FragColor = vec4(0.0);
            return;
          }

          float textureBlend = smoothstep(0.0, 1.0, uUseEffectTextures);
          float engravingAlpha = 1.0;
          float foilLight = 0.5;
          if (uUseEffectTextures > 0.001 && uUseEngravingMask > 0.001) {
            vec4 maskSample = texture2D(uMaskTexture, vUv);
            engravingAlpha = maskSample.a;
            foilLight = dot(
              texture2D(uFoilTexture, vUv).rgb,
              vec3(0.299, 0.587, 0.114)
            );
          }
          float engraving = mix(
            1.0,
            pow(clamp(engravingAlpha, 0.0, 1.0), 0.82),
            smoothstep(0.0, 1.0, uUseEngravingMask)
          );
          float textureReady = textureBlend;
          vec3 sunPillar = rainbow(vUv.y * 6.8 - background.y * 7.0);
          vec3 reverseSunPillar = rainbow(-vUv.y * 4.2 + background.y * 5.0 + background.x * 1.2);
          float metalLine = stripe(
            (vUv.x * 0.74 - vUv.y * 0.54) * 8.3
              + background.x * 2.2
              + background.y * 0.85,
            0.095
          );
          float metalBand = stripe(
            (vUv.x * 0.74 - vUv.y * 0.54) * 3.25 + background.x * 1.15,
            0.2
          );
          float scan = stripe(vUv.y * 180.0 + background.y * 5.0, 0.24);
          float barsA = stripe(vUv.x * 8.3 + background.y * 4.0, 0.09);
          float barsB = stripe(vUv.x * 5.7 - background.y * 3.0 + background.x * 2.2, 0.12);
          float radialDark = smoothstep(0.08, 0.92, distance(vUv, effectPointer));
          vec3 color = vec3(0.0);
          float alpha = 0.0;

          if (uEffectMode < 2.5) {
            vec3 metal = mix(
              vec3(0.015, 0.026, 0.07),
              vec3(0.62, 0.7, 0.69),
              metalLine
            );
            color = mix(metal, sunPillar, 0.5);
            color = mix(color, reverseSunPillar, metalBand * 0.3);
            color *= mix(0.72, 1.22, grain);
            color = mix(color, vec3(0.96, 0.98, 1.0), motionCore * 0.2);
            color *= mix(0.78, 1.0, radialDark);
            alpha = engraving
              * (0.17 + metalLine * 0.17 + metalBand * 0.07 + motionRadial * 0.05)
              * textureReady;
          } else if (uEffectMode < 3.5) {
            vec3 holo = rainbow(
              ((0.5 - background.x) * 2.6)
                + ((0.5 - background.y) * 3.5)
                + vUv.x * 1.1
                + vUv.y * 3.3
            );
            float scanMix = mix(0.52, 1.0, scan);
            color = min(vec3(1.0), holo * scanMix * 1.12);
            color = mix(color, vec3(0.74), clamp(barsA + barsB, 0.0, 1.0) * 0.19);
            color = mix(color, vec3(0.98, 1.0, 1.0), motionCore * 0.2);
            alpha = engraving
              * (0.28 + barsA * 0.09 + barsB * 0.075 + motionRadial * 0.09)
              * textureReady;
          } else if (uEffectMode < 4.5) {
            vec3 printedFoil = mix(
              vec3(0.075, 0.085, 0.105),
              vec3(0.94, 0.96, 0.91),
              foilLight
            );
            vec3 support = mix(printedFoil, sunPillar, 0.42);
            support = mix(support, reverseSunPillar, metalLine * 0.26);
            color = support * mix(
              0.68,
              1.34,
              pointerFromCenter * 0.55 + motionRadial * 0.35
            );
            color = mix(color, vec3(1.0, 0.94, 0.98), motionCore * 0.22);
            alpha = engraving
              * (0.36 + metalLine * 0.12 + motionRadial * 0.16 + pointerFromCenter * 0.08)
              * textureReady;
          } else {
            float sparkle = step(0.982, fine) * motionRadial;
            float glitter = step(0.975, grain);
            vec3 spectrum = rainbow(
              (vUv.x - vUv.y) * 2.1
                + (0.5 - background.x) * 3.0
                + (0.5 - background.y) * 3.0
            );
            vec3 amazing = mix(vec3(0.08, 0.18, 0.12), spectrum, 0.62);
            vec3 foilHighlight = mix(
              vec3(0.06, 0.045, 0.07),
              vec3(0.98, 0.9, 0.76),
              foilLight
            );
            float maskedStrength = engraving
              * (0.15 + motionRadial * 0.1 + sparkle * 0.3 + glitter * 0.045);
            float foilStrength = foilLight * motionRadial * 0.075 * textureBlend;
            float spectrumStrength = 0.045 + metalBand * 0.035;
            float totalStrength = maskedStrength + foilStrength + spectrumStrength;
            color = (
              amazing * maskedStrength
                + foilHighlight * foilStrength
                + spectrum * spectrumStrength
                + (sparkle + glitter * 0.32) * vec3(1.0, 0.92, 0.66) * maskedStrength
            ) / max(totalStrength, 0.0001);
            alpha = totalStrength * textureReady;
          }

          alpha *= mix(0.88, 1.08, grain);
          gl_FragColor = vec4(
            clamp(color, 0.0, 1.25),
            clamp(alpha, 0.0, 0.48) * uEffectStrength * uActivity * uTransitionOpacity
          );
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
  mesh.userData.cardEffectLayer = "shine";
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
      uEffectStrength: { value: 1 },
      uUseEffectTextures: { value: 0 },
      uUseEngravingMask: { value: 0 },
      uFoilTexture: { value: getCardPlaceholderTexture() },
      uMaskTexture: { value: getCardPlaceholderTexture() },
      uPointer: { value: new THREE.Vector2(CARD_NFT_2_EFFECT_DEFAULT_POINTER_X, CARD_NFT_2_EFFECT_DEFAULT_POINTER_Y) },
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
      uniform float uEffectStrength;
      uniform float uUseEffectTextures;
      uniform float uUseEngravingMask;
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
          vec2 reflectedPointer = clamp(
            vec2(0.5 + reflected.x * 0.78, 0.5 - reflected.y * 0.7),
            0.0,
            1.0
          );
          float hoverActivity = smoothstep(0.01, 0.82, uPointerActive);
          vec2 pointerUv = clamp(uPointer, 0.0, 1.0);
          vec2 effectPointer = mix(
            reflectedPointer,
            pointerUv,
            0.5
          );
          vec2 spotlightPointer = mix(
            effectPointer,
            pointerUv,
            hoverActivity
          );
          vec2 background = vec2(
            mix(0.37, 0.63, effectPointer.x),
            mix(0.33, 0.67, effectPointer.y)
          );
          float spotlightStrength = mix(0.68, 1.0, hoverActivity);
          float radial = smoothstep(0.92, 0.0, distance(vUv, spotlightPointer))
            * spotlightStrength;
          float inner = smoothstep(0.22, 0.0, distance(vUv, spotlightPointer))
            * spotlightStrength;
          float maskAlpha = 0.0;
          if (uUseEffectTextures > 0.001 && uUseEngravingMask > 0.001) {
            maskAlpha = texture2D(uMaskTexture, vUv).a;
          }
          float fineGrain = fract(sin(dot(vUv * vec2(811.3, 1247.1), vec2(12.9898, 78.233))) * 43758.5453);
          vec3 color = vec3(1.0);
          float alpha = 0.0;

          if (uEffectMode < 1.5) {
            vec3 edge = vec3(0.28, 0.3, 0.34);
            vec3 middle = vec3(0.78, 0.82, 0.88);
            color = mix(edge, middle, radial);
            color = mix(color, vec3(1.0), inner * 0.72);
            alpha = 0.045 + radial * 0.12 + inner * 0.08;
          } else if (uEffectMode < 2.5) {
            float sweep = stripe((vUv.x * 0.92 - vUv.y * 0.52) * 3.8 + background.x * 2.2 + background.y * 1.1, 0.1);
            vec3 edge = mix(vec3(0.08, 0.09, 0.12), vec3(0.54, 0.58, 0.62), sweep * 0.34);
            color = mix(edge, vec3(0.78, 0.84, 0.96), radial);
            color = mix(color, vec3(1.0), inner * 0.7);
            alpha = 0.12 + sweep * 0.055 + radial * 0.11 + inner * 0.065;
          } else if (uEffectMode < 3.5) {
            float bars = stripe(vUv.x * 8.0 + background.y * 3.0, 0.1);
            vec3 edge = vec3(0.018, 0.022, 0.026);
            vec3 middle = mix(vec3(0.58, 0.76, 0.8), vec3(0.9), bars * 0.24);
            color = mix(edge, middle, radial);
            color = mix(color, vec3(0.94, 1.0, 1.0), inner * 0.72);
            alpha = 0.08 + bars * 0.025 + radial * 0.15 + inner * 0.08;
          } else if (uEffectMode < 4.5) {
            vec3 edge = vec3(0.12, 0.09, 0.13);
            vec3 middle = vec3(0.44, 0.46, 0.52);
            color = mix(edge, middle, radial);
            color = mix(color, vec3(1.0, 0.84, 0.94), inner * 0.68);
            alpha = 0.07 + radial * 0.08 + inner * 0.04;
          } else {
            vec3 edge = vec3(0.03, 0.055, 0.038);
            vec3 middle = vec3(0.72, 0.68, 0.52);
            color = mix(edge, middle, radial);
            color = mix(color, vec3(1.0, 0.94, 0.72), inner * 0.76);
            float engravedGlare = pow(clamp(maskAlpha, 0.0, 1.0), 0.82)
              * (0.025 + radial * 0.065)
              * smoothstep(0.0, 1.0, uUseEngravingMask);
            color = mix(color, vec3(0.94, 0.82, 0.7), engravedGlare * 1.8);
            alpha = mix(0.82, 0.46, radial) - inner * 0.06 + engravedGlare;
          }

          if (uEffectMode >= 1.5) {
            alpha *= smoothstep(0.0, 1.0, uUseEffectTextures);
          }
          alpha *= mix(0.92, 1.05, fineGrain);
          float maximumAlpha = uEffectMode >= 4.5 ? 0.22 : 0.38;
          float composedAlpha = clamp(alpha, 0.0, maximumAlpha)
            * uEffectStrength * uActivity * uTransitionOpacity;
          if (uEffectMode >= 3.5 && uEffectMode < 4.5) {
            // Three's multiply blend does not use source alpha. Encode the
            // desired strength toward neutral white so hover and transitions
            // remain smooth instead of applying a full dark pass at once.
            gl_FragColor = vec4(mix(vec3(1.0), color, composedAlpha), 1.0);
          } else {
            gl_FragColor = vec4(color, composedAlpha);
          }
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
  mesh.userData.cardEffectLayer = "glare";
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

function createBinderCoverPanelGeometry(width, height, depth, radius, side) {
  const geometry = new THREE.ExtrudeGeometry(
    createBinderCoverPanelShape(width, height, radius, side),
    {
      depth,
      bevelEnabled: false,
      curveSegments: 18,
    },
  );
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function createBinderCoverPanelShape(width, height, radius, side) {
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const shape = new THREE.Shape();

  if (side < 0) {
    shape.moveTo(left + radius, bottom);
    shape.lineTo(right, bottom);
    shape.lineTo(right, top);
    shape.lineTo(left + radius, top);
    shape.quadraticCurveTo(left, top, left, top - radius);
    shape.lineTo(left, bottom + radius);
    shape.quadraticCurveTo(left, bottom, left + radius, bottom);
    return shape;
  }

  shape.moveTo(left, bottom);
  shape.lineTo(right - radius, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + radius);
  shape.lineTo(right, top - radius);
  shape.quadraticCurveTo(right, top, right - radius, top);
  shape.lineTo(left, top);
  shape.lineTo(left, bottom);
  return shape;
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
  return card?.animation?.file
    || CARD_NFT_ANIMATED[card?.file]
    || card?.file
    || "";
}

function textureAssetPath(card) {
  return getAnimatedSpriteInfo(card)?.file || cardAssetPath(card);
}

function isAnimatedCard(card) {
  return Boolean(card?.animation?.file || CARD_NFT_ANIMATED[card?.file]);
}

function getAnimatedSpriteInfo(card) {
  return card?.animation?.sprite
    || CARD_NFT_ANIMATED_SPRITES[card?.file]
    || null;
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

function migrateLegacyFavorites(set, cards = CARDS) {
  if (!set.size || !cards.length) return;
  let changed = false;
  for (const card of cards) {
    const legacyKeys = [
      card?.mint,
      card?.collection && card?.mint ? `${card.collection}:${card.mint}` : null,
      ...(card?.collection === ACTIVE_COLLECTION_ID ? [card?.title] : []),
    ].filter(Boolean);
    const nextKey = card?.stableId;
    if (!nextKey) continue;
    for (const legacyKey of legacyKeys) {
      if (!set.has(legacyKey)) continue;
      set.add(nextKey);
      changed = true;
    }
  }
  if (changed) saveSet(FAVORITES_STORAGE_KEY, set);
}

async function syncFavoritesFromStorage(event) {
  if (event.key !== FAVORITES_STORAGE_KEY) return;
  const nextFavorites = loadSet(FAVORITES_STORAGE_KEY);
  favorites.clear();
  for (const key of nextFavorites) favorites.add(key);
  if (favoritesOnly) await ensureFavoriteCollectionCards();
  updateFavoriteButtons();
  updateBinderFavoriteButton();
  if (galleryOpen) renderGallery();
}

function applyRestoredSessionViewState(state) {
  if (!state || typeof state !== "object") return;

  if (typeof state.isBinderMode === "boolean") isBinderMode = state.isBinderMode;
  favoritesOnly = Boolean(state.favoritesOnly);
  activeCollectionFilter = favoritesOnly && COLLECTION_CONFIGS[state.activeCollectionFilter]
    ? state.activeCollectionFilter
    : "";
  traitSearchCollectionId = favoritesOnly && COLLECTION_CONFIGS[state.traitSearchCollectionId]
    ? state.traitSearchCollectionId
    : "";
  traitSearchOpen = galleryCollectionFiltersAvailable() && Boolean(state.traitSearchOpen);
  traitSortCategory = getValidTraitSortCategory(state.traitSortCategory);
  activeTraitFilter = galleryCollectionFiltersAvailable()
    ? getValidSessionTraitFilter(state.activeTraitFilter)
    : null;
  if (activeTraitFilter?.collectionId === ACTIVE_COLLECTION_ID && !isMixedCollectionGallery()) {
    traitSortCategory = activeTraitFilter.category;
  }
  restoreSessionWalletFilter(state);
}

function restoreSessionWalletFilter(state) {
  const address = String(state?.walletFilterAddress || "").trim();
  const stableIds = Array.isArray(state?.walletFilterCardStableIds)
    ? state.walletFilterCardStableIds
    : [];
  if (!isPossibleSolanaAddress(address) || !stableIds.length) return;

  const indexes = stableIds
    .map((stableId) => CARD_STABLE_ID_TO_INDEX.get(String(stableId || "").trim()))
    .filter((index) => Number.isInteger(index));
  if (!indexes.length) return;

  const matchedMints = new Map();
  for (const pair of Array.isArray(state?.walletMatchedMints) ? state.walletMatchedMints : []) {
    if (!Array.isArray(pair) || pair.length < 2) continue;
    const index = CARD_STABLE_ID_TO_INDEX.get(String(pair[0] || "").trim());
    const mint = String(pair[1] || "").trim();
    if (!Number.isInteger(index) || CARD_NFT_MINT_TO_INDEX.get(mint) !== index) continue;
    matchedMints.set(index, mint);
  }

  walletFilterAddress = address;
  walletFilterCardIndexes = [...new Set(indexes)].sort(compareCardIndexes);
  walletFilterCardIndexSet = new Set(walletFilterCardIndexes);
  walletMatchedMintByCardIndex = matchedMints;
  favoritesOnly = false;
  activeCollectionFilter = "";
  activeTraitFilter = null;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  traitSortCategory = "all";
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

  const restoreTableView = Boolean(state.binderTableView);

  if (!restoreTableView && state.binderIntroFocused && !hasActiveBinderIntroSuppressor()) {
    focusBinderIntroNote({ immediate: true });
    queueSessionViewStateSave();
    return;
  }

  const focusedCardIndex = CARD_STABLE_ID_TO_INDEX.get(
    String(state.binderFocusedCardStableId || "").trim(),
  ) ?? -1;
  if (!restoreTableView && focusedCardIndex >= 0) {
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
  const restoredClosure = clamp(
    Math.round(Number(state.binderTargetClosure) || 0),
    -1,
    1,
  );
  binderTargetClosure = restoredClosure;
  if (restoredClosure < 0) binderTargetTurn = 0;
  if (restoredClosure > 0) binderTargetTurn = binderPageCount;
  binderTurn = binderTargetTurn;
  binderClosure = binderTargetClosure;
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
  setBinderTableView(restoreTableView, { immediate: true, updateControls: false });
  updateBinderPageControls();
  startBinderRenderLoop();
  updateBinderAnimation();
  renderBinderSceneOnce({ immediateCamera: true });
  queueSessionViewStateSave();
}

function getRestoredSessionCardIndex(state) {
  const fallback = ACTIVE_COLLECTION_INDEXES[0] || 0;
  if (!CARDS.length) return fallback;
  const stableId = String(state?.currentCardStableId || "").trim();
  const restoredIndex = CARD_STABLE_ID_TO_INDEX.get(stableId);
  if (!Number.isInteger(restoredIndex)) return fallback;
  if (ACTIVE_COLLECTION_INDEXES.includes(restoredIndex)) return restoredIndex;
  return getVisibleIndexes().includes(restoredIndex) ? restoredIndex : fallback;
}

function getValidTraitSortCategory(category) {
  if (category === "all") return "all";
  if (category === COLLECTION_SORT_VALUE) {
    return isMixedCollectionGallery() ? COLLECTION_SORT_VALUE : "all";
  }
  if (category === WALLET_TRADE_FILTER_VALUE) return WALLET_TRADE_FILTER_VALUE;
  if (category === LISTED_SORT_VALUE) return LISTED_SORT_VALUE;
  const matched = getTraitDisplayCategoryOptions()
    .find((option) => normalizeTraitValue(option.category) === normalizeTraitValue(category));
  if (matched) return matched.category;
  return "all";
}

function getValidSessionTraitFilter(filter) {
  if (!filter || typeof filter !== "object") return null;
  const collectionId = COLLECTION_CONFIGS[filter.collectionId]?.id || ACTIVE_COLLECTION_ID;
  const category = getTraitDisplayCategoryOptions(collectionId)
    .find((option) => normalizeTraitValue(option.category) === normalizeTraitValue(filter.category))
    ?.category;
  if (!category) return null;
  const value = String(filter.value ?? "").trim();
  if (!value) return null;
  return {
    collectionId,
    category,
    value,
    normalizedValue: normalizeTraitValue(value),
    sourceCategories: getValidTraitFilterSourceCategories(
      filter.sourceCategories,
      category,
      collectionId,
    ),
  };
}

function getSessionViewState() {
  const focusedCardIndex = getFocusedBinderCardIndex();
  return {
    currentIndex,
    currentCardStableId: CARDS[currentIndex]?.stableId || null,
    galleryOpen,
    isBinderMode,
    binderTableView: binderTableViewTarget > 0.5,
    favoritesOnly,
    traitSearchOpen,
    traitSearchCollectionId,
    traitSortCategory,
    activeCollectionFilter,
    activeTraitFilter: activeTraitFilter
      ? {
        collectionId: activeTraitFilter.collectionId,
        category: activeTraitFilter.category,
        value: activeTraitFilter.value,
        sourceCategories: activeTraitFilter.sourceCategories,
      }
      : null,
    binderTargetTurn: Math.round(binderTargetTurn),
    binderTargetClosure: getBinderTargetClosedSide(),
    binderSinglePageSide: Number.isInteger(binderSinglePageSide) ? binderSinglePageSide : null,
    binderSinglePageSideTouched,
    binderFocusedCardIndex: Number.isInteger(focusedCardIndex) ? focusedCardIndex : null,
    binderFocusedCardStableId: Number.isInteger(focusedCardIndex)
      ? CARDS[focusedCardIndex]?.stableId || null
      : null,
    binderIntroFocused: isBinderIntroFocused(),
    walletFilterAddress: walletFilterCardIndexSet ? walletFilterAddress : "",
    walletFilterCardStableIds: walletFilterCardIndexes
      ? walletFilterCardIndexes
        .map((index) => CARDS[index]?.stableId)
        .filter(Boolean)
      : [],
    walletMatchedMints: [...walletMatchedMintByCardIndex]
      .map(([index, mint]) => [CARDS[index]?.stableId, mint])
      .filter(([stableId, mint]) => stableId && mint),
  };
}

function queueSessionViewStateSave() {
  if (sessionViewSaveFrame) return;
  sessionViewSaveFrame = requestAnimationFrame(() => {
    sessionViewSaveFrame = 0;
    saveSessionViewState();
  });
}

function consumeEvilBinderTableSwapArrival() {
  const storage = getBrowserStorage("sessionStorage");
  const rawValue = readStorageValue(
    storage,
    BINDER_EVIL_TABLE_SWAP_STORAGE_KEY,
    "",
  );
  try {
    storage?.removeItem(BINDER_EVIL_TABLE_SWAP_STORAGE_KEY);
  } catch {
    // A swap arrival remains optional when session storage is unavailable.
  }
  if (!rawValue || !usesEvilBinderPresentation()) return null;

  try {
    const value = JSON.parse(rawValue);
    const age = Date.now() - Number(value?.timestamp || 0);
    if (
      value?.collectionId !== ACTIVE_COLLECTION_ID
      || age < 0
      || age > BINDER_EVIL_TABLE_SWAP_ARRIVAL_MAX_AGE_MS
    ) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function applyEvilBinderTableSwapViewDefaults() {
  isBinderMode = true;
  favoritesOnly = false;
  traitSortCategory = "all";
  activeCollectionFilter = "";
  activeTraitFilter = null;
  traitSearchOpen = false;
  traitSearchCollectionId = "";
  walletFilterCardIndexes = null;
  walletFilterCardIndexSet = null;
  walletFilterAddress = "";
  walletMatchedMintByCardIndex = new Map();
}

function restoreEvilBinderTableSwapArrival() {
  resetBinderGalleryPosition();
  binderTargetTurn = 0;
  binderTurn = 0;
  binderTargetClosure = -1;
  binderClosure = -1;
  binderSinglePageSide = BINDER_SINGLE_PAGE_COVER_SIDE;
  binderSinglePageSideTouched = true;
  setGalleryOpen(true);
  setBinderTableView(true, { immediate: true });
  ensureBinderPageWindow({ force: true });
  updateBinderPageControls();
  renderBinderSceneOnce({ immediateCamera: true });
  queueSessionViewStateSave();
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
  if (activeIndividualCardModelRenderProfile === INDIVIDUAL_CARD_CLEAR_RESIN_PROFILE) {
    updateIndividualCardClearResinPointLight();
    startCardRenderLoop();
  }
  updateBinderTableSurfaceTheme(isLight);
  writeStorageValue(
    getBrowserStorage("localStorage"),
    "cardnft:theme:v1",
    isLight ? "light" : "dark",
  );
}

function loadSet(key) {
  try {
    const value = JSON.parse(
      readStorageValue(getBrowserStorage("localStorage"), key, "[]") || "[]",
    );
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  writeStorageValue(
    getBrowserStorage("localStorage"),
    key,
    JSON.stringify(Array.from(set)),
  );
}

function getBrowserStorage(name) {
  try {
    return window[name] || null;
  } catch {
    return null;
  }
}

function readStorageValue(storage, key, fallback = null) {
  try {
    return storage?.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorageValue(storage, key, value) {
  try {
    storage?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function modulo(value, length) {
  return ((value % length) + length) % length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
