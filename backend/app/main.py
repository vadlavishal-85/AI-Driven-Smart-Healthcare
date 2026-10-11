from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.postgres import check_postgres_connection
from app.database.mongodb import check_mongodb_connection
from app.routes.auth import router as auth_router
from app.routes.rbac_test import router as rbac_router
from app.routes.doctors import router as doctors_router
from app.routes.patients import router as patients_router
from app.routes.appointments import router as appointments_router
from app.routes.medical_records import router as medical_records_router
from app.routes.prescriptions import router as prescriptions_router
from app.routes.doctor_notes import router as doctor_notes_router
from app.routes.lab_reports import router as lab_reports_router
from app.routes.data_sharing import router as data_sharing_router
from app.routes.notifications import router as notifications_router
from app.routes.access_logs import router as access_logs_router
from app.routes.analytics import router as analytics_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.API_VERSION,
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(rbac_router)
app.include_router(doctors_router)
app.include_router(patients_router)
app.include_router(appointments_router)
app.include_router(medical_records_router)
app.include_router(prescriptions_router)
app.include_router(doctor_notes_router)
app.include_router(lab_reports_router)
app.include_router(data_sharing_router)
app.include_router(notifications_router)
app.include_router(access_logs_router)
app.include_router(analytics_router)


@app.get("/", tags=["Root"])
def read_root():
    return {
        "message": "AI Smart Healthcare API is running",
        "status": "success",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "AI Smart Healthcare Backend",
    }


@app.get("/ready", tags=["Health"])
def ready_check():
    return {
        "status": "ready",
        "service": "AI Smart Healthcare Backend",
    }


@app.get("/health/db", tags=["Health"])
def health_db_check(response: Response):
    pg_ok = check_postgres_connection()
    mongo_ok = check_mongodb_connection()

    all_healthy = pg_ok and mongo_ok
    if not all_healthy:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "postgresql": "connected" if pg_ok else "disconnected",
        "mongodb": "connected" if mongo_ok else "disconnected",
        "status": "healthy" if all_healthy else "unhealthy",
    }
