import csv
import os
import glob
from datetime import datetime
from decimal import Decimal
from collections import defaultdict
from django.core.management.base import BaseCommand
from cityFlow.models import AirQuality, District

class Command(BaseCommand):
    help = "Ingesta masiva (histórico y actual) con agregación de medias"

    def handle(self, *args, **options):
        data_dir = "cityFlow/data/historico"
        csv_files = glob.glob(os.path.join(data_dir, "*.csv"))
        
        if not csv_files:
            self.stdout.write(self.style.ERROR(f"❌ No se encontraron archivos .csv en {data_dir}"))
            return

        # Diccionario de mapeo
        STATION_TO_DISTRICT = {
            "004": "01", "042": "03", "043": "02", "044": "02",
            "050": "01", "054": "03", "057": "04", "058": "05", 
            "060": "06", "062": "07", "064": "08", "066": "09", "068": "10"
        }

        # Aquí agrupamos: { (dist_code, fecha): {"no2": [val1, val2], "pm10": [val1, val2]} }
        aggregated_data = defaultdict(lambda: {"no2": [], "pm10": []})
        total_rows_processed = 0

        self.stdout.write(f"📂 Procesando {len(csv_files)} archivos...")

        for file_path in csv_files:
            try:
                with open(file_path, encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    # Limpiamos BOM de las cabeceras
                    reader.fieldnames = [name.strip().replace('\ufeff', '') for name in reader.fieldnames]
                    
                    for row in reader:
                        # Limpiamos comillas dobles y espacios de todos los valores
                        clean_row = {k.strip(): str(v).strip().replace('"', '') for k, v in row.items() if k is not None}

                        cont_code = clean_row.get("CODI_CONTAMINANT", "")
                        
                        # Aceptamos el 7 o el 8 para NO2, y el 10 o 12 para PM10
                        is_no2 = cont_code in ["7", "8"]
                        is_pm10 = cont_code in ["10", "12"]

                        if not is_no2 and not is_pm10:
                            continue

                        try:
                            year = int(clean_row["ANY"])
                            month = int(clean_row["MES"])
                            day = int(clean_row["DIA"])
                            period_date = datetime(year, month, day).date()
                        except (ValueError, KeyError):
                            continue

                        valores = []
                        for i in range(1, 25):
                            val_str = clean_row.get(f"H{i:02d}", "")
                            flag = clean_row.get(f"V{i:02d}", "")
                            if flag == "V" and val_str:
                                try:
                                    valores.append(float(val_str))
                                except ValueError:
                                    pass

                        if not valores:
                            continue

                        media_estacion = sum(valores) / len(valores)

                        # Normalizar estación: si es "4" lo convierte a "004"
                        station = clean_row.get("ESTACIO", "").zfill(3)
                        dist_code = STATION_TO_DISTRICT.get(station)
                        
                        if not dist_code:
                            continue # Ignoramos estaciones no mapeadas

                        key = (dist_code, period_date)
                        if is_no2:
                            aggregated_data[key]["no2"].append(media_estacion)
                        if is_pm10:
                            aggregated_data[key]["pm10"].append(media_estacion)
                        
                        total_rows_processed += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   Error en {os.path.basename(file_path)}: {e}"))
                continue

        self.stdout.write(f"💾 Procesadas {total_rows_processed} filas válidas. Calculando medias y guardando en BD...")
        saved_count = 0

        # Guardar en base de datos calculando la media de las estaciones
        for (dist_code, period_date), data in aggregated_data.items():
            district = District.objects.filter(code=dist_code).first()
            if not district:
                continue

            avg_no2 = sum(data["no2"]) / len(data["no2"]) if data["no2"] else Decimal("0.00")
            avg_pm10 = sum(data["pm10"]) / len(data["pm10"]) if data["pm10"] else Decimal("0.00")

            obj, created = AirQuality.objects.update_or_create(
                district=district,
                period_date=period_date,
                defaults={
                    "no2_level": Decimal(str(round(avg_no2, 2))),
                    "pm10_level": Decimal(str(round(avg_pm10, 2)))
                }
            )
            saved_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"\n🎉 Ingesta completada: {saved_count} días únicos guardados en BD."
        ))