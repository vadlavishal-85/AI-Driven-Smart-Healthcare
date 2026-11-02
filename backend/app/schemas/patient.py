from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, EmailStr


class PatientResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    is_active: Optional[bool] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientCreateRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, max_length=50)


class PatientUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    blood_group: Optional[str] = Field(None, max_length=10)
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, max_length=50)


class PatientDoctorViewResponse(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

