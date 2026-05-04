/*
  Warnings:

  - A unique constraint covering the columns `[candidateId,jobId,organizationId]` on the table `CandidateTaskList` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "CandidateTaskList" DROP CONSTRAINT "CandidateTaskList_recruiterId_fkey";

-- DropIndex
DROP INDEX "CandidateTaskList_recruiterId_candidateId_jobId_organizatio_key";

-- AlterTable
ALTER TABLE "CandidateTaskList" ALTER COLUMN "recruiterId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CandidateTaskList_candidateId_jobId_organizationId_key" ON "CandidateTaskList"("candidateId", "jobId", "organizationId");

-- AddForeignKey
ALTER TABLE "CandidateTaskList" ADD CONSTRAINT "CandidateTaskList_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
