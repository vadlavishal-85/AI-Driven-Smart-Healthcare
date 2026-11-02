import uuid
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.models.user import User
from app.models.doctor import Doctor
from app.models.role import UserRole
from app.core.dependencies import require_roles
from app.core.security import hash_password
from app.schemas.doctor import (
    DoctorResponse,
    DoctorCreateRequest,
    DoctorUpdateRequest,
)
from app.utils.access_logger import log_access

router = APIRouter(prefix="/doctors", tags=["Doctors"])



def format_doctor_response(doctor: Doctor) -> DoctorResponse:
    user = doctor.user
    return DoctorResponse(
        id=doctor.id,
        user_id=doctor.user_id,
        full_name=user.full_name if user else "",
        email=user.email if user else "",
        phone=user.phone if user else None,
        specialization=doctor.specialization,
        license_number=doctor.license_number,
        hospital_name=doctor.hospital_name,
        is_active=user.is_active if user else True,
        created_at=doctor.created_at,
        updated_at=doctor.updated_at,
    )


@router.get(
    "/me",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current doctor's profile",
)
def get_current_doctor_profile(
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Returns the authenticated doctor's own profile.
    """
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )
    return format_doctor_response(doctor)


@router.put(
    "/me",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current doctor's profile",
)
def update_current_doctor_profile(
    request: DoctorUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Updates the authenticated doctor's permitted profile fields.
    Does not allow changing user_id, doctor_id, role, email, or license_number.
    """
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    # Update User fields if provided
    if request.full_name is not None:
        current_user.full_name = request.full_name
    if request.phone is not None:
        current_user.phone = request.phone

    # Update Doctor fields if provided
    if request.specialization is not None:
        doctor.specialization = request.specialization
    if request.hospital_name is not None:
        doctor.hospital_name = request.hospital_name

    db.commit()
    db.refresh(doctor)
    db.refresh(current_user)

    return format_doctor_response(doctor)


@router.post(
    "",
    response_model=DoctorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Admin registers a new doctor",
)
def create_doctor(
    request: DoctorCreateRequest,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint for registering a new physician account and profile.
    Enforces unique email and license number, hashes password with bcrypt,
    and initializes doctor profile in PostgreSQL.
    """
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered in system",
        )

    existing_license = (
        db.query(Doctor)
        .filter(Doctor.license_number == request.license_number)
        .first()
    )
    if existing_license:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Medical license number already registered",
        )

    hashed_password = hash_password(request.password)

    new_user = User(
        id=uuid.uuid4(),
        full_name=request.full_name,
        email=request.email,
        password_hash=hashed_password,
        role=UserRole.DOCTOR,
        phone=request.phone,
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    new_doctor = Doctor(
        id=uuid.uuid4(),
        user_id=new_user.id,
        specialization=request.specialization,
        license_number=request.license_number,
        hospital_name=request.hospital_name,
    )
    db.add(new_doctor)

    log_access(
        db=db,
        user_id=current_user.id,
        action="CREATE_DOCTOR",
        resource_type="Doctor",
        resource_id=str(new_doctor.id),
    )

    db.commit()
    db.refresh(new_doctor)
    db.refresh(new_user)

    return format_doctor_response(new_doctor)


@router.get(
    "",
    response_model=List[DoctorResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all doctors",
)
def get_all_doctors(
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PATIENT, UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Endpoint returning a list of all registered doctors with user details.
    """
    doctors = db.query(Doctor).join(User).all()
    return [format_doctor_response(d) for d in doctors]


@router.get(
    "/directory",
    status_code=status.HTTP_200_OK,
    summary="Public medical department and doctor directory",
)
def get_public_department_directory(db: Session = Depends(get_db)):
    """
    Public directory of supported departments and active doctors.
    Provides medical department preview without exposing private credentials, tokens, or patient info.
    """
    doctors = db.query(Doctor).join(User).filter(User.is_active == True).all()
    departments = {}
    for doc in doctors:
        dept = doc.specialization or "General Medicine"
        if dept not in departments:
            departments[dept] = {
                "department": dept,
                "doctor_count": 0,
                "doctors": [],
            }
        departments[dept]["doctor_count"] += 1
        departments[dept]["doctors"].append({
            "id": str(doc.id),
            "full_name": doc.user.full_name if doc.user else "Physician",
            "specialization": doc.specialization,
            "hospital_name": doc.hospital_name,
        })
    return list(departments.values())


@router.get(
    "/{doctor_id}",
    response_model=DoctorResponse,
    status_code=status.HTTP_200_OK,
    summary="Get doctor by ID",
)
def get_doctor_by_id(
    doctor_id: UUID,
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.PATIENT, UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Endpoint returning a single doctor profile by Doctor UUID.
    """
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    return format_doctor_response(doctor)


@router.delete(
    "/{doctor_id}",
    status_code=status.HTTP_200_OK,
    summary="Admin safely removes/deactivates doctor account",
)
def delete_doctor(
    doctor_id: UUID,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint for doctor account removal.
    Uses safe soft-deactivation (is_active=False) to safeguard clinical records,
    appointments, prescriptions, and audit trail integrity.
    """
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    if doctor.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete or deactivate their own account",
        )

    target_user = doctor.user
    if target_user and target_user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete or deactivate administrator accounts",
        )

    # Soft-delete to preserve all clinical associations and history
    if target_user:
        target_user.is_active = False

    log_access(
        db=db,
        user_id=current_user.id,
        action="DEACTIVATE_DOCTOR",
        resource_type="Doctor",
        resource_id=str(doctor.id),
    )
    db.commit()

    return {
        "message": f"Doctor {target_user.full_name if target_user else 'physician'} has been safely deactivated.",
        "id": str(doctor.id),
        "is_active": False,
    }
