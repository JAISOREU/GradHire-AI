const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  console.log('DB CONNECTED');
  const jobCount = await prisma.job.count();
  console.log('job count:', jobCount);
  const userCount = await prisma.user.count();
  console.log('user count:', userCount);
}

main()
  .catch((e) => {
    console.error('ERR', e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

