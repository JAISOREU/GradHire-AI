# Gradture Student Experience Transformation — Design Spec

**Date:** 2026-09-11
**Scope:** Core student flow (6 pages) + design system enhancements
**Status:** Approved for implementation planning

---

## 1. Overview

Transform the Gradture student experience into a world-class career discovery platform by enhancing 6 core pages and evolving the existing design system. The backend already supports the necessary data; this is primarily a frontend transformation.

### Pages in Scope

| # | Page | Current Lines | Priority |
|---|------|---------------|----------|
| 1 | Design System Enhancements | — | Foundation |
| 2 | Student Dashboard | 167 | P1 |
| 3 | Student Jobs (Search + Feed) | 609 | P1 |
| 4 | Job Detail (Standalone) | 240 | P1 |
| 5 | Applications Tracker | 179 | P1 |
| 6 | AI Matching Display | — | Cross-cutting |

### Design Principles

- **Swiss/editorial structure** with spatial depth
- **Selective liquid glass** (not every card)
- **Bento layouts** where useful
- **Phosphor Icons** only
- **Real data only** — empty states for missing data, never fabricate
- **Progressive disclosure** — what needs attention first
- **Accessible** — keyboard, screen reader, reduced motion

---

## 2. Design System Enhancements

### 2.1 Design Tokens

Add to `styles.css` as CSS custom properties:

```css
/* Spatial depth */
--space-depth-sm: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06);
--space-depth-md: 0 4px 6px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.06);
--space-depth-lg: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05);
--space-depth-xl: 0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04);

/* Glass */
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.18);
--glass-blur: 12px;

/* Bento */
--bento-gap: 16px;
--bento-radius: 16px;

/* Motion */
--motion-smooth: cubic-bezier(0.4, 0, 0.2, 1);
--motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

Dark mode variants included.

### 2.2 Component Enhancements

**Card** — new variants:
- `variant="spatial"` — depth shadow + subtle border glow on hover
- `variant="glass"` — frosted glass background
- `variant="bento"` — grid item with standard bento radius/gap

**Button** — additions:
- `loading` state with pulse animation
- Hover elevation micro-interaction (translateY -1px + shadow)

**Badge** — additions:
- `pulse` variant for live/active states (animated dot)

**PageHeader** — additions:
- `subtitle` prop
- `breadcrumbs` prop (array of {label, href})
- `actions` slot (ReactNode for right-side buttons)

**KPICard** — additions:
- `trend` prop (+12%, -3%, etc.) with TrendIndicator
- `sparkline` slot (ReactNode for mini chart)
- `comparison` prop ("vs last week")

**DataTable** — additions:
- `compact` mode (reduced row height/padding)
- `onRowClick` handler
- `emptyState` slot

**Skeleton** — additions:
- `variant="shimmer"` (default, existing)
- `variant="wave"` (subtle wave animation)

**EmptyState** — additions:
- `icon` prop (PhosphorIcon name)
- `action` prop (button label + handler)
- `illustration` slot (ReactNode)

### 2.3 New Layout Primitives

**BentoGrid** — new component:
- CSS Grid with configurable column spans
- Props: `columns` (2, 3, 4), `gap`, `responsive` (breakpoint behavior)
- Children use `span` prop for column span
- Responsive: 4-col → 2-col → 1-col

**SpatialCard** — new component:
- Card with depth layering + hover lift (translateY -2px) + subtle border glow
- Uses `--space-depth-md` default, `--space-depth-lg` on hover
- Radial glow follows cursor (CSS radial-gradient + onMouseMove)

**ParallaxSection** — new component:
- Scroll-driven subtle parallax wrapper
- Props: `speed` (0.1-0.5), `direction` (up/down)
- Uses IntersectionObserver for performance
- Respects `prefers-reduced-motion`

**SectionDivider** — new component:
- Visual section separator
- Props: `label` (optional), `spacing` (sm/md/lg)

### 2.4 Data Visualization Components

**ProgressRing** — new component:
- Circular progress indicator
- Props: `value` (0-100), `size` (sm=32, md=48, lg=64), `label`, `color` (auto from value or manual)
- Shows percentage number inside ring
- Animated on mount (stroke-dasharray transition)

**ProgressBar** — new component:
- Horizontal bar with label + value
- Props: `value` (0-100), `label`, `showValue`, `color`
- Animated fill on mount

**Sparkline** — new component:
- Mini line chart for trends
- Props: `data` (number[]), `width`, `height`, `color`
- SVG-based, no external dependency

**ComparisonBar** — new component:
- Side-by-side bar for skill matching
- Props: `required` (0-100), `actual` (0-100), `label`
- Two bars: required (ghost) vs actual (filled)

### 2.5 Interaction Patterns

- **Card spotlight:** Radial glow following cursor on `SpatialCard` hover (CSS `radial-gradient` + `onMouseMove` updating `--mouse-x`/`--mouse-y` custom properties)
- **Scroll reveal:** IntersectionObserver-based fade-in-up animation on section mount
- **Hover elevation:** Cards lift 2-4px on hover with shadow transition (all cards)
- **Smooth transitions:** Route transitions via existing `PageTransition` component
- **Reduced motion:** All animations wrapped in `@media (prefers-reduced-motion: no-preference)` check

### 2.6 Visual Layer

- `AmbientBackground` and `SpatialBackground` exist — enhance for dashboard only
- Dashboard: subtle aurora/parallax background (expressive, unique to dashboard)
- Application pages: focused, spatial depth, clean hierarchy
- ATS/employer: information-dense (future)
- Admin: operational (future)

---

## 3. Student Dashboard

### Current State
4 KPI cards (applications, profile %, matches, saved), recent applications list, top 3 AI matches, profile completeness. Two dead API calls (`jobsApi.list('')`, `studentsApi.getProfile()`). No per-section loading/error states.

### Target Design

**Layout:** Bento grid, 4-column responsive.

```
┌─────────────────────────────────────────────────────┐
│ Welcome Banner                                      │
│ "Good afternoon, [Name]. Here's what's happening." │
│ Subtle aurora/parallax background                   │
└─────────────────────────────────────────────────────┘

