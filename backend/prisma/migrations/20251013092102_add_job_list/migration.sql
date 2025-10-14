-- CreateTable
CREATE TABLE "JobList" (
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

    CONSTRAINT "JobList_pkey" PRIMARY KEY ("id")
);
