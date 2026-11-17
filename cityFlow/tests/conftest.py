import pytest
from rest_framework.test import APIClient
from cityFlow.models import District, AirQuality, WaterConsumption, TourismPressure
from decimal import Decimal
from datetime import date

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def sample_district():
    return District.objects.create(
        code="01", name="Ciutat Vella", area_km2=Decimal("4.37"),
        population=100000, latitude=Decimal("41.3800"), longitude=Decimal("2.1730")
    )

@pytest.fixture
def district_with_air(sample_district):
    AirQuality.objects.create(
        district=sample_district, period_date=date(2024, 11, 10),
        no2_level=Decimal("50.00"), pm10_level=Decimal("30.00")
    )
    return sample_district

@pytest.fixture
def district_with_water(sample_district):
    WaterConsumption.objects.create(
        district=sample_district, period_date=date(2024, 12, 31),
        consumption_m3=Decimal("1500.00")
    )
    return sample_district

@pytest.fixture
def district_with_tourism(sample_district):
    TourismPressure.objects.create(
        district=sample_district, period_date=date(2023, 12, 31),
        hut_count=850, avg_noise_db=Decimal("55.00")
    )
    return sample_district