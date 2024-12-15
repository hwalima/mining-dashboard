# Generated manually
from django.db import migrations, models
from decimal import Decimal

class Migration(migrations.Migration):
    dependencies = [
        ('mining_operations', '0023_add_timestamps'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dailyproductionlog',
            name='smelted_gold',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Gold smelted in grams',
                default=Decimal('0')
            ),
        ),
        migrations.AlterField(
            model_name='historicaldailyproductionlog',
            name='smelted_gold',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Gold smelted in grams',
                default=Decimal('0')
            ),
        ),
        migrations.AlterField(
            model_name='dailyproductionlog',
            name='gold_price',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Daily gold price in USD per gram',
                default=Decimal('0')
            ),
        ),
        migrations.AlterField(
            model_name='historicaldailyproductionlog',
            name='gold_price',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Daily gold price in USD per gram',
                default=Decimal('0')
            ),
        ),
        migrations.AlterField(
            model_name='dailyproductionlog',
            name='gross_profit',
            field=models.DecimalField(
                max_digits=15,
                decimal_places=2,
                help_text='Gross profit in USD (smelted_gold * gold_price)',
                default=Decimal('0')
            ),
        ),
        migrations.AlterField(
            model_name='historicaldailyproductionlog',
            name='gross_profit',
            field=models.DecimalField(
                max_digits=15,
                decimal_places=2,
                help_text='Gross profit in USD (smelted_gold * gold_price)',
                default=Decimal('0')
            ),
        ),
    ]
