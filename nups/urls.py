from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from django.views.generic import TemplateView
from django.urls import re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views import create_superuser_view, populate_initial_data

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^(?!api/|media/).*$', TemplateView.as_view(template_name="index.html")),
    path("create-superuser/", create_superuser_view),
    path('populate-initial-data/', populate_initial_data, name='populate-initial-data'),

]

# Serve media files from local filesystem (only when not using Cloudinary)
# When using Cloudinary, files are served directly from Cloudinary CDN
if settings.MEDIA_ROOT:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
