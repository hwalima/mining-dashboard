@echo off
REM Staging Deployment Script

REM Activate virtual environment
call c:\Mining\mymine_env\Scripts\activate

REM Change to project directory
cd c:\Mining\mymine

REM Set environment to staging
set DJANGO_SETTINGS_MODULE=mymine.production
set ENV_FILE=.env.staging

REM Apply migrations
python manage.py migrate

REM Collect static files
python manage.py collectstatic --noinput

REM Run tests
python manage.py test

REM Start server on different port
python manage.py runserver 0.0.0.0:8001
