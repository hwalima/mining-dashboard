from django.contrib.auth import get_user_model
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mymine.settings')
django.setup()

User = get_user_model()

# Check if admin2 exists
admin_user = User.objects.filter(username='admin2').first()
if admin_user:
    print(f"Found user: {admin_user.username}")
    print(f"Email: {admin_user.email}")
    print(f"Is superuser: {admin_user.is_superuser}")
    print(f"Is active: {admin_user.is_active}")
else:
    print("Admin2 user not found")
