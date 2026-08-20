# Gradture — Issue Tracking

This document is the single source of truth for production bugs, known issues, and their resolution status.

## Issue Format

Each issue follows this structure:

```
ID: BUG-001
Title: ...
Severity: P0 | P1 | P2 | P3
Priority: ...
Category: ...
Affected Role: ...
Affected Platform: ...
Environment: ...
Status: OPEN | INVESTIGATING | FIXED | READY_FOR_TEST | VERIFIED | CLOSED | BLOCKED
Detected: ...
Symptoms: ...
Root Cause: ...
Expected Behavior: ...
Actual Behavior: ...
Fix: ...
Files Changed: ...
Tests: ...
Deployment Verification: ...
Regression Verification: ...
```

## Statuses

| Status | Meaning |
|--------|---------|
| OPEN | Issue identified, not yet started |
| INVESTIGATING | Root cause being investigated |
| FIXED | Code fix implemented, awaiting test/deployment |
| READY_FOR_TEST | Fix deployed to staging/test environment |
| VERIFIED | Fix confirmed in production |
| CLOSED | Issue resolved and verified |
| BLOCKED | Cannot proceed due to external dependency |

## Severity

| Severity | Meaning |
|----------|---------|
| P0 | Critical — complete outage, data loss, or security breach |
| P1 | High — major feature broken, significant user impact |
| P2 | Medium — minor feature broken, workaround available |
| P3 | Low — cosmetic issue, no user impact |

## Categories

Authentication, Authorization/RBAC, Profile, Resume, Jobs, Job Ingestion, Applications, Messaging, Notifications, Interviews, Recommendations, Employer, Admin, Database, API, Frontend, Backend, Storage, Email, Deployment, Security, Performance, UX, Testing, Technical Debt

---

## Active Issues

### BUG-001: Production CSRF/Auth Loop Causing Frontend Crash

ID: BUG-001
Title: Production CSRF/auth loop causes 401 on refresh and frontend .length crash on Analytics page
Severity: P1
Priority: High
Category: Authentication / Frontend
Affected Role: Employer, Student, Admin (any authenticated user)
Affected Platform: Production (Railway + Vercel)
Environment: Production
Status: INVESTIGATING
Detected: 2026-08-17
Symptoms:
- `Failed to load resource: the server responded with a status of 401 ()` on `/api/v1/auth/refresh`
- `TypeError: Cannot read properties of undefined (reading 'length')` in `EmployerAnalyticsPage`
- React ErrorBoundary catches the error and renders fallback
- Entire authenticated app becomes unusable after session expires or cookie is lost

Root Cause:
1. Frontend `authApi.refresh()` calls `POST /api/v1/auth/refresh` without `requiresAuth: true`, but the backend CSRF middleware intercepts it because the `x-csrf-token` header is missing or the `XSRF-TOKEN` cookie is absent.
2. When refresh fails with 401, `AuthContext` sets `user = null` and `status = 'unauthenticated'`, causing `ProtectedRoute` to redirect to `/login`.
3. During the redirect/re-render cycle, `EmployerAnalyticsPage` receives `analytics = undefined` and calls `analytics.hiringFunnel.length` without optional chaining, throwing a synchronous error that crashes the React tree.
4. Similar unguarded `.length` accesses exist in `AdminListPage`, `DataTable`, `JobListPage`, and other components.

Expected Behavior:
- Session refresh should succeed silently when the access_token cookie is valid.
- If refresh fails, the app should redirect to login gracefully without throwing uncaught exceptions.
- All list/array accesses should be defensive against `undefined`/`null` data.

Actual Behavior:
- Refresh returns 401 in production when CSRF cookie/header alignment is broken.
- Frontend crashes with uncaught TypeError during auth state transition.

Fix:
- Backend: Ensure CSRF middleware does not block public auth endpoints (`/api/v1/auth/login`, `/api/v1/auth/register`, `/api/v1/auth/refresh`, etc.). Current code exempts them, but cookie/header mismatch still causes issues.
- Backend: Verify cookie domain/secure/sameSite settings match the production frontend origin.
- Frontend: Add optional chaining (`?.length ?? 0`) to all array accesses in production pages.
- Frontend: Ensure `AuthContext` transition to `unauthenticated` does not render protected content that assumes data exists.

Files Changed:
- `backend/src/employer/employer.service.ts` — added `views`, `pendingInterviews`, `hiringFunnel` to analytics response
- `frontend/src/features/employer/EmployerAnalyticsPage.tsx` — added `?? 0` fallbacks and `?.length` guard

