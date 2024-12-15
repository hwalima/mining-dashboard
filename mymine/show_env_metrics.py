import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Max, Min
from termcolor import colored

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import EnvironmentalMetric

def get_trend_indicator(current, previous):
    """Return trend indicator based on comparison with previous period"""
    if not current or not previous:
        return "?"
    if current > previous * 1.05:  # 5% increase
        return colored("↑", "red" if current > previous * 1.1 else "green")
    elif current < previous * 0.95:  # 5% decrease
        return colored("↓", "green" if current > previous * 0.9 else "red")
    return colored("→", "yellow")

def format_value(value, decimal_places=2):
    """Format value with proper decimal places, handle None values"""
    if value is None:
        return "N/A"
    return f"{value:.{decimal_places}f}"

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
    avg_rehab=Avg('rehabilitation_area_m2'),
    max_dust=Max('dust_level_pm10'),
    min_dust=Min('dust_level_pm10'),
    max_noise=Max('noise_level_db'),
    min_noise=Min('noise_level_db'),
    max_water=Max('water_usage_m3'),
    min_water=Min('water_usage_m3'),
    max_ph=Max('waste_water_ph'),
    min_ph=Min('waste_water_ph')
)

previous_stats = previous_records.aggregate(
    avg_dust=Avg('dust_level_pm10'),
    avg_noise=Avg('noise_level_db'),
    avg_water=Avg('water_usage_m3'),
    avg_ph=Avg('waste_water_ph'),
    avg_rehab=Avg('rehabilitation_area_m2')
)

# Get trend indicators
dust_trend = get_trend_indicator(current_stats['avg_dust'], previous_stats['avg_dust'])
noise_trend = get_trend_indicator(current_stats['avg_noise'], previous_stats['avg_noise'])
water_trend = get_trend_indicator(current_stats['avg_water'], previous_stats['avg_water'])
ph_trend = get_trend_indicator(current_stats['avg_ph'], previous_stats['avg_ph'])
rehab_trend = get_trend_indicator(current_stats['avg_rehab'], previous_stats['avg_rehab'])

# Print header
print("\n" + "=" * 80)
print(colored("Environmental Metrics Summary (Last 30 Days)", "cyan", attrs=["bold"]))
print("=" * 80)

# Print metrics with proper formatting
print("\nDust Level (PM10):")
print(f"  Average: {format_value(current_stats['avg_dust'])} µg/m³ {dust_trend}")
print(f"  Range: {format_value(current_stats['min_dust'])} - {format_value(current_stats['max_dust'])} µg/m³")

print("\nNoise Level:")
print(f"  Average: {format_value(current_stats['avg_noise'], 1)} dB {noise_trend}")
print(f"  Range: {format_value(current_stats['min_noise'], 1)} - {format_value(current_stats['max_noise'], 1)} dB")

print("\nWater Usage:")
print(f"  Average: {format_value(current_stats['avg_water'])} m³/day {water_trend}")
print(f"  Range: {format_value(current_stats['min_water'])} - {format_value(current_stats['max_water'])} m³/day")

print("\npH Level:")
print(f"  Average: {format_value(current_stats['avg_ph'], 2)} {ph_trend}")
print(f"  Range: {format_value(current_stats['min_ph'], 2)} - {format_value(current_stats['max_ph'], 2)}")

print("\nRehabilitation Area:")
print(f"  Total Area: {format_value(current_stats['avg_rehab'])} m² {rehab_trend}")

# Print alerts
print("\nAlerts:")
latest = current_records.first()
if latest:
    alerts = []
    if latest.dust_level_pm10 > 50:  # Example threshold
        alerts.append(colored("⚠ High dust levels detected!", "red"))
    if latest.noise_level_db > 85:  # Example threshold
        alerts.append(colored("⚠ Noise levels exceed safety threshold!", "red"))
    if latest.waste_water_ph < 6 or latest.waste_water_ph > 9:
        alerts.append(colored("⚠ pH levels outside acceptable range!", "red"))
    
    if alerts:
        for alert in alerts:
            print(f"  {alert}")
    else:
        print(colored("  ✓ All metrics within acceptable ranges", "green"))

print("\nNote: Trend indicators compare current period with previous 30 days")
