from django.db import migrations
from datetime import datetime, timedelta

def seed_energy_data(apps, schema_editor):
    EnergyUsage = apps.get_model('dashboard', 'EnergyUsage')
    
    # Clear existing data
    EnergyUsage.objects.all().delete()
    
    # Generate dates and insert data
    start_date = datetime(2024, 11, 1)
    end_date = datetime(2024, 12, 15)
    current_date = start_date
    
    while current_date <= end_date:
        EnergyUsage.objects.create(
            date=current_date.date(),
            electricity_kwh=1000.00,
            electricity_cost=1500.00,
            diesel_liters=500.00,
            diesel_cost=1000.00,
            total_cost=2500.00,
            notes=f'Sample data for {current_date.date()}'
        )
        current_date += timedelta(days=1)

def reverse_seed_energy_data(apps, schema_editor):
    EnergyUsage = apps.get_model('dashboard', 'EnergyUsage')
    EnergyUsage.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('dashboard', '0006_update_energy_usage'),
    ]

    operations = [
        migrations.RunPython(seed_energy_data, reverse_seed_energy_data),
    ]
