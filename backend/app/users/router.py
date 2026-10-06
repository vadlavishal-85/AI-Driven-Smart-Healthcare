from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user
from app.database.mysql import get_db
from app.models.auth import User
from app.users.schemas import (
    ChangePasswordRequest,
    MessageResponse,
    UserProfileResponse,
    UserUpdateRequest,
)
from app.users.service import (
    build_user_profile_response,
    change_user_password,
    update_user_profile,
)

router = APIRouter(prefix="/users", tags=["Users & Account Management"])


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Get current authenticated user profile",
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
):
    """Retrieve profile and identity details of the currently authenticated user."""
    return build_user_profile_response(current_user)


@router.patch(
    "/me",
    response_model=UserProfileResponse,
    summary="Update authenticated user profile fields",
)
def update_my_profile(
    request: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Update profile details (first_name, last_name, phone) of the authenticated user.
    Modifications to id, email, role, and is_active are disallowed.
    """
    updated_user = update_user_profile(db=db, user=current_user, update_data=request)
    return build_user_profile_response(updated_user)


@router.post(
    "/me/change-password",
    response_model=MessageResponse,
    summary="Change account password",
)
def change_my_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Change password for the currently authenticated user.
    Verifies current password and updates with securely hashed new password.
    """
    change_user_password(
        db=db,
        user=current_user,
        current_password=request.current_password,
        new_password=request.new_password,
    )
    return MessageResponse(
        status="success",
        message="Password changed successfully.",
    )