Tests:
- Backend: 92/92 pass
- Frontend: 23/23 pass
- Frontend build: passes

Deployment Verification:
- [ ] Verify production Railway logs show CSRF cookie being set on first response
- [ ] Verify browser DevTools → Application → Cookies shows `XSRF-TOKEN` and `access_token` for production domain
- [ ] Verify `CORS_ORIGIN` in Railway includes the exact Vercel production domain
- [ ] Verify `VITE_API_URL` in Vercel matches Railway backend URL (no trailing `/api/v1`)
- [ ] Verify `/api/v1/auth/refresh` returns 200 with new `access_token` cookie when valid session exists
- [ ] Verify employer `/analytics` page renders without crash after manual token refresh

Regression Verification:
- [ ] Log out and log back in — all role dashboards load
- [ ] Wait for token expiry — refresh succeeds or redirects to login without console errors
- [ ] Navigate to all authenticated pages with expired token — no uncaught TypeError in console

---

### BUG-002: Hardcoded Production Credentials in .env.production

ID: BUG-002
Title: .env.production contains hardcoded database and JWT secrets
Severity: P0
Priority: Critical
Category: Security
Affected Role: All
Affected Platform: All
Environment: Production
Status: OPEN
Detected: 2026-08-17
Symptoms:
- `DATABASE_URL`, `POSTGRES_PASSWORD`, and `JWT_SECRET` are present in `.env.production` with literal values
- File is listed in `.gitignore` but may have been committed before ignore was added
- Credentials are visible in repository working tree

Root Cause:
- `.env.production` was created with placeholder values replaced by actual secrets, and either committed before `.gitignore` was updated, or the ignore rule is not being enforced.

Expected Behavior:
- No plaintext secrets in the repository. All secrets injected via environment variables (Railway/Vercel secrets manager).

Actual Behavior:
- `.env.production` contains production secrets in plaintext.

Fix:
- Rotate `DATABASE_URL`, `POSTGRES_PASSWORD`, and `JWT_SECRET` immediately.
- Remove the file from git history if it was ever committed: `git rm --cached .env.production` and use `git filter-branch` or BFG Repo-Cleaner.
- Ensure Railway and Vercel environment variables are the only sources of secrets.
- Add pre-commit hook to prevent future secret commits.

Files Changed:
- `.env.production` (should be removed from version control)

Tests:
- Verify `git ls-files .env.production` returns nothing
- Verify Railway backend starts without local `.env.production`

Deployment Verification:
- [ ] Railway environment variables contain rotated secrets
- [ ] Vercel environment variables contain `VITE_API_URL` and `VITE_SENTRY_DSN`
- [ ] Backend health check returns 200 with new secrets
- [ ] Frontend can authenticate with new JWT_SECRET

Regression Verification:
- [ ] All existing users can log in after JWT_SECRET rotation (requires new token issuance)
- [ ] Database connections work with new DATABASE_URL

---

### BUG-003: Resume Upload PostgreSQL UTF-8 / NUL Byte Error

ID: BUG-003
Title: Resume upload fails with PostgreSQL invalid byte sequence for encoding "UTF8": 0x00
Severity: P1
Priority: High
Category: Resume / Database
Affected Role: Student (Talent)
Affected Platform: All
Environment: Production, Staging
Status: FIXED
Detected: Prior to 2026-08-17
Symptoms:
- `POST /api/v1/resumes` returns 500
- PostgreSQL error: `invalid byte sequence for encoding "UTF8": 0x00`
- Resume upload works for clean files but fails for files with embedded NUL bytes

Root Cause:
- Resume text extraction or filename parsing introduced NUL bytes (`\0`) into strings passed to Prisma/PostgreSQL.
- PostgreSQL text columns reject NUL bytes.

Expected Behavior:
- Resume upload succeeds regardless of NUL bytes in source file.

Actual Behavior:
- Prisma query fails with PostgreSQL encoding error when NUL bytes reach the database.

Fix:
- Added `sanitizeDatabaseString()` utility that strips NUL bytes and control characters before any Prisma write.
- Applied sanitization in `ResumesService.uploadAndParse()` and `replace()` to filename, parsed text, extracted name/focus/summary/skills, and MIME type.
- Added `FileValidationService` to reject files with NUL bytes in content or filename before processing.