┌──────────┐┌──────────┐┌──────────┐┌──────────┐
│ Profile  ││ AI Match ││ Apps In  ││ Saved    │
│ Strength ││ Score    ││ Progress ││ Jobs     │
│ Ring 72% ││ Ring 87% ││ Count: 3 ││ Count: 5 │
│ trend ↑  ││ trend ↑  ││ trend ↓  ││ trend ↑  │
└──────────┘└──────────┘└──────────┘└──────────┘

┌──────────────────────────┐┌────────────────────────┐
│ Recommended For You      ││ Your Activity          │
│ 3 job cards with match   ││ Recent app status      │
│ scores + explanations    ││ changes + upcoming     │
│                          ││ interviews             │
│ "View all →"             ││                        │
└──────────────────────────┘└────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Career Intelligence                                  │
│ [Top Skills] → [Skill Gaps] → [Recommended Actions]  │
│ Horizontal scrollable strip                          │
└──────────────────────────────────────────────────────┘
```

### Sections

**Welcome Banner**
- Personalized greeting: "Good morning/afternoon/evening, [FirstName]"
- Subtitle: "Here's what's happening with your career search."
- Subtle aurora/parallax background (the one expressive surface)
- No KPI numbers — keep clean and inviting

**KPI Row (4 cards in BentoGrid)**
- Each card: `KPICard` with `ProgressRing` or number, `TrendIndicator`, click handler
- **Profile Strength:** ProgressRing with percentage from `getProfileCompleteness()`. Click → `/student/account`
- **AI Match Score:** ProgressRing with average match from `recommendationsApi.ai()`. Click → `/student/recommended`
- **Applications In Progress:** Count of non-terminal applications from `listApplications()`. Trend vs last week. Click → `/student/applications`
- **Saved Jobs:** Count from `savedJobsApi.listMine(1)`. Click → `/student/saved`

**Recommended For You**
- 3 job cards from `recommendationsApi.ai(3)`
- Each card: title, company, location, salary, ProgressRing (match score), 2-3 match explanation bullets
- "View all recommendations →" link

**Your Activity**
- Timeline of recent application events from `listApplications()` (last 5 status changes)
- Each event: icon + status text + job title + timestamp
- If upcoming interviews exist (from `interviewsApi.getMyInterviews()`): show them with date/time
- Empty state: "Start exploring jobs to see your activity here" + Browse button

**Career Intelligence**
- Horizontal bento strip
- Current skills: top 5 skill badges from profile
- Skill gaps: from `aiApi.skillsGap()` (preferred skills not in profile)
- Recommended actions: 1-2 development suggestions from gap analysis
- If profile incomplete: "Complete your profile to unlock career intelligence"

### API Calls (final)

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `recommendationsApi.ai(3)` | Matched jobs + scores | Existing |
| `studentsApi.listApplications()` | Application list + events | Existing |
| `savedJobsApi.listMine(1)` | Saved job count | Existing |
| `studentsApi.getProfileCompleteness()` | Profile strength % | Existing |
| `studentsApi.getAiReadiness()` | AI unlock status | Existing |
| `aiApi.skillsGap()` | Skill gap analysis | Existing |
| `interviewsApi.getMyInterviews()` | Upcoming interviews | Existing |

**Removed:** `jobsApi.list('')` (dead), `studentsApi.getProfile()` (dead)

### Loading/Empty/Error States
- Each section has independent skeleton loading (no blanket spinner)
- Profile incomplete → hide AI sections, show completion CTA
- AI unavailable → hide match score, show "AI matching coming soon"
- API error per section → inline error alert with retry
- No applications → "No applications yet" + Browse CTA
- No recommendations → "Complete your profile for AI recommendations"

---

## 4. Student Jobs Page (Search + Feed)

### Current State
Master-detail layout (609 lines). Search by keyword/location, filter by type/experience/workplace, sort, save/unsave, mobile drawer. Most complete page.

### Target Design

**Enhanced layout:**

```
┌─────────────────────────────────────────────────────┐
│ [🔍 Search jobs...              ] [Location ▾] [🔍] │
│ Toggle: [Structured] [Natural Language]              │
├─────────────────────────────────────────────────────┤
│ Filters: [Type ▾] [Work ▾] [Exp ▾] [Skills ▾] [Sort ▾]│
│ Active: [React ×] [Remote ×] [Clear all]            │
├─────────────────────────────────────────────────────┤
│ Tabs: [Best Match] [Recently Posted] [Closing Soon] │
│        [Saved]                                       │
├──────────────────────┬──────────────────────────────┤
│ Job Cards (scroll)   │ Job Detail Panel (right)      │
│                      │                              │
│ ┌──────────────────┐ │ ┌──────────────────────────┐ │
│ │ ● 87%            │ │ │ Title                    │ │
│ │ Software Engineer│ │ │ Company · Location       │ │
│ │ TechCorp · Remote│ │ │ Salary · Type            │ │
│ │ ₱30-50k · Full   │ │ │                          │ │
│ │ ⏰ Closing in 3d │ │ │ Why You Match            │ │
│ │ [♥] [Apply]      │ │ │ Skills 95% ████          │ │
│ └──────────────────┘ │ │ Experience 82% ███       │ │
│                      │ │ ...                       │ │
│ ┌──────────────────┐ │ │ Requirements             │ │
│ │ Next job...      │ │ │ Responsibilities         │ │
│ └──────────────────┘ │ │ [Apply Now] [Save]       │ │
│                      │ └──────────────────────────┘ │
├──────────────────────┴──────────────────────────────┤
│ < 1 2 3 ... 10 >                                   │
└─────────────────────────────────────────────────────┘
```

### Changes from Current

**1. Search Bar**
- Add NL toggle button (switches input mode)
- NL mode: single text input, "Try: 'junior React jobs near Manila with remote options'"
- NL parsing: client-side regex extraction of skills, location, experience → structured filter pills
- Structured mode: existing keyword + location inputs (default)
- Parsed NL results shown as editable filter pills

**2. Feed Tabs**
- **Best Match** (default): Jobs sorted by AI match score. Fetch from `recommendationsApi.ai(50)` for scored jobs, fallback to `listPaginated` with `sort=match`
- **Recently Posted**: Sorted by `postedAt` desc
- **Closing Soon**: Jobs with `applicationDeadline` within 7 days, sorted by deadline asc
- **Saved**: Filter to saved job IDs only
- Tab count badges where data available

**3. Job Card Enhancements**
- Add ProgressRing (small, 32px) for match score
- Add tooltip on ring hover: "Skills 95% · Experience 82%"
- Add relative posted time ("2h ago", "3d ago")
- Add deadline urgency ("Closing in 3 days" in amber)
- Add salary range display (already exists, keep)
- Keep save button + apply button

**4. Filter Enhancements**
- Keep existing: type, experience, workplace
- Add: **Skills** multi-select (match against `requiredSkills` + `preferredSkills`)
- Add: **Date posted** (Last 24h, Last week, Last month)
- Active filter pills below search bar with ✕ remove
- Filter count badge on filter button
- Salary filter when backend supports range queries

**5. Job Detail Panel Enhancements**
- Add "Why You Match" section with ProgressRing + breakdown bars + explanation bullets
- Add "Skills to Strengthen" section (missing preferred skills)
- Add "Similar Jobs" section (3 mini cards from recommendations)
- Add application deadline display
- Add company quick-info card (name, industry, size, link)
- Keep existing: title, description, requirements, responsibilities, benefits, apply/save

**6. Mobile**
- Keep existing drawer pattern
- Add filter bottom sheet (slide up)
- Horizontal tab strip for feed tabs
- Touch-friendly filter pills

### API Calls

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `jobsApi.listPaginated(...)` | Job listings with filters | Existing |
| `savedJobsApi.listMine(100)` | Saved job IDs | Existing |
| `jobsApi.save/unsave` | Toggle save | Existing |
| `aiApi.jobMatch(jobId)` | Per-job match score + breakdown | Existing |
| `recommendationsApi.ai(50)` | Scored job list for "Best Match" tab | Existing |

### Performance
- Match scores fetched lazily (IntersectionObserver on card visibility)
- Debounce search input (300ms)
- Cache match scores in state (avoid re-fetch on scroll back)
- Server-side filtering for structured filters
- Client-side NL parsing (no backend call needed)

---

## 5. Job Detail Page (Standalone)

### Current State
240 lines at `/jobs/:id`. Shows job info + apply button. No match explanation, no save, no similar jobs.

### Target Design

**Layout:** Two-column with sticky sidebar.

```
┌─────────────────────────────────────────────────────┐
│ ← Back to jobs                                      │
├──────────────────────────────┬──────────────────────┤
│                              │                      │
│ Job Header                   │ Company Card         │
│ Title                        │ Logo + Name          │
│ Company · Location           │ Industry · Size      │
│ Salary · Type · Remote       │ Location             │
│ Posted X days ago            │ Website link         │
│ [Apply Now] [Save Job]       │ [View company]       │
│                              │                      │
│ ─────────────────────────── │ ──────────────────── │
│                              │                      │
│ Tabs: [Details] [Company]    │ Why You Match        │
│                              │ ProgressRing (64px)  │
│ Details Tab:                 │                      │
│ About the role               │ Skills       95%     │
│ (description)                │ Experience   82%     │
│                              │ Education    90%     │
│ Responsibilities             │ Preferences  86%     │
│ • item                       │                      │
│ • item                       │ Why this matches:    │
│                              │ ✓ React + 2yr exp    │
│ Requirements                 │ ✓ Remote OK          │
│ • item                       │ ✓ Fresh grad OK      │
│                              │                      │
│ Preferred Qualifications     │ Skills to Strengthen │
│ • item                       │ + AWS (preferred)    │
│                              │ + Docker (preferred) │
│ Skills                       │                      │
│ [React] [TypeScript] [Node]  │                      │
│                              │                      │
│ Benefits                     │                      │
│ • item                       │                      │
│                              │                      │
│ Application Deadline         │                      │
│ Closes in X days             │                      │
│                              │                      │
│ Company Tab:                 │                      │
│ About the company            │                      │
│ Company info, size, etc      │                      │
│                              │                      │
├──────────────────────────────┴──────────────────────┤
│ Similar Jobs                                        │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ │ Job 1    │ │ Job 2    │ │ Job 3    │             │
│ │ Match 82%│ │ Match 79%│ │ Match 75%│             │
│ └──────────┘ └──────────┘ └──────────┘             │
└─────────────────────────────────────────────────────┘
```

### Changes from Current

**1. Job Header**
- Add save/unsave button (missing on standalone page)
- Add ProgressRing (large, 64px) for match score
- Add salary display
- Add application deadline with urgency indicator

**2. Right Sidebar (sticky, `position: sticky; top: 80px`)**
- **Company Card:** Logo, name, industry, size, location, website, "View company profile" link
- **Why You Match:** ProgressRing (large) + 4 ProgressBar bars (Skills/Experience/Education/Preferences) + 2-3 explanation bullets
- **Skills to Strengthen:** List of missing preferred skills with "+" indicator

**3. Tabbed Content**
- **Details tab:** Description, responsibilities, requirements, preferred qualifications, skills tags, benefits, deadline
- **Company tab:** Company description, size, industry, other open jobs

**4. Similar Jobs**
- 3 job cards in BentoGrid (3-column)
- Each: title, company, match score ring, salary
- From `recommendationsApi.ai(3)` or same-skills fallback

**5. Apply Flow**
- "Apply Now" → confirmation dialog → `applicationsApi.submit({ jobId })`
- Success toast with link to applications
- Already applied: "Applied ✓" with link
- External: "Apply on Company Site" → opens `applicationUrl`

### API Calls

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `jobsApi.getById(id)` | Job detail | Existing |
| `applicationsApi.submit()` | Apply | Existing |
| `aiApi.jobMatch(jobId)` | Match breakdown | Existing |
| `recommendationsApi.ai(3)` | Similar jobs | Existing |
| `savedJobsApi.save/unsave` | Toggle save | Existing |
| `savedJobsApi.check(jobId)` | Check saved status | Existing |

---

## 6. Applications Tracker

### Current State
179 lines. Status badges, pipeline stages (Applied→Screening→Interview→Offer→Hired), filter by stage, withdraw. No timeline, no detail view, no search/sort.

### Target Design

**List view:**

```
┌─────────────────────────────────────────────────────┐
│ My Applications                     [🔍 Search] [Filter ▾]│
├─────────────────────────────────────────────────────┤
│ Pipeline Summary                                    │
│ Applied: 5 → Screening: 2 → Interview: 1 → Offer: 0│
├─────────────────────────────────────────────────────┤
│ [All 8] [Applied 5] [Screening 2] [Interview 1]    │
│ [Offer 0] [Rejected 2]                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Software Engineer — TechCorp                    │ │
│ │ Applied Dec 15 · Status: Interview             │ │
│ │ ●─●─●─○─○  Applied→Screening→Interview         │ │
│ │ Next: Interview Dec 20 at 2:00 PM              │ │
│ │ [View Details →]                                │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ (empty state)                                   │ │
│ │ "No applications yet." [Browse Jobs]            │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Detail view (expanded on click):**

