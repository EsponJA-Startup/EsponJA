import uuid
from datetime import datetime, timedelta
from app.models import Client, Waitlist
from app.models import Professional
from sqlmodel import select

def test_create_service_request(client, session):
    
    fake_waitlist_id = uuid.uuid4()
    session.add(Waitlist(id=fake_waitlist_id, email="aquaman@usp.br", first_access_password="senha-da-waitlist"))
    session.commit()

    
    client.post("/api/auth/register", json={
        "role": "customer",
        "name": "Arthur",
        "last_name": "Curry",
        "email": "aquaman@usp.br",
        "whatsapp_number": "11988888888",
        "password": "SenhaSegura123",
        "waitlist_id": str(fake_waitlist_id),
        "first_access_password": "senha-da-waitlist"
    })
    
    user = session.exec(select(Client).where(Client.email == "aquaman@usp.br")).first()
    user.email_verified = True
    session.add(user)
    session.commit()
    
    client.post("/api/auth/login", json={
        "email": "aquaman@usp.br",
        "password": "SenhaSegura123"
    })
    
    
    response = client.post("/api/service-requests", json={
        "service_type": "Limpeza Pós-Obra",
        "home_type": "Apartamento",
        "bedrooms": "2",
        "bathrooms": "1",
        "has_pets": True,
        "cep": "05508-000",
        "address": "Av. Prof. Luciano Gualberto, Butantã",
        "scheduled_date": "2026-10-15",
        "scheduled_time": "09:00:00"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Pendente"
    assert data["service_type"] == "Limpeza Pós-Obra"


def test_get_and_list_service_requests(client, session):
    # 1. Preparação: Mock da Waitlist e Registro
    fake_waitlist_id = uuid.uuid4()
    session.add(Waitlist(id=fake_waitlist_id, email="bruce@usp.br", first_access_password="123"))
    session.commit()

    client.post("/api/auth/register", json={
        "role": "customer", "name": "Bruce", "last_name": "Wayne",
        "email": "bruce@usp.br", "whatsapp_number": "11999999999",
        "password": "SenhaSegura123", "waitlist_id": str(fake_waitlist_id), "first_access_password": "123"
    })
    
    user = session.exec(select(Client).where(Client.email == "bruce@usp.br")).first()
    user.email_verified = True
    session.add(user)
    session.commit()
    
    login_resp = client.post("/api/auth/login", json={"email": "bruce@usp.br", "password": "SenhaSegura123"})
    token = login_resp.cookies.get("access_token")

    # 2. Criar Serviço no Futuro
    future_date = (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
    create_resp = client.post("/api/service-requests", json={
        "service_type": "Montagem de Móveis", "home_type": "Casa",
        "bedrooms": "3", "bathrooms": "2", "has_pets": False,
        "cep": "05508-000", "address": "Caverna, Butantã",
        "scheduled_date": future_date, "scheduled_time": "14:00:00"
    }, cookies={"access_token": token})
    
    req_id = create_resp.json()["id"]

    # 3. Testar GET List
    list_resp = client.get("/api/service-requests", cookies={"access_token": token})
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 1
    assert list_resp.json()[-1]["service_type"] == "Montagem de Móveis"

    # 4. Testar GET Específico
    single_resp = client.get(f"/api/service-requests/{req_id}", cookies={"access_token": token})
    assert single_resp.status_code == 200
    assert single_resp.json()["id"] == req_id


def test_provider_accept_service(client, session):
    # 1. Setup Cliente e Criar Pedido
    fake_waitlist_cust = uuid.uuid4()
    session.add(Waitlist(id=fake_waitlist_cust, email="clark@usp.br", first_access_password="123"))
    session.commit()
    client.post("/api/auth/register", json={
        "role": "customer", "name": "Clark", "last_name": "Kent",
        "email": "clark@usp.br", "whatsapp_number": "11900000000",
        "password": "SenhaSegura123", "waitlist_id": str(fake_waitlist_cust), "first_access_password": "123"
    })
    cust = session.exec(select(Client).where(Client.email == "clark@usp.br")).first()
    cust.email_verified = True
    session.add(cust)
    session.commit()

    login_cust = client.post("/api/auth/login", json={"email": "clark@usp.br", "password": "SenhaSegura123"})
    token_cust = login_cust.cookies.get("access_token")

    future_date = (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d")
    create_resp = client.post("/api/service-requests", json={
        "service_type": "Limpeza Pesada", "home_type": "Apartamento",
        "bedrooms": "1", "bathrooms": "1", "has_pets": False,
        "cep": "05508-000", "address": "Metrópolis, Butantã",
        "scheduled_date": future_date, "scheduled_time": "10:00:00"
    }, cookies={"access_token": token_cust})
    req_id = create_resp.json()["id"]

    # 2. Setup Prestador
    fake_waitlist_prov = uuid.uuid4()
    session.add(Waitlist(id=fake_waitlist_prov, email="diana@usp.br", first_access_password="123"))
    session.commit()
    client.post("/api/auth/register", json={
        "role": "provider", "name": "Diana", "last_name": "Prince",
        "email": "diana@usp.br", "whatsapp_number": "11911111111",
        "password": "SenhaSegura123", "waitlist_id": str(fake_waitlist_prov), "first_access_password": "123"
    })
    prov = session.exec(select(Professional).where(Professional.email == "diana@usp.br")).first()
    prov.email_verified = True
    session.add(prov)
    session.commit()

    login_prov = client.post("/api/auth/login", json={"email": "diana@usp.br", "password": "SenhaSegura123"})
    token_prov = login_prov.cookies.get("access_token")
    prov_id = login_prov.json()["user_id"]

    # 3. Prestador Aceita o Pedido
    patch_resp = client.patch(f"/api/service-requests/{req_id}", json={
        "status": "Em Andamento",
        "professional_id": prov_id
    }, cookies={"access_token": token_prov})

    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "Em Andamento"
    assert patch_resp.json()["professional_id"] == prov_id


def test_cancel_service_time_limit(client, session):
    # 1. Setup Cliente
    fake_waitlist_id = uuid.uuid4()
    session.add(Waitlist(id=fake_waitlist_id, email="hal@usp.br", first_access_password="123"))
    session.commit()
    client.post("/api/auth/register", json={
        "role": "customer", "name": "Hal", "last_name": "Jordan",
        "email": "hal@usp.br", "whatsapp_number": "11922222222",
        "password": "SenhaSegura123", "waitlist_id": str(fake_waitlist_id), "first_access_password": "123"
    })
    user = session.exec(select(Client).where(Client.email == "hal@usp.br")).first()
    user.email_verified = True
    session.add(user)
    session.commit()
    
    login_resp = client.post("/api/auth/login", json={"email": "hal@usp.br", "password": "SenhaSegura123"})
    token = login_resp.cookies.get("access_token")

    # 2. Criar serviço propositalmente para daqui a 10 horas
    close_datetime = datetime.now() + timedelta(hours=10)
    create_resp = client.post("/api/service-requests", json={
        "service_type": "Pequenos Reparos", "home_type": "Casa",
        "bedrooms": "2", "bathrooms": "1", "has_pets": False,
        "cep": "05508-000", "address": "Coast City, Butantã",
        "scheduled_date": close_datetime.strftime("%Y-%m-%d"),
        "scheduled_time": close_datetime.strftime("%H:%M:%S")
    }, cookies={"access_token": token})
    
    req_id = create_resp.json()["id"]

    # 3. Tentar Cancelar (Deve falhar com 400 por ser < 24h)
    cancel_resp = client.post(f"/api/service-requests/{req_id}/cancel", cookies={"access_token": token})
    
    assert cancel_resp.status_code == 400
    assert "at least 24 hours in advance" in cancel_resp.json()["detail"]