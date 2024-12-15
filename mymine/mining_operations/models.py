from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords
from accounts.models import CustomUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal
import uuid

class MiningDepartment(models.Model):
    """
    Represents different departments within the mining operation
    """
    DEPARTMENT_TYPES = (
        ('extraction', 'Extraction'),
        ('processing', 'Processing'),
        ('safety', 'Safety'),
        ('maintenance', 'Maintenance'),
        ('logistics', 'Logistics'),
        ('administration', 'Administration')
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=DEPARTMENT_TYPES)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Mining Department'
        verbose_name_plural = 'Mining Departments'

class MiningSite(models.Model):
    """
    Represents individual mining sites
    """
    SITE_STATUS = (
        ('active', 'Active'),
        ('exploration', 'Exploration'),
        ('inactive', 'Inactive'),
        ('rehabilitation', 'Rehabilitation')
    )

    name = models.CharField(max_length=100, unique=True)
    location = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    area_hectares = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=SITE_STATUS, default='active')
    estimated_gold_reserves = models.DecimalField(max_digits=12, decimal_places=2, help_text='Estimated gold reserves in metric tons')
    geological_classification = models.CharField(max_length=100, blank=True, null=True)
    departments = models.ManyToManyField(MiningDepartment, related_name='sites')
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} - {self.get_status_display()}"

class HeavyMachinery(models.Model):
    """
    Tracks heavy machinery used in mining operations
    """
    MACHINE_STATUS = (
        ('operational', 'Operational'),
        ('maintenance', 'Under Maintenance'),
        ('retired', 'Retired')
    )

    name = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=50, unique=True)
    department = models.ForeignKey(MiningDepartment, on_delete=models.SET_NULL, null=True, related_name='machinery')
    site = models.ForeignKey(MiningSite, on_delete=models.SET_NULL, null=True, related_name='machinery')
    purchase_date = models.DateField()
    last_maintenance_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=MACHINE_STATUS, default='operational')
    operational_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maintenance_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} ({self.model}) - {self.get_status_display()}"

class DailyProductionLog(models.Model):
    """
    Daily production metrics for mining operations.
    Tracks various mining production metrics including tonnage, gold recovery, and financial data.
    Each date can only have one production log entry.
    """
    date = models.DateField(primary_key=True, help_text='Date of production log')
    total_tonnage_crushed = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text='Total tonnage of ore crushed'
    )
    total_tonnage_hoisted = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        null=False,
        default=0,
        help_text='Total tonnage of ore hoisted'
    )
    total_tonnage_milled = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        help_text='Total tonnage of ore milled',
        validators=[MinValueValidator(0)],
        default=0
    )
    gold_recovery_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        help_text='Percentage of gold recovered',
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    operational_efficiency = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        help_text='Percentage of operational efficiency',
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    smelted_gold = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text='Gold smelted in grams',
        validators=[MinValueValidator(0)],
        default=0
    )
    gold_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text='Daily gold price in USD per gram',
        validators=[MinValueValidator(0)],
        default=0
    )
    gross_profit = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        help_text='Gross profit in USD (smelted_gold * gold_price)',
        validators=[MinValueValidator(0)],
        default=0
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    modified_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords(
        history_change_reason_field=models.TextField(null=True),
        inherit=True
    )

    class Meta:
        ordering = ['-date']
        verbose_name = "Daily Production Log"
        verbose_name_plural = "Daily Production Logs"

    def clean(self):
        """Validate the model data."""
        if self.total_tonnage_milled > self.total_tonnage_crushed:
            raise ValidationError({
                'total_tonnage_milled': 'Milled tonnage cannot exceed crushed tonnage.'
            })
        
        if self.gold_recovery_rate > 100 or self.gold_recovery_rate < 0:
            raise ValidationError({
                'gold_recovery_rate': 'Gold recovery rate must be between 0 and 100.'
            })
        
        if self.operational_efficiency > 100 or self.operational_efficiency < 0:
            raise ValidationError({
                'operational_efficiency': 'Operational efficiency must be between 0 and 100.'
            })

    def save(self, *args, **kwargs):
        """
        Override save method to perform calculations and validations.
        """
        # Run model validations
        self.clean()
        
        # Calculate gross profit
        self.gross_profit = Decimal(str(self.smelted_gold * self.gold_price)).quantize(Decimal('0.01'))
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date} - {self.total_tonnage_milled:,.2f}t milled"

