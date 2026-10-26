"""Payee management controller."""

from fastapi import APIRouter, HTTPException, status
from views.payee_schemas import (
    PayeeCreateRequest,
    PayeeUpdateRequest,
    PayeeResponse,
    PayeeListResponse
)

router = APIRouter(prefix="/payees", tags=["Payees"])


@router.get("", response_model=PayeeListResponse)
async def get_payees():
    """Get all payees for authenticated user with linked envelopes."""
    # TODO: Implement get payees
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Get payees endpoint not yet implemented"
    )


@router.post("", response_model=PayeeResponse, status_code=status.HTTP_201_CREATED)
async def create_payee(request: PayeeCreateRequest):
    """Create new payee.
    
    Validates:
    - Phone number format for mobile money types
    - Payee type is valid (individual, merchant, utility)
    - Referenced envelopes exist
    """
    # TODO: Implement create payee
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Create payee endpoint not yet implemented"
    )


@router.get("/{payee_id}", response_model=PayeeResponse)
async def get_payee(payee_id: str):
    """Get specific payee by ID."""
    # TODO: Implement get payee
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Get payee endpoint not yet implemented"
    )


@router.patch("/{payee_id}", response_model=PayeeResponse)
async def update_payee(payee_id: str, request: PayeeUpdateRequest):
    """Update payee information.
    
    Records modification in ledger for audit trail.
    """
    # TODO: Implement update payee
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Update payee endpoint not yet implemented"
    )
