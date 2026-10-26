"""Allocation plan service for income distribution configuration."""

from prisma import Prisma


class AllocationService:
    """Service for allocation plan CRUD operations."""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    async def create_allocation_plan(
        self,
        user_id: str,
        name: str,
        items: list[dict]
    ) -> dict:
        """Create a new allocation plan.
        
        Args:
            user_id: User's ID
            name: Plan name
            items: List of {envelope_id, percentage} dicts
            
        Returns:
            Created allocation plan with items
            
        Raises:
            ValueError if validation fails
        """
        # Validate percentages sum to 100%
        total_percentage = sum(item["percentage"] for item in items)
        if abs(total_percentage - 100.0) > 0.01:
            raise ValueError(f"Percentages must sum to 100%, got {total_percentage}%")
        
        # Validate all envelopes exist and are active
        for item in items:
            envelope = await self.db.envelope.find_unique(
                where={"id": item["envelope_id"]}
            )
            if not envelope:
                raise ValueError(f"Envelope {item['envelope_id']} not found")
            if not envelope.is_active:
                raise ValueError(f"Envelope {envelope.name} is not active")
            if envelope.user_id != user_id:
                raise ValueError(f"Envelope {envelope.name} does not belong to user")
        
        # Create allocation plan
        plan = await self.db.allocationplan.create(
            data={
                "user_id": user_id,
                "name": name,
                "is_active": False
            }
        )
        
        # Create allocation items
        for item in items:
            await self.db.allocationplanitem.create(
                data={
                    "allocation_plan_id": plan.id,
                    "envelope_id": item["envelope_id"],
                    "percentage": item["percentage"]
                }
            )
        
        # Return plan with items
        return await self.get_allocation_plan(plan.id, user_id)
    
    async def get_allocation_plan(self, plan_id: str, user_id: str) -> dict:
        """Get allocation plan by ID.
        
        Args:
            plan_id: Plan ID
            user_id: User ID (for authorization)
            
        Returns:
            Allocation plan with items
        """
        plan = await self.db.allocationplan.find_first(
            where={"id": plan_id, "user_id": user_id},
            include={"items": {"include": {"envelope": True}}}
        )
        
        if not plan:
            raise ValueError("Allocation plan not found")
        
        items = []
        for item in plan.items:
            items.append({
                "envelope_id": item.envelope_id,
                "envelope_name": item.envelope.name,
                "percentage": item.percentage
            })
        
        return {
            "id": plan.id,
            "name": plan.name,
            "is_active": plan.is_active,
            "items": items,
            "created_at": plan.created_at,
            "updated_at": plan.updated_at
        }
    
    async def get_user_allocation_plans(self, user_id: str) -> list[dict]:
        """Get all allocation plans for a user.
        
        Args:
            user_id: User's ID
            
        Returns:
            List of allocation plans with items
        """
        plans = await self.db.allocationplan.find_many(
            where={"user_id": user_id},
            include={"items": {"include": {"envelope": True}}},
            order={"created_at": "desc"}
        )
        
        result = []
        for plan in plans:
            items = []
            for item in plan.items:
                items.append({
                    "envelope_id": item.envelope_id,
                    "envelope_name": item.envelope.name,
                    "percentage": item.percentage
                })
            
            result.append({
                "id": plan.id,
                "name": plan.name,
                "is_active": plan.is_active,
                "items": items,
                "created_at": plan.created_at,
                "updated_at": plan.updated_at
            })
        
        return result
    
    async def activate_allocation_plan(self, plan_id: str, user_id: str) -> dict:
        """Activate an allocation plan.
        
        Deactivates all other plans for the user.
        
        Args:
            plan_id: Plan ID to activate
            user_id: User ID (for authorization)
            
        Returns:
            Updated allocation plan
        """
        # Verify plan exists and belongs to user
        plan = await self.db.allocationplan.find_first(
            where={"id": plan_id, "user_id": user_id},
            include={"items": {"include": {"envelope": True}}}
        )
        
        if not plan:
            raise ValueError("Allocation plan not found")
        
        # Validate all envelopes are still active
        for item in plan.items:
            if not item.envelope.is_active:
                raise ValueError(f"Cannot activate plan: envelope {item.envelope.name} is inactive")
        
        # Deactivate all other plans for this user
        await self.db.allocationplan.update_many(
            where={"user_id": user_id},
            data={"is_active": False}
        )
        
        # Activate this plan
        await self.db.allocationplan.update(
            where={"id": plan_id},
            data={"is_active": True}
        )
        
        return await self.get_allocation_plan(plan_id, user_id)
