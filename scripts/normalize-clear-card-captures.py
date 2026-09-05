#!/usr/bin/env python3
"""Crop browser-rendered Clear Cards to a consistent upright card frame."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np


WIDTH = 700
HEIGHT = 990
OUTER_MARGIN = 16


def normalize(source: Path, destination: Path) -> None:
    image = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if image is None:
        raise RuntimeError(f"Unable to read {source}")
    visible = np.max(image, axis=2) > 2
    ys, xs = np.where(visible)
    if not len(xs):
        raise RuntimeError(f"No rendered card pixels found in {source}")

    left, right = max(0, int(xs.min()) - 2), min(image.shape[1], int(xs.max()) + 3)
    top, bottom = max(0, int(ys.min()) - 2), min(image.shape[0], int(ys.max()) + 3)
    crop = image[top:bottom, left:right]
    scale = min(
        (WIDTH - OUTER_MARGIN * 2) / crop.shape[1],
        (HEIGHT - OUTER_MARGIN * 2) / crop.shape[0],
    )
    resized = cv2.resize(
        crop,
        (max(1, round(crop.shape[1] * scale)), max(1, round(crop.shape[0] * scale))),
        interpolation=cv2.INTER_LANCZOS4,
    )
    framed = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
    x = (WIDTH - resized.shape[1]) // 2
    y = (HEIGHT - resized.shape[0]) // 2
    framed[y:y + resized.shape[0], x:x + resized.shape[1]] = resized
    alpha = np.where(np.max(framed, axis=2) > 0, 255, 0).astype(np.uint8)
    framed_rgba = np.dstack((framed, alpha))
    destination.parent.mkdir(parents=True, exist_ok=True)
    if not cv2.imwrite(str(destination), framed_rgba):
        raise RuntimeError(f"Unable to write {destination}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_dir", type=Path)
    parser.add_argument("output_dir", type=Path)
    args = parser.parse_args()
    for source in sorted(args.source_dir.glob("clear-card-*.png")):
        destination = args.output_dir / source.name
        normalize(source, destination)
        print(destination)


if __name__ == "__main__":
    main()
