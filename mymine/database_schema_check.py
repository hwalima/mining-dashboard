import os
import sys
import django
from django.db import connection
from django.apps import apps

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

def get_table_columns(table_name):
    """
    Retrieve column names for a given table
    """
    with connection.cursor() as cursor:
        try:
            # SQLite-specific column retrieval
            cursor.execute(f"PRAGMA table_info({table_name})")
            return {row[1] for row in cursor.fetchall()}
        except Exception as e:
            print(f"Error retrieving columns for {table_name}: {e}")
            return set()

def verify_model_schema():
    """
    Comprehensively verify database schema against Django models
    """
    print("Database Schema Verification Tool")
    print("====================================")
    
    # Get all registered models
    all_models = apps.get_models()
    
    # Track verification results
    total_models = 0
    verified_models = 0
    
    for model in all_models:
        # Get the table name
        table_name = model._meta.db_table
        
        # Skip Django's internal models
        if table_name.startswith('django_') or table_name.startswith('auth_'):
            continue
        
        total_models += 1
        print(f"\nChecking Model: {model.__name__}")
        print(f"Table Name: {table_name}")
        
        # Get database columns
        db_columns = get_table_columns(table_name)
        
        # Get model fields
        model_fields = {field.column for field in model._meta.fields}
        
        # Compare database columns with model fields
        missing_in_db = model_fields - db_columns
        extra_in_db = db_columns - model_fields
        
        print("Field Verification:")
        if missing_in_db:
            print(f"Missing Fields in Database: {missing_in_db}")
        else:
            print("All model fields present in database")
        
        if extra_in_db:
            print(f"Extra Fields in Database: {extra_in_db}")
        else:
            print("No extra fields in database")
        
        # If no discrepancies, mark as verified
        if not missing_in_db and not extra_in_db:
            verified_models += 1
            print("Model Schema Verified")
        else:
            print("Schema Verification Failed")
    
    # Summary
    print("\nSchema Verification Summary")
    print(f"Total Models Checked: {total_models}")
    print(f"Fully Verified Models: {verified_models}")
    print(f"Verification Rate: {verified_models/total_models*100:.2f}%")

def list_all_tables():
    """
    List all tables in the database
    """
    print("\nDatabase Tables Inventory")
    print("============================")
    with connection.cursor() as cursor:
        # SQLite-specific table listing
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table in tables:
            table_name = table[0]
            print(f"Table: {table_name}")

def main():
    verify_model_schema()
    list_all_tables()

if __name__ == '__main__':
    main()
