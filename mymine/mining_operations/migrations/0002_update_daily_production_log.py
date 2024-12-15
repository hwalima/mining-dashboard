# Generated manually
from django.db import migrations, models
from datetime import datetime, timedelta
from decimal import Decimal

def transfer_smelted_gold_data(apps, schema_editor):
    DailyProductionLog = apps.get_model('mining_operations', 'DailyProductionLog')
    SmeltedGold = apps.get_model('mining_operations', 'SmeltedGold')
    
    # Date range for gold price calculation
    start_date = datetime(2023, 1, 1).date()
    end_date = datetime(2024, 12, 14).date()
    total_days = (end_date - start_date).days
    
    # Price range
    start_price = Decimal('55.0')
    end_price = Decimal('85.0')
    price_increase = (end_price - start_price) / Decimal(str(total_days))
    
    # Transfer data from SmeltedGold to DailyProductionLog
    for log in DailyProductionLog.objects.all():
        try:
            # Get smelted gold record for this date and site
            smelted_gold = SmeltedGold.objects.get(date=log.date, site=log.site)
            
            # Calculate gold price for this date
            days_since_start = (log.date - start_date).days
            gold_price = start_price + (price_increase * Decimal(str(days_since_start)))
            
            # Update DailyProductionLog
            log.smelted_gold = smelted_gold.total_weight
            log.gold_price = gold_price.quantize(Decimal('0.01'))
            log.gross_profit = (smelted_gold.total_weight * gold_price).quantize(Decimal('0.01'))
            log.save()
            
        except SmeltedGold.DoesNotExist:
            # If no smelted gold record exists, set default values
            days_since_start = (log.date - start_date).days
            gold_price = start_price + (price_increase * Decimal(str(days_since_start)))
            
            log.smelted_gold = Decimal('0')
            log.gold_price = gold_price.quantize(Decimal('0.01'))
            log.gross_profit = Decimal('0')
            log.save()

def reverse_transfer(apps, schema_editor):
    DailyProductionLog = apps.get_model('mining_operations', 'DailyProductionLog')
    # Reset the new fields
    DailyProductionLog.objects.all().update(
        smelted_gold=Decimal('0'),
        gold_price=Decimal('0'),
        gross_profit=Decimal('0')
    )

class Migration(migrations.Migration):
    dependencies = [
        ('mining_operations', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dailyproductionlog',
            name='smelted_gold',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Gold smelted in grams',
                default=Decimal('0')
            ),
        ),
        migrations.AddField(
            model_name='historicaldailyproductionlog',
            name='smelted_gold',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Gold smelted in grams',
                default=Decimal('0')
            ),
        ),
        migrations.AddField(
            model_name='dailyproductionlog',
            name='gold_price',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Daily gold price in USD per gram',
                default=Decimal('0')
            ),
        ),
        migrations.AddField(
            model_name='historicaldailyproductionlog',
            name='gold_price',
            field=models.DecimalField(
                max_digits=10,
                decimal_places=2,
                help_text='Daily gold price in USD per gram',
                default=Decimal('0')
            ),
        ),
        migrations.AddField(
            model_name='dailyproductionlog',
            name='gross_profit',
            field=models.DecimalField(
                max_digits=15,
                decimal_places=2,
                help_text='Gross profit in USD (smelted_gold * gold_price)',
                default=Decimal('0')
            ),
        ),
        migrations.AddField(
            model_name='historicaldailyproductionlog',
            name='gross_profit',
            field=models.DecimalField(
                max_digits=15,
                decimal_places=2,
                help_text='Gross profit in USD (smelted_gold * gold_price)',
                default=Decimal('0')
            ),
        ),
        migrations.RunPython(
            transfer_smelted_gold_data,
            reverse_transfer
        ),
    ]
