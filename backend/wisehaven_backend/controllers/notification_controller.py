"""In-app notification controller.

Endpoints:
  GET  /notifications                — list all notifications (newest first)
  GET  /notifications/unread-count   — fast badge count
  POST /notifications/{id}/read      — mark one as read
  POST /notifications/read-all       — mark all as read
"""

from fastapi import APIRouter, HTTPException, Query, status, Depends
from prisma import Prisma

from models import get_db
from utils.dependencies import get_current_user_id
from services.notification_service import NotificationService
from views.notification_schemas import (
    NotificationListResponse,
    NotificationResponse,
    UnreadCountResponse,
)

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
async def list_notifications(
    limit: int = Query(default=50, ge=1, le=100, description="Page size"),
    offset: int = Query(default=0, ge=0, description="Row offset"),
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Return in-app notifications for the authenticated user, newest first.

    Pagination via `limit` and `offset` query parameters.
    """
    svc = NotificationService(db)
    result = await svc.get_user_notifications(user_id, limit=limit, offset=offset)
    unread = await svc.get_unread_count(user_id)
    return NotificationListResponse(
        notifications=result["notifications"],
        total_count=result["total_count"],
        unread_count=unread,
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Fast badge count — returns only the number of unread notifications."""
    svc = NotificationService(db)
    count = await svc.get_unread_count(user_id)
    return UnreadCountResponse(unread_count=count)


@router.post("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_read(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Mark all unread in-app notifications as read for the authenticated user."""
    svc = NotificationService(db)
    count = await svc.mark_all_read(user_id)
    return {"marked_read": count}


@router.post("/{notification_id}/read", response_model=NotificationResponse)
async def mark_one_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
):
    """Mark a single notification as read.

    Returns 404 if the notification does not exist or belongs to another user.
    """
    svc = NotificationService(db)
    try:
        updated = await svc.mark_read(notification_id, user_id)
        return NotificationResponse(**updated)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {exc}",
        )
