from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, func

from app.database.mysql import Base


class PrescriptionNote(Base):
    __tablename__ = "prescription_notes"
    __table_args__ = (
        UniqueConstraint("author_id", "prescription_code", name="uq_prescription_note_author_code"),
    )

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    prescription_code = Column(String(40), nullable=False, index=True)
    note = Column(Text, nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
