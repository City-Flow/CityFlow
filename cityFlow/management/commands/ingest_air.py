import csv
import os
import glob
from datetime import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from cityFlow.models import AirQuality, District

class Command(BaseCommand):
    help = "Ingesta masiva de calidad del aire desde múltiples CSV de Open Data BCN"

    def handle(self, *args, **options):
        # Carpeta donde has metido todos los CSV mensuales
        data_dir = "cityFlow/data/historico"
        
        # Buscamos todos los archivos .csv en esa carpeta
        csv_files = glob.glob(os.path.join(data_dir, "*.csv"))
        
        if not csv_files:
            self.stdout.write(self.style.ERROR(f"❌ No se encontraron archivos .csv en {data_dir}"))
            return

        self.stdout.write(f"📂 Encontrados {len(csv_files)} archivos para procesar...")

        STATION_TO_DISTRICT = {
            "004": "01", "042": "02", "043": "02", "044": "02",
            "050": "03", "054": "03", "057": "04", "058": "05", "060": "06",
        }
        DEFAULT_DISTRICT = "01"

        total_count = 0
        total_skipped = 0

        for file_path in csv_files:
            filename = os.path.basename(file_path)
            self.stdout.write(f"  Procesando: {filename}...")
            
            file_count = 0
            file_skipped = 0

            try:
                with open(file_path, encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    reader.fieldnames = [name.strip().replace('\ufeff', '') for name in reader.fieldnames]
                    
                    for row_num, row in enumerate(reader, start=2):
                        clean_row = {k.strip(): str(v).strip() for k, v in row.items() if k is not None}

                        cont_code = clean_row.get("CODI_CONTAMINANT", "")
                        is_no2 = cont_code == "8"
                        is_pm10 = cont_code in ["10", "12"]

                        if not is_no2 and not is_pm10:
                            file_skipped += 1
                            continue

                        try:
                            year = int(clean_row["ANY"])
                            month = int(clean_row["MES"])
                            day = int(clean_row["DIA"])
                            period_date = datetime(year, month, day).date()
                        except (ValueError, KeyError):
                            file_skipped += 1
                            continue

                        valores = []
                        for i in range(1, 25):
                            val_key = f"H{i:02d}"
                            flag_key = f"V{i:02d}"
                            
                            val_str = clean_row.get(val_key, "")
                            flag = clean_row.get(flag_key, "")
                            
                            if flag == "V" and val_str:
                                try:
                                    valores.append(float(val_str))
                                except ValueError:
                                    pass

                        if not valores:
                            file_skipped += 1
                            continue

                        media = Decimal(str(round(sum(valores) / len(valores), 2)))

                        station = clean_row.get("ESTACIO", "")
                        dist_code = STATION_TO_DISTRICT.get(station, DEFAULT_DISTRICT)
                        district = District.objects.filter(code=dist_code).first()
                        
                        if not district:
                            file_skipped += 1
                            continue

                        obj = AirQuality.objects.filter(district=district, period_date=period_date).first()
                        
                        if not obj:
                            obj = AirQuality(
                                district=district,
                                period_date=period_date,
                                no2_level=Decimal("0.00"),
                                pm10_level=Decimal("0.00")
                            )

                        if is_no2:
                            obj.no2_level = media
                        if is_pm10:
                            obj.pm10_level = media
                        
                        obj.save()
                        file_count += 1

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"   Error en {filename}: {e}"))
                continue

            total_count += file_count
            total_skipped += file_skipped
            self.stdout.write(f"   ✅ Guardados: {file_count} | Omitidos: {file_skipped}")

        self.stdout.write(self.style.SUCCESS(
            f"\n🎉 Ingesta TOTAL completada: {total_count} registros guardados en la BD."
        ))