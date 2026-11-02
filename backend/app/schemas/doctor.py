from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, EmailStr


class DoctorResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    specialization: str
    license_number: str
    hospital_name: Optional[str] = None
    is_active: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DoctorCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    specialization: str = Field(..., min_length=1, max_length=100)
    license_number: str = Field(..., min_length=1, max_length=100)
    hospital_name: Optional[str] = Field(None, max_length=255)


class DoctorUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    specialization: Optional[str] = Field(None, min_length=1, max_length=100)
    hospital_name: Optional[str] = Field(None, max_length=255)

