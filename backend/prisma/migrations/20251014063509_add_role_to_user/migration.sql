-- CreateEnum
CREATE TYPE "Role" AS ENUM ('candidate', 'company', 'admin');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'candidate';
