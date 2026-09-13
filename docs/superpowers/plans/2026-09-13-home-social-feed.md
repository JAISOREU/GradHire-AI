# Home Social Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the student and employer role-Home pages (`/student/dashboard`, `/employer/dashboard`) into a professional social feed with a small right analytics rail, moving analytics off Home.

**Architecture:** A shared `frontend/src/features/social/` module (page shell, composer, post card, right rail, data service) used by both roles. Left nav = existing `AppShell` sidebar. Post data is UI-first: an async `FeedService` over seeded mock posts + `localStorage` persistence. Rail content is per-role, built with existing API hooks in thin wrapper pages.

**Tech Stack:** React 19, React Router 7, Vite 5, Vitest 4 + Testing Library, TypeScript 5.6, Tailwind classes + custom `styles.css` rules (design tokens `--color-*`, `--radius-*`, `--space-*`, `--shadow-*`), Phosphor icons via `PhosphorIcon`.

**Spec:** `docs/superpowers/specs/2026-09-13-home-social-feed-design.md`

## Global Constraints

- Copy strings (exact): composer prompt `What's on your mind, {firstName}?`; supporting text `Share an update, ask a question, or post something related to your career.`; section header `Recent Posts`.
- Right-rail copy (exact): `Complete your profile to improve your opportunities.`; `Your current job match score.`; AI CTA card `Need help finding the right job?` button `Try AI Assistant` (student); employer CTA button `Post a job`.
- Desktop layout: center column ≈ 62% (never >65%), right rail ≈ 27% (never competing), grid below 1024px stacks to one column.
- First viewport must show: Create Post composer, first post, top of second post. No KPI strip, no profile-strength wall, no large analytics.
- UI-first only: no backend/post endpoints; mark Profile Views as mock.
- `FeedService` API must be async; components must not import `localStorage` directly (only the service does).
- Keep the page calm: rail is supporting, small type, subordinidate colors.
- Tests: Vitest + Testing Library in repo pattern (`@testing-library/jest-dom/vitest`, `render`/`screen`). Keep existing 60 tests passing and `npx tsc --noEmit` clean.
- Commit only the intended files (never `git add -A`); follow repo commit-message style (`feat(scope): …`).

---

### Task 1: Feed types, seed data, time helper, and FeedService

**Files:**
- Create: `frontend/src/features/social/types.ts`
- Create: `frontend/src/features/social/data/feedSeed.ts`
- Create: `frontend/src/features/social/lib/format.ts`
- Create: `frontend/src/features/social/data/feedService.ts`
- Test: `frontend/src/features/social/data/feedService.test.ts`

**Interfaces:**
- Produces:
  - `FeedAuthor { id: string; name: string; title: string; avatar?: string; verified?: boolean }`
  - `FeedJobRow { title: string; company: string; location?: string; matchScore?: number }`
  - `FeedPost { id; author: FeedAuthor; content: string; createdAt: string; image?: string; job?: FeedJobRow | null; likes: number; comments: number; shares: number; likedByMe?: boolean }`
  - `FeedService { getFeed(): Promise<FeedPost[]>; createPost(input: { content; image?; author: FeedAuthor }): Promise<FeedPost>; toggleLike(postId: string): Promise<FeedPost>; addComment(postId: string): Promise<FeedPost> }`
  - `createFeedService(): FeedService` and singleton `export const feedService: FeedService`
  - `export const SEED_POSTS: FeedPost[]`
  - `export const timeAgo(iso: string): string`

- [ ] **Step 1: Write the failing test**

`frontend/src/features/social/data/feedService.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend; npx vitest run src/features/social/data/feedService.test.ts`
Expected: FAIL — module not found (`./feedService`).

- [ ] **Step 3: Implement `types.ts`**

```ts
export interface FeedAuthor {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  verified?: boolean;
}

export interface FeedJobRow {
  title: string;
  company: string;
  location?: string;
  matchScore?: number;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  content: string;
  createdAt: string;
  image?: string;
  job?: FeedJobRow | null;
  likes: number;
  comments: number;
  shares: number;
  likedByMe?: boolean;
}

export interface FeedService {
  getFeed(): Promise<FeedPost[]>;
  createPost(input: { content: string; image?: string; author: FeedAuthor }): Promise<FeedPost>;
  toggleLike(postId: string): Promise<FeedPost>;
  addComment(postId: string): Promise<FeedPost>;
}

export interface HomeRailCard {
  label: string;
  value: number;
  hint: string;
}

export interface HomeRailData {
  primary: HomeRailCard;
  secondary: HomeRailCard;
  quickStats: { label: string; value: number }[];
  activity: { id: string; text: string; timeAgo: string }[];
  cta: { title: string; button: string; to: string };
}
```

- [ ] **Step 4: Implement `lib/format.ts`**

```ts
export const timeAgo = (iso: string): string => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  return new Date(iso).toLocaleDateString();
};
```

- [ ] **Step 5: Implement `data/feedSeed.ts`**

Seed posts use fixed ids `seed-1..6` and relative timestamps so the feed always reads fresh. No external images — inline SVG data URIs only.

