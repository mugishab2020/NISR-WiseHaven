"""In-app notification service.

Persists notification events to NotificationLog and exposes read/unread
management. No external SMS or push delivery is performed here — this
service handles the in-app notification feed only.

All notifications are scoped to a single user and cannot be read by
another user.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Literal

from prisma import Prisma
import logging

logger = logging.getLogger(__name__)

NotificationType = Literal[
    "ENVELOPE_MATURED",
    "ENVELOPE_UNLOCKING_SOON",
    "DEPOSIT_RECEIVED",
    "DISBURSEMENT_COMPLETED",
    "EMERGENCY_WITHDRAWAL_APPROVED",
]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class NotificationService:
    """Service for in-app notification CRUD."""

    def __init__(self, db: Prisma):
        self.db = db

    # ── Write ──────────────────────────────────────────────────────────────

    async def create_notification(
        self,
        user_id: str,
        notification_type: NotificationType,
        title: str,
        message: str,
        metadata: dict | None = None,
    ) -> dict:
        """Persist a new in-app notification for a user.

        Args:
            user_id: Authenticated user's ID
            notification_type: Semantic event type
            title: Short human-readable title
            message: Full notification body
            metadata: Optional dict for extra context (amounts, IDs, etc.)

        Returns:
            Created notification dict
        """
        record = await self.db.notificationlog.create(
            data={
                "user_id": user_id,
                "notification_type": notification_type,
                # channel = IN_APP for this service
                "channel": "IN_APP",
                "message": json.dumps({"title": title, "body": message}),
                "status": "UNREAD",
                "sent_at": _utcnow(),
                "retry_count": 0,
                "metadata": json.dumps(metadata) if metadata else None,
            }
        )
        logger.info(
            "Created notification type=%s user=%s id=%s",
            notification_type,
            user_id,
            record.id,
        )
        return self._format(record)

    # ── Read ───────────────────────────────────────────────────────────────

    async def get_user_notifications(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0,
    ) -> dict:
        """List notifications for a user, newest first.

        Args:
            user_id: Authenticated user's ID
            limit: Page size
            offset: Row offset for pagination

        Returns:
            dict with notifications list and total_count
        """
        total = await self.db.notificationlog.count(
            where={"user_id": user_id, "channel": "IN_APP"}
        )
        records = await self.db.notificationlog.find_many(
            where={"user_id": user_id, "channel": "IN_APP"},
            order={"sent_at": "desc"},
            take=limit,
            skip=offset,
        )
        return {
            "notifications": [self._format(r) for r in records],
            "total_count": total,
        }

    async def get_unread_count(self, user_id: str) -> int:
        """Return the number of unread in-app notifications for a user."""
        return await self.db.notificationlog.count(
            where={"user_id": user_id, "channel": "IN_APP", "status": "UNREAD"}
        )

    # ── Mutations ──────────────────────────────────────────────────────────

    async def mark_read(self, notification_id: str, user_id: str) -> dict:
        """Mark a single notification as read.

        Enforces ownership — a user cannot read another user's notifications.

        Args:
            notification_id: Notification ID
            user_id: Authenticated user's ID

        Returns:
            Updated notification dict

        Raises:
            ValueError if not found or not owned by user
        """
        existing = await self.db.notificationlog.find_first(
            where={"id": notification_id, "user_id": user_id, "channel": "IN_APP"}
        )
        if not existing:
            raise ValueError("Notification not found")

        updated = await self.db.notificationlog.update(
            where={"id": notification_id},
            data={"status": "READ"},
        )
        return self._format(updated)

    async def mark_all_read(self, user_id: str) -> int:
        """Mark all unread in-app notifications as read for a user.

        Args:
            user_id: Authenticated user's ID

        Returns:
            Number of notifications marked as read
        """
        result = await self.db.notificationlog.update_many(
            where={"user_id": user_id, "channel": "IN_APP", "status": "UNREAD"},
            data={"status": "READ"},
        )
        return result

    # ── Event helpers ──────────────────────────────────────────────────────

    async def notify_deposit(
        self, user_id: str, amount: float, transaction_id: str
    ) -> None:
        """Create a deposit-received notification (fire-and-forget helper)."""
        try:
            await self.create_notification(
                user_id=user_id,
                notification_type="DEPOSIT_RECEIVED",
                title="Demo deposit received",
                message=f"{amount:,.0f} demo RWF added to your wallet.",
                metadata={"amount": amount, "transaction_id": transaction_id},
            )
        except Exception as exc:
            logger.warning("Failed to create deposit notification: %s", exc)

    async def notify_disbursement(
        self,
        user_id: str,
        envelope_name: str,
        amount: float,
        transaction_id: str,
    ) -> None:
        """Create a disbursement-completed notification."""
        try:
            await self.create_notification(
                user_id=user_id,
                notification_type="DISBURSEMENT_COMPLETED",
                title=f"Payment from {envelope_name} completed",
                message=(
                    f"Simulated payment of {amount:,.0f} demo RWF "
                    f"from your {envelope_name} envelope was processed."
                ),
                metadata={
                    "amount": amount,
                    "envelope_name": envelope_name,
                    "transaction_id": transaction_id,
                },
            )
        except Exception as exc:
            logger.warning("Failed to create disbursement notification: %s", exc)

    async def notify_envelope_matured(
        self, user_id: str, envelope_id: str, envelope_name: str, balance: float
    ) -> None:
        """Create a lock-matured notification."""
        try:
            await self.create_notification(
                user_id=user_id,
                notification_type="ENVELOPE_MATURED",
                title=f"{envelope_name} is ready to pay",
                message=(
                    f"Your {envelope_name} envelope has matured. "
                    f"{balance:,.0f} demo RWF is now available for simulated payment."
                ),
                metadata={
                    "envelope_id": envelope_id,
                    "envelope_name": envelope_name,
                    "balance": balance,
                },
            )
        except Exception as exc:
            logger.warning("Failed to create maturity notification: %s", exc)

    async def notify_emergency_withdrawal_approved(
        self, user_id: str, amount: float, request_id: str
    ) -> None:
        """Create an emergency withdrawal approved notification."""
        try:
            await self.create_notification(
                user_id=user_id,
                notification_type="EMERGENCY_WITHDRAWAL_APPROVED",
                title="Emergency withdrawal approved",
                message=(
                    f"Your emergency vault withdrawal of {amount:,.0f} demo RWF "
                    "has been approved and processed."
                ),
                metadata={"amount": amount, "request_id": request_id},
            )
        except Exception as exc:
            logger.warning("Failed to create emergency withdrawal notification: %s", exc)

    # ── Private ────────────────────────────────────────────────────────────

    def _format(self, record) -> dict:
        """Convert a NotificationLog Prisma record to a response dict."""
        # message column stores JSON {"title": ..., "body": ...}
        try:
            msg_data = json.loads(record.message)
            title = msg_data.get("title", "")
            body = msg_data.get("body", record.message)
        except (json.JSONDecodeError, TypeError):
            title = ""
            body = record.message

        metadata = None
        if record.metadata:
            try:
                metadata = json.loads(record.metadata)
            except (json.JSONDecodeError, TypeError):
                metadata = None

        return {
            "id": record.id,
            "user_id": record.user_id,
            "notification_type": record.notification_type,
            "title": title,
            "message": body,
            "status": record.status,
            "is_read": record.status == "READ",
            "sent_at": record.sent_at,
            "metadata": metadata,
        }
