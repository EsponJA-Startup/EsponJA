from dotenv import load_dotenv
load_dotenv() # Load variables from .env file into os.environ

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr, field_validator, Field
import re
import os
import hmac
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bcrypt
import httpx
import uuid
import secrets
from datetime import date, time

from app.database import create_db_and_tables, get_session
from app.models import Client, Professional, Waitlist, ServiceRequest
from app.auth import create_access_token, get_current_user
from app.schemas import ClientResponse, ProfessionalResponse, ServiceRequestResponse, ServiceRequestPublicResponse



DUMMY_PASSWORD_HASH = os.getenv("DUMMY_PASSWORD_HASH", "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjIQqiRQYq")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

limiter = Limiter(key_func=get_remote_address)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for Requests
class RegisterRequest(BaseModel):
    role: str = Field(max_length=50)
    name: str = Field(max_length=100)
    last_name: str = Field(max_length=100)
    email: EmailStr
    whatsapp_number: str = Field(max_length=20)
    password: str = Field(max_length=100)
    specialty: str | None = Field(default=None, max_length=100)
    waitlist_id: str
    first_access_password: str

    @field_validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("A senha deve ter no mínimo 8 caracteres.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra maiúscula.")
        if not re.search(r"[a-z]", v):
            raise ValueError("A senha deve conter pelo menos uma letra minúscula.")
        if not re.search(r"\d", v):
            raise ValueError("A senha deve conter pelo menos um número.")
        return v

class LoginRequest(BaseModel):
    email: str
    password: str

class WaitlistRequest(BaseModel):
    email: EmailStr
    phone: str | None = None
    intended_role: str | None = None
    requested_service: str | None = None

class AdminLoginRequest(BaseModel):
    password: str

class FirstAccessRequest(BaseModel):
    email: EmailStr
    first_access_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class ServiceRequestCreate(BaseModel):
    client_id: uuid.UUID | None = None
    service_type: str = Field(max_length=100)
    home_type: str = Field(max_length=100)
    bedrooms: str = Field(max_length=50)
    bathrooms: str = Field(max_length=50)
    has_pets: bool
    cep: str = Field(max_length=20)
    address: str = Field(max_length=255)
    scheduled_date: date
    scheduled_time: time

class ServiceRequestUpdate(BaseModel):
    status: str | None = None
    professional_id: uuid.UUID | None = None
    service_type: str | None = None
    home_type: str | None = None
    bedrooms: str | None = None
    bathrooms: str | None = None
    has_pets: bool | None = None
    cep: str | None = None
    address: str | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None

