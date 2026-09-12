# GradTure UI/UX Master Design System — Design Spec

**Date:** 2026-09-12
**Scope:** Visual redesign of existing GradTure frontend
**Approach:** Token + shell + shared-component restyle (Approach A)

---

## 1. Scope & Constraints

**In scope:**
- Complete redesign of design tokens, shell (sidebar + header + layout), all shared components, and all pages (public + authenticated)
- Stripping decorative effects (gradients, glows, glassmorphism, ambient/spatial backgrounds)
- Restructuring student sidebar navigation per spec
- Compact static header replacing the morphing bubble header
- Responsive/mobile audit
- All verification: 55/55 frontend tests, `tsc --noEmit` clean, live browser checks

**Out of scope:**
- New features (social feed, posts/reactions/comments, network, events, resources)
- Backend changes
- Routing, auth flows, RBAC, socket logic, API/data hooks, or business logic
- New chart libraries
- Component API changes that break existing props/tests

**Preserved:** all existing component files, routing, `AppShell`/`RoleLayout` architecture, lazy loading, `ThemeContext`, `SocketProvider`, `ProtectedRoute`, `useAsync`, API endpoints.

---

## 2. Design Tokens

Retheme the existing `:root` + `[data-theme='dark']` token blocks at the top of `styles.css`.

### Light mode

| Token | Old value | New value | Notes |
|-------|-----------|-----------|-------|
| `--color-background` / page bg | `#f7f8fc` | `#fbfbfd` | Quieter near-white |
| `--color-surface` | `#ffffff` | `#ffffff` | No change |
| `--color-surface-muted` | `#f1f3f9` | `#f6f7f9` | Slightly quieter |
| `--color-border` | `#e4e7f0` | `#e6e8ef` | Softer hairline |
| `--color-border-strong` | `#cfd5e3` | `#d7dbe6` | Tighter |
| `--color-text` | `#172033` | `#172033` | No change (charcoal-navy) |
| `--color-text-secondary` | `#647089` | `#647089` | No change |
| `--color-text-tertiary` | `#98a2b5` | `#98a2b5` | No change |
| `--color-primary` | `#635bff` | `#635bff` | Keep indigo as brand only |
| `--color-primary-hover` | `#5148e8` | `#5148e8` | No change |
| `--color-primary-soft` | `#eeecff` | `#efeffd` | Much quieter tint |
| `--color-primary-text` | `#ffffff` | `#ffffff` | No change |
| `--color-success` | `#4ade80` | `#16a34a` | Warmer, less neon |
| `--color-success-soft` | `#dcfce7` | `#dcfce7` | No change |
| `--color-warning` | `#fbbf24` | `#eab308` | Warmer amber |
| `--color-warning-soft` | `#fef3c7` | `#fef9c3` | No change |
| `--color-danger` | `#f87171` | `#dc2626` | Clearer red |
| `--color-danger-soft` | `#fee2e2` | `#fef2f2` | No change |

### Radius

| Token | Value | Notes |
|-------|-------|-------|
| `--radius-sm` | `0.375rem` (6px) | Inputs, small elements |
| `--radius-md` | `0.5rem` (8px) | Buttons, inline elements |
| `--radius-lg` | `0.75rem` (12px) | Cards, modals, panels |
| `--radius-xl` | `1rem` (16px) | Larger containers only |
| `--radius-full` | `9999px` | Pills, avatars |

### Shadows — neutral 3-tier (no tinted glows)

```
--shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
```

**Removed:** `--shadow-lg`, `--shadow-focus` (replaced with `2px primary ring at 25% opacity`), `--space-depth-*`, `--visual-accent-glow`, all glow/shadow-float tokens.

### Typography

- Body font: Inter (keep)
- Display font: **removed** — headings use Inter at medium/semibold weights
- Mono: keep JetBrains Mono
- Enforced clamp scale via component classes (no oversized headings)

### Dark mode tokens

Retheme all tokens in `[data-theme='dark']` to match the quiet palette:
- Background: `#0e1015`
- Surface: `#171a21`
- Elevated: `#1d212a`
- Borders: `#262a33`
- Text: `#ececf1`, secondary `#9aa1b0`
- Accent, success/danger semantic: mirror light mode approach

### Effect quarantine — tokens removed/neutralized

- `--glass-bg`, `--glass-border`, `--glass-blur` → remove
- `--space-depth-*` → remove
- `--bento-gap`, `--bento-radius` → keep (bento stays)
- `--visual-accent-glow`, `--visual-shadow` → remove
- All `--motion-*` easing curves → keep

---

## 3. Shell

