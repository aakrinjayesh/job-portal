-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "certifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "clouds" TEXT[] DEFAULT ARRAY[]::TEXT[];
