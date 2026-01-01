from rest_framework.routers import DefaultRouter
from django.urls import path

from . import admin
from .views import StudentViewSet, ProgramViewSet, HallViewSet, WingViewSet, health_check, backup_database, \
    get_user_info

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'halls', HallViewSet)
router.register(r'wings', WingViewSet)


urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('backup/', backup_database, name='backup_database'),
    path('user-info/', get_user_info, name='user-info'),
] + router.urls
