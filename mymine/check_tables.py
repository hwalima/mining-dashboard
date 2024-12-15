from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

with connection.cursor() as cursor:
    # Get all tables
    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name LIKE 'mining_operations_%'
    """)
    tables = cursor.fetchall()
    
    print("\nChecking tables for total_tonnage_hoisted column:")
    for table in tables:
        table_name = table[0]
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        has_column = any(col[1] == 'total_tonnage_hoisted' for col in columns)
        print(f"\n{table_name}:")
        if has_column:
            print("✓ Has total_tonnage_hoisted column")
            # Show column details
            for col in columns:
                if col[1] == 'total_tonnage_hoisted':
                    print(f"  Type: {col[2]}")
                    print(f"  Nullable: {not col[3]}")
                    print(f"  Default: {col[4]}")
        else:
            print("✗ Does not have total_tonnage_hoisted column")
