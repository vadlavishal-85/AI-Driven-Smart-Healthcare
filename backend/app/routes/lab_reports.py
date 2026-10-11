from datetime import datetime, timezone
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.database.mongodb import lab_reports_collection
from app.models.user import User
from app.models.doctor import Doctor
from app.models.patient import Patient
from app.models.role import UserRole
from app.core.dependencies import get_current_user, require_roles
from app.schemas.lab_report import (
    LabReportCreate,
    LabReportResponse,
)
from app.utils.mongo import parse_object_id, format_doc

router = APIRouter(prefix="/lab-reports", tags=["Lab Reports"])


@router.post(
    "",
    response_model=LabReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Lab creates diagnostic lab report",
)
def create_lab_report(
    request: LabReportCreate,
    current_user: User = Depends(require_roles(UserRole.LAB)),
    db: Session = Depends(get_db),
):
    # Validate patient in PostgreSQL
    patient = (
        db.query(Patient).filter(Patient.id == request.patient_id).first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    # Validate doctor in PostgreSQL
    doctor = db.query(Doctor).filter(Doctor.id == request.doctor_id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor not found",
        )
    if not doctor.user or not doctor.user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ordering doctor is not active",
        )

    now = datetime.now(timezone.utc)
    report_doc = {
        "patient_id": str(request.patient_id),
        "doctor_id": str(request.doctor_id),
        "test_name": request.test_name,
        "test_date": request.test_date,
        "results": request.results,
        "remarks": request.remarks,
        "created_at": now,
        "updated_at": now,
    }

    result = lab_reports_collection.insert_one(report_doc)
    report_doc["_id"] = result.inserted_id

    return format_doc(report_doc)


@router.get(
    "/my",
    response_model=List[LabReportResponse],
    status_code=status.HTTP_200_OK,
    summary="Patient views own lab reports",
)
def get_my_lab_reports(
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

    reports = list(
        lab_reports_collection.find({"patient_id": str(patient.id)}).sort(
            "test_date", -1
        )
    )
    return [format_doc(r) for r in reports]


@router.get(
    "/patient/{patient_id}",
    response_model=List[LabReportResponse],
    status_code=status.HTTP_200_OK,
    summary="Doctor views lab reports for a patient",
)
def get_patient_lab_reports(
    patient_id: UUID,
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
    db: Session = Depends(get_db),
):
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Doctor profile not found",
        )

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    reports = list(
        lab_reports_collection.find({"patient_id": str(patient_id)}).sort(
            "test_date", -1
        )
    )
    return [format_doc(r) for r in reports]


@router.get(
    "/{report_id}",
    response_model=LabReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single lab report with role-based access check",
)
def get_lab_report_by_id(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    obj_id = parse_object_id(report_id)
    report = lab_reports_collection.find_one({"_id": obj_id})
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab report not found",
        )

    if current_user.role == UserRole.PATIENT:
        patient = (
            db.query(Patient).filter(Patient.user_id == current_user.id).first()
        )
        if not patient or report.get("patient_id") != str(patient.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: You do not own this lab report",
            )
    elif current_user.role == UserRole.DOCTOR:
        doctor = (
            db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
        )
        if not doctor:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: Doctor profile not found",
            )
    elif current_user.role == UserRole.LAB:
        # Authorized LAB personnel
        pass
    else:
        # ADMIN or other role
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Insufficient permissions to view lab report",
        )

    return format_doc(report)
