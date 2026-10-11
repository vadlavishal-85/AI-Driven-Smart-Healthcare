from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict, field_validator


class DoctorAppointmentSummary(BaseModel):
    id: UUID
    full_name: str
    specialization: str
    hospital_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class PatientAppointmentSummary(BaseModel):
    id: UUID
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class AppointmentCreateRequest(BaseModel):
    doctor_id: UUID
    appointment_date: datetime
    reason: Optional[str] = Field(None, max_length=500)


class AppointmentUpdateRequest(BaseModel):
    appointment_date: Optional[datetime] = None
    reason: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v_upper = v.upper().strip()
            if v_upper not in {"SCHEDULED", "COMPLETED", "CANCELLED"}:
                raise ValueError(
                    "Status must be one of: SCHEDULED, COMPLETED, CANCELLED"
                )
            return v_upper
        return v


class AppointmentResponse(BaseModel):
    id: UUID
    doctor_id: UUID
    patient_id: UUID
    appointment_date: datetime
    status: str
    reason: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    doctor: Optional[DoctorAppointmentSummary] = None
    patient: Optional[PatientAppointmentSummary] = None

    model_config = ConfigDict(from_attributes=True)
