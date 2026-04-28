import uuid
from datetime import datetime, date, time, timezone
from decimal import Decimal
from sqlalchemy import Column, Numeric

from sqlmodel import SQLModel, Field, Relationship, Column, JSON

class Client(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    whatsapp_number: str
    email: str | None = None
    password: str | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Relationship
    service_requests: list["ServiceRequest"] = Relationship(back_populates="client")


class Professional(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    whatsapp_number: str | None = None
    email: str | None = None
    password: str | None = None
    specialty: str | None = None
    profile_picture_url: str | None = None
    rating: float = Field(default=0.0)
    review_count: int = Field(default=0)
    is_verified: bool = Field(default=False)
    
    # JSON column for badges
    badges: list[str] | None = Field(default=None, sa_column=Column(JSON))
    
    wallet_available: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    wallet_escrow: Decimal = Field(default=Decimal("0.00"), max_digits=10, decimal_places=2)
    
    # Relationship
    service_requests: list["ServiceRequest"] = Relationship(back_populates="professional")


class ServiceRequest(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    
    # Foreign Keys
    client_id: uuid.UUID = Field(foreign_key="client.id")
    professional_id: uuid.UUID | None = Field(default=None, foreign_key="professional.id")
    
    status: str = Field(default="Pendente")
    service_type: str
    home_type: str
    bedrooms: str
    bathrooms: str
    has_pets: bool
    cep: str
    address: str
    scheduled_date: date
    scheduled_time: time
    
    price: Decimal | None = Field(default=None, sa_column=Column(Numeric(10, 2)))
    payment_status: str = Field(default="Pendente")
    
    # Relationships
    client: Client = Relationship(back_populates="service_requests")
    professional: Professional | None = Relationship(back_populates="service_requests")

class Waitlist(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str
    phone: str | None = None
    intended_role: str | None = None  # "customer" or "provider"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
