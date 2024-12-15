from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
from dashboard.models import EnvironmentalMetric
import random
import math

class Command(BaseCommand):
    help = 'Seeds environmental metrics data with realistic patterns'

    def handle(self, *args, **kwargs):
        # Delete existing data
        EnvironmentalMetric.objects.all().delete()

        # Generate data from Jan 1, 2023 to current date
        start_date = datetime(2023, 1, 1).date()
        end_date = datetime(2024, 12, 13).date()
        
        metrics_data = []
        current_date = start_date

        # Base values
        base_dust_level = 35  # Base PM10 in µg/m³
        base_noise_level = 75  # Base noise in dB
        base_water_usage = 2000  # Base water usage in m³
        initial_rehabilitation_area = 5000  # Initial rehabilitation area in m²
        base_ph = 7.5  # Base pH level

        # Generate weather patterns (affects dust levels)
        weather_patterns = {}
        for day in range((end_date - start_date).days + 1):
            date = start_date + timedelta(days=day)
            # More dust in dry season (assuming Southern Hemisphere)
            is_dry_season = date.month in [5, 6, 7, 8, 9]  # May to September
            base_weather = random.uniform(0.8, 1.2)
            # Rainy days reduce dust
            is_rainy = random.random() < (0.1 if is_dry_season else 0.4)
            weather_patterns[date] = {
                'base_factor': base_weather,
                'is_rainy': is_rainy,
                'is_dry_season': is_dry_season
            }

        # Production activity patterns (affects noise, water usage, and pH)
        activity_patterns = {}
        for day in range((end_date - start_date).days + 1):
            date = start_date + timedelta(days=day)
            # Lower activity on weekends
            is_weekend = date.weekday() >= 5
            # Random maintenance days (5% chance)
            is_maintenance = random.random() < 0.05
            base_activity = 1.0
            if is_weekend:
                base_activity *= 0.7
            if is_maintenance:
                base_activity *= 0.5
            activity_patterns[date] = {
                'base_factor': base_activity,
                'is_weekend': is_weekend,
                'is_maintenance': is_maintenance
            }

        rehabilitation_area = initial_rehabilitation_area

        while current_date <= end_date:
            weather = weather_patterns[current_date]
            activity = activity_patterns[current_date]
            
            # Calculate dust level
            dust_factor = weather['base_factor']
            if weather['is_rainy']:
                dust_factor *= 0.6  # Rain reduces dust
            if weather['is_dry_season']:
                dust_factor *= 1.3  # Dry season increases dust
            # More dust during high activity
            dust_level = base_dust_level * dust_factor * (0.8 + 0.4 * activity['base_factor'])
            
            # Calculate noise level
            noise_factor = activity['base_factor']
            # Add time-of-day variation (assuming data is for day shift)
            hour_factor = 1.0
            noise_level = base_noise_level * noise_factor * hour_factor
            
            # Calculate water usage
            water_factor = activity['base_factor']
            if weather['is_rainy']:
                water_factor *= 0.8  # Less water needed on rainy days
            if weather['is_dry_season']:
                water_factor *= 1.2  # More water needed in dry season
            water_usage = base_water_usage * water_factor
            
            # Progressive rehabilitation area increase
            if not activity['is_weekend'] and random.random() < 0.3:  # 30% chance of rehabilitation work on weekdays
                rehabilitation_area += random.uniform(10, 50)  # Small daily increases
            
            # Calculate pH level
            ph_factor = 1.0
            if activity['base_factor'] > 0.8:
                ph_factor *= random.uniform(0.95, 1.05)  # More variation during high activity
            if weather['is_rainy']:
                ph_factor *= random.uniform(0.98, 1.02)  # Rain affects pH slightly
            ph_level = base_ph * ph_factor
            
            # Create the metric
            metrics_data.append(EnvironmentalMetric(
                date=current_date,
                dust_level_pm10=round(dust_level, 2),
                noise_level_db=round(noise_level, 1),
                water_usage_m3=round(water_usage, 1),
                rehabilitation_area_m2=round(rehabilitation_area, 1),
                waste_water_ph=round(ph_level, 2)
            ))
            
            current_date += timedelta(days=1)

        # Bulk create all metrics
        EnvironmentalMetric.objects.bulk_create(metrics_data)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(metrics_data)} environmental metric records from {start_date} to {end_date}'
            )
        )
