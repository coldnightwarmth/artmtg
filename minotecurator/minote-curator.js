import { MINOTE_CURATOR_ITEMS } from "./minote-data.js?v=minote-curator-data-1";
import {
  MAX_RATING,
  countRatings,
  normalizeRating,
  sanitizeRatings,
  selectRatedItems,
  serializeSpreadsheetRows,
} from "./rating-model.js?v=minote-curator-3";

const STORAGE_KEY = "cards.art:minote-curator:ratings:v1";
const INITIAL_RENDER_BATCH_SIZE = 48;
const numberFormatter = new Intl.NumberFormat();

const gallery = document.querySelector("#curatorGallery");
const emptyState = document.querySelector("#emptyState");
const showAllButton = document.querySelector("#showAllButton");
const sortSelect = document.querySelector("#ratingSort");
const visibleCount = document.querySelector("#visibleCount");
const visibleCountLabel = document.querySelector("#visibleCountLabel");
const ratingAnnouncement = document.querySelector("#ratingAnnouncement");
const imagePreview = document.querySelector("#imagePreview");
const imagePreviewImage = document.querySelector("#imagePreviewImage");
const imagePreviewCaption = document.querySelector("#imagePreviewCaption");
const imagePreviewClose = document.querySelector("#imagePreviewClose");
const fiveStarExportButton = document.querySelector("#fiveStarExportButton");
const filterButtons = [...document.querySelectorAll("[data-rating-filter]")];
const countLabels = new Map(
  [...document.querySelectorAll("[data-count-for]")].map((element) => [
    element.dataset.countFor,
    element,
  ]),
);

const itemById = new Map(MINOTE_CURATOR_ITEMS.map((item) => [item.id, item]));
const sourceIndexById = new Map(MINOTE_CURATOR_ITEMS.map((item, index) => [item.id, index]));
const cardById = new Map();
const fullscreenImageById = new Map();
let ratings = loadRatings();
let activeFilter = "all";
let activeSort = "source";
let renderGeneration = 0;
let previewedItemId = null;
let previewTrigger = null;
let previewPinned = false;
let previewHideTimer = 0;
let previewRevealFrame = 0;
let previewLoadGeneration = 0;
let suppressPreviewFocusOnce = false;

const fullscreenPreloadObserver = typeof window.IntersectionObserver === "function"
  ? new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        preloadFullscreenImage(entry.target.dataset.itemId);
      }
    },
    { rootMargin: "420px 0px" },
  )
  : null;

function loadRatings() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};
    return sanitizeRatings(JSON.parse(stored), new Set(itemById.keys()));
  } catch {
    return {};
  }
}

function persistRatings() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {}
}

function getOpenSeaImageUrl(source, width) {
  if (!source) return "";
  try {
    const url = new URL(source);
    if (url.hostname.endsWith("seadn.io")) url.searchParams.set("w", String(width));
    return url.toString();
  } catch {
    return source;
  }
}

function getThumbnailUrl(source) {
  return getOpenSeaImageUrl(source, 640);
}

function getFullscreenImageUrl(source) {
  return getOpenSeaImageUrl(source, 1080);
}

function preloadFullscreenImage(itemId, { urgent = false } = {}) {
  const existing = fullscreenImageById.get(itemId);
  if (existing) {
    if (urgent) existing.image.fetchPriority = "high";
    return existing.promise;
  }

  const item = itemById.get(itemId);
  if (!item) return Promise.resolve(null);
  const image = new Image();
  image.decoding = "async";
  image.fetchPriority = urgent ? "high" : "low";
  const promise = new Promise((resolve) => {
    image.addEventListener("load", async () => {
      try {
        await image.decode();
      } catch {}
      resolve(image);
    }, { once: true });
    image.addEventListener("error", () => resolve(null), { once: true });
  });
  fullscreenImageById.set(itemId, { image, promise });
  image.src = getFullscreenImageUrl(item.imageUrl);
  return promise;
}

function getOpenSeaUrl(item) {
  const [chain, contractAddress, ...tokenParts] = item.id.split(":");
  return `https://opensea.io/item/${encodeURIComponent(chain)}/${encodeURIComponent(
    contractAddress,
  )}/${encodeURIComponent(tokenParts.join(":"))}`;
}

