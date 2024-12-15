import os
import sys
import django
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
import random
from faker import Faker
from datetime import timedelta
import datetime

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

# Import models
from accounts.models import CustomUser, UserActivity
from mining_operations.models import (
    MiningDepartment, MiningSite, HeavyMachinery, 
    DailyProductionLog, MiningChemical, DailyChemicalsUsed,
    SafetyIncident, GoldMillingEquipment, 
    EnergyUsage, ExplosiveComponent, 
    DailyExplosivesUsed, DailyStockpile, 
    SmeltedGold, DailyExpense, LaborMetric,
    EnvironmentalMetric, Shift
)
from dashboard.models import DashboardWidget, UserDashboardPreference, NotificationLog

# Initialize Faker
fake = Faker()

def create_users():
    """
    Create a set of test users with different roles
    """
    User = get_user_model()
    users = []
    
    roles = ['admin', 'manager', 'supervisor', 'operator', 'safety_officer']
    
    for _ in range(10):
        role = random.choice(roles)
        user = User.objects.create_user(
            username=fake.user_name(),
            email=fake.unique.email(),
            password='TestPass123!',
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            role=role,
            is_active=True
        )
        users.append(user)
    
    return users

def create_mining_departments():
    """
    Create mining departments
    """
    departments = []
    department_names = [
        ('Geology', 'geology'), 
        ('Mining', 'mining'), 
        ('Processing', 'processing'), 
        ('Maintenance', 'maintenance'), 
        ('Safety and Health', 'safety'), 
        ('Environment', 'environment'), 
        ('Logistics', 'logistics'), 
        ('Administration', 'administration')
    ]
    
    for name, dept_type in department_names:
        dept = MiningDepartment.objects.create(
            name=name,
            type=dept_type,
            description=fake.text(max_nb_chars=200)
        )
        departments.append(dept)
    
    return departments

def create_mining_sites(departments):
    """
    Create mining sites with associated departments
    """
    sites = []
    site_names = [
        'Golden Valley Mine', 'Sunset Ridge Quarry', 
        'Mountain Peak Excavation', 'River Bottom Site', 
        'Highland Gold Fields'
    ]
    
    for name in site_names:
        site = MiningSite.objects.create(
            name=name,
            location=fake.address(),
            area_hectares=random.uniform(10.0, 500.0),
            status=random.choice(['active', 'inactive', 'exploration']),
            estimated_gold_reserves=random.uniform(1000.0, 100000.0)
        )
        # Add random departments to the site
        site.departments.set(random.sample(departments, random.randint(1, len(departments))))
        sites.append(site)
    
    return sites

def create_heavy_machinery(sites):
    """
    Create heavy machinery for mining sites
    """
    machinery = []
    machine_types = [
        'Excavator', 'Bulldozer', 'Drill Rig', 
        'Dump Truck', 'Loader', 'Crusher'
    ]
    
    for _ in range(20):
        machine = HeavyMachinery.objects.create(
            name=f"{random.choice(machine_types)} {fake.uuid4()}",
            site=random.choice(sites),
            model=fake.word(),
            serial_number=fake.uuid4(),
            purchase_date=fake.date_between(start_date='-10y', end_date='today'),
            last_maintenance_date=fake.date_between(start_date='-1y', end_date='today'),
            status=random.choice(['operational', 'maintenance', 'retired']),
            operational_hours=random.uniform(1000.0, 5000.0),
            maintenance_cost=random.uniform(1000.0, 10000.0)
        )
        machinery.append(machine)
    
    return machinery

def create_daily_production_logs(sites):
    """
    Create daily production logs for mining sites
    """
    logs = []
    for site in sites:
        for _ in range(30):  # 30 days of logs
            log = DailyProductionLog.objects.create(
                site=site,
                date=fake.date_between(start_date='-1y', end_date='today'),
                total_tonnage_crushed=random.uniform(10.0, 500.0),
                total_tonnage_hoisted=random.uniform(10.0, 500.0),
                gold_recovery_rate=random.uniform(50.0, 95.0),
                operational_efficiency=random.uniform(60.0, 100.0),
                notes=fake.text(max_nb_chars=200)
            )
            logs.append(log)
    
    return logs

