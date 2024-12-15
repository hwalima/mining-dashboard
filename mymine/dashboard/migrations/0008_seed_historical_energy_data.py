from django.db import migrations
from datetime import datetime, timedelta
import random

def seed_historical_energy_data(apps, schema_editor):
    EnergyUsage = apps.get_model('dashboard', 'EnergyUsage')
    
    # Clear existing data
    EnergyUsage.objects.all().delete()
    
    # Generate dates and insert data
    start_date = datetime(2003, 1, 1)
    end_date = datetime(2024, 12, 11)  # Current date
    current_date = start_date
    
    while current_date <= end_date:
        # Generate slightly random but realistic values
        base_electricity = 1000.00
        base_diesel = 500.00
        
        # Add some seasonal variation (higher in winter months)
        month = current_date.month
        season_factor = 1.3 if month in [12, 1, 2] else 1.0
        
        # Add some yearly growth (3% per year)
        years_since_start = current_date.year - start_date.year
        growth_factor = 1.0 + (years_since_start * 0.03)
        
        # Calculate final values with some random variation
        electricity_kwh = base_electricity * season_factor * growth_factor * (1 + random.uniform(-0.1, 0.1))
        diesel_liters = base_diesel * season_factor * growth_factor * (1 + random.uniform(-0.1, 0.1))
        
        # Calculate costs
        electricity_cost = electricity_kwh * 1.5  # $1.50 per kWh
        diesel_cost = diesel_liters * 2.0  # $2.00 per liter
        total_cost = electricity_cost + diesel_cost
        
        EnergyUsage.objects.create(
            date=current_date.date(),
            electricity_kwh=round(electricity_kwh, 2),
            electricity_cost=round(electricity_cost, 2),
            diesel_liters=round(diesel_liters, 2),
            diesel_cost=round(diesel_cost, 2),
            total_cost=round(total_cost, 2),
            notes=f'Historical data for {current_date.date()}'
        )
        current_date += timedelta(days=1)

def reverse_seed_historical_energy_data(apps, schema_editor):
    EnergyUsage = apps.get_model('dashboard', 'EnergyUsage')
    EnergyUsage.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('dashboard', '0007_seed_energy_data'),
    ]

    operations = [
        migrations.RunPython(seed_historical_energy_data, reverse_seed_historical_energy_data),
    ]