```
┌─────────────────────────────────────────────────────┐
│ ← Back to applications                              │
├─────────────────────────────────────────────────────┤
│ Software Engineer — TechCorp                        │
│ Applied Dec 15, 2025 · Status: Interview (badge)   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Pipeline                                            │
│ Applied ──●── Screening ──●── Interview ──○── Offer │
│    ✓           ✓             ●                       │
│                                                     │
│ Activity Timeline                                   │
│ ● Dec 15 — Application submitted                   │
│ ● Dec 17 — Employer viewed your application        │
│ ● Dec 18 — Moved to screening                      │
│ ● Dec 19 — Interview scheduled                     │
│   Dec 20 — Interview at 2:00 PM (upcoming)         │
│                                                     │
│ Job Details                                         │
│ Title, company, location, salary                    │
│ [View full job posting →]                           │
│                                                     │
│ Your Application                                    │
│ Resume: resume_v2.pdf [Download] [View]             │
│ Cover letter: cover_letter.pdf [Download] [View]    │
│ Screening answers: (if any)                         │
│                                                     │
│ [Withdraw Application]                              │
└─────────────────────────────────────────────────────┘
```

### Changes from Current

**1. Pipeline Summary Bar**
- Horizontal bar at top with stage counts
- Color-coded: Applied (blue), Screening (yellow), Interview (purple), Offer (green), Hired (green filled), Rejected (red)
- Quick overview of where all applications stand

