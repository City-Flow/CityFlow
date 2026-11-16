from .base import *

DEBUG = False
ALLOWED_HOSTS = ["tudominio.com", "www.tudominio.com"]

# --- SEGURIDAD ---
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# --- BASE DE DATOS ---
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {'default': dj_database_url.config(default=DATABASE_URL)}
else:
    # Si no hay URL, error (en producción no debería caer a SQLite)
    raise ValueError("DATABASE_URL no está definida. Es obligatoria en producción.")

# --- CORS ---
CORS_ALLOWED_ORIGINS = [
    "https://tudominio.com",
    "https://www.tudominio.com",
]