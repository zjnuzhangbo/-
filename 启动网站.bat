@echo off
cd /d "%~dp0"
echo ==============================
echo   TricycleParts 启动菜单
echo ==============================
echo.
echo   1. 客户端（产品浏览/下单）
echo   2. 管理后台（商品/订单管理）
echo.
set /p choice=请输入 1 或 2:

if "%choice%"=="1" goto client
if "%choice%"=="2" goto admin
echo 无效选择 & pause & exit

:client
start http://localhost:5173
goto start

:admin
start http://localhost:5173/admin.html
goto start

:start
echo.
echo 服务地址: http://localhost:5173
echo 按 Ctrl+C 停止服务
echo.
npx vite --port 5173 --host
pause
