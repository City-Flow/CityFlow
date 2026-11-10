from celery import shared_task
from django.core.management import call_command

@shared_task
def sync_air_data():
    # Llama al comando que ya has creado
    call_command("sync_air_live")
    