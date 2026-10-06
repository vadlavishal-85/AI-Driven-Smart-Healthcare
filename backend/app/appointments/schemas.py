from datetime import date, datetime, time
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.appointments import AppointmentStatus


class DoctorOption(BaseModel):
    id: int
    name: str
    email: str
    department: str
    specialty: str


class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    appointment_time: time
    reason: str = Field(min_length=3, max_length=1000)

    model_config = ConfigDict(extra="forbid")


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus

    model_config = ConfigDict(extra="forbid")


class ClinicalInfoUpdate(BaseModel):
    diagnosis: Optional[str] = Field(None, max_length=500)
    treatment_plan: Optional[str] = Field(None, max_length=5000)
    clinical_notes: Optional[str] = Field(None, max_length=10000)

    model_config = ConfigDict(extra="forbid")


class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    department: str
    specialty: str
    appointment_date: date
    appointment_time: time
    reason: str
    status: AppointmentStatus
    diagnosis: Optional[str]
    treatment_plan: Optional[str]
    clinical_notes: Optional[str]
    created_at: datetime
    updated_at: datetime
