import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import LaborMetric
from django.db.models import Count
from datetime import datetime

# Get total count
total_count = LaborMetric.objects.count()
print(f"Total labor metrics records: {total_count}")

# Get count by month
monthly_counts = (
    LaborMetric.objects
    .values('date__year', 'date__month')
    .annotate(count=Count('id'))
    .order_by('date__year', 'date__month')
)

print("\nRecords by month:")
for entry in monthly_counts:
    month = f"{entry['date__year']}-{entry['date__month']:02d}"
    print(f"{month}: {entry['count']} records")

# Get latest records
print("\nLatest 5 records:")
latest_records = LaborMetric.objects.order_by('-date')[:5]
for record in latest_records:
    print(f"Date: {record.date}, Shift: {record.shift}, Workers: {record.workers_present}")
