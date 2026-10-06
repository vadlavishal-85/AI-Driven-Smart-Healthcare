from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy.orm import Session

from app.auth.dependencies import require_admin
from app.auth.security import hash_password
from app.database.mysql import get_db
from app.models.appointments import DoctorProfile
from app.models.auth import Role, RoleEnum, User

router = APIRouter(prefix="/admin", tags=["Administration"])


class DoctorCreateRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)
    department: str = Field(min_length=2, max_length=120)
    specialty: str = Field(min_length=2, max_length=180)

    model_config = ConfigDict(extra="forbid")


class DoctorCreatedResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    department: str
    specialty: str


@router.post("/doctors", response_model=DoctorCreatedResponse, status_code=status.HTTP_201_CREATED)
def create_doctor(
    request: DoctorCreateRequest,
    _admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    email = request.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="A user with this email address is already registered.")
    role = db.query(Role).filter(Role.name == RoleEnum.DOCTOR.value).first()
    if not role:
        raise HTTPException(status_code=503, detail="Doctor role is not configured.")
    doctor = User(
        role_id=role.id,
        first_name=request.first_name.strip(),
        last_name=request.last_name.strip(),
        email=email,
        password_hash=hash_password(request.password),
        is_active=True,
    )
    db.add(doctor)
    db.flush()
    profile = DoctorProfile(
        user_id=doctor.id,
        department=request.department.strip(),
        specialty=request.specialty.strip(),
    )
    db.add(profile)
    db.commit()
    db.refresh(doctor)
    return DoctorCreatedResponse(
        id=doctor.id,
        first_name=doctor.first_name,
        last_name=doctor.last_name,
        email=doctor.email,
        department=profile.department,
        specialty=profile.specialty,
    )
