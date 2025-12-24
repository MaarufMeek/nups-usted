import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from decouple import Config, RepositoryEnv

# ---------------------------
# Base Directory
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------
# Environment Configuration
# ---------------------------
# Paths for secret files
RENDER_ENV_PATH = '/etc/secrets/.env'
LOCAL_ENV_PATH = BASE_DIR / '.env'

if Path(RENDER_ENV_PATH).exists():
    env_config = Config(RepositoryEnv(RENDER_ENV_PATH))
else:
    env_config = Config(RepositoryEnv(LOCAL_ENV_PATH))

# ---------------------------
# Security
# ---------------------------
SECRET_KEY = env_config('SECRET_KEY')
DEBUG = env_config('DEBUG', cast=bool)
ALLOWED_HOSTS = env_config('ALLOWED_HOSTS', default='localhost,127.0.0.1',
                           cast=lambda v: [s.strip() for s in v.split(',')])

# ---------------------------
# Installed Apps
# ---------------------------
INSTALLED_APPS = [
    # Django default apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

    # Your apps
    'core.apps.CoreConfig',
]

# ---------------------------
# Middleware
# ---------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ---------------------------
# URLs & WSGI
# ---------------------------
ROOT_URLCONF = 'nups.urls'
WSGI_APPLICATION = 'nups.wsgi.application'

# ---------------------------
# Templates
# ---------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ---------------------------
# Database
# ---------------------------
DATABASES = {
    'default': dj_database_url.config(
        'DATABASE_URL',
        default='postgres://postgres:%40nasarabieni@localhost:5432/nups_db',
        conn_max_age=600
    )
}

# ---------------------------
# Password Validation
# ---------------------------
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------
# REST Framework & JWT
# ---------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=env_config('ACCESS_TOKEN_LIFETIME_MINUTES', cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=env_config('REFRESH_TOKEN_LIFETIME_DAYS', cast=int)),
    'ROTATE_REFRESH_TOKENS': env_config('ROTATE_REFRESH_TOKENS', cast=bool),
}

# ---------------------------
# CORS Configuration
# ---------------------------
CORS_ALLOWED_ORIGINS = env_config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:5173',
    cast=lambda v: [s.strip() for s in v.split(',')]
)
CORS_ALLOW_ALL_ORIGINS = env_config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# ---------------------------
# Email
# ---------------------------
EMAIL_BACKEND = env_config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
EMAIL_HOST = env_config('EMAIL_HOST', default='')
EMAIL_PORT = env_config('EMAIL_PORT', cast=int, default=587)
EMAIL_USE_TLS = env_config('EMAIL_USE_TLS', cast=bool, default=True)
EMAIL_HOST_USER = env_config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env_config('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = env_config('DEFAULT_FROM_EMAIL', default='noreply@example.com')

# ---------------------------
# Internationalization
# ---------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ---------------------------
# Static & Media Files
# ---------------------------
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

if not DEBUG:
    # Tell Django to copy static assets into a path called `staticfiles` (this is specific to Render)
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

    # Enable the WhiteNoise storage backend, which compresses static files to reduce disk use
    # and renames the files with unique names for each version to support long-term caching
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
