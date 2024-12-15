from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0029_add_hoisted_tonnage_field'),
    ]

    operations = [
        # First ensure all existing records have a value
        migrations.RunSQL(
            """
            UPDATE mining_operations_dailyproductionlog 
            SET total_tonnage_hoisted = 0 
            WHERE total_tonnage_hoisted IS NULL;
            """,
            reverse_sql="""
            UPDATE mining_operations_dailyproductionlog 
            SET total_tonnage_hoisted = NULL 
            WHERE total_tonnage_hoisted = 0;
            """
        ),
        migrations.RunSQL(
            """
            UPDATE mining_operations_historicaldailyproductionlog 
            SET total_tonnage_hoisted = 0 
            WHERE total_tonnage_hoisted IS NULL;
            """,
            reverse_sql="""
            UPDATE mining_operations_historicaldailyproductionlog 
            SET total_tonnage_hoisted = NULL 
            WHERE total_tonnage_hoisted = 0;
            """
        ),
        # Then modify the columns to be non-nullable with default
        migrations.AlterField(
            model_name='dailyproductionlog',
            name='total_tonnage_hoisted',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text='Total tonnage of ore hoisted',
                max_digits=10,
                null=False,
            ),
        ),
        migrations.AlterField(
            model_name='historicaldailyproductionlog',
            name='total_tonnage_hoisted',
            field=models.DecimalField(
                decimal_places=2,
                default=0,
                help_text='Total tonnage of ore hoisted',
                max_digits=10,
                null=False,
            ),
        ),
    ]
