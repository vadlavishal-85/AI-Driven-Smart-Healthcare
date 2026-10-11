from datetime import datetime, timezone
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.appointment import Appointment
from app.models.role import UserRole
from app.core.dependencies import require_roles
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentUpdateRequest,
    AppointmentResponse,
    DoctorAppointmentSummary,
    PatientAppointmentSummary,
)

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def format_appointment_response(
    appointment: Appointment,
) -> AppointmentResponse:
    doc_summary = None
    if appointment.doctor:
        doc_user = appointment.doctor.user
        doc_summary = DoctorAppointmentSummary(
            id=appointment.doctor.id,
            full_name=doc_user.full_name if doc_user else "Doctor",
            specialization=appointment.doctor.specialization,
            hospital_name=appointment.doctor.hospital_name,
        )

    pat_summary = None
    if appointment.patient:
        pat_user = appointment.patient.user
        pat_summary = PatientAppointmentSummary(
            id=appointment.patient.id,
            full_name=pat_user.full_name if pat_user else "Patient",
        )

    return AppointmentResponse(
        id=appointment.id,
        doctor_id=appointment.doctor_id,
        patient_id=appointment.patient_id,
        appointment_date=appointment.appointment_date,
        status=appointment.status,
        reason=appointment.reason,
        notes=appointment.notes,
        created_at=appointment.created_at,
        updated_at=appointment.updated_at,
        doctor=doc_summary,
        patient=pat_summary,
    )


@router.get(
    "/my",
    response_model=List[AppointmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Patient views own appointments",
)
def get_my_appointments(
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    """
    Returns all appointments scheduled for the authenticated patient.
    """
    patient = (
        db.query(Patient).filter(Patient.user_id == current_user.id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    appointments = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient.id)
        .order_by(Appointment.appointment_date.desc())
        .all()
    )
    return [format_appointment_response(a) for a in appointments]


@router.get(
    "/doctor",
    response_model=List[AppointmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Doctor views own appointments",
)
def get_doctor_appointments(
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Returns all appointments scheduled with the authenticated doctor.
    """
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    appointments = (
        db.query(Appointment)
        .filter(
            (Appointment.doctor_id == doctor.id)
            | (Appointment.doctor_id == current_user.id)
        )
        .order_by(Appointment.appointment_date.desc())
        .all()
    )
    return [format_appointment_response(a) for a in appointments]


@router.post(
    "",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Patient creates appointment",
)
def create_appointment(
    request: AppointmentCreateRequest,
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    """
    Creates a new SCHEDULED appointment for the authenticated patient.
    Enforces doctor validation, active doctor check, future date check, and double-booking protection.
    """
    # 1. Locate patient profile
    patient = (
        db.query(Patient).filter(Patient.user_id == current_user.id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    # 2. Locate doctor profile (matching doctor.id or doctor.user_id)
    doctor = (
        db.query(Doctor)
        .filter(
            (Doctor.id == request.doctor_id)
            | (Doctor.user_id == request.doctor_id)
        )
        .first()
    )
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )

    # 3. Check doctor user existence and active status
    doc_user = doctor.user
    if not doc_user or doc_user.role != "DOCTOR":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    if not doc_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Doctor is not currently active",
        )

    # 4. Validate appointment date (cannot be in the past)
    now_utc = datetime.now(timezone.utc)
    apt_date = request.appointment_date
    if apt_date.tzinfo is None:
        apt_date = apt_date.replace(tzinfo=timezone.utc)
    if apt_date <= now_utc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointment date cannot be in the past",
        )

    # 5. Double booking protection (same doctor and exact time)
    conflict = (
        db.query(Appointment)
        .filter(
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date == request.appointment_date,
            Appointment.status == "SCHEDULED",
        )
        .first()
    )
    if conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Doctor already has an appointment at this time",
        )

    # 6. Create appointment linked directly to doctor.id
    new_appointment = Appointment(
        doctor_id=doctor.id,
        patient_id=patient.id,
        appointment_date=request.appointment_date,
        reason=request.reason,
        status="SCHEDULED",
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return format_appointment_response(new_appointment)


@router.put(
    "/{appointment_id}/cancel",
    response_model=AppointmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Cancel scheduled appointment",
)
def cancel_appointment(
    appointment_id: UUID,
    current_user: User = Depends(require_roles(UserRole.PATIENT, UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Cancels a scheduled appointment. Authorized for the owning patient or assigned doctor.
    """
    appointment = (
        db.query(Appointment).filter(Appointment.id == appointment_id).first()
    )
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    # Ownership check based on role
    if current_user.role == UserRole.PATIENT.value:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient or appointment.patient_id != patient.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this appointment",
            )
    elif current_user.role == UserRole.DOCTOR.value:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor or (
            appointment.doctor_id != doctor.id and appointment.doctor_id != current_user.id
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You are not the assigned doctor for this appointment",
            )

    # State check: only SCHEDULED can be cancelled
    if appointment.status != "SCHEDULED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel appointment with status {appointment.status}",
        )

    appointment.status = "CANCELLED"
    db.commit()
    db.refresh(appointment)

    return format_appointment_response(appointment)


@router.put(
    "/{appointment_id}",
    response_model=AppointmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Doctor updates appointment",
)
def update_doctor_appointment(
    appointment_id: UUID,
    request: AppointmentUpdateRequest,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    """
    Doctor updates permitted fields of their own appointment.
    Does not allow modifying doctor_id or patient_id.
    """
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    appointment = (
        db.query(Appointment).filter(Appointment.id == appointment_id).first()
    )
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )

    # Ownership check
    if appointment.doctor_id != doctor.id and appointment.doctor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You are not the assigned doctor for this appointment",
        )

    # Update permitted fields
    if request.appointment_date is not None:
        appointment.appointment_date = request.appointment_date
    if request.reason is not None:
        appointment.reason = request.reason
    if request.notes is not None:
        appointment.notes = request.notes
    if request.status is not None:
        appointment.status = request.status

    db.commit()
    db.refresh(appointment)

    return format_appointment_response(appointment)


@router.get(
    "",
    response_model=List[AppointmentResponse],
    status_code=status.HTTP_200_OK,
    summary="Admin views all appointments",
)
def get_all_appointments(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint returning all appointments in the ecosystem.
    """
    appointments = (
        db.query(Appointment)
        .order_by(Appointment.appointment_date.desc())
        .all()
    )
    return [format_appointment_response(a) for a in appointments]


@router.get(
    "/{appointment_id}",
    response_model=AppointmentResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin views appointment by ID",
)
def get_appointment_by_id(
    appointment_id: UUID,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only endpoint returning a single appointment by UUID.
    """
    appointment = (
        db.query(Appointment).filter(Appointment.id == appointment_id).first()
    )
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found",
        )
    return format_appointment_response(appointment)
