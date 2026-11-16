import pytest
from datetime import date
from decimal import Decimal
from cityFlow.models import District, AirQuality, WaterConsumption

@pytest.mark.django_db
def test_create_district():
    d = District.objects.create(
        code="99", name="Test", area_km2=Decimal("5.0"),
        population=100000, latitude=Decimal("41.0"), longitude=Decimal("2.0")
    )
    assert d.code == "99"
    assert str(d) == "99 - Test"

@pytest.mark.django_db
def test_air_quality_unique_constraint(sample_district):
    AirQuality.objects.create(district=sample_district, period_date=date(2024, 1, 1), no2_level=10, pm10_level=20)
    with pytest.raises(Exception):
        AirQuality.objects.create(district=sample_district, period_date=date(2024, 1, 1), no2_level=15, pm10_level=25)

@pytest.mark.django_db
def test_water_consumption_str(sample_district):
    w = WaterConsumption.objects.create(
        district=sample_district, period_date=date(2024, 1, 1), consumption_m3=Decimal("1234.56")
    )
    assert "1234.56 m³" in str(w)