**2. Application Cards**
- Job title, company, applied date, status badge
- Mini pipeline tracker (5 dots/lines, filled up to current stage)
- Next action indicator
- Click → navigate to detail view

**3. Filter Enhancements**
- Keep existing stage filters
- Add: search by job title/company
- Add: sort by date (newest/oldest), status, company
- Active filter count

**4. Detail View (new route: `/student/applications/:id`)**
- Full pipeline visualization with current stage highlighted
- Activity timeline from `ApplicationStatusHistory` + `ApplicationEvent`
- Only shows events that actually exist
- Job details summary with link to full posting
- Submitted documents with download/view
- Withdraw action (with confirmation)

**5. Empty States**
- No applications: "No applications yet. Start exploring jobs!" + Browse button
- No filter results: "No applications match this filter."
- Loading: Per-card skeleton

### API Calls

| Endpoint | Purpose | Status |
|----------|---------|--------|
| `studentsApi.listApplications()` | Application list | Existing |
| `studentsApi.withdraw(id)` | Withdraw | Existing |
| `applicationsApi.getById(id)` | Detail view | Existing |
| Resume download/view URLs | Documents | Existing |

---

## 7. AI Matching Display (Cross-Cutting)

### Components

**ProgressRing** — circular progress:
- Small (32px): job cards, KPI row
- Large (64px): job detail sidebar, dashboard
- Color: green (>80%), yellow (60-80%), red (<60%)
- Animated stroke on mount

