#!/usr/bin/env python3
"""Render deterministic, standalone card animation clips without modifying the site."""

from __future__ import annotations

import argparse
import math
import random
import subprocess
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np


WIDTH = 2048
HEIGHT = 1024
FPS = 30
ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "rendered-clips"
FFMPEG = Path.home() / "Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
CARD_ASPECT = 700 / 990
CLEAR_CARD_IDS = (7, 28, 49, 73, 118, 166)
COLLECTION_IDS = ("cardnft1", "cardnft2", "poncho")
COLLECTION_WEIGHTS = (3.0, 3.0, 1.25)
ALTERNATING_COLLECTION_WEIGHTS = (3.0, 3.0, 0.65)
CLEAR_TURNTABLE_FRAMES = 16


def smoothstep(value: float) -> float:
    value = max(0.0, min(1.0, value))
    return value * value * (3.0 - 2.0 * value)


def scene_opacity(time_s: float, duration: float, edge: float = 0.32) -> float:
    return min(smoothstep(time_s / edge), smoothstep((duration - time_s) / edge))


def collect_card_assets() -> dict[str, list[Path]]:
    roots = {
        "cardnft1": ROOT / "assets/cards",
        "cardnft2": ROOT / "assets/cardnft2/cards",
        "poncho": ROOT / "assets/poncho/cards",
    }
    assets = {
        collection_id: sorted(asset_root.rglob("*.webp"))
        for collection_id, asset_root in roots.items()
    }
    if any(not collection_assets for collection_assets in assets.values()):
        raise RuntimeError("No card art was found under assets/*/cards.")
    return assets


def sample_biscuit_assets(
    assets: dict[str, list[Path]],
    count: int,
    rng: random.Random,
    exclude: set[Path] | None = None,
) -> list[Path]:
    selected: list[Path] = []
    used: set[Path] = set(exclude or ())
    while len(selected) < count:
        collection_id = rng.choices(COLLECTION_IDS, weights=COLLECTION_WEIGHTS, k=1)[0]
        candidate = rng.choice(assets[collection_id])
        if candidate in used:
            continue
        used.add(candidate)
        selected.append(candidate)
    return selected


def sample_alternating_biscuit_assets(
    assets: dict[str, list[Path]],
    count: int,
    rng: random.Random,
    exclude: set[Path] | None = None,
    previous_collection: str | None = None,
) -> tuple[list[Path], str]:
    """Sample a row-major deck with no matching adjacent collections."""
    selected: list[Path] = []
    used: set[Path] = set(exclude or ())
    last_collection = previous_collection
    while len(selected) < count:
        eligible = [collection_id for collection_id in COLLECTION_IDS if collection_id != last_collection]
        eligible_weights = [
            ALTERNATING_COLLECTION_WEIGHTS[COLLECTION_IDS.index(collection_id)]
            for collection_id in eligible
        ]
        collection_id = rng.choices(eligible, weights=eligible_weights, k=1)[0]
        candidate = rng.choice(assets[collection_id])
        if candidate in used:
            continue
        used.add(candidate)
        selected.append(candidate)
        last_collection = collection_id
    assert last_collection is not None
    return selected, last_collection


def prepare_clear_card_sprites() -> list[Path]:
    model_dir = OUTPUT_DIR / "clear-model-cache"
    sprite_dir = OUTPUT_DIR / "clear-card-three-sprites"
    model_dir.mkdir(parents=True, exist_ok=True)
    sprite_dir.mkdir(parents=True, exist_ok=True)
    for card_id in CLEAR_CARD_IDS:
        target = model_dir / f"clear-card-{card_id}.glb"
        if target.exists():
            continue
        url = f"https://cdn.lil.org/nft/clear_cards/cards/{card_id}.glb"
        print(f"Downloading Clear Card model {card_id}", flush=True)
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Card Clip Renderer"})
        with urllib.request.urlopen(request) as response, target.open("wb") as output:
            output.write(response.read())
    expected = [sprite_dir / f"clear-card-{card_id}.png" for card_id in CLEAR_CARD_IDS]
    missing = [path for path in expected if not path.exists()]
    if missing:
        raise RuntimeError(
            "Missing Three.js Clear Card sprites. Render them with "
            "rendered-clips/clear-renderer/ and normalize the captures with "
            "scripts/normalize-clear-card-captures.py."
        )
    return expected


