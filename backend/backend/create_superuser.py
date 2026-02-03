import os
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User

# Configuration
USERNAME = "admin"
EMAIL = "admin@gmail.com"
PASSWORD = "admin"  # <--- Neenga keta password

# Check if user exists
if User.objects.filter(username=USERNAME).exists():
    print(f"User {USERNAME} found. Reseting password...")
    user = User.objects.get(username=USERNAME)
    user.set_password(PASSWORD)
    user.save()
    print("Password updated successfully!")
else:
    print(f"Creating superuser: {USERNAME}...")
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print("Superuser created successfully!")