**ProgressBar** — horizontal bar:
- Used in match breakdown (Skills/Experience/Education/Preferences)
- Label + percentage + animated fill

**Match Explanation** — bullet list:
- ✓ (green) for matched criteria
- + (amber) for gaps
- 2-3 bullets derived from match API `explanation` field

### Usage Map

| Page | Component | Source |
|------|-----------|--------|
| Dashboard KPI | ProgressRing (large) | Average of recent scores |
| Dashboard Recommended | ProgressRing (small) + explanation | `recommendationsApi.ai()` |
| Jobs card | ProgressRing (small) + tooltip | `aiApi.jobMatch()` |
| Job Detail sidebar | ProgressRing (large) + breakdown + explanation | `aiApi.jobMatch(jobId)` |
| Similar Jobs | ProgressRing (small) | Recommendations |

### Fallback Behavior
- Profile incomplete → hide match, show "Complete profile to see match scores"
- AI unavailable → hide match section entirely
- No explanation → show score only
- Never fabricate scores

---

## 8. API Surface Assessment

### Already Supported (no backend changes needed)

| Feature | Endpoint | Notes |
|---------|----------|-------|
| Job listings + filters | `GET /jobs` | Supports type, experience, workplace, location, pagination |
| Job detail | `GET /jobs/:id` | Full job data with skills, requirements, etc |
| AI recommendations | `GET /recommendations/ai` | Returns scored job list |
| AI job matching | `POST /ai/jobs/match/:jobId` | Returns score + breakdown + explanation |
| AI skill gap | `POST /ai/skills/gap-analysis` | Returns gaps + recommendations |
| AI career chat | `POST /ai/career/chat` | Multi-turn conversation |
| Student profile | `GET/PUT /students/me` | Full profile CRUD |
| Profile completeness | `GET /profile/completeness` | Percentage + missing sections |
| AI readiness | `GET /profile/ai-readiness` | Whether profile unlocks AI |
| Applications | `GET /applications/me` | List with status history |
| Application detail | `GET /applications/:id` | Full detail with events |
| Withdraw | `POST /applications/:id/withdraw` | Withdraw application |
| Saved jobs | `GET/POST/DELETE /saved-jobs` | CRUD + check |
| Interviews | `GET /interviews/me` | Student interviews |
| Messages | `GET /messages/me` | Message list |
| Notifications | `GET /notifications/me` | Notification list |
| Profile sections | `GET/POST/PUT/DELETE /profile/*` | Education, experience, skills, etc |
| Companies | `GET /companies` | Company directory |
| Company follow | `POST/DELETE /companies/:id/follow` | Follow/unfollow |

