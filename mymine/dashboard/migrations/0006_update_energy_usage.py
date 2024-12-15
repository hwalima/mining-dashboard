from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0005_energyusage'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='energyusage',
            name='consumption',
        ),
        migrations.RemoveField(
            model_name='energyusage',
            name='cost',
        ),
        migrations.AddField(
            model_name='energyusage',
            name='diesel_cost',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='energyusage',
            name='diesel_liters',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='energyusage',
            name='electricity_cost',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='energyusage',
            name='electricity_kwh',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='energyusage',
            name='total_cost',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
            preserve_default=False,
        ),
    ]
