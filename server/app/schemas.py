from pydantic import BaseModel, EmailStr, field_validator, Field
import re
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

class RescheduleProposalResponse(BaseModel):
    id: uuid.UUID
    service_request_id: uuid.UUID
    proposed_date: date
    proposed_time: time
    requested_by_role: str
    status: str

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
    professional_name: str | None = None
    pending_reschedule: RescheduleProposalResponse | None = None

class ServiceRequestPublicResponse(BaseModel):
    id: uuid.UUID
    status: str
    service_type: str
    home_type: str
    bedrooms: str
    bathrooms: str
    has_pets: bool
    cep: str
    scheduled_date: date
    scheduled_time: time
    price: Decimal | None = None
    pending_reschedule: RescheduleProposalResponse | None = None

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

class ChatMessageItem(BaseModel):
    role: str
    content: str

class ChatMessage(BaseModel):
    history: list[ChatMessageItem]

class FirstAccessRequest(BaseModel):
    email: EmailStr
    first_access_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class ServiceRequestCreate(BaseModel):
    client_id: uuid.UUID | None = None
    professional_id: uuid.UUID | None = None
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

class RescheduleProposalCreate(BaseModel):
    proposed_date: date
    proposed_time: time
