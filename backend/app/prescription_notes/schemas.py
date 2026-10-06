from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PrescriptionNoteUpdate(BaseModel):
    note: str = Field(max_length=5000)

    model_config = ConfigDict(extra="forbid")


class PrescriptionNoteResponse(BaseModel):
    prescription_code: str
    note: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
