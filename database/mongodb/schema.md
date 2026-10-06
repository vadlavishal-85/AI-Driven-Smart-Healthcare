# MongoDB Document Architecture & Schema Specifications

## Overview
MongoDB handles semi-structured, flexible, and high-volume clinical records and exchange payloads for the **AI-Driven Smart Healthcare Platform**.

Relational identities (e.g., `patient_id`, `doctor_id`, `appointment_id`) refer to primary keys in MySQL, preventing duplicate patient/doctor metadata while maximizing query flexibility.

---

## 1. Collection: `medical_records`

### Purpose
Stores diagnostic evaluations, clinical observations, treatment plans, and document attachments for patient consultations.

### Document Structure
```json
{
  "_id": "ObjectId",
  "record_id": "String (UUID)",
  "patient_id": "Integer (references MySQL patients.id)",
  "doctor_id": "Integer (references MySQL doctors.id)",
  "record_type": "String (e.g., CONSULTATION, DIAGNOSIS, LAB_REPORT, DISCHARGE_SUMMARY)",
  "title": "String",
  "diagnosis": {
    "code": "String (ICD-10 / SNOMED CT)",
    "description": "String",
    "primary": "Boolean"
  },
  "symptoms": [
    {
      "symptom": "String",
      "severity": "String (MILD, MODERATE, SEVERE)",
      "duration_days": "Integer"
    }
  ],
  "observations": "String",
  "treatment": {
    "plan": "String",
    "lifestyle_recommendations": ["String"],
    "follow_up_date": "Date / ISODate"
  },
  "attachments": [
    {
      "file_id": "String",
      "file_name": "String",
      "mime_type": "String",
      "file_size": "Integer",
      "file_url": "String"
    }
  ],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### Planned Indexes
- `{ "patient_id": 1 }`
- `{ "doctor_id": 1 }`
- `{ "created_at": -1 }`

---

## 2. Collection: `clinical_notes`

### Purpose
Stores unstructured/semi-structured doctor progress notes, SOAP notes (Subjective, Objective, Assessment, Plan), and nursing observations.

### Document Structure
```json
{
  "_id": "ObjectId",
  "note_id": "String (UUID)",
  "patient_id": "Integer (references MySQL patients.id)",
  "doctor_id": "Integer (references MySQL doctors.id)",
  "appointment_id": "Integer (optional, references MySQL appointments.id)",
  "note_type": "String (SOAP_NOTE, PROGRESS_NOTE, NURSING_NOTE, TELECONSULT_NOTE)",
  "content": {
    "subjective": "String",
    "objective": "String",
    "assessment": "String",
    "plan": "String",
    "raw_text": "String"
  },
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### Planned Indexes
- `{ "patient_id": 1 }`
- `{ "doctor_id": 1 }`
- `{ "appointment_id": 1 }`

---

## 3. Collection: `prescriptions`

### Purpose
Stores multi-item medication orders, dosage schedules, dispensing instructions, and refill authorizations.

### Document Structure
```json
{
  "_id": "ObjectId",
  "prescription_id": "String (UUID)",
  "patient_id": "Integer (references MySQL patients.id)",
  "doctor_id": "Integer (references MySQL doctors.id)",
  "appointment_id": "Integer (optional, references MySQL appointments.id)",
  "medications": [
    {
      "drug_name": "String",
      "dosage": "String (e.g., 500mg)",
      "frequency": "String (e.g., Twice daily after meals)",
      "duration": "String (e.g., 7 days)",
      "route": "String (ORAL, TOPICAL, IV, INHALATION)",
      "refills_allowed": "Integer"
    }
  ],
  "instructions": "String",
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### Planned Indexes
- `{ "patient_id": 1 }`
- `{ "doctor_id": 1 }`

---

## 4. Collection: `data_exchange`

### Purpose
Manages cross-system and interoperability healthcare data transfers (FHIR/HL7 format exchange records) between clinics, labs, and patients.

### Document Structure
```json
{
  "_id": "ObjectId",
  "exchange_id": "String (UUID)",
  "source_type": "String (HOSPITAL, CLINIC, LAB, WEARABLE, PATIENT_PORTAL)",
  "source_id": "String",
  "destination_type": "String (HOSPITAL, CLINIC, SPECIALIST, ANALYTICS_ENGINE)",
  "destination_id": "String",
  "document_type": "String (FHIR_BUNDLE, HL7_MESSAGE, CCR, CDA, LAB_REPORT_JSON)",
  "payload": "Object (Full structured exchange payload)",
  "status": "String (PENDING, SENT, RECEIVED, FAILED, ARCHIVED)",
  "error_message": "String (optional)",
  "created_at": "ISODate"
}
```

### Planned Indexes
- `{ "status": 1 }`
- `{ "created_at": -1 }`

---

## 5. Collection: `healthcare_events`

### Purpose
Provides immutable event streaming, audit logs, security tracking, and time-series telemetry for AI analytics.

### Document Structure
```json
{
  "_id": "ObjectId",
  "event_id": "String (UUID)",
  "patient_id": "Integer (optional, references MySQL patients.id)",
  "event_type": "String (APPOINTMENT_SCHEDULED, RECORD_ACCESSED, VITALS_STREAMED, DATA_EXCHANGED, ANOMALY_DETECTED)",
  "source": "String (SYSTEM, DOCTOR_APP, PATIENT_APP, ANALYTICS_WORKER)",
  "data": "Object (Arbitrary event payload / metric data)",
  "timestamp": "ISODate"
}
```

### Planned Indexes
- `{ "patient_id": 1 }`
- `{ "event_type": 1 }`
- `{ "timestamp": -1 }`
