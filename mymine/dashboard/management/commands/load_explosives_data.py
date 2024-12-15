from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import ExplosivesInventory, ExplosivesUsage
from decimal import Decimal
import datetime

class Command(BaseCommand):
    help = 'Load sample explosives data'

    def handle(self, *args, **kwargs):
        # Create some explosives in inventory
        explosives = [
            {
                'name': 'ANFO',
                'current_stock': Decimal('1000.00'),
                'minimum_required': Decimal('500.00'),
                'unit': 'kg',
                'unit_price': Decimal('35.00'),
                'supplier': 'BlastTech Solutions',
            },
            {
                'name': 'Emulsion',
                'current_stock': Decimal('800.00'),
                'minimum_required': Decimal('400.00'),
                'unit': 'kg',
                'unit_price': Decimal('45.00'),
                'supplier': 'MineBlast Corp',
            },
            {
                'name': 'Detonators',
                'current_stock': Decimal('150.00'),
                'minimum_required': Decimal('200.00'),
                'unit': 'units',
                'unit_price': Decimal('25.00'),
                'supplier': 'SafeBlast Ltd.',
            },
            {
                'name': 'Boosters',
                'current_stock': Decimal('300.00'),
                'minimum_required': Decimal('150.00'),
                'unit': 'units',
                'unit_price': Decimal('30.00'),
                'supplier': 'BlastPro Industries',
            },
        ]

        # Create explosives in inventory
        for exp_data in explosives:
            explosive, created = ExplosivesInventory.objects.get_or_create(
                name=exp_data['name'],
                defaults=exp_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created explosive: {explosive.name}'))
            else:
                self.stdout.write(self.style.WARNING(f'Explosive already exists: {explosive.name}'))

        # Add usage records for the past 14 days
        today = timezone.now().date()
        start_date = today - datetime.timedelta(days=14)

        # Define daily usage patterns (as percentage of minimum required)
        usage_patterns = {
            'ANFO': 0.15,  # 15% of minimum required
            'Emulsion': 0.12,  # 12% of minimum required
            'Detonators': 0.10,  # 10% of minimum required
            'Boosters': 0.08,  # 8% of minimum required
        }

        for explosive in ExplosivesInventory.objects.all():
            for i in range(15):  # 15 days of data
                date = start_date + datetime.timedelta(days=i)
                pattern = usage_patterns.get(explosive.name, 0.1)
                amount = Decimal(str(float(explosive.minimum_required) * pattern))
                
                usage, created = ExplosivesUsage.objects.get_or_create(
                    explosive=explosive,
                    date=date,
                    defaults={
                        'amount_used': amount,
                        'blast_location': f'Level {(i % 3) + 1} Block {(i % 4) + 1}',
                        'notes': 'Production blast'
                    }
                )
                
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Created usage record for {explosive.name} on {date}: {amount}{explosive.unit}'
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Usage record already exists for {explosive.name} on {date}'
                        )
                    )
