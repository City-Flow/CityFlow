import pytest

@pytest.mark.django_db
def test_get_water_districts(api_client, district_with_water):
    response = api_client.get("/api/water/districts/")
    assert response.status_code == 200
    assert response.data[0]["district_name"] == "Ciutat Vella"
    assert response.data[0]["current_consumption_m3"] == 1500.0
    assert response.data[0]["status"] == "critical" # 1500 > 1500*0.9

@pytest.mark.django_db
def test_get_water_metrics(api_client, district_with_water):
    response = api_client.get(f"/api/water/metrics/?district_id={district_with_water.id}")
    assert response.status_code == 200
    assert len(response.data["historical_data"]) == 1
    assert response.data["historical_data"][0]["consumption"] == 1500.0