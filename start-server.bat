@echo off
cd /d "%~dp0"
echo Starting NBA News Server on port 3000...
set PORT=3000
node server.js
pause 