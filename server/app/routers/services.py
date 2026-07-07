from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import Session, select
import uuid
from datetime import datetime, timedelta

from app.database import get_session
from app.models import Client, Professional, ServiceRequest, ServiceRequestRejection, ServiceRescheduleProposal
from app.auth import get_current_user
from app.schemas import ServiceRequestCreate, ServiceRequestUpdate, ServiceRequestResponse, ServiceRequestPublicResponse, RescheduleProposalCreate, RescheduleProposalResponse
from app.limiter import limiter

router = APIRouter(prefix="/api", tags=["services"])

def get_pending_reschedule_data(session: Session, service_request_id: uuid.UUID) -> dict | None:
    proposal = session.exec(select(ServiceRescheduleProposal).where(
        (ServiceRescheduleProposal.service_request_id == service_request_id) &
        (ServiceRescheduleProposal.status == "Pendente")
    )).first()
    if proposal:
        return {
            "id": proposal.id,
            "service_request_id": proposal.service_request_id,
            "proposed_date": proposal.proposed_date,
            "proposed_time": proposal.proposed_time,
            "requested_by_role": proposal.requested_by_role,
            "status": proposal.status
        }
    return None

@router.post("/service-requests")
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

@router.get("/service-requests")
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
            d["pending_reschedule"] = get_pending_reschedule_data(session, r.id)
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
            d["pending_reschedule"] = get_pending_reschedule_data(session, r.id)
            result.append(ServiceRequestResponse(**d))
        return result
    else: # provider
        requests = session.exec(select(ServiceRequest).where(
            (ServiceRequest.professional_id == uuid.UUID(user_id)) |
            ((ServiceRequest.status == "Pendente") & (ServiceRequest.professional_id == None))
        )).all()
        
        # Filter out requests rejected by the current professional
        rejected_ids = set(session.exec(select(ServiceRequestRejection.service_request_id).where(
            ServiceRequestRejection.professional_id == uuid.UUID(user_id)
        )).all())
        
        result = []
        for r in requests:
            if r.id not in rejected_ids:
                if r.status == "Pendente" and str(r.professional_id) != user_id:
                    d = r.model_dump()
                    d["pending_reschedule"] = get_pending_reschedule_data(session, r.id)
                    result.append(ServiceRequestPublicResponse(**d))
                else:
                    d = r.model_dump()
                    if r.professional_id:
                        p = session.get(Professional, r.professional_id)
                        d["professional_name"] = p.name if p else None
                    d["pending_reschedule"] = get_pending_reschedule_data(session, r.id)
                    result.append(ServiceRequestResponse(**d))
        return result

