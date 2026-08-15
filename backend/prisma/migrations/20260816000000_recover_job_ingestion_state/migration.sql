-- Recovery migration for Railway database state reconciliation
-- This migration is idempotent and safe to run multiple times.
-- It ensures all objects from 20260815001346_add_job_ingestion exist
-- without failing if they were already created by a partial deployment.

-- ============================================================
-- Enums: create only if they do not already exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobSourceStatus') THEN
    CREATE TYPE "JobSourceStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ERROR', 'RATE_LIMITED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobSourceType') THEN
    CREATE TYPE "JobSourceType" AS ENUM ('API', 'RSS', 'JSON', 'HTML');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'IngestionJobStatus') THEN
    CREATE TYPE "IngestionJobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'PARTIAL', 'FAILED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ImportedJobStatus') THEN
    CREATE TYPE "ImportedJobStatus" AS ENUM ('IMPORTED', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'EXPIRED', 'ARCHIVED');
  END IF;
END $$;

-- ============================================================
-- Job table: add missing columns if they do not exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name = 'applicationUrl'
  ) THEN
    ALTER TABLE "Job" ADD COLUMN "applicationUrl" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name = 'importedAt'
  ) THEN
    ALTER TABLE "Job" ADD COLUMN "importedAt" TIMESTAMP(3);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name = 'isExternal'
  ) THEN
    ALTER TABLE "Job" ADD COLUMN "isExternal" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name = 'sourceJobId'
  ) THEN
    ALTER TABLE "Job" ADD COLUMN "sourceJobId" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name = 'sourceName'
  ) THEN
    ALTER TABLE "Job" ADD COLUMN "sourceName" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Job' AND column_name = 'sourceUrl'
  ) THEN
    ALTER TABLE "Job" ADD COLUMN "sourceUrl" TEXT;
  END IF;
END $$;

-- ============================================================
-- JobSource table: create if it does not exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'JobSource'
  ) THEN
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
  END IF;
END $$;

-- ============================================================
-- JobSourceRun table: create if it does not exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'JobSourceRun'
  ) THEN
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
  END IF;
END $$;

-- ============================================================
-- JobSourceJob table: create if it does not exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'JobSourceJob'
  ) THEN
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
  END IF;
END $$;

-- ============================================================
-- Indexes: create only if they do not exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'JobSource_status_enabled_idx'
  ) THEN
    CREATE INDEX "JobSource_status_enabled_idx" ON "JobSource"("status", "enabled");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'JobSource_sourceType_idx'
  ) THEN
    CREATE INDEX "JobSource_sourceType_idx" ON "JobSource"("sourceType");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'JobSourceRun_sourceId_createdAt_idx'
  ) THEN
    CREATE INDEX "JobSourceRun_sourceId_createdAt_idx" ON "JobSourceRun"("sourceId", "createdAt");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'JobSourceJob_fingerprint_idx'
  ) THEN
    CREATE INDEX "JobSourceJob_fingerprint_idx" ON "JobSourceJob"("fingerprint");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'JobSourceJob_status_idx'
  ) THEN
    CREATE INDEX "JobSourceJob_status_idx" ON "JobSourceJob"("status");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'JobSourceJob_sourceId_status_idx'
  ) THEN
    CREATE INDEX "JobSourceJob_sourceId_status_idx" ON "JobSourceJob"("sourceId", "status");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'JobSourceJob_sourceId_sourceJobId_key'
  ) THEN
    CREATE UNIQUE INDEX "JobSourceJob_sourceId_sourceJobId_key" ON "JobSourceJob"("sourceId", "sourceJobId");
  END IF;
END $$;

-- ============================================================
-- Foreign keys: create only if they do not exist
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'JobSourceRun_sourceId_fkey'
  ) THEN
    ALTER TABLE "JobSourceRun" ADD CONSTRAINT "JobSourceRun_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "JobSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'JobSourceJob_sourceId_fkey'
  ) THEN
    ALTER TABLE "JobSourceJob" ADD CONSTRAINT "JobSourceJob_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "JobSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'JobSourceJob_runId_fkey'
  ) THEN
    ALTER TABLE "JobSourceJob" ADD CONSTRAINT "JobSourceJob_runId_fkey" FOREIGN KEY ("runId") REFERENCES "JobSourceRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ============================================================
-- Second migration columns: add metadata columns if missing
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobSourceParserType') THEN
    CREATE TYPE "JobSourceParserType" AS ENUM ('GENERIC', 'GREENHOUSE', 'LEVER', 'ASHBY', 'SMARTRECRUITERS', 'ADZUNA', 'USAJOBS');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobSourceAuthType') THEN
    CREATE TYPE "JobSourceAuthType" AS ENUM ('NONE', 'API_KEY', 'OAUTH', 'BASIC');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JobSourceHealthStatus') THEN
    CREATE TYPE "JobSourceHealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'FAILING', 'DISABLED', 'NEVER_TESTED');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'JobSource' AND column_name = 'authenticationType'
  ) THEN
    ALTER TABLE "JobSource" ADD COLUMN "authenticationType" "JobSourceAuthType" DEFAULT 'NONE';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'JobSource' AND column_name = 'healthStatus'
  ) THEN
    ALTER TABLE "JobSource" ADD COLUMN "healthStatus" "JobSourceHealthStatus" NOT NULL DEFAULT 'NEVER_TESTED';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'JobSource' AND column_name = 'lastError'
  ) THEN
    ALTER TABLE "JobSource" ADD COLUMN "lastError" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'JobSource' AND column_name = 'parserType'
  ) THEN
    ALTER TABLE "JobSource" ADD COLUMN "parserType" "JobSourceParserType" DEFAULT 'GENERIC';
  END IF;
END $$;
