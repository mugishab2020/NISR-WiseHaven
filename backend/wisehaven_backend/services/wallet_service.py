"""Wallet management service with transaction safety."""

from decimal import Decimal
from datetime import datetime, timezone
from prisma import Json, Prisma
from prisma.errors import UniqueViolationError
import logging

logger = logging.getLogger(__name__)


class WalletService:
    """Service for wallet operations with concurrency control."""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    def _get_utc_now(self) -> datetime:
        """Get current UTC time with timezone info."""
        return datetime.now(timezone.utc)
    
    async def get_or_create_wallet(self, user_id: str) -> dict:
        """Get existing wallet or create new one for user.
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            Wallet information dictionary
        """
        # Try to get existing wallet
        wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
        
        if wallet:
            return self._format_wallet_response(wallet)
        
        # Create new wallet if doesn't exist
        try:
            wallet = await self.db.wallet.create(
                data={
                    "user_id": user_id,
                    "balance": Decimal("0.00"),
                    "total_deposited": Decimal("0.00"),
                    "total_allocated": Decimal("0.00"),
                    "version": 0
                }
            )
            logger.info(f"Created new wallet for user {user_id}")
            return self._format_wallet_response(wallet)
        except UniqueViolationError:
            # Race condition: another request created it, fetch it
            wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
            return self._format_wallet_response(wallet)
    
    async def get_wallet_balance(self, user_id: str) -> dict:
        """Get wallet balance for user.
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            Wallet information dictionary
            
        Raises:
            ValueError if wallet not found
        """
        wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
        
        if not wallet:
            raise ValueError("Wallet not found")
        
        return self._format_wallet_response(wallet)
    
    async def add_manual_deposit(
        self,
        user_id: str,
        amount: Decimal,
        description: str = "Demo deposit",
        idempotency_key: str | None = None,
    ) -> tuple[dict, str]:
        """Add simulated demo funds to wallet.

        This is a demo-only operation. No real money is involved.

        If idempotency_key is provided, duplicate requests with the same key
        return the existing transaction rather than crediting the wallet twice.

        Args:
            user_id: User's unique identifier
            amount: Amount to add (must be positive)
            description: Description of the deposit
            idempotency_key: Optional client-supplied key for deduplication

        Returns:
            Tuple of (updated wallet dict, transaction_id)

        Raises:
            ValueError if amount invalid or wallet not found
        """
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")

        if amount.as_tuple().exponent < -2:
            raise ValueError("Amount must have at most 2 decimal places")

        # Idempotency check: if we've already processed this key, return early
        if idempotency_key:
            existing_txs = await self.db.transaction.find_many(
                where={
                    "user_id": user_id,
                    "transaction_type": "MANUAL_DEPOSIT",
                    "description": f"Demo deposit [{idempotency_key}]",
                }
            )
            if existing_txs:
                logger.info(f"Idempotent deposit: returning existing tx {existing_txs[0].id}")
                wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
                return self._format_wallet_response(wallet), existing_txs[0].id

        # Build description including idempotency key for lookup
        effective_description = (
            f"Demo deposit [{idempotency_key}]" if idempotency_key else description
        )
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Get current wallet with current version
                wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
                
                if not wallet:
                    raise ValueError("Wallet not found")
                
                current_version = wallet.version
                new_balance = wallet.balance + amount
                new_total_deposited = wallet.total_deposited + amount
                
                # Use transaction to ensure atomicity
                async with self.db.tx() as transaction_db:
                    # Update wallet with optimistic locking
                    updated_wallet = await transaction_db.wallet.update_many(
                        where={
                            "user_id": user_id,
                            "version": current_version
                        },
                        data={
                            "balance": new_balance,
                            "total_deposited": new_total_deposited,
                            "version": current_version + 1,
                            "updated_at": self._get_utc_now()
                        }
                    )
                    
                    if updated_wallet == 0:
                        # Version mismatch - concurrent modification detected
                        if attempt < max_retries - 1:
                            logger.warning(f"Concurrent modification detected for user {user_id}, retrying...")
                            continue
                        else:
                            raise ValueError("Failed to update wallet due to concurrent modifications")
                    
                    # Create immutable transaction record
                    transaction_record = await transaction_db.transaction.create(
                        data={
                            "user": {"connect": {"id": user_id}},
                            "transaction_type": "MANUAL_DEPOSIT",
                            "amount": amount,
                            "description": effective_description,
                            "timestamp": self._get_utc_now(),
                            "metadata": Json({
                                "previous_balance": str(wallet.balance),
                                "new_balance": str(new_balance),
                                "wallet_version": current_version + 1,
                                "demo": True,
                                **({"idempotency_key": idempotency_key} if idempotency_key else {}),
                            }),
                        }
                    )
                    
                    logger.info(
                        f"Manual deposit processed: user={user_id}, "
                        f"amount={amount}, new_balance={new_balance}, "
                        f"transaction={transaction_record.id}"
                    )
                
                # Fetch updated wallet to return
                final_wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
                return self._format_wallet_response(final_wallet), transaction_record.id
                
            except Exception as e:
                if attempt < max_retries - 1 and "concurrent" in str(e).lower():
                    continue
                raise
        
        raise ValueError("Failed to add funds after maximum retries")
    
    async def deposit_funds(
        self,
        user_id: str,
        amount: Decimal,
        payment_reference: str,
        description: str = "Wallet deposit"
    ) -> tuple[dict, str]:
        """Deposit funds to wallet from external payment provider.
        
        Uses optimistic locking with version field to prevent race conditions.
        Creates immutable transaction record for traceability.
        
        Args:
            user_id: User's unique identifier
            amount: Amount to deposit (must be positive)
            payment_reference: Payment reference from provider
            description: Description of the deposit
            
        Returns:
            Tuple of (updated wallet dict, transaction_id)
            
        Raises:
            ValueError if amount invalid or wallet not found
        """
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")
        
        # Validate decimal places
        if amount.as_tuple().exponent < -2:
            raise ValueError("Amount must have at most 2 decimal places")
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Get current wallet with current version
                wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
                
                if not wallet:
                    raise ValueError("Wallet not found")
                
                current_version = wallet.version
                new_balance = wallet.balance + amount
                new_total_deposited = wallet.total_deposited + amount
                
                # Use transaction to ensure atomicity
                async with self.db.tx() as transaction_db:
                    # Update wallet with optimistic locking
                    updated_wallet = await transaction_db.wallet.update_many(
                        where={
                            "user_id": user_id,
                            "version": current_version
                        },
                        data={
                            "balance": new_balance,
                            "total_deposited": new_total_deposited,
                            "version": current_version + 1,
                            "updated_at": self._get_utc_now()
                        }
                    )
                    
                    if updated_wallet == 0:
                        # Version mismatch - concurrent modification detected
                        if attempt < max_retries - 1:
                            logger.warning(f"Concurrent modification detected for user {user_id}, retrying...")
                            continue
                        else:
                            raise ValueError("Failed to update wallet due to concurrent modifications")
                    
                    # Create immutable transaction record
                    transaction_record = await transaction_db.transaction.create(
                        data={
                            "user": {"connect": {"id": user_id}},
                            "transaction_type": "DEPOSIT",
                            "amount": amount,
                            "description": description,
                            "timestamp": self._get_utc_now(),
                            "metadata": Json({
                                "previous_balance": str(wallet.balance),
                                "new_balance": str(new_balance),
                                "wallet_version": current_version + 1,
                                "payment_reference": payment_reference
                            }),
                        }
                    )
                    
                    logger.info(
                        f"Deposited funds: user={user_id}, "
                        f"amount={amount}, new_balance={new_balance}, "
                        f"payment_ref={payment_reference}, "
                        f"transaction={transaction_record.id}"
                    )
                
                # Fetch updated wallet to return
                final_wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
                return self._format_wallet_response(final_wallet), transaction_record.id
                
            except Exception as e:
                if attempt < max_retries - 1 and "concurrent" in str(e).lower():
                    continue
                raise
        
        raise ValueError("Failed to deposit funds after maximum retries")
    
    async def allocate_funds_to_envelopes(
        self,
        user_id: str,
        amount: Decimal,
        description: str
    ) -> dict:
        """Decrease wallet balance when funds are allocated to envelopes.
        
        Args:
            user_id: User's unique identifier
            amount: Amount to allocate (must be positive)
            description: Description of the allocation
            
        Returns:
            Updated wallet dictionary
            
        Raises:
            ValueError if insufficient balance or invalid amount
        """
        if amount <= 0:
            raise ValueError("Amount must be greater than zero")
        
        max_retries = 3
        for attempt in range(max_retries):
            try:
                wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
                
                if not wallet:
                    raise ValueError("Wallet not found")
                
                if wallet.balance < amount:
                    raise ValueError(f"Insufficient balance. Available: {wallet.balance}, Required: {amount}")
                
                current_version = wallet.version
                new_balance = wallet.balance - amount
                new_total_allocated = wallet.total_allocated + amount
                
                async with self.db.tx() as transaction_db:
                    updated_wallet = await transaction_db.wallet.update_many(
                        where={
                            "user_id": user_id,
                            "version": current_version
                        },
                        data={
                            "balance": new_balance,
                            "total_allocated": new_total_allocated,
                            "version": current_version + 1,
                            "updated_at": self._get_utc_now()
                        }
                    )
                    
                    if updated_wallet == 0:
                        if attempt < max_retries - 1:
                            logger.warning(f"Concurrent modification detected for user {user_id}, retrying...")
                            continue
                        else:
                            raise ValueError("Failed to allocate funds due to concurrent modifications")
                    
                    # Create transaction record
                    await transaction_db.transaction.create(
                        data={
                            "user": {"connect": {"id": user_id}},
                            "transaction_type": "ALLOCATION",
                            "amount": amount,
                            "description": description,
                            "timestamp": self._get_utc_now(),
                            "metadata": Json({
                                "previous_balance": str(wallet.balance),
                                "new_balance": str(new_balance),
                                "wallet_version": current_version + 1
                            }),
                        }
                    )
                
                final_wallet = await self.db.wallet.find_unique(where={"user_id": user_id})
                return self._format_wallet_response(final_wallet)
                
            except Exception as e:
                if attempt < max_retries - 1 and "concurrent" in str(e).lower():
                    continue
                raise
        
        raise ValueError("Failed to allocate funds after maximum retries")
    
    def _format_wallet_response(self, wallet) -> dict:
        """Format wallet model to dictionary.
        
        Args:
            wallet: Prisma Wallet model
            
        Returns:
            Formatted wallet dictionary
        """
        return {
            "id": wallet.id,
            "user_id": wallet.user_id,
            "balance": wallet.balance,
            "total_deposited": wallet.total_deposited,
            "total_allocated": wallet.total_allocated,
            "created_at": wallet.created_at,
            "updated_at": wallet.updated_at,
            "version": wallet.version
        }
