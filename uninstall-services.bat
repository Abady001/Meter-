@echo off
chcp 65001 >nul
title Meter Verse — Remove Services
powershell -ExecutionPolicy Bypass -File "%~dp0uninstall-services.ps1"
pause
