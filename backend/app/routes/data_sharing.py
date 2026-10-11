from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.database.mongodb import (
    medical_records_collection,
    prescriptions_collection,
    doctor_notes_collection,
    lab_reports_collection,
)
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.role import UserRole
from app.models.data_sharing import DataSharing
from app.models.notification import Notification
from app.core.dependencies import get_current_user, require_roles
from app.schemas.data_sharing import (
    DataSharingCreate,
    DataSharingResponse,
    SharedRecordDetailResponse,
)
from app.utils.mongo import parse_object_id, format_doc
from app.utils.access_logger import log_access

router = APIRouter(prefix="/data-sharing", tags=["Data Sharing"])

COLLECTIONS = {
    "medical_record": medical_records_collection,
    "prescription": prescriptions_collection,
    "doctor_note": doctor_notes_collection,
    "lab_report": lab_reports_collection,
}


def resolve_record_type_and_doc(record_id_str: str):
    """
    Finds the MongoDB document and identifies its collection/record_type.
    """
    obj_id = parse_object_id(record_id_str)
    for r_type, coll in COLLECTIONS.items():
        doc = coll.find_one({"_id": obj_id})
        if doc is not None:
            return r_type, doc
    return None, None


def format_sharing_response(
    sharing: DataSharing, record_type: Optional[str] = None
) -> DataSharingResponse:
    if not record_type:
        r_type, _ = resolve_record_type_and_doc(sharing.record_id)
        record_type = r_type or "medical_record"
    return DataSharingResponse(
        id=sharing.id,
        doctor_id=sharing.doctor_id,
        patient_id=sharing.patient_id,
        record_id=sharing.record_id,
        record_type=record_type,
        shared_at=sharing.shared_at,
        status=sharing.status,
    )


@router.post(
    "",
    response_model=DataSharingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Doctor creates secure healthcare record sharing permission",
)
def share_record(
    request_data: DataSharingCreate,
    http_request: Request,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    # 1. Locate authenticated doctor profile
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    # 2. Validate patient existence and active status in PostgreSQL
    patient = (
        db.query(Patient).filter(Patient.id == request_data.patient_id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )
    if not patient.user or not patient.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient account is inactive",
        )

    # 3. Validate MongoDB record existence and supported collection
    coll = COLLECTIONS.get(request_data.record_type)
    if coll is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid record_type. Allowed types: {list(COLLECTIONS.keys())}",
        )

    obj_id = parse_object_id(request_data.record_id)
    doc = coll.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Healthcare record not found in MongoDB",
        )

    # 4. Verify record ownership and patient relationship
    if doc.get("patient_id") != str(request_data.patient_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Healthcare record does not belong to the specified patient",
        )
    if doc.get("doctor_id") != str(doctor.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You can only share documents you authored or ordered",
        )

    # 5. Check for active duplicate sharing
    existing_share = (
        db.query(DataSharing)
        .filter(
            DataSharing.doctor_id == doctor.id,
            DataSharing.patient_id == request_data.patient_id,
            DataSharing.record_id == str(request_data.record_id),
            DataSharing.status == "APPROVED",
        )
        .first()
    )
    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Record is already shared with this patient",
        )

    # 6. Execute atomic creation: DataSharing + Notification + AccessLog
    now = datetime.now(timezone.utc)
    client_ip = (
        http_request.client.host
        if http_request and http_request.client
        else None
    )

    try:
        sharing = DataSharing(
            doctor_id=doctor.id,
            patient_id=request_data.patient_id,
            record_id=str(request_data.record_id),
            shared_at=now,
            status="APPROVED",
        )
        db.add(sharing)

        # Patient notification
        doc_name = doctor.user.full_name if doctor.user else "Doctor"
        clean_doc_name = doc_name if doc_name.startswith("Dr. ") else f"Dr. {doc_name}"
        notification = Notification(
            user_id=patient.user_id,
            title="New Healthcare Record Shared",
            message=f"{clean_doc_name} shared a healthcare record with you.",
            type="DATA_SHARED",
            is_read=False,
            created_at=now,
        )
        db.add(notification)

        # Audit log
        log_access(
            db=db,
            user_id=current_user.id,
            action="SHARE_RECORD",
            resource_type=request_data.record_type,
            resource_id=str(request_data.record_id),
            ip_address=client_ip,
        )

        db.commit()
        db.refresh(sharing)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to record sharing permission in database",
        )

    return format_sharing_response(sharing, request_data.record_type)