Files Changed:
- `backend/src/common/utils/sanitize.ts`
- `backend/src/common/utils/sanitize.spec.ts`
- `backend/src/resumes/file-validation.service.ts`
- `backend/src/resumes/resumes.service.ts`
- `backend/src/resumes/resume.parser.ts`

Tests:
- `sanitize.spec.ts`: 5/5 pass
- `resumes.service.spec.ts`: 18/18 pass
- Backend full suite: 92/92 pass

Deployment Verification:
- [ ] Upload resume PDF with NUL bytes in filename — succeeds, NULs stripped
- [ ] Upload corrupted DOCX with NUL bytes in content — rejected with clear error
- [ ] Upload clean TXT resume — succeeds, parsed correctly

Regression Verification:
- [ ] Existing resume upload/download/view flows unchanged
- [ ] Profile auto-update from resume parsing still works

---

### BUG-004: Prisma Migration Failure — Job Ingestion Enum/Table Already Exists

ID: BUG-004
Title: Railway deployment fails because job ingestion migration partially applied
Severity: P1
Priority: High
Category: Database / Deployment
Affected Role: All
Affected Platform: Production (Railway)
Environment: Production
Status: FIXED
Detected: 2026-08-15
Symptoms:
- `prisma migrate deploy` fails with `enum "JobSourceStatus" already exists`
- Railway backend fails to start because migration `20260815001346_add_job_ingestion` was partially applied
- Subsequent deployments fail at the same migration

Root Cause:
- Railway restarted the backend container during migration, causing a partial application.
- The original migration uses `CREATE TYPE` and `CREATE TABLE` without `IF NOT EXISTS` guards.
- `prisma migrate deploy` does not support skipping already-applied migrations in the same way as `prisma db push`.

Expected Behavior:
- Migration either completes fully or is safely recoverable without manual database intervention.

Actual Behavior:
- Migration partially applied, leaving database in inconsistent state.
- `prisma migrate deploy` fails on next attempt because objects already exist.

Fix:
- Created idempotent recovery migration `20260816000000_recover_job_ingestion_state` using `DO $$ ... IF NOT EXISTS $$` blocks for all enums, tables, columns, indexes, and foreign keys.
- Updated `docker-entrypoint.sh` to detect the failed migration and run `prisma migrate resolve --applied` before `prisma migrate deploy`.
- All recovery migration SQL is wrapped in conditional checks, making it safe to run multiple times.

Files Changed:
- `backend/prisma/migrations/20260816000000_recover_job_ingestion_state/migration.sql`
- `backend/docker-entrypoint.sh`

Tests:
- Recovery migration verified to be idempotent
- Backend tests: 92/92 pass

Deployment Verification:
- [ ] Deploy to fresh Railway PostgreSQL — all migrations apply cleanly
- [ ] Deploy to Railway with partially applied migration — recovery migration resolves state, deploy succeeds
- [ ] Run `prisma migrate status` — shows all migrations as applied

Regression Verification:
- [ ] Existing data in JobSource, JobSourceRun, JobSourceJob tables preserved
- [ ] Job listing and Browse Jobs functionality unaffected

---

### BUG-005: Frontend Analytics Page Crash on Undefined hiringFunnel

ID: BUG-005
Title: EmployerAnalyticsPage throws TypeError when hiringFunnel is undefined
Severity: P1
Priority: High
Category: Frontend
Affected Role: Employer
Affected Platform: All
Environment: Production, Staging, Development
Status: FIXED
Detected: 2026-08-17
Symptoms:
- Navigating to `/employer/analytics` throws `TypeError: Cannot read properties of undefined (reading 'length')`
- React ErrorBoundary catches error and renders fallback
- Page is completely unusable for employers

Root Cause:
- Backend `getAnalytics()` returned `{ activeJobs, applicationsToday, totalApplications, ... }` without `views`, `pendingInterviews`, or `hiringFunnel`.
- Frontend `EmployerAnalyticsPage.tsx` accessed `analytics.views`, `analytics.pendingInterviews`, and `analytics.hiringFunnel.length` without nullish coalescing or optional chaining.
- When backend response lacked these fields, accessing `.length` on `undefined` threw.

Expected Behavior:
- Analytics page renders with available data, showing zeros for missing metrics.

Actual Behavior:
- Page crashes with uncaught TypeError.

Fix:
- Backend: `getAnalytics` now returns `views` (sum of published job views), `pendingInterviews` (mapped from `interviewing` count), and `hiringFunnel` (5-stage array).
- Frontend: All stat cards use `?? 0` fallback; `hiringFunnel` access uses `?.length ?? 0`.