def prepare_clear_card_turntables(clear_assets: list[Path]) -> dict[Path, tuple[Path, ...]]:
    turntable_dir = OUTPUT_DIR / "clear-card-three-turntables"
    turntables: dict[Path, tuple[Path, ...]] = {}
    for clear_asset, card_id in zip(clear_assets, CLEAR_CARD_IDS):
        frames = tuple(
            turntable_dir / f"clear-card-{card_id}" / f"frame-{frame_index:02d}.png"
            for frame_index in range(CLEAR_TURNTABLE_FRAMES)
        )
        missing = [frame for frame in frames if not frame.exists()]
        if missing:
            raise RuntimeError(
                "Missing Three.js Clear Card turntable frames. Capture the atlas renderer "
                "with ?atlas=1 and split it with scripts/split-clear-card-atlases.py."
            )
        turntables[clear_asset] = frames
    return turntables


def collect_back_assets() -> list[Path]:
    assets = [
        ROOT / "cardnft back.png",
        *sorted((ROOT / "assets/cardnft2/backs").glob("*.webp")),
        ROOT / "assets/poncho/backs/poncho-pack.webp",
    ]
    assets = [path for path in assets if path.exists()]
    if not assets:
        raise RuntimeError("No card-back art was found under assets/*/backs.")
    return assets


class CardImageCache:
    def __init__(self) -> None:
        self.originals: dict[Path, np.ndarray] = {}
        self.resized: dict[tuple[Path, int, int], np.ndarray] = {}

    def original(self, path: Path) -> np.ndarray:
        cached = self.originals.get(path)
        if cached is not None:
            return cached
        image = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
        if image is None:
            raise RuntimeError(f"Unable to read {path}")
        if image.ndim == 2:
            image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGBA)
        elif image.shape[2] == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGBA)
        else:
            image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGBA)
        self.originals[path] = image
        return image

    def sized(self, path: Path, width: int, height: int) -> np.ndarray:
        key = (path, width, height)
        cached = self.resized.get(key)
        if cached is not None:
            return cached
        image = cv2.resize(
            self.original(path),
            (max(1, width), max(1, height)),
            interpolation=cv2.INTER_AREA,
        )
        self.resized[key] = image
        return image


def make_background(colors: tuple[tuple[int, int, int], tuple[int, int, int]], glow: tuple[int, int, int]) -> np.ndarray:
    top = np.array(colors[0], dtype=np.float32)
    bottom = np.array(colors[1], dtype=np.float32)
    y = np.linspace(0.0, 1.0, HEIGHT, dtype=np.float32)[:, None, None]
    background = top[None, None, :] * (1.0 - y) + bottom[None, None, :] * y
    background = np.repeat(background, WIDTH, axis=1)

    yy, xx = np.mgrid[0:HEIGHT, 0:WIDTH]
    distance = ((xx - WIDTH * 0.5) / (WIDTH * 0.72)) ** 2 + ((yy - HEIGHT * 0.42) / (HEIGHT * 0.78)) ** 2
    light = np.exp(-distance * 2.1)[..., None] * np.array(glow, dtype=np.float32)[None, None, :] * 0.23
    vignette = np.clip(1.0 - np.maximum(distance - 0.18, 0.0) * 0.3, 0.7, 1.0)[..., None]
    return np.clip((background + light) * vignette, 0, 255).astype(np.uint8)


def transform_card(image: np.ndarray, flip_scale: float, angle_deg: float, opacity: float) -> np.ndarray:
    squeezed_width = max(2, int(round(image.shape[1] * max(0.012, abs(flip_scale)))))
    squeezed = cv2.resize(image, (squeezed_width, image.shape[0]), interpolation=cv2.INTER_LINEAR)
    center = (squeezed_width / 2, image.shape[0] / 2)
    matrix = cv2.getRotationMatrix2D(center, angle_deg, 1.0)
    cosine = abs(matrix[0, 0])
    sine = abs(matrix[0, 1])
    out_width = max(2, int(image.shape[0] * sine + squeezed_width * cosine))
    out_height = max(2, int(image.shape[0] * cosine + squeezed_width * sine))
    matrix[0, 2] += out_width / 2 - center[0]
    matrix[1, 2] += out_height / 2 - center[1]
    transformed = cv2.warpAffine(
        squeezed,
        matrix,
        (out_width, out_height),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=(0, 0, 0, 0),
    )
    transformed[:, :, 3] = np.clip(transformed[:, :, 3].astype(np.float32) * opacity, 0, 255).astype(np.uint8)
    return transformed


