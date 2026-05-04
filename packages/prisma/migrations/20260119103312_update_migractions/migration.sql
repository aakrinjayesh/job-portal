-- AlterTable
ALTER TABLE "OrganizationInvite" ADD COLUMN     "permissions" "OrgPermission" NOT NULL DEFAULT 'VIEW_ONLY';
