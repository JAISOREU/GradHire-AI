# Gradture — Production Regression Checklist

Use this checklist for every production deployment, staging promotion, or major release.

Run through every item. Mark `[x]` when verified, `[n/a]` when not applicable, and `[!]` when a known issue exists but is accepted.

## Cross-Platform Validation

Every important feature must be checked on:

- [ ] Desktop (1920x1080, Chrome)
- [ ] Tablet (768x1024, Chrome)
- [ ] Mobile (375x667, Chrome)
- [ ] Firefox (desktop, at least one representative flow)
- [ ] Edge (desktop, at least one representative flow)

Check for each:

- [ ] Layout does not break or overflow horizontally
- [ ] Navigation is accessible (sidebar, header, mobile drawer)
- [ ] Dropdowns open/close correctly and do not overflow viewport
- [ ] Modals are centered, dismissible, and trap focus
- [ ] Forms validate and submit correctly
- [ ] File uploads work with valid files and reject invalid files
- [ ] Tables/cards display correctly without horizontal scroll
- [ ] Buttons have adequate touch targets (min 44x44px on mobile)
- [ ] Loading states show skeletons or spinners
- [ ] Error states show user-friendly messages (not raw stack traces)
- [ ] Empty states show appropriate icons and guidance

---

## Public / Guest

### Core Flows

- [ ] Homepage loads with correct branding and navigation
- [ ] About page renders
- [ ] Browser refresh on any public route works (SPA routing via Vercel rewrites)
- [ ] Direct URL navigation to `/jobs`, `/jobs/:id`, `/companies`, `/companies/:id` works
- [ ] 404 page renders for unknown routes

### Browse Jobs

- [ ] Job list loads with pagination
- [ ] Search input filters jobs by title/company/description
- [ ] Type filter (Hiring, Internship, Contract, Part-time, Freelance) works
- [ ] Experience level filter works
- [ ] Workplace type filter (Onsite, Hybrid, Remote) works
- [ ] Country/city filter works
- [ ] Salary range filter works
- [ ] Fresh graduate friendly filter works
- [ ] Sort (Newest, Featured) works
- [ ] Job cards show title, company, location, type, salary, skills
- [ ] External job links open in new tab with `noopener,noreferrer`

### Job Details

- [ ] Job detail page loads for published jobs
- [ ] Draft/inactive jobs return 404 for non-owners
- [ ] Required skills, preferred skills, benefits display
- [ ] Application deadline shows correctly
- [ ] Apply button visible for authenticated students
- [ ] External application URL opens correctly for external jobs

### Authentication

- [ ] Registration page loads
- [ ] Registration with valid data creates STUDENT account
- [ ] Registration with EMPLOYER role creates EMPLOYER account
- [ ] Registration with ADMIN role is blocked
- [ ] Duplicate email shows clear error
- [ ] Password complexity validation enforces requirements
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error
- [ ] Forgot password page loads
- [ ] Reset password page loads with valid token
- [ ] Email verification page loads with valid token
- [ ] Logout clears session and redirects to home

### Navigation

- [ ] Public header links to Home, Jobs, Companies, Login, Register
- [ ] Mobile hamburger menu opens/closes
- [ ] Active nav state highlights current page

---

## Talent / Fresh Graduate

### Pre-requisites

- [ ] User can register as STUDENT
- [ ] User can log in
- [ ] User is redirected to `/student/dashboard` after login

### Dashboard

- [ ] Dashboard loads with KPI cards (Applications, Profile %, Matches, Saved Jobs)
- [ ] Applications count matches actual applications
- [ ] Profile completion percentage calculates correctly
- [ ] Matches shows "Available" or "Locked" based on profile completeness
- [ ] Recent applications list shows last 5 applications with status badges
- [ ] recommendations section shows matches when profile is complete
- [ ] recommendations section shows "Complete profile" when profile is incomplete
- [ ] Missing profile sections show actionable links
- [ ] Error strip appears when dashboard data fails to load

### Profile / Account

- [ ] Account page loads with existing profile data
- [ ] Name, focus, summary can be edited and saved
- [ ] Education entries can be added/edited/deleted
- [ ] Skills can be added/removed
- [ ] Experience entries can be added/edited/deleted
- [ ] Certifications can be added/edited/deleted
- [ ] Projects can be added/edited/deleted
- [ ] Career preferences (job types, locations, salary expectations) can be saved
- [ ] Profile completeness updates after edits
- [ ] Empty states show for each section when no data exists

### Resume

