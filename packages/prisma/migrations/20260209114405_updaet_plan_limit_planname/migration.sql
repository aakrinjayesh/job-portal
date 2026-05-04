/*
  Warnings:

  - Added the required column `planName` to the `PlanLimit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PlanLimit" DROP CONSTRAINT "PlanLimit_planId_fkey";

-- AlterTable
ALTER TABLE "PlanLimit" ADD COLUMN     "planName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
