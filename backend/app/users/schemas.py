from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserProfileResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100, description="User first name")
    last_name: Optional[str] = Field(None, min_length=1, max_length=100, description="User last name")
    phone: Optional[str] = Field(None, max_length=20, description="Contact telephone number")

    model_config = ConfigDict(extra="forbid")


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=1, description="Current account password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New account password (min 8 characters)")


class MessageResponse(BaseModel):
    status: str = "success"
    message: str
