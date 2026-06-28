# Meter Verse — Remove ALL Windows Services
# Run as Administrator

Write-Host "=== Removing Meter Verse Services ===" -ForegroundColor Cyan

Write-Host "Stopping..."
Stop-Service "meter-verse-backend" -ErrorAction SilentlyContinue
Stop-Service "meter-verse-frontend" -ErrorAction SilentlyContinue
Stop-Service "meter-verse-dbadmin" -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "Removing..."
sc.exe delete "meter-verse-backend" -ErrorAction SilentlyContinue
sc.exe delete "meter-verse-frontend" -ErrorAction SilentlyContinue
sc.exe delete "meter-verse-dbadmin" -ErrorAction SilentlyContinue

Write-Host "=== ✅ All 3 services removed ===" -ForegroundColor Green
Write-Host "(PostgreSQL was not touched)" -ForegroundColor Yellow
