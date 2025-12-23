from rest_framework.routers import DefaultRouter
from .views import StudentViewSet, ProgramViewSet, HallViewSet, WingViewSet

router = DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'programs', ProgramViewSet)
router.register(r'halls', HallViewSet)
router.register(r'wings', WingViewSet)

urlpatterns = router.urls
