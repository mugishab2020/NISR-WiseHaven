"""Recurring partial releases from locked envelope balances."""

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from prisma import Json, Prisma
from prisma.errors import UniqueViolationError


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class AllowanceService:
    def __init__(self, db: Prisma):
        self.db = db

    async def create_schedule(
        self,
        *,
        envelope_id: str,
        user_id: str,
        release_amount: Decimal,
        frequency: str,
        first_release_at: datetime,
    ) -> dict:
        """Reserve the envelope's available balance and schedule installments."""
        if frequency not in {"DAILY", "WEEKLY"}:
            raise ValueError("Frequency must be DAILY or WEEKLY")
        if release_amount <= 0:
            raise ValueError("Release amount must be greater than zero")
        if first_release_at.tzinfo is None:
            first_release_at = first_release_at.replace(tzinfo=timezone.utc)
        if first_release_at <= _utcnow():
            raise ValueError("First release must be in the future")

        async with self.db.tx() as tx:
            envelope = await tx.envelope.find_first(
                where={"id": envelope_id, "user_id": user_id},
                include={"temporal_lock": True, "allowance_schedule": True},
            )
            if not envelope:
                raise ValueError("Envelope not found")
            if envelope.is_emergency_vault:
                raise ValueError("Recurring allowances cannot be configured on the Emergency Vault")
            if envelope.temporal_lock:
                raise ValueError("Remove the maturity lock before configuring recurring releases")
            if envelope.allowance_schedule:
                raise ValueError("This envelope already has an allowance schedule")
            if envelope.balance < release_amount:
                raise ValueError("Release amount cannot exceed the amount allocated to the envelope")
            if envelope.balance <= 0:
                raise ValueError("Allocate funds to the envelope before scheduling releases")

            await tx.envelope.update(
                where={"id": envelope_id},
                data={
                    "locked_balance": {"increment": envelope.balance},
                    "balance": Decimal("0.00"),
                },
            )
            schedule = await tx.allowanceschedule.create(
                data={
                    "envelope_id": envelope_id,
                    "release_amount": release_amount,
                    "frequency": frequency,
                    "next_release_at": first_release_at,
                    "is_active": True,
                }
            )

        return self._format_schedule(schedule)

    async def release_due(self, user_id: str | None = None) -> int:
        """Release one installment per due schedule, skipping missed periods."""
        now = _utcnow()
        where: dict = {"is_active": True, "next_release_at": {"lte": now}}
        if user_id:
            where["envelope"] = {"user_id": user_id}
        schedules = await self.db.allowanceschedule.find_many(
            where=where,
            include={"envelope": True},
            order={"next_release_at": "asc"},
        )
        released = 0

        for found in schedules:
            try:
                async with self.db.tx() as tx:
                    schedule = await tx.allowanceschedule.find_unique(
                        where={"id": found.id}, include={"envelope": True}
                    )
                    if (
                        not schedule
                        or not schedule.is_active
                        or schedule.next_release_at > now
                        or (user_id and schedule.envelope.user_id != user_id)
                    ):
                        continue

                    envelope = schedule.envelope
                    scheduled_for = schedule.next_release_at
                    amount = min(schedule.release_amount, envelope.locked_balance)
                    if amount <= 0:
                        await tx.allowanceschedule.update(
                            where={"id": schedule.id}, data={"is_active": False}
                        )
                        continue

                    interval = timedelta(days=1 if schedule.frequency == "DAILY" else 7)
                    next_release = scheduled_for + interval
                    while next_release <= now:
                        next_release += interval

                    claimed = await tx.allowanceschedule.update_many(
                        where={
                            "id": schedule.id,
                            "is_active": True,
                            "next_release_at": scheduled_for,
                        },
                        data={
                            "next_release_at": next_release,
                            "is_active": envelope.locked_balance > amount,
                        },
                    )
                    if claimed != 1:
                        continue

                    moved = await tx.envelope.update_many(
                        where={
                            "id": envelope.id,
                            "locked_balance": {"gte": amount},
                        },
                        data={
                            "locked_balance": {"decrement": amount},
                            "balance": {"increment": amount},
                        },
                    )
                    if moved != 1:
                        raise ValueError("Reserved envelope balance changed while releasing allowance")

                    transaction = await tx.transaction.create(
                        data={
                            "user": {"connect": {"id": envelope.user_id}},
                            "envelope": {"connect": {"id": envelope.id}},
                            "transaction_type": "ALLOWANCE_RELEASE",
                            "amount": amount,
                            "description": f"{schedule.frequency.title()} allowance released",
                            "timestamp": scheduled_for,
                            "metadata": Json({
                                "allowance_schedule_id": schedule.id,
                                "scheduled_for": scheduled_for.isoformat(),
                            }),
                        }
                    )
                    await tx.allowancerelease.create(
                        data={
                            "schedule_id": schedule.id,
                            "transaction_id": transaction.id,
                            "scheduled_for": scheduled_for,
                            "amount": amount,
                        }
                    )
                    released += 1
            except UniqueViolationError:
                # Another scheduler instance already recorded this installment.
                continue

        return released

    @staticmethod
    def _format_schedule(schedule) -> dict:
        return {
            "id": schedule.id,
            "envelope_id": schedule.envelope_id,
            "release_amount": schedule.release_amount,
            "frequency": schedule.frequency,
            "next_release_at": schedule.next_release_at,
            "is_active": schedule.is_active,
        }
