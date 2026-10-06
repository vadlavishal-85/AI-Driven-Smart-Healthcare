# SmartHealthcare Backend Overview

## Live architecture

```mermaid
flowchart LR
  U[Patient / Doctor / Admin browser] --> F[React + Vite frontend on Render]
  F -->|HTTPS API requests + JWT| A[FastAPI + Uvicorn API on Render]
  A -->|SQLAlchemy using DATABASE_URL| P[(Render PostgreSQL\nsmarthealthcare)]
  A -->|PyMongo using MONGODB_URI| M[(MongoDB Atlas\nsmarthealthcare)]
```

The frontend is a Render static site. The Python API is a separate Render web service. Accounts and appointment scheduling use the Render PostgreSQL resource `smarthealthcare-db`. Clinical notes, prescriptions, clinician-only prescription notes, and FHIR exchange packages use MongoDB through `MONGODB_URI` and `MONGODB_DATABASE`. Set the MongoDB Atlas connection string as a secret on the Render API service; it does not belong in source control or presentation slides. If it is missing or unreachable, Mongo-backed workflows return `503` and `/database/health` reports MongoDB as unavailable.

## Backend technologies

- **Python 3.13.4** runs the API service.
- **FastAPI** defines request handlers, validation, OpenAPI documentation, and error responses.
- **Uvicorn** runs the FastAPI ASGI application.
- **Pydantic** validates request and response data.
- **SQLAlchemy 2** maps Python models to relational tables and manages queries.
- **PostgreSQL** is the live database. `psycopg` is its Python driver.
- **SQLite** is the default local development database. A legacy MySQL connection option remains available through PyMySQL.
- **bcrypt** hashes passwords before storage.
- **JWT (HS256)** provides signed, expiring bearer tokens; the configured token lifetime is 30 minutes.
- **PyMongo** stores clinical notes, prescriptions, private prescription notes, and consent-logged FHIR share packages in MongoDB.
- **CORS middleware** allows the deployed frontend origin and local development origins.

The database module is still named `backend/app/database/mysql.py` for compatibility. It supports PostgreSQL, SQLite, and optional MySQL; the live Render database is PostgreSQL.

## Tables currently used

The API creates its SQLAlchemy model tables at startup with `Base.metadata.create_all()` and seeds the three role rows. There is no Alembic migration history in this project yet.

| PostgreSQL table | What it stores | Current use |
| --- | --- | --- |
| `roles` | `ADMIN`, `DOCTOR`, and `PATIENT` role names | Seeded by the API on startup |
| `users` | Names, email, role, active flag, phone, password hash, timestamps | Registration, login, profiles, demo accounts |
| `doctor_profiles` | A doctor's department and specialty | Doctor directory and appointment booking |
| `appointments` | Patient/doctor links, date/time, reason, status, timestamps; legacy clinical columns remain for fallback migration | Live appointment workflow |
| `patients` | Optional patient demographics linked to a user | Model/table exists, but registration does not currently create patient rows |

