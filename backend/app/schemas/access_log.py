from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class AccessLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
