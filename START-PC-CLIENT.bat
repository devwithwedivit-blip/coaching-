@echo off
title Sarvottam PC Cloud Relay Client (Global Cloud Mode)
echo ===================================================================
echo   Starting Sarvottam PC Cloud Relay Client
echo   Target: https://coaching-1-0xeo.onrender.com (24/7 Global Cloud)
echo   Auto-detects Wi-Fi, Mobile Hotspot, Ethernet, or VPN
echo   Streams Video Lectures and PDFs On-Demand to your Mobile App
echo ===================================================================
echo.

cd /d "%~dp0\pc-client"

echo [*] Checking Python environment...
python --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python is not installed or not in PATH! Please install Python 3.9+.
    pause
    exit /b 1
)

echo [*] Starting PC background sync client...
echo     (Leave this window open or minimized while using the mobile app)
echo.
python pc_relay_client.py
pause
