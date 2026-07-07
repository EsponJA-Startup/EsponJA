from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
import secrets
import os
import httpx
import logging

from app.database import get_session
from app.models import Client, Professional, Waitlist
from app.schemas import WaitlistRequest
from app.limiter import limiter

router = APIRouter(prefix="/api/waitlist", tags=["waitlist"])

@router.post("")
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
        n8n_base_url = os.getenv("N8N_WEBHOOK_URL")
        if not n8n_base_url:
            raise ValueError("N8N_WEBHOOK_URL environment variable is not defined.")
        n8n_base_url = n8n_base_url.rstrip('/')
            
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{n8n_base_url}/webhook/waitlist-esponja", json={
                "email": entry.email,
                "phone": entry.phone,
                "first_access_password": entry.first_access_password
            })
            response.raise_for_status()
    except httpx.HTTPStatusError as e:
        logging.error(f"Erro HTTP ao disparar gatilho de e-mail no n8n (waitlist): {e.response.status_code} - {e.response.text}")
    except httpx.RequestError as e:
        logging.error(f"Erro de rede ao disparar gatilho de e-mail no n8n (waitlist): {e}")
    except Exception as e:
        logging.error(f"Erro inesperado ao disparar gatilho de e-mail no n8n (waitlist): {e}")
    
    return {"message": "Successfully added to waitlist"}
