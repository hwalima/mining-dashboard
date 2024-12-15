from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import ChemicalInventory, ChemicalUsage
from decimal import Decimal
import datetime

class Command(BaseCommand):
    help = 'Load sample chemicals data'

    def handle(self, *args, **kwargs):
        # Create some chemicals in inventory
        chemicals = [
            {
                'name': 'Sodium Cyanide',
                'current_stock': Decimal('500.00'),
                'minimum_required': Decimal('200.00'),
                'unit': 'kg',
                'unit_price': Decimal('45.00'),
                'supplier': 'ChemCorp Inc.',
            },
            {
                'name': 'Hydrochloric Acid',
                'current_stock': Decimal('300.00'),
                'minimum_required': Decimal('150.00'),
                'unit': 'L',
                'unit_price': Decimal('25.00'),
                'supplier': 'AcidWorks Ltd.',
            },
            {
                'name': 'Activated Carbon',
                'current_stock': Decimal('800.00'),
                'minimum_required': Decimal('400.00'),
                'unit': 'kg',
                'unit_price': Decimal('30.00'),
                'supplier': 'CarbonTech',
            },
            {
                'name': 'Lime',
                'current_stock': Decimal('150.00'),
                'minimum_required': Decimal('200.00'),
                'unit': 'kg',
                'unit_price': Decimal('15.00'),
                'supplier': 'MineChem Solutions',
            },
        ]

        # Create chemicals in inventory
        for chem_data in chemicals:
            chemical, created = ChemicalInventory.objects.get_or_create(
                name=chem_data['name'],
                defaults=chem_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created chemical: {chemical.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Chemical already exists: {chemical.name}'))

        # Add usage records for the past 14 days
        today = timezone.now().date()
        start_date = today - datetime.timedelta(days=14)

        for chemical in ChemicalInventory.objects.all():
            for i in range(15):  # 15 days of data
                date = start_date + datetime.timedelta(days=i)
                amount = Decimal(str(float(chemical.minimum_required) * 0.1))  # Use 10% of minimum required as daily usage
                
                usage, created = ChemicalUsage.objects.get_or_create(
                    chemical=chemical,
                    date=date,
                    defaults={
                        'amount_used': amount,
                        'process': 'Gold extraction',
                        'notes': 'Sample data'
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created usage record for {chemical.name} on {date}: {amount}{chemical.unit}'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Usage record already exists for {chemical.name} on {date}'
                        )
                    )
