/*
  Warnings:

  - The `workExperience` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "currentLocation" TEXT,
ADD COLUMN     "education" JSONB,
DROP COLUMN "workExperience",
ADD COLUMN     "workExperience" JSONB;
