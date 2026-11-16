from celery import shared_task
from django.core.management import call_command

@shared_task
def sync_air_data():
    call_command("sync_air_live")

@shared_task
def sync_tourism_data():
    call_command("sync_tourism_live")