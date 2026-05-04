-- CreateEnum
CREATE TYPE "ApplicantSource" AS ENUM ('Candidate', 'Company', 'Both');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "applicantSource" "ApplicantSource" NOT NULL DEFAULT 'Both';
