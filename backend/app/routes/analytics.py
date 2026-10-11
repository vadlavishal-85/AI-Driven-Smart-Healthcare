from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.role import UserRole
from app.core.dependencies import get_current_user, require_roles
from app.schemas.analytics import (
    UserAnalyticsResponse,
    AppointmentAnalyticsResponse,
    AppointmentTrendResponse,
    HealthcareDocumentAnalyticsResponse,
    DataSharingAnalyticsResponse,
    NotificationAnalyticsResponse,
    AccessLogAnalyticsResponse,
    RecentActivityResponse,
    TopDoctorsResponse,
    AnalyticsOverviewResponse,
)
from app.services.analytics_service import (
    get_user_analytics,
    get_appointment_analytics,
    get_appointment_trend,
    get_healthcare_document_analytics,
    get_data_sharing_analytics,
    get_notification_analytics,
    get_access_log_analytics,
    get_recent_activity,
    get_top_doctors,
    get_admin_overview,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def parse_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%Y-%m-%d").replace(
            tzinfo=timezone.utc
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD",
        )


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin high-level ecosystem overview metrics",
)
def get_system_overview(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated system-wide overview metrics across users, appointments,
    documents, sharing permissions, and notifications. Restricted to ADMIN.
    """
    return get_admin_overview(db)


@router.get(
    "/users",
    response_model=UserAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin user population metrics by role",
)
def get_user_statistics(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated user counts grouped by system roles. Restricted to ADMIN.
    """
    return get_user_analytics(db)


@router.get(
    "/appointments",
    response_model=AppointmentAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Appointment status metrics with role-based filtering",
)
def get_appointments_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns appointment status distribution:
    - ADMIN: system-wide
    - DOCTOR: authenticated doctor only
    - PATIENT: authenticated patient only
    - LAB: 403 Forbidden
    """
    if current_user.role == UserRole.ADMIN:
        return get_appointment_analytics(db)
    elif current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found",
            )
        return get_appointment_analytics(db, doctor_id=doctor.id)
    elif current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found",
            )
        return get_appointment_analytics(db, patient_id=patient.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Role not authorized for appointment analytics",
        )


@router.get(
    "/appointments/trend",
    response_model=AppointmentTrendResponse,
    status_code=status.HTTP_200_OK,
    summary="Monthly appointment trend with optional date range filter",
)
def get_appointments_trend(
    start_date: Optional[str] = Query(
        None, description="Start date filter (YYYY-MM-DD)"
    ),
    end_date: Optional[str] = Query(
        None, description="End date filter (YYYY-MM-DD)"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns monthly appointment trend:
    - ADMIN: system-wide trend
    - DOCTOR: authenticated doctor only
    - PATIENT: authenticated patient only
    - LAB: 403 Forbidden
    """
    start_dt = parse_date(start_date)
    end_dt = parse_date(end_date)

    if start_dt and end_dt and start_dt > end_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date range: start_date must be before or equal to end_date",
        )

    if current_user.role == UserRole.ADMIN:
        return get_appointment_trend(
            db, start_dt=start_dt, end_dt=end_dt
        )
    elif current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found",
            )
        return get_appointment_trend(
            db, doctor_id=doctor.id, start_dt=start_dt, end_dt=end_dt
        )
    elif current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found",
            )
        return get_appointment_trend(
            db, patient_id=patient.id, start_dt=start_dt, end_dt=end_dt
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Role not authorized for appointment trend",
        )


@router.get(
    "/healthcare-documents",
    response_model=HealthcareDocumentAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="MongoDB healthcare document count analytics with role isolation",
)
def get_documents_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns healthcare document counts from MongoDB without exposing PHI content:
    - ADMIN: all documents system-wide
    - DOCTOR: documents authored/ordered by doctor
    - PATIENT: documents belonging to patient
    - LAB: diagnostic reports
    """
    if current_user.role == UserRole.ADMIN:
        return get_healthcare_document_analytics(UserRole.ADMIN)
    elif current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found",
            )
        return get_healthcare_document_analytics(
            UserRole.DOCTOR, doctor_id=doctor.id
        )
    elif current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found",
            )
        return get_healthcare_document_analytics(
            UserRole.PATIENT, patient_id=patient.id
        )
    elif current_user.role == UserRole.LAB:
        return get_healthcare_document_analytics(UserRole.LAB)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Role not authorized for document analytics",
        )


@router.get(
    "/data-sharing",
    response_model=DataSharingAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Data sharing permission distribution metrics",
)
def get_sharing_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns data sharing counts and statuses:
    - ADMIN: system-wide
    - DOCTOR: doctor's created shares
    - PATIENT: patient's received shares
    - LAB: 403 Forbidden
    """
    if current_user.role == UserRole.ADMIN:
        return get_data_sharing_analytics(db)
    elif current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Doctor profile not found",
            )
        return get_data_sharing_analytics(db, doctor_id=doctor.id)
    elif current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient profile not found",
            )
        return get_data_sharing_analytics(db, patient_id=patient.id)
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Role not authorized for data sharing analytics",
        )


@router.get(
    "/notifications",
    response_model=NotificationAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Notification read and unread count analytics",
)
def get_notifications_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns notification counts:
    - ADMIN: system-wide
    - DOCTOR, PATIENT, LAB: authenticated user's notifications only
    """
    if current_user.role == UserRole.ADMIN:
        return get_notification_analytics(db)
    return get_notification_analytics(db, user_id=current_user.id)


@router.get(
    "/access-logs",
    response_model=AccessLogAnalyticsResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin audit access log action distribution",
)
def get_access_logs_analytics(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Returns aggregated audit action metrics across all events. Restricted to ADMIN.
    """
    return get_access_log_analytics(db)


@router.get(
    "/recent-activity",
    response_model=RecentActivityResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin safe recent system audit activity feed",
)
def get_recent_activity_analytics(
    limit: int = Query(10, ge=1, le=50, description="Max activities to return"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Returns recent safe audit events without exposing PHI. Restricted to ADMIN.
    """
    return get_recent_activity(db, limit=limit)


@router.get(
    "/top-doctors",
    response_model=TopDoctorsResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin top doctors by appointment volume",
)
def get_top_doctors_analytics(
    limit: int = Query(10, ge=1, le=50, description="Top doctors count limit"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Returns top doctors ranked by appointment counts. Restricted to ADMIN.
    """
    return get_top_doctors(db, limit=limit)
