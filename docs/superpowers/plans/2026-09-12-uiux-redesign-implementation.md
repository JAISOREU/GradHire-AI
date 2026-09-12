# UI/UX Master Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the GradTure frontend into a quiet, professional, Linear-inspired visual system — restyle tokens, shell, all shared components, and all pages.

**Architecture:** Token + shell + shared-component restyle. Keep all existing component files and prop interfaces; change class strings in TSX and CSS rules in `styles.css`. No new chart libraries, no routing changes, no backend changes. Most pages inherit via shared components.

**Tech Stack:** React 19, react-router-dom v7, Tailwind 4 (via `@tailwindcss/vite`), Radix primitives, Phosphor icons, Vite 5, Vitest 4.

**Spec:** `docs/superpowers/specs/2026-09-12-uiux-redesign-design.md`

---

## Global Constraints

- Frontend `tsc --noEmit` clean after every task
- `npm test` (55/55 tests) pass after every task
- Post-sweep grep guardrails: `gradient` = 0, `glow` = 0, `glass` = 0, `backdrop-filter` ≤ 2, `@keyframes` ≤ 5, `Spatial` = 0 in `styles.css`
- Do NOT break: routing, auth flows, API integrations, RBAC, messaging, applications, job functionality, notifications, AI assistant
- Do NOT delete test files; tests that assert props/aria must still pass
- All CSS class changes: change class strings in TSX, not rename CSS classes mid-refactor (avoids grep mismatches)
- `useHeaderMorph` will be removed; all three consumers (AuthHeader, Header, PublicLayout) must be rewritten before its deletion

## File Map

| File | Change type |
|------|-------------|
| `frontend/src/styles.css` | Major: retheme tokens, shell classes, kill decorative, typography clamp |
| `frontend/src/components/Button.tsx` | Minor: class string tweak |
| `frontend/src/components/Card.tsx` | Minor: remove variant logic |
| `frontend/src/components/Badge.tsx` | No change needed (already quiet) |
| `frontend/src/components/Avatar.tsx` | No change needed (already quiet) |
| `frontend/src/components/JobCard.tsx` | Minor: class string tweak (shadow reference) |
| `frontend/src/components/SpatialCard.tsx` | Minor: simplify class string |
| `frontend/src/components/KPICard.tsx` | No change needed (classes in styles.css) |
| `frontend/src/components/DataTable.tsx` | No change needed (classes in styles.css) |
| `frontend/src/components/EmptyState.tsx` | No change needed (classes in styles.css) |
| `frontend/src/components/FilterPill.tsx` | Check — likely class string tweak if gradient/glow |
| `frontend/src/components/AuthHeader.tsx` | Major: rewrite — remove morph, static 56px, add search |
| `frontend/src/components/Header.tsx` | Major: rewrite — remove morph, static 56px |
| `frontend/src/components/Sidebar.tsx` | Minor: pass real user data for footer area |
| `frontend/src/components/AmbientBackground.tsx` | Neutralize: return empty fragment |
| `frontend/src/components/SpatialBackground.tsx` | Neutralize: return empty fragment |
| `frontend/src/components/MorphingText.tsx` | Neutralize: render static text |
| `frontend/src/components/Magnetic.tsx` | Neutralize: render children unchanged |
| `frontend/src/components/AnimatedLogo.tsx` | Simplify: reduce animation to opacity-only |
| `frontend/src/layouts/PublicLayout.tsx` | Major: remove morph, static header |
| `frontend/src/layouts/AppShell.tsx` | Minor: pass user data to sidebar, add SidebarUser |
| `frontend/src/core/utils/navigation.ts` | Major: restructure all three nav configs |
| `frontend/src/core/utils/navigation.test.ts` | Update: assert new nav shapes |
| `frontend/src/core/hooks/useHeaderMorph.ts` | Delete: file removed |
| `frontend/src/routing/AppRoutes.tsx` | Minor: add `/student/network` route |
| `frontend/src/features/student/StudentNetworkPage.tsx` | Create: empty state page |
| `frontend/src/features/jobs/JobListPage.tsx` | Minor: read `q` param from URL, replace MorphingText import |

---

## Task 1: Design Tokens Retheme

**Files:**
- Modify: `frontend/src/styles.css:18-200` (`:root` block), `frontend/src/styles.css:215-249+` (`[data-theme='dark']` block)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: new token values consumed by every subsequent task

- [ ] **Step 1: Retheme the light-mode root token block**

Open `frontend/src/styles.css`. Replace the entire first `:root` block (lines 18–200). New content:

```css
:root {
  /* Brand — indigo as accent only, used sparingly */
  --color-primary: #635bff;
  --color-primary-hover: #5148e8;
  --color-primary-soft: #efeffd;
  --color-primary-text: #ffffff;

  /* Semantic — restrained */
  --color-success: #16a34a;
  --color-success-soft: #dcfce7;
  --color-warning: #eab308;
  --color-warning-soft: #fef9c3;
  --color-danger: #dc2626;
  --color-danger-soft: #fef2f2;

  /* Neutrals — quiet, professional */
  --color-background: #fbfbfd;
  --color-surface: #ffffff;
  --color-surface-muted: #f6f7f9;
  --color-border: #e6e8ef;
  --color-border-strong: #d7dbe6;
  --color-text: #172033;
  --color-text-secondary: #647089;
  --color-text-tertiary: #98a2b5;
  --color-text-faint: #d9deea;
  --color-text-muted: #98a2b5;

  /* Radius — 12px default for cards */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* Shadows — neutral 3-tier only */
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);

  /* Visual semantics — for product UI */
  --visual-background: transparent;
  --visual-surface: var(--color-surface);
  --visual-surface-rgb: 255, 255, 255;
  --visual-surface-elevated: var(--color-surface);
  --visual-surface-muted: var(--color-surface-muted);
  --visual-border: var(--color-border);
  --visual-border-subtle: var(--color-border);
  --visual-text: var(--color-text);
  --visual-text-muted: var(--color-text-secondary);
  --visual-text-secondary: var(--color-text-secondary);
  --visual-text-tertiary: var(--color-text-tertiary);
  --visual-accent: var(--color-primary);
  --visual-accent-soft: var(--color-primary-soft);
  --visual-success: var(--color-success);
  --visual-success-soft: var(--color-success-soft);
  --visual-warning: var(--color-warning);
  --visual-warning-soft: var(--color-warning-soft);
  --visual-danger: var(--color-danger);
  --visual-danger-soft: var(--color-danger-soft);
  --visual-chart: var(--color-primary);
  --visual-shadow: var(--shadow-md);
  --visual-radius: var(--radius-lg);

  /* Bento — keep */
  --bento-gap: 16px;
  --bento-radius: 12px;

  /* Motion — keep */
  --motion-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Typography — Inter only, no display font */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

- [ ] **Step 2: Retheme the Dawn `:root` block (lines ~113-200)**

Replace the second `:root` block (lines ~113–200) with the unified tokens above. Specifically, replace every line from `--background: #fafafa;` through `--transition-journey: 0.7s ...` with the following block. Keep the spacing tokens (`--space-*`), breakpoint tokens (`--bp-*`), and `--transition-*` tokens as-is — only replace color/shadow/gradient/font tokens. The full block:

