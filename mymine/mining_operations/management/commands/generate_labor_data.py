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
        MiningDepartment.objects.all().delete()

        # Create departments
        departments = [
            ('Extraction', 'extraction'),
            ('Processing', 'processing'),
            ('Safety', 'safety'),
            ('Maintenance', 'maintenance'),
            ('Logistics', 'logistics')
        ]

        dept_objects = []
        for name, dept_type in departments:
            dept = MiningDepartment.objects.create(
                name=name,
                type=dept_type,
                description=f'{name} department for mining operations'
            )
            dept_objects.append(dept)

        # Set start and end dates
        start_date = datetime(2023, 1, 1)
        end_date = datetime(2024, 1, 1)
        current_date = start_date

        # Base metrics for each department
        department_base = {
            'Extraction': {'workers': 60, 'productivity': 0.95},
            'Processing': {'workers': 40, 'productivity': 0.90},
            'Safety': {'workers': 20, 'productivity': 0.85},
            'Maintenance': {'workers': 35, 'productivity': 0.88},
            'Logistics': {'workers': 25, 'productivity': 0.87},
        }

        shifts = ['MORNING', 'AFTERNOON', 'NIGHT']

        # Generate data for each day
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
            for dept in dept_objects:
                base_metrics = department_base[dept.name]
                dept_workers = int(base_metrics['workers'] * season_factor * weekend_factor * daily_variation)
                base_productivity = base_metrics['productivity']

                for shift in shifts:
                    # Add shift-specific variations
                    shift_variation = random.uniform(0.9, 1.1)
                    shift_workers = int(dept_workers * shift_variation)
                    
                    # Calculate hours with some overtime on busy days
                    base_hours = 8.0
                    hours_worked = base_hours * shift_variation
                    overtime_hours = max(0, hours_worked - 8) if not is_weekend else 0
                    
                    # Calculate productivity (higher during day shifts)
                    if shift == 'MORNING':
                        shift_productivity = base_productivity * 1.1
                    elif shift == 'AFTERNOON':
                        shift_productivity = base_productivity * 1.0
                    else:  # NIGHT
                        shift_productivity = base_productivity * 0.9
                    
                    productivity = shift_productivity * shift_variation * weekend_factor
                    
                    # Generate random safety incidents (more likely on night shifts and long hours)
                    incident_probability = 0.05  # 5% base probability
                    if shift == 'NIGHT':
                        incident_probability *= 1.5
                    if hours_worked + overtime_hours > 10:
                        incident_probability *= 1.3
                    if dept.name == 'Safety':
                        incident_probability *= 0.5  # Safety department has fewer incidents
                    
                    safety_incidents = 1 if random.random() < incident_probability else 0
                    
                    LaborMetric.objects.create(
                        date=current_date,
                        shift=shift,
                        department=dept,
                        workers_present=shift_workers,
                        hours_worked=hours_worked,
                        overtime_hours=overtime_hours,
                        productivity_index=productivity,
                        safety_incidents=safety_incidents,
                        hourly_rate=25.0  # Base hourly rate
                    )

            current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS('Successfully generated labor metrics data'))
