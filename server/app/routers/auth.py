from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlmodel import Session, select
import secrets
import os
import hmac
import uuid
import httpx
import logging

from app.database import get_session
from app.models import Client, Professional, Waitlist
from app.auth import create_access_token, get_password_hash, verify_password, DUMMY_PASSWORD_HASH
from app.schemas import RegisterRequest, LoginRequest, FirstAccessRequest, VerifyEmailRequest
from app.limiter import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
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
        raise HTTPException(status_code=403, detail="Código de confirmação inválido ou não confere.")
        
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
            email_verified=False,
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
            email_verified=False
        )
        session.add(new_user)
        
    waitlist_entry.is_registered = True
    session.add(waitlist_entry)
        
    session.commit()
    session.refresh(new_user)
    
    try: 
        n8n_base_url = os.getenv("N8N_WEBHOOK_URL")
        if not n8n_base_url:
            raise ValueError("N8N_WEBHOOK_URL environment variable is not defined.")
        n8n_base_url = n8n_base_url.rstrip('/')
            
        async with httpx.AsyncClient() as client:
            await client.post(f"{n8n_base_url}/webhook/registro-esponja", json={
                "email": new_user.email,
                "name": new_user.name,
                "role": data.role,
                "verification_token": new_user.verification_token
            })
    except Exception as e:
        print(f"Erro ao disparar gatilho de e-mail no n8n: {e}")

    return {"message": "User created successfully", "role": data.role, "user_id": str(new_user.id)}

@router.post("/login")
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

@router.post("/first-access")
@limiter.limit("10/minute")
def first_access(request: Request, data: FirstAccessRequest, session: Session = Depends(get_session)):
    email_lower = data.email.lower()
    waitlist_entry = session.exec(select(Waitlist).where(Waitlist.email == email_lower)).first()
    
    if not waitlist_entry:
        raise HTTPException(status_code=404, detail="Email não encontrado na lista de espera.")
        
    if waitlist_entry.first_access_password != data.first_access_password:
        raise HTTPException(status_code=401, detail="Código de confirmação inválido.")
        
    if waitlist_entry.is_registered:
        raise HTTPException(status_code=400, detail="Este email já completou o registro.")
        
    return {
        "message": "Acesso verificado",
        "waitlist_id": str(waitlist_entry.id),
        "email": waitlist_entry.email,
        "phone": waitlist_entry.phone,
        "intended_role": waitlist_entry.intended_role
    }

@router.post("/verify")
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

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token", httponly=True, secure=True, samesite="lax")
    return {"message": "Successfully logged out"}
