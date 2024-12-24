from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

User = get_user_model()

username = 'admin2'
email = 'admin2@example.com'
password = 'admin123'

# Try to get or create the user
user, created = User.objects.get_or_create(
    username=username,
    defaults={
        'email': email,
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
        'role': 'admin'
    }
)

# Update password
user.set_password(password)
user.save()

print(f"{'Created' if created else 'Updated'} superuser {username}")
