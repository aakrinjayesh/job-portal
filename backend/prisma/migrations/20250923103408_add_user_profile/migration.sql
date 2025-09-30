-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('FullTime', 'Contract', 'Freelance');

-- CreateTable
CREATE TABLE "public"."UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profilePicture" TEXT,
    "preferredLocation" TEXT[],
    "preferredJobType" "public"."JobType"[],
    "currentCTC" TEXT,
    "expectedCTC" TEXT,
    "joiningPeriod" TEXT,
    "totalExperience" TEXT,
    "relevantSalesforceExperience" TEXT,
    "skills" TEXT[],
    "certifications" TEXT[],
    "workExperience" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "public"."UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
