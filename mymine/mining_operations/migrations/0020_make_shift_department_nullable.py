# Generated manually

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0019_update_department_types'),
    ]

    operations = [
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
    ]
