from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Employee, Department, Attendance, Payroll
from .serializers import EmployeeSerializer, DepartmentSerializer, AttendanceSerializer, PayrollSerializer
from django.http import JsonResponse
from django.contrib.auth.models import User

# --- 1. LOGIN LOGIC ---
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    # FIX: Frontend sends 'username', so we look for that OR 'email'
    email = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Find employee by email (which is passed as 'username' from frontend)
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
            return Employee.objects.all().order_by('-id')
        return Employee.objects.filter(user=user)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class AttendanceViewSet(viewsets.ModelViewSet):
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'employee') and user.employee.is_admin):
            return Attendance.objects.all().order_by('-date')
        return Attendance.objects.filter(employee__user=user).order_by('-date')

    def create(self, request, *args, **kwargs):
        employee_id = request.data.get('employee_id')
        date = request.data.get('date')
        status_val = request.data.get('status')
        check_in = request.data.get('check_in')

        existing_record = Attendance.objects.filter(employee_id=employee_id, date=date).first()

        if existing_record:
            existing_record.status = status_val
            if check_in:
                existing_record.check_in = check_in
            existing_record.save()
            return Response({"message": "Attendance Updated", "status": status_val})
        else:
            return super().create(request, *args, **kwargs)

class PayrollViewSet(viewsets.ModelViewSet):
    serializer_class = PayrollSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or (hasattr(user, 'employee') and user.employee.is_admin):
            return Payroll.objects.all().order_by('-id')
        return Payroll.objects.filter(employee__user=user).order_by('-id')

# --- 3. REPAIR SCRIPT ---
# --- REPLACE THE BOTTOM FUNCTION IN views.py WITH THIS ---
#AGAIN REPLACED
def fix_admin_access(request):
    try:
        # 1. NUCLEAR CLEANUP: Delete BOTH User and Employee to prevent "Zombie" data
        User.objects.filter(username="admin@gmail.com").delete()
        Employee.objects.filter(email="admin@gmail.com").delete() # <--- THIS IS THE FIX
        
        # 2. Create New Superuser
        u = User.objects.create_superuser("admin@gmail.com", "admin@gmail.com", "admin")
        
        # 3. Ensure Department exists
        d, _ = Department.objects.get_or_create(name="IT")
        
        # 4. Create Fresh Employee Profile linked to the new User
        Employee.objects.create(
            user=u, 
            first_name="Admin", 
            last_name="User", 
            email="admin@gmail.com", 
            employee_code="ADM001", 
            department=d, 
            role="Manager", 
            position="Admin", 
            salary=50000, 
            status="active", 
            is_admin=True
        )
            
        return JsonResponse({"message": "SUCCESS! Admin reset. Database cleaned. Login with: admin@gmail.com / admin"})
    except Exception as e:
        return JsonResponse({"error": str(e)})