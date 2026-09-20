import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { NetworkService } from './network.service';

type Row = Record<string, unknown>;

function matchWhere(row: Row, where: Row | undefined): boolean {
  if (!where) return true;
  if (Array.isArray(where.OR)) {
    return where.OR.some((w: Row) => matchWhere(row, w));
  }
  if (Array.isArray(where.AND)) {
    return where.AND.every((w: Row) => matchWhere(row, w));
  }
  return Object.entries(where).every(([key, cond]) => {
    if (key === 'OR' || key === 'AND') return true;
    if (cond && typeof cond === 'object' && 'in' in cond) {
      return (cond.in as unknown[]).includes(row[key]);
    }
    if (cond && typeof cond === 'object' && 'notIn' in cond) {
      return !(cond.notIn as unknown[]).includes(row[key]);
    }
    if (cond && typeof cond === 'object' && 'not' in cond && cond.not !== undefined) {
      if (cond.not && typeof cond.not === 'object' && 'in' in cond.not) {
        return !(cond.not.in as unknown[]).includes(row[key]);
      }
      return row[key] !== cond.not;
    }
    return row[key] === cond;
  });
}

function createMockPrisma() {
  const db: { user: Row[]; connection: Row[]; userFollow: Row[]; company: Row[]; companyFollow: Row[] } = { user: [], connection: [], userFollow: [], company: [], companyFollow: [] };

  const prisma = {
    user: {
      findMany: async ({ where, include }: { where?: Row; include?: Row }) => db.user.filter((r) => matchWhere(r, where)),
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) =>
        db.user.find((r) => (where.id !== undefined ? r.id === where.id : r.email === where.email)) ?? null,
    },
    connection: {
      findMany: async ({ where }: { where?: Row }) => db.connection.filter((r) => matchWhere(r, where)),
      findFirst: async ({ where }: { where?: Row }) => db.connection.find((r) => matchWhere(r, where)) ?? null,
      findUnique: async ({ where }: { where: Row }) => {
        const compound = where.requesterId_addresseeId as { requesterId?: string; addresseeId?: string } | undefined;
        if (compound) {
          return db.connection.find((r) => r.requesterId === compound.requesterId && r.addresseeId === compound.addresseeId) ?? null;
        }
        return db.connection.find((r) => r.id === where.id) ?? null;
      },
      create: async ({ data }: { data: Row }) => {
        const row = { id: `conn-${db.connection.length + 1}`, createdAt: new Date(), updatedAt: new Date(), ...data };
        db.connection.push(row);
        return row;
      },
      update: async ({ where, data }: { where: { id: string }; data: Row }) => {
        const row = db.connection.find((r) => r.id === where.id);
        if (!row) throw new Error('not found');
        Object.assign(row, data);
        return row;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = db.connection.findIndex((r) => r.id === where.id);
        return db.connection.splice(idx, 1)[0];
      },
    },
    userFollow: {
      findMany: async ({ where }: { where?: Row }) => db.userFollow.filter((r) => matchWhere(r, where)),
      create: async ({ data }: { data: Row }) => {
        const row = { id: `follow-${db.userFollow.length + 1}`, createdAt: new Date(), ...data };
        db.userFollow.push(row);
        return row;
      },
      upsert: async ({ where, create, update }: { where: Row; create: Row; update: Row }) => {
        const existing = db.userFollow.find((r) => r.followerId === where.followerId && r.followingId === where.followingId);
        if (existing) {
          Object.assign(existing, update);
          return existing;
        }
        const row = { id: `follow-${db.userFollow.length + 1}`, createdAt: new Date(), ...create };
        db.userFollow.push(row);
        return row;
      },
      deleteMany: async ({ where }: { where: Row }) => {
        const before = db.userFollow.length;
        db.userFollow = db.userFollow.filter((r) => !matchWhere(r, where));
        return { count: before - db.userFollow.length };
      },
    },
    company: {
      findMany: async ({ where, include }: { where?: Row; include?: Row }) => db.company.filter((r) => matchWhere(r, where)),
    },
    companyFollow: {
      findMany: async ({ where }: { where?: Row }) => db.companyFollow.filter((r) => matchWhere(r, where)),
    },
  };

  return { prisma, db };
}

const me = 'me-1';
const other = 'you-1';

function person(id: string, overrides: Row = {}): Row {
  return {
    id,
    email: `${id}@demo.gradhire.ai`,
    avatarUrl: null,
    role: 'STUDENT',
    profile: null,
    educations: [],
    experiences: [],
    ...overrides,
  };
}

const service = (prisma: unknown) => new NetworkService(prisma as never, { invalidate: async () => undefined } as never);

test('suggested excludes self, connected people, and pending people', async () => {
  const { prisma, db } = createMockPrisma();
  const connected = person('conn-1', { profile: { name: 'Connected Person', focus: 'Engineer', skills: ['React'] } });
  const pending = person('pend-1', { profile: { name: 'Pending Person', focus: 'Engineer' } });
  const fresh = person('fresh-1', { profile: { name: 'Fresh Person', focus: 'Designer', skills: ['Figma'] } });
  db.user.push(person(me), connected, pending, fresh);
  db.connection.push({ id: 'c1', requesterId: me, addresseeId: 'conn-1', status: 'ACCEPTED' });
  db.connection.push({ id: 'c2', requesterId: 'pend-1', addresseeId: me, status: 'PENDING' });

  const result = await service(prisma).suggested(me, 10);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'fresh-1');
  assert.equal(result[0].relation, 'NONE');
});

