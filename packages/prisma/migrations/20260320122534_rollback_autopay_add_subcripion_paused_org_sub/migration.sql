/*
  Warnings:

  - You are about to drop the column `isPendingRemoval` on the `License` table. All the data in the column will be lost.
  - You are about to drop the column `razorpaySubscriptionId` on the `OrganizationSubscription` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayMonthlyPlanId` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `razorpayYearlyPlanId` on the `SubscriptionPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "License" DROP COLUMN "isPendingRemoval";

-- AlterTable
ALTER TABLE "OrganizationSubscription" DROP COLUMN "razorpaySubscriptionId",
ADD COLUMN     "isSubscriptionPaused" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "autoRenew" SET DEFAULT false;

-- AlterTable
ALTER TABLE "SubscriptionPlan" DROP COLUMN "razorpayMonthlyPlanId",
DROP COLUMN "razorpayYearlyPlanId";