### Not Supported (frontend-only or empty states)

| Feature | Status | Approach |
|---------|--------|----------|
| Natural language search | No backend endpoint | Client-side NL parsing → structured filters |
| Job alerts/saved search schedules | No infrastructure | Empty state: "Alerts coming soon" |
| Application status push | WebSocket exists | Use existing notifications gateway |
| Match score pre-computation | Per-job API exists | Call on-demand, lazy-load per card |

---

## 9. File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `frontend/src/components/BentoGrid.tsx` | Bento grid layout |
| `frontend/src/components/SpatialCard.tsx` | Depth card with hover glow |
| `frontend/src/components/ParallaxSection.tsx` | Scroll parallax wrapper |
| `frontend/src/components/SectionDivider.tsx` | Visual section separator |
| `frontend/src/components/ProgressRing.tsx` | Circular progress |
| `frontend/src/components/ProgressBar.tsx` | Horizontal progress bar |
| `frontend/src/components/Sparkline.tsx` | Mini trend chart |
| `frontend/src/components/MatchBreakdown.tsx` | Score + breakdown + explanation |
| `frontend/src/components/MatchExplanation.tsx` | Why you match bullets |
| `frontend/src/components/SkillGapStrip.tsx` | Career intelligence strip |
| `frontend/src/components/ActivityTimeline.tsx` | Application event timeline |
| `frontend/src/components/PipelineTracker.tsx` | Application pipeline visualization |
| `frontend/src/components/NLSearchInput.tsx` | Natural language search |
| `frontend/src/components/FilterPill.tsx` | Active filter pill |
| `frontend/src/features/student/components/DashboardWelcome.tsx` | Welcome banner |
| `frontend/src/features/student/components/DashboardKPIs.tsx` | KPI row |
| `frontend/src/features/student/components/DashboardRecommended.tsx` | Recommended jobs |
| `frontend/src/features/student/components/DashboardActivity.tsx` | Activity timeline |
| `frontend/src/features/student/components/DashboardCareerIntel.tsx` | Career intelligence |
| `frontend/src/features/student/components/JobFeedTabs.tsx` | Feed tab bar |
| `frontend/src/features/student/components/JobCard.tsx` | Enhanced job card |
| `frontend/src/features/student/components/ApplicationDetail.tsx` | Application detail view |
| `frontend/src/features/student/components/SimilarJobs.tsx` | Similar jobs section |

