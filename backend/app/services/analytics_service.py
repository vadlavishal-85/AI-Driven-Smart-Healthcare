from datetime import datetime
from typing import Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User
from app.models.role import UserRole
from app.models.appointment import Appointment
from app.models.data_sharing import DataSharing
from app.models.notification import Notification
from app.models.access_log import AccessLog
from app.database.mongodb import (
    medical_records_collection,
    prescriptions_collection,
    doctor_notes_collection,
    lab_reports_collection,
)
from app.schemas.analytics import (
    UserRoleCounts,
    UserAnalyticsResponse,
    AppointmentAnalyticsResponse,
    AppointmentTrendItem,
    AppointmentTrendResponse,
    HealthcareDocumentAnalyticsResponse,
    DataSharingAnalyticsResponse,
    NotificationAnalyticsResponse,
    AccessLogAnalyticsResponse,
    RecentActivityItem,
    RecentActivityResponse,
    TopDoctorItem,
    TopDoctorsResponse,
    AnalyticsOverviewResponse,
)


def get_user_analytics(db: Session) -> UserAnalyticsResponse:
    """
    Computes aggregated user counts grouped by system roles.
    """
    rows = (
        db.query(User.role, func.count(User.id))
        .group_by(User.role)
        .all()
    )
    role_map = {str(r[0]): r[1] for r in rows}
    admins = role_map.get("ADMIN", 0)
    doctors = role_map.get("DOCTOR", 0)
    patients = role_map.get("PATIENT", 0)
    labs = role_map.get("LAB", 0)
    total_users = admins + doctors + patients + labs

    return UserAnalyticsResponse(
        total_users=total_users,
        admins=admins,
        doctors=doctors,
        patients=patients,
        labs=labs,
    )


def get_appointment_analytics(
    db: Session,
    doctor_id: Optional[UUID] = None,
    patient_id: Optional[UUID] = None,
) -> AppointmentAnalyticsResponse:
    """
    Computes appointment status metrics with role-based filtering.
    """
    query = db.query(Appointment.status, func.count(Appointment.id))
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    elif patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    rows = query.group_by(Appointment.status).all()
    status_map = {r[0].upper(): r[1] for r in rows}

    scheduled = status_map.get("SCHEDULED", 0)
    completed = status_map.get("COMPLETED", 0)
    cancelled = status_map.get("CANCELLED", 0)
    total = scheduled + completed + cancelled

    return AppointmentAnalyticsResponse(
        total=total,
        scheduled=scheduled,
        completed=completed,
        cancelled=cancelled,
    )


def get_appointment_trend(
    db: Session,
    doctor_id: Optional[UUID] = None,
    patient_id: Optional[UUID] = None,
    start_dt: Optional[datetime] = None,
    end_dt: Optional[datetime] = None,
) -> AppointmentTrendResponse:
    """
    Computes monthly appointment count trend with role filtering and date bounds.
    """
    month_expr = func.to_char(Appointment.appointment_date, "YYYY-MM")
    query = db.query(month_expr.label("month"), func.count(Appointment.id).label("count"))

    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    elif patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    if start_dt:
        query = query.filter(Appointment.appointment_date >= start_dt)
    if end_dt:
        query = query.filter(Appointment.appointment_date <= end_dt)

    rows = query.group_by(month_expr).order_by(month_expr.asc()).all()
    trend_items = [
        AppointmentTrendItem(month=r[0], count=r[1]) for r in rows if r[0] is not None
    ]

    return AppointmentTrendResponse(trend=trend_items)


def get_healthcare_document_analytics(
    role: UserRole,
    doctor_id: Optional[UUID] = None,
    patient_id: Optional[UUID] = None,
) -> HealthcareDocumentAnalyticsResponse:
    """
    Computes aggregate counts of MongoDB healthcare documents with role-level isolation.
    """
    if role == UserRole.ADMIN:
        med_count = medical_records_collection.count_documents({})
        rx_count = prescriptions_collection.count_documents({})
        note_count = doctor_notes_collection.count_documents({})
        lab_count = lab_reports_collection.count_documents({})
    elif role == UserRole.DOCTOR and doctor_id:
        doc_filter = {"doctor_id": str(doctor_id)}
        med_count = medical_records_collection.count_documents(doc_filter)
        rx_count = prescriptions_collection.count_documents(doc_filter)
        note_count = doctor_notes_collection.count_documents(doc_filter)
        lab_count = lab_reports_collection.count_documents(doc_filter)
    elif role == UserRole.PATIENT and patient_id:
        pat_filter = {"patient_id": str(patient_id)}
        med_count = medical_records_collection.count_documents(pat_filter)
        rx_count = prescriptions_collection.count_documents(pat_filter)
        note_count = doctor_notes_collection.count_documents(pat_filter)
        lab_count = lab_reports_collection.count_documents(pat_filter)
    elif role == UserRole.LAB:
        med_count = 0
        rx_count = 0
        note_count = 0
        lab_count = lab_reports_collection.count_documents({})
    else:
        med_count = 0
        rx_count = 0
        note_count = 0
        lab_count = 0

    total = med_count + rx_count + note_count + lab_count
    return HealthcareDocumentAnalyticsResponse(
        medical_records=med_count,
        prescriptions=rx_count,
        doctor_notes=note_count,
        lab_reports=lab_count,
        total=total,
    )


