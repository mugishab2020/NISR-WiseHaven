"""Disbursement controller for payments and withdrawals."""

from fastapi import APIRouter, HTTPException, status, Depends
from models import get_db
from prisma import Prisma
from services.disbursement_service import DisbursementService
from utils.dependencies import get_current_user_id
from views.disbursement_schemas import (
    DisbursementRequest,
    DisbursementResponse,
    EmergencyWithdrawalRequest,
    EmergencyWithdrawalResponse,
    EmergencyWithdrawalListResponse
)

router = APIRouter(prefix="/disbursements", tags=["Disbursements"])


@router.post("", response_model=DisbursementResponse, status_code=status.HTTP_201_CREATED)
async def create_disbursement(
    request: DisbursementRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Process disbursement from envelope to payee.
    
    Validates:
    - Envelope is in Release Phase (not locked)
    - Sufficient balance in envelope
    - Payee is linked to envelope (optional for MVP)
    
    Records transaction in ledger and deducts from envelope.
    MoMo integration is TODO for actual money transfer.
    """
    try:
        disbursement_service = DisbursementService(db)
        result = await disbursement_service.process_disbursement(
            user_id=user_id,
            envelope_id=request.envelope_id,
            amount=request.amount,
            payee_id=request.payee_id,
            description=request.description
        )
        
        return DisbursementResponse(
            transaction_id=result["transaction_id"],
            envelope_id=result["envelope_id"],
            envelope_name=result["envelope_name"],
            amount=result["amount"],
            previous_balance=result["previous_balance"],
            new_balance=result["new_balance"],
            payee_id=result["payee_id"],
            description=result["description"],
            timestamp=result["timestamp"],
            status=result["status"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process disbursement: {str(e)}"
        )


@router.post("/emergency-vault", response_model=EmergencyWithdrawalResponse, status_code=status.HTTP_202_ACCEPTED)
async def request_emergency_withdrawal(
    request: EmergencyWithdrawalRequest,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Request emergency vault withdrawal.
    
    Validates:
    - Password re-authentication
    - Amount does not exceed 50% of vault balance
    - Justification provided (10-500 characters)
    - No existing pending requests
    
    Enforces 24-hour cooling-off period before approval.
    """
    try:
        disbursement_service = DisbursementService(db)
        result = await disbursement_service.create_emergency_withdrawal_request(
            user_id=user_id,
            amount=request.amount,
            justification=request.justification,
            password=request.password
        )
        
        return EmergencyWithdrawalResponse(
            request_id=result["request_id"],
            amount=result["amount"],
            justification=result["justification"],
            status=result["status"],
            requested_at=result["requested_at"],
            can_approve_at=result["can_approve_at"],
            message=result["message"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create emergency withdrawal request: {str(e)}"
        )


@router.get("/emergency-vault", response_model=EmergencyWithdrawalListResponse)
async def get_emergency_withdrawals(
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Get all emergency withdrawal requests for authenticated user."""
    try:
        disbursement_service = DisbursementService(db)
        requests = await disbursement_service.get_emergency_withdrawal_requests(user_id)
        
        return EmergencyWithdrawalListResponse(requests=requests)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve emergency withdrawals: {str(e)}"
        )


@router.post("/emergency-vault/{request_id}/approve", response_model=EmergencyWithdrawalResponse, status_code=status.HTTP_201_CREATED)
async def approve_emergency_withdrawal(
    request_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Prisma = Depends(get_db)
):
    """Approve emergency vault withdrawal after cooling-off period.
    
    Validates:
    - 24 hours have elapsed since request
    - Request is still pending
    - Sufficient balance still available
    
    Processes withdrawal and records in ledger.
    MoMo integration is TODO for actual money transfer.
    """
    try:
        disbursement_service = DisbursementService(db)
        result = await disbursement_service.approve_emergency_withdrawal(
            request_id=request_id,
            user_id=user_id
        )
        
        return EmergencyWithdrawalResponse(
            request_id=result["request_id"],
            amount=result["amount"],
            justification=result["justification"],
            status=result["status"],
            approved_at=result["approved_at"],
            transaction_id=result["transaction_id"],
            message=f"Emergency withdrawal approved. New vault balance: {result['new_balance']}"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve emergency withdrawal: {str(e)}"
        )
