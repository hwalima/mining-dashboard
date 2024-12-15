from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

with connection.cursor() as cursor:
    # Drop temporary tables if they exist
    cursor.execute("DROP TABLE IF EXISTS mining_operations_dailyproductionlog_new")
    cursor.execute("DROP TABLE IF EXISTS mining_operations_historicaldailyproductionlog_new")
    
    # Update the main table
    cursor.execute("""
        UPDATE mining_operations_dailyproductionlog 
        SET total_tonnage_hoisted = COALESCE(total_tonnage_hoisted, 0)
    """)
    
    # Make the column non-nullable
    cursor.execute("""
        CREATE TABLE mining_operations_dailyproductionlog_new (
            date DATE PRIMARY KEY,
            total_tonnage_crushed DECIMAL(10, 2) NOT NULL,
            total_tonnage_milled DECIMAL(10, 2) NOT NULL,
            gold_recovery_rate DECIMAL(5, 2) NOT NULL,
            operational_efficiency DECIMAL(5, 2) NOT NULL,
            smelted_gold DECIMAL(10, 2) NOT NULL,
            gold_price DECIMAL(10, 2) NOT NULL,
            gross_profit DECIMAL(15, 2) NOT NULL,
            notes TEXT NULL,
            created_at DATETIME NOT NULL,
            modified_at DATETIME NOT NULL,
            total_tonnage_hoisted DECIMAL(10, 2) NOT NULL DEFAULT 0
        )
    """)
    
    cursor.execute("""
        INSERT INTO mining_operations_dailyproductionlog_new
        SELECT date, total_tonnage_crushed, total_tonnage_milled,
               gold_recovery_rate, operational_efficiency, smelted_gold,
               gold_price, gross_profit, notes, created_at, modified_at,
               COALESCE(total_tonnage_hoisted, 0)
        FROM mining_operations_dailyproductionlog
    """)
    
    cursor.execute("DROP TABLE mining_operations_dailyproductionlog")
    cursor.execute("ALTER TABLE mining_operations_dailyproductionlog_new RENAME TO mining_operations_dailyproductionlog")
    
    # Update the history table
    cursor.execute("""
        UPDATE mining_operations_historicaldailyproductionlog 
        SET total_tonnage_hoisted = COALESCE(total_tonnage_hoisted, 0)
    """)
    
    cursor.execute("""
        CREATE TABLE mining_operations_historicaldailyproductionlog_new (
            id INTEGER PRIMARY KEY,
            date DATE NOT NULL,
            total_tonnage_crushed DECIMAL(10, 2) NOT NULL,
            total_tonnage_hoisted DECIMAL(10, 2) NOT NULL DEFAULT 0,
            gold_recovery_rate DECIMAL(5, 2) NOT NULL,
            operational_efficiency DECIMAL(5, 2) NOT NULL,
            notes TEXT NULL,
            history_id INTEGER NOT NULL,
            history_date DATETIME NOT NULL,
            history_change_reason VARCHAR(100) NULL,
            history_type VARCHAR(1) NOT NULL,
            history_user_id INTEGER NULL,
            site_id INTEGER NULL
        )
    """)
    
    cursor.execute("""
        INSERT INTO mining_operations_historicaldailyproductionlog_new
        SELECT id, date, total_tonnage_crushed, COALESCE(total_tonnage_hoisted, 0),
               gold_recovery_rate, operational_efficiency, notes,
               history_id, history_date, history_change_reason,
               history_type, history_user_id, site_id
        FROM mining_operations_historicaldailyproductionlog
        ORDER BY id
    """)
    
    cursor.execute("DROP TABLE mining_operations_historicaldailyproductionlog")
    cursor.execute("ALTER TABLE mining_operations_historicaldailyproductionlog_new RENAME TO mining_operations_historicaldailyproductionlog")
    
    print("Successfully updated tables with consistent total_tonnage_hoisted field")
