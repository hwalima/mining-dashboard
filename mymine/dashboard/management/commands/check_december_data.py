from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from dashboard.models import Machinery, MaintenanceRecord, EquipmentStatusLog

class Command(BaseCommand):
    help = 'Check equipment data for December 2024'

    def handle(self, *args, **kwargs):
        start_date = datetime(2024, 12, 1).date()
        end_date = datetime(2024, 12, 23).date()

        # Check machinery
        machinery_count = Machinery.objects.count()
        self.stdout.write(f"\nTotal machinery: {machinery_count}")
        
        # Check status distribution
        operational = Machinery.objects.filter(status='Operational').count()
        maintenance = Machinery.objects.filter(status='Under Maintenance').count()
        out_of_service = Machinery.objects.filter(status='Out of Service').count()
        
        self.stdout.write("\nCurrent Status Distribution:")
        self.stdout.write(f"- Operational: {operational}")
        self.stdout.write(f"- Under Maintenance: {maintenance}")
        self.stdout.write(f"- Out of Service: {out_of_service}")

        # Check status logs for December 2024
        december_logs = EquipmentStatusLog.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')
        
        self.stdout.write(f"\nStatus logs in December 2024: {december_logs.count()}")
        self.stdout.write("\nRecent status changes:")
        for log in december_logs.order_by('-date')[:5]:
            self.stdout.write(f"- {log.date}: {log.machinery.name} -> {log.status}")

        # Check maintenance records for December 2024
        december_maintenance = MaintenanceRecord.objects.filter(
            date__range=[start_date, end_date]
        ).order_by('date')
        
        self.stdout.write(f"\nMaintenance records in December 2024: {december_maintenance.count()}")
        self.stdout.write("\nRecent maintenance:")
        for record in december_maintenance.order_by('-date')[:5]:
            self.stdout.write(f"- {record.date}: {record.machinery.name} - {record.type} (${record.cost:.2f})")
