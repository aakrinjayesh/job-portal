/*
  Warnings:

  - The `primaryClouds` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `secondaryClouds` column on the `UserProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "primaryClouds",
ADD COLUMN     "primaryClouds" JSONB,
DROP COLUMN "secondaryClouds",
ADD COLUMN     "secondaryClouds" JSONB;
