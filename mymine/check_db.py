from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

with connection.cursor() as cursor:
    # Get table info
    cursor.execute("SELECT * FROM sqlite_master WHERE type='table' AND name='mining_operations_dailyproductionlog';")
    table_info = cursor.fetchone()
    print("\nTable Schema:")
    print(table_info[4])  # This is the CREATE TABLE statement
    
    # Get a sample record
    cursor.execute("SELECT * FROM mining_operations_dailyproductionlog LIMIT 1;")
    columns = [description[0] for description in cursor.description]
    record = cursor.fetchone()
    
    print("\nColumns:")
    for i, col in enumerate(columns):
        value = record[i] if record else None
        print(f"{col}: {value} ({type(value).__name__})")
