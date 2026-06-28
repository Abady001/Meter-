@echo off
title Meter Verse Administration Center
echo ========================================
echo  Meter Verse Administration Center
echo  Enterprise Governance Console
echo ========================================
echo.
cd /d "%~dp0"
echo [1/2] Running database migrations...
node src\migrate.js
echo.
echo [2/2] Starting server on port 4002...
echo.
node src\server.js
pause
