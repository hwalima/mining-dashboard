from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

with connection.cursor() as cursor:
    # Get all columns from both tables
    cursor.execute("PRAGMA table_info(mining_operations_dailyproductionlog)")
    print("\nColumns in dailyproductionlog:")
    for col in cursor.fetchall():
        print(f"  {col[1]}: {col[2]} (nullable: {not col[3]})")
    
    cursor.execute("PRAGMA table_info(mining_operations_historicaldailyproductionlog)")
    print("\nColumns in historicaldailyproductionlog:")
    for col in cursor.fetchall():
        print(f"  {col[1]}: {col[2]} (nullable: {not col[3]})")
