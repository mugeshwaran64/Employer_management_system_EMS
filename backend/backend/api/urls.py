from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, DepartmentViewSet, AttendanceViewSet, PayrollViewSet, login_view

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet, basename='employee')
router.register(r'departments', DepartmentViewSet, basename='department') # Added back
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'payroll', PayrollViewSet, basename='payroll')

urlpatterns = [
    path('login/', login_view, name='login'),
    path('', include(router.urls)),
]