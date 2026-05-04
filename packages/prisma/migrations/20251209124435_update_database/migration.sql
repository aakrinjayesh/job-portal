/*
  Warnings:

  - You are about to drop the column `usersId` on the `JobApplication` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_usersId_fkey";

-- AlterTable
ALTER TABLE "JobApplication" DROP COLUMN "usersId";
