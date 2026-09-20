import { api } from '../client';
import type { FeedPost } from '../../../features/social/types';

export const feedApi = {
  getFeed: (limit = 50): Promise<FeedPost[]> =>
    api<FeedPost[]>(`/api/v1/feed?limit=${limit}`).then((r) => r ?? []),

  createPost: (input: { content: string; imageUrl?: string | null; jobId?: string | null }): Promise<FeedPost> =>
    api<FeedPost>('/api/v1/feed', { method: 'POST', json: input }),

  deletePost: (postId: string): Promise<{ ok: true }> =>
    api<{ ok: true }>(`/api/v1/feed/${postId}`, { method: 'DELETE' }),

  toggleLike: (postId: string): Promise<FeedPost> =>
    api<FeedPost>(`/api/v1/feed/${postId}/like`, { method: 'POST' }),

  getComments: (postId: string) =>
    api<Array<{ id: string; author: { id: string; name: string; title: string; avatar?: string | null }; content: string; createdAt: string }>>(
      `/api/v1/feed/${postId}/comments`,
    ).then((r) => r ?? []),

  addComment: (postId: string, content: string): Promise<FeedPost> =>
    api<FeedPost>(`/api/v1/feed/${postId}/comments`, { method: 'POST', json: { content } }),
};