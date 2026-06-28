@echo off
chcp 65001 >nul
title Meter Verse — VPN Route Setup

echo ================================================
echo   METER VERSE — VPN ROUTING TABLE SETUP
echo   Configures routes for Symbiot network (10.50.30.x)
echo ================================================
echo.

:: Find default gateway interface
for /f "tokens=3" %%a in ('route print 0.0.0.0 ^| findstr /C:"0.0.0.0" ^| findstr /V /C:"127.0.0.1"') do set GW=%%a

if "%GW%"=="" (
    echo [ERROR] Could not detect default gateway.
    echo Make sure your VPN is connected and try again.
    pause
    exit /b 1
)

echo Default Gateway: %GW%
echo.

:: Add routes for Symbiot servers (read-only access only)
echo Adding routes for 10.50.30.x network through VPN gateway %GW%...
echo.

route add 10.50.30.0 mask 255.255.255.0 %GW% >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Route added: 10.50.30.0/24 via %GW%
) else (
    echo [*] Route already exists or access denied (run as Administrator)
)

echo.
echo Testing connectivity...
ping -n 2 10.50.30.2 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Symbiot 10.50.30.2 is reachable
) else (
    echo [*] Symbiot 10.50.30.2 is not reachable (VPN may not be connected)
)

ping -n 2 10.50.30.4 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Symbiot 10.50.30.4 is reachable
) else (
    echo [*] Symbiot 10.50.30.4 is not reachable
)

ping -n 2 10.50.30.5 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Symbiot 10.50.30.5 is reachable
) else (
    echo [*] Symbiot 10.50.30.5 is not reachable
)

echo.
echo ================================================
echo  VPN routing complete. Run start-all.bat to launch
echo  the full Meter Verse system.
echo ================================================
pause