class MiningChemical(models.Model):
    """
    Tracks mining chemicals inventory
    """
    name = models.CharField(max_length=100)
    chemical_formula = models.CharField(max_length=50, blank=True, null=True)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2)
    unit_of_measurement = models.CharField(max_length=20)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    supplier = models.CharField(max_length=100, blank=True, null=True)
    safety_data_sheet = models.FileField(upload_to='chemical_sds/', null=True, blank=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} ({self.chemical_formula})"

class DailyChemicalsUsed(models.Model):
    """
    Daily chemical usage tracking
    """
    date = models.DateField()
    chemical = models.ForeignKey(MiningChemical, on_delete=models.CASCADE)
    quantity_used = models.DecimalField(max_digits=10, decimal_places=2)
    department = models.ForeignKey(MiningDepartment, on_delete=models.SET_NULL, null=True, blank=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.chemical.name} used on {self.date}"

class SafetyIncident(models.Model):
    """
    Tracks safety incidents in mining operations
    """
    SEVERITY_LEVELS = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical')
    )

    INCIDENT_TYPES = (
        ('equipment_failure', 'Equipment Failure'),
        ('personal_injury', 'Personal Injury'),
        ('environmental', 'Environmental'),
        ('near_miss', 'Near Miss')
    )

    date = models.DateTimeField()
    site = models.ForeignKey(MiningSite, on_delete=models.SET_NULL, null=True)
    department = models.ForeignKey(MiningDepartment, on_delete=models.SET_NULL, null=True, related_name='safety_incidents_ops', blank=True)
    zone = models.ForeignKey('Zone', on_delete=models.SET_NULL, null=True, related_name='safety_incidents')
    incident_type = models.CharField(max_length=30, choices=INCIDENT_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    description = models.TextField()
    corrective_actions = models.TextField()
    employees_involved = models.ManyToManyField('Employee', related_name='safety_incidents')
    reported_by = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True)
    investigation_status = models.CharField(max_length=20, default='pending')
    investigation_report = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Safety Incident - {self.date} - {self.incident_type}"

    class Meta:
        verbose_name = 'Safety Incident'
        verbose_name_plural = 'Safety Incidents'
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['site']),
            models.Index(fields=['department']),
            models.Index(fields=['zone']),
            models.Index(fields=['severity']),
            models.Index(fields=['incident_type']),
        ]

