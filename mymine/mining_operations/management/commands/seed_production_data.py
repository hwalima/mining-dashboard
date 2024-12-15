from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
import math
from mining_operations.models import MiningSite, DailyProductionLog

class Command(BaseCommand):
    help = 'Seed production data for the mining dashboard'

    def handle(self, *args, **options):
        # Get or create a default mining site
        site, _ = MiningSite.objects.get_or_create(
            name="Main Site",
            defaults={
                'location': 'Main Location',
                'area_hectares': 1000,
                'estimated_gold_reserves': 5000,
            }
        )

        # Generate data from Jan 1, 2023 to Dec 14, 2024
        start_date = datetime(2023, 1, 1).date()
        end_date = datetime(2024, 12, 14).date()
        current_date = start_date

        # Base values for realistic data generation
        base_tonnage_crushed = 1000  # Base tonnage crushed per day
        base_tonnage_hoisted = 1200  # Base tonnage hoisted per day
        base_recovery_rate = 92  # Base gold recovery rate (%)
        base_efficiency = 85  # Base operational efficiency (%)
        base_gold_smelted = 250  # Base gold smelted per day (grams)

        # Gold price range
        start_price = 55.0  # USD per gram on Jan 1, 2023
        end_price = 85.0    # USD per gram on Dec 14, 2024
        total_days = (end_date - start_date).days
        price_increase = (end_price - start_price) / total_days

        # Seasonal and trend factors
        seasonal_peak = 180  # Peak day of the year (approximately summer)
        trend_factor = 0.0002  # Small increasing trend over time

        while current_date <= end_date:
            # Calculate days since start for trend
            days_since_start = (current_date - start_date).days
            
            # Calculate seasonal factor (sine wave with yearly cycle)
            day_of_year = current_date.timetuple().tm_yday
            seasonal_factor = math.sin((day_of_year - seasonal_peak) * 2 * math.pi / 365) * 0.15 + 1

            # Apply trend and seasonal factors
            trend = 1 + (days_since_start * trend_factor)
            
            # Add random variation
            daily_variation = random.uniform(0.85, 1.15)

            # Calculate final values with all factors
            tonnage_crushed = base_tonnage_crushed * trend * seasonal_factor * daily_variation
            tonnage_hoisted = base_tonnage_hoisted * trend * seasonal_factor * daily_variation
            recovery_rate = min(98, base_recovery_rate * seasonal_factor * random.uniform(0.95, 1.05))
            efficiency = min(100, base_efficiency * seasonal_factor * random.uniform(0.90, 1.10))
            
            # Calculate gold smelted with realistic variation
            gold_smelted = base_gold_smelted * trend * seasonal_factor * daily_variation
            
            # Calculate gold price with steady increase
            gold_price = start_price + (price_increase * days_since_start)
            
            # Calculate gross profit
            gross_profit = gold_smelted * gold_price

            # Create the production log
            DailyProductionLog.objects.create(
                date=current_date,
                site=site,
                total_tonnage_crushed=round(tonnage_crushed, 2),
                total_tonnage_hoisted=round(tonnage_hoisted, 2),
                gold_recovery_rate=round(recovery_rate, 2),
                operational_efficiency=round(efficiency, 2),
                smelted_gold=round(gold_smelted, 2),
                gold_price=round(gold_price, 2),
                gross_profit=round(gross_profit, 2)
            )

            current_date += timedelta(days=1)

        self.stdout.write(self.style.SUCCESS('Successfully seeded production data'))
