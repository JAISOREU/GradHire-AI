# Student Experience Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Gradture student experience into a world-class career discovery platform with AI matching, intelligent dashboard, enhanced job search, and professional application tracking.

**Architecture:** Enhance existing design system primitives (Card, Button, KPICard) with new variants (spatial, glass, bento) and add new components (ProgressRing, BentoGrid, MatchBreakdown). Rewrite the student dashboard as a bento layout. Enhance the jobs page with feed tabs, match scores per card, and natural language search. Add application detail view with timeline. All backed by existing backend APIs.

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS (via `cn()` utility), Vitest, Prisma/PostgreSQL (backend unchanged), NestJS (backend unchanged), Phosphor Icons.

**Spec:** `docs/superpowers/specs/2026-09-11-student-experience-transformation-design.md`

## Global Constraints

- All icons: Phosphor Icons only (no Lucide, Heroicons, etc.)
- Styling: Tailwind utility classes via `cn()` from `src/lib/utils`; BEM-style CSS in `styles.css` for complex components
- TypeScript: explicit types on all props, no `any`
- Tests: Vitest with `describe`/`it`/`expect`
- No new backend changes — frontend-only transformation
- No fabricated data — empty states for missing data
- Zero horizontal overflow at 320px-430px
- `prefers-reduced-motion` respected for all animations
- Dark mode support via existing CSS custom properties
- Backend runs as `node dist/main.js`; stop before `prisma generate` (DLL lock), restart after

---

## File Structure

### New Files (23)

| File | Purpose |
|------|---------|
| `src/components/ProgressRing.tsx` | Circular progress indicator |
| `src/components/ProgressBar.tsx` | Horizontal progress bar |
| `src/components/BentoGrid.tsx` | Responsive bento grid layout |
| `src/components/SpatialCard.tsx` | Depth card with hover glow |
| `src/components/Sparkline.tsx` | Mini trend chart |
| `src/components/MatchBreakdown.tsx` | Score + breakdown bars + explanation |
| `src/components/MatchExplanation.tsx` | Why-you-match bullet list |
| `src/components/SkillGapStrip.tsx` | Career intelligence horizontal strip |
| `src/components/FilterPill.tsx` | Active filter pill with remove |
| `src/components/NLSearchInput.tsx` | Natural language search input |
| `src/components/ActivityTimeline.tsx` | Application event timeline |
| `src/components/PipelineTracker.tsx` | Application pipeline visualization |
| `src/components/JobFeedTabs.tsx` | Feed tab bar with counts |
| `src/components/JobCard.tsx` | Enhanced job card with match score |
| `src/components/CompanyCard.tsx` | Company info sidebar card |
| `src/components/SimilarJobs.tsx` | Similar jobs horizontal section |
| `src/features/student/components/DashboardWelcome.tsx` | Welcome banner |
| `src/features/student/components/DashboardKPIs.tsx` | KPI row with rings |
| `src/features/student/components/DashboardRecommended.tsx` | Recommended jobs section |
| `src/features/student/components/DashboardActivity.tsx` | Activity timeline section |
| `src/features/student/components/DashboardCareerIntel.tsx` | Career intelligence strip |
| `src/features/student/components/ApplicationDetail.tsx` | Application detail view |
| `src/components/ProgressRing.test.tsx` | Tests for ProgressRing |
| `src/components/ProgressBar.test.tsx` | Tests for ProgressBar |
| `src/components/BentoGrid.test.tsx` | Tests for BentoGrid |

### Modified Files (12)

| File | Changes |
|------|---------|
| `src/styles.css` | Add design tokens, new component styles |
| `src/components/Card.tsx` | Add `variant` prop (spatial/glass/bento) |
| `src/components/Button.tsx` | Add `loading` animation, hover elevation |
| `src/components/Badge.tsx` | Add `pulse` variant |
| `src/components/PageHeader.tsx` | Add `subtitle`, `breadcrumbs`, `actions` |
| `src/components/KPICard.tsx` | Add `sparkline`, `comparison` props |
| `src/components/EmptyState.tsx` | Add `icon`, `action`, `illustration` |
| `src/features/student/StudentDashboardPage.tsx` | Complete rewrite |
| `src/features/student/StudentJobsPage.tsx` | Enhance with tabs, NL, match scores |
| `src/features/student/JobDetailPanel.tsx` | Add match breakdown, similar jobs |
| `src/features/jobs/JobDetailPage.tsx` | Add sidebar, match, save, similar |
| `src/features/student/StudentApplicationsPage.tsx` | Add timeline, detail view, search |
| `src/routing/AppRoutes.tsx` | Add `/student/applications/:id` route |

---

## Phase 1: Design System Foundation

### Task 1: Design Tokens

**Files:**
- Modify: `src/styles.css` (append to `:root` blocks)

**Interfaces:**
- Consumes: nothing
- Produces: CSS custom properties used by all subsequent components

- [ ] **Step 1: Add spatial depth tokens**

Append to the first `:root` block in `styles.css`:

```css
/* Spatial depth */
--space-depth-sm: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06);
--space-depth-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--space-depth-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--space-depth-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
--space-depth-glow: 0 0 20px rgba(99, 102, 241, 0.15);

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

- [ ] **Step 2: Add dark mode overrides**

In the `[data-theme="dark"]` or `.dark` `:root` block, add:

```css
--space-depth-sm: 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2);
--space-depth-md: 0 4px 6px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
--space-depth-lg: 0 10px 15px rgba(0, 0, 0, 0.4), 0 4px 6px rgba(0, 0, 0, 0.2);
--space-depth-xl: 0 20px 25px rgba(0, 0, 0, 0.5), 0 10px 10px rgba(0, 0, 0, 0.3);
--space-depth-glow: 0 0 20px rgba(99, 102, 241, 0.25);
--glass-bg: rgba(15, 15, 25, 0.7);
--glass-border: rgba(255, 255, 255, 0.08);
```

- [ ] **Step 3: Verify tokens load**

Run: `npx tsc --noEmit` in `frontend/`
Expected: clean

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles.css
git commit -m "feat(design): add spatial depth, glass, bento, and motion tokens"
```

---

### Task 2: ProgressRing Component

**Files:**
- Create: `src/components/ProgressRing.tsx`
- Create: `src/components/ProgressRing.test.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<ProgressRing value={87} size="lg" />` used by Dashboard, Jobs, Job Detail

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressRing } from './ProgressRing';

