# GradTure — Production Deployment Guide
## Render (free) + Vercel (free) + Neon (free)

> **Last updated:** 2026-09-20 — the deployment target was migrated from
> Railway/Docker/VM to **Render (backend) + Vercel (frontend) + Neon Postgres**.
> Railway configs, `cd.yml`, Dockerfiles, `docker-compose.prod.yml`,
> `docker-compose.vps.yml`, and `deploy/` were removed. CI is now `ci.yml`
> (lint + unit + load + e2e tests only); deploys happen natively on each push
> to `main` (auto-deploy on Render and Vercel).

---

## 0. TL;DR — what needs *you* (all manual steps, ~20 minutes)

This guide is written so a human can follow it top-to-bottom. Everything below
in **bold** is a manual dashboard/intervention step. Anything not bolded is
already handled by the repo (migrations, CORS, tests, SPA routing).

| # | Step | Where | Optional? |
|---|------|-------|-----------|
| 1 | Create Neon project + DB, copy connection strings | neon.tech | **REQUIRED** |
| 2 | Create Render backend web service, paste env vars | render.com | **REQUIRED** |
| 3 | Create Vercel project, set `VITE_API_URL` | vercel.com | **REQUIRED** |
| 4 | Verify health + demo login + feed + jobs | browser | **REQUIRED** |
| 5 | Add UptimeRobot keep-alive for Render 15-min sleep | uptimerobot.com | Recommended |
| 6 | Cloudflare R2 bucket + token (persistent uploads) | cloudflare.com | Recommended |
| 7 | Resend API key + sender | resend.com | Recommended |
| 8 | Google AI Studio Gemini API key | aistudio.google.com | Recommended |
| 9 | Custom domain / Redis / Sentry | varies | Skip |

---

## 1. Architecture

| Piece | Hosted on | Deploy trigger | Free-tier reality |
|-------|-----------|----------------|-------------------|
| Frontend SPA (`frontend/`) | **Vercel** | push to `main` | Never sleeps; generous bandwidth |
| Backend API (`backend/`) | **Render** web service | push to `main` | Sleeps after 15 min idle; ~750 hrs/mo (~31 days) |
| PostgreSQL | **Neon** | n/a (managed) | 0.5 GB, never expires, always on |
| Redis (cache) | **skipped** | n/a | app degrades gracefully without it |
| Email | **Resend** (free) | n/a | 100 emails/day |
| AI | **Gemini** (free) | n/a | generous free tier |
| Uploads | **Cloudflare R2** (free) | n/a | 10 GB + no egress fees |

- **Migrations are automatic:** backend `npm start` runs
  `prisma migrate deploy && node dist/main.js`, so every Render deploy that
  changes the schema migrates the DB on startup.
- **No `cd.yml` anymore:** deploys are native platform auto-deploys on `main`.
  Rollback = platform dashboard "deploy previous".
- **Local dev is unchanged:** `docker-compose.yml` + `infrastructure/docker-compose.yml`
  still run local Postgres/Redis; `ci.yml` still runs all tests on every push.

---

## 2. Step 1 — Neon Postgres (database)

> **Why Neon and not Render's built-in Postgres?** Render's free Postgres
> **expires after 30 days**. Neon's free tier never expires, supports live
> branching, and is always-on.

1. **Sign in** to <https://neon.tech> (GitHub OAuth is fine).
2. **Create a project**:
   - **Name:** `gradhire` (or anything).
   - **Region:** pick the region closest to you (e.g. `US East (Virginia)` / `EU West`).
   - **Plan:** Free.
