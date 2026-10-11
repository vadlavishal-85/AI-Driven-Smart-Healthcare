import uuid
from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database.postgres import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.models.role import UserRole

# OAuth2 scheme configuring Bearer token authorization in OpenAPI / Swagger docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    """
    Validates JWT Bearer token, fetches user from PostgreSQL,
    and enforces active account check.
    Returns 401 Unauthorized for missing, invalid, or expired tokens.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id_str: str = payload.get("sub")
    if not user_id_str:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(user_id_str)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.query(User).filter(User.id == user_uuid).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user account",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def require_roles(*allowed_roles: Union[UserRole, str]):
    """
    Dependency factory for Role-Based Access Control (RBAC).
    Verifies that the authenticated user possesses one of the allowed roles.
    Raises 401 if unauthenticated, 403 if authenticated but role is unauthorized.
    """
    # Normalize allowed roles to string values
    role_values = {
        r.value if isinstance(r, UserRole) else str(r) for r in allowed_roles
    }

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return role_checker
