const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function run() {
  const alters = [
    `ALTER TABLE "Job" ALTER COLUMN "type" TYPE "JobType" USING "type"::"JobType"`,
    `ALTER TABLE "Job" ALTER COLUMN "experienceLevel" TYPE "ExperienceLevel" USING "experienceLevel"::"ExperienceLevel"`,
    `ALTER TABLE "Job" ALTER COLUMN "workplaceType" TYPE "WorkplaceType" USING "workplaceType"::"WorkplaceType"`,
    `ALTER TABLE "Job" ALTER COLUMN "remoteScope" TYPE "RemoteScope" USING "remoteScope"::"RemoteScope"`,
    `ALTER TABLE "Job" ALTER COLUMN "salaryType" TYPE "SalaryType" USING "salaryType"::"SalaryType"`,
    `ALTER TABLE "Job" ALTER COLUMN "payFrequency" TYPE "PayFrequency" USING "payFrequency"::"PayFrequency"`,
    `ALTER TABLE "Job" ALTER COLUMN "status" TYPE "JobStatus" USING "status"::"JobStatus"`,
    `ALTER TABLE "Application" ALTER COLUMN "status" TYPE "ApplicationStatus" USING "status"::"ApplicationStatus"`,
    `ALTER TABLE "Application" ALTER COLUMN "source" TYPE "ApplicationSource" USING "source"::"ApplicationSource"`,
    `ALTER TABLE "Interview" ALTER COLUMN "type" TYPE "InterviewType" USING "type"::"InterviewType"`,
    `ALTER TABLE "Interview" ALTER COLUMN "status" TYPE "InterviewStatus" USING "status"::"InterviewStatus"`,
    `ALTER TABLE "ScreeningQuestion" ALTER COLUMN "type" TYPE "QuestionType" USING "type"::"QuestionType"`,
    `ALTER TABLE "JobRequirement" ALTER COLUMN "type" TYPE "RequirementType" USING "type"::"RequirementType"`,
  ];

  for (const sql of alters) {
    try {
      await p.$executeRawUnsafe(sql);
      console.log('OK:', sql.substring(0, 80));
    } catch (e) {
      console.error('ERR:', sql.substring(0, 80), e.message);
    }
  }
  
  console.log('Done');
  await p.$disconnect();
}

run();
