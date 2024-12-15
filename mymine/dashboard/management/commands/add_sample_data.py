from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import Machinery, MaintenanceRecord
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Add sample machinery and maintenance data'

    def handle(self, *args, **kwargs):
        # Create sample machinery
        machinery_types = ['Excavator', 'Loader', 'Drill', 'Crusher', 'Conveyor']
        status_choices = ['Operational', 'Under Maintenance', 'Out of Service']
        
        # Clear existing data
        Machinery.objects.all().delete()
        MaintenanceRecord.objects.all().delete()

        # Create machinery
        for i in range(10):
            machine = Machinery.objects.create(
                name=f'{machinery_types[i % len(machinery_types)]} {i + 1}',
                type=machinery_types[i % len(machinery_types)],
                status=random.choice(status_choices),
                efficiency=random.uniform(75, 98),
                operating_hours=random.uniform(1000, 5000),
                last_maintenance=timezone.now().date() - timedelta(days=random.randint(1, 30)),
                next_maintenance_due=timezone.now().date() + timedelta(days=random.randint(1, 30))
            )
            
            # Create maintenance records for each machine
            for _ in range(random.randint(2, 5)):
                days_ago = random.randint(1, 30)
                MaintenanceRecord.objects.create(
                    machinery=machine,
                    date=timezone.now().date() - timedelta(days=days_ago),
                    type=random.choice(['Routine', 'Emergency', 'Preventive']),
                    description=f'Sample maintenance record for {machine.name}',
                    cost=random.uniform(1000, 5000),
                    duration_hours=random.uniform(2, 24)
                )

        self.stdout.write(self.style.SUCCESS('Successfully added sample machinery and maintenance data'))
