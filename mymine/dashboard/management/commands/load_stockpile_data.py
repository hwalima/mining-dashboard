from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import StockpileVolume
from decimal import Decimal
import datetime

class Command(BaseCommand):
    help = 'Load sample stockpile volume data'

    def handle(self, *args, **kwargs):
        # Define stockpile locations
        stockpiles = [
            {
                'name': 'ROM Pad',
                'location': 'Primary Crusher',
                'material_type': 'Run of Mine Ore',
                'capacity': Decimal('100000.00'),  # 100,000 tons capacity
                'current_volume': Decimal('65000.00'),  # 65,000 tons current
                'unit': 'tons',
            },
            {
                'name': 'Waste Rock Dump',
                'location': 'North Dump',
                'material_type': 'Waste Rock',
                'capacity': Decimal('500000.00'),  # 500,000 tons capacity
                'current_volume': Decimal('320000.00'),  # 320,000 tons current
                'unit': 'tons',
            },
            {
                'name': 'Crushed Ore',
                'location': 'Mill Feed',
                'material_type': 'Crushed Ore',
                'capacity': Decimal('50000.00'),  # 50,000 tons capacity
                'current_volume': Decimal('15000.00'),  # 15,000 tons current
                'unit': 'tons',
            },
            {
                'name': 'Low Grade',
                'location': 'South Stockpile',
                'material_type': 'Low Grade Ore',
                'capacity': Decimal('200000.00'),  # 200,000 tons capacity
                'current_volume': Decimal('180000.00'),  # 180,000 tons current
                'unit': 'tons',
            },
        ]

        # Create or update stockpile records
        for stockpile_data in stockpiles:
            stockpile, created = StockpileVolume.objects.get_or_create(
                name=stockpile_data['name'],
                defaults=stockpile_data
            )
            
            if not created:
                # Update existing stockpile
                for key, value in stockpile_data.items():
                    setattr(stockpile, key, value)
                stockpile.save()
                self.stdout.write(
                    self.style.WARNING(
                        f'Updated stockpile: {stockpile.name} - Current volume: {stockpile.current_volume}{stockpile.unit}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Created stockpile: {stockpile.name} - Current volume: {stockpile.current_volume}{stockpile.unit}'
                    )
                )
