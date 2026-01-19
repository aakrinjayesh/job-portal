/*
  Warnings:

  - A unique constraint covering the columns `[jobId,organizationId]` on the table `SavedJob` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SavedJob" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_jobId_organizationId_key" ON "SavedJob"("jobId", "organizationId");
