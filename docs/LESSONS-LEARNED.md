# Gradture — Lessons Learned

Record of recurring failures, near-misses, and corrective actions taken. This document prevents the same mistakes from being repeated by future contributors and deployment runs.

---

## Lesson 1: Never Commit Secrets to Version Control

**Problem:**
`.env.production` contained plaintext `DATABASE_URL`, `POSTGRES_PASSWORD`, and `JWT_SECRET` values in the repository working tree. Even though `.gitignore` listed `.env.production`, the file was either committed before the ignore rule was added, or the ignore rule was not enforced.

**Root Cause:**
Developer convenience override of security policy. Secrets were copied into `.env.production` for local testing and accidentally committed.

**Corrective Action:**
1. Rotated all exposed secrets (DATABASE_URL, POSTGRES_PASSWORD, JWT_SECRET, ADMIN_SETUP_SECRET).
2. Removed `.env.production` from version control: `git rm --cached .env.production`.
3. Cleaned git history with BFG Repo-Cleaner to purge secrets from all commits.
4. Configured Railway and Vercel environment variables as the single source of truth.
5. Added `pre-commit` hook with `git-secrets` or `truffleHog` to block future secret commits.

**Preventive Check:**
Before every commit, run:
```bash
git diff --cached --name-only | grep '\.env' && echo 'BLOCKED: env file in commit' && exit 1
```
Or use GitHub secret scanning to reject pushes containing secret patterns.

---

## Lesson 2: Prisma Migrations Are Not Idempotent by Default

**Problem:**
Migration `20260815001346_add_job_ingestion` partially applied on Railway because the container restarted mid-migration. The migration used `CREATE TYPE` and `CREATE TABLE` without `IF NOT EXISTS` guards. On next deployment, `prisma migrate deploy` failed because PostgreSQL reported the objects already existed.

**Root Cause:**
Prisma migrations are designed to run exactly once in sequence. They do not handle partial application or idempotent recovery. Railway's restart behavior exposed this gap.

**Corrective Action:**
1. Created idempotent recovery migration `20260816000000_recover_job_ingestion_state` using `DO $$ ... IF NOT EXISTS $$` blocks for all enums, tables, columns, indexes, and foreign keys.
2. Updated `docker-entrypoint.sh` to detect failed migrations and run `prisma migrate resolve --applied <migration_name>` before `prisma migrate deploy`.
3. Documented the recovery procedure in `PRODUCTION_MANUAL_STEPS.md`.

**Preventive Check:**
- Always run migrations with `prisma migrate deploy` (not `db push`) in production.
- Never modify historical migrations that may have been applied.
- Test migrations against a fresh database before deploying.
- Add `prisma migrate status` to the deployment pre-check.

---

## Lesson 3: Railway Restarts Can Happen During Migrations

**Problem:**
Railway restarted the backend container during `prisma migrate deploy`, causing a partial migration application. The database was left in an inconsistent state, and subsequent deployments failed.

**Root Cause:**
Railway's health check and restart policy do not account for long-running migration processes. If the health check fails during migration, Railway kills and restarts the container.

**Corrective Action:**
1. Added explicit database readiness wait loop in `docker-entrypoint.sh` (up to 60 attempts, 2s apart).
2. Added failed migration detection and recovery in entrypoint.
3. Configured Railway health check to use `/api/v1/health` with appropriate timeout.
4. Considered splitting migration and server startup into separate Railway services or jobs.

**Preventive Check:**
- Monitor Railway deployment logs for `Database not ready yet` messages.
- Set Railway health check path to `/api/v1/health` and timeout to at least 30s.
- Consider running migrations as a separate Railway job rather than in the server entrypoint.

---

## Lesson 4: CSRF Cookies Require Careful Cross-Origin Configuration

**Problem:**
In production (Vercel frontend + Railway backend), CSRF protection blocked authenticated mutations with `Invalid CSRF token` (403). The `XSRF-TOKEN` cookie was not consistently available to the frontend, and the `x-xsrf-token` header did not match.

**Root Cause:**
- `sameSite: 'none'` cookies require `secure: true` and a cross-site context.
- Vercel's `/api/*` proxy rewrites may strip or not forward cookies correctly.
- CORS `exposedHeaders` must include `X-CSRF-TOKEN` for the frontend to read it.
- Cookie domain/path settings must align with the production origin.

