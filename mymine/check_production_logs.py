from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import DailyProductionLog

# Check production logs
logs = DailyProductionLog.objects.all()
print(f"\nTotal production logs: {logs.count()}")

if logs.exists():
    print("\nRecent production logs:")
    for log in logs.order_by('-date')[:5]:
        print(f"Date: {log.date}")
        print(f"Total tonnage crushed: {log.total_tonnage_crushed}")
        print(f"Total tonnage hoisted: {log.total_tonnage_hoisted}")
        print(f"Gold recovery rate: {log.gold_recovery_rate}%")
        print(f"Smelted gold: {log.smelted_gold}g")
        print("---")
else:
    print("No production logs found!")