- [ ] Resume upload page loads
- [ ] Upload accepts PDF, DOCX, TXT files
- [ ] Upload rejects `.doc` (legacy format) with clear error
- [ ] Upload rejects files > 5 MB
- [ ] Upload rejects files with NUL bytes or corrupted signatures
- [ ] Upload shows "Parsing..." state during processing
- [ ] Upload success shows extracted name, focus, summary, skills
- [ ] Profile auto-updates with extracted information
- [ ] Resume list shows uploaded resumes with date, size, MIME type
- [ ] View opens resume in new tab
- [ ] Download triggers file download
- [ ] Replace uploads new file and updates profile
- [ ] Delete removes resume with confirmation dialog
- [ ] Deleting active resume clears parse preview

### Job Browsing

- [ ] Student can browse all published jobs
- [ ] Search and filters work (same as guest)
- [ ] Job detail page shows full description
- [ ] Save job adds to saved jobs list
- [ ] Unsaved job removes from saved jobs list
- [ ] Saved jobs page lists saved jobs

### Applications

- [ ] Apply button creates application
- [ ] Duplicate application is rejected
- [ ] Applications page lists all applications
- [ ] Application status updates in real-time (WebSocket)
- [ ] Withdraw removes application with confirmation
- [ ] Only own applications are visible

### Recommendations

- [ ] recommendations page loads
- [ ] Recommendations do NOT activate merely by opening the page
- [ ] Recommendations require complete profile (education, skills, experience)
- [ ] Recommendations are based on actual profile data, not just page visit
- [ ] "Locked" state shows when profile is incomplete
- [ ] Missing sections link to account page for completion

### Notifications

- [ ] Notifications page loads
- [ ] Unread notifications show with unread indicator
- [ ] Mark read updates notification status
- [ ] Include read toggle shows read notifications
- [ ] Notification count updates in real-time

### Messaging

- [ ] Messages page loads
- [ ] Message list shows conversations
- [ ] Sending message creates notification for recipient
- [ ] Real-time updates via WebSocket

### Interviews

- [ ] Interviews page loads (if any interviews exist)
- [ ] Interview invitations display correctly
- [ ] Interview status is visible

### Settings

- [ ] Settings page loads
- [ ] Notification preferences can be updated
- [ ] Theme toggle works (light/dark)
- [ ] Logout clears session and redirects to home

---

## Employer

### Pre-requisites

- [ ] User can register as EMPLOYER
- [ ] User can log in
- [ ] User is redirected to `/employer/dashboard` after login

### Dashboard

- [ ] Dashboard loads with KPI cards (Active Jobs, Applications Today, Profile Views, Pending Interviews)
- [ ] KPI values match actual database counts
- [ ] Recent applicants list shows last 5 applicants
- [ ] Recent jobs list shows last 5 jobs
- [ ] Error strip appears when dashboard data fails to load

### Company Profile

- [ ] Company profile page loads
- [ ] Company name, industry, location, description, website, phone can be edited
- [ ] Changes persist after save

### Job Management

- [ ] Post Job page loads with form
- [ ] Job creation validates required fields
- [ ] Created job appears in Manage Jobs list
- [ ] Job can be edited
- [ ] Job can be archived/deleted
- [ ] Job status (DRAFT, PUBLISHED, ARCHIVED) is correct
- [ ] Only own jobs are visible

### Applicants

- [ ] Applicants page loads
- [ ] Applicants are grouped by job
- [ ] Application status can be updated
- [ ] Candidate details are visible
- [ ] Only applicants for own jobs are visible

### Interviews

- [ ] Interviews page loads
- [ ] Interview list shows scheduled interviews
- [ ] Interview status can be updated
- [ ] Only interviews for own jobs are visible

### Messaging

- [ ] Messages page loads
- [ ] Message list shows conversations
- [ ] Sending message works
- [ ] Real-time updates via WebSocket

### Analytics

- [ ] Analytics page loads without crash
- [ ] Active jobs count is correct
- [ ] Applications today count is correct
- [ ] Profile views count is correct
- [ ] Pending interviews count is correct
- [ ] Hiring funnel chart renders when data exists
- [ ] Analytics data updates after new applications/interviews

### Notifications

- [ ] Notifications page loads
- [ ] Unread notifications show with unread indicator
- [ ] Mark read updates notification status

### Settings

- [ ] Settings page loads
- [ ] Hiring settings can be updated
- [ ] Theme toggle works
- [ ] Logout clears session and redirects to home

---

## Admin

### Pre-requisites

- [ ] Admin user exists (created via Railway shell or direct SQL)
- [ ] Admin can log in
- [ ] Admin is redirected to `/admin/job-sources` after login (or configured default)

### Dashboard

- [ ] Admin dashboard loads
- [ ] Platform-wide stats display correctly
- [ ] Recent activity feed shows latest events

### User Management

- [ ] Users page loads with paginated list
- [ ] User roles are visible
- [ ] User creation date is visible
- [ ] Admin can view all users
- [ ] Admin cannot delete or modify admin users (if restricted)

### Job Management

- [ ] Jobs page loads with all jobs
- [ ] Job status is visible
- [ ] Admin can view job details

