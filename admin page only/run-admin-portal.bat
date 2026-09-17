@echo off
title Antigravity Admin Portal & CBT Engine (Wi-Fi LAN Enabled)
echo ===================================================================
echo   Sarvottam Institutes - Admin Portal & Central Services
echo ===================================================================
echo.
for /f "tokens=*" %%i in ('node scripts/get-ip.js') do set LAN_IP=%%i
if "%LAN_IP%"=="" set LAN_IP=localhost

echo [Local Access (Host PC)]:
echo   - Admin Portal: http://localhost:3001/login
echo   - CBT Exam:     http://localhost:3001/test
echo.
echo [Mobile App Access (iOS / Android / Web)]:
echo   - Mobile App:   http://%LAN_IP%:8081
echo   - To launch mobile app: run "run-mobile-app.bat" or "..\OPEN-SARVOTTAM-APP.bat"
echo.
echo [Same Wi-Fi Network Access (Any Phone / Tablet / 20 PCs)]:
echo   - Admin Portal: http://%LAN_IP%:3001/login
echo   - CBT Exam:     http://%LAN_IP%:3001/test
echo.
echo Opening default browser to http://localhost:3001/login ...
start http://localhost:3001/login
echo.
echo Starting Next.js Central Portal on port 3001...
npm run dev
pause