describe('ProgressRing', () => {
  it('renders the percentage text', () => {
    render(<ProgressRing value={87} />);
    expect(screen.getByText('87%')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<ProgressRing value={72} label="Profile" />);
    expect(screen.getByText('72%')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('clamps value to 0-100', () => {
    const { rerender } = render(<ProgressRing value={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
    rerender(<ProgressRing value={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('applies size classes', () => {
    const { rerender } = render(<ProgressRing value={50} size="sm" />);
    const svg = screen.getByRole('img');
    expect(svg.getAttribute('width')).toBe('32');
    rerender(<ProgressRing value={50} size="lg" />);
    expect(screen.getByRole('img').getAttribute('width')).toBe('64');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ProgressRing.test.tsx`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```tsx
import { cn } from '../lib/utils';

type Size = 'sm' | 'md' | 'lg';

type ProgressRingProps = {
  value: number;
  size?: Size;
  label?: string;
  className?: string;
};

const SIZE_MAP: Record<Size, { dimension: number; strokeWidth: number; fontSize: string }> = {
  sm: { dimension: 32, strokeWidth: 3, fontSize: 'text-xs' },
  md: { dimension: 48, strokeWidth: 4, fontSize: 'text-sm' },
  lg: { dimension: 64, strokeWidth: 5, fontSize: 'text-lg' },
};

function getColor(value: number): string {
  if (value >= 80) return 'var(--color-success, #22c55e)';
  if (value >= 60) return 'var(--color-warning, #eab308)';
  return 'var(--color-danger, #ef4444)';
}

export const ProgressRing = ({ value, size = 'md', label, className }: ProgressRingProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const { dimension, strokeWidth, fontSize } = SIZE_MAP[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = getColor(clamped);

  return (
    <div className={cn('inline-flex flex-col items-center gap-1', className)}>
      <svg
        width={dimension}
        height={dimension}
        viewBox={`0 0 ${dimension} ${dimension}`}
        role="img"
        aria-label={`${clamped}%`}
      >
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border opacity-20"
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${dimension / 2} ${dimension / 2})`}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={cn('font-semibold text-text', fontSize)}>{clamped}%</span>
      {label && <span className="text-xs text-text-secondary">{label}</span>}
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ProgressRing.test.tsx`
Expected: PASS (4/4)

- [ ] **Step 5: Commit**

```bash
git add src/components/ProgressRing.tsx src/components/ProgressRing.test.tsx
git commit -m "feat(ui): add ProgressRing component with size variants and color thresholds"
```

---

### Task 3: ProgressBar Component

**Files:**
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/ProgressBar.test.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<ProgressBar value={95} label="Skills" />` used by MatchBreakdown

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders label and value', () => {
    render(<ProgressBar value={82} label="Experience" />);
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
  });

  it('sets aria attributes', () => {
    render(<ProgressBar value={75} label="Test" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '75');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('hides value when showValue is false', () => {
    render(<ProgressBar value={50} label="Test" showValue={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ProgressBar.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```tsx
import { cn } from '../lib/utils';

type ProgressBarProps = {
  value: number;
  label: string;
  showValue?: boolean;
  className?: string;
};

export const ProgressBar = ({ value, label, showValue = true, className }: ProgressBarProps) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">{label}</span>
        {showValue && <span className="text-sm text-text-secondary">{clamped}%</span>}
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ProgressBar.test.tsx`
Expected: PASS (3/3)

- [ ] **Step 5: Commit**

```bash
git add src/components/ProgressBar.tsx src/components/ProgressBar.test.tsx
git commit -m "feat(ui): add ProgressBar component with label and aria support"
```

---

### Task 4: BentoGrid Component

**Files:**
- Create: `src/components/BentoGrid.tsx`
- Create: `src/components/BentoGrid.test.tsx`

**Interfaces:**
- Consumes: nothing (standalone layout)
- Produces: `<BentoGrid columns={4}>` wrapping dashboard sections

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BentoGrid, BentoItem } from './BentoGrid';

describe('BentoGrid', () => {
  it('renders children in a grid', () => {
    render(
      <BentoGrid columns={2}>
        <BentoItem>First</BentoItem>
        <BentoItem>Second</BentoItem>
      </BentoGrid>
    );
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('applies column span', () => {
    const { container } = render(
      <BentoGrid columns={4}>
        <BentoItem span={2}>Wide</BentoItem>
        <BentoItem>Narrow</BentoItem>
      </BentoGrid>
    );
    const items = container.querySelectorAll('[data-bento-item]');
    expect(items[0].className).toContain('col-span-2');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/BentoGrid.test.tsx`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```tsx
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type BentoGridProps = {
  columns?: 2 | 3 | 4;
  gap?: string;
  className?: string;
  children: ReactNode;
};

const COL_CLASSES: Record<number, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

export const BentoGrid = ({ columns = 4, className, children }: BentoGridProps) => (
  <div className={cn('grid gap-4', COL_CLASSES[columns], className)} style={{ gap: 'var(--bento-gap, 16px)' }}>
    {children}
  </div>
);

type BentoItemProps = {
  span?: 1 | 2 | 3 | 4;
  className?: string;
  children: ReactNode;
};

export const BentoItem = ({ span = 1, className, children }: BentoItemProps) => (
  <div data-bento-item className={cn(`col-span-${span}`, className)}>
    {children}
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/BentoGrid.test.tsx`
Expected: PASS

- [ ] **Step 5: Run all frontend tests**

Run: `npx vitest run` in `frontend/`
Expected: All pass

- [ ] **Step 6: Commit**

```bash
git add src/components/BentoGrid.tsx src/components/BentoGrid.test.tsx
git commit -m "feat(ui): add BentoGrid responsive layout component"
```

---

## Phase 2: Card Enhancements + SpatialCard

### Task 5: Card Variant Enhancements

**Files:**
- Modify: `src/components/Card.tsx`

**Interfaces:**
- Consumes: design tokens from Task 1
- Produces: `<Card variant="spatial">`, `<Card variant="glass">`, `<Card variant="bento">` used everywhere

- [ ] **Step 1: Add variant prop to Card**

Edit `Card.tsx` — add `variant` to the type and apply classes:

```tsx
type CardVariant = 'default' | 'spatial' | 'glass' | 'bento';

type CardProps = {
  // ... existing props ...
  variant?: CardVariant;
};

// In the component, compute variantClasses:
const variantClasses: Record<CardVariant, string> = {
  default: '',
  spatial: 'shadow-[var(--space-depth-md)] border-border/50 hover:shadow-[var(--space-depth-lg)] transition-shadow duration-300',
  glass: 'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)] border-[var(--glass-border)]',
  bento: 'rounded-[var(--bento-radius,16px)]',
};
```

Add `variantClasses[variant]` to the `cn()` call in the base classes.

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/Card.tsx
git commit -m "feat(ui): add spatial, glass, and bento variants to Card"
```

---

### Task 6: SpatialCard with Hover Glow

**Files:**
- Create: `src/components/SpatialCard.tsx`

**Interfaces:**
- Consumes: design tokens from Task 1
- Produces: `<SpatialCard>` used on dashboard and job cards

- [ ] **Step 1: Write implementation**

```tsx
import { useRef, type ReactNode } from 'react';
import { cn } from '../lib/utils';

type SpatialCardProps = {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

export const SpatialCard = ({ className, children, onClick }: SpatialCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50 bg-surface p-5',
        'shadow-[var(--space-depth-md)] transition-all duration-300',
        'hover:shadow-[var(--space-depth-lg)] hover:-translate-y-0.5',
        'hover:border-primary/20',
        'before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300',
        'before:bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(99,102,241,0.06),transparent_60%)]',
        'hover:before:opacity-100',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/SpatialCard.tsx
git commit -m "feat(ui): add SpatialCard with depth shadow and cursor-follow glow"
```

---

### Task 7: Button Loading + Hover Elevation

**Files:**
- Modify: `src/components/Button.tsx`

**Interfaces:**
- Consumes: existing Button API
- Produces: enhanced Button with loading animation

- [ ] **Step 1: Enhance Button**

The Button already has a `loading` prop with a spinner. Add hover elevation by appending to the base classes:

```tsx
const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-[1px] hover:-translate-y-[1px] hover:shadow-md';
```

This adds `transition-all`, `hover:-translate-y-[1px]`, and `hover:shadow-md` to all buttons.

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/Button.tsx
git commit -m "feat(ui): add hover elevation micro-interaction to Button"
```

---

### Task 8: Badge Pulse + PageHeader + KPICard + EmptyState Enhancements

**Files:**
- Modify: `src/components/Badge.tsx`
- Modify: `src/components/PageHeader.tsx`
- Modify: `src/components/KPICard.tsx`
- Modify: `src/components/EmptyState.tsx`

**Interfaces:**
- Consumes: existing component APIs
- Produces: enhanced components used by dashboard and applications

- [ ] **Step 1: Add pulse variant to Badge**

In `Badge.tsx`, add a `pulse` prop. When true, render a small animated dot before the label:

```tsx
{pulse && <span className="mr-1.5 h-2 w-2 rounded-full bg-current animate-pulse" aria-hidden="true" />}
```

- [ ] **Step 2: Add subtitle, breadcrumbs, actions to PageHeader**

In `PageHeader.tsx`, add:
- `subtitle?: string` — rendered below title
- `breadcrumbs?: Array<{ label: string; href?: string }>` — rendered above title as clickable links
- `actions?: ReactNode` — rendered on the right side

- [ ] **Step 3: Add sparkline and comparison to KPICard**

In `KPICard.tsx`, add:
- `sparkline?: ReactNode` — rendered in the footer area
- `comparison?: string` — rendered as secondary text next to trend (e.g., "vs last week")

- [ ] **Step 4: Add icon, action, illustration to EmptyState**

In `EmptyState.tsx`, add:
- `icon?: ReactNode` — large icon above title
- `action?: { label: string; onClick: () => void }` — CTA button
- `illustration?: ReactNode` — illustration slot

- [ ] **Step 5: Run tsc + tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: all clean

- [ ] **Step 6: Commit**

```bash
git add src/components/Badge.tsx src/components/PageHeader.tsx src/components/KPICard.tsx src/components/EmptyState.tsx
git commit -m "feat(ui): enhance Badge, PageHeader, KPICard, EmptyState with new props"
```

---

## Phase 3: Data Visualization + Match Components

### Task 9: Sparkline Component

**Files:**
- Create: `src/components/Sparkline.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<Sparkline data={[1,3,2,5,4,7,6]} />` used by KPICard

- [ ] **Step 1: Write implementation**

```tsx
import { cn } from '../lib/utils';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
};

export const Sparkline = ({ data, width = 80, height = 24, color, className }: SparklineProps) => {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('flex-shrink-0', className)}
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color || 'var(--color-primary, #6366f1)'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/Sparkline.tsx
git commit -m "feat(ui): add Sparkline mini trend chart component"
```

---

### Task 10: MatchBreakdown Component

**Files:**
- Create: `src/components/MatchBreakdown.tsx`

**Interfaces:**
- Consumes: `ProgressRing` (Task 2), `ProgressBar` (Task 3)
- Produces: `<MatchBreakdown score={87} skills={95} experience={82} education={90} preferences={86} />` used by Job Detail sidebar

- [ ] **Step 1: Write implementation**

```tsx
import { ProgressRing } from './ProgressRing';
import { ProgressBar } from './ProgressBar';

type MatchBreakdownProps = {
  score: number;
  skills: number;
  experience: number;
  education: number;
  preferences: number;
};

export const MatchBreakdown = ({ score, skills, experience, education, preferences }: MatchBreakdownProps) => (
  <div className="space-y-4">
    <div className="flex justify-center">
      <ProgressRing value={score} size="lg" />
    </div>
    <div className="space-y-3">
      <ProgressBar value={skills} label="Skills" />
      <ProgressBar value={experience} label="Experience" />
      <ProgressBar value={education} label="Education" />
      <ProgressBar value={preferences} label="Preferences" />
    </div>
  </div>
);
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/MatchBreakdown.tsx
git commit -m "feat(ui): add MatchBreakdown score + category bars component"
```

---

### Task 11: MatchExplanation + SkillGapStrip + FilterPill

**Files:**
- Create: `src/components/MatchExplanation.tsx`
- Create: `src/components/SkillGapStrip.tsx`
- Create: `src/components/FilterPill.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: used by Job Detail, Dashboard, Jobs page

- [ ] **Step 1: Write MatchExplanation**

```tsx
import { PhosphorIcon } from './PhosphorIcon';

type MatchExplanationProps = {
  matched?: string[];
  gaps?: string[];
};

export const MatchExplanation = ({ matched = [], gaps = [] }: MatchExplanationProps) => (
  <div className="space-y-2">
    {matched.length > 0 && (
      <div>
        <p className="text-xs font-medium text-text-secondary mb-1">Why this matches you</p>
        <ul className="space-y-1">
          {matched.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text">
              <PhosphorIcon name="Check" size={14} weight="fill" className="mt-0.5 text-success flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
    {gaps.length > 0 && (
      <div>
        <p className="text-xs font-medium text-text-secondary mb-1">Skills to strengthen</p>
        <ul className="space-y-1">
          {gaps.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-text">
              <PhosphorIcon name="Plus" size={14} weight="fill" className="mt-0.5 text-warning flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);
```

- [ ] **Step 2: Write SkillGapStrip**

```tsx
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type SkillGapStripProps = {
  currentSkills: string[];
  gaps: string[];
  recommendations?: ReactNode;
  className?: string;
};

export const SkillGapStrip = ({ currentSkills, gaps, recommendations, className }: SkillGapStripProps) => (
  <div className={cn('flex items-start gap-6 overflow-x-auto py-2', className)}>
    <div className="flex-shrink-0">
      <p className="text-xs font-medium text-text-secondary mb-2">Current Skills</p>
      <div className="flex flex-wrap gap-1.5">
        {currentSkills.map((s) => (
          <span key={s} className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{s}</span>
        ))}
      </div>
    </div>
    {gaps.length > 0 && (
      <div className="flex-shrink-0">
        <p className="text-xs font-medium text-text-secondary mb-2">Skill Gaps</p>
        <div className="flex flex-wrap gap-1.5">
          {gaps.map((s) => (
            <span key={s} className="inline-flex items-center rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">{s}</span>
          ))}
        </div>
      </div>
    )}
    {recommendations && (
      <div className="flex-shrink-0">
        <p className="text-xs font-medium text-text-secondary mb-2">Recommended</p>
        {recommendations}
      </div>
    )}
  </div>
);
```

- [ ] **Step 3: Write FilterPill**

```tsx
import { PhosphorIcon } from './PhosphorIcon';
import { cn } from '../lib/utils';

type FilterPillProps = {
  label: string;
  onRemove: () => void;
  className?: string;
};

export const FilterPill = ({ label, onRemove, className }: FilterPillProps) => (
  <span className={cn('inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary', className)}>
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
      aria-label={`Remove ${label} filter`}
    >
      <PhosphorIcon name="X" size={12} weight="bold" />
    </button>
  </span>
);
```

- [ ] **Step 4: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 5: Commit**

```bash
git add src/components/MatchExplanation.tsx src/components/SkillGapStrip.tsx src/components/FilterPill.tsx
git commit -m "feat(ui): add MatchExplanation, SkillGapStrip, and FilterPill components"
```

---

## Phase 4: Student Dashboard

### Task 12: DashboardWelcome Component

**Files:**
- Create: `src/features/student/components/DashboardWelcome.tsx`

**Interfaces:**
- Consumes: `user` from AuthContext
- Produces: welcome banner rendered at top of dashboard

- [ ] **Step 1: Write implementation**

```tsx
import type { ReactNode } from 'react';

type DashboardWelcomeProps = {
  name: string;
  subtitle?: string;
  children?: ReactNode;
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export const DashboardWelcome = ({ name, subtitle, children }: DashboardWelcomeProps) => (
  <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 border border-primary/10">
    <div className="relative z-10">
      <h1 className="text-2xl font-bold text-text sm:text-3xl">
        {getGreeting()}, {name}
      </h1>
      <p className="mt-1 text-text-secondary">
        {subtitle || "Here's what's happening with your career search."}
      </p>
      {children}
    </div>
  </section>
);
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/components/DashboardWelcome.tsx
git commit -m "feat(student): add DashboardWelcome banner component"
```

---

### Task 13: DashboardKPIs Component

**Files:**
- Create: `src/features/student/components/DashboardKPIs.tsx`

**Interfaces:**
- Consumes: `ProgressRing` (Task 2), `KPICard` (existing), `Sparkline` (Task 9)
- Produces: KPI row for dashboard

- [ ] **Step 1: Write implementation**

```tsx
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../../../components/ProgressRing';
import { Sparkline } from '../../../components/Sparkline';
import { BentoGrid, BentoItem } from '../../../components/BentoGrid';

type KPIData = {
  profileStrength: number;
  matchScore: number;
  applicationsInProgress: number;
  savedJobs: number;
};

type DashboardKPIsProps = {
  data: KPIData;
};

export const DashboardKPIs = ({ data }: DashboardKPIsProps) => {
  const navigate = useNavigate();

  return (
    <BentoGrid columns={4}>
      <BentoItem>
        <button
          onClick={() => navigate('/student/account')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">Profile Strength</p>
          <ProgressRing value={data.profileStrength} size="md" />
        </button>
      </BentoItem>

      <BentoItem>
        <button
          onClick={() => navigate('/student/recommended')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">AI Match Score</p>
          <ProgressRing value={data.matchScore} size="md" />
        </button>
      </BentoItem>

      <BentoItem>
        <button
          onClick={() => navigate('/student/applications')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">In Progress</p>
          <p className="text-3xl font-bold text-text">{data.applicationsInProgress}</p>
          <p className="text-xs text-text-secondary mt-1">applications</p>
        </button>
      </BentoItem>

      <BentoItem>
        <button
          onClick={() => navigate('/student/saved')}
          className="w-full text-left rounded-xl border border-border/50 bg-surface p-4 shadow-[var(--space-depth-sm)] hover:shadow-[var(--space-depth-md)] transition-all duration-200 hover:-translate-y-0.5"
        >
          <p className="text-xs font-medium text-text-secondary mb-2">Saved Jobs</p>
          <p className="text-3xl font-bold text-text">{data.savedJobs}</p>
          <p className="text-xs text-text-secondary mt-1">jobs saved</p>
        </button>
      </BentoItem>
    </BentoGrid>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/components/DashboardKPIs.tsx
git commit -m "feat(student): add DashboardKPIs with ProgressRing and navigation"
```

---

### Task 14: DashboardRecommended Component

**Files:**
- Create: `src/features/student/components/DashboardRecommended.tsx`

**Interfaces:**
- Consumes: `ProgressRing` (Task 2), `MatchExplanation` (Task 11), `recommendationsApi.ai()`
- Produces: recommended jobs section for dashboard

- [ ] **Step 1: Write implementation**

```tsx
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from '../../../components/ProgressRing';
import { PhosphorIcon } from '../../../components/PhosphorIcon';

type RecommendedJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  matchScore: number;
  matchedSkills?: string[];
  missingSkills?: string[];
};

type DashboardRecommendedProps = {
  jobs: RecommendedJob[];
  loading?: boolean;
};

export const DashboardRecommended = ({ jobs, loading }: DashboardRecommendedProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-surface-muted mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-surface-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-text">Recommended For You</h2>
        <button
          onClick={() => navigate('/student/recommended')}
          className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
        >
          View all <PhosphorIcon name="ArrowRight" size={14} />
        </button>
      </div>
      {jobs.length === 0 ? (
        <p className="text-sm text-text-secondary py-4 text-center">
          Complete your profile to get AI-powered job recommendations.
        </p>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="w-full text-left flex items-start gap-3 rounded-lg border border-border/30 p-3 hover:bg-surface-muted/50 transition-colors"
            >
              <ProgressRing value={job.matchScore} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{job.title}</p>
                <p className="text-xs text-text-secondary">{job.company} · {job.location}</p>
                {job.matchedSkills && job.matchedSkills.length > 0 && (
                  <p className="text-xs text-success mt-1">
                    Matches: {job.matchedSkills.slice(0, 3).join(', ')}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/components/DashboardRecommended.tsx
git commit -m "feat(student): add DashboardRecommended with match scores"
```

---

### Task 15: DashboardActivity Component

**Files:**
- Create: `src/features/student/components/DashboardActivity.tsx`

**Interfaces:**
- Consumes: `ActivityTimeline` (will create inline), application data
- Produces: activity section for dashboard

- [ ] **Step 1: Write implementation**

```tsx
import { useNavigate } from 'react-router-dom';
import { PhosphorIcon } from '../../../components/PhosphorIcon';

type ActivityEvent = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  jobTitle?: string;
};

type DashboardActivityProps = {
  events: ActivityEvent[];
  upcomingInterviews?: Array<{ id: string; jobTitle: string; scheduledAt: string }>;
  loading?: boolean;
};

const EVENT_ICONS: Record<string, string> = {
  applied: 'PaperPlaneRight',
  viewed: 'Eye',
  screening: 'MagnifyingGlass',
  interview: 'Calendar',
  offer: 'Handshake',
  rejected: 'XCircle',
  hired: 'CheckCircle',
};

export const DashboardActivity = ({ events, upcomingInterviews = [], loading }: DashboardActivityProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <div className="h-5 w-40 animate-pulse rounded bg-surface-muted mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-surface-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5">
      <h2 className="text-base font-semibold text-text mb-4">Your Activity</h2>

      {upcomingInterviews.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-text-secondary">Upcoming Interviews</p>
          {upcomingInterviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2.5"
            >
              <PhosphorIcon name="Calendar" size={16} weight="fill" className="text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{interview.jobTitle}</p>
                <p className="text-xs text-text-secondary">
                  {new Date(interview.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-sm text-text-secondary py-4 text-center">
          Start exploring jobs to see your activity here.
        </p>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => {
            const iconName = EVENT_ICONS[event.type] || 'Clock';
            return (
              <div key={event.id} className="flex items-start gap-2.5 py-1.5">
                <PhosphorIcon name={iconName} size={16} weight="fill" className="mt-0.5 text-text-secondary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text">{event.message}</p>
                  <p className="text-xs text-text-secondary">
                    {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {events.length > 0 && (
        <button
          onClick={() => navigate('/student/applications')}
          className="mt-3 text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
        >
          View all applications <PhosphorIcon name="ArrowRight" size={14} />
        </button>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/components/DashboardActivity.tsx
git commit -m "feat(student): add DashboardActivity with timeline and interview cards"
```

---

### Task 16: DashboardCareerIntel Component

**Files:**
- Create: `src/features/student/components/DashboardCareerIntel.tsx`

**Interfaces:**
- Consumes: `SkillGapStrip` (Task 11)
- Produces: career intelligence strip for dashboard

- [ ] **Step 1: Write implementation**

```tsx
import { SkillGapStrip } from '../../../components/SkillGapStrip';

type DashboardCareerIntelProps = {
  currentSkills: string[];
  gaps: string[];
  loading?: boolean;
};

export const DashboardCareerIntel = ({ currentSkills, gaps, loading }: DashboardCareerIntelProps) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-surface-muted mb-4" />
        <div className="h-10 animate-pulse rounded bg-surface-muted" />
      </div>
    );
  }

  if (currentSkills.length === 0) {
    return (
      <div className="rounded-xl border border-border/50 bg-surface p-5">
        <h2 className="text-base font-semibold text-text mb-2">Career Intelligence</h2>
        <p className="text-sm text-text-secondary text-center py-2">
          Complete your profile to unlock career intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-surface p-5">
      <h2 className="text-base font-semibold text-text mb-3">Career Intelligence</h2>
      <SkillGapStrip currentSkills={currentSkills} gaps={gaps} />
    </div>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/components/DashboardCareerIntel.tsx
git commit -m "feat(student): add DashboardCareerIntel strip"
```

---

### Task 17: Rewrite StudentDashboardPage

**Files:**
- Modify: `src/features/student/StudentDashboardPage.tsx`

**Interfaces:**
- Consumes: all dashboard components (Tasks 12-16), existing API endpoints
- Produces: fully rewritten dashboard page

- [ ] **Step 1: Rewrite the page**

Replace the entire file content. The new page:

1. Calls APIs independently (no blanket loading state)
2. Renders sections in BentoGrid
3. Each section has its own loading/error state
4. Removes dead API calls

Key structure:
```tsx
import { useState, useEffect } from 'react';
import { PageContainer } from '../../components/PageContainer';
import { DashboardWelcome } from './components/DashboardWelcome';
import { DashboardKPIs } from './components/DashboardKPIs';
import { DashboardRecommended } from './components/DashboardRecommended';
import { DashboardActivity } from './components/DashboardActivity';
import { DashboardCareerIntel } from './components/DashboardCareerIntel';
import { BentoGrid, BentoItem } from '../../components/BentoGrid';
import { useAuth } from '../../contexts/AuthContext';
import { recommendationsApi } from '../../core/api/endpoints/jobs';
import { studentsApi, savedJobsApi } from '../../core/api/endpoints/students';
import { interviewsApi } from '../../core/api/endpoints/interviews';
import { aiApi } from '../../core/api/endpoints/ai';

export const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completeness, setCompleteness] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [savedCount, setSavedCount] = useState(0);
  const [interviews, setInterviews] = useState([]);
  const [skillGaps, setSkillGaps] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Parallel independent fetches
    Promise.allSettled([
      studentsApi.getProfile().then(setProfile),
      studentsApi.getProfileCompleteness().then(setCompleteness),
      studentsApi.listApplications().then(setApplications),
      recommendationsApi.ai(3).then(setRecommendations),
      savedJobsApi.listMine(1).then((r) => setSavedCount(r.total || 0)),
      interviewsApi.getMyInterviews().then(setInterviews),
      aiApi.skillsGap().then(setSkillGaps).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  // Compute KPI data from fetched data
  const inProgress = applications.filter(a => !['HIRED', 'REJECTED', 'WITHDRAWN'].includes(a.status)).length;
  const matchScore = recommendations.length > 0
    ? Math.round(recommendations.reduce((sum, r) => sum + (r.matchScore || 0), 0) / recommendations.length)
    : 0;

  // Build activity events from applications
  const activityEvents = applications
    .flatMap(a => (a.history || []).map(h => ({ ...h, jobTitle: a.job?.title })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <PageContainer>
      <div className="space-y-6">
        <DashboardWelcome name={user?.name?.split(' ')[0] || 'there'} />

        <DashboardKPIs data={{
          profileStrength: completeness?.percentage || 0,
          matchScore,
          applicationsInProgress: inProgress,
          savedJobs: savedCount,
        }} />

        <BentoGrid columns={2}>
          <BentoItem span={1}>
            <DashboardRecommended
              jobs={recommendations.map(r => ({
                id: r.jobId,
                title: r.job?.title || 'Untitled',
                company: r.job?.company || '',
                location: r.job?.city || '',
                matchScore: r.matchScore || 0,
              }))}
              loading={loading}
            />
          </BentoItem>
          <BentoItem span={1}>
            <DashboardActivity
              events={activityEvents}
              upcomingInterviews={interviews
                .filter(i => i.status === 'SCHEDULED')
                .slice(0, 3)
                .map(i => ({ id: i.id, jobTitle: i.application?.job?.title || '', scheduledAt: i.scheduledAt }))}
              loading={loading}
            />
          </BentoItem>
        </BentoGrid>

        <DashboardCareerIntel
          currentSkills={profile?.skills?.slice(0, 5) || []}
          gaps={skillGaps?.gaps?.map(g => g.skill) || []}
          loading={loading}
        />
      </div>
    </PageContainer>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean (may need to adjust imports based on actual API module exports)

- [ ] **Step 3: Run vitest**

Run: `npx vitest run`
Expected: all pass

- [ ] **Step 4: Commit**

```bash
git add src/features/student/StudentDashboardPage.tsx
git commit -m "feat(student): rewrite dashboard with bento layout, AI match, activity timeline"
```

---

## Phase 5: Jobs Page Enhancements

### Task 18: JobFeedTabs Component

**Files:**
- Create: `src/components/JobFeedTabs.tsx`

**Interfaces:**
- Consumes: nothing (standalone tab bar)
- Produces: `<JobFeedTabs active="match" onChange={...} />` used by StudentJobsPage

- [ ] **Step 1: Write implementation**

```tsx
import { cn } from '../lib/utils';

type Tab = {
  key: string;
  label: string;
  count?: number;
};

type JobFeedTabsProps = {
  tabs: Tab[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
};

export const JobFeedTabs = ({ tabs, active, onChange, className }: JobFeedTabsProps) => (
  <div className={cn('flex gap-1 overflow-x-auto border-b border-border', className)} role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        role="tab"
        aria-selected={active === tab.key}
        onClick={() => onChange(tab.key)}
        className={cn(
          'flex-shrink-0 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
          active === tab.key
            ? 'border-primary text-primary'
            : 'border-transparent text-text-secondary hover:text-text hover:border-border'
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn(
            'ml-1.5 rounded-full px-1.5 py-0.5 text-xs',
            active === tab.key ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-text-secondary'
          )}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/JobFeedTabs.tsx
git commit -m "feat(ui): add JobFeedTabs component with count badges"
```

---

### Task 19: NLSearchInput Component

**Files:**
- Create: `src/components/NLSearchInput.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<NLSearchInput onParse={filters => ...} />` used by StudentJobsPage

- [ ] **Step 1: Write implementation**

```tsx
import { useState } from 'react';
import { PhosphorIcon } from './PhosphorIcon';
import { cn } from '../lib/utils';

type ParsedFilters = {
  keywords: string[];
  location: string;
  experience: string;
  workplace: string;
};

type NLSearchInputProps = {
  onParse: (filters: ParsedFilters) => void;
  className?: string;
};

function parseNaturalLanguage(input: string): ParsedFilters {
  const lower = input.toLowerCase();
  const filters: ParsedFilters = { keywords: [], location: '', experience: '', workplace: '' };

  // Extract workplace type
  if (/\b(remote|wfh|work from home)\b/.test(lower)) filters.workplace = 'REMOTE';
  else if (/\b(onsite|on-site|in-office)\b/.test(lower)) filters.workplace = 'ONSITE';
  else if (/\bhybrid\b/.test(lower)) filters.workplace = 'HYBRID';

  // Extract experience level
  if (/\b(senior|sr\.?)\b/.test(lower)) filters.experience = 'SENIOR';
  else if (/\b(mid|middle)\b/.test(lower)) filters.experience = 'MID';
  else if (/\b(junior|jr\.?|entry|fresh|graduate)\b/.test(lower)) filters.experience = 'JUNIOR';

  // Extract location (common Philippine cities + generic)
  const locationMatch = lower.match(/(?:near|in|at|around|located in)\s+([a-z\s]+?)(?:\s+with|\s+and|\s+for|$)/);
  if (locationMatch) filters.location = locationMatch[1].trim();

  // Extract tech keywords
  const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 'java', 'typescript', 'javascript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'flutter', 'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'graphql', 'rest', 'api', 'frontend', 'backend', 'fullstack', 'full-stack', 'devops', 'mobile', 'ios', 'android'];
  for (const kw of techKeywords) {
    if (lower.includes(kw)) filters.keywords.push(kw);
  }

  return filters;
}

export const NLSearchInput = ({ onParse, className }: NLSearchInputProps) => {
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const parsed = parseNaturalLanguage(input);
    onParse(parsed);
  };

  return (
    <div className={cn('relative', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <PhosphorIcon name="MagicWand" size={16} weight="fill" className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setTimeout(() => setShowHint(false), 200)}
          placeholder='Try: "junior React jobs near Manila with remote options"'
          className="w-full rounded-lg border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-text placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-text hover:bg-primary-hover transition-colors"
        >
          Search
        </button>
      </form>
      {showHint && !input && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-surface p-3 shadow-lg">
          <p className="text-xs text-text-secondary mb-2">Examples:</p>
          <ul className="space-y-1">
            {[
              'junior React jobs near Manila with remote options',
              'senior Python developer hybrid',
              'entry-level frontend roles',
            ].map((ex) => (
              <li key={ex}>
                <button
                  type="button"
                  onMouseDown={() => { setInput(ex); }}
                  className="text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  {ex}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/NLSearchInput.tsx
git commit -m "feat(ui): add NLSearchInput with client-side natural language parsing"
```

---

### Task 20: JobCard Component

**Files:**
- Create: `src/components/JobCard.tsx`

**Interfaces:**
- Consumes: `ProgressRing` (Task 2)
- Produces: `<JobCard job={...} />` used by StudentJobsPage

- [ ] **Step 1: Write implementation**

```tsx
import { ProgressRing } from './ProgressRing';
import { PhosphorIcon } from './PhosphorIcon';
import { cn } from '../lib/utils';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  workplaceType?: string;
  experienceLevel?: string;
  matchScore?: number;
  postedAt?: string;
  deadline?: string;
  isSaved?: boolean;
  isApplied?: boolean;
};

type JobCardProps = {
  job: Job;
  selected?: boolean;
  onClick: () => void;
  onToggleSave?: () => void;
  className?: string;
};

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function daysUntilDeadline(date: string): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
}

export const JobCard = ({ job, selected, onClick, onToggleSave, className }: JobCardProps) => {
  const deadlineDays = job.deadline ? daysUntilDeadline(job.deadline) : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border p-4 transition-all duration-200',
        selected
          ? 'border-primary bg-primary/5 shadow-[var(--space-depth-md)]'
          : 'border-border/50 bg-surface hover:bg-surface-muted/50 hover:shadow-[var(--space-depth-sm)]',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {job.matchScore !== undefined && (
          <ProgressRing value={job.matchScore} size="sm" className="flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-text truncate">{job.title}</p>
            {onToggleSave && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
                className="flex-shrink-0 p-1 rounded-md hover:bg-surface-muted transition-colors"
                aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
              >
                <PhosphorIcon
                  name={job.isSaved ? 'Heart' : 'Heart'}
                  size={16}
                  weight={job.isSaved ? 'fill' : 'regular'}
                  className={job.isSaved ? 'text-danger' : 'text-text-secondary'}
                />
              </button>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">{job.company} · {job.location}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {job.salary && (
              <span className="text-xs text-text-secondary">{job.salary}</span>
            )}
            {job.workplaceType && (
              <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                {job.workplaceType}
              </span>
            )}
            {job.experienceLevel && (
              <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-secondary">
                {job.experienceLevel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2">
            {job.postedAt && (
              <span className="text-xs text-text-secondary flex items-center gap-1">
                <PhosphorIcon name="Clock" size={12} />
                {formatTimeAgo(job.postedAt)}
              </span>
            )}
            {deadlineDays !== null && deadlineDays > 0 && deadlineDays <= 7 && (
              <span className="text-xs text-warning font-medium flex items-center gap-1">
                <PhosphorIcon name="Warning" size={12} weight="fill" />
                Closing in {deadlineDays}d
              </span>
            )}
            {job.isApplied && (
              <span className="text-xs text-success font-medium flex items-center gap-1">
                <PhosphorIcon name="CheckCircle" size={12} weight="fill" />
                Applied
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/JobCard.tsx
git commit -m "feat(ui): add JobCard with match score, save, deadline, and applied state"
```

---

### Task 21: Enhance StudentJobsPage

**Files:**
- Modify: `src/features/student/StudentJobsPage.tsx`

**Interfaces:**
- Consumes: `JobFeedTabs` (Task 18), `NLSearchInput` (Task 19), `JobCard` (Task 20), `FilterPill` (Task 11)
- Produces: enhanced jobs page with tabs, NL search, match scores

- [ ] **Step 1: Add feed tabs and NL search**

Insert `JobFeedTabs` below the search bar. Add `NLSearchInput` toggle next to the keyword search. When NL mode is active, hide the structured keyword/location inputs and show the NL input. When NL parses, convert to filter pills.

Key additions to the existing component:
1. State: `const [feedTab, setFeedTab] = useState('match')` with tabs: Best Match, Recently Posted, Closing Soon, Saved
2. State: `const [nlMode, setNlMode] = useState(false)` to toggle between structured and NL search
3. State: `const [activeFilters, setActiveFilters] = useState<{label: string; key: string}[]>([])` for filter pills
4. Render `JobFeedTabs` below the search bar
5. Render `FilterPill` row below tabs when filters are active
6. Modify job list rendering to use `JobCard` component instead of inline card markup
7. Add match score fetching via `aiApi.jobMatch(jobId)` for visible jobs (lazy, IntersectionObserver)

- [ ] **Step 2: Run tsc + vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/StudentJobsPage.tsx
git commit -m "feat(student): enhance jobs page with feed tabs, NL search, JobCard"
```

---

## Phase 6: Job Detail Enhancements

### Task 22: SimilarJobs Component

**Files:**
- Create: `src/components/SimilarJobs.tsx`

**Interfaces:**
- Consumes: `ProgressRing` (Task 2)
- Produces: `<SimilarJobs jobs={[...]} />` used by Job Detail

- [ ] **Step 1: Write implementation**

```tsx
import { useNavigate } from 'react-router-dom';
import { ProgressRing } from './ProgressRing';

type SimilarJob = {
  id: string;
  title: string;
  company: string;
  matchScore: number;
};

type SimilarJobsProps = {
  jobs: SimilarJob[];
};

export const SimilarJobs = ({ jobs }: SimilarJobsProps) => {
  const navigate = useNavigate();

  if (jobs.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-semibold text-text mb-3">Similar Jobs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => navigate(`/jobs/${job.id}`)}
            className="text-left rounded-xl border border-border/50 bg-surface p-4 hover:shadow-[var(--space-depth-md)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <ProgressRing value={job.matchScore} size="sm" className="mb-2" />
            <p className="text-sm font-medium text-text truncate">{job.title}</p>
            <p className="text-xs text-text-secondary">{job.company}</p>
          </button>
        ))}
      </div>
    </section>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/SimilarJobs.tsx
git commit -m "feat(ui): add SimilarJobs horizontal grid component"
```

---

### Task 23: CompanyCard Component

**Files:**
- Create: `src/components/CompanyCard.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<CompanyCard company={...} />` used by Job Detail sidebar

- [ ] **Step 1: Write implementation**

```tsx
import { PhosphorIcon } from './PhosphorIcon';

type Company = {
  name: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  description?: string;
};

type CompanyCardProps = {
  company: Company;
};

export const CompanyCard = ({ company }: CompanyCardProps) => (
  <div className="rounded-xl border border-border/50 bg-surface p-4">
    <h3 className="text-sm font-semibold text-text">{company.name}</h3>
    <div className="mt-2 space-y-1.5">
      {company.industry && (
        <p className="text-xs text-text-secondary flex items-center gap-1.5">
          <PhosphorIcon name="Buildings" size={13} weight="fill" />
          {company.industry}
        </p>
      )}
      {company.size && (
        <p className="text-xs text-text-secondary flex items-center gap-1.5">
          <PhosphorIcon name="Users" size={13} weight="fill" />
          {company.size}
        </p>
      )}
      {company.location && (
        <p className="text-xs text-text-secondary flex items-center gap-1.5">
          <PhosphorIcon name="MapPin" size={13} weight="fill" />
          {company.location}
        </p>
      )}
      {company.website && (
        <a
          href={company.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary-hover flex items-center gap-1.5 mt-2"
        >
          <PhosphorIcon name="Link" size={13} />
          Visit website
        </a>
      )}
    </div>
  </div>
);
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/CompanyCard.tsx
git commit -m "feat(ui): add CompanyCard sidebar component"
```

---

### Task 24: Enhance JobDetailPanel (embedded)

**Files:**
- Modify: `src/features/student/JobDetailPanel.tsx`

**Interfaces:**
- Consumes: `MatchBreakdown` (Task 10), `MatchExplanation` (Task 11), `SimilarJobs` (Task 22)
- Produces: enhanced panel with match breakdown, similar jobs

- [ ] **Step 1: Add match breakdown section**

After the existing job details, add:
1. Match breakdown section (if match data available)
2. Similar jobs section (3 cards)
3. Company info card

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/JobDetailPanel.tsx
git commit -m "feat(student): add match breakdown and similar jobs to JobDetailPanel"
```

---

### Task 25: Enhance JobDetailPage (standalone)

**Files:**
- Modify: `src/features/jobs/JobDetailPage.tsx`

**Interfaces:**
- Consumes: `MatchBreakdown` (Task 10), `MatchExplanation` (Task 11), `SimilarJobs` (Task 22), `CompanyCard` (Task 23)
- Produces: enhanced standalone page with sidebar, match, save, similar

- [ ] **Step 1: Add sidebar layout + save + match**

Major changes:
1. Convert to two-column layout (main + sticky sidebar)
2. Add save/unsave button in header
3. Add `MatchBreakdown` + `MatchExplanation` in sidebar
4. Add `CompanyCard` in sidebar
5. Add `SimilarJobs` section below main content
6. Fetch match data via `aiApi.jobMatch(jobId)`

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/jobs/JobDetailPage.tsx
git commit -m "feat(jobs): add sidebar layout, match breakdown, save, similar jobs to JobDetailPage"
```

---

## Phase 7: Applications Tracker

### Task 26: PipelineTracker Component

**Files:**
- Create: `src/components/PipelineTracker.tsx`

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: `<PipelineTracker current="INTERVIEW" />` used by Applications page

- [ ] **Step 1: Write implementation**

```tsx
import { cn } from '../lib/utils';

type Stage = 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'HIRED';

type PipelineTrackerProps = {
  current: Stage;
  className?: string;
};

const STAGES: Stage[] = ['APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED'];

const STAGE_LABELS: Record<Stage, string> = {
  APPLIED: 'Applied',
  SCREENING: 'Screening',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  HIRED: 'Hired',
};

export const PipelineTracker = ({ current, className }: PipelineTrackerProps) => {
  const currentIndex = STAGES.indexOf(current);

  return (
    <div className={cn('flex items-center gap-0', className)}>
      {STAGES.map((stage, i) => {
        const isActive = i === currentIndex;
        const isComplete = i < currentIndex;
        return (
          <div key={stage} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-3 h-3 rounded-full border-2 transition-colors',
                  isComplete && 'bg-primary border-primary',
                  isActive && 'border-primary bg-primary/20',
                  !isComplete && !isActive && 'border-border bg-surface-muted'
                )}
                aria-label={`${STAGE_LABELS[stage]}${isComplete ? ' (complete)' : isActive ? ' (current)' : ''}`}
              />
              <span className={cn(
                'text-[10px] mt-1 whitespace-nowrap',
                isActive ? 'text-primary font-medium' : isComplete ? 'text-text-secondary' : 'text-text-secondary/50'
              )}>
                {STAGE_LABELS[stage]}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-1',
                i < currentIndex ? 'bg-primary' : 'bg-border'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/components/PipelineTracker.tsx
git commit -m "feat(ui): add PipelineTracker component with stage visualization"
```

---

### Task 27: ApplicationDetail Component

**Files:**
- Create: `src/features/student/components/ApplicationDetail.tsx`

**Interfaces:**
- Consumes: `PipelineTracker` (Task 26), `ActivityTimeline` (inline), application data
- Produces: full application detail view

- [ ] **Step 1: Write implementation**

```tsx
import { useNavigate } from 'react-router-dom';
import { PhosphorIcon } from '../../../components/PhosphorIcon';
import { PipelineTracker } from '../../../components/PipelineTracker';
import { Button } from '../../../components/Button';
import { Badge } from '../../../components/Badge';

type TimelineEvent = {
  type: string;
  message: string;
  timestamp: string;
};

type ApplicationDetailProps = {
  application: {
    id: string;
    status: string;
    submittedAt: string;
    job: { id: string; title: string; company: string; location: string; salary?: string };
    resume?: { fileName: string; id: string };
    coverLetter?: string;
    timeline: TimelineEvent[];
  };
  onWithdraw?: () => void;
};

const STATUS_BADGE: Record<string, { kind: string; label: string }> = {
  SUBMITTED: { kind: 'info', label: 'Applied' },
  UNDER_REVIEW: { kind: 'warning', label: 'Under Review' },
  SCREENING: { kind: 'warning', label: 'Screening' },
  INTERVIEW: { kind: 'primary', label: 'Interview' },
  OFFER: { kind: 'success', label: 'Offer' },
  HIRED: { kind: 'success', label: 'Hired' },
  REJECTED: { kind: 'danger', label: 'Rejected' },
  WITHDRAWN: { kind: 'neutral', label: 'Withdrawn' },
};

export const ApplicationDetail = ({ application, onWithdraw }: ApplicationDetailProps) => {
  const navigate = useNavigate();
  const badge = STATUS_BADGE[application.status] || { kind: 'neutral', label: application.status };

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/student/applications')} className="text-sm text-primary hover:text-primary-hover flex items-center gap-1 mb-3">
          <PhosphorIcon name="ArrowLeft" size={14} /> Back to applications
        </button>
        <h1 className="text-xl font-bold text-text">{application.job.title}</h1>
        <p className="text-sm text-text-secondary">{application.job.company} · {application.job.location}</p>
        <div className="flex items-center gap-3 mt-2">
          <Badge kind={badge.kind as any}>{badge.label}</Badge>
          <span className="text-xs text-text-secondary">
            Applied {new Date(application.submittedAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <PipelineTracker current={application.status as any} />

      <section>
        <h2 className="text-sm font-semibold text-text mb-3">Activity Timeline</h2>
        <div className="space-y-3">
          {application.timeline.map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
              <div>
                <p className="text-sm text-text">{event.message}</p>
                <p className="text-xs text-text-secondary">
                  {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {application.resume && (
        <section>
          <h2 className="text-sm font-semibold text-text mb-2">Documents</h2>
          <div className="flex items-center gap-2">
            <PhosphorIcon name="FileText" size={16} weight="fill" className="text-text-secondary" />
            <span className="text-sm text-text">{application.resume.fileName}</span>
          </div>
        </section>
      )}

      {onWithdraw && application.status !== 'WITHDRAWN' && application.status !== 'HIRED' && application.status !== 'REJECTED' && (
        <div className="pt-4 border-t border-border">
          <Button variant="danger" size="sm" onClick={onWithdraw}>
            Withdraw Application
          </Button>
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Run tsc**

Run: `npx tsc --noEmit`
Expected: clean

- [ ] **Step 3: Commit**

```bash
git add src/features/student/components/ApplicationDetail.tsx
git commit -m "feat(student): add ApplicationDetail with timeline and pipeline"
```

---

### Task 28: Enhance StudentApplicationsPage

**Files:**
- Modify: `src/features/student/StudentApplicationsPage.tsx`
- Modify: `src/routing/AppRoutes.tsx`

**Interfaces:**
- Consumes: `PipelineTracker` (Task 26), `ApplicationDetail` (Task 27), `FilterPill` (Task 11)
- Produces: enhanced applications page with search, detail view route

- [ ] **Step 1: Add search + sort + detail route**

Major changes:
1. Add search input (filter by job title/company)
2. Add sort dropdown (date, status, company)
3. Add detail view route `/student/applications/:id` in AppRoutes
4. When application ID is in URL, render `ApplicationDetail` instead of list
5. Replace inline pipeline with `PipelineTracker` component
6. Add WITHDRAWN to filter pills

- [ ] **Step 2: Add route to AppRoutes**

In `AppRoutes.tsx`, add within the student routes:
```tsx
<Route path="applications/:id" element={<StudentApplicationsPage />} />
```

- [ ] **Step 3: Run tsc + vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: clean

- [ ] **Step 4: Commit**

```bash
git add src/features/student/StudentApplicationsPage.tsx src/routing/AppRoutes.tsx
git commit -m "feat(student): enhance applications with search, sort, detail view route"
```

---

## Phase 8: AI Assistant Enhancement

### Task 29: Enhance AIAssistantPage

**Files:**
- Modify: `src/features/ai/AIAssistantPage.tsx`

**Interfaces:**
- Consumes: existing `aiApi.careerChat()`
- Produces: enhanced chat with job context, markdown, suggested prompts

- [ ] **Step 1: Add markdown rendering**

Add basic markdown rendering for AI responses (bold, lists, code blocks). Can use a simple regex-based renderer or add `react-markdown` if already in dependencies.

- [ ] **Step 2: Add job-specific context prompts**

When user navigates from a job detail page (check `location.state?.jobId`), add context-aware prompts:
- "How do I match this job?"
- "What skills am I missing for this role?"
- "What should I highlight in my application?"

- [ ] **Step 3: Add conversation persistence**

Store conversation in `localStorage` keyed by user ID. Restore on page load.

- [ ] **Step 4: Run tsc + vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: clean

- [ ] **Step 5: Commit**

```bash
git add src/features/ai/AIAssistantPage.tsx
git commit -m "feat(ai): enhance assistant with markdown, job context, persistence"
```

---

## Phase 9: QA & Final Verification

### Task 30: Full QA Pass

**Files:** All modified/created files

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit` in `frontend/`
Expected: clean

- [ ] **Step 2: Run all tests**

Run: `npx vitest run` in `frontend/`
Expected: all pass

- [ ] **Step 3: Backend tests**

Run: `npm test` in `backend/`
Expected: all pass (100/100)

- [ ] **Step 4: Desktop visual check (1440px)**

Launch dev server, navigate to each page:
- `/student/dashboard` — bento layout, KPI rings, recommended jobs, activity, career intel
- `/student/jobs` — feed tabs, search, filter pills, job cards with match scores
- `/jobs/:id` — two-column layout, sidebar with match breakdown, similar jobs
- `/student/applications` — pipeline summary, cards with mini-pipeline, detail view
- `/student/ai-assistant` — enhanced chat with markdown

Verify: no console errors, no broken layouts, theme works

- [ ] **Step 5: Mobile visual check (375px)**

Verify:
- Zero horizontal overflow
- Bento grid collapses to single column
- Job detail sidebar moves below content
- Filter bottom sheet works
- Touch targets ≥ 44px

- [ ] **Step 6: Dark mode check**

Toggle dark mode, verify:
- All new components render correctly
- Glass/spatial variants work
- ProgressRing colors visible
- Text contrast sufficient

- [ ] **Step 7: Reduced motion check**

Enable `prefers-reduced-motion`, verify:
- No parallax animation
- ProgressRing/ProgressBar fill instantly
- Card hover elevation disabled
- Route transitions instant

- [ ] **Step 8: Accessibility check**

- Tab through all interactive elements on each page
- Verify focus states visible
- Screen reader test on ProgressRing, PipelineTracker
- All icon buttons have aria-labels

- [ ] **Step 9: Clean up temp files**

Remove any test scripts, demo data, temporary files from `C:\Users\Nath\AppData\Local\Temp\opencode\`

- [ ] **Step 10: Final commit**

```bash
git add -A
git commit -m "feat: student experience transformation — dashboard, jobs, detail, applications, AI"
```
