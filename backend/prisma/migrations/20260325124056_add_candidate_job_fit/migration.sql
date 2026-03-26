-- CreateTable
CREATE TABLE "CandidateJobFit" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "fitPercentage" INTEGER NOT NULL,
    "details" JSONB,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateJobFit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateJobFit_jobId_idx" ON "CandidateJobFit"("jobId");

-- CreateIndex
CREATE INDEX "CandidateJobFit_candidateProfileId_idx" ON "CandidateJobFit"("candidateProfileId");

-- CreateIndex
CREATE INDEX "CandidateJobFit_fitPercentage_idx" ON "CandidateJobFit"("fitPercentage");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateJobFit_jobId_candidateProfileId_key" ON "CandidateJobFit"("jobId", "candidateProfileId");

-- AddForeignKey
ALTER TABLE "CandidateJobFit" ADD CONSTRAINT "CandidateJobFit_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateJobFit" ADD CONSTRAINT "CandidateJobFit_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
