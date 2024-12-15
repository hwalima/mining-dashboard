@echo off
REM Activate virtual environment
call c:\Mining\mymine_env\Scripts\activate

REM Change to project directory
cd c:\Mining\mymine

REM Run database migrations
python manage.py migrate

REM Start Django development server
python manage.py runserver 0.0.0.0:8000
