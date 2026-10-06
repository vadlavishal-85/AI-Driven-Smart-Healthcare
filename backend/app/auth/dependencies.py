from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.auth.security import decode_access_token
from app.database.mysql import get_db
from app.models.auth import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that extracts and validates JWT Bearer token and returns authenticated User."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account",
        )

    return user


def require_roles(*allowed_roles: str) -> Callable[[User], User]:
    """Dependency factory that enforces Role-Based Access Control (RBAC)."""
    def role_verifier(current_user: User = Depends(get_current_user)) -> User:
        user_role_name = current_user.role.name if current_user.role else ""
        if user_role_name not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: User role '{user_role_name}' does not have required permissions ({', '.join(allowed_roles)})",
            )
        return current_user

    return role_verifier


# Reusable role dependencies
require_admin = require_roles("ADMIN")
require_doctor = require_roles("DOCTOR")
require_patient = require_roles("PATIENT")
