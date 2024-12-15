@echo off
echo Stopping servers...

REM Kill any running Python processes (Django)
taskkill /F /IM python.exe /T 2>nul
taskkill /F /IM py.exe /T 2>nul

REM Kill any running Node processes (Vite/React)
taskkill /F /IM node.exe /T 2>nul

echo All servers stopped successfully!
