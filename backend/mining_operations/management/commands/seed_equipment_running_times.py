from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
from mining_operations.models import Equipment, EquipmentRunningTime

class Command(BaseCommand):
    help = 'Seeds equipment running times data from Jan 1, 2024 to Dec 24, 2024'

    def handle(self, *args, **kwargs):
        # Get all equipment
        equipment_list = Equipment.objects.all()
        if not equipment_list:
            self.stdout.write(self.style.ERROR('No equipment found in database. Please add equipment first.'))
            return

        # Generate dates from Jan 1, 2024 to Dec 24, 2024
        start_date = datetime(2024, 1, 1).date()
        end_date = datetime(2024, 12, 24).date()
        
        # Common remarks for random selection
        remarks_list = [
            "Normal operation",
            "Scheduled maintenance",
            "Minor repairs needed",
            "Operating at full capacity",
            "Reduced operation due to maintenance",
            "Regular inspection completed",
            "Performance optimization required",
            "Operating efficiently",
            "Routine check completed",
            "Minor adjustments made"
        ]

        # Delete existing records in this date range
        EquipmentRunningTime.objects.filter(
            date__range=(start_date, end_date)
        ).delete()

        # Create running time records
        records_to_create = []
        current_date = start_date
        while current_date <= end_date:
            for equipment in equipment_list:
                # Generate random running hours between 4 and 12
                running_hours = round(random.uniform(4, 12), 2)
                
                # Randomly select a remark
                remark = random.choice(remarks_list)

                # Create the record
                running_time = EquipmentRunningTime(
                    date=current_date,
                    equipment=equipment,
                    total_running_hours=running_hours,
                    remarks=remark
                )
                records_to_create.append(running_time)

            current_date += timedelta(days=1)

        # Bulk create all records
        EquipmentRunningTime.objects.bulk_create(records_to_create)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(records_to_create)} equipment running time records'
            )
        )
