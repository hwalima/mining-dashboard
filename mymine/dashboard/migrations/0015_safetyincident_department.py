# Generated by Django 5.1.4 on 2024-12-12 23:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0014_chemicalusage_equipmentstatuslog'),
        ('mining_operations', '0008_alter_safetyincident_department'),
    ]

    operations = [
        migrations.AddField(
            model_name='safetyincident',
            name='department',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='safety_incidents_dashboard', to='mining_operations.miningdepartment'),
        ),
    ]
