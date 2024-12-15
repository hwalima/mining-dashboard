from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from mining_operations.models import DailyStockpile, MiningSite, DailyProductionLog
import random
import math

class Command(BaseCommand):
    help = 'Seeds stockpile data from Jan 1, 2023 to current date'

    def handle(self, *args, **kwargs):
        # Delete existing data
        DailyStockpile.objects.all().delete()

        # Get all active mining sites
        sites = MiningSite.objects.filter(status='active')
        if not sites.exists():
            self.stdout.write(self.style.ERROR('No active mining sites found. Please seed mining sites first.'))
            return

        # Generate data from Jan 1, 2023 to current date
        start_date = datetime(2023, 1, 1).date()
        end_date = datetime(2024, 12, 13).date()
        
        stockpile_data = []
        current_date = start_date

        # Base values for each site with more realistic initial values
        site_base_values = {
            site.id: {
                'crushed': random.uniform(8000, 12000),  # Base stockpile volume (8000-12000 tonnes)
                'milled': random.uniform(6000, 9000),    # Base milled volume (6000-9000 tonnes)
                'processing_rate': random.uniform(0.85, 0.95),  # Processing efficiency
                'trend_factor': random.uniform(0.98, 1.02),  # Long-term trend factor
            } for site in sites
        }

        # Add seasonal patterns
        def get_seasonal_factor(date):
            # Using sine wave to create seasonal variation
            day_of_year = date.timetuple().tm_yday
            seasonal_factor = math.sin(2 * math.pi * day_of_year / 365)
            return 1 + (seasonal_factor * 0.15)  # ±15% seasonal variation

        # Add weekly patterns
        def get_weekly_factor(date):
            # Reduced production on weekends
            if date.weekday() >= 5:  # Saturday or Sunday
                return 0.7
            return 1.0

        while current_date <= end_date:
            seasonal_factor = get_seasonal_factor(current_date)
            weekly_factor = get_weekly_factor(current_date)
            
            for site in sites:
                # Get base values for this site
                base_values = site_base_values[site.id]
                
                # Calculate daily variation with multiple factors
                daily_factor = random.uniform(0.95, 1.05)  # ±5% random daily variation
                combined_factor = seasonal_factor * weekly_factor * daily_factor * base_values['trend_factor']
                
                # Calculate production values
                crushed_production = base_values['crushed'] * combined_factor
                milled_production = min(
                    crushed_production * base_values['processing_rate'],
                    base_values['milled'] * combined_factor
                )
                
                # Ensure non-negative values
                crushed_volume = max(0, round(crushed_production, 2))
                milled_volume = max(0, round(milled_production, 2))
                
                # Create stockpile record
                stockpile_data.append(DailyStockpile(
                    date=current_date,
                    site=site,
                    crushed_stockpile_volume=crushed_volume,
                    milled_stockpile_volume=milled_volume
                ))
                
                # Update base values with gradual trends
                # Slight increase in capacity over time
                site_base_values[site.id]['crushed'] *= base_values['trend_factor']
                site_base_values[site.id]['milled'] *= base_values['trend_factor']
                
                # Adjust processing rate within bounds
                new_rate = base_values['processing_rate'] + random.uniform(-0.001, 0.002)
                site_base_values[site.id]['processing_rate'] = max(0.80, min(0.98, new_rate))

            current_date += timedelta(days=1)

        # Bulk create all records
        DailyStockpile.objects.bulk_create(stockpile_data)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(stockpile_data)} stockpile records from {start_date} to {end_date}'
            )
        )
