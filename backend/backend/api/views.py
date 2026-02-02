from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Employee, Department, Attendance, Payroll
from .serializers import EmployeeSerializer, DepartmentSerializer, AttendanceSerializer, PayrollSerializer

# --- 1. LOGIN LOGIC ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        employee = Employee.objects.get(email=email)
    except Employee.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if employee.user:
        user = authenticate(username=employee.user.username, password=password)
    else:
        return Response({'error': 'Employee not linked to a user'}, status=status.HTTP_400_BAD_REQUEST)
    
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': EmployeeSerializer(employee).data
        })
    else:
        return Response({'error': 'Invalid password'}, status=status.HTTP_401_UNAUTHORIZED)


# --- 2. VIEWSETS ---

class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'employee') and user.employee.is_admin):
            # CHANGED: Sort by '-id' instead of '-created_at' to fix the crash
            return Employee.objects.all().order_by('-id')
        return Employee.objects.filter(user=user)

class DepartmentViewSet(viewsets.ModelViewSet):
    # Added this back so your Employee Form dropdowns work
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

# Inside backend/api/views.py

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'employee') and user.employee.is_admin):
            return Attendance.objects.all().order_by('-date')
        return Attendance.objects.filter(employee__user=user).order_by('-date')

    # This function handles the "Present -> Absent" switch
    def create(self, request, *args, **kwargs):
        employee_id = request.data.get('employee_id')
        date = request.data.get('date')
        status_val = request.data.get('status')
        check_in = request.data.get('check_in')

        # 1. Search for existing record
        existing_record = Attendance.objects.filter(employee_id=employee_id, date=date).first()

        if existing_record:
            # 2. Update it if found
            existing_record.status = status_val
            if check_in:
                existing_record.check_in = check_in
            existing_record.save()
            return Response({"message": "Attendance Updated", "status": status_val})
        else:
            # 3. Create new if not found
            return super().create(request, *args, **kwargs)

class PayrollViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'employee') and user.employee.is_admin):
            return Payroll.objects.all().order_by('-id')
        return Payroll.objects.filter(employee__user=user).order_by('-id')