test('search matches by name substring and excludes me', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(person(me), person('alex-chen', { profile: { name: 'Alex Chen', focus: 'UX Designer', skills: ['Figma'] } }), person('brandon-park', { profile: { name: 'Brandon Park', focus: 'Engineer' } }));
  const result = await service(prisma).search(me, 'alex');

  assert.equal(result.length, 1);
  assert.equal(result[0].name, 'Alex Chen');
});

test('suggested excludes people with PRIVATE profiles', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(
    person(me, { profile: { name: 'Me', focus: 'Engineer', skills: ['React'] } }),
    person('private-1', { profile: { name: 'Hidden', focus: 'Engineer', skills: ['React'], visibility: 'PRIVATE' } }),
    person('visible-1', { profile: { name: 'Visible', focus: 'Engineer', skills: ['React'], visibility: 'PUBLIC' } }),
    person('employers-1', { profile: { name: 'EmployerOnly', focus: 'Engineer', skills: ['React'], visibility: 'EMPLOYERS_ONLY' } }),
  );

  const result = await service(prisma).suggested(me, 10);

  const ids = result.map((p) => p.id);
  assert.equal(ids.includes('private-1'), false, 'PRIVATE profiles must not be suggested');
  assert.equal(ids.includes('visible-1'), true);
  assert.equal(ids.includes('employers-1'), true);
});

test('search excludes people with PRIVATE profiles', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(
    person(me, { profile: { name: 'Me', focus: 'Engineer', skills: ['React'] } }),
    person('private-1', { profile: { name: 'Sarah Hidden', focus: 'Engineer', skills: ['React'], visibility: 'PRIVATE' } }),
    person('visible-1', { profile: { name: 'Sarah Public', focus: 'Engineer', skills: ['React'], visibility: 'PUBLIC' } }),
  );

  const result = await service(prisma).search(me, 'sarah');

  const ids = result.map((p) => p.id);
  assert.equal(ids.includes('private-1'), false, 'PRIVATE profiles must not be searchable');
  assert.equal(ids.includes('visible-1'), true);
});

test('suggested ranks shared-skill matches above unrelated people', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(
    person(me, { profile: { name: 'Me', focus: 'Engineer', skills: ['React', 'TypeScript'] } }),
    person('unrelated', { profile: { name: 'Unrelated', focus: 'Designer', skills: ['Figma'] } }),
    person('alike', { profile: { name: 'Alike', focus: 'Engineer', skills: ['React', 'GraphQL'] } }),
  );
  const result = await service(prisma).suggested(me, 10);

  assert.deepEqual(result.map((p) => p.id), ['alike', 'unrelated']);
});

test('connect auto-accepts when the target already requested me', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(person(me), person(other));
  db.connection.push({ id: 'req1', requesterId: other, addresseeId: me, status: 'PENDING' });

  await service(prisma).connect(me, other);

  assert.equal(db.connection.find((c) => c.id === 'req1')?.status, 'ACCEPTED');
  assert.equal(db.connection.length, 1);
});

test('accept only works on a pending request addressed to me', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(person(me), person(other));
  db.connection.push({ id: 'req1', requesterId: other, addresseeId: me, status: 'PENDING' });

  await service(prisma).accept(me, 'req1');

  assert.equal(db.connection.find((c) => c.id === 'req1')?.status, 'ACCEPTED');
  await assert.rejects(() => service(prisma).accept(other, 'req1'), /Forbidden|forbidden/i);
});

test('decline deletes the incoming request', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(person(me), person(other));
  db.connection.push({ id: 'req1', requesterId: other, addresseeId: me, status: 'PENDING' });

  await service(prisma).decline(me, 'req1');

  assert.equal(db.connection.find((c) => c.id === 'req1'), undefined);
});

test('removeConnection cancels my outgoing pending request', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(person(me), person(other));
  db.connection.push({ id: 'out1', requesterId: me, addresseeId: other, status: 'PENDING' });

  await service(prisma).removeConnection(me, other);

  assert.equal(db.connection.find((c) => c.id === 'out1'), undefined);
});

test('follow and unfollow toggle the userFollow row', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(person(me), person(other));

  await service(prisma).follow(me, other);
  assert.equal(db.userFollow.some((f) => f.followerId === me && f.followingId === other), true);

  await service(prisma).unfollow(me, other);
  assert.equal(db.userFollow.some((f) => f.followerId === me && f.followingId === other), false);
});

test('sidebar returns people, companies not yet followed, and popular skills', async () => {
  const { prisma, db } = createMockPrisma();
  db.user.push(
    person(me, { profile: { name: 'Me', focus: 'Engineer', skills: ['React'] } }),
    person('peer-1', { profile: { name: 'Peer One', focus: 'Engineer', skills: ['React', 'Node'] } }),
    person('peer-2', { profile: { name: 'Peer Two', focus: 'Engineer', skills: ['React', 'GraphQL'] } }),
  );
  db.connection.push({ id: 'c1', requesterId: me, addresseeId: 'peer-1', status: 'ACCEPTED' });
  db.company.push({ id: 'co-1', name: 'Acme', industry: 'Tech', logo: null });
  db.company.push({ id: 'co-2', name: 'Globex', industry: 'Finance', logo: null });
  db.companyFollow.push({ id: 'cf-1', userId: me, companyId: 'co-2' });

  const result = await service(prisma).sidebar(me);

  assert.ok(Array.isArray(result.peopleYouMayKnow));
  assert.ok(Object.keys(result).includes('companiesToFollow'));
  assert.equal(result.companiesToFollow.length, 1);
  assert.equal(result.companiesToFollow[0].id, 'co-1');
  assert.ok(result.popularSkills.includes('React'));
});