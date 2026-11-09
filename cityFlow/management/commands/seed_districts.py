# cityFlow/management/commands/seed_districts.py
from django.core.management.base import BaseCommand
from cityFlow.models import District
from decimal import Decimal

class Command(BaseCommand):
    help = "Siembra la base de datos con los 10 distritos de Barcelona"

    def handle(self, *args, **options):
        self.stdout.write("Iniciando la siembra de distritos...")

        # Datos reales de los 10 distritos de Barcelona
        # (Coordenadas del centro, superficie en km2 y población aproximada)
        DISTRICTS_DATA = [
            {"code": "01", "name": "Ciutat Vella", "lat": 41.3800, "lon": 2.1730, "area": 4.37, "pop": 103032},
            {"code": "02", "name": "Eixample", "lat": 41.3887, "lon": 2.1589, "area": 7.46, "pop": 265894},
            {"code": "03", "name": "Sants-Montjuïc", "lat": 41.3721, "lon": 2.1352, "area": 21.25, "pop": 182474},
            {"code": "04", "name": "Les Corts", "lat": 41.3850, "lon": 2.1300, "area": 6.08, "pop": 81444},
            {"code": "05", "name": "Sarrià-Sant Gervasi", "lat": 41.4000, "lon": 2.1200, "area": 20.09, "pop": 147579},
            {"code": "06", "name": "Gràcia", "lat": 41.4025, "lon": 2.1567, "area": 4.19, "pop": 120273},
            {"code": "07", "name": "Horta-Guinardó", "lat": 41.4200, "lon": 2.1600, "area": 11.96, "pop": 167454},
            {"code": "08", "name": "Nou Barris", "lat": 41.4400, "lon": 2.1700, "area": 8.04, "pop": 166950},
            {"code": "09", "name": "Sant Andreu", "lat": 41.4350, "lon": 2.1900, "area": 6.56, "pop": 146671},
            {"code": "10", "name": "Sant Martí", "lat": 41.3948, "lon": 2.2025, "area": 10.51, "pop": 233215},
        ]

        created_count = 0
        updated_count = 0

        for data in DISTRICTS_DATA:
            # Usamos update_or_create para que se pueda ejecutar 100 veces sin duplicar
            obj, created = District.objects.update_or_create(
                code=data["code"],
                defaults={
                    "name": data["name"],
                    "latitude": Decimal(str(data["lat"])),
                    "longitude": Decimal(str(data["lon"])),
                    "area_km2": Decimal(str(data["area"])),
                    "population": data["pop"],
                }
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Creado: {obj.code} - {obj.name}"))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(f"🔄 Actualizado: {obj.code} - {obj.name}"))

        self.stdout.write(self.style.SUCCESS(
            f"\nResumen: {created_count} distritos creados, {updated_count} actualizados."
        ))