### Modified Files

| File | Changes |
|------|---------|
| `frontend/src/styles.css` | Design tokens, new component styles, card variants |
| `frontend/src/components/Card.tsx` | Add spatial/glass/bento variants |
| `frontend/src/components/Button.tsx` | Add loading state, hover elevation |
| `frontend/src/components/Badge.tsx` | Add pulse variant |
| `frontend/src/components/PageHeader.tsx` | Add subtitle, breadcrumbs, actions |
| `frontend/src/components/KPICard.tsx` | Add trend, sparkline, comparison |
| `frontend/src/components/DataTable.tsx` | Add compact mode, onRowClick |
| `frontend/src/components/EmptyState.tsx` | Add icon, action, illustration |
| `frontend/src/features/student/StudentDashboardPage.tsx` | Complete rewrite |
| `frontend/src/features/student/StudentJobsPage.tsx` | Enhance with tabs, NL, match scores |
| `frontend/src/features/student/JobDetailPanel.tsx` | Add match breakdown, similar jobs |
| `frontend/src/features/jobs/JobDetailPage.tsx` | Add sidebar, match, save, similar |
| `frontend/src/features/student/StudentApplicationsPage.tsx` | Add timeline, detail view, search |
| `frontend/src/features/ai/AIAssistantPage.tsx` | Add job context, markdown, persistence |
| `frontend/src/routing/AppRoutes.tsx` | Add `/student/applications/:id` route |

### Deleted Files

| File | Reason |
|------|--------|
| None | All existing files are enhanced, not replaced |

---

## 10. Testing Strategy

### Component Tests (Vitest)
- ProgressRing: renders correct percentage, color thresholds, animation
- ProgressBar: renders correct value, label
- BentoGrid: responsive column behavior
- MatchBreakdown: renders all 4 categories, explanation bullets
- PipelineTracker: correct stage highlighting
- FilterPill: renders label, remove handler
- NLSearchInput: parses location, skills, experience from text

### Integration Tests
- Dashboard: loads all sections independently, handles partial failures
- Jobs: search/filter/sort/tabs work, match scores load lazily
- Job Detail: match breakdown loads, save/apply flow works
- Applications: filter/search works, detail view loads timeline

### Visual/Manual Testing
- Desktop: 1440px, 1024px
- Tablet: 768px
- Mobile: 375px, 390px
- Zero horizontal overflow
- Theme works (light/dark)
- Reduced motion works
- Phosphor icons only

### Accessibility
- All interactive elements keyboard accessible
- Focus states visible
- Screen reader labels on icon buttons
- Sufficient contrast (WCAG AA)
- Semantic HTML

---

## 11. Implementation Order

1. **Design System** (tokens + component enhancements + new primitives)
2. **Shared Components** (ProgressRing, ProgressBar, MatchBreakdown, etc.)
3. **Dashboard** (rewrite with bento layout + new components)
4. **Jobs Page** (enhance with tabs, NL, match scores)
5. **Job Detail** (add sidebar, match, save, similar)
6. **Applications** (add timeline, detail view, search)
7. **AI Assistant** (enhance with context, markdown)
8. **QA Pass** (all roles, all viewports, all themes)