```ts
import type { FeedPost } from '../types';

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const ago = (ms: number): string => new Date(Date.now() - ms).toISOString();

const IMG = (label: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="100%" height="100%" fill="#1e293b"/><text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="28" text-anchor="middle">${label}</text></svg>`,
  )}`;

export const SEED_POSTS: FeedPost[] = [
  {
    id: 'seed-1',
    author: { id: 'u-1', name: 'Amara Okafor', title: 'Talent Partner at Nova Labs', verified: true },
    content: 'We just opened 12 new graduate roles at Nova Labs — full-stack, data, and product engineering. Strong emphasis on mentorship and structured onboarding. Applications close Friday. Good luck, grads!',
    createdAt: ago(6 * MIN),
    job: { title: 'Graduate Software Engineer', company: 'Nova Labs', location: 'Remote — EMEA', matchScore: 91 },
    likes: 84,
    comments: 12,
    shares: 19,
  },
  {
    id: 'seed-2',
    author: { id: 'u-2', name: 'Diego Marin', title: 'Backend Engineer · ex-Fintech', verified: false },
    content: 'A practical tip that took me too long to learn: your cover letter should answer three questions — what you built, at what scale, and how you verified it worked. Everything else is noise.',
    createdAt: ago(1 * HOUR),
    likes: 142,
    comments: 37,
    shares: 54,
  },
  {
    id: 'seed-3',
    author: { id: 'u-3', name: 'Priya Raghavan', title: 'Career Coach · 500+ hires advised', verified: true },
    content: 'Interview prep thread: here is the one-page framework I give every student before a system-design round. Practice the template, not the memorized answers.',
    createdAt: ago(3 * HOUR),
    image: IMG('System Design Cheat Sheet'),
    likes: 96,
    comments: 23,
    shares: 41,
  },
  {
    id: 'seed-4',
    author: { id: 'u-4', name: 'Tomás Ferreira', title: 'Computer Science Graduate · Class of 2025', verified: false },
    content: 'Officially signed my offer letter today. 6 months, 140 applications, 9 interviews, 1 offer. Thankful for every rejection — each one sharpened the next attempt. You can do it too.',
    createdAt: ago(8 * HOUR),
    likes: 312,
    comments: 88,
    shares: 25,
  },
  {
    id: 'seed-5',
    author: { id: 'u-5', name: 'Nova Labs', title: 'Company · Software & AI', verified: true },
    content: 'What we actually score in a take-home: clean structure, tests on the unhappy path, and a short README explaining trade-offs. Perfect code is not the bar — thoughtful engineering is.',
    createdAt: ago(1 * DAY),
    likes: 67,
    comments: 9,
    shares: 13,
  },
  {
    id: 'seed-6',
    author: { id: 'u-6', name: 'Sana Khalid', title: 'Product Manager · Grad cohort mentor', verified: true },
    content: 'Reminder for everyone entering the job market: you are also interviewing the company. Ask about onboarding, review culture, and who your manager really is. Fit beats prestige.',
    createdAt: ago(2 * DAY),
    likes: 154,
    comments: 41,
    shares: 60,
  },
];
```

- [ ] **Step 6: Implement `data/feedService.ts`**

```ts
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
```

- [ ] **Step 7: Run test to verify it passes**

Run: `cd frontend; npx vitest run src/features/social/data/feedService.test.ts`
Expected: 5 tests pass.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/social/types.ts frontend/src/features/social/data/feedSeed.ts frontend/src/features/social/lib/format.ts frontend/src/features/social/data/feedService.ts frontend/src/features/social/data/feedService.test.ts
git commit -m "feat(social): feed types, seed data, and FeedService"
```

---

### Task 2: Create Post composer

**Files:**
- Create: `frontend/src/features/social/components/CreatePostComposer.tsx`
- Test: `frontend/src/features/social/components/CreatePostComposer.test.tsx`

**Interfaces:**
- Consumes: `FeedAuthor` from `../types`
- Produces: `CreatePostComposer(props: { author: FeedAuthor; onCreatePost(input: { content: string; image?: string }): void })`

- [ ] **Step 1: Write the failing test**

```ts
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CreatePostComposer } from './CreatePostComposer';

const AUTHOR = { id: 'me-1', name: 'Jireh Cruz', title: 'Graduate · Computer Science' };

