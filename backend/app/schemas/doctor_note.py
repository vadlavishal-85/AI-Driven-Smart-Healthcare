from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class DoctorNoteCreate(BaseModel):
    patient_id: UUID
    medical_record_id: Optional[str] = None
    note: str = Field(..., min_length=1)


class DoctorNoteResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    medical_record_id: Optional[str] = None
    note: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
