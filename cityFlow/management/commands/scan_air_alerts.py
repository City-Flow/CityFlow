from django.core.management.base import BaseCommand
from django.utils import timezone
from cityFlow.models import District, AirQuality, Alert
from cityFlow.services.alert_dispatcher import create_alert

class Command(BaseCommand):
    help = "Escanea el aire y genera alertas si hay niveles críticos"

    def handle(self, *args, **options):
        self.stdout.write("🔍 Escaneando calidad del aire...")
        districts = District.objects.all()
        alerts_created = 0

        for d in districts:
            latest = AirQuality.objects.filter(district=d).order_by("-period_date").first()
            if not latest:
                continue

            no2 = float(latest.no2_level)
            pm10 = float(latest.pm10_level)

            # Usamos los umbrales del ICA (Crítico)
            is_critical = no2 > 120 or pm10 > 50
            is_warning = not is_critical and (no2 > 40 or pm10 > 40)

            if is_critical or is_warning:
                severity = "critical" if is_critical else "warning"
                title = f"Alerta de Aire en {d.name}"
                
                # Evitamos crear alertas duplicadas para el mismo día
                already_exists = Alert.objects.filter(
                    district=d, 
                    alert_type="air_quality", 
                    created_at__date=timezone.now().date()
                ).exists()

                if not already_exists:
                    message = f"NO2: {no2} µg/m³, PM10: {pm10} µg/m³. Nivel: {'Crítico' if is_critical else 'Advertencia'}."
                    create_alert(
                        district=d,
                        alert_type="air_quality",
                        severity=severity,
                        title=title,
                        message=message,
                    )
                    alerts_created += 1
                    self.stdout.write(self.style.SUCCESS(f"  ✅ Alerta creada para {d.name}"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Escaneo completado. {alerts_created} alertas creadas."))