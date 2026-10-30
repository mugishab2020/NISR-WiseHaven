"""Payee management service.

Payees are simulated payment destinations in the WiseHaven demo environment.
No real money is sent to any payee. All disbursements are internal demo operations.
"""

from datetime import datetime, timezone
from prisma import Prisma
import logging

logger = logging.getLogger(__name__)


class PayeeService:
    """Service for payee CRUD operations with user ownership enforcement."""

    def __init__(self, db: Prisma):
        self.db = db

    def _get_utc_now(self) -> datetime:
        return datetime.now(timezone.utc)

    def _format_payee(self, payee, envelopes=None) -> dict:
        """Format a Prisma Payee record into a response dict."""
        linked = []
        if envelopes:
            for pe in envelopes:
                linked.append({
                    "envelope_id": pe.envelope_id,
                    "envelope_name": pe.envelope.name if pe.envelope else "",
                })
        return {
            "id": payee.id,
            "name": payee.name,
            "phone_number": payee.phone_number,
            "account_identifier": payee.account_identifier,
            "payee_type": payee.payee_type,
            "linked_envelopes": linked,
            "created_at": payee.created_at,
            "updated_at": payee.updated_at,
        }

    async def create_payee(
        self,
        user_id: str,
        name: str,
        payee_type: str,
        phone_number: str | None = None,
        account_identifier: str | None = None,
        envelope_ids: list[str] | None = None,
    ) -> dict:
        """Create a new simulated payee.

        Validates that referenced envelopes belong to the user.

        Args:
            user_id: Authenticated user's ID
            name: Payee display name
            payee_type: 'individual' | 'merchant' | 'utility'
            phone_number: Optional Rwanda phone number (+250...)
            account_identifier: Optional meter/account number
            envelope_ids: Optional list of envelope IDs to link

        Returns:
            Created payee dict

        Raises:
            ValueError on validation failures
        """
        envelope_ids = envelope_ids or []

        # Validate all referenced envelopes belong to this user
        for eid in envelope_ids:
            env = await self.db.envelope.find_first(
                where={"id": eid, "user_id": user_id}
            )
            if not env:
                raise ValueError(f"Envelope {eid} not found or does not belong to you")

        # Create the payee
        payee = await self.db.payee.create(
            data={
                "user_id": user_id,
                "name": name,
                "payee_type": payee_type,
                "phone_number": phone_number,
                "account_identifier": account_identifier,
            }
        )

        # Link to envelopes
        for eid in envelope_ids:
            await self.db.payeeenvelope.create(
                data={
                    "payee_id": payee.id,
                    "envelope_id": eid,
                }
            )

        # Fetch with linked envelopes for the response
        return await self.get_payee(payee.id, user_id)

    async def get_payee(self, payee_id: str, user_id: str) -> dict:
        """Get a single payee by ID, enforcing ownership.

        Args:
            payee_id: Payee ID
            user_id: Authenticated user's ID

        Returns:
            Payee dict

        Raises:
            ValueError if not found or not owned by user
        """
        payee = await self.db.payee.find_first(
            where={"id": payee_id, "user_id": user_id},
            include={
                "envelopes": {"include": {"envelope": True}}
            },
        )
        if not payee:
            raise ValueError("Payee not found")

        return self._format_payee(payee, payee.envelopes)

    async def get_user_payees(self, user_id: str) -> list[dict]:
        """List all payees for a user.

        Args:
            user_id: Authenticated user's ID

        Returns:
            List of payee dicts
        """
        payees = await self.db.payee.find_many(
            where={"user_id": user_id},
            include={
                "envelopes": {"include": {"envelope": True}}
            },
            order={"created_at": "desc"},
        )
        return [self._format_payee(p, p.envelopes) for p in payees]

    async def update_payee(
        self,
        payee_id: str,
        user_id: str,
        name: str | None = None,
        phone_number: str | None = None,
        account_identifier: str | None = None,
    ) -> dict:
        """Update payee fields.

        Args:
            payee_id: Payee ID
            user_id: Authenticated user's ID
            name: New name (optional)
            phone_number: New phone number (optional)
            account_identifier: New account identifier (optional)

        Returns:
            Updated payee dict

        Raises:
            ValueError if not found or not owned by user
        """
        # Ownership check
        existing = await self.db.payee.find_first(
            where={"id": payee_id, "user_id": user_id}
        )
        if not existing:
            raise ValueError("Payee not found")

        update_data: dict = {}
        if name is not None:
            update_data["name"] = name
        if phone_number is not None:
            update_data["phone_number"] = phone_number
        if account_identifier is not None:
            update_data["account_identifier"] = account_identifier

        if not update_data:
            raise ValueError("No fields to update")

        await self.db.payee.update(
            where={"id": payee_id},
            data=update_data,
        )

        return await self.get_payee(payee_id, user_id)

    async def delete_payee(self, payee_id: str, user_id: str) -> None:
        """Delete a payee (and its envelope links).

        Only allowed if the payee has no completed transactions.

        Args:
            payee_id: Payee ID
            user_id: Authenticated user's ID

        Raises:
            ValueError if not found, not owned, or has transaction history
        """
        existing = await self.db.payee.find_first(
            where={"id": payee_id, "user_id": user_id}
        )
        if not existing:
            raise ValueError("Payee not found")

        # Check for linked transactions
        tx_count = await self.db.transaction.count(
            where={"payee_id": payee_id}
        )
        if tx_count > 0:
            raise ValueError(
                "Cannot delete payee with existing transaction history. "
                "Deactivate it instead."
            )

        # Remove envelope links first (cascade should handle it but be explicit)
        await self.db.payeeenvelope.delete_many(
            where={"payee_id": payee_id}
        )

        await self.db.payee.delete(where={"id": payee_id})
        logger.info(f"Deleted payee {payee_id} for user {user_id}")
