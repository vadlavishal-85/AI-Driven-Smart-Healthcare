from enum import Enum

from sqlalchemy import Column, Date, DateTime, Enum as SQLEnum, ForeignKey, Integer, String, Text, Time, func
from sqlalchemy.orm import relationship

from app.database.mysql import Base


class AppointmentStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    NO_SHOW = "NO_SHOW"


class DoctorProfile(Base):
    __tablename__ = "doctor_profiles"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    department = Column(String(120), nullable=False)
    specialty = Column(String(180), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="doctor_profile", lazy="joined")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True)
    appointment_date = Column(Date, nullable=False, index=True)
    appointment_time = Column(Time, nullable=False)
    reason = Column(String(1000), nullable=False)
    status = Column(SQLEnum(AppointmentStatus, native_enum=False, length=20), nullable=False, default=AppointmentStatus.SCHEDULED)
    diagnosis = Column(String(500), nullable=True)
    treatment_plan = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    patient = relationship("User", foreign_keys=[patient_id], lazy="joined")
    doctor = relationship("User", foreign_keys=[doctor_id], lazy="joined")
