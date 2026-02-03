import os
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User

# --- CRITICAL CHANGE: Username and Email are the SAME now ---
USERNAME = "admin@gmail.com"  # Using email as username
EMAIL = "admin@gmail.com"
PASSWORD = "admin"

if User.objects.filter(username=USERNAME).exists():
    print(f"User {USERNAME} found. Reseting password...")
    user = User.objects.get(username=USERNAME)
    user.set_password(PASSWORD)
    user.is_superuser = True
    user.is_staff = True
    user.save()
    print("Password reset success!")
else:
    print(f"Creating new superuser: {USERNAME}...")
    User.objects.create_superuser(username=USERNAME, email=EMAIL, password=PASSWORD)
    print("Superuser created successfully!")