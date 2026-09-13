import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SocialFeedPage } from './SocialFeedPage';
import type { FeedPost, FeedService, HomeRailData } from './types';

const RAIL: HomeRailData = {
  primary: { label: 'Your Progress', value: 93, hint: 'Complete your profile to improve your opportunities.' },
  secondary: { label: 'AI Match Score', value: 76, hint: 'Your current job match score.' },
  quickStats: [{ label: 'Applications', value: 4 }],
  activity: [{ id: 'a1', text: 'Application submitted', timeAgo: '2d' }],
  cta: { title: 'Need help finding the right job?', button: 'Try AI Assistant', to: '/student/ai-assistant' },
};

const USER = { id: 'me', name: 'Jireh Cruz', title: 'Graduate · Computer Science' };

const fakeFeed = (posts: FeedPost[]): FeedService => ({
  getFeed: vi.fn().mockResolvedValue(posts),
  createPost: vi.fn(async (input: { content: string; image?: string }) => ({ ...posts[0], id: 'post-new', content: input.content })),
  toggleLike: vi.fn(async (id: string) => posts.find((p) => p.id === id) as FeedPost),
  addComment: vi.fn(async (id: string) => posts.find((p) => p.id === id) as FeedPost),
});

const POST: FeedPost = {
  id: 'p1',
  author: { id: 'a1', name: 'Amara Okafor', title: 'Talent Partner', verified: true },
  content: 'Graduate roles are open.',
  createdAt: new Date().toISOString(),
  job: null,
  likes: 1,
  comments: 0,
  shares: 0,
};

describe('SocialFeedPage', () => {
  it('renders composer before the feed and rail alongside', async () => {
    render(
      <MemoryRouter>
        <SocialFeedPage currentUser={USER} rail={RAIL} feed={fakeFeed([POST])} />
      </MemoryRouter>
    );
    expect(await screen.findByText('Recent Posts')).toBeInTheDocument();
    const composer = screen.getByPlaceholderText(/What's on your mind, Jireh/);
    const header = screen.getByText('Recent Posts');
    const post = await screen.findByText('Graduate roles are open.');
    expect(composer.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(header.compareDocumentPosition(post) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Try AI Assistant')).toBeInTheDocument();
  });

  it('prepends a new post when the composer posts', async () => {
    const feed = fakeFeed([POST]);
    render(
      <MemoryRouter>
        <SocialFeedPage currentUser={USER} rail={RAIL} feed={feed} />
      </MemoryRouter>
    );
    const input = await screen.findByPlaceholderText(/What's on your mind/);
    fireEvent.change(input, { target: { value: 'Fresh post by me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    await screen.findByText('Fresh post by me');
  });
});