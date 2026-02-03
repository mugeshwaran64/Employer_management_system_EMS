import os
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User

# Configuration for the Superuser
USERNAME = "admin"
EMAIL = "admin@gmail.com"
PASSWORD = "admin"  # <--- You can change this later in the dashboard

if not User.objects.filter(username=USERNAME).exists():
    print(f"Creating superuser: {USERNAME}...")
    User.objects.create_superuser(USERNAME, EMAIL, PASSWORD)
    print("Superuser created successfully!")
else:
    print("Superuser already exists. Skipping creation.")