def create_safety_incidents(sites, users):
    """
    Create safety incident logs
    """
    incidents = []
    for _ in range(20):
        incident = SafetyIncident.objects.create(
            site=random.choice(sites),
            reported_by=random.choice(users),
            date=fake.date_between(start_date='-1y', end_date='today'),
            incident_type=random.choice([
                'equipment_failure', 'personal_injury', 
                'near_miss', 'environmental_hazard'
            ]),
            severity=random.choice(['low', 'medium', 'high', 'critical']),
            description=fake.text(max_nb_chars=300),
            corrective_actions=fake.text(max_nb_chars=200)
        )
        incidents.append(incident)
    
    return incidents

def create_dashboard_widgets(users):
    """
    Create dashboard widgets for users
    """
    widgets = []
    for user in users:
        for _ in range(random.randint(1, 5)):
            widget = DashboardWidget.objects.create(
                name=fake.word(),
                type=random.choice([
                    'production_chart', 'safety_summary', 
                    'equipment_status', 'chemical_inventory', 
                    'financial_overview'
                ]),
                user=user,
                configuration={"key": fake.word(), "value": fake.word()},
                is_active=random.choice([True, False])
            )
            widgets.append(widget)
    
    return widgets

def create_energy_usage():
    """
    Create energy usage records
    """
    start_date = timezone.now().date() - timedelta(days=60)
    end_date = timezone.now().date() + timedelta(days=30)
    current_date = start_date

    while current_date <= end_date:
        electricity_kwh = random.uniform(5000, 8000)
        electricity_cost = electricity_kwh * random.uniform(0.10, 0.15)
        diesel_liters = random.uniform(2000, 4000)
        diesel_cost = diesel_liters * random.uniform(1.20, 1.50)
        total_cost = electricity_cost + diesel_cost

        EnergyUsage.objects.create(
            date=current_date,
            electricity_kwh=electricity_kwh,
            electricity_cost=electricity_cost,
            diesel_liters=diesel_liters,
            diesel_cost=diesel_cost,
            total_cost=total_cost
        )
        current_date += timedelta(days=1)

    print(f"Created energy usage records from {start_date} to {end_date}")

