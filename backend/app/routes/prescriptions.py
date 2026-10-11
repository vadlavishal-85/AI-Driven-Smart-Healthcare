from datetime import datetime, timezone
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.database.mongodb import (
    prescriptions_collection,
    medical_records_collection,
)
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.role import UserRole
from app.core.dependencies import get_current_user, require_roles
from app.schemas.prescription import (
    PrescriptionCreate,
    PrescriptionResponse,
)
from app.utils.mongo import parse_object_id, format_doc

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post(
    "",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Doctor creates prescription",
)
def create_prescription(
    request: PrescriptionCreate,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    # Validate patient in PostgreSQL
    patient = (
        db.query(Patient).filter(Patient.id == request.patient_id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Validate medical record in MongoDB
    rec_obj_id = parse_object_id(request.medical_record_id)
    med_rec = medical_records_collection.find_one({"_id": rec_obj_id})
    if not med_rec:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found",
        )

    # Validate doctor and patient ownership of parent medical record
    if med_rec.get("doctor_id") != str(doctor.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Medical record was not created by you",
        )
    if med_rec.get("patient_id") != str(request.patient_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Medical record does not belong to requested patient",
        )

    now = datetime.now(timezone.utc)
    prescription_doc = {
        "patient_id": str(request.patient_id),
        "doctor_id": str(doctor.id),
        "medical_record_id": str(request.medical_record_id),
        "medicines": [m.model_dump() for m in request.medicines],
        "notes": request.notes,
        "created_at": now,
        "updated_at": now,
    }

    result = prescriptions_collection.insert_one(prescription_doc)
    prescription_doc["_id"] = result.inserted_id

    return format_doc(prescription_doc)


@router.get(
    "/my",
    response_model=List[PrescriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="Patient views own prescriptions",
)
def get_my_prescriptions(
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

    prescriptions = list(
        prescriptions_collection.find(
            {"patient_id": str(patient.id)}
        ).sort("created_at", -1)
    )
    return [format_doc(p) for p in prescriptions]


@router.get(
    "/patient/{patient_id}",
    response_model=List[PrescriptionResponse],
    status_code=status.HTTP_200_OK,
    summary="Doctor views own prescriptions for a patient",
)
def get_patient_prescriptions(
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

    prescriptions = list(
        prescriptions_collection.find(
            {"patient_id": str(patient_id), "doctor_id": str(doctor.id)}
        ).sort("created_at", -1)
    )
    return [format_doc(p) for p in prescriptions]


@router.get(
    "/{prescription_id}",
    response_model=PrescriptionResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single prescription with ownership verification",
)
def get_prescription_by_id(
    prescription_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj_id = parse_object_id(prescription_id)
    prescription = prescriptions_collection.find_one({"_id": obj_id})
    if not prescription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prescription not found",
        )

    if current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor or prescription.get("doctor_id") != str(doctor.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You are not the prescribing doctor",
            )
    elif current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient or prescription.get("patient_id") != str(patient.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this prescription",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Insufficient permissions to view prescription",
        )

    return format_doc(prescription)
