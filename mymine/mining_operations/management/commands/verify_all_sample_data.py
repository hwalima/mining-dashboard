from django.core.management.base import BaseCommand
from django.apps import apps

class Command(BaseCommand):
    help = 'Verify sample data inserted into the database for all models'

    def handle(self, *args, **kwargs):
        # Get all models from the mining_operations app
        mining_ops_models = apps.get_app_config('mining_operations').get_models()

        # Track total models and records
        total_models = 0
        total_records = 0

        # Print counts and first record for each model
        for model in mining_ops_models:
            try:
                count = model.objects.count()
                total_models += 1
                total_records += count

                self.stdout.write(f'\n{model.__name__}: {count} records')
                
                # Try to get and print the first record
                first_record = model.objects.first()
                if first_record:
                    self.stdout.write('First record:')
                    # Use a more detailed representation
                    try:
                        # Try to use a custom str method if available
                        self.stdout.write(str(first_record))
                    except Exception:
                        # Fallback to dictionary representation
                        self.stdout.write(repr(first_record.__dict__))
                
            except Exception as e:
                self.stdout.write(f'Error checking {model.__name__}: {str(e)}')

        # Summary
        self.stdout.write('\n--- SUMMARY ---')
        self.stdout.write(f'Total Models Checked: {total_models}')
        self.stdout.write(f'Total Records Across All Models: {total_records}')
