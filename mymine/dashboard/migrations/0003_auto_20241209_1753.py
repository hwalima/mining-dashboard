# Generated by Django 5.1.4 on 2024-12-09 15:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0002_chemicalinventory_dailyproductionlog_machinery_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='machinery',
            name='model_number',
        ),
        migrations.RemoveField(
            model_name='machinery',
            name='hours_operated',
        ),
        migrations.RemoveField(
            model_name='machinery',
            name='maintenance_due',
        ),
        migrations.AddField(
            model_name='machinery',
            name='type',
            field=models.CharField(default='', max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='machinery',
            name='next_maintenance',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='machinery',
            name='status',
            field=models.CharField(choices=[('Operational', 'Operational'), ('Under Maintenance', 'Under Maintenance'), ('Offline', 'Offline')], max_length=50),
        ),
    ]