from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

def execute_sql(cursor, sql):
    cursor.execute(sql)
    columns = [col[0] for col in cursor.description]
    return columns, cursor.fetchall()

with connection.cursor() as cursor:
    # Check for any NULL values in total_tonnage_hoisted
    print("Checking DailyProductionLog for NULL values in total_tonnage_hoisted:")
    columns, results = execute_sql(cursor, """
        SELECT date, total_tonnage_hoisted
        FROM mining_operations_dailyproductionlog
        WHERE total_tonnage_hoisted IS NULL
    """)
    if not results:
        print("No NULL values found in DailyProductionLog")
    else:
        print(f"Found {len(results)} NULL values in DailyProductionLog")
        
    print("\nChecking HistoricalDailyProductionLog for NULL values in total_tonnage_hoisted:")
    columns, results = execute_sql(cursor, """
        SELECT date, total_tonnage_hoisted
        FROM mining_operations_historicaldailyproductionlog
        WHERE total_tonnage_hoisted IS NULL
    """)
    if not results:
        print("No NULL values found in HistoricalDailyProductionLog")
    else:
        print(f"Found {len(results)} NULL values in HistoricalDailyProductionLog")
        
    # Show table structure
    print("\nTable structure for DailyProductionLog:")
    cursor.execute("PRAGMA table_info(mining_operations_dailyproductionlog)")
    for col in cursor.fetchall():
        print(f"  {col[1]}: {col[2]} {'NOT NULL' if col[3] else 'NULL'} {' DEFAULT ' + str(col[4]) if col[4] is not None else ''}")
        
    print("\nTable structure for HistoricalDailyProductionLog:")
    cursor.execute("PRAGMA table_info(mining_operations_historicaldailyproductionlog)")
    for col in cursor.fetchall():
        print(f"  {col[1]}: {col[2]} {'NOT NULL' if col[3] else 'NULL'} {' DEFAULT ' + str(col[4]) if col[4] is not None else ''}")
