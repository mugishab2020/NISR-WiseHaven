"""Disbursement controller for payments and withdrawals."""

from fastapi import APIRouter, HTTPException, status, Depends
from models import db  # use global singleton — same connection as other controllers
from services.disbursement_service import DisbursementService
from services.notification_service import NotificationService
from utils.dependencies import get_current_user_id
from views.disbursement_schemas import (
    DisbursementRequest,
    DisbursementResponse,
    EmergencyWithdrawalRequest,
    EmergencyWithdrawalResponse,
    EmergencyWithdrawalListResponse,
)
import logging

router = APIRouter(prefix="/disbursements", tags=["Disbursements"])
logger = logging.getLogger(__name__)


@router.post("", response_model=DisbursementResponse, status_code=status.HTTP_201_CREATED)
async def create_disbursement(
    request: DisbursementRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Process a simulated disbursement from an envelope.

    Validates:
    - Envelope is not temporally locked (Release Phase only)
    - Sufficient balance in envelope
    - User owns the envelope

    Records transaction in ledger and deducts from envelope balance.
    No real money is transferred — this is a demo-only operation.
    """
    try:
        disbursement_service = DisbursementService(db)
        result = await disbursement_service.process_disbursement(
            user_id=user_id,
            envelope_id=request.envelope_id,
            amount=request.amount,
            payee_id=request.payee_id,
            description=request.description,
        )

        # Fire in-app notification (non-blocking)
        try:
            notif_svc = NotificationService(db)
            await notif_svc.notify_disbursement(
                user_id=user_id,
                envelope_name=result["envelope_name"],
                amount=float(result["amount"]),
                transaction_id=result["transaction_id"],
            )
        except Exception as notif_err:
            logger.warning("Disbursement notification failed (non-fatal): %s", notif_err)

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
            status=result["status"],
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error("Disbursement failed: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process disbursement: {str(e)}",
        )


@router.post(
    "/emergency-vault",
    response_model=EmergencyWithdrawalResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
async def request_emergency_withdrawal(
    request: EmergencyWithdrawalRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Request an emergency vault withdrawal.

    Validates:
    - Amount does not exceed 50 % of vault balance
    - Justification provided (10–500 characters)
    - No existing pending requests

    Enforces a 24-hour cooling-off period before approval.
    """
    try:
        disbursement_service = DisbursementService(db)
        result = await disbursement_service.create_emergency_withdrawal_request(
            user_id=user_id,
            amount=request.amount,
            justification=request.justification,
            password=request.password,
        )

        return EmergencyWithdrawalResponse(
            request_id=result["request_id"],
            amount=result["amount"],
            justification=result["justification"],
            status=result["status"],
            requested_at=result["requested_at"],
            can_approve_at=result["can_approve_at"],
            message=result["message"],
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create emergency withdrawal request: {str(e)}",
        )


@router.get("/emergency-vault", response_model=EmergencyWithdrawalListResponse)
async def get_emergency_withdrawals(
    user_id: str = Depends(get_current_user_id),
):
    """Get all emergency withdrawal requests for the authenticated user."""
    try:
        disbursement_service = DisbursementService(db)
        requests = await disbursement_service.get_emergency_withdrawal_requests(user_id)
        return EmergencyWithdrawalListResponse(requests=requests)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve emergency withdrawals: {str(e)}",
        )


@router.post(
    "/emergency-vault/{request_id}/approve",
    response_model=EmergencyWithdrawalResponse,
    status_code=status.HTTP_201_CREATED,
)
async def approve_emergency_withdrawal(
    request_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """Approve an emergency vault withdrawal after the 24-hour cooling-off period.

    Validates:
    - 24 hours have elapsed since request
    - Request is still pending
    - Sufficient balance still available

    Processes the simulated withdrawal and records it in the ledger.
    """
    try:
        disbursement_service = DisbursementService(db)
        result = await disbursement_service.approve_emergency_withdrawal(
            request_id=request_id,
            user_id=user_id,
        )

        # Fire in-app notification (non-blocking)
        try:
            notif_svc = NotificationService(db)
            await notif_svc.notify_emergency_withdrawal_approved(
                user_id=user_id,
                amount=float(result["amount"]),
                request_id=request_id,
            )
        except Exception as notif_err:
            logger.warning(
                "Emergency withdrawal notification failed (non-fatal): %s", notif_err
            )

        return EmergencyWithdrawalResponse(
            request_id=result["request_id"],
            amount=result["amount"],
            justification=result["justification"],
            status=result["status"],
            approved_at=result["approved_at"],
            transaction_id=result["transaction_id"],
            message=f"Emergency withdrawal approved. New vault balance: {result['new_balance']}",
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve emergency withdrawal: {str(e)}",
        )
