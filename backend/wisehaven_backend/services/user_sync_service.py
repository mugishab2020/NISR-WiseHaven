"""User synchronization service for Clerk authentication."""

from prisma import Prisma
from utils.clerk_auth import get_clerk_user_data


class UserSyncService:
    """Service for syncing Clerk users with local database."""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    async def get_or_create_user(self, clerk_id: str) -> dict:
        """Get user from database or create if doesn't exist.
        
        This is called whenever a Clerk-authenticated user makes a request.
        If the user doesn't exist in our database, we create them.
        
        Args:
            clerk_id: Clerk user ID from JWT token
            
        Returns:
            User record from database
        """
        # Check if user exists
        user = await self.db.user.find_unique(
            where={"clerk_id": clerk_id}
        )
        
        if user:
            return {
                "id": user.id,
                "clerk_id": user.clerk_id,
                "email": user.email,
                "phone_number": user.phone_number,
                "first_sweep_percentage": user.first_sweep_percentage,
                "preferred_notification": user.preferred_notification,
                "emergency_contact": user.emergency_contact,
                "is_active": user.is_active,
                "created_at": user.created_at,
                "updated_at": user.updated_at
            }
        
        # User doesn't exist, fetch from Clerk and create
        clerk_user = await get_clerk_user_data(clerk_id)
        
        # Create user in database
        user = await self.db.user.create(
            data={
                "id": clerk_id,  # Use Clerk ID as primary key
                "clerk_id": clerk_id,
                "email": clerk_user.get("email"),
                "phone_number": clerk_user.get("phone_number"),
                "first_sweep_percentage": 0.05,  # 5% default
                "preferred_notification": "EMAIL",
                "is_active": True
            }
        )
        
        # Create Emergency Vault for new user
        await self.db.envelope.create(
            data={
                "user_id": user.id,
                "name": "Emergency Vault",
                "category": "Emergency",
                "description": "Automatic emergency fund with first-sweep allocation",
                "balance": 0,
                "is_active": True,
                "is_emergency_vault": True
            }
        )
        
        # Create wallet for new user
        await self.db.wallet.create(
            data={
                "user_id": user.id,
                "balance": 0,
                "total_deposited": 0,
                "total_allocated": 0
            }
        )
        
        return {
            "id": user.id,
            "clerk_id": user.clerk_id,
            "email": user.email,
            "phone_number": user.phone_number,
            "first_sweep_percentage": user.first_sweep_percentage,
            "preferred_notification": user.preferred_notification,
            "emergency_contact": user.emergency_contact,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    
    async def update_user_profile(
        self,
        clerk_id: str,
        first_sweep_percentage: float | None = None,
        preferred_notification: str | None = None,
        emergency_contact: str | None = None
    ) -> dict:
        """Update user profile settings.
        
        Args:
            clerk_id: Clerk user ID
            first_sweep_percentage: First-sweep percentage (5-10%)
            preferred_notification: Notification preference
            emergency_contact: Emergency contact info
            
        Returns:
            Updated user record
        """
        update_data = {}
        
        if first_sweep_percentage is not None:
            if first_sweep_percentage < 0.05 or first_sweep_percentage > 0.10:
                raise ValueError("First-sweep percentage must be between 5% and 10%")
            update_data["first_sweep_percentage"] = first_sweep_percentage
        
        if preferred_notification is not None:
            if preferred_notification not in ["EMAIL", "SMS", "PUSH", "BOTH"]:
                raise ValueError("Invalid notification preference")
            update_data["preferred_notification"] = preferred_notification
        
        if emergency_contact is not None:
            update_data["emergency_contact"] = emergency_contact
        
        if not update_data:
            raise ValueError("No fields to update")
        
        user = await self.db.user.update(
            where={"clerk_id": clerk_id},
            data=update_data
        )
        
        return {
            "id": user.id,
            "clerk_id": user.clerk_id,
            "email": user.email,
            "phone_number": user.phone_number,
            "first_sweep_percentage": user.first_sweep_percentage,
            "preferred_notification": user.preferred_notification,
            "emergency_contact": user.emergency_contact,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    
    async def get_user_profile(self, clerk_id: str) -> dict:
        """Get user profile.
        
        Args:
            clerk_id: Clerk user ID
            
        Returns:
            User profile
        """
        user = await self.db.user.find_unique(
            where={"clerk_id": clerk_id}
        )
        
        if not user:
            raise ValueError("User not found")
        
        return {
            "id": user.id,
            "clerk_id": user.clerk_id,
            "email": user.email,
            "phone_number": user.phone_number,
            "first_sweep_percentage": user.first_sweep_percentage,
            "preferred_notification": user.preferred_notification,
            "emergency_contact": user.emergency_contact,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "updated_at": user.updated_at
        }
    
    async def deactivate_user(self, clerk_id: str) -> dict:
        """Deactivate user account (soft delete).
        
        Preserves transaction history but marks account as inactive.
        
        Args:
            clerk_id: Clerk user ID
            
        Returns:
            Updated user record
        """
        user = await self.db.user.update(
            where={"clerk_id": clerk_id},
            data={"is_active": False}
        )
        
        return {
            "id": user.id,
            "clerk_id": user.clerk_id,
            "is_active": user.is_active,
            "message": "User account deactivated successfully"
        }
