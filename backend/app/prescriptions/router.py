import hashlib
import json
import re
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from pymongo import DESCENDING
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.mongodb import get_clinical_database
from app.database.mysql import get_db
from app.models.appointments import Appointment, AppointmentStatus
from app.models.auth import RoleEnum, User
from app.prescriptions.schemas import (
    DataExchangeEvent,
    HospitalShareRequest,
    HospitalShareResponse,
    PrescriptionCreate,
    PrescriptionResponse,
)

router = APIRouter(tags=["Prescriptions and Health Information Exchange"])


def _role(user: User) -> str:
    return user.role.name if user.role else ""


def _doctor_name(user: User) -> str:
    name = f"{user.first_name} {user.last_name}".strip()
    return name if user.first_name.strip().lower() in {"dr", "dr."} else f"Dr. {name}"


def _prescription_response(document: dict) -> PrescriptionResponse:
    return PrescriptionResponse(**{
        key: document[key]
        for key in PrescriptionResponse.model_fields
        if key in document
    })


@router.get("/prescriptions", response_model=list[PrescriptionResponse])
def list_prescriptions(
    current_user: User = Depends(get_current_user),
):
    role = _role(current_user)
    query = {}
    if role == RoleEnum.PATIENT.value:
        query["patient_id"] = current_user.id
    elif role == RoleEnum.DOCTOR.value:
        query["doctor_id"] = current_user.id
    elif role != RoleEnum.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    records = get_clinical_database().prescriptions.find(query).sort("created_at", DESCENDING)
    return [_prescription_response(record) for record in records]


