from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

def execute_sql(cursor, sql):
    for statement in sql.split(';'):
        if statement.strip():
            cursor.execute(statement.strip())

with connection.cursor() as cursor:
    # Update total_tonnage_hoisted to 0 where it's NULL in both tables
    execute_sql(cursor, """
        UPDATE mining_operations_dailyproductionlog 
        SET total_tonnage_hoisted = 0
        WHERE total_tonnage_hoisted IS NULL;
        
        UPDATE mining_operations_historicaldailyproductionlog 
        SET total_tonnage_hoisted = 0
        WHERE total_tonnage_hoisted IS NULL
    """)
    
    print("Successfully updated total_tonnage_hoisted field to be non-nullable with default value of 0")