```css
/* Layout tokens — keep */
  --header-height: 56px;
  --sidebar-width: 240px;
  --sidebar-collapsed: 68px;
  --container-max: 1200px;
  --container-narrow: 720px;

  /* Color aliases used by Tailwind @theme (mapped by tailwind 4 automatically) */
  --background: #fbfbfd;
  --background-secondary: #f6f7f9;
  --surface: #ffffff;
  --surface-elevated: #ffffff;
  --surface-hover: #f6f7f9;
  --surface-muted: #f6f7f9;
  --border: #e6e8ef;
  --border-strong: #d7dbe6;
  --text-primary: #172033;
  --text-secondary: #647089;
  --text-muted: #98a2b5;
  --accent: #635bff;
  --accent-soft: #efeffd;
  --success: #16a34a;
  --warning: #eab308;
  --danger: #dc2626;
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06);

  /* Legacy token aliases */
  --color-bg: #fbfbfd;
  --color-surface-rgb: 255, 255, 255;
  --color-border-rgb: 230, 232, 239;
  --color-surface-elevated: #ffffff;
  --color-overlay: rgba(0, 0, 0, 0.4);
  --color-success-pulse: rgba(22, 163, 74, 0.25);
  --color-primary-rgb: 99, 91, 255;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Delete** the following lines entirely from this block (gradient tokens that no longer exist):
- `--gradient-primary`, `--gradient-surface`, `--gradient-atmosphere`, `--gradient-glow`, `--gradient-sunrise`, `--gradient-warm`, `--gradient-brand`, `--atmosphere-star-opacity`, `--atmosphere-glow-opacity`

Also delete:
- `--space-depth-*` (if present in this block)
- `--visual-accent-glow` (if present)

- [ ] **Step 3: Retheme the dark-mode block**

Replace the `[data-theme='dark']` block (lines ~215–249+) with:

```css
[data-theme='dark'] {
  --background: #0e1015;
  --background-secondary: #12141a;
  --surface: #171a21;
  --surface-elevated: #1d212a;
  --surface-hover: #22262f;
  --surface-muted: #171a21;
  --border: #262a33;
  --border-strong: #363b46;
  --surface-muted: #171a21;
  --text-primary: #ececf1;
  --text-secondary: #9aa1b0;
  --text-muted: #6e7584;
  --accent: #8b83ff;
  --accent-soft: #1e1b33;
  --success: #22c55e;
  --warning: #eab308;
  --danger: #ef4444;
  --shadow: 0 1px 2px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.2);

  --color-primary: #8b83ff;
  --color-primary-hover: #a39dff;
  --color-primary-soft: #1e1b33;
  --color-primary-text: #0a0a1a;

  --color-success-soft: #052e16;
  --color-warning-soft: #422006;
  --color-danger-soft: #450a0a;

  --color-surface-rgb: 23, 26, 33;
  --color-border-rgb: 38, 42, 51;
}
```

**Delete** from the dark block: all `--gradient-*` tokens, `--atmosphere-*` tokens, `--space-depth-*`, `--visual-accent-glow`.

- [ ] **Step 4: Run grep guardrails and verify no broken references**

```bash
cd frontend
npx tsc --noEmit
npm test
```

Run:
```powershell
Select-String -Path "src/styles.css" -Pattern "gradient" | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "src/styles.css" -Pattern "glow" | Measure-Object | Select-Object -ExpandProperty Count
Select-String -Path "src/styles.css" -Pattern "glass" | Measure-Object | Select-Object -ExpandProperty Count
```

Expected: `gradient` count drops from 106 to 0, `glow` from 43 to 0, `glass` from 31 to 0 after Steps 1–3 (deleting those token declarations).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/styles.css
git commit -m "style: retheme design tokens — quiet palette, 3-tier shadows, no gradient/glow/glass tokens"
```

---

## Task 2: Neutralize Decorative Components (JS)

**Files:**
- Modify: `frontend/src/components/AmbientBackground.tsx`
- Modify: `frontend/src/components/SpatialBackground.tsx`
- Modify: `frontend/src/components/MorphingText.tsx`
- Modify: `frontend/src/components/Magnetic.tsx`
- Modify: `frontend/src/components/AnimatedLogo.tsx`

**Interfaces:**
- Consumes: nothing
- Produces: all exports remain importable with same signatures; components visually inert

- [ ] **Step 1: Neutralize AmbientBackground.tsx**

Replace the entire file content with:

```tsx
import { forwardRef } from 'react';

export interface AmbientBackgroundHandle {
  setProgress: (progress: number) => void;
  setScene: (id: string, direction?: 'forward' | 'backward') => void;
}

type AmbientBackgroundProps = {
  scene?: string;
};

export const AmbientBackground = forwardRef<AmbientBackgroundHandle, AmbientBackgroundProps>(
  function AmbientBackground(_props, ref) {
    // Neutralized — visual effects removed per design system.
    // Ref methods are no-ops to avoid breaking parent useRef usage.
    forwardRef(
      () => ({
        setProgress: () => {},
        setScene: () => {},
      }),
    );
    return <></>;
  },
);
```

Wait — that's wrong. The `useImperativeHandle` pattern. Fix:

```tsx
import { forwardRef, useImperativeHandle } from 'react';

export interface AmbientBackgroundHandle {
  setProgress: (progress: number) => void;
  setScene: (id: string, direction?: 'forward' | 'backward') => void;
}

type AmbientBackgroundProps = {
  scene?: string;
};

export const AmbientBackground = forwardRef<AmbientBackgroundHandle, AmbientBackgroundProps>(
  function AmbientBackground(_props, _ref) {
    useImperativeHandle(_ref, () => ({
      setProgress: () => {},
      setScene: () => {},
    }));
    return <></>;
  },
);
```

- [ ] **Step 2: Neutralize SpatialBackground.tsx**

Replace the entire file content with:

```tsx
/**
 * SpatialBackground — neutralized per design system.
 * All parallax/orb/aurora effects removed; renders empty.
 */
export const SpatialBackground = () => <></>;
```

- [ ] **Step 3: Neutralize MorphingText.tsx**

Replace the entire file content with:

```tsx
type MorphingTextProps = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
};

/**
 * MorphingText — neutralized per design system.
 * Renders static text with no animation.
 */
export const MorphingText = ({ text, as: Tag = 'span', className = '' }: MorphingTextProps) => (
  <Tag className={className}>{text}</Tag>
);
```

- [ ] **Step 4: Neutralize Magnetic.tsx**

Replace the entire file content with:

```tsx
import type { ReactNode } from 'react';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic — neutralized per design system.
 * No pointer-tracking; renders children unchanged.
 */
export const Magnetic = ({ children, className = '' }: MagneticProps) => (
  <div className={`magnetic ${className}`.trim()}>{children}</div>
);
```

- [ ] **Step 5: Simplify AnimatedLogo.tsx**

Read the current file at `frontend/src/components/AnimatedLogo.tsx`. The implementation renders an SVG logo. Replace the animation-related code with a simple static render. Specifically:
- Remove any CSS animation class bindings
- Keep the `size` and `showText` props and their logic
- Remove the `spinning`/`rotate` animation class if present
- If the file uses inline SVG with `animation` attributes, remove those attributes
- If the file just renders `<Logo size={size} showText={showText} className={className} />`, keep as-is but remove any `animated-logo--spin` wrapper classes

Read the file first, then apply the minimal changes. The key requirement: no CSS animation, still renders the logo correctly.

- [ ] **Step 6: Run tests**

```bash
cd frontend
npx tsc --noEmit
npm test
```

