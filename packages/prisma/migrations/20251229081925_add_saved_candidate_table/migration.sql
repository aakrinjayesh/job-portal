-- CreateTable
CREATE TABLE "SavedCandidate" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedCandidate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SavedCandidate_recruiterId_idx" ON "SavedCandidate"("recruiterId");

-- CreateIndex
CREATE INDEX "SavedCandidate_candidateProfileId_idx" ON "SavedCandidate"("candidateProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCandidate_recruiterId_candidateProfileId_key" ON "SavedCandidate"("recruiterId", "candidateProfileId");

-- AddForeignKey
ALTER TABLE "SavedCandidate" ADD CONSTRAINT "SavedCandidate_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedCandidate" ADD CONSTRAINT "SavedCandidate_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
