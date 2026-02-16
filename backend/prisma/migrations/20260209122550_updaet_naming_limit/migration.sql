-- DropForeignKey
ALTER TABLE "PlanLimit" DROP CONSTRAINT "PlanLimit_planId_fkey";

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
