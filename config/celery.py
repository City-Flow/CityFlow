import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('cityFlow')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'sync-air-hourly': {
        'task': 'cityFlow.tasks.sync_air_data',
        'schedule': 3600.0,
    },
    'sync-tourism-daily': {
        'task': 'cityFlow.tasks.sync_tourism_data',
        'schedule': 86400.0, 
    },
}