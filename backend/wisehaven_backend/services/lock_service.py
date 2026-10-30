"""Temporal lock service for envelope time-based constraints."""

from datetime import datetime, timezone
from prisma import Prisma


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class LockService:
    """Service for temporal lock management."""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    async def create_temporal_lock(
        self,
        envelope_id: str,
        maturity_timestamp: datetime
    ) -> dict:
        """Create temporal lock on envelope.
        
        Args:
            envelope_id: Envelope ID
            maturity_timestamp: Lock maturity date/time
            
        Returns:
            Created lock info
            
        Raises:
            ValueError if timestamp is not in future or lock already exists
        """
        # Validate timestamp is in future
        if maturity_timestamp <= _utcnow():
            raise ValueError("Maturity timestamp must be in the future")
        
        # Check if envelope exists
        envelope = await self.db.envelope.find_unique(
            where={"id": envelope_id},
            include={"temporal_lock": True}
        )
        if not envelope:
            raise ValueError("Envelope not found")
        
        # Check if lock already exists
        if envelope.temporal_lock:
            raise ValueError("Envelope already has a temporal lock")
        
        # Create lock
        lock = await self.db.temporallock.create(
            data={
                "envelope_id": envelope_id,
                "maturity_timestamp": maturity_timestamp,
                "notified": False
            }
        )
        
        return {
            "id": lock.id,
            "envelope_id": lock.envelope_id,
            "maturity_timestamp": lock.maturity_timestamp,
            "status": "LOCKED",
            "created_at": lock.created_at
        }
    
    async def check_lock_status(self, envelope_id: str) -> str:
        """Check if envelope is locked or released.
        
        Args:
            envelope_id: Envelope ID
            
        Returns:
            "LOCKED", "RELEASED", or "NONE" (no lock)
        """
        envelope = await self.db.envelope.find_unique(
            where={"id": envelope_id},
            include={"temporal_lock": True}
        )
        
        if not envelope or not envelope.temporal_lock:
            return "NONE"
        
        lock = envelope.temporal_lock
        if lock.maturity_timestamp > _utcnow():
            return "LOCKED"
        else:
            return "RELEASED"
    
    async def validate_withdrawal_allowed(self, envelope_id: str) -> tuple[bool, str]:
        """Validate if withdrawal is allowed from envelope.
        
        Args:
            envelope_id: Envelope ID
            
        Returns:
            Tuple of (allowed: bool, message: str)
        """
        status = await self.check_lock_status(envelope_id)
        
        if status == "LOCKED":
            envelope = await self.db.envelope.find_unique(
                where={"id": envelope_id},
                include={"temporal_lock": True}
            )
            maturity = envelope.temporal_lock.maturity_timestamp
            return False, f"Envelope is locked until {maturity.isoformat()}"
        
        return True, "Withdrawal allowed"
    
    async def get_matured_locks(self) -> list[dict]:
        """Get all locks that have matured but not been notified.
        
        Returns:
            List of matured locks with envelope info
        """
        locks = await self.db.temporallock.find_many(
            where={
                "maturity_timestamp": {"lte": _utcnow()},
                "notified": False
            },
            include={"envelope": {"include": {"user": True}}}
        )
        
        result = []
        for lock in locks:
            result.append({
                "lock_id": lock.id,
                "envelope_id": lock.envelope_id,
                "envelope_name": lock.envelope.name,
                "user_id": lock.envelope.user_id,
                "phone_number": lock.envelope.user.phone_number,
                "maturity_timestamp": lock.maturity_timestamp
            })
        
        return result
    
    async def mark_notified(self, lock_id: str) -> None:
        """Mark lock as notified.
        
        Args:
            lock_id: Lock ID
        """
        await self.db.temporallock.update(
            where={"id": lock_id},
            data={"notified": True}
        )
