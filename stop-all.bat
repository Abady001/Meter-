@echo off
title Meter Verse — Stop All Services
echo Stopping all Meter Verse services...
echo.
taskkill /FI "WINDOWTITLE eq MeterVerse-*" /F 2>nul
echo  [OK] Application services stopped
echo.
echo To stop PostgreSQL, run: net stop postgresql
echo Or close Docker Desktop if using containerized DB.
echo.
pause
