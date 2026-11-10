import requests
import csv
import io
from datetime import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from cityFlow.models import AirQuality, District, Alert
from cityFlow.services.alert_dispatcher import create_alert

class Command(BaseCommand):
    help = "Descarga el CSV de la última hora, actualiza la BD y genera alertas"

    def handle(self, *args, **options):
        self.stdout.write("🌐 Descargando datos en tiempo real de Open Data BCN...")
        
        # URL del archivo CSV que se actualiza cada hora (Ajusta esto si la URL cambia)
        # Nota: Esta es la URL típica del dataset de calidad del aire de BCN
        url = "https://opendata-ajuntament.barcelona.cat/data/dataset/qualitat-aire-estacions-bcn/resource/..." 
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error al descargar: {e}"))
            return

        self.stdout.write("✅ Archivo descargado. Procesando...")
        
        # Procesar el CSV en memoria
        csv_file = io.StringIO(response.text)
        reader = csv.DictReader(csv_file)
        reader.fieldnames = [name.strip().replace('\ufeff', '') for name in reader.fieldnames]
        
        STATION_TO_DISTRICT = {
            "004": "01", "042": "03", "043": "02", "044": "02",
            "050": "01", "054": "03", "057": "04", "058": "05", 
            "060": "06", "062": "07", "064": "08", "066": "09", "068": "10"
        }

        saved_count = 0
        for row in reader:
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
                
            media = Decimal(str(round(sum(valores) / len(valores), 2)))
            station = clean_row.get("ESTACIO", "").zfill(3)
            dist_code = STATION_TO_DISTRICT.get(station)
            
            if not dist_code:
                continue
                
            district = District.objects.filter(code=dist_code).first()
            if not district:
                continue
                
            # Guardar/Actualizar (Aquí no calculamos medias de varias estaciones porque este archivo ya viene procesado por la API)
            obj, created = AirQuality.objects.update_or_create(
                district=district,
                period_date=period_date,
                defaults={
                    "no2_level": media if is_no2 else Decimal("0.00"),
                    "pm10_level": media if is_pm10 else Decimal("0.00")
                }
            )
            saved_count += 1
            
        self.stdout.write(self.style.SUCCESS(f"✅ Datos actualizados. {saved_count} registros procesados."))
        
        # 4. Generar alertas automáticamente
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
                
            already_alerted = Alert.objects.filter(district=d, alert_type="air_quality").exists()
            if not already_alerted:
                create_alert(
                    district=d,
                    alert_type="air_quality",
                    severity=severity,
                    title=f"Alerta Automática en {d.name}",
                    message=msg
                )
                alerts_created += 1
                
        self.stdout.write(self.style.SUCCESS(f"🚨 {alerts_created} alertas nuevas generadas."))