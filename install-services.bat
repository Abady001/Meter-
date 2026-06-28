@echo off
chcp 65001 >nul
title Meter Verse — Install Services
powershell -ExecutionPolicy Bypass -File "%~dp0install-services.ps1"
pause
