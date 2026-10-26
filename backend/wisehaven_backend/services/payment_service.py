"""Payment provider integration service for wallet deposits.

Handles integration with external payment providers (MoMo, Stripe, etc.)
for depositing funds into user wallets.
"""

from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional
from prisma import Prisma
import logging
import httpx
import os

logger = logging.getLogger(__name__)


class PaymentService:
    """Service for processing payments through external providers."""
    
    def __init__(self, db: Prisma):
        self.db = db
        self.momo_api_url = os.getenv("MOMO_API_URL", "https://sandbox.momodeveloper.mtn.com")
        self.momo_subscription_key = os.getenv("MOMO_SUBSCRIPTION_KEY")
        self.momo_api_user = os.getenv("MOMO_API_USER")
        self.momo_api_key = os.getenv("MOMO_API_KEY")
        self.momo_callback_url = os.getenv("MOMO_CALLBACK_URL", "http://localhost:8000/wallet/payment-callback")
    
    def _get_utc_now(self) -> datetime:
        """Get current UTC time with timezone info."""
        return datetime.now(timezone.utc)
    
    async def initiate_momo_deposit(
        self,
        user_id: str,
        amount: Decimal,
        phone_number: str,
        currency: str = "RWF",
        description: str = "Wallet deposit"
    ) -> dict:
        """Initiate MoMo payment request.
        
        Args:
            user_id: User's unique identifier
            amount: Amount to deposit
            phone_number: User's phone number for MoMo
            currency: Currency code (default: RWF for Rwanda)
            description: Payment description
            
        Returns:
            Dictionary with payment reference and status
            
        Raises:
            ValueError if payment initiation fails
        """
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")
        
        if not self.momo_subscription_key or not self.momo_api_user:
            raise ValueError("MoMo API credentials not configured")
        
        # Generate unique payment reference
        import uuid
        payment_reference = f"WH-{user_id[:8]}-{uuid.uuid4().hex[:12]}"
        
        try:
            # Create pending payment record
            payment_record = await self.db.paymentrequest.create(
                data={
                    "user_id": user_id,
                    "payment_reference": payment_reference,
                    "provider": "MOMO",
                    "amount": amount,
                    "currency": currency,
                    "phone_number": phone_number,
                    "status": "PENDING",
                    "description": description,
                    "created_at": self._get_utc_now(),
                    "metadata": {
                        "callback_url": self.momo_callback_url
                    }
                }
            )
            
            # Call MoMo API to request payment
            async with httpx.AsyncClient() as client:
                headers = {
                    "X-Reference-Id": payment_reference,
                    "X-Target-Environment": os.getenv("MOMO_ENVIRONMENT", "sandbox"),
                    "Ocp-Apim-Subscription-Key": self.momo_subscription_key,
                    "Authorization": f"Bearer {await self._get_momo_access_token()}",
                    "Content-Type": "application/json"
                }
                
                payload = {
                    "amount": str(amount),
                    "currency": currency,
                    "externalId": payment_record.id,
                    "payer": {
                        "partyIdType": "MSISDN",
                        "partyId": phone_number
                    },
                    "payerMessage": description,
                    "payeeNote": f"Deposit to Wisehaven wallet - User {user_id}"
                }
                
                response = await client.post(
                    f"{self.momo_api_url}/collection/v1_0/requesttopay",
                    json=payload,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 202:  # Accepted
                    logger.info(f"MoMo payment initiated: ref={payment_reference}, amount={amount}")
                    
                    # Update payment record with provider response
                    await self.db.paymentrequest.update(
                        where={"id": payment_record.id},
                        data={
                            "provider_reference": payment_reference,
                            "updated_at": self._get_utc_now()
                        }
                    )
                    
                    return {
                        "payment_id": payment_record.id,
                        "payment_reference": payment_reference,
                        "status": "PENDING",
                        "message": "Payment request sent. Please approve on your phone.",
                        "amount": amount,
                        "currency": currency
                    }
                else:
                    error_detail = response.text
                    logger.error(f"MoMo API error: status={response.status_code}, detail={error_detail}")
                    
                    # Mark payment as failed
                    await self.db.paymentrequest.update(
                        where={"id": payment_record.id},
                        data={
                            "status": "FAILED",
                            "error_message": f"API error: {error_detail}",
                            "updated_at": self._get_utc_now()
                        }
                    )
                    
                    raise ValueError(f"Payment initiation failed: {error_detail}")
                    
        except httpx.HTTPError as e:
            logger.error(f"HTTP error initiating MoMo payment: {str(e)}")
            raise ValueError(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Error initiating MoMo payment: {str(e)}")
            raise
    
    async def _get_momo_access_token(self) -> str:
        """Get MoMo API access token.
        
        In production, implement token caching to avoid API calls on every request.
        
        Returns:
            Access token string
        """
        # TODO: Implement token caching
        # For now, using API key directly (works in sandbox)
        return self.momo_api_key or ""
    
    async def check_payment_status(self, payment_id: str) -> dict:
        """Check status of payment request.
        
        Args:
            payment_id: Payment record ID
            
        Returns:
            Payment status dictionary
            
        Raises:
            ValueError if payment not found
        """
        payment = await self.db.paymentrequest.find_unique(
            where={"id": payment_id}
        )
        
        if not payment:
            raise ValueError("Payment not found")
        
        # If already completed or failed, return cached status
        if payment.status in ["COMPLETED", "FAILED", "CANCELLED"]:
            return self._format_payment_status(payment)
        
        # Query MoMo API for current status
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "X-Target-Environment": os.getenv("MOMO_ENVIRONMENT", "sandbox"),
                    "Ocp-Apim-Subscription-Key": self.momo_subscription_key,
                    "Authorization": f"Bearer {await self._get_momo_access_token()}"
                }
                
                response = await client.get(
                    f"{self.momo_api_url}/collection/v1_0/requesttopay/{payment.payment_reference}",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    provider_status = data.get("status")
                    
                    # Map MoMo status to our status
                    status_map = {
                        "SUCCESSFUL": "COMPLETED",
                        "FAILED": "FAILED",
                        "PENDING": "PENDING"
                    }
                    
                    new_status = status_map.get(provider_status, "PENDING")
                    
                    # Update payment record
                    payment = await self.db.paymentrequest.update(
                        where={"id": payment_id},
                        data={
                            "status": new_status,
                            "provider_status": provider_status,
                            "updated_at": self._get_utc_now(),
                            "metadata": {
                                **payment.metadata,
                                "provider_response": data
                            }
                        }
                    )
                    
                    logger.info(f"Payment status updated: id={payment_id}, status={new_status}")
                    
                    return self._format_payment_status(payment)
                else:
                    logger.error(f"Failed to check payment status: {response.text}")
                    return self._format_payment_status(payment)
                    
        except Exception as e:
            logger.error(f"Error checking payment status: {str(e)}")
            return self._format_payment_status(payment)
    
    async def process_payment_callback(
        self,
        payment_reference: str,
        status: str,
        provider_data: dict
    ) -> dict:
        """Process payment callback from MoMo.
        
        Called by webhook when payment status changes.
        
        Args:
            payment_reference: Unique payment reference
            status: Payment status from provider
            provider_data: Full callback data from provider
            
        Returns:
            Processing result dictionary
        """
        payment = await self.db.paymentrequest.find_first(
            where={"payment_reference": payment_reference}
        )
        
        if not payment:
            logger.error(f"Payment not found for reference: {payment_reference}")
            raise ValueError("Payment not found")
        
        # Map provider status
        status_map = {
            "SUCCESSFUL": "COMPLETED",
            "FAILED": "FAILED",
            "PENDING": "PENDING"
        }
        
        new_status = status_map.get(status, "PENDING")
        
        # Update payment record
        await self.db.paymentrequest.update(
            where={"id": payment.id},
            data={
                "status": new_status,
                "provider_status": status,
                "updated_at": self._get_utc_now(),
                "metadata": {
                    **payment.metadata,
                    "callback_data": provider_data
                }
            }
        )
        
        logger.info(
            f"Payment callback processed: ref={payment_reference}, "
            f"status={new_status}, payment_id={payment.id}"
        )
        
        return {
            "payment_id": payment.id,
            "status": new_status,
            "processed": True
        }
    
    def _format_payment_status(self, payment) -> dict:
        """Format payment record to status dictionary.
        
        Args:
            payment: Prisma PaymentRequest model
            
        Returns:
            Formatted status dictionary
        """
        return {
            "payment_id": payment.id,
            "payment_reference": payment.payment_reference,
            "status": payment.status,
            "provider": payment.provider,
            "amount": payment.amount,
            "currency": payment.currency,
            "description": payment.description,
            "created_at": payment.created_at,
            "updated_at": payment.updated_at,
            "error_message": payment.error_message
        }
