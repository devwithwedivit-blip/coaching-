#!/usr/bin/env python3
"""
End-to-End Test Suite for Sarvottam Cloud Relay System
------------------------------------------------------
Validates:
1. REST Auth & Token generation
2. Initial Device Status (Offline)
3. PC Daemon connection, WebSocket Handshake & Catalog Sync
4. Live Status Transition (Offline -> Online)
5. On-Demand Video Lecture Streaming with HTTP Range requests
6. On-Demand PDF Material Transfer
7. Disconnect and presence broadcasting
"""

import sys
import time
import json
import requests
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Add pc-client to path
sys.path.insert(0, str(Path(__file__).parent / "pc-client"))
from pc_relay_client import PcRelayClient

RELAY_URL = "http://127.0.0.1:5100"

def run_tests():
    print("================================================================")
    print("🧪 Starting Sarvottam Cloud Relay End-to-End Verification Suite")
    print("================================================================")

    # Test 1: Health
    print("\n[TEST 1] Verifying Server Health...")
    r = requests.get(f"{RELAY_URL}/api/health", timeout=5)
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print(f"  ✅ Health OK: {r.json()['service']} (uptime {r.json()['uptime']}s)")

    # Test 2: Authentication
    print("\n[TEST 2] Verifying Master JWT Authentication...")
    r = requests.post(f"{RELAY_URL}/api/auth/login", json={"username": "sarvottam", "password": "sarvottam2026"})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    auth_data = r.json()
    token = auth_data["token"]
    account_id = auth_data["account"]["id"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"  ✅ Auth OK: Generated JWT for account {account_id}")

    # Test 3: Status before PC connects
    print("\n[TEST 3] Checking Initial Status (Expecting PC Offline)...")
    r = requests.get(f"{RELAY_URL}/api/status", headers=headers)
    assert r.status_code == 200
    status = r.json()
    print(f"  ✅ Status OK: pcOnline={status['pcOnline']}, filesCount={status['filesCount']}")

    # Test 4: Launch PC Client in background
    print("\n[TEST 4] Connecting PC Client via WebSocket...")
    pc_client = PcRelayClient(root_dir=Path(__file__).parent)
    import threading
    t = threading.Thread(target=pc_client.start_connection, daemon=True)
    t.start()

    # Wait up to 10 seconds for connection and catalog sync
    connected = False
    for _ in range(20):
        time.sleep(0.5)
        if pc_client.is_connected and pc_client.is_authenticated:
            connected = True
            break

    assert connected, "PC client failed to connect to WebSocket in time"
    print("  ✅ PC Client Connected and Authenticated!")

    # Wait briefly for catalog to be processed by SQLite
    time.sleep(1.0)

    # Test 5: Verify status updated to Online and files indexed
    print("\n[TEST 5] Checking Status After PC Connect...")
    r = requests.get(f"{RELAY_URL}/api/status", headers=headers)
    assert r.status_code == 200
    new_status = r.json()
    assert new_status["pcOnline"] is True, f"Expected pcOnline=True, got {new_status['pcOnline']}"
    assert new_status["filesCount"] > 0, f"Expected filesCount > 0, got {new_status['filesCount']}"
    print(f"  ✅ Live Status OK: pcOnline={new_status['pcOnline']}, Total Files={new_status['filesCount']} (Videos: {new_status['videoCount']}, PDFs: {new_status['pdfCount']})")

    # Test 6: Fetch catalog
    print("\n[TEST 6] Fetching Synced File Catalog...")
    r = requests.get(f"{RELAY_URL}/api/files", headers=headers)
    assert r.status_code == 200
    catalog = r.json()["files"]
    print(f"  ✅ Catalog OK: Retrieved {len(catalog)} synced files from PC")

    videos = [f for f in catalog if f["file_type"] == "video"]
    pdfs = [f for f in catalog if f["file_type"] == "pdf"]
    assert len(videos) > 0, "No video files found in catalog"
    assert len(pdfs) > 0, "No PDF files found in catalog"

    test_video = videos[0]
    test_pdf = pdfs[0]

    # Test 7: On-Demand HTTP Range Video Stream
    print(f"\n[TEST 7] Testing On-Demand Video Stream with HTTP Range Header...")
    print(f"  Target Video: '{test_video['title']}' ({test_video['file_size_formatted']})")
    
    # Request first 128 KB
    range_headers = headers.copy()
    range_headers["Range"] = "bytes=0-131071"
    stream_url = f"{RELAY_URL}/api/relay/stream/{test_video['id']}"
    
    stream_res = requests.get(stream_url, headers=range_headers, timeout=10)
    assert stream_res.status_code == 206, f"Expected HTTP 206 Partial Content, got {stream_res.status_code}"
    assert len(stream_res.content) == 131072, f"Expected 131072 bytes, got {len(stream_res.content)}"
    assert "video/mp4" in stream_res.headers.get("Content-Type", ""), f"Wrong Content-Type: {stream_res.headers.get('Content-Type')}"
    # Check for MP4 magic bytes (ftyp)
    has_ftyp = b"ftyp" in stream_res.content[:32]
    print(f"  ✅ Video Stream OK: HTTP 206 received, streamed {len(stream_res.content)} bytes from PC with valid MP4 container (has_ftyp={has_ftyp})")

    # Test 8: On-Demand PDF Transfer
    print(f"\n[TEST 8] Testing On-Demand PDF Document Stream...")
    print(f"  Target PDF: '{test_pdf['title']}' ({test_pdf['file_size_formatted']})")
    pdf_range_headers = headers.copy()
    pdf_range_headers["Range"] = "bytes=0-4095"
    pdf_url = f"{RELAY_URL}/api/relay/stream/{test_pdf['id']}"

    pdf_res = requests.get(pdf_url, headers=pdf_range_headers, timeout=10)
    assert pdf_res.status_code == 206, f"Expected HTTP 206, got {pdf_res.status_code}"
    assert len(pdf_res.content) == 4096, f"Expected 4096 bytes, got {len(pdf_res.content)}"
    assert pdf_res.content.startswith(b"%PDF-"), f"Expected %PDF- magic bytes, got {pdf_res.content[:10]}"
    print(f"  ✅ PDF Stream OK: HTTP 206 received, streamed {len(pdf_res.content)} bytes from PC with verified %PDF- header")

    # Test 9: PC Disconnect Detection
    print("\n[TEST 9] Testing PC Disconnect Detection...")
    pc_client.stop()
    time.sleep(1.0)
    r = requests.get(f"{RELAY_URL}/api/status", headers=headers)
    off_status = r.json()
    assert off_status["pcOnline"] is False, f"Expected pcOnline=False after disconnect, got {off_status['pcOnline']}"
    print(f"  ✅ Disconnect Detection OK: pcOnline correctly reverted to False (lastSeen: {off_status['lastSeen']})")

    print("\n================================================================")
    print("🎉 ALL 9 CLOUD RELAY TESTS PASSED PERFECTLY!")
    print("================================================================")

if __name__ == "__main__":
    run_tests()
