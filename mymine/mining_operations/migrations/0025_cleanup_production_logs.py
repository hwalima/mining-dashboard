# Generated manually
from django.db import migrations

def cleanup_and_seed_data(apps, schema_editor):
    db_alias = schema_editor.connection.alias
    
    # Step 1: Create new table with desired schema
    schema_editor.execute("""
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
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            modified_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Step 2: Copy data to new table, handling duplicates by taking the most recent entry
    schema_editor.execute("""
        WITH RankedLogs AS (
            SELECT 
                date,
                total_tonnage_crushed,
                gold_recovery_rate,
                operational_efficiency,
                smelted_gold,
                gold_price,
                gross_profit,
                notes,
                ROW_NUMBER() OVER (PARTITION BY date ORDER BY id DESC) as rn
            FROM mining_operations_dailyproductionlog
        )
        INSERT INTO mining_operations_dailyproductionlog_new (
            date,
            total_tonnage_crushed,
            total_tonnage_milled,
            gold_recovery_rate,
            operational_efficiency,
            smelted_gold,
            gold_price,
            gross_profit,
            notes
        )
        SELECT
            date,
            total_tonnage_crushed,
            total_tonnage_crushed,  -- Initialize milled tonnage equal to crushed
            gold_recovery_rate,
            operational_efficiency,
            smelted_gold,
            gold_price,
            gross_profit,
            notes
        FROM RankedLogs
        WHERE rn = 1
    """)

    # Step 3: Replace old table with new one
    schema_editor.execute("DROP TABLE mining_operations_dailyproductionlog")
    schema_editor.execute("""
        ALTER TABLE mining_operations_dailyproductionlog_new
        RENAME TO mining_operations_dailyproductionlog
    """)

def reverse_cleanup(apps, schema_editor):
    # This is a destructive change, so we'll just pass for reverse migration
    pass

class Migration(migrations.Migration):
    dependencies = [
        ('mining_operations', '0024_fix_gold_production_fields'),
    ]

    operations = [
        migrations.RunPython(cleanup_and_seed_data, reverse_cleanup),
    ]
