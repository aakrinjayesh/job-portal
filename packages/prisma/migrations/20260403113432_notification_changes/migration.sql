-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DAILY', 'WEEKLY');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "notificationType" "NotificationType" NOT NULL DEFAULT 'WEEKLY',
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
