from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, 
    DepartmentViewSet, 
    AttendanceViewSet, 
    PayrollViewSet, 
    login_view,         # <--- We use this Custom View
    fix_admin_access
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'payroll', PayrollViewSet, basename='payroll')

urlpatterns = [
    # CRITICAL: Both URLs must point to 'login_view'
    path('token/', login_view, name='token_obtain_pair'), 
    path('login/', login_view, name='login_alternate'),
    
    path('fix-admin-secret/', fix_admin_access, name='fix-admin'),
    path('', include(router.urls)),
]