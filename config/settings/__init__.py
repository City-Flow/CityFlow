import os

# Por defecto, usamos el entorno de desarrollo
environment = os.getenv("DJANGO_ENV", "dev")

if environment == "prod":
    from .prod import *
else:
    from .dev import *