from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class MedicalRecordCreate(BaseModel):
    patient_id: UUID
    record_type: str = Field("CONSULTATION", max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    diagnosis: str = Field(..., min_length=1)
    symptoms: List[str] = Field(default_factory=list)
    treatment: str = Field(..., min_length=1)


class MedicalRecordUpdate(BaseModel):
    record_type: Optional[str] = Field(None, max_length=50)
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    diagnosis: Optional[str] = None
    symptoms: Optional[List[str]] = None
    treatment: Optional[str] = None


class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    record_type: str
    title: str
    description: Optional[str] = None
    diagnosis: str
    symptoms: List[str] = Field(default_factory=list)
    treatment: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