describe('CreatePostComposer', () => {
  it('greets the user by first name', () => {
    render(<CreatePostComposer author={AUTHOR} onCreatePost={vi.fn()} />);
    expect(screen.getByText(/What's on your mind, Jireh/)).toBeInTheDocument();
    expect(screen.getByText('Share an update, ask a question, or post something related to your career.')).toBeInTheDocument();
  });

  it('disables Post until there is content', () => {
    render(<CreatePostComposer author={AUTHOR} onCreatePost={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText(/What's on your mind/), { target: { value: 'hello' } });
    expect(screen.getByRole('button', { name: 'Post' })).toBeEnabled();
  });

  it('submits content and clears the composer', () => {
    const onCreatePost = vi.fn();
    render(<CreatePostComposer author={AUTHOR} onCreatePost={onCreatePost} />);
    fireEvent.change(screen.getByPlaceholderText(/What's on your mind/), { target: { value: 'Looking for a mentor' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(onCreatePost).toHaveBeenCalledWith({ content: 'Looking for a mentor', image: undefined });
    expect(screen.getByPlaceholderText(/What's on your mind/)).toHaveValue('');
  });

  it('shows the attachment actions', () => {
    render(<CreatePostComposer author={AUTHOR} onCreatePost={vi.fn()} />);
    for (const label of ['Photo', 'Video', 'Document', 'Poll']) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend; npx vitest run src/features/social/components/CreatePostComposer.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `CreatePostComposer.tsx`**

```tsx
import { useRef, useState } from 'react';
import { Avatar } from '../../../components/Avatar';
import { Button } from '../../../components/Button';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import type { FeedAuthor } from '../types';

interface CreatePostComposerProps {
  author: FeedAuthor;
  onCreatePost: (input: { content: string; image?: string }) => void;
}

const firstName = (name: string): string => name.trim().split(/\s+/)[0] ?? 'there';

export const CreatePostComposer = ({ author, onCreatePost }: CreatePostComposerProps) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const canPost = content.trim().length > 0 || Boolean(image);

  const pickImage = () => fileRef.current?.click();

  const onFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(typeof reader.result === 'string' ? reader.result : undefined);
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!canPost) return;
    onCreatePost({ content: content.trim(), image });
    setContent('');
    setImage(undefined);
  };

  const actions: { label: string; icon: Parameters<typeof PhosphorIcon>[0]['name']; onClick?: () => void }[] = [
    { label: 'Photo', icon: 'Image', onClick: pickImage },
    { label: 'Video', icon: 'VideoCamera' },
    { label: 'Document', icon: 'FileText' },
    { label: 'Poll', icon: 'ChartBar' },
  ];

  return (
    <section className="feed-card feed-composer">
      <div className="feed-composer__row">
        <Avatar src={author.avatar} name={author.name} size="md" />
        <div className="feed-composer__fields">
          <textarea
            rows={2}
            className="feed-composer__input"
            placeholder={`What\u2019s on your mind, ${firstName(author.name)}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="feed-composer__hint">Share an update, ask a question, or post something related to your career.</p>
        </div>
      </div>

      {image && (
        <div className="feed-composer__preview">
          <img src={image} alt="Attachment preview" />
          <button type="button" className="feed-composer__preview-remove" aria-label="Remove attachment" onClick={() => setImage(undefined)}>
            <PhosphorIcon name="X" size={16} />
          </button>
        </div>
      )}

      <div className="feed-composer__footer">
        <div className="feed-composer__actions">
          {actions.map((a) => (
            <button key={a.label} type="button" className="feed-action" onClick={a.onClick}>
              <PhosphorIcon name={a.icon} size={18} />
              {a.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={submit} disabled={!canPost}>
          Post
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </section>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend; npx vitest run src/features/social/components/CreatePostComposer.test.tsx`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/social/components/CreatePostComposer.tsx frontend/src/features/social/components/CreatePostComposer.test.tsx
git commit -m "feat(social): create post composer"
```

---

### Task 3: Post card

**Files:**
- Create: `frontend/src/features/social/components/PostCard.tsx`
- Test: `frontend/src/features/social/components/PostCard.test.tsx`

**Interfaces:**
- Consumes: `FeedPost` from `../types`; `timeAgo` from `../lib/format`
- Produces: `PostCard(props: { post: FeedPost; onToggleLike?(postId: string): void; onAddComment?(postId: string): void })`

- [ ] **Step 1: Write the failing test**

```ts
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { PostCard } from './PostCard';
import type { FeedPost } from '../types';

const POST: FeedPost = {
  id: 'p1',
  author: { id: 'a1', name: 'Amara Okafor', title: 'Talent Partner at Nova Labs', verified: true },
  content: 'We opened graduate roles.',
  createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  job: { title: 'Graduate Software Engineer', company: 'Nova Labs', matchScore: 91 },
  likes: 84,
  comments: 12,
  shares: 19,
};

describe('PostCard', () => {
  it('renders author, title, time, content, and counts', () => {
    render(<PostCard post={POST} />);
    expect(screen.getByText('Amara Okafor')).toBeInTheDocument();
    expect(screen.getByText('Talent Partner at Nova Labs')).toBeInTheDocument();
    expect(screen.getByText('We opened graduate roles.')).toBeInTheDocument();
    expect(screen.getByText('30m')).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('19')).toBeInTheDocument();
    expect(screen.getAllByText('Nova Labs').length).toBeGreaterThanOrEqual(1);
  });

  it('toggles like and calls onToggleLike', () => {
    const onToggleLike = vi.fn();
    const { rerender } = render(<PostCard post={POST} onToggleLike={onToggleLike} />);
    fireEvent.click(screen.getByRole('button', { name: /Like/ }));
    expect(onToggleLike).toHaveBeenCalledWith('p1');
    const liked = { ...POST, likedByMe: true, likes: 85 };
    rerender(<PostCard post={liked} onToggleLike={onToggleLike} />);
    expect(screen.getByRole('button', { name: /Liked/ })).toHaveClass('feed-action--active');
  });

  it('opens a comment input and adds a comment', () => {
    const onAddComment = vi.fn();
    render(<PostCard post={POST} onAddComment={onAddComment} />);
    fireEvent.click(screen.getByRole('button', { name: /Comment/ }));
    const input = screen.getByPlaceholderText(/Write a comment/);
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Congratulations!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    expect(onAddComment).toHaveBeenCalledWith('p1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend; npx vitest run src/features/social/components/PostCard.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `PostCard.tsx`**

```tsx
import { useState } from 'react';
import { Avatar } from '../../../components/Avatar';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import type { FeedPost } from '../types';
import { timeAgo } from '../lib/format';

interface PostCardProps {
  post: FeedPost;
  onToggleLike?: (postId: string) => void;
  onAddComment?: (postId: string) => void;
}

export const PostCard = ({ post, onToggleLike, onAddComment }: PostCardProps) => {
  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState('');

  const submitComment = () => {
    if (!comment.trim()) return;
    onAddComment?.(post.id);
    setComment('');
    setCommentOpen(false);
  };

  return (
    <article className="feed-card feed-post">
      <div className="feed-post__header">
        <Avatar src={post.author.avatar} name={post.author.name} size="md" />
        <div className="feed-post__author">
          <span className="feed-post__name">
            {post.author.name}
            {post.author.verified && (
              <PhosphorIcon name="SealCheck" size={15} weight="fill" className="feed-post__verify" aria-label="Verified" />
            )}
          </span>
          <span className="feed-post__title">{post.author.title}</span>
          <span className="feed-post__time">{timeAgo(post.createdAt)}</span>
        </div>
        <button type="button" className="feed-post__more" aria-label="More actions">
          <PhosphorIcon name="DotsThree" size={20} />
        </button>
      </div>

      <div className="feed-post__body">
        <p className="feed-post__text">{post.content}</p>
        {post.image && <img className="feed-post__media" src={post.image} alt="Post attachment" />}
        {post.job && (
          <div className="feed-post__job">
            <div className="feed-post__job-info">
              <span className="feed-post__job-title">{post.job.title}</span>
              <span className="feed-post__job-company">
                {post.job.company}
                {post.job.location ? ` · ${post.job.location}` : ''}
              </span>
            </div>
            {post.job.matchScore != null && <span className="feed-post__job-match">{post.job.matchScore}% match</span>}
          </div>
        )}
      </div>

      <div className="feed-post__footer">
        <div className="feed-post__counts">
          {post.likes > 0 && (
            <span><PhosphorIcon name="ThumbsUp" size={13} weight="fill" /> {post.likes}</span>
          )}
          {post.comments > 0 && <span>{post.comments} comments</span>}
          {post.shares > 0 && <span>{post.shares} shares</span>}
        </div>
        <div className="feed-post__actions">
          <button
            type="button"
            className={`feed-action ${post.likedByMe ? 'feed-action--active' : ''}`}
            onClick={() => onToggleLike?.(post.id)}
          >
            <PhosphorIcon name={post.likedByMe ? 'ThumbsUp' : 'ThumbsUp'} size={18} weight={post.likedByMe ? 'fill' : 'regular'} />
            {post.likedByMe ? 'Liked' : 'Like'}
          </button>
          <button type="button" className="feed-action" onClick={() => setCommentOpen((v) => !v)}>
            <PhosphorIcon name="ChatCircle" size={18} />
            Comment
          </button>
          <button type="button" className="feed-action">
            <PhosphorIcon name="Share" size={18} />
            Share
          </button>
          <button type="button" className="feed-action feed-action--icon">
            <PhosphorIcon name="DotsThree" size={18} />
          </button>
        </div>
        {commentOpen && (
          <div className="feed-post__commentbox">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitComment()}
              placeholder="Write a comment…"
            />
            <button type="button" className="feed-commentbox__post" onClick={submitComment} disabled={!comment.trim()}>
              Post
            </button>
          </div>
        )}
      </div>
    </article>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend; npx vitest run src/features/social/components/PostCard.test.tsx`
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/features/social/components/PostCard.tsx frontend/src/features/social/components/PostCard.test.tsx
git commit -m "feat(social): post card with like and comment interactions"
```

---

### Task 4: Right rail components

**Files:**
- Create: `frontend/src/features/social/components/RailRingCard.tsx`
- Create: `frontend/src/features/social/components/FeedRightRail.tsx`

**Interfaces:**
- Consumes: `HomeRailData` from `../types`; `ProgressRing` from `../../../components/ProgressRing`; `Button` from `../../../components/Button`
- Produces:
  - `RailRingCard(props: { label: string; value: number; hint?: string; icon?: Parameters<typeof PhosphorIcon>[0]['name'] })`
  - `FeedRightRail(props: { data: HomeRailData; loading?: boolean })`

- [ ] **Step 1: Implement `RailRingCard.tsx`**

```tsx
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { ProgressRing } from '../../../components/ProgressRing';

interface RailRingCardProps {
  label: string;
  value: number;
  hint?: string;
  icon?: Parameters<typeof PhosphorIcon>[0]['name'];
}

export const RailRingCard = ({ label, value, hint, icon }: RailRingCardProps) => (
  <div className="rail-card">
    <div className="rail-ring">
      <ProgressRing value={value} size="md" label={`${Math.round(value)}%`} />
      <div className="rail-ring__meta">
        <span className="rail-card__title">
          {icon && <PhosphorIcon name={icon} size={15} />}
          {label}
        </span>
        {hint && <span className="rail-card__hint">{hint}</span>}
      </div>
    </div>
  </div>
);
```

- [ ] **Step 2: Implement `FeedRightRail.tsx`**

```tsx
import { Button } from '../../../components/Button';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { Skeleton } from '../../../components/Skeleton';
import type { HomeRailData } from '../types';
import { RailRingCard } from './RailRingCard';

interface FeedRightRailProps {
  data: HomeRailData;
  loading?: boolean;
}

export const FeedRightRail = ({ data, loading }: FeedRightRailProps) => {
  if (loading && !data) {
    return (
      <aside className="home-feed__rail" aria-label="Home insights">
        <Skeleton variant="card" lines={10} />
      </aside>
    );
  }

  return (
    <aside className="home-feed__rail" aria-label="Home insights">
      <RailRingCard label={data.primary.label} value={data.primary.value} hint={data.primary.hint} icon="CircleNotch" />
      <RailRingCard label={data.secondary.label} value={data.secondary.value} hint={data.secondary.hint} icon="Sparkle" />

      <div className="rail-card">
        <span className="rail-card__title">Quick Stats</span>
        <ul className="rail-stats">
          {data.quickStats.map((stat) => (
            <li key={stat.label} className="rail-stats__row">
              <span>{stat.label}</span>
              <span className="rail-stats__value">{stat.value}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rail-card">
        <span className="rail-card__title">Recent Activity</span>
        <ul className="rail-activity">
          {data.activity.map((item) => (
            <li key={item.id} className="rail-activity__item">
              <span className="rail-activity__text">{item.text}</span>
              <span className="rail-activity__time">{item.timeAgo}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rail-card rail-cta">
        <span className="rail-cta__title">{data.cta.title}</span>
        <Button to={data.cta.to} size="sm">
          {data.cta.button}
        </Button>
      </div>
    </aside>
  );
};
```

- [ ] **Step 3: Typecheck**

Run: `cd frontend; npx tsc --noEmit`
Expected: PASS. (`Button` accepts `to` for link rendering; `Skeleton` accepts `variant`/`lines`.)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/features/social/components/RailRingCard.tsx frontend/src/features/social/components/FeedRightRail.tsx
git commit -m "feat(social): home right rail components"
```

---

### Task 5: SocialFeedPage shell + styles

**Files:**
- Create: `frontend/src/features/social/SocialFeedPage.tsx`
- Modify: `frontend/src/styles.css` (append a clearly-marked `/* HOME SOCIAL FEED */` section)
- Test: `frontend/src/features/social/SocialFeedPage.test.tsx`

**Interfaces:**
- Consumes: `CreatePostComposer`, `PostCard`, `FeedRightRail`, `FeedService`, `FeedAuthor`, `FeedPost`, `HomeRailData`
- Produces: `SocialFeedPage(props: { currentUser: FeedAuthor; rail: HomeRailData; railLoading?: boolean; feed?: FeedService })`

- [ ] **Step 1: Write the failing test**

```ts
import '@testing-library/jest-dom/vitest';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
  createPost: vi.fn(async () => posts[0]),
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
    render(<SocialFeedPage currentUser={USER} rail={RAIL} feed={fakeFeed([POST])} />);
    expect(await screen.findByText('Recent Posts')).toBeInTheDocument();
    const composer = screen.getByPlaceholderText(/What's on your mind, Jireh/);
    const header = screen.getByText('Recent Posts');
    const post = screen.getByText('Graduate roles are open.');
    expect(composer.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(header.compareDocumentPosition(post) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Try AI Assistant')).toBeInTheDocument();
  });

  it('prepends a new post when the composer posts', async () => {
    const feed = fakeFeed([POST]);
    render(<SocialFeedPage currentUser={USER} rail={RAIL} feed={feed} />);
    const input = await screen.findByPlaceholderText(/What's on your mind/);
    fireEvent.change(input, { target: { value: 'Fresh post by me' } });
    fireEvent.click(screen.getByRole('button', { name: 'Post' }));
    await screen.findByText('Fresh post by me');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend; npx vitest run src/features/social/SocialFeedPage.test.tsx`
Expected: FAIL — module not found / `recent posts` missing (no component yet).

- [ ] **Step 3: Implement `SocialFeedPage.tsx`**

```tsx
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
```

- [ ] **Step 4: Append styles.css block**

Append to the end of `frontend/src/styles.css`:

```css
/* ============================================================
   HOME SOCIAL FEED
   ============================================================ */
.home-feed {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
  gap: var(--space-6, 24px);
  align-items: start;
  max-width: 1400px;
  margin-inline: auto;
}

.home-feed__main {
  display: flex;
  flex-direction: column;
  gap: var(--space-5, 20px);
  min-width: 0;
}

.home-feed__section-title {
  font-size: var(--text-lg, 1.125rem);
  font-weight: 600;
  color: var(--color-text-secondary, #8b93a7);
  letter-spacing: 0.02em;
}

.home-feed__empty {
  color: var(--color-text-secondary, #8b93a7);
  padding: var(--space-4, 16px) 0;
  text-align: center;
}

.feed-card {
  background: var(--color-surface, #0f1420);
  border: 1px solid var(--color-border, rgba(148, 163, 184, 0.16));
  border-radius: var(--radius-lg, 14px);
  padding: var(--space-5, 20px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.25));
}

/* Composer */
.feed-composer__row {
  display: flex;
  gap: var(--space-3, 12px);
  align-items: flex-start;
}

.feed-composer__fields {
  flex: 1;
  min-width: 0;
}

.feed-composer__input {
  width: 100%;
  resize: none;
  background: transparent;
  border: none;
  outline: none;
  font: inherit;
  font-size: 1rem;
  color: var(--color-text, #e2e8f0);
}

.feed-composer__input::placeholder {
  color: var(--color-text-secondary, #8b93a7);
}

.feed-composer__hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #8b93a7);
  margin-top: 2px;
}

.feed-composer__preview {
  position: relative;
  margin-top: var(--space-3, 12px);
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
}

.feed-composer__preview img {
  display: block;
  width: 100%;
  max-height: 320px;
  object-fit: cover;
  border-radius: var(--radius-md, 10px);
}

.feed-composer__preview-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  border-radius: 999px;
  padding: 6px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.feed-composer__footer {
  margin-top: var(--space-3, 12px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4, 16px);
}

.feed-composer__actions,
.feed-post__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2, 8px);
}

.feed-action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #8b93a7);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.feed-action:hover {
  background: rgb(var(--color-primary-rgb, 139 131 255) / 0.1);
  color: var(--color-text, #e2e8f0);
}

.feed-action--active {
  color: rgb(var(--color-primary-rgb, 139 131 255) / 1);
}

.feed-action--icon {
  padding: 6px;
}

/* Post */
.feed-post {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
  padding: var(--space-5, 20px) var(--space-6, 24px);
}

.feed-post__header {
  display: flex;
  gap: var(--space-3, 12px);
  align-items: flex-start;
}

.feed-post__author {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
  min-width: 0;
  flex: 1;
}

.feed-post__name {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
}

.feed-post__verify {
  color: rgb(var(--color-primary-rgb, 139 131 255) / 1);
}

.feed-post__title {
  font-size: 0.82rem;
  color: var(--color-text-secondary, #8b93a7);
}

.feed-post__time {
  font-size: 0.72rem;
  color: var(--color-text-secondary, #8b93a7);
}

.feed-post__more {
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #8b93a7);
  cursor: pointer;
  padding: 2px;
}

.feed-post__text {
  color: var(--color-text, #e2e8f0);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.feed-post__media {
  display: block;
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  border-radius: var(--radius-md, 10px);
}

.feed-post__job {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3, 12px);
  padding: var(--space-3, 12px) var(--space-4, 16px);
  border: 1px solid var(--color-border, rgba(148, 163, 184, 0.16));
  border-radius: var(--radius-md, 10px);
  background: rgb(var(--color-primary-rgb, 139 131 255) / 0.05);
}

.feed-post__job-info {
  display: flex;
  flex-direction: column;
}

.feed-post__job-title {
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
}

.feed-post__job-company {
  font-size: 0.82rem;
  color: var(--color-text-secondary, #8b93a7);
}

.feed-post__job-match {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgb(var(--color-primary-rgb, 139 131 255) / 1);
  white-space: nowrap;
}

.feed-post__footer {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
  border-top: 1px solid var(--color-border, rgba(148, 163, 184, 0.12));
  padding-top: var(--space-3, 12px);
}

.feed-post__counts {
  display: flex;
  align-items: center;
  gap: var(--space-4, 16px);
  font-size: 0.8rem;
  color: var(--color-text-secondary, #8b93a7);
}

.feed-post__counts span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.feed-post__commentbox {
  display: flex;
  gap: var(--space-2, 8px);
  margin-top: var(--space-2, 8px);
}

.feed-post__commentbox input {
  flex: 1;
  border: 1px solid var(--color-border, rgba(148, 163, 184, 0.16));
  border-radius: 999px;
  padding: 8px 14px;
  background: transparent;
  color: var(--color-text, #e2e8f0);
  font: inherit;
  font-size: 0.85rem;
}

.feed-commentbox__post {
  border: none;
  background: rgb(var(--color-primary-rgb, 139 131 255) / 1);
  color: #fff;
  border-radius: 999px;
  padding: 8px 18px;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.feed-commentbox__post:disabled {
  opacity: 0.5;
  cursor: default;
}

/* Rail */
.home-feed__rail {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
  position: sticky;
  top: var(--space-4, 16px);
  min-width: 0;
}

.rail-card {
  background: var(--color-surface, #0f1420);
  border: 1px solid var(--color-border, rgba(148, 163, 184, 0.16));
  border-radius: var(--radius-lg, 14px);
  padding: var(--space-4, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.rail-ring {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
}

.rail-ring__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.rail-card__title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
}

.rail-card__hint {
  font-size: 0.78rem;
  color: var(--color-text-secondary, #8b93a7);
  line-height: 1.4;
}

.rail-stats {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rail-stats__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #8b93a7);
}

.rail-stats__value {
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
}

.rail-activity {
  list-style: none;
  margin: 0;
  padding: 0;
}

.rail-activity__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
}

.rail-activity__text {
  font-size: 0.82rem;
  color: var(--color-text, #e2e8f0);
}

.rail-activity__time {
  font-size: 0.72rem;
  color: var(--color-text-secondary, #8b93a7);
}

.rail-cta {
  background: rgb(var(--color-primary-rgb, 139 131 255) / 0.08);
  border-color: rgb(var(--color-primary-rgb, 139 131 255) / 0.25);
}

.rail-cta__title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text, #e2e8f0);
}

@media (max-width: 1023px) {
  .home-feed {
    grid-template-columns: 1fr;
  }
  .home-feed__rail {
    position: static;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd frontend; npx vitest run src/features/social/SocialFeedPage.test.tsx`
Expected: 2 tests pass.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/social/SocialFeedPage.tsx frontend/src/features/social/SocialFeedPage.test.tsx frontend/src/styles.css
git commit -m "feat(social): social feed page shell with email-safe layout and styles"
```

Wait — commit message says "email-safe" — correct that requirement text intentionally:

```bash
git add frontend/src/features/social/SocialFeedPage.tsx frontend/src/features/social/SocialFeedPage.test.tsx frontend/src/styles.css
git commit -m "feat(social): social feed page shell with layout and styles"
```

---

### Task 6: Rail adapters and Home wrapper pages

**Files:**
- Create: `frontend/src/features/social/rail.ts` (pure builders)
- Create: `frontend/src/features/social/StudentHomePage.tsx`
- Create: `frontend/src/features/social/EmployerHomePage.tsx`
- Modify: `frontend/src/routing/AppRoutes.tsx` (swap dashboard elements to the new pages)

**Interfaces:**
- Consumes: `HomeRailData` from `./types`; `studentsApi`, `recommendationsApi`, `savedJobsApi`, `interviewsApi` from endpoints; `analyticsApi`, `employersApi` from endpoints; `useAsync`; `useAuth`
- Produces: `buildStudentRail(args): HomeRailData`, `buildEmployerRail(args): HomeRailData`, `StudentHomePage`, `EmployerHomePage`

- [ ] **Step 1: Implement `rail.ts`**

```ts
import type { Application, Interview } from '../../core/types';
import { timeAgo } from './lib/format';
import type { HomeRailData } from './types';

export const buildStudentRail = (args: {
  profileStrength: number;
  matchScore: number;
  applications: Application[];
  applicationsInProgress: number;
  savedJobs: number;
  activity: { id: string; text: string; createdAt: string }[];
}): HomeRailData => ({
  primary: {
    label: 'Your Progress',
    value: Math.round(args.profileStrength),
    hint: 'Complete your profile to improve your opportunities.',
  },
  secondary: {
    label: 'AI Match Score',
    value: Math.round(args.matchScore),
    hint: 'Your current job match score.',
  },
  quickStats: [
    { label: 'Applications', value: args.applications.length },
    { label: 'Saved Jobs', value: args.savedJobs },
    { label: 'Profile Views', value: 0 }, // mock — no backend source yet
  ],
  activity: args.activity.map((a) => ({ id: a.id, text: a.text, timeAgo: timeAgo(a.createdAt) })).slice(0, 4),
  cta: { title: 'Need help finding the right job?', button: 'Try AI Assistant', to: '/student/ai-assistant' },
});

export const buildEmployerRail = (args: {
  activeJobs: number;
  applicantsToday: number;
  views: number;
  pendingInterviews: number;
  recentApplicants: { id: string; name: string; appliedAt?: string }[];
}): HomeRailData => ({
  primary: {
    label: 'Hiring Health',
    value: Math.min(100, args.activeJobs * 10 + args.pendingInterviews * 5),
    hint: 'Based on your active postings and interviews.',
  },
  secondary: {
    label: 'Profile Reach',
    value: Math.min(100, args.views),
    hint: 'Company profile views this period.',
  },
  quickStats: [
    { label: 'Active Jobs', value: args.activeJobs },
    { label: 'Applicants Today', value: args.applicantsToday },
    { label: 'Profile Views', value: args.views },
  ],
  activity: args.recentApplicants.map((a) => ({ id: a.id, text: `${a.name} applied`, timeAgo: a.appliedAt ? timeAgo(a.appliedAt) : 'today' })).slice(0, 4),
  cta: { title: 'Attract more candidates', button: 'Post a job', to: '/employer/post-job' },
});
```

- [ ] **Step 2: Implement `StudentHomePage.tsx`**

```tsx
import { useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { studentsApi } from '../../core/api/endpoints/students';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { savedJobsApi } from '../../core/api/endpoints/employers';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { SocialFeedPage } from './SocialFeedPage';
import { buildStudentRail } from './rail';
import type { Application } from '../../core/types';

const TERMINAL_STATUSES = ['HIRED', 'REJECTED', 'WITHDRAWN'];

export const StudentHomePage = () => {
  const { user } = useAuth();
  const { data: profile } = useAsync(() => studentsApi.getProfile(), []);
  const { data: completeness } = useAsync(() => studentsApi.getProfileCompleteness(), []);
  const { data: applications, loading: applicationsLoading } = useAsync(() => studentsApi.listApplications(), []);
  const { data: recommendation } = useAsync(() => recommendationsApi.ai(3), []);
  const { data: savedJobs } = useAsync(() => savedJobsApi.listMine<{ id: string }>(), []);
  const { data: interviewPage } = useAsync(() => interviewsApi.getMyInterviews(), []);

  const name = user?.name || 'Student';
  const title = profile?.headline || (user?.role === 'STUDENT' ? 'Graduate' : 'Student');

  const rail = useMemo(() => {
    const apps = (applications ?? []) as Application[];
    const inProgress = apps.filter((a) => !TERMINAL_STATUSES.includes(a.status)).length;
    const bestMatch = Math.max(0, ...(recommendation?.recommendations ?? []).map((r) => r.score || 0));
    const activity = apps
      .flatMap((a) => (a.statusHistory ?? []).map((h) => ({
        id: h.id,
        text: h.message ?? `${a.job?.title ?? 'Application'} — ${h.newStatus}`,
        createdAt: h.createdAt,
      })))
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
    return buildStudentRail({
      profileStrength: completeness?.percentage ?? 0,
      matchScore: bestMatch,
      applications: apps,
      applicationsInProgress: inProgress,
      savedJobs: savedJobs?.length ?? 0,
      activity,
    });
  }, [applications, completeness, recommendation, savedJobs, interviewPage]);

  const loading = applicationsLoading && !applications;

  return (
    <SocialFeedPage
      currentUser={{ id: user?.id ?? 'me', name, title, verified: false }}
      rail={rail}
      railLoading={loading}
    />
  );
};
```

- [ ] **Step 3: Implement `EmployerHomePage.tsx`**

```tsx
import { useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { useAsync } from '../../core/hooks/useAsync';
import { analyticsApi, employersApi } from '../../core/api/endpoints/employers';
import { SocialFeedPage } from './SocialFeedPage';
import { buildEmployerRail } from './rail';
import type { Application } from '../../core/types';

type EmployerApplicant = Application & {
  student?: { profile?: { name?: string } | null } | null;
};

export const EmployerHomePage = () => {
  const { user } = useAuth();
  const { data: analytics, loading: analyticsLoading } = useAsync(() => analyticsApi.getSnapshot(), []);
  const { data: applicants, loading: applicantsLoading } = useAsync(() => employersApi.listApplicants(), []);

  const rail = useMemo(() => {
    const snap = analytics as { activeJobs?: number; applicationsToday?: number; views?: number; pendingInterviews?: number } | null | undefined;
    const recent = ((applicants ?? []) as EmployerApplicant[]).map((a) => ({
      id: a.id,
      name: a.student?.profile?.name ?? 'A candidate',
      appliedAt: a.submittedAt,
    }));
    return buildEmployerRail({
      activeJobs: snap?.activeJobs ?? 0,
      applicantsToday: snap?.applicationsToday ?? 0,
      views: snap?.views ?? 0,
      pendingInterviews: snap?.pendingInterviews ?? 0,
      recentApplicants: recent,
    });
  }, [analytics, applicants]);

  const loading = (analyticsLoading && !analytics) || (applicantsLoading && !applicants);
  const name = user?.name || 'Employer';

  return (
    <SocialFeedPage
      currentUser={{ id: user?.id ?? 'me', name, title: user?.companyName ?? 'Your Company', verified: false }}
      rail={rail}
      railLoading={loading}
    />
  );
};
```

Note: `user` type has `companyName` — if the shared `User` type lacks it, use `title: 'Hiring Team'` instead (confirm during implementation via the `User` type at `frontend/src/core/types.ts`; employer profile company name is available from `employersApi.getProfile`, but keeping the composer creator simple means using `user.name`; choose `'Hiring Team'` if `companyName` is not on `User`).

- [ ] **Step 4: Rewire routes in `AppRoutes.tsx`**

- Replace the `StudentDashboardPage` lazy import with `StudentHomePage` (`../features/social/StudentHomePage`) and the `/student/dashboard` element accordingly.
- Replace the `EmployerDashboardPage` lazy import with `EmployerHomePage` (`../features/social/EmployerHomePage`) and the `/employer/dashboard` element accordingly.
- Remove the now-unused `StudentDashboardPage` and `EmployerDashboardPage` lazy imports (their files are replaced in Task 7).

- [ ] **Step 5: Typecheck + test suite**

Run: `cd frontend; npx tsc --noEmit; npm test`
Expected: both pass (60 existing + new social tests).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/social/rail.ts frontend/src/features/social/StudentHomePage.tsx frontend/src/features/social/EmployerHomePage.tsx frontend/src/routing/AppRoutes.tsx
git commit -m "feat(social): home feed for student and employer roles"
```

---

### Task 7: Move analytics off Home

**Files:**
- Create: `frontend/src/features/student/StudentAnalyticsPage.tsx` (old bento content from `StudentDashboardPage.tsx`)
- Delete: `frontend/src/features/student/StudentDashboardPage.tsx`
- Delete: `frontend/src/features/employer/EmployerDashboardPage.tsx`
- Modify: `frontend/src/features/employer/EmployerAnalyticsPage.tsx` (add Recent applicants + Active jobs sections)
- Modify: `frontend/src/routing/AppRoutes.tsx` (add `/student/analytics` route)
- Modify: `frontend/src/core/utils/navigation.ts` (add Analytics nav item for student)

- [ ] **Step 1: Create `StudentAnalyticsPage.tsx`**

Copy the current full body of `StudentDashboardPage.tsx` verbatim (the `DashboardWelcome`, `BentoGrid`, `DashboardKPIs`, `DashboardRecommended`, `DashboardActivity`, `DashboardCareerIntel` import list and JSX), renaming the exported component to `StudentAnalyticsPage`. Keep all hook logic identical so nothing regresses.

- [ ] **Step 2: Add the `/student/analytics` route and nav item**

In `AppRoutes.tsx` add (near the other student routes):

```tsx
const StudentAnalyticsPage = lazy(() => import('../features/student/StudentAnalyticsPage').then((m) => ({ default: m.StudentAnalyticsPage })));
// inside the student <Route element={...RoleLayout...}> block:
<Route path="/student/analytics" element={<LazyPage><Page><StudentAnalyticsPage /></Page></LazyPage>} />
```

In `navigation.ts`, `STUDENT_SIDEBAR_NAV`, "Career tools" section, add:

```ts
{ to: '/student/analytics', label: 'Analytics', icon: 'ChartLineUp' },
```

- [ ] **Step 3: Fold employer lists into `EmployerAnalyticsPage.tsx`**

Import `DashboardSection`, `Skeleton`, `Badge`/`resolveBadgeKind`, `Avatar`, `EmptyState`, `Button` if not already imported, and remove the duplicate KPI strip if present (keep one). Append two `DashboardSection` blocks (copied from `EmployerDashboardPage.tsx`) — **Recent applicants** (Candidate/Job/Applied/Status table) and **Active jobs** (Job/Location/Status/Applicants table) — reusing the existing `analyticsApi.getSnapshot`, `employersApi.listApplicants`, and `employersApi.listJobs` data calls. Wrap added sections in a `loading ? <Skeleton/> : table-or-empty` pattern identical to the original dashboard.

- [ ] **Step 4: Delete the old dashboard files and update routes**

- `Mark remove`: delete `frontend/src/features/student/StudentDashboardPage.tsx` and `frontend/src/features/employer/EmployerDashboardPage.tsx`.
- Remove their imports from `AppRoutes.tsx` (already removed in Task 6; confirm no dangling references).

- [ ] **Step 5: Verify**

Run: `cd frontend; npx tsc --noEmit; npm test`
Expected: PASS (60+ tests). Browser check `/student/analytics` and `/employer/analytics` load (manual or via the browser-automation skill).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/student/StudentAnalyticsPage.tsx frontend/src/features/employer/EmployerAnalyticsPage.tsx frontend/src/routing/AppRoutes.tsx frontend/src/core/utils/navigation.ts
git rm frontend/src/features/student/StudentDashboardPage.tsx frontend/src/features/employer/EmployerDashboardPage.tsx
git commit -m "feat(home): move analytics off home to student analytics route"
```

---

### Task 8: Final verification

**Files:**
- Modify: none (verification only)

- [ ] **Step 1: Full typecheck and test suite**

Run: `cd frontend; npx tsc --noEmit; npm test`
Expected: typecheck clean; all tests pass.

- [ ] **Step 2: Browser QA of both Home pages**

With the Vite dev server running (and backend up if auth is needed; otherwise verify the landing rail fallback):

- Load `/student/dashboard` (authenticated student) at 1280px: confirm center column ≈ 62% and right rail ≈ 27%; first viewport = composer, full first post, top of second post; "Recent Posts" header present; right rail shows Progress, Match, Quick Stats, Activity, CTA.
- Load `/employer/dashboard`: feed shows; rail shows Hiring Health / Profile Reach / company quick stats / CTA.
- Resize to 768px: single column, rail below feed.
- Load `/student/analytics` and `/employer/analytics`: analytics render.

Use the browser-automation skill (`browser.mjs`) for DOM assertions and screenshots.

- [ ] **Step 3: Update todos and close out**

If this was executed with a todo list, mark all tasks complete. Confirm `git status` shows no unexpected files.

---

## Self-Review Notes

- **Spec coverage:** three-zone layout (Task 5 CSS + grid) ✓; composer copy and behaviors (Task 2) ✓; feed posts + like/comment (Tasks 1, 3) ✓; right rail sections + copy (Tasks 4, 6) ✓; first-viewport ordering asserted in `SocialFeedPage.test.tsx` ✓; analytics moved off Home (Task 7) ✓; both roles (Task 6) ✓; UI-first mock data (Task 1) ✓; Profile Views marked mock in `buildStudentRail` ✓.
- **Known open item:** `User.companyName` may not exist on the shared `User` type — the plan calls for checking `core/types.ts` during Task 6 and falling back to `'Hiring Team'` if absent.
- **Type consistency:** `FeedService.createPost` accepts `{ content, image, author }` (extends the spec interface with `author`); `HomeRailData` shape used identically across `rail.ts`, `FeedRightRail`, and `SocialFeedPage`.