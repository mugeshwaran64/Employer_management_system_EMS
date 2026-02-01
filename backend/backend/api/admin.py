
from django.contrib import admin
from .models import Employee, Department, Attendance, Leave, Payroll

# 1. Register Department
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)

# 2. Register Employee
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_code', 'first_name', 'last_name', 'email', 'department', 'role', 'is_admin')
    list_filter = ('department', 'role', 'status', 'is_admin')
    search_fields = ('first_name', 'last_name', 'email', 'employee_code')
    
    # This helps you select the user easily when creating an employee
    autocomplete_fields = ['department'] 

# 3. Register Attendance
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status', 'check_in', 'check_out')
    list_filter = ('status', 'date')
    search_fields = ('employee__first_name', 'employee__email')

# 4. Register Leave
@admin.register(Leave)
class LeaveAdmin(admin.ModelAdmin):
    list_display = ('employee', 'leave_type', 'start_date', 'days', 'status')
    list_filter = ('status', 'leave_type')
    search_fields = ('employee__first_name',)

# 5. Register Payroll
@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'net_salary', 'status')
    list_filter = ('status', 'year', 'month')