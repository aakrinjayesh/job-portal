-- AlterTable
ALTER TABLE "License" ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "purchasedById" TEXT;

-- AlterTable
ALTER TABLE "PromoCodeUsage" ADD COLUMN     "paymentId" TEXT;

-- CreateIndex
CREATE INDEX "License_purchasedById_idx" ON "License"("purchasedById");

-- CreateIndex
CREATE INDEX "License_paymentId_idx" ON "License"("paymentId");

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_purchasedById_fkey" FOREIGN KEY ("purchasedById") REFERENCES "OrganizationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeUsage" ADD CONSTRAINT "PromoCodeUsage_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
