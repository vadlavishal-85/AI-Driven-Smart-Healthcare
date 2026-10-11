from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class UserRoleCounts(BaseModel):
    total: int
    admins: int
    doctors: int
    patients: int
    labs: int


class UserAnalyticsResponse(BaseModel):
    total_users: int
    admins: int
    doctors: int
    patients: int
    labs: int


class AppointmentAnalyticsResponse(BaseModel):
    total: int
    scheduled: int
    completed: int
    cancelled: int


class AppointmentTrendItem(BaseModel):
    month: str
    count: int


class AppointmentTrendResponse(BaseModel):
    trend: List[AppointmentTrendItem]


class HealthcareDocumentAnalyticsResponse(BaseModel):
    medical_records: int
    prescriptions: int
    doctor_notes: int
    lab_reports: int
    total: int


class DataSharingAnalyticsResponse(BaseModel):
    total: int
    approved: int
    pending: int
    revoked: int


class NotificationAnalyticsResponse(BaseModel):
    total: int
    read: int
    unread: int


class AccessLogAnalyticsResponse(BaseModel):
    total: int
    view_shared_record: int
    share_record: int
    revoke_shared_record: int


class RecentActivityItem(BaseModel):
    action: str
    resource_type: str
    created_at: datetime


class RecentActivityResponse(BaseModel):
    activities: List[RecentActivityItem]


class TopDoctorItem(BaseModel):
    doctor_id: UUID
    appointment_count: int


class TopDoctorsResponse(BaseModel):
    doctors: List[TopDoctorItem]


class AnalyticsOverviewResponse(BaseModel):
    users: UserRoleCounts
    appointments: AppointmentAnalyticsResponse
    healthcare_documents: HealthcareDocumentAnalyticsResponse
    data_sharing: DataSharingAnalyticsResponse
    notifications: NotificationAnalyticsResponse
