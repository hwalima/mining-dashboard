from django.core.wsgi import get_wsgi_application
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
application = get_wsgi_application()

from mining_operations.models import DailyProductionLog
from django.db.models import Q

# Get total number of records
total_records = DailyProductionLog.objects.count()
print(f"\nTotal records in DailyProductionLog: {total_records}")

# Check for null values in each field
fields = [
    'total_tonnage_crushed',
    'total_tonnage_hoisted',
    'total_tonnage_milled',
    'gold_recovery_rate',
    'operational_efficiency',
    'smelted_gold',
    'gold_price',
    'gross_profit'
]

print("\nChecking for null or zero values in each field:")
for field in fields:
    # Check for null values
    null_count = DailyProductionLog.objects.filter(**{f"{field}__isnull": True}).count()
    # Check for zero values
    zero_count = DailyProductionLog.objects.filter(**{field: 0}).count()
    
    print(f"\n{field}:")
    print(f"  - Null records: {null_count}")
    print(f"  - Zero values: {zero_count}")
    
    # If there are null or zero values, show a sample record
    if null_count > 0 or zero_count > 0:
        sample = DailyProductionLog.objects.filter(
            Q(**{f"{field}__isnull": True}) | Q(**{field: 0})
        ).first()
        if sample:
            print(f"  - Sample record date: {sample.date}")

print("\nDone checking for null values.")
