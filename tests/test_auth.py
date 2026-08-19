from fastapi.testclient import TestClient
from main import app 
from database import Base

client = TestClient(app)

class TestAuth:
    # Test Register endpoint
    def test_register(self):
        response = client.post("/users", json={"email": "test_auth@example.com", "password": "testpassword"})
        assert response.status_code == 200
    
    # test duplicate email
    def test_duplicate_email(self):
        client.post("/users", json={"email": "dupe@example.com", "password": "pass123"})
        response = client.post("/users", json={"email": "dupe@example.com", "password": "pass123"})
        assert response.status_code == 400
    
    # test login
    def test_login(self):
        client.post("/users", json={"email": "login@example.com", "password": "pass123"})
        response = client.post("/login", json={"email": "login@example.com", "password": "pass123"})
        assert response.status_code == 200
        assert "access_token" in response.json()
        
    # test wrong password
    def test_login_wrong_password(self):
        client.post("/users", json={"email": "wrongpw@example.com", "password": "correctpass"})
        response = client.post("/login", json={"email": "wrongpw@example.com", "password": "wrongpass"})
        assert response.status_code == 401
    
    def test_user_scope(self):
        client.post("/users", json={"email": "a@example.com", "password": "pass123"}) # register
        response = client.post("/login", json={"email": "a@example.com", "password": "pass123"}) # login
        tokenA = response.json()["access_token"]
        Ahabit_response = client.post("/habits/", json={"name": "Coffee", "typical_cost": 5.00}, headers={"Authorization": f"Bearer {tokenA}"})
        
        client.post("/users", json={"email": "b@example.com", "password": "pass123"}) # register
        response = client.post("/login", json={"email": "b@example.com", "password": "pass123"}) # login
        tokenB = response.json()["access_token"]
        Bhabit_response = client.post("/habits/", json={"name": "Fortnite", "typical_cost": 10.00}, headers={"Authorization": f"Bearer {tokenB}"})
        
        habit_id_a = Ahabit_response.json()["id"]
        delete_response_a = client.delete(f"/habits/{habit_id_a}", headers={"Authorization": f"Bearer {tokenB}"})
        assert delete_response_a.status_code == 404