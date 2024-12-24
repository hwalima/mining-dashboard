from django.db import migrations
from datetime import datetime, timedelta

def populate_mining_equipment(apps, schema_editor):
    MiningEquipment = apps.get_model('mining_operations', 'MiningEquipment')
    
    # Sample equipment data
    equipment_data = [
        {
            'name': 'CAT 785D Mining Truck',
            'description': 'Heavy-duty off-highway mining truck with 150-ton payload capacity. Used for hauling ore and waste material.',
            'value_usd': 5500000.00,
            'last_service_date': '2024-12-10',
            'service_interval_days': 30,
        },
        {
            'name': 'Komatsu PC5500 Excavator',
            'description': 'Large hydraulic mining excavator with 29m³ bucket capacity. Primary loading unit for waste and ore.',
            'value_usd': 4800000.00,
            'last_service_date': '2024-12-15',
            'service_interval_days': 45,
        },
        {
            'name': 'Atlas Copco Pit Viper 351 Drill',
            'description': 'Blasthole drilling rig capable of drilling 251-311mm diameter holes up to 40m deep.',
            'value_usd': 3200000.00,
            'last_service_date': '2024-12-05',
            'service_interval_days': 60,
        },
        {
            'name': 'Metso MP1000 Cone Crusher',
            'description': 'Secondary crusher for ore processing with capacity up to 1000 tph.',
            'value_usd': 850000.00,
            'last_service_date': '2024-12-01',
            'service_interval_days': 90,
        },
        {
            'name': 'Sandvik TH663i Underground Truck',
            'description': 'Underground mining truck with 63-tonne payload capacity. Automated haulage system compatible.',
            'value_usd': 2100000.00,
            'last_service_date': '2024-12-20',
            'service_interval_days': 30,
        },
        {
            'name': 'Epiroc Boomer S2 Drill Rig',
            'description': 'Twin-boom face drilling rig for underground development and production.',
            'value_usd': 1800000.00,
            'last_service_date': '2024-12-08',
            'service_interval_days': 45,
        },
        {
            'name': 'Caterpillar D11T Dozer',
            'description': 'Large track-type tractor for heavy ripping and bulk dozing applications.',
            'value_usd': 1500000.00,
            'last_service_date': '2024-12-12',
            'service_interval_days': 30,
        },
        {
            'name': 'Hitachi EX5600 Shovel',
            'description': 'Electric mining shovel with 29m³ bucket capacity for high-production loading.',
            'value_usd': 6200000.00,
            'last_service_date': '2024-12-18',
            'service_interval_days': 45,
        }
    ]
    
    for data in equipment_data:
        last_service = datetime.strptime(data['last_service_date'], '%Y-%m-%d').date()
        next_service = last_service + timedelta(days=data['service_interval_days'])
        
        MiningEquipment.objects.create(
            name=data['name'],
            description=data['description'],
            value_usd=data['value_usd'],
            last_service_date=last_service,
            next_service_date=next_service,
            service_interval_days=data['service_interval_days']
        )

def reverse_populate(apps, schema_editor):
    MiningEquipment = apps.get_model('mining_operations', 'MiningEquipment')
    MiningEquipment.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('mining_operations', '0034_create_mining_equipment'),
    ]

    operations = [
        migrations.RunPython(populate_mining_equipment, reverse_populate),
    ]
