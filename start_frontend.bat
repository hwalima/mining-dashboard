@echo off
echo Starting frontend server...

REM Create a new window for Vite dev server
start "Frontend Server" cmd /k "cd frontend-new && npm run dev"

echo.
echo Frontend server will be available at: http://localhost:5173
echo.
