import os
import json
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
LOCAL_ENV_PATH = BASE_DIR / '.env'

env_config = None
if LOCAL_ENV_PATH.exists():
    env_config = Config(RepositoryEnv(LOCAL_ENV_PATH))

def get_env(key, default=None, cast=None):
    """
    Priority:
    1. Environment variables (Render / system)
    2. Local .env file (if exists)
    3. Default
    Cast is always applied if provided
    """
    value = os.environ.get(key)
    if value is None and env_config:
        value = env_config(key, default=default)
    if value is None:
        value = default
    if cast:
        return cast(value)
    return value

# ---------------------------
# Security
# ---------------------------
SECRET_KEY = get_env("SECRET_KEY", "dev-secret-key")

DEBUG = get_env("DEBUG", False, cast=lambda v: str(v).lower() == "true")

# ALLOWED_HOSTS: use JSON format in Render, e.g. ["myapp.onrender.com"]
ALLOWED_HOSTS = get_env(
    "ALLOWED_HOSTS",
    '["localhost","127.0.0.1"]',
    cast=lambda v: json.loads(v) if isinstance(v, str) else v
)

# ---------------------------
# Installed Apps
# ---------------------------
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',

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
        default=get_env(
            "DATABASE_URL",
            "postgres://postgres:%40nasarabieni@localhost:5432/nups_db"
        ),
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
    'ACCESS_TOKEN_LIFETIME': timedelta(
        minutes=int(get_env("ACCESS_TOKEN_LIFETIME_MINUTES", 60))
    ),
    'REFRESH_TOKEN_LIFETIME': timedelta(
        days=int(get_env("REFRESH_TOKEN_LIFETIME_DAYS", 1))
    ),
    'ROTATE_REFRESH_TOKENS': get_env("ROTATE_REFRESH_TOKENS", False, cast=bool),
}

# ---------------------------
# CORS Configuration
# ---------------------------
CORS_ALLOWED_ORIGINS = get_env(
    "CORS_ALLOWED_ORIGINS",
    default='["http://localhost:3000","http://localhost:5173"]',
    cast=lambda v: json.loads(v) if isinstance(v, str) else v
)

CORS_ALLOW_ALL_ORIGINS = get_env("CORS_ALLOW_ALL_ORIGINS", False, cast=bool)
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
EMAIL_BACKEND = get_env(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend"
)

EMAIL_HOST = get_env("EMAIL_HOST", "")
EMAIL_PORT = int(get_env("EMAIL_PORT", 587))
EMAIL_USE_TLS = get_env("EMAIL_USE_TLS", True, cast=bool)
EMAIL_HOST_USER = get_env("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = get_env("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = get_env("DEFAULT_FROM_EMAIL", "noreply@example.com")

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
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STATICFILES_STORAGE = (
    'whitenoise.storage.CompressedManifestStaticFilesStorage'
    if not DEBUG else 'django.contrib.staticfiles.storage.StaticFilesStorage'
)

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
