from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PrescriptionCreate(BaseModel):
    appointment_id: int
    medication: str = Field(min_length=2, max_length=240)
    strength: str = Field(min_length=1, max_length=100)
    dosage: str = Field(min_length=3, max_length=2000)
    quantity: str = Field(min_length=1, max_length=100)
    refills: int = Field(ge=0, le=20)
    pharmacy: str | None = Field(None, max_length=240)
    clinical_note: str | None = Field(None, max_length=3000)

    model_config = ConfigDict(extra="forbid")


class PrescriptionResponse(BaseModel):
    prescription_id: str
    appointment_id: int
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    medication: str
    strength: str
    dosage: str
    quantity: str
    refills: int
    pharmacy: str | None
    clinical_note: str | None
    status: str
    created_at: datetime
    shared_with_patient_at: datetime


class HospitalShareRequest(BaseModel):
    prescription_id: str = Field(min_length=1, max_length=48)
    destination_hospital: str = Field(min_length=2, max_length=200)
    patient_consent: bool
    include_visit_notes: bool = False

    model_config = ConfigDict(extra="forbid")


class HospitalShareResponse(BaseModel):
    share_id: str
    prescription_id: str
    patient_id: int
    destination_hospital: str
    protocol: str
    status: str
    created_at: datetime
    consent_confirmed_by: int
    consent_confirmed_as: str
    consent_confirmed_at: datetime
    payload_digest: str
    payload: dict[str, Any]


class DataExchangeEvent(BaseModel):
    share_id: str
    prescription_id: str
    patient_id: int
    patient_name: str
    doctor_id: int
    doctor_name: str
    destination_hospital: str
    protocol: str
    status: str
    created_at: datetime
    payload_digest: str
