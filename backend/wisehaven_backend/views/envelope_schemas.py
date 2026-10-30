"""Envelope request/response schemas."""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, field_validator


class EnvelopeCreateRequest(BaseModel):
    """Request schema for creating an envelope."""
    name: str = Field(..., min_length=1, max_length=100, description="Envelope name")
    category: str = Field(..., description="Envelope category")
    description: str | None = Field(None, max_length=500, description="Optional description")
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """Accept both backend category names and frontend category keys."""
        # Backend canonical categories
        backend_categories = {
            "Rent", "Food", "Utilities", "Transport",
            "Healthcare", "Education", "Custom", "Emergency",
        }
        # Frontend category keys → canonical backend names
        frontend_map = {
            "shelter":    "Rent",
            "food":       "Food",
            "utilities":  "Utilities",
            "transport":  "Transport",
            "healthcare": "Healthcare",
            "education":  "Education",
            "family":     "Custom",
            "business":   "Custom",
            "custom":     "Custom",
        }
        if v in backend_categories:
            return v
        mapped = frontend_map.get(v.lower())
        if mapped:
            return mapped
        raise ValueError(
            f'Category must be one of: {", ".join(sorted(backend_categories))} '
            f'or a frontend key like shelter, food, utilities, transport, healthcare, education, custom'
        )


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
        from datetime import timezone as tz
        now = datetime.now(tz.utc)
        # Make v timezone-aware if it isn't already
        if v.tzinfo is None:
            v = v.replace(tzinfo=tz.utc)
        if v <= now:
            raise ValueError('Maturity timestamp must be in the future')
        return v


class TemporalLockResponse(BaseModel):
    """Response schema for temporal lock."""
    id: str
    envelope_id: str
    maturity_timestamp: datetime
    status: str  # LOCKED or RELEASED
    created_at: datetime


class AllowanceScheduleRequest(BaseModel):
    release_amount: Decimal = Field(..., gt=0)
    frequency: Literal["DAILY", "WEEKLY"]
    first_release_at: datetime

    @field_validator("first_release_at")
    @classmethod
    def validate_first_release(cls, value: datetime) -> datetime:
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        if value <= datetime.now(timezone.utc):
            raise ValueError("First release must be in the future")
        return value


class AllowanceScheduleResponse(BaseModel):
    id: str
    envelope_id: str
    release_amount: Decimal
    frequency: Literal["DAILY", "WEEKLY"]
    next_release_at: datetime
    is_active: bool


class EnvelopeResponse(BaseModel):
    """Response schema for envelope."""
    id: str
    name: str
    category: str
    description: str | None
    balance: Decimal
    locked_balance: Decimal = Decimal("0.00")
    is_active: bool
    is_emergency_vault: bool
    created_at: datetime
    updated_at: datetime
    temporal_lock: TemporalLockResponse | None = None
    allowance_schedule: AllowanceScheduleResponse | None = None


class EnvelopeListResponse(BaseModel):
    """Response schema for list of envelopes."""
    envelopes: list[EnvelopeResponse]


class FundEnvelopeRequest(BaseModel):
    """Request schema for funding an envelope from the wallet."""
    amount: Decimal = Field(..., gt=0, description="Amount to allocate (must be positive)")
    description: str | None = Field(None, max_length=200, description="Optional description")


class FundEnvelopeResponse(BaseModel):
    """Response schema after funding an envelope."""
    envelope_id: str
    envelope_name: str
    amount: Decimal
    new_envelope_balance: Decimal
    new_wallet_balance: Decimal
    transaction_id: str
