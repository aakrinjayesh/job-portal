-- AlterTable
ALTER TABLE "Certification" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Skills" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;
