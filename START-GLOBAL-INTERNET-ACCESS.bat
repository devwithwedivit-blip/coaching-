@echo off
title Sarvottam Global Internet Access (Worldwide Relay & Mobile Tunnel)
echo ===================================================================
echo   Sarvottam Cloud Relay - Worldwide Internet Access Mode
echo   Allows anyone in any location/city to view and stream from your PC!
echo ===================================================================
echo.

echo [*] Step 1: Starting Local Cloud Relay Server (Port 5100)...
start "Sarvottam Cloud Relay Server (Port 5100)" cmd /k "cd /d %~dp0relay-server && node src/server.js"
timeout /t 2 /nobreak >nul

echo [*] Step 2: Creating Global Public Internet Tunnel for Relay Server (Port 5100)...
start "Public Internet Relay Tunnel" cmd /k "echo Generating global HTTPS URL for Relay Server... && npx -y localtunnel --port 5100"
timeout /t 3 /nobreak >nul

echo [*] Step 3: Starting PC Sync Client...
start "Sarvottam PC Sync Client" cmd /k "cd /d %~dp0pc-client && python pc_relay_client.py"
timeout /t 2 /nobreak >nul

echo [*] Step 4: Starting Expo Mobile App in Global Tunnel Mode...
echo     (This creates a global URL/QR code your relative can scan anywhere in the world)
echo.
cd /d "%~dp0sarvottam-mobile"
npx expo start --tunnel
pause
