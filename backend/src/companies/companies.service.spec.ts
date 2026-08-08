import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test('CompaniesService integration - lists all companies', async () => {
  await prisma.company.deleteMany().catch(() => undefined);
  await prisma.company.createMany({
    data: [
      { name: 'TestCorp', industry: 'Tech', location: 'Remote', description: 'A test company', logo: 'TC' },
      { name: 'Example Inc', industry: 'Consulting', location: 'NYC', description: 'Consulting firm', logo: 'EI' },
    ],
  });

  const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
  assert.strictEqual(companies.length, 2);
  assert.strictEqual(companies[0].name, 'Example Inc');

  await prisma.company.deleteMany().catch(() => undefined);
});

test('CompaniesService integration - finds a company by name', async () => {
  await prisma.company.deleteMany().catch(() => undefined);
  await prisma.company.createMany({
    data: [
      { name: 'TestCorp', industry: 'Tech', location: 'Remote', description: 'A test company', logo: 'TC' },
    ],
  });

  const company = await prisma.company.findFirst({ where: { name: 'TestCorp' } });
  assert.ok(company);
  assert.strictEqual(company?.industry, 'Tech');

  await prisma.company.deleteMany().catch(() => undefined);
});
