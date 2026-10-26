-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mfa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfa_secret" TEXT;

-- CreateTable
CREATE TABLE "OTPCode" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OTPCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OTPCode_user_id_purpose_is_used_idx" ON "OTPCode"("user_id", "purpose", "is_used");

-- CreateIndex
CREATE INDEX "OTPCode_expires_at_idx" ON "OTPCode"("expires_at");

-- AddForeignKey
ALTER TABLE "OTPCode" ADD CONSTRAINT "OTPCode_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
