-- CreateEnum
CREATE TYPE "JobSourceParserType" AS ENUM ('GENERIC', 'GREENHOUSE', 'LEVER', 'ASHBY', 'SMARTRECRUITERS', 'ADZUNA', 'USAJOBS');

-- CreateEnum
CREATE TYPE "JobSourceAuthType" AS ENUM ('NONE', 'API_KEY', 'OAUTH', 'BASIC');

-- CreateEnum
CREATE TYPE "JobSourceHealthStatus" AS ENUM ('HEALTHY', 'DEGRADED', 'FAILING', 'DISABLED', 'NEVER_TESTED');

-- AlterTable
ALTER TABLE "JobSource" ADD COLUMN     "authenticationType" "JobSourceAuthType" DEFAULT 'NONE',
ADD COLUMN     "healthStatus" "JobSourceHealthStatus" NOT NULL DEFAULT 'NEVER_TESTED',
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "parserType" "JobSourceParserType" DEFAULT 'GENERIC';
