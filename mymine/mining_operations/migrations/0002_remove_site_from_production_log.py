from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('mining_operations', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='dailyproductionlog',
            name='site',
        ),
        migrations.RenameField(
            model_name='dailyproductionlog',
            old_name='updated_at',
            new_name='modified_at',
        ),
    ]
