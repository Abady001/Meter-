@echo off
chcp 65001 >nul
title Meter Verse Launcher

echo ================================================
echo  METER VERSE — SYSTEM LAUNCHER
echo ================================================
echo.

:: LAUNCH VPN
echo [1] Opening SSL VPN Client...
start "" "C:\Users\Public\Desktop\SSL VPN-Plus Client.lnk"
echo.
echo  Connect to VPN now. After connected, press ENTER.
echo  (If VPN is already running, just press ENTER)
pause >nul

:: ADD ROUTES
echo.
echo [2] Adding network routes...
route add 10.50.30.0 mask 255.255.255.0 10.50.30.1 >nul 2>&1
if errorlevel 1 (
  echo  Trying with default gateway...
  for /f "tokens=3" %%g in ('route print 0.0.0.0 ^| findstr "0.0.0.0"') do (
    route add 10.50.30.0 mask 255.255.255.0 %%g >nul 2>&1
  )
) else echo  Route added

:: TEST CONNECTIVITY
echo.
echo [3] Testing connections...
ping -n 1 -w 2000 10.50.30.2 >nul && echo  [October] 10.50.30.2: OK || echo  [October] 10.50.30.2: FAILED
ping -n 1 -w 2000 10.50.30.4 >nul && echo  [Uvenus]  10.50.30.4: OK || echo  [Uvenus]  10.50.30.4: FAILED

:: START DATABASE
echo.
echo [4] Starting database...
docker compose -f "D:\meter\Meter\backend\docker-compose.yml" start db >nul 2>&1 || net start postgresql >nul 2>&1
echo  DB: OK

:: BUILD + START BACKEND
echo.
echo [5] Building backend...
cd /d "D:\meter\Meter\backend"
call npm run build
if errorlevel 1 (
  echo  BACKEND BUILD FAILED — check errors above
  pause
  exit /b 1
)
echo  Build complete. Starting backend...
start "MV-Backend" cmd /c "node --max-old-space-size=2048 dist\src\main.js"
timeout /t 8 /nobreak >nul
echo  Backend: port 3001

:: REGISTER AREAS IN DATABASE
echo.
echo [6] Registering area configurations...
cd /d "D:\meter\Meter\backend"
node scripts\register-uvines-area.cjs 2>nul || echo  Registration script not found — run manually later

:: START FRONTEND
echo.
echo [7] Starting frontend...
cd /d "D:\meter\Meter\Frontend"
start "MV-Frontend" cmd /c "npx next dev -p 3000"
echo  Frontend: port 3000

:: START ADMIN PORTAL
cd /d "D:\meter\Meter\backend\admin-portal"
start "MV-Admin" cmd /c "node src\server.js"
echo  Admin Portal: port 6262

:: OPEN BROWSERS
timeout /t 3 /nobreak >nul
start http://localhost:3000
start http://localhost:6262

echo.
echo ================================================
echo  RUNNING:
echo  Frontend:  http://localhost:3000
echo  Admin:     http://localhost:6262
echo  API:       http://localhost:3001/api/v1/health
echo  Login:     kirllos / admin123 (admin portal)
echo.
echo  AREAS CONFIGURED:
echo   October    (AREA-1) — 10.50.30.2 / PalmHills_October
echo   New Cairo  (AREA-2) — 10.50.30.2 / PalmHills_NewCairo
echo   Sodic EDNC (AREA-3) — 10.50.30.2 / SODIC
echo   Uvenus Mall(AREA-8) — 10.50.30.4 / ABRAJ_UVENUS
echo ================================================
echo.
echo  Press ENTER to stop all services.
pause >nul
taskkill /FI "WINDOWTITLE eq MV-*" /F >nul 2>&1
echo Stopped.
pause
