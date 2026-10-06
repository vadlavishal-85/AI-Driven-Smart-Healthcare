from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.mysql import get_db
from app.models.appointments import Appointment, AppointmentStatus, DoctorProfile
from app.models.auth import RoleEnum, User
from app.appointments.schemas import (
    AppointmentCreate,
    AppointmentDetailsUpdate,
    AppointmentResponse,
    AppointmentStatusUpdate,
    ClinicalInfoUpdate,
    DoctorOption,
)

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def _role(user: User) -> str:
    return user.role.name if user.role else ""


def _doctor_name(user: User) -> str:
    name = f"{user.first_name} {user.last_name}".strip()
    return name if user.first_name.strip().lower() in {"dr", "dr."} else f"Dr. {name}"


def _response(appointment: Appointment) -> AppointmentResponse:
    doctor_profile = appointment.doctor.doctor_profile
    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=f"{appointment.patient.first_name} {appointment.patient.last_name}",
        doctor_id=appointment.doctor_id,
        doctor_name=_doctor_name(appointment.doctor),
        department=doctor_profile.department if doctor_profile else "General",
        specialty=doctor_profile.specialty if doctor_profile else "General Practice",
        appointment_date=appointment.appointment_date,
        appointment_time=appointment.appointment_time,
        reason=appointment.reason,
        status=appointment.status,
        diagnosis=appointment.diagnosis,
        treatment_plan=appointment.treatment_plan,
        clinical_notes=appointment.clinical_notes,
        created_at=appointment.created_at,
        updated_at=appointment.updated_at,
    )


@router.get("/doctors", response_model=list[DoctorOption])
def list_bookable_doctors(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _role(current_user) not in {RoleEnum.PATIENT.value, RoleEnum.DOCTOR.value, RoleEnum.ADMIN.value}:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    profiles = db.query(DoctorProfile).join(User).filter(User.is_active.is_(True)).order_by(User.last_name, User.first_name).all()
    return [
        DoctorOption(
            id=profile.user.id,
            name=_doctor_name(profile.user),
            email=profile.user.email,
            department=profile.department,
            specialty=profile.specialty,
        )
        for profile in profiles
    ]


@router.get("", response_model=list[AppointmentResponse])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    role = _role(current_user)
    query = db.query(Appointment).order_by(Appointment.appointment_date, Appointment.appointment_time)
    if role == RoleEnum.PATIENT.value:
        query = query.filter(Appointment.patient_id == current_user.id)
    elif role == RoleEnum.DOCTOR.value:
        query = query.filter(Appointment.doctor_id == current_user.id)
    elif role != RoleEnum.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    return [_response(appointment) for appointment in query.all()]


@router.post("", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(
    request: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _role(current_user) != RoleEnum.PATIENT.value:
        raise HTTPException(status_code=403, detail="Only patients can self-book an appointment.")
    if request.appointment_date < date.today():
        raise HTTPException(status_code=422, detail="Appointment date must be today or later.")

    doctor = (
        db.query(User)
        .join(DoctorProfile, DoctorProfile.user_id == User.id)
        .filter(User.id == request.doctor_id, User.is_active.is_(True))
        .first()
    )
    if not doctor:
        raise HTTPException(status_code=404, detail="The selected doctor is not available.")

    conflict = db.query(Appointment).filter(
        Appointment.doctor_id == doctor.id,
        Appointment.appointment_date == request.appointment_date,
        Appointment.appointment_time == request.appointment_time,
        Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
    ).first()
    if conflict:
        raise HTTPException(status_code=409, detail="That doctor already has an appointment at this time.")

    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=doctor.id,
        appointment_date=request.appointment_date,
        appointment_time=request.appointment_time,
        reason=request.reason.strip(),
        status=AppointmentStatus.SCHEDULED,
    )
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    return _response(appointment)


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    request: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    role = _role(current_user)
    target_status = request.status
    terminal_statuses = {
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
    }
    if appointment.status in terminal_statuses:
        raise HTTPException(status_code=409, detail="This appointment is already closed.")

    if role == RoleEnum.PATIENT.value:
        if appointment.patient_id != current_user.id:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        if target_status != AppointmentStatus.CANCELLED:
            raise HTTPException(status_code=403, detail="Patients may only cancel their own appointments.")
    elif role == RoleEnum.DOCTOR.value:
        if appointment.doctor_id != current_user.id:
            raise HTTPException(status_code=404, detail="Appointment not found.")
    elif role != RoleEnum.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    allowed_targets = {
        AppointmentStatus.SCHEDULED: {AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED},
        AppointmentStatus.CONFIRMED: {
            AppointmentStatus.COMPLETED,
            AppointmentStatus.NO_SHOW,
            AppointmentStatus.CANCELLED,
        },
    }
    if role == RoleEnum.PATIENT.value:
        valid_transition = target_status == AppointmentStatus.CANCELLED
    else:
        valid_transition = target_status in allowed_targets.get(appointment.status, set())
    if not valid_transition:
        raise HTTPException(status_code=422, detail="That appointment status change is not allowed.")

    appointment.status = target_status
    db.commit()
    db.refresh(appointment)
    return _response(appointment)


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment_details(
    appointment_id: int,
    request: AppointmentDetailsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update appointment date, time, or reason for an open appointment."""
    # Null values should not overwrite required appointment fields or reach
    # comparisons below as None; treat them as omitted and reject an empty patch.
    changes = request.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=422, detail="Provide at least one appointment field to update.")

    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")

    role = _role(current_user)
    if role == RoleEnum.PATIENT.value:
        if appointment.patient_id != current_user.id:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        if appointment.status != AppointmentStatus.SCHEDULED:
            raise HTTPException(status_code=409, detail="Patients can only edit appointments that are awaiting confirmation.")
    elif role == RoleEnum.DOCTOR.value:
        if appointment.doctor_id != current_user.id:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        if appointment.status not in {AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED}:
            raise HTTPException(status_code=409, detail="This appointment is already closed.")
    elif role == RoleEnum.ADMIN.value:
        if appointment.status not in {AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED}:
            raise HTTPException(status_code=409, detail="This appointment is already closed.")
    else:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    appointment_date = changes.get("appointment_date", appointment.appointment_date)
    appointment_time = changes.get("appointment_time", appointment.appointment_time)
    if appointment_date < date.today():
        raise HTTPException(status_code=422, detail="Appointment date must be today or later.")

    schedule_changed = (
        appointment_date != appointment.appointment_date
        or appointment_time != appointment.appointment_time
    )
    if schedule_changed:
        conflict = db.query(Appointment.id).filter(
            Appointment.id != appointment.id,
            Appointment.doctor_id == appointment.doctor_id,
            Appointment.appointment_date == appointment_date,
            Appointment.appointment_time == appointment_time,
            Appointment.status.in_([AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]),
        ).first()
        if conflict:
            raise HTTPException(status_code=409, detail="That doctor already has an appointment at this time.")

    for field, value in changes.items():
        setattr(appointment, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(appointment)
    return _response(appointment)


@router.patch("/{appointment_id}/clinical-info", response_model=AppointmentResponse)
def update_clinical_info(
    appointment_id: int,
    request: ClinicalInfoUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _role(current_user) != RoleEnum.DOCTOR.value:
        raise HTTPException(status_code=403, detail="Only the assigned doctor can update clinical information.")
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.doctor_id == current_user.id,
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    for field, value in request.model_dump(exclude_unset=True).items():
        setattr(appointment, field, value.strip() if isinstance(value, str) else value)
    db.commit()
    db.refresh(appointment)
    return _response(appointment)
