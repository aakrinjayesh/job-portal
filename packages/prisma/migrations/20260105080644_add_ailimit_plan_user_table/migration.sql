-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PAID');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "aiResetAt" TIMESTAMP(3),
ADD COLUMN     "aiUsedCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'FREE';
