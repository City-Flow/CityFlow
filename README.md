# 🌆 CityFlow — Monitor Urbano de Resiliencia (Barcelona)

**CityFlow** es una plataforma Full Stack de análisis de resiliencia urbana para la ciudad de Barcelona. Su objetivo es monitorizar, predecir y alertar sobre el estado de tres ejes fundamentales para la sostenibilidad de la ciudad: **la calidad del aire**, **el consumo de agua** y **la presión turística**. 

El sistema combina una API REST robusta (Django + DRF), una capa de tiempo real basada en WebSockets (Django Channels + Redis), tareas asíncronas de ingesta de datos (Celery) y un dashboard interactivo en React con mapas geoespaciales (Leaflet) y gráficos analíticos (Recharts).

*Proyecto correspondiente al módulo formativo **IFCD0112 - POO y Bases de Datos Relacionales - Full Stack** (Hito 2).*

---

## 👥 Equipo de Desarrollo

| Nombre | Rol | LinkedIn | GitHub |
| :--- | :--- | :--- | :--- |
| **Luis Huertas Araya** | Backend & ML Developer | [LinkedIn](https://www.linkedin.com/in/luis-robert-huertas-araya-75b0512ab/l) | [GitHub](https://github.com/Luisroh) |
| **Mio Ogura** | Scrum Master & Developer | [LinkedIn](https://www.linkedin.com/in/mio-ogura) | [GitHub](https://github.com/miaryl) |

---

## 1. Modelo de Datos y Arquitectura de Integridad

El sistema implementa las relaciones y reglas de integridad solicitadas en el diseño de la base de datos:

* **Relación Uno a Uno (1:1):** 
  * User <-> UserProfile mediante OneToOneField (creación automatizada vía post_save signal).
* **Relaciones Uno a Muchos (1:N):** 
  * District -> WeatherRecord
  * District -> WaterConsumption
  * District -> WaterPrediction (Detección de anomalías con ML)
  * District -> AirQuality
  * District -> AirPrediction (Predicción analítica de NO2/PM10)
  * District -> TourismPressure
  * District -> IncidentReport
  * District -> Alert (Persistencia de alertas para WebSockets)
  * User -> IncidentReport
* **Relación Muchos a Muchos (N:M):** 
  * IncidentReport <-> Tag mediante ManyToManyField.
* **Restricciones de Integridad Avanzadas (UniqueConstraint):**
  * Uso de UniqueConstraint en Meta.constraints para evitar registros duplicados por distrito y fecha en tablas de series temporales (WeatherRecord, WaterConsumption, WaterPrediction, AirQuality, TourismPressure y Alert).

> El Diagrama Entidad-Relación (DER) visual y normalizado se encuentra disponible en la ruta docs/DER_CityFlow.pdf.

---

## 2. 🏗️ Arquitectura del Sistema

El proyecto está construido con una arquitectura de microservicios orquestada con **Docker Compose**, permitiendo levantar todo el ecosistema con un solo comando. Los servicios son:

* **Frontend:** React + Vite + Leaflet + Recharts (Puerto 5173).
* **Backend:** Django + Django REST Framework + Daphne (ASGI) (Puerto 8000).
* **Base de Datos:** PostgreSQL 15 (almacenamiento relacional persistente).
* **Mensajería y Caché:** Redis 7 (Broker de Celery y Channel Layer para WebSockets).
* **Worker y Beat:** Celery (Ejecución de tareas ETL en segundo plano: ingesta horaria de aire y diaria de turismo).
* **APIs Externas:** Open Data BCN (Aire y HUTs), Àrea Metropolitana de Barcelona (Agua).

### 🛠️ Tecnologías utilizadas
| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | React, Vite, TailwindCSS, Leaflet, Recharts, Axios, React Router |
| **Backend** | Django, Django REST Framework, Django Channels (ASGI), Simple JWT |
| **Base de Datos** | PostgreSQL 15 |
| **Mensajería / Tareas** | Redis 7, Celery 5, Celery Beat |
| **Machine Learning** | Scikit-Learn, Pandas, Numpy (Z-Score, Regresión Lineal) |
| **Infraestructura** | Docker, Docker Compose |
| **Testing** | Pytest + Pytest-Django (Backend), Vitest + React Testing Library (Frontend) |

---

## 3. Requisitos Previos

* Docker Desktop (con WSL2 en Windows).
* Node.js (v18 o superior) y npm.
* Git.

---

## 4. Instalación y Puesta en Marcha

1. **Clonar el repositorio:**

    git clone https://github.com/City-Flow/CityFlow.git
    cd CityFlow

2. **Crear el archivo .env en la raíz del proyecto** con las variables de entorno:

    SECRET_KEY=tu-clave-secreta-aqui
    DATABASE_URL=postgres://cityflow_user:cityflow_pass@db:5432/cityflow_db
    REDIS_URL=redis://redis:6379/0
    DJANGO_ENV=dev

3. **Levantar el ecosistema Docker:**

    docker compose up -d --build

4. **Aplicar migraciones y crear el superusuario:**

    docker compose exec web python manage.py migrate
    docker compose exec web python manage.py createsuperuser

5. **Sembrar los datos (Scripts ETL):**

    # Crear los 10 distritos de Barcelona
    docker compose exec web python manage.py seed_districts

    # Cargar el histórico de calidad del aire (29 CSVs)
    docker compose exec web python manage.py ingest_air

    # Cargar la serie histórica de consumo de agua (AMB)
    docker compose exec web python manage.py ingest_water

    # Cargar el histórico de HUTs (API CKAN)
    docker compose exec web python manage.py ingest_tourism_history

6. **Arrancar el frontend:**

    cd frontend
    npm install
    npm run dev

### 🌐 URLs de acceso
| Servicio | URL |
| :--- | :--- |
| **Dashboard Frontend** | http://localhost:5173 |
| **API REST (Browsable)** | http://localhost:8000/api/ |
| **Panel de Administración** | http://localhost:8000/admin/ |
| **WebSocket de Alertas** | ws://localhost:8000/ws/alerts/ |

---

## 5. Endpoints Principales

| Recurso | Endpoint | Métodos Permitidos | Descripción |
| :--- | :--- | :--- | :--- |
| **Usuarios** | /api/users/ | GET, POST, PUT, PATCH, DELETE | Gestión de usuarios y roles con contraseñas cifradas |
| **Perfiles** | /api/profiles/ | GET, PUT, PATCH | Perfiles 1:1 asociados a los usuarios |
| **Distritos** | /api/districts/ | GET, POST, PUT, PATCH, DELETE | Entidad maestra con coordenadas para mapas |
| **Meteorología** | /api/weather/ | GET, POST, PUT, PATCH, DELETE | Registros climáticos históricos |
| **Consumo de Agua** | /api/water-consumption/ | GET, POST, PUT, PATCH, DELETE | Mediciones de consumo hídrico (m3) |
| **Predicción de Agua** | /api/water-predictions/ | GET, POST, PUT, PATCH, DELETE | Estimaciones y detección de anomalías |
| **Calidad del Aire** | /api/air-quality/ | GET, POST, PUT, PATCH, DELETE | Mediciones de contaminantes (NO2 y PM10) |
| **Predicción de Aire** | /api/air-predictions/ | GET, POST, PUT, PATCH, DELETE | Proyecciones y pronósticos de polución |
| **Presión Turística** | /api/tourism-pressure/ | GET, POST, PUT, PATCH, DELETE | Viviendas de uso turístico (HUT) y ruido |
| **Incidencias** | /api/incidents/ | GET, POST, PUT, PATCH, DELETE | Reportes ciudadanos y operativos |
| **Etiquetas** | /api/tags/ | GET, POST, PUT, PATCH, DELETE | Categorización de incidencias |
| **Alertas** | /api/alerts/ | GET, POST, PUT, PATCH, DELETE | Registro persistido de alertas |

---

## 6. 📡 Módulos del Dashboard

El frontend cuenta con cuatro pestañas principales, cada una con su lógica de negocio:

### 🌫️ Módulo de Calidad del Aire
* **Fuente:** Open Data BCN (CSV horario).
* **Datos:** +4.000 días de histórico, predicciones con Regresión Lineal e Índice de Calidad del Aire (ICA) según RD 102/2011.
* **Tiempo Real:** Las alertas críticas se envían por WebSocket automáticamente.
* **ETL:** Se actualiza cada hora mediante Celery Beat.

### 💧 Módulo de Consumo de Agua
* **Fuente:** Àrea Metropolitana de Barcelona (AMB).
* **Datos:** Serie histórica 1994-2025 distribuida proporcionalmente por población en los 10 distritos.
* **Análisis:** Gráfico de evolución anual y cálculo de varianza interanual.

### 🏛️ Módulo de Presión Turística
* **Fuente:** API CKAN de Open Data BCN.
* **Datos:** 10.707 HUTs registradas, extraídas y acumuladas por año desde 2012.
* **Análisis:** Gráfico combinado (línea de total acumulado + barras de incremento anual).
* **ETL:** Se actualiza cada 24 horas mediante Celery Beat.

### 📊 Módulo Integrado (Próxima Iteración)
* **Estado:** Simulación conceptual (Mockup).
* **Visión:** Cruzar los datos de los tres módulos en un panel de riesgos unificado. Requiere entrenamiento de modelo ML ponderado.

---

## 7. Búsqueda, Filtrado y Ordenación

Paginación (por defecto a 10 resultados por página):

    GET /api/water-consumption/?page=1

Búsqueda de texto (SearchFilter):

    GET /api/districts/?search=Eixample
    GET /api/incidents/?search=fuga

Filtrado avanzado (django-filter):

    GET /api/water-consumption/?district=1&period_date=2026-08-01
    GET /api/alerts/?severity=critical&status=unread

Ordenación (OrderingFilter):

    GET /api/water-consumption/?ordering=-consumption_m3
    GET /api/alerts/?ordering=-created_at

---

## 8. WebSockets en Tiempo Real

CityFlow cuenta con un canal de eventos en vivo gestionado con Django Channels y Redis:

* **Ruta de conexión:** ws://localhost:8000/ws/alerts/
* **Grupo de transmisión:** alerts
* **Disparador:** Las alertas creadas en la base de datos disparan una señal (post_save) que difunde el evento a todos los clientes conectados.

**Ejemplo de Payload JSON:**

    {
      "type": "air_quality.created",
      "alert_id": 4,
      "district_id": 1,
      "district_name": "Ciutat Vella",
      "severity": "critical",
      "title": "Anomalía crítica detectada",
      "message": "Los niveles de NO2 superaron el límite legal permitido.",
      "created_at": "2026-11-15T15:30:00Z"
    }

---

## 9. 🧪 Ejecución de Tests Automáticos

El proyecto cuenta con una suite de pruebas profesional para garantizar la calidad y estabilidad del código.

### Backend (Pytest)

    docker compose exec web pytest -v

* **16 tests** que cubren modelos, API REST, autenticación JWT, lógica de ML (anomalías de agua), tareas ETL y la señal de WebSockets.

### Frontend (Vitest + React Testing Library)

    cd frontend
    npm test

* **9 tests** que cubren el renderizado de los gráficos, componentes de autenticación y la pestaña de Turismo.

---

## 10. 📂 Estructura del Proyecto

    CityFlow/
    ├── config/                     # Configuración del proyecto Django
    │   ├── settings/               # Configuración dividida por entorno
    │   │   ├── base.py             # Configuración común
    │   │   ├── dev.py              # Entorno de desarrollo
    │   │   └── prod.py             # Entorno de producción
    │   ├── asgi.py                 # Servidor ASGI (WebSockets)
    │   ├── celery.py               # Programación de tareas Celery
    │   ├── urls.py                 # URLs raíz
    │   └── wsgi.py
    ├── cityFlow/                   # App principal
    │   ├── management/commands/    # Scripts ETL (ingest_air, sync_tourism_live, etc.)
    │   ├── migrations/
    │   ├── services/               # Lógica de ML y despachador de alertas
    │   ├── tests/                  # Suite de tests Backend
    │   ├── consumers.py            # Consumidor WebSocket
    │   ├── models.py               # Modelos relacionales
    │   ├── signals.py              # Emisión de alertas a Redis
    │   ├── tasks.py                # Tareas asíncronas
    │   └── views.py                # ViewSets de DRF
    ├── frontend/                   # Aplicación React
    │   ├── src/
    │   │   ├── components/         # Componentes (AirChart, MapView, TourismTab, etc.)
    │   │   ├── context/            # Autenticación JWT
    │   │   ├── pages/              # Vistas de Login y Registro
    │   │   ├── services/           # Cliente Axios
    │   │   └── tests/              # Suite de tests Frontend
    │   ├── vitest.config.js
    │   └── package.json
    ├── docker-compose.yml          # Orquestación de microservicios
    ├── Dockerfile                  # Imagen Docker del Backend
    ├── requirements.txt            # Dependencias de Python
    ├── pytest.ini                  # Configuración de Pytest
    └── README.md

---

## 11. 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo LICENSE para más detalles.

---

## 🙏 Agradecimientos

* **Open Data BCN** por proporcionar los datos abiertos de calidad del aire y HUTs.
* **Àrea Metropolitana de Barcelona (AMB)** por los datos históricos de consumo de agua.
* **IFCD0112** por el marco formativo y el apoyo durante el desarrollo.