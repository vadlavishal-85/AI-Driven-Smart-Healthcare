import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.postgres import Base


class DataSharing(Base):
    __tablename__ = "data_sharing"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    doctor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("doctors.id", ondelete="CASCADE"),
        nullable=False,
    )
    patient_id = Column(
        UUID(as_uuid=True),
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
    )
    record_id = Column(String(100), nullable=False)
    shared_at = Column(
        DateTime(timezone=True), default=func.now(), nullable=False
    )
    status = Column(String(20), nullable=False, default="PENDING")

    doctor = relationship("Doctor")
    patient = relationship("Patient")
