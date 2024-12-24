from django.core.management.base import BaseCommand
from mining_operations.models import MiningDepartment

class Command(BaseCommand):
    help = 'Lists all mining departments'

    def handle(self, *args, **kwargs):
        departments = MiningDepartment.objects.all()
        if not departments:
            self.stdout.write(self.style.WARNING('No departments found in the database'))
            return

        self.stdout.write(self.style.SUCCESS(f'Found {departments.count()} departments:'))
        for dept in departments:
            self.stdout.write(f'ID: {dept.id}')
            self.stdout.write(f'Name: {dept.name}')
            self.stdout.write(f'Type: {dept.type}')
            self.stdout.write('-' * 40)
