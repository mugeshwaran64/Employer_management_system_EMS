"""
Django settings for backend project.
"""

from pathlib import Path
import os
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# --- 1. SECURITY SETTINGS ---
# SECURITY WARNING: keep the secret key used in production secret!
# (Ideally, use an environment variable for this on Render)
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-(j@p9^-231ijh^prmktaahfi5)q=nmgkp!uby*+o@ez%+kcw=r')

# SECURITY WARNING: don't run with debug turned on in production!
# This automatically turns off Debug mode when you are on Render
DEBUG = 'RENDER' not in os.environ

ALLOWED_HOSTS = ['*']  # Allows Render to host your app


# --- 2. APPLICATIONS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'api',
]

# --- 3. MIDDLEWARE (Order is Crucial) ---
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Step 1: Static Files (Must be here)
    
    'corsheaders.middleware.CorsMiddleware',       # Step 2: CORS (Must be here)
    
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

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

WSGI_APPLICATION = 'backend.wsgi.application'


# --- 4. DATABASE (Auto-switches between SQLite and PostgreSQL) ---
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3', # Uses SQLite locally
        conn_max_age=600
    )
}


# --- 5. PASSWORD VALIDATION ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


# --- 6. INTERNATIONALIZATION ---
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# --- 7. STATIC FILES (WhiteNoise Configuration) ---
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


# --- 8. CORS (Allow Frontend to talk to Backend) ---
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Your Local Frontend
    # "https://your-project-name.vercel.app",  <-- UNCOMMENT & ADD THIS AFTER DEPLOYING FRONTEND
]

# While testing deployment, you can allow all (Optional, safe for now)
CORS_ALLOW_ALL_ORIGINS = True 


# --- 9. DRF & JWT SETTINGS ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
}