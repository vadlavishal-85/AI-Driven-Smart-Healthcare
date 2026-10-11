from datetime import datetime, timezone
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.database.mongodb import (
    doctor_notes_collection,
    medical_records_collection,
)
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.role import UserRole
from app.core.dependencies import get_current_user, require_roles
from app.schemas.doctor_note import (
    DoctorNoteCreate,
    DoctorNoteResponse,
)
from app.utils.mongo import parse_object_id, format_doc

router = APIRouter(prefix="/doctor-notes", tags=["Doctor Notes"])


@router.post(
    "",
    response_model=DoctorNoteResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Doctor creates clinical note",
)
def create_doctor_note(
    request: DoctorNoteCreate,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    patient = (
        db.query(Patient).filter(Patient.id == request.patient_id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Optional medical record validation
    if request.medical_record_id:
        rec_obj_id = parse_object_id(request.medical_record_id)
        med_rec = medical_records_collection.find_one({"_id": rec_obj_id})
        if not med_rec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referenced medical record not found",
            )
        if med_rec.get("doctor_id") != str(doctor.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Medical record was not authored by you",
            )
        if med_rec.get("patient_id") != str(request.patient_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Medical record does not belong to specified patient",
            )

    now = datetime.now(timezone.utc)
    note_doc = {
        "patient_id": str(request.patient_id),
        "doctor_id": str(doctor.id),
        "medical_record_id": (
            str(request.medical_record_id) if request.medical_record_id else None
        ),
        "note": request.note,
        "created_at": now,
        "updated_at": now,
    }

    result = doctor_notes_collection.insert_one(note_doc)
    note_doc["_id"] = result.inserted_id

    return format_doc(note_doc)


@router.get(
    "/my",
    response_model=List[DoctorNoteResponse],
    status_code=status.HTTP_200_OK,
    summary="Patient views own doctor notes",
)
def get_my_doctor_notes(
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient).filter(Patient.user_id == current_user.id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    notes = list(
        doctor_notes_collection.find({"patient_id": str(patient.id)}).sort(
            "created_at", -1
        )
    )
    return [format_doc(n) for n in notes]


@router.get(
    "/patient/{patient_id}",
    response_model=List[DoctorNoteResponse],
    status_code=status.HTTP_200_OK,
    summary="Doctor views own notes for a patient",
)
def get_patient_doctor_notes(
    patient_id: UUID,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    notes = list(
        doctor_notes_collection.find(
            {"patient_id": str(patient_id), "doctor_id": str(doctor.id)}
        ).sort("created_at", -1)
    )
    return [format_doc(n) for n in notes]


@router.get(
    "/{note_id}",
    response_model=DoctorNoteResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single doctor note with ownership verification",
)
def get_doctor_note_by_id(
    note_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj_id = parse_object_id(note_id)
    note = doctor_notes_collection.find_one({"_id": obj_id})
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor note not found",
        )

    if current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor or note.get("doctor_id") != str(doctor.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You are not the author doctor of this note",
            )
    elif current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient or note.get("patient_id") != str(patient.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this doctor note",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Insufficient permissions to view doctor note",
        )

    return format_doc(note)