def alpha_blend(canvas: np.ndarray, sprite: np.ndarray, center_x: float, center_y: float, shadow: bool = True) -> None:
    left = int(round(center_x - sprite.shape[1] / 2))
    top = int(round(center_y - sprite.shape[0] / 2))

    def blend_layer(layer: np.ndarray, layer_left: int, layer_top: int, rgb_override: np.ndarray | None = None) -> None:
        x0 = max(0, layer_left)
        y0 = max(0, layer_top)
        x1 = min(WIDTH, layer_left + layer.shape[1])
        y1 = min(HEIGHT, layer_top + layer.shape[0])
        if x0 >= x1 or y0 >= y1:
            return
        sx0, sy0 = x0 - layer_left, y0 - layer_top
        sx1, sy1 = sx0 + x1 - x0, sy0 + y1 - y0
        source = layer[sy0:sy1, sx0:sx1]
        alpha = source[:, :, 3:4].astype(np.float32) / 255.0
        source_rgb = source[:, :, :3].astype(np.float32) if rgb_override is None else rgb_override
        destination = canvas[y0:y1, x0:x1].astype(np.float32)
        canvas[y0:y1, x0:x1] = np.clip(source_rgb * alpha + destination * (1.0 - alpha), 0, 255).astype(np.uint8)

    if shadow:
        shadow_layer = sprite.copy()
        shadow_layer[:, :, 3] = (shadow_layer[:, :, 3].astype(np.float32) * 0.34).astype(np.uint8)
        shadow_rgb = np.zeros((1, 1, 3), dtype=np.float32)
        blend_layer(shadow_layer, left + 9, top + 13, shadow_rgb)
    blend_layer(sprite, left, top)