@router.get(
    "/doctor",
    response_model=List[DataSharingResponse],
    status_code=status.HTTP_200_OK,
    summary="Doctor views own created sharing permissions",
)
def get_doctor_shared_records(
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    shares = (
        db.query(DataSharing)
        .filter(DataSharing.doctor_id == doctor.id)
        .order_by(DataSharing.shared_at.desc())
        .all()
    )
    return [format_sharing_response(s) for s in shares]


@router.get(
    "/my",
    response_model=List[DataSharingResponse],
    status_code=status.HTTP_200_OK,
    summary="Patient views own approved sharing permissions",
)
def get_patient_shared_records(
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
    db: Session = Depends(get_db),
):
    patient = (
        db.query(Patient).filter(Patient.user_id == current_user.id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    shares = (
        db.query(DataSharing)
        .filter(
            DataSharing.patient_id == patient.id,
            DataSharing.status == "APPROVED",
        )
        .order_by(DataSharing.shared_at.desc())
        .all()
    )
    return [format_sharing_response(s) for s in shares]


@router.get(
    "/{sharing_id}",
    response_model=SharedRecordDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Patient retrieves shared MongoDB document through verified permission",
)
def get_shared_record_by_id(
    sharing_id: UUID,
    http_request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Only PATIENT role is permitted to retrieve shared document via this endpoint
    if current_user.role != UserRole.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only patients can access shared documents through this endpoint",
        )

    patient = (
        db.query(Patient).filter(Patient.user_id == current_user.id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found",
        )

    sharing = db.query(DataSharing).filter(DataSharing.id == sharing_id).first()
    if not sharing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sharing permission not found",
        )

    # Permission ownership check
    if sharing.patient_id != patient.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You do not have permission to access this shared record",
        )

    # Permission status check
    if sharing.status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Sharing permission has been revoked or is not active",
        )

    # Retrieve MongoDB document
    record_type, doc = resolve_record_type_and_doc(sharing.record_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Healthcare document not found in MongoDB",
        )

    # Verify document ownership integrity
    if doc.get("patient_id") != str(patient.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Integrity check failed on shared document",
        )

    # Audit access
    client_ip = (
        http_request.client.host
        if http_request and http_request.client
        else None
    )
    log_access(
        db=db,
        user_id=current_user.id,
        action="VIEW_SHARED_RECORD",
        resource_type=record_type or "medical_record",
        resource_id=sharing.record_id,
        ip_address=client_ip,
    )
    db.commit()

    return SharedRecordDetailResponse(
        sharing=format_sharing_response(sharing, record_type),
        record=format_doc(doc),
    )


@router.put(
    "/{sharing_id}/revoke",
    response_model=DataSharingResponse,
    status_code=status.HTTP_200_OK,
    summary="Doctor revokes healthcare record sharing permission",
)
def revoke_sharing(
    sharing_id: UUID,
    http_request: Request,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    sharing = db.query(DataSharing).filter(DataSharing.id == sharing_id).first()
    if not sharing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sharing permission not found",
        )

    # Authorization: Only the author doctor can revoke
    if sharing.doctor_id != doctor.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: You cannot revoke another doctor's sharing permission",
        )

    # Check already revoked
    if sharing.status == "REVOKED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sharing permission is already revoked",
        )

    now = datetime.now(timezone.utc)
    sharing.status = "REVOKED"

    # Notify patient of revocation
    patient = (
        db.query(Patient).filter(Patient.id == sharing.patient_id).first()
    )
    if patient and patient.user_id:
        notification = Notification(
            user_id=patient.user_id,
            title="Healthcare Record Sharing Revoked",
            message="A previously shared healthcare record is no longer available through this sharing permission.",
            type="DATA_SHARE_REVOKED",
            is_read=False,
            created_at=now,
        )
        db.add(notification)

    # Access log
    record_type, _ = resolve_record_type_and_doc(sharing.record_id)
    client_ip = (
        http_request.client.host
        if http_request and http_request.client
        else None
    )
    log_access(
        db=db,
        user_id=current_user.id,
        action="REVOKE_SHARED_RECORD",
        resource_type=record_type or "medical_record",
        resource_id=sharing.record_id,
        ip_address=client_ip,
    )

    db.commit()
    db.refresh(sharing)

    return format_sharing_response(sharing, record_type)
