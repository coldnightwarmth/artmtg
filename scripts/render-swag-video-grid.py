#!/usr/bin/env python3
"""Render a hard-cut grid of Little Swag Boxes opened-figure MP4s."""

from __future__ import annotations

import json
import random
import subprocess
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "rendered-clips"
CACHE_DIR = OUTPUT_DIR / "little-swag-video-cache"
CELL_DIR = OUTPUT_DIR / "little-swag-grid-cells"
OUTPUT = OUTPUT_DIR / "little-swag-opened-grid.mp4"
SCHEDULE_OUTPUT = OUTPUT_DIR / "little-swag-grid-schedule.json"
FFMPEG = Path.home() / "Library/Python/3.9/lib/python/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1"
WIDTH = 2048
HEIGHT = 1024
FPS = 30
DURATION = 45.0
COLUMNS = 6
ROWS = 3
CELL_SIZE = 341
SOURCE_COUNT = 333
INITIAL_HOLD_SECONDS = 10.0
MINIMUM_EVENT_INTERVAL = 0.32
MAXIMUM_EVENT_INTERVAL = 0.52
BLANKING_START_SECONDS = 35.0
FULL_WHITE_START_SECONDS = 38.0
FULL_WHITE_END_SECONDS = 40.0
RETURN_END_SECONDS = 43.0


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def prepare_source_videos() -> list[Path]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    rng = random.Random(20260813)
    ids = list(range(1, SOURCE_COUNT + 1))
    rng.shuffle(ids)

    def download(figure_id: int) -> Path:
        target = CACHE_DIR / f"figure-{figure_id:03d}.mp4"
        if target.exists() and target.stat().st_size > 100_000:
            return target
        url = f"https://cdn.lil.org/nft/little_swag_boxes/figures/{figure_id}.mp4"
        request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Swag Grid Renderer"})
        with urllib.request.urlopen(request) as response, target.open("wb") as output:
            output.write(response.read())
        return target

    missing = [
        figure_id for figure_id in ids
        if not (CACHE_DIR / f"figure-{figure_id:03d}.mp4").exists()
        or (CACHE_DIR / f"figure-{figure_id:03d}.mp4").stat().st_size <= 100_000
    ]
    if missing:
        print(f"Downloading {len(missing)} additional Little Swag figure videos", flush=True)
        completed = 0
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(download, figure_id): figure_id for figure_id in missing}
            for future in as_completed(futures):
                future.result()
                completed += 1
                if completed % 20 == 0 or completed == len(missing):
                    print(f"Downloaded {completed}/{len(missing)}", flush=True)
    return [CACHE_DIR / f"figure-{figure_id:03d}.mp4" for figure_id in ids]


def build_global_schedule(sources: list[Path]) -> list[list[tuple[Path, float, float]]]:
    rng = random.Random(773190)
    source_deck = list(sources)
    rng.shuffle(source_deck)
    source_cursor = 0

    def draw_source(active: set[Path]) -> Path:
        nonlocal source_cursor, source_deck
        for _ in range(len(source_deck) * 2):
            if source_cursor >= len(source_deck):
                rng.shuffle(source_deck)
                source_cursor = 0
            candidate = source_deck[source_cursor]
            source_cursor += 1
            if candidate not in active:
                return candidate
        raise RuntimeError("Could not find a source unique from the active grid")

    active_sources: list[Path] = []
    active_set: set[Path] = set()
    cell_deck: list[int] = []
    last_switched_cell = -1
    changes: list[list[tuple[float, Path]]] = [[] for _ in range(COLUMNS * ROWS)]
    for cell_index in range(COLUMNS * ROWS):
        source = draw_source(active_set)
        active_sources.append(source)
        active_set.add(source)
        changes[cell_index].append((0.0, source))

    event_time = INITIAL_HOLD_SECONDS
    while event_time < DURATION - 0.75:
        if not cell_deck:
            cell_deck = list(range(COLUMNS * ROWS))
            rng.shuffle(cell_deck)
            if cell_deck[-1] == last_switched_cell:
                cell_deck[0], cell_deck[-1] = cell_deck[-1], cell_deck[0]
        cell_index = cell_deck.pop()
        active_set.remove(active_sources[cell_index])
        source = draw_source(active_set)
        active_sources[cell_index] = source
        active_set.add(source)
        changes[cell_index].append((event_time, source))
        last_switched_cell = cell_index
        if len(active_set) != COLUMNS * ROWS:
            raise RuntimeError(f"Duplicate active source at {event_time:.3f}s")
        event_time += rng.uniform(MINIMUM_EVENT_INTERVAL, MAXIMUM_EVENT_INTERVAL)

    schedules: list[list[tuple[Path, float, float]]] = []
    for cell_changes in changes:
        segments: list[tuple[Path, float, float]] = []
        for index, (start, source) in enumerate(cell_changes):
            end = cell_changes[index + 1][0] if index + 1 < len(cell_changes) else DURATION
            segments.append((source, start, end - start))
        schedules.append(segments)
    validate_schedules(schedules)
    return schedules


