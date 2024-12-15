from django.db import models
from django.core.validators import MinValueValidator

class EnergyConsumption(models.Model):
    timestamp = models.DateTimeField()
    electricity_kwh = models.FloatField(validators=[MinValueValidator(0)])
    diesel_liters = models.FloatField(validators=[MinValueValidator(0)])
    compressed_air_m3 = models.FloatField(validators=[MinValueValidator(0)])
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['-timestamp']

class ExplosivesInventory(models.Model):
    date = models.DateField()
    anfo_kg = models.FloatField(validators=[MinValueValidator(0)])
    emulsion_kg = models.FloatField(validators=[MinValueValidator(0)])
    detonators_count = models.IntegerField(validators=[MinValueValidator(0)])
    boosters_count = models.IntegerField(validators=[MinValueValidator(0)])
    total_value = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        ordering = ['-date']
        verbose_name_plural = "Explosives inventories"

class StockpileVolume(models.Model):
    date = models.DateField()
    ore_tons = models.FloatField(validators=[MinValueValidator(0)])
    waste_tons = models.FloatField(validators=[MinValueValidator(0)])
    grade_gpt = models.FloatField(validators=[MinValueValidator(0)])  # grams per ton
    location = models.CharField(max_length=50)
    
    class Meta:
        ordering = ['-date']

class DailyExpense(models.Model):
    CATEGORY_CHOICES = [
        ('FUEL', 'Fuel'),
        ('MAINTENANCE', 'Maintenance'),
        ('LABOR', 'Labor'),
        ('SUPPLIES', 'Supplies'),
        ('EQUIPMENT', 'Equipment'),
        ('OTHER', 'Other'),
    ]
    
    date = models.DateField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-date']

class LaborMetric(models.Model):
    SHIFT_CHOICES = [
        ('MORNING', 'Morning'),
        ('AFTERNOON', 'Afternoon'),
        ('NIGHT', 'Night'),
    ]
    
    date = models.DateField()
    shift = models.CharField(max_length=10, choices=SHIFT_CHOICES)
    workers_present = models.IntegerField(validators=[MinValueValidator(0)])
    hours_worked = models.FloatField(validators=[MinValueValidator(0)])
    overtime_hours = models.FloatField(validators=[MinValueValidator(0)])
    productivity_index = models.FloatField(validators=[MinValueValidator(0)])
    safety_incidents = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-date']

class EnvironmentalMetric(models.Model):
    date = models.DateField()
    dust_level_pm10 = models.FloatField(help_text="PM10 particulate matter (μg/m³)")
    noise_level_db = models.FloatField(help_text="Average noise level in decibels")
    water_usage_m3 = models.FloatField(help_text="Water consumption in cubic meters")
    rehabilitation_area_m2 = models.FloatField(help_text="Area under rehabilitation in square meters")
    waste_water_ph = models.FloatField(help_text="pH level of waste water")
    
    class Meta:
        ordering = ['-date']
