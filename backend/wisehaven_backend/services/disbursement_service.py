"""Disbursement service for payments and withdrawals."""

from decimal import Decimal
from datetime import datetime, timedelta
from prisma import Prisma
from services.lock_service import LockService
from services.transaction_service import TransactionService


class DisbursementService:
    """Service for disbursement processing with temporal lock enforcement."""
    
    def __init__(self, db: Prisma):
        self.db = db
        self.lock_service = LockService(db)
        self.transaction_service = TransactionService(db)
    
    async def validate_disbursement_request(
        self,
        envelope_id: str,
        amount: Decimal,
        user_id: str
    ) -> tuple[bool, str]:
        """Validate if disbursement is allowed.
        
        Args:
            envelope_id: Envelope ID
            amount: Disbursement amount
            user_id: User ID (for authorization)
            
        Returns:
            Tuple of (is_valid: bool, message: str)
        """
        # Check envelope exists and belongs to user
        envelope = await self.db.envelope.find_first(
            where={"id": envelope_id, "user_id": user_id}
        )
        if not envelope:
            return False, "Envelope not found"
        
        # Check if envelope is active
        if not envelope.is_active:
            return False, "Envelope is not active"
        
        # Check temporal lock status
        is_allowed, lock_message = await self.lock_service.validate_withdrawal_allowed(envelope_id)
        if not is_allowed:
            return False, lock_message
        
        # Check sufficient balance
        if envelope.balance < amount:
            return False, f"Insufficient balance. Available: {envelope.balance}, Requested: {amount}"
        
        # Check amount is positive
        if amount <= 0:
            return False, "Amount must be positive"
        
        return True, "Disbursement validated"
    
    async def process_disbursement(
        self,
        user_id: str,
        envelope_id: str,
        amount: Decimal,
        payee_id: str | None,
        description: str
    ) -> dict:
        """Process disbursement from envelope.
        
        Args:
            user_id: User's ID
            envelope_id: Source envelope ID
            amount: Disbursement amount
            payee_id: Optional payee ID
            description: Disbursement description
            
        Returns:
            Disbursement details with transaction ID
            
        Raises:
            ValueError if validation fails
        """
        # Validate disbursement
        is_valid, message = await self.validate_disbursement_request(
            envelope_id=envelope_id,
            amount=amount,
            user_id=user_id
        )
        
        if not is_valid:
            raise ValueError(message)
        
        # Get envelope for details
        envelope = await self.db.envelope.find_unique(
            where={"id": envelope_id}
        )
        
        # Deduct from envelope balance
        new_balance = await self.transaction_service.update_envelope_balance(
            envelope_id=envelope_id,
            amount=amount,
            operation="subtract"
        )
        
        # Record transaction in ledger
        transaction = await self.transaction_service.create_transaction(
            user_id=user_id,
            transaction_type="DEBIT",
            amount=amount,
            description=description,
            envelope_id=envelope_id,
            payee_id=payee_id
        )
        
        # TODO: Integrate MoMo API for actual money transfer
        # For now, we just record the transaction
        
        return {
            "transaction_id": transaction["id"],
            "envelope_id": envelope_id,
            "envelope_name": envelope.name,
            "amount": amount,
            "previous_balance": envelope.balance,
            "new_balance": new_balance,
            "payee_id": payee_id,
            "description": description,
            "timestamp": transaction["timestamp"],
            "status": "completed"  # Would be "pending" if waiting for MoMo
        }
    
    async def create_emergency_withdrawal_request(
        self,
        user_id: str,
        amount: Decimal,
        justification: str,
        password: str
    ) -> dict:
        """Create emergency vault withdrawal request.
        
        Args:
            user_id: User's ID
            amount: Withdrawal amount
            justification: Reason for emergency withdrawal (10-500 chars)
            password: User's password for re-authentication
            
        Returns:
            Emergency withdrawal request details
            
        Raises:
            ValueError if validation fails
        """
        # Validate justification length
        if len(justification) < 10 or len(justification) > 500:
            raise ValueError("Justification must be 10-500 characters")
        
        # Get user for password verification
        from services.auth_service import AuthService
        auth_service = AuthService(self.db)
        
        user = await self.db.user.find_unique(where={"id": user_id})
        if not user:
            raise ValueError("User not found")
        
        # Verify password
        from utils.security import verify_password
        if not verify_password(password, user.password_hash):
            raise ValueError("Invalid password")
        
        # Get Emergency Vault
        emergency_vault = await self.db.envelope.find_first(
            where={"user_id": user_id, "is_emergency_vault": True}
        )
        if not emergency_vault:
            raise ValueError("Emergency Vault not found")
        
        # Validate 50% limit
        max_withdrawal = emergency_vault.balance * Decimal("0.5")
        if amount > max_withdrawal:
            raise ValueError(f"Cannot withdraw more than 50% of vault balance. Maximum: {max_withdrawal}")
        
        # Check for existing pending requests
        existing_request = await self.db.emergencywithdrawalrequest.find_first(
            where={
                "user_id": user_id,
                "status": "PENDING"
            }
        )
        if existing_request:
            raise ValueError("You already have a pending emergency withdrawal request")
        
        # Create withdrawal request
        request = await self.db.emergencywithdrawalrequest.create(
            data={
                "user_id": user_id,
                "amount": amount,
                "justification": justification,
                "status": "PENDING"
            }
        )
        
        # Calculate approval timestamp (24 hours from now)
        approval_timestamp = datetime.utcnow() + timedelta(hours=24)
        
        return {
            "request_id": request.id,
            "amount": amount,
            "justification": justification,
            "status": "PENDING",
            "requested_at": request.requested_at,
            "can_approve_at": approval_timestamp,
            "message": "Emergency withdrawal request created. You can approve it after 24-hour cooling-off period."
        }
    
    async def approve_emergency_withdrawal(
        self,
        request_id: str,
        user_id: str
    ) -> dict:
        """Approve emergency withdrawal after cooling-off period.
        
        Args:
            request_id: Withdrawal request ID
            user_id: User's ID (for authorization)
            
        Returns:
            Approved withdrawal details
            
        Raises:
            ValueError if validation fails
        """
        # Get withdrawal request
        request = await self.db.emergencywithdrawalrequest.find_first(
            where={"id": request_id, "user_id": user_id}
        )
        
        if not request:
            raise ValueError("Withdrawal request not found")
        
        if request.status != "PENDING":
            raise ValueError(f"Request already {request.status.lower()}")
        
        # Check cooling-off period (24 hours)
        cooling_off_end = request.requested_at + timedelta(hours=24)
        if datetime.utcnow() < cooling_off_end:
            remaining = cooling_off_end - datetime.utcnow()
            hours = int(remaining.total_seconds() / 3600)
            minutes = int((remaining.total_seconds() % 3600) / 60)
            raise ValueError(f"Cooling-off period not complete. Please wait {hours}h {minutes}m")
        
        # Get Emergency Vault
        emergency_vault = await self.db.envelope.find_first(
            where={"user_id": user_id, "is_emergency_vault": True}
        )
        
        # Validate balance is still sufficient
        if emergency_vault.balance < request.amount:
            raise ValueError(f"Insufficient balance. Current: {emergency_vault.balance}")
        
        # Process withdrawal
        new_balance = await self.transaction_service.update_envelope_balance(
            envelope_id=emergency_vault.id,
            amount=request.amount,
            operation="subtract"
        )
        
        # Record transaction
        transaction = await self.transaction_service.create_transaction(
            user_id=user_id,
            transaction_type="DEBIT",
            amount=request.amount,
            description=f"Emergency withdrawal: {request.justification}",
            envelope_id=emergency_vault.id
        )
        
        # Update request status
        await self.db.emergencywithdrawalrequest.update(
            where={"id": request_id},
            data={
                "status": "APPROVED",
                "approved_at": datetime.utcnow()
            }
        )
        
        return {
            "request_id": request_id,
            "transaction_id": transaction["id"],
            "amount": request.amount,
            "previous_balance": emergency_vault.balance,
            "new_balance": new_balance,
            "justification": request.justification,
            "status": "APPROVED",
            "approved_at": datetime.utcnow()
        }
    
    async def get_emergency_withdrawal_requests(self, user_id: str) -> list[dict]:
        """Get all emergency withdrawal requests for user.
        
        Args:
            user_id: User's ID
            
        Returns:
            List of withdrawal requests
        """
        requests = await self.db.emergencywithdrawalrequest.find_many(
            where={"user_id": user_id},
            order={"requested_at": "desc"}
        )
        
        result = []
        for req in requests:
            can_approve_at = req.requested_at + timedelta(hours=24)
            is_ready = datetime.utcnow() >= can_approve_at and req.status == "PENDING"
            
            result.append({
                "request_id": req.id,
                "amount": req.amount,
                "justification": req.justification,
                "status": req.status,
                "requested_at": req.requested_at,
                "approved_at": req.approved_at,
                "can_approve_at": can_approve_at,
                "is_ready_to_approve": is_ready
            })
        
        return result
