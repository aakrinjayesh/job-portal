-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "emailNotificationDisabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "NewCourse" ADD COLUMN     "courseLevel" TEXT,
ADD COLUMN     "prerequisities" TEXT,
ADD COLUMN     "syllabus" TEXT,
ADD COLUMN     "whatYouWillLearn" TEXT;
