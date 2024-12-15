import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import DailyProductionLog, SmeltedGold
from django.utils import timezone
from datetime import timedelta

# Get the date range for the last 7 days
end_date = timezone.now().date()
start_date = end_date - timedelta(days=7)

# Check DailyProductionLog records
production_logs = DailyProductionLog.objects.filter(date__range=[start_date, end_date])
print(f"\nDailyProductionLog records in the last 7 days: {production_logs.count()}")
if production_logs:
    print("\nSample DailyProductionLog record:")
    sample = production_logs.first()
    print(f"Date: {sample.date}")
    print(f"Total Tonnage Crushed: {sample.total_tonnage_crushed}")
    print(f"Gold Recovery Rate: {sample.gold_recovery_rate}%")
    print(f"Operational Efficiency: {sample.operational_efficiency}%")

# Check SmeltedGold records
smelted_records = SmeltedGold.objects.filter(date__range=[start_date, end_date])
print(f"\nSmeltedGold records in the last 7 days: {smelted_records.count()}")
if smelted_records:
    print("\nSample SmeltedGold record:")
    sample = smelted_records.first()
    print(f"Date: {sample.date}")
    print(f"Total Weight: {sample.total_weight}g")
    print(f"Purity: {sample.purity_percentage}%")
    print(f"Market Value per Gram: ${sample.market_value_per_gram}")
    print(f"Total Value: ${sample.total_value}")

# Get total counts
total_production = DailyProductionLog.objects.count()
total_smelted = SmeltedGold.objects.count()
print(f"\nTotal records in database:")
print(f"DailyProductionLog: {total_production}")
print(f"SmeltedGold: {total_smelted}")
