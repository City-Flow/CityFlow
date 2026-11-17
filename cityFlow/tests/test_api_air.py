import pytest

@pytest.mark.django_db
def test_get_air_districts(api_client, district_with_air):
    # Cambiamos los valores del fixture o creamos uno nuevo con valores más altos
    district_with_air.air_qualities.update(no2_level=100, pm10_level=60)  # NO2=100 → "Desfavorable", PM10=60 → "Desfavorable"
    
    response = api_client.get("/api/air/districts/")
    assert response.status_code == 200
    assert response.data[0]["status"] == "warning"  # Ahora sí debería ser warning

@pytest.mark.django_db
def test_get_air_metrics(api_client, district_with_air):
    response = api_client.get(f"/api/air/metrics/?district_id={district_with_air.id}")
    assert response.status_code == 200
    assert "historical_data" in response.data
    assert "predictions" in response.data

@pytest.mark.django_db
def test_get_air_metrics_no_district(api_client):
    response = api_client.get("/api/air/metrics/?district_id=999")
    assert response.status_code == 404