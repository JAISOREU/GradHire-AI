import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEMO_PASSWORD = 'DemoPassword123!';

async function hashPassword(): Promise<string> {
  return bcrypt.hash(DEMO_PASSWORD, 12);
}

async function main() {
  const passwordHash = await hashPassword();

  const employer = await prisma.user.upsert({
    where: { email: 'employer@demo.gradhire.ai' },
    update: {},
    create: {
      email: 'employer@demo.gradhire.ai',
      passwordHash,
      role: 'EMPLOYER',
      employerProfile: {
        create: {
          companyName: 'Acme Corp',
          industry: 'Technology',
          location: 'San Francisco, CA',
          description: 'Demo employer account',
        },
      },
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@demo.gradhire.ai' },
    update: {},
    create: {
      email: 'student@demo.gradhire.ai',
      passwordHash,
      role: 'STUDENT',
      profile: {
        create: {
          name: 'Demo Student',
          focus: 'Software engineering',
          summary: 'Demo student account',
          skills: ['TypeScript', 'React', 'Node.js'],
        },
      },
    },
  });

  const company = await prisma.company.upsert({
    where: { name: 'Acme Corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      industry: 'Technology',
      location: 'San Francisco, CA',
      description: 'Demo company',
    },
  });

  const job = await prisma.job.upsert({
    where: { id: 'seed-job-1' },
    update: {},
    create: {
      id: 'seed-job-1',
      employerId: employer.id,
      companyId: company.id,
      title: 'Junior Software Engineer',
      company: 'Acme Corp',
      location: 'San Francisco, CA',
      type: 'HIRING',
      experienceLevel: 'ENTRY_LEVEL',
      workplaceType: 'ONSITE',
      description: 'Build awesome products.',
      responsibilities: 'Develop and maintain web applications.',
      requiredQualifications: 'Bachelor degree in Computer Science or related field.',
      requiredSkills: ['TypeScript', 'React', 'Node.js'],
      status: 'PUBLISHED',
    },
  });

  console.log('Seed complete:', { employer: employer.email, student: student.email, job: job.title, demoPassword: DEMO_PASSWORD });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