Appointment status values are `SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, and `NO_SHOW`. New diagnosis, treatment-plan, and clinical-note updates are saved in MongoDB `clinical_records`, keyed by `appointment_id`. Existing values in the old PostgreSQL columns are copied into MongoDB the first time that appointment is read after MongoDB is configured.

MongoDB collections used by the live API:

| Collection | What it stores | Access scope |
| --- | --- | --- |
| `clinical_records` | Appointment-linked diagnosis, treatment plan, clinical notes, author, and timestamps | Patient sees own visits; assigned doctor edits; administrators can view |
| `prescriptions` | Medication, strength, dosage, quantity, refills, pharmacy, and patient-facing note | Patient sees own; doctor sees prescriptions they wrote; admin can view all |
| `prescription_notes` | Private note keyed by clinician account and prescription code | Only the account that wrote the note can view or edit it |
| `data_exchange` | Destination hospital, patient-consent audit, FHIR export payload, SHA-256 digest, and export status | Patient sees own; doctor sees their own; admin can review all |

The current hospital exchange step prepares a FHIR R4 JSON package for manual secure transfer and records it in MongoDB. No partner hospital API is configured, so the system does not claim that an outside hospital received a package.

## API map

| Method and path | Purpose |
| --- | --- |
| `GET /` | API service status |
| `GET /health` | Liveness check |
| `GET /ready` | Readiness check that requires PostgreSQL connectivity |
| `GET /database/health` | Shows PostgreSQL and MongoDB connection status |
| `GET /docs` | Interactive Swagger API documentation |
| `POST /auth/register` | Public patient registration; other roles cannot self-register |
| `POST /auth/login` | Verify credentials and issue JWT |
| `GET /auth/me` | Read the signed-in user |
| `GET /auth/test/{admin,doctor,patient}` | Role-check demonstration endpoints |
| `GET /users/me` | Read own profile |
| `PATCH /users/me` | Update own name/contact fields |
| `POST /users/me/change-password` | Verify the current password and set a new password |
| `GET /appointments/doctors` | List active doctors who can receive bookings |
| `GET /appointments` | List appointments scoped to the signed-in role |
| `POST /appointments` | Patient books an appointment; checks for a matching doctor/time conflict |
| `PATCH /appointments/{id}/status` | Patient may cancel their own eligible booking; assigned doctor may confirm/complete/mark no-show/cancel |
| `PATCH /appointments/{id}/clinical-info` | Assigned doctor saves diagnosis, plan, and notes |
| `POST /admin/doctors` | Admin provisions a doctor account and profile |
| `GET /prescriptions` | Lists prescriptions for the signed-in patient, authoring doctor, or administrator |
| `POST /prescriptions` | Assigned doctor creates a prescription for a confirmed/completed visit |
| `GET /prescription-notes` | Reads the signed-in clinician's MongoDB private notes |
| `PUT /prescription-notes/{code}` | Saves one clinician-only note in MongoDB |
| `POST /data-exchange/hospital-shares` | Validates consent, records a share event, and prepares an FHIR R4 package; does not deliver it externally |
| `GET /data-exchange` | Lists exchange packages visible to the signed-in role |
| `GET /data-exchange/{share_id}` | Reads a FHIR package when the signed-in user is its patient, authoring doctor, or an administrator |

## How to show the database to faculty

1. Open the [Render dashboard](https://dashboard.render.com/) and select the `smarthealthcare-db` PostgreSQL service for users and appointments. The `smarthealthcare-api` and `smarthealthcare-frontend` are separate services. MongoDB clinical collections are in the Atlas cluster selected by the API's `MONGODB_URI`.
2. Open the database's **Connect** menu. For a local PostgreSQL client, use the **PSQL Command** / external connection option. Keep the connection URL private: it contains database credentials. Do not put it on slides or share it in screenshots.
3. In `psql`, list the tables with `\dt`, then show safe fictional demo rows with read-only queries such as:

   ```sql
   SELECT id, name, description FROM roles ORDER BY id;

   SELECT u.id, u.first_name, u.last_name, r.name AS role, u.is_active
   FROM users AS u
   JOIN roles AS r ON r.id = u.role_id
   ORDER BY u.id;

   SELECT id, patient_id, doctor_id, appointment_date, appointment_time,
          status, reason, diagnosis
   FROM appointments
   ORDER BY id;
   ```

   Never select or show the `users.password_hash` column. These queries only read data.

4. In MongoDB Atlas, open the cluster and use **Browse Collections** to show `clinical_records`, `prescriptions`, `prescription_notes`, and `data_exchange`. Keep the cluster URI private. To show service connectivity, open `https://smarthealthcare-api-6ebh.onrender.com/database/health`; `/docs` lists the new prescription and exchange endpoints. Use fictional records for a presentation.
5. For a visual database browser, Render documents pgAdmin as an optional database admin app; it can inspect schemas and run queries. It is not required by this project.

For a presentation, use only the fictional demo users and records. Do not enter real patient data. The production Render resources are configured for demonstration, not a certified clinical deployment.
