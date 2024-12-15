from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import EnergyUsage
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Seeds energy usage data'

    def handle(self, *args, **kwargs):
        try:
            # Clear existing data
            EnergyUsage.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('Cleared existing data'))

            # Generate dates and insert data
            start_date = timezone.datetime(2024, 11, 1, tzinfo=timezone.get_current_timezone())
            end_date = timezone.datetime(2024, 12, 15, tzinfo=timezone.get_current_timezone())
            current_date = start_date

            records = []
            while current_date <= end_date:
                record = EnergyUsage(
                    date=current_date.date(),
                    electricity_kwh=1000.00,
                    electricity_cost=1500.00,
                    diesel_liters=500.00,
                    diesel_cost=1000.00,
                    total_cost=2500.00,
                    notes=f'Sample data for {current_date.date()}'
                )
                records.append(record)
                current_date += timedelta(days=1)

            # Bulk create all records
            EnergyUsage.objects.bulk_create(records)
            
            # Verify the data
            count = EnergyUsage.objects.count()
            self.stdout.write(self.style.SUCCESS(f'Successfully seeded {count} energy usage records'))
            
            # Show sample data
            sample_data = EnergyUsage.objects.all()[:2]
            self.stdout.write("Sample data:")
            for record in sample_data:
                self.stdout.write(f"Date: {record.date}, Electricity: {record.electricity_kwh} kWh, Diesel: {record.diesel_liters} L")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Failed to seed data: {str(e)}'))
