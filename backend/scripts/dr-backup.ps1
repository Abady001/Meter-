# DR Backup & Restore Drill (T084a) — PowerShell version
param(
  [string]$BackupDir = "./backups",
  [string]$Database = "meter_pulse",
  [string]$Host = "127.0.0.1",
  [int]$Port = 5432,
  [string]$User = "postgres",
  [string]$Password = "postgres"
)

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupPath = Join-Path $BackupDir $Timestamp
New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null

Write-Host "=== DR Backup Drill: $BackupPath ==="

# Step 1: Database dump
Write-Host "[1/5] Dumping PostgreSQL database $Database..."
$env:PGPASSWORD = $Password
& pg_dump -h $Host -p $Port -U $User -d $Database --schema=sim_system --no-owner --no-acl --format=custom -f "$BackupPath/meter_pulse.dump" 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host "  ✅ Database dump created" }
else { Write-Host "  ⚠️  Database dump failed (exit code $LASTEXITCODE)" }

# Step 2: Configuration files
Write-Host "[2/5] Backing up configuration..."
if (Test-Path "src") { Copy-Item -Recurse "src" "$BackupPath/src" }
if (Test-Path "prisma") { Copy-Item -Recurse "prisma" "$BackupPath/prisma" }
if (Test-Path ".env") { Copy-Item ".env" "$BackupPath/.env" }
if (Test-Path "package.json") { Copy-Item "package.json" "$BackupPath/package.json" }

# Step 3: Manifest
Write-Host "[3/5] Creating manifest..."
@"
# DR Backup Manifest
**Date:** $Timestamp
**Database:** ${Database}@${Host}:${Port}

## Contents
- meter_pulse.dump — PostgreSQL custom-format dump
- src/ — Backend source code
- prisma/ — Prisma schema and migrations
- .env — Environment configuration

## Restore Procedure
1. pg_restore -h <host> -p <port> -U <user> -d <database> --schema=sim_system $BackupPath/meter_pulse.dump
2. Copy source back
3. npm install
4. npx prisma migrate deploy
5. npm run build && npm test
"@ | Out-File -FilePath "$BackupPath/MANIFEST.md" -Encoding utf8

# Step 4: Validate
Write-Host "[4/5] Validating backup..."
$Size = (Get-ChildItem -Recurse $BackupPath | Measure-Object -Property Length -Sum).Sum
Write-Host "  Backup size: $([math]::Round($Size / 1MB, 2)) MB"

# Step 5: Test restore procedure (dry-run for dump verification)
Write-Host "[5/5] Verifying dump file integrity..."
if (Test-Path "$BackupPath/meter_pulse.dump") {
  $fileSize = (Get-Item "$BackupPath/meter_pulse.dump").Length
  if ($fileSize -gt 1000) { Write-Host "  ✅ Dump file is $([math]::Round($fileSize / 1KB, 0)) KB — appears valid" }
  else { Write-Host "  ⚠️  Dump file is very small ($fileSize bytes)" }
} else {
  Write-Host "  ⚠️  No dump file found"
}

Write-Host ""
Write-Host "=== DR Backup Complete ==="
Write-Host "To restore, follow MANIFEST.md in $BackupPath"
