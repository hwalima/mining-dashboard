from django.core.management.base import BaseCommand
from django.utils import timezone
from dashboard.models import SafetyIncident
from mining_operations.models import MiningDepartment
from datetime import datetime, timedelta
import random

class Command(BaseCommand):
    help = 'Seeds safety incident data from Jan 1, 2023 to Dec 13, 2024 without duplicates'

    def generate_incident_type(self):
        # Dictionary of incident types with their respective probabilities
        incident_types = {
            'Near Miss': 0.35,  # Most common
            'Minor Injury': 0.25,
            'Equipment Malfunction': 0.20,
            'Environmental Incident': 0.10,
            'Procedural Violation': 0.05,
            'Vehicle Incident': 0.03,
            'Fire Incident': 0.02
        }
        return random.choices(
            list(incident_types.keys()),
            weights=list(incident_types.values())
        )[0]

    def generate_severity(self, incident_type):
        # Severity probabilities based on incident type
        severity_mapping = {
            'Near Miss': {'Low': 0.7, 'Medium': 0.25, 'High': 0.05},
            'Minor Injury': {'Low': 0.6, 'Medium': 0.3, 'High': 0.1},
            'Equipment Malfunction': {'Low': 0.5, 'Medium': 0.4, 'High': 0.1},
            'Environmental Incident': {'Low': 0.4, 'Medium': 0.4, 'High': 0.2},
            'Procedural Violation': {'Low': 0.6, 'Medium': 0.3, 'High': 0.1},
            'Vehicle Incident': {'Low': 0.5, 'Medium': 0.4, 'High': 0.1},
            'Fire Incident': {'Low': 0.3, 'Medium': 0.4, 'High': 0.3}
        }
        
        probabilities = severity_mapping[incident_type]
        return random.choices(
            list(probabilities.keys()),
            weights=list(probabilities.values())
        )[0]

    def generate_description(self, incident_type, severity):
        descriptions = {
            'Near Miss': [
                'Worker noticed loose scaffolding before use',
                'Potential slip hazard identified and marked',
                'Equipment shutdown before malfunction',
                'Vehicle near-miss in parking area'
            ],
            'Minor Injury': [
                'Minor cut while handling equipment',
                'Slight bruising from tool impact',
                'Minor strain from lifting',
                'Small abrasion requiring first aid'
            ],
            'Equipment Malfunction': [
                'Conveyor belt misalignment detected',
                'Pump pressure irregularity',
                'Sensor calibration error',
                'Control panel malfunction'
            ],
            'Environmental Incident': [
                'Minor chemical spill contained',
                'Dust control system temporary failure',
                'Water discharge pH deviation',
                'Waste segregation issue'
            ],
            'Procedural Violation': [
                'PPE protocol not followed',
                'Skip in safety checklist',
                'Unauthorized access to restricted area',
                'Improper tool usage'
            ],
            'Vehicle Incident': [
                'Minor vehicle scratch in parking',
                'Slow speed collision with barrier',
                'Vehicle maintenance overdue',
                'Improper parking incident'
            ],
            'Fire Incident': [
                'Small electrical fire contained',
                'Hot work spark incident',
                'Smoke detector activation',
                'Minor equipment overheating'
            ]
        }
        
        base_description = random.choice(descriptions[incident_type])
        severity_details = {
            'Low': 'No immediate action required. Situation monitored.',
            'Medium': 'Prompt attention needed. Temporary measures in place.',
            'High': 'Immediate intervention required. Area secured.'
        }
        
        return f"{base_description}. {severity_details[severity]}"

    def generate_action_taken(self, incident_type, severity):
        actions = {
            'Near Miss': [
                'Area inspected and hazard removed',
                'Safety briefing conducted',
                'Warning signs installed',
                'Procedure review initiated'
            ],
            'Minor Injury': [
                'First aid administered',
                'Incident report filed',
                'Safety equipment checked',
                'Worker given precautionary rest'
            ],
            'Equipment Malfunction': [
                'Maintenance team notified',
                'Equipment temporarily shut down',
                'Backup system activated',
                'Emergency repairs conducted'
            ],
            'Environmental Incident': [
                'Area contained and cleaned',
                'Environmental team notified',
                'Sampling conducted',
                'Preventive measures implemented'
            ],
            'Procedural Violation': [
                'Retraining scheduled',
                'Warning issued',
                'Procedure review initiated',
                'Additional supervision implemented'
            ],
            'Vehicle Incident': [
                'Vehicle inspection completed',
                'Driver briefing conducted',
                'Traffic pattern reviewed',
                'Maintenance check scheduled'
            ],
            'Fire Incident': [
                'Fire system checked',
                'Area cooled and secured',
                'Fire watch implemented',
                'Equipment inspection completed'
            ]
        }
        
        base_action = random.choice(actions[incident_type])
        followup = {
            'Low': 'Situation monitored for recurrence.',
            'Medium': 'Follow-up inspection scheduled.',
            'High': 'Comprehensive review initiated.'
        }
        
        return f"{base_action}. {followup[severity]}"

    def handle(self, *args, **options):
        # Clear existing safety incidents
        SafetyIncident.objects.all().delete()
        
        # Get all departments
        departments = list(MiningDepartment.objects.all())
        if not departments:
            self.stdout.write(
                self.style.ERROR(
                    'No departments found. Please run python manage.py seed_departments first.'
                )
            )
            return

        # Set date range
        start_date = datetime(2023, 1, 1).date()
        end_date = datetime(2024, 12, 13).date()
        
        # Create a list of all dates in the range
        dates = []
        current_date = start_date
        while current_date <= end_date:
            # Higher probability of incidents on weekdays
            if current_date.weekday() < 5:  # Monday to Friday
                if random.random() < 0.4:  # 40% chance on weekdays
                    dates.append(current_date)
            else:  # Weekend
                if random.random() < 0.2:  # 20% chance on weekends
                    dates.append(current_date)
            current_date += timedelta(days=1)

        # Create incidents for selected dates
        incidents_created = 0
        for date in dates:
            # Some dates might have multiple incidents
            num_incidents = random.choices([1, 2, 3], weights=[0.7, 0.2, 0.1])[0]
            
            for _ in range(num_incidents):
                incident_type = self.generate_incident_type()
                severity = self.generate_severity(incident_type)
                
                # Higher chance of resolution for older and lower severity incidents
                days_old = (end_date - date).days
                severity_factor = {'Low': 0.9, 'Medium': 0.7, 'High': 0.5}[severity]
                resolution_chance = min(0.95, (days_old / 365) * severity_factor)
                resolved = random.random() < resolution_chance

                # Assign department based on incident type
                department_weights = {
                    'Near Miss': ['safety', 'extraction', 'processing'],
                    'Minor Injury': ['extraction', 'processing', 'maintenance'],
                    'Equipment Malfunction': ['maintenance', 'processing', 'extraction'],
                    'Environmental Incident': ['safety', 'processing', 'extraction'],
                    'Procedural Violation': ['safety', 'administration', 'logistics'],
                    'Vehicle Incident': ['logistics', 'extraction', 'maintenance'],
                    'Fire Incident': ['safety', 'processing', 'maintenance']
                }

                relevant_departments = [
                    dept for dept in departments 
                    if dept.type in department_weights[incident_type]
                ]
                department = random.choice(relevant_departments if relevant_departments else departments)
                
                SafetyIncident.objects.create(
                    date=date,
                    type=incident_type,
                    severity=severity,
                    description=self.generate_description(incident_type, severity),
                    action_taken=self.generate_action_taken(incident_type, severity),
                    resolved=resolved,
                    department=department
                )
                incidents_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {incidents_created} safety incidents across {len(dates)} unique dates'
            )
        )
