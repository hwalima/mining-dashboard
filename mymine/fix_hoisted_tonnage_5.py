from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from django.db import connection

with connection.cursor() as cursor:
    # Update total_tonnage_hoisted to 0 where it's NULL in both tables
    cursor.execute("""
        UPDATE mining_operations_dailyproductionlog 
        SET total_tonnage_hoisted = 0
        WHERE total_tonnage_hoisted IS NULL
    """)
    
    cursor.execute("""
        UPDATE mining_operations_historicaldailyproductionlog 
        SET total_tonnage_hoisted = 0
        WHERE total_tonnage_hoisted IS NULL
    """)
    
    # Make the columns non-nullable with default value 0
    cursor.execute("""
        PRAGMA foreign_keys=off;
        
        BEGIN TRANSACTION;
        
        -- For dailyproductionlog
        ALTER TABLE mining_operations_dailyproductionlog RENAME TO temp_dailyproductionlog;
        CREATE TABLE mining_operations_dailyproductionlog (
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
        );
        INSERT INTO mining_operations_dailyproductionlog 
        SELECT * FROM temp_dailyproductionlog;
        DROP TABLE temp_dailyproductionlog;
        
        -- For historicaldailyproductionlog
        ALTER TABLE mining_operations_historicaldailyproductionlog RENAME TO temp_historicaldailyproductionlog;
        CREATE TABLE mining_operations_historicaldailyproductionlog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        );
        INSERT INTO mining_operations_historicaldailyproductionlog 
        SELECT * FROM temp_historicaldailyproductionlog;
        DROP TABLE temp_historicaldailyproductionlog;
        
        COMMIT;
        
        PRAGMA foreign_keys=on;
    """)
    
    print("Successfully updated tables with consistent total_tonnage_hoisted field")
