"""Envelope management controller."""

from decimal import Decimal
from fastapi import APIRouter, HTTPException, status, Depends
from models import get_db
from prisma import Prisma
from services.envelope_service import EnvelopeService
from services.lock_service import LockService
from services.transaction_service import TransactionService
from utils.dependencies import get_current_user_id
from views.envelope_schemas import (
    EnvelopeCreateRequest,
    EnvelopeUpdateRequest,
    EnvelopeResponse,
    EnvelopeListResponse,
    TemporalLockRequest,
    TemporalLockResponse,
    FundEnvelopeRequest,
    FundEnvelopeResponse,
)

router = APIRouter(prefix="/envelopes", tags=["Envelopes"])


@router.get("", response_model=EnvelopeListResponse)
async def get_envelopes(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Get all envelopes for authenticated user.
    
    Returns all active and inactive envelopes with:
    - Current balance
    - Temporal lock status
    - Category and description
    """
    try:
        envelope_service = EnvelopeService(db)
        envelopes = await envelope_service.get_user_envelopes(user_id)
        return EnvelopeListResponse(envelopes=envelopes)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve envelopes: {str(e)}"
        )


@router.post("", response_model=EnvelopeResponse, status_code=status.HTTP_201_CREATED)
async def create_envelope(
    request: EnvelopeCreateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Create a new budget envelope.
    
    Creates envelope with:
    - Zero initial balance
    - Active status
    - User-specified category and name
    """
    try:
        envelope_service = EnvelopeService(db)
        envelope = await envelope_service.create_envelope(
            user_id=user_id,
            name=request.name,
            category=request.category,
            description=request.description
        )
        return EnvelopeResponse(**envelope)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create envelope: {str(e)}"
        )


@router.get("/{envelope_id}", response_model=EnvelopeResponse)
async def get_envelope(
    envelope_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Get specific envelope by ID."""
    try:
        envelope_service = EnvelopeService(db)
        envelopes = await envelope_service.get_user_envelopes(user_id)
        
        # Find the specific envelope
        envelope = next((e for e in envelopes if e["id"] == envelope_id), None)
        if not envelope:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envelope not found"
            )
        
        return EnvelopeResponse(**envelope)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve envelope: {str(e)}"
        )


@router.patch("/{envelope_id}", response_model=EnvelopeResponse)
async def update_envelope(
    envelope_id: str,
    request: EnvelopeUpdateRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Update envelope configuration.
    
    Allows updating:
    - name
    - description
    - is_active status
    
    Cannot deactivate Emergency Vault.
    """
    try:
        envelope_service = EnvelopeService(db)
        envelope = await envelope_service.update_envelope(
            envelope_id=envelope_id,
            user_id=user_id,
            name=request.name,
            description=request.description,
            is_active=request.is_active
        )
        return EnvelopeResponse(**envelope)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update envelope: {str(e)}"
        )


@router.post("/{envelope_id}/lock", response_model=TemporalLockResponse, status_code=status.HTTP_201_CREATED)
async def create_temporal_lock(
    envelope_id: str,
    request: TemporalLockRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Create temporal lock on envelope.
    
    Prevents withdrawals until maturity_timestamp.
    Maturity timestamp must be in the future.
    """
    try:
        # Verify envelope belongs to user
        envelope_service = EnvelopeService(db)
        envelopes = await envelope_service.get_user_envelopes(user_id)
        envelope = next((e for e in envelopes if e["id"] == envelope_id), None)
        
        if not envelope:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Envelope not found"
            )
        
        # Create temporal lock
        lock_service = LockService(db)
        lock = await lock_service.create_temporal_lock(
            envelope_id=envelope_id,
            maturity_timestamp=request.maturity_timestamp
        )
        return TemporalLockResponse(**lock)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create temporal lock: {str(e)}"
        )


@router.post("/{envelope_id}/fund", response_model=FundEnvelopeResponse, status_code=status.HTTP_200_OK)
async def fund_envelope(
    envelope_id: str,
    request: FundEnvelopeRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Allocate funds from wallet into an envelope.

    Atomically:
    - Debits the requested amount from the user's wallet balance
    - Credits the same amount to the envelope balance
    - Records a TRANSFER transaction in the ledger

    Rejects if:
    - Envelope does not exist or belongs to another user
    - Wallet balance is insufficient
    - Amount is zero or negative
    """
    amount = Decimal(str(request.amount))

    # --- verify envelope ownership ---
    envelope = await db.envelope.find_first(
        where={"id": envelope_id, "user_id": user_id}
    )
    if not envelope:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Envelope not found"
        )

    # --- verify wallet has enough funds ---
    wallet = await db.wallet.find_unique(where={"user_id": user_id})
    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )
    if wallet.balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient wallet balance. Available: {wallet.balance}, Requested: {amount}"
        )

    # --- atomic debit wallet + credit envelope ---
    new_wallet_balance = wallet.balance - amount
    await db.wallet.update(
        where={"id": wallet.id},
        data={
            "balance": new_wallet_balance,
            "total_allocated": wallet.total_allocated + amount,
            "version": {"increment": 1},
        }
    )

    new_envelope_balance = envelope.balance + amount
    await db.envelope.update(
        where={"id": envelope_id},
        data={"balance": new_envelope_balance}
    )

    # --- ledger entry ---
    description = request.description or f"Allocated to {envelope.name}"
    transaction_service = TransactionService(db)
    tx = await transaction_service.create_transaction(
        user_id=user_id,
        transaction_type="TRANSFER",
        amount=amount,
        description=description,
        envelope_id=envelope_id,
    )

    return FundEnvelopeResponse(
        envelope_id=envelope_id,
        envelope_name=envelope.name,
        amount=amount,
        new_envelope_balance=new_envelope_balance,
        new_wallet_balance=new_wallet_balance,
        transaction_id=tx["id"],
    )
