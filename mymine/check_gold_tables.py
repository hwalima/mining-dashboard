from django.contrib.auth import get_user_model
import os
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import (
    DailyProductionLog,
    SmeltedGold,
    GoldMillingEquipment,
    StockpileVolume
)

def check_table(model, name):
    records = model.objects.all()
    print(f"\n=== {name} ===")
    print(f"Total records: {records.count()}")
    
    if records.exists():
        print("\nRecent records:")
        for record in records.order_by('-date')[:3]:  # Show last 3 records
            print(f"\nDate: {record.date}")
            # Print specific fields based on model
            if isinstance(record, DailyProductionLog):
                print(f"Crushed: {record.total_tonnage_crushed}t")
                print(f"Hoisted: {record.total_tonnage_hoisted}t")
                print(f"Recovery: {record.gold_recovery_rate}%")
                print(f"Smelted: {record.smelted_gold}g")
            elif isinstance(record, SmeltedGold):
                print(f"Weight: {record.total_weight}g")
                print(f"Purity: {record.purity_percentage}%")
                print(f"Value/g: ${record.market_value_per_gram}")
            elif isinstance(record, StockpileVolume):
                print(f"Ore: {record.ore_tons}t")
                print(f"Grade: {record.grade_gpt}g/t")
                print(f"Location: {record.location}")

# Check each table
check_table(DailyProductionLog, "Daily Production Logs")
check_table(SmeltedGold, "Smelted Gold Records")
check_table(StockpileVolume, "Stockpile Volumes")

# Check equipment
equipment = GoldMillingEquipment.objects.all()
print(f"\n=== Gold Milling Equipment ===")
print(f"Total equipment: {equipment.count()}")
if equipment.exists():
    print("\nCurrent equipment:")
    for eq in equipment:
        print(f"\nName: {eq.name}")
        print(f"Type: {eq.type}")
        print(f"Status: {eq.current_status}")
        print(f"Capacity: {eq.capacity_tons_per_hour}t/h")
        print(f"Efficiency: {eq.efficiency_percentage}%")
