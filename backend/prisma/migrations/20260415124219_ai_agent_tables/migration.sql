-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProctorEventType" AS ENUM ('TAB_SWITCH', 'LOOKING_AWAY', 'NO_FACE', 'MULTIPLE_FACES');

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "jobId" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "summary" TEXT,
    "overallScore" DOUBLE PRECISION,
    "audioUrl" TEXT,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobApplicationId" TEXT,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "transcript" TEXT,
    "duration" INTEGER,
    "score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProctoringEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "ProctorEventType" NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProctoringEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewMetric" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "wpm" DOUBLE PRECISION,
    "fillerWords" INTEGER,
    "pauseDuration" DOUBLE PRECISION,
    "plagiarismScore" DOUBLE PRECISION,

    CONSTRAINT "InterviewMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewScore" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "technicalScore" DOUBLE PRECISION,
    "communicationScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "recommendation" TEXT,

    CONSTRAINT "InterviewScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewAnswer_sessionId_idx" ON "InterviewAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "ProctoringEvent_sessionId_idx" ON "ProctoringEvent"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewMetric_sessionId_key" ON "InterviewMetric"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewScore_sessionId_key" ON "InterviewScore"("sessionId");

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_jobApplicationId_fkey" FOREIGN KEY ("jobApplicationId") REFERENCES "JobApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProctoringEvent" ADD CONSTRAINT "ProctoringEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewMetric" ADD CONSTRAINT "InterviewMetric_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewScore" ADD CONSTRAINT "InterviewScore_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
