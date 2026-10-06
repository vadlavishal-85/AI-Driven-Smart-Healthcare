import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.mysql import get_db
from app.models.auth import RoleEnum, User
from app.models.prescription_note import PrescriptionNote
from app.prescription_notes.schemas import PrescriptionNoteResponse, PrescriptionNoteUpdate

router = APIRouter(prefix="/prescription-notes", tags=["Prescription Notes"])
PRESCRIPTION_CODE_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,40}$")


def _require_clinician(user: User):
    role = user.role.name if user.role else ""
    if role not in {RoleEnum.DOCTOR.value, RoleEnum.ADMIN.value}:
        raise HTTPException(status_code=403, detail="Only doctors and administrators can manage prescription notes.")


@router.get("", response_model=list[PrescriptionNoteResponse])
def list_my_prescription_notes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_clinician(current_user)
    return db.query(PrescriptionNote).filter(
        PrescriptionNote.author_id == current_user.id,
    ).order_by(PrescriptionNote.prescription_code).all()


@router.put("/{prescription_code}", response_model=PrescriptionNoteResponse)
def save_prescription_note(
    prescription_code: str,
    request: PrescriptionNoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_clinician(current_user)
    if not PRESCRIPTION_CODE_PATTERN.fullmatch(prescription_code):
        raise HTTPException(status_code=422, detail="Invalid prescription code.")
    if not request.note.strip():
        raise HTTPException(status_code=422, detail="Enter a note before saving.")

    note = db.query(PrescriptionNote).filter(
        PrescriptionNote.author_id == current_user.id,
        PrescriptionNote.prescription_code == prescription_code,
    ).first()
    if note is None:
        note = PrescriptionNote(
            author_id=current_user.id,
            prescription_code=prescription_code,
            note=request.note.strip(),
        )
        db.add(note)
    else:
        note.note = request.note.strip()
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{prescription_code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription_note(
    prescription_code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_clinician(current_user)
    note = db.query(PrescriptionNote).filter(
        PrescriptionNote.author_id == current_user.id,
        PrescriptionNote.prescription_code == prescription_code,
    ).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Prescription note not found.")
    db.delete(note)
    db.commit()
