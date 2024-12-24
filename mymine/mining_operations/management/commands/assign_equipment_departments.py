from django.core.management.base import BaseCommand
from mining_operations.models import Equipment, MiningDepartment

class Command(BaseCommand):
    help = 'Assigns equipment to appropriate departments'

    def handle(self, *args, **kwargs):
        # Get departments
        extraction_dept = MiningDepartment.objects.get(type='extraction')
        processing_dept = MiningDepartment.objects.get(type='processing')
        maintenance_dept = MiningDepartment.objects.get(type='maintenance')

        # Equipment assignments
        assignments = {
            'CAT 785D Mining Truck': extraction_dept,
            'Caterpillar D11T Dozer': extraction_dept,
            'Epiroc Boomer S2 Drill Rig': extraction_dept,
            'Hitachi EX5600 Shovel': extraction_dept,
            'Komatsu PC5500 Excavator': extraction_dept,
            'Metso MP1000 Cone Crusher': processing_dept,
            'Sandvik TH663i Underground Truck': extraction_dept,
            'Ball Mill': processing_dept,
        }

        # Update equipment
        for name, department in assignments.items():
            equipment = Equipment.objects.filter(name=name).first()
            if equipment:
                equipment.department = department
                equipment.save()
                self.stdout.write(self.style.SUCCESS(f'Assigned {name} to {department.name} department'))
            else:
                self.stdout.write(self.style.WARNING(f'Equipment {name} not found'))
