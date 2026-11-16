import requests
from datetime import date
from decimal import Decimal
from collections import defaultdict
from django.core.management.base import BaseCommand
from cityFlow.models import TourismPressure, District

class Command(BaseCommand):
    help = "Ingesta histórica de HUTs con acumulación anual y relleno de distritos vacíos"

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
        self.stdout.write(f"📊 Registros obtenidos: {len(records)}")

        # 1. Agrupar por (distrito, año)
        counts = defaultdict(int)
        for r in records:
            dist_code = r.get("CODI_DISTRICTE", "").strip()
            expedient = r.get("N_EXPEDIENT", "")
            try:
                year = int(expedient.split("-")[1])
            except (IndexError, ValueError):
                continue
            if dist_code:
                counts[(dist_code, year)] += 1

        # 2. Obtener todos los años únicos ordenados
        all_years = sorted(set(year for (_, year) in counts.keys()))
        
        if not all_years:
            self.stdout.write(self.style.ERROR("❌ No se han podido extraer años de los expedientes."))
            return

        saved = 0
        
        # 3. Guardar el acumulado para los distritos que tienen datos
        for dist_code in set(dist for (dist, _) in counts.keys()):
            district = District.objects.filter(code=dist_code).first()
            if not district:
                continue
            
            accumulated = 0
            for year in all_years:
                new_huts = counts.get((dist_code, year), 0)
                accumulated += new_huts
                
                TourismPressure.objects.update_or_create(
                    district=district,
                    period_date=date(year, 12, 31),
                    defaults={
                        "hut_count": accumulated,
                        "avg_noise_db": Decimal("0.0")
                    }
                )
                saved += 1

        # 4. Rellenar distritos sin datos con 0 HUTs para que el gráfico no esté vacío
        all_districts = District.objects.all()
        
        for d in all_districts:
            # Si este distrito no tiene ningún registro en TourismPressure, creamos uno con 0
            if not TourismPressure.objects.filter(district=d).exists():
                # Usamos el año más antiguo y el más reciente del dataset
                for year in [all_years[0], all_years[-1]]:
                    TourismPressure.objects.update_or_create(
                        district=d,
                        period_date=date(year, 12, 31),
                        defaults={
                            "hut_count": 0,
                            "avg_noise_db": Decimal("0.0")
                        }
                    )
                saved += 2

        self.stdout.write(self.style.SUCCESS(f"✅ {saved} registros históricos guardados (incluyendo distritos sin datos)."))