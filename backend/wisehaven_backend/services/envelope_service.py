"""Envelope management service."""

from datetime import datetime, timezone
from decimal import Decimal
from prisma import Prisma
from services.allowance_service import AllowanceService


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class EnvelopeService:
    """Service for envelope CRUD operations."""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    async def create_envelope(
        self,
        user_id: str,
        name: str,
        category: str,
        description: str | None = None
    ) -> dict:
        """Create a new envelope.
        
        Args:
            user_id: User's ID
            name: Envelope name
            category: Envelope category
            description: Optional description
            
        Returns:
            Created envelope info
        """
        envelope = await self.db.envelope.create(
            data={
                "user_id": user_id,
                "name": name,
                "category": category,
                "description": description,
                "balance": Decimal("0.00"),
                "locked_balance": Decimal("0.00"),
                "is_active": True,
                "is_emergency_vault": False
            }
        )
        
        return {
            "id": envelope.id,
            "name": envelope.name,
            "category": envelope.category,
            "description": envelope.description,
            "balance": envelope.balance,
            "locked_balance": envelope.locked_balance,
            "is_active": envelope.is_active,
            "is_emergency_vault": envelope.is_emergency_vault,
            "created_at": envelope.created_at,
            "updated_at": envelope.updated_at,
            "temporal_lock": None,
            "allowance_schedule": None,
        }
    
    async def get_user_envelopes(self, user_id: str) -> list[dict]:
        """Get all envelopes for a user.
        
        Args:
            user_id: User's ID
            
        Returns:
            List of envelopes with temporal lock status
        """
        await AllowanceService(self.db).release_due(user_id)
        envelopes = await self.db.envelope.find_many(
            where={"user_id": user_id},
            include={"temporal_lock": True, "allowance_schedule": True}
        )
        
        result = []
        for envelope in envelopes:
            temporal_lock = None
            if envelope.temporal_lock:
                lock = envelope.temporal_lock
                status = "LOCKED" if lock.maturity_timestamp > _utcnow() else "RELEASED"
                temporal_lock = {
                    "id": lock.id,
                    "envelope_id": lock.envelope_id,
                    "maturity_timestamp": lock.maturity_timestamp,
                    "status": status,
                    "created_at": lock.created_at
                }

            allowance_schedule = None
            if envelope.allowance_schedule:
                allowance_schedule = AllowanceService._format_schedule(envelope.allowance_schedule)
            
            result.append({
                "id": envelope.id,
                "name": envelope.name,
                "category": envelope.category,
                "description": envelope.description,
                "balance": envelope.balance,
                "locked_balance": envelope.locked_balance,
                "is_active": envelope.is_active,
                "is_emergency_vault": envelope.is_emergency_vault,
                "created_at": envelope.created_at,
                "updated_at": envelope.updated_at,
                "temporal_lock": temporal_lock,
                "allowance_schedule": allowance_schedule,
            })
        
        return result
    
    async def update_envelope(
        self,
        envelope_id: str,
        user_id: str,
        name: str | None = None,
        description: str | None = None,
        is_active: bool | None = None
    ) -> dict:
        """Update envelope configuration.
        
        Args:
            envelope_id: Envelope ID
            user_id: User's ID (for authorization)
            name: New name
            description: New description
            is_active: New active status
            
        Returns:
            Updated envelope info
            
        Raises:
            ValueError if trying to deactivate Emergency Vault
        """
        # Check if envelope exists and belongs to user
        envelope = await self.db.envelope.find_first(
            where={"id": envelope_id, "user_id": user_id}
        )
        if not envelope:
            raise ValueError("Envelope not found")
        
        # Prevent deactivating Emergency Vault
        if envelope.is_emergency_vault and is_active is False:
            raise ValueError("Cannot deactivate Emergency Vault")
        
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if description is not None:
            update_data["description"] = description
        if is_active is not None:
            update_data["is_active"] = is_active
        
        updated = await self.db.envelope.update(
            where={"id": envelope_id},
            data=update_data,
            include={"temporal_lock": True, "allowance_schedule": True}
        )
        
        temporal_lock = None
        if updated.temporal_lock:
            lock = updated.temporal_lock
            status = "LOCKED" if lock.maturity_timestamp > _utcnow() else "RELEASED"
            temporal_lock = {
                "id": lock.id,
                "envelope_id": lock.envelope_id,
                "maturity_timestamp": lock.maturity_timestamp,
                "status": status,
                "created_at": lock.created_at
            }
        
        allowance_schedule = None
        if updated.allowance_schedule:
            allowance_schedule = AllowanceService._format_schedule(updated.allowance_schedule)

        return {
            "id": updated.id,
            "name": updated.name,
            "category": updated.category,
            "description": updated.description,
            "balance": updated.balance,
            "locked_balance": updated.locked_balance,
            "is_active": updated.is_active,
            "is_emergency_vault": updated.is_emergency_vault,
            "created_at": updated.created_at,
            "updated_at": updated.updated_at,
            "temporal_lock": temporal_lock,
            "allowance_schedule": allowance_schedule,
        }
    
    async def get_emergency_vault(self, user_id: str) -> dict | None:
        """Get user's Emergency Vault.
        
        Args:
            user_id: User's ID
            
        Returns:
            Emergency Vault envelope or None
        """
        vault = await self.db.envelope.find_first(
            where={"user_id": user_id, "is_emergency_vault": True}
        )
        
        if not vault:
            return None
        
        return {
            "id": vault.id,
            "name": vault.name,
            "balance": vault.balance,
            "user_id": vault.user_id
        }
