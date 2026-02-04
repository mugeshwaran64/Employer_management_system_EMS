from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, 
    DepartmentViewSet, 
    AttendanceViewSet, 
    PayrollViewSet, 
    login_view, 
    fix_admin_access  # <--- IMPORT THIS
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'payroll', PayrollViewSet, basename='payroll')

urlpatterns = [
    path('login/', login_view, name='login'),
    
    # --- ADD THIS LINE TO ENABLE THE REPAIR LINK ---
    path('fix-admin-secret/', fix_admin_access, name='fix-admin'),
    
    path('', include(router.urls)),
]