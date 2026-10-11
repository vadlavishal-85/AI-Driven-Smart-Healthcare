from datetime import datetime
from typing import Optional, Dict, Any, Literal
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

AllowedRecordType = Literal[
    "medical_record",
    "prescription",
    "doctor_note",
    "lab_report",
]


class DataSharingCreate(BaseModel):
    patient_id: UUID = Field(..., description="PostgreSQL patient UUID")
    record_id: str = Field(..., description="MongoDB record ObjectId as string")
    record_type: AllowedRecordType = Field(
        ...,
        description="Type of healthcare document (medical_record, prescription, doctor_note, lab_report)",
    )


class DataSharingResponse(BaseModel):
    id: UUID
    doctor_id: UUID
    patient_id: UUID
    record_id: str
    record_type: Optional[str] = None
    shared_at: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)


class SharedRecordDetailResponse(BaseModel):
    sharing: DataSharingResponse
    record: Dict[str, Any]
