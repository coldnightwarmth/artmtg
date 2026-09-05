#!/usr/bin/env python3
"""Split Clear Card turntable atlases into alpha-preserving frame sequences."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

import cv2
import numpy as np


COLUMNS = 4
ROWS = 4
FRAME_WIDTH = 200
FRAME_HEIGHT = 283


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()

    for atlas_path in sorted(args.source_dir.glob("clear-card-*.png")):
        match = re.search(r"clear-card-(\d+)", atlas_path.stem)
        if not match:
            continue
        card_id = match.group(1)
        atlas = cv2.imread(str(atlas_path), cv2.IMREAD_COLOR)
        if atlas is None:
            raise RuntimeError(f"Unable to read {atlas_path}")
        expected_size = (FRAME_WIDTH * COLUMNS, FRAME_HEIGHT * ROWS)
        if (atlas.shape[1], atlas.shape[0]) != expected_size:
            raise RuntimeError(
                f"Unexpected atlas size for {atlas_path}: "
                f"{atlas.shape[1]}x{atlas.shape[0]} (expected {expected_size[0]}x{expected_size[1]})"
            )

        frame_dir = args.output_dir / f"clear-card-{card_id}"
        frame_dir.mkdir(parents=True, exist_ok=True)
        for frame_index in range(COLUMNS * ROWS):
            column = frame_index % COLUMNS
            row = frame_index // COLUMNS
            frame = atlas[
                row * FRAME_HEIGHT:(row + 1) * FRAME_HEIGHT,
                column * FRAME_WIDTH:(column + 1) * FRAME_WIDTH,
            ]
            alpha = np.where(np.max(frame, axis=2) > 4, 255, 0).astype(np.uint8)
            frame_rgba = np.dstack((frame, alpha))
            output_path = frame_dir / f"frame-{frame_index:02d}.png"
            if not cv2.imwrite(str(output_path), frame_rgba):
                raise RuntimeError(f"Unable to write {output_path}")
            print(output_path)


if __name__ == "__main__":
    main()
