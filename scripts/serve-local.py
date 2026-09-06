#!/usr/bin/env python3
"""Serve the cards.art workspace locally with SPA routing and no stale assets."""

from __future__ import annotations

import argparse
import atexit
import http.server
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import threading
import time
from typing import Optional
from urllib.error import URLError
from urllib.request import urlopen
from urllib.parse import unquote, urlsplit


WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
WORKER_ROOT = WORKSPACE_ROOT / "worker"
DEFAULT_AUTH_PORT = 8787
DEFAULT_LOCAL_HELIUS_RPC_URL = "https://lauraine-qytyxk-fast-mainnet.helius-rpc.com"
AUTH_START_TIMEOUT_SECONDS = 25
AUTH_HEALTHCHECK_INTERVAL_SECONDS = 5
AUTH_HEALTHCHECK_FAILURE_LIMIT = 3
auth_process: Optional[subprocess.Popen] = None


class CardsArtLocalHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        request_path = unquote(urlsplit(self.path).path)
        local_path = Path(self.translate_path(request_path))
        accepts_html = "text/html" in self.headers.get("Accept", "")
        route_has_extension = bool(Path(request_path).suffix)
        if not local_path.exists() and (accepts_html or not route_has_extension):
            self.path = "/404.html"
        return super().send_head()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def auth_health_url(port: int) -> str:
    return f"http://127.0.0.1:{port}/api/health"


def auth_service_is_ready(port: int) -> bool:
    try:
        with urlopen(auth_health_url(port), timeout=0.6) as response:
            return response.status == 200 and json.load(response).get("ok") is True
    except (OSError, URLError, ValueError, json.JSONDecodeError):
        return False


def port_is_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.settimeout(0.3)
        return probe.connect_ex(("127.0.0.1", port)) == 0


def stop_auth_service() -> None:
    global auth_process
    process = auth_process
    auth_process = None
    if process is None or process.poll() is not None:
        return
    process.terminate()
    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=2)


def wait_for_auth_port_release(port: int, timeout_seconds: float = 5) -> bool:
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        if not port_is_in_use(port):
            return True
        time.sleep(0.1)
    return not port_is_in_use(port)


def local_helius_worker_args() -> list[str]:
    configured_url = os.environ.get("HELIUS_RPC_URL", "").strip()
    if configured_url:
        return ["--var", f"HELIUS_RPC_URL:{configured_url}"]
    if (WORKER_ROOT / ".dev.vars").exists():
        return []
    return ["--var", f"HELIUS_RPC_URL:{DEFAULT_LOCAL_HELIUS_RPC_URL}"]


def start_auth_service(port: int) -> None:
    global auth_process
    if auth_service_is_ready(port):
        print(f"cards.art local wallet service already ready on port {port}", flush=True)
        return
    if port_is_in_use(port):
        raise RuntimeError(
            f"port {port} is already in use by something other than the cards.art wallet service"
        )

    wrangler = WORKER_ROOT / "node_modules" / ".bin" / "wrangler"
    if not wrangler.exists():
        raise RuntimeError("wallet service dependencies are missing; run npm install in worker/")

    migration = subprocess.run(
        [
            str(wrangler),
            "d1",
            "migrations",
            "apply",
            "DB",
            "--local",
            "--config",
            "wrangler-worker.jsonc",
        ],
        cwd=WORKER_ROOT,
        check=False,
    )
    if migration.returncode != 0:
        raise RuntimeError("local wallet database migrations failed")

    auth_process = subprocess.Popen(
        [
            str(wrangler),
            "dev",
            "--local",
            "--config",
            "wrangler-worker.jsonc",
            "--var",
            "ALLOW_LOCALHOST_ORIGINS:true",
            *local_helius_worker_args(),
            "--ip",
            "127.0.0.1",
            "--port",
            str(port),
            "--log-level",
            "warn",
            "--show-interactive-dev-session=false",
        ],
        cwd=WORKER_ROOT,
    )
    deadline = time.monotonic() + AUTH_START_TIMEOUT_SECONDS
    while time.monotonic() < deadline:
        if auth_service_is_ready(port):
            print(f"cards.art local wallet service ready on port {port}", flush=True)
            return
        if auth_process.poll() is not None:
            raise RuntimeError(
                f"local wallet service exited with status {auth_process.returncode}"
            )
        time.sleep(0.15)
    stop_auth_service()
    raise RuntimeError("local wallet service did not become ready in time")


def monitor_auth_service(port: int, stop_event: threading.Event) -> None:
    consecutive_failures = 0
    while not stop_event.wait(AUTH_HEALTHCHECK_INTERVAL_SECONDS):
        if auth_service_is_ready(port):
            consecutive_failures = 0
            continue

        consecutive_failures += 1
        if consecutive_failures < AUTH_HEALTHCHECK_FAILURE_LIMIT:
            continue

        print(
            "cards.art local wallet service stopped responding; restarting it",
            file=sys.stderr,
            flush=True,
        )
        stop_auth_service()
        if not wait_for_auth_port_release(port):
            print(
                f"cards.art could not restart the wallet service because port {port} is still busy",
                file=sys.stderr,
                flush=True,
            )
            consecutive_failures = 0
            continue
        if stop_event.is_set():
            return
        try:
            start_auth_service(port)
        except RuntimeError as error:
            print(
                f"cards.art local wallet service restart failed: {error}",
                file=sys.stderr,
                flush=True,
            )
        consecutive_failures = 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve cards.art for local development")
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--auth-port", type=int, default=DEFAULT_AUTH_PORT)
    parser.add_argument(
        "--no-auth",
        action="store_true",
        help="serve only the static site without starting the local wallet service",
    )
    args = parser.parse_args()

    os.chdir(WORKSPACE_ROOT)
    auth_monitor_stop = threading.Event()
    auth_monitor: Optional[threading.Thread] = None
    if not args.no_auth:
        try:
            start_auth_service(args.auth_port)
        except RuntimeError as error:
            print(f"cards.art local startup failed: {error}", file=sys.stderr, flush=True)
            raise SystemExit(1) from error
        if auth_process is not None:
            auth_monitor = threading.Thread(
                target=monitor_auth_service,
                args=(args.auth_port, auth_monitor_stop),
                name="cards-art-wallet-healthcheck",
                daemon=True,
            )
            auth_monitor.start()
    atexit.register(stop_auth_service)
    server = http.server.ThreadingHTTPServer((args.bind, args.port), CardsArtLocalHandler)
    print(f"cards.art local site ready at http://localhost:{args.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        auth_monitor_stop.set()
        server.server_close()
        stop_auth_service()
        if auth_monitor is not None:
            auth_monitor.join(timeout=1)


if __name__ == "__main__":
    main()
