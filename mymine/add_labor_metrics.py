import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import LaborMetric

# Generate test data for the last 7 days
today = datetime.now().date()
for i in range(7):
    date = today - timedelta(days=i)
    for shift in ['MORNING', 'AFTERNOON', 'NIGHT']:
        LaborMetric.objects.create(
            date=date,
            shift=shift,
            workers_present=random.randint(150, 200),
            hours_worked=random.uniform(7.5, 9.0),
            overtime_hours=random.uniform(0, 2.0),
            productivity_index=random.uniform(0.85, 0.98),
            safety_incidents=random.randint(0, 2)
        )

print("Test data added successfully")
