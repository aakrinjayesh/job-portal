-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "trailheadBadges" JSONB,
ADD COLUMN     "trailheadBadgesCount" INTEGER DEFAULT 0,
ADD COLUMN     "trailheadCertifications" JSONB,
ADD COLUMN     "trailheadPoints" INTEGER DEFAULT 0,
ADD COLUMN     "trailheadStats" JSONB,
ADD COLUMN     "trailheadTrailsCount" INTEGER DEFAULT 0;
