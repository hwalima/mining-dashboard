from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

with connection.cursor() as cursor:
    # Get column info
    cursor.execute("""
        PRAGMA table_info(mining_operations_dailyproductionlog)
    """)
    columns = cursor.fetchall()
    print("\nDailyProductionLog columns:")
    for col in columns:
        print(f"{col[1]}: {col[2]} (nullable: {not col[3]})")
    
    # Check for null values
    cursor.execute("""
        SELECT COUNT(*) 
        FROM mining_operations_dailyproductionlog 
        WHERE total_tonnage_hoisted IS NULL
    """)
    null_count = cursor.fetchone()[0]
    print(f"\nNull values in total_tonnage_hoisted: {null_count}")
    
    # Get a sample of records
    cursor.execute("""
        SELECT date, total_tonnage_hoisted 
        FROM mining_operations_dailyproductionlog 
        LIMIT 5
    """)
    records = cursor.fetchall()
    print("\nSample records:")
    for record in records:
        print(f"Date: {record[0]}, Hoisted: {record[1]}")
