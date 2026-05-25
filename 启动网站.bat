@echo off
cd /d "%~dp0"
echo Starting TricycleParts...
start http://localhost:4173
npx vite preview --port 4173
pause
