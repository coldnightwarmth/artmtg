#!/usr/bin/env python3
"""Download Swag Pack art and build trimmed, transparent web sticker assets."""

from __future__ import annotations

import concurrent.futures
import io
import json
import os
from pathlib import Path
import re
import shutil
import time
import urllib.request

import cv2
import numpy as np
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "assets" / "swag-pack" / "transparent"
MANIFEST_PATH = ROOT / "swag-pack-stickers.js"
ALGORITHM_REVISION = "2"
ALGORITHM_MARKER = OUTPUT_DIR / f".algorithm-v{ALGORITHM_REVISION}"
CLEAN_EXISTING_OUTPUTS = not ALGORITHM_MARKER.exists()
COLLECTION_MINT = "C22esis7kQMbX9JGWsMaKvsh1X5GeBmHPju28jiKDyAP"
RPC_URL = os.environ.get(
    "HELIUS_RPC_URL",
    "https://lauraine-qytyxk-fast-mainnet.helius-rpc.com",
)
PAGE_LIMIT = 1000
MAX_PAGES = 25
MAX_EDGE = 1024
DOWNLOAD_WORKERS = 12
USER_AGENT = "Mozilla/5.0 (compatible; cards.art sticker asset sync)"


def request_bytes(url: str, *, body: bytes | None = None, content_type: str = "") -> bytes:
    headers = {"User-Agent": USER_AGENT, "Accept": "image/*,application/json,*/*;q=0.8"}
    if content_type:
        headers["Content-Type"] = content_type
    request = urllib.request.Request(url, data=body, headers=headers)
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except Exception as error:  # Network retries are intentionally broad.
            last_error = error
            if attempt < 3:
                time.sleep(0.5 * (2**attempt))
    raise RuntimeError(f"Unable to fetch {url}") from last_error


def rpc(method: str, params: dict) -> dict:
    body = json.dumps({
        "jsonrpc": "2.0",
        "id": f"cards-art-{method}",
        "method": method,
        "params": params,
    }).encode("utf-8")
    payload = json.loads(request_bytes(RPC_URL, body=body, content_type="application/json"))
    if payload.get("error"):
        raise RuntimeError(payload["error"].get("message") or f"{method} failed")
    return payload.get("result") or {}


def get_collection_assets() -> list[dict]:
    assets: list[dict] = []
    page = 1
    while page <= MAX_PAGES:
        result = rpc("getAssetsByGroup", {
            "groupKey": "collection",
            "groupValue": COLLECTION_MINT,
            "page": page,
            "limit": PAGE_LIMIT,
        })
        items = result.get("items") if isinstance(result.get("items"), list) else []
        assets.extend(items)
        # Helius reports the current page size as `total` for this collection,
        # so the short final page is the reliable pagination terminator.
        if len(items) < PAGE_LIMIT:
            break
        page += 1
    else:
        raise RuntimeError("Swag Pack pagination exceeded its safety limit")
    unique = {str(asset.get("id") or "").strip(): asset for asset in assets}
    unique.pop("", None)
    return [unique[mint] for mint in sorted(unique)]


def get_asset_record(asset: dict) -> dict:
    content = asset.get("content") or {}
    metadata = content.get("metadata") or {}
    files = content.get("files") if isinstance(content.get("files"), list) else []
    image_file = next(
        (entry for entry in files if str(entry.get("mime") or "").startswith("image/")),
        files[0] if files else {},
    )
    original_url = str(
        (content.get("links") or {}).get("image")
        or image_file.get("uri")
        or image_file.get("cdn_uri")
        or ""
    ).strip()
    asset_key_match = re.search(r"/(\d+)\.(?:png|jpe?g|webp)(?:\?|$)", original_url, re.I)
    if not asset_key_match:
        raise RuntimeError(f"Asset {asset.get('id')} has an unrecognized image URL")
    source_urls = []
    for candidate in (
        image_file.get("cdn_uri"),
        (content.get("links") or {}).get("image"),
        image_file.get("uri"),
    ):
        url = str(candidate or "").strip()
        if url.startswith("https://") and url not in source_urls:
            source_urls.append(url)
    if not source_urls:
        raise RuntimeError(f"Asset {asset.get('id')} has no HTTPS image")
    name = str(metadata.get("json_name") or metadata.get("name") or "Swag Pack sticker").strip()
    return {
        "mint": str(asset.get("id") or "").strip(),
        "name": name[:120] or "Swag Pack sticker",
        "assetKey": asset_key_match.group(1),
        "sourceUrls": source_urls,
    }


