import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { FeedService } from './feed.service';

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
    return row[key] === cond;
  });
}

function createMockPrisma() {
  const db: {
    userFollow: Row[];
    feedPost: Row[];
    feedPostLike: Row[];
    feedPostComment: Row[];
  } = { userFollow: [], feedPost: [], feedPostLike: [], feedPostComment: [] };

  function hydratePost(row: Row): void {
    row.author = {
      id: row.authorId,
      email: `${String(row.authorId)}@demo.gradhire.ai`,
      avatarUrl: null,
      role: 'STUDENT',
      profile: { name: 'Some Author', focus: 'Software engineering' },
      employerProfile: null,
    };
    row.job = row.jobId
      ? { id: row.jobId, title: 'Junior Software Engineer', company: 'Acme Corp', city: 'San Francisco', country: 'USA' }
      : null;
    row.createdAt = new Date(row.createdAt as string | number);
    row._count = {
      likes: db.feedPostLike.filter((l) => l.postId === row.id).length,
      comments: db.feedPostComment.filter((c) => c.postId === row.id).length,
    };
  }

  const prisma = {
    userFollow: {
      findMany: async ({ where }: { where?: Row }) => db.userFollow.filter((r) => matchWhere(r, where)),
    },
    feedPost: {
      findMany: async ({ where, orderBy }: { where?: Row; orderBy?: Row }) => {
        const authorIds = ((where as Row | undefined)?.authorId as { in?: string[] } | undefined)?.in ?? [];
        const rows = db.feedPost.filter((r) => authorIds.length === 0 || authorIds.includes(String(r.authorId))).slice();
        if (orderBy && Object.values(orderBy as Record<string, string>)[0] === 'desc') {
          rows.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        }
        for (const r of rows) hydratePost(r);
        return rows;
      },
      findUnique: async ({ where }: { where: { id?: string } }) => {
        if (!where.id) return null;
        const row = db.feedPost.find((r) => r.id === where.id) ?? null;
        if (row) hydratePost(row);
        return row;
      },
      create: async ({ data }: { data: Row }) => {
        const row: Row = { id: `post-${db.feedPost.length + 1}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), likes: [], comments: [], ...data };
        db.feedPost.push(row);
        hydratePost(row);
        return row;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = db.feedPost.findIndex((r) => r.id === where.id);
        return db.feedPost.splice(idx, 1)[0];
      },
    },
    feedPostLike: {
      findUnique: async ({ where }: { where: Row }) => {
        const compound = where.postId_userId as { postId?: string; userId?: string } | undefined;
        if (compound) {
          return db.feedPostLike.find((r) => r.postId === compound.postId && r.userId === compound.userId) ?? null;
        }
        return db.feedPostLike.find((r) => r.id === where.id) ?? null;
      },
      findMany: async ({ where }: { where?: Row }) => db.feedPostLike.filter((r) => matchWhere(r, where)),
      create: async ({ data }: { data: Row }) => {
        const row: Row = { id: `like-${db.feedPostLike.length + 1}`, createdAt: new Date().toISOString(), ...data };
        db.feedPostLike.push(row);
        return row;
      },
      delete: async ({ where }: { where: { id: string } }) => {
        const idx = db.feedPostLike.findIndex((r) => r.id === where.id);
        return db.feedPostLike.splice(idx, 1)[0];
      },
    },
    feedPostComment: {
      findMany: async ({ where, include }: { where?: Row; include?: Row }) => {
        const rows = db.feedPostComment.filter((r) => matchWhere(r, where));
        for (const r of rows) {
          r.createdAt = new Date(r.createdAt as string | number);
          if (include) r.author = { id: r.authorId, email: `${r.authorId}@demo.gradhire.ai`, avatarUrl: null, role: 'STUDENT', profile: { name: 'Some Author' }, employerProfile: null };
        }
        return rows;
      },
      create: async ({ data }: { data: Row }) => {
        const row: Row = { id: `comment-${db.feedPostComment.length + 1}`, createdAt: new Date().toISOString(), ...data };
        db.feedPostComment.push(row);
        return row;
      },
    },
  };

  return { prisma, db };
}

const me = 'me-1';

const user = (id: string, role = 'STUDENT') => ({ id, email: `${id}@demo.gradhire.ai`, role });

const service = (prisma: unknown) => new FeedService(prisma as never, { invalidate: async () => undefined } as never);

test('getFeed returns own posts and posts from followed users, newest first', async () => {
  const { prisma, db } = createMockPrisma();
  db.userFollow.push({ id: 'f1', followerId: me, followingId: 'peer-1' });
  db.feedPost.push({ id: 'p-old', authorId: 'peer-1', content: 'Older post', createdAt: '2026-01-02T00:00:00.000Z' });
  db.feedPost.push({ id: 'p-new', authorId: me, content: 'My newest post', createdAt: '2026-01-05T00:00:00.000Z' });
  db.feedPost.push({ id: 'p-stranger', authorId: 'stranger-1', content: 'Not followed', createdAt: '2026-01-06T00:00:00.000Z' });

  const result = await service(prisma).getFeed(user(me));

  assert.deepEqual(result.map((p) => p.id), ['p-new', 'p-old']);
});

test('getFeed enriches posts with author, counts, and likedByMe', async () => {
  const { prisma, db } = createMockPrisma();
  db.userFollow.push({ id: 'f1', followerId: me, followingId: 'amara' });
  db.feedPost.push({ id: 'p1', authorId: 'amara', content: 'Graduate roles are open', jobId: 'seed-job-1', likes: [], comments: [], createdAt: '2026-01-01T00:00:00.000Z' });
  db.feedPostLike.push({ id: 'l1', postId: 'p1', userId: me });

  const result = await service(prisma).getFeed(user(me));

  assert.equal(result.length, 1);
  const post = result[0];
  assert.equal(post.author.name, 'Some Author');
  assert.equal(post.likes, 1);
  assert.equal(post.comments, 0);
  assert.equal(post.likedByMe, true);
  assert.equal(post.job?.title, 'Junior Software Engineer');
});

test('createPost creates a post for the author with content and optional image', async () => {
  const { prisma, db } = createMockPrisma();

  const created = await service(prisma).createPost(user(me), { content: 'Hello Gradture', imageUrl: 'https://example.com/a.png' });

  assert.equal(created.author.id, me);
  assert.equal(created.content, 'Hello Gradture');
  assert.equal(created.image, 'https://example.com/a.png');
  assert.equal(db.feedPost.length, 1);
});

test('createPost rejects empty content', async () => {
  const { prisma } = createMockPrisma();

  await assert.rejects(() => service(prisma).createPost(user(me), { content: '   ' }), /content/i);
});

test('toggleLike adds a like when none exists and removes it when it does', async () => {
  const { prisma, db } = createMockPrisma();
  db.feedPost.push({ id: 'p1', authorId: 'peer-1', content: 'Post', likes: [], comments: [], createdAt: '2026-01-01T00:00:00.000Z' });

  const svc = service(prisma);

  const liked = await svc.toggleLike(user(me), 'p1');
  assert.equal(liked.likedByMe, true);
  assert.equal(liked.likes, 1);
  assert.equal(db.feedPostLike.length, 1);

  const unliked = await svc.toggleLike(user(me), 'p1');
  assert.equal(unliked.likedByMe, false);
  assert.equal(unliked.likes, 0);
  assert.equal(db.feedPostLike.length, 0);
});

test('toggleLike throws NotFound for a missing post', async () => {
  const { prisma } = createMockPrisma();

  await assert.rejects(() => service(prisma).toggleLike(user(me), 'missing'), /found/i);
});

test('deletePost only allows the author or an admin', async () => {
  const { prisma, db } = createMockPrisma();
  db.feedPost.push({ id: 'p1', authorId: me, content: 'Mine', likes: [], comments: [], createdAt: '2026-01-01T00:00:00.000Z' });
  db.feedPost.push({ id: 'p2', authorId: 'peer-1', content: 'Theirs', likes: [], comments: [], createdAt: '2026-01-01T00:00:00.000Z' });

  await assert.rejects(() => service(prisma).deletePost(user('other-1'), 'p1'), /Forbidden|forbidden/i);
  assert.equal(db.feedPost.some((p) => p.id === 'p1'), true);

  await service(prisma).deletePost(user(me), 'p1');
  assert.equal(db.feedPost.some((p) => p.id === 'p1'), false);

  await service(prisma).deletePost(user('admin-1', 'ADMIN'), 'p2');
  assert.equal(db.feedPost.some((p) => p.id === 'p2'), false);
});

test('addComment adds a comment and returns the updated post counts', async () => {
  const { prisma, db } = createMockPrisma();
  db.feedPost.push({ id: 'p1', authorId: 'peer-1', content: 'Post', likes: [], comments: [], createdAt: '2026-01-01T00:00:00.000Z' });

  const updated = await service(prisma).addComment(user(me), 'p1', 'Nice work!');

  assert.equal(updated.comments, 1);
  assert.equal(db.feedPostComment.length, 1);
  assert.equal(db.feedPostComment[0].content, 'Nice work!');
});

test('addComment throws NotFound for a missing post', async () => {
  const { prisma } = createMockPrisma();

  await assert.rejects(() => service(prisma).addComment(user(me), 'missing', 'hello'), /found/i);
});

test('getComments lists comments with author info', async () => {
  const { prisma, db } = createMockPrisma();
  db.feedPost.push({ id: 'p1', authorId: 'peer-1', content: 'Post', likes: [], comments: [], createdAt: '2026-01-01T00:00:00.000Z' });
  db.feedPostComment.push({ id: 'c1', postId: 'p1', authorId: 'peer-2', content: 'Thanks!', createdAt: '2026-01-02T00:00:00.000Z' });

  const comments = await service(prisma).getComments(user(me), 'p1');

  assert.equal(comments.length, 1);
  assert.equal(comments[0].content, 'Thanks!');
  assert.equal(comments[0].author.name, 'Some Author');
});