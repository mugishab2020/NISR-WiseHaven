"""Transaction ledger service for immutable audit trail."""

from datetime import datetime
from decimal import Decimal
from prisma import Json, Prisma


class TransactionService:
    """Service for transaction ledger operations."""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    async def create_transaction(
        self,
        user_id: str,
        transaction_type: str,
        amount: Decimal,
        description: str,
        envelope_id: str | None = None,
        payee_id: str | None = None,
        source_id: str | None = None,
        destination_id: str | None = None,
        metadata: dict | None = None
    ) -> dict:
        """Create immutable transaction ledger entry.
        
        Args:
            user_id: User's ID
            transaction_type: Type (CREDIT, DEBIT, TRANSFER, FIRST_SWEEP)
            amount: Transaction amount
            description: Transaction description
            envelope_id: Related envelope ID
            payee_id: Related payee ID
            source_id: Source identifier
            destination_id: Destination identifier
            metadata: Additional metadata (JSON)
            
        Returns:
            Created transaction info
        """
        # Prisma's checked create input accepts relation connections, while the
        # foreign-key scalar fields (user_id, envelope_id, payee_id) belong to
        # its unchecked input. Do not mix the two input shapes.
        create_data: dict = {
            "user": {"connect": {"id": user_id}},
            "transaction_type": transaction_type,
            "amount": amount,
            "description": description,
        }
        if envelope_id is not None:
            create_data["envelope"] = {"connect": {"id": envelope_id}}
        if payee_id is not None:
            create_data["payee"] = {"connect": {"id": payee_id}}
        if source_id    is not None: create_data["source_id"]    = source_id
        if destination_id is not None: create_data["destination_id"] = destination_id
        # JSON values must be explicitly wrapped with Prisma's Json type.
        if metadata     is not None: create_data["metadata"]     = Json(metadata)

        transaction = await self.db.transaction.create(data=create_data)
        
        return {
            "id": transaction.id,
            "timestamp": transaction.timestamp,
            "transaction_type": transaction.transaction_type,
            "amount": transaction.amount,
            "description": transaction.description,
            "envelope_id": transaction.envelope_id,
            "payee_id": transaction.payee_id
        }
    
    async def get_transactions(
        self,
        user_id: str,
        envelope_id: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        page: int = 1,
        page_size: int = 20
    ) -> dict:
        """Get paginated transaction history.
        
        Args:
            user_id: User's ID
            envelope_id: Filter by envelope
            start_date: Start date filter
            end_date: End date filter
            page: Page number (1-indexed)
            page_size: Items per page
            
        Returns:
            dict with transactions and pagination info
        """
        # Build where clause
        where = {"user_id": user_id}
        if envelope_id:
            where["envelope_id"] = envelope_id
        if start_date or end_date:
            where["timestamp"] = {}
            if start_date:
                where["timestamp"]["gte"] = start_date
            if end_date:
                where["timestamp"]["lte"] = end_date
        
        # Get total count
        total_count = await self.db.transaction.count(where=where)
        
        # Get paginated results
        skip = (page - 1) * page_size
        transactions = await self.db.transaction.find_many(
            where=where,
            include={"envelope": True, "payee": True},
            order={"timestamp": "desc"},
            skip=skip,
            take=page_size
        )
        
        result = []
        for t in transactions:
            result.append({
                "id": t.id,
                "timestamp": t.timestamp,
                "transaction_type": t.transaction_type,
                "amount": t.amount,
                "envelope_id": t.envelope_id,
                "envelope_name": t.envelope.name if t.envelope else None,
                "payee_id": t.payee_id,
                "payee_name": t.payee.name if t.payee else None,
                "description": t.description
            })
        
        total_pages = (total_count + page_size - 1) // page_size
        
        return {
            "transactions": result,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total_count": total_count,
                "total_pages": total_pages
            }
        }
    
    async def get_envelope_balance(self, envelope_id: str) -> Decimal:
        """Get current envelope balance.
        
        Args:
            envelope_id: Envelope ID
            
        Returns:
            Current balance
        """
        envelope = await self.db.envelope.find_unique(
            where={"id": envelope_id}
        )
        return envelope.balance if envelope else Decimal("0.00")
    
    async def update_envelope_balance(
        self,
        envelope_id: str,
        amount: Decimal,
        operation: str  # "add" or "subtract"
    ) -> Decimal:
        """Update envelope balance.
        
        Args:
            envelope_id: Envelope ID
            amount: Amount to add or subtract
            operation: "add" or "subtract"
            
        Returns:
            New balance
        """
        envelope = await self.db.envelope.find_unique(
            where={"id": envelope_id}
        )
        
        if operation == "add":
            new_balance = envelope.balance + amount
        else:  # subtract
            new_balance = envelope.balance - amount
            if new_balance < 0:
                raise ValueError("Insufficient balance")
        
        updated = await self.db.envelope.update(
            where={"id": envelope_id},
            data={"balance": new_balance}
        )
        
        return updated.balance
