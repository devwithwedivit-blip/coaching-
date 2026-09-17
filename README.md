# Sarvottam Institutes - Educational Cloud Relay & Mobile Platform

A hybrid educational platform combining an on-demand Cloud Relay streaming engine with a full-featured cross-platform Mobile App (iOS, Android & Web) and Admin Portal.

---

## 🏗️ Architecture

```
 ┌───────────────────────────┐                ┌────────────────────────────────┐
 │     PC-Side Daemon        │                │     Central Cloud Relay        │
 │    (Python Client)        │                │   (Node.js + Express + ws)     │
 │                           │                │                                │
 │ - 6s Internet Watchdog    │  WebSocket     │ - Port 5100 (Express + ws)     │
 │ - Auto-reconnect & Backoff├───────────────►│ - Real-Time Presence Engine    │
 │ - Auto-indexes Local Files│  (Persistent)  │ - SQLite Metadata Catalog      │
 │ - On-Demand Chunk Streamer│                │ - HTTP Range Proxy (206)       │
 └─────────────┬─────────────┘                └───────────────▲────────────────┘
               │                                              │
    Local Folders:                                            │ WebSocket + REST
    - `Video Lectures/*.mp4`                                  │ (Fallback Polling 30s)
    - `pdf/*.pdf`                                             │
                                                              │
                                              ┌───────────────┴────────────────┐
                                              │       Mobile App Client        │
                                              │     (sarvottam-mobile)         │
                                              │                                │
                                              │ - Live "PC Online" badge       │
                                              │ - Real-time "file_updated"     │
                                              │ - On-demand Video Stream       │
                                              │ - On-demand PDF Download/View  │
                                              └────────────────────────────────┘
```

---

## 📁 Repository Structure

* **[`relay-server/`](relay-server/)**: Node.js + Express + `ws` + SQLite cloud relay server for presence and HTTP 206 Range video/PDF streaming.
* **[`pc-client/`](pc-client/)**: Python daemon running in the background on the PC with an internet watchdog and on-demand streaming engine.
* **[`sarvottam-mobile/`](sarvottam-mobile/)**: Cross-platform mobile app built with React Native & Expo (iOS, Android, and Web).
* **[`admin page only/`](admin%20page%20only/)**: Next.js 15 administrative portal and CBT examination telemetry backend.
* **[`pdf/`](pdf/)**: Local educational study materials, chapter notes, and solved question papers.
* **[`Video Lectures/`](Video%20Lectures/)**: Local high-definition recorded video masterclasses.

---

## 🚀 Quick Start

### 1-Click Launch (All Services)
Double-click:
```bash
START-SARVOTTAM-RELAY-ECOSYSTEM.bat
```
*(Starts Relay Server, PC Background Sync Client, and Mobile App Engine together)*

### Running Services Individually

1. **Start Cloud Relay Server (Port 5100)**:
   ```bash
   cd relay-server
   npm install
   npm start
   # Or double-click START-RELAY-SERVER.bat
   ```

2. **Start PC Sync Daemon**:
   ```bash
   cd pc-client
   pip install -r requirements.txt
   python pc_relay_client.py
   # Or double-click START-PC-CLIENT.bat
   ```

3. **Start Mobile App**:
   ```bash
   cd sarvottam-mobile
   npx expo start --lan
   # Or double-click OPEN-SARVOTTAM-APP.bat
   ```

4. **Worldwide / Remote Internet Access**:
   ```bash
   START-GLOBAL-INTERNET-ACCESS.bat
   ```

---

## 🧪 Testing & Verification

Run the end-to-end test suite to verify connectivity, authentication, and chunk streaming:
```bash
python test_relay_system.py
```
