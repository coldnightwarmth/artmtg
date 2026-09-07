#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  countRatings,
  normalizeRating,
  sanitizeRatings,
  selectRatedItems,
  serializeSpreadsheetRows,
} from "../minotecurator/rating-model.js";
import {
  MINOTE_CURATOR_ITEMS,
  MINOTE_CURATOR_META,
} from "../minotecurator/minote-data.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXPECTED_COLLECTIONS = ["minote", "mi-note2", "mi-note-3"];

assert.equal(MINOTE_CURATOR_ITEMS.length, MINOTE_CURATOR_META.total);
assert.equal(
  MINOTE_CURATOR_META.collections.reduce((total, collection) => total + collection.count, 0),
  MINOTE_CURATOR_META.total,
);
assert.deepEqual(
  MINOTE_CURATOR_META.collections.map((collection) => collection.slug),
  EXPECTED_COLLECTIONS,
);
assert.equal(new Set(MINOTE_CURATOR_ITEMS.map((item) => item.id)).size, MINOTE_CURATOR_ITEMS.length);

for (const item of MINOTE_CURATOR_ITEMS) {
  assert.ok(item.id.startsWith("ethereum:0x"), `Unexpected item ID: ${item.id}`);
  assert.ok(item.name, `Missing name for ${item.id}`);
  assert.match(item.imageUrl, /^https:\/\//, `Missing HTTPS image for ${item.id}`);
  assert.ok(EXPECTED_COLLECTIONS.includes(item.collection), `Unexpected collection: ${item.collection}`);
}

assert.equal(normalizeRating(-1), 0);
assert.equal(normalizeRating(3), 3);
assert.equal(normalizeRating("5"), 5);
assert.equal(normalizeRating(6), 0);

const sample = MINOTE_CURATOR_ITEMS.slice(0, 4);
const sampleIds = new Set(sample.map((item) => item.id));
const sampleRatings = sanitizeRatings(
  {
    [sample[0].id]: 5,
    [sample[1].id]: 1,
    [sample[2].id]: 3,
    [sample[3].id]: 99,
    unknown: 4,
  },
  sampleIds,
);

assert.deepEqual(Object.values(sampleRatings).sort(), [1, 3, 5]);
assert.deepEqual(countRatings(sample, sampleRatings), [1, 1, 0, 1, 0, 1]);
assert.deepEqual(selectRatedItems(sample, sampleRatings, "0").map(({ id }) => id), [sample[3].id]);
assert.deepEqual(selectRatedItems(sample, sampleRatings, "5").map(({ id }) => id), [sample[0].id]);
assert.deepEqual(
  selectRatedItems(sample, sampleRatings, "all", "rating-desc").map(({ id }) => id),
  [sample[0].id, sample[2].id, sample[1].id, sample[3].id],
);
assert.deepEqual(
  selectRatedItems(sample, sampleRatings, "all", "rating-asc").map(({ id }) => id),
  [sample[1].id, sample[2].id, sample[0].id, sample[3].id],
);
assert.deepEqual(
  selectRatedItems(sample, sampleRatings, "all", "unrated-first").map(({ id }) => id),
  [sample[3].id, sample[0].id, sample[1].id, sample[2].id],
);
assert.equal(
  serializeSpreadsheetRows([
    ["Name", "Rating"],
    ['A "quoted" note', 5],
    ["=unsafe formula", 5],
  ]),
  '"Name","Rating"\r\n"A ""quoted"" note","5"\r\n"\'=unsafe formula","5"',
);

const [html, css, app] = await Promise.all([
  readFile(path.join(ROOT, "minotecurator", "index.html"), "utf8"),
  readFile(path.join(ROOT, "minotecurator", "minote-curator.css"), "utf8"),
  readFile(path.join(ROOT, "minotecurator", "minote-curator.js"), "utf8"),
]);

for (const required of [
  'id="curatorGallery"',
  'id="ratingSort"',
  'id="imagePreview"',
  'id="imagePreviewImage"',
  'id="fiveStarExportButton"',
  'data-rating-filter="0"',
  'data-rating-filter="5"',
  "https://opensea.io/collection/minote",
  "https://opensea.io/collection/mi-note2",
  "https://opensea.io/collection/mi-note-3",
]) {
  assert.ok(html.includes(required), `Missing HTML requirement: ${required}`);
}

assert.ok(!html.includes('class="page-header"'), "The removed curator masthead should stay removed");
assert.ok(css.includes("position: sticky"));
assert.ok(css.includes("content-visibility: auto"));
assert.ok(css.includes(".image-preview-trigger"));
assert.ok(css.includes(".image-preview-image"));
assert.ok(css.includes(".five-star-export"));
assert.ok(!css.includes("aspect-ratio: 1 / 1"), "Artwork previews should use their natural ratio");
assert.ok(app.includes('const STORAGE_KEY = "cards.art:minote-curator:ratings:v1"'));
assert.ok(app.includes('./rating-model.js?v=minote-curator-3'));
assert.ok(app.includes('./minote-data.js?v=minote-curator-data-1'));
assert.ok(app.includes("window.localStorage.setItem"));
assert.ok(app.includes("showImagePreview"));
assert.ok(app.includes("getFullscreenImageUrl(item.imageUrl)"));
assert.ok(app.includes("getOpenSeaImageUrl(source, 1080)"));
assert.ok(app.includes("function preloadFullscreenImage("));
assert.ok(app.includes("thumbnail?.currentSrc || thumbnail?.src || getThumbnailUrl(item.imageUrl)"));
assert.ok(app.includes("function downloadFiveStarSpreadsheet()"));
assert.ok(app.includes('type: "text/csv;charset=utf-8"'));
assert.ok(app.includes("selectRatedItems("));
assert.ok(app.includes("serializeSpreadsheetRows(rows)"));
assert.ok(!app.includes("fetch("), "The deployed page should use its local static dataset");

console.log(
  `Verified Mi Note Curator: ${MINOTE_CURATOR_META.total} unique images, local ratings, filters, and sorting.`,
);
