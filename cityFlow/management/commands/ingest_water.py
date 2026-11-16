import csv
from datetime import date
from decimal import Decimal
from django.core.management.base import BaseCommand
from cityFlow.models import WaterConsumption, District

class Command(BaseCommand):
    help = "Ingesta datos históricos de consumo de agua desde CSV de AMB"

    def handle(self, *args, **options):
        csv_path = "cityFlow/data/1ABCOevolucio_domestica_AMB.csv"
        
        # 1. Cargar la evolución del consumo (litros/habitante/día)
        consumption_by_year = {}
        
        with open(csv_path, encoding="utf-8-sig") as f:
            reader = csv.reader(f)
            headers = next(reader)  # __, 1994, 1995, ...
            years = [int(y) for y in headers[1:]]  # Ignoramos la primera columna (nombre)
            
            for row in reader:
                # La fila tiene: "Consum Domestic (l/dia)", valor_1994, valor_1995, ...
                values = row[1:]
                for year, val_str in zip(years, values):
                    try:
                        val = float(val_str.replace(",", "."))
                        consumption_by_year[year] = val
                    except (ValueError, AttributeError):
                        continue
        
        self.stdout.write(f"📊 Años cargados del CSV: {sorted(consumption_by_year.keys())}")
        
        # 2. Obtener todos los distritos con su población
        districts = District.objects.all()
        if not districts:
            self.stdout.write(self.style.ERROR("❌ No hay distritos en la BD. Ejecuta seed_districts primero."))
            return
        
        # 3. Para cada año, distribuir el consumo proporcionalmente a la población
        total_population = sum(d.population for d in districts)
        count = 0
        
        for year, liters_per_person_day in consumption_by_year.items():
            # Convertir litros/habitante/día a m³/año por distrito
            # 1 m³ = 1000 litros, 1 año = 365 días
            for d in districts:
                # Consumo anual del distrito = (litros/hab/día * población * 365) / 1000
                annual_m3 = (liters_per_person_day * d.population * 365) / 1000
                
                period_date = date(year, 12, 31)  # Usamos el 31 de diciembre como fecha de cierre del año
                
                WaterConsumption.objects.update_or_create(
                    district=d,
                    period_date=period_date,
                    defaults={"consumption_m3": Decimal(str(round(annual_m3, 2)))}
                )
                count += 1
        
        self.stdout.write(self.style.SUCCESS(
            f"✅ Ingesta completada: {count} registros guardados en WaterConsumption."
        ))