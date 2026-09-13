import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFeedService } from './feedService';
import { SEED_POSTS } from './feedSeed';

const AUTHOR = { id: 'me-1', name: 'Jireh Cruz', title: 'Graduate · Computer Science' };

describe('createFeedService', () => {
  beforeEach(() => localStorage.clear());

  it('returns seeded posts sorted newest first', async () => {
    const feed = createFeedService();
    const posts = await feed.getFeed();
    expect(posts.length).toBeGreaterThanOrEqual(SEED_POSTS.length);
    expect(posts[0].createdAt >= posts[1].createdAt).toBe(true);
  });

  it('createPost prepends a new post', async () => {
    const feed = createFeedService();
    const created = await feed.createPost({ content: 'Hello Gradture', author: AUTHOR });
    const posts = await feed.getFeed();
    expect(posts[0].id).toBe(created.id);
    expect(posts[0].content).toBe('Hello Gradture');
    expect(posts[0].author.name).toBe('Jireh Cruz');
  });

  it('toggleLike flips likedByMe and adjusts the count', async () => {
    const feed = createFeedService();
    const before = await feed.getFeed();
    const target = before[0];
    const liked = await feed.toggleLike(target.id);
    expect(liked.likedByMe).toBe(true);
    expect(liked.likes).toBe(target.likes + 1);
    const unliked = await feed.toggleLike(target.id);
    expect(unliked.likedByMe).toBe(false);
    expect(unliked.likes).toBe(target.likes);
  });

  it('addComment increments comments', async () => {
    const feed = createFeedService();
    const before = await feed.getFeed();
    const target = before[0];
    const updated = await feed.addComment(target.id);
    expect(updated.comments).toBe(target.comments + 1);
  });

  it('persists created and mutated posts across service instances', async () => {
    const feed = createFeedService();
    const created = await feed.createPost({ content: 'Keep me', author: AUTHOR });
    await feed.toggleLike(created.id);

    const second = createFeedService();
    const posts = await second.getFeed();
    const found = posts.find((p) => p.id === created.id);
    expect(found?.content).toBe('Keep me');
    expect(found?.likedByMe).toBe(true);
  });
});