Files Changed:
- `backend/src/employer/employer.service.ts`
- `frontend/src/features/employer/EmployerAnalyticsPage.tsx`

Tests:
- Backend: 92/92 pass
- Frontend build: passes

Deployment Verification:
- [ ] Employer analytics page loads without console errors
- [ ] Stat cards show correct values
- [ ] Hiring funnel renders when data exists

Regression Verification:
- [ ] Employer dashboard still loads
- [ ] Other employer pages unaffected

---

### BUG-006: Production CSRF Token Mismatch on Authenticated Requests

ID: BUG-006
Title: CSRF guard blocks authenticated POST/PUT/DELETE requests in production
Severity: P1
Priority: High
Category: Security / API / Frontend
Affected Role: All authenticated users
Affected Platform: Production
Environment: Production
Status: INVESTIGATING
Detected: 2026-08-17
Symptoms:
- `POST /api/v1/resumes` returns 403 with `Invalid CSRF token`
- Other authenticated mutations fail with same error
- GET requests work fine; only state-changing requests blocked

Root Cause:
- Backend CSRF middleware requires both `XSRF-TOKEN` cookie and matching `x-xsrf-token` or `x-csrf-token` header.
- Frontend `api()` client sends `X-XSRF-TOKEN` header for POST/PUT/DELETE/PATCH, reading from cookie or cached header value.
- In production, the cookie may not be set due to:
  - `sameSite: 'none'` requiring `secure: true` and cross-site context
  - Cookie domain mismatch between Railway API and Vercel frontend
  - CORS preflight not exposing `X-CSRF-TOKEN` header correctly
  - Vercel proxy rewriting `/api/*` to Railway, potentially stripping cookies

Expected Behavior:
- CSRF cookie is set on first GET request.
- Frontend reads cookie and sends matching header on subsequent mutations.
- Backend validates and allows request.

Actual Behavior:
- Cookie is not consistently available to frontend.
- Header validation fails, returning 403.

Fix:
- Verify Railway sets `XSRF-TOKEN` cookie with `secure: true`, `sameSite: 'none'`, `domain` matching production origin.
- Verify Vercel `vercel.json` proxy preserves cookies on `/api/*` rewrites.
- Verify CORS `exposedHeaders` includes `X-CSRF-TOKEN`.
- Consider making CSRF optional for cookie-authenticated requests, or switching to double-submit cookie pattern with SameSite=Lax for same-site deployments.

Files Changed:
- `backend/src/main.ts` (CSRF middleware)
- `frontend/src/core/api/client.ts` (CSRF header logic)

Tests:
- Backend: 92/92 pass
- Frontend: 23/23 pass

Deployment Verification:
- [ ] First load sets `XSRF-TOKEN` cookie (check DevTools → Application → Cookies)
- [ ] `POST /api/v1/auth/login` succeeds and returns `access_token` cookie
- [ ] `POST /api/v1/resumes` succeeds with valid CSRF header
- [ ] CORS preflight response includes `X-CSRF-TOKEN` in `Access-Control-Expose-Headers`

Regression Verification:
- [ ] All authenticated mutations (jobs, applications, messages, settings) work
- [ ] Public endpoints (login, register) still work without CSRF token

---

### BUG-007: Frontend Bundle Size Exceeds Recommended Limit

ID: BUG-007
Title: Frontend JS bundle is 879.80 kB (246.91 kB gzipped)
Severity: P3
Priority: Low
Category: Performance / Frontend
Affected Role: All
Affected Platform: All
Environment: Production
Status: OPEN
Detected: 2026-08-17
Symptoms:
- Vite build warning: `Some chunks are larger than 500 kB after minification`
- Initial page load may be slow on mobile/edge networks

Root Cause:
- All routes and components are bundled into a single chunk.
- No code splitting or dynamic imports for route-level components.

Expected Behavior:
- Initial bundle under 500 kB (ideally under 300 kB).

Actual Behavior:
- Main chunk is 879.80 kB.

Fix:
- Implement route-based code splitting with `React.lazy()` and `Suspense`.
- Move heavy components (AdminListPage, DataTable, charts) to dynamic imports.
- Configure `manualChunks` in Vite for vendor splitting (`react`, `react-router-dom`, `@sentry/react`).

Files Changed:
- `frontend/src/routing/AppRoutes.tsx`
- `frontend/vite.config.ts` (if exists)

Tests:
- Frontend build passes
- E2E smoke tests pass

