import os
import sys
import django
from datetime import datetime, timedelta

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from dashboard.models import EnergyUsage

def check_energy_data():
    # Get current date
    today = datetime.strptime('2024-12-12', '%Y-%m-%d').date()
    
    # Check today's data
    print("\nToday's data:")
    today_data = EnergyUsage.objects.filter(date=today)
    if today_data.exists():
        data = today_data.first()
        print(f"Electricity: {data.electricity_kwh} kWh, Cost: ${data.electricity_cost}")
        print(f"Diesel: {data.diesel_liters} L, Cost: ${data.diesel_cost}")
        print(f"Total Cost: ${data.total_cost}")
    else:
        print("No data for today")
    
    # Check this week's data
    week_start = today - timedelta(days=today.weekday())
    week_end = today
    print("\nThis week's data:")
    week_data = EnergyUsage.objects.filter(date__range=[week_start, week_end])
    if week_data.exists():
        totals = week_data.aggregate(
            total_electricity=django.db.models.Sum('electricity_kwh'),
            total_electricity_cost=django.db.models.Sum('electricity_cost'),
            total_diesel=django.db.models.Sum('diesel_liters'),
            total_diesel_cost=django.db.models.Sum('diesel_cost'),
            total_cost=django.db.models.Sum('total_cost')
        )
        print(f"Date range: {week_start} to {week_end}")
        print(f"Number of records: {week_data.count()}")
        print(f"Total Electricity: {totals['total_electricity']} kWh, Cost: ${totals['total_electricity_cost']}")
        print(f"Total Diesel: {totals['total_diesel']} L, Cost: ${totals['total_diesel_cost']}")
        print(f"Total Cost: ${totals['total_cost']}")
    else:
        print("No data for this week")
    
    # Check this month's data
    month_start = today.replace(day=1)
    print("\nThis month's data:")
    month_data = EnergyUsage.objects.filter(date__range=[month_start, today])
    if month_data.exists():
        totals = month_data.aggregate(
            total_electricity=django.db.models.Sum('electricity_kwh'),
            total_electricity_cost=django.db.models.Sum('electricity_cost'),
            total_diesel=django.db.models.Sum('diesel_liters'),
            total_diesel_cost=django.db.models.Sum('diesel_cost'),
            total_cost=django.db.models.Sum('total_cost')
        )
        print(f"Date range: {month_start} to {today}")
        print(f"Number of records: {month_data.count()}")
        print(f"Total Electricity: {totals['total_electricity']} kWh, Cost: ${totals['total_electricity_cost']}")
        print(f"Total Diesel: {totals['total_diesel']} L, Cost: ${totals['total_diesel_cost']}")
        print(f"Total Cost: ${totals['total_cost']}")
    else:
        print("No data for this month")
    
    # Check last 30 days data
    thirty_days_ago = today - timedelta(days=30)
    print("\nLast 30 days data:")
    thirty_days_data = EnergyUsage.objects.filter(date__range=[thirty_days_ago, today])
    if thirty_days_data.exists():
        totals = thirty_days_data.aggregate(
            total_electricity=django.db.models.Sum('electricity_kwh'),
            total_electricity_cost=django.db.models.Sum('electricity_cost'),
            total_diesel=django.db.models.Sum('diesel_liters'),
            total_diesel_cost=django.db.models.Sum('diesel_cost'),
            total_cost=django.db.models.Sum('total_cost')
        )
        print(f"Date range: {thirty_days_ago} to {today}")
        print(f"Number of records: {thirty_days_data.count()}")
        print(f"Total Electricity: {totals['total_electricity']} kWh, Cost: ${totals['total_electricity_cost']}")
        print(f"Total Diesel: {totals['total_diesel']} L, Cost: ${totals['total_diesel_cost']}")
        print(f"Total Cost: ${totals['total_cost']}")
        
        # Print daily records for inspection
        print("\nDaily records:")
        for record in thirty_days_data.order_by('date'):
            print(f"{record.date}: Electricity={record.electricity_kwh}kWh, Diesel={record.diesel_liters}L")
    else:
        print("No data for last 30 days")

if __name__ == '__main__':
    check_energy_data()
