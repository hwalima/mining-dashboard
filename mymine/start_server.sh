#!/bin/bash
# Activate virtual environment
source ../mymine_env/bin/activate

# Change to project directory
cd "$(dirname "$0")"

# Run database migrations
python manage.py migrate

# Start Django development server
python manage.py runserver 0.0.0.0:8000
