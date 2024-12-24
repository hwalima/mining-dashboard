from django.core.management.base import BaseCommand
from dashboard.models import Machinery, EquipmentStatusLog, MaintenanceRecord

class Command(BaseCommand):
    help = 'Check equipment records in the database'

    def handle(self, *args, **options):
        # Check Machinery records
        machinery = Machinery.objects.all()
        self.stdout.write(f"\nTotal machinery records: {machinery.count()}")
        
        if machinery.exists():
            self.stdout.write("\nMachinery Status Breakdown:")
            operational = machinery.filter(status='Operational').count()
            maintenance = machinery.filter(status='Under Maintenance').count()
            out_of_service = machinery.filter(status='Out of Service').count()
            self.stdout.write(f"- Operational: {operational}")
            self.stdout.write(f"- Under Maintenance: {maintenance}")
            self.stdout.write(f"- Out of Service: {out_of_service}")

            # Show some sample records
            self.stdout.write("\nSample machinery records:")
            for machine in machinery[:5]:  # Show first 5 records
                self.stdout.write(f"- {machine.name}: {machine.status} (Efficiency: {machine.efficiency}%)")

        # Check EquipmentStatusLog records
        status_logs = EquipmentStatusLog.objects.all()
        self.stdout.write(f"\nTotal status log records: {status_logs.count()}")
        
        if status_logs.exists():
            self.stdout.write("\nRecent status logs:")
            for log in status_logs.order_by('-date')[:5]:  # Show 5 most recent logs
                self.stdout.write(f"- {log.date}: {log.machinery.name} - {log.status}")

        # Check MaintenanceRecord records
        maintenance_records = MaintenanceRecord.objects.all()
        self.stdout.write(f"\nTotal maintenance records: {maintenance_records.count()}")
        
        if maintenance_records.exists():
            self.stdout.write("\nRecent maintenance records:")
            for record in maintenance_records.order_by('-date')[:5]:  # Show 5 most recent records
                self.stdout.write(f"- {record.date}: {record.machinery.name} - {record.type} (Cost: ${record.cost})")
