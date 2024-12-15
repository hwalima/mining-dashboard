from django.db import migrations
import datetime
import random
import math

def create_stockpile_data(apps, schema_editor):
    DailyStockpile = apps.get_model('mining_operations', 'DailyStockpile')
    MiningSite = apps.get_model('mining_operations', 'MiningSite')
    
    # Get or create mining sites
    sites = []
    site_configs = [
        {
            'name': 'Main Pit',
            'base_crushed': 5000,  # Base daily crushed volume
            'base_milled': 4800,   # Base daily milled volume
            'variance': 0.15       # Daily variance
        },
        {
            'name': 'North Extension',
            'base_crushed': 3500,
            'base_milled': 3300,
            'variance': 0.12
        },
        {
            'name': 'South Deposit',
            'base_crushed': 4200,
            'base_milled': 4000,
            'variance': 0.10
        }
    ]
    
    for config in site_configs:
        site, _ = MiningSite.objects.get_or_create(
            name=config['name'],
            defaults={
                'location': f'{config["name"]} Area',
                'area_hectares': random.uniform(100, 500),
                'status': 'active',
                'estimated_gold_reserves': random.uniform(1000, 5000)
            }
        )
        sites.append((site, config))

    # Generate daily data from Jan 1, 2023 to Dec 14, 2024
    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date(2024, 12, 14)
    delta = datetime.timedelta(days=1)
    
    # Seasonal factors (quarterly)
    seasonal_factors = {
        1: 0.95,  # Q1 (slightly lower due to weather)
        2: 1.05,  # Q2 (good conditions)
        3: 1.10,  # Q3 (peak production)
        4: 0.90   # Q4 (holiday season impact)
    }
    
    # Long-term trend factor (slight increase over time)
    def trend_factor(days_from_start):
        return 1.0 + (days_from_start / 730) * 0.1  # 10% increase over 2 years
    
    stockpile_data = []
    current_date = start_date
    days_from_start = 0
    
    while current_date <= end_date:
        # Get seasonal factor based on quarter
        quarter = (current_date.month - 1) // 3 + 1
        seasonal = seasonal_factors[quarter]
        
        # Calculate trend
        trend = trend_factor(days_from_start)
        
        for site, config in sites:
            # Add random daily variation
            daily_factor = 1.0 + random.uniform(-config['variance'], config['variance'])
            
            # Calculate volumes with seasonal and trend factors
            base_crushed = config['base_crushed'] * seasonal * trend * daily_factor
            
            # Milled volume is slightly less than crushed (processing efficiency)
            efficiency = random.uniform(0.92, 0.98)
            base_milled = base_crushed * efficiency
            
            # Add some randomness to daily values
            crushed_volume = round(base_crushed + random.uniform(-100, 100), 2)
            milled_volume = round(base_milled + random.uniform(-100, 100), 2)
            
            # Ensure milled volume doesn't exceed crushed volume
            milled_volume = min(milled_volume, crushed_volume)
            
            stockpile_data.append(DailyStockpile(
                date=current_date,
                site=site,
                crushed_stockpile_volume=crushed_volume,
                milled_stockpile_volume=milled_volume
            ))
        
        current_date += delta
        days_from_start += 1
        
        # Batch create every 30 days to manage memory
        if len(stockpile_data) >= 90:
            DailyStockpile.objects.bulk_create(stockpile_data)
            stockpile_data = []
    
    # Create any remaining records
    if stockpile_data:
        DailyStockpile.objects.bulk_create(stockpile_data)

class Migration(migrations.Migration):
    dependencies = [
        ('mining_operations', '0023_remove_historicalchemicalusagelog_chemical_and_more'),
    ]

    operations = [
        migrations.RunPython(create_stockpile_data),
    ]
