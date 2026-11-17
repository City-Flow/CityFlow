import pytest
from datetime import date
from decimal import Decimal
from django.core.management import call_command
from cityFlow.models import District, AirQuality

@pytest.mark.django_db
def test_ingest_air_command(tmp_path):
    """Test que verifica que el comando ingest_air procesa un CSV y guarda medias."""
    
    # 1. Creamos un CSV de prueba temporal
    csv_content = """CODI_PROVINCIA,PROVINCIA,CODI_MUNICIPI,MUNICIPI,ESTACIO,CODI_CONTAMINANT,ANY,MES,DIA,H01,V01,H02,V02
08,Barcelona,019,Barcelona,043,8,2024,1,1,10.0,V,20.0,V
08,Barcelona,019,Barcelona,043,10,2024,1,1,30.0,V,40.0,V
08,Barcelona,019,Barcelona,044,8,2024,1,1,15.0,V,25.0,V
"""
    csv_file = tmp_path / "test_air.csv"
    csv_file.write_text(csv_content)
    
    # 2. Creamos el distrito en la BD
    district = District.objects.create(
        code="02", name="Eixample", area_km2=Decimal("7.0"),
        population=200000, latitude=Decimal("41.38"), longitude=Decimal("2.15")
    )
    
    # 3. Ejecutamos el comando pasándole la ruta temporal
    call_command("ingest_air", path=str(tmp_path))
    
    # 4. Verificamos que se han guardado los datos con la media correcta
    air = AirQuality.objects.get(district=district, period_date=date(2024, 1, 1))
    assert air.no2_level == Decimal("17.50")
    assert air.pm10_level == Decimal("35.00")