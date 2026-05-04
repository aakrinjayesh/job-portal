/*
  Warnings:

  - A unique constraint covering the columns `[recruiterId,candidateId,jobId,organizationId]` on the table `CandidateTaskList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `CandidateTask` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `CandidateTaskList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `TaskTemplate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CandidateTaskList_recruiterId_candidateId_jobId_key";

-- AlterTable
ALTER TABLE "CandidateTask" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CandidateTaskList" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaskTemplate" ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "CandidateTask_organizationId_idx" ON "CandidateTask"("organizationId");

-- CreateIndex
CREATE INDEX "CandidateTaskList_organizationId_idx" ON "CandidateTaskList"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateTaskList_recruiterId_candidateId_jobId_organizatio_key" ON "CandidateTaskList"("recruiterId", "candidateId", "jobId", "organizationId");

-- CreateIndex
CREATE INDEX "TaskTemplate_organizationId_idx" ON "TaskTemplate"("organizationId");

-- AddForeignKey
ALTER TABLE "TaskTemplate" ADD CONSTRAINT "TaskTemplate_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTaskList" ADD CONSTRAINT "CandidateTaskList_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTask" ADD CONSTRAINT "CandidateTask_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
