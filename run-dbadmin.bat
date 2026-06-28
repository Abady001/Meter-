@echo off
cd /d "D:\meter\Meter\backend"
set ADMIN_USER=admin
set ADMIN_PASS=iskra_admin_2026
node "db-admin-server.js"
exit /b %errorLevel%
