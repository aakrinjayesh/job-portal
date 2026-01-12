/*
  Warnings:

  - You are about to drop the `WhatsAppMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhatsAppTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WhatsAppMessage" DROP CONSTRAINT "WhatsAppMessage_activityId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppMessage" DROP CONSTRAINT "WhatsAppMessage_candidateId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppMessage" DROP CONSTRAINT "WhatsAppMessage_recruiterId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppTemplate" DROP CONSTRAINT "WhatsAppTemplate_createdById_fkey";

-- DropTable
DROP TABLE "WhatsAppMessage";

-- DropTable
DROP TABLE "WhatsAppTemplate";

-- DropEnum
DROP TYPE "WhatsAppDirection";

-- DropEnum
DROP TYPE "WhatsAppStatus";

-- DropEnum
DROP TYPE "WhatsAppTemplateStatus";
