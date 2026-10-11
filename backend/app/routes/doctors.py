from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.models.user import User
from app.models.doctor import Doctor
from app.models.role import UserRole
from app.core.dependencies import require_roles
from app.schemas.doctor import DoctorResponse, DoctorUpdateRequest

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