def validate_schedules(schedules: list[list[tuple[Path, float, float]]]) -> None:
    boundaries = sorted({
        start
        for segments in schedules
        for _, start, _ in segments
    } | {DURATION})
    for start, end in zip(boundaries, boundaries[1:]):
        sample_time = (start + end) / 2
        visible = []
        for segments in schedules:
            source = next(
                source
                for source, segment_start, duration in segments
                if segment_start <= sample_time < segment_start + duration
            )
            visible.append(source)
        if len(set(visible)) != len(visible):
            raise RuntimeError(f"Duplicate source visible at {sample_time:.3f}s")


def build_blank_schedule() -> list[tuple[float, float]]:
    rng = random.Random(880531)
    cell_count = COLUMNS * ROWS

    def randomized_times(start: float, end: float) -> list[float]:
        interval = (end - start) / (cell_count - 1)
        return [
            start if index == 0 else end if index == cell_count - 1 else (
                start + interval * index + rng.uniform(-interval * 0.22, interval * 0.22)
            )
            for index in range(cell_count)
        ]

    blank_order = list(range(cell_count))
    return_order = list(range(cell_count))
    rng.shuffle(blank_order)
    rng.shuffle(return_order)
    blank_times = randomized_times(BLANKING_START_SECONDS, FULL_WHITE_START_SECONDS)
    return_times = randomized_times(FULL_WHITE_END_SECONDS, RETURN_END_SECONDS)
    blank_by_cell = {cell_index: blank_times[index] for index, cell_index in enumerate(blank_order)}
    return_by_cell = {cell_index: return_times[index] for index, cell_index in enumerate(return_order)}
    return [(blank_by_cell[index], return_by_cell[index]) for index in range(cell_count)]


def write_schedule(
    schedules: list[list[tuple[Path, float, float]]],
    blank_schedule: list[tuple[float, float]],
) -> None:
    payload = {
        "duration_seconds": DURATION,
        "initial_hold_seconds": INITIAL_HOLD_SECONDS,
        "white_transition": {
            "blanking_starts_seconds": BLANKING_START_SECONDS,
            "full_white_starts_seconds": FULL_WHITE_START_SECONDS,
            "full_white_ends_seconds": FULL_WHITE_END_SECONDS,
            "returns_complete_seconds": RETURN_END_SECONDS,
            "cells": [
                {
                    "cell": index,
                    "blank_at_seconds": round(blank_at, 4),
                    "return_at_seconds": round(return_at, 4),
                }
                for index, (blank_at, return_at) in enumerate(blank_schedule)
            ],
        },
        "cells": [
            [
                {
                    "source": source.name,
                    "start_seconds": round(start, 4),
                    "duration_seconds": round(duration, 4),
                }
                for source, start, duration in segments
            ]
            for segments in schedules
        ],
    }
    SCHEDULE_OUTPUT.write_text(json.dumps(payload, indent=2) + "\n")


