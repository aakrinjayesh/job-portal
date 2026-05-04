-- CreateTable
CREATE TABLE "CandidateRating" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateRating_recruiterId_candidateProfileId_key" ON "CandidateRating"("recruiterId", "candidateProfileId");

-- AddForeignKey
ALTER TABLE "CandidateRating" ADD CONSTRAINT "CandidateRating_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateRating" ADD CONSTRAINT "CandidateRating_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
