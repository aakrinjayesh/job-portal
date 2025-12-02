/*
  Warnings:

  - You are about to drop the column `qualifications` on the `Job` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "qualifications",
ADD COLUMN     "certifications" TEXT[];
