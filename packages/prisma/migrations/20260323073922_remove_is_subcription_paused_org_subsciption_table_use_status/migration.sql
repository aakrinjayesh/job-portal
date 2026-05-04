/*
  Warnings:

  - You are about to drop the column `isSubscriptionPaused` on the `OrganizationSubscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrganizationSubscription" DROP COLUMN "isSubscriptionPaused";
