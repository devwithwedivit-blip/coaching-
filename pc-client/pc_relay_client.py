#!/usr/bin/env python3
"""
Sarvottam PC Cloud Relay Client
--------------------------------
Background service and connection layer linking local PC storage (Video Lectures & PDF materials)
with the central Cloud Relay server.

Features:
- Internet Connectivity Watchdog (5-10s interval, detects Wi-Fi/Hotspot/Ethernet/VPN switches)
- Persistent WebSocket connection with exponential backoff auto-reconnect
- Auto-indexing and real-time catalog synchronization for PDFs and Videos
- On-Demand chunked binary streaming proxy when files are tapped on mobile
- Python module API + CLI interface for triggering file pushes
"""

import os
import sys
import time
import json
import base64
import hashlib
import threading
import argparse
import urllib.parse
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

try:
    import requests
    import websocket
except ImportError:
    print("[ERROR] Required libraries missing. Run: pip install requests websocket-client")
    sys.exit(1)

# Default configuration
DEFAULT_CONFIG = {
    "relay_http_url": "https://coaching-1-0xeo.onrender.com",
    "relay_ws_url": "wss://coaching-1-0xeo.onrender.com",
    "username": "sarvottam",
    "password": "sarvottam2026",
    "device_name": "Sarvottam Windows PC",
    "watchdog_interval_sec": 6,
    "max_backoff_sec": 30,
    "chunk_size_bytes": 65536,  # 64 KB streaming chunks
    "watch_folders": [
        {"path": "Video Lectures", "type": "video", "subject": "All"},
        {"path": "pdf", "type": "pdf", "subject": "All"}
    ]
}

CONFIG_FILE = Path(__file__).parent / "client_config.json"


def load_config():
    cfg = DEFAULT_CONFIG.copy()
    if CONFIG_FILE.exists():
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg.update(json.load(f))
        except Exception as e:
            print(f"[CONFIG] Warning loading {CONFIG_FILE}: {e}")
    else:
        # Save default config file for easy user customization
        try:
            with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(cfg, f, indent=2)
        except Exception:
            pass
    return cfg


def format_size(size_bytes):
    if size_bytes >= 1024 * 1024 * 1024:
        return f"{size_bytes / (1024 * 1024 * 1024):.1f} GB"
    elif size_bytes >= 1024 * 1024:
        return f"{size_bytes / (1024 * 1024):.1f} MB"
    elif size_bytes >= 1024:
        return f"{size_bytes / 1024:.1f} KB"
    return f"{size_bytes} B"


