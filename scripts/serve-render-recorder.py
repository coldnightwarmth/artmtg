#!/usr/bin/env python3
"""Serve the workspace and accept same-origin MediaRecorder uploads."""

from __future__ import annotations

import argparse
import http.server
import os
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "rendered-clips" / "raw-recordings"


class RecorderHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        super().end_headers()

    def do_POST(self) -> None:
        parsed = urlparse(self.path)
        if parsed.path != "/__save_recording":
            self.send_error(404)
            return
        name = os.path.basename(parse_qs(parsed.query).get("name", [""])[0])
        if Path(name).suffix not in {".webm", ".ivf", ".h264"}:
            self.send_error(400, "Expected a .webm, .ivf, or .h264 output name")
            return
        length = int(self.headers.get("Content-Length", "0"))
        if length <= 0:
            self.send_error(400, "Empty recording")
            return
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        destination = OUTPUT_DIR / name
        remaining = length
        with destination.open("wb") as output:
            while remaining:
                chunk = self.rfile.read(min(1024 * 1024, remaining))
                if not chunk:
                    break
                output.write(chunk)
                remaining -= len(chunk)
        if remaining:
            self.send_error(400, "Incomplete recording")
            return
        payload = destination.name.encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4174)
    args = parser.parse_args()
    os.chdir(ROOT)
    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), RecorderHandler)
    print(f"Recorder server listening at http://localhost:{args.port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
