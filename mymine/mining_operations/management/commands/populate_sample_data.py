from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import CustomUser
from mining_operations.models import (
    MiningDepartment, 
    MiningSite, 
    HeavyMachinery, 
    GoldMillingEquipment,
    DailyProductionLog,
    MiningChemical,
    DailyChemicalsUsed,
    SafetyIncident,
    DailyEnergyConsumption,
    ExplosiveComponent,
    DailyExplosivesUsed,
    DailyStockpile,
    SmeltedGold,
    DailyExpenses,
    DailyLaborCost,
    EnvironmentalImpactLog
)
import random
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populates the database with sample mining data'

    def handle(self, *args, **kwargs):
        # Clear existing data
        self.stdout.write('Clearing existing data...')
        models_to_clear = [
            MiningDepartment, MiningSite, HeavyMachinery, 
            GoldMillingEquipment, DailyProductionLog, 
            MiningChemical, DailyChemicalsUsed, 
            SafetyIncident
        ]
        for model in models_to_clear:
            model.objects.all().delete()

        # Create a superuser if not exists
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin', 
                email='admin@mymine.com', 
                password='adminpass123',
                role='admin'
            )
        admin_user = User.objects.get(username='admin')

        # Create Mining Departments
        departments = [
            MiningDepartment.objects.create(
                name=f'{dept_type.capitalize()} Department', 
                type=dept_type
            ) for dept_type in ['extraction', 'processing', 'safety', 'maintenance']
        ]
        self.stdout.write('Created Mining Departments')

        # Create Mining Sites
        sites = [
            MiningSite.objects.create(
                name=f'Gold Mine {i}',
                location=f'Region {i}, South Africa',
                area_hectares=Decimal(random.uniform(50.0, 500.0)),
                status='active',
                estimated_gold_reserves=Decimal(random.uniform(10.0, 100.0)),
                geological_classification='Greenstone Belt'
            ) for i in range(1, 4)
        ]
        # Add departments to sites
        for site in sites:
            site.departments.add(*departments)
        self.stdout.write('Created Mining Sites')

        # Create Heavy Machinery
        machinery = [
            HeavyMachinery.objects.create(
                name=f'Excavator {i}',
                model=f'Model X{i}',
                serial_number=f'SN-{random.randint(1000, 9999)}',
                department=random.choice(departments),
                site=random.choice(sites),
                purchase_date=timezone.now().date(),
                status='operational',
                operational_hours=Decimal(random.uniform(0, 1000)),
                maintenance_cost=Decimal(random.uniform(1000, 50000))
            ) for i in range(1, 6)
        ]
        self.stdout.write('Created Heavy Machinery')

        # Create Gold Milling Equipment
        milling_equipment = [
            GoldMillingEquipment.objects.create(
                name=f'Mill {i}',
                type='Primary Crusher',
                capacity_tons_per_hour=Decimal(random.uniform(50, 200)),
                efficiency_percentage=Decimal(random.uniform(70, 95)),
                current_status='operational',
                site=random.choice(sites),
                last_maintenance_date=timezone.now().date()
            ) for i in range(1, 4)
        ]
        self.stdout.write('Created Gold Milling Equipment')

        # Create Daily Production Log
        production_logs = [
            DailyProductionLog.objects.create(
                site=random.choice(sites),
                date=timezone.now().date(),
                total_tonnage_crushed=Decimal(random.uniform(100, 1000)),
                total_tonnage_hoisted=Decimal(random.uniform(50, 500)),
                gold_recovery_rate=Decimal(random.uniform(60, 90)),
                operational_efficiency=Decimal(random.uniform(70, 95))
            ) for _ in range(5)
        ]
        self.stdout.write('Created Daily Production Logs')

        # Create Mining Chemicals
        chemicals = [
            MiningChemical.objects.create(
                name=f'Chemical {i}',
                chemical_formula=f'C{random.randint(1,10)}H{random.randint(1,20)}',
                current_stock=Decimal(random.uniform(100, 1000)),
                unit_of_measurement='kg',
                unit_price=Decimal(random.uniform(10, 500))
            ) for i in range(1, 5)
        ]
        self.stdout.write('Created Mining Chemicals')

        # Create Daily Chemicals Used
        daily_chemicals = [
            DailyChemicalsUsed.objects.create(
                date=timezone.now().date(),
                chemical=random.choice(chemicals),
                quantity_used=Decimal(random.uniform(10, 100)),
                department=random.choice(departments),
                total_cost=Decimal(random.uniform(100, 5000))
            ) for _ in range(5)
        ]
        self.stdout.write('Created Daily Chemicals Used')

        # Create Safety Incidents
        safety_incidents = [
            SafetyIncident.objects.create(
                date=timezone.now(),
                site=random.choice(sites),
                department=random.choice(departments),
                incident_type=random.choice(['equipment_failure', 'personal_injury', 'environmental']),
                severity=random.choice(['low', 'medium', 'high']),
                description='Sample safety incident description',
                corrective_actions='Corrective actions taken',
                reported_by=admin_user
            ) for _ in range(3)
        ]
        self.stdout.write('Created Safety Incidents')

        # Create Daily Energy Consumption
        energy_consumption = [
            DailyEnergyConsumption.objects.create(
                date=timezone.now().date(),
                department=random.choice(departments),
                total_kwh=Decimal(random.uniform(100, 1000)),
                cost_per_kwh=Decimal(random.uniform(0.1, 1.0)),
                total_energy_cost=Decimal(random.uniform(1000, 10000))
            ) for _ in range(5)
        ]
        self.stdout.write('Created Daily Energy Consumption')

        # Create Explosive Components
        explosives = [
            ExplosiveComponent.objects.create(
                name=f'Explosive {i}',
                type='Blasting Agent',
                current_stock=Decimal(random.uniform(50, 500)),
                unit_price=Decimal(random.uniform(100, 1000)),
                safety_classification='Class 1.1D'
            ) for i in range(1, 4)
        ]
        self.stdout.write('Created Explosive Components')

        # Create Daily Explosives Used
        daily_explosives = [
            DailyExplosivesUsed.objects.create(
                date=timezone.now().date(),
                explosive=random.choice(explosives),
                quantity_used=Decimal(random.uniform(10, 100)),
                blast_location=f'Blast Site {random.randint(1,5)}',
                department=random.choice(departments)
            ) for _ in range(3)
        ]
        self.stdout.write('Created Daily Explosives Used')

        # Create Daily Stockpile
        stockpiles = [
            DailyStockpile.objects.create(
                date=timezone.now().date(),
                site=random.choice(sites),
                crushed_stockpile_volume=Decimal(random.uniform(100, 1000)),
                milled_stockpile_volume=Decimal(random.uniform(50, 500))
            ) for _ in range(5)
        ]
        self.stdout.write('Created Daily Stockpile')

        # Create Smelted Gold
        smelted_gold = [
            SmeltedGold.objects.create(
                date=timezone.now().date(),
                site=random.choice(sites),
                total_weight=Decimal(random.uniform(10, 100)),
                purity_percentage=Decimal(random.uniform(90, 99.9)),
                market_value_per_gram=Decimal(random.uniform(50, 70)),
                total_value=Decimal(random.uniform(5000, 50000))
            ) for _ in range(3)
        ]
        self.stdout.write('Created Smelted Gold Records')

        # Create Daily Expenses
        daily_expenses = [
            DailyExpenses.objects.create(
                date=timezone.now().date(),
                department=random.choice(departments),
                energy_cost=Decimal(random.uniform(1000, 10000)),
                chemical_cost=Decimal(random.uniform(500, 5000)),
                labor_cost=Decimal(random.uniform(5000, 50000)),
                equipment_maintenance_cost=Decimal(random.uniform(1000, 15000)),
                total_expenses=Decimal(random.uniform(10000, 100000))
            ) for _ in range(5)
        ]
        self.stdout.write('Created Daily Expenses')

        # Create Daily Labor Cost
        daily_labor_cost = [
            DailyLaborCost.objects.create(
                date=timezone.now().date(),
                department=random.choice(departments),
                total_workers=random.randint(50, 200),
                total_labor_hours=Decimal(random.uniform(400, 1600)),
                hourly_rate=Decimal(random.uniform(50, 200)),
                total_labor_cost=Decimal(random.uniform(20000, 320000))
            ) for _ in range(5)
        ]
        self.stdout.write('Created Daily Labor Cost')

        # Create Environmental Impact Log
        environmental_logs = [
            EnvironmentalImpactLog.objects.create(
                date=timezone.now().date(),
                site=random.choice(sites),
                water_usage=Decimal(random.uniform(100, 1000)),
                carbon_emissions=Decimal(random.uniform(10, 100)),
                waste_generated=Decimal(random.uniform(50, 500)),
                noise_level=Decimal(random.uniform(60, 90))
            ) for _ in range(3)
        ]
        self.stdout.write('Created Environmental Impact Logs')

        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data'))
