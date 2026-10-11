from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.role import UserRole
from app.core.dependencies import require_roles
from app.schemas.patient import (
    PatientResponse,
    PatientUpdateRequest,
    PatientDoctorViewResponse,
)

router = APIRouter(prefix="/patients", tags=["Patients"])


def format_patient_response(patient: Patient) -> PatientResponse:
    user = patient.user
    return PatientResponse(
        id=patient.id,
        user_id=patient.user_id,
        full_name=user.full_name if user else "",
        email=user.email if user else "",
        phone=user.phone if user else None,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        blood_group=patient.blood_group,
        address=patient.address,
        emergency_contact=patient.emergency_contact,
        is_active=user.is_active if user else True,
        created_at=patient.created_at,
        updated_at=patient.updated_at,
    )


def format_patient_doctor_view(patient: Patient) -> PatientDoctorViewResponse:
    user = patient.user
    return PatientDoctorViewResponse(
        id=patient.id,
        user_id=patient.user_id,
        full_name=user.full_name if user else "",
        email=user.email if user else "",
        phone=user.phone if user else None,
        date_of_birth=patient.date_of_birth,
        gender=patient.gender,
        blood_group=patient.blood_group,
        created_at=patient.created_at,
    )


@router.get(
    "/me",
    response_model=PatientResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current patient's profile",
)
def get_current_patient_profile(
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated patient's own profile.
    """
    patient = (
        db.query(Patient).filter(Patient.user_id == current_user.id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )
    return format_patient_response(patient)


@router.put(
    "/me",
    response_model=PatientResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current patient's profile",
)
def update_current_patient_profile(
    request: PatientUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    """
    Updates the authenticated patient's permitted profile fields.
    Does not allow changing user_id, patient_id, role, or email.
    """
    patient = (
        db.query(Patient).filter(Patient.user_id == current_user.id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    # Update User fields if provided
    if request.full_name is not None:
        current_user.full_name = request.full_name
    if request.phone is not None:
        current_user.phone = request.phone

    # Update Patient fields if provided
    if request.date_of_birth is not None:
        patient.date_of_birth = request.date_of_birth
    if request.gender is not None:
        patient.gender = request.gender
    if request.blood_group is not None:
        patient.blood_group = request.blood_group
    if request.address is not None:
        patient.address = request.address
    if request.emergency_contact is not None:
        patient.emergency_contact = request.emergency_contact

    db.commit()
    db.refresh(patient)
    db.refresh(current_user)

    return format_patient_response(patient)


@router.get(
    "/for-doctor",
    response_model=List[PatientDoctorViewResponse],
    status_code=status.HTTP_200_OK,
    summary="Doctor get patient list for healthcare workflows",
)
def get_patients_for_doctor(
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Doctor-only endpoint returning a list of registered patients for selection.
    Does NOT expose medical records, diagnoses, or prescriptions.
    """
    patients = db.query(Patient).join(User).all()
    return [format_patient_doctor_view(p) for p in patients]


@router.get(
    "",
    response_model=List[PatientResponse],
    status_code=status.HTTP_200_OK,
    summary="Admin get all patients",
)
def get_all_patients(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint returning all registered patients with profile details.
    """
    patients = db.query(Patient).join(User).all()
    return [format_patient_response(p) for p in patients]


@router.get(
    "/{patient_id}",
    response_model=PatientResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin get patient by ID",
)
def get_patient_by_id(
    patient_id: UUID,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint returning a single patient by Patient UUID.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    return format_patient_response(patient)
