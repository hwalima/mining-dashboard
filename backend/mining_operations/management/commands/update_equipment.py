from django.core.management.base import BaseCommand
from mining_operations.models import Equipment
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Updates equipment data to match settings page'

    def handle(self, *args, **options):
        # Clear existing equipment
        Equipment.objects.all().delete()

        # Equipment data from settings page
        equipment_data = [
            {
                'name': 'CAT 785D Mining Truck',
                'description': 'Heavy-duty off-highway mining truck with 150-ton payload capacity. Used for hauling ore and waste material.',
                'value_usd': 5500000.00,
                'last_service_date': '2024-11-15',
                'next_service_date': '2024-12-15',
                'service_interval_days': 30
            },
            {
                'name': 'Caterpillar D11T Dozer',
                'description': 'Large track-type tractor for heavy ripping and bulk dozing applications.',
                'value_usd': 1500000.00,
                'last_service_date': '2024-12-12',
                'next_service_date': '2025-01-11',
                'service_interval_days': 30
            },
            {
                'name': 'Epiroc Boomer S2 Drill Rig',
                'description': 'Twin-boom face drilling rig for underground development and production.',
                'value_usd': 1800000.00,
                'last_service_date': '2024-12-08',
                'next_service_date': '2025-01-22',
                'service_interval_days': 45
            },
            {
                'name': 'Hitachi EX5600 Shovel',
                'description': 'Electric mining shovel with 29m³ bucket capacity for high-production loading.',
                'value_usd': 6200000.00,
                'last_service_date': '2024-12-18',
                'next_service_date': '2025-02-01',
                'service_interval_days': 45
            },
            {
                'name': 'Komatsu PC5500 Excavator',
                'description': 'Large hydraulic mining excavator with 29m³ bucket capacity. Primary loading unit for waste and ore.',
                'value_usd': 4800000.00,
                'last_service_date': '2024-12-15',
                'next_service_date': '2025-01-29',
                'service_interval_days': 45
            },
            {
                'name': 'Metso MP1000 Cone Crusher',
                'description': 'Secondary crusher for ore processing with capacity up to 1000 tph.',
                'value_usd': 850000.00,
                'last_service_date': '2024-12-01',
                'next_service_date': '2025-03-01',
                'service_interval_days': 90
            },
            {
                'name': 'Sandvik TH663i Underground Truck',
                'description': 'Underground mining truck with 63-tonne payload capacity. Automated haulage system compatible.',
                'value_usd': 2100000.00,
                'last_service_date': '2024-12-20',
                'next_service_date': '2025-01-19',
                'service_interval_days': 30
            },
            {
                'name': 'Ball Mill',
                'description': 'Blasthole drilling rig capable of drilling 251-311mm diameter holes up to 40m deep.',
                'value_usd': 3200000.00,
                'last_service_date': '2024-12-05',
                'next_service_date': '2025-02-03',
                'service_interval_days': 60
            }
        ]

        # Create equipment records
        for data in equipment_data:
            Equipment.objects.create(
                name=data['name'],
                description=data['description'],
                value_usd=data['value_usd'],
                last_service_date=data['last_service_date'],
                next_service_date=data['next_service_date'],
                service_interval_days=data['service_interval_days']
            )
            
        self.stdout.write(self.style.SUCCESS('Successfully updated equipment data'))
