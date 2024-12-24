import os
import django
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import DailyProductionLog, MiningSite

def create_gold_production_data():
    try:
        # Find the latest date in existing data
        latest_record = DailyProductionLog.objects.order_by('-date').first()
        if latest_record:
            start_date = latest_record.date + timedelta(days=1)
        else:
            start_date = datetime(2023, 1, 1, tzinfo=timezone.utc).date()

        end_date = datetime(2024, 12, 21, tzinfo=timezone.utc).date()
        
        if start_date > end_date:
            print("Data is already up to date.")
            return

        print(f"Generating gold production data from {start_date} to {end_date}...")

        # Get the mining site
        site = MiningSite.objects.first()
        if not site:
            print("No mining site found. Please create a mining site first.")
            return

        # Base values for realistic mining operation
        base_tonnage_crushed = 5000  # 5000 tonnes per day
        base_tonnage_hoisted = 5500  # Slightly more than crushed
        base_tonnage_milled = 4800   # Slightly less than crushed
        base_gold_recovery = 92.0    # 92% recovery rate
        base_operational_efficiency = 85.0  # 85% operational efficiency
        base_gold_price = 60.0       # $60 per gram (approximate)

        days_created = 0

        current_date = start_date

        while current_date <= end_date:
            # Add some random variation to base values
            variation = lambda base, percent: base * (1 + random.uniform(-percent, percent))
            
            # Weekend effect - reduce production by 20-30%
            weekend_factor = 0.7 if current_date.weekday() >= 5 else 1.0
            
            # Seasonal effect - slightly lower production in winter months
            month = current_date.month
            seasonal_factor = 0.9 if month in [6, 7, 8] else 1.0  # Southern hemisphere winter
            
            # Calculate daily values with variation and factors
            tonnage_crushed = variation(base_tonnage_crushed, 0.15) * weekend_factor * seasonal_factor
            tonnage_hoisted = variation(base_tonnage_hoisted, 0.15) * weekend_factor * seasonal_factor
            tonnage_milled = variation(base_tonnage_milled, 0.15) * weekend_factor * seasonal_factor
            gold_recovery = variation(base_gold_recovery, 0.05)
            operational_efficiency = variation(base_operational_efficiency, 0.1)
            
            # Calculate gold production based on milled tonnage and recovery rate
            # Assume 3 grams per tonne average grade
            grade = variation(3.0, 0.2)  # Grade varies by ±20%
            smelted_gold = (tonnage_milled * grade * gold_recovery / 100.0)
            
            # Gold price with market variation
            gold_price = variation(base_gold_price, 0.1)
            gross_profit = smelted_gold * gold_price

            # Create the production log
            DailyProductionLog.objects.create(
                date=current_date,
                total_tonnage_crushed=round(Decimal(tonnage_crushed), 2),
                total_tonnage_hoisted=round(Decimal(tonnage_hoisted), 2),
                total_tonnage_milled=round(Decimal(tonnage_milled), 2),
                gold_recovery_rate=round(Decimal(gold_recovery), 2),
                operational_efficiency=round(Decimal(operational_efficiency), 2),
                smelted_gold=round(Decimal(smelted_gold), 2),
                gold_price=round(Decimal(gold_price), 2),
                gross_profit=round(Decimal(gross_profit), 2)
            )

            days_created += 1
            if days_created % 100 == 0:
                print(f"Created {days_created} days of production data...")

            current_date += timedelta(days=1)

        print(f"Successfully created {days_created} days of production data.")

    except Exception as e:
        print(f"Error creating production data: {str(e)}")

if __name__ == '__main__':
    create_gold_production_data()
