"""Disbursement request/response schemas."""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


class DisbursementRequest(BaseModel):
    """Request schema for disbursement."""
    envelope_id: str
    payee_id: str | None = None
    amount: Decimal = Field(..., gt=0, description="Disbursement amount")
    description: str = Field(..., min_length=1, max_length=500, description="Payment description")
    
    @field_validator('amount')
    @classmethod
    def validate_amount_precision(cls, v):
        """Validate amount has max 2 decimal places."""
        if v.as_tuple().exponent < -2:
            raise ValueError('Amount must have maximum 2 decimal places')
        if v > Decimal('999999999.99'):
            raise ValueError('Amount must not exceed 999,999,999.99')
        return v


class EmergencyWithdrawalRequest(BaseModel):
    """Request schema for emergency vault withdrawal."""
    amount: Decimal = Field(..., gt=0, description="Withdrawal amount")
    justification: str = Field(..., min_length=10, max_length=500, description="Reason for withdrawal")
    password: str | None = Field(None, description="Ignored — authentication handled by Clerk")
    
    @field_validator('amount')
    @classmethod
    def validate_amount_precision(cls, v):
        """Validate amount has max 2 decimal places."""
        if v.as_tuple().exponent < -2:
            raise ValueError('Amount must have maximum 2 decimal places')
        if v > Decimal('999999999.99'):
            raise ValueError('Amount must not exceed 999,999,999.99')
        return v


class DisbursementResponse(BaseModel):
    """Response schema for disbursement."""
    transaction_id: str
    envelope_id: str
    envelope_name: str
    amount: Decimal
    previous_balance: Decimal
    new_balance: Decimal
    payee_id: str | None = None
    description: str
    timestamp: datetime
    status: str  # completed, pending, failed


class EmergencyWithdrawalResponse(BaseModel):
    """Response schema for emergency withdrawal request."""
    request_id: str
    amount: Decimal
    justification: str
    status: str  # PENDING, APPROVED
    requested_at: datetime | None = None
    approved_at: datetime | None = None
    can_approve_at: datetime | None = None
    transaction_id: str | None = None
    message: str | None = None


class EmergencyWithdrawalListResponse(BaseModel):
    """Response schema for list of emergency withdrawal requests."""
    requests: list[dict]
