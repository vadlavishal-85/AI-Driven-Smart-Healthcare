from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.auth.security import hash_password, verify_password
from app.models.auth import User
from app.users.schemas import UserProfileResponse, UserUpdateRequest


def build_user_profile_response(user: User) -> UserProfileResponse:
    """Build a safe user profile response from a User entity."""
    return UserProfileResponse(
        id=user.id,
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        phone=user.phone,
        role=user.role.name if user.role else "UNKNOWN",
        is_active=user.is_active,
        created_at=user.created_at,
    )


def update_user_profile(
    db: Session,
    user: User,
    update_data: UserUpdateRequest,
) -> User:
    """Update profile fields (first_name, last_name, phone) for the authenticated user."""
    if update_data.first_name is not None:
        user.first_name = update_data.first_name.strip()

    if update_data.last_name is not None:
        user.last_name = update_data.last_name.strip()

    if update_data.phone is not None:
        cleaned_phone = update_data.phone.strip()
        user.phone = cleaned_phone if cleaned_phone else None

    db.commit()
    db.refresh(user)
    return user


def change_user_password(
    db: Session,
    user: User,
    current_password: str,
    new_password: str,
) -> None:
    """Verify current password and securely update user password using existing bcrypt routines."""
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect.",
        )

    user.password_hash = hash_password(new_password)
    db.commit()
