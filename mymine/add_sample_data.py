import os
import django
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from dashboard.models import Machinery, MaintenanceRecord

# Sample machinery data
machinery_data = [
    {
        'name': 'Excavator XL2000',
        'type': 'Heavy Equipment',
        'status': 'Operational',
        'efficiency': 95.5,
        'operating_hours': 2500.0,
    },
    {
        'name': 'Drill Rig DR500',
        'type': 'Drilling Equipment',
        'status': 'Under Maintenance',
        'efficiency': 85.0,
        'operating_hours': 1800.0,
    },
    {
        'name': 'Crusher C1000',
        'type': 'Processing Equipment',
        'status': 'Operational',
        'efficiency': 92.0,
        'operating_hours': 3200.0,
    },
    {
        'name': 'Conveyor Belt CB200',
        'type': 'Transport Equipment',
        'status': 'Out of Service',
        'efficiency': 75.0,
        'operating_hours': 4500.0,
    }
]

# Add machinery
for data in machinery_data:
    machine, created = Machinery.objects.get_or_create(
        name=data['name'],
        defaults={
            'type': data['type'],
            'status': data['status'],
            'efficiency': data['efficiency'],
            'operating_hours': data['operating_hours'],
            'last_maintenance': datetime.now().date() - timedelta(days=30),
            'next_maintenance': datetime.now().date() + timedelta(days=30),
        }
    )
    if created:
        print(f"Created machinery: {machine.name}")
    else:
        print(f"Machinery already exists: {machine.name}")

# Add maintenance records
for machine in Machinery.objects.all():
    # Add a recent maintenance record
    MaintenanceRecord.objects.get_or_create(
        machinery=machine,
        date=datetime.now().date() - timedelta(days=30),
        defaults={
            'type': 'Preventive',
            'description': f'Regular maintenance check for {machine.name}',
            'cost': 1500.00,
            'duration_hours': 8.0,
            'technician': 'John Smith',
            'parts_replaced': 'Filters, Oil, Belts'
        }
    )
    print(f"Added maintenance record for: {machine.name}")

print("\nSample data added successfully!")
