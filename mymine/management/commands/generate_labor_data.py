from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
from mining_operations.models import LaborMetric, MiningDepartment

class Command(BaseCommand):
    help = 'Generates sample labor metrics data from Jan 2023 to Jan 2024'

    def handle(self, *args, **options):
        # Delete existing data
        LaborMetric.objects.all().delete()

        # Get or create departments
        departments = []
        for dept_name in ['Extraction', 'Processing', 'Maintenance', 'Administration']:
            dept, created = MiningDepartment.objects.get_or_create(
                name=dept_name,
                defaults={'type': 'extraction' if dept_name == 'Extraction' else 'processing'}
            )
            departments.append(dept)

        # Set start and end dates
        start_date = datetime(2023, 1, 1)
        end_date = datetime(2024, 1, 1)
        current_date = start_date

        # Base metrics
        base_workers = 50  # Per department
        base_hourly_rate = 25.0
        base_hours = 8.0
        shifts = ['MORNING', 'AFTERNOON', 'NIGHT']

        # Generate data for each day
        total_records = 0
        while current_date <= end_date:
            # Add some seasonal variation
            season_factor = 1.0 + 0.1 * (
                0.5 * (
                    # Peak in summer (December/January)
                    abs(6 - current_date.month) / 6.0
                )
            )

            # Add weekly patterns (lower on weekends)
            is_weekend = current_date.weekday() >= 5
            weekend_factor = 0.7 if is_weekend else 1.0

            # Generate daily variations
            daily_variation = random.uniform(0.95, 1.05)

            # Create entries for each department and shift
            for dept in departments:
                for shift in shifts:
                    # Calculate metrics with variations
                    shift_factor = 1.0 if shift == 'MORNING' else (0.9 if shift == 'AFTERNOON' else 0.8)
                    workers = int(base_workers * season_factor * weekend_factor * daily_variation * shift_factor)
                    hours = base_hours * weekend_factor * (1 + random.uniform(-0.1, 0.1))
                    overtime = random.uniform(0, 2) if not is_weekend else 0
                    hourly_rate = base_hourly_rate * (1 + random.uniform(-0.05, 0.05))
                    productivity = random.uniform(0.7, 1.0) * shift_factor * weekend_factor
                    incidents = random.randint(0, 1) if random.random() < 0.05 else 0  # 5% chance of incident

                    # Calculate total cost
                    regular_cost = workers * hours * hourly_rate
                    overtime_cost = workers * overtime * hourly_rate * 1.5
                    total_cost = regular_cost + overtime_cost

                    LaborMetric.objects.create(
                        date=current_date,
                        shift=shift,
                        department=dept,
                        workers_present=workers,
                        hours_worked=hours,
                        overtime_hours=overtime,
                        hourly_rate=hourly_rate,
                        productivity_index=productivity,
                        total_labor_cost=total_cost,
                        safety_incidents=incidents
                    )
                    total_records += 1

            current_date += timedelta(days=1)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully generated {total_records} labor metrics records'
            )
        )
