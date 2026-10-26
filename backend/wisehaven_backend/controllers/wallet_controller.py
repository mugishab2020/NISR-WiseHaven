"""Wallet management controller.

For now, MoMo integration is commented out. Use /wallet/fund-simulated 
for manual deposits. MoMo endpoints will be enabled later.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from views.wallet_schemas import (
    WalletResponse,
    AddFundsRequest,
    FundingResponse
)
from services.wallet_service import WalletService
from models import db
from utils.dependencies import get_current_user_id
import logging

# MoMo-related imports (commented out for now)
# from fastapi import BackgroundTasks
# from views.wallet_schemas import (
#     DepositRequest,
#     DepositResponse,
#     PaymentStatusResponse,
#     PaymentCallbackRequest
# )
# from services.payment_service import PaymentService

router = APIRouter(prefix="/wallet", tags=["Wallet"])
logger = logging.getLogger(__name__)


@router.get("/", response_model=WalletResponse)
async def get_wallet(user_id: str = Depends(get_current_user_id)):
    """Get or create wallet for authenticated user.
    
    Returns wallet details including:
    - Current balance
    - Total deposited amount
    - Total allocated to envelopes
    - Creation and update timestamps
    - Version for concurrency control
    """
    service = WalletService(db)
    
    try:
        wallet = await service.get_or_create_wallet(user_id)
        return wallet
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve wallet: {str(e)}"
        )


@router.get("/balance", response_model=WalletResponse)
async def get_wallet_balance(user_id: str = Depends(get_current_user_id)):
    """Get current wallet balance for authenticated user.
    
    Returns:
        Wallet information with current balance
        
    Raises:
        404 if wallet not found
    """
    service = WalletService(db)
    
    try:
        wallet = await service.get_wallet_balance(user_id)
        return wallet
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve balance: {str(e)}"
        )


@router.post("/deposit", response_model=FundingResponse, status_code=status.HTTP_200_OK)
async def add_manual_deposit(
    request: AddFundsRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Add funds to wallet via manual deposit (Production Ready).
    
    This is a REAL deposit that credits the user's actual wallet balance.
    
    Use this when:
    - User deposits money via bank transfer
    - User deposits cash
    - User uses any external payment method
    - Admin needs to manually credit user wallet
    
    The deposit:
    - Updates the user's real wallet balance in database
    - Increases total_deposited tracking
    - Creates immutable transaction record for audit trail
    - Uses optimistic locking for concurrency safety
    
    After depositing to wallet, user can distribute funds to envelopes
    using POST /transactions/deposit endpoint.
    
    Features:
    - Validates amount (positive, max 2 decimal places)
    - Uses database transactions for atomicity
    - Implements optimistic locking for concurrency control
    - Creates immutable transaction record
    - Retries on concurrent modifications
    
    Args:
        request: AddFundsRequest with amount and description
        
    Returns:
        FundingResponse with updated wallet and transaction ID
        
    Raises:
        400 if amount invalid
        409 if concurrent modification fails after retries
        500 for other errors
    """
    service = WalletService(db)
    
    try:
        wallet, transaction_id = await service.add_manual_deposit(
            user_id=user_id,
            amount=request.amount,
            description=request.description
        )
        
        return {
            "success": True,
            "message": f"Successfully deposited {request.amount} to wallet",
            "wallet": wallet,
            "transaction_id": transaction_id
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Check if it's a concurrency error
        if "concurrent" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Failed to add funds due to concurrent modifications. Please try again."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add funds: {str(e)}"
        )


# ============================================================================
# MOMO INTEGRATION ENDPOINTS - COMMENTED OUT FOR NOW
# 
# These endpoints will be enabled later when MoMo integration is ready.
# For now, use the /wallet/fund-simulated endpoint for manual deposits.
# ============================================================================

# @router.post("/deposit", response_model=DepositResponse, status_code=status.HTTP_202_ACCEPTED)
# async def deposit_via_payment_provider(
#     request: DepositRequest,
#     user_id: str = Depends(get_current_user_id)
# ):
#     """Initiate wallet deposit via payment provider (Production).
#     
#     Initiates a payment request with MoMo or other configured provider.
#     User will receive a prompt on their phone to approve the payment.
#     
#     Flow:
#     1. Validates deposit amount and phone number
#     2. Creates payment request record
#     3. Calls MoMo API to initiate payment
#     4. Returns payment reference for status tracking
#     5. User approves payment on their phone
#     6. Webhook processes confirmation and credits wallet
#     
#     Features:
#     - Secure payment provider integration
#     - Async payment processing with callbacks
#     - Idempotency via payment references
#     - Automatic wallet crediting on success
#     
#     Args:
#         request: DepositRequest with amount, phone_number, currency, description
#         
#     Returns:
#         DepositResponse with payment_id and reference for tracking
#         
#     Raises:
#         400 if amount or phone number invalid
#         500 for payment provider errors
#     """
#     payment_service = PaymentService(db)
#     
#     try:
#         result = await payment_service.initiate_momo_deposit(
#             user_id=user_id,
#             amount=request.amount,
#             phone_number=request.phone_number,
#             currency=request.currency,
#             description=request.description
#         )
#         
#         return DepositResponse(**result)
#         
#     except ValueError as e:
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=str(e)
#         )
#     except Exception as e:
#         logger.error(f"Deposit initiation failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to initiate deposit: {str(e)}"
#         )


