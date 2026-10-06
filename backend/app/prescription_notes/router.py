import re
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.dependencies import get_current_user
from app.database.mongodb import get_clinical_database
from app.models.auth import RoleEnum, User
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
):
    _require_clinician(current_user)
    notes = get_clinical_database().prescription_notes.find(
        {"author_id": current_user.id},
        {"_id": 0, "prescription_code": 1, "note": 1, "updated_at": 1},
    ).sort("prescription_code", 1)
    return list(notes)


@router.put("/{prescription_code}", response_model=PrescriptionNoteResponse)
def save_prescription_note(
    prescription_code: str,
    request: PrescriptionNoteUpdate,
    current_user: User = Depends(get_current_user),
):
    _require_clinician(current_user)
    if not PRESCRIPTION_CODE_PATTERN.fullmatch(prescription_code):
        raise HTTPException(status_code=422, detail="Invalid prescription code.")
    if not request.note.strip():
        raise HTTPException(status_code=422, detail="Enter a note before saving.")

    note = {
        "author_id": current_user.id,
        "prescription_code": prescription_code,
        "note": request.note.strip(),
        "updated_at": datetime.now(timezone.utc),
    }
    get_clinical_database().prescription_notes.update_one(
        {"author_id": current_user.id, "prescription_code": prescription_code},
        {"$set": note, "$setOnInsert": {"created_at": note["updated_at"]}},
        upsert=True,
    )
    return note


@router.delete("/{prescription_code}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription_note(
    prescription_code: str,
    current_user: User = Depends(get_current_user),
):
    _require_clinician(current_user)
    result = get_clinical_database().prescription_notes.delete_one(
        {"author_id": current_user.id, "prescription_code": prescription_code},
    )
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Prescription note not found.")
