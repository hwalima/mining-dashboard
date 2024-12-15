from django.db import migrations
from django.utils import timezone

def create_initial_stockpiles(apps, schema_editor):
    StockpileVolume = apps.get_model('dashboard', 'StockpileVolume')
    
    # Sample stockpile data
    stockpiles = [
        {
            'name': 'ROM Pad',
            'location': 'Primary Crusher',
            'material_type': 'Run of Mine Ore',
            'capacity': 100000,
            'current_volume': 65000,
            'unit': 'tons',
        },
        {
            'name': 'Crushed Ore',
            'location': 'Mill Feed',
            'material_type': 'Crushed Ore',
            'capacity': 50000,
            'current_volume': 15000,
            'unit': 'tons',
        },
        {
            'name': 'Waste Rock Dump',
            'location': 'North Dump',
            'material_type': 'Waste Rock',
            'capacity': 500000,
            'current_volume': 320000,
            'unit': 'tons',
        },
        {
            'name': 'Low Grade',
            'location': 'South Stockpile',
            'material_type': 'Low Grade Ore',
            'capacity': 200000,
            'current_volume': 180000,
            'unit': 'tons',
        }
    ]
    
    for stockpile_data in stockpiles:
        StockpileVolume.objects.create(**stockpile_data)

def remove_stockpiles(apps, schema_editor):
    StockpileVolume = apps.get_model('dashboard', 'StockpileVolume')
    StockpileVolume.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('dashboard', '0020_stockpilevolume'),
    ]

    operations = [
        migrations.RunPython(create_initial_stockpiles, remove_stockpiles),
    ]