All 55 tests pass. The neutralized components have no tests, but their consumers (AuthLayout, AuthModal, LandingPresentation, HomePage, JobListPage) will still render.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/AmbientBackground.tsx frontend/src/components/SpatialBackground.tsx frontend/src/components/MorphingText.tsx frontend/src/components/Magnetic.tsx frontend/src/components/AnimatedLogo.tsx
git commit -m "style: neutralize decorative components — ambient, spatial, morph, magnetic, animated-logo"
```

---

## Task 3: Remove useHeaderMorph and Rewrite Headers

**Files:**
- Delete: `frontend/src/core/hooks/useHeaderMorph.ts`
- Rewrite: `frontend/src/components/AuthHeader.tsx`
- Rewrite: `frontend/src/components/Header.tsx`
- Rewrite: `frontend/src/layouts/PublicLayout.tsx`

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: static compact headers (56px); AuthHeader exports search submission via onSearch prop
- Consumer: `AppShell.tsx` passes `onToggleSidebar` to AuthHeader; PublicLayout uses Header inline

- [ ] **Step 1: Delete useHeaderMorph.ts**

```bash
Remove-Item "frontend/src/core/hooks/useHeaderMorph.ts"
```

Verify no remaining imports:
```powershell
Select-String -Path "frontend/src" -Include *.tsx,*.ts -Pattern "useHeaderMorph" | ForEach-Object { $_.Path }
```

Expected: only AuthHeader.tsx, Header.tsx, PublicLayout.tsx remain (will be rewritten in Steps 2–4).

- [ ] **Step 2: Rewrite AuthHeader.tsx**

Replace the entire file content. The new AuthHeader:
- Static 56px header, no morph, no glass-on-scroll
- Left: mobile hamburger + "Talent" brand text
- Center: global search input (navigates to `/jobs?q=<term>` on submit)
- Right: ThemeToggle, notifications bell, messages icon, avatar dropdown
- Right click-outout and keyboard nav (keep the existing `useRef`/`useEffect` pattern for dropdown)

```tsx
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from './Avatar';
import { PhosphorIcon } from './PhosphorIcon';
import { useAuth } from '../core/auth/AuthContext';
import { roleHomePath, type NavItem } from '../core/utils/navigation';

type AuthHeaderProps = {
  onToggleSidebar: () => void;
  sidebarOpen?: boolean;
};

