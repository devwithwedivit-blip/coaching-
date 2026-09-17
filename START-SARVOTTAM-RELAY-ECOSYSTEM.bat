@echo off
title Sarvottam Cloud Relay Ecosystem Launcher
echo ===================================================================
echo   Starting Sarvottam Cloud Relay Ecosystem
echo   1. Cloud Relay Server (Port 5100)
echo   2. PC Background File Sync Agent (Auto-Internet Watchdog)
echo   3. Mobile App Launcher (iOS, Android, PC Web)
echo ===================================================================
echo.

echo [*] Step 1: Starting Central Cloud Relay Server (Port 5100)...
start "Sarvottam Cloud Relay Server" cmd /k "cd /d %~dp0relay-server && node src/server.js"

timeout /t 2 /nobreak >nul

echo [*] Step 2: Starting PC Background Sync Client...
start "Sarvottam PC Sync Client" cmd /k "cd /d %~dp0pc-client && python pc_relay_client.py"

timeout /t 2 /nobreak >nul

echo [*] Step 3: Launching Mobile App Engine...
call "%~dp0OPEN-SARVOTTAM-APP.bat"