3. **Wait ~10 s** for provisioning, then open **Connect** → **Connection string**.
4. **Copy the connection string** — use the **non-pooled** one:
   ```
   postgresql://neondb_owner:XXXX@ep-frosty-xxxx-aaaa.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Keep the password visible** (Neon shows it only once at creation, though it
   can be reset later).
6. Create the app database (Neon's default DB is `neondb`):
   - Use the Neon **SQL Editor** and run:
     ```sql
     CREATE DATABASE gradhire;
     ```
   - Or leave `neondb` — the name does not matter; it just has to be consistent.
7. **Build the production URL** you will paste into Render (add Prisma params):
   ```
   <your neon string>&schema=public
   ```
   Example final value:
   ```
   postgresql://neondb_owner:XXXX@ep-frosty-xxxx-aaaa.us-east-2.aws.neon.tech/gradhire?sslmode=require&schema=public
   ```
   > Keep a second copy of the plain string — it is handy for `npx prisma
   > migrate dev` from your machine against the cloud DB if a manual migration
   > is ever needed.

   > **In this repo:** the connection strings are already written to the root
   > `.env` by `neon link` (project `young-shape-97917493`, branch `GradTure`),
   > and the DB is already migrated (16 migrations) + seeded. No manual copying
   > is needed — `scripts/render-env.ps1` (§3) reads that same `.env`.

> **Neon free limits:** 0.5 GB storage, some compute hours — plenty for this
> app. Neon never sleeps the DB.

---

## 3. Step 2 — Render backend (API)

1. **Sign in** to <https://dashboard.render.com> (GitHub OAuth).
2. **New → Web Service → connect your GitHub repo** (`.../GradTure 1.0`, branch `main`).
3. **Service settings:**
   - **Name:** `gradture-backend`
   - **Root Directory:** `backend`   ← important, the app lives in `backend/`
   - **Environment:** `Node` (native — NOT Docker; the Dockerfiles were deleted in the migration, so ignore the Docker/Registry/Secret-Files fields)
   - **Build Command:** `npm ci --include=dev && npm run build`
     (the `--include=dev` is **required**: the env block below sets
     `NODE_ENV=production`, which makes `npm ci` skip devDependencies — without
     `@types/multer` / `@types/cookie-parser` / `@types/xml2js` / `typescript`
     the build fails with TS7016/TS2694. This was the exact failure on the
     first clean-install deploy.)
   - **Start Command:** `npm start`
   - **Pre-Deploy Command:** leave empty (`npm start` already runs `prisma migrate deploy`)
   - **Health Check Path:** `/api/v1/health` — Render polls this. There is **no `/healthz` route** in the app (global prefix is `api/v1`); entering `/healthz` returns 404 and Render marks the service unhealthy.
   - **Instance Type:** Free
4. **Set environment variables** — the single source of truth is the
   **gitignored root `.env`** (`neon link` already wrote the real Neon URLs
   there). The mistake-free way to fill Render's **Environment** tab:

   ```powershell
   powershell -File scripts\render-env.ps1           # print the block
   powershell -File scripts\render-env.ps1 -OutFile render.env   # or save it
   ```

   Paste the generated KEY=VALUE lines into **Environment** (or **Advanced**
   paste). The script filters local-dev keys, Neon metadata, Render-injected
   `PORT`, and placeholder values (`REPLACE_WITH...`), so only real variables
   are emitted.

   Things the script deliberately skips — set by hand in the dashboard:

   | Key | Value |
   |-----|-------|
   | `NODE_VERSION` | `20` (Render uses it to select the Node runtime) |
   | `BACKEND_URL` | your Render URL, e.g. `https://gradture-backend.onrender.com` (OAuth redirects) — fill it after the service exists; Render restarts on save |
   | `CORS_ORIGIN` / `FRONTEND_URL` | your Vercel **frontend** origin(s), exactly, e.g. `https://gradture-frontend.vercel.app` (comma-separate multiple) |
   | optional `RESEND_API_KEY`, `GEMINI_API_KEY`, `R2_*`, `SENTRY_DSN` | see optional steps (§7–§8); the app runs without them |

   Already included from `.env` by the script: `DATABASE_URL` (pooled — what
   the app uses), `DATABASE_URL_UNPOOLED`, the pre-generated `JWT_SECRET`,
   `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `FRONTEND_URL`, `LOG_LEVEL`, `AI_PROVIDER`
   + `GEMINI_*` tuning, `STORAGE_PROVIDER` + `R2_BUCKET`.

   > `ADMIN_SETUP_SECRET` is **not read by the code** (admin routes use role
   > guards) — do not set it.
   > Leave unset on purpose: `PORT` (Render injects it), `REDIS_URL` (cache
   > is disabled gracefully), real `GEMINI_API_KEY` / `RESEND_API_KEY` /
   > `R2_*` values until you do the corresponding optional steps.

5. **Create Web Service** → wait for the first deploy (2–5 min). Watch **Logs**:
   you should see migration lines (`prisma migrate deploy`) then
   `Nest application successfully started`.
6. **Health check** the deployed backend from your browser:
   ```
   https://gradture-backend.onrender.com/api/v1/health
   ```
   Expect JSON with `"status": "healthy"` and `checks.database.status` `"up"`
   (the DB updates were verified against the real Neon DB before shipping).
7. The service URL is now your **`BACKEND_URL`** — go back and set that env var
   (Render shows it on the service page).

> **Auto-deploy:** any push to `main` triggers a rebuild + redeploy of the
> backend. First deploy after a schema change runs migrations automatically.
> To skip pointless rebuilds on frontend/docs-only pushes, set **Build Filters →
> Ignored Paths**: `frontend/**`, `docs/**`, `.github/**`, `*.md`.
>
> **Free tier reality:** the instance sleeps after ~15 min with no traffic and
> takes ~30–60 s to wake on the next request (cold start). Step 5 mitigates.

---

## 4. Step 3 — Vercel frontend (SPA)

1. **Sign in** to <https://vercel.com> (GitHub OAuth).
2. **Add New → Project → import your GitHub repo**.
3. **Project settings:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`   ← important
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables** (Settings → Environment Variables → Production):
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | your Render backend URL **base only** — e.g. `https://gradture-backend.onrender.com` |

   > **No trailing slash, no `/api/v1`.** The frontend endpoint files already
   > append `/api/v1/...`.
5. **Deploy.** First build ~2–3 min.
6. Copy the generated domain, e.g. `https://gradture-frontend.vercel.app` — this
   is your **`CORS_ORIGIN`** / **`FRONTEND_URL`**. Set those two vars on Render
   (Step 2.4) if not already correct, then redeploy Render (or it is enough to
   just edit the vars — Render restarts the service on save).

> **How `/api/*` requests reach the backend:** the frontend calls the Render API
> **cross-origin** using `VITE_API_URL`, with the CSRF double-submit cookie
> (`XSRF-TOKEN`). `vercel.json` in `frontend/` only provides the SPA
> `/* → /index.html` fallback plus security headers — it no longer proxies `/api`
> (that was the old Railway setup).

---

## 5. Step 4 — First-round verification (must pass)

1. **Backend health:** `https://<backend>.onrender.com/api/v1/health` → `status: ok`.
2. **Login** at `https://<frontend>.vercel.app` with the seeded demo account:
   - **Email:** `student@demo.gradhire.ai`
   - **Password:** `DemoPassword123!`
3. **Open `/student/dashboard`** — the feed should render the 7 seeded posts
   (seed data shipped on your local DB; if the cloud DB is fresh, run the seed
   once against it — see section 10).
4. **POST a comment / like a post** in the feed UI — confirms CSRF + cookies +
   CORS all work cross-origin (browser flow only; raw terminal POSTs will 403 by
   design).
5. **Open `/student/jobs`** — real jobs render, filters and market snapshot work
   (this page is the one the QA automation targets).
6. **Upload a profile/resume avatar** if `STORAGE_PROVIDER` is still `local` —
   note uploads will vanish on the next Render redeploy (ephemeral disk). Do
   Step 6 (R2) to make them permanent.

> **WebSockets note:** forget-password / live chat use Socket.IO; Render
> supports WebSockets. If a toast/message feels missing, check the browser
> console for `websocket` errors and see Troubleshooting.

---

## 6. Step 5 — Keep the backend awake (UptimeRobot, free)

Render free instances sleep after ~15 min of no traffic. An external monitor
pings your backend every 10–15 min and keeps it warm — it also alerts you if the
app is actually down.

1. **Sign in** to <https://uptimerobot.com> (free).
2. **Add New Monitor:**
   - **Type:** HTTPS
   - **URL:** `https://<backend>.onrender.com/api/v1/health`
   - **Interval:** `every 10 minutes` (stays under Render's monthly cap: 144 pings/day ≈ 24 hrs of runtime/mo, far below the 750 free hours).
3. Optionally set **Alert Contacts** (email) so it pings you on downtime.

> Why this is fine on the free tier: one 10-min monitor keeps the box awake
> ~24 h/month of the ~31 available days. Cold starts still happen occasionally
> (deploys, outages), but routine browsing stays instant.

---

## 7. Step 6 (Recommended) — Cloudflare R2 storage (persistent uploads)

Render's free disk is **ephemeral** — anything written to it is wiped on the
next deploy. Set `STORAGE_PROVIDER=r2` so uploads live in R2's free 10 GB.

1. **Sign in** to <https://dash.cloudflare.com> (free account).
2. **R2 Object Storage** (sidebar) → **Create bucket**:
   - **Name:** e.g. `gradture-uploads`
   - **Location hint / other settings:** defaults are fine.
3. **Manage R2 API Tokens → Create API Token:**
   - Permissions: **Object Read & Write** on the bucket you just created.
   - Copy **Account ID, Access Key ID, Secret Access Key**.
4. On **Render**, add these vars and **Save** (service restarts):
   | Key | Value |
   |-----|-------|
   | `STORAGE_PROVIDER` | `r2` |
   | `R2_BUCKET` | `gradture-uploads` |
   | `R2_ACCOUNT_ID` | your Cloudflare account ID |
   | `R2_ACCESS_KEY` | the token's Access Key ID |
   | `R2_SECRET_KEY` | the token's Secret Access Key |
   | `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
   - (Values mirror the AWS S3 client; the app's storage service already
     supports `s3` and `r2`.)

> **Cloudflare free:** 10 GB storage, no egress charges — genuinely $0.

---

## 8. Step 7 (Recommended) — Resend email

The app sends password-reset and email-verification mail. Without a key it
logs instead of sending (safe in dev, but in production the API **refuses
silently-dropped mail** — so get a key if you want signups/password resets to
work).

1. **Sign in** to <https://resend.com> (free: 100 emails/day).
2. **API Keys → Create API Key** → copy it.
3. Optional but better deliverability: **Domains → Add Domain** and add the DNS
   records Resend shows (sender address becomes `no-reply@your-domain.com`).
   Without a domain you can still send from `onboarding@resend.dev`.
4. On **Render**, add:
   | Key | Value |
   |-----|-------|
   | `RESEND_API_KEY` | `re_...` |
   | `SMTP_FROM` | `GradTure <onboarding@resend.dev>` (or your verified domain sender) |

---

## 9. Step 8 (Recommended) — Gemini API key (AI features)

Career chat, CV feedback, and recommendations need an AI provider key.

1. Open <https://aistudio.google.com/apikey> (Google account, free tier).
2. **Create API key** → copy it.
3. On **Render**, add:
   | Key | Value |
   |-----|-------|
   | `AI_PROVIDER` | `gemini` |
   | `GEMINI_API_KEY` | `AIza...` |

> Fallback provider (`AI_FALLBACK_PROVIDER`) is optional and only fires if the
> primary fails. `ollama` can be used instead if you self-host.

---

## 10. Step 9 — Seed data for a fresh cloud database

If the Neon DB is empty (no demo feed shown on `/student/dashboard`), seed it.
Migrations run automatically on deploy; seeding is explicit:

1. From a machine with the repo:
   ```powershell
   cd backend
   $env:DATABASE_URL="<your-neon-url-with-?sslmode=require&schema=public>"
   npx prisma migrate deploy   # safety-first, normally already applied
   npx ts-node prisma/seed.ts
   ```
2. Re-load `https://<frontend>.vercel.app/student/dashboard` and log in again.

---

## 11. Optional — custom domain, Redis, Sentry

### Custom domain (do this only if you own a domain)

| Record | Name | Value | Target |
|--------|------|-------|--------|
| CNAME | `frontend` (Vercel), e.g. `app` or root | `cname.vercel-dns.com` | Vercel dashboard shows the exact value |
| CNAME | `api` | `backend-xxxx.onrender.com` | Render dashboard shows the exact value |

- Vercel: project → **Settings → Domains → Add**; Vercel validates ownership.
- Render: service → **Settings → Custom Domain**; add `api.<your-domain>` and the
  CNAME shown.
- Then update Render envs: `CORS_ORIGIN` & `FRONTEND_URL` = `https://<your-domain>`,
  `BACKEND_URL` = `https://api.<your-domain>`, and Vercel `VITE_API_URL` =
  `https://api.<your-domain>`. TLS is automatic on both platforms.

### Redis (optional — skip unless you care about cache hits)

The app operates fine with no Redis; without `REDIS_URL` the cache layer is
disabled. If you want it: Upstash free tier (~256 MB) is serverless and safe on
Render's ephemeral disk:
`Upstash → Create database → Redis URL` → set `REDIS_URL` on Render.

### Sentry (optional)

Enable error tracking: add `SENTRY_DSN` on Render and `VITE_SENTRY_DSN` on
Vercel. Both apps only initialize Sentry when the DSN is present.

---

## 12. Rollback

- **Render:** service → **Events** or the deploy list → **Deploy Previous**.
- **Vercel:** project → **Deployments** → **⋮ → Promote** a previous deploy.
- **Database:** Neon free supports **branching** — create a branch (snapshot)
  before risky schema changes; use the Neon dashboard's point-in-time restore if
  needed.

---

## 13. Troubleshooting

| Symptom | Likely cause / fix |
|---------|--------------------|
| `DATABASE_URL` connection error at boot | Check the Neon URL has `?sslmode=require&schema=public`; verify the password (shown once) was copied whole. |
| Backend restarts in a loop, "migration ... failed" | Prisma migration checksum/state drift. Run `npx prisma migrate resolve --rolled-back <migration>` or `--applied` against the cloud DB, then redeploy. |
| First request after being idle takes 30–60 s | Normal Render free cold start; the UptimeRobot monitor (Step 5) prevents routine sleep. |
| Feed/like/comment fails with 401 in browser, works in dev | `CORS_ORIGIN`/`FRONTEND_URL` mismatch on Render — must match the Vercel origin exactly (`https://` included). Also check the browser's `XSRF-TOKEN` cookie exists. |
| `403` on POST from terminal/Postman | CSRF protection is by design; use the browser flow. |
| 404 on a deep link like `/student/jobs` after refresh | Should not happen — `frontend/vercel.json` provides the `/* → /index.html` fallback. |
| Uploads disappear after a deploy | Expected with `STORAGE_PROVIDER=local` on Render (ephemeral disk). Do Step 6 (R2) and re-upload. |
| WebSocket messages missing | Check browser console; Render supports WebSockets, but CORS `connect-src` in `vercel.json` must allow the backend origin (`https: wss:` covers it). |
| Push to `main` does not deploy | Check the repo/Render & Vercel auto-deploy settings + GitHub integration permissions. |
| 401 `/auth/me` + `/auth/refresh` on a cold load | Expected unauthenticated probes by the frontend; log in and it resolves. |

---

## 14. Cost guardrails (all $0, but bounded)

| Service | Free allowance | Watch for |
|---------|----------------|-----------|
| Render web service | 750 instance-hours/mo (~31 days) | Keep-alive every 10 min uses ~24 h/mo — well under |
| Neon | 0.5 GB, 190 compute hours/mo | Long-running seeds/branches; pause compute if needed |
| Vercel | 100 GB bandwidth/mo | Nothing at this scale |
| Resend | 100 emails/day | Signup spam from bots |
| Cloudflare R2 | 10 GB, no egress | Nothing at this scale |
| Gemini | generous free tier (rate-limited) | App-scale traffic is negligible |

---

## 15. Where things live (map vs. code)

| Concern | File/Doc |
|---------|----------|
| Backend env reference | `backend/.env.production.example` (auto-derived from actual `process.env` reads) |
| Frontend env reference | `frontend/.env.production.example` |
| Test-only CI (lint/unit/load/e2e) | `.github/workflows/ci.yml` |
| SPA fallback + security headers | `frontend/vercel.json` |
| Local dev stack | `docker-compose.yml`, `infrastructure/docker-compose.yml` |
| Health endpoint | `GET /api/v1/health` (global `api/v1` prefix) |
| Migrations on start | `backend/package.json` → `start` script |

---

## 16. Change log

- **2026-09-20** — Migrated deployment from Railway + Docker/VM to Render +
  Vercel + Neon. Removed: `cd.yml`, `deploy/`, root `deploy.sh`,
  `docker-compose.prod.yml`, `docker-compose.vps.yml`, backend/frontend
  Dockerfiles, `nginx.conf`, `docker-entrypoint.sh`, `backend/railway.json`,
  frontend `/api` proxy in `vercel.json`, `RAILWAY_ENVIRONMENT` fallbacks in
  `cookie-policy.ts` / `email.service.ts`. Local dev + `ci.yml` unchanged.