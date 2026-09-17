@echo off
title Sarvottam Cloud Relay Server (Port 5100)
echo ===================================================================
echo   Starting Sarvottam Cloud Relay Server
echo   Port: 5100 | WebSocket + HTTP Stream Proxy
echo ===================================================================
echo.

cd /d "%~dp0\relay-server"

echo [*] Starting Server...
node src/server.js
pause
