from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import Machinery, EquipmentStatusLog, MaintenanceRecord
from datetime import timedelta

class Command(BaseCommand):
    help = 'Adds sample equipment data to the database'

    def handle(self, *args, **options):
        # Sample equipment data
        equipment_data = [
            {
                'name': 'Excavator 320D',
                'type': 'Excavator',
                'status': 'Operational',
                'efficiency': 95.5,
                'operating_hours': 2500.00,
            },
            {
                'name': 'Dump Truck 777F',
                'type': 'Dump Truck',
                'status': 'Under Maintenance',
                'efficiency': 85.0,
                'operating_hours': 3200.00,
            },
            {
                'name': 'Drill Rig D65',
                'type': 'Drill',
                'status': 'Operational',
                'efficiency': 92.0,
                'operating_hours': 1800.00,
            },
            {
                'name': 'Loader 988K',
                'type': 'Loader',
                'status': 'Out of Service',
                'efficiency': 75.0,
                'operating_hours': 4100.00,
            },
            {
                'name': 'Crusher C160',
                'type': 'Crusher',
                'status': 'Operational',
                'efficiency': 88.5,
                'operating_hours': 2800.00,
            }
        ]

        today = timezone.now().date()

        for data in equipment_data:
            # Create machinery
            machinery = Machinery.objects.create(
                name=data['name'],
                type=data['type'],
                status=data['status'],
                efficiency=data['efficiency'],
                operating_hours=data['operating_hours'],
                last_maintenance=today - timedelta(days=30),
                _next_maintenance_due=today + timedelta(days=30)
            )

            # Create status log
            EquipmentStatusLog.objects.create(
                machinery=machinery,
                status=data['status'],
                date=today,
                notes=f"Initial status: {data['status']}"
            )

            # Create maintenance record if under maintenance
            if data['status'] == 'Under Maintenance':
                MaintenanceRecord.objects.create(
                    machinery=machinery,
                    date=today,
                    type='Scheduled Maintenance',
                    description='Regular maintenance check and repairs',
                    cost=1500.00,
                    duration_hours=8.00
                )

        self.stdout.write(self.style.SUCCESS('Successfully added sample equipment data'))
