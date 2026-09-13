import type { FeedPost, FeedService } from '../types';
import { SEED_POSTS } from './feedSeed';

const STORAGE_KEY = 'gradture.feed.posts.v1';

const loadStored = (): Record<string, FeedPost> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, FeedPost>) : {};
  } catch {
    return {};
  }
};

const persist = (posts: Record<string, FeedPost>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // storage unavailable (private mode / SSR) — degrade to session-only
  }
};

export const createFeedService = (): FeedService => {
  const overlay = loadStored();

  const resolve = (): FeedPost[] => {
    const map: Record<string, FeedPost> = {};
    for (const post of SEED_POSTS) map[post.id] = post;
    for (const [id, post] of Object.entries(overlay)) {
      map[id] = { ...(map[id] ?? { author: { id: 'u-unknown', name: 'Unknown', title: '' }, content: '', createdAt: new Date().toISOString(), likes: 0, comments: 0, shares: 0 }), ...post, id };
    }
    return Object.values(map).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  };

  return {
    async getFeed() {
      return resolve();
    },
    async createPost({ content, image, author }) {
      const post: FeedPost = {
        id: `post-${Date.now()}`,
        author,
        content,
        image,
        createdAt: new Date().toISOString(),
        job: null,
        likes: 0,
        comments: 0,
        shares: 0,
        likedByMe: false,
      };
      overlay[post.id] = post;
      persist(overlay);
      return post;
    },
    async toggleLike(postId) {
      const current = resolve().find((p) => p.id === postId);
      if (!current) throw new Error('Post not found');
      const next = { ...current, likedByMe: !current.likedByMe, likes: current.likedByMe ? current.likes - 1 : current.likes + 1 };
      overlay[postId] = next;
      persist(overlay);
      return next;
    },
    async addComment(postId) {
      const current = resolve().find((p) => p.id === postId);
      if (!current) throw new Error('Post not found');
      const next = { ...current, comments: current.comments + 1 };
      overlay[postId] = next;
      persist(overlay);
      return next;
    },
  };
};

export const feedService: FeedService = createFeedService();