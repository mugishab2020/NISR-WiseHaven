"""Notification request/response schemas."""

from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    """Single in-app notification."""
    id: str
    user_id: str
    notification_type: str
    title: str
    message: str
    status: str
    is_read: bool
    sent_at: datetime
    metadata: Optional[Any] = None


class NotificationListResponse(BaseModel):
    """Paginated list of notifications."""
    notifications: list[NotificationResponse]
    total_count: int
    unread_count: int


class UnreadCountResponse(BaseModel):
    """Unread notification count."""
    unread_count: int