### Applications

- [ ] Applications page loads
- [ ] All applications are visible
- [ ] Application status is visible

### Companies

- [ ] Companies page loads
- [ ] Company details are visible
- [ ] Company jobs are linked

### Audit Logs

- [ ] Audit logs page loads
- [ ] Admin actions are logged
- [ ] Log entries show timestamp, user, action, target

### Notifications

- [ ] Notifications page loads
- [ ] Admin can send notifications
- [ ] Notification delivery is logged

### Settings

- [ ] Admin settings page loads
- [ ] Platform settings can be updated
- [ ] Feature flags can be toggled

### Job Sources

- [ ] Job sources page loads
- [ ] Job source CRUD works
- [ ] Job source runs are visible
- [ ] Ingestion errors are displayed
- [ ] Test source functionality works

### Database

- [ ] Database page loads
- [ ] Migration status is visible
- [ ] Backup/restore functionality works (if implemented)

### Security

- [ ] Security page loads
- [ ] API keys are visible (masked)
- [ ] Security settings can be updated

### Developer Tools

- [ ] Developer tools page loads
- [ ] Debug endpoints are accessible to admin only

### Profile

- [ ] Admin profile page loads
- [ ] Admin profile can be updated

### Logout

- [ ] Logout clears session
- [ ] Admin cannot access admin pages after logout

---

## Critical API Contracts

Verify these endpoints return expected shapes after every backend deployment:

| Endpoint | Method | Auth | Expected 200 Keys |
|----------|--------|------|-------------------|
| `/api/v1/health` | GET | None | `status`, `service`, `version`, `checks` |
| `/api/v1/auth/login` | POST | None | `accessToken`, `user` |
| `/api/v1/auth/refresh` | POST | Cookie | `accessToken`, `user` |
| `/api/v1/auth/me` | GET | Bearer/Cookie | `user` |
| `/api/v1/jobs` | GET | None | `items`, `total`, `page`, `limit` |
| `/api/v1/jobs/:id` | GET | None | job object |
| `/api/v1/employer/analytics` | GET | Bearer/Cookie | `activeJobs`, `applicationsToday`, `views`, `pendingInterviews`, `hiringFunnel` |
| `/api/v1/resumes` | GET | Bearer/Cookie | `items`, `total`, `page`, `limit` |
| `/api/v1/recommendations/ai` | GET | Bearer/Cookie | `ready`, `missing`, `recommendations` |
| `/api/v1/messages/me` | GET | Bearer/Cookie | `items`, `total`, `page`, `limit` |

---

## Health Checks

- [ ] `GET /health` returns HTTP 200
- [ ] `checks.database.status` is `up`
- [ ] `checks.storage.status` is `up` (or `disabled` if local dev)
- [ ] `checks.email.status` is `up` or `disabled`
- [ ] `checks.ai.status` is `up` or `disabled`
- [ ] `checks.websockets.status` is `up`
- [ ] Health check latency under 500ms

---

## Database Verification

- [ ] `prisma migrate status` shows all migrations as applied
- [ ] No failed migrations
- [ ] `prisma validate` passes
- [ ] Connection pool is not exhausted (check Railway metrics)
- [ ] No long-running queries (check pg_stat_activity)

---

## Sentry / Monitoring

- [ ] Backend Sentry DSN is configured in Railway
- [ ] Frontend Sentry DSN is configured in Vercel
- [ ] Backend errors appear in Sentry within 5 minutes of occurrence
- [ ] Frontend errors appear in Sentry within 5 minutes of occurrence
- [ ] Replay samples are captured for frontend errors
- [ ] Alerts are configured for:
  - [ ] Health check failures
  - [ ] 5xx error rate spike
  - [ ] Database connection failures
  - [ ] High memory usage

---

## Security Verification

- [ ] CORS only allows configured origins (check Railway logs for `[CORS] Blocked origin`)
- [ ] Helmet security headers are present (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, etc.)
- [ ] HTTPS is enforced in production
- [ ] `access_token` cookie has `HttpOnly`, `Secure`, `SameSite=None` (for cross-domain)
- [ ] `XSRF-TOKEN` cookie has `Secure`, `SameSite=None`
- [ ] JWT_SECRET is rotated from default/development value
- [ ] ADMIN_SETUP_SECRET is rotated from default/development value
- [ ] Database credentials are rotated from default/development value
- [ ] No secrets in repository (verify with `git secret` or `truffleHog`)
- [ ] Rate limiting is active on auth endpoints
- [ ] Password hashing uses Argon2id (not bcryptjs in new code)

---

## Rollback Readiness

- [ ] Previous Docker image tag is known and accessible
- [ ] Railway rollback procedure is documented
- [ ] Vercel rollback procedure is documented
- [ ] Database backup exists from before deployment
- [ ] Team knows how to execute rollback within 5 minutes
