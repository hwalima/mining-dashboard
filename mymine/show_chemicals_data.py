import os
import sys
import django
from datetime import datetime, timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import MiningChemical, DailyChemicalsUsed

def show_chemicals_data():
    print("\n=== Mining Chemicals ===")
    print("ID | Name | Unit | Current Stock | Unit Price")
    print("-" * 50)
    for chemical in MiningChemical.objects.all():
        print(f"{chemical.id} | {chemical.name} | {chemical.unit_of_measurement} | {chemical.current_stock} | ${chemical.unit_price}")

    print("\n=== Daily Chemicals Usage (Last 7 Days) ===")
    print("Date | Chemical | Department | Quantity Used | Total Cost")
    print("-" * 70)
    
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=7)
    
    usage_records = DailyChemicalsUsed.objects.filter(
        date__gte=start_date,
        date__lte=end_date
    ).order_by('-date')[:10]  # Show last 10 records
    
    for record in usage_records:
        print(f"{record.date} | {record.chemical.name} | {record.department.name} | {record.quantity_used} {record.chemical.unit_of_measurement} | ${record.total_cost}")

if __name__ == '__main__':
    show_chemicals_data()
