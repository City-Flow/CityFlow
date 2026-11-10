import requests
import csv
import io
from datetime import datetime
from decimal import Decimal
from collections import defaultdict
from django.core.management.base import BaseCommand
from cityFlow.models import AirQuality, District, Alert
from cityFlow.services.alert_dispatcher import create_alert

class Command(BaseCommand):
    help = "Descarga el CSV de la última hora, actualiza la BD calculando medias diarias y genera alertas"

    def handle(self, *args, **options):
        self.stdout.write("🌐 Descargando datos en tiempo real de Open Data BCN...")
        
        # URL oficial del archivo horario
        url = "https://opendata-ajuntament.barcelona.cat/data/dataset/0582a266-ea06-4cc5-a219-913b22484e40/resource/c2032e7c-10ee-4c69-84d3-9e8caf9ca97a/download"
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error al descargar: {e}"))
            return

        self.stdout.write("✅ Archivo descargado. Procesando en memoria...")
        
        csv_file = io.StringIO(response.text)
        reader = csv.DictReader(csv_file)
        reader.fieldnames = [name.strip().replace('\ufeff', '') for name in reader.fieldnames]
        
        STATION_TO_DISTRICT = {
            "004": "01", "042": "03", "043": "02", "044": "02",
            "050": "01", "054": "03", "057": "04", "058": "05", 
            "060": "06", "062": "07", "064": "08", "066": "09", "068": "10"
        }

        # Diccionario para agrupar: { (dist_code, fecha): {"no2": [v1, v2], "pm10": [v1, v2]} }
        aggregated_data = defaultdict(lambda: {"no2": [], "pm10": []})
        total_rows_processed = 0

        for row in reader:
            # Limpiamos comillas y espacios
            clean_row = {k.strip(): str(v).strip().replace('"', '') for k, v in row.items() if k is not None}
            
            cont_code = clean_row.get("CODI_CONTAMINANT", "")
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
                
            # Extraer todos los valores horarios válidos
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
                
            # Media de las horas de ESTA estación en ESTE día
            media_estacion = sum(valores) / len(valores)
            
            # Normalizar estación (zfill rellena con ceros a la izquierda)
            station = clean_row.get("ESTACIO", "").zfill(3)
            dist_code = STATION_TO_DISTRICT.get(station)
            
            if not dist_code:
                continue
                
            # Agrupar por distrito y fecha
            key = (dist_code, period_date)
            if is_no2:
                aggregated_data[key]["no2"].append(media_estacion)
            if is_pm10:
                aggregated_data[key]["pm10"].append(media_estacion)
            
            total_rows_processed += 1

        self.stdout.write(f"💾 Procesadas {total_rows_processed} filas válidas. Guardando medias en BD...")
        
        # Ahora guardamos los datos calculando la media de todas las estaciones
        saved_count = 0
        for (dist_code, period_date), data in aggregated_data.items():
            district = District.objects.filter(code=dist_code).first()
            if not district:
                continue

            # Calcular medias reales
            avg_no2 = sum(data["no2"]) / len(data["no2"]) if data["no2"] else None
            avg_pm10 = sum(data["pm10"]) / len(data["pm10"]) if data["pm10"] else None

            # 1. Buscamos si ya existe el registro para no sobreescribir el otro contaminante
            obj = AirQuality.objects.filter(district=district, period_date=period_date).first()
            
            if not obj:
                obj = AirQuality(
                    district=district,
                    period_date=period_date,
                    no2_level=Decimal("0.00"),
                    pm10_level=Decimal("0.00")
                )

            # 2. Actualizamos SOLO si tenemos datos nuevos para ese contaminante
            if avg_no2 is not None:
                obj.no2_level = Decimal(str(round(avg_no2, 2)))
            if avg_pm10 is not None:
                obj.pm10_level = Decimal(str(round(avg_pm10, 2)))
            
            obj.save()
            saved_count += 1

        self.stdout.write(self.style.SUCCESS(f"✅ Datos actualizados. {saved_count} días procesados."))
        
        # 3. Generar alertas automáticamente
        self.stdout.write("🔍 Evaluando umbrales para generar alertas...")
        alerts_created = 0
        for d in District.objects.all():
            latest = AirQuality.objects.filter(district=d).order_by("-period_date").first()
            if not latest:
                continue
                
            no2 = float(latest.no2_level)
            pm10 = float(latest.pm10_level)
            
            if no2 > 120 or pm10 > 50:
                severity = "critical"
                msg = f"Niveles críticos detectados. NO2: {no2} µg/m³, PM10: {pm10} µg/m³."
            elif no2 > 40 or pm10 > 40:
                severity = "warning"
                msg = f"Niveles moderados. NO2: {no2} µg/m³, PM10: {pm10} µg/m³."
            else:
                continue
                
            # Evitar duplicados (buscamos si ya hay alerta hoy)
            already_alerted = Alert.objects.filter(
                district=d, 
                alert_type="air_quality",
                created_at__date=latest.period_date
            ).exists()
            
            if not already_alerted:
                create_alert(
                    district=d,
                    alert_type="air_quality",
                    severity=severity,
                    title=f"Alerta Automática en {d.name}",
                    message=msg
                )
                alerts_created += 1
 
            unique_dates = set(key[1] for key in aggregated_data.keys())
            self.stdout.write(f"📅 Fechas detectadas en el CSV: {sorted(unique_dates)}")