**Corrective Action:**
1. Verified backend sets `XSRF-TOKEN` with `secure: true`, `sameSite: 'none'`, `path: '/'`.
2. Verified CORS `exposedHeaders: ['X-CSRF-TOKEN']`.
3. Verified Vercel `vercel.json` proxy preserves cookies.
4. Considered simplifying CSRF for same-site deployments or using `SameSite=Lax` when frontend and API share the same parent domain.

**Preventive Check:**
- After every production deployment, verify in browser DevTools that `XSRF-TOKEN` and `access_token` cookies are present.
- Verify a `POST /api/v1/auth/login` returns both cookies.
- Verify a subsequent authenticated `POST` includes matching `X-XSRF-TOKEN` header.

---

## Lesson 5: Frontend Must Defend Against Undefined API Responses

**Problem:**
`EmployerAnalyticsPage` crashed with `TypeError: Cannot read properties of undefined (reading 'length')` because the backend analytics response did not include `hiringFunnel`. Similar patterns exist in `AdminListPage`, `DataTable`, and other list components that call `.length` on data that may be `undefined` after an API error or during loading.

**Root Cause:**
Frontend code assumed API responses always contain all expected fields. When the backend contract changed (or returned partial data due to an error), the frontend crashed with uncaught exceptions caught by React ErrorBoundary.

**Corrective Action:**
1. Added `?? 0` and `?.length ?? 0` guards to all stat cards and list checks in `EmployerAnalyticsPage`.
2. Audited all `.length` accesses across the frontend. Identified high-risk patterns in:
   - `AdminListPage.tsx` — `if (!items.length)` when `items` prop may be `undefined`
   - `DataTable.tsx` — `if (!items.length)` when `items` prop may be `undefined`
   - `JobListPage.tsx` — `jobs.length > 0` when `jobs` is derived from `data?.items ?? []` (safe)
   - `AuthHeader.tsx` — `arr.length - 1` when `arr` is derived from `.split(' ')` (safe)
3. Frontend API client now returns empty arrays/objects as fallbacks in `parsePaginatedJobs`.

**Preventive Check:**
- All `useAsync` consumers should use `data?.items ?? []` pattern.
- All components receiving array props should default to `[]`: `items = items ?? []`.
- Add ESLint rule `@typescript-eslint/no-unnecessary-condition` to catch missing guards.

---

## Lesson 6: NUL Bytes in User-Uploaded Files Break PostgreSQL

**Problem:**
Resume uploads failed with `invalid byte sequence for encoding "UTF8": 0x00` when users uploaded files containing NUL bytes in filenames or extracted text.

**Root Cause:**
- `extractTextFromFile()` returned raw bytes including NUL characters.
- Prisma passed these strings directly to PostgreSQL, which rejects NUL bytes in `text` columns.
- Filenames with NUL bytes were also passed unsanitized.

**Corrective Action:**
1. Created `sanitizeDatabaseString()` utility that strips NUL bytes and control characters (`[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]`).
2. Applied sanitization at every Prisma write boundary in `ResumesService`.
3. Added `FileValidationService` to reject files with NUL bytes before processing.
4. Added comprehensive unit tests for NUL byte handling.

**Preventive Check:**
- All string inputs from external sources (uploads, API bodies, scraped content) must pass through `sanitizeDatabaseString()` before Prisma writes.
- Add a Prisma middleware or global `@BeforeUpdate`/`@BeforeCreate` hook to enforce sanitization at the model level.

---

## Lesson 7: Job Ingestion Requires Careful State Management

**Problem:**
Job ingestion feature required multiple migrations, enum types, and foreign keys. Partial application left the database in an inconsistent state. Jobs from ingestion did not appear in Browse Jobs until the recovery migration was applied.

**Root Cause:**
- Complex migration with multiple dependent objects (enums, tables, indexes, FKs).
- Railway restart during migration caused partial application.
- Missing `applied` state tracking in Prisma migration table.

**Corrective Action:**
1. Created idempotent recovery migration with `IF NOT EXISTS` guards.
2. Added `docker-entrypoint.sh` recovery logic using `prisma migrate resolve --applied`.
3. Improved job ingestion monitoring with `JobSourceRun` tracking and health status.
4. Added admin UI for job source management and run history.

**Preventive Check:**
- Keep migrations small and focused. One logical change per migration.
- Test migrations against a fresh database in CI.
- Add integration tests that verify migration + seed + query round-trip.
- Monitor ingestion runs in admin panel for failures.

---

## Lesson 8: Session Expiry in Production Needs Graceful Degradation

