@echo off
title Sarvottam Institutes - Mobile App (iOS, Android & Web)
echo ===================================================================
echo   Starting Sarvottam Institutes Mobile App Engine
echo   Compatible with: Apple iOS (iPhone/iPad), Android, & PC Browser
echo ===================================================================
echo.

cd /d "%~dp0\sarvottam-mobile"

echo [*] Detecting Local Wi-Fi Network IP and preparing QR codes...
for /f "tokens=*" %%i in ('node scripts/prepare-launch.js') do set LAN_IP=%%i
if "%LAN_IP%"=="" set LAN_IP=localhost

echo [*] Network IP detected: %LAN_IP%
echo.
echo ===================================================================
echo   HOW TO OPEN ON YOUR DEVICES:
echo ===================================================================
echo   [1] Local PC Browser Preview:
echo       - http://localhost:8081
echo.
echo   [2] Apple iPhone / iPad (iOS):
echo       - Connect your iPhone to the same Wi-Fi (%LAN_IP%)
echo       - Open iPhone Camera and scan the QR code on your screen
echo       - Or open Safari and visit: http://%LAN_IP%:8081
echo       - Tap Share -^> 'Add to Home Screen' for native full-screen app!
echo.
echo   [3] Android Phone / Tablet:
echo       - Connect your phone to the same Wi-Fi (%LAN_IP%)
echo       - Open Chrome and visit: http://%LAN_IP%:8081
echo       - Tap 3 dots -^> 'Install app' or 'Add to Home Screen'
echo       - Or open Expo Go and scan the QR code
echo ===================================================================
echo.

echo [*] Opening visual App Launcher with live QR codes & Phone Simulator...
start "" "%~dp0open-app.html?ip=%LAN_IP%"
echo.

echo [*] Checking if Expo dev server is already running...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:8081' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %ERRORLEVEL% equ 0 (
    echo [OK] Expo Server is already running on http://localhost:8081 and http://%LAN_IP%:8081
    echo.
    echo Press any key to reopen or reload terminal QR code...
    pause >nul
)

echo [*] Starting Expo Development Server (LAN Mode)...
echo     (Press 'w' for web, 'a' for Android, 'i' for iOS simulator, 'r' to reload)
echo.
npx expo start --lan
pause
