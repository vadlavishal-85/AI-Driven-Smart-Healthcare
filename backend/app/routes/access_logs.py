from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session, joinedload
from app.database.postgres import get_db
from app.models.user import User
from app.models.role import UserRole
from app.models.access_log import AccessLog
from app.core.dependencies import require_roles
from app.schemas.access_log import AccessLogResponse

router = APIRouter(prefix="/access-logs", tags=["Access Logs"])


@router.get(
    "",
    response_model=List[AccessLogResponse],
    status_code=status.HTTP_200_OK,
    summary="Admin retrieves system audit access logs",
)
def get_access_logs(
    limit: int = Query(
        100, ge=1, le=500, description="Max log records to return"
    ),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    search: Optional[str] = Query(None, description="Optional search term"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only audit endpoint for tracking healthcare document security and operations.
    Logs cannot be added, edited, or deleted through this API.
    """
    query = (
        db.query(AccessLog)
        .options(joinedload(AccessLog.user))
        .order_by(AccessLog.created_at.desc())
    )

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (AccessLog.action.ilike(term))
            | (AccessLog.resource_type.ilike(term))
            | (AccessLog.resource_id.ilike(term))
            | (AccessLog.ip_address.ilike(term))
        )

    logs = query.offset(offset).limit(limit).all()

    return [
        AccessLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=log.user.full_name if log.user else (f"User {str(log.user_id)[:8]}" if log.user_id else "System Engine"),
            user_email=log.user.email if log.user else None,
            user_role=log.user.role if log.user else ("SYSTEM" if not log.user_id else None),
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            ip_address=log.ip_address,
            created_at=log.created_at,
            timestamp=log.created_at,
        )
        for log in logs
    ]
