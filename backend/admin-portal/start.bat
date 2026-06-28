@echo off
title Meter Verse Administration Portal
echo =============================================
echo  Meter Verse Administration Portal
echo  Merged: DB Admin + Governance Console
echo  Port: 6262
echo =============================================
cd /d "%~dp0"
node src\server.js
pause
