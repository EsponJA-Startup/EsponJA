from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from pydantic import BaseModel
import bcrypt
import uuid
from datetime import date, time

from app.database import create_db_and_tables, get_session
from app.models import Client, Professional, Waitlist, ServiceRequest

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas for Requests
class RegisterRequest(BaseModel):
    role: str
    name: str
    last_name: str
    email: str
    whatsapp_number: str
    password: str
    specialty: str | None = None

class LoginRequest(BaseModel):
    email: str
    password: str

class WaitlistRequest(BaseModel):
    email: str
    intended_role: str | None = None

class AdminLoginRequest(BaseModel):
    password: str

class ServiceRequestCreate(BaseModel):
    client_id: uuid.UUID
    service_type: str
    home_type: str
    bedrooms: str
    bathrooms: str
    has_pets: bool
    cep: str
    address: str
    scheduled_date: date
    scheduled_time: time

class ServiceRequestUpdate(BaseModel):
    status: str | None = None
    professional_id: uuid.UUID | None = None

@app.post("/api/auth/register")
def register(request: RegisterRequest, session: Session = Depends(get_session)):
    full_name = f"{request.name} {request.last_name}".strip()
    hashed_pwd = get_password_hash(request.password)
    
    if request.role == "provider":
        # Check if email exists
        existing = session.exec(select(Professional).where(Professional.email == request.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        new_user = Professional(
            name=full_name,
            email=request.email,
            whatsapp_number=request.whatsapp_number,
            password=hashed_pwd,
            specialty=request.specialty
        )
        session.add(new_user)
    else:
        # Check if email exists
        existing = session.exec(select(Client).where(Client.email == request.email)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
            
        new_user = Client(
            name=full_name,
            email=request.email,
            whatsapp_number=request.whatsapp_number,
            password=hashed_pwd
        )
        session.add(new_user)
        
    session.commit()
    session.refresh(new_user)
    
    return {"message": "User created successfully", "role": request.role, "user_id": str(new_user.id)}

@app.post("/api/auth/login")
def login(request: LoginRequest, session: Session = Depends(get_session)):
    # Check clients first
    client = session.exec(select(Client).where(Client.email == request.email)).first()
    if client and verify_password(request.password, client.password):
        return {"message": "Login successful", "role": "customer", "user_id": str(client.id)}
        
    # Check professionals
    professional = session.exec(select(Professional).where(Professional.email == request.email)).first()
    if professional and verify_password(request.password, professional.password):
        return {"message": "Login successful", "role": "provider", "user_id": str(professional.id)}
        
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/api/waitlist")
def join_waitlist(request: WaitlistRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(Waitlist).where(Waitlist.email == request.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already on waitlist")
        
    entry = Waitlist(email=request.email, intended_role=request.intended_role)
    session.add(entry)
    session.commit()
    
    return {"message": "Successfully added to waitlist"}

@app.post("/api/auth/admin-login")
def admin_login(request: AdminLoginRequest):
    if request.password == "admin123":
        return {"message": "Admin login successful", "role": "admin"}
    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@app.post("/api/service-requests")
def create_service_request(request: ServiceRequestCreate, session: Session = Depends(get_session)):
    client = session.get(Client, request.client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
        
    db_request = ServiceRequest(**request.model_dump())
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    return db_request

@app.get("/api/service-requests")
def get_service_requests(session: Session = Depends(get_session)):
    requests = session.exec(select(ServiceRequest)).all()
    return requests

@app.patch("/api/service-requests/{request_id}")
def update_service_request(request_id: uuid.UUID, update_data: ServiceRequestUpdate, session: Session = Depends(get_session)):
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    if update_data.status is not None:
        db_request.status = update_data.status
    if update_data.professional_id is not None:
        db_request.professional_id = update_data.professional_id
        
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    return db_request

@app.get("/api/professionals")
def get_professionals(session: Session = Depends(get_session)):
    professionals = session.exec(select(Professional)).all()
    return professionals

@app.get("/api/clients")
def get_clients(session: Session = Depends(get_session)):
    clients = session.exec(select(Client)).all()
    return clients
