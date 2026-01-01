import json
import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from decouple import Config, RepositoryEnv

# --------------------------------------------------
# Base Directory
# --------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# --------------------------------------------------
# Load .env if it exists (LOCAL ONLY)
# --------------------------------------------------
ENV_PATH = BASE_DIR / ".env"
env = Config(RepositoryEnv(ENV_PATH)) if ENV_PATH.exists() else None


def get_env(key, default=None, cast=None):
    if key in os.environ:
        value = os.environ.get(key)
    elif env:
        value = env(key, default=default)
    else:
        value = default

    if cast and value is not None:
        # Special handling for bool to properly convert string "true"/"false"
        if cast == bool:
            if isinstance(value, str):
                return value.lower() in ('true', '1', 'yes', 'on')
            return bool(value)
        return cast(value)
    return value


# --------------------------------------------------
# Security
# --------------------------------------------------
SECRET_KEY = get_env("SECRET_KEY", "dev-secret-key")

DEBUG = get_env(
    "DEBUG",
    False,
    cast=lambda v: str(v).lower() == "true"
)

ALLOWED_HOSTS = json.loads(
    get_env(
        "ALLOWED_HOSTS",
        '["localhost", "127.0.0.1"]'
    )
)

# --------------------------------------------------
# Installed Apps
# --------------------------------------------------
# Base installed apps (always needed)
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",

    "core.apps.CoreConfig",
]

# Add Cloudinary apps only if Cloudinary is enabled
# Check early to avoid import errors when USE_CLOUDINARY is False
USE_CLOUDINARY = get_env("USE_CLOUDINARY", False, cast=bool)
# Print to stdout (will show in logs even if logging not configured)
print(f"[SETTINGS] USE_CLOUDINARY = {USE_CLOUDINARY} (type: {type(USE_CLOUDINARY)})")
print(f"[SETTINGS] USE_CLOUDINARY env value: {os.environ.get('USE_CLOUDINARY', 'NOT SET')}")

if USE_CLOUDINARY:
    INSTALLED_APPS.insert(-1, "cloudinary_storage")  # Insert before core app
    INSTALLED_APPS.insert(-1, "cloudinary")
    print("[SETTINGS] Cloudinary apps added to INSTALLED_APPS")
else:
    print("[SETTINGS] Cloudinary NOT enabled - using local storage")

# --------------------------------------------------
# Middleware
# --------------------------------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# --------------------------------------------------
# URLs & WSGI / ASGI
# --------------------------------------------------
ROOT_URLCONF = "nups.urls"
WSGI_APPLICATION = "nups.wsgi.application"
ASGI_APPLICATION = "nups.asgi.application"

# --------------------------------------------------
# Templates
# --------------------------------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "frontend" / "nups" / "dist"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# --------------------------------------------------
# Database
# --------------------------------------------------
DATABASES = {
    "default": dj_database_url.config(
        default=get_env(
            "DATABASE_URL",
            "postgres://postgres:postgres@localhost:5432/nups_db"
        ),
    )
}

# --------------------------------------------------
# Password Validation
# --------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------
# REST Framework & JWT
# --------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=int(get_env("ACCESS_TOKEN_LIFETIME_MINUTES", 60))
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=int(get_env("REFRESH_TOKEN_LIFETIME_DAYS", 1))
    ),
    "ROTATE_REFRESH_TOKENS": get_env("ROTATE_REFRESH_TOKENS", False, cast=bool),
}

# --------------------------------------------------
# CORS
# --------------------------------------------------
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://nups-registration.onrender.com",


]

CORS_ALLOW_ALL_ORIGINS = get_env("CORS_ALLOW_ALL_ORIGINS", False, cast=bool)
CORS_ALLOW_CREDENTIALS = True

# --------------------------------------------------
# Email (Dev Safe)
# --------------------------------------------------
EMAIL_BACKEND = get_env(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)

# --------------------------------------------------
# Internationalization
# --------------------------------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# --------------------------------------------------
# Static & Media
# --------------------------------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
    if not DEBUG
    else "django.contrib.staticfiles.storage.StaticFilesStorage"
)

STATICFILES_DIRS = [
    BASE_DIR / "frontend" / "nups" / "dist" / "assets",  # Vite puts JS/CSS/images in assets
]


# Media files configuration
# Use Cloudinary in production (Render), local filesystem in development
# Note: USE_CLOUDINARY is already set above when configuring INSTALLED_APPS
if USE_CLOUDINARY:
    # Cloudinary storage for production (persistent, survives deployments)

    cloud_name = get_env('CLOUDINARY_CLOUD_NAME', '')
    api_key = get_env('CLOUDINARY_API_KEY', '')
    api_secret = get_env('CLOUDINARY_API_SECRET', '')
    
    # Log Cloudinary config (without secrets)
    import logging
    logger = logging.getLogger(__name__)
    logger.info(f"Cloudinary enabled. Cloud name: {cloud_name}, API key set: {bool(api_key)}")
    
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': cloud_name,
        'API_KEY': api_key,
        'API_SECRET': api_secret,
    }
    
    # Configure Cloudinary storage
    from cloudinary_storage.storage import MediaCloudinaryStorage
    DEFAULT_FILE_STORAGE = MediaCloudinaryStorage
    MEDIA_URL = '/media/'
    # MEDIA_ROOT can be None when using Cloudinary, but set a dummy path to avoid errors
    MEDIA_ROOT = BASE_DIR / "media"  # Keep this for compatibility, Cloudinary will handle actual storage
    
    print(f"[SETTINGS] DEFAULT_FILE_STORAGE set to: {DEFAULT_FILE_STORAGE}")
    print(f"[SETTINGS] DEFAULT_FILE_STORAGE class: {type(DEFAULT_FILE_STORAGE)}")
    logger.info(f"Cloudinary enabled. Cloud name: {cloud_name}, API key set: {bool(api_key)}")
    logger.info(f"DEFAULT_FILE_STORAGE set to: {DEFAULT_FILE_STORAGE}")
else:
    # Local filesystem storage for development
    MEDIA_URL = "/media/"
    MEDIA_ROOT = BASE_DIR / "media"


# --------------------------------------------------
# Logging
# --------------------------------------------------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'core': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
