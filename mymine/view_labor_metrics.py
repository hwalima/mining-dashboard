import os
import django
import sys
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import LaborMetric, MiningDepartment
from django.db.models import Avg, Sum, Count
from django.utils import timezone

# Get all labor metrics ordered by date and shift
labor_metrics = LaborMetric.objects.all().order_by('-date', 'shift')

print("\n=== Labor Metrics Summary ===")
print(f"Total records: {labor_metrics.count()}")

# Get summary statistics
total_cost = labor_metrics.aggregate(Sum('total_labor_cost'))['total_labor_cost__sum'] or 0
avg_workers = labor_metrics.aggregate(Avg('workers_present'))['workers_present__avg'] or 0
total_hours = labor_metrics.aggregate(
    regular=Sum('hours_worked'),
    overtime=Sum('overtime_hours')
)

print(f"\nOverall Statistics:")
print(f"Total Labor Cost: ${total_cost:,.2f}")
print(f"Average Workers per Shift: {avg_workers:.1f}")
print(f"Total Regular Hours: {total_hours['regular']:,.1f}")
print(f"Total Overtime Hours: {total_hours['overtime']:,.1f}")

# Get shift distribution
shift_counts = labor_metrics.values('shift').annotate(count=Count('id'))
print("\nShift Distribution:")
for shift in shift_counts:
    print(f"{shift['shift']}: {shift['count']} records")

# Get department statistics
dept_stats = labor_metrics.values('department__name').annotate(
    total_cost=Sum('total_labor_cost'),
    avg_workers=Avg('workers_present')
).order_by('-total_cost')

print("\nDepartment Statistics:")
print("Department | Total Cost | Avg Workers")
print("-" * 50)
for dept in dept_stats:
    if dept['department__name']:  # Skip if department is None
        print(f"{dept['department__name']:<20} | ${dept['total_cost']:,.2f} | {dept['avg_workers']:.1f}")

# Show latest records
print("\nLatest Records:")
print("Date       | Shift     | Department      | Workers | Hours | OT Hours | Cost")
print("-" * 80)
for record in labor_metrics[:10]:  # Show last 10 records
    dept_name = record.department.name if record.department else 'Unknown'
    print(f"{record.date} | {record.shift:<9} | {dept_name:<14} | {record.workers_present:>7} | {record.hours_worked:>5.1f} | {record.overtime_hours:>8.1f} | ${record.total_labor_cost:,.2f}")
