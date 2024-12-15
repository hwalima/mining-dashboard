from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, datetime
import random
from decimal import Decimal
from mining.models.operational_metrics import (
    EnergyConsumption, ExplosivesInventory, StockpileVolume,
    DailyExpense, LaborMetric, EnvironmentalMetric
)

class Command(BaseCommand):
    help = 'Seeds the database with realistic mining operational data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding operational data...')
        
        # Generate data for the last 30 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Clear existing data
        EnergyConsumption.objects.all().delete()
        ExplosivesInventory.objects.all().delete()
        StockpileVolume.objects.all().delete()
        DailyExpense.objects.all().delete()
        LaborMetric.objects.all().delete()
        EnvironmentalMetric.objects.all().delete()

        # Seed Energy Consumption (hourly data for more granularity)
        current = start_date
        while current <= end_date:
            base_electricity = 2500 + random.uniform(-200, 200)  # Base load + variation
            peak_factor = 1.0 + 0.3 * abs(math.sin(current.hour * math.pi / 12))  # Peak during day
            
            EnergyConsumption.objects.create(
                timestamp=current,
                electricity_kwh=base_electricity * peak_factor,
                diesel_liters=800 + random.uniform(-50, 50),
                compressed_air_m3=1200 + random.uniform(-100, 100),
                total_cost=Decimal(str(round(
                    (base_electricity * peak_factor * 0.15) +  # Electricity cost
                    (800 * 1.2) +  # Diesel cost
                    (1200 * 0.05),  # Compressed air cost
                    2)))
            )
            current += timedelta(hours=1)

        # Seed Explosives Inventory (daily data)
        current = start_date.date()
        while current <= end_date.date():
            ExplosivesInventory.objects.create(
                date=current,
                anfo_kg=15000 + random.uniform(-1000, 1000),
                emulsion_kg=8000 + random.uniform(-500, 500),
                detonators_count=int(2000 + random.uniform(-100, 100)),
                boosters_count=int(1500 + random.uniform(-75, 75)),
                total_value=Decimal(str(round(
                    random.uniform(50000, 60000), 2)))
            )
            current += timedelta(days=1)

        # Seed Stockpile Volumes (daily data)
        locations = ['North Pit', 'South Pit', 'Main Storage']
        current = start_date.date()
        while current <= end_date.date():
            for location in locations:
                StockpileVolume.objects.create(
                    date=current,
                    ore_tons=25000 + random.uniform(-2000, 2000),
                    waste_tons=40000 + random.uniform(-3000, 3000),
                    grade_gpt=2.5 + random.uniform(-0.2, 0.2),
                    location=location
                )
            current += timedelta(days=1)

        # Seed Daily Expenses
        categories = ['FUEL', 'MAINTENANCE', 'LABOR', 'SUPPLIES', 'EQUIPMENT', 'OTHER']
        current = start_date.date()
        while current <= end_date.date():
            for category in categories:
                base_amount = {
                    'FUEL': 15000,
                    'MAINTENANCE': 8000,
                    'LABOR': 25000,
                    'SUPPLIES': 5000,
                    'EQUIPMENT': 12000,
                    'OTHER': 3000
                }[category]
                
                DailyExpense.objects.create(
                    date=current,
                    category=category,
                    amount=Decimal(str(round(
                        base_amount + random.uniform(-base_amount * 0.1, base_amount * 0.1), 
                        2))),
                    description=f'{category.title()} expenses for {current}'
                )
            current += timedelta(days=1)

        # Seed Labor Metrics
        shifts = ['MORNING', 'AFTERNOON', 'NIGHT']
        current = start_date.date()
        while current <= end_date.date():
            for shift in shifts:
                workers = int(100 + random.uniform(-5, 5))
                LaborMetric.objects.create(
                    date=current,
                    shift=shift,
                    workers_present=workers,
                    hours_worked=8 + random.uniform(-0.5, 1),
                    overtime_hours=random.uniform(0, 2),
                    productivity_index=0.85 + random.uniform(-0.05, 0.05),
                    safety_incidents=random.choices([0, 1], weights=[0.95, 0.05])[0]
                )
            current += timedelta(days=1)

        # Seed Environmental Metrics
        current = start_date.date()
        while current <= end_date.date():
            EnvironmentalMetric.objects.create(
                date=current,
                dust_level_pm10=45 + random.uniform(-10, 10),
                noise_level_db=75 + random.uniform(-5, 5),
                water_usage_m3=1200 + random.uniform(-100, 100),
                rehabilitation_area_m2=5000 + random.uniform(-200, 200),
                waste_water_ph=7.0 + random.uniform(-0.5, 0.5)
            )
            current += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS('Successfully seeded operational data'))
