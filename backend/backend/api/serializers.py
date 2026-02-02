from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Department, Attendance, Leave, Payroll

# --- Department Serializer ---
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

# --- Employee Serializer ---
class EmployeeSerializer(serializers.ModelSerializer):
    departments = DepartmentSerializer(source='department', read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True, required=False, allow_null=True
    )
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Employee
        fields = '__all__'
        # Fix: Tell Django not to complain about missing department object
        extra_kwargs = {'department': {'read_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        email = validated_data.get('email')
        first_name = validated_data.get('first_name')
        
        user = None
        if password:
            if User.objects.filter(username=email).exists():
                raise serializers.ValidationError({"email": "User with this email already exists."})
            user = User.objects.create_user(username=email, email=email, password=password)
            user.first_name = first_name
            user.save()

        employee = Employee.objects.create(user=user, **validated_data)
        return employee

# --- Attendance Serializer (FIXED) ---
class AttendanceSerializer(serializers.ModelSerializer):
    # This maps 'employee_id' (from frontend) to 'employee' (database)
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), source='employee', write_only=True
    )
    # This shows details in the response
    employees = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'
        # MAGIC FIX: Tells Django "Don't ask for the 'employee' object, I am giving you an ID instead"
        extra_kwargs = {'employee': {'read_only': True}}

# --- Payroll Serializer (FIXED) ---
class PayrollSerializer(serializers.ModelSerializer):
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), source='employee', write_only=True
    )
    employees = EmployeeSerializer(source='employee', read_only=True)

    class Meta:
        model = Payroll
        fields = '__all__'
        # MAGIC FIX: Tells Django "Don't ask for the 'employee' object, I am giving you an ID instead"
        extra_kwargs = {'employee': {'read_only': True}}

# --- Leave Serializer ---
class LeaveSerializer(serializers.ModelSerializer):
    employee_id = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), source='employee', write_only=True
    )
    employees = EmployeeSerializer(source='employee', read_only=True)
    class Meta:
        model = Leave
        fields = '__all__'
        extra_kwargs = {'employee': {'read_only': True}}