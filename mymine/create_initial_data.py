import os
import django
from django.contrib.auth import get_user_model

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import (
    MiningDepartment, MiningSite, Zone, Employee
)

def create_initial_data():
    # Create departments
    departments = [
        ('Extraction', 'extraction', 'Responsible for mining operations and ore extraction'),
        ('Processing', 'processing', 'Handles ore processing and refinement'),
        ('Safety', 'safety', 'Manages safety protocols and incident prevention'),
        ('Maintenance', 'maintenance', 'Maintains equipment and facilities'),
        ('Logistics', 'logistics', 'Manages transportation and supply chain'),
        ('Administration', 'administration', 'Handles administrative tasks and management')
    ]

    print("Creating departments...")
    created_departments = []
    for name, dept_type, desc in departments:
        dept, created = MiningDepartment.objects.get_or_create(
            name=name,
            defaults={
                'type': dept_type,
                'description': desc
            }
        )
        created_departments.append(dept)
        print(f"{'Created' if created else 'Found'} department: {name}")

    # Create mining site
    print("\nCreating mining site...")
    site, created = MiningSite.objects.get_or_create(
        name="Main Mine",
        defaults={
            'location': "Johannesburg, South Africa",
            'latitude': -26.2041,
            'longitude': 28.0473,
            'area_hectares': 1500.00,
            'status': 'active',
            'estimated_gold_reserves': 1000.00,
            'geological_classification': 'Witwatersrand Basin'
        }
    )
    print(f"{'Created' if created else 'Found'} mining site: {site.name}")

    # Add departments to site
    site.departments.add(*created_departments)

    # Create zones
    zones = [
        ('Main Shaft', 'MS001', 'extraction', 'high', 'Primary extraction zone', 50),
        ('Processing Plant', 'PP001', 'processing', 'medium', 'Main ore processing facility', 100),
        ('Workshop', 'WS001', 'maintenance', 'low', 'Equipment maintenance area', 30),
        ('Storage Area', 'SA001', 'storage', 'low', 'Material storage facility', 20),
        ('Admin Block', 'AB001', 'office', 'low', 'Administrative offices', 100),
        ('Restricted Area', 'RA001', 'restricted', 'restricted', 'High security zone', 10)
    ]

    print("\nCreating zones...")
    for name, code, area_type, risk_level, desc, max_occ in zones:
        zone, created = Zone.objects.get_or_create(
            code=code,
            defaults={
                'site': site,
                'name': name,
                'area_type': area_type,
                'risk_level': risk_level,
                'description': desc,
                'max_occupancy': max_occ,
                'requires_certification': risk_level in ['high', 'restricted']
            }
        )
        print(f"{'Created' if created else 'Found'} zone: {name}")

    # Create admin user if it doesn't exist
    User = get_user_model()
    admin_username = 'admin'
    
    if not User.objects.filter(username=admin_username).exists():
        print("\nCreating admin user...")
        admin_user = User.objects.create_superuser(
            username=admin_username,
            email='admin@example.com',
            password='admin123'
        )
        print(f"Created admin user: {admin_username}")
    else:
        admin_user = User.objects.get(username=admin_username)
        print("\nAdmin user already exists")

    # Create some employees
    employees = [
        ('John Smith', 'EMP001', 'Extraction', 'Mining Engineer'),
        ('Sarah Johnson', 'EMP002', 'Safety', 'Safety Officer'),
        ('Michael Brown', 'EMP003', 'Maintenance', 'Maintenance Supervisor'),
        ('Emma Davis', 'EMP004', 'Processing', 'Process Engineer'),
        ('James Wilson', 'EMP005', 'Logistics', 'Logistics Manager'),
        ('Maria Garcia', 'EMP006', 'Administration', 'HR Manager')
    ]

    print("\nCreating employees...")
    for name, emp_id, dept_name, position in employees:
        dept = MiningDepartment.objects.get(name=dept_name)
        employee, created = Employee.objects.get_or_create(
            employee_id=emp_id,
            defaults={
                'department': dept,
                'position': position,
                'hire_date': '2023-01-01',
                'status': 'active',
                'emergency_contact': 'Emergency Contact Details',
                'hourly_rate': 25.00
            }
        )
        print(f"{'Created' if created else 'Found'} employee: {name}")

    print("\nInitial data creation completed successfully!")

if __name__ == '__main__':
    create_initial_data()
