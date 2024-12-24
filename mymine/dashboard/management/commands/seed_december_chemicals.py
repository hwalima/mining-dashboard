from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from dashboard.models import ChemicalInventory, ChemicalUsage

class Command(BaseCommand):
    help = 'Seeds chemical usage data for December 2024'

    def handle(self, *args, **kwargs):
        # Clear existing December 2024 data
        ChemicalUsage.objects.filter(
            date__year=2024,
            date__month=12
        ).delete()

        # Define date range
        start_date = datetime(2024, 12, 1).date()
        end_date = datetime(2024, 12, 23).date()

        # Define chemicals with their daily usage patterns
        chemicals_usage = {
            'Sodium Cyanide': {
                'base_usage': 20.0,
                'variation': 5.0,
                'unit': 'kg',
                'process': 'Gold Leaching'
            },
            'Hydrochloric Acid': {
                'base_usage': 15.0,
                'variation': 3.0,
                'unit': 'L',
                'process': 'pH Control'
            },
            'Activated Carbon': {
                'base_usage': 40.0,
                'variation': 8.0,
                'unit': 'kg',
                'process': 'Gold Recovery'
            },
            'Lime': {
                'base_usage': 20.0,
                'variation': 4.0,
                'unit': 'kg',
                'process': 'pH Adjustment'
            }
        }

        # Create usage records for each day and chemical
        current_date = start_date
        while current_date <= end_date:
            for chemical_name, usage_info in chemicals_usage.items():
                # Get the chemical from inventory
                chemical = ChemicalInventory.objects.get(name=chemical_name)
                
                # Calculate usage with some daily variation
                base_usage = usage_info['base_usage']
                variation = usage_info['variation']
                
                # Create usage record
                ChemicalUsage.objects.create(
                    date=current_date,
                    chemical=chemical,
                    amount_used=Decimal(str(base_usage)),
                    process=usage_info['process'],
                    notes=f'Regular process consumption for {current_date.strftime("%Y-%m-%d")}'
                )
                
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created usage record for {chemical_name} on {current_date}: {base_usage}{usage_info["unit"]}'
                    )
                )
            
            current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS('Successfully seeded December 2024 chemical usage data'))
