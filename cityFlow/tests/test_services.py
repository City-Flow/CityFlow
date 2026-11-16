import pytest
from datetime import date
from cityFlow.models import District, WaterConsumption
from cityFlow.services.water_anomalies import analyze_district

@pytest.mark.django_db
def test_water_anomaly_detection():
    d = District.objects.create(
        code="99", name="Anomaly Test", area_km2=1, population=1, latitude=1, longitude=1
    )
    # 10 días de consumo normal (100 m³)
    for i in range(10):
        WaterConsumption.objects.create(
            district=d, period_date=date(2024, 1, i+1), consumption_m3=100
        )
    # 1 día con un pico enorme (500 m³)
    WaterConsumption.objects.create(
        district=d, period_date=date(2024, 1, 15), consumption_m3=500
    )
    
    result = analyze_district(d)
    assert result.anomalies_detected >= 1