from django.db import migrations, models
import django.db.models.deletion
from django.core.validators import MinValueValidator

class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EquipmentRunningTime',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('total_running_hours', models.DecimalField(decimal_places=2, help_text='Total running time in hours', max_digits=5, validators=[MinValueValidator(0)])),
                ('remarks', models.TextField(blank=True)),
                ('equipment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='running_times', to='mining_operations.equipment')),
            ],
            options={
                'ordering': ['-date', 'equipment'],
                'unique_together': {('date', 'equipment')},
            },
        ),
    ]
