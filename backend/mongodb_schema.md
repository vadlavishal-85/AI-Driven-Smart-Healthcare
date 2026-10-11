# MongoDB Atlas Schema & Collections Documentation

## AI-Driven Smart Healthcare Data Exchange and Analytics Ecosystem

### Overview & Dual-Database Architecture

This system uses a polyglot persistence model separating relational entities from semi-structured clinical documents:

```
┌─────────────────────────────────┐        ┌───────────────────────────────────┐
│       PostgreSQL (Relational)   │        │     MongoDB Atlas (Documents)     │
├─────────────────────────────────┤        ├───────────────────────────────────┤
│ • users                         │        │ • medical_records                 │
│ • patients                      │        │ • prescriptions                   │
│ • doctors                       │        │ • doctor_notes                    │
│ • labs                          │        │ • lab_reports                     │
│ • appointments                  │        │                                   │
│ • data_sharing (permissions)    │        │                                   │
│ • notifications                 │        │                                   │
│ • access_logs                   │        │                                   │
└────────────────┬────────────────┘        └─────────────────┬─────────────────┘
                 │                                           │
                 │              FastAPI Backend              │
                 └──────────────────►◄───────────────────────┘
                     Coordinates relational IDs (UUID) with
                     document ObjectIds / string references
```

---

## Database Details

* **Target Database:** `ai_smart_healthcare`
* **Host Platform:** MongoDB Atlas

---

## Collections Specification

### 1. `medical_records`
* **Purpose:** Stores comprehensive, unstructured or semi-structured patient medical consultations, diagnosis, and treatment histories.
* **Fields:**
  * `_id` (ObjectId): MongoDB primary key.
  * `patient_id` (String / UUID): Reference to PostgreSQL `patients.id`.
  * `doctor_id` (String / UUID): Reference to PostgreSQL `doctors.id`.
  * `record_type` (String): Consultation type (e.g., `consultation`, `emergency`, `routine_checkup`).
  * `title` (String): Brief summary title of the consultation or encounter.
  * `symptoms` (Array of Strings): Clinical symptoms presented by the patient.
  * `diagnosis` (Array of Strings / Objects): Diagnostic conclusions.
  * `treatment` (Array of Strings / Objects): Recommended treatment course.
  * `notes` (String): Additional clinical notes.
  * `created_at` (ISODate): Creation timestamp.
  * `updated_at` (ISODate): Last modification timestamp.
* **Indexes:**
  * `{ patient_id: 1 }` — Fast retrieval of all medical records for a specific patient.
  * `{ doctor_id: 1 }` — Lookup of records created by a specific healthcare provider.
  * `{ created_at: -1 }` — Chronological sorting for clinical timelines.

---

### 2. `prescriptions`
* **Purpose:** Stores detailed prescription records containing complex medication schedules and instructions.
* **Fields:**
  * `_id` (ObjectId): MongoDB primary key.
  * `patient_id` (String / UUID): Reference to PostgreSQL `patients.id`.
  * `doctor_id` (String / UUID): Reference to PostgreSQL `doctors.id`.
  * `medical_record_id` (String / ObjectId): Optional reference to the parent `medical_records._id`.
  * `medications` (Array of Objects):
    * `name` (String): Medication or drug brand name.
    * `dosage` (String): Strength/dose (e.g., `500mg`).
    * `frequency` (String): Frequency (e.g., `Twice daily after meals`).
    * `duration` (String): Duration (e.g., `7 days`).
  * `instructions` (String): Special pharmacy or patient guidelines.
  * `created_at` (ISODate): Creation timestamp.
* **Indexes:**
  * `{ patient_id: 1 }` — Patient medication history lookup.
  * `{ doctor_id: 1 }` — Provider prescription history.
  * `{ medical_record_id: 1 }` — Relational link to clinical consultation.
  * `{ created_at: -1 }` — Reverse chronological sorting.

---

### 3. `doctor_notes`
* **Purpose:** Stores flexible private or shared clinical observations, differential diagnoses, and doctor memos.
* **Fields:**
  * `_id` (ObjectId): MongoDB primary key.
  * `patient_id` (String / UUID): Reference to PostgreSQL `patients.id`.
  * `doctor_id` (String / UUID): Reference to PostgreSQL `doctors.id`.
  * `medical_record_id` (String / ObjectId): Optional reference to related consultation.
  * `title` (String): Note header or subject.
  * `content` (String): Doctor observations and clinical narrative.
  * `created_at` (ISODate): Note timestamp.
  * `updated_at` (ISODate): Last edit timestamp.
* **Indexes:**
  * `{ patient_id: 1 }` — Clinical notes by patient.
  * `{ doctor_id: 1 }` — Notes author lookup.
  * `{ medical_record_id: 1 }` — Consultation link.
  * `{ created_at: -1 }` — Timestamp sorting.

---

### 4. `lab_reports`
* **Purpose:** Stores laboratory diagnostic outcomes with varying test parameters and numerical ranges.
* **Fields:**
  * `_id` (ObjectId): MongoDB primary key.
  * `patient_id` (String / UUID): Reference to PostgreSQL `patients.id`.
  * `doctor_id` (String / UUID): Reference to PostgreSQL `doctors.id` (ordering physician).
  * `report_name` (String): Name of the test panel (e.g., `Complete Blood Count (CBC)`).
  * `test_date` (ISODate): Date specimen was tested.
  * `results` (Array of Objects):
    * `test_name` (String): Specific parameter (e.g., `Hemoglobin`).
    * `value` (String / Number): Measured result.
    * `unit` (String): Unit of measurement (e.g., `g/dL`).
    * `reference_range` (String): Normal standard range (e.g., `13.5 - 17.5`).
    * `status` (String): Result classification (`NORMAL`, `HIGH`, `LOW`, `CRITICAL`).
  * `remarks` (String): Pathologist or technician notes.
  * `created_at` (ISODate): Record insertion timestamp.
* **Indexes:**
  * `{ patient_id: 1 }` — Patient lab results history.
  * `{ doctor_id: 1 }` — Ordering provider lookup.
  * `{ test_date: -1 }` — Date-based filtering.

---

## Relationship Between PostgreSQL and MongoDB

1. **Foreign Key Decoupling:** There are NO database-level foreign key constraints between PostgreSQL and MongoDB Atlas.
2. **PostgreSQL Relational IDs:** PostgreSQL tables (`patients`, `doctors`, `users`) generate UUIDs (e.g. `e0f2f754-0495-46aa-bbf0-690226490333`). MongoDB documents store these UUID values as strings in `patient_id` and `doctor_id`.
3. **Data Sharing Coordination:** The PostgreSQL `data_sharing` table stores `record_id` as a string referencing MongoDB document `_id`s, allowing doctor-to-patient sharing authorizations to be checked in relational SQL while the full document payload resides in MongoDB Atlas.
