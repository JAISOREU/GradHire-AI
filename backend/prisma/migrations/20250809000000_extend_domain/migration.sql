-- Extend Gradture AI domain model for full recruitment platform
-- Generated from Prisma schema diff

-- ============================================================
-- Job table extensions
-- ============================================================

ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "department" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "experienceLevel" TEXT NOT NULL DEFAULT 'ENTRY_LEVEL';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "positions" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "responsibilities" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "requiredQualifications" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "preferredQualifications" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "requiredSkills" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "preferredSkills" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "applicationDeadline" TIMESTAMP;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "hiringTargetDate" TIMESTAMP;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "views" INTEGER NOT NULL DEFAULT 0;

-- Work arrangement
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "workplaceType" TEXT NOT NULL DEFAULT 'REMOTE';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "remoteScope" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "remoteCountries" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "remoteRegions" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "remoteCities" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "requiredTimezone" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "timezoneOverlap" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "expectedOfficeAttendance" TEXT;

-- Location
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "region" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "timezone" TEXT;

-- Work schedule
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "workScheduleType" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "workingDays" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "startTime" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "endTime" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "flexibleHours" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "requiredOverlapHours" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "nightShift" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "weekendWork" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "onCallRequired" BOOLEAN NOT NULL DEFAULT false;

-- Compensation
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "salaryType" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'PHP';
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "payFrequency" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "negotiable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "salaryUndisclosed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "bonus" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "commission" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "equity" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "overtime" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "otherCompensation" TEXT;

-- Fresh graduate support
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "acceptsFreshGraduates" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "acceptsStudents" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "requiredGraduationYear" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "degreeRequired" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "fieldOfStudyRequired" TEXT;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "noExperienceRequired" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "internshipAccepted" BOOLEAN NOT NULL DEFAULT true;

-- Application settings
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "applicantCountVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Job" ADD COLUMN IF NOT EXISTS "autoCloseAfterDeadline" BOOLEAN NOT NULL DEFAULT true;

-- ============================================================
-- Application table extensions
-- ============================================================

ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'DIRECT';
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "coverLetter" TEXT;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "resumeVersionId" TEXT;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "resumeSnapshot" TEXT;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "answersSnapshot" JSONB;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "documentsSnapshot" JSONB;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "viewedAt" TIMESTAMP;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "lastStatusChangeAt" TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "withdrawnAt" TIMESTAMP;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP;
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "hiredAt" TIMESTAMP;

-- ============================================================
-- New tables
-- ============================================================

CREATE TABLE IF NOT EXISTS "JobLocation" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "region" TEXT,
  "city" TEXT NOT NULL,
  "postalCode" TEXT,
  "address" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "timezone" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "JobLocation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JobSkill" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "required" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JobBenefit" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "custom" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "JobBenefit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JobRequirement" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "JobRequirement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ScreeningQuestion" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "options" TEXT[] NOT NULL DEFAULT '{}',
  "required" BOOLEAN NOT NULL DEFAULT false,
  "knockout" BOOLEAN NOT NULL DEFAULT false,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "ScreeningQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationStatusHistory" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "previousStatus" TEXT,
  "newStatus" TEXT NOT NULL,
  "actorId" TEXT,
  "actorRole" TEXT,
  "message" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "ApplicationStatusHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationEvent" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "actorId" TEXT,
  "actorRole" TEXT,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "ApplicationEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationDocument" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "size" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "ApplicationDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ApplicationAnswer" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "questionId" TEXT,
  "documentId" TEXT,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "ApplicationAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Interview" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "scheduledAt" TIMESTAMP NOT NULL,
  "durationMinutes" INTEGER NOT NULL DEFAULT 60,
  "endTime" TIMESTAMP,
  "timezone" TEXT,
  "location" TEXT,
  "meetingLink" TEXT,
  "interviewers" TEXT[] NOT NULL DEFAULT '{}',
  "notes" TEXT,
  "feedback" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JobAnalytics" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL UNIQUE,
  "totalApplicants" INTEGER NOT NULL DEFAULT 0,
  "newApplicants" INTEGER NOT NULL DEFAULT 0,
  "awaitingReview" INTEGER NOT NULL DEFAULT 0,
  "shortlisted" INTEGER NOT NULL DEFAULT 0,
  "interviewing" INTEGER NOT NULL DEFAULT 0,
  "offers" INTEGER NOT NULL DEFAULT 0,
  "hired" INTEGER NOT NULL DEFAULT 0,
  "rejected" INTEGER NOT NULL DEFAULT 0,
  "withdrawn" INTEGER NOT NULL DEFAULT 0,
  "avgTimeToReview" INTEGER,
  "avgTimeToHire" INTEGER,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "JobAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JobView" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "userId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "JobView_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmployerProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL UNIQUE,
  "companyName" TEXT NOT NULL,
  "industry" TEXT,
  "website" TEXT,
  "phone" TEXT,
  "description" TEXT,
  "logo" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT "EmployerProfile_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS "Job_employerId_status_idx" ON "Job"("employerId", "status");
CREATE INDEX IF NOT EXISTS "Job_status_createdAt_idx" ON "Job"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "Application_studentId_status_idx" ON "Application"("studentId", "status");
CREATE INDEX IF NOT EXISTS "Application_jobId_status_idx" ON "Application"("jobId", "status");
CREATE INDEX IF NOT EXISTS "JobSkill_jobId_idx" ON "JobSkill"("jobId");
CREATE INDEX IF NOT EXISTS "JobBenefit_jobId_idx" ON "JobBenefit"("jobId");
CREATE INDEX IF NOT EXISTS "JobRequirement_jobId_idx" ON "JobRequirement"("jobId");
CREATE INDEX IF NOT EXISTS "ScreeningQuestion_jobId_idx" ON "ScreeningQuestion"("jobId");
CREATE INDEX IF NOT EXISTS "ApplicationStatusHistory_applicationId_createdAt_idx" ON "ApplicationStatusHistory"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicationEvent_applicationId_createdAt_idx" ON "ApplicationEvent"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "ApplicationDocument_applicationId_idx" ON "ApplicationDocument"("applicationId");
CREATE INDEX IF NOT EXISTS "ApplicationAnswer_applicationId_idx" ON "ApplicationAnswer"("applicationId");
CREATE INDEX IF NOT EXISTS "Interview_applicationId_idx" ON "Interview"("applicationId");
CREATE INDEX IF NOT EXISTS "JobView_jobId_createdAt_idx" ON "JobView"("jobId", "createdAt");

-- ============================================================
-- Foreign keys
-- ============================================================

ALTER TABLE "JobLocation" ADD CONSTRAINT "JobLocation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobBenefit" ADD CONSTRAINT "JobBenefit_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobRequirement" ADD CONSTRAINT "JobRequirement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScreeningQuestion" ADD CONSTRAINT "ScreeningQuestion_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationStatusHistory" ADD CONSTRAINT "ApplicationStatusHistory_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationEvent" ADD CONSTRAINT "ApplicationEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationDocument" ADD CONSTRAINT "ApplicationDocument_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApplicationAnswer" ADD CONSTRAINT "ApplicationAnswer_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobAnalytics" ADD CONSTRAINT "JobAnalytics_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobView" ADD CONSTRAINT "JobView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
