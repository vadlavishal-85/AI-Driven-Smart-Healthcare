# AI-Driven Smart Healthcare Data Exchange and Analytics Ecosystem

## Project Description
A professional, real-world healthcare web application designed for managing and exchanging healthcare data securely between patients, doctors, and administrators, accompanied by advanced analytics capabilities.

---

## Technology Stack

- **Frontend**: React (Vite) - JavaScript
- **Backend**: FastAPI - Python
- **Databases**:
  - Relational Database: PostgreSQL on Render, or MySQL for an existing/local setup
  - MongoDB: optional; no current healthcare API depends on it

---

## Current Implementation Scope

- The React frontend contains the landing, role selection, login, registration, dashboard shell, profile, and healthcare module screens.
- The FastAPI backend currently implements authentication, registration, role checks, and user profile/password APIs.
- Healthcare module screens still contain demo/static content. Patient, doctor, appointment, records, notes, prescription, exchange, and analytics APIs are not implemented yet, so those workflows are not production data features.
- Authentication requires a reachable relational database. Render uses PostgreSQL through `DATABASE_URL`; MySQL remains supported for local/existing setups. MongoDB is optional because current routes do not use it.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Render deployment setup and current prerequisites.

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
5. Access the API at `http://127.0.0.1:8000` (Interactive Swagger docs at `http://127.0.0.1:8000/docs`).

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
