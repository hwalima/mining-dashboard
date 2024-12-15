from django.db import migrations, models
from django.utils import timezone

class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0028_merge_20241215_0222'),
    ]

    operations = [
        migrations.AddField(
            model_name='dailyproductionlog',
            name='total_tonnage_hoisted',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text='Total tonnage of ore hoisted',
                max_digits=10,
            ),
        ),
        migrations.AddField(
            model_name='historicaldailyproductionlog',
            name='total_tonnage_hoisted',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text='Total tonnage of ore hoisted',
                max_digits=10,
                null=True,
            ),
        ),
    ]
