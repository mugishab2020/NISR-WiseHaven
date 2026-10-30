"""Periodic task: check for newly matured envelope locks.

Runs every 5 minutes (configured in tasks/__init__.py).

For each lock whose maturity_timestamp has passed and that has not yet been
marked as notified, this task:
  1. Creates an in-app ENVELOPE_MATURED notification for the envelope owner.
  2. Marks the lock as notified so it is not processed again.

This is a demo-only operation. No real money moves and no external SMS or
push notification is sent from this task. The notification appears in the
user's in-app notification feed when they next open WiseHaven.

To add real SMS (Africa's Talking, Twilio, etc.) wire it in after the
in-app notification call inside _process_lock().
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timezone

from tasks import celery_app

logger = logging.getLogger(__name__)


def _run_async(coro):
    """Run an async coroutine from a synchronous Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


async def _process_matured_locks() -> int:
    """Core async logic — connect Prisma, query, notify, mark notified."""
    from models import db
    from services.lock_service import LockService
    from services.notification_service import NotificationService

    await db.connect()
    try:
        lock_svc = LockService(db)
        notif_svc = NotificationService(db)

        matured = await lock_svc.get_matured_locks()
        processed = 0

        for lock_info in matured:
            try:
                await _process_lock(lock_svc, notif_svc, lock_info)
                processed += 1
            except Exception as exc:
                logger.error(
                    "Failed to process matured lock %s: %s",
                    lock_info.get("lock_id"),
                    exc,
                    exc_info=True,
                )

        return processed
    finally:
        await db.disconnect()


async def _process_lock(lock_svc, notif_svc, lock_info: dict) -> None:
    """Handle a single matured lock: create notification + mark notified."""
    lock_id = lock_info["lock_id"]
    user_id = lock_info["user_id"]
    envelope_id = lock_info["envelope_id"]
    envelope_name = lock_info["envelope_name"]

    # Fetch current envelope balance for the notification message
    from models import db
    envelope = await db.envelope.find_unique(where={"id": envelope_id})
    balance = float(envelope.balance) if envelope else 0.0

    # Create in-app notification
    await notif_svc.notify_envelope_matured(
        user_id=user_id,
        envelope_id=envelope_id,
        envelope_name=envelope_name,
        balance=balance,
    )

    # Mark notified so this lock is not processed again
    await lock_svc.mark_notified(lock_id)

    logger.info(
        "Maturity notification sent: envelope=%s user=%s balance=%.2f",
        envelope_name,
        user_id,
        balance,
    )


@celery_app.task(
    name="tasks.maturity_monitor.check_matured_locks",
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def check_matured_locks(self):
    """Celery task: scan for matured envelope locks and create notifications.

    Runs every 5 minutes via Celery Beat (configured in tasks/__init__.py).
    Safe to run multiple times — locks are marked notified after processing
    so duplicates are prevented by the notified=False filter.
    """
    try:
        processed = _run_async(_process_matured_locks())
        logger.info("check_matured_locks: processed %d matured lock(s)", processed)
        return {"processed": processed, "timestamp": datetime.now(timezone.utc).isoformat()}
    except Exception as exc:
        logger.error("check_matured_locks failed: %s", exc, exc_info=True)
        raise self.retry(exc=exc)