def create_environmental_metrics():
    """
    Create environmental metric records with realistic patterns and correlations
    """
    start_date = timezone.now().date() - timedelta(days=60)
    end_date = timezone.now().date() + timedelta(days=30)
    current_date = start_date

    # Base values and seasonal factors
    base_dust_level = 35  # Base PM10 in µg/m³
    base_noise_level = 75  # Base noise in dB
    base_water_usage = 2000  # Base water usage in m³
    initial_rehabilitation_area = 5000  # Initial rehabilitation area in m²
    base_ph = 7.5  # Base pH level

    # Generate weather patterns (affects dust levels)
    weather_patterns = {}
    for day in range((end_date - start_date).days + 1):
        date = start_date + timedelta(days=day)
        # More dust in dry season (assuming Southern Hemisphere)
        is_dry_season = date.month in [5, 6, 7, 8, 9]  # May to September
        base_weather = random.uniform(0.8, 1.2)
        # Rainy days reduce dust
        is_rainy = random.random() < (0.1 if is_dry_season else 0.4)
        weather_patterns[date] = {
            'base_factor': base_weather,
            'is_rainy': is_rainy,
            'is_dry_season': is_dry_season
        }

    # Production activity patterns (affects noise, water usage, and pH)
    activity_patterns = {}
    for day in range((end_date - start_date).days + 1):
        date = start_date + timedelta(days=day)
        # Lower activity on weekends
        is_weekend = date.weekday() >= 5
        # Random maintenance days (5% chance)
        is_maintenance = random.random() < 0.05
        base_activity = 1.0
        if is_weekend:
            base_activity *= 0.7
        if is_maintenance:
            base_activity *= 0.5
        activity_patterns[date] = {
            'base_factor': base_activity,
            'is_weekend': is_weekend,
            'is_maintenance': is_maintenance
        }

    rehabilitation_area = initial_rehabilitation_area
    metrics = []

    while current_date <= end_date:
        weather = weather_patterns[current_date]
        activity = activity_patterns[current_date]
        
        # Calculate dust level
        dust_factor = weather['base_factor']
        if weather['is_rainy']:
            dust_factor *= 0.6  # Rain reduces dust
        if weather['is_dry_season']:
            dust_factor *= 1.3  # Dry season increases dust
        # More dust during high activity
        dust_level = base_dust_level * dust_factor * (0.8 + 0.4 * activity['base_factor'])
        
        # Calculate noise level
        noise_factor = activity['base_factor']
        # Add time-of-day variation (assuming data is for day shift)
        hour_factor = 1.0
        noise_level = base_noise_level * noise_factor * hour_factor
        
        # Calculate water usage
        water_factor = activity['base_factor']
        if weather['is_rainy']:
            water_factor *= 0.8  # Less water needed on rainy days
        if weather['is_dry_season']:
            water_factor *= 1.2  # More water needed in dry season
        water_usage = base_water_usage * water_factor
        
        # Progressive rehabilitation area increase
        if not activity['is_weekend'] and random.random() < 0.3:  # 30% chance of rehabilitation work on weekdays
            rehabilitation_area += random.uniform(10, 50)  # Small daily increases
        
        # Calculate pH level
        ph_factor = 1.0
        if activity['base_factor'] > 0.8:
            ph_factor *= random.uniform(0.95, 1.05)  # More variation during high activity
        if weather['is_rainy']:
            ph_factor *= random.uniform(0.98, 1.02)  # Rain affects pH slightly
        ph_level = base_ph * ph_factor
        
        # Create the metric
        metrics.append(EnvironmentalMetric(
            date=current_date,
            dust_level_pm10=round(dust_level, 2),
            noise_level_db=round(noise_level, 1),
            water_usage_m3=round(water_usage, 1),
            rehabilitation_area_m2=round(rehabilitation_area, 1),
            waste_water_ph=round(ph_level, 2)
        ))
        
        current_date += timedelta(days=1)

    # Bulk create all metrics
    EnvironmentalMetric.objects.bulk_create(metrics)
    
    print(f"Created environmental metrics from {start_date} to {end_date}")

def create_chemicals_data():
    """
    Create chemicals usage data
    """
    records = []
    chemicals = [
        {'name': 'Cyanide', 'unit': 'kg', 'unit_cost': 50.0},
        {'name': 'Hydrochloric Acid', 'unit': 'L', 'unit_cost': 30.0},
        {'name': 'Sodium Hydroxide', 'unit': 'kg', 'unit_cost': 25.0},
        {'name': 'Activated Carbon', 'unit': 'kg', 'unit_cost': 40.0},
        {'name': 'Lime', 'unit': 'kg', 'unit_cost': 15.0}
    ]

    # Create chemicals first
    created_chemicals = []
    for chem in chemicals:
        chemical = MiningChemical.objects.create(
            name=chem['name'],
            unit_of_measurement=chem['unit'],
            unit_price=chem['unit_cost'],
            current_stock=random.uniform(1000.0, 5000.0)
        )
        created_chemicals.append(chemical)

    # Create daily usage records
    end_date = timezone.now().date()
    start_date = end_date - timezone.timedelta(days=30)
    departments = MiningDepartment.objects.all()

    for i in range(30):
        date = start_date + timezone.timedelta(days=i)
        for chemical in created_chemicals:
            quantity = random.uniform(10.0, 100.0)
            record = DailyChemicalsUsed.objects.create(
                date=date,
                chemical=chemical,
                department=random.choice(departments),
                quantity_used=quantity,
                total_cost=quantity * chemical.unit_price
            )
            records.append(record)

    return records

def create_smelted_gold_data(sites):
    """
    Create smelted gold production records - one entry per day
    """
    start_date = timezone.now().date() - timedelta(days=60)
    end_date = timezone.now().date() + timedelta(days=30)
    current_date = start_date

    while current_date <= end_date:
        for site in sites:
            # Base values with some random variation
            total_weight = random.uniform(2000, 3000)  # in grams
            purity = random.uniform(90, 98)  # percentage
            market_value = random.uniform(50, 60)  # dollars per gram
            total_value = total_weight * market_value

            SmeltedGold.objects.create(
                date=current_date,
                site=site,
                total_weight=total_weight,
                purity_percentage=purity,
                market_value_per_gram=market_value,
                total_value=total_value
            )
        current_date += timedelta(days=1)

    print(f"Created gold production records from {start_date} to {end_date}")

