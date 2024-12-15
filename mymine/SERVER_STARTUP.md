# MyMine Backend Server Startup Guide

## Prerequisites
- Python 3.12
- Virtual Environment: `mymine_env`
- All dependencies installed

## Startup Methods

### 1. Using Batch/Shell Script
#### Windows
```bash
start_server.bat
```

#### Unix/Mac
```bash
chmod +x start_server.sh
./start_server.sh
```

### 2. Manual Startup (Recommended for Development)

#### Activate Virtual Environment
```bash
# Windows
c:\Mining\mymine_env\Scripts\activate

# Unix/Mac
source ../mymine_env/bin/activate
```

#### Navigate to Project Directory
```bash
cd c:\Mining\mymine
```

#### Run Migrations
```bash
python manage.py migrate
```

#### Start Development Server
```bash
# Standard Local Access
python manage.py runserver

# Network-wide Access
python manage.py runserver 0.0.0.0:8000
```

## Server Configuration Options

### Ports
- Default: 8000
- Customizable: Change port number after `runserver`
- Example: `python manage.py runserver 8080`

### Network Access
- `127.0.0.1` or `localhost`: Local access only
- `0.0.0.0`: Accessible from other network devices

## Debugging and Troubleshooting

### Common Issues
1. **Port Already in Use**
   - Kill existing process
   - Windows: `netstat -ano | findstr :8000`
   - Unix: `lsof -i :8000`

2. **Dependency Problems**
   ```bash
   pip install -r requirements.txt
   ```

3. **Migration Errors**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

## Production Deployment
- Use Gunicorn or uWSGI
- Configure with Nginx
- Set `DEBUG = False` in `settings.py`
- Use environment variables for sensitive information

## Recommended Development Workflow
1. Activate virtual environment
2. Run migrations
3. Start development server
4. Open `http://localhost:8000/api/docs/` for API documentation
