-- CreateEnum
CREATE TYPE "OrgPermission" AS ENUM ('VIEW_ONLY', 'VIEW_EDIT', 'FULL_ACCESS');

-- AlterTable
ALTER TABLE "OrganizationMember" ADD COLUMN     "permissions" "OrgPermission" NOT NULL DEFAULT 'FULL_ACCESS';