class VideoWriter:
    def __init__(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        command = [
            str(FFMPEG), "-hide_banner", "-loglevel", "error", "-y",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s:v", f"{WIDTH}x{HEIGHT}",
            "-r", str(FPS), "-i", "-", "-an", "-c:v", "libx264",
            "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", str(path),
        ]
        self.process = subprocess.Popen(command, stdin=subprocess.PIPE)
        self.path = path

    def write(self, frame: np.ndarray) -> None:
        assert self.process.stdin is not None
        self.process.stdin.write(np.ascontiguousarray(frame).tobytes())

    def close(self) -> None:
        assert self.process.stdin is not None
        self.process.stdin.close()
        return_code = self.process.wait()
        if return_code:
            raise RuntimeError(f"FFmpeg failed with exit code {return_code}: {self.path}")


@dataclass
class RainCard:
    front: Path
    back: Path
    center_x: float
    cycle_offset: float
    travel_seconds: float
    height: int
    angle: float
    rotation_speed_deg: float
    show_back: bool
    clear_frames: tuple[Path, ...] | None
    model_spin_phase: float
    model_spin_speed: float


def build_rain_cards(
    seed: int,
    count: int,
    front_assets: dict[str, list[Path]],
    back_assets: list[Path],
    clear_assets: list[Path],
    clear_turntables: dict[Path, tuple[Path, ...]],
    style: int,
) -> list[RainCard]:
    rng = random.Random(seed)
    selected = sample_biscuit_assets(front_assets, count, rng)
    if style == 3 and clear_assets:
        clear_slots = list(range(2, count, max(4, count // len(clear_assets))))[:len(clear_assets)]
        for slot, clear_asset in zip(clear_slots, clear_assets):
            selected[slot] = clear_asset
    cards: list[RainCard] = []
    for index, front in enumerate(selected):
        depth = rng.random()
        if style == 1:
            height = int(210 + depth * 120)
            travel = rng.uniform(8.05, 8.35)
        elif style == 2:
            height = int(175 + depth * 150)
            travel = rng.uniform(5.8, 7.8)
        else:
            height = int(145 + depth * 145)
            travel = rng.uniform(4.7, 7.0)
        margin = height * CARD_ASPECT * 0.65
        if style == 1:
            lane_count = 8
            lane = (index * 3) % lane_count
            lane_width = WIDTH / lane_count
            base_x = (lane + 0.5) * lane_width + rng.uniform(-lane_width * 0.13, lane_width * 0.13)
            base_x = max(margin, min(WIDTH - margin, base_x))
            cycle_jitter = rng.uniform(-0.008, 0.008)
            rotation_speed = rng.choice((-1, 1)) * rng.uniform(0.45, 1.25)
        else:
            base_x = rng.uniform(margin, WIDTH - margin)
            cycle_jitter = rng.uniform(-0.025, 0.025)
            rotation_speed = rng.choice((-1, 1)) * rng.uniform(0.7, 2.0)
        clear_frames = clear_turntables.get(front)
        cards.append(RainCard(
            front=front,
            back=front if front in clear_assets else rng.choice(back_assets),
            center_x=base_x,
            cycle_offset=(index / count + cycle_jitter) % 1.0,
            travel_seconds=travel,
            height=height,
            angle=rng.uniform(-20, 20),
            rotation_speed_deg=rotation_speed,
            show_back=clear_frames is None and rng.random() > 0.9,
            clear_frames=clear_frames,
            model_spin_phase=rng.random(),
            model_spin_speed=rng.choice((-1, 1)) / rng.uniform(18.0, 28.0),
        ))
    return sorted(cards, key=lambda card: card.height)


def render_rain_clip(
    style: int,
    front_assets: dict[str, list[Path]],
    back_assets: list[Path],
    clear_assets: list[Path],
    clear_turntables: dict[Path, tuple[Path, ...]],
    cache: CardImageCache,
) -> Path:
    duration = 45.0
    counts = {1: 16, 2: 28, 3: 34}
    cards = build_rain_cards(
        9100 + style,
        counts[style],
        front_assets,
        back_assets,
        clear_assets,
        clear_turntables,
        style,
    )
    background = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    output = OUTPUT_DIR / f"card-rain-{style:02d}.mp4"
    writer = VideoWriter(output)
    frame_count = int(duration * FPS)
    for frame_index in range(frame_count):
        time_s = frame_index / FPS
        frame = background.copy()
        overall_alpha = scene_opacity(time_s, duration)
        for card in cards:
            progress = (card.cycle_offset + time_s / card.travel_seconds) % 1.0
            y = -card.height * 0.7 + progress * (HEIGHT + card.height * 1.4)
            x = card.center_x
            if card.clear_frames:
                turn = (card.model_spin_phase + time_s * card.model_spin_speed) % 1.0
                frame_position = turn * len(card.clear_frames)
                turntable_frame_index = int(frame_position) % len(card.clear_frames)
                next_frame_index = (turntable_frame_index + 1) % len(card.clear_frames)
                frame_blend = frame_position - math.floor(frame_position)
                width = int(card.height * CARD_ASPECT)
                current_image = cache.sized(card.clear_frames[turntable_frame_index], width, card.height)
                next_image = cache.sized(card.clear_frames[next_frame_index], width, card.height)
                image = cv2.addWeighted(current_image, 1.0 - frame_blend, next_image, frame_blend, 0)
            else:
                path = card.back if card.show_back else card.front
                width = int(card.height * CARD_ASPECT)
                image = cache.sized(path, width, card.height)
            angle = card.angle + time_s * card.rotation_speed_deg
            sprite = transform_card(image, 1.0, angle, overall_alpha)
            alpha_blend(frame, sprite, x, y, shadow=True)
        writer.write(frame)
        if frame_index % FPS == 0:
            print(f"{output.name}: {frame_index // FPS + 1}/{int(duration)}s", flush=True)
    writer.close()
    return output


def grid_layout(columns: int, rows: int, card_height: int, gap_x: int, gap_y: int) -> list[tuple[float, float]]:
    card_width = int(round(card_height * CARD_ASPECT))
    total_width = columns * card_width + (columns - 1) * gap_x
    total_height = rows * card_height + (rows - 1) * gap_y
    left = (WIDTH - total_width) / 2 + card_width / 2
    top = (HEIGHT - total_height) / 2 + card_height / 2
    return [
        (left + column * (card_width + gap_x), top + row * (card_height + gap_y))
        for row in range(rows)
        for column in range(columns)
    ]


def render_grid_clip(
    style: int,
    front_assets: dict[str, list[Path]],
    clear_assets: list[Path],
    cache: CardImageCache,
) -> Path:
    duration = 45.0
    layouts = {
        1: (9, 3, 300, 13, 18),
        2: (10, 4, 225, 47, 18),
        3: (8, 3, 310, 38, 24),
    }
    columns, rows, card_height, gap_x, gap_y = layouts[style]
    positions = grid_layout(columns, rows, card_height, gap_x, gap_y)
    rng = random.Random(13300 + style)
    background = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    output = OUTPUT_DIR / f"card-grid-{style:02d}.mp4"
    writer = VideoWriter(output)
    frame_count = int(duration * FPS)
    stagger = min(0.045, 1.15 / max(1, len(positions) - 1))
    cycle_duration = 5.625
    enter_start = 0.0
    enter_duration = 0.42
    exit_start = 3.95
    exit_duration = 0.42
    card_width = int(round(card_height * CARD_ASPECT))
    cycle_count = math.ceil(duration / cycle_duration)
    cycle_entries: list[list[tuple[np.ndarray, bool]]] = []
    previous_cards: set[Path] = set()
    previous_collection: str | None = None
    for cycle_index in range(cycle_count):
        if style == 1:
            cards, previous_collection = sample_alternating_biscuit_assets(
                front_assets,
                len(positions),
                rng,
                exclude=previous_cards,
                previous_collection=previous_collection,
            )
        else:
            cards = sample_biscuit_assets(front_assets, len(positions), rng, exclude=previous_cards)
        previous_cards = set(cards)
        if style == 3 and clear_assets:
            clear_order = list(clear_assets)
            rng.shuffle(clear_order)
            clear_slots = rng.sample(range(len(cards)), min(len(clear_order), len(cards)))
            for slot, clear_asset in zip(clear_slots, clear_order):
                cards[slot] = clear_asset
        cycle_entries.append([
            (cache.sized(path, card_width, card_height), path in clear_assets)
            for path in cards
        ])

    for frame_index in range(frame_count):
        time_s = frame_index / FPS
        cycle_time = time_s % cycle_duration
        cycle_index = min(int(time_s / cycle_duration), cycle_count - 1)
        base_entries = cycle_entries[cycle_index]
        frame = background.copy()
        for index, ((x, y), (image, is_clear)) in enumerate(zip(positions, base_entries)):
            enter = smoothstep((cycle_time - enter_start - index * stagger) / enter_duration)
            exit_progress = smoothstep((cycle_time - exit_start - index * stagger) / exit_duration)
            opacity = enter * (1.0 - exit_progress)
            if opacity <= 0.002:
                continue
            enter_flip = math.sin(enter * math.pi / 2)
            exit_flip = math.cos(exit_progress * math.pi / 2)
            flip_scale = max(0.012, enter_flip * exit_flip)
            direction = -1 if (index + style) % 2 else 1
            angle = 0.0 if is_clear else direction * (1.0 - enter) * 4.5 + direction * exit_progress * 4.5
            x_offset = 0.0 if is_clear else direction * ((1.0 - enter) - exit_progress) * 18
            sprite = transform_card(image, flip_scale, angle, opacity)
            alpha_blend(frame, sprite, x + x_offset, y, shadow=True)
        writer.write(frame)
        if frame_index % FPS == 0:
            print(f"{output.name}: {frame_index // FPS + 1}/{int(duration)}s", flush=True)
    writer.close()
    return output


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--clips",
        nargs="*",
        default=["rain-1", "rain-2", "rain-3", "grid-1", "grid-2", "grid-3"],
        help="Subset to render (for example: rain-1 grid-2).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not FFMPEG.exists():
        raise RuntimeError(f"Bundled FFmpeg not found at {FFMPEG}")
    front_assets = collect_card_assets()
    back_assets = collect_back_assets()
    needs_clear = "rain-3" in args.clips or "grid-3" in args.clips
    clear_assets = prepare_clear_card_sprites() if needs_clear else []
    clear_turntables = (
        prepare_clear_card_turntables(clear_assets)
        if "rain-3" in args.clips
        else {}
    )
    cache = CardImageCache()
    outputs: list[Path] = []
    for clip in args.clips:
        kind, raw_style = clip.split("-", 1)
        style = int(raw_style)
        if style not in (1, 2, 3):
            raise ValueError(f"Unknown clip style: {clip}")
        if kind == "rain":
            outputs.append(render_rain_clip(
                style,
                front_assets,
                back_assets,
                clear_assets,
                clear_turntables,
                cache,
            ))
        elif kind == "grid":
            outputs.append(render_grid_clip(style, front_assets, clear_assets, cache))
        else:
            raise ValueError(f"Unknown clip kind: {kind}")
    print("Rendered:")
    for output in outputs:
        print(output)


if __name__ == "__main__":
    main()
