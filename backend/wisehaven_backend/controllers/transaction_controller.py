"""Transaction and deposit controller."""

from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Query, Depends
from models import get_db
from prisma import Prisma
from services.distribution_service import DistributionService
from services.transaction_service import TransactionService
from services.envelope_service import EnvelopeService
from utils.dependencies import get_current_user_id
from views.transaction_schemas import (
    DepositRequest,
    DepositResponse,
    TransactionListResponse,
    BalanceListResponse,
    AllocationDetail,
    BalanceResponse
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post("/deposit", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def deposit_income(
    request: DepositRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Process income deposit with automatic distribution.
    
    Flow:
    1. Calculate first-sweep (5-10%) to Emergency Vault
    2. Distribute remaining amount according to active allocation plan
    3. Handle rounding by allocating remainder to Emergency Vault
    4. Record all transactions in immutable ledger
    
    Returns detailed allocation summary.
    """
    try:
        distribution_service = DistributionService(db)
        result = await distribution_service.process_deposit(
            user_id=user_id,
            amount=request.amount,
            description=request.description
        )
        
        # Convert allocations to AllocationDetail format
        allocations = [
            AllocationDetail(
                envelope_id=alloc["envelope_id"],
                envelope_name=alloc["envelope_name"],
                amount=alloc["amount"]
            )
            for alloc in result["allocations"]
        ]
        
        return DepositResponse(
            transaction_id="deposit-" + datetime.utcnow().isoformat(),
            total_amount=result["total_amount"],
            first_sweep_amount=result["first_sweep_amount"],
            remaining_amount=result["remaining_amount"],
            allocations=allocations,
            timestamp=datetime.utcnow()
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process deposit: {str(e)}"
        )


@router.get("", response_model=TransactionListResponse)
async def get_transactions(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db),
    envelope_id: str | None = Query(None, description="Filter by envelope"),
    start_date: str | None = Query(None, description="Start date (ISO 8601)"),
    end_date: str | None = Query(None, description="End date (ISO 8601)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Get transaction history with filtering and pagination.
    
    Returns chronologically ordered transactions with pagination metadata.
    """
    try:
        # Parse dates if provided
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if start_date else None
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None
        
        transaction_service = TransactionService(db)
        result = await transaction_service.get_transactions(
            user_id=user_id,
            envelope_id=envelope_id,
            start_date=start_dt,
            end_date=end_dt,
            page=page,
            page_size=page_size
        )
        
        return TransactionListResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date format: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve transactions: {str(e)}"
        )


@router.get("/balances", response_model=BalanceListResponse)
async def get_balances(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Get current balances for all envelopes.
    
    Returns:
    - Balance for each envelope (including Emergency Vault)
    - Temporal lock status
    - Maturity timestamp if locked
    - Total balance across all envelopes
    """
    try:
        envelope_service = EnvelopeService(db)
        envelopes = await envelope_service.get_user_envelopes(user_id)
        
        balances = []
        total_balance = 0
        
        for envelope in envelopes:
            lock_status = None
            maturity_ts = None
            
            if envelope["temporal_lock"]:
                lock_status = envelope["temporal_lock"]["status"]
                maturity_ts = envelope["temporal_lock"]["maturity_timestamp"]
            
            balances.append(
                BalanceResponse(
                    envelope_id=envelope["id"],
                    envelope_name=envelope["name"],
                    balance=envelope["balance"],
                    is_emergency_vault=envelope["is_emergency_vault"],
                    temporal_lock_status=lock_status,
                    maturity_timestamp=maturity_ts
                )
            )
            total_balance += float(envelope["balance"])
        
        return BalanceListResponse(
            balances=balances,
            total_balance=total_balance
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve balances: {str(e)}"
        )
