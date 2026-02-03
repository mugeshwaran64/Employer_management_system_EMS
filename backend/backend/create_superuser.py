import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User
from api.models import Employee, Department  # Verify 'api' is your app name

USERNAME = "admin@gmail.com"
PASSWORD = "admin"

print("--- STARTING ADMIN FIX ---")

# 1. Create or Get Department
dept, _ = Department.objects.get_or_create(name="Management", defaults={"description": "Admins"})

# 2. Fix User Account
if User.objects.filter(username=USERNAME).exists():
    print("Updating existing user...")
    user = User.objects.get(username=USERNAME)
    user.set_password(PASSWORD)
    user.email = USERNAME
    user.is_superuser = True
    user.is_staff = True
    user.save()
else:
    print("Creating new user...")
    user = User.objects.create_superuser(username=USERNAME, email=USERNAME, password=PASSWORD)

# 3. Fix Employee Profile (CRITICAL!)
# Dashboard needs an Employee record to load details
if not Employee.objects.filter(user=user).exists():
    print("Creating Employee profile for Admin...")
    Employee.objects.create(
        user=user,
        first_name="Admin",
        last_name="User",
        email=USERNAME,
        employee_code="ADM001",
        department=dept,
        role="HR",
        position="System Admin",
        salary=100000,
        status="active",
        is_admin=True  # This gives full access in your frontend
    )
else:
    # Ensure existing employee has admin rights
    emp = Employee.objects.get(user=user)
    emp.is_admin = True
    emp.save()
    print("Employee profile updated with Admin rights.")

print("--- SUCCESS: Login with admin@gmail.com / admin ---")