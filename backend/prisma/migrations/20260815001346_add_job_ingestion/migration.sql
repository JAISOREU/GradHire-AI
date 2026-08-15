-- CreateEnum
CREATE TYPE "JobSourceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ERROR', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "JobSourceType" AS ENUM ('API', 'RSS', 'JSON', 'HTML');

-- CreateEnum
CREATE TYPE "IngestionJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportedJobStatus" AS ENUM ('IMPORTED', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'EXPIRED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "applicationUrl" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "isExternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sourceJobId" TEXT,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "JobSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "sourceType" "JobSourceType" NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "feedUrl" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "crawlInterval" INTEGER NOT NULL DEFAULT 60,
    "lastRunAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "status" "JobSourceStatus" NOT NULL DEFAULT 'ACTIVE',
    "fieldMapping" JSONB,
    "rateLimit" INTEGER,
    "attribution" TEXT,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSourceRun" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "status" "IngestionJobStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "discovered" INTEGER NOT NULL DEFAULT 0,
    "imported" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "rejected" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobSourceRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSourceJob" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceJobId" TEXT NOT NULL,
    "runId" TEXT,
    "jobId" TEXT,
    "fingerprint" TEXT NOT NULL,
    "status" "ImportedJobStatus" NOT NULL DEFAULT 'IMPORTED',
    "rawData" JSONB,
    "normalizedData" JSONB,
    "rejectionReason" TEXT,
    "applicationUrl" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "importedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSourceJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobSource_status_enabled_idx" ON "JobSource"("status", "enabled");

-- CreateIndex
CREATE INDEX "JobSource_sourceType_idx" ON "JobSource"("sourceType");

-- CreateIndex
CREATE INDEX "JobSourceRun_sourceId_createdAt_idx" ON "JobSourceRun"("sourceId", "createdAt");

-- CreateIndex
CREATE INDEX "JobSourceJob_fingerprint_idx" ON "JobSourceJob"("fingerprint");

-- CreateIndex
CREATE INDEX "JobSourceJob_status_idx" ON "JobSourceJob"("status");

-- CreateIndex
CREATE INDEX "JobSourceJob_sourceId_status_idx" ON "JobSourceJob"("sourceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JobSourceJob_sourceId_sourceJobId_key" ON "JobSourceJob"("sourceId", "sourceJobId");

-- AddForeignKey
ALTER TABLE "JobSourceRun" ADD CONSTRAINT "JobSourceRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "JobSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSourceJob" ADD CONSTRAINT "JobSourceJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "JobSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSourceJob" ADD CONSTRAINT "JobSourceJob_runId_fkey" FOREIGN KEY ("runId") REFERENCES "JobSourceRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
