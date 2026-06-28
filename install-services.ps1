# Meter Verse — Install ALL Windows Services
# Run this script as Administrator

$ErrorActionPreference = "Stop"
Write-Host "=== Meter Verse — Install All Services ===" -ForegroundColor Cyan
Write-Host ""

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "ERROR: Please run as Administrator" -ForegroundColor Red
    Write-Host "Right-click -> Run with PowerShell (as Administrator)" -ForegroundColor Yellow
    exit 1
}

$DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Backend
Write-Host "[1/4] Installing Meter Verse Backend..." -ForegroundColor Yellow
$beWrapper = Join-Path $DIR "run-backend.bat"
sc.exe create "meter-verse-backend" binPath="cmd /c `"$beWrapper`"" start=auto DisplayName="Meter Verse Backend"
sc.exe description "meter-verse-backend" "Meter Verse API - NestJS on port 3001"
Write-Host "  ✅ meter-verse-backend" -ForegroundColor Green

# 2. Frontend
Write-Host "[2/4] Installing Meter Verse Frontend..." -ForegroundColor Yellow
$feWrapper = Join-Path $DIR "run-frontend.bat"
sc.exe create "meter-verse-frontend" binPath="cmd /c `"$feWrapper`"" start=auto DisplayName="Meter Verse Frontend"
sc.exe description "meter-verse-frontend" "Meter Verse UI - Next.js on port 3000"
Write-Host "  ✅ meter-verse-frontend" -ForegroundColor Green

# 3. DB Admin
Write-Host "[3/4] Installing Meter Verse DB Admin..." -ForegroundColor Yellow
$dbaWrapper = Join-Path $DIR "run-dbadmin.bat"
sc.exe create "meter-verse-dbadmin" binPath="cmd /c `"$dbaWrapper`"" start=auto DisplayName="Meter Verse DB Admin"
sc.exe description "meter-verse-dbadmin" "Database Administration UI on port 4001"
Write-Host "  ✅ meter-verse-dbadmin" -ForegroundColor Green

# 4. PostgreSQL
Write-Host "[4/4] Checking PostgreSQL..." -ForegroundColor Yellow
$pg = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pg) {
    Write-Host "  ✅ PostgreSQL found: $($pg.Name)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ PostgreSQL not found - install manually" -ForegroundColor Red
}

Write-Host ""
Write-Host "Starting all services..." -ForegroundColor Yellow
Start-Service "meter-verse-backend" -ErrorAction SilentlyContinue
Start-Service "meter-verse-frontend" -ErrorAction SilentlyContinue  
Start-Service "meter-verse-dbadmin" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "=== ✅ ALL 3 SERVICES INSTALLED ===" -ForegroundColor Green
Write-Host ""
Write-Host "Open services.msc to manage:" -ForegroundColor Cyan
Write-Host "  - Meter Verse Backend  (port 3001)" -ForegroundColor White
Write-Host "  - Meter Verse Frontend (port 3000)" -ForegroundColor White  
Write-Host "  - Meter Verse DB Admin (port 4001)" -ForegroundColor White
Write-Host ""
Write-Host "All 3 set to Automatic startup." -ForegroundColor Green
Write-Host "They start with Windows and stay running." -ForegroundColor Green
