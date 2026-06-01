@echo off
cd /d "%~dp0"
echo Starting TricycleParts - Client Store...
echo.
echo   客户端: http://localhost:5173
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173
npx vite --port 5173 --host
pause
