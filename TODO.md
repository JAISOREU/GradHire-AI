# GradHire AI — Clean Architecture & Role Separation Refactor

## Guiding Principles
- Clean Architecture, SOLID, feature-based folder structure.
- Never mix UI between roles.
- Each role has its own layout, routes, sidebar, navigation, permissions, APIs, and dashboard.

## Roles
1. Guest (Public)
2. Fresh Graduate / Student
3. Employer

---

## Task List

### Phase 0 — Setup
- [x] Install `react-router-dom`

### Phase 1 — Core layer (`frontend/src/core/`)
- [x] `core/types.ts` — all shared domain types
- [x] `core/api/client.ts` — API wrapper (token injection, error handling)
- [x] `core/api/endpoints/*.ts` — feature/role-scoped API functions
- [x] `core/auth/AuthContext.tsx` — auth provider (session, login/logout/register)
- [x] `core/hooks/*.ts` — reusable hooks (useAuth, useJobs, etc.)
- [x] `core/utils/*.ts` — helpers (categorize, badge resolver, format)

### Phase 2 — Shared UI (`frontend/src/components/`)
- [x] Reuse existing Button, Card, Badge, EmptyState, LoadingState
- [x] Add `Sidebar.tsx` (nav items + active state)
- [x] Add `StatCard.tsx` (dashboard widgets)

### Phase 3 — Layouts (`frontend/src/layouts/`)
- [x] `PublicLayout.tsx` — header + footer for guest pages
- [x] `StudentLayout.tsx` — sidebar (Dashboard, Profile, Resume, Applications, Saved Jobs, AI Resume Builder, Recommended Jobs, Notifications, Messages, Settings)
- [x] `EmployerLayout.tsx` — sidebar (Dashboard, Company Profile, Post Job, Manage Jobs, Applicants, Interview Scheduling, Messages, Analytics, Notifications, Settings)

### Phase 4 — Routing + Guards (`frontend/src/routing/`)
- [x] `ProtectedRoute.tsx` — requires auth
- [x] `AppRoutes.tsx` — route definitions per role

### Phase 5 — Feature pages
#### Guest (`frontend/src/features/landing`, `features/auth`, `features/jobs`, `features/companies`)
- [x] Home (landing), About
- [x] Login, Register
- [x] Job Listings, Job Details
- [x] Company Profile

#### Student (`frontend/src/features/student/*`)
- [x] Dashboard (Profile Completion, Recommended Jobs, Latest Jobs, Interview Invitations, Application Status, Skills Progress, Quick Apply)
- [x] Profile, Resume, Applications, Saved Jobs
- [x] AI Resume Builder, Recommended Jobs, Notifications, Messages, Settings

#### Employer (`frontend/src/features/employer/*`)
- [x] Dashboard (Active Jobs, Applications Today, Views, Pending Interviews, Hiring Funnel)
- [x] Company Profile, Post Job, Manage Jobs, Applicants
- [x] Interview Scheduling, Messages, Analytics, Notifications, Settings

### Phase 6 — App shell
- [x] Rewrite `App.tsx` as providers + router only
- [x] Update `main.tsx`
- [x] Update `styles.css` for sidebar/nav/layout

### Phase 7 — Verify
- [x] `npm run build` passes (tsc + vite)
- [x] Run dev server

### Phase 8 — Backend alignment (completed)
- [x] `GET /api/v1/jobs/:id` — job detail endpoint
- [x] `GET /api/v1/employer/analytics` — analytics snapshot
- [x] `GET /api/v1/employer/interviews` — interview list
- [x] `GET /api/v1/messages/me` — messages list
- [x] `GET /api/v1/saved-jobs/me` — saved jobs list