@router.post("/prescriptions", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(
    request: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if _role(current_user) != RoleEnum.DOCTOR.value:
        raise HTTPException(status_code=403, detail="Only doctors can write prescriptions.")

    appointment = db.query(Appointment).filter(
        Appointment.id == request.appointment_id,
        Appointment.doctor_id == current_user.id,
    ).first()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Assigned appointment not found.")
    if appointment.status not in {AppointmentStatus.CONFIRMED, AppointmentStatus.COMPLETED}:
        raise HTTPException(status_code=409, detail="Confirm the appointment before writing a prescription.")

    medication = request.medication.strip()
    strength = request.strength.strip()
    dosage = request.dosage.strip()
    quantity = request.quantity.strip()
    if len(medication) < 2 or not strength or len(dosage) < 3 or not quantity:
        raise HTTPException(status_code=422, detail="Complete the prescription fields before saving.")

    now = datetime.now(timezone.utc)
    document = {
        "prescription_id": f"RX-{uuid4().hex[:12].upper()}",
        "appointment_id": appointment.id,
        "patient_id": appointment.patient_id,
        "patient_name": f"{appointment.patient.first_name} {appointment.patient.last_name}".strip(),
        "doctor_id": current_user.id,
        "doctor_name": _doctor_name(current_user),
        "medication": medication,
        "strength": strength,
        "dosage": dosage,
        "quantity": quantity,
        "refills": request.refills,
        "pharmacy": request.pharmacy.strip() if request.pharmacy and request.pharmacy.strip() else None,
        "clinical_note": request.clinical_note.strip() if request.clinical_note and request.clinical_note.strip() else None,
        "status": "ACTIVE",
        "created_at": now,
        "shared_with_patient_at": now,
    }
    get_clinical_database().prescriptions.insert_one(document)
    return _prescription_response(document)


def _make_fhir_bundle(prescription: dict, include_visit_notes: bool, db: Session) -> dict:
    appointment = db.query(Appointment).filter(Appointment.id == prescription["appointment_id"]).first()
    if appointment is None:
        raise HTTPException(status_code=404, detail="Prescription visit not found.")

    patient = appointment.patient
    doctor = appointment.doctor
    patient_url = f"urn:uuid:{uuid4()}"
    doctor_url = f"urn:uuid:{uuid4()}"
    medication_request = {
        "resourceType": "MedicationRequest",
        "id": prescription["prescription_id"],
        "status": "active" if prescription["status"] == "ACTIVE" else "completed",
        "intent": "order",
        "subject": {"reference": patient_url, "display": prescription["patient_name"]},
        "requester": {"reference": doctor_url, "display": prescription["doctor_name"]},
        "medicationCodeableConcept": {
            "text": f"{prescription['medication']} {prescription['strength']}".strip(),
        },
        "dosageInstruction": [{"text": prescription["dosage"]}],
        "note": [],
    }
    if prescription.get("clinical_note"):
        medication_request["note"].append({"text": prescription["clinical_note"]})
    if prescription.get("pharmacy"):
        medication_request["note"].append({"text": f"Preferred pharmacy: {prescription['pharmacy']}"})
    medication_request["note"].append({
        "text": f"Quantity: {prescription['quantity']}; refills authorized: {prescription['refills']}.",
    })

    entries = [
        {
            "fullUrl": patient_url,
            "resource": {
                "resourceType": "Patient",
                "id": f"patient-{patient.id}",
                "identifier": [{"system": "urn:smarthealthcare:patient", "value": str(patient.id)}],
                "name": [{"text": prescription["patient_name"]}],
            },
        },
        {
            "fullUrl": doctor_url,
            "resource": {
                "resourceType": "Practitioner",
                "id": f"practitioner-{doctor.id}",
                "identifier": [{"system": "urn:smarthealthcare:practitioner", "value": str(doctor.id)}],
                "name": [{"text": prescription["doctor_name"]}],
            },
        },
        {"resource": medication_request},
    ]
    if include_visit_notes:
        mongo = get_clinical_database()
        clinical = mongo.clinical_records.find_one({"appointment_id": prescription["appointment_id"]}) or {}
        diagnosis = clinical.get("diagnosis", appointment.diagnosis if appointment else None)
        treatment_plan = clinical.get("treatment_plan", appointment.treatment_plan if appointment else None)
        clinical_notes = clinical.get("clinical_notes", appointment.clinical_notes if appointment else None)
        summary = "\n".join(part for part in [
            f"Diagnosis: {diagnosis}" if diagnosis else "",
            f"Treatment plan: {treatment_plan}" if treatment_plan else "",
            f"Clinical notes: {clinical_notes}" if clinical_notes else "",
        ] if part)
        if summary:
            entries.append({"resource": {
                "resourceType": "ClinicalImpression",
                "id": f"visit-{prescription['appointment_id']}",
                "status": "completed",
                "subject": {"reference": patient_url, "display": prescription["patient_name"]},
                "summary": summary,
            }})

    return {
        "resourceType": "Bundle",
        "type": "collection",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "entry": entries,
    }


@router.post("/data-exchange/hospital-shares", response_model=HospitalShareResponse, status_code=status.HTTP_201_CREATED)
def prepare_hospital_share(
    request: HospitalShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not request.patient_consent:
        raise HTTPException(status_code=422, detail="Confirm the patient's consent before preparing an external share.")
    role = _role(current_user)
    mongo = get_clinical_database()
    prescription = mongo.prescriptions.find_one({"prescription_id": request.prescription_id})
    if prescription is None:
        raise HTTPException(status_code=404, detail="Prescription not found.")
    if role == RoleEnum.PATIENT.value:
        allowed = prescription["patient_id"] == current_user.id
    elif role == RoleEnum.DOCTOR.value:
        allowed = prescription["doctor_id"] == current_user.id
    else:
        allowed = role == RoleEnum.ADMIN.value
    if not allowed:
        raise HTTPException(status_code=404, detail="Prescription not found.")

    hospital = request.destination_hospital.strip()
    if len(hospital) < 2:
        raise HTTPException(status_code=422, detail="Enter a valid destination hospital name.")
    share_id = uuid4().hex
    payload = _make_fhir_bundle(prescription, request.include_visit_notes, db)
    serialized_payload = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    event = {
        "share_id": share_id,
        "prescription_id": prescription["prescription_id"],
        "patient_id": prescription["patient_id"],
        "patient_name": prescription["patient_name"],
        "doctor_id": prescription["doctor_id"],
        "doctor_name": prescription["doctor_name"],
        "destination_hospital": hospital,
        "protocol": "FHIR R4 MedicationRequest",
        "status": "READY_FOR_EXPORT",
        "created_at": datetime.now(timezone.utc),
        "consent_confirmed_by": current_user.id,
        "consent_confirmed_as": role,
        "consent_confirmed_at": datetime.now(timezone.utc),
        "include_visit_notes": request.include_visit_notes,
        "payload_digest": hashlib.sha256(serialized_payload.encode("utf-8")).hexdigest(),
        "payload": payload,
    }
    mongo.data_exchange.insert_one(event)
    return HospitalShareResponse(**{key: value for key, value in event.items() if key in HospitalShareResponse.model_fields})


@router.get("/data-exchange", response_model=list[DataExchangeEvent])
def list_data_exchange_events(
    current_user: User = Depends(get_current_user),
):
    role = _role(current_user)
    query = {}
    if role == RoleEnum.PATIENT.value:
        query["patient_id"] = current_user.id
    elif role == RoleEnum.DOCTOR.value:
        query["doctor_id"] = current_user.id
    elif role != RoleEnum.ADMIN.value:
        raise HTTPException(status_code=403, detail="Access forbidden.")
    documents = get_clinical_database().data_exchange.find(query).sort("created_at", DESCENDING)
    return [DataExchangeEvent(**{
        key: document[key]
        for key in DataExchangeEvent.model_fields
        if key in document
    }) for document in documents]


@router.get("/data-exchange/{share_id}", response_model=HospitalShareResponse)
def get_data_exchange_payload(
    share_id: str,
    current_user: User = Depends(get_current_user),
):
    if not re.fullmatch(r"[0-9a-f]{32}", share_id):
        raise HTTPException(status_code=404, detail="Share record not found.")
    role = _role(current_user)
    event = get_clinical_database().data_exchange.find_one({"share_id": share_id})
    if event is None:
        raise HTTPException(status_code=404, detail="Share record not found.")
    allowed = (
        role == RoleEnum.ADMIN.value
        or (role == RoleEnum.PATIENT.value and event["patient_id"] == current_user.id)
        or (role == RoleEnum.DOCTOR.value and event["doctor_id"] == current_user.id)
    )
    if not allowed:
        raise HTTPException(status_code=404, detail="Share record not found.")
    return HospitalShareResponse(**{key: value for key, value in event.items() if key in HospitalShareResponse.model_fields})
