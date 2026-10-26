"""Income distribution service with first-sweep allocation."""

from decimal import Decimal, ROUND_DOWN
from prisma import Prisma
from services.transaction_service import TransactionService
from services.envelope_service import EnvelopeService


class DistributionService:
    """Service for income deposit and distribution."""
    
    def __init__(self, db: Prisma):
        self.db = db
        self.transaction_service = TransactionService(db)
        self.envelope_service = EnvelopeService(db)
    
    def calculate_first_sweep(self, amount: Decimal, percentage: float) -> Decimal:
        """Calculate first-sweep amount.
        
        Args:
            amount: Total deposit amount
            percentage: First-sweep percentage (5-10%)
            
        Returns:
            First-sweep amount rounded to 2 decimals
        """
        sweep_amount = amount * Decimal(str(percentage))
        return sweep_amount.quantize(Decimal('0.01'), rounding=ROUND_DOWN)
    
    async def process_deposit(
        self,
        user_id: str,
        amount: Decimal,
        description: str
    ) -> dict:
        """Process income deposit with automatic distribution.
        
        Flow:
        1. Calculate and allocate first-sweep to Emergency Vault
        2. Get active allocation plan
        3. Distribute remaining amount across envelopes
        4. Handle rounding remainder
        5. Record all transactions in ledger
        
        Args:
            user_id: User's ID
            amount: Deposit amount
            description: Deposit description
            
        Returns:
            Allocation summary with details per envelope
        """
        # Get user's first-sweep percentage
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user:
            raise ValueError("User not found")
        
        # Get Emergency Vault
        emergency_vault = await self.envelope_service.get_emergency_vault(user_id)
        if not emergency_vault:
            raise ValueError("Emergency Vault not found")
        
        # Calculate first-sweep
        first_sweep_amount = self.calculate_first_sweep(amount, user.first_sweep_percentage)
        
        # Allocate to Emergency Vault
        await self.transaction_service.update_envelope_balance(
            emergency_vault["id"],
            first_sweep_amount,
            "add"
        )
        
        # Record first-sweep transaction
        await self.transaction_service.create_transaction(
            user_id=user_id,
            transaction_type="FIRST_SWEEP",
            amount=first_sweep_amount,
            description=f"Emergency vault first-sweep ({user.first_sweep_percentage * 100}%)",
            envelope_id=emergency_vault["id"]
        )
        
        allocations = [{
            "envelope_id": emergency_vault["id"],
            "envelope_name": emergency_vault["name"],
            "amount": first_sweep_amount
        }]
        
        # Calculate remaining amount
        remaining_amount = amount - first_sweep_amount
        
        # Get active allocation plan
        allocation_plan = await self.db.allocationplan.find_first(
            where={"user_id": user_id, "is_active": True},
            include={"items": {"include": {"envelope": True}}}
        )
        
        if allocation_plan and allocation_plan.items:
            # Distribute according to allocation plan
            total_allocated = Decimal("0.00")
            
            for item in allocation_plan.items:
                envelope_amount = (remaining_amount * Decimal(str(item.percentage / 100.0))).quantize(
                    Decimal('0.01'),
                    rounding=ROUND_DOWN
                )
                
                # Update envelope balance
                await self.transaction_service.update_envelope_balance(
                    item.envelope_id,
                    envelope_amount,
                    "add"
                )
                
                # Record transaction
                await self.transaction_service.create_transaction(
                    user_id=user_id,
                    transaction_type="CREDIT",
                    amount=envelope_amount,
                    description=f"Income allocation ({item.percentage}%)",
                    envelope_id=item.envelope_id
                )
                
                allocations.append({
                    "envelope_id": item.envelope_id,
                    "envelope_name": item.envelope.name,
                    "amount": envelope_amount
                })
                
                total_allocated += envelope_amount
            
            # Handle rounding remainder - allocate to Emergency Vault
            remainder = remaining_amount - total_allocated
            if remainder > 0:
                await self.transaction_service.update_envelope_balance(
                    emergency_vault["id"],
                    remainder,
                    "add"
                )
                
                await self.transaction_service.create_transaction(
                    user_id=user_id,
                    transaction_type="CREDIT",
                    amount=remainder,
                    description="Rounding remainder allocation",
                    envelope_id=emergency_vault["id"]
                )
                
                # Update Emergency Vault allocation amount
                allocations[0]["amount"] += remainder
        else:
            # No allocation plan - put everything in Emergency Vault
            await self.transaction_service.update_envelope_balance(
                emergency_vault["id"],
                remaining_amount,
                "add"
            )
            
            await self.transaction_service.create_transaction(
                user_id=user_id,
                transaction_type="CREDIT",
                amount=remaining_amount,
                description="No allocation plan - emergency vault allocation",
                envelope_id=emergency_vault["id"]
            )
            
            allocations[0]["amount"] += remaining_amount
        
        return {
            "total_amount": amount,
            "first_sweep_amount": first_sweep_amount,
            "remaining_amount": remaining_amount,
            "allocations": allocations
        }
