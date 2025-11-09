-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "venderId" TEXT,
ADD COLUMN     "vendorId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
