@echo off
chcp 65001 >nul
title Meter Verse Sync Gateway — Instance Generator
echo Generating gateway instances...

set "SHARED=D:\meter\Meter\backend\sync-gateway\shared\server.js"

:: October (10.50.30.2 :9999)
call :create october 4001 10.50.30.2 PalmHills_October 9999 admin admin admin iskra

:: New Cairo (10.50.30.2 :9090)
call :create new_cairo 4002 10.50.30.2 PalmHills_NewCairo 9090 admin admin admin admin

:: Sodic EDNC (10.50.30.2 :9191)
call :create sodic_ednc 4003 10.50.30.2 SODIC 9191 admin admin admin admin

:: UVenus Mall (10.50.30.4 :9191)
call :create uvenus_mall 4004 10.50.30.4 ABRAJ_UVENUS 9191 admin admin admin admin

:: Badya (10.50.30.5 :9090)
call :create badya 4005 10.50.30.5 Badya 9090 admin admin admin iskra

:: BO-Island (10.50.30.5 :9999)
call :create bo_island 4006 10.50.30.5 BO-Island 9999 admin admin admin iskra

:: Estates (10.50.30.5 :9000)
call :create estates 4007 10.50.30.5 Estates 9000 admin admin admin iskra

:: Sodic-VYE (10.50.30.5 :9909)
call :create sodic_vye 4008 10.50.30.5 Sodic-VYE 9909 admin admin admin iskra

:: Chillout (10.50.30.5 :9990)
call :create chillout 4009 10.50.30.5 Chillout 9990 admin admin admin iskra

echo.
echo ========================================
echo All 9 gateway instances created!
echo ========================================
echo.
echo To start all:  run-start-all.bat
echo To stop all:   run-stop-all.bat
echo.
echo Gateway ports: 4001 (October) through 4009 (Chillout)
echo.
pause
exit /b

:create
set AREA=%1
set PORT=%2
set HOST=%3
set DB=%4
set BILLPORT=%5
set SUSER=%6
set SPASS=%7
set BUSER=%8
set BPASS=%9

set "DIR=D:\meter\Meter\backend\sync-gateway\instances\gateway-%PORT%-%AREA%"
if not exist "%DIR%" mkdir "%DIR%"

(
echo PORT=%PORT%
echo AREA=%AREA%
echo SYMBIOT_URL=http://%HOST%/%DB%/api
echo SYMBIOT_USER=%SUSER%
echo SYMBIOT_PASS=%SPASS%
echo BILLING_URL=http://%HOST%:%BILLPORT%/api
echo BILLING_USER=%BUSER%
echo BILLING_PASS=%BPASS%
) > "%DIR%\.env"

echo  [%PORT%] %AREA% ^(http://%HOST% ^- Billing :%BILLPORT%^)
exit /b
