/*
  Warnings:

  - You are about to drop the column `aiResetAt` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `aiUsedCount` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the `BillingPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditLedger` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CreditLedger" DROP CONSTRAINT "CreditLedger_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationSubscription" DROP CONSTRAINT "OrganizationSubscription_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationSubscription" DROP CONSTRAINT "OrganizationSubscription_planId_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAttempt" DROP CONSTRAINT "PaymentAttempt_organizationId_fkey";

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "aiResetAt",
DROP COLUMN "aiUsedCount",
DROP COLUMN "plan";

-- DropTable
DROP TABLE "BillingPlan";

-- DropTable
DROP TABLE "CreditLedger";

-- DropTable
DROP TABLE "OrganizationSubscription";

-- DropTable
DROP TABLE "PaymentAttempt";

-- DropEnum
DROP TYPE "CreditReason";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "SubscriptionStatus";