class GoldMillingEquipment(models.Model):
    """
    Tracks gold milling equipment details
    """
    EQUIPMENT_STATUS = (
        ('operational', 'Operational'),
        ('maintenance', 'Under Maintenance'),
        ('offline', 'Offline')
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    capacity_tons_per_hour = models.DecimalField(max_digits=6, decimal_places=2)
    efficiency_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    current_status = models.CharField(max_length=20, choices=EQUIPMENT_STATUS, default='operational')
    site = models.ForeignKey(MiningSite, on_delete=models.SET_NULL, null=True)
    last_maintenance_date = models.DateField(null=True, blank=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} - {self.get_current_status_display()}"

class ExplosiveComponent(models.Model):
    """
    Tracks explosive components inventory
    """
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    safety_classification = models.CharField(max_length=50, blank=True, null=True)
    history = HistoricalRecords()

    def __str__(self):
        return f"{self.name} ({self.type})"

class StockpileVolume(models.Model):
    date = models.DateField()
    ore_tons = models.FloatField(validators=[MinValueValidator(0)])
    waste_tons = models.FloatField(validators=[MinValueValidator(0)])
    grade_gpt = models.FloatField(validators=[MinValueValidator(0)])
    location = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:
        ordering = ['-date']
        verbose_name = 'Stockpile Volume'
        verbose_name_plural = 'Stockpile Volumes'

    def __str__(self):
        return f"Stockpile at {self.location} on {self.date}"

class ExplosivesInventory(models.Model):
    date = models.DateField()
    anfo_kg = models.FloatField(validators=[MinValueValidator(0)])
    emulsion_kg = models.FloatField(validators=[MinValueValidator(0)])
    detonators_count = models.IntegerField(validators=[MinValueValidator(0)])
    boosters_count = models.IntegerField(validators=[MinValueValidator(0)])
    total_value = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:
        ordering = ['-date']
        verbose_name = "Explosives Inventory"
        verbose_name_plural = "Explosives Inventories"

    def __str__(self):
        return f"Explosives Inventory on {self.date}"

class EnvironmentalMetric(models.Model):
    date = models.DateField()
    dust_level_pm10 = models.FloatField(help_text="PM10 particulate matter (μg/m³)")
    noise_level_db = models.FloatField(help_text="Average noise level in decibels")
    water_usage_m3 = models.FloatField(help_text="Water consumption in cubic meters")
    rehabilitation_area_m2 = models.FloatField(help_text="Area under rehabilitation in square meters")
    waste_water_ph = models.FloatField(help_text="pH level of waste water")
    carbon_emissions = models.DecimalField(max_digits=10, decimal_places=2, help_text='Carbon emissions in metric tons')
    waste_generated = models.DecimalField(max_digits=10, decimal_places=2, help_text='Waste generated in metric tons')
    additional_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:
        ordering = ['-date']
        verbose_name = 'Environmental Metric'
        verbose_name_plural = 'Environmental Metrics'

    def __str__(self):
        return f"Environmental Metrics for {self.date}"

class SmeltedGold(models.Model):
    """
    Tracks smelted gold production
    """
    date = models.DateField()
    site = models.ForeignKey(MiningSite, on_delete=models.SET_NULL, null=True)
    total_weight = models.DecimalField(max_digits=10, decimal_places=2)
    purity_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    market_value_per_gram = models.DecimalField(max_digits=10, decimal_places=2)
    total_value = models.DecimalField(max_digits=15, decimal_places=2)
    history = HistoricalRecords()

    def __str__(self):
        return f"Smelted Gold on {self.date}"

class EnergyUsage(models.Model):
    """
    Tracks daily energy usage and costs for the entire mine.
    Includes both electricity and diesel consumption.
    """
    date = models.DateField(unique=True)
    electricity_kwh = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text='Daily electricity consumption in kilowatt-hours'
    )
    electricity_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Daily electricity cost in $'
    )
    diesel_liters = models.FloatField(
        validators=[MinValueValidator(0)],
        help_text='Daily diesel consumption in liters'
    )
    diesel_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Daily diesel cost in $'
    )
    total_cost = models.DecimalField(
        max_digits=12, 
        decimal_places=2,
        validators=[MinValueValidator(0)],
        help_text='Total energy cost for the day in $'
    )

    class Meta:
        ordering = ['-date']
        verbose_name_plural = 'Energy Usage'

    def save(self, *args, **kwargs):
        # Automatically calculate total cost
        self.total_cost = self.electricity_cost + self.diesel_cost
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Energy Usage for {self.date}"

