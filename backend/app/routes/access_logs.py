from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
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
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
):
    """
    Admin-only audit endpoint for tracking healthcare document security and operations.
    Logs cannot be added, edited, or deleted through this API.
    """
    logs = (
        db.query(AccessLog)
        .order_by(AccessLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return logs
