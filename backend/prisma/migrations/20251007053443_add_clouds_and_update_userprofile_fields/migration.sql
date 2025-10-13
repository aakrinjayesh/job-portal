/*
  Warnings:

  - You are about to drop the column `skills` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "skills",
ADD COLUMN     "linkedInUrl" TEXT,
ADD COLUMN     "primaryClouds" TEXT[],
ADD COLUMN     "secondaryClouds" TEXT[],
ADD COLUMN     "skillsJson" JSONB,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "trailheadUrl" TEXT;

-- CreateTable
CREATE TABLE "Cloud" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cloud_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cloud_name_key" ON "Cloud"("name");