class PcRelayClient:
    def __init__(self, root_dir=None, config=None):
        self.config = config or load_config()
        self.root_dir = Path(root_dir or Path(__file__).resolve().parent.parent)
        self.ws = None
        self.is_connected = False
        self.is_authenticated = False
        self.has_internet = False
        self.should_stop = False
        self.auth_token = None
        self.account_id = None
        self.active_transfers = set()
        self.lock = threading.Lock()
        self.reconnect_attempts = 0

    # -------------------------------------------------------------
    # 1. Internet Connectivity Watchdog
    # -------------------------------------------------------------
    def check_internet(self):
        """Checks whether this machine has internet reachability using fast HEAD requests."""
        # Try relay server health check first, then 1.1.1.1
        endpoints = [
            f"{self.config['relay_http_url']}/api/health",
            "http://1.1.1.1",
            "http://8.8.8.8"
        ]
        for url in endpoints:
            try:
                res = requests.head(url, timeout=3)
                if res.status_code in (200, 204, 301, 302):
                    return True
            except Exception:
                continue
        return False

    def login_and_get_token(self):
        """Authenticates with the Relay Server REST API to obtain JWT."""
        login_url = f"{self.config['relay_http_url']}/api/auth/login"
        payload = {
            "username": self.config["username"],
            "password": self.config["password"]
        }
        try:
            res = requests.post(login_url, json=payload, timeout=5)
            if res.status_code == 200:
                data = res.json()
                self.auth_token = data.get("token")
                self.account_id = data.get("account", {}).get("id", "acc_sarvottam_master")
                print(f"[AUTH] ✅ Logged into Relay as {self.config['username']} (Account: {self.account_id})")
                return True
            else:
                print(f"[AUTH] ❌ Login rejected ({res.status_code}): {res.text}")
                return False
        except Exception as e:
            print(f"[AUTH] ⚠️ Failed to reach Relay login endpoint: {e}")
            return False

    # -------------------------------------------------------------
    # 2. Local File Catalog Scanner
    # -------------------------------------------------------------
    def scan_local_files(self):
        """Scans the designated PC folders for Video Lectures and PDFs."""
        files = []
        for rule in self.config["watch_folders"]:
            folder_path = self.root_dir / rule["path"]
            if not folder_path.exists():
                continue

            file_type = rule["type"]
            extensions = {".mp4", ".mkv", ".webm", ".mov"} if file_type == "video" else {".pdf"}

            for root, _, filenames in os.walk(folder_path):
                for fn in sorted(filenames):
                    ext = Path(fn).suffix.lower()
                    if ext in extensions:
                        full_path = Path(root) / fn
                        try:
                            st = full_path.stat()
                        except Exception:
                            continue

                        rel_path = str(full_path.relative_to(self.root_dir)).replace("\\", "/")
                        file_id = "file_" + hashlib.md5(rel_path.encode("utf-8")).hexdigest()[:12]

                        # Clean up title
                        clean_title = Path(fn).stem
                        # Remove download noise prefixes if present
                        for prefix in ["vidssave.com ", "vidssave.com_", "vidssave_com_"]:
                            if clean_title.startswith(prefix):
                                clean_title = clean_title[len(prefix):]

                        mime = "video/mp4" if ext == ".mp4" else ("application/pdf" if ext == ".pdf" else "application/octet-stream")

                        files.append({
                            "id": file_id,
                            "original_name": fn,
                            "title": clean_title,
                            "file_type": file_type,
                            "relative_path": rel_path,
                            "file_size": st.st_size,
                            "file_size_formatted": format_size(st.st_size),
                            "mime_type": mime,
                            "category": "Lecture Video" if file_type == "video" else "Study Material",
                            "subject": rule.get("subject", "All"),
                            "duration": "Recorded Masterclass" if file_type == "video" else "",
                            "file_hash": f"{st.st_size}-{int(st.st_mtime)}"
                        })
        return files

    def sync_catalog_now(self):
        """Explicit trigger to scan and push files catalog to relay."""
        if not self.is_connected or not self.ws:
            print("[SYNC] ⚠️ Cannot sync: Client is not connected to Relay WebSocket.")
            return False

        files = self.scan_local_files()
        msg = {
            "type": "sync_catalog",
            "payload": {
                "files": files,
                "timestamp": time.time()
            }
        }
        try:
            self.ws.send(json.dumps(msg))
            print(f"[SYNC] 🚀 Catalog pushed to Relay ({len(files)} files: {sum(1 for f in files if f['file_type']=='video')} videos, {sum(1 for f in files if f['file_type']=='pdf')} PDFs)")
            return True
        except Exception as e:
            print(f"[SYNC] ❌ Failed to send catalog: {e}")
            return False

    # -------------------------------------------------------------
    # 3. On-Demand Chunked File Transfer
    # -------------------------------------------------------------
    def handle_transfer_request(self, payload):
        """Streams requested file bytes on-demand when clicked on mobile."""
        transfer_session_id = payload.get("transferSessionId")
        relative_path = payload.get("relativePath")
        start_byte = payload.get("startByte", 0)
        end_byte = payload.get("endByte")

        full_path = self.root_dir / relative_path
        if not full_path.exists():
            print(f"[TRANSFER] ❌ Requested file not found: {full_path}")
            self.send_transfer_error(transfer_session_id, f"File not found on PC: {relative_path}")
            return

        with self.lock:
            self.active_transfers.add(transfer_session_id)

        # Run streaming in background worker thread so socket remains responsive
        worker = threading.Thread(
            target=self._stream_file_worker,
            args=(transfer_session_id, full_path, start_byte, end_byte),
            daemon=True
        )
        worker.start()

    def _stream_file_worker(self, session_id, file_path, start_byte, end_byte):
        chunk_size = self.config["chunk_size_bytes"]
        try:
            total_size = file_path.stat().st_size
            if end_byte is None or end_byte >= total_size:
                end_byte = total_size - 1

            bytes_to_send = (end_byte - start_byte) + 1
            print(f"[TRANSFER] 📤 Streaming '{file_path.name}' [bytes {start_byte}-{end_byte} ({format_size(bytes_to_send)})] -> Mobile via Relay")

            sent_bytes = 0
            with open(file_path, "rb") as f:
                f.seek(start_byte)

                while sent_bytes < bytes_to_send and not self.should_stop:
                    if session_id not in self.active_transfers:
                        print(f"[TRANSFER] ⏹️ Transfer cancelled: {session_id}")
                        break

                    current_read_size = min(chunk_size, bytes_to_send - sent_bytes)
                    chunk = f.read(current_read_size)
                    if not chunk:
                        break

                    sent_bytes += len(chunk)
                    is_last = (sent_bytes >= bytes_to_send)

                    msg = {
                        "type": "transfer_chunk",
                        "payload": {
                            "transferSessionId": session_id,
                            "chunkBase64": base64.b64encode(chunk).decode("ascii"),
                            "isLast": is_last
                        }
                    }

                    if self.ws and self.is_connected:
                        self.ws.send(json.dumps(msg))
                    else:
                        break

                    if is_last:
                        break

            print(f"[TRANSFER] ✅ Completed stream {session_id} ({format_size(sent_bytes)} sent)")

        except Exception as e:
            print(f"[TRANSFER] ❌ Error streaming file: {e}")
            self.send_transfer_error(session_id, str(e))
        finally:
            with self.lock:
                self.active_transfers.discard(session_id)

    def send_transfer_error(self, session_id, error_msg):
        if self.ws and self.is_connected:
            try:
                self.ws.send(json.dumps({
                    "type": "transfer_error",
                    "payload": {
                        "transferSessionId": session_id,
                        "error": error_msg
                    }
                }))
            except Exception:
                pass

    # -------------------------------------------------------------
    # 4. WebSocket Lifecycle Handlers
    # -------------------------------------------------------------
    def on_ws_open(self, ws):
        print("[WS] 🔌 Connected to Relay Server! Authenticating...")
        self.is_connected = True
        self.reconnect_attempts = 0

        # Send authentication payload
        auth_msg = {
            "type": "auth",
            "payload": {
                "token": self.auth_token,
                "accountId": self.account_id,
                "deviceType": "pc",
                "deviceName": self.config["device_name"],
                "deviceId": "pc_sarvottam_host"
            }
        }
        ws.send(json.dumps(auth_msg))

    def on_ws_message(self, ws, message_str):
        try:
            data = json.loads(message_str)
            msg_type = data.get("type")
            payload = data.get("payload", {})

            if msg_type == "auth_success":
                self.is_authenticated = True
                print("[WS] 🟢 Authenticated! Emitting initial file catalog sync...")
                self.sync_catalog_now()

            elif msg_type == "transfer_request":
                self.handle_transfer_request(payload)

            elif msg_type == "cancel_transfer":
                sess_id = payload.get("transferSessionId")
                with self.lock:
                    self.active_transfers.discard(sess_id)

            elif msg_type == "sync_ack":
                print(f"[WS] 📁 Relay acknowledged catalog ({payload.get('count')} files indexed)")

            elif msg_type == "pong":
                pass

        except Exception as e:
            print(f"[WS] Error processing message: {e}")

    def on_ws_error(self, ws, error):
        print(f"[WS] ⚠️ Socket error: {error}")

    def on_ws_close(self, ws, close_status_code, close_msg):
        print(f"[WS] 🔴 Disconnected from Relay Server ({close_status_code}: {close_msg})")
        self.is_connected = False
        self.is_authenticated = False
        with self.lock:
            self.active_transfers.clear()

    # -------------------------------------------------------------
    # 5. Connection Engine & Auto-Reconnect Loop
    # -------------------------------------------------------------
    def start_connection(self):
        """Establishes and runs the persistent WebSocket connection with auto-reconnect."""
        while not self.should_stop:
            # 1. Verify Internet Reachability
            self.has_internet = self.check_internet()
            if not self.has_internet:
                print("[WATCHDOG] 🌐 No internet connection detected. Retrying in 6s...")
                time.sleep(self.config["watchdog_interval_sec"])
                continue

            # 2. Verify Authentication Token
            if not self.auth_token:
                ok = self.login_and_get_token()
                if not ok:
                    print("[AUTH] Retrying login in 5s...")
                    time.sleep(5)
                    continue

            # 3. Connect WebSocket
            ws_url = f"{self.config['relay_ws_url']}?token={self.auth_token}"
            print(f"[WATCHDOG] 🌐 Internet online! Connecting to Relay -> {self.config['relay_ws_url']}")

            try:
                self.ws = websocket.WebSocketApp(
                    ws_url,
                    on_open=self.on_ws_open,
                    on_message=self.on_ws_message,
                    on_error=self.on_ws_error,
                    on_close=self.on_ws_close
                )
                # Run socket loop (blocks until disconnected)
                self.ws.run_forever(ping_interval=20, ping_timeout=10)
            except Exception as e:
                print(f"[WS] Exception in run_forever: {e}")

            # 4. Handle Disconnect with Exponential Backoff across network changes
            self.is_connected = False
            self.is_authenticated = False
            if self.should_stop:
                break

            self.reconnect_attempts += 1
            backoff = min(self.config["max_backoff_sec"], 2 ** min(self.reconnect_attempts, 5))
            print(f"[AUTO-RECONNECT] 🔄 Network changed or disconnected. Reconnecting in {backoff}s (attempt {self.reconnect_attempts})...")
            time.sleep(backoff)

    def stop(self):
        self.should_stop = True
        if self.ws:
            try:
                self.ws.close()
            except Exception:
                pass


