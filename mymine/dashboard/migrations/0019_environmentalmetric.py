# Generated by Django 5.1.4 on 2024-12-13 21:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0018_explosivesinventory_explosivesusage'),
    ]

    operations = [
        migrations.CreateModel(
            name='EnvironmentalMetric',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField(unique=True)),
                ('dust_level_pm10', models.DecimalField(decimal_places=2, help_text='PM10 dust level in µg/m³', max_digits=6)),
                ('noise_level_db', models.DecimalField(decimal_places=1, help_text='Noise level in dB', max_digits=5)),
                ('water_usage_m3', models.DecimalField(decimal_places=2, help_text='Water usage in cubic meters', max_digits=10)),
                ('waste_water_ph', models.DecimalField(decimal_places=2, help_text='Waste water pH level', max_digits=4)),
                ('rehabilitation_area_m2', models.DecimalField(decimal_places=2, help_text='Cumulative rehabilitation area in square meters', max_digits=10)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name_plural': 'Environmental Metrics',
                'ordering': ['-date'],
            },
        ),
    ]