from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.mysql import get_db
from app.models.appointments import Appointment, AppointmentStatus, DoctorProfile
from app.models.auth import RoleEnum, User
from app.appointments.schemas import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentStatusUpdate,
    ClinicalInfoUpdate,
    DoctorOption,
)

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def _role(user: User) -> str:
    return user.role.name if user.role else ""


def _response(appointment: Appointment) -> AppointmentResponse:
    doctor_profile = appointment.doctor.doctor_profile
    return AppointmentResponse(
        id=appointment.id,
        patient_id=appointment.patient_id,
        patient_name=f"{appointment.patient.first_name} {appointment.patient.last_name}",
        doctor_id=appointment.doctor_id,
        doctor_name=f"{appointment.doctor.first_name} {appointment.doctor.last_name}",
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
            name=f"{profile.user.first_name} {profile.user.last_name}",
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
    if role == RoleEnum.PATIENT.value:
        if appointment.patient_id != current_user.id:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        if target_status != AppointmentStatus.CANCELLED:
            raise HTTPException(status_code=403, detail="Patients may only cancel their own appointments.")
        if appointment.status in {AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW}:
            raise HTTPException(status_code=409, detail="This appointment can no longer be cancelled.")
    elif role == RoleEnum.DOCTOR.value:
        if appointment.doctor_id != current_user.id:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        if target_status == AppointmentStatus.CANCELLED:
            pass
        elif target_status not in {AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW}:
            raise HTTPException(status_code=422, detail="Doctors may confirm, complete, mark no-show, or cancel appointments.")
        if appointment.status in {AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW}:
            raise HTTPException(status_code=409, detail="This appointment is already closed.")
    elif role != RoleEnum.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access forbidden.")

    appointment.status = target_status
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
