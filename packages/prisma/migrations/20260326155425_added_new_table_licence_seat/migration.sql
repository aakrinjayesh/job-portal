-- DropForeignKey
ALTER TABLE "AITokenUsage" DROP CONSTRAINT "AITokenUsage_licenseId_fkey";

-- DropForeignKey
ALTER TABLE "License" DROP CONSTRAINT "License_planId_fkey";

-- DropIndex
DROP INDEX "License_assignedToId_key";

-- AlterTable
ALTER TABLE "AITokenUsage" ADD COLUMN     "seatId" TEXT,
ALTER COLUMN "licenseId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "License" ADD COLUMN     "seatId" TEXT;

-- AlterTable
ALTER TABLE "OrganizationInvite" ADD COLUMN     "seatId" TEXT;

-- AlterTable
ALTER TABLE "UsageRecord" ADD COLUMN     "seatId" TEXT,
ALTER COLUMN "licenseId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LicenseSeat" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseSeat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LicenseSeat_subscriptionId_idx" ON "LicenseSeat"("subscriptionId");

-- CreateIndex
CREATE INDEX "LicenseSeat_assignedToId_idx" ON "LicenseSeat"("assignedToId");

-- CreateIndex
CREATE INDEX "License_seatId_validFrom_validUntil_idx" ON "License"("seatId", "validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "License_assignedToId_idx" ON "License"("assignedToId");

-- CreateIndex
CREATE INDEX "UsageRecord_seatId_idx" ON "UsageRecord"("seatId");

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "LicenseSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseSeat" ADD CONSTRAINT "LicenseSeat_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "OrganizationSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseSeat" ADD CONSTRAINT "LicenseSeat_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "LicenseSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITokenUsage" ADD CONSTRAINT "AITokenUsage_seatId_fkey" FOREIGN KEY ("seatId") REFERENCES "LicenseSeat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AITokenUsage" ADD CONSTRAINT "AITokenUsage_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License"("id") ON DELETE CASCADE ON UPDATE CASCADE;
