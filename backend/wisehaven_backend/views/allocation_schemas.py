"""Allocation plan request/response schemas."""

from datetime import datetime
from pydantic import BaseModel, Field, field_validator


class AllocationItemRequest(BaseModel):
    """Request schema for allocation plan item."""
    envelope_id: str
    percentage: float = Field(..., ge=0.0, le=100.0, description="Allocation percentage")
    
    @field_validator('percentage')
    @classmethod
    def validate_percentage_precision(cls, v):
        """Validate percentage has max 2 decimal places."""
        if round(v, 2) != v:
            raise ValueError('Percentage must have maximum 2 decimal places')
        return v


class AllocationPlanCreateRequest(BaseModel):
    """Request schema for creating allocation plan."""
    name: str = Field(..., min_length=1, max_length=100, description="Plan name")
    items: list[AllocationItemRequest] = Field(..., min_items=1, description="Allocation items")
    
    @field_validator('items')
    @classmethod
    def validate_percentages_sum(cls, v):
        """Validate that percentages sum to exactly 100%."""
        total = sum(item.percentage for item in v)
        if abs(total - 100.0) > 0.01:  # Allow small floating point errors
            raise ValueError(f'Allocation percentages must sum to 100%, got {total}%')
        return v


class AllocationItemResponse(BaseModel):
    """Response schema for allocation plan item."""
    envelope_id: str
    envelope_name: str
    percentage: float


class AllocationPlanResponse(BaseModel):
    """Response schema for allocation plan."""
    id: str
    name: str
    is_active: bool
    items: list[AllocationItemResponse]
    created_at: datetime
    updated_at: datetime


class AllocationPlanListResponse(BaseModel):
    """Response schema for list of allocation plans."""
    plans: list[AllocationPlanResponse]
