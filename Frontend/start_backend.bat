@echo off
cd /d D:\meter\meter\backend
start /B node dist/src/main.js > backend.log 2>&1
echo Backend started
