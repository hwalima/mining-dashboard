from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
import math
from decimal import Decimal
from mining_operations.models import MiningChemical, DailyChemicalsUsed, MiningDepartment

class Command(BaseCommand):
    help = 'Seeds chemical usage data from Jan 1, 2023 to Dec 12, 2024'

    def handle(self, *args, **kwargs):
        # Define date range
        start_date = datetime(2023, 1, 1).date()
        end_date = datetime(2024, 12, 12).date()
        
        # Get or create departments
        processing_dept, _ = MiningDepartment.objects.get_or_create(
            name='Processing Plant',
            defaults={
                'type': 'Processing',
                'description': 'Main mineral processing plant',
                'created_at': timezone.now(),
                'updated_at': timezone.now()
            }
        )
        
        # Get or create chemicals with realistic data
        chemicals_data = [
            {
                'name': 'Cyanide',
                'chemical_formula': 'NaCN',
                'unit_of_measurement': 'kg',
                'unit_price': Decimal('25.50'),
                'current_stock': Decimal('2000'),
                'supplier': 'ChemCorp International',
                'safety_data_sheet': 'Handle with extreme caution. Highly toxic.'
            },
            {
                'name': 'Sulfuric Acid',
                'chemical_formula': 'H2SO4',
                'unit_of_measurement': 'L',
                'unit_price': Decimal('15.75'),
                'current_stock': Decimal('3000'),
                'supplier': 'Industrial Acids Ltd',
                'safety_data_sheet': 'Corrosive liquid. Store in acid-resistant containers.'
            },
            {
                'name': 'Activated Carbon',
                'chemical_formula': 'C',
                'unit_of_measurement': 'kg',
                'unit_price': Decimal('18.25'),
                'current_stock': Decimal('2500'),
                'supplier': 'Carbon Solutions Inc',
                'safety_data_sheet': 'Store in dry conditions.'
            },
            {
                'name': 'Lime',
                'chemical_formula': 'CaO',
                'unit_of_measurement': 'kg',
                'unit_price': Decimal('12.80'),
                'current_stock': Decimal('4000'),
                'supplier': 'Mineral Products Co',
                'safety_data_sheet': 'Avoid contact with water until use.'
            },
            {
                'name': 'Hydrochloric Acid',
                'chemical_formula': 'HCl',
                'unit_of_measurement': 'L',
                'unit_price': Decimal('16.90'),
                'current_stock': Decimal('1500'),
                'supplier': 'Industrial Acids Ltd',
                'safety_data_sheet': 'Corrosive liquid. Store separately from bases.'
            }
        ]

        chemicals = []
        for chem_data in chemicals_data:
            chemical, created = MiningChemical.objects.get_or_create(
                name=chem_data['name'],
                defaults=chem_data
            )
            chemicals.append(chemical)
            if created:
                self.stdout.write(f"Created chemical: {chemical.name}")

        # Generate usage patterns
        current_date = start_date
        days = (end_date - start_date).days + 1

        # Base usage patterns (kg or L per day)
        base_usage = {
            'Cyanide': (40, 60),  # High usage, critical chemical
            'Sulfuric Acid': (30, 50),
            'Activated Carbon': (35, 55),
            'Lime': (45, 65),
            'Hydrochloric Acid': (25, 45)
        }

        # Create usage records
        records_created = 0
        while current_date <= end_date:
            # Add some seasonal variation
            season_factor = Decimal('1.0') + Decimal('0.2') * Decimal(str(math.sin(2 * math.pi * current_date.timetuple().tm_yday / 365)))
            
            # Add weekly patterns (less usage on weekends)
            is_weekend = current_date.weekday() >= 5
            weekend_factor = Decimal('0.7') if is_weekend else Decimal('1.0')
            
            for chemical in chemicals:
                base_min, base_max = base_usage[chemical.name]
                
                # Calculate daily usage with variations
                daily_usage = Decimal(str(random.uniform(base_min, base_max))) * season_factor * weekend_factor
                
                # Add some random spikes or dips (10% chance)
                if random.random() < 0.1:
                    daily_usage *= Decimal(str(random.uniform(0.5, 1.5)))
                
                # Calculate total cost
                total_cost = daily_usage * chemical.unit_price
                
                # Create the usage record
                DailyChemicalsUsed.objects.create(
                    date=current_date,
                    chemical=chemical,
                    quantity_used=round(daily_usage, 2),
                    total_cost=round(total_cost, 2),
                    department=processing_dept
                )
                records_created += 1
            
            current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS(
            f'Successfully created {records_created} chemical usage records '
            f'from {start_date} to {end_date}'
        ))
