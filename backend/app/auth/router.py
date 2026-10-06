from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.auth.dependencies import (
    get_current_user,
    require_admin,
    require_doctor,
    require_patient,
)
from app.auth.security import create_access_token, hash_password, verify_password
from app.database.mysql import get_db
from app.models.auth import (
    Role,
    RoleEnum,
    TokenResponse,
    User,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new patient or healthcare identity",
)
def register_user(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Register a new user account.
    - Public self-registration is allowed for PATIENT.
    - Self-assignment of ADMIN role is strictly forbidden.
    """
    # Public self-registration is patient-only. Clinical and admin roles must
    # be provisioned through a trusted administrative workflow.
    if request.role != RoleEnum.PATIENT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration is limited to patient accounts.",
        )

    # 2. Check for existing email address
    normalized_email = request.email.lower().strip()
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email address is already registered.",
        )

    # 3. Retrieve role entity from database
    role_record = db.query(Role).filter(Role.name == request.role.value).first()
    if not role_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{request.role.value}' is not configured in the system.",
        )

    # 4. Hash password securely
    password_hash = hash_password(request.password)

    # 5. Create user record
    new_user = User(
        role_id=role_record.id,
        first_name=request.first_name.strip(),
        last_name=request.last_name.strip(),
        email=normalized_email,
        password_hash=password_hash,
        phone=request.phone.strip() if request.phone else None,
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        id=new_user.id,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        email=new_user.email,
        phone=new_user.phone,
        role=role_record.name,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT Bearer token",
)
async def login(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Authenticate a user via email and password.
    Supports both JSON payloads (REST clients) and Form data (FastAPI Swagger Authorize dialog).
    """
    email = None
    password = None

    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email")
            password = body.get("password")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid JSON payload",
            )
    else:
        # Fallback to form data for Swagger UI OAuth2 password flow
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/username and password are required.",
        )

    normalized_email = email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )

    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_role = user.role.name if user.role else "PATIENT"
    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user_role,
    }
    access_token = create_access_token(data=token_payload)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user identity",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve identity and profile details of currently authenticated user."""
    return UserResponse(
        id=current_user.id,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        email=current_user.email,
        phone=current_user.phone,
        role=current_user.role.name if current_user.role else "UNKNOWN",
        is_active=current_user.is_active,
        created_at=current_user.created_at,
    )


# =====================================================================
# Role-Based Access Control Verification Test Endpoints
# =====================================================================

@router.get(
    "/test/admin",
    summary="Admin role test endpoint",
    tags=["Role Authorization Tests"],
)
def test_admin_access(current_user: User = Depends(require_admin)):
    """Protected endpoint accessible only to users with ADMIN role."""
    return {
        "status": "success",
        "message": "Access granted: Administrator level authority verified.",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.name,
    }


@router.get(
    "/test/doctor",
    summary="Doctor role test endpoint",
    tags=["Role Authorization Tests"],
)
def test_doctor_access(current_user: User = Depends(require_doctor)):
    """Protected endpoint accessible only to users with DOCTOR role."""
    return {
        "status": "success",
        "message": "Access granted: Healthcare Provider level authority verified.",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.name,
    }


@router.get(
    "/test/patient",
    summary="Patient role test endpoint",
    tags=["Role Authorization Tests"],
)
def test_patient_access(current_user: User = Depends(require_patient)):
    """Protected endpoint accessible only to users with PATIENT role."""
    return {
        "status": "success",
        "message": "Access granted: Patient level authority verified.",
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.name,
    }
