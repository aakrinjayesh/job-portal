-- AlterTable: Add Razorpay plan IDs to SubscriptionPlan
ALTER TABLE "SubscriptionPlan" ADD COLUMN "razorpayMonthlyPlanId" TEXT;
ALTER TABLE "SubscriptionPlan" ADD COLUMN "razorpayYearlyPlanId" TEXT;

-- AlterTable: Add Razorpay subscription ID to OrganizationSubscription
ALTER TABLE "OrganizationSubscription" ADD COLUMN "razorpaySubscriptionId" TEXT;

-- AlterTable: Add isPendingRemoval to License
ALTER TABLE "License" ADD COLUMN "isPendingRemoval" BOOLEAN NOT NULL DEFAULT false;
