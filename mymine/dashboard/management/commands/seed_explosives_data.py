from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from dashboard.models import ExplosivesInventory, ExplosivesUsage
import random
from decimal import Decimal

class Command(BaseCommand):
    help = 'Seeds explosives inventory and usage data from Jan 2023 to Dec 2024'

    def handle(self, *args, **kwargs):
        # First, create some explosive materials
        explosives_data = [
            {
                'name': 'ANFO',
                'type': 'Secondary',
                'minimum_required': 1000,
                'unit': 'kg',
                'unit_price': 2.5,
                'storage_location': 'Magazine A',
                'license_number': 'EXP-2023-001',
                'supplier': 'Mining Explosives Ltd'
            },
            {
                'name': 'Emulsion Explosive',
                'type': 'Secondary',
                'minimum_required': 800,
                'unit': 'kg',
                'unit_price': 3.2,
                'storage_location': 'Magazine B',
                'license_number': 'EXP-2023-002',
                'supplier': 'BlastTech Solutions'
            },
            {
                'name': 'Electric Detonators',
                'type': 'Detonator',
                'minimum_required': 500,
                'unit': 'units',
                'unit_price': 5.0,
                'storage_location': 'Magazine C',
                'license_number': 'EXP-2023-003',
                'supplier': 'DetoTech Industries'
            },
            {
                'name': 'Boosters',
                'type': 'Booster',
                'minimum_required': 300,
                'unit': 'units',
                'unit_price': 4.5,
                'storage_location': 'Magazine D',
                'license_number': 'EXP-2023-004',
                'supplier': 'Mining Explosives Ltd'
            }
        ]

        # Create explosive materials
        explosives = []
        for data in explosives_data:
            explosive, created = ExplosivesInventory.objects.get_or_create(
                name=data['name'],
                defaults={
                    'type': data['type'],
                    'current_stock': data['minimum_required'] * 1.5,  # Start with 150% of minimum
                    'minimum_required': data['minimum_required'],
                    'unit': data['unit'],
                    'unit_price': data['unit_price'],
                    'storage_location': data['storage_location'],
                    'license_number': data['license_number'],
                    'supplier': data['supplier'],
                    'expiry_date': timezone.now() + timedelta(days=365)
                }
            )
            explosives.append(explosive)
            if created:
                self.stdout.write(f'Created explosive: {explosive.name}')

        # Generate usage data from Jan 2023 to current date
        end_date = datetime(2024, 12, 13, 16, 40, 59, tzinfo=timezone.timezone(timedelta(hours=2))).date()
        start_date = datetime(2023, 1, 1).date()
        current_date = start_date

        blast_purposes = ['Development', 'Production', 'Special']
        rock_types = ['Hard Rock', 'Medium Rock', 'Soft Rock']
        blast_patterns = ['Square', 'Rectangular', 'Staggered']
        weather_conditions = ['Clear', 'Cloudy', 'Rainy', 'Windy']

        # Delete existing usage data in this date range
        ExplosivesUsage.objects.filter(date__range=(start_date, end_date)).delete()

        # Create a dictionary to track used dates and explosives
        used_combinations = {}  # Format: {date: set(explosive_ids)}

        while current_date <= end_date:
            if current_date not in used_combinations:
                used_combinations[current_date] = set()

            # For each day, randomly select 2-3 explosives to use
            available_explosives = [e for e in explosives if e.id not in used_combinations[current_date]]
            if not available_explosives:
                current_date += timedelta(days=1)
                continue

            # More explosives used during weekdays
            if current_date.weekday() < 5:  # Monday to Friday
                num_explosives_used = min(random.randint(2, 4), len(available_explosives))
            else:  # Weekend
                num_explosives_used = min(random.randint(1, 2), len(available_explosives))

            used_explosives = random.sample(available_explosives, num_explosives_used)

            for explosive in used_explosives:
                used_combinations[current_date].add(explosive.id)

                # Calculate usage amount based on type and day of week
                if explosive.type in ['Primary', 'Secondary']:
                    # More usage during weekdays
                    if current_date.weekday() < 5:
                        base_amount = random.uniform(100, 300)  # kg
                    else:
                        base_amount = random.uniform(50, 150)  # kg
                elif explosive.type == 'Detonator':
                    if current_date.weekday() < 5:
                        base_amount = random.uniform(30, 70)  # units
                    else:
                        base_amount = random.uniform(15, 35)  # units
                else:  # Booster
                    if current_date.weekday() < 5:
                        base_amount = random.uniform(20, 40)  # units
                    else:
                        base_amount = random.uniform(10, 20)  # units

                # Add some seasonal variation
                month = current_date.month
                if month in [6, 7, 8]:  # Winter months (less activity)
                    base_amount *= 0.8
                elif month in [12, 1, 2]:  # Summer months (more activity)
                    base_amount *= 1.2

                # Create usage record with more realistic effectiveness ratings
                effectiveness = random.uniform(7.5, 9.8)  # Higher baseline effectiveness
                if current_date.weekday() < 5:  # Better effectiveness during weekdays
                    effectiveness += 0.2

                ExplosivesUsage.objects.create(
                    date=current_date,
                    explosive=explosive,
                    amount_used=round(Decimal(base_amount), 2),
                    blast_location=f'Level {random.randint(1, 5)} Block {random.randint(1, 10)}',
                    blast_purpose=random.choice(blast_purposes),
                    authorized_by=f'Supervisor {random.randint(1, 5)}',
                    weather_conditions=random.choice(weather_conditions),
                    rock_type=random.choice(rock_types),
                    blast_pattern=random.choice(blast_patterns),
                    effectiveness_rating=round(Decimal(effectiveness), 2),
                    notes=f'Regular blast operation on {current_date}'
                )

                # Update inventory with more realistic restocking logic
                current_stock_decimal = Decimal(str(explosive.current_stock))
                base_amount_decimal = Decimal(str(base_amount))
                explosive.current_stock = max(Decimal('0'), current_stock_decimal - base_amount_decimal)

                # Restock if below minimum or close to minimum
                if explosive.current_stock < explosive.minimum_required * Decimal('1.2'):
                    restock_amount = explosive.minimum_required * Decimal('2.0')  # Order more when restocking
                    explosive.current_stock += restock_amount
                    explosive.last_restocked = current_date
                    explosive.save()

            current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS('Successfully seeded explosives data'))