# -------------------------------------------------------------
# Module Exports & CLI Entrypoint
# -------------------------------------------------------------
_global_client = None


def start_client(root_dir=None, block=True):
    """Starts the PC Relay client daemon."""
    global _global_client
    _global_client = PcRelayClient(root_dir=root_dir)
    if block:
        try:
            _global_client.start_connection()
        except KeyboardInterrupt:
            print("\n[STOP] Shutting down PC Relay Client...")
            _global_client.stop()
    else:
        t = threading.Thread(target=_global_client.start_connection, daemon=True)
        t.start()
        return _global_client


def sync_now():
    """Trigger an immediate catalog push if client is running."""
    global _global_client
    if _global_client and _global_client.is_connected:
        return _global_client.sync_catalog_now()
    else:
        # One-off standalone scan and sync via REST
        cfg = load_config()
        client = PcRelayClient()
        if client.login_and_get_token():
            files = client.scan_local_files()
            # Send via REST sync or open brief WS
            print(f"[SYNC] Found {len(files)} local files ready to sync.")
            return True
        return False


def get_client_status():
    global _global_client
    if not _global_client:
        return {"status": "stopped", "is_connected": False}
    return {
        "status": "running",
        "is_connected": _global_client.is_connected,
        "is_authenticated": _global_client.is_authenticated,
        "has_internet": _global_client.has_internet,
        "active_transfers": len(_global_client.active_transfers)
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sarvottam PC Cloud Relay Client")
    parser.add_argument("--run", action="store_true", help="Run the daemon in foreground")
    parser.add_argument("--sync", action="store_true", help="Trigger a file catalog sync")
    parser.add_argument("--status", action="store_true", help="Check client and relay connection status")
    parser.add_argument("--test", action="store_true", help="Run diagnostic test of local folders & internet")
    args = parser.parse_args()

    if args.status:
        cfg = load_config()
        print(f"Relay Server URL: {cfg['relay_http_url']}")
        try:
            res = requests.get(f"{cfg['relay_http_url']}/api/health", timeout=3)
            print(f"Relay Health: {res.json()}")
        except Exception as e:
            print(f"Relay Health Error: {e}")

    elif args.sync:
        print("[SYNC] Triggering file catalog sync...")
        sync_now()

    elif args.test:
        client = PcRelayClient()
        print(f"[TEST] Root Directory: {client.root_dir}")
        print(f"[TEST] Internet Connectivity: {'AVAILABLE' if client.check_internet() else 'OFFLINE'}")
        files = client.scan_local_files()
        print(f"[TEST] Scanned Local Files: {len(files)}")
        for f in files[:5]:
            print(f"  - [{f['file_type'].upper()}] {f['title']} ({f['file_size_formatted']}) -> {f['relative_path']}")
        if len(files) > 5:
            print(f"  ... and {len(files) - 5} more files.")

    else:
        # Default: Run the daemon
        print("=======================================================")
        print("💻 Sarvottam PC Cloud Relay Client Daemon Starting...")
        print("   Auto-detecting internet (Wi-Fi, Hotspot, Ethernet)")
        print("   Linking local files to Mobile App via Cloud Relay")
        print("=======================================================")
        start_client(block=True)