**Problem:**
When JWT access tokens expired in production, the frontend refresh flow failed with 401, causing an abrupt redirect to login. During the transition, protected components rendered with `undefined` data and crashed.

**Root Cause:**
- `AuthContext` sets `user = null` immediately on refresh failure.
- `ProtectedRoute` redirects to `/login` but components in the render tree may still execute briefly.
- Components like `EmployerAnalyticsPage` did not guard against `undefined` data during this brief window.

**Corrective Action:**
1. Added `loading` state to `AuthContext` so the app shows a spinner during auth checks instead of flashing unauthenticated UI.
2. Added defensive `??` and `?.` guards across all data-consuming components.
3. Improved error messages in `AuthContext` to distinguish between network errors, 401, and CSRF failures.

**Preventive Check:**
- All async data fetchers in authenticated routes must handle `loading`, `error`, and `data === null` states.
- `ProtectedRoute` should render a loading state while `status === 'loading'`.
- `AuthContext` should expose `status: 'loading' | 'authenticated' | 'unauthenticated'` and components should respect it.

---

## Lesson 9: SPA Routing Requires Explicit Configuration on All Platforms

**Problem:**
Frontend SPA routing worked on Vercel but could fail on other platforms (Netlify, Docker nginx) if rewrite rules are missing or incorrect.

**Root Cause:**
- React Router uses HTML5 history API. All non-file requests must return `index.html`.
- Different hosting platforms have different rewrite/proxy mechanisms.

**Corrective Action:**
1. Configured `vercel.json` with rewrites for `/api/*` and SPA fallback for `/*`.
2. Configured `nginx.conf` for Docker deployments with `try_files $uri $uri/ /index.html`.
3. Configured `netlify.toml` with redirect rules.
4. Documented platform-specific routing requirements in `DEPLOYMENT.md`.

**Preventive Check:**
- After every frontend deployment, verify direct URL navigation to a nested route (e.g., `/student/dashboard`) returns the SPA, not a 404.
- Test browser back/forward navigation across all routes.

---

## Lesson 10: Health Checks Must Be Fast and Independent

**Problem:**
Health check endpoint `/health` (later changed to `/api/v1/health`) was slow because it checked all dependencies including recommendation service and email. If an optional dependency was down, the health check returned `unhealthy`, triggering unnecessary alerts and potential Railway restarts.

**Root Cause:**
- Health check treated optional dependencies (Redis, Recommendation, Email) as required for `healthy` status.
- Slow recommendation service health check added latency to every health probe.

**Corrective Action:**
1. Refined health check to return `degraded` when optional dependencies are down, and `unhealthy` only when required dependencies (database, storage, websockets) are down.
2. Made recommendation service health check non-blocking with a timeout.
3. Configured Railway health check path to `/api/v1/health` with appropriate timeout.

**Preventive Check:**
- Health check must complete in under 1 second.
- Required dependencies: database, storage, websockets.
- Optional dependencies: Redis, email.
- Monitor health check latency as a metric.

---

## Lesson 11: Email Failures Should Not Block User Actions

**Problem:**
Email sending failures (SMTP misconfiguration, Resend API downtime) blocked application creation and other user actions, causing 500 errors.

**Root Cause:**
- Email sending was synchronous and unguarded in application creation flow.
- If `resend.emails.send()` threw, the entire transaction failed.

**Corrective Action:**
1. Wrapped email sends in `try/catch` blocks.
2. Added retry logic with exponential backoff (3 attempts).
3. Made email optional: if `RESEND_API_KEY` is not configured, emails are logged only (`DRY_RUN`).
4. Application creation and other core flows succeed even if email fails.

**Preventive Check:**
- All email sends must be in `try/catch` with fallback logging.
- Never let email failures block database transactions or user-facing responses.
- Monitor email delivery rate in Sentry or Resend dashboard.

---

## Lesson 12: Argon2id Password Hashing Upgrade Requires Migration Strategy

**Problem:**
Password hashing was upgraded from bcryptjs to Argon2id. Existing user passwords were hashed with bcryptjs, and the new code needed to verify both formats during the transition period.

**Root Cause:**
- Direct replacement of bcryptjs with Argon2id broke login for existing users whose passwords were still bcrypt-hashed.

**Corrective Action:**
1. Implemented dual-format password verification: try Argon2id first, fall back to bcryptjs.
2. On successful bcryptjs verification, re-hash with Argon2id and update the database.
3. Added password complexity validation for new registrations.
4. Documented the migration strategy in `TODO.md`.

**Preventive Check:**
- When changing password hashing algorithms, always support the old format during transition.
- Add a background job to gradually re-hash existing passwords.
- Test login with both old and new hash formats.

---

## Lesson 13: Cookie-Based Auth Requires Consistent Domain/SameSite Settings

**Problem:**
In production, `access_token` cookies were not sent by the browser on subsequent requests, causing 401 errors even though the user had just logged in.

**Root Cause:**
- Cookie `domain`, `path`, `secure`, and `sameSite` settings were not aligned between backend and frontend.
- `SameSite=None` requires `Secure=true` and cross-site context.
- Railway backend and Vercel frontend are different origins, requiring explicit cross-site cookie configuration.

**Corrective Action:**
1. Set `access_token` cookie with `httpOnly: true`, `secure: true`, `sameSite: 'none'`, `path: '/'`.
2. Set `XSRF-TOKEN` cookie with `secure: true`, `sameSite: 'none'`, `path: '/'`.
3. Verified CORS `credentials: true` and `origin` matching.
4. Documented cookie settings in `PRODUCTION_MANUAL_STEPS.md`.

**Preventive Check:**
- After every auth-related deployment, verify cookies in browser DevTools.
- Ensure `secure` flag is set in production (cookies will not be sent over HTTP).
- Ensure `sameSite` matches the deployment topology (cross-site vs. same-site).

---

## Lesson 14: Vercel Rewrites Must Preserve Cookies and Headers

**Problem:**
Vercel's `/api/*` rewrite to Railway backend worked for GET requests but sometimes stripped cookies or headers on POST/PUT/DELETE requests, causing 401/403 errors.

**Root Cause:**
- Vercel rewrites are proxy passes. Configuration affects how headers and cookies are forwarded.
- Missing or misconfigured proxy settings can drop `Cookie`, `Authorization`, or custom headers.

**Corrective Action:**
1. Verified `vercel.json` rewrites use `destination: "$RAILWAY_API_URL/api/$1"`.
2. Ensured CORS on Railway allows the Vercel origin and exposes required headers.
3. Added production manual step to verify API proxy behavior.

**Preventive Check:**
- After Vercel deployment, use `curl -v` through the Vercel domain to verify cookies are forwarded.
- Check `Access-Control-Expose-Headers` in CORS preflight response.

---

## Lesson 15: E2E Tests Require a Running Environment

**Problem:**
Playwright E2E tests exist in the frontend but cannot run in CI because there is no running backend + database + frontend stack in the GitHub Actions environment.

**Root Cause:**
- E2E tests require a full stack (frontend, backend, database) running simultaneously.
- GitHub Actions CI only runs unit tests and Docker builds, not the full stack.

**Corrective Action:**
1. Kept E2E tests in the repository for local/staging execution.
2. CI focuses on unit tests, type checks, builds, and Docker image builds.
3. Considered adding a staging environment with automated E2E runs on every deploy.

**Preventive Check:**
- Do not block CI on E2E tests unless a staging environment is available.
- Run E2E tests locally before production deployment using the production checklist.
- Consider adding a GitHub Actions workflow that deploys to a ephemeral staging environment and runs E2E tests.

---

## Summary

| # | Lesson | Category | Severity |
|---|--------|----------|----------|
| 1 | Never commit secrets | Security | P0 |
| 2 | Prisma migrations are not idempotent | Database/Deployment | P1 |
| 3 | Railway restarts during migrations | Deployment | P1 |
| 4 | CSRF cookies require careful config | Security/API | P1 |
| 5 | Frontend must defend against undefined | Frontend | P1 |
| 6 | NUL bytes break PostgreSQL | Database/Resume | P1 |
| 7 | Job ingestion state management | Backend/Jobs | P2 |
| 8 | Session expiry needs graceful degradation | Auth/Frontend | P1 |
| 9 | SPA routing requires platform config | Frontend/Deployment | P2 |
| 10 | Health checks must be fast and independent | Backend/Deployment | P2 |
| 11 | Email failures must not block actions | Backend/Email | P2 |
| 12 | Password hash upgrades need migration | Auth/Security | P2 |
| 13 | Cookie-based auth needs consistent settings | Auth/Deployment | P1 |
| 14 | Vercel rewrites must preserve cookies | Frontend/Deployment | P1 |
| 15 | E2E tests require running environment | Testing/CI | P2 |
