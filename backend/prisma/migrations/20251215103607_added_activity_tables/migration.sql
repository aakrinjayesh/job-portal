-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('NOTE', 'SCHEDULE');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('CALL', 'EMAIL', 'MESSAGE');

-- CreateEnum
CREATE TYPE "ScheduleType" AS ENUM ('INTERVIEW', 'MEETING', 'FOLLOW_UP');

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityNote" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "noteType" "NoteType" NOT NULL,
    "description" TEXT,
    "interactedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivityNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivitySchedule" (
    "id" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "scheduleType" "ScheduleType" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivitySchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_recruiterId_idx" ON "Activity"("recruiterId");

-- CreateIndex
CREATE INDEX "Activity_candidateId_idx" ON "Activity"("candidateId");

-- CreateIndex
CREATE INDEX "Activity_category_idx" ON "Activity"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ActivityNote_activityId_key" ON "ActivityNote"("activityId");

-- CreateIndex
CREATE UNIQUE INDEX "ActivitySchedule_activityId_key" ON "ActivitySchedule"("activityId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityNote" ADD CONSTRAINT "ActivityNote_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivitySchedule" ADD CONSTRAINT "ActivitySchedule_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
