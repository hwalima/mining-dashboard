from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

with connection.cursor() as cursor:
    # Add the new column
    cursor.execute("""
        ALTER TABLE mining_operations_dailyproductionlog 
        ADD COLUMN total_tonnage_hoisted DECIMAL(10,2) DEFAULT 0
    """)
    
    cursor.execute("""
        ALTER TABLE mining_operations_historicaldailyproductionlog 
        ADD COLUMN total_tonnage_hoisted DECIMAL(10,2) DEFAULT 0
    """)
    
    print("Added total_tonnage_hoisted column to both tables")
