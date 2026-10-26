"""Payee request/response schemas."""

import re
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class PayeeCreateRequest(BaseModel):
    """Request schema for creating a payee."""
    name: str = Field(..., min_length=1, max_length=100, description="Payee name")
    phone_number: str | None = Field(None, description="Phone number for mobile money")
    account_identifier: str | None = Field(None, description="Account identifier (e.g., meter number)")
    payee_type: str = Field(..., description="Payee type (individual, merchant, utility)")
    envelope_ids: list[str] = Field(default_factory=list, description="Envelope IDs to link")
    
    @field_validator('payee_type')
    @classmethod
    def validate_payee_type(cls, v):
        """Validate payee type."""
        valid_types = ["individual", "merchant", "utility"]
        if v not in valid_types:
            raise ValueError(f'Payee type must be one of: {", ".join(valid_types)}')
        return v
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate phone number format for mobile money."""
        if v is None:
            return v
        pattern = r'^\+250[0-9]{9}$'
        if not re.match(pattern, v):
            raise ValueError('Phone number must be in format +250XXXXXXXXX')
        return v


class PayeeUpdateRequest(BaseModel):
    """Request schema for updating a payee."""
    name: str | None = Field(None, min_length=1, max_length=100)
    phone_number: str | None = None
    account_identifier: str | None = None
    
    @field_validator('phone_number')
    @classmethod
    def validate_phone_number(cls, v):
        """Validate phone number format."""
        if v is None:
            return v
        pattern = r'^\+250[0-9]{9}$'
        if not re.match(pattern, v):
            raise ValueError('Phone number must be in format +250XXXXXXXXX')
        return v


class LinkedEnvelopeInfo(BaseModel):
    """Linked envelope information."""
    envelope_id: str
    envelope_name: str


class PayeeResponse(BaseModel):
    """Response schema for payee."""
    id: str
    name: str
    phone_number: str | None
    account_identifier: str | None
    payee_type: str
    linked_envelopes: list[LinkedEnvelopeInfo]
    created_at: datetime
    updated_at: datetime


class PayeeListResponse(BaseModel):
    """Response schema for list of payees."""
    payees: list[PayeeResponse]
