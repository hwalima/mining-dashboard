from django.core.management.base import BaseCommand
from mining_operations.models import (
    MiningDepartment, MiningSite, HeavyMachinery, 
    GoldMillingEquipment, DailyProductionLog,
    MiningChemical, DailyChemicalsUsed, SafetyIncident
)

class Command(BaseCommand):
    help = 'Verify sample data inserted into the database'

    def handle(self, *args, **kwargs):
        # Print counts for each model
        models_to_check = [
            MiningDepartment, MiningSite, HeavyMachinery, 
            GoldMillingEquipment, DailyProductionLog,
            MiningChemical, DailyChemicalsUsed, SafetyIncident
        ]

        for model in models_to_check:
            count = model.objects.count()
            self.stdout.write(f'{model.__name__}: {count} records')

        # Optional: Print some detailed information about the first record of each model
        for model in models_to_check:
            first_record = model.objects.first()
            if first_record:
                self.stdout.write(f'\nFirst {model.__name__} record:')
                self.stdout.write(str(first_record))
