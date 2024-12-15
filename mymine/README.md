# MyMine: Gold Mine Production Management System

## Project Overview
MyMine is a comprehensive web application for managing gold mining operations, providing robust tracking, analysis, and visualization of mining activities.

## Setup Instructions

### Prerequisites
- Python 3.12+
- pip
- virtualenv

### Installation Steps
1. Clone the repository
2. Create a virtual environment:
   ```
   python -m venv mymine_env
   source mymine_env/bin/activate  # On Windows: mymine_env\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up database:
   ```
   python manage.py migrate
   ```
5. Create superuser:
   ```
   python manage.py createsuperuser
   ```
6. Run development server:
   ```
   python manage.py runserver
   ```

## Key Features
- Role-based access control
- Comprehensive mining operations tracking
- Interactive dashboard
- Real-time data visualization
- Advanced reporting

## Technology Stack
- Backend: Django
- Frontend: React (separate repository)
- Database: SQLite
- Additional Technologies: 
  * Django Rest Framework
  * GraphQL
  * Celery
  * Redis

## Development Workflow
1. Create feature branch
2. Implement changes
3. Write tests
4. Run tests
5. Create pull request

## Testing
Run tests using:
```
pytest
```

## License
Proprietary - All Rights Reserved
