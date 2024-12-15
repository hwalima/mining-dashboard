from django.db import migrations, models
import django.core.validators
from django.utils import timezone

def migrate_stockpile_data(apps, schema_editor):
    DailyStockpile = apps.get_model('mining_operations', 'DailyStockpile')
    StockpileVolume = apps.get_model('mining_operations', 'StockpileVolume')
    
    for stockpile in DailyStockpile.objects.all():
        StockpileVolume.objects.create(
            date=stockpile.date,
            ore_tons=stockpile.crushed_stockpile_volume,
            waste_tons=stockpile.milled_stockpile_volume,
            grade_gpt=0.0,  # Default value since old model didn't track this
            location=f"Site-{stockpile.site.name}",
            created_at=timezone.now(),
            updated_at=timezone.now()
        )

def migrate_environmental_data(apps, schema_editor):
    EnvironmentalImpactLog = apps.get_model('mining_operations', 'EnvironmentalImpactLog')
    EnvironmentalMetric = apps.get_model('mining_operations', 'EnvironmentalMetric')
    
    for log in EnvironmentalImpactLog.objects.all():
        EnvironmentalMetric.objects.create(
            date=log.date,
            water_usage_m3=log.water_usage,
            noise_level_db=log.noise_level,
            carbon_emissions=log.carbon_emissions,
            waste_generated=log.waste_generated,
            additional_notes=log.additional_notes,
            dust_level_pm10=0.0,  # Default values for new fields
            rehabilitation_area_m2=0.0,
            waste_water_ph=7.0,
            created_at=timezone.now(),
            updated_at=timezone.now()
        )

class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0025_cleanup_production_logs'),
    ]

    operations = [
        # Update StockpileVolume model
        migrations.AddField(
            model_name='stockpilevolume',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='stockpilevolume',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        
        # Update ExplosivesInventory model
        migrations.AddField(
            model_name='explosivesinventory',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='explosivesinventory',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        
        # Update EnvironmentalMetric model
        migrations.AddField(
            model_name='environmentalmetric',
            name='additional_notes',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='environmentalmetric',
            name='carbon_emissions',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Carbon emissions in metric tons', max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='environmentalmetric',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='environmentalmetric',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name='environmentalmetric',
            name='waste_generated',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Waste generated in metric tons', max_digits=10),
            preserve_default=False,
        ),
        
        # Run data migrations
        migrations.RunPython(migrate_stockpile_data),
        migrations.RunPython(migrate_environmental_data),
        
        # Remove redundant models
        migrations.DeleteModel(
            name='DailyExplosivesUsed',
        ),
        migrations.DeleteModel(
            name='DailyStockpile',
        ),
        migrations.DeleteModel(
            name='EnvironmentalImpactLog',
        ),
    ]