@router.get("/service-requests/{request_id}")
def get_service_request(request_id: uuid.UUID, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    d = db_request.model_dump()
    if db_request.professional_id:
        p = session.get(Professional, db_request.professional_id)
        d["professional_name"] = p.name if p else None
    d["pending_reschedule"] = get_pending_reschedule_data(session, db_request.id)
    return ServiceRequestResponse(**d)

@router.patch("/service-requests/{request_id}")
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

@router.delete("/service-requests/{request_id}")
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

@router.post("/service-requests/{request_id}/reject")
def reject_service_request(request_id: uuid.UUID, session: Session = Depends(get_session), current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "provider":
        raise HTTPException(status_code=403, detail="Apenas prestadores podem recusar serviços.")
        
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    if db_request.status != "Pendente":
        raise HTTPException(status_code=400, detail="Apenas serviços pendentes podem ser recusados.")
        
    user_id = current_user["user_id"]
    professional_id = uuid.UUID(user_id)
    
    # Check if already rejected
    existing = session.exec(select(ServiceRequestRejection).where(
        (ServiceRequestRejection.professional_id == professional_id) & 
        (ServiceRequestRejection.service_request_id == request_id)
    )).first()
    
    if not existing:
        rejection = ServiceRequestRejection(
            professional_id=professional_id,
            service_request_id=request_id
        )
        session.add(rejection)
        session.commit()
        
    return {"message": "Service request rejected successfully"}

@router.post("/service-requests/{request_id}/reschedule-proposals", response_model=RescheduleProposalResponse)
def create_reschedule_proposal(
    request_id: uuid.UUID,
    data: RescheduleProposalCreate,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role not in ["customer", "provider"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if role == "provider" and str(db_request.professional_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    service_datetime = datetime.combine(db_request.scheduled_date, db_request.scheduled_time)
    if service_datetime - datetime.now() < timedelta(hours=24):
        raise HTTPException(status_code=400, detail="Proposals must be requested at least 24 hours in advance")
        
    existing_pending = session.exec(select(ServiceRescheduleProposal).where(
        (ServiceRescheduleProposal.service_request_id == request_id) &
        (ServiceRescheduleProposal.status == "Pendente")
    )).first()
    if existing_pending:
        raise HTTPException(status_code=400, detail="There is already a pending reschedule proposal for this service")
        
    proposal = ServiceRescheduleProposal(
        service_request_id=request_id,
        proposed_date=data.proposed_date,
        proposed_time=data.proposed_time,
        requested_by_role=role,
        status="Pendente"
    )
    session.add(proposal)
    session.commit()
    session.refresh(proposal)
    return proposal

@router.post("/reschedule-proposals/{proposal_id}/accept")
def accept_reschedule_proposal(
    proposal_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role not in ["customer", "provider"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    proposal = session.get(ServiceRescheduleProposal, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Reschedule proposal not found")
        
    if proposal.status != "Pendente":
        raise HTTPException(status_code=400, detail="Proposal is already resolved")
        
    db_request = session.get(ServiceRequest, proposal.service_request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    if proposal.requested_by_role == role:
        raise HTTPException(status_code=400, detail="You cannot accept your own reschedule proposal")
        
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if role == "provider" and str(db_request.professional_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    service_datetime = datetime.combine(db_request.scheduled_date, db_request.scheduled_time)
    if service_datetime - datetime.now() < timedelta(hours=24):
        raise HTTPException(status_code=400, detail="Actions must be performed at least 24 hours in advance")
        
    db_request.scheduled_date = proposal.proposed_date
    db_request.scheduled_time = proposal.proposed_time
    session.add(db_request)
    
    proposal.status = "Aceito"
    session.add(proposal)
    
    session.commit()
    return {"message": "Reschedule proposal accepted and updated successfully"}

@router.post("/reschedule-proposals/{proposal_id}/reject")
def reject_reschedule_proposal(
    proposal_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role not in ["customer", "provider"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    proposal = session.get(ServiceRescheduleProposal, proposal_id)
    if not proposal:
        raise HTTPException(status_code=404, detail="Reschedule proposal not found")
        
    if proposal.status != "Pendente":
        raise HTTPException(status_code=400, detail="Proposal is already resolved")
        
    db_request = session.get(ServiceRequest, proposal.service_request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    if proposal.requested_by_role == role:
        raise HTTPException(status_code=400, detail="You cannot reject your own reschedule proposal")
        
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if role == "provider" and str(db_request.professional_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    proposal.status = "Recusado"
    session.add(proposal)
    session.commit()
    return {"message": "Reschedule proposal rejected successfully"}

@router.post("/service-requests/{request_id}/cancel")
def cancel_service_request(
    request_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role not in ["customer", "provider"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_request = session.get(ServiceRequest, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Service request not found")
        
    if role == "customer" and str(db_request.client_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if role == "provider" and str(db_request.professional_id) != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    service_datetime = datetime.combine(db_request.scheduled_date, db_request.scheduled_time)
    if service_datetime - datetime.now() < timedelta(hours=24):
        raise HTTPException(status_code=400, detail="Cancellations must be performed at least 24 hours in advance")
        
    db_request.status = "Cancelado"
    session.add(db_request)
    session.commit()
    return {"message": "Service request cancelled successfully"}
