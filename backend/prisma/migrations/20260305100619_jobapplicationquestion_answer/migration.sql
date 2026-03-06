-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'BOOLEAN', 'SELECT');

-- CreateTable
CREATE TABLE "JobApplicationQuestion" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'TEXT',
    "options" TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplicationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationAnswer" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answerText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplicationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobApplicationQuestion_jobId_idx" ON "JobApplicationQuestion"("jobId");

-- CreateIndex
CREATE INDEX "JobApplicationAnswer_applicationId_idx" ON "JobApplicationAnswer"("applicationId");

-- CreateIndex
CREATE INDEX "JobApplicationAnswer_questionId_idx" ON "JobApplicationAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationAnswer_applicationId_questionId_key" ON "JobApplicationAnswer"("applicationId", "questionId");

-- AddForeignKey
ALTER TABLE "JobApplicationQuestion" ADD CONSTRAINT "JobApplicationQuestion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationAnswer" ADD CONSTRAINT "JobApplicationAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationAnswer" ADD CONSTRAINT "JobApplicationAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "JobApplicationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
