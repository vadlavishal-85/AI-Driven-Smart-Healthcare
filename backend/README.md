# AI-Driven Smart Healthcare Backend

This is the backend API service for the **AI-Driven Smart Healthcare Data Exchange and Analytics Ecosystem**. It is built with **FastAPI** to provide high-performance, asynchronous REST API endpoints.

---

## Current Status (Step 2)

> **Important Architecture Notes:**
> - **PostgreSQL and MongoDB are NOT connected yet.** Database drivers and connection configurations will be introduced in subsequent steps.
> - **Authentication and RBAC are NOT implemented yet.** JWT tokens, user hashing, and role-based permissions will be configured in future steps.
> - Database and security files currently act as clean placeholders.

---

## Prerequisites

- **Python 3.10+** (verified on Python 3.14)
- **Windows PowerShell**

---

## Setup Instructions

### 1. Create the Virtual Environment

From the `backend` directory, create a local `.venv` environment:

```powershell
python -m venv .venv
```

### 2. Activate the Virtual Environment (Windows PowerShell)

```powershell
.\.venv\Scripts\Activate.ps1
```

Once activated, your terminal prompt will display `(.venv)`. You can verify your active Python interpreter:

```powershell
where.exe python
```

### 3. Install Dependencies

Install the core dependencies recorded in `requirements.txt`:

```powershell
pip install -r requirements.txt
```

---

## Running the Development Server

Start the FastAPI application with live reload enabled:

```powershell
uvicorn app.main:app --reload
```

The server will be available at: **`http://127.0.0.1:8000`**

---

## API Documentation & Endpoints

Once the server is running, you can explore and test the endpoints:

* **Root Endpoint:** [http://127.0.0.1:8000/](http://127.0.0.1:8000/) — Verifies backend status.
* **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) — Service health status.
* **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) — Interactive API exploration.
* **Alternative ReDoc UI:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc) — Clean API documentation.
* **OpenAPI Schema:** [http://127.0.0.1:8000/openapi.json](http://127.0.0.1:8000/openapi.json) — Raw OpenAPI specification.
