from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.mysql import get_db
from app.models.appointments import Appointment
from app.models.auth import RoleEnum, User

router = APIRouter(prefix="/patients", tags=["Patients"])


class PatientAccountResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    phone: str | None
    is_active: bool
    appointment_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientDeactivationResponse(BaseModel):
    message: str
    patient_id: int


def _role(user: User) -> str:
    return user.role.name if user.role else ""


@router.get("", response_model=list[PatientAccountResponse])
def list_patient_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List active patient accounts visible to admins or the assigned doctor."""
    role = _role(current_user)
    if role not in {RoleEnum.ADMIN.value, RoleEnum.DOCTOR.value}:
        raise HTTPException(status_code=403, detail="Only doctors and administrators can view the patient directory.")

    query = db.query(User).filter(
        User.is_active.is_(True),
        User.role.has(name=RoleEnum.PATIENT.value),
    )
    if role == RoleEnum.DOCTOR.value:
        query = query.join(
            Appointment,
            Appointment.patient_id == User.id,
        ).filter(Appointment.doctor_id == current_user.id).distinct()

    patients = query.order_by(User.last_name, User.first_name).all()
    results = []
    for patient in patients:
        appointment_count = db.query(Appointment.id).filter(Appointment.patient_id == patient.id).count()
        results.append(PatientAccountResponse(
            id=patient.id,
            first_name=patient.first_name,
            last_name=patient.last_name,
            email=patient.email,
            phone=patient.phone,
            is_active=patient.is_active,
            appointment_count=appointment_count,
            created_at=patient.created_at,
        ))
    return results


@router.delete("/{patient_id}", response_model=PatientDeactivationResponse)
def deactivate_patient_account(
    patient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deactivate a patient account while retaining its appointments and audit history."""
    role = _role(current_user)
    if role not in {RoleEnum.ADMIN.value, RoleEnum.DOCTOR.value}:
        raise HTTPException(status_code=403, detail="Only doctors and administrators can remove patient accounts.")

    query = db.query(User).filter(
        User.id == patient_id,
        User.role.has(name=RoleEnum.PATIENT.value),
    )
    if role == RoleEnum.DOCTOR.value:
        has_assignment = db.query(Appointment.id).filter(
            Appointment.patient_id == patient_id,
            Appointment.doctor_id == current_user.id,
        ).first()
        if not has_assignment:
            raise HTTPException(status_code=404, detail="Patient account not found.")

    patient = query.first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient account not found.")
    if not patient.is_active:
        raise HTTPException(status_code=409, detail="This patient account is already inactive.")

    patient.is_active = False
    db.commit()
    return PatientDeactivationResponse(
        patient_id=patient.id,
        message="Patient account deactivated. Appointment and clinical history have been retained.",
    )
