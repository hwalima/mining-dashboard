from django.db import models
from django.utils.translation import gettext_lazy as _
from mining_operations.models import MiningSite, MiningDepartment
from django.utils import timezone
from datetime import timedelta

class DashboardWidget(models.Model):
    """
    Configurable dashboard widgets for personalized views
    """
    WIDGET_TYPES = (
        ('production_chart', 'Production Chart'),
        ('safety_summary', 'Safety Summary'),
        ('equipment_status', 'Equipment Status'),
        ('chemical_inventory', 'Chemical Inventory'),
        ('financial_overview', 'Financial Overview')
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=30, choices=WIDGET_TYPES)
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    site = models.ForeignKey(MiningSite, on_delete=models.SET_NULL, null=True, blank=True)
    department = models.ForeignKey(MiningDepartment, on_delete=models.SET_NULL, null=True, blank=True)
    configuration = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.get_type_display()}"

class UserDashboardPreference(models.Model):
    """
    Stores user-specific dashboard preferences
    """
    THEME_CHOICES = (
        ('light', 'Light Theme'),
        ('dark', 'Dark Theme'),
        ('system', 'System Default')
    )

    LANGUAGE_CHOICES = (
        ('en', 'English'),
        ('fr', 'French'),
        ('es', 'Spanish')
    )

    user = models.OneToOneField('accounts.CustomUser', on_delete=models.CASCADE)
    theme = models.CharField(max_length=10, choices=THEME_CHOICES, default='system')
    language = models.CharField(max_length=5, choices=LANGUAGE_CHOICES, default='en')
    default_site = models.ForeignKey(MiningSite, on_delete=models.SET_NULL, null=True, blank=True)
    show_notifications = models.BooleanField(default=True)
    compact_mode = models.BooleanField(default=False)
    last_login_dashboard = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Dashboard Preferences for {self.user.username}"

class NotificationLog(models.Model):
    """
    Tracks notifications for users
    """
    NOTIFICATION_TYPES = (
        ('safety_alert', 'Safety Alert'),
        ('production_update', 'Production Update'),
        ('maintenance_reminder', 'Maintenance Reminder'),
        ('system_message', 'System Message')
    )

    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    related_site = models.ForeignKey(MiningSite, on_delete=models.SET_NULL, null=True, blank=True)
    related_department = models.ForeignKey(MiningDepartment, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_type_display()} for {self.user.username}"

class Machinery(models.Model):
    STATUS_CHOICES = [
        ('Operational', 'Operational'),
        ('Under Maintenance', 'Under Maintenance'),
        ('Out of Service', 'Out of Service'),
    ]
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Operational')
    efficiency = models.DecimalField(max_digits=5, decimal_places=2, default=100.00)
    operating_hours = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_maintenance = models.DateField(default=timezone.now)
    _next_maintenance_due = models.DateField(default=timezone.now)

    @property
    def next_maintenance_due(self):
        return self._next_maintenance_due

    @next_maintenance_due.setter
    def next_maintenance_due(self, value):
        self._next_maintenance_due = value

    def __str__(self):
        return f"{self.name} - {self.status}"

class MaintenanceRecord(models.Model):
    machinery = models.ForeignKey(Machinery, on_delete=models.CASCADE, related_name='maintenance_records')
    date = models.DateField()
    type = models.CharField(max_length=50)
    description = models.TextField()
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.machinery.name} - {self.date} - {self.type}"

class EquipmentStatusLog(models.Model):
    machinery = models.ForeignKey(Machinery, on_delete=models.CASCADE, related_name='status_logs')
    status = models.CharField(
        max_length=20,
        choices=[
            ('Operational', 'Operational'),
            ('Under Maintenance', 'Under Maintenance'),
            ('Out of Service', 'Out of Service'),
        ]
    )
    date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.machinery.name} - {self.status} on {self.date}"

class ChemicalInventory(models.Model):
    name = models.CharField(max_length=200)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_required = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_restocked = models.DateField(auto_now=True)
    supplier = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Chemical Inventories"
        ordering = ['name']

    def __str__(self):
        return self.name

