# AI-Driven Smart Healthcare Data Exchange and Analytics Ecosystem

## Project Description
A professional, real-world healthcare web application designed for managing and exchanging healthcare data securely between patients, doctors, and administrators, accompanied by advanced analytics capabilities.

---

## Technology Stack

- **Frontend**: React (Vite) - JavaScript
- **Backend**: FastAPI - Python
- **Databases**:
  - Relational Database: PostgreSQL on Render, SQLite for local development, or MySQL when explicitly configured
  - MongoDB: clinical visit records, prescriptions, private prescription notes, and consent-logged FHIR share packages

---

## Current Implementation Scope

- The React frontend contains the landing, role selection, login, registration, dashboard shell, profile, and healthcare module screens.
- The FastAPI backend implements patient registration, login, role checks, profile/password APIs, doctor provisioning by administrators, and database-backed appointments.
- Patients can book with active doctors, view only their appointments, cancel eligible bookings, and read clinical information attached to their visits. Assigned doctors can confirm/close visits and record diagnosis, treatment plan, and clinical notes in MongoDB.
- Doctors can create prescriptions for their confirmed or completed visits. The patient and administrators can read those prescriptions; clinician-only notes remain private to their author.
- Patients, the prescribing doctor, and administrators can prepare consent-logged FHIR R4 exports for another hospital. Packages are saved in MongoDB and downloaded; direct hospital delivery still requires a configured receiving endpoint.
- Render uses PostgreSQL through `DATABASE_URL` for accounts and appointments. Set `MONGODB_URI` and `MONGODB_DATABASE` on the API service for clinical, prescription, and exchange features. Local development uses the configured URI too; clinical data endpoints return a clear service-unavailable error if MongoDB is not configured.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Render deployment setup and current prerequisites.
See [docs/BACKEND_OVERVIEW.md](docs/BACKEND_OVERVIEW.md) for the live backend architecture, database tables, API map, and faculty demonstration steps.

---

## Project Structure

```text
SmartHealthcare/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── database/
│   │   ├── models/
│   │   ├── __init__.py
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── navbar/
│   │   │   ├── sidebar/
│   │   │   └── ui/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── Landing/
│   │   │   ├── Login/
│   │   │   ├── NotFound/
│   │   │   └── Register/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── mysql/
│   └── mongodb/
│
├── docs/
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Backend Setup & Run

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. (Optional but recommended) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Access the API at `http://127.0.0.1:8000` (interactive Swagger docs at `http://127.0.0.1:8000/docs`). The local API creates the SQLite schema and development demo accounts automatically.

---

### 2. Frontend Setup & Run

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.
