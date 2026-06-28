@echo off
chcp 65001 >nul
title Meter Verse — START ALL SERVICES

:: Auto-elevate to admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    powershell start -verb runas '%0' 2>nul
    exit /b
)

cd /d "%~dp0"
echo Installing Meter Verse DB Admin as Windows Service...
sc.exe create "meter-verse-dbadmin" binPath="cmd /c \"%~dp0run-dbadmin.bat\"" start=auto DisplayName="Meter Verse DB Admin"
sc.exe description "meter-verse-dbadmin" "Database Admin UI on port 4001"
sc.exe start meter-verse-dbadmin >nul 2>&1
echo.
echo ============================================
echo  ✅ DB Admin installed and started
echo ============================================
echo.
echo Open http://localhost:4001 in your browser
echo Login: admin / iskra_admin_2026
echo.
echo Manage: services.msc → Meter Verse DB Admin
echo.
pause
