-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_userId_fkey";

-- AlterTable
ALTER TABLE "JobApplication" ADD COLUMN     "usersId" TEXT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "emailverified" BOOLEAN,
ADD COLUMN     "isactive" BOOLEAN;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_usersId_fkey" FOREIGN KEY ("usersId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
