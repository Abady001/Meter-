@echo off
chcp 65001 >nul
title Meter Verse Launcher
echo ========================================
echo  Meter Verse — Starting all services
echo ========================================

:: Kill any old instances first
taskkill /FI "WINDOWTITLE eq MeterVerse-*" /F 2>nul

:: 1. Backend
echo [1/3] Starting Backend (port 3001)...
cd /d "D:\meter\Meter\backend"
if not exist "dist\src\main.js" (
    echo  Building backend first...
    call npm run build
)
start "MeterVerse-Backend" cmd /c "node dist\src\main.js"

:: 2. Frontend
echo [2/3] Starting Frontend (port 3000)...
cd /d "D:\meter\Meter\Frontend"
start "MeterVerse-Frontend" cmd /c "node_modules\.bin\next.cmd dev -p 3000"

:: 3. DB Admin
echo [3/3] Starting DB Admin (port 4001)...
cd /d "D:\meter\Meter\backend"
set ADMIN_USER=admin
set ADMIN_PASS=iskra_admin_2026
start "MeterVerse-DBAdmin" cmd /c "node db-admin-server.js"

echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

:: Verify each service
echo.
echo Checking services...
curl -s http://localhost:3001/api/v1/health >nul 2>&1 && echo  Backend:   OK (port 3001) || echo  Backend:   WAITING...
curl -s http://localhost:3000/ >nul 2>&1 && echo  Frontend:  OK (port 3000) || echo  Frontend:  WAITING (may take 30-60s)...
curl -s http://localhost:4001/ >nul 2>&1 && echo  DB Admin:  OK (port 4001) || echo  DB Admin:  WAITING...

echo.
echo ========================================
echo  Access your services:
echo  Frontend: http://localhost:3000
echo  Backend:  http://localhost:3001/api/v1/health
echo  DB Admin: http://localhost:4001  (admin / iskra_admin_2026)
echo ========================================
echo.
echo  Three windows should now be open:
echo   "MeterVerse-Backend" - API server
echo   "MeterVerse-Frontend" - Web app
echo   "MeterVerse-DBAdmin" - Database manager
echo.
echo  Close them individually or run stop-all.bat
pause
