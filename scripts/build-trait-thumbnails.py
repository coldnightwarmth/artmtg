#!/usr/bin/env python3
"""Build small transparent trait thumbnails for the Card NFT trait UI."""

from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CARD_NFT_1_ZIP = Path.home() / "Downloads/card nft main-20260618T030009Z-3-001.zip"
CARD_NFT_2_ASSETS = Path.home() / "Documents/share_kit_3500-4512/assets"
OUTPUT_ROOT = ROOT / "assets/trait-thumbnails"
MANIFEST_PATH = ROOT / "trait-thumbnails.js"
THUMBNAIL_SIZE = 96
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
HIDDEN_CATEGORIES = {"98noise"}
EXCLUDED_VALUES = {"no", "none", "null", "undefined"}
CARD_NFT_2_VISUAL_BASE_CATEGORIES = {
    "border",
    "bottom center",
    "bottom left",
    "bottom right",
    "center",
    "hero",
    "left",
    "overlay paint engraving",
    "right",
    "sprite",
    "top center",
    "top left",
    "top right",
}


def normalize(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "").strip().lower())


def asset_stem(path: str | Path) -> str:
    stem = Path(path).stem
    return re.sub(r"\$\d+$", "", stem).strip()


def trait_key(category: str, value: str) -> str:
    return f"{normalize(category)}|{normalize(value)}"


def safe_output_name(category: str, value: str) -> str:
    digest = hashlib.sha1(trait_key(category, value).encode("utf-8")).hexdigest()[:16]
    return f"{digest}.webp"


def safe_source_output_name(source: Path | str) -> str:
    digest = hashlib.sha1(str(source).encode("utf-8")).hexdigest()[:16]
    return f"{digest}.webp"


def is_visible_value(value: str) -> bool:
    normalized = normalize(value)
    return bool(normalized) and normalized not in EXCLUDED_VALUES


