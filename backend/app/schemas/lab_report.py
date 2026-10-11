from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict


class LabReportCreate(BaseModel):
    patient_id: UUID
    doctor_id: UUID
    test_name: str = Field(..., min_length=1, max_length=255)
    test_date: datetime
    results: Dict[str, Any]
    remarks: Optional[str] = None


class LabReportResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    test_name: str
    test_date: datetime
    results: Dict[str, Any]
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