@app.post("/api/auth/register")
@limiter.limit("5/minute")
async def register(request: Request, data: RegisterRequest, session: Session = Depends(get_session)):
    full_name = f"{data.name} {data.last_name}".strip()
    hashed_pwd = get_password_hash(data.password)
    email_lower = data.email.lower()
    email_token = secrets.token_urlsafe(32)
    
    # Secure First Access validation
    try:
        w_id = uuid.UUID(data.waitlist_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID da lista de espera inválido")
        
    waitlist_entry = session.get(Waitlist, w_id)
    if not waitlist_entry or waitlist_entry.first_access_password != data.first_access_password or waitlist_entry.email != email_lower:
        raise HTTPException(status_code=403, detail="Credenciais de primeiro acesso inválidas ou não conferem.")
        
    if waitlist_entry.is_registered:
        raise HTTPException(status_code=400, detail="Este convite já foi utilizado para registro.")
    
    if data.role == "provider":
        # Check if email exists
        existing = session.exec(select(Professional).where(Professional.email == email_lower)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        new_user = Professional(
            name=full_name,
            email=email_lower,
            whatsapp_number=data.whatsapp_number,
            password=hashed_pwd,
            specialty=data.specialty,
            verification_token=email_token,
            is_verified=False
        )
        session.add(new_user)
    else:
        # Check if email exists
        existing = session.exec(select(Client).where(Client.email == email_lower)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        new_user = Client(
            name=full_name,
            email=email_lower,
            whatsapp_number=data.whatsapp_number,
            password=hashed_pwd,
            verification_token=email_token, 
            is_verified=False
        )
        session.add(new_user)
        
    waitlist_entry.is_registered = True
    session.add(waitlist_entry)
        
    session.commit()
    session.refresh(new_user)
    
    try: 
        async with httpx.AsyncClient() as client:
            await client.post("http://localhost:5678/webhook/registro-esponja", json={
                "email": new_user.email,
                "name": new_user.name,
                "role": data.role,
                "verification_token": new_user.verification_token
            })
    except Exception as e:
        print(f"Erro ao disparar gatilho de e-mail no n8n: {e}")

    return {"message": "User created successfully", "role": data.role, "user_id": str(new_user.id)}

@app.post("/api/auth/login")
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest, response: Response, session: Session = Depends(get_session)):
    email_lower = data.email.lower()
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    # Check admin first
    if admin_email and admin_password and email_lower == admin_email.lower() and hmac.compare_digest(data.password, admin_password):
        access_token = create_access_token(data={"sub": "admin", "role": "admin"})
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax")
        return {"message": "Admin login successful", "role": "admin", "user_id": "admin", "name": "Administrador"}

    # Check clients
    client = session.exec(select(Client).where(Client.email == email_lower)).first()
    if client:
        if verify_password(data.password, client.password):
            if not client.email_verified: 
                raise HTTPException(status_code=403, detail="Por favor, verifique seu e-mail antes de fazer login.")
            access_token = create_access_token(data={"sub": str(client.id), "role": "customer"})
            response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax")
            return {
                "message": "Login successful", 
                "role": "customer", 
                "user_id": str(client.id),
                "name": client.name
            }
    else:
        # Dummy check to equalize timing for user enumeration prevention
        verify_password(data.password, DUMMY_PASSWORD_HASH)
        
    # Check professionals
    professional = session.exec(select(Professional).where(Professional.email == email_lower)).first()
    if professional:
        if verify_password(data.password, professional.password):
            if not professional.email_verified: 
                raise HTTPException(status_code=403, detail="Por favor, verifique seu e-mail antes de fazer login.")
            access_token = create_access_token(data={"sub": str(professional.id), "role": "provider"})
            response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax")
            return {
                "message": "Login successful", 
                "role": "provider", 
                "user_id": str(professional.id),
                "name": professional.name
            }
    else:
        # Dummy check to equalize timing for user enumeration prevention
        verify_password(data.password, DUMMY_PASSWORD_HASH)
        
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.post("/api/auth/first-access")
@limiter.limit("10/minute")
def first_access(request: Request, data: FirstAccessRequest, session: Session = Depends(get_session)):
    email_lower = data.email.lower()
    waitlist_entry = session.exec(select(Waitlist).where(Waitlist.email == email_lower)).first()
    
    if not waitlist_entry:
        raise HTTPException(status_code=404, detail="Email não encontrado na lista de espera.")
        
    if waitlist_entry.first_access_password != data.first_access_password:
        raise HTTPException(status_code=401, detail="Senha de primeiro acesso inválida.")
        
    if waitlist_entry.is_registered:
        raise HTTPException(status_code=400, detail="Este email já completou o registro.")
        
    return {
        "message": "Acesso verificado",
        "waitlist_id": str(waitlist_entry.id),
        "email": waitlist_entry.email,
        "phone": waitlist_entry.phone,
        "intended_role": waitlist_entry.intended_role
    }


@app.post("/api/auth/verify")
@limiter.limit("5/minute")
def verify_email(request: Request, data: VerifyEmailRequest, session: Session = Depends(get_session)):
    client = session.exec(select(Client).where(Client.verification_token == data.token)).first()
    if client:
        client.email_verified = True
        client.verification_token = None
        session.add(client)
        session.commit()
        return {"message": "Email verificado com sucesso!"}
        
    professional = session.exec(select(Professional).where(Professional.verification_token == data.token)).first()
    if professional:
        professional.email_verified = True
        professional.verification_token = None 
        session.add(professional)
        session.commit()
        return {"message": "Email verificado com sucesso!"}
        
    raise HTTPException(status_code=400, detail="Token inválido ou expirado.")


@app.post("/api/auth/logout")
def logout(response: Response):
    response.delete_cookie("access_token", httponly=True, secure=True, samesite="lax")
    return {"message": "Successfully logged out"}

@app.post("/api/waitlist")
@limiter.limit("10/minute")
async def join_waitlist(request: Request, data: WaitlistRequest, session: Session = Depends(get_session)):
    email_lower = data.email.lower()
    
    existing_waitlist = session.exec(select(Waitlist).where(Waitlist.email == email_lower)).first()
    if existing_waitlist:
        raise HTTPException(status_code=400, detail="Email already on waitlist")
        
    existing_client = session.exec(select(Client).where(Client.email == email_lower)).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Email already registered as Client")
        
    existing_professional = session.exec(select(Professional).where(Professional.email == email_lower)).first()
    if existing_professional:
        raise HTTPException(status_code=400, detail="Email already registered as Professional")
        
    first_access_pwd = secrets.token_hex(3)
    
    entry = Waitlist(
        email=email_lower, 
        phone=data.phone, 
        intended_role=data.intended_role,
        requested_service=data.requested_service,
        first_access_password=first_access_pwd
    )
    session.add(entry)
    session.commit()
    
    try: 
        async with httpx.AsyncClient() as client:
            await client.post("http://localhost:5678/webhook/waitlist-esponja", json={
                "email": entry.email,
                "phone": entry.phone,
                "first_access_password": entry.first_access_password
            })
    except Exception as e:
        print(f"Erro ao disparar gatilho de e-mail no n8n (waitlist): {e}")
    
    return {"message": "Successfully added to waitlist"}

# admin_login removed, handled in login endpoint
@app.post("/api/service-requests")
@limiter.limit("5/minute")
def create_service_request(request: Request, data: ServiceRequestCreate, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "customer":
        data.client_id = uuid.UUID(user_id)
    elif role == "admin":
        if not data.client_id:
            raise HTTPException(status_code=400, detail="Admin must specify client_id")
    else:
        raise HTTPException(status_code=403, detail="Providers cannot create requests")
        
    client = session.get(Client, data.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    db_request = ServiceRequest(**data.model_dump())
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    return db_request

@app.get("/api/service-requests")
def get_service_requests(session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "admin":
        requests = session.exec(select(ServiceRequest)).all()
        result = []
        for r in requests:
            d = r.model_dump()
            if r.professional_id:
                p = session.get(Professional, r.professional_id)
                d["professional_name"] = p.name if p else None
            result.append(ServiceRequestResponse(**d))
        return result
    elif role == "customer":
        requests = session.exec(select(ServiceRequest).where(ServiceRequest.client_id == uuid.UUID(user_id))).all()
        result = []
        for r in requests:
            d = r.model_dump()
            if r.professional_id:
                p = session.get(Professional, r.professional_id)
                d["professional_name"] = p.name if p else None
            result.append(ServiceRequestResponse(**d))
        return result
    else: # provider
        requests = session.exec(select(ServiceRequest).where(
            (ServiceRequest.status == "Pendente") | (ServiceRequest.professional_id == uuid.UUID(user_id))
        )).all()
        
        result = []
        for r in requests:
            if r.status == "Pendente" and str(r.professional_id) != user_id:
                result.append(ServiceRequestPublicResponse(**r.model_dump()))
            else:
                result.append(ServiceRequestResponse(**r.model_dump()))
        return result

@app.get("/api/service-requests/{request_id}")
def get_service_request(request_id: uuid.UUID, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    return ServiceRequestResponse(**db_request.model_dump())

@app.patch("/api/service-requests/{request_id}")
def update_service_request(request_id: uuid.UUID, update_data: ServiceRequestUpdate, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    # IDOR Check
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    elif role == "provider":
        if db_request.professional_id and str(db_request.professional_id) != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify another professional's request")
        elif not db_request.professional_id:
            # A provider can only accept a pending request
            if db_request.status != "Pendente":
                raise HTTPException(status_code=400, detail="Este serviço já foi aceito por outro profissional.")
            if update_data.professional_id != uuid.UUID(user_id) or update_data.status != "Em Andamento":
                raise HTTPException(status_code=403, detail="Providers can only accept pending requests")
            
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(db_request, key, value)
        
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    return db_request

@app.delete("/api/service-requests/{request_id}")
def delete_service_request(request_id: uuid.UUID, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    elif role == "provider":
        raise HTTPException(status_code=403, detail="Providers cannot delete requests")
        
    session.delete(db_request)
    session.commit()
    return {"message": "Service request deleted successfully"}

@app.get("/api/professionals/me", response_model=ProfessionalResponse)
def get_professional_me(session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "provider":
        raise HTTPException(status_code=403, detail="Not authorized")
    professional = session.get(Professional, uuid.UUID(current_user["user_id"]))
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@app.get("/api/professionals", response_model=list[ProfessionalResponse])
def get_professionals(session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    professionals = session.exec(select(Professional)).all()
    return professionals

@app.get("/api/clients", response_model=list[ClientResponse])
def get_clients(
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    clients = session.exec(select(Client)).all()
    return clients



