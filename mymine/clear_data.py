import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import DailyProductionLog, SmeltedGold

# Clear existing data
DailyProductionLog.objects.all().delete()
SmeltedGold.objects.all().delete()

print("All production and smelted gold records cleared.")