### Phase 9 — Wire real data into feature pages (completed)
- [x] Student: Profile page (fetch/update profile)
- [x] Student: Resume page (upload, list, parse)
- [x] Student: Applications page (list, withdraw)
- [x] Student: Saved Jobs page (list saved jobs)
- [x] Student: Notifications page (list, mark read)
- [x] Student: Messages page (list messages)
- [x] Student: AI Resume Builder (call AI service)
- [x] Employer: Company Profile page (fetch/update)
- [x] Employer: Post Job page (create job)
- [x] Employer: Manage Jobs page (list, update, archive)
- [x] Employer: Applicants page (list applicants)
- [x] Employer: Interviews page (list interviews)
- [x] Employer: Messages page (list messages)
- [x] Employer: Analytics page (fetch analytics)
- [x] Guest: Companies page (list companies)
- [x] Guest: Company Detail page (show company info)

### Phase 11 — Polish, Error Handling, and UX (completed)
- [x] Add global error boundary for React
- [x] Add toast/notification system for API errors
- [x] Add loading skeletons for list pages
- [x] Add form validation (react-hook-form or zod)
- [x] Polish responsive CSS and mobile sidebar
- [x] Add E2E smoke tests for login → dashboard flows
- [x] Add 404 page
- [x] Add favicon and meta tags

### Phase 12 — Hidden Admin Role & Panel (completed)
- [x] Add ADMIN to backend Role enum
- [x] Block ADMIN from public registration
- [x] Create AdminGuard for /admin/* routes
- [x] Create AdminModule (dashboard, users, jobs, applications, companies, reports, analytics, AI monitoring, notifications, audit logs, settings, database, API keys, email templates, CMS, feature flags, backups, security, developer tools, profile)
- [x] Create AdminLayout with full sidebar
- [x] Wire admin routes under /admin/*
- [x] Ensure admin routes are hidden from public navigation 
- [x] Verify builds and E2E tests pass

### Phase 13 — Deployment & CI/CD (completed)
- [x] Add multi-stage Dockerfiles for frontend, backend, and AI service
- [x] Add nginx.conf for frontend container (SPA routing, API proxy, gzip)
- [x] Create docker-compose.yml with Postgres, Redis, all services
- [x] Add .dockerignore files for all services
- [x] Set up GitHub Actions CI workflow (lint, test, build, security audit, Docker build)
- [x] Set up GitHub Actions CD workflow (build and push images to registry)
- [x] Harden security headers with Helmet (CSP, HSTS, X-Frame-Options, etc.)
- [x] Add backend performance benchmarks (health, jobs, companies)
- [x] Add backend security tests (header validation, oversized payload rejection)
- [x] Add npm audit dependency scanning to CI
- [x] Verify all backend tests pass (35/35)
- [x] Verify frontend build and E2E tests pass

### Phase 14 — Monitoring & Alerting (completed)
- [x] Add k6 load tests for critical endpoints
- [x] Add backup/restore scripts and documentation
- [x] Add rollback support to CD workflow
- [x] Add audit logging middleware for admin actions
- [x] Add Prometheus metrics endpoint to backend
- [x] Add monitoring and alerting runbook

### Phase 15 — AI Matching & Notifications (completed)
- [x] Add sentence-transformers embedding service to AI microservice
- [x] Implement semantic job recommendations via cosine similarity
- [x] Add AI recommendations endpoint to backend (`/api/v1/recommendations/ai`)
- [x] Wire AI service into frontend recommended jobs page
- [x] Add evaluation metrics endpoint to AI service
- [x] Expand notification preferences (recommendations, messages, interviews, weekly digest)
- [x] Add email delivery retry logic with exponential backoff
- [x] Upgrade password hashing from bcryptjs to Argon2id

### Phase 16 — Production Hardening (in progress)
- [x] Add class-validator DTOs for all major endpoints
- [x] Add global exception filter with sanitized error responses
- [x] Add image upload rejection to resume parser
- [x] Add Sentry error tracking initialization
- [x] Add 5 critical E2E tests (register/login, job/apply, resume upload, messaging, AI recommendations)
- [x] Add OpenAPI/Swagger spec for all endpoints
- [x] Add Redis caching for job listings
- [x] Add request tracing (x-correlation-id)
- [ ] Add frontend error boundaries + Sentry
