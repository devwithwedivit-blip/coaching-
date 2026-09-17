@echo off
title Sarvottam PC Cloud Relay Client (Auto-Detect Internet & Sync)
echo ===================================================================
echo   Starting Sarvottam PC Cloud Relay Client
echo   Auto-detects Wi-Fi, Mobile Hotspot, Ethernet, or VPN
echo   Streams Video Lectures and PDFs On-Demand to your Mobile App
echo ===================================================================
echo.

echo [*] Checking if Cloud Relay Server is running on port 5100...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://127.0.0.1:5100/api/health' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %ERRORLEVEL% neq 0 (
    echo [*] Relay Server not running. Automatically starting Relay Server on port 5100...
    start "Sarvottam Cloud Relay Server (Port 5100)" cmd /k "cd /d %~dp0relay-server && node src/server.js"
    timeout /t 2 /nobreak >nul
) else (
    echo [OK] Cloud Relay Server is active on port 5100.
)

cd /d "%~dp0\pc-client"

echo [*] Checking Python environment...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH! Please install Python 3.9+.
    pause
    exit /b 1
)

echo [*] Starting PC background connection daemon...
echo     (Leave this window open or minimized while using the mobile app)
echo.
python pc_relay_client.py
pause
