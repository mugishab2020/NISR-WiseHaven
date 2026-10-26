"""Wallet request/response schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class WalletResponse(BaseModel):
    """Response schema for wallet information."""
    id: str
    user_id: str
    balance: Decimal
    total_deposited: Decimal
    total_allocated: Decimal
    created_at: datetime
    updated_at: datetime
    version: int


class AddFundsRequest(BaseModel):
    """Request schema for adding simulated funds (dev/test only)."""
    amount: Decimal = Field(..., description="Amount to add to wallet (positive value)")
    description: str = Field(default="Simulated deposit", description="Description of the deposit")
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        """Validate amount is positive and has max 2 decimal places."""
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        if v.as_tuple().exponent < -2:
            raise ValueError('Amount must have at most 2 decimal places')
        if v > Decimal('999999999.99'):
            raise ValueError('Amount exceeds maximum allowed value')
        return v


class FundingResponse(BaseModel):
    """Response schema for funding operations."""
    success: bool
    message: str
    wallet: WalletResponse
    transaction_id: str


class DepositRequest(BaseModel):
    """Request schema for wallet deposit via payment provider."""
    amount: Decimal = Field(..., description="Amount to deposit (positive value)")
    phone_number: str = Field(..., description="Phone number for mobile money payment (e.g., 250788123456)")
    currency: str = Field(default="RWF", description="Currency code (default: RWF)")
    description: str = Field(default="Wallet deposit", description="Description of the deposit")
    
    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        """Validate amount is positive and has max 2 decimal places."""
        if v <= 0:
            raise ValueError('Amount must be greater than zero')
        if v.as_tuple().exponent < -2:
            raise ValueError('Amount must have at most 2 decimal places')
        if v > Decimal('999999999.99'):
            raise ValueError('Amount exceeds maximum allowed value')
        return v
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone(cls, v):
        """Validate phone number format."""
        # Remove spaces and dashes
        cleaned = v.replace(' ', '').replace('-', '')
        if not cleaned.isdigit():
            raise ValueError('Phone number must contain only digits')
        if len(cleaned) < 9 or len(cleaned) > 15:
            raise ValueError('Phone number must be between 9 and 15 digits')
        return cleaned


class DepositResponse(BaseModel):
    """Response schema for wallet deposit initiation."""
    payment_id: str
    payment_reference: str
    status: str
    message: str
    amount: Decimal
    currency: str


class PaymentStatusResponse(BaseModel):
    """Response schema for payment status check."""
    payment_id: str
    payment_reference: str
    status: str
    provider: str
    amount: Decimal
    currency: str
    description: str
    created_at: datetime
    updated_at: datetime
    error_message: Optional[str] = None


class PaymentCallbackRequest(BaseModel):
    """Request schema for payment provider callback."""
    payment_reference: str
    status: str
    provider_data: dict = Field(default_factory=dict)
