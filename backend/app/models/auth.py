from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship
from app.database.mysql import Base


# =====================================================================
# SQLAlchemy ORM Models (Mapped to existing MySQL schema)
# =====================================================================

class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<Role(id={self.id}, name='{self.name}')>"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    role = relationship("Role", lazy="joined")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}')>"


# =====================================================================
# Pydantic Schemas for Validation and Serialization
# =====================================================================

class RoleEnum(str, Enum):
    ADMIN = "ADMIN"
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"


class UserRegisterRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100, description="User first name")
    last_name: str = Field(..., min_length=1, max_length=100, description="User last name")
    email: EmailStr = Field(..., description="Valid unique email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (min 8 chars)")
    phone: Optional[str] = Field(None, max_length=20, description="Contact telephone number")
    role: RoleEnum = Field(default=RoleEnum.PATIENT, description="Target role (ADMIN self-selection forbidden)")


class UserLoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="User account password")


class UserResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: int
    email: str
    role: str
