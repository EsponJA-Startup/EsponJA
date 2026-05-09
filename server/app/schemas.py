from pydantic import BaseModel
import uuid
from datetime import datetime, date, time
from decimal import Decimal

class ClientResponse(BaseModel):
    id: uuid.UUID
    name: str
    whatsapp_number: str
    email: str | None = None
    created_at: datetime

class ProfessionalResponse(BaseModel):
    id: uuid.UUID
    name: str
    whatsapp_number: str | None = None
    email: str | None = None
    specialty: str | None = None
    profile_picture_url: str | None = None
    rating: float
    review_count: int
    is_verified: bool
    badges: list[str] | None = None
    wallet_available: Decimal
    wallet_escrow: Decimal

class ServiceRequestResponse(BaseModel):
    id: uuid.UUID
    client_id: uuid.UUID
    professional_id: uuid.UUID | None = None
    status: str
    service_type: str
    home_type: str
    bedrooms: str
    bathrooms: str
    has_pets: bool
    cep: str
    address: str
    scheduled_date: date
    scheduled_time: time
    price: Decimal | None = None
    payment_status: str

class ServiceRequestPublicResponse(BaseModel):
    id: uuid.UUID
    status: str
    service_type: str
    home_type: str
    bedrooms: str
    bathrooms: str
    has_pets: bool
    cep: str  # CEP is usually broad enough (by street/region), we hide full address
    scheduled_date: date
    scheduled_time: time
    price: Decimal | None = None
    # Omitted fields: client_id, address, professional_id, payment_status
