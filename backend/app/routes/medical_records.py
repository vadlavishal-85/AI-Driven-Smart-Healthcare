from datetime import datetime, timezone
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.database.mongodb import medical_records_collection
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.role import UserRole
from app.core.dependencies import get_current_user, require_roles
from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordUpdate,
    MedicalRecordResponse,
)
from app.utils.mongo import parse_object_id, format_doc

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])


@router.post(
    "",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Doctor creates medical record",
)
def create_medical_record(
    request: MedicalRecordCreate,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    # Locate authenticated doctor
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    # Validate patient existence in PostgreSQL
    patient = (
        db.query(Patient).filter(Patient.id == request.patient_id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    now = datetime.now(timezone.utc)
    record_doc = {
        "patient_id": str(request.patient_id),
        "doctor_id": str(doctor.id),
        "record_type": request.record_type,
        "title": request.title,
        "description": request.description,
        "diagnosis": request.diagnosis,
        "symptoms": request.symptoms,
        "treatment": request.treatment,
        "created_at": now,
        "updated_at": now,
    }

    result = medical_records_collection.insert_one(record_doc)
    record_doc["_id"] = result.inserted_id

    return format_doc(record_doc)


@router.get(
    "/my",
    response_model=List[MedicalRecordResponse],
    status_code=status.HTTP_200_OK,
    summary="Patient views own medical records",
)
def get_my_medical_records(
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

    records = list(
        medical_records_collection.find(
            {"patient_id": str(patient.id)}
        ).sort("created_at", -1)
    )
    return [format_doc(r) for r in records]


@router.get(
    "/patient/{patient_id}",
    response_model=List[MedicalRecordResponse],
    status_code=status.HTTP_200_OK,
    summary="Doctor views own records for a patient",
)
def get_patient_medical_records(
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

    # Validate patient exists in PostgreSQL
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    records = list(
        medical_records_collection.find(
            {"patient_id": str(patient_id), "doctor_id": str(doctor.id)}
        ).sort("created_at", -1)
    )
    return [format_doc(r) for r in records]


@router.get(
    "/{record_id}",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single medical record with ownership verification",
)
def get_medical_record_by_id(
    record_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj_id = parse_object_id(record_id)
    record = medical_records_collection.find_one({"_id": obj_id})
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found",
        )

    # Check ownership based on user role
    if current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor or record.get("doctor_id") != str(doctor.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You are not the author doctor of this record",
            )
    elif current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient or record.get("patient_id") != str(patient.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this medical record",
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Insufficient permissions to view medical record",
        )

    return format_doc(record)


@router.put(
    "/{record_id}",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_200_OK,
    summary="Doctor updates own medical record",
)
def update_medical_record(
    record_id: str,
    request: MedicalRecordUpdate,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    obj_id = parse_object_id(record_id)
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    record = medical_records_collection.find_one({"_id": obj_id})
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medical record not found",
        )

    # Ownership check
    if record.get("doctor_id") != str(doctor.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot modify another doctor's medical record",
        )

    update_fields = {}
    if request.record_type is not None:
        update_fields["record_type"] = request.record_type
    if request.title is not None:
        update_fields["title"] = request.title
    if request.description is not None:
        update_fields["description"] = request.description
    if request.diagnosis is not None:
        update_fields["diagnosis"] = request.diagnosis
    if request.symptoms is not None:
        update_fields["symptoms"] = request.symptoms
    if request.treatment is not None:
        update_fields["treatment"] = request.treatment

    update_fields["updated_at"] = datetime.now(timezone.utc)

    medical_records_collection.update_one(
        {"_id": obj_id}, {"$set": update_fields}
    )
    updated_record = medical_records_collection.find_one({"_id": obj_id})

    return format_doc(updated_record)
