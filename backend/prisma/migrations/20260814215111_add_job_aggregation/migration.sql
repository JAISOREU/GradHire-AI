-- CreateEnum
CREATE TYPE "JobOrigin" AS ENUM ('DIRECT_EMPLOYER', 'AGGREGATED_EXTERNAL');

-- CreateEnum
CREATE TYPE "AggregationStatus" AS ENUM ('AGGREGATED', 'VERIFIED', 'PENDING_REVIEW', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobSourceType" AS ENUM ('RSS', 'API', 'CAREER_PAGE', 'JOB_BOARD', 'OTHER');

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "aggregatedAt" TIMESTAMP(3),
ADD COLUMN     "aggregationConfidence" DOUBLE PRECISION,
ADD COLUMN     "aggregationStatus" "AggregationStatus",
ADD COLUMN     "contentHash" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "externalCompanyLogo" TEXT,
ADD COLUMN     "externalCompanyName" TEXT,
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "origin" "JobOrigin" NOT NULL DEFAULT 'DIRECT_EMPLOYER',
ADD COLUMN     "sourceJobId" TEXT,
ADD COLUMN     "sourceName" TEXT,
ADD COLUMN     "sourceType" "JobSourceType",
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "JobSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseUrl" TEXT NOT NULL,
    "sourceType" "JobSourceType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "crawlFrequency" TEXT DEFAULT '6h',
    "lastCrawledAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "configuration" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AggregatedJob" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "sourceType" "JobSourceType" NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sourceJobId" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "externalCompanyName" TEXT,
    "externalCompanyLogo" TEXT,
    "aggregatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVerifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "aggregationStatus" "AggregationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "aggregationConfidence" DOUBLE PRECISION,
    "contentHash" TEXT,
    "originalPostingDate" TIMESTAMP(3),
    "duplicateOfId" TEXT,

    CONSTRAINT "AggregatedJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobSource_name_key" ON "JobSource"("name");

-- CreateIndex
CREATE INDEX "JobSource_sourceType_idx" ON "JobSource"("sourceType");

-- CreateIndex
CREATE INDEX "JobSource_enabled_idx" ON "JobSource"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "AggregatedJob_jobId_key" ON "AggregatedJob"("jobId");

-- CreateIndex
CREATE INDEX "AggregatedJob_sourceType_idx" ON "AggregatedJob"("sourceType");

-- CreateIndex
CREATE INDEX "AggregatedJob_sourceJobId_idx" ON "AggregatedJob"("sourceJobId");

-- CreateIndex
CREATE INDEX "AggregatedJob_sourceUrl_idx" ON "AggregatedJob"("sourceUrl");

-- CreateIndex
CREATE INDEX "AggregatedJob_contentHash_idx" ON "AggregatedJob"("contentHash");

-- CreateIndex
CREATE INDEX "AggregatedJob_aggregationStatus_idx" ON "AggregatedJob"("aggregationStatus");

-- CreateIndex
CREATE INDEX "AggregatedJob_expiresAt_idx" ON "AggregatedJob"("expiresAt");

-- CreateIndex
CREATE INDEX "Job_origin_idx" ON "Job"("origin");

-- CreateIndex
CREATE INDEX "Job_sourceType_idx" ON "Job"("sourceType");

-- CreateIndex
CREATE INDEX "Job_sourceJobId_idx" ON "Job"("sourceJobId");

-- CreateIndex
CREATE INDEX "Job_sourceUrl_idx" ON "Job"("sourceUrl");

-- CreateIndex
CREATE INDEX "Job_contentHash_idx" ON "Job"("contentHash");

-- CreateIndex
CREATE INDEX "Job_aggregationStatus_idx" ON "Job"("aggregationStatus");

-- CreateIndex
CREATE INDEX "Job_expiresAt_idx" ON "Job"("expiresAt");

-- AddForeignKey
ALTER TABLE "AggregatedJob" ADD CONSTRAINT "AggregatedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AggregatedJob" ADD CONSTRAINT "AggregatedJob_sourceName_fkey" FOREIGN KEY ("sourceName") REFERENCES "JobSource"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AggregatedJob" ADD CONSTRAINT "AggregatedJob_duplicateOfId_fkey" FOREIGN KEY ("duplicateOfId") REFERENCES "AggregatedJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