### 3.1 Sidebar

**File:** `components/Sidebar.tsx`, `layouts/AppShell.tsx`, `core/utils/navigation.ts`

**Width:** `240px` expanded, `~68px` collapsed (icon rail). Collapse behavior **retained** via existing `is-collapsed` / `storageKey` pattern.

**Structure (student):**

```
┌──────────────────────────────────┐
│ GradTure logo/text (collapsed → logo only)
├──────────────────────────────────┤
│ MAIN                             │
│  Home (→ /student/dashboard)     │
│  Jobs                            │
│  Applications                    │
│  Messages                        │
│  Notifications                   │
│  Network (empty state)           │
├──────────────────────────────────┤
│ EXPLORE                          │
│  Companies                       │
│  Saved Jobs                      │
├──────────────────────────────────┤
│ CAREER TOOLS                     │
│  Resume                          │
│  Resume Builder                  │
│  Recommended Matches             │
│  AI Assistant                    │
│  Interviews                      │
├──────────────────────────────────┤
│ [Avatar] Name                    │
│            role  ▼               │
│             → Profile, Settings  │
└──────────────────────────────────┘
```

**Styling:**
- Surface bg (`#ffffff` light / `#171a21` dark)
- `1px` right border (`--color-border`)
- No heavy shadow
- Active link: `4px` radius background tint (`--color-primary-soft`) + `2px` left accent bar (primary)
- Icons: Phosphor `regular` weight, 20px
- Labels: Inter 13.5px/400, secondary color; active = primary color
- Hover: subtle background tint, `150ms` transition
- `nav__section-label` for group headings: `11px`, uppercase, tertiary color, `letter-spacing: 0.04em`
- Collapsed: `text-align: center`, labels hidden, tooltip via `data-tooltip` on hover

**Mobile:** existing off-canvas drawer pattern retained; overlay on `sidebarOpen`, dismiss on route change.

**Employer/Admin:** same shell, restructured nav per existing configs — same visual language, different destinations. No structural changes to `RoleLayout`/`AppShell` beyond styling.

### 3.2 Header

**File:** `components/AuthHeader.tsx`

**Replace:** the morphing bubble header (`useHeaderMorph`, `app-header--glass`, `app-header--morphing`, `app-header--bubble`) with a **static compact header**.

**Height:** fixed `56px`. No morph, no shrink, no glass-on-scroll.

**Layout:**
- Left: mobile hamburger toggle + current page name (short label, no breadcrumbs on mobile)
- Center: **global search** — `320–420px`, `placeholder: "Search jobs, companies, people…"`, launches search results (reuse existing `/jobs` and `/companies` query params)
- Right: ThemeToggle, notifications bell (badge count retained), messages icon, avatar dropdown (existing menu, restyled)

**Styling:**
- `background: var(--color-surface)`
- `border-bottom: 1px solid var(--color-border)`
- `padding: 0 var(--space-5)`
- No backdrop-filter, no glass, no shadow on scroll
- Search input: `10px` radius, bg-surface-muted, placeholder tertiary color

### 3.3 Layout frame

**Files:** `layouts/AppShell.tsx`, `components/PageContainer.tsx`

- Main content: `max-width: 1200px`, `margin: 0 auto`, `padding: var(--space-6)`
- Right contextual column (optional): `width: 320px`, only used on dashboard/analytics pages via optional `<Aside>` wrapper
- Body: `overflow-x: clip`

---

## 4. Shared Components

**Approach:** restyle class-level only in existing files; no prop/API changes.