def build_cell_timeline(cell_index: int, segments: list[tuple[Path, float, float]]) -> Path:
    CELL_DIR.mkdir(parents=True, exist_ok=True)
    target = CELL_DIR / f"cell-{cell_index:02d}.mp4"
    rng = random.Random(44000 + cell_index)

    command = [str(FFMPEG), "-hide_banner", "-loglevel", "error", "-y"]
    for segment_index, (source, _, duration) in enumerate(segments):
        source_start = 0.0 if segment_index == 0 else rng.uniform(0.0, 4.25)
        command.extend([
            "-stream_loop", "-1", "-ss", f"{source_start:.4f}",
            "-t", f"{duration:.4f}", "-i", str(source),
        ])

    filter_parts: list[str] = []
    labels: list[str] = []
    for index in range(len(segments)):
        label = f"v{index}"
        labels.append(f"[{label}]")
        filter_parts.append(
            f"[{index}:v]fps={FPS},scale={CELL_SIZE}:{CELL_SIZE}:force_original_aspect_ratio=increase,"
            f"crop={CELL_SIZE}:{CELL_SIZE},setsar=1,setpts=PTS-STARTPTS[{label}]"
        )
    filter_parts.append(f"{''.join(labels)}concat=n={len(labels)}:v=1:a=0[out]")
    command.extend([
        "-filter_complex", ";".join(filter_parts), "-map", "[out]",
        "-t", f"{DURATION:.3f}", "-r", str(FPS), "-frames:v", str(round(DURATION * FPS)),
        "-an", "-c:v", "libx264", "-preset", "veryfast",
        "-crf", "19", "-pix_fmt", "yuv420p", str(target),
    ])
    print(f"Rendering grid cell {cell_index + 1}/{COLUMNS * ROWS}", flush=True)
    run(command)
    return target


def assemble_grid(cells: list[Path], blank_schedule: list[tuple[float, float]]) -> Path:
    command = [str(FFMPEG), "-hide_banner", "-loglevel", "error", "-y"]
    for cell in cells:
        command.extend(["-i", str(cell)])
    labels = "".join(f"[{index}:v]" for index in range(len(cells)))
    layout = "|".join(
        f"{column * CELL_SIZE}_{row * CELL_SIZE}"
        for row in range(ROWS)
        for column in range(COLUMNS)
    )
    filter_parts = [
        f"{labels}xstack=inputs={len(cells)}:layout={layout}:fill=black[grid]",
        f"[grid]pad={WIDTH}:{HEIGHT}:1:0:black[padded]",
    ]
    previous_label = "padded"
    for cell_index, (blank_at, return_at) in enumerate(blank_schedule):
        column = cell_index % COLUMNS
        row = cell_index // COLUMNS
        output_label = f"blank{cell_index}"
        filter_parts.append(
            f"[{previous_label}]drawbox=x={1 + column * CELL_SIZE}:y={row * CELL_SIZE}:"
            f"w={CELL_SIZE}:h={CELL_SIZE}:color=white:t=fill:"
            f"enable='gte(t,{blank_at:.4f})*lt(t,{return_at:.4f})'[{output_label}]"
        )
        previous_label = output_label
    filter_parts.extend([
        f"[{previous_label}]drawbox=x=0:y=0:w={WIDTH}:h={HEIGHT}:color=white:t=fill:"
        f"enable='gte(t,{FULL_WHITE_START_SECONDS:.4f})*lt(t,{FULL_WHITE_END_SECONDS:.4f})'[whiteout]",
        "[whiteout]lutyuv=y='(val-16)*255/219':u='(val-128)*255/224+128':"
        "v='(val-128)*255/224+128',format=yuv420p,setparams=range=full[out]",
    ])
    filter_graph = ";".join(filter_parts)
    command.extend([
        "-filter_complex", filter_graph, "-map", "[out]", "-t", f"{DURATION:.3f}",
        "-r", str(FPS), "-frames:v", str(round(DURATION * FPS)),
        "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-pix_fmt", "yuv420p", "-color_range", "pc", "-color_primaries", "bt709",
        "-color_trc", "bt709", "-colorspace", "bt709", "-x264-params", "fullrange=on",
        "-movflags", "+faststart", str(OUTPUT),
    ])
    print("Assembling the 6x3 Little Swag video grid", flush=True)
    run(command)
    return OUTPUT


def main() -> None:
    if not FFMPEG.exists():
        raise RuntimeError(f"Bundled FFmpeg not found at {FFMPEG}")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    sources = prepare_source_videos()
    schedules = build_global_schedule(sources)
    blank_schedule = build_blank_schedule()
    write_schedule(schedules, blank_schedule)
    unique_sources = {source for segments in schedules for source, _, _ in segments}
    print(
        f"Scheduled {len(unique_sources)} unique videos with no simultaneous duplicates; "
        f"holding the opening grid for {INITIAL_HOLD_SECONDS:.0f}s and switching one cell at a time",
        flush=True,
    )
    cells = [build_cell_timeline(index, schedules[index]) for index in range(COLUMNS * ROWS)]
    output = assemble_grid(cells, blank_schedule)
    print(f"Rendered: {output}")


if __name__ == "__main__":
    main()
