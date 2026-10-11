from fastapi import APIRouter, Depends
from app.models.user import User
from app.models.role import UserRole
from app.core.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/rbac", tags=["RBAC Test"])


@router.get(
    "/admin",
    summary="Admin-only test endpoint",
)
def rbac_admin_only(current_user: User = Depends(require_roles(UserRole.ADMIN))):
    return {
        "message": "Admin access granted",
        "role": current_user.role,
    }


@router.get(
    "/doctor",
    summary="Doctor-only test endpoint",
)
def rbac_doctor_only(
    current_user: User = Depends(require_roles(UserRole.DOCTOR)),
):
    return {
        "message": "Doctor access granted",
        "role": current_user.role,
    }


@router.get(
    "/patient",
    summary="Patient-only test endpoint",
)
def rbac_patient_only(
    current_user: User = Depends(require_roles(UserRole.PATIENT)),
):
    return {
        "message": "Patient access granted",
        "role": current_user.role,
    }


@router.get(
    "/lab",
    summary="Lab-only test endpoint",
)
def rbac_lab_only(current_user: User = Depends(require_roles(UserRole.LAB))):
    return {
        "message": "Lab access granted",
        "role": current_user.role,
    }


@router.get(
    "/admin-doctor",
    summary="Multi-role test endpoint (Admin or Doctor)",
)
def rbac_admin_or_doctor(
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.DOCTOR)
    ),
):
    return {
        "message": "Admin or Doctor access granted",
        "role": current_user.role,
    }


@router.get(
    "/authenticated",
    summary="All-role authenticated test endpoint",
)
def rbac_authenticated_all(current_user: User = Depends(get_current_user)):
    return {
        "message": "Authenticated access granted",
        "role": current_user.role,
    }
