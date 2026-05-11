/*
  Warnings:

  - You are about to drop the column `followingId` on the `Follow` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[followerId,followingUserId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[followerId,followingCompanyId]` on the table `Follow` will be added. If there are existing duplicate values, this will fail.
  - Made the column `content` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropIndex
DROP INDEX "Follow_followerId_followingId_key";

-- DropIndex
DROP INDEX "Follow_followingId_idx";

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "followersCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Follow" DROP COLUMN "followingId",
ADD COLUMN     "followingCompanyId" TEXT,
ADD COLUMN     "followingUserId" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "organizationId" TEXT,
ALTER COLUMN "content" SET NOT NULL;

-- AlterTable
ALTER TABLE "PostComment" ADD COLUMN     "organizationId" TEXT;

-- AlterTable
ALTER TABLE "PostLike" ADD COLUMN     "organizationId" TEXT;

-- CreateIndex
CREATE INDEX "Follow_followingUserId_idx" ON "Follow"("followingUserId");

-- CreateIndex
CREATE INDEX "Follow_followingCompanyId_idx" ON "Follow"("followingCompanyId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingUserId_key" ON "Follow"("followerId", "followingUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followingCompanyId_key" ON "Follow"("followerId", "followingCompanyId");

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingUserId_fkey" FOREIGN KEY ("followingUserId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingCompanyId_fkey" FOREIGN KEY ("followingCompanyId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
