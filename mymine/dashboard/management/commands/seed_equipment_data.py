from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from random import randint, choice, uniform, random
from dashboard.models import Machinery, MaintenanceRecord, EquipmentStatusLog

class Command(BaseCommand):
    help = 'Seeds equipment and maintenance data from Jan 2023 to Dec 2024'

    def generate_status_logs(self, machinery, start_date, end_date):
        current_date = start_date
        current_status = 'Operational'
        
        while current_date <= end_date:
            # 10% chance of status change each day
            if random() < 0.1:
                if current_status == 'Operational':
                    # When operational, can go to maintenance or out of service
                    current_status = choice(['Under Maintenance', 'Out of Service'], weights=[0.8, 0.2])
                else:
                    # When not operational, likely to return to operational
                    current_status = 'Operational' if random() < 0.7 else current_status
                
                EquipmentStatusLog.objects.create(
                    machinery=machinery,
                    status=current_status,
                    date=current_date,
                    notes=f'Status changed to {current_status}'
                )
            
            current_date += timedelta(days=1)

    def generate_maintenance_records(self, machinery, start_date, end_date):
        current_date = start_date
        while current_date <= end_date:
            # Generate maintenance record with 20% probability for each day
            if randint(1, 100) <= 20:
                duration = uniform(2, 8)  # 2 to 8 hours
                cost = duration * uniform(500, 1500)  # $500-$1500 per hour
                
                maintenance_type = choice([
                    'Routine Check',
                    'Oil Change',
                    'Parts Replacement',
                    'Emergency Repair',
                    'Scheduled Maintenance'
                ])

                MaintenanceRecord.objects.create(
                    machinery=machinery,
                    date=current_date,
                    type=maintenance_type,
                    description=f'{maintenance_type} performed on {machinery.name}',
                    cost=round(cost, 2),
                    duration_hours=round(duration, 2)
                )
            current_date += timedelta(days=1)

    def handle(self, *args, **kwargs):
        # Clear existing data
        self.stdout.write('Clearing existing equipment data...')
        Machinery.objects.all().delete()
        MaintenanceRecord.objects.all().delete()
        EquipmentStatusLog.objects.all().delete()

        # Define date range
        start_date = datetime(2023, 1, 1).date()
        end_date = datetime(2024, 12, 12).date()

        # Define equipment types and their efficiency ranges
        equipment_types = {
            'Excavator': (75, 95),
            'Dump Truck': (80, 98),
            'Drill Rig': (70, 90),
            'Crusher': (85, 95),
            'Conveyor': (90, 98),
            'Loader': (80, 95),
            'Screening Plant': (85, 95),
            'Water Pump': (88, 98),
            'Generator': (90, 99),
            'Ventilation System': (92, 99)
        }

        # Create machinery
        self.stdout.write('Creating machinery...')
        for eq_type, eff_range in equipment_types.items():
            for i in range(1, 4):  # 3 machines of each type
                efficiency = uniform(eff_range[0], eff_range[1])
                operating_hours = uniform(2000, 5000)
                last_maintenance = start_date + timedelta(days=randint(0, 30))
                next_maintenance = last_maintenance + timedelta(days=90)
                
                status = choice([
                    ('Operational', 0.7),
                    ('Under Maintenance', 0.2),
                    ('Out of Service', 0.1)
                ], weights=[0.7, 0.2, 0.1])[0]

                machinery = Machinery.objects.create(
                    name=f'{eq_type} {i}',
                    type=eq_type,
                    status=status,
                    efficiency=round(efficiency, 2),
                    operating_hours=round(operating_hours, 2),
                    last_maintenance=last_maintenance,
                    _next_maintenance_due=next_maintenance
                )

                # Generate maintenance history
                self.generate_maintenance_records(machinery, start_date, end_date)
                
                # Generate status logs
                self.generate_status_logs(machinery, start_date, end_date)

        self.stdout.write(self.style.SUCCESS('Successfully seeded equipment data'))
