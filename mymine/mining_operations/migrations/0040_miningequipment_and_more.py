# Generated by Django 5.1.4 on 2024-12-24 01:56

import django.db.models.deletion
import simple_history.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0039_remove_redundant_equipment_models'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MiningEquipment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Name of the equipment', max_length=200)),
                ('description', models.TextField(help_text='Detailed description of the equipment')),
                ('value_usd', models.DecimalField(decimal_places=2, help_text='Current value in USD', max_digits=12)),
                ('last_service_date', models.DateField(help_text='Date of the last service')),
                ('next_service_date', models.DateField(help_text='Date when next service is due')),
                ('service_interval_days', models.PositiveIntegerField(help_text='Number of days between services')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Mining Equipment',
                'verbose_name_plural': 'Mining Equipment',
                'ordering': ['name'],
            },
        ),
        migrations.RemoveField(
            model_name='historicaldailyequipmentruntime',
            name='equipment',
        ),
        migrations.RemoveField(
            model_name='historicaldailyequipmentruntime',
            name='history_user',
        ),
        migrations.RemoveField(
            model_name='historicaldailyequipmentruntime',
            name='operator',
        ),
        migrations.RemoveField(
            model_name='historicaldailyequipmentruntime',
            name='shift',
        ),
        migrations.CreateModel(
            name='EquipmentRunningTime',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('running_hours', models.DecimalField(decimal_places=2, help_text='Number of hours the equipment was running on this date', max_digits=6)),
                ('idle_hours', models.DecimalField(decimal_places=2, help_text='Number of hours the equipment was idle on this date', max_digits=6)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('equipment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='running_times', to='mining_operations.equipment')),
            ],
            options={
                'verbose_name': 'Equipment Running Time',
                'verbose_name_plural': 'Equipment Running Times',
                'ordering': ['-date'],
                'unique_together': {('equipment', 'date')},
            },
        ),
        migrations.CreateModel(
            name='GoldMillingEquipment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=50)),
                ('capacity_tons_per_hour', models.DecimalField(decimal_places=2, max_digits=6)),
                ('efficiency_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('current_status', models.CharField(choices=[('operational', 'Operational'), ('maintenance', 'Under Maintenance'), ('offline', 'Offline')], default='operational', max_length=20)),
                ('last_maintenance_date', models.DateField(blank=True, null=True)),
                ('site', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='mining_operations.miningsite')),
            ],
        ),
        migrations.CreateModel(
            name='HeavyMachinery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('model', models.CharField(max_length=100)),
                ('serial_number', models.CharField(max_length=50, unique=True)),
                ('purchase_date', models.DateField()),
                ('last_maintenance_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(choices=[('operational', 'Operational'), ('maintenance', 'Under Maintenance'), ('retired', 'Retired')], default='operational', max_length=20)),
                ('operational_hours', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('maintenance_cost', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('department', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='machinery', to='mining_operations.miningdepartment')),
                ('site', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='machinery', to='mining_operations.miningsite')),
            ],
        ),
        migrations.CreateModel(
            name='EquipmentMaintenanceLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('maintenance_type', models.CharField(choices=[('preventive', 'Preventive Maintenance'), ('corrective', 'Corrective Maintenance'), ('emergency', 'Emergency Repair'), ('inspection', 'Routine Inspection')], max_length=20)),
                ('description', models.TextField()),
                ('cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('downtime_hours', models.DecimalField(decimal_places=2, max_digits=6)),
                ('next_maintenance_date', models.DateField(blank=True, null=True)),
                ('parts_replaced', models.TextField(blank=True, null=True)),
                ('technician', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('milling_equipment', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='maintenance_logs', to='mining_operations.goldmillingequipment')),
                ('heavy_machinery', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='maintenance_logs', to='mining_operations.heavymachinery')),
            ],
            options={
                'ordering': ['-date'],
            },
        ),
        migrations.CreateModel(
            name='HistoricalEquipmentMaintenanceLog',
            fields=[
                ('id', models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('date', models.DateField()),
                ('maintenance_type', models.CharField(choices=[('preventive', 'Preventive Maintenance'), ('corrective', 'Corrective Maintenance'), ('emergency', 'Emergency Repair'), ('inspection', 'Routine Inspection')], max_length=20)),
                ('description', models.TextField()),
                ('cost', models.DecimalField(decimal_places=2, max_digits=10)),
                ('downtime_hours', models.DecimalField(decimal_places=2, max_digits=6)),
                ('next_maintenance_date', models.DateField(blank=True, null=True)),
                ('parts_replaced', models.TextField(blank=True, null=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('heavy_machinery', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='mining_operations.heavymachinery')),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('milling_equipment', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='mining_operations.goldmillingequipment')),
                ('technician', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'historical equipment maintenance log',
                'verbose_name_plural': 'historical equipment maintenance logs',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalEquipmentRunningTime',
            fields=[
                ('id', models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('date', models.DateField()),
                ('running_hours', models.DecimalField(decimal_places=2, help_text='Number of hours the equipment was running on this date', max_digits=6)),
                ('idle_hours', models.DecimalField(decimal_places=2, help_text='Number of hours the equipment was idle on this date', max_digits=6)),
                ('notes', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(blank=True, editable=False)),
                ('updated_at', models.DateTimeField(blank=True, editable=False)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('equipment', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='mining_operations.equipment')),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'historical Equipment Running Time',
                'verbose_name_plural': 'historical Equipment Running Times',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalGoldMillingEquipment',
            fields=[
                ('id', models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('type', models.CharField(max_length=50)),
                ('capacity_tons_per_hour', models.DecimalField(decimal_places=2, max_digits=6)),
                ('efficiency_percentage', models.DecimalField(decimal_places=2, max_digits=5)),
                ('current_status', models.CharField(choices=[('operational', 'Operational'), ('maintenance', 'Under Maintenance'), ('offline', 'Offline')], default='operational', max_length=20)),
                ('last_maintenance_date', models.DateField(blank=True, null=True)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('site', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='mining_operations.miningsite')),
            ],
            options={
                'verbose_name': 'historical gold milling equipment',
                'verbose_name_plural': 'historical gold milling equipments',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name='HistoricalHeavyMachinery',
            fields=[
                ('id', models.BigIntegerField(auto_created=True, blank=True, db_index=True, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('model', models.CharField(max_length=100)),
                ('serial_number', models.CharField(db_index=True, max_length=50)),
                ('purchase_date', models.DateField()),
                ('last_maintenance_date', models.DateField(blank=True, null=True)),
                ('status', models.CharField(choices=[('operational', 'Operational'), ('maintenance', 'Under Maintenance'), ('retired', 'Retired')], default='operational', max_length=20)),
                ('operational_hours', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('maintenance_cost', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('history_id', models.AutoField(primary_key=True, serialize=False)),
                ('history_date', models.DateTimeField(db_index=True)),
                ('history_change_reason', models.CharField(max_length=100, null=True)),
                ('history_type', models.CharField(choices=[('+', 'Created'), ('~', 'Changed'), ('-', 'Deleted')], max_length=1)),
                ('department', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='mining_operations.miningdepartment')),
                ('history_user', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to=settings.AUTH_USER_MODEL)),
                ('site', models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='mining_operations.miningsite')),
            ],
            options={
                'verbose_name': 'historical heavy machinery',
                'verbose_name_plural': 'historical heavy machinerys',
                'ordering': ('-history_date', '-history_id'),
                'get_latest_by': ('history_date', 'history_id'),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.DeleteModel(
            name='DailyEquipmentRuntime',
        ),
        migrations.DeleteModel(
            name='HistoricalDailyEquipmentRuntime',
        ),
        migrations.AddIndex(
            model_name='equipmentmaintenancelog',
            index=models.Index(fields=['date'], name='mining_oper_date_a24236_idx'),
        ),
        migrations.AddIndex(
            model_name='equipmentmaintenancelog',
            index=models.Index(fields=['maintenance_type'], name='mining_oper_mainten_4d60e9_idx'),
        ),
    ]
