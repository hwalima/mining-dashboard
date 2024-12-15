from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0016_productionmetrics_gold_smelted'),
    ]

    operations = [
        migrations.DeleteModel(
            name='DailyProductionLog',
        ),
    ]
