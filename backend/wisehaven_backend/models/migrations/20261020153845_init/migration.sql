-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "first_sweep_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0.05,
    "preferred_notification" TEXT NOT NULL DEFAULT 'SMS',
    "emergency_contact" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Envelope" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_emergency_vault" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Envelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemporalLock" (
    "id" TEXT NOT NULL,
    "envelope_id" TEXT NOT NULL,
    "maturity_timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TemporalLock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationPlan" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllocationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllocationPlanItem" (
    "id" TEXT NOT NULL,
    "allocation_plan_id" TEXT NOT NULL,
    "envelope_id" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AllocationPlanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payee" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "account_identifier" TEXT,
    "payee_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayeeEnvelope" (
    "id" TEXT NOT NULL,
    "payee_id" TEXT NOT NULL,
    "envelope_id" TEXT NOT NULL,

    CONSTRAINT "PayeeEnvelope_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "source_id" TEXT,
    "destination_id" TEXT,
    "envelope_id" TEXT,
    "payee_id" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyWithdrawalRequest" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "justification" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "EmergencyWithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_number_key" ON "User"("phone_number");

-- CreateIndex
CREATE INDEX "User_phone_number_idx" ON "User"("phone_number");

-- CreateIndex
CREATE INDEX "Envelope_user_id_is_active_idx" ON "Envelope"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "Envelope_user_id_is_emergency_vault_idx" ON "Envelope"("user_id", "is_emergency_vault");

-- CreateIndex
CREATE UNIQUE INDEX "TemporalLock_envelope_id_key" ON "TemporalLock"("envelope_id");

-- CreateIndex
CREATE INDEX "TemporalLock_maturity_timestamp_notified_idx" ON "TemporalLock"("maturity_timestamp", "notified");

-- CreateIndex
CREATE INDEX "AllocationPlan_user_id_is_active_idx" ON "AllocationPlan"("user_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "AllocationPlanItem_allocation_plan_id_envelope_id_key" ON "AllocationPlanItem"("allocation_plan_id", "envelope_id");

-- CreateIndex
CREATE INDEX "Payee_user_id_idx" ON "Payee"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "PayeeEnvelope_payee_id_envelope_id_key" ON "PayeeEnvelope"("payee_id", "envelope_id");

-- CreateIndex
CREATE INDEX "Transaction_user_id_timestamp_idx" ON "Transaction"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "Transaction_envelope_id_timestamp_idx" ON "Transaction"("envelope_id", "timestamp");

-- CreateIndex
CREATE INDEX "Transaction_transaction_type_idx" ON "Transaction"("transaction_type");

-- CreateIndex
CREATE INDEX "EmergencyWithdrawalRequest_user_id_status_idx" ON "EmergencyWithdrawalRequest"("user_id", "status");

-- CreateIndex
CREATE INDEX "EmergencyWithdrawalRequest_requested_at_idx" ON "EmergencyWithdrawalRequest"("requested_at");

-- CreateIndex
CREATE INDEX "NotificationLog_user_id_sent_at_idx" ON "NotificationLog"("user_id", "sent_at");

-- CreateIndex
CREATE INDEX "NotificationLog_status_idx" ON "NotificationLog"("status");

-- AddForeignKey
ALTER TABLE "Envelope" ADD CONSTRAINT "Envelope_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemporalLock" ADD CONSTRAINT "TemporalLock_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "Envelope"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationPlan" ADD CONSTRAINT "AllocationPlan_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationPlanItem" ADD CONSTRAINT "AllocationPlanItem_allocation_plan_id_fkey" FOREIGN KEY ("allocation_plan_id") REFERENCES "AllocationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllocationPlanItem" ADD CONSTRAINT "AllocationPlanItem_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "Envelope"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payee" ADD CONSTRAINT "Payee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayeeEnvelope" ADD CONSTRAINT "PayeeEnvelope_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "Payee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayeeEnvelope" ADD CONSTRAINT "PayeeEnvelope_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "Envelope"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "Envelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "Payee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyWithdrawalRequest" ADD CONSTRAINT "EmergencyWithdrawalRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
