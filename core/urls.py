from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import StudentViewSet, ProgramViewSet, HallViewSet, WingViewSet, health_check, backup_database

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'halls', HallViewSet)
router.register(r'wings', WingViewSet)

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('backup/', backup_database, name='backup_database'),
] + router.urls
