# Authentication Workflow Demonstration

## Prerequisites
1. Ensure Django development server is running:
   ```
   python manage.py runserver
   ```

2. Install requests library:
   ```
   pip install requests
   ```

## Workflow Steps
The `auth_workflow_demo.py` script demonstrates:
1. User Registration
2. Token Obtainment
3. Token Verification
4. User Profile Retrieval
5. Token Refresh
6. Logout

## Running the Demonstration
```
python auth_workflow_demo.py
```

## Expected Workflow
1. Register a new user with admin role
2. Obtain JWT access and refresh tokens
3. Verify the access token
4. Retrieve user profile using access token
5. Refresh the access token
6. Logout by blacklisting refresh token

## Troubleshooting
- Ensure Django server is running on localhost:8000
- Check network connectivity
- Verify all dependencies are installed
- Confirm database migrations are up to date
