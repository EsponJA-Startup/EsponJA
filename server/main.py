from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from pydantic import BaseModel
import bcrypt

from app.database import create_db_and_tables, get_session
from app.models import Client, Professional, Waitlist

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
    allow_origins=["*"],
    allow_credentials=False,
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
    
    return {"message": "User created successfully", "role": request.role}

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
