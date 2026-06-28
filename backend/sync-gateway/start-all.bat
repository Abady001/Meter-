@echo off
chcp 65001 >nul
title Sync Gateway — Start All
cd /d "D:\meter\Meter\backend\sync-gateway"

echo Installing shared dependencies...
cd shared
if not exist node_modules (
    npm init -y >nul 2>&1
    npm install express >nul 2>&1
)
cd ..

echo Starting all 9 gateway instances...

for %%g in (4001-october 4002-new_cairo 4003-sodic_ednc 4004-uvenus_mall 4005-badya 4006-bo_island 4007-estates 4008-sodic_vye 4009-chillout) do (
    start "Sync-%%g" cmd /c "cd /d "D:\meter\Meter\backend\sync-gateway\instances\gateway-%%g" && copy /Y ..\..\shared\server.js . >nul && node server.js"
    timeout /t 1 /nobreak >nul
)

echo.
echo ========================================
echo All 9 gateways starting on ports 4001-4009
echo ========================================
echo.
echo Test: http://localhost:4001/health
echo       http://localhost:4002/health
echo       ... through 4009
echo.
echo Or use orchestrator: http://localhost:4000/api/v1/sync/{area}/meters
echo.
pause
