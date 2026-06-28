@echo off
chcp 65001 >nul
title Sync Gateway — Stop All
echo Stopping all gateways...
taskkill /FI "WINDOWTITLE eq Sync-*" /F 2>nul
echo All gateways stopped.
pause