def create_labor_metrics(start_date=None, end_date=None):
    """
    Create labor metrics data for testing with realistic daily variations in attendance
    """
    if not start_date:
        # Use current time from context: 2024-12-13T22:24:09+02:00
        current_time = datetime.fromisoformat('2024-12-13T22:24:09+02:00')
        start_date = current_time.date() - timedelta(days=60)
    if not end_date:
        end_date = datetime.fromisoformat('2024-12-13T22:24:09+02:00').date() + timedelta(days=30)

    # Get all departments and create shifts
    departments = MiningDepartment.objects.all()
    
    # Create shifts if they don't exist
    morning_shift, _ = Shift.objects.get_or_create(
        name='Morning Shift',
        defaults={
            'start_time': '06:00',
            'end_time': '14:00',
            'description': 'Day shift from 6 AM to 2 PM'
        }
    )
    
    afternoon_shift, _ = Shift.objects.get_or_create(
        name='Afternoon Shift',
        defaults={
            'start_time': '14:00',
            'end_time': '22:00',
            'description': 'Afternoon shift from 2 PM to 10 PM'
        }
    )
    
    night_shift, _ = Shift.objects.get_or_create(
        name='Night Shift',
        defaults={
            'start_time': '22:00',
            'end_time': '06:00',
            'description': 'Night shift from 10 PM to 6 AM'
        }
    )
    
    shifts = [morning_shift, afternoon_shift, night_shift]
    
    # Target workforce for each department type with hourly rates
    department_workers = {
        'extraction': {'target': 40, 'rate': 30.00, 'min': 25, 'max': 45},
        'processing': {'target': 25, 'rate': 28.00, 'min': 15, 'max': 30},
        'safety': {'target': 10, 'rate': 32.00, 'min': 8, 'max': 12},
        'maintenance': {'target': 15, 'rate': 35.00, 'min': 10, 'max': 20},
        'logistics': {'target': 5, 'rate': 25.00, 'min': 3, 'max': 8},
        'administration': {'target': 5, 'rate': 27.00, 'min': 3, 'max': 7}
    }
    
    metrics = []
    current_date = start_date
    
    # Generate daily attendance factors (to simulate consistent daily patterns)
    daily_factors = {}
    while current_date <= end_date:
        # Base daily factor (0.7 to 1.1)
        daily_factor = random.uniform(0.7, 1.1)
        
        # Reduce attendance on weekends
        if current_date.weekday() >= 5:  # Saturday or Sunday
            daily_factor *= 0.8
        
        # Simulate weather effects (random bad weather days)
        if random.random() < 0.1:  # 10% chance of bad weather
            daily_factor *= 0.85
        
        # Simulate local events/holidays (random high absence days)
        if random.random() < 0.05:  # 5% chance of event
            daily_factor *= 0.7
        
        daily_factors[current_date] = daily_factor
        current_date += timedelta(days=1)
    
    current_date = start_date
    while current_date <= end_date:
        daily_factor = daily_factors[current_date]
        
        for shift in shifts:
            # Shift-specific attendance modifier
            shift_factor = 1.0
            if shift == night_shift:
                shift_factor = 0.85  # Lower attendance at night
            elif shift == afternoon_shift:
                shift_factor = 0.95  # Slightly lower in afternoon
            
            for dept in departments:
                # Get base metrics for department type
                base_metrics = department_workers.get(dept.type, {'target': 10, 'rate': 25.00, 'min': 5, 'max': 15})
                target_workers = base_metrics['target']
                base_rate = base_metrics['rate']
                min_workers = base_metrics['min']
                max_workers = base_metrics['max']
                
                # Calculate actual attendance with multiple factors
                attendance_factor = daily_factor * shift_factor * random.uniform(0.9, 1.1)
                workers_present = int(round(target_workers * attendance_factor))
                
                # Ensure within department's min/max bounds
                workers_present = max(min_workers, min(workers_present, max_workers))
                
                # Calculate hours with realistic variations
                base_hours = 8.0
                busy_day_factor = max(1.0, workers_present / target_workers)  # More overtime when understaffed
                shift_variation = random.uniform(0.9, busy_day_factor * 1.2)
                hours_worked = round(base_hours * shift_variation, 2)
                overtime_hours = max(0, round(hours_worked - 8, 2))
                
                # Calculate productivity (affected by staffing levels and hours)
                if shift == morning_shift:
                    base_productivity = 95
                elif shift == afternoon_shift:
                    base_productivity = 90
                else:  # night shift
                    base_productivity = 85
                
                # Productivity affected by staffing levels
                staffing_ratio = workers_present / target_workers
                if staffing_ratio < 0.8:  # Understaffed
                    base_productivity *= 0.9
                elif staffing_ratio > 1.1:  # Overstaffed
                    base_productivity *= 0.95
                
                # Productivity affected by overtime
                if overtime_hours > 1:
                    base_productivity *= 0.95
                
                productivity = round(base_productivity * random.uniform(0.95, 1.05), 2)
                
                # Safety incidents more likely when understaffed or working overtime
                incident_probability = 0.05  # 5% base probability
                if shift == night_shift:
                    incident_probability *= 1.5
                if staffing_ratio < 0.8:
                    incident_probability *= 1.3
                if hours_worked > 9:
                    incident_probability *= 1.2
                
                safety_incidents = 1 if random.random() < incident_probability else 0
                
                # Create the labor metric
                metrics.append(LaborMetric(
                    date=current_date,
                    shift=shift,
                    department=dept,
                    workers_present=workers_present,
                    hours_worked=hours_worked,
                    overtime_hours=overtime_hours,
                    productivity_index=productivity,
                    safety_incidents=safety_incidents,
                    hourly_rate=base_rate
                ))
        current_date += timedelta(days=1)
    
    # Bulk create the metrics
    LaborMetric.objects.bulk_create(metrics)
    
    print(f"Created {len(metrics)} labor metrics records")

