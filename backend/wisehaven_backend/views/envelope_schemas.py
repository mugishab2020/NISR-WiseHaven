"""Envelope request/response schemas."""

from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, field_validator


class EnvelopeCreateRequest(BaseModel):
    """Request schema for creating an envelope."""
    name: str = Field(..., min_length=1, max_length=100, description="Envelope name")
    category: str = Field(..., description="Envelope category")
    description: str | None = Field(None, max_length=500, description="Optional description")
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Validate category is one of the standard categories."""
        valid_categories = ["Rent", "Food", "Utilities", "Transport", "Healthcare", "Education", "Custom"]
        if v not in valid_categories:
            raise ValueError(f'Category must be one of: {", ".join(valid_categories)}')
        return v


class EnvelopeUpdateRequest(BaseModel):
    """Request schema for updating an envelope."""
    name: str | None = Field(None, min_length=1, max_length=100, description="Envelope name")
    description: str | None = Field(None, max_length=500, description="Optional description")
    is_active: bool | None = Field(None, description="Active status")


class TemporalLockRequest(BaseModel):
    """Request schema for creating a temporal lock."""
    maturity_timestamp: datetime = Field(..., description="Lock maturity date/time (ISO 8601 format)")
    
    @field_validator('maturity_timestamp')
    @classmethod
    def validate_future_timestamp(cls, v):
        """Validate that maturity timestamp is in the future."""
        if v <= datetime.utcnow():
            raise ValueError('Maturity timestamp must be in the future')
        return v


class TemporalLockResponse(BaseModel):
    """Response schema for temporal lock."""
    id: str
    envelope_id: str
    maturity_timestamp: datetime
    status: str  # LOCKED or RELEASED
    created_at: datetime


class EnvelopeResponse(BaseModel):
    """Response schema for envelope."""
    id: str
    name: str
    category: str
    description: str | None
    balance: Decimal
    is_active: bool
    is_emergency_vault: bool
    created_at: datetime
    updated_at: datetime
    temporal_lock: TemporalLockResponse | None = None


class EnvelopeListResponse(BaseModel):
    """Response schema for list of envelopes."""
    envelopes: list[EnvelopeResponse]