export const AuthHeader = ({ onToggleSidebar, sidebarOpen }: AuthHeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.name || user?.email || 'User';
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logoutModalRef = useRef<HTMLDivElement>(null);
  const homeRoute = roleHomePath(user?.role);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = dropdownRef.current?.querySelectorAll<HTMLElement>('.header-dropdown__item');
        if (!items || !items.length) return;
        const idx = Array.from(items).findIndex((i) => i === document.activeElement);
        const next = e.key === 'ArrowDown' ? (idx < items.length - 1 ? idx + 1 : 0) : (idx > 0 ? idx - 1 : items.length - 1);
        items[next].focus();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    if (!confirmLogout) return;
    const modal = logoutModalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmLogout(false);
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    first.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [confirmLogout]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/jobs?q=${encodeURIComponent(q)}`);
  };

  const roleMenuItems = user?.role === 'STUDENT' ? [
    { to: '/student/account', label: 'Profile', icon: 'User' as const },
    { to: '/student/settings', label: 'Settings', icon: 'Gear' as const },
  ] : user?.role === 'EMPLOYER' ? [
    { to: '/employer/account', label: 'Profile', icon: 'User' as const },
    { to: '/employer/settings', label: 'Settings', icon: 'Gear' as const },
  ] : [
    { to: '/admin/account', label: 'Profile', icon: 'User' as const },
    { to: '/admin/settings', label: 'Settings', icon: 'Gear' as const },
  ];

  const handleLogout = () => { logout(); setConfirmLogout(false); };

  return (
    <header className="app-header" style={{ height: 'var(--header-height)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="app-header__inner" style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', padding: '0 var(--space-5)' }}>
        <Button variant="ghost" size="sm" onClick={onToggleSidebar} aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'} aria-expanded={sidebarOpen ?? false} className="mobile-menu-toggle">
          <span className="mobile-menu-toggle__bars" aria-hidden="true"><span /><span /><span /></span>
          <span className="sr-only">Menu</span>
        </Button>

        <span className="app-header__title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>Talent</span>

        <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 0px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
          <div style={{ position: 'relative' }}>
            <PhosphorIcon name="MagnifyingGlass" size={16} weight="regular" className="app-header__search-icon" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, companies…"
              className="app-header__search-input"
              aria-label="Global search"
            />
          </div>
        </form>

        <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ThemeToggle />
          <Link to={`${homeRoute.replace('/dashboard', '/notifications')}`} className="header-icon-link" aria-label="Notifications">
            <PhosphorIcon name="Bell" size={20} weight="regular" />
          </Link>
          <Link to={`${homeRoute.replace('/dashboard', '/messages')}`} className="header-icon-link" aria-label="Messages">
            <PhosphorIcon name="ChatCircle" size={20} weight="regular" />
          </Link>
          <div className="header-dropdown" ref={dropdownRef}>
            <button type="button" className="header-dropdown__trigger" aria-haspopup="true" aria-expanded={dropdownOpen} onClick={() => setDropdownOpen((p) => !p)} aria-label={displayName}>
              <Avatar src={user?.avatarUrl} name={displayName} size="sm" userId={user?.id} />
            </button>
            <div className={`header-dropdown__menu ${dropdownOpen ? 'is-open' : ''}`} role="menu">
              <Link to={homeRoute} className="header-dropdown__item" role="menuitem" onClick={() => setDropdownOpen(false)} tabIndex={dropdownOpen ? 0 : -1}>
                <PhosphorIcon name="House" size={18} weight="regular" /><span>Dashboard</span>
              </Link>
              {roleMenuItems.map((item) => (
                <Link key={item.to} to={item.to} className="header-dropdown__item" role="menuitem" onClick={() => setDropdownOpen(false)} tabIndex={dropdownOpen ? 0 : -1}>
                  <PhosphorIcon name={item.icon} size={18} weight="regular" /><span>{item.label}</span>
                </Link>
              ))}
              <div className="header-dropdown__separator" role="separator" />
              <button type="button" className="header-dropdown__item header-dropdown__item--danger" onClick={() => setConfirmLogout(true)} role="menuitem" tabIndex={dropdownOpen ? 0 : -1}>
                <PhosphorIcon name="SignOut" size={18} weight="regular" /><span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmLogout && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="logout-modal-title" aria-label="Confirm logout">
          <div className="modal" ref={logoutModalRef}>
            <h3 id="logout-modal-title" className="card__title">Log out?</h3>
            <p className="card__subtitle">You will need to sign in again to access your dashboard.</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
              <Button variant="secondary" onClick={() => setConfirmLogout(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleLogout}>Log out</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
```

- [ ] **Step 3: Rewrite Header.tsx (public header — used nowhere directly, but keep for any future use)**

Replace the entire file content with a simple static public header:

```tsx
import type { AuthUser } from '../core/types';
import { Button } from './Button';
import { ThemeToggle } from './ThemeToggle';
import { NavLink } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Logo } from './Logo';

type HeaderProps = {
  user: AuthUser | null;
  onLogout: () => void;
  onSignIn?: () => void;
};

export const Header = ({ user, onLogout, onSignIn }: HeaderProps) => {
  const displayName = user?.name || user?.email || '';

  return (
    <header className="app-header" style={{ height: 'var(--header-height)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
      <div className="app-header__inner" style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', padding: '0 var(--space-5)' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo size={28} />
          <span className="header-logo__text" style={{ fontSize: '15px', fontWeight: 600 }}>
            Gradture
          </span>
        </div>

        <nav className="public-nav" aria-label="Primary" style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
          <NavLink to="/" end className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
          <NavLink to="/jobs" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
          <NavLink to="/companies" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
          <NavLink to="/about" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>
        </nav>

        <div className="header-user" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <ThemeToggle />
          {user ? (
            <>
              <Avatar src={user.avatarUrl} name={displayName} size="sm" userId={user.id} />
              <Button variant="ghost" size="sm" onClick={onLogout}>Log out</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onSignIn}>Sign in</Button>
              <Button variant="primary" size="sm" onClick={onSignIn}>Get started</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
```

- [ ] **Step 4: Rewrite PublicLayout.tsx**

Replace the entire file with a simplified version that removes all `useHeaderMorph` usage and morph-related inline styles:

```tsx
import { Link, Outlet, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/Button';
import { ThemeToggle } from '../components/ThemeToggle';
import { useState, useRef, useEffect } from 'react';
import { roleHomePath } from '../core/utils/navigation';
import { SiteFooter } from '../layouts/SiteFooter';
import { Logo } from '../components/Logo';

export const PublicLayout = () => {
  const { user, isAuthenticated } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 992);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const homeRoute = roleHomePath(user?.role);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) setMobileNavOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { if (!location.hash) window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileNavOpen(false); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const drawer = mobileNavRef.current;
    if (!drawer) return;
    const focusable = drawer.querySelectorAll<HTMLElement>('a, button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    first.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileNavOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  return (
    <div className="public-layout">
      {!isHome && (
        <header className="app-header" style={{ height: 'var(--header-height)', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="app-header__inner" style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '100%', padding: '0 var(--space-5)' }}>
            <Link to={homeRoute} className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => { if (isMobile) { e.preventDefault(); setMobileNavOpen((p) => !p); } }}>
              <Logo size={28} />
              <span style={{ fontSize: '15px', fontWeight: 600 }}>Gradture</span>
            </Link>

            <nav className="public-nav" aria-label="Primary" style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
              <NavLink to="/" end className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
              <NavLink to="/jobs" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
              <NavLink to="/companies" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
              <NavLink to="/about" className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>
            </nav>

            <div className={`public-nav-overlay ${mobileNavOpen ? 'is-open' : ''}`} onClick={() => setMobileNavOpen(false)} aria-hidden="true" />
            <div className={`public-nav-drawer ${mobileNavOpen ? 'is-open' : ''}`} ref={mobileNavRef} role="dialog" aria-modal="true" aria-label="Navigation menu">
              <NavLink to="/" end onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Home</NavLink>
              <NavLink to="/jobs" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Jobs</NavLink>
              <NavLink to="/companies" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>Companies</NavLink>
              <NavLink to="/about" onClick={() => setMobileNavOpen(false)} className={({ isActive }) => `public-nav__link ${isActive ? 'is-active' : ''}`}>About</NavLink>
              {isAuthenticated && user ? (
                <div className="public-nav-drawer__section">
                  <Button to={homeRoute} onClick={() => setMobileNavOpen(false)} variant="secondary" size="lg" className="public-nav-drawer__btn">Go to dashboard</Button>
                </div>
              ) : (
                <div className="public-nav-drawer__section public-nav-drawer__section--auth">
                  <Link to="/login" onClick={() => setMobileNavOpen(false)}><Button variant="secondary" size="lg" className="public-nav-drawer__btn">Log in</Button></Link>
                  <Link to="/register" onClick={() => setMobileNavOpen(false)}><Button variant="primary" size="lg" className="public-nav-drawer__btn">Register</Button></Link>
                </div>
              )}
            </div>

            <div className="header-user header-user--desktop" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
              <ThemeToggle />
              {isAuthenticated && user ? (
                <Button to={homeRoute} variant="secondary" size="sm">Go to dashboard</Button>
              ) : (
                <>
                  <Link to="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
                  <Link to="/register"><Button variant="primary" size="sm">Register</Button></Link>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main id="main-content" className={`public-main ${!isHome ? 'has-header' : ''}`}>
        <Outlet />
      </main>

      {!isHome && <SiteFooter />}
    </div>
  );
};
```

- [ ] **Step 5: Run tests**

```bash
cd frontend
npx tsc --noEmit
npm test
```

All 55 tests pass. The `useHeaderMorph` import is gone from all consumers; the hook file is deleted.

- [ ] **Step 6: Commit**

```bash
git add -A frontend/src/core/hooks/useHeaderMorph.ts frontend/src/components/AuthHeader.tsx frontend/src/components/Header.tsx frontend/src/layouts/PublicLayout.tsx
git commit -m "style: remove morphing header — static 56px compact header with global search"
```

(Note: `git add -A` is used here to stage the deleted file, but scoped to the specific paths. Alternatively, stage manually.)

---

## Task 4: Restructure Navigation + Sidebar User Area + Network Route

**Files:**
- Modify: `frontend/src/core/utils/navigation.ts`
- Modify: `frontend/src/core/utils/navigation.test.ts`
- Modify: `frontend/src/routing/AppRoutes.tsx`
- Create: `frontend/src/features/student/StudentNetworkPage.tsx`
- Modify: `frontend/src/layouts/AppShell.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`

**Interfaces:**
- Consumes: user from `useAuth()` for sidebar footer
- Produces: `STUDENT_SIDEBAR_NAV`, `EMPLOYER_SIDEBAR_NAV` with new structure; `StudentNetworkPage` empty state; SidebarUser component in sidebar footer

- [ ] **Step 1: Restructure STUDENT_SIDEBAR_NAV in navigation.ts**

Replace the `STUDENT_SIDEBAR_NAV` array with:

```ts
export const STUDENT_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/student/dashboard', label: 'Home', icon: 'House' },
      { to: '/student/jobs', label: 'Jobs', icon: 'Briefcase' },
      { to: '/student/applications', label: 'Applications', icon: 'PaperPlaneRight' },
      { to: '/student/messages', label: 'Messages', icon: 'ChatCircle' },
      { to: '/student/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/student/network', label: 'Network', icon: 'UsersThree' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { to: '/student/companies', label: 'Companies', icon: 'Buildings' },
      { to: '/student/saved', label: 'Saved Jobs', icon: 'Bookmark' },
    ],
  },
  {
    label: 'Career tools',
    items: [
      { to: '/student/resume', label: 'Resume', icon: 'FileText' },
      { to: '/student/resume-builder', label: 'Resume Builder', icon: 'PencilSimpleLine' },
      { to: '/student/recommended', label: 'Recommended Matches', icon: 'Sparkle' },
      { to: '/student/ai-assistant', label: 'AI Assistant', icon: 'Sparkle' },
      { to: '/student/interviews', label: 'Interviews', icon: 'Calendar' },
    ],
  },
];
```

- [ ] **Step 2: Restructure EMPLOYER_SIDEBAR_NAV in navigation.ts**

```ts
export const EMPLOYER_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/employer/dashboard', label: 'Home', icon: 'House' },
      { to: '/employer/jobs', label: 'Jobs', icon: 'Briefcase' },
      { to: '/employer/applicants', label: 'Applicants', icon: 'Users' },
      { to: '/employer/interviews', label: 'Interviews', icon: 'Calendar' },
      { to: '/employer/messages', label: 'Messages', icon: 'ChatCircle' },
      { to: '/employer/notifications', label: 'Notifications', icon: 'Bell' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { to: '/employer/companies', label: 'Companies', icon: 'Buildings' },
    ],
  },
  {
    label: 'Career tools',
    items: [
      { to: '/employer/company-profile', label: 'Company Profile', icon: 'Buildings' },
      { to: '/employer/post-job', label: 'Post Job', icon: 'Plus' },
      { to: '/employer/analytics', label: 'Analytics', icon: 'ChartLineUp' },
    ],
  },
];
```

- [ ] **Step 3: Regroup ADMIN_SIDEBAR_NAV sections (keep same destinations, unify section labels)**

```ts
export const ADMIN_SIDEBAR_NAV: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: '/admin/dashboard', label: 'Home', icon: 'House' },
      { to: '/admin/users', label: 'Users', icon: 'Users' },
      { to: '/admin/jobs', label: 'Jobs', icon: 'Briefcase' },
      { to: '/admin/applications', label: 'Applications', icon: 'PaperPlaneRight' },
      { to: '/admin/companies', label: 'Companies', icon: 'Buildings' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { to: '/admin/reports', label: 'Reports', icon: 'ChartBar' },
      { to: '/admin/analytics', label: 'Analytics', icon: 'ChartLineUp' },
      { to: '/admin/monitoring', label: 'Monitoring', icon: 'Square' },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: 'Shield' },
      { to: '/admin/job-sources', label: 'Sources', icon: 'Database' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/database', label: 'Database', icon: 'Gear' },
      { to: '/admin/api-keys', label: 'API Keys', icon: 'Key' },
      { to: '/admin/email-templates', label: 'Email Templates', icon: 'Envelope' },
      { to: '/admin/cms', label: 'CMS', icon: 'Gear' },
      { to: '/admin/feature-flags', label: 'Feature Flags', icon: 'Gear' },
      { to: '/admin/backups', label: 'Backups', icon: 'Gear' },
      { to: '/admin/security', label: 'Security', icon: 'Shield' },
      { to: '/admin/developer-tools', label: 'Developer Tools', icon: 'Gear' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/account', label: 'Profile', icon: 'User' },
      { to: '/admin/notifications', label: 'Notifications', icon: 'Bell' },
      { to: '/admin/settings', label: 'Settings', icon: 'Gear' },
    ],
  },
];
```

- [ ] **Step 4: Update navigation.test.ts — assert new student nav shape**

Add tests for the new nav structure (keep existing roleHomePath/initialsOf tests):

```ts
import { describe, it, expect } from 'vitest';
import { roleHomePath, initialsOf, STUDENT_SIDEBAR_NAV, EMPLOYER_SIDEBAR_NAV, ADMIN_SIDEBAR_NAV } from './navigation';
import type { UserRole } from '../types';

describe('navigation', () => {
  it('returns student dashboard path for STUDENT role', () => {
    expect(roleHomePath('STUDENT')).toBe('/student/dashboard');
  });
  it('returns employer dashboard path for EMPLOYER role', () => {
    expect(roleHomePath('EMPLOYER')).toBe('/employer/dashboard');
  });
  it('returns public home for unknown role', () => {
    expect(roleHomePath(undefined)).toBe('/');
    expect(roleHomePath('UNKNOWN' as UserRole)).toBe('/');
  });
  it('generates initials from email', () => {
    expect(initialsOf('ava.chen@example.com')).toBe('AC');
    expect(initialsOf('john_doe@test.org')).toBe('JD');
    expect(initialsOf('single@name.com')).toBe('S');
    expect(initialsOf('')).toBe('?');
  });
});

describe('STUDENT_SIDEBAR_NAV', () => {
  it('has Main section with Home as first item', () => {
    expect(STUDENT_SIDEBAR_NAV[0].label).toBe('Main');
    expect(STUDENT_SIDEBAR_NAV[0].items[0].to).toBe('/student/dashboard');
    expect(STUDENT_SIDEBAR_NAV[0].items[0].label).toBe('Home');
  });
  it('has Explore and Career tools sections', () => {
    expect(STUDENT_SIDEBAR_NAV[1].label).toBe('Explore');
    expect(STUDENT_SIDEBAR_NAV[2].label).toBe('Career tools');
  });
  it('includes Network in Main', () => {
    const mainItems = STUDENT_SIDEBAR_NAV[0].items;
    expect(mainItems.some((i) => i.to === '/student/network')).toBe(true);
  });
});

describe('EMPLOYER_SIDEBAR_NAV', () => {
  it('has Main section with Home as first item', () => {
    expect(EMPLOYER_SIDEBAR_NAV[0].label).toBe('Main');
    expect(EMPLOYER_SIDEBAR_NAV[0].items[0].to).toBe('/employer/dashboard');
  });
});

describe('ADMIN_SIDEBAR_NAV', () => {
  it('has Main, Monitoring, System, Account sections', () => {
    expect(ADMIN_SIDEBAR_NAV.map((s) => s.label)).toEqual(['Main', 'Monitoring', 'System', 'Account']);
  });
});
```

- [ ] **Step 5: Add /student/network route + empty state page**

Create `frontend/src/features/student/StudentNetworkPage.tsx`:

```tsx
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

export const StudentNetworkPage = () => (
  <div className="page fade-in">
    <PageHeader title="Network" subtitle="Connect with professionals and grow your career." />
    <div className="mt-6">
      <EmptyState
        icon="UsersThree"
        title="Network coming soon"
        text="Build professional connections, follow industry leaders, and expand your opportunities."
      />
    </div>
  </div>
);
```

In `AppRoutes.tsx`, add the route inside the student protected section (after the notifications route, before messages):

```tsx
const StudentNetworkPage = lazy(() => import('../features/student/StudentNetworkPage').then((m) => ({ default: m.StudentNetworkPage })));
```

And inside the `<Route element={<RoleLayout role="STUDENT" ... />}>` block, add:

```tsx
<Route path="/student/network" element={<LazyPage><Page><StudentNetworkPage /></Page></LazyPage>} />
```

Also add the `EmployerNetworkPage` empty state for employer route consistency, or skip — the employer nav doesn't include Network. Skip for now.

- [ ] **Step 6: Update Sidebar.tsx footer to show real user profile**

Update `AppShell.tsx` to import `useAuth` and pass the user to the sidebar footer. The sidebar footer in AppShell currently shows static "GradTure" / role. Change to:

```tsx
// At top of AppShell.tsx, add:
import { useAuth } from '../core/auth/AuthContext';
import { Avatar } from '../components/Avatar';
import { PhosphorIcon } from '../components/PhosphorIcon';
import { useNavigate } from 'react-router-dom';

// Inside the component:
const { user, logout } = useAuth();
const navigate = useNavigate();
const displayName = user?.name || user?.email || 'User';

// Replace the footer prop passed to Sidebar:
footer={
  <div className="sidebar-user">
    <Avatar src={user?.avatarUrl} name={displayName} size="sm" userId={user?.id} />
    <div className="sidebar-user__meta">
      <span className="sidebar-user__name">{displayName}</span>
      <span className="sidebar-user__role">{role}</span>
    </div>
    <button
      type="button"
      className="sidebar-user__logout"
      onClick={logout}
      aria-label="Log out"
      title="Log out"
    >
      <PhosphorIcon name="SignOut" size={16} weight="regular" />
    </button>
  </div>
}
```

Also add a dropdown behavior: clicking the sidebar-user area opens a small popover (or just keep the simple logout button — minimal approach). The spec says "small dropdown indicator" → for the initial implementation, keep the logout button visible. A full dropdown is a follow-up if needed.

- [ ] **Step 7: Run tests**

```bash
cd frontend
npx tsc --noEmit
npm test
```

The new navigation tests pass. No existing tests break (roleHomePath unchanged, admin nav destinations unchanged).

- [ ] **Step 8: Commit**

```bash
git add frontend/src/core/utils/navigation.ts frontend/src/core/utils/navigation.test.ts frontend/src/routing/AppRoutes.tsx frontend/src/features/student/StudentNetworkPage.tsx frontend/src/layouts/AppShell.tsx
git commit -m "style: restructure sidebar nav — Main/Explore/Career tools + user footer + Network route"
```

---

## Task 5: Sidebar + Header + Layout CSS Restyle

**Files:**
- Modify: `frontend/src/styles.css` (sidebar classes, app-header classes, layout frame, typography)

**Interfaces:**
- Consumes: token values from Task 1, component structure from Tasks 3-4
- Produces: all shell/layout CSS restyled per spec

- [ ] **Step 1: Rewrite the sidebar CSS block**

Find the `.sidebar` rule block in `styles.css` (lines ~3331–3620). Replace the entire block with the following quiet professional sidebar CSS. Preserve all existing selector names (`.sidebar`, `.sidebar.is-collapsed`, `.sidebar__head`, `.sidebar__brand`, `.sidebar__nav`, `.sidebar__section`, `.sidebar__section-label`, `.sidebar__link`, `.sidebar__link:hover`, `.sidebar__link.is-active`, `.sidebar__icon`, `.sidebar__label`, `.sidebar__footer`, `.sidebar-user`, `.sidebar-overlay`).

Key changes: bg = surface, border-right = 1px solid var(--color-border), no shadow, active = primary-soft bg + 2px left accent bar, collapsed = 68px icon rail, section-label = 11px uppercase tertiary.

Write the new CSS block for `.sidebar` and all `.sidebar__*` selectors. Use existing BEM structure. The key rules:

```css
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width, 240px);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  z-index: 40;
  transition: width 320ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar.is-collapsed {
  width: var(--sidebar-collapsed, 68px);
}

.sidebar__head {
  height: var(--header-height, 56px);
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: none;
  background: none;
  padding: 4px;
  border-radius: var(--radius-md);
  transition: background-color 150ms ease;
}

.sidebar__brand:hover,
.sidebar__brand:focus-visible {
  background: var(--color-surface-muted);
}

.sidebar.is-collapsed .sidebar__brand {
  justify-content: center;
}

.sidebar.is-collapsed .animated-logo__text {
  display: none;
}

.sidebar__nav {
  flex: 1 1 auto;
  padding: var(--space-3) var(--space-3);
  overflow-y: auto;
}

.sidebar__section {
  margin-bottom: var(--space-3);
}

.sidebar__section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-tertiary);
  padding: var(--space-2) var(--space-3);
  line-height: 1;
}

.sidebar.is-collapsed .sidebar__section-label {
  display: none;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 8px var(--space-3);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 400;
  line-height: 1.4;
  position: relative;
  transition: background-color 150ms ease, color 150ms ease;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  min-height: 36px;
}

.sidebar__link:hover {
  background: var(--color-surface-muted);
  color: var(--color-text);
}

.sidebar__link.is-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 500;
}

.sidebar__link.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background: var(--color-primary);
  border-radius: 0 2px 2px 0;
}

.sidebar.is-collapsed .sidebar__link {
  justify-content: center;
  padding: 8px;
  min-height: 40px;
}

.sidebar.is-collapsed .sidebar__link:hover,
.sidebar.is-collapsed .sidebar__link.is-active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.sidebar.is-collapsed .sidebar__link.is-active::before {
  top: 8px;
  bottom: 8px;
  left: 0;
}

.sidebar__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

.sidebar__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar.is-collapsed .sidebar__label {
  display: none;
}

.sidebar__footer {
  border-top: 1px solid var(--color-border);
  padding: var(--space-3);
  flex-shrink: 0;
}

.sidebar.is-collapsed .sidebar__footer {
  padding: var(--space-2);
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  min-height: 40px;
}

.sidebar.is-collapsed .sidebar-user {
  justify-content: center;
  padding: var(--space-2);
}

.sidebar-user__meta {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.sidebar.is-collapsed .sidebar-user__meta {
  display: none;
}

.sidebar-user__name {
  display: block;
  font-size: 13.5px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user__role {
  display: block;
  font-size: 11.5px;
  color: var(--color-text-tertiary);
  text-transform: capitalize;
}

.sidebar-user__logout {
  background: none;
  border: none;
  padding: 4px;
  border-radius: var(--radius-sm);
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: color 150ms ease, background-color 150ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-user__logout:hover {
  color: var(--color-danger);
  background: var(--color-danger-soft);
}

.sidebar__nav > div + div {
  margin-top: var(--space-1);
  padding-top: var(--space-2);
  border-top: 1px solid var(--color-border);
}

/* sidebar overlay (mobile) */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 35;
}

.sidebar-overlay.is-open {
  display: block;
}
```

- [ ] **Step 2: Rewrite the app-header CSS block**

Find the `.app-header` rules (lines ~3790–3870+). Replace with a static compact header:

```css
.app-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  height: var(--header-height, 56px);
  transition: background-color var(--transition-theme), border-color var(--transition-theme);
}

.app-header__inner {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  padding: 0 var(--space-5);
}

.app-header__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.app-header__search-input {
  width: 100%;
  height: 36px;
  padding: 0 var(--space-3) 0 36px;
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 13.5px;
  color: var(--color-text);
  outline: none;
  transition: border-color 150ms ease;
}

.app-header__search-input::placeholder {
  color: var(--color-text-tertiary);
}

.app-header__search-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.12);
}

.app-header__search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
  pointer-events: none;
}

.header-icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  transition: color 150ms ease, background-color 150ms ease;
}

.header-icon-link:hover {
  background: var(--color-surface-muted);
  color: var(--color-text);
}
```

**Delete** the following CSS rules (they are no longer used):
- `.app-header--glass`
- `.app-header--morphing`
- `.app-header--bubble`
- `.app-header--bubble .app-header__inner`
- `.app-header__brand` (keep if used by public header; otherwise delete)

- [ ] **Step 3: Rewrite the auth-layout / layout frame CSS**

Find the `.auth-layout` / `.auth-main` / `.auth-content` rules (lines ~4586–4640). Replace with:

```css
.auth-layout {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.auth-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width, 240px);
  transition: margin-left 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar.is-collapsed ~ .auth-main,
.auth-layout:has(.sidebar.is-collapsed) .auth-main {
  margin-left: var(--sidebar-collapsed, 68px);
}

.auth-content {
  flex: 1;
  max-width: var(--container-max, 1200px);
  width: 100%;
  margin: 0 auto;
  padding: var(--space-6) var(--space-6);
}

.auth-page {
  max-width: var(--container-max, 1200px);
  width: 100%;
  margin: 0 auto;
}
```

Also add `overflow-x: clip` to the body rule:

```css
body {
  overflow-x: clip;
}
```

(If body rule doesn't exist, add it. If it does, add the `overflow-x: clip` property.)

- [ ] **Step 4: Typography normalization**

Add or update these rules:

```css
.page-title {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text);
  margin: 0;
}

.section-title {
  font-size: 17px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text);
  margin: 0;
}

.card__title {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text);
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-top: var(--space-1);
}
```

- [ ] **Step 5: Delete font-display from CSS**

Search for `--font-display` in `styles.css`. If present, remove it. (The Task 1 token replacement should have already removed it; verify.)

- [ ] **Step 6: Run tests**

```bash
cd frontend
npx tsc --noEmit
npm test
```

- [ ] **Step 7: Browser check — shell renders**

```bash
node "C:\Users\Nath\.claude\skills\browser-automation\browser.mjs" http://localhost:5173/login --wait "input[type='email']" --eval "({ hasSearchInput: !!document.querySelector('.app-header__search-input'), bodyOverflow: getComputedStyle(document.body).overflowX })"
```

Expected: `hasSearchInput` may be `false` on login page (public layout), `bodyOverflow` = `clip`.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/styles.css
git commit -m "style: restyle sidebar, header, layout frame, typography — compact professional shell"
```

---

## Task 6: Shared Components Restyle

**Files:**
- Modify: `frontend/src/components/Button.tsx` (class string changes)
- Modify: `frontend/src/components/Card.tsx` (class string + variant logic)
- Modify: `frontend/src/components/JobCard.tsx` (class string changes)
- Modify: `frontend/src/components/SpatialCard.tsx` (simplify)
- Modify: `frontend/src/components/FilterPill.tsx` (if gradient/glow)

**Interfaces:**
- Consumes: tokens from Task 1
- Produces: all shared components quiet; restyle cascades to all pages

- [ ] **Step 1: Restyle Button.tsx**

In `Button.tsx`, replace the `baseClasses` and `variantClasses` strings:

```ts
const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-primary-text hover:bg-primary-hover',
  secondary: 'bg-surface border border-border text-text hover:bg-surface-muted',
  ghost: 'text-text hover:bg-surface-muted',
  danger: 'bg-danger text-white hover:bg-danger/90',
};
```

Remove the `active:translate-y-[1px] hover:-translate-y-[1px] hover:shadow-md` from `baseClasses` (no lift/glow on hover for buttons — spec says subtle elevation only on cards).

- [ ] **Step 2: Restyle Card.tsx**

Replace the `variantClasses` record with all variants pointing to the same quiet look:

```ts
const variantClasses: Record<CardVariant, string> = {
  default: '',
  spatial: '',
  glass: '',
  bento: '',
};
```

This collapses all card variants to the same appearance (no glass, no spatial depth).

- [ ] **Step 3: Restyle JobCard.tsx**

In the `cn(...)` call, replace the shadow references:

```ts
selected
  ? 'border-primary bg-primary/5'
  : 'border-border bg-surface hover:bg-surface-muted',
```

(Remove `shadow-[var(--space-depth-md)]` and `hover:shadow-[var(--space-depth-sm)]` — use subtle border/bg changes only.)

- [ ] **Step 4: Restyle SpatialCard.tsx**

Replace the entire `cn(...)` call in SpatialCard with:

```tsx
className={cn(
  'rounded-xl border border-border bg-surface p-5',
  onClick && 'cursor-pointer hover:bg-surface-muted',
  className
)}
```

Remove all shadow, glow, gradient, depth, radial-gradient references.

- [ ] **Step 5: Check FilterPill.tsx for gradient/glow**

Read `frontend/src/components/FilterPill.tsx`. If it contains gradient or glow class references, replace them with neutral border/bg styles. If already quiet, skip.

- [ ] **Step 6: Run tests**

```bash
cd frontend
npx tsc --noEmit
npm test
```

- [ ] **Step 7: Commit**

```bash
git add frontend/src/components/Button.tsx frontend/src/components/Card.tsx frontend/src/components/JobCard.tsx frontend/src/components/SpatialCard.tsx
git commit -m "style: restyle shared components — quiet cards, subtle buttons, no glow/shadow/lift"
```

---

## Task 7: styles.css Decorative Sweep

**Files:**
- Modify: `frontend/src/styles.css` (bulk: delete/neutralize decorative CSS rules)

**Interfaces:**
- Consumes: tasks 1-6 (tokens already rethemed, shell rewritten, components restyled)
- Produces: gradient=0, glow=0, glass=0, backdrop≤2, @keyframes≤5, Spatial=0

- [ ] **Step 1: Count current state**

```powershell
"gradient:"; Select-String -Path "frontend/src/styles.css" -Pattern "gradient" | Measure-Object | Select-Object -ExpandProperty Count
"glow:"; Select-String -Path "frontend/src/styles.css" -Pattern "glow" | Measure-Object | Select-Object -ExpandProperty Count
"glass:"; Select-String -Path "frontend/src/styles.css" -Pattern "glass" | Measure-Object | Select-Object -ExpandProperty Count
"backdrop-filter:"; Select-String -Path "frontend/src/styles.css" -Pattern "backdrop-filter" | Measure-Object | Select-Object -ExpandProperty Count
"@keyframes:"; Select-String -Path "frontend/src/styles.css" -Pattern "@keyframes" | Measure-Object | Select-Object -ExpandProperty Count
"Spatial:"; Select-String -Path "frontend/src/styles.css" -Pattern "Spatial|spatial" | Measure-Object | Select-Object -ExpandProperty Count
```

Note the baseline counts before cleanup.

- [ ] **Step 2: Delete all gradient-related CSS rules**

Grep for lines containing `gradient` (excluding the Tailwind import and the token block that was already removed in Task 1). Each remaining `gradient` usage is a CSS rule using a gradient value (background, box-shadow gradient, etc.). For each rule block containing `gradient`:

- If it's a decorative background gradient (e.g., `.gradient-primary`, `.hero-gradient`, `background: linear-gradient(...)`), delete the entire rule block.
- If it's a utility class that wraps gradient text, delete it.

Delete all `.gradient-*` class blocks and any rule using `linear-gradient(...)` or `radial-gradient(...)` as a decorative effect.

- [ ] **Step 3: Delete all glow-related CSS rules**

Search for rules containing `glow` (class names like `.glow-*`, or properties using glow values). Delete the entire rule block for each.

- [ ] **Step 4: Delete all glass-related CSS rules**

Search for rules containing `glass` (`.glass-*`, `.auth-card` if it uses glass, `.glass-overlay`, etc.). Delete each entire rule block.

- [ ] **Step 5: Delete spatial-related CSS rules**

Search for rules containing `spatial` (`.spatial-*`, `.spatial-background`, `.spatial-elevated`, `.spatial-glass`, `.spatial-glow-ring`). Delete each entire rule block. Keep only if they're being neutralized by Component Task 2 (JS returns empty fragment), so the CSS is dead.

- [ ] **Step 6: Delete shimmer/ambient/morph discovery rules**

Delete all `.shimmer-*`, `.ambient-*`, `.morph-*`, `.discovery-floating-*`, `.discovery-badge-shimmer`, `.discovery-hover-preview`, `.cta-slide-body` rules.

- [ ] **Step 7: Neutralize heavy box-shadows**

Search for `box-shadow` in styles.css. Replace any shadow that is not `--shadow-xs`, `--shadow-sm`, or `--shadow-md` (e.g., `--space-depth-lg`, `--space-depth-xl`, custom tinted shadows) with `var(--shadow-xs)` or remove the shadow declaration entirely.

- [ ] **Step 8: Remove unused @keyframes**

After deleting decorative rules, check if any `@keyframes` blocks are now orphaned. Keep only: `fadeIn`, `scaleIn`, `page-enter`, and any loading skeleton pulse animation. Delete any orphaned `@keyframes`.

- [ ] **Step 9: Remove orphaned selectors**

Grep for CSS selectors that are referenced in no TSX file. For each orphaned class, delete the rule. The easiest approach: compare CSS selectors to `className="..."` patterns in TSX. Focus on the decorative selectors removed in steps 2-6.

- [ ] **Step 10: Verify grep guardrails**

```powershell
"gradient:"; Select-String -Path "frontend/src/styles.css" -Pattern "gradient" | Measure-Object | Select-Object -ExpandProperty Count
"glow:"; Select-String -Path "frontend/src/styles.css" -Pattern "glow" | Measure-Object | Select-Object -ExpandProperty Count
"glass:"; Select-String -Path "frontend/src/styles.css" -Pattern "glass" | Measure-Object | Select-Object -ExpandProperty Count
"backdrop-filter:"; Select-String -Path "frontend/src/styles.css" -Pattern "backdrop-filter" | Measure-Object | Select-Object -ExpandProperty Count
"@keyframes:"; Select-String -Path "frontend/src/styles.css" -Pattern "@keyframes" | Measure-Object | Select-Object -ExpandProperty Count
"Spatial:"; Select-String -Path "frontend/src/styles.css" -Pattern "Spatial|spatial" | Measure-Object | Select-Object -ExpandProperty Count
```

Targets: gradient=0, glow=0, glass=0, backdrop≤2, @keyframes≤5, Spatial=0.

- [ ] **Step 11: Run tests**

```bash
cd frontend
npx tsc --noEmit
npm test
```

- [ ] **Step 12: Commit**

```bash
git add frontend/src/styles.css
git commit -m "style: sweep styles.css — delete gradient, glow, glass, spatial, ambient, morph, discovery CSS rules"
```

---

## Task 8: Page-Level Targeted Restyles

**Files:**
- Modify: `frontend/src/features/jobs/JobListPage.tsx` (replace MorphingText import with static text)
- Modify: `frontend/src/features/student/StudentDashboardPage.tsx` (minor Bento layout adjustment)
- Modify: `frontend/src/features/auth/AuthPage.tsx` or relevant auth pages (remove AmbientBackground import if still referenced)
- Modify: `frontend/src/features/landing/HomePage.tsx` (remove Magnetic import if referenced)
- Modify: `frontend/src/features/landing/LandingPresentation.tsx` (remove SpatialBackground/AmbientBackground imports)

**Interfaces:**
- Consumes: neutralized components from Task 2, tokens from Task 1
- Produces: all pages render without decorative component visual remnants

- [ ] **Step 1: JobListPage — replace MorphingText with static text**

In `JobListPage.tsx`, the title currently uses `<MorphingText text="Find the career you always wanted" as="span" />`. Replace with:

```tsx
title="Find the career you always wanted"
```

Remove the `MorphingText` import line.

- [ ] **Step 2: JobListPage — add URL search param support (for header search integration)**

In `JobListPage.tsx`, add `useSearchParams` from react-router-dom to read the `q` parameter and initialize search state:

```tsx
import { useSearchParams } from 'react-router-dom';

// Inside the component, replace:
// const [search, setSearch] = useState('');
// with:
const [searchParams] = useSearchParams();
const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
```

This connects the header global search (from Task 3) to the jobs list.

- [ ] **Step 3: LandingPresentation.tsx — remove decorative component usage**

In `LandingPresentation.tsx`:
- Remove `import { AmbientBackground, AmbientBackgroundHandle } from '../../components/AmbientBackground';`
- Remove `import { SpatialBackground } from '../../components/SpatialBackground';`
- Remove the `<AmbientBackground ref={backdropRef} />` line
- Remove the `<SpatialBackground />` line
- Remove the `backdropRef` usage (the `useRef<AmbientBackgroundHandle>`)

The neutralized components (Task 2) already render empty fragments, so this step is a cleanup to remove dead imports. The page will still render correctly without them.

- [ ] **Step 4: HomePage.tsx — remove Magnetic usage**

In `HomePage.tsx`, remove the `import { Magnetic } from '../../components/Magnetic';` and unwrap any `<Magnetic>...</Magnetic>` wrappers around buttons. The neutralized Magnetic renders children unchanged, so this is a cleanup step.

- [ ] **Step 5: Auth pages — remove AmbientBackground import if present**

Check `AuthLayout.tsx` and `AuthModal.tsx` for AmbientBackground imports. Since the component is neutralized (returns empty fragment), imports are safe to keep. If the design calls for cleaner imports, remove them — but it's optional and low-risk. Skip if uncertain.

- [ ] **Step 6: Run tests**

```bash
cd frontend
npx tsc --noEmit
npm test
```

- [ ] **Step 7: Browser verification**

```bash
node "C:\Users\Nath\.claude\skills\browser-automation\browser.mjs" http://localhost:5173 --wait ".page-enter-active" --eval "({ title: document.title, bodyLen: document.body.innerText.length })"
node "C:\Users\Nath\.claude\skills\browser-automation\browser.mjs" http://localhost:5173/login --eval "({ hasAmbientBg: document.querySelector('.ambient-background')?.children.length > 0 })"
```

Expected: homepage renders with content; login page has no ambient background children (empty fragment).

- [ ] **Step 8: Commit**

```bash
git add frontend/src/features/jobs/JobListPage.tsx frontend/src/features/landing/LandingPresentation.tsx frontend/src/features/landing/HomePage.tsx
git commit -m "style: clean up page-level decorative component usage, wire job search to URL params"
```

---

## Task 9: Responsive + Final Polish

**Files:**
- Modify: `frontend/src/styles.css` (responsive rules audit)
- Modify: `frontend/src/styles.css` (body overflow-x: clip — verify)

**Interfaces:**
- Consumes: all previous tasks
- Produces: no horizontal overflow, mobile drawer works, tables responsive

- [ ] **Step 1: Verify body overflow-x: clip**

```powershell
Select-String -Path "frontend/src/styles.css" -Pattern "overflow-x:\s*clip"
```

If not present, add to the body or html rule:
```css
body, html {
  overflow-x: clip;
}
```

- [ ] **Step 2: Verify mobile sidebar drawer still works**

Check `sidebar-overlay.is-open` rule exists (added in Task 5). The AppShell mobile toggle logic is unchanged (uses `sidebarOpen` state). No code changes needed — just verify.

- [ ] **Step 3: Verify BentoGrid responsive classes**

`BentoGrid.tsx` already uses `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` — responsive stacking is built in. No changes needed.

- [ ] **Step 4: Verify DataTable mobile**

Check if `DataTable` has responsive rules in styles.css. The `.data-table` class should have a `@media` rule that converts rows to card layout below 640px. If not present, add:

```css
@media (max-width: 639px) {
  .data-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

- [ ] **Step 5: Run final verification**

```bash
cd frontend
npx tsc --noEmit
npm test
```

Full grep guardrail one more time:
```powershell
"gradient:"; Select-String -Path "frontend/src/styles.css" -Pattern "gradient" | Measure-Object | Select-Object -ExpandProperty Count
"glow:"; Select-String -Path "frontend/src/styles.css" -Pattern "glow" | Measure-Object | Select-Object -ExpandProperty Count
"glass:"; Select-String -Path "frontend/src/styles.css" -Pattern "glass" | Measure-Object | Select-Object -ExpandProperty Count
"backdrop-filter:"; Select-String -Path "frontend/src/styles.css" -Pattern "backdrop-filter" | Measure-Object | Select-Object -ExpandProperty Count
"@keyframes:"; Select-String -Path "frontend/src/styles.css" -Pattern "@keyframes" | Measure-Object | Select-Object -ExpandProperty Count
"Spatial:"; Select-String -Path "frontend/src/styles.css" -Pattern "Spatial|spatial" | Measure-Object | Select-Object -ExpandProperty Count
```

- [ ] **Step 6: Browser smoke tests**

```bash
node "C:\Users\Nath\.claude\skills\browser-automation\browser.mjs" http://localhost:5173 --wait ".page-enter-active" --eval "({ overflowX: getComputedStyle(document.body).overflowX, bodyLen: document.body.innerText.length, title: document.title })"
node "C:\Users\Nath\.claude\skills\browser-automation\browser.mjs" http://localhost:5173/login --eval "({ loginPage: !!document.querySelector('input[type=email]'), noAmbientBg: !document.querySelector('.ambient-background canvas') })"
```

Expected: overflowX = clip, bodyLen > 1000, title = "GradTure", login page renders, no ambient background canvas.

- [ ] **Step 7: Final commit**

```bash
git add frontend/src/styles.css
git commit -m "style: final responsive polish — overflow-x clip, mobile table, Bento responsive verified"
```

---

## Execution Notes

**Task ordering is strict:** Tasks 1→2→3→4→5→6→7→8→9 must execute in sequence because:
- Task 1 (tokens) must exist before any CSS changes
- Task 2 (neutralize decorative JS) must precede Task 7 (CSS sweep of spatial/ambient rules)
- Task 3 (header rewrite) must complete before Task 4 (navigation restructure uses new AppShell)
- Tasks 5-6 can be done in parallel if needed, but Task 7 (CSS sweep) depends on both

**Grep guardrail verification** must happen after every task. If a guardrail fails after Task 7, the most likely cause is a leftover `gradient` or `glow` in a rule that was missed — search for it and delete the rule.

**No chart library changes.** The existing `Sparkline`, `ProgressRing`, `ProgressBar`, `KPICard` are all CSS/SVG-based — restyled by Task 5 CSS rules + Task 6 component tweaks only.

**Backend is unaffected.** All changes are frontend-only.

**Browser verification** after Task 5 is the critical gate — if the shell doesn't render, the issue is in the sidebar/header CSS rewrites. The browser-automation skill can be used to snapshot and inspect the page.
