from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
import uuid

from app.database import get_session
from app.models import Client, Professional
from app.auth import get_current_user
from app.schemas import ClientResponse, ProfessionalResponse

router = APIRouter(prefix="/api", tags=["users"])

@router.get("/professionals/me", response_model=ProfessionalResponse)
def get_professional_me(session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "provider":
        raise HTTPException(status_code=403, detail="Not authorized")
    professional = session.get(Professional, uuid.UUID(current_user["user_id"]))
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@router.get("/professionals", response_model=list[ProfessionalResponse])
def get_professionals(session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "customer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    professionals = session.exec(select(Professional)).all()
    return professionals

@router.get("/professionals/{professional_id}", response_model=ProfessionalResponse)
def get_professional_by_id(professional_id: uuid.UUID, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    if current_user["role"] not in ["admin", "customer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    professional = session.get(Professional, professional_id)
    if not professional:
        raise HTTPException(status_code=404, detail="Professional not found")
    return professional

@router.get("/clients", response_model=list[ClientResponse])
def get_clients(
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    clients = session.exec(select(Client)).all()
    return clients