function createArtworkCard(item, sourceIndex) {
  const card = document.createElement("article");
  card.className = "artwork-card";
  card.dataset.itemId = item.id;

  const link = document.createElement("a");
  link.className = "artwork-link";
  link.href = getOpenSeaUrl(item);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.ariaLabel = `View ${item.name} on OpenSea`;

  const imageFrame = document.createElement("span");
  imageFrame.className = "artwork-image-frame";

  const image = document.createElement("img");
  image.className = "artwork-image";
  image.alt = item.name;
  image.decoding = "async";
  image.loading = sourceIndex < 12 ? "eager" : "lazy";
  if (sourceIndex < 8) image.fetchPriority = "high";
  image.addEventListener("load", () => image.classList.add("is-loaded"), { once: true });
  image.addEventListener(
    "error",
    () => {
      image.hidden = true;
      link.classList.add("has-image-error");
    },
    { once: true },
  );
  image.src = getThumbnailUrl(item.imageUrl);
  if (image.complete && image.naturalWidth > 0) image.classList.add("is-loaded");

  const fallback = document.createElement("span");
  fallback.className = "image-fallback";
  fallback.textContent = "Image unavailable";
  imageFrame.append(image, fallback);
  link.append(imageFrame);

  const previewButton = document.createElement("button");
  previewButton.className = "image-preview-trigger";
  previewButton.type = "button";
  previewButton.dataset.itemId = item.id;
  previewButton.setAttribute("aria-label", `Preview ${item.name} fullscreen`);
  previewButton.setAttribute("aria-expanded", "false");
  previewButton.setAttribute("aria-controls", "imagePreview");
  previewButton.textContent = "⛶";

  const visual = document.createElement("div");
  visual.className = "artwork-visual";
  visual.append(link, previewButton);

  const meta = document.createElement("div");
  meta.className = "artwork-meta";

  const collection = document.createElement("p");
  collection.className = "artwork-collection";
  collection.textContent = item.collectionName;

  const name = document.createElement("h2");
  name.className = "artwork-name";
  name.textContent = item.name;

  const rating = document.createElement("div");
  rating.className = "star-rating";
  rating.dataset.itemId = item.id;
  rating.setAttribute("role", "group");
  rating.setAttribute("aria-label", `Rate ${item.name}`);
  rating.setAttribute("aria-describedby", "ratingInstructions");

  for (let starNumber = 1; starNumber <= MAX_RATING; starNumber += 1) {
    const star = document.createElement("button");
    star.className = "rating-star";
    star.type = "button";
    star.dataset.rating = String(starNumber);
    star.textContent = "★";
    rating.append(star);
  }

  meta.append(collection, name, rating);
  card.append(visual, meta);
  updateCardRating(card, normalizeRating(ratings[item.id]));
  return card;
}

function getOrCreateCard(item) {
  let card = cardById.get(item.id);
  if (!card) {
    card = createArtworkCard(item, sourceIndexById.get(item.id));
    cardById.set(item.id, card);
    fullscreenPreloadObserver?.observe(card);
  }
  return card;
}

function updateCardRating(card, rating) {
  const item = itemById.get(card.dataset.itemId);
  const stars = [...card.querySelectorAll(".rating-star")];
  for (const star of stars) {
    const starNumber = Number(star.dataset.rating);
    const filled = starNumber <= rating;
    star.classList.toggle("is-filled", filled);
    star.setAttribute("aria-pressed", String(starNumber === rating));
    star.setAttribute(
      "aria-label",
      rating === starNumber
        ? `${starNumber} stars selected for ${item.name}; press again to clear`
        : `Rate ${item.name} ${starNumber} out of 5`,
    );
  }
}

function previewCardRating(ratingElement, previewRating) {
  ratingElement.classList.toggle("has-preview", previewRating > 0);
  for (const star of ratingElement.querySelectorAll(".rating-star")) {
    star.classList.toggle("is-preview", Number(star.dataset.rating) <= previewRating);
  }
}

