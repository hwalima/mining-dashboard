False
# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0018_create_shifts_and_update_references'),
    ]

    operations = [
        # First make the department field nullable
        migrations.AlterField(
            model_name='labormetric',
            name='department',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='safetyincident',
            name='department',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='dailychemicalsused',
            name='department',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='dailyexplosivesused',
            name='department',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='shift',
            name='department',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='historicalshift',
            name='department',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='historicallabormetric',
            name='department',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='historicalsafetyincident',
            name='department',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='historicaldailychemicalsused',
            name='department',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='mining_operations.miningdepartment'
            ),
        ),
        migrations.AlterField(
            model_name='historicaldailyexplosivesused',
            name='department',
            field=models.ForeignKey(
                blank=True,
                db_constraint=False,
                null=True,
                on_delete=django.db.models.deletion.DO_NOTHING,
                related_name='+',
                to='mining_operations.miningdepartment'
            ),
        ),
        # Then update the data
        migrations.RunSQL(
            """
            UPDATE mining_operations_labormetric SET department_id = NULL;
            UPDATE mining_operations_safetyincident SET department_id = NULL;
            UPDATE mining_operations_dailychemicalsused SET department_id = NULL;
            UPDATE mining_operations_dailyexplosivesused SET department_id = NULL;
            UPDATE mining_operations_shift SET department_id = NULL;
            UPDATE mining_operations_historicalshift SET department_id = NULL;
            DELETE FROM mining_operations_miningdepartment;
            DELETE FROM mining_operations_historicalminingdepartment;
            """,
            reverse_sql="",
        ),
        # Finally update the department type choices
        migrations.AlterField(
            model_name='miningdepartment',
            name='type',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('extraction', 'Extraction'),
                    ('processing', 'Processing'),
                    ('safety', 'Safety'),
                    ('maintenance', 'Maintenance'),
                    ('logistics', 'Logistics'),
                    ('administration', 'Administration')
                ]
            ),
        ),
        migrations.AlterField(
            model_name='historicalminingdepartment',
            name='type',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('extraction', 'Extraction'),
                    ('processing', 'Processing'),
                    ('safety', 'Safety'),
                    ('maintenance', 'Maintenance'),
                    ('logistics', 'Logistics'),
                    ('administration', 'Administration')
                ]
            ),
        ),
    ]
