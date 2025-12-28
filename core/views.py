import logging
from rest_framework import viewsets, status
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Program, Hall, StudentProfile, Wing
from .serializers import ProgramSerializer, HallSerializer, StudentProfileSerializer, WingSerializer

logger = logging.getLogger(__name__)

from django.contrib.auth import get_user_model
from django.http import HttpResponse, JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Program, Wing
from django.utils import timezone
from datetime import datetime


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

    def create(self, request, *args, **kwargs):
        """Override create to add detailed error logging"""
        try:
            logger.info(f"Creating student profile. Data keys: {list(request.data.keys())}")
            logger.info(f"Has file: {'id_picture' in request.FILES}")
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            
            logger.info("Serializer is valid, saving...")
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Student profile created successfully: {serializer.data.get('id')}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            
        except Exception as e:
            logger.error(f"Error creating student profile: {str(e)}", exc_info=True)
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return Response(
                {'error': str(e), 'detail': 'Failed to create student profile'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        # save member profile
        try:
            logger.info("Saving student profile...")
            student = serializer.save()
            logger.info(f"Student profile saved successfully. ID: {student.id}, Email: {student.email}")
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}", exc_info=True)
            raise  # Re-raise to be caught by create() method




class WingViewSet(viewsets.ModelViewSet):
    queryset = Wing.objects.all()
    serializer_class = WingSerializer
    permission_classes = [AllowAny]




# def create_superuser_view(request):
#     User = get_user_model()
#
#     username = "nupsadmin"
#     email = "admin@nups.com"
#     password = "easypassword123!"
#
#     if not User.objects.filter(username=username).exists():
#         User.objects.create_superuser(username=username, email=email, password=password)
#         return HttpResponse("Superuser created successfully!")
#     return HttpResponse("Superuser already exists.")



# Predefined data
# PROGRAMS = [
#     "B. A. Arabic Education",
#     "B. A. English Education",
#     "B. A. French Education",
#     "B. A. French with English Education",
#     "B. A. Social Studies with Economics Education",
#     "B.Ed. Early Grade (Early Childhood)",
#     "B. Sc. Fashion Design and Textiles Education",
#     "B. Sc. Catering and Hospitality Education",
#     "B. B. A. Secretarial Education",
#     "B. Sc. Management Education",
#     "B. Sc. Marketing",
#     "B. B. A. Executive Office Administration",
#     "B. Sc. Marketing and Entrepreneurship",
#     "B.B.A. Human Resource Management",
#     "B. Sc. Economics with Social Studies Education",
#     "B. Sc. Economics Education",
#     "B. Sc. Accounting Education",
#     "B. Sc. Admin Accounting",
#     "B. Sc. Procurement and Supply Chain Management",
#     "B. Sc. Banking and Finance",
#     "B. Sc. Business Information Systems",
#     "B. Sc. Mathematics Education",
#     "B. Sc. Information Technology Education",
#     "B.Sc. Information Technology",
#     "B.Sc. Cybersecurity and Digital Forensics",
#     "B. Sc. Automotive Engineering Technology Education",
#     "B. Sc. Mechanical Engineering Technology Education",
#     "B.Sc. Construction Technology and Management with Education",
#     "B.Sc. Welding and Fabrication Engineering Technology Education",
#     "B.Sc. Plumbing, Gas and Sanitary Technology",
#     "B.Sc Civil Engineering",
#     "B.Sc. Wood Technology with Education",
#     "B. Sc. Electrical and Electronics Engineering Technology Education",
#     "B.Sc. Mechanical Engineering Technology",
#     "B.Sc. Electrical and Electronics Engineering",
#     "2-year Post-Diploma in Construction Technology",
#     "2-year Post-Diploma in Automotive Engineering Technology",
#     "2-year Post-Diploma in Electrical and Electronics Engineering Technology",
#     "2-year Diploma in Wood Technology",
#     "2-year Diploma Business Admin Accounting",
#     "Diploma in Human Resource Management",
#     "Diploma in Office Management and Computer Applications",
#     "2-year Diploma Business Admin Management",
# ]


# @api_view(['GET', 'POST'])
# @permission_classes([AllowAny])
# def populate_initial_data(request):
#     # Programs
#     created_programs = []
#     for program_name in PROGRAMS:
#         obj, created = Program.objects.get_or_create(name=program_name)
#         if created:
#             created_programs.append(program_name)
#
#     # Wings
#     created_wings = []
#     for wing_name in WINGS:
#         obj, created = Wing.objects.get_or_create(name=wing_name)
#         if created:
#             created_wings.append(wing_name)
#
#     return JsonResponse({
#         "programs_created": created_programs,
#         "wings_created": created_wings,
#         "message": "Initial data population complete."
#     })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint to keep Render service awake.
    To be pinged by external service UptimeRobot
    every 5 minutes to prevent the service from sleeping.
    """
    return Response({
        'status': 'healthy',
        'service': 'NUPS API',
        'timestamp': timezone.now().isoformat(),
        'message': 'Service is running'
    }, status=200)




