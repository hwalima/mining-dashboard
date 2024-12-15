# Generated manually
from django.db import migrations, models
import django.utils.timezone

class Migration(migrations.Migration):
    dependencies = [
        ('mining_operations', '0022_merge_20241215_0125'),
    ]

    operations = [
        migrations.AddField(
            model_name='dailyproductionlog',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='dailyproductionlog',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