| Component | File | Key changes |
|-----------|------|-------------|
| `Button` | `Button.tsx` | `primary`: solid indigo, no shadow/gradient. `secondary`: ghost (transparent bg, 1px border, subtle hover tint). `danger`: solid red. `ghost`: transparent, hover tint. All `10px` radius, `150ms` transition. |
| `Card` | `Card.tsx` | Collapse `spatial`/`glass`/`bento` variants to default appearance. All cards: `bg-surface`, `1px border`, `--radius-lg` (12px), `shadow-xs` optional. No gradient, glass, depth-shadow. |
| `Badge` | `Badge.tsx` | Border + soft tint fills only. Remove gradient/shimmer variants. |
| `FilterPill` | `FilterPill.tsx` | Neutral border, active = primary tint bg, no glow. |
| `JobCard` | `JobCard.tsx` | Clean border, tighter meta row, subtle hover elevation, no gradient overlay. |
| `CompanyCard` | `CompanyCard.tsx` | Same treatment. |
| `Avatar` | `Avatar.tsx` | `rounded-full`, no gradient ring. Sizes unchanged. |
| `EmptyState` | `EmptyState.tsx` | Centered, icon + title + body + one action. Quiet, no illustration. |
| `DataTable` | `DataTable.tsx` | Bordered, muted header row, no stripe, compact. Responsive → card list on mobile. |
| `Modal/Dialog` | Dialog component | `10px` radius, hairline border, bg-surface, focus ring primary 25%, no glass overlay. |
| `Dropdown` | DropdownMenu component | Same treatment. |
| `Input/Textarea` | Input/Textarea components | `10px` radius, border, focus ring primary, bg-surface-muted, `150ms` transition. |
| `Select` | Select component | Same as Input. |
| `Toast` | Toast component | Neutral bg, border, `--radius-md`, no glow. |
| `Tooltip` | Tooltip component | Subtle bg-surface-elevated, border, `--radius-sm`. |
| `KPICard` | KPICard.tsx | Value + label + optional delta + optional mini spark. Left accent bar. |
| `ProgressRing` | ProgressRing.tsx | Neutral track, primary fill, no glow. |
| `ProgressBar` | ProgressBar.tsx | Same. |
| `Sparkline` | Sparkline.tsx | Primary color line, no glow. |
| `BentoGrid/BentoItem` | BentoGrid.tsx | Keep existing; gap/radius tokens. |
| `PageHeader` | PageHeader.tsx | Clamped title at 24px, subtitle 14–15px. |
| `PhosphorIcon` | PhosphorIcon.tsx | No changes. |

### Landing/decorative components — neutralized

| Component | Action |
|-----------|--------|
| `AmbientBackground` | Renders as empty fragment (no visual) |
| `SpatialBackground` | Renders as empty fragment |
| `SpatialCard` | Falls back to default Card appearance (remove spatial class) |
| `AnimatedLogo` | Keep; reduce animation to subtle static + gentle opacity transition |
| `MorphingText` | Renders static text (no animation) |
| `Magnetic` | Renders children unchanged (no magnetic effect) |
| `discovery-*` classes | All neutralized — `.discovery-badge-shimmer`, `.discovery-floating-orb`, `.discovery-hover-preview` → static/no-op |

These components remain importable (tests pass) but are visually inert.

---

## 5. `styles.css` Sweep

The 10,069-line file is the primary target. Execution order:

### Phase 1: Token blocks (top of file)
- Retheme `:root` variables per Section 2
- Retheme `[data-theme='dark']` variables per Section 2
- Remove `--glass-*`, `--space-depth-*`, `--shadow-lg`, `--shadow-focus` tokens

### Phase 2: Decorative rules — delete/neutralize
Target the measured counts; post-sweep targets:
- `gradient` occurrences: **0** (from 106)
- `glow` occurrences: **0** (from 43)
- `backdrop-filter` occurrences: **≤2** (app-header only, if kept)
- `glass` occurrences: **0** (from 31)
- `animate` / keyframe occurrences: **≤5** (fadeIn, scaleIn, loading skeletons only)
- `Spatial` occurrences: **0** (from 3)

Delete/rewrite:
- All `.gradient-*`, `.glow-*`, `.shimmer-*` rules
- All `.glass`/`.backdrop-*` on card-like elements
- All `.discovery-floating-orb`, `.discovery-badge-shimmer`
- `Wiggle`, `MorphingText` animation rules
- Heavy `box-shadow` declarations beyond `--shadow-xs/sm/md`
- `transition: all` (replace with explicit property transitions)

### Phase 3: Shell classes rewrite
- `.sidebar__*` → spec styling per Section 3.1
- `.app-header*` → compact static per Section 3.2
- `.auth-layout`, `.auth-main`, `.auth-content`, `.auth-page` → layout frame per Section 3.3

### Phase 4: Typography normalization
- `.page-title` → `24px`, `font-weight: 600`, `line-height: 1.3`
- `.section-title` → `16–18px`, `font-weight: 500`
- `.card__title` → `14–16px`, `font-weight: 500`
- `.page-subtitle` → `14px`, `var(--color-text-secondary)`

### Phase 5: Cleanup
- Grep for orphaned class references (any `className="..."` pointing to removed rules)
- Delete dead CSS rules
- Remove unused `@keyframes`
- Confirm `gradient`, `glow`, `glass` counts at target

---

## 6. Page-Level Scope

### Priority 1 — hand-tuned

