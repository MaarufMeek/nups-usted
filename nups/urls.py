from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views import create_superuser_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("create-superuser/", create_superuser_view),
    # path('populate-initial-data/', populate_initial_data, name='populate-initial-data'),
    # Health check endpoint for keeping service awake (ping this every 10-14 minutes)
    path('health/', lambda request: JsonResponse({
        'status': 'healthy',
        'service': 'NUPS API',
        'timestamp': __import__('datetime').datetime.now().isoformat(),
        'message': 'Service is running'
    }), name='health'),
    # Root URL - return simple API info (frontend is served separately on Render)
    path('', lambda request: JsonResponse({
        'message': 'NUPS API',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'health': '/health/'
        }
    }), name='root'),
]

# Serve media files from local filesystem (only when not using Cloudinary)
# When using Cloudinary, files are served directly from Cloudinary CDN
if settings.MEDIA_ROOT:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
