@echo off
REM Production Deployment Script

REM Activate virtual environment
call c:\Mining\mymine_env\Scripts\activate

REM Change to project directory
cd c:\Mining\mymine

REM Set environment to production
set DJANGO_SETTINGS_MODULE=mymine.production
set ENV_FILE=.env.production

REM Apply migrations
python manage.py migrate

REM Collect static files
python manage.py collectstatic --noinput

REM Run tests
python manage.py test

REM Start server on different port
python manage.py runserver 0.0.0.0:8002
