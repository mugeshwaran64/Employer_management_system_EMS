from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import Employee, Department, Attendance, Leave, Payroll
from .serializers import *

# Authentication View
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Simple check for demo (In real app, use User model auth)
    try:
        employee = Employee.objects.get(email=email)
        # Note: You should hash passwords. For this simple demo we check raw string.
        # Ideally: user = authenticate(username=email, password=password)
        if employee.user and employee.user.check_password(password):
             refresh = RefreshToken.for_user(employee.user)
             return Response({
                 'refresh': str(refresh),
                 'access': str(refresh.access_token),
                 'user': EmployeeSerializer(employee).data
             })
    except Employee.DoesNotExist:
        pass
        
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

# ViewSets
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer