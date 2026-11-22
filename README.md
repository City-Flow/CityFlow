# 🌆 CityFlow — Monitor Urbano de Resiliencia (Barcelona)

**CityFlow** es una plataforma Full Stack de análisis de resiliencia urbana para la ciudad de Barcelona. Su objetivo es monitorizar, predecir y alertar sobre el estado de tres ejes fundamentales para la sostenibilidad de la ciudad: **la calidad del aire**, **el consumo de agua** y **la presión turística**.

El sistema combina una API REST robusta (Django + DRF) documentada con **OpenAPI 3.0 / Swagger UI**, una capa de comunicación en tiempo real basada en WebSockets (Django Channels + Redis), tareas asíncronas ETL de ingesta de datos (Celery + Celery Beat) y una interfaz de usuario interactiva en React con diseño adaptativo (Tailwind CSS, Lucide Icons), mapas geoespaciales (Leaflet) y gráficos analíticos (Recharts).


---

## 👥 Equipo de Desarrollo

| Nombre | Rol | LinkedIn | GitHub |
| :--- | :--- | :--- | :--- |
| **Luis Huertas Araya** | Backend & ML Developer | [LinkedIn](https://www.linkedin.com/in/luis-robert-huertas-araya-75b0512ab/l) | [GitHub](https://github.com/Luisroh) |
| **Mio Ogura** | Scrum Master & Developer | [LinkedIn](https://www.linkedin.com/in/mio-ogura) | [GitHub](https://github.com/miaryl) |

---

## 📸 Capturas de Pantalla (Screenshots)


### 🚀 Landing Page `"/"`


<img width="1878" height="939" alt="Screenshot 2026-11-21 134238" src="https://github.com/user-attachments/assets/416675e3-bf29-4cf2-b48a-398b8a088f98" />


### 📊 Dashboard Analítico `/dashboard`


### 📑 Documentación Interactiva de la API (Swagger UI) `localhost:8000/api/docs/`

<img width="719" height="957" alt="Screenshot 2026-11-21 224015" src="https://github.com/user-attachments/assets/7714e885-7ab0-467d-8965-3350ae000a19" />
---

## 🛠️ Tecnologías Utilizadas

### 🔹 Frontend
* **Core:** React 18, Vite
* **Estilos y Componentes UI:** Tailwind CSS, Lucide React Icons
* **Navegación:** React Router DOM (v6)
* **Visualización de Datos:** Recharts (gráficos de series temporales), Leaflet & React-Leaflet (mapas interactivos)
* **Peticiones HTTP & Estado:** Axios, Context API (`AuthContext`)
* **Testing:** Vitest, React Testing Library

### 🔹 Backend
* **Core Framework:** Python 3.11, Django 5
* **API REST & Autenticación:** Django REST Framework (DRF), Simple JWT (Tokens JWT), `django-filter`
* **Documentación OpenAPI:** `drf-spectacular` (Swagger UI & ReDoc)
* **Tiempo Real:** Django Channels 4 (ASGI Server via Daphne)
* **Tareas Asíncronas & Programadas:** Celery, Celery Beat
* **Machine Learning & Análisis:** Scikit-Learn, Pandas, NumPy (Regresión Lineal, Z-Score para anomalías)
* **Testing:** Pytest, Pytest-Django

### 🔹 Base de Datos, Caché e Infraestructura
* **Base de Datos Relacional:** PostgreSQL 15 (Almacenamiento persistente con restricciones avanzadas)
* **Mensajería y Caché:** Redis 7 (Broker de Celery y Channel Layer para WebSockets)
* **Orquestación:** Docker, Docker Compose

---

## 1. Modelo de Datos y Arquitectura de Integridad

El sistema implementa las relaciones y reglas de integridad de base de datos relacional:

* **Relación Uno a Uno (1:1):** 
  * `User` <-> `UserProfile` mediante `OneToOneField` (creación automatizada vía señal `post_save`).
* **Relaciones Uno a Muchos (1:N):** 
  * `District` -> `WeatherRecord`
  * `District` -> `WaterConsumption`
  * `District` -> `WaterPrediction` (Detección de anomalías con ML)
  * `District` -> `AirQuality`
  * `District` -> `AirPrediction` (Predicción analítica de NO₂/PM10)
  * `District` -> `TourismPressure`
  * `District` -> `IncidentReport`
  * `District` -> `Alert` (Persistencia de alertas para WebSockets)
  * `User` -> `IncidentReport`
* **Relación Muchos a Muchos (N:M):** 
  * `IncidentReport` <-> `Tag` mediante `ManyToManyField`.
* **Restricciones de Integridad Avanzadas (`UniqueConstraint`):**
  * Definición explícita en `Meta.constraints` para evitar duplicidad de series temporales por distrito y fecha (`WeatherRecord`, `WaterConsumption`, `WaterPrediction`, `AirQuality`, `TourismPressure` y `Alert`).

> El Diagrama Entidad-Relación (DER) visual y normalizado se encuentra en `docs/DER_CityFlow.pdf`.

---

## 🚀 2. Instalación y Puesta en Marcha

Se contemplan dos flujos de trabajo según el entorno deseado:

### Opción A: Despliegue completo con Docker Compose (Recomendado)

Levanta PostgreSQL, Redis, Django (Daphne), Celery Worker y Celery Beat en contenedores aislados.

1. **Clonar el repositorio y configurar variables de entorno:**
   ```bash
   git clone https://github.com/City-Flow/CityFlow.git
   cd CityFlow
   ```
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   SECRET_KEY=tu-clave-secreta-aqui
   DATABASE_URL=postgres://cityflow_user:cityflow_pass@db:5432/cityflow_db
   REDIS_URL=redis://redis:6379/0
   DJANGO_ENV=dev
   ```

2. **Levantar el ecosistema de contenedores:**
   ```bash
   docker compose up -d --build
   ```

3. **Ejecutar migraciones y sembrar la base de datos (ETL):**
   ```bash
   docker compose exec web python manage.py migrate
   docker compose exec web python manage.py createsuperuser
   docker compose exec web python manage.py seed_districts
   docker compose exec web python manage.py ingest_air
   docker compose exec web python manage.py ingest_water
   docker compose exec web python manage.py ingest_tourism_history
   ```

4. **Arrancar el Frontend (en otra terminal):**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

### Opción B: Desarrollo Local (Backend local + Frontend)

Ideal para desarrollo activo de la API, pruebas rápidas o integración con Swagger sin necesidad de levantar todo el stack de infraestructura.

1. **Configurar el entorno virtual Python:**
   ```bash
   python -m venv .venv
   # En Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # En macOS / Linux:
   source .venv/bin/activate

   pip install -r requirements.txt
   ```

2. **Aplicar migraciones y arrancar el servidor Django:**
   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

3. **Arrancar el Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 🌐 URLs de Acceso

| Servicio / Vista | URL | Descripción |
| :--- | :--- | :--- |
| **Landing Page / Aplicación** | http://localhost:5173 | Interfaz principal en React |
| **Swagger UI (Interactive API)** | http://localhost:8000/api/docs/ | Documentación interactiva de la API |
| **OpenAPI Schema (JSON)** | http://localhost:8000/api/schema/ | Esquema formal OpenAPI 3.0 |
| **API REST (DRF Browsable)** | http://localhost:8000/api/ | Navegador nativo de DRF |
| **Panel de Administración** | http://localhost:8000/admin/ | Gestión de datos Django Admin |
| **WebSocket de Alertas** | `ws://localhost:8000/ws/alerts/` | Canal en tiempo real para eventos |

---

## 📌 Endpoints Principales (API REST)

Toda la especificación interactiva se encuentra disponible y ejecutable en **/api/docs/** (Swagger UI).

| Recurso | Endpoint | Métodos | Descripción |
| :--- | :--- | :--- | :--- |
| **Usuarios** | `/api/users/` | GET, POST, PUT, PATCH, DELETE | Gestión de usuarios y asignación de roles |
| **Perfiles** | `/api/profiles/` | GET, PUT, PATCH | Perfiles extendidos (1:1) asociados al usuario |
| **Distritos** | `/api/districts/` | GET, POST, PUT, PATCH, DELETE | Entidad geográfica maestra con coordenadas lat/lng |
| **Meteorología** | `/api/weather/` | GET, POST, PUT, PATCH, DELETE | Serie temporal de variables atmosféricas |
| **Consumo Agua** | `/api/water-consumption/` | GET, POST, PUT, PATCH, DELETE | Mediciones históricas de consumo hídrico ($m^3$) |
| **Predicción Agua** | `/api/water-predictions/` | GET, POST, PUT, PATCH, DELETE | Estimaciones y flags de anomalías nocturnas |
| **Calidad Aire** | `/api/air-quality/` | GET, POST, PUT, PATCH, DELETE | Lecturas de NO₂ y PM10 con cálculo ICA |
| **Predicción Aire** | `/api/air-predictions/` | GET, POST, PUT, PATCH, DELETE | Proyecciones analíticas de contaminación |
| **Presión Turística** | `/api/tourism-pressure/` | GET, POST, PUT, PATCH, DELETE | Registro acumulado e incremental de HUTs |
| **Incidencias** | `/api/incidents/` | GET, POST, PUT, PATCH, DELETE | Reportes operativos y ciudadanos |
| **Etiquetas** | `/api/tags/` | GET, POST, PUT, PATCH, DELETE | Categorización N:M para incidencias |
| **Alertas** | `/api/alerts/` | GET, POST, PUT, PATCH, DELETE | Registro persistido transmitido vía WebSockets |

---

## 📡 3. Módulos y Pantallas del Sistema

### 🚀 Landing Page (`/`)
* **Vista pública promocional e informativa.**
* Presenta el panel en vivo "Estado de la Ciudad", módulos de resiliencia, arquitectura del pipeline de ingesta y llamada a la acción hacia la plataforma de monitoreo.

### 🌫️ Módulo de Calidad del Aire
* **Fuente:** Open Data BCN (archivos CSV horarios).
* **Funcionalidad:** Evaluación del Índice de Calidad del Aire (ICA) bajo normativa RD 102/2011, predicciones con Regresión Lineal y envío de alertas por WebSocket al superar umbrales normativos.

### 💧 Módulo de Consumo de Agua
* **Fuente:** Àrea Metropolitana de Barcelona (AMB).
* **Funcionalidad:** Serie histórica (1994-2025) ponderada por densidad poblacional por distrito, gráficos de varianza interanual y detección de anomalías con algoritmos Z-Score.

### 🏛️ Módulo de Presión Turística
* **Fuente:** API CKAN de Open Data BCN.
* **Funcionalidad:** Análisis de más de 10.700 Viviendas de Uso Turístico (HUTs), evolución desde 2012 e impacto por barrio.

---

## 🔍 Búsqueda, Filtrado y Ordenación

* **Paginación:** Respuestas paginadas por defecto (10 elementos/página):
  ```http
  GET /api/water-consumption/?page=1
  ```
* **Búsqueda por texto (`SearchFilter`):**
  ```http
  GET /api/districts/?search=Eixample
  GET /api/incidents/?search=fuga
  ```
* **Filtrado Avanzado (`django-filter`):**
  ```http
  GET /api/water-consumption/?district=1&period_date=2026-08-01
  GET /api/alerts/?severity=critical&status=unread
  ```
* **Ordenación (`OrderingFilter`):**
  ```http
  GET /api/water-consumption/?ordering=-consumption_m3
  GET /api/alerts/?ordering=-created_at
  ```

---

## ⚡ WebSockets en Tiempo Real

CityFlow transmite alertas en tiempo real mediante **Django Channels** y la capa de canales en **Redis**:

* **Ruta de conexión:** `ws://localhost:8000/ws/alerts/`
* **Grupo en vivo:** `alerts`
* **Mecanismo:** La creación de registros en la tabla `Alert` dispara una señal (`post_save`) que difunde el payload JSON a todos los clientes WebSocket conectados.

---

## 🧪 Tests Automáticos

### Backend (Pytest)
```bash
docker compose exec web pytest -v
# o localmente:
pytest -v
```
* **16 pruebas unitarias e integrales** que verifican los modelos, serializers, vistas REST, autenticación JWT, algoritmos de detección de anomalías y señales WebSocket.

### Frontend (Vitest)
```bash
cd frontend
npm test
```
* **9 pruebas integradas** que validan el renderizado de gráficos, componentes del dashboard, autenticación y la vista de turismo.

---

## 📂 Estructura del Proyecto

```
CityFlow/
├── cityFlow/                   # Aplicación principal Django
│   ├── data/                   # Archivos de datos de entrenamiento/semilla
│   ├── management/             # Comandos ETL (seed_districts, ingest_air, ingest_water, etc.)
│   ├── migrations/             # Migraciones de base de datos PostgreSQL
│   ├── services/               # Lógica de Machine Learning y despachador de alertas
│   ├── tests/                  # Suite de pruebas unitarias (Pytest)
│   ├── admin.py                # Configuración de Django Admin
│   ├── apps.py                 # Configuración del app cityFlow
│   ├── consumers.py            # Consumidor de WebSockets (Django Channels)
│   ├── models.py               # Modelos relacionales con reglas de integridad
│   ├── routing.py              # Enrutamiento de WebSockets
│   ├── serializers.py          # Serializadores DRF
│   ├── signals.py              # Eventos y emisión de alertas a Redis
│   ├── tasks.py                # Tareas asíncronas de Celery
│   ├── urls.py                 # URLs internas de la app
│   └── views.py                # ViewSets de DRF
├── config/                     # Configuración global del proyecto Django
│   ├── settings/               # Ajustes por entorno (base.py, dev.py, prod.py)
│   ├── asgi.py                 # Punto de entrada ASGI (WebSockets & HTTP)
│   ├── celery.py               # Configuración de Celery & Celery Beat
│   ├── urls.py                 # Rutas raíz (incluye drf-spectacular Swagger)
│   └── wsgi.py                 # Punto de entrada WSGI
├── frontend/                   # Aplicación cliente React
│   ├── src/
│   │   ├── assets/             # Recursos estáticos e imágenes
│   │   ├── components/         # Componentes UI reutilizables (Navbar, MapView, AirChart, etc.)
│   │   ├── context/            # Proveedor de estado global (AuthContext)
│   │   ├── pages/              # Páginas de la aplicación (LandingPage, LoginPage, RegisterPage, etc.)
│   │   ├── services/           # Configuración de Axios para llamadas a la API
│   │   ├── tests/              # Pruebas de componentes React (Vitest)
│   │   ├── views/              # Vistas principales del Dashboard
│   │   ├── App.css             # Estilos globales
│   │   ├── App.jsx             # Componente raíz con enrutamiento de React Router
│   │   ├── index.css           # Configuración de Tailwind CSS
│   │   ├── main.jsx            # Punto de entrada de React DOM
│   │   └── setupTests.jsx      # Configuración de entorno de tests
│   ├── package.json
│   └── vitest.config.js
├── .env                        # Archivo de variables de entorno (no comiteado)
├── .gitignore
├── docker-compose.yml          # Orquestación de servicios (web, db, redis, celery)
├── Dockerfile                  # Construcción del contenedor Backend
├── manage.py                   # Gestor de comandos de Django
├── pytest.ini                  # Configuración de Pytest
├── README.md                   # Documentación principal del proyecto
└── requirements.txt            # Lista de dependencias de Python (incluye drf-spectacular)
```

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Consulta el archivo `LICENSE` para más información.

---

## 🙏 Agradecimientos

* **Open Data BCN** por proveer las fuentes de datos abiertos de calidad del aire y viviendas de uso turístico (HUTs).
* **Àrea Metropolitana de Barcelona (AMB)** por los registros históricos de consumo hídrico.
* **IFCD0112** por la guía académica e instrumental durante el desarrollo del proyecto final.