function updateRatingCounts() {
  const counts = countRatings(MINOTE_CURATOR_ITEMS, ratings);
  countLabels.get("all").textContent = numberFormatter.format(MINOTE_CURATOR_ITEMS.length);
  for (let rating = 0; rating <= MAX_RATING; rating += 1) {
    countLabels.get(String(rating)).textContent = numberFormatter.format(counts[rating]);
  }
  fiveStarExportButton.disabled = counts[MAX_RATING] === 0;
  const exportLabel = `Download spreadsheet of ${counts[MAX_RATING]} five-star Mi Note${counts[MAX_RATING] === 1 ? "" : "s"}`;
  fiveStarExportButton.setAttribute("aria-label", exportLabel);
  fiveStarExportButton.title = exportLabel;
}

function downloadFiveStarSpreadsheet() {
  const fiveStarItems = selectRatedItems(
    MINOTE_CURATOR_ITEMS,
    ratings,
    String(MAX_RATING),
    "source",
  );
  if (!fiveStarItems.length) return;

  const rows = [
    ["Name", "Collection", "Rating", "OpenSea URL", "Image URL", "Item ID"],
    ...fiveStarItems.map((item) => [
      item.name,
      item.collectionName,
      MAX_RATING,
      getOpenSeaUrl(item),
      item.imageUrl,
      item.id,
    ]),
  ];
  const csv = serializeSpreadsheetRows(rows);
  const blobUrl = URL.createObjectURL(new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  }));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = `mi-note-5-star-ratings-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0);
  ratingAnnouncement.textContent = `Downloaded ${fiveStarItems.length} five-star Mi Note${fiveStarItems.length === 1 ? "" : "s"}.`;
}

function updateFilterButtons() {
  for (const button of filterButtons) {
    const active = button.dataset.ratingFilter === activeFilter;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  }
}

function updateVisibleSummary(count) {
  visibleCount.textContent = numberFormatter.format(count);
  visibleCountLabel.textContent = count === 1 ? "piece shown" : "pieces shown";
  emptyState.hidden = count !== 0;
  gallery.hidden = count === 0;
}

function renderGallery({ progressive = false } = {}) {
  renderGeneration += 1;
  const generation = renderGeneration;
  const selectedItems = selectRatedItems(
    MINOTE_CURATOR_ITEMS,
    ratings,
    activeFilter,
    activeSort,
  );

  updateVisibleSummary(selectedItems.length);
  if (selectedItems.length === 0) {
    gallery.replaceChildren();
    return;
  }

  gallery.hidden = false;
  gallery.replaceChildren();

  const appendRange = (start, end) => {
    const fragment = document.createDocumentFragment();
    for (let index = start; index < end; index += 1) {
      fragment.append(getOrCreateCard(selectedItems[index]));
    }
    gallery.append(fragment);
  };

  if (!progressive) {
    appendRange(0, selectedItems.length);
    return;
  }

  let index = 0;
  const appendNextBatch = () => {
    if (generation !== renderGeneration) return;
    const nextIndex = Math.min(index + INITIAL_RENDER_BATCH_SIZE, selectedItems.length);
    appendRange(index, nextIndex);
    index = nextIndex;
    if (index < selectedItems.length) window.requestAnimationFrame(appendNextBatch);
  };
  appendNextBatch();
}

function setRating(itemId, requestedRating, toggleSelected = true) {
  const item = itemById.get(itemId);
  if (!item) return;

  const currentRating = normalizeRating(ratings[itemId]);
  const normalizedRequest = normalizeRating(requestedRating);
  const nextRating = toggleSelected && currentRating === normalizedRequest ? 0 : normalizedRequest;
  if (nextRating > 0) ratings[itemId] = nextRating;
  else delete ratings[itemId];

  persistRatings();
  const card = cardById.get(itemId);
  if (card) updateCardRating(card, nextRating);
  updateRatingCounts();

  ratingAnnouncement.textContent = nextRating
    ? `${item.name} rated ${nextRating} out of 5.`
    : `Rating cleared for ${item.name}.`;

  if (activeFilter !== "all" || activeSort !== "source") renderGallery();
}

function setFilter(filter) {
  activeFilter = filter;
  updateFilterButtons();
  renderGallery();
}

function showImagePreview(itemId, trigger, { pinned = false } = {}) {
  const item = itemById.get(itemId);
  if (!item) return;

  window.clearTimeout(previewHideTimer);
  window.cancelAnimationFrame(previewRevealFrame);
  previewTrigger?.setAttribute("aria-expanded", "false");
  previewTrigger = trigger;
  previewTrigger?.setAttribute("aria-expanded", "true");

  if (previewedItemId !== itemId) {
    const loadGeneration = ++previewLoadGeneration;
    previewedItemId = itemId;
    imagePreviewImage.classList.remove("is-loaded");
    imagePreviewImage.alt = item.name;
    const thumbnail = trigger?.closest(".artwork-card")?.querySelector(".artwork-image");
    imagePreviewImage.src = thumbnail?.currentSrc || thumbnail?.src || getThumbnailUrl(item.imageUrl);
    imagePreviewCaption.textContent = `${item.name} · ${item.collectionName}`;
    if (imagePreviewImage.complete && imagePreviewImage.naturalWidth > 0) {
      imagePreviewImage.classList.add("is-loaded");
    }
    preloadFullscreenImage(itemId, { urgent: true }).then((preloadedImage) => {
      if (
        !preloadedImage
        || previewedItemId !== itemId
        || previewLoadGeneration !== loadGeneration
      ) return;
      imagePreviewImage.src = preloadedImage.currentSrc || preloadedImage.src;
      imagePreviewImage.classList.add("is-loaded");
    });
  }

  previewPinned = pinned;
  imagePreview.hidden = false;
  imagePreview.setAttribute("aria-hidden", "false");
  imagePreview.classList.toggle("is-pinned", previewPinned);
  document.body.classList.toggle("has-pinned-image-preview", previewPinned);
  if (previewPinned) {
    imagePreview.setAttribute("role", "dialog");
    imagePreview.setAttribute("aria-modal", "true");
    imagePreview.setAttribute("aria-label", `Fullscreen preview of ${item.name}`);
  } else {
    imagePreview.removeAttribute("role");
    imagePreview.removeAttribute("aria-modal");
    imagePreview.removeAttribute("aria-label");
  }

  previewRevealFrame = window.requestAnimationFrame(() => {
    imagePreview.classList.add("is-visible");
  });
}

function hideImagePreview({ restoreFocus = false } = {}) {
  if (imagePreview.hidden) return;
  const triggerToRestore = previewTrigger;
  previewPinned = false;
  previewedItemId = null;
  previewLoadGeneration += 1;
  previewTrigger?.setAttribute("aria-expanded", "false");
  previewTrigger = null;
  imagePreview.classList.remove("is-visible", "is-pinned");
  imagePreview.setAttribute("aria-hidden", "true");
  imagePreview.removeAttribute("role");
  imagePreview.removeAttribute("aria-modal");
  imagePreview.removeAttribute("aria-label");
  document.body.classList.remove("has-pinned-image-preview");
  window.clearTimeout(previewHideTimer);
  previewHideTimer = window.setTimeout(() => {
    if (imagePreview.classList.contains("is-visible")) return;
    imagePreview.hidden = true;
    imagePreviewImage.removeAttribute("src");
    imagePreviewImage.classList.remove("is-loaded");
    imagePreviewImage.alt = "";
    imagePreviewCaption.textContent = "";
  }, 150);
  if (restoreFocus && triggerToRestore) {
    suppressPreviewFocusOnce = true;
    triggerToRestore.focus({ preventScroll: true });
  }
}

imagePreviewImage.addEventListener("load", () => {
  imagePreviewImage.classList.add("is-loaded");
});

fiveStarExportButton.addEventListener("click", downloadFiveStarSpreadsheet);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.ratingFilter));
});

sortSelect.addEventListener("change", () => {
  activeSort = sortSelect.value;
  renderGallery();
});

showAllButton.addEventListener("click", () => setFilter("all"));

gallery.addEventListener("click", (event) => {
  const star = event.target.closest(".rating-star");
  if (!star) return;
  const ratingElement = star.closest(".star-rating");
  setRating(ratingElement.dataset.itemId, Number(star.dataset.rating));
});

gallery.addEventListener("pointerover", (event) => {
  const artworkCard = event.target.closest(".artwork-card");
  if (artworkCard) preloadFullscreenImage(artworkCard.dataset.itemId, { urgent: true });
  const previewButton = event.target.closest(".image-preview-trigger");
  if (previewButton) {
    if (!previewPinned) showImagePreview(previewButton.dataset.itemId, previewButton);
    return;
  }
  const star = event.target.closest(".rating-star");
  if (!star) return;
  previewCardRating(star.closest(".star-rating"), Number(star.dataset.rating));
});

gallery.addEventListener("pointerout", (event) => {
  const previewButton = event.target.closest(".image-preview-trigger");
  if (previewButton) {
    if (!previewPinned && !previewButton.contains(event.relatedTarget)) hideImagePreview();
    return;
  }
  const ratingElement = event.target.closest(".star-rating");
  if (!ratingElement || ratingElement.contains(event.relatedTarget)) return;
  previewCardRating(ratingElement, 0);
});

gallery.addEventListener("focusin", (event) => {
  const previewButton = event.target.closest(".image-preview-trigger");
  if (suppressPreviewFocusOnce && previewButton) {
    suppressPreviewFocusOnce = false;
    return;
  }
  if (previewButton && !previewPinned) {
    showImagePreview(previewButton.dataset.itemId, previewButton);
  }
});

gallery.addEventListener("focusout", (event) => {
  const previewButton = event.target.closest(".image-preview-trigger");
  if (previewButton && !previewPinned && !previewButton.contains(event.relatedTarget)) {
    hideImagePreview();
  }
});

gallery.addEventListener("click", (event) => {
  const previewButton = event.target.closest(".image-preview-trigger");
  if (!previewButton) return;
  event.preventDefault();
  if (previewPinned && previewedItemId === previewButton.dataset.itemId) {
    hideImagePreview({ restoreFocus: true });
    return;
  }
  showImagePreview(previewButton.dataset.itemId, previewButton, { pinned: true });
  imagePreviewClose.focus({ preventScroll: true });
});

imagePreviewClose.addEventListener("click", () => hideImagePreview({ restoreFocus: true }));

imagePreview.addEventListener("click", (event) => {
  if (previewPinned && event.target === imagePreview) hideImagePreview({ restoreFocus: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab" && previewPinned) {
    event.preventDefault();
    imagePreviewClose.focus({ preventScroll: true });
    return;
  }
  if (event.key === "Escape" && !imagePreview.hidden) {
    event.preventDefault();
    hideImagePreview({ restoreFocus: previewPinned });
  }
});

window.addEventListener(
  "scroll",
  () => {
    if (!previewPinned && !imagePreview.hidden) hideImagePreview();
  },
  { passive: true },
);

gallery.addEventListener("keydown", (event) => {
  const star = event.target.closest(".rating-star");
  if (!star) return;

  const current = Number(star.dataset.rating);
  let requested = null;
  if (event.key === "ArrowRight" || event.key === "ArrowUp") {
    requested = Math.min(MAX_RATING, current + 1);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
    requested = Math.max(1, current - 1);
  } else if (event.key === "Home") {
    requested = 1;
  } else if (event.key === "End") {
    requested = MAX_RATING;
  } else if (event.key === "Delete" || event.key === "Backspace") {
    requested = 0;
  }

  if (requested === null) return;
  event.preventDefault();
  const ratingElement = star.closest(".star-rating");
  if (requested === 0) {
    const itemId = ratingElement.dataset.itemId;
    if (ratings[itemId]) setRating(itemId, 0, false);
    return;
  }

  const requestedStar = ratingElement.querySelector(`[data-rating="${requested}"]`);
  requestedStar?.focus();
  setRating(ratingElement.dataset.itemId, requested, false);
});

updateRatingCounts();
updateFilterButtons();
renderGallery({ progressive: true });
