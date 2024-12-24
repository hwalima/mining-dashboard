import os
import django
import sys
from datetime import datetime, timedelta
from decimal import Decimal
import random

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import DailyProductionLog

def seed_production_data():
    # Generate data for Jan 2023 to Dec 2024
    start_date = datetime(2023, 1, 1).date()
    end_date = datetime(2024, 12, 14).date()  # Up to December 14, 2024
    
    current_date = start_date
    while current_date <= end_date:
        # Check if data exists for this date
        if not DailyProductionLog.objects.filter(date=current_date).exists():
            # Generate realistic mining data
            base_tonnage = random.uniform(800, 1200)  # Base tonnage for crushing
            recovery_rate = random.uniform(90, 98)  # High recovery rate for gold
            efficiency = random.uniform(85, 95)  # Good operational efficiency
            gold_price = random.uniform(1900, 2100)  # Gold price per gram in USD
            
            # Calculate derived values with realistic relationships
            tonnage_hoisted = base_tonnage * (random.uniform(0.92, 0.98))  # Slightly less than crushed
            smelted_gold = (tonnage_hoisted * random.uniform(0.005, 0.008) * (recovery_rate/100))  # Gold output based on tonnage and recovery
            
            # Create the production log
            log = DailyProductionLog(
                date=current_date,
                total_tonnage_crushed=Decimal(str(round(base_tonnage, 2))),
                total_tonnage_hoisted=Decimal(str(round(tonnage_hoisted, 2))),
                gold_recovery_rate=Decimal(str(round(recovery_rate, 2))),
                operational_efficiency=Decimal(str(round(efficiency, 2))),
                smelted_gold=Decimal(str(round(smelted_gold, 2))),
                gold_price=Decimal(str(round(gold_price, 2))),
                notes=f'Production data for {current_date}'
            )
            
            # The save method will automatically calculate gross_profit
            log.save()
            print(f'Created data for {current_date}')
        else:
            print(f'Data already exists for {current_date}')
        
        current_date += timedelta(days=1)

if __name__ == '__main__':
    print('Seeding gold production data from Jan 2023 to Dec 2024...')
    seed_production_data()
    print('Done!')
