"""Transaction and deposit request/response schemas."""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


class DepositRequest(BaseModel):
    """Request schema for income deposit."""
    amount: Decimal = Field(..., gt=0, description="Deposit amount")
    description: str = Field(..., description="Deposit description")
    
    @field_validator('amount')
    @classmethod
    def validate_amount_precision(cls, v):
        """Validate amount has max 2 decimal places."""
        if v.as_tuple().exponent < -2:
            raise ValueError('Amount must have maximum 2 decimal places')
        if v > Decimal('999999999.99'):
            raise ValueError('Amount must not exceed 999,999,999.99')
        return v


class AllocationDetail(BaseModel):
    """Allocation detail for a single envelope."""
    envelope_id: str
    envelope_name: str
    amount: Decimal


class DepositResponse(BaseModel):
    """Response schema for deposit transaction."""
    transaction_id: str
    total_amount: Decimal
    first_sweep_amount: Decimal
    remaining_amount: Decimal
    allocations: list[AllocationDetail]
    timestamp: datetime


class TransactionResponse(BaseModel):
    """Response schema for transaction."""
    id: str
    timestamp: datetime
    transaction_type: str
    amount: Decimal
    envelope_id: str | None
    envelope_name: str | None
    payee_id: str | None
    payee_name: str | None
    description: str


class TransactionListResponse(BaseModel):
    """Response schema for paginated transaction list."""
    transactions: list[TransactionResponse]
    pagination: dict


class BalanceResponse(BaseModel):
    """Response schema for envelope balances."""
    envelope_id: str
    envelope_name: str
    balance: Decimal
    is_emergency_vault: bool
    temporal_lock_status: str | None  # LOCKED, RELEASED, or None
    maturity_timestamp: datetime | None


class BalanceListResponse(BaseModel):
    """Response schema for all balances."""
    balances: list[BalanceResponse]
    total_balance: Decimal
