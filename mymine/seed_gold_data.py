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

def seed_gold_data():
    # Generate data for the last 14 days
    end_date = datetime(2024, 12, 14).date()  # Up to December 14
    start_date = end_date - timedelta(days=13)  # Last 14 days
    
    current_date = start_date
    while current_date <= end_date:
        # Check if data exists for this date
        if not DailyProductionLog.objects.filter(date=current_date).exists():
            # Generate realistic mining data
            base_tonnage = random.uniform(800, 1200)
            recovery_rate = random.uniform(90, 98)
            efficiency = random.uniform(85, 95)
            gold_price = random.uniform(1900, 2100)
            
            # Calculate derived values
            tonnage_hoisted = base_tonnage * (random.uniform(0.90, 0.98))
            tonnage_milled = tonnage_hoisted * (random.uniform(0.90, 0.98))
            smelted_gold = (tonnage_milled * random.uniform(0.005, 0.008) * (recovery_rate/100))
            gross_profit = smelted_gold * gold_price
            
            DailyProductionLog.objects.create(
                date=current_date,
                total_tonnage_crushed=Decimal(str(round(base_tonnage, 2))),
                total_tonnage_hoisted=Decimal(str(round(tonnage_hoisted, 2))),
                total_tonnage_milled=Decimal(str(round(tonnage_milled, 2))),
                gold_recovery_rate=Decimal(str(round(recovery_rate, 2))),
                operational_efficiency=Decimal(str(round(efficiency, 2))),
                smelted_gold=Decimal(str(round(smelted_gold, 2))),
                gold_price=Decimal(str(round(gold_price, 2))),
                gross_profit=Decimal(str(round(gross_profit, 2))),
                notes=f'Production data for {current_date}'
            )
            print(f'Created data for {current_date}')
        else:
            print(f'Data already exists for {current_date}')
        
        current_date += timedelta(days=1)

if __name__ == '__main__':
    print('Checking and seeding gold production data...')
    seed_gold_data()
    print('Done!')
