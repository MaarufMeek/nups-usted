from django.core.mail import send_mail
from rest_framework import viewsets
from rest_framework.mixins import CreateModelMixin, ListModelMixin, RetrieveModelMixin
from rest_framework.viewsets import GenericViewSet
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Program, Hall, StudentProfile, Wing
from .serializers import ProgramSerializer, HallSerializer, StudentProfileSerializer, WingSerializer
from django.conf import settings


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


