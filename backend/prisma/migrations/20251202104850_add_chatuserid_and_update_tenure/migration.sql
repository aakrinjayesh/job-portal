/*
  Warnings:

  - The `tenure` column on the `Job` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Job" DROP COLUMN "tenure",
ADD COLUMN     "tenure" JSONB;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "chatuserid" TEXT;