def get_data_sharing_analytics(
    db: Session,
    doctor_id: Optional[UUID] = None,
    patient_id: Optional[UUID] = None,
) -> DataSharingAnalyticsResponse:
    """
    Computes sharing permission totals and status distributions.
    """
    query = db.query(DataSharing.status, func.count(DataSharing.id))
    if doctor_id:
        query = query.filter(DataSharing.doctor_id == doctor_id)
    elif patient_id:
        query = query.filter(DataSharing.patient_id == patient_id)

    rows = query.group_by(DataSharing.status).all()
    status_map = {r[0].upper(): r[1] for r in rows}

    approved = status_map.get("APPROVED", 0)
    pending = status_map.get("PENDING", 0)
    revoked = status_map.get("REVOKED", 0)
    total = approved + pending + revoked

    return DataSharingAnalyticsResponse(
        total=total,
        approved=approved,
        pending=pending,
        revoked=revoked,
    )


def get_notification_analytics(
    db: Session,
    user_id: Optional[UUID] = None,
) -> NotificationAnalyticsResponse:
    """
    Computes notification read and unread metrics.
    """
    if user_id:
        total = (
            db.query(func.count(Notification.id))
            .filter(Notification.user_id == user_id)
            .scalar()
            or 0
        )
        read = (
            db.query(func.count(Notification.id))
            .filter(
                Notification.user_id == user_id,
                Notification.is_read == True,
            )
            .scalar()
            or 0
        )
    else:
        total = db.query(func.count(Notification.id)).scalar() or 0
        read = (
            db.query(func.count(Notification.id))
            .filter(Notification.is_read == True)
            .scalar()
            or 0
        )

    unread = total - read
    return NotificationAnalyticsResponse(
        total=total,
        read=read,
        unread=unread,
    )


def get_access_log_analytics(db: Session) -> AccessLogAnalyticsResponse:
    """
    Computes audit log action distributions for admin overview.
    """
    rows = (
        db.query(AccessLog.action, func.count(AccessLog.id))
        .group_by(AccessLog.action)
        .all()
    )
    action_map = {r[0].upper(): r[1] for r in rows}

    view_shared = action_map.get("VIEW_SHARED_RECORD", 0)
    share = action_map.get("SHARE_RECORD", 0)
    revoke = action_map.get("REVOKE_SHARED_RECORD", 0)
    total = sum(action_map.values())

    return AccessLogAnalyticsResponse(
        total=total,
        view_shared_record=view_shared,
        share_record=share,
        revoke_shared_record=revoke,
    )


def get_recent_activity(db: Session, limit: int = 10) -> RecentActivityResponse:
    """
    Retrieves safe aggregated audit activity list.
    """
    logs = (
        db.query(AccessLog)
        .order_by(AccessLog.created_at.desc())
        .limit(limit)
        .all()
    )
    items = [
        RecentActivityItem(
            action=log.action,
            resource_type=log.resource_type,
            created_at=log.created_at,
        )
        for log in logs
    ]
    return RecentActivityResponse(activities=items)


def get_top_doctors(db: Session, limit: int = 10) -> TopDoctorsResponse:
    """
    Retrieves top doctors ranked by appointment count.
    """
    rows = (
        db.query(Appointment.doctor_id, func.count(Appointment.id))
        .group_by(Appointment.doctor_id)
        .order_by(func.count(Appointment.id).desc())
        .limit(limit)
        .all()
    )
    items = [
        TopDoctorItem(doctor_id=r[0], appointment_count=r[1])
        for r in rows
        if r[0] is not None
    ]
    return TopDoctorsResponse(doctors=items)


def get_admin_overview(db: Session) -> AnalyticsOverviewResponse:
    """
    Assembles comprehensive high-level system analytics for admin dashboard.
    """
    user_res = get_user_analytics(db)
    user_counts = UserRoleCounts(
        total=user_res.total_users,
        admins=user_res.admins,
        doctors=user_res.doctors,
        patients=user_res.patients,
        labs=user_res.labs,
    )
    appointments = get_appointment_analytics(db)
    healthcare_documents = get_healthcare_document_analytics(UserRole.ADMIN)
    data_sharing = get_data_sharing_analytics(db)
    notifications = get_notification_analytics(db)

    return AnalyticsOverviewResponse(
        users=user_counts,
        appointments=appointments,
        healthcare_documents=healthcare_documents,
        data_sharing=data_sharing,
        notifications=notifications,
    )
