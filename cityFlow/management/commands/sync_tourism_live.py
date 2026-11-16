import requests
from datetime import date
from decimal import Decimal
from collections import defaultdict
from django.core.management.base import BaseCommand
from cityFlow.models import TourismPressure, District

class Command(BaseCommand):
    help = "Sincroniza datos de HUTs desde la API CKAN de Open Data BCN"

    def handle(self, *args, **options):
        url = "https://opendata-ajuntament.barcelona.cat/data/api/action/datastore_search"
        params = {
            "resource_id": "b32fa7f6-d464-403b-8a02-0292a64883bf",
            "limit": 15000 
        }

        self.stdout.write("🌐 Consultando la API de Open Data BCN...")
        
        try:
            response = requests.get(url, params=params, timeout=60)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error al consultar la API: {e}"))
            return

        records = data.get("result", {}).get("records", [])
        total = data.get("result", {}).get("total", 0)
        
        self.stdout.write(f"📊 Registros obtenidos: {len(records)} de {total} totales.")

        # Agrupar por distrito y contar
        hut_count_by_district = defaultdict(int)
        places_by_district = defaultdict(int)
        
        for record in records:
            dist_code = record.get("CODI_DISTRICTE", "").strip()
            places = record.get("NUMERO_PLACES", "0")
            
            if dist_code:
                hut_count_by_district[dist_code] += 1
                try:
                    places_by_district[dist_code] += int(places)
                except ValueError:
                    pass

        self.stdout.write(f"📊 HUTs por distrito: {dict(hut_count_by_district)}")
        
        # Guardar en la base de datos
        today = date.today()
        saved = 0
        
        for dist_code, count in hut_count_by_district.items():
            district = District.objects.filter(code=dist_code).first()
            if not district:
                self.stdout.write(self.style.WARNING(f"⚠️ Distrito no encontrado: {dist_code}"))
                continue

            TourismPressure.objects.update_or_create(
                district=district,
                period_date=today,
                defaults={
                    "hut_count": count,
                    "avg_noise_db": Decimal("55.0") # Placeholder hasta tener datos reales de ruido
                }
            )
            saved += 1

        self.stdout.write(self.style.SUCCESS(f"✅ {saved} distritos actualizados con datos de HUTs."))