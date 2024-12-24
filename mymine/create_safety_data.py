import os
import django
import random
from datetime import datetime, timedelta, timezone

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

from mining_operations.models import (
    SafetyIncident, MiningSite, MiningDepartment, Zone, Employee
)
from accounts.models import CustomUser

def create_safety_incidents():
    # Get required related objects
    try:
        site = MiningSite.objects.first()
        if not site:
            print("No mining site found. Please create a mining site first.")
            return

        departments = list(MiningDepartment.objects.all())
        if not departments:
            print("No departments found. Please create departments first.")
            return

        zones = list(Zone.objects.all())
        if not zones:
            print("No zones found. Please create zones first.")
            return

        employees = list(Employee.objects.all())
        if not employees:
            print("No employees found. Please create employees first.")
            return

        reporter = CustomUser.objects.filter(is_staff=True).first()
        if not reporter:
            print("No staff user found. Please create a staff user first.")
            return

        # Define incident scenarios for more realistic data
        incident_scenarios = {
            'equipment_failure': [
                "Equipment malfunction during operation",
                "Mechanical failure in crushing unit",
                "Conveyor belt system breakdown",
                "Ventilation system failure",
                "Hydraulic system failure",
                "Emergency stop system malfunction",
                "Power supply failure",
                "Control system malfunction"
            ],
            'personal_injury': [
                "Slip and fall incident",
                "Minor cut during maintenance",
                "Muscle strain from lifting",
                "Eye irritation from dust",
                "Heat exhaustion case",
                "Minor electrical shock",
                "Repetitive strain injury",
                "Chemical splash exposure"
            ],
            'environmental': [
                "Minor chemical spill",
                "Dust control system issue",
                "Water treatment anomaly",
                "Waste management incident",
                "Air quality threshold exceeded",
                "Noise level violation",
                "Sediment control failure",
                "Hazardous material leak"
            ],
            'near_miss': [
                "Near miss - falling object",
                "Close call - vehicle incident",
                "Potential collision avoided",
                "Almost slip and fall",
                "Equipment almost failure",
                "Chemical exposure prevented",
                "Electrical hazard avoided",
                "Cave-in warning signs"
            ]
        }

        corrective_actions = {
            'equipment_failure': [
                "Immediate maintenance performed",
                "Equipment replaced",
                "Safety protocols updated",
                "Additional safety features installed",
                "Maintenance schedule revised",
                "Operator training conducted",
                "Emergency procedures updated",
                "Equipment monitoring increased"
            ],
            'personal_injury': [
                "First aid administered",
                "Safety equipment upgraded",
                "Training session conducted",
                "Work procedure modified",
                "PPE requirements updated",
                "Medical check-up provided",
                "Ergonomic assessment done",
                "Safety barriers installed"
            ],
            'environmental': [
                "Immediate containment measures",
                "Environmental cleanup performed",
                "Monitoring system upgraded",
                "Control measures enhanced",
                "Emergency response reviewed",
                "Staff training conducted",
                "Equipment maintenance done",
                "Procedures updated"
            ],
            'near_miss': [
                "Hazard assessment conducted",
                "Safety measures improved",
                "Warning signs installed",
                "Staff briefing conducted",
                "Equipment inspection done",
                "Safety protocols reviewed",
                "Preventive measures implemented",
                "Risk assessment updated"
            ]
        }

        investigation_statuses = ['pending', 'in_progress', 'completed', 'closed']

        # Generate incidents from Jan 2023 to today (Dec 21, 2024)
        start_date = datetime(2023, 1, 1, tzinfo=timezone.utc)
        end_date = datetime(2024, 12, 21, tzinfo=timezone.utc)
        current_date = start_date

        # First clear existing incidents
        SafetyIncident.objects.all().delete()
        print("Cleared existing safety incidents...")

        print("Generating safety incidents...")
        incidents_created = 0

        while current_date <= end_date:
            # Generate 1-4 incidents per day with higher probability for low/medium severity
            num_incidents = random.randint(1, 4)
            
            for _ in range(num_incidents):
                incident_type = random.choice(list(incident_scenarios.keys()))
                
                # Weighted severity distribution:
                # 45% low, 35% medium, 15% high, 5% critical
                severity_weights = [
                    ('low', 0.45),
                    ('medium', 0.35),
                    ('high', 0.15),
                    ('critical', 0.05)
                ]
                severity = random.choices(
                    [s[0] for s in severity_weights],
                    weights=[s[1] for s in severity_weights]
                )[0]

                # Randomize time within the day
                incident_time = current_date + timedelta(
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )

                # Create the incident
                incident = SafetyIncident.objects.create(
                    date=incident_time,
                    site=site,
                    department=random.choice(departments),
                    zone=random.choice(zones),
                    incident_type=incident_type,
                    severity=severity,
                    description=random.choice(incident_scenarios[incident_type]),
                    corrective_actions=random.choice(corrective_actions[incident_type]),
                    reported_by=reporter,
                    investigation_status=random.choice(investigation_statuses)
                )

                # Add random employees involved (1-3 employees)
                num_employees = random.randint(1, 3)
                incident.employees_involved.set(random.sample(employees, num_employees))
                
                incidents_created += 1
                if incidents_created % 100 == 0:
                    print(f"Created {incidents_created} incidents...")

            current_date += timedelta(days=1)

        print(f"Successfully created {incidents_created} safety incidents.")

    except Exception as e:
        print(f"Error creating safety incidents: {str(e)}")

if __name__ == '__main__':
    create_safety_incidents()