class Skill(models.Model):
    """
    Represents various skills required in mining operations
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Skill'
        verbose_name_plural = 'Skills'

class Certification(models.Model):
    """
    Tracks certifications and qualifications of employees
    """
    name = models.CharField(max_length=100)
    issuing_body = models.CharField(max_length=100)
    validity_period = models.IntegerField(help_text='Validity period in months')
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Certification'
        verbose_name_plural = 'Certifications'

class Employee(models.Model):
    """
    Represents employees in the mining operation
    """
    EMPLOYMENT_STATUS = (
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('terminated', 'Terminated'),
        ('suspended', 'Suspended')
    )

    user = models.OneToOneField('accounts.CustomUser', on_delete=models.SET_NULL, null=True)
    employee_id = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(MiningDepartment, on_delete=models.SET_NULL, null=True, related_name='employees')
    position = models.CharField(max_length=100)
    hire_date = models.DateField()
    status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='active')
    skills = models.ManyToManyField(Skill, related_name='employees')
    certifications = models.ManyToManyField(Certification, related_name='employees')
    emergency_contact = models.TextField()
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee_id} - {self.user.get_full_name() if self.user else 'No User'}"

    class Meta:
        verbose_name = 'Employee'
        verbose_name_plural = 'Employees'
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['department']),
            models.Index(fields=['status']),
        ]

class Shift(models.Model):
    """
    Represents work shifts in the mining operation
    """
    name = models.CharField(max_length=50)
    start_time = models.TimeField()
    end_time = models.TimeField()
    supervisor = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, related_name='supervised_shifts')
    department = models.ForeignKey(MiningDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='shifts')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.start_time.strftime('%H:%M')} - {self.end_time.strftime('%H:%M')})"

    class Meta:
        verbose_name = 'Shift'
        verbose_name_plural = 'Shifts'
        indexes = [
            models.Index(fields=['department']),
            models.Index(fields=['supervisor']),
        ]

class Zone(models.Model):
    """
    Represents different zones/areas within a mining site
    """
    RISK_LEVELS = (
        ('low', 'Low Risk'),
        ('medium', 'Medium Risk'),
        ('high', 'High Risk'),
        ('restricted', 'Restricted Access')
    )

    AREA_TYPES = (
        ('extraction', 'Extraction Zone'),
        ('processing', 'Processing Zone'),
        ('storage', 'Storage Zone'),
        ('maintenance', 'Maintenance Zone'),
        ('office', 'Office Zone'),
        ('restricted', 'Restricted Zone')
    )

    site = models.ForeignKey(MiningSite, on_delete=models.CASCADE, related_name='zones')
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)
    area_type = models.CharField(max_length=20, choices=AREA_TYPES)
    risk_level = models.CharField(max_length=20, choices=RISK_LEVELS)
    description = models.TextField()
    max_occupancy = models.IntegerField()
    requires_certification = models.BooleanField(default=False)
    required_certifications = models.ManyToManyField(Certification, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.site.name})"

    class Meta:
        verbose_name = 'Zone'
        verbose_name_plural = 'Zones'
        indexes = [
            models.Index(fields=['site']),
            models.Index(fields=['area_type']),
            models.Index(fields=['risk_level']),
        ]

class LaborMetric(models.Model):
    """
    Tracks labor metrics and attendance
    """
    SHIFT_CHOICES = [
        ('MORNING', 'Morning Shift'),
        ('AFTERNOON', 'Afternoon Shift'),
        ('NIGHT', 'Night Shift'),
    ]

    date = models.DateField()
    old_shift = models.CharField(max_length=20, choices=SHIFT_CHOICES, null=True, blank=True)  # Temporary field
    shift = models.ForeignKey(Shift, on_delete=models.SET_NULL, null=True, related_name='labor_metrics')
    department = models.ForeignKey(
        MiningDepartment, 
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='labor_metrics'
    )
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, related_name='labor_metrics')
    workers_present = models.IntegerField(default=0)
    employees_present = models.ManyToManyField(Employee, related_name='attendance_records')
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    overtime_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    productivity_index = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    safety_incidents = models.IntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=25.00)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    def save(self, *args, **kwargs):
        if not self.id:
            self.created_at = timezone.now()
        self.updated_at = timezone.now()
        return super().save(*args, **kwargs)

    class Meta:
        ordering = ['-date', 'shift']
        verbose_name = 'Labor Metric'
        verbose_name_plural = 'Labor Metrics'
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['department']),
            models.Index(fields=['shift']),
            models.Index(fields=['zone']),
        ]

    def __str__(self):
        return f"Labor Metric - {self.date} - {self.shift}"

class EquipmentMaintenanceLog(models.Model):
    """
    Tracks maintenance history for both heavy machinery and gold milling equipment
    """
    MAINTENANCE_TYPE = (
        ('preventive', 'Preventive Maintenance'),
        ('corrective', 'Corrective Maintenance'),
        ('emergency', 'Emergency Repair'),
        ('inspection', 'Routine Inspection')
    )

    date = models.DateField()
    heavy_machinery = models.ForeignKey(HeavyMachinery, on_delete=models.CASCADE, null=True, blank=True, related_name='maintenance_logs')
    milling_equipment = models.ForeignKey(GoldMillingEquipment, on_delete=models.CASCADE, null=True, blank=True, related_name='maintenance_logs')
    maintenance_type = models.CharField(max_length=20, choices=MAINTENANCE_TYPE)
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    downtime_hours = models.DecimalField(max_digits=6, decimal_places=2)
    technician = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True)
    next_maintenance_date = models.DateField(null=True, blank=True)
    parts_replaced = models.TextField(blank=True, null=True)
    history = HistoricalRecords()

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['maintenance_type']),
        ]

    def clean(self):
        if not (self.heavy_machinery or self.milling_equipment):
            raise ValidationError("Either heavy machinery or milling equipment must be specified")
        if self.heavy_machinery and self.milling_equipment:
            raise ValidationError("Cannot specify both heavy machinery and milling equipment")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        equipment = self.heavy_machinery or self.milling_equipment
        return f"Maintenance - {equipment} on {self.date}"
