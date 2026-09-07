export const MIN_RATING = 0;
export const MAX_RATING = 5;

export function normalizeRating(value) {
  const rating = Number(value);
  return Number.isInteger(rating) && rating >= MIN_RATING && rating <= MAX_RATING
    ? rating
    : MIN_RATING;
}

export function sanitizeRatings(value, validIds) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  const ratings = {};
  for (const [id, rawRating] of Object.entries(value)) {
    if (validIds && !validIds.has(id)) continue;
    const rating = normalizeRating(rawRating);
    if (rating > MIN_RATING) ratings[id] = rating;
  }
  return ratings;
}

export function countRatings(items, ratings) {
  const counts = Array(MAX_RATING + 1).fill(0);
  for (const item of items) counts[normalizeRating(ratings[item.id])] += 1;
  return counts;
}

export function selectRatedItems(items, ratings, filter = "all", sort = "source") {
  const requestedRating = filter === "all" ? null : normalizeRating(filter);
  const selected = requestedRating === null
    ? [...items]
    : items.filter((item) => normalizeRating(ratings[item.id]) === requestedRating);

  if (sort === "source") return selected;

  const sourceOrder = new Map(items.map((item, index) => [item.id, index]));
  const sourceComparator = (a, b) => sourceOrder.get(a.id) - sourceOrder.get(b.id);
  const ratingOf = (item) => normalizeRating(ratings[item.id]);

  if (sort === "rating-desc") {
    selected.sort((a, b) => ratingOf(b) - ratingOf(a) || sourceComparator(a, b));
  } else if (sort === "rating-asc") {
    selected.sort((a, b) => {
      const aRating = ratingOf(a) || MAX_RATING + 1;
      const bRating = ratingOf(b) || MAX_RATING + 1;
      return aRating - bRating || sourceComparator(a, b);
    });
  } else if (sort === "unrated-first") {
    selected.sort(
      (a, b) =>
        Number(ratingOf(a) > MIN_RATING) - Number(ratingOf(b) > MIN_RATING) ||
        sourceComparator(a, b),
    );
  }

  return selected;
}

export function serializeSpreadsheetRows(rows) {
  const escapeCell = (value) => {
    const text = String(value ?? "");
    const safeText = /^[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safeText.replaceAll('"', '""')}"`;
  };
  return rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
}
