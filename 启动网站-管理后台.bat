@echo off
cd /d "%~dp0"
echo Starting TricycleParts - Admin Panel...
echo.
echo   管理后台: http://localhost:5173/admin.html
echo   账号: admin  密码: 123456
echo.
timeout /t 2 /nobreak >nul
start http://localhost:5173/admin.html
npx vite --port 5173 --host
pause
