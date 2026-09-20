import '@testing-library/jest-dom/vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeedService } from './feedService';
import type { FeedPost } from '../types';

vi.mock('../../../core/api/client', () => ({
  api: vi.fn(),
}));

import { api } from '../../../core/api/client';
import { feedApi } from '../../../core/api/endpoints/feed';

const AUTHOR = { id: 'me-1', name: 'Jireh Cruz', title: 'Graduate · Computer Science' };

const makePost = (overrides: Partial<FeedPost> = {}): FeedPost => ({
  id: 'p1',
  author: AUTHOR,
  content: 'Hello Gradture',
  createdAt: new Date().toISOString(),
  job: null,
  likes: 0,
  comments: 0,
  shares: 0,
  ...overrides,
});

const mockApi = api as ReturnType<typeof vi.fn>;

describe('createFeedService', () => {
  beforeEach(() => {
    mockApi.mockReset();
  });

  it('returns posts from the API in the order provided', async () => {
    const posts = [makePost({ id: 'p2', content: 'Newest' }), makePost({ id: 'p1', content: 'Older' })];
    mockApi.mockResolvedValueOnce(posts);
    const feed = createFeedService();
    const result = await feed.getFeed();
    expect(result).toEqual(posts);
    expect(mockApi).toHaveBeenCalledWith('/api/v1/feed?limit=50');
  });

  it('treats a null GET response as an empty feed', async () => {
    mockApi.mockResolvedValueOnce(null);
    const feed = createFeedService();
    expect(await feed.getFeed()).toEqual([]);
  });

  it('createPost posts content and image to the API', async () => {
    mockApi.mockResolvedValueOnce(makePost({ id: 'post-new' }));
    const feed = createFeedService();
    const created = await feed.createPost({ content: 'Hello Gradture', image: 'https://img/x.png', author: AUTHOR });
    expect(mockApi).toHaveBeenCalledWith('/api/v1/feed', {
      method: 'POST',
      json: { content: 'Hello Gradture', imageUrl: 'https://img/x.png' },
    });
    expect(created.id).toBe('post-new');
  });

  it('toggleLike delegates to the like endpoint', async () => {
    const liked = makePost({ likedByMe: true, likes: 1 });
    mockApi.mockResolvedValueOnce(liked);
    const feed = createFeedService();
    const result = await feed.toggleLike('p1');
    expect(mockApi).toHaveBeenCalledWith('/api/v1/feed/p1/like', { method: 'POST' });
    expect(result.likedByMe).toBe(true);
  });

  it('addComment sends the comment content', async () => {
    const updated = makePost({ comments: 1 });
    mockApi.mockResolvedValueOnce(updated);
    const feed = createFeedService();
    const result = await feed.addComment('p1', 'Congratulations!');
    expect(mockApi).toHaveBeenCalledWith('/api/v1/feed/p1/comments', {
      method: 'POST',
      json: { content: 'Congratulations!' },
    });
    expect(result.comments).toBe(1);
  });

  it('feedApi is wired to the comment list endpoint', async () => {
    mockApi.mockResolvedValueOnce([{ id: 'c1', author: AUTHOR, content: 'Thanks!', createdAt: '2026-01-01T00:00:00.000Z' }]);
    const comments = await feedApi.getComments('p1');
    expect(mockApi).toHaveBeenCalledWith('/api/v1/feed/p1/comments');
    expect(comments.length).toBe(1);
  });
});