ALTER TABLE "Envelope"
ADD COLUMN "locked_balance" DECIMAL(15,2) NOT NULL DEFAULT 0;

CREATE TABLE "AllowanceSchedule" (
    "id" TEXT NOT NULL,
    "envelope_id" TEXT NOT NULL,
    "release_amount" DECIMAL(15,2) NOT NULL,
    "frequency" TEXT NOT NULL,
    "next_release_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllowanceSchedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AllowanceRelease" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowanceRelease_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AllowanceSchedule_envelope_id_key" ON "AllowanceSchedule"("envelope_id");
CREATE INDEX "AllowanceSchedule_is_active_next_release_at_idx" ON "AllowanceSchedule"("is_active", "next_release_at");
CREATE UNIQUE INDEX "AllowanceRelease_transaction_id_key" ON "AllowanceRelease"("transaction_id");
CREATE UNIQUE INDEX "AllowanceRelease_schedule_id_scheduled_for_key" ON "AllowanceRelease"("schedule_id", "scheduled_for");
CREATE INDEX "AllowanceRelease_scheduled_for_idx" ON "AllowanceRelease"("scheduled_for");

ALTER TABLE "AllowanceSchedule"
ADD CONSTRAINT "AllowanceSchedule_envelope_id_fkey"
FOREIGN KEY ("envelope_id") REFERENCES "Envelope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AllowanceRelease"
ADD CONSTRAINT "AllowanceRelease_schedule_id_fkey"
FOREIGN KEY ("schedule_id") REFERENCES "AllowanceSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
