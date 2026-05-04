/*
  Warnings:

  - A unique constraint covering the columns `[jobId,candidateProfileId]` on the table `JobApplication` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "JobApplication_jobId_userId_key";

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "appliedById" TEXT,
ADD COLUMN     "candidateProfileId" TEXT;

-- CreateIndex
CREATE INDEX "JobApplication_candidateProfileId_idx" ON "JobApplication"("candidateProfileId");

-- CreateIndex
CREATE INDEX "JobApplication_appliedById_idx" ON "JobApplication"("appliedById");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_candidateProfileId_key" ON "JobApplication"("jobId", "candidateProfileId");

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_appliedById_fkey" FOREIGN KEY ("appliedById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
