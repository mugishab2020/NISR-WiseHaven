-- CreateTable
CREATE TABLE "PaymentRequest" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_reference" TEXT NOT NULL,
    "provider_reference" TEXT,
    "provider" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "phone_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "provider_status" TEXT,
    "description" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentRequest_payment_reference_key" ON "PaymentRequest"("payment_reference");

-- CreateIndex
CREATE INDEX "PaymentRequest_user_id_status_idx" ON "PaymentRequest"("user_id", "status");

-- CreateIndex
CREATE INDEX "PaymentRequest_payment_reference_idx" ON "PaymentRequest"("payment_reference");

-- CreateIndex
CREATE INDEX "PaymentRequest_created_at_idx" ON "PaymentRequest"("created_at");
