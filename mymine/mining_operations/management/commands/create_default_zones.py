from django.core.management.base import BaseCommand
from mining_operations.models import Zone, MiningSite

class Command(BaseCommand):
    help = 'Creates default mining zones'

    def handle(self, *args, **kwargs):
        # Create a default site if none exists
        site, _ = MiningSite.objects.get_or_create(
            name='Main Site',
            defaults={
                'location': 'Main Location',
                'description': 'Main mining site',
                'area_hectares': 1000,
                'estimated_gold_reserves': 1000000,
                'geological_classification': 'Gold Mine',
                'status': 'active'
            }
        )

        # Default zones
        default_zones = [
            {
                'name': 'Underground Mining',
                'code': 'UG',
                'area_type': 'extraction',
                'risk_level': 'high',
                'description': 'Underground mining operations area',
                'max_occupancy': 100,
                'requires_certification': True,
                'site': site
            },
            {
                'name': 'Processing Plant',
                'code': 'PP',
                'area_type': 'processing',
                'risk_level': 'medium',
                'description': 'Mineral processing plant area',
                'max_occupancy': 50,
                'requires_certification': True,
                'site': site
            },
            {
                'name': 'Storage Yard',
                'code': 'SY',
                'area_type': 'storage',
                'risk_level': 'low',
                'description': 'Equipment and materials storage area',
                'max_occupancy': 30,
                'requires_certification': False,
                'site': site
            },
            {
                'name': 'Maintenance Workshop',
                'code': 'MW',
                'area_type': 'maintenance',
                'risk_level': 'medium',
                'description': 'Equipment maintenance and repair area',
                'max_occupancy': 20,
                'requires_certification': True,
                'site': site
            },
            {
                'name': 'Office Complex',
                'code': 'OC',
                'area_type': 'office',
                'risk_level': 'low',
                'description': 'Administrative offices and control room',
                'max_occupancy': 40,
                'requires_certification': False,
                'site': site
            }
        ]

        for zone_data in default_zones:
            Zone.objects.get_or_create(
                name=zone_data['name'],
                defaults=zone_data
            )
            self.stdout.write(self.style.SUCCESS(f'Created zone: {zone_data["name"]}'))
