# PowerShell script to start backend and run test
$backendDir = "D:\meter\meter\backend"
$frontendDir = "D:\meter\Meter\Frontend"

# Start backend
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "node"
$psi.Arguments = "dist/src/main.js"
$psi.WorkingDirectory = $backendDir
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$proc = [System.Diagnostics.Process]::Start($psi)
Write-Output "Backend started (PID: $($proc.Id))"

# Wait for backend to be ready
Start-Sleep -Seconds 8

# Run Playwright test
Set-Location $frontendDir
$testResult = & node pw-test-run.cjs 2>&1
Write-Output $testResult

# Kill backend
$proc.Kill()
Write-Output "Backend stopped"
