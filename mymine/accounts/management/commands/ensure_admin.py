from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Ensures admin user exists'

    def handle(self, *args, **options):
        username = 'admin2'
        password = 'admin123'
        
        if User.objects.filter(username=username).exists():
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated password for user {username}'))
        else:
            User.objects.create_superuser(
                username=username,
                email='admin@example.com',
                password=password,
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS(f'Created superuser {username}'))
