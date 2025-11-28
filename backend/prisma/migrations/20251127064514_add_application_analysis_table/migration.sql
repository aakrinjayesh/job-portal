-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "ApplicationAnalysis" (
    "id" TEXT NOT NULL,
    "jobApplicationId" TEXT NOT NULL,
    "fitPercentage" INTEGER NOT NULL DEFAULT 0,
    "details" JSONB NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationAnalysis_jobApplicationId_key" ON "ApplicationAnalysis"("jobApplicationId");

-- CreateIndex
CREATE INDEX "ApplicationAnalysis_fitPercentage_idx" ON "ApplicationAnalysis"("fitPercentage");

-- AddForeignKey
ALTER TABLE "ApplicationAnalysis" ADD CONSTRAINT "ApplicationAnalysis_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