def border_background_color(rgb: np.ndarray) -> np.ndarray:
    height, width = rgb.shape[:2]
    inset = max(2, min(12, min(width, height) // 80))
    border = np.concatenate((
        rgb[:inset, :, :].reshape(-1, 3),
        rgb[-inset:, :, :].reshape(-1, 3),
        rgb[:, :inset, :].reshape(-1, 3),
        rgb[:, -inset:, :].reshape(-1, 3),
    ))
    return np.median(border, axis=0).astype(np.float32)


def remove_connected_light_background(image: Image.Image) -> Image.Image:
    source = np.asarray(ImageOps.exif_transpose(image).convert("RGB"), dtype=np.uint8)
    background = border_background_color(source)
    pixels = source.astype(np.float32)
    color_distance = np.sqrt(np.sum(np.square(pixels - background), axis=2))
    brightness = pixels.min(axis=2)

    # Only near-neutral light pixels can join the removable exterior. Connected
    # components keep enclosed white details inside the artwork opaque.
    candidate = ((color_distance <= 70.0) & (brightness >= 176.0)).astype(np.uint8)
    _, labels = cv2.connectedComponents(candidate, connectivity=8)
    border_labels = np.unique(np.concatenate((
        labels[0, :],
        labels[-1, :],
        labels[:, 0],
        labels[:, -1],
    )))
    border_labels = border_labels[border_labels != 0]
    exterior = np.isin(labels, border_labels)

    alpha = np.full(color_distance.shape, 255.0, dtype=np.float32)
    normalized = np.clip((color_distance - 4.0) / 46.0, 0.0, 1.0)
    feather = normalized * normalized * (3.0 - 2.0 * normalized)
    alpha[exterior] = feather[exterior] * 255.0

    # Remove the white matte from antialiased edge pixels to prevent pale halos
    # when stickers sit on dark binder covers.
    alpha_fraction = alpha / 255.0
    partial = exterior & (alpha_fraction > 0.015) & (alpha_fraction < 0.999)
    unmatte_divisor = np.maximum(alpha_fraction[..., None], 0.015)
    unmatted = (
        pixels - background.reshape(1, 1, 3) * (1.0 - alpha_fraction[..., None])
    ) / unmatte_divisor
    output_rgb = pixels.copy()
    output_rgb[partial] = np.clip(unmatted[partial], 0.0, 255.0)
    output_rgb[alpha <= 1.0] = 0.0

    rgba = np.dstack((output_rgb.astype(np.uint8), np.rint(alpha).astype(np.uint8)))
    result = trim_transparent_artwork(Image.fromarray(rgba))
    scale = min(1.0, MAX_EDGE / max(result.size))
    if scale < 1.0:
        result = result.resize(
            (max(1, round(result.width * scale)), max(1, round(result.height * scale))),
            Image.Resampling.LANCZOS,
        )
    return result


def trim_transparent_artwork(result: Image.Image) -> Image.Image:
    rgba = np.asarray(result.convert("RGBA"), dtype=np.uint8).copy()
    alpha = rgba[:, :, 3]
    foreground = (alpha >= 32).astype(np.uint8)
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(
        foreground,
        connectivity=8,
    )
    if count <= 1:
        raise RuntimeError("Background removal produced an empty image")
    component_areas = stats[1:, cv2.CC_STAT_AREA]
    largest_label = int(np.argmax(component_areas)) + 1
    largest_area = int(stats[largest_label, cv2.CC_STAT_AREA])
    height, width = alpha.shape
    major_labels = {largest_label}
    for label in range(1, count):
        if label == largest_label:
            continue
        x, y, component_width, component_height, area = stats[label]
        touches_border = (
            x == 0
            or y == 0
            or x + component_width >= width
            or y + component_height >= height
        )
        if not touches_border and area >= max(64, round(largest_area * 0.01)):
            major_labels.add(label)

    major_stats = stats[list(major_labels)]
    core_left = int(major_stats[:, cv2.CC_STAT_LEFT].min())
    core_top = int(major_stats[:, cv2.CC_STAT_TOP].min())
    core_right = int((major_stats[:, cv2.CC_STAT_LEFT] + major_stats[:, cv2.CC_STAT_WIDTH]).max())
    core_bottom = int((major_stats[:, cv2.CC_STAT_TOP] + major_stats[:, cv2.CC_STAT_HEIGHT]).max())
    vicinity_x = max(12, round((core_right - core_left) * 0.08))
    vicinity_y = max(12, round((core_bottom - core_top) * 0.08))
    keep_labels = set(major_labels)
    for label in range(1, count):
        if label in keep_labels:
            continue
        x, y, component_width, component_height, area = stats[label]
        touches_border = (
            x == 0
            or y == 0
            or x + component_width >= width
            or y + component_height >= height
        )
        center_x, center_y = centroids[label]
        if (
            not touches_border
            and area >= 24
            and core_left - vicinity_x <= center_x <= core_right + vicinity_x
            and core_top - vicinity_y <= center_y <= core_bottom + vicinity_y
        ):
            keep_labels.add(label)

    keep = np.isin(labels, list(keep_labels))
    rgba[~keep, :3] = 0
    rgba[~keep, 3] = 0
    result = Image.fromarray(rgba)
    alpha_image = result.getchannel("A")
    bounds = alpha_image.point(lambda value: 255 if value >= 8 else 0).getbbox()
    if not bounds:
        raise RuntimeError("Background removal produced an empty image")
    left, top, right, bottom = bounds
    padding = max(8, round(max(right - left, bottom - top) * 0.025))
    result = result.crop((
        max(0, left - padding),
        max(0, top - padding),
        min(result.width, right + padding),
        min(result.height, bottom + padding),
    ))
    return result


def process_asset(record: dict) -> dict:
    output_path = OUTPUT_DIR / f"{record['assetKey']}.webp"
    if output_path.exists():
        try:
            existing = Image.open(output_path).convert("RGBA")
            if existing.getchannel("A").getextrema()[0] == 0:
                if CLEAN_EXISTING_OUTPUTS:
                    existing = trim_transparent_artwork(existing)
                    existing.save(output_path, "WEBP", quality=92, method=6, exact=True)
                return {
                    **record,
                    "width": existing.width,
                    "height": existing.height,
                    "bytes": output_path.stat().st_size,
                }
        except Exception:
            pass
    for mint in record["mints"]:
        previous_path = OUTPUT_DIR / f"{mint}.webp"
        if not previous_path.exists():
            continue
        try:
            previous = Image.open(previous_path).convert("RGBA")
            if previous.getchannel("A").getextrema()[0] == 0:
                shutil.copyfile(previous_path, output_path)
                return {
                    **record,
                    "width": previous.width,
                    "height": previous.height,
                    "bytes": output_path.stat().st_size,
                }
        except Exception:
            continue
    source_bytes = None
    errors = []
    for source_url in record["sourceUrls"]:
        try:
            source_bytes = request_bytes(source_url)
            break
        except Exception as error:
            errors.append(error)
    if source_bytes is None:
        raise RuntimeError(f"Unable to download {record['mint']} from any image source") from errors[-1]
    source = Image.open(io.BytesIO(source_bytes))
    sticker = remove_connected_light_background(source)
    sticker.save(output_path, "WEBP", quality=92, method=6, exact=True)
    verified = Image.open(output_path).convert("RGBA")
    if verified.getchannel("A").getextrema()[0] != 0:
        raise RuntimeError(f"{record['mint']} did not retain a transparent exterior")
    return {
        **record,
        "width": sticker.width,
        "height": sticker.height,
        "bytes": output_path.stat().st_size,
    }


def write_manifest(records: list[dict]) -> None:
    lines = [
        "// Generated by scripts/sync-swag-pack-stickers.py. Do not edit by hand.",
        "export const SWAG_PACK_TRANSPARENT_STICKER_FILES = Object.freeze([",
    ]
    filenames = sorted(
        {f"{record['assetKey']}.webp" for record in records},
        key=lambda filename: int(filename.removesuffix(".webp")),
    )
    for filename in filenames:
        lines.append(f"  {json.dumps(filename)},")
    lines.extend(("]);", ""))
    MANIFEST_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    records = [get_asset_record(asset) for asset in get_collection_assets()]
    if not records:
        raise RuntimeError("Swag Pack collection returned no assets")
    designs: dict[str, dict] = {}
    design_key_by_name: dict[str, str] = {}
    for record in records:
        previous_key = design_key_by_name.get(record["name"])
        if previous_key and previous_key != record["assetKey"]:
            raise RuntimeError(
                f"Swag Pack name {record['name']} points to multiple source images"
            )
        design_key_by_name[record["name"]] = record["assetKey"]
        existing = designs.get(record["assetKey"])
        if existing:
            if record["name"] != existing["name"]:
                raise RuntimeError(
                    f"Swag Pack image {record['assetKey']} has conflicting display names"
                )
            existing["mints"].append(record["mint"])
            for source_url in record["sourceUrls"]:
                if source_url not in existing["sourceUrls"]:
                    existing["sourceUrls"].append(source_url)
        else:
            designs[record["assetKey"]] = {**record, "mints": [record["mint"]]}
    with concurrent.futures.ThreadPoolExecutor(max_workers=DOWNLOAD_WORKERS) as executor:
        processed = list(executor.map(process_asset, designs.values()))
    expected_files = {f"{record['assetKey']}.webp" for record in processed}
    for path in OUTPUT_DIR.glob("*.webp"):
        if path.name not in expected_files:
            path.unlink()
    write_manifest(records)
    for marker in OUTPUT_DIR.glob(".algorithm-v*"):
        if marker != ALGORITHM_MARKER:
            marker.unlink()
    ALGORITHM_MARKER.write_text("", encoding="utf-8")
    total_bytes = sum(record["bytes"] for record in processed)
    print(
        f"Built {len(processed)} unique transparent Swag Pack designs for "
        f"{len(records)} edition mints ({total_bytes / 1024 / 1024:.1f} MiB)."
    )


if __name__ == "__main__":
    main()