@transaction.atomic
def seed_database():
    """
    Seed the database with comprehensive test data
    """
    with transaction.atomic():
        # Clear existing data
        print("Clearing existing data...")
        LaborMetric.objects.all().delete()
        SmeltedGold.objects.all().delete()
        EnergyUsage.objects.all().delete()
        EnvironmentalMetric.objects.all().delete()
        DailyExplosivesUsed.objects.all().delete()
        ExplosiveComponent.objects.all().delete()
        DailyStockpile.objects.all().delete()
        DailyChemicalsUsed.objects.all().delete()
        MiningChemical.objects.all().delete()
        SafetyIncident.objects.all().delete()
        DailyProductionLog.objects.all().delete()
        HeavyMachinery.objects.all().delete()
        MiningSite.objects.all().delete()
        MiningDepartment.objects.all().delete()
        CustomUser.objects.filter(is_superuser=False).delete()
        
        print("MyMine Database Seeding Started...")
        
        # Create users
        users = create_users()
        print("Created users")
        
        # Create departments
        departments = create_mining_departments()
        print("Created departments")
        
        # Create mining sites
        sites = create_mining_sites(departments)
        print("Created mining sites")
        
        # Create heavy machinery
        create_heavy_machinery(sites)
        print("Created heavy machinery")
        
        # Create daily production logs
        create_daily_production_logs(sites)
        print("Created production logs")
        
        # Create safety incidents
        create_safety_incidents(sites, users)
        print("Created safety incidents")
        
        # Create dashboard widgets
        create_dashboard_widgets(users)
        print("Created dashboard widgets")
        
        # Create energy usage records
        create_energy_usage()
        print("Created energy usage records")
        
        # Create environmental metrics
        create_environmental_metrics()
        print("Created environmental metrics")
        
        # Create chemicals data
        create_chemicals_data()
        print("Created chemicals data")
        
        # Create smelted gold data
        create_smelted_gold_data(sites)
        print("Created smelted gold data")
        
        # Create labor metrics
        create_labor_metrics()
        print("Created labor metrics")
        
        print("Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
