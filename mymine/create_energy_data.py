import os
import django
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import EnergyUsage

def create_energy_usage_data():
    try:
        # Find the latest date in existing data
        latest_record = EnergyUsage.objects.order_by('-date').first()
        if latest_record:
            start_date = latest_record.date + timedelta(days=1)
        else:
            start_date = datetime(2023, 1, 1, tzinfo=timezone.utc).date()

        end_date = datetime(2024, 12, 21, tzinfo=timezone.utc).date()
        
        if start_date > end_date:
            print("Energy usage data is already up to date.")
            return

        print(f"Generating energy usage data from {start_date} to {end_date}...")

        days_created = 0

        # Base values for a medium-sized mining operation
        base_electricity_kwh = 250000  # 250,000 kWh per day
        base_electricity_cost = 0.15   # $0.15 per kWh
        base_diesel_liters = 15000     # 15,000 liters per day
        base_diesel_cost = 1.5         # $1.50 per liter

        current_date = start_date

        while current_date <= end_date:
            # Add random variation to base values
            variation = lambda base, percent: base * (1 + random.uniform(-percent, percent))
            
            # Weekend effect - reduce consumption by 10-20%
            weekend_factor = 0.85 if current_date.weekday() >= 5 else 1.0
            
            # Seasonal effect - higher electricity in summer for cooling
            month = current_date.month
            seasonal_factor_electricity = 1.2 if month in [12, 1, 2] else 1.0  # Southern hemisphere summer
            seasonal_factor_diesel = 0.9 if month in [6, 7, 8] else 1.0       # Less diesel in winter
            
            # Calculate daily values
            electricity_kwh = variation(base_electricity_kwh, 0.2) * weekend_factor * seasonal_factor_electricity
            electricity_rate = variation(base_electricity_cost, 0.1)  # Price varies by ±10%
            electricity_cost = electricity_kwh * electricity_rate
            
            diesel_liters = variation(base_diesel_liters, 0.15) * weekend_factor * seasonal_factor_diesel
            diesel_rate = variation(base_diesel_cost, 0.1)  # Price varies by ±10%
            diesel_cost = diesel_liters * diesel_rate
            
            total_cost = electricity_cost + diesel_cost

            # Create the energy usage record
            EnergyUsage.objects.create(
                date=current_date,
                electricity_kwh=round(electricity_kwh, 2),
                electricity_cost=round(Decimal(electricity_cost), 2),
                diesel_liters=round(diesel_liters, 2),
                diesel_cost=round(Decimal(diesel_cost), 2),
                total_cost=round(Decimal(total_cost), 2)
            )

            days_created += 1
            if days_created % 100 == 0:
                print(f"Created {days_created} days of energy usage data...")

            current_date += timedelta(days=1)

        print(f"Successfully created {days_created} days of energy usage data.")

    except Exception as e:
        print(f"Error creating energy usage data: {str(e)}")

if __name__ == '__main__':
    create_energy_usage_data()
