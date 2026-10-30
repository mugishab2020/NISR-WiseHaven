"""Payee management controller.

Payees are simulated destinations in the WiseHaven demo environment.
No real money is sent. All operations are demo-only.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from models import db  # use global singleton
from services.payee_service import PayeeService
from utils.dependencies import get_current_user_id
from views.payee_schemas import (
    PayeeCreateRequest,
    PayeeUpdateRequest,
    PayeeResponse,
    PayeeListResponse,
)
import logging

router = APIRouter(prefix="/payees", tags=["Payees"])
logger = logging.getLogger(__name__)


@router.get("", response_model=PayeeListResponse)
async def get_payees(
    user_id: str = Depends(get_current_user_id),
):
    """List all payees for the authenticated user."""
    try:
        svc = PayeeService(db)
        payees = await svc.get_user_payees(user_id)
        return PayeeListResponse(payees=payees)
    except Exception as e:
        logger.exception("Failed to list payees")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve payees: {str(e)}",
        )


@router.post("", response_model=PayeeResponse, status_code=status.HTTP_201_CREATED)
async def create_payee(
    request: PayeeCreateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Create a new simulated payee.

    Payees are demo destinations only — no real money is transferred.
    """
    try:
        svc = PayeeService(db)
        payee = await svc.create_payee(
            user_id=user_id,
            name=request.name,
            payee_type=request.payee_type,
            phone_number=request.phone_number,
            account_identifier=request.account_identifier,
            envelope_ids=request.envelope_ids,
        )
        return PayeeResponse(**payee)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Failed to create payee")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payee: {str(e)}",
        )


@router.get("/{payee_id}", response_model=PayeeResponse)
async def get_payee(
    payee_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Get a specific payee by ID."""
    try:
        svc = PayeeService(db)
        payee = await svc.get_payee(payee_id, user_id)
        return PayeeResponse(**payee)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.exception("Failed to get payee")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve payee: {str(e)}",
        )


@router.patch("/{payee_id}", response_model=PayeeResponse)
async def update_payee(
    payee_id: str,
    request: PayeeUpdateRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Update payee information."""
    try:
        svc = PayeeService(db)
        payee = await svc.update_payee(
            payee_id=payee_id,
            user_id=user_id,
            name=request.name,
            phone_number=request.phone_number,
            account_identifier=request.account_identifier,
        )
        return PayeeResponse(**payee)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Failed to update payee")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update payee: {str(e)}",
        )


@router.delete("/{payee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payee(
    payee_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Delete a payee (only if no transaction history exists)."""
    try:
        svc = PayeeService(db)
        await svc.delete_payee(payee_id, user_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.exception("Failed to delete payee")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete payee: {str(e)}",
        )
