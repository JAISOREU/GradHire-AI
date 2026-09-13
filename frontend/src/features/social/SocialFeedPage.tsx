import { useState } from 'react';
import { useAsync } from '../../core/hooks/useAsync';
import { CreatePostComposer } from './components/CreatePostComposer';
import { PostCard } from './components/PostCard';
import { FeedRightRail } from './components/FeedRightRail';
import { feedService as defaultFeed } from './data/feedService';
import type { FeedAuthor, FeedPost, FeedService, HomeRailData } from './types';

interface SocialFeedPageProps {
  currentUser: FeedAuthor;
  rail: HomeRailData;
  railLoading?: boolean;
  feed?: FeedService;
}

export const SocialFeedPage = ({ currentUser, rail, railLoading, feed = defaultFeed }: SocialFeedPageProps) => {
  const { data: initial, loading, error } = useAsync<FeedPost[]>(() => feed.getFeed(), [feed]);
  const [posts, setPosts] = useState<FeedPost[]>([]);

  const list = posts.length > 0 ? posts : (initial ?? []);

  const createPost = async ({ content, image }: { content: string; image?: string }) => {
    const post = await feed.createPost({ content, image, author: currentUser });
    setPosts((prev) => [post, ...(prev.length > 0 ? prev : (initial ?? []))]);
  };

  const toggleLike = async (postId: string) => {
    const updated = await feed.toggleLike(postId);
    setPosts((prev) => (prev.length > 0 ? prev.map((p) => (p.id === postId ? updated : p)) : prev));
    if (posts.length === 0 && initial) {
      setPosts(initial.map((p) => (p.id === postId ? updated : p)));
    }
  };

  const addComment = async (postId: string) => {
    const updated = await feed.addComment(postId);
    setPosts((prev) => (prev.length > 0 ? prev.map((p) => (p.id === postId ? updated : p)) : prev));
    if (posts.length === 0 && initial) {
      setPosts(initial.map((p) => (p.id === postId ? updated : p)));
    }
  };

  return (
    <div className="page fade-in home-feed">
      <main className="home-feed__main">
        <CreatePostComposer author={currentUser} onCreatePost={(input) => void createPost(input)} />

        <div className="home-feed__section">
          <h2 className="home-feed__section-title">Recent Posts</h2>
        </div>

        {loading && posts.length === 0 ? (
          <p className="home-feed__empty">Loading your feed…</p>
        ) : error && list.length === 0 ? (
          <p className="home-feed__empty">Couldn’t load the feed right now.</p>
        ) : (
          list.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={(id) => void toggleLike(id)}
              onAddComment={(id) => void addComment(id)}
            />
          ))
        )}
      </main>

      <FeedRightRail data={rail} loading={railLoading} />
    </div>
  );
};