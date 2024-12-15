import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from dashboard.models import Machinery, MaintenanceRecord

# Check Machinery
machinery = Machinery.objects.all()
print("\nMachinery Count:", machinery.count())
if machinery.exists():
    print("\nMachinery Records:")
    for m in machinery:
        print(f"- {m.name} ({m.type}): {m.status}")
else:
    print("No machinery records found!")

# Check Maintenance Records
maintenance = MaintenanceRecord.objects.all()
print("\nMaintenance Records Count:", maintenance.count())
if maintenance.exists():
    print("\nRecent Maintenance Records:")
    for m in maintenance.order_by('-date')[:5]:
        print(f"- {m.date}: {m.machinery.name} - {m.type}")
else:
    print("No maintenance records found!")