def read_trait_values() -> dict[str, dict[str, list[str]]]:
    node_code = """
import { CARD_NFT_TRAIT_CATEGORIES, CARD_NFT_TRAITS } from './cardnft-traits.js';
import { CARD_NFT_2_TRAIT_CATEGORIES, CARD_NFT_2_TRAITS } from './cardnft2-traits.js';

const hidden = new Set(['98noise']);
const excluded = new Set(['no', 'none', 'null', 'undefined']);
const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\\s+/g, ' ');
const isVisibleValue = (value) => {
  const normalized = normalize(value);
  return Boolean(normalized) && !excluded.has(normalized);
};
const addValue = (target, category, value) => {
  if (!category || hidden.has(category) || !isVisibleValue(value)) return;
  if (!target[category]) target[category] = new Set();
  target[category].add(String(value || '').trim());
};

const cardnft1 = {};
for (const [categoryIndex, category] of CARD_NFT_TRAIT_CATEGORIES.entries()) {
  for (const record of CARD_NFT_TRAITS) {
    addValue(cardnft1, category, record?.values?.[categoryIndex]);
  }
}

const cardnft2 = {};
for (const record of CARD_NFT_2_TRAITS) {
  for (const entry of record?.entries || []) {
    addValue(cardnft2, String(entry?.category || '').trim(), entry?.value);
  }
}

const serialize = (source) => Object.fromEntries(
  Object.entries(source).map(([category, values]) => [
    category,
    [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })),
  ])
);

process.stdout.write(JSON.stringify({
  cardnft1: serialize(cardnft1),
  cardnft2: serialize(cardnft2),
}));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-"],
        input=node_code,
        text=True,
        cwd=ROOT,
        check=True,
        capture_output=True,
    )
    return json.loads(result.stdout)


def add_source(mapping: dict[str, Path | str], category: str, value: str, source: Path | str) -> None:
    key = trait_key(category, value)
    if key not in mapping:
        mapping[key] = source


def build_cardnft1_sources() -> tuple[dict[str, str], dict[str, list[str]]]:
    exact: dict[str, str] = {}
    by_value: dict[str, list[str]] = defaultdict(list)
    if not CARD_NFT_1_ZIP.exists():
        print(f"CardNFT1 trait zip not found: {CARD_NFT_1_ZIP}", file=sys.stderr)
        return exact, by_value

    with zipfile.ZipFile(CARD_NFT_1_ZIP) as archive:
        for name in archive.namelist():
            if name.endswith("/"):
                continue
            parts = Path(name).parts
            if len(parts) < 3 or parts[0] != "card nft main":
                continue
            if Path(name).suffix.lower() not in IMAGE_EXTENSIONS:
                continue
            category = parts[1]
            value = asset_stem(parts[-1])
            if normalize(category) in HIDDEN_CATEGORIES or not is_visible_value(value):
                continue
            add_source(exact, category, value, name)
            by_value[normalize(value)].append(name)
    return exact, by_value


def build_cardnft2_sources() -> tuple[dict[str, Path], dict[str, list[Path]]]:
    exact: dict[str, Path] = {}
    by_value: dict[str, list[Path]] = defaultdict(list)
    if not CARD_NFT_2_ASSETS.exists():
        print(f"CardNFT2 assets not found: {CARD_NFT_2_ASSETS}", file=sys.stderr)
        return exact, by_value

    for path in CARD_NFT_2_ASSETS.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        try:
            category = path.relative_to(CARD_NFT_2_ASSETS).parts[0]
        except ValueError:
            continue
        value = asset_stem(path.name)
        if not is_visible_value(value):
            continue
        add_source(exact, category, value, path)
        by_value[normalize(value)].append(path)
    return exact, by_value


def cardnft2_source_categories(category: str) -> list[str]:
    normalized = normalize(category)
    candidates = [normalized]
    if " - " in normalized:
        candidates.append(normalized.rsplit(" - ", 1)[-1])
    if normalized.startswith("top rare addon - "):
        candidates.append(normalized.replace("top rare addon - ", "", 1))
    if normalized.startswith("rare addon - "):
        candidates.append(normalized.replace("rare addon - ", "", 1))
    if normalized.startswith("blood energy sprite overlay - "):
        candidates.append(normalized.replace("blood energy sprite overlay - ", "", 1))
    if normalized in {"blood energy sprite overlay", "blood energy overlay"}:
        candidates.append("sprite")
    return [candidate for candidate in dict.fromkeys(candidates) if candidate in CARD_NFT_2_VISUAL_BASE_CATEGORIES]


def open_source_image(source: Path | str, archive: zipfile.ZipFile | None = None) -> Image.Image:
    if archive:
        with archive.open(str(source)) as handle:
            image = Image.open(handle)
            image.load()
            return image
    image = Image.open(Path(source))
    image.load()
    return image


def crop_to_square_thumbnail(image: Image.Image) -> Image.Image | None:
    rgba = image.convert("RGBA")
    alpha = rgba.getchannel("A")
    bbox = alpha.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    elif rgba.getbbox():
        rgba = rgba.crop(rgba.getbbox())
    else:
        return None

    rgba.thumbnail((THUMBNAIL_SIZE, THUMBNAIL_SIZE), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (THUMBNAIL_SIZE, THUMBNAIL_SIZE), (0, 0, 0, 0))
    x = (THUMBNAIL_SIZE - rgba.width) // 2
    y = (THUMBNAIL_SIZE - rgba.height) // 2
    canvas.alpha_composite(rgba, (x, y))
    return canvas


def save_thumbnail(source: Path | str, output_path: Path, archive: zipfile.ZipFile | None = None) -> bool:
    try:
        image = open_source_image(source, archive)
        thumbnail = crop_to_square_thumbnail(image)
        if thumbnail is None:
            return False
        output_path.parent.mkdir(parents=True, exist_ok=True)
        thumbnail.save(output_path, "WEBP", quality=72, method=4)
        return True
    except Exception as exc:  # noqa: BLE001 - keep generation resilient to a single bad source asset.
        print(f"Skipping thumbnail source {source}: {exc}", file=sys.stderr)
        return False


def unique_value_source(by_value: dict[str, list[Path | str]], value: str) -> Path | str | None:
    matches = by_value.get(normalize(value), [])
    return matches[0] if len(matches) == 1 else None


def build_collection_thumbnails(
    collection_id: str,
    values_by_category: dict[str, list[str]],
    exact_sources: dict[str, Path | str],
    value_sources: dict[str, list[Path | str]],
    archive: zipfile.ZipFile | None = None,
) -> dict[str, str]:
    manifest: dict[str, str] = {}
    out_dir = OUTPUT_ROOT / collection_id

    for category, values in values_by_category.items():
        for value in values:
            source: Path | str | None = None
            if collection_id == "cardnft2":
                for source_category in cardnft2_source_categories(category):
                    source = exact_sources.get(trait_key(source_category, value))
                    if source:
                        break
            else:
                source = exact_sources.get(trait_key(category, value))

            if not source and collection_id == "cardnft1":
                source = unique_value_source(value_sources, value)

            if not source:
                continue

            output_path = out_dir / safe_source_output_name(source)
            if output_path.exists() or save_thumbnail(source, output_path, archive):
                manifest[trait_key(category, value)] = output_path.relative_to(ROOT).as_posix()

    return dict(sorted(manifest.items()))


def write_manifest(manifest: dict[str, dict[str, str]]) -> None:
    content = (
        "// Generated by scripts/build-trait-thumbnails.py\n"
        f"export const TRAIT_THUMBNAILS = {json.dumps(manifest, indent=2, sort_keys=True)};\n"
    )
    MANIFEST_PATH.write_text(content, encoding="utf-8")


def main() -> None:
    trait_values = read_trait_values()
    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)

    cardnft1_exact, cardnft1_values = build_cardnft1_sources()
    cardnft2_exact, cardnft2_values = build_cardnft2_sources()
    manifest: dict[str, dict[str, str]] = {}

    archive = zipfile.ZipFile(CARD_NFT_1_ZIP) if CARD_NFT_1_ZIP.exists() else None
    try:
        manifest["cardnft1"] = build_collection_thumbnails(
            "cardnft1",
            trait_values.get("cardnft1", {}),
            cardnft1_exact,
            cardnft1_values,
            archive,
        )
    finally:
        if archive:
            archive.close()

    manifest["cardnft2"] = build_collection_thumbnails(
        "cardnft2",
        trait_values.get("cardnft2", {}),
        cardnft2_exact,
        cardnft2_values,
    )
    write_manifest(manifest)

    print(
        "Generated trait thumbnails: "
        f"cardnft1={len(manifest['cardnft1'])}, "
        f"cardnft2={len(manifest['cardnft2'])}"
    )


if __name__ == "__main__":
    main()