# @router.get("/payment/{payment_id}/status", response_model=PaymentStatusResponse)
# async def get_payment_status(
#     payment_id: str,
#     user_id: str = Depends(get_current_user_id)
# ):
#     """Check status of payment request.
#     
#     Poll this endpoint to check if payment has been completed.
#     Status values:
#     - PENDING: Waiting for user to approve on phone
#     - COMPLETED: Payment successful, wallet credited
#     - FAILED: Payment failed or rejected
#     - CANCELLED: Payment cancelled
#     
#     Args:
#         payment_id: Payment ID from deposit response
#         
#     Returns:
#         PaymentStatusResponse with current status
#         
#     Raises:
#         404 if payment not found
#         500 for errors
#     """
#     payment_service = PaymentService(db)
#     
#     try:
#         status_info = await payment_service.check_payment_status(payment_id)
#         return PaymentStatusResponse(**status_info)
#         
#     except ValueError as e:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail=str(e)
#         )
#     except Exception as e:
#         logger.error(f"Payment status check failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Failed to check payment status: {str(e)}"
#         )


# @router.post("/payment-callback", status_code=status.HTTP_200_OK)
# async def payment_callback(
#     request: PaymentCallbackRequest,
#     background_tasks: BackgroundTasks
# ):
#     """Webhook endpoint for payment provider callbacks.
#     
#     Called by MoMo when payment status changes.
#     Processes payment completion and credits wallet.
#     
#     Security considerations:
#     - In production, verify webhook signature
#     - Validate request source IP
#     - Use HTTPS only
#     
#     Args:
#         request: PaymentCallbackRequest from provider
#         background_tasks: FastAPI background tasks
#         
#     Returns:
#         Success acknowledgment
#     """
#     payment_service = PaymentService(db)
#     wallet_service = WalletService(db)
#     
#     try:
#         # Process callback
#         result = await payment_service.process_payment_callback(
#             payment_reference=request.payment_reference,
#             status=request.status,
#             provider_data=request.provider_data
#         )
#         
#         # If payment completed, credit wallet in background
#         if result["status"] == "COMPLETED":
#             background_tasks.add_task(
#                 credit_wallet_from_payment,
#                 payment_service,
#                 wallet_service,
#                 result["payment_id"]
#             )
#         
#         return {
#             "success": True,
#             "message": "Callback processed",
#             "payment_id": result["payment_id"]
#         }
#         
#     except Exception as e:
#         logger.error(f"Payment callback failed: {str(e)}")
#         # Return 200 to prevent provider retries for invalid data
#         return {
#             "success": False,
#             "message": str(e)
#         }


# async def credit_wallet_from_payment(
#     payment_service: PaymentService,
#     wallet_service: WalletService,
#     payment_id: str
# ):
#     """Background task to credit wallet after payment confirmation.
#     
#     Args:
#         payment_service: Payment service instance
#         wallet_service: Wallet service instance
#         payment_id: Payment record ID
#     """
#     try:
#         # Get payment details
#         payment = await payment_service.db.paymentrequest.find_unique(
#             where={"id": payment_id}
#         )
#         
#         if not payment:
#             logger.error(f"Payment not found: {payment_id}")
#             return
#         
#         if payment.status != "COMPLETED":
#             logger.warning(f"Payment not completed: {payment_id}, status={payment.status}")
#             return
#         
#         # Check if already credited
#         if payment.metadata.get("wallet_credited"):
#             logger.info(f"Payment already credited: {payment_id}")
#             return
#         
#         # Credit wallet
#         wallet, transaction_id = await wallet_service.deposit_funds(
#             user_id=payment.user_id,
#             amount=payment.amount,
#             payment_reference=payment.payment_reference,
#             description=payment.description or "Wallet deposit"
#         )
#         
#         # Mark payment as credited
#         await payment_service.db.paymentrequest.update(
#             where={"id": payment_id},
#             data={
#                 "metadata": {
#                     **payment.metadata,
#                     "wallet_credited": True,
#                     "transaction_id": transaction_id
#                 }
#             }
#         )
#         
#         logger.info(
#             f"Wallet credited from payment: payment_id={payment_id}, "
#             f"user_id={payment.user_id}, amount={payment.amount}, "
#             f"transaction_id={transaction_id}"
#         )
#         
#     except Exception as e:
#         logger.error(f"Failed to credit wallet from payment {payment_id}: {str(e)}")
#         # TODO: Implement retry mechanism or alert
