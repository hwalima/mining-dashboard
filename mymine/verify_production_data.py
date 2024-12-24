import os
import django
import sys
from datetime import datetime, timedelta
from decimal import Decimal

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import DailyProductionLog

def verify_data():
    # Get total count
    total_logs = DailyProductionLog.objects.count()
    print(f"\nTotal production logs: {total_logs}")
    
    # Get latest records
    print("\nLatest 5 records:")
    for log in DailyProductionLog.objects.order_by('-date')[:5]:
        print(f"\nDate: {log.date}")
        print(f"Crushed: {log.total_tonnage_crushed:,.2f}t")
        print(f"Hoisted: {log.total_tonnage_hoisted:,.2f}t")
        print(f"Recovery Rate: {log.gold_recovery_rate:,.2f}%")
        print(f"Efficiency: {log.operational_efficiency:,.2f}%")
        print(f"Smelted Gold: {log.smelted_gold:,.2f}g")
        print(f"Gold Price: ${log.gold_price:,.2f}/g")
        print(f"Gross Profit: ${log.gross_profit:,.2f}")
    
    # Get earliest date
    earliest = DailyProductionLog.objects.order_by('date').first()
    latest = DailyProductionLog.objects.order_by('-date').first()
    
    if earliest and latest:
        print(f"\nDate range: {earliest.date} to {latest.date}")
    
    # Calculate some averages
    from django.db.models import Avg
    averages = DailyProductionLog.objects.aggregate(
        avg_crushed=Avg('total_tonnage_crushed'),
        avg_recovery=Avg('gold_recovery_rate'),
        avg_gold=Avg('smelted_gold'),
        avg_price=Avg('gold_price')
    )
    
    print("\nAverages:")
    print(f"Average tonnage crushed: {averages['avg_crushed']:,.2f}t")
    print(f"Average recovery rate: {averages['avg_recovery']:,.2f}%")
    print(f"Average daily gold: {averages['avg_gold']:,.2f}g")
    print(f"Average gold price: ${averages['avg_price']:,.2f}/g")

if __name__ == '__main__':
    print('Verifying production data...')
    verify_data()
    print('\nDone!')
