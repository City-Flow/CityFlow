import pytest
from cityFlow.models import User

@pytest.mark.django_db
def test_register_user(api_client):
    data = {"email": "test@test.com", "name": "Test", "password": "securepass123"}
    response = api_client.post("/api/users/", data)
    assert response.status_code == 201
    assert User.objects.count() == 1
    assert User.objects.first().email == "test@test.com"

@pytest.mark.django_db
def test_login_jwt(api_client):
    User.objects.create_user(email="test@test.com", name="Test", password="securepass123")
    data = {"email": "test@test.com", "password": "securepass123"}
    response = api_client.post("/api/auth/token/", data)
    assert response.status_code == 200
    assert "access" in response.data