from django.core.management.base import BaseCommand
from django.db import connection
from decimal import Decimal
import random

class Command(BaseCommand):
    help = 'Updates tonnage values for DailyProductionLog entries'

    def handle(self, *args, **kwargs):
        # Update values directly in the database
        with connection.cursor() as cursor:
            # First, get all dates from the DailyProductionLog
            cursor.execute("SELECT date FROM dashboard_productionmetrics")
            dates = cursor.fetchall()
            
            updated_count = 0
            for date_tuple in dates:
                date = date_tuple[0]
                
                # Generate different but related tonnage values
                # Hoisted tonnage is the initial amount
                hoisted = round(random.uniform(1000, 5000), 2)
                
                # Crushed tonnage will be slightly less than hoisted (90-98% of hoisted)
                crushed_factor = random.uniform(0.90, 0.98)
                crushed = round(hoisted * crushed_factor, 2)
                
                # Update the record with both tonnage values
                cursor.execute(
                    """UPDATE dashboard_productionmetrics 
                       SET total_tonnage_hoisted = %s,
                           total_tonnage_crushed = %s
                       WHERE date = %s""",
                    [hoisted, crushed, date]
                )
                updated_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} production logs with varied tonnage values'
            )
        )
