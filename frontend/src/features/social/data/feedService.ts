import type { FeedService } from '../types';
import { feedApi } from '../../../core/api/endpoints/feed';

export const createFeedService = (): FeedService => ({
  async getFeed() {
    return feedApi.getFeed();
  },
  async createPost({ content, image }) {
    return feedApi.createPost({ content, imageUrl: image ?? null });
  },
  async toggleLike(postId) {
    return feedApi.toggleLike(postId);
  },
  async addComment(postId, content) {
    return feedApi.addComment(postId, content);
  },
});

export const feedService: FeedService = createFeedService();