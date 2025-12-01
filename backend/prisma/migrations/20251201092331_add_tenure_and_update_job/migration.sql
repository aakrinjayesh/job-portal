/*
  Warnings:

  - The `experience` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `description` on table `Job` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "tenure" TEXT,
DROP COLUMN "experience",
ADD COLUMN     "experience" JSONB,
ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "responsibilities" SET NOT NULL,
ALTER COLUMN "responsibilities" SET DATA TYPE TEXT;
