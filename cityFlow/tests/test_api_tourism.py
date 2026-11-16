import pytest
from datetime import date
from cityFlow.models import TourismPressure, District

@pytest.mark.django_db
def test_get_tourism_districts(api_client):
    # Limpiamos todo
    TourismPressure.objects.all().delete()
    District.objects.all().delete()
    
    # Creamos un distrito nuevo
    district = District.objects.create(
        code="99", name="Test Tourism", area_km2=1, population=1, latitude=1, longitude=1
    )
    
    # Creamos un registro con 850 HUTs
    TourismPressure.objects.create(
        district=district,
        period_date=date(2025, 12, 31),
        hut_count=850,
        avg_noise_db=55
    )
    
    # Llamamos a la API
    response = api_client.get("/api/tourism/districts/")
    
    # 🔍 Imprimimos la respuesta para depurar
    print("\n--- RESPUESTA DE LA API ---")
    print(response.data)
    print("---------------------------\n")
    
    # Verificamos
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0]["hut_count"] == 850
    assert response.data[0]["status"] == "warning"