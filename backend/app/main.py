import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from sqlalchemy.exc import SQLAlchemyError
from app.auth.router import router as auth_router
from app.users.router import router as users_router
from app.appointments.router import router as appointments_router
from app.admin.router import router as admin_router
from app.patients.router import router as patients_router
from app.prescription_notes.router import router as prescription_notes_router
from app.database.mongodb import check_mongodb_connection
from app.database.mysql import (
    Base,
    DatabaseUnavailableError,
    SessionLocal,
    check_database_connection,
    engine,
)
from app.models.auth import Role, RoleEnum, User
from app.models.appointments import DoctorProfile
from app.auth.security import hash_password

logger = logging.getLogger(__name__)

load_dotenv()

APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
DEVELOPMENT_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
configured_origins = os.getenv("CORS_ORIGINS")
if configured_origins is None:
    origins = [] if APP_ENV in {"prod", "production"} else DEVELOPMENT_ORIGINS
else:
    origins = [origin.strip().rstrip("/") for origin in configured_origins.split(",") if origin.strip()]

if "*" in origins:
    raise RuntimeError("CORS_ORIGINS must list explicit origins; wildcard CORS is not supported.")

app = FastAPI(
    title="SmartHealthcare API",
    description="Backend API for Smart Healthcare Data Exchange and Analytics Ecosystem",
    version="0.1.0",
)

@app.exception_handler(SQLAlchemyError)
async def handle_database_error(_request, _exception):
    """Return a controlled service error when a configured database is unavailable."""
    return JSONResponse(
        status_code=503,
        content={"detail": "Healthcare database is unavailable. Please try again later."},
    )


@app.exception_handler(DatabaseUnavailableError)
async def handle_unconfigured_database(_request, _exception):
    return JSONResponse(
        status_code=503,
        content={"detail": "Healthcare database is unavailable. Please try again later."},
    )

# Include Authentication & Users Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(appointments_router)
app.include_router(admin_router)
app.include_router(patients_router)
app.include_router(prescription_notes_router)


@app.on_event("startup")
def initialize_relational_database():
    """Create the current ORM schema and required roles for a fresh deployment."""
    if engine is None or SessionLocal is None:
        return

    try:
        # Import model modules before create_all so all mapped tables are registered.
        from app.models import patient as _patient_model  # noqa: F401

        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            for role in RoleEnum:
                existing = db.query(Role).filter(Role.name == role.value).first()
                if existing is None:
                    db.add(Role(name=role.value, description=f"{role.value.title()} account"))
            db.commit()

            if APP_ENV in {"dev", "development"}:
                demo_accounts = [
                    ("Dr.", "Ananya Rao", "doctor.demo@smarthealthcare.local", "DemoDoctor@123", RoleEnum.DOCTOR),
                    ("Rahul", "Mehta", "patient.demo@smarthealthcare.local", "DemoPatient@123", RoleEnum.PATIENT),
                    ("SmartCare", "Admin", "admin.demo@smarthealthcare.local", "DemoAdmin@123", RoleEnum.ADMIN),
                ]
                for first_name, last_name, email, password, role in demo_accounts:
                    existing = db.query(User).filter(User.email == email).first()
                    if existing is None:
                        role_record = db.query(Role).filter(Role.name == role.value).one()
                        db.add(User(
                            role_id=role_record.id,
                            first_name=first_name,
                            last_name=last_name,
                            email=email,
                            password_hash=hash_password(password),
                            is_active=True,
                        ))
                db.commit()

                demo_doctor = db.query(User).filter(User.email == "doctor.demo@smarthealthcare.local").first()
                if demo_doctor and not demo_doctor.doctor_profile:
                    db.add(DoctorProfile(
                        user_id=demo_doctor.id,
                        department="Primary Care",
                        specialty="General Practice",
                    ))
                    db.commit()

            bootstrap_email = os.getenv("BOOTSTRAP_ADMIN_EMAIL", "").strip().lower()
            bootstrap_password = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "").strip()
            if bootstrap_email and bootstrap_password and not db.query(User).filter(User.email == bootstrap_email).first():
                admin_role = db.query(Role).filter(Role.name == RoleEnum.ADMIN.value).one()
                db.add(User(
                    role_id=admin_role.id,
                    first_name="System",
                    last_name="Administrator",
                    email=bootstrap_email,
                    password_hash=hash_password(bootstrap_password),
                    is_active=True,
                ))
                db.commit()

            # Optional presentation accounts are provisioned only when the
            # deployment explicitly enables them and supplies generated secrets.
            if os.getenv("ENABLE_DEMO_ACCOUNTS", "").strip().lower() in {"1", "true", "yes"}:
                demo_accounts = [
                    (
                        "DEMO_PATIENT_EMAIL", "DEMO_PATIENT_PASSWORD",
                        "Demo", "Patient", RoleEnum.PATIENT,
                    ),
                    (
                        "DEMO_DOCTOR_EMAIL", "DEMO_DOCTOR_PASSWORD",
                        "Demo", "Doctor", RoleEnum.DOCTOR,
                    ),
                    (
                        "DEMO_ADMIN_EMAIL", "DEMO_ADMIN_PASSWORD",
                        "Demo", "Administrator", RoleEnum.ADMIN,
                    ),
                ]
                for email_key, password_key, first_name, last_name, role_value in demo_accounts:
                    email = os.getenv(email_key, "").strip().lower()
                    password = os.getenv(password_key, "").strip()
                    if not email or not password:
                        logger.warning("Presentation account skipped because %s or %s is missing", email_key, password_key)
                        continue

                    existing = db.query(User).filter(User.email == email).first()
                    if existing:
                        if existing.role.name != role_value.value:
                            logger.error("Presentation account email is already assigned to a different role (%s)", email_key)
                        elif role_value == RoleEnum.DOCTOR and not existing.doctor_profile:
                            db.add(DoctorProfile(
                                user_id=existing.id,
                                department="Primary Care",
                                specialty="General Practice",
                            ))
                        continue

                    role_record = db.query(Role).filter(Role.name == role_value.value).one()
                    demo_user = User(
                        role_id=role_record.id,
                        first_name=first_name,
                        last_name=last_name,
                        email=email,
                        password_hash=hash_password(password),
                        is_active=True,
                    )
                    db.add(demo_user)
                    db.flush()
                    if role_value == RoleEnum.DOCTOR:
                        db.add(DoctorProfile(
                            user_id=demo_user.id,
                            department="Primary Care",
                            specialty="General Practice",
                        ))
                db.commit()
    except SQLAlchemyError as exc:
        # Keep liveness available so Render can show logs; readiness remains 503.
        logger.error("Relational database initialization failed (%s)", type(exc).__name__)


@app.get("/", tags=["System"])
def root():
    return {
        "message": "SmartHealthcare API is running",
        "status": "online",
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
    }


@app.get("/ready", tags=["System"])
def readiness_check():
    """Readiness check for the required relational database."""
    database_ok, _ = check_database_connection()
    if not database_ok:
        raise HTTPException(status_code=503, detail="The application database is unavailable.")
    return {"status": "ready"}


@app.get("/database/health", tags=["System"])
def database_health():
    database_ok, _ = check_database_connection()
    mongo_ok, mongo_msg = check_mongodb_connection()

    return {
        "relational_database": "connected" if database_ok else "unavailable",
        "mongodb": "connected" if mongo_ok else "optional / not configured",
    }


# Wrap the whole application so even handled and unhandled API errors receive
# the same CORS headers as successful responses.
app = CORSMiddleware(
    app=app,
    allow_origins=origins,
    allow_origin_regex=None if APP_ENV in {"prod", "production"} else r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
