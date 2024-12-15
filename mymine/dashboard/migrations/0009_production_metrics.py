from django.db import migrations, models
import datetime
from django.utils import timezone
import random

def create_sample_production_data(apps, schema_editor):
    ProductionMetrics = apps.get_model('dashboard', 'ProductionMetrics')
    
    # Generate data from Jan 1, 2023 to Dec 12, 2024
    start_date = datetime.date(2023, 1, 1)
    end_date = datetime.date(2024, 12, 12)
    
    current_date = start_date
    while current_date <= end_date:
        # Base values
        base_tonnage_crushed = 1200  # base tonnage per day
        base_tonnage_hoisted = 1100  # slightly less than crushed
        base_recovery_rate = 92.5    # base recovery rate
        base_efficiency = 85.0       # base operational efficiency
        
        # Add some random variation (±10%)
        variation_crushed = random.uniform(0.9, 1.1)
        variation_hoisted = random.uniform(0.9, 1.1)
        variation_recovery = random.uniform(0.95, 1.05)  # Less variation in recovery
        variation_efficiency = random.uniform(0.95, 1.05)  # Less variation in efficiency
        
        ProductionMetrics.objects.create(
            date=current_date,
            total_tonnage_crushed=round(base_tonnage_crushed * variation_crushed, 2),
            total_tonnage_hoisted=round(base_tonnage_hoisted * variation_hoisted, 2),
            gold_recovery_rate=round(min(base_recovery_rate * variation_recovery, 99.99), 2),  # Cap at 99.99%
            operational_efficiency=round(min(base_efficiency * variation_efficiency, 99.99), 2),  # Cap at 99.99%
            notes="Sample data"
        )
        
        current_date += datetime.timedelta(days=1)

class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0008_seed_historical_energy_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProductionMetrics',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
                ('total_tonnage_crushed', models.DecimalField(decimal_places=2, max_digits=10)),
                ('total_tonnage_hoisted', models.DecimalField(decimal_places=2, max_digits=10)),
                ('gold_recovery_rate', models.DecimalField(decimal_places=2, max_digits=5)),
                ('operational_efficiency', models.DecimalField(decimal_places=2, max_digits=5)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Production Metrics',
                'ordering': ['-date'],
            },
        ),
        migrations.RunPython(create_sample_production_data),
    ]
