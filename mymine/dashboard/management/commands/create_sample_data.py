from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import (
    DailyProductionLog,
    Machinery,
    ChemicalInventory,
    SafetyIncident,
    ChemicalUsage
)
from datetime import timedelta
import random
from decimal import Decimal

class Command(BaseCommand):
    help = 'Creates sample data for testing'

    def handle(self, *args, **options):
        # Create sample production logs
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        shifts = ['Morning', 'Afternoon', 'Night']
        equipment_statuses = ['Operational', 'Under Maintenance', 'Offline']

        for i in range(30):  # Last 30 days of production data
            for shift in shifts:
                production = random.uniform(100, 500)  # Production in kg
                DailyProductionLog.objects.get_or_create(
                    date=start_date + timedelta(days=i),
                    shift=shift,
                    defaults={
                        'production': Decimal(str(round(production, 2))),
                        'equipment_status': random.choice(equipment_statuses),
                        'safety_incidents': random.randint(0, 2),
                        'notes': f'Regular {shift.lower()} shift operations'
                    }
                )

        # Create sample machinery data
        machinery_list = [
            {
                'name': 'Excavator XL2000',
                'type': 'Excavator',
                'status': 'Operational',
                'efficiency': 95,
                'last_maintenance': end_date - timedelta(days=15),
                'operating_hours': 2500
            },
            {
                'name': 'Drill Rig DR500',
                'type': 'Drilling Equipment',
                'status': 'Under Maintenance',
                'efficiency': 75,
                'last_maintenance': end_date - timedelta(days=30),
                'operating_hours': 3200
            },
            {
                'name': 'Crusher C3000',
                'type': 'Processing Equipment',
                'status': 'Operational',
                'efficiency': 88,
                'last_maintenance': end_date - timedelta(days=7),
                'operating_hours': 4100
            },
            {
                'name': 'Conveyor Belt CB1',
                'type': 'Transport Equipment',
                'status': 'Operational',
                'efficiency': 92,
                'last_maintenance': end_date - timedelta(days=10),
                'operating_hours': 5000
            },
            {
                'name': 'Pump Station P200',
                'type': 'Water Management',
                'status': 'Under Maintenance',
                'efficiency': 65,
                'last_maintenance': end_date - timedelta(days=45),
                'operating_hours': 2800
            }
        ]

        for machine in machinery_list:
            Machinery.objects.get_or_create(
                name=machine['name'],
                defaults={
                    'type': machine['type'],
                    'status': machine['status'],
                    'efficiency': machine['efficiency'],
                    'last_maintenance': machine['last_maintenance'],
                    'operating_hours': machine['operating_hours']
                }
            )

        # Create sample chemical inventory
        chemicals = [
            {'name': 'Cyanide', 'current_stock': 500, 'minimum_required': 1000, 'unit': 'kg', 'unit_price': 50},
            {'name': 'Sulfuric Acid', 'current_stock': 2000, 'minimum_required': 1500, 'unit': 'L', 'unit_price': 2.5},
            {'name': 'Activated Carbon', 'current_stock': 3000, 'minimum_required': 2000, 'unit': 'kg', 'unit_price': 15},
            {'name': 'Lime', 'current_stock': 1500, 'minimum_required': 2000, 'unit': 'kg', 'unit_price': 1.2},
            {'name': 'Sodium Hydroxide', 'current_stock': 800, 'minimum_required': 500, 'unit': 'kg', 'unit_price': 3.5},
            {'name': 'Hydrochloric Acid', 'current_stock': 1200, 'minimum_required': 1000, 'unit': 'L', 'unit_price': 4},
            {'name': 'Flocculant', 'current_stock': 300, 'minimum_required': 400, 'unit': 'kg', 'unit_price': 25}
        ]

        for chemical in chemicals:
            ChemicalInventory.objects.get_or_create(
                name=chemical['name'],
                defaults={
                    'current_stock': chemical['current_stock'],
                    'minimum_required': chemical['minimum_required'],
                    'unit': chemical['unit'],
                    'unit_price': chemical['unit_price'],
                    'last_restocked': end_date - timedelta(days=random.randint(1, 30))
                }
            )

        # Create sample chemical usage data
        processes = {
            'Cyanide': ['Leaching', 'Gold Recovery'],
            'Sulfuric Acid': ['pH Control', 'Metal Extraction'],
            'Activated Carbon': ['Gold Adsorption', 'Water Treatment'],
            'Lime': ['pH Control', 'Neutralization'],
            'Sodium Hydroxide': ['pH Adjustment', 'Metal Precipitation'],
            'Hydrochloric Acid': ['Metal Extraction', 'Cleaning'],
            'Flocculant': ['Water Treatment', 'Settling Aid']
        }

        # Create usage data for the last 30 days
        for chemical in ChemicalInventory.objects.all():
            chemical_processes = processes.get(chemical.name, ['General Process'])
            for i in range(30):
                usage_date = end_date - timedelta(days=i)
                
                # Create 1-3 usage records per day
                for _ in range(random.randint(1, 3)):
                    amount = random.uniform(5, 50)  # Random amount between 5 and 50
                    ChemicalUsage.objects.get_or_create(
                        date=usage_date,
                        chemical=chemical,
                        amount_used=round(amount, 2),
                        process=random.choice(chemical_processes),
                        notes=f'Regular usage in {random.choice(chemical_processes).lower()} process'
                    )

        # Create sample safety incidents
        incident_types = ['Minor Injury', 'Equipment Malfunction', 'Near Miss', 'Environmental']
        severity_levels = ['Low', 'Medium', 'High', 'Critical']

        for i in range(10):  # Create 10 sample incidents
            incident_date = end_date - timedelta(days=random.randint(1, 30))
            SafetyIncident.objects.get_or_create(
                date=incident_date,
                type=random.choice(incident_types),
                defaults={
                    'severity': random.choice(severity_levels),
                    'description': f'Sample incident on {incident_date}',
                    'resolved': random.choice([True, False])
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully created sample data'))
