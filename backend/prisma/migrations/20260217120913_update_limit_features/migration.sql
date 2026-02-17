/*
  Warnings:

  - The values [FIT_SCORE_ANALYSES,ACTIVE_JOB_POSTINGS,CANDIDATE_DETAILS_VIEW,JOB_APPLICATIONS] on the enum `LimitFeature` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LimitFeature_new" AS ENUM ('AI_TOKENS_TOTAL', 'JOB_POST_CREATION', 'CANDIDATE_PROFILE_VIEWS', 'FIND_CANDIDATE_SEARCH', 'APPLY_BENCH_TO_JOB', 'RESUME_EXTRACTION', 'AI_FIT_SCORE', 'AI_SEARCH', 'DIRECT_CHAT', 'GROUP_CHAT', 'WHATSAPP_CONNECT', 'TEAM_MEMBERS');
ALTER TABLE "PlanLimit" ALTER COLUMN "feature" TYPE "LimitFeature_new" USING ("feature"::text::"LimitFeature_new");
ALTER TABLE "UsageRecord" ALTER COLUMN "feature" TYPE "LimitFeature_new" USING ("feature"::text::"LimitFeature_new");
ALTER TYPE "LimitFeature" RENAME TO "LimitFeature_old";
ALTER TYPE "LimitFeature_new" RENAME TO "LimitFeature";
DROP TYPE "LimitFeature_old";
COMMIT;
