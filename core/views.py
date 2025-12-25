from django.core.mail import send_mail
from rest_framework import viewsets
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Program, Hall, StudentProfile, Wing
from .serializers import ProgramSerializer, HallSerializer, StudentProfileSerializer, WingSerializer
from django.conf import settings

from django.contrib.auth import get_user_model
from django.http import HttpResponse

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from .models import Program, Wing


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [AllowAny]


class HallViewSet(viewsets.ModelViewSet):
    queryset = Hall.objects.all()
    serializer_class = HallSerializer
    permission_classes = [AllowAny]


class StudentViewSet(CreateModelMixin, ListModelMixin, RetrieveModelMixin, GenericViewSet):
    """
    Student profile endpoints:
    - POST /api/students/ - Submit student profile (public)
    - GET /api/students/ - List all students (admin - for retrieving all submissions)
    - GET /api/students/{id}/ - Get single student (admin)
    """
    queryset = StudentProfile.objects.all().order_by('-created_at')  # Newest first
    serializer_class = StudentProfileSerializer

    def get_permissions(self):
        """
        Allow anyone to submit form but require authentication to retrieve student info.
        """
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        # save member profile
        student = serializer.save()
        print("Saved")  # debug line

        # send confirmation email
        if student.email:
            send_mail(
                subject="Membership Registration Confirmation",
                message=f"Dear {student.first_name}, your student profile has been successfully created.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[student.email],
                fail_silently=False
            )




class WingViewSet(viewsets.ModelViewSet):
    queryset = Wing.objects.all()
    serializer_class = WingSerializer
    permission_classes = [AllowAny]




def create_superuser_view(request):
    User = get_user_model()

    username = "nupsadmin"
    email = "admin@nups.com"
    password = "easypassword123!"

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        return HttpResponse("Superuser created successfully!")
    return HttpResponse("Superuser already exists.")





# Predefined data
PROGRAMS = [
    "B. A. Arabic Education",
    "B. A. English Education",
    "B. A. French Education",
    "B. A. French with English Education",
    "B. A. Social Studies with Economics Education",
    "B.Ed. Early Grade (Early Childhood)",
    "B. Sc. Fashion Design and Textiles Education",
    "B. Sc. Catering and Hospitality Education",
    "B. B. A. Secretarial Education",
    "B. Sc. Management Education",
    "B. Sc. Marketing",
    "B. B. A. Executive Office Administration",
    "B. Sc. Marketing and Entrepreneurship",
    "B.B.A. Human Resource Management",
    "B. Sc. Economics with Social Studies Education",
    "B. Sc. Economics Education",
    "B. Sc. Accounting Education",
    "B. Sc. Admin Accounting",
    "B. Sc. Procurement and Supply Chain Management",
    "B. Sc. Banking and Finance",
    "B. Sc. Business Information Systems",
    "B. Sc. Mathematics Education",
    "B. Sc. Information Technology Education",
    "B.Sc. Information Technology",
    "B.Sc. Cybersecurity and Digital Forensics",
    "B. Sc. Automotive Engineering Technology Education",
    "B. Sc. Mechanical Engineering Technology Education",
    "B.Sc. Construction Technology and Management with Education",
    "B.Sc. Welding and Fabrication Engineering Technology Education",
    "B.Sc. Plumbing, Gas and Sanitary Technology",
    "B.Sc Civil Engineering",
    "B.Sc. Wood Technology with Education",
    "B. Sc. Electrical and Electronics Engineering Technology Education",
    "B.Sc. Mechanical Engineering Technology",
    "B.Sc. Electrical and Electronics Engineering",
    "2-year Post-Diploma in Construction Technology",
    "2-year Post-Diploma in Automotive Engineering Technology",
    "2-year Post-Diploma in Electrical and Electronics Engineering Technology",
    "2-year Diploma in Wood Technology",
    "2-year Diploma Business Admin Accounting",
    "Diploma in Human Resource Management",
    "Diploma in Office Management and Computer Applications",
    "2-year Diploma Business Admin Management",
]

WINGS = [
    "Organizing",
    "Prayer Wing",
    "Bible Studies Wing",
    "Coordinating Wing",
    "Ushering",
    "Evangelism Wing",
    "Inspirers",
    "Choir",
    "Ladies Wing",
    "Vessels of Inspiration",
]

@api_view(['POST'])
@permission_classes([AllowAny])
def populate_initial_data(request):
    # Programs
    created_programs = []
    for program_name in PROGRAMS:
        obj, created = Program.objects.create(name=program_name)
        if created:
            created_programs.append(program_name)

    # Wings
    created_wings = []
    for wing_name in WINGS:
        obj, created = Wing.objects.create(name=wing_name)
        if created:
            created_wings.append(wing_name)

    return JsonResponse({
        "programs_created": created_programs,
        "wings_created": created_wings,
        "message": "Initial data population complete."
    })




