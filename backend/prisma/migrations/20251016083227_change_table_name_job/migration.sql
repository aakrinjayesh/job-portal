/*
  Warnings:

  - You are about to drop the `JobList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."JobList";

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "rating" DOUBLE PRECISION,
    "reviews" INTEGER,
    "experience" TEXT,
    "location" TEXT,
    "description" TEXT,
    "skills" TEXT[],
    "posted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);
