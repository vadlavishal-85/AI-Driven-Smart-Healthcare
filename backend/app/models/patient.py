from datetime import datetime, date
from enum import Enum
from typing import Optional
from sqlalchemy import Column, Integer, String, Date, DateTime, Enum as SQLEnum, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database.mysql import Base


class GenderEnum(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(SQLEnum(GenderEnum), nullable=False)
    blood_group = Column(String(10), nullable=True)
    emergency_contact_name = Column(String(150), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", lazy="joined")

    def __repr__(self):
        return f"<Patient(id={self.id}, user_id={self.user_id}, gender='{self.gender}')>"
