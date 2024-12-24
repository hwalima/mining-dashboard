from django.core.management.base import BaseCommand
from mining_operations.models import Equipment

class Command(BaseCommand):
    help = 'Lists all equipment records in the database'

    def handle(self, *args, **kwargs):
        equipment_list = Equipment.objects.all()
        if not equipment_list:
            self.stdout.write(self.style.WARNING('No equipment records found in the database'))
            return

        self.stdout.write(self.style.SUCCESS(f'Found {equipment_list.count()} equipment records:'))
        for equipment in equipment_list:
            self.stdout.write(f'ID: {equipment.id}')
            self.stdout.write(f'Name: {equipment.name}')
            self.stdout.write(f'Description: {equipment.description}')
            self.stdout.write(f'Department: {equipment.department.name if equipment.department else "No Department"}')
            self.stdout.write('-' * 40)
