/*
  Warnings:

  - You are about to drop the column `mfa_enabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfa_secret` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `OTPCode` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clerk_id]` on the `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clerk_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Drop OTPCode table dependencies
ALTER TABLE "OTPCode" DROP CONSTRAINT IF EXISTS "OTPCode_user_id_fkey";

-- Step 2: Drop OTPCode table
DROP TABLE IF EXISTS "OTPCode";

-- Step 3: Add clerk_id column with temporary default (we'll remove default after)
ALTER TABLE "User" ADD COLUMN "clerk_id" TEXT;

-- Step 4: Set clerk_id to existing user id for existing users (migration compatibility)
-- In production, you'd map real Clerk IDs here
UPDATE "User" SET "clerk_id" = "id" WHERE "clerk_id" IS NULL;

-- Step 5: Make clerk_id NOT NULL now that all rows have values
ALTER TABLE "User" ALTER COLUMN "clerk_id" SET NOT NULL;

-- Step 6: Drop old auth columns
ALTER TABLE "User" DROP COLUMN IF EXISTS "mfa_enabled";
ALTER TABLE "User" DROP COLUMN IF EXISTS "mfa_secret";
ALTER TABLE "User" DROP COLUMN IF EXISTS "password_hash";

-- Step 7: Make email and phone optional (managed by Clerk)
ALTER TABLE "User" ALTER COLUMN "phone_number" DROP NOT NULL;
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

-- Step 8: Drop old phone_number unique constraint if it exists
DROP INDEX IF EXISTS "User_phone_number_key";

-- Step 9: Create clerk_id unique constraint and index
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerk_id_key" ON "User"("clerk_id");
CREATE INDEX IF NOT EXISTS "User_clerk_id_idx" ON "User"("clerk_id");

-- Step 10: Recreate email and phone indexes for optional lookups
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_phone_number_idx" ON "User"("phone_number");
