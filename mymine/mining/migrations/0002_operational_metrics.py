from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EnergyConsumption',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField()),
                ('electricity_kwh', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('diesel_liters', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('compressed_air_m3', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('total_cost', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.CreateModel(
            name='ExplosivesInventory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('anfo_kg', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('emulsion_kg', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('detonators_count', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('boosters_count', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('total_value', models.DecimalField(decimal_places=2, max_digits=10)),
            ],
            options={
                'verbose_name_plural': 'Explosives inventories',
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='StockpileVolume',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('ore_tons', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('waste_tons', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('grade_gpt', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('location', models.CharField(max_length=50)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='DailyExpense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('category', models.CharField(choices=[('FUEL', 'Fuel'), ('MAINTENANCE', 'Maintenance'), ('LABOR', 'Labor'), ('SUPPLIES', 'Supplies'), ('EQUIPMENT', 'Equipment'), ('OTHER', 'Other')], max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('description', models.TextField(blank=True)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='LaborMetric',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('shift', models.CharField(choices=[('MORNING', 'Morning'), ('AFTERNOON', 'Afternoon'), ('NIGHT', 'Night')], max_length=10)),
                ('workers_present', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
                ('hours_worked', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('overtime_hours', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('productivity_index', models.FloatField(validators=[django.core.validators.MinValueValidator(0)])),
                ('safety_incidents', models.IntegerField(default=0)),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='EnvironmentalMetric',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('dust_level_pm10', models.FloatField(help_text='PM10 particulate matter (μg/m³)')),
                ('noise_level_db', models.FloatField(help_text='Average noise level in decibels')),
                ('water_usage_m3', models.FloatField(help_text='Water consumption in cubic meters')),
                ('rehabilitation_area_m2', models.FloatField(help_text='Area under rehabilitation in square meters')),
                ('waste_water_ph', models.FloatField(help_text='pH level of waste water')),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
    ]
