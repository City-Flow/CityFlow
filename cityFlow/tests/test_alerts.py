import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from cityFlow.models import District, Alert
from cityFlow.services.alert_dispatcher import create_alert

@pytest.mark.django_db
def test_create_alert_dispatches_websocket():
    """Test que verifica que crear una alerta dispara la señal y el envío a WebSocket."""
    district = District.objects.create(
        code="01", name="Test", area_km2=1, population=1, latitude=1, longitude=1
    )
    
    with patch("cityFlow.signals.get_channel_layer") as mock_get_layer:
        mock_layer = MagicMock()
        mock_layer.group_send = AsyncMock()  # ✅ AsyncMock para que sea awaitable
        mock_get_layer.return_value = mock_layer
        
        alert = create_alert(
            district=district,
            alert_type="air_quality",
            severity="critical",
            title="Test Alert",
            message="Test message",
        )
        
        assert Alert.objects.count() == 1
        assert alert.title == "Test Alert"
        
        mock_layer.group_send.assert_called_once()
        call_args = mock_layer.group_send.call_args
        assert call_args[0][0] == "alerts"
        assert call_args[0][1]["type"] == "alert.message"
        assert call_args[0][1]["payload"]["alert_id"] == alert.id


@pytest.mark.django_db
def test_alert_not_created_on_update():
    """Test que verifica que actualizar una alerta no dispara la señal de nuevo."""
    district = District.objects.create(
        code="01", name="Test", area_km2=1, population=1, latitude=1, longitude=1
    )
    
    with patch("cityFlow.signals.get_channel_layer") as mock_get_layer:
        mock_layer = MagicMock()
        mock_layer.group_send = AsyncMock()  # ✅ AsyncMock también aquí
        mock_get_layer.return_value = mock_layer
        
        alert = create_alert(
            district=district,
            alert_type="air_quality",
            severity="warning",
            title="Test",
            message="Test",
        )
        assert mock_layer.group_send.call_count == 1
        
        alert.title = "Updated"
        alert.save()
        
        # Sigue habiendo solo 1 llamada (el signal no se dispara en update)
        assert mock_layer.group_send.call_count == 1