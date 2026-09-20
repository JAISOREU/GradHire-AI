import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { CompaniesService } from './companies.service';

const prisma = new PrismaClient();
const service = new CompaniesService(prisma);

const RUN_ID = `disc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function createUser(email: string) {
  return prisma.user.create({
    data: { email, passwordHash: 'test-hash', role: 'STUDENT' },
  });
}

async function createCompany(name: string, data: { industry?: string; location?: string; size?: string | null } = {}) {
  return prisma.company.create({
    data: { name, industry: data.industry ?? 'Technology', location: data.location ?? 'Remote', size: data.size ?? null, ...data },
  });
}

async function createJob(companyId: string, data: { title: string; workplaceType: 'REMOTE' | 'HYBRID' | 'ONSITE'; requiredSkills: string[]; status: 'PUBLISHED' | 'DRAFT' }) {
  const user = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
  return prisma.job.create({
    data: {
      employerId: user!.id,
      companyId,
      title: data.title,
      company: 'TestCo',
      workplaceType: data.workplaceType,
      requiredSkills: data.requiredSkills,
      status: data.status,
      description: 'Test role',
      responsibilities: 'Handle the work.',
      requiredQualifications: 'Relevant degree.',
    },
  });
}

test('CompaniesService.findAll - enriches companies with counts, size, and remote availability', async () => {
  const su = await createUser(`${RUN_ID}-owner@test.dev`);
  const hiringRemote = await createCompany(`${RUN_ID} Remote Co`, { industry: 'Technology', location: 'Remote', size: '51-200' });
  const quiet = await createCompany(`${RUN_ID} Quiet Co`, { industry: 'Finance', location: 'New York, NY', size: null });
  await prisma.companyFollow.create({ data: { userId: su.id, companyId: hiringRemote.id } });
  await createJob(hiringRemote.id, { title: 'Engineer', workplaceType: 'REMOTE', requiredSkills: ['React'], status: 'PUBLISHED' });

  const result = await service.findAll({ page: 1, limit: 20 }, {});

  const remote = result.items.find((c) => c.name === `${RUN_ID} Remote Co`);
  const noJobs = result.items.find((c) => c.name === `${RUN_ID} Quiet Co`);
  assert.ok(remote, 'company with jobs should be in the list');
  assert.equal(remote.openPositions, 1);
  assert.equal(remote.followerCount, 1);
  assert.equal(remote.size, '51-200');
  assert.equal(remote.remoteAvailable, true);
  assert.ok(noJobs, 'company without jobs should be in the list');
  assert.equal(noJobs.openPositions, 0);
  assert.equal(noJobs.followerCount, 0);
  assert.equal(noJobs.remoteAvailable, false);

  await prisma.companyFollow.deleteMany({ where: { userId: su.id } });
  await prisma.company.deleteMany({ where: { name: { startsWith: RUN_ID } } });
  await prisma.user.deleteMany({ where: { email: `${RUN_ID}-owner@test.dev` } });
});

test('CompaniesService.findAll - exposes industry and location facets', async () => {
  // Self-seeded so the facets do not depend on leftover data from earlier tests.
  await createCompany(`${RUN_ID} Facets Co`, { industry: 'Technology', location: 'Facet City' });

  const result = await service.findAll({ page: 1, limit: 3 }, {});

  assert.ok(Array.isArray(result.facets.industries));
  assert.ok(Array.isArray(result.facets.locations));
  assert.ok(result.facets.industries.includes('Technology'), 'expected seeded Technology industry in facets');
  assert.ok(result.facets.locations.includes('Facet City'), 'expected seeded location in facets');

  await prisma.company.deleteMany({ where: { name: { startsWith: RUN_ID } } });
});

test('CompaniesService.findAll - filters by search, industry, location, size, hiring, and remote', async () => {
  const tech = await createCompany(`${RUN_ID} Filtered Tech`, { industry: 'Technology', location: 'Austin, TX', size: '1-50' });
  const fin = await createCompany(`${RUN_ID} Filtered Fin`, { industry: 'Finance', location: 'Chicago, IL', size: '501-1000' });
  await createJob(tech.id, { title: 'Dev', workplaceType: 'ONSITE', requiredSkills: ['Go'], status: 'PUBLISHED' });

  const byName = await service.findAll({ page: 1, limit: 20 }, { search: 'filtered tech' });
  assert.ok(byName.items.some((c) => c.name === `${RUN_ID} Filtered Tech`));
  assert.ok(!byName.items.some((c) => c.name === `${RUN_ID} Filtered Fin`));

  const byIndustry = await service.findAll({ page: 1, limit: 20 }, { industry: 'finance' });
  assert.ok(byIndustry.items.some((c) => c.name === `${RUN_ID} Filtered Fin`));
  assert.ok(!byIndustry.items.some((c) => c.name === `${RUN_ID} Filtered Tech`));

  const byLocation = await service.findAll({ page: 1, limit: 20 }, { location: 'austin' });
  assert.ok(byLocation.items.some((c) => c.name === `${RUN_ID} Filtered Tech`));

  const bySize = await service.findAll({ page: 1, limit: 20 }, { size: '501-1000' });
  assert.ok(bySize.items.some((c) => c.name === `${RUN_ID} Filtered Fin`));

  const hiring = await service.findAll({ page: 1, limit: 20 }, { hiring: true });
  assert.ok(hiring.items.some((c) => c.name === `${RUN_ID} Filtered Tech`));
  assert.ok(!hiring.items.some((c) => c.name === `${RUN_ID} Filtered Fin`));

  const remote = await service.findAll({ page: 1, limit: 20 }, { remote: true });
  assert.ok(!remote.items.some((c) => c.name === `${RUN_ID} Filtered Tech`));

  await prisma.company.deleteMany({ where: { name: { startsWith: RUN_ID } } });
});

test('CompaniesService.hiringForSkills - counts companies per skill from published jobs', async () => {
  const su = await createUser(`${RUN_ID}-skills@test.dev`);
  await prisma.profile.create({
    data: { userId: su.id, name: 'Skill Tester', focus: 'Engineering', skills: ['React', 'Docker'] },
  });
  const reactCo = await createCompany(`${RUN_ID} React Hosts`, { industry: 'Technology', location: 'Remote' });
  const dockerCo = await createCompany(`${RUN_ID} Docker Hosts`, { industry: 'Technology', location: 'Remote' });
  const draftCo = await createCompany(`${RUN_ID} Draft Only`, { industry: 'Technology', location: 'Remote' });
  await createJob(reactCo.id, { title: 'FE', workplaceType: 'REMOTE', requiredSkills: ['React', 'TypeScript'], status: 'PUBLISHED' });
  await createJob(dockerCo.id, { title: 'Ops', workplaceType: 'REMOTE', requiredSkills: ['React'], status: 'DRAFT' });
  await createJob(dockerCo.id, { title: 'Ops', workplaceType: 'REMOTE', requiredSkills: ['Docker'], status: 'PUBLISHED' });

  const result = await service.hiringForSkills(su.id);

  assert.ok(Array.isArray(result));
  const react = result.find((r) => r.skill === 'React');
  const docker = result.find((r) => r.skill === 'Docker');
  assert.ok(react, 'React should appear in the sidebar response');
  assert.equal(react.companies, 1, 'draft jobs must not inflate the company count');
  assert.ok(docker, 'Docker should appear in the sidebar response');
  assert.equal(docker.companies, 1);

  await prisma.profile.deleteMany({ where: { userId: su.id } });
  await prisma.company.deleteMany({ where: { name: { startsWith: RUN_ID } } });
  await prisma.user.deleteMany({ where: { email: `${RUN_ID}-skills@test.dev` } });
});

test('CompaniesService.hiringForSkills - returns an empty list for a profile without skills', async () => {
  const su = await createUser(`${RUN_ID}-noskills@test.dev`);
  await prisma.profile.create({
    data: { userId: su.id, name: 'No Skills', focus: 'Engineering', skills: [] },
  });

  const result = await service.hiringForSkills(su.id);
  assert.deepEqual(result, []);

  await prisma.profile.deleteMany({ where: { userId: su.id } });
  await prisma.user.deleteMany({ where: { email: `${RUN_ID}-noskills@test.dev` } });
});