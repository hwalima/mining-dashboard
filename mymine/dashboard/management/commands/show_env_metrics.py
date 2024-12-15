from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db.models import Avg, Max, Min
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import pandas as pd
from mining_operations.models import EnvironmentalMetric

class Command(BaseCommand):
    help = 'Display environmental metrics summary and create visualizations'

    def get_trend_indicator(self, current, previous):
        """Return trend indicator based on comparison with previous period"""
        if current > previous * 1.05:  # 5% increase
            return "↑"
        elif current < previous * 0.95:  # 5% decrease
            return "↓"
        return "→"

    def handle(self, *args, **kwargs):
        # Get the last 30 days of records
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)

        # Get current and previous period records
        current_records = EnvironmentalMetric.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).order_by('-date')

        previous_start = start_date - timedelta(days=30)
        previous_records = EnvironmentalMetric.objects.filter(
            date__gte=previous_start,
            date__lt=start_date
        )

        # Calculate current and previous averages
        current_stats = current_records.aggregate(
            avg_dust=Avg('dust_level_pm10'),
            avg_noise=Avg('noise_level_db'),
            avg_water=Avg('water_usage_m3'),
            avg_ph=Avg('waste_water_ph'),
            max_dust=Max('dust_level_pm10'),
            min_dust=Min('dust_level_pm10'),
            max_noise=Max('noise_level_db'),
            min_noise=Min('noise_level_db')
        )

        previous_stats = previous_records.aggregate(
            avg_dust=Avg('dust_level_pm10'),
            avg_noise=Avg('noise_level_db'),
            avg_water=Avg('water_usage_m3'),
            avg_ph=Avg('waste_water_ph')
        )

        # Get trend indicators
        dust_trend = self.get_trend_indicator(current_stats['avg_dust'], previous_stats['avg_dust'])
        noise_trend = self.get_trend_indicator(current_stats['avg_noise'], previous_stats['avg_noise'])
        water_trend = self.get_trend_indicator(current_stats['avg_water'], previous_stats['avg_water'])
        ph_trend = self.get_trend_indicator(current_stats['avg_ph'], previous_stats['avg_ph'])

        # Print summary report
        self.stdout.write("\nEnvironmental Metrics Summary (Last 30 Days)")
        self.stdout.write("=" * 80)
        self.stdout.write(f"Dust Level (PM10):")
        self.stdout.write(f"  Average: {current_stats['avg_dust']:.2f} µg/m³ {dust_trend}")
        self.stdout.write(f"  Range: {current_stats['min_dust']:.2f} - {current_stats['max_dust']:.2f} µg/m³")
        self.stdout.write(f"\nNoise Level:")
        self.stdout.write(f"  Average: {current_stats['avg_noise']:.1f} dB {noise_trend}")
        self.stdout.write(f"  Range: {current_stats['min_noise']:.1f} - {current_stats['max_noise']:.1f} dB")
        self.stdout.write(f"\nWater Usage:")
        self.stdout.write(f"  Average: {current_stats['avg_water']:.1f} m³/day {water_trend}")
        self.stdout.write(f"\npH Level:")
        self.stdout.write(f"  Average: {current_stats['avg_ph']:.2f} {ph_trend}")

        try:
            # Create visualizations
            records_df = pd.DataFrame(list(current_records.values()))
            records_df['date'] = pd.to_datetime(records_df['date'])

            # Set up the plot
            plt.style.use('seaborn')
            fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
            fig.suptitle('Environmental Metrics - Last 30 Days', fontsize=16)

            # Dust levels plot
            ax1.plot(records_df['date'], records_df['dust_level_pm10'], color='brown')
            ax1.set_title('Dust Levels (PM10)')
            ax1.set_ylabel('µg/m³')
            ax1.tick_params(axis='x', rotation=45)

            # Noise levels plot
            ax2.plot(records_df['date'], records_df['noise_level_db'], color='blue')
            ax2.set_title('Noise Levels')
            ax2.set_ylabel('dB')
            ax2.tick_params(axis='x', rotation=45)

            # Water usage plot
            ax3.plot(records_df['date'], records_df['water_usage_m3'], color='cyan')
            ax3.set_title('Water Usage')
            ax3.set_ylabel('m³')
            ax3.tick_params(axis='x', rotation=45)

            # pH levels plot
            ax4.plot(records_df['date'], records_df['waste_water_ph'], color='green')
            ax4.set_title('pH Levels')
            ax4.set_ylabel('pH')
            ax4.tick_params(axis='x', rotation=45)

            plt.tight_layout()
            plt.savefig('environmental_metrics.png')
            plt.close()

            self.stdout.write(self.style.SUCCESS("\nVisualization saved as 'environmental_metrics.png'"))
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"\nCouldn't create visualization: {str(e)}"))

        self.stdout.write("\nNote: Trend indicators (↑/↓/→) compare current period with previous 30 days")
