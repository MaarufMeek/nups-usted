import os
import json
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


MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