class ChemicalUsage(models.Model):
    """
    Tracks daily chemical consumption
    """
    date = models.DateField()
    chemical = models.ForeignKey(ChemicalInventory, on_delete=models.CASCADE, related_name='usage_logs')
    amount_used = models.DecimalField(max_digits=10, decimal_places=2)
    process = models.CharField(max_length=100)  # e.g., 'Leaching', 'pH Control', etc.
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name_plural = "Chemical Usage"

    def __str__(self):
        return f"{self.chemical.name} - {self.amount_used}{self.chemical.unit} on {self.date}"

class ExplosivesInventory(models.Model):
    """
    Tracks inventory of explosive materials
    """
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=100, choices=[
        ('Primary', 'Primary Explosive'),
        ('Secondary', 'Secondary Explosive'),
        ('Detonator', 'Detonator'),
        ('Booster', 'Booster'),
        ('Other', 'Other')
    ])
    current_stock = models.DecimalField(max_digits=10, decimal_places=2)
    minimum_required = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)  # e.g., 'kg', 'units'
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_restocked = models.DateField(auto_now=True)
    supplier = models.CharField(max_length=200, blank=True, null=True)
    storage_location = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100)
    expiry_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Explosives Inventories"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.type})"

class ExplosivesUsage(models.Model):
    """
    Tracks daily explosives consumption
    """
    date = models.DateField()
    explosive = models.ForeignKey(ExplosivesInventory, on_delete=models.CASCADE, related_name='usage_logs')
    amount_used = models.DecimalField(max_digits=10, decimal_places=2)
    blast_location = models.CharField(max_length=200)
    blast_purpose = models.CharField(max_length=200)  # e.g., 'Development', 'Production', 'Special'
    authorized_by = models.CharField(max_length=200)
    weather_conditions = models.CharField(max_length=100, blank=True, null=True)
    rock_type = models.CharField(max_length=100, blank=True, null=True)
    blast_pattern = models.CharField(max_length=100, blank=True, null=True)
    effectiveness_rating = models.DecimalField(max_digits=3, decimal_places=1, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name_plural = "Explosives Usage"

    def __str__(self):
        return f"{self.explosive.name} - {self.amount_used}{self.explosive.unit} on {self.date}"

class SafetyIncident(models.Model):
    date = models.DateField(default=timezone.now)
    type = models.CharField(max_length=100)
    severity = models.CharField(max_length=50, choices=[
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High')
    ])
    description = models.TextField()
    action_taken = models.TextField(blank=True, null=True)
    resolved = models.BooleanField(default=False)
    department = models.ForeignKey('mining_operations.MiningDepartment', on_delete=models.SET_NULL, null=True, related_name='safety_incidents_dashboard')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.date} - {self.type} ({self.severity})"

class EnergyUsage(models.Model):
    """
    Tracks daily energy consumption
    """
    date = models.DateField(unique=True)
    electricity_kwh = models.DecimalField(max_digits=10, decimal_places=2)  # in kWh
    electricity_cost = models.DecimalField(max_digits=10, decimal_places=2)  # in local currency
    diesel_liters = models.DecimalField(max_digits=10, decimal_places=2)  # in liters
    diesel_cost = models.DecimalField(max_digits=10, decimal_places=2)  # in local currency
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)  # in local currency
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name_plural = "Energy Usage"

    def __str__(self):
        return f"Energy Usage on {self.date}: {self.electricity_kwh} kWh, {self.diesel_liters} L"

    def save(self, *args, **kwargs):
        # Calculate total cost before saving
        self.total_cost = float(self.electricity_cost or 0) + float(self.diesel_cost or 0)
        super().save(*args, **kwargs)

class EnvironmentalMetric(models.Model):
    """
    Tracks daily environmental metrics including dust levels, noise levels, water usage, and rehabilitation progress
    """
    date = models.DateField(unique=True)
    dust_level_pm10 = models.DecimalField(max_digits=6, decimal_places=2, help_text='PM10 dust level in µg/m³')
    noise_level_db = models.DecimalField(max_digits=5, decimal_places=1, help_text='Noise level in dB')
    water_usage_m3 = models.DecimalField(max_digits=10, decimal_places=2, help_text='Water usage in cubic meters')
    waste_water_ph = models.DecimalField(max_digits=4, decimal_places=2, help_text='Waste water pH level')
    rehabilitation_area_m2 = models.DecimalField(max_digits=10, decimal_places=2, help_text='Cumulative rehabilitation area in square meters')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name_plural = "Environmental Metrics"

    def __str__(self):
        return f"Environmental Metrics for {self.date}"
