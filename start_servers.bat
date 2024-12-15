@echo off
echo Starting servers...

REM Create a new window for Django server
start "Django Server" cmd /k "cd mymine && py manage.py runserver 8000"

REM Wait for Django to start
timeout /t 5 /nobreak

REM Create a new window for Vite dev server
start "Frontend Server" cmd /k "cd frontend-new && npm run dev"

echo.
echo Servers are starting up!
echo Django server will be available at: http://localhost:8000
echo Frontend server will be available at: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul
