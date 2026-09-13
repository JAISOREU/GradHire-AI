# Home Page Redesign — Social Feed Design

**Date:** 2026-09-13
**Status:** Approved (awaiting implementation)
**Owner:** Frontend

## Context

Gradture's role Home pages (`/student/dashboard`, `/employer/dashboard`) are currently analytics dashboards (bento KPI grid for students, hiring-overview KPIs for employers). The product goal is for a logged-in user's first screen to be the **professional community and posts**, not analytics.

This change replaces the role Home pages' content with a professional social feed, keeping a small, non-competitive analytics sidebar on the right. It applies to both **student** and **employer** role-home routes.

Data is **UI-first**: the feed is seeded with realistic mock posts behind an async service layer, so a real backend can be wired in later without changing components. Rail metrics reuse existing APIs where available.

## Architecture (Approach A — shared social module)

Add `frontend/src/features/social/` as the single source of feed UI, shared by both roles:

- `SocialFeedPage.tsx` — page shell: three-zone grid (`home-feed` center + `home-feed-sidebar` right rail), responsive stacking below 1024px.
- `components/CreatePostComposer.tsx` — create-post card.
- `components/PostCard.tsx` — one feed post.
- `components/FeedRightRail.tsx` — right sidebar container; sections rendered from a per-role `rail adapter` prop.
- `components/RailRingCard.tsx` — small reusable rail card (ring + label + supporting text).
- `data/feedService.ts` — interface + default in-memory implementation; later swap for HTTP without touching components.
- `data/feedSeed.ts` — seeded community posts (incl. posts with media and compact job rows).
- `lib/format.ts` — `timeAgo` helper (fall back to an existing util if one already exists).

The existing `AppShell` sidebar (already rendered by `RoleLayout`) is the **LEFT zone**; the feed grid occupies the remaining content area with center + right zones. No second sidebar is added.

## Page structure (desktop)

- **Left:** existing `AppShell` sidebar (Home, Jobs, Messages, Network, …).
- **Center:** Create Post composer, then "Recent Posts" feed. ~62% of usable content width (avoid >65%).
- **Right:** small analytics/career cards. ~27% of usable content width (never a competing column).

First viewport must show: **Create Post composer, first post, and the top of the second post.** No large KPI strip, no profile-strength wall, no empty analytics.

## Create Post composer

- Compact card, visually distinct but tidy.
- Header: avatar + `"What's on your mind, {firstName}?"` (firstName from `user.name`).
- Supporting line: `"Share an update, ask a question, or post something related to your career."`
- Action row: **Photo · Video · Document · Poll** + primary **Post** button.
  - **Photo** opens a file picker; the chosen image becomes an inline preview attachment.
  - **Video / Document / Poll** are present, enabled buttons; in v1 they accept the action without full flows (documented placeholder).
- **Post** is enabled when the composer has text or an attached photo; posting prepends to the feed (in-memory service state, persisted to `localStorage` for session continuity).

## Post feed — "Recent Posts"

- Section header `Recent Posts` above the first card.
- `PostCard` content model:
  - Avatar, name, professional title, time-ago timestamp, optional verification/status badge.
  - Post text content.
  - Optional media (single image, restrained radius, not oversized).
  - Optional compact job row (title, company, location, match chip) — NOT the heavy `JobCard` component.
  - Footer: reaction count, comment count, share count.
  - Actions: **Like** (toggles state + count), **Comment** (inline input, appends comment, increments count), **Share** and **More** (present; minimal placeholder interactions — v1 keeps them inert with a small non-destructive menu/toast).
- Clean, generous card padding; no giant image cards.

## Right rail (supporting only)

Visual language identical across roles; content supplied by a per-role adapter so student/employer data differs without forking components.

**Recommended sections (student):**
1. **Your Progress** — Profile strength `<ring> %` + "Complete your profile to improve your opportunities."  (real: `studentsApi.getProfileCompleteness`)
2. **AI Match Score** — `<ring> %` + "Your current job match score."  (real: max score from `recommendationsApi.ai`)
3. **Quick Stats** — Applications · Saved Jobs · Profile Views (first two real; Profile Views is a **mock stub** in v1, clearly marked)
4. **Recent Activity** — up to 4 items from application status history + upcoming interviews
5. **AI Assistant CTA** — small card "Need help finding the right job?" + button **Try AI Assistant** → `/student/ai-assistant`

**Recommended sections (employer):**
1. **Company Profile** — completeness ring derived from filled `employersApi.getProfile` fields
2. **Hiring Health** — ring score from `analyticsApi.getSnapshot` (active jobs / pending interviews)
3. **Quick Stats** — Active jobs · Applicants today · Profile views (all real)
4. **Recent Activity** — recent applicants (up to 4)
5. **CTA** — "Post a job" quick card → `/employer/post-job`

The rail must stay visually subordinate: compact cards, small type, no competing color.

## Routing changes

- `/student/dashboard` → `SocialFeedPage` (student rail adapter).
- `/employer/dashboard` → `SocialFeedPage` (employer rail adapter).
- New `/student/analytics` → `StudentAnalyticsPage`, containing the **existing bento dashboard content unchanged** (moved from `StudentDashboardPage`). Add an "Analytics" item to `STUDENT_SIDEBAR_NAV` (Career tools section).
- Employer: existing `/employer/analytics` gains the "Recent applicants" and "Recent jobs" sections previously on `EmployerDashboardPage`; no new route/nav item needed.
- `roleHomePath` unchanged (both roles still land on `/…/dashboard`, now the feed).
- Old page wrappers (`StudentDashboardPage`, `EmployerDashboardPage`) are replaced by the feed; extract their content into `StudentAnalyticsPage` and fold the employer lists into `EmployerAnalyticsPage`.

## Data contracts

`feedService` interface (component-facing):

```ts
export interface FeedAuthor {
  id: string;
  name: string;
  title: string;
  avatar?: string;
  verified?: boolean;
}

export interface FeedPost {
  id: string;
  author: FeedAuthor;
  content: string;
  createdAt: string; // ISO
  image?: string;
  job?: { title: string; company: string; location?: string; matchScore?: number } | null;
  likes: number;
  comments: number;
  shares: number;
  likedByMe?: boolean;
}

export interface FeedService {
  getFeed(): Promise<FeedPost[]>;
  createPost(input: { content: string; image?: string }): Promise<FeedPost>;
  toggleLike(postId: string): Promise<FeedPost>;
  addComment(postId: string): Promise<FeedPost>; // increments comment count
}
```

Default implementation: seeded `feedSeed` merged with any user-created posts persisted in `localStorage`.

**Rail adapter contract:**

```ts
export interface HomeRailData {
  primary: { label: string; value: number; start?: number; hint: string };
  secondary: { label: string; value: number; hint: string };
  quickStats: { label: string; value: number }[];
  activity: { id: string; text: string; timeAgo: string }[];
  cta: { title: string; button: string; to: string };
}
```

## Testing (Vitest + Testing Library, matching repo patterns)

- `feedService` — create/like/comment round-trips; localStorage persistence.
- `CreatePostComposer` — greeting shows first name; Post disabled until input; posting appends.
- `PostCard` — renders author/content/counts; Like toggles; Comment adds.
- `SocialFeedPage` — renders composer + feed + rail; first-viewport content order.
- Existing 60 tests must keep passing; `tsc --noEmit` clean.

## Verification / acceptance

- Browser QA at 1280px viewport: center ≈ 62%, right rail ≈ 27%; first viewport = composer + full first post + top of second.
- At 768px: single column (feed on top, rail below).
- Both student and employer homes show the feed with role-correct rail data.
- `/student/analytics` and `/employer/analytics` still expose the full analytics.
- No regressions to existing routes; visual style follows current design tokens (glass/card, `--color-primary-*`), quiet and calm.

## Out of scope (later phases)

- Real post backend (entities, API, media upload).
- Share/More full flows, poll answers, video/document attachments.
- Following/friends graph; moderation; push notifications for posts.
- Profile Views analytics source.