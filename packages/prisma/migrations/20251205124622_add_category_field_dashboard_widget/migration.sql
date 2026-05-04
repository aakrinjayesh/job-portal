/*
  Warnings:

  - You are about to drop the column `chatuserid` on the `Users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DatasetType" AS ENUM ('JOBS', 'APPLICATIONS', 'APPLICATION_ANALYSIS');

-- CreateEnum
CREATE TYPE "ChartType" AS ENUM ('LINE', 'COLUMN', 'BAR', 'PIE', 'DONUT', 'SCATTER', 'AREA', 'MULTI_LINE', 'STACK_AREA', 'STACKED_COLUMN', 'GROUPED_COLUMN', 'GROUP_AND_STACK_COLUMN', 'NUMBER_CARD');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('COUNT', 'AVG', 'MIN', 'MAX');

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "chatuserid" TEXT;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "chatuserid";

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardWidget" (
    "id" TEXT NOT NULL,
    "dashboardId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dataset" "DatasetType" NOT NULL,
    "chartType" "ChartType" NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "metricField" TEXT,
    "xField" TEXT,
    "categoryField" TEXT,
    "timeBucket" TEXT,
    "filters" JSONB,
    "sort" JSONB,
    "display" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardWidget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dashboard_ownerId_idx" ON "Dashboard"("ownerId");

-- CreateIndex
CREATE INDEX "DashboardWidget_dashboardId_idx" ON "DashboardWidget"("dashboardId");

-- AddForeignKey
ALTER TABLE "Dashboard" ADD CONSTRAINT "Dashboard_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardWidget" ADD CONSTRAINT "DashboardWidget_dashboardId_fkey" FOREIGN KEY ("dashboardId") REFERENCES "Dashboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
