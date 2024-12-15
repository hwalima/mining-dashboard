from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
from mining_operations.models import EnergyUsage

class Command(BaseCommand):
    help = 'Seeds energy usage data from Jan 1, 2023 to Dec 10, 2024'

    def handle(self, *args, **kwargs):
        # Delete existing data
        EnergyUsage.objects.all().delete()
        
        # Set date range
        start_date = datetime(2023, 1, 1).date()
        end_date = datetime(2024, 12, 10).date()
        
        # Base values and seasonal variations
        base_electricity_kwh = 45000  # Base daily electricity usage
        base_diesel_liters = 2000     # Base daily diesel usage
        base_electricity_cost = 0.15   # Base cost per kWh
        base_diesel_cost = 1.50       # Base cost per liter
        
        # Generate daily data
        current_date = start_date
        while current_date <= end_date:
            # Add seasonal variation (higher in winter months)
            month = current_date.month
            season_factor = 1.2 if month in [5, 6, 7, 8] else 1.0  # Southern hemisphere winter
            
            # Add random daily variation (±15%)
            daily_variation = random.uniform(0.85, 1.15)
            
            # Calculate electricity usage and cost
            electricity_kwh = base_electricity_kwh * season_factor * daily_variation
            electricity_cost_per_kwh = base_electricity_cost * (1 + random.uniform(-0.05, 0.05))
            electricity_cost = electricity_kwh * electricity_cost_per_kwh
            
            # Calculate diesel usage and cost
            diesel_liters = base_diesel_liters * season_factor * daily_variation
            diesel_cost_per_liter = base_diesel_cost * (1 + random.uniform(-0.05, 0.05))
            diesel_cost = diesel_liters * diesel_cost_per_liter
            
            # Create energy usage record
            EnergyUsage.objects.create(
                date=current_date,
                electricity_kwh=round(electricity_kwh, 2),
                electricity_cost=round(electricity_cost, 2),
                diesel_liters=round(diesel_liters, 2),
                diesel_cost=round(diesel_cost, 2)
            )
            
            current_date += timedelta(days=1)
            
        self.stdout.write(self.style.SUCCESS('Successfully seeded energy usage data'))
