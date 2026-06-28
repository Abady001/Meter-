Write-Output "Starting backend..."
$backend = Start-Process -FilePath "node" -ArgumentList "dist/src/main.js" -WorkingDirectory "D:\meter\meter\backend" -PassThru
Write-Output "Backend PID: $($backend.Id)"

Write-Output "Starting frontend..."
$frontend = Start-Process -FilePath "bun" -ArgumentList "run dev" -WorkingDirectory "D:\meter\Meter\Frontend" -PassThru
Write-Output "Frontend PID: $($frontend.Id)"

Write-Output "Waiting 35 seconds for servers..."
Start-Sleep -Seconds 35

Write-Output "Running E4 test..."
Set-Location "D:\meter\Meter\Frontend"
$result = node test-e4.cjs 2>&1
Write-Output $result

Write-Output "Cleaning up..."
$backend.Kill()
$frontend.Kill()
Write-Output "Done"