Deployment Verification:
- [ ] `npm run build` shows main chunk under 500 kB
- [ ] Lighthouse performance score improves
- [ ] First contentful paint under 2s on 3G simulation

Regression Verification:
- [ ] All routes load correctly with lazy loading
- [ ] No flash of missing content during route transitions

---

### BUG-008: Service Placeholder Implementation

ID: BUG-008
Title: recommendation service README and main.py contain placeholder/static data
Severity: P2
Priority: Medium
Category: Backend
Affected Role: Student, Employer, Admin
Affected Platform: All
Environment: Production
Status: OPEN
Detected: 2026-08-17
Symptoms:
- `ai-service/README.md` says "Placeholder for the FastAPI-based resume parsing and recommendation service"
- `ai-service/main.py` has hardcoded `JOB_DESCRIPTIONS` and `JOB_TITLES` dictionaries with 5 static jobs
- recommendations may return stale or irrelevant results if the service is used in production

Root Cause:
- recommendation service was scaffolded but not fully connected to live database or real job data.

Expected Behavior:
- recommendation service queries the database for real jobs and returns relevant recommendations.
- recommendation service health check reflects actual database connectivity.

Actual Behavior:
- recommendation service serves static placeholder data.

Fix:
- Remove hardcoded `JOB_DESCRIPTIONS` and `JOB_TITLES`.
- Implement database-backed job loading in `load_jobs_from_db()`.
- Wire recommendation service to backend `/api/v1/recommendations/ai` endpoint.
- Add integration tests for recommendation quality.

Files Changed:
- `ai-service/main.py`
- `ai-service/requirements.txt`
- `backend/src/ai/ai.service.ts`

Tests:
- recommendation service pytest suite
- Backend integration tests for `/api/v1/recommendations/ai`

Deployment Verification:
- [ ] recommendation service connects to production PostgreSQL
- [ ] Recommendations are based on live job data
- [ ] Backend `/api/v1/recommendations/ai` returns real recommendations

Regression Verification:
- [ ] Frontend recommended jobs page works with live recommendation data
- [ ] recommendation monitoring page shows real metrics

---

## Closed Issues

### BUG-004a: Job Ingestion Migration Partially Applied (Predecessor to BUG-004)

ID: BUG-004a
Title: Railway database has partially applied job ingestion migration
Severity: P1
Priority: High
Category: Database / Deployment
Affected Role: All
Affected Platform: Production
Environment: Production
Status: CLOSED
Detected: 2026-08-15
Root Cause: Same as BUG-004
Fix: Recovery migration `20260816000000_recover_job_ingestion_state` created and deployed.

---

## Issue Templates

### Bug Report

```markdown
**Title:** ...

**Severity:** P0 | P1 | P2 | P3

**Environment:** Production | Staging | Development

**Role Affected:** Student | Employer | Admin | Guest

**Steps to Reproduce:**
1. ...
2. ...

**Expected Behavior:**

**Actual Behavior:**

**Console Errors / Logs:**

**Sentry Issue Link (if applicable):**
```

### Production Incident

```markdown
**Incident Title:** ...

**Severity:** P0 | P1 | P2 | P3

**Start Time:** ...

**Impact:** ...

**Timeline:**
- ...

**Root Cause:**

**Resolution:**

**Post-Incident Actions:**
- [ ] ...
```

### Deployment Failure

```markdown
**Service:** Backend | Frontend | Recommendation Service

**Environment:** Production | Staging

**Error Message:**

**Deployment Log:**

**Rollback Status:** Yes / No

**Corrective Action:**
```

---

## GitHub Issue Labels

Use these labels for triage:

| Label | Description |
|-------|-------------|
| `bug` | Something is broken |
| `critical` | P0 — complete outage or data loss |
| `high-priority` | P1 — major feature broken |
| `medium-priority` | P2 — minor feature broken |
| `low-priority` | P3 — cosmetic |
| `security` | Security vulnerability |
| `authentication` | Login, register, token, CSRF |
| `authorization` | RBAC, guards, permissions |
| `database` | Prisma, PostgreSQL, migrations |
| `frontend` | React, UI, CSS, routing |
| `backend` | NestJS, APIs, services |
| `ai` | Recommendations, embeddings |
| `deployment` | Railway, Vercel, Docker |
| `testing` | Tests, CI, coverage |
| `role-talent` | Student/fresh graduate |
| `role-employer` | Employer |
| `role-admin` | Admin |
| `regression` | Previously fixed, recurred |
| `blocked` | Waiting on external dependency |
