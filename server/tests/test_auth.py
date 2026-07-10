import uuid
from app.models import Client, Professional, Waitlist
from sqlmodel import select

def test_register_client(client, session):
    
    fake_waitlist_id = uuid.uuid4()
    session.add(Waitlist(
        id=fake_waitlist_id, 
        email="batman@usp.br", 
        first_access_password="senha-da-waitlist"
    ))
    session.commit()

    
    response = client.post("/api/auth/register", json={
        "role": "customer",
        "name": "Bruce",
        "last_name": "Wayne",
        "email": "batman@usp.br",
        "whatsapp_number": "11999999999",
        "password": "SenhaSegura123",
        "waitlist_id": str(fake_waitlist_id),
        "first_access_password": "senha-da-waitlist"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert data["role"] == "customer"

def test_successful_client_login(client, session):
    fake_waitlist_id = uuid.uuid4()
    session.add(Waitlist(id=fake_waitlist_id, email="clark@usp.br", first_access_password="senha-da-waitlist"))
    session.commit()

    client.post("/api/auth/register", json={
        "role": "customer",
        "name": "Clark",
        "last_name": "Kent",
        "email": "clark@usp.br",
        "whatsapp_number": "11999999999",
        "password": "SenhaSegura123",
        "waitlist_id": str(fake_waitlist_id),
        "first_access_password": "senha-da-waitlist"
    })
    
    response = client.post("/api/auth/login", json={
        "email": "clark@usp.br",
        "password": "SenhaSegura123"
    })
    
    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"

def test_successful_login(client, session):
    fake_waitlist_id = uuid.uuid4()
    session.add(Waitlist(id=fake_waitlist_id, email="diana@usp.br", first_access_password="senha-da-waitlist"))
    session.commit()

    client.post("/api/auth/register", json={
        "role": "provider",
        "name": "Diana",
        "last_name": "Prince",
        "email": "diana@usp.br",
        "whatsapp_number": "11999999999",
        "password": "SenhaSegura123",
        "specialty": "Montadora",
        "waitlist_id": str(fake_waitlist_id),
        "first_access_password": "senha-da-waitlist"
    })

    
    response = client.post("/api/auth/login", json={
        "email": "diana@usp.br",
        "password": "SenhaSegura123"
    })
    
    assert response.status_code == 200
    assert response.json()["message"] == "Login successful"