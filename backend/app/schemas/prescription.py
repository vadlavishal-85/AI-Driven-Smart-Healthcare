from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class PrescriptionMedicine(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    dosage: str = Field(..., min_length=1, max_length=100)
    frequency: str = Field(..., min_length=1, max_length=100)
    duration: str = Field(..., min_length=1, max_length=100)
    instructions: Optional[str] = None


class PrescriptionCreate(BaseModel):
    patient_id: UUID
    medical_record_id: str
    medicines: List[PrescriptionMedicine] = Field(..., min_length=1)
    notes: Optional[str] = None


class PrescriptionResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    medical_record_id: str
    medicines: List[PrescriptionMedicine]
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
