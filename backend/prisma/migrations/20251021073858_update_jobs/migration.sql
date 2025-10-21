/*
  Warnings:

  - You are about to drop the column `company` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `posted` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `reviews` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Dummy` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `applicationDeadline` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employmentType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobType` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `Job` table without a default value. This is not possible if the table is not empty.
  - Added the required column `salary` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FullTime', 'PartTime', 'Internship', 'Contract', 'Freelance');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('Internship', 'EntryLevel', 'Mid', 'Senior', 'Lead');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('Open', 'Closed', 'Draft');

-- DropForeignKey
ALTER TABLE "public"."Dummy" DROP CONSTRAINT "Dummy_userid_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "company",
DROP COLUMN "posted",
DROP COLUMN "rating",
DROP COLUMN "reviews",
DROP COLUMN "title",
ADD COLUMN     "applicationDeadline" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "employmentType" "EmploymentType" NOT NULL,
ADD COLUMN     "experienceLevel" "ExperienceLevel",
ADD COLUMN     "jobType" TEXT NOT NULL,
ADD COLUMN     "postedById" TEXT,
ADD COLUMN     "qualifications" TEXT[],
ADD COLUMN     "responsibilities" TEXT[],
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "salary" INTEGER NOT NULL,
ADD COLUMN     "status" "JobStatus" NOT NULL DEFAULT 'Open';

-- DropTable
DROP TABLE "public"."Dummy";

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