| Page | Route(s) | Treatment |
|------|----------|-----------|
| Student dashboard | `/student/dashboard` | Bento KPI + recommended matches + activity timeline + career intel. Quiet metric cards. |
| Job list | `/jobs`, `/student/jobs` | Clean bordered list, filter sidebar, results count. |
| Job detail | `/jobs/:id` | Two-column: description + sticky apply/aside. |
| Applications | `/student/applications` | Pipeline view, bordered cards, status badges. |
| Saved jobs | `/student/saved` | JobCard list. |
| Messages | `/student/messages` | Thread layout, quiet chat bubbles. |
| Notifications | `/student/notifications` | Grouped list, empty state. |
| AI Assistant | `/student/ai-assistant` | Chat pane, muted surfaces. |
| Profile/account | `/student/account` | Form cards, avatar upload. |
| Resume | `/student/resume` | Content layout. |
| Resume Builder | `/student/resume-builder` | Builder flow. |
| Recommended | `/student/recommended` | Match cards + sparkline. |
| Interviews | `/student/interviews` | Calendar/list. |
| Employer dashboard | `/employer/dashboard` | Bento metrics + applicant summary. |
| Employer manage jobs | `/employer/jobs` | JobCard list. |
| Employer post/edit job | `/employer/post-job`, `/employer/edit-job/:id` | Form cards. |
| Employer applicants | `/employer/applicants` | Pipeline. |
| Employer interviews | `/employer/interviews` | List. |
| Employer analytics | `/employer/analytics` | Bento metrics + sparklines. |
| Admin dashboard | `/admin/dashboard` | Bento metrics. |
| Admin users/jobs/apps | `/admin/users`, `/admin/jobs`, `/admin/applications` | DataTable restyled. |
| Admin analytics | `/admin/analytics` | Bento metrics. |

### Priority 2 — restyle via component sweep (no per-page changes needed)

All remaining admin pages (`AdminCompaniesPage`, `AdminReportsPage`, `AdminMonitoringPage`, `AdminNotificationsPage`, `AdminAuditLogsPage`, `AdminSettingsPage`, `AdminDatabasePage`, `AdminApiKeysPage`, `AdminEmailTemplatesPage`, `AdminCmsPage`, `AdminFeatureFlagsPage`, `AdminBackupsPage`, `AdminSecurityPage`, `AdminDeveloperToolsPage`, `AdminJobSourcesPage`, `AdminJobSourceRunsPage`). These all use shared `AdminListPage`/`DataTable`/`Card`/`PageHeader` — restyled automatically.

### Priority 3 — public/landing

| Page | Treatment |
|------|-----------|
| HomePage | Remove gradient hero/shine/orb layers; calm two-section landing, same copy. |
| AboutPage | Quiet layout, no glass cards. |
| Companies grid | Bordered cards, no shimmer. |
| Company detail | Clean content layout. |
| Login/Register | Centered quiet card on plain background (no glass/ambient). |
| Forgot/Reset/Verify | Same treatment. |
| NotFoundPage | Minimal. |
| Footer | Hairline top border, subtle text. |

### Responsive pass (global)

- `overflow-x: clip` on body
- Mobile nav drawer (existing pattern)
- All tables → card list on `< 640px`
- Bento grids → 1-col below `sm`
- Touch targets ≥ 40px
- Feed text readable at 14–15px
- Charts/sparklines resize

---

## 7. Verification

**Per-change gates:**
1. `npx tsc --noEmit` (frontend) — clean after every file touched
2. `npm test` (frontend) — 55/55 pass
3. Grep guardrails post-sweep:
   - `gradient` in styles.css: target 0
   - `glow` in styles.css: target 0
   - `glass` in styles.css: target 0
   - `backdrop-filter` in styles.css: ≤ 2
   - `animate` / `@keyframes`: ≤ 5
4. Browser-automation checks:
   - Shell renders (sidebar + header, no JS error)
   - Dashboard loads with bento
   - Jobs list renders
   - Login page renders
   - No `500` errors on static assets

**Do NOT break:** routing, auth flows, API integrations, RBAC, messaging, applications, job functionality, notifications, AI assistant.

---

## 8. Design Philosophy Alignment

The resulting app should feel:

- **Professional without being corporate** — indigo brand used sparingly, neutral palette
- **Modern without being futuristic** — no glass, glow, spatial depth
- **Data-rich without being complicated** — bento metrics, clear hierarchy, spacious
- **Social without becoming a clone** — feed-like list patterns where applicable
- **AI-powered without turning every page into AI** — chat pane in AI Assistant, sparkle only on recommended matches

New graduate immediately understands:
- Where am I? (sidebar highlight, page title)
- What should I do next? (dashboard KPIs + recommended)
- What opportunities are available? (jobs list, search)
- How am I progressing? (progress ring, activity timeline)
