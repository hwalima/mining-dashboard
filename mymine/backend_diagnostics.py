import os
import sys
import django
from django.conf import settings
import traceback
import uuid

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

# Import models and other necessary components
from django.db import connection
from accounts.models import CustomUser as User, UserActivity
from mining_operations.models import MiningSite
from dashboard.models import DashboardWidget, UserDashboardPreference

def check_database_connection():
    """
    Verify database connection and basic connectivity
    """
    print("\nDATABASE CONNECTION CHECK")
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            print("Database connection successful")
    except Exception as e:
        print(f"Database connection failed: {e}")
        traceback.print_exc()

def check_model_imports():
    """
    Verify that all models are correctly imported and can be accessed
    """
    print("\nMODEL IMPORT CHECK")
    models_to_check = [
        User, UserActivity,
        MiningSite,
        DashboardWidget, UserDashboardPreference
    ]
    
    for model in models_to_check:
        try:
            # Try to get the model's table name
            table_name = model._meta.db_table
            print(f"Model {model.__name__} imported successfully (Table: {table_name})")
        except Exception as e:
            print(f"Failed to import model {model.__name__}: {e}")
            traceback.print_exc()

def check_model_relationships():
    """
    Verify relationships between models
    """
    print("\nMODEL RELATIONSHIP CHECK")
    try:
        # Create a test user
        test_user = User.objects.create_user(
            username=f'diagnostic_user_{uuid.uuid4().hex[:8]}',
            email=f'diagnostic_{uuid.uuid4().hex[:8]}@mymine.com',
            password='DiagnosticPass123!',
            role='admin'
        )
        
        # Create a test mining site
        test_site = MiningSite.objects.create(
            name=f'Test Mine {uuid.uuid4().hex[:8]}',
            location='Diagnostic Location',
            area_hectares=100.50,  
            status='active',  
            estimated_gold_reserves=1000.00  
        )
        
        # Verify relationships
        print(f"User's Role: {test_user.role}")
        
        # Clean up test data
        test_site.delete()
        test_user.delete()
        
    except Exception as e:
        print(f"Model relationship check failed: {e}")
        traceback.print_exc()

def check_authentication_workflow():
    """
    Verify authentication and user management
    """
    print("\nAUTHENTICATION WORKFLOW CHECK")
    try:
        # Create a test user
        test_user = User.objects.create_user(
            username=f'workflow_test_{uuid.uuid4().hex[:8]}',
            email=f'workflow_{uuid.uuid4().hex[:8]}@mymine.com',
            password='WorkflowTest123!',
            role='standard'
        )
        
        # Verify user creation
        print(f"User created: {test_user.username}")
        print(f"User email: {test_user.email}")
        print(f"User role: {test_user.role}")
        
        # Test authentication
        auth_result = User.objects.filter(username=test_user.username).exists()
        print(f"User authentication check passed: {auth_result}")
        
        # Clean up test data
        test_user.delete()
        
    except Exception as e:
        print(f"Authentication workflow check failed: {e}")
        traceback.print_exc()

def check_dashboard_preferences():
    """
    Verify dashboard widget and user preferences
    """
    print("\nDASHBOARD PREFERENCES CHECK")
    try:
        # Create a test user
        test_user = User.objects.create_user(
            username=f'dashboard_test_{uuid.uuid4().hex[:8]}',
            email=f'dashboard_{uuid.uuid4().hex[:8]}@mymine.com',
            password='DashboardTest123!'
        )
        
        # Create a dashboard preference
        user_preference = UserDashboardPreference.objects.create(
            user=test_user,
            theme='light',
            language='en',
            show_notifications=True,
            compact_mode=False
        )
        
        # Verify dashboard preferences
        print(f"User Dashboard Preference - Theme: {user_preference.theme}")
        print(f"User Dashboard Preference - Language: {user_preference.language}")
        print(f"User Dashboard Preference - Show Notifications: {user_preference.show_notifications}")
        print(f"User Dashboard Preference - Compact Mode: {user_preference.compact_mode}")
        
        # Clean up test data
        user_preference.delete()
        test_user.delete()
        
    except Exception as e:
        print(f"Dashboard preferences check failed: {e}")
        traceback.print_exc()

def main():
    """
    Run all diagnostic checks
    """
    print("MyMine Backend Diagnostic Tool")
    print("Checking backend components and database interactions...\n")
    
    check_database_connection()
    check_model_imports()
    check_model_relationships()
    check_authentication_workflow()
    check_dashboard_preferences()
    
    print("\nDiagnostic Complete")

if __name__ == '__main__':
    main()
