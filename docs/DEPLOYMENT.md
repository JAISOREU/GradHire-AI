# GradHire AI — Production Deployment Guide
## Railway (Backend) + Vercel (Frontend)

---

## 1. Repository Structure Overview

Your repository contains three applications:

| Folder | Purpose | Deploy To |
|--------|---------|-----------|
| `backend/` | NestJS API, Prisma, auth, jobs, applications, WebSocket | **Railway** |
| `frontend/` | React + Vite SPA | **Vercel** |
| `ai-service/` | Python FastAPI recommendation engine | Railway (separate service) or keep local |

**Deploy in this order:**
1. Railway PostgreSQL database
2. Railway backend (NestJS)
3. Vercel frontend (React/Vite)
4. Custom domains + DNS

---

## 2. Prerequisites

Before starting, ensure you have:
- A **GitHub account** with this repository pushed
- A **Railway account** (railway.app) — sign up with GitHub
- A **Vercel account** (vercel.com) — sign up with GitHub
- A **domain name** (e.g., `gradture.ai`) registered at any registrar
- **Cloudflare account** (for R2 storage) — already configured

---

## 3. Step 1 — Rotate Exposed Credentials

**Critical:** The current `.env` file contains credentials that were exposed in the repository history. You must generate new values before deploying.

### Generate new secrets locally:

```bash
# Generate JWT_SECRET (64-character hex)
openssl rand -hex 32

# Generate ADMIN_SETUP_SECRET (64-character hex)
openssl rand -hex 32
```

### Generate new Resend API key:
1. Go to [resend.com/domains](https://resend.com/domains)
2. Create a new API key
3. Copy it (you'll paste it into Railway later)

### Generate new Cloudflare R2 credentials:
1. Go to Cloudflare Dashboard → R2 → Overview
2. Under "API Tokens", create a new token with `Edit` permissions for your bucket
3. Copy the **Access Key ID** and **Secret Access Key**

**Do not reuse the old values from `.env`.** The old values should be considered compromised.

---

## 4. Step 2 — Deploy PostgreSQL to Railway

### 4.1 Create Railway Project
1. Go to [railway.app/new](https://railway.app/new)
2. Click **"New Project"**
3. Select **"Provision PostgreSQL"** (this creates a new PostgreSQL instance)
4. Name it `gradhire-postgres` or similar
5. Click **"Create"**

### 4.2 Get Database Connection String
1. Click on the PostgreSQL service in your Railway project
2. Go to the **"Connect"** tab
3. Copy the **"Connection URL"** — it looks like:
   ```
   postgresql://user:password@host:5432/gradhire
   ```
4. Save this — you'll paste it into the backend service environment variables later

**Important:** Railway PostgreSQL connection URLs include the database name. Ensure yours ends with `/gradhire` or `/postgres` (matching your schema).

---

## 5. Step 3 — Deploy Backend to Railway

### 5.1 Create Backend Service
1. In your Railway project, click **"New"** → **"GitHub Repo"**
2. Select your GitHub repository
3. Railway will detect the repository. Click **"Add to project"**

### 5.2 Configure Root Directory
1. Click on the newly created service
2. Go to **"Settings"** → **"Build"** → **"Root Directory"**
3. Set it to: `backend`
4. Railway will automatically detect the `Dockerfile` in that directory

### 5.3 Verify Build Configuration
Railway should auto-detect:
- **Builder:** Dockerfile
- **Dockerfile path:** `backend/Dockerfile`
- **Build command:** (auto from Dockerfile)
- **Start command:** `prisma migrate deploy && node dist/main.js` (from `backend/package.json`)

If Railway asks for a start command, enter:
```
prisma migrate deploy && node dist/main.js
```

### 5.4 Add Environment Variables
In Railway backend service → **"Variables"** tab, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | (paste from PostgreSQL service) | Get from PostgreSQL → Connect tab |
| `POSTGRES_USER` | `gradhire` | Match your database user |
| `POSTGRES_PASSWORD` | (your DB password) | From PostgreSQL connection URL |
| `POSTGRES_DB` | `gradhire` | Database name |
| `JWT_SECRET` | (your new 64-char hex) | Generated in Step 1 |
| `JWT_EXPIRES_IN` | `7d` | Token expiration |
| `CORS_ORIGIN` | `https://gradture.ai,https://www.gradture.ai,https://admin.gradture.ai,https://grad-hire-ai.vercel.app` | Your Vercel domains |
| `FRONTEND_URL` | `https://gradture.ai` | Primary frontend URL |
| `RESEND_API_KEY` | (your new Resend key) | From Step 1 |
| `SMTP_FROM` | `GradHire AI <noreply@gradture.ai>` | Sender email |
| `AI_SERVICE_URL` | `http://ai-service:8000` | Or external AI service URL |
| `REDIS_URL` | (optional) | Redis connection string if using Railway Redis |
| `SENTRY_DSN` | (optional) | Your Sentry DSN |
| `SENTRY_ENVIRONMENT` | `production` | |
| `SENTRY_RELEASE` | `gradhire@1.0.0` | |
| `LOG_LEVEL` | `info` | |
| `ADMIN_SETUP_SECRET` | (your new 64-char hex) | Generated in Step 1 |
| `STORAGE_PROVIDER` | `r2` | Use `r2` for Cloudflare, `s3` for AWS, `local` for dev |
| `STORAGE_LOCAL_PATH` | `./uploads` | Only used if `STORAGE_PROVIDER=local` |
| `R2_ACCOUNT_ID` | (your Cloudflare account ID) | From Cloudflare dashboard |
| `R2_BUCKET` | `gradhire-uploads` | Your R2 bucket name |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` | Replace `<account-id>` |
| `R2_ACCESS_KEY` | (your new R2 access key) | From Step 1 |
| `R2_SECRET_KEY` | (your new R2 secret key) | From Step 1 |

**Do NOT add these to Vercel:** `DATABASE_URL`, `JWT_SECRET`, `RESEND_API_KEY`, `R2_*`, `REDIS_URL`, `SENTRY_DSN`, `ADMIN_SETUP_SECRET` — these are backend-only.

### 5.5 Deploy
1. Click **"Deploy"** in Railway
2. Watch the build logs. The Docker build will:
   - Install dependencies
   - Run `prisma generate`
   - Compile TypeScript
   - Run `prisma migrate deploy` (on container start)
   - Start the server on `process.env.PORT`

### 5.6 Verify Backend Health
After deployment completes, Railway provides a public URL like:
```
https://gradhire-backend-production.up.railway.app
```

Test it:
```bash
curl https://your-backend-url.up.railway.app/health
# Expected: {"status":"healthy","service":"gradture-backend","version":"0.1.0",...}
```

Also test:
```bash
curl https://your-backend-url.up.railway.app/api/v1/jobs
# Expected: {"items":[],"total":0,"page":1,"limit":20,"totalPages":1}
```

If health check fails, check Railway logs for errors.

---

## 6. Step 4 — Deploy Frontend to Vercel

### 6.1 Import Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import"** next to your GitHub repository
3. Vercel will detect the repository structure

### 6.2 Configure Project Settings
Vercel may auto-detect the root directory. If not:

| Setting | Value |
|---------|-------|
| **Project Name** | `gradhire-frontend` (or your preference) |
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite (auto-detected) |
| **Build Command** | `npm run build` (auto-detected from `frontend/package.json`) |
| **Output Directory** | `dist` (auto-detected from `frontend/vite.config.ts`) |
| **Install Command** | `npm install` (auto-detected) |

### 6.3 Add Environment Variables
In Vercel → **"Environment Variables"** tab, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_URL` | `https://gradhire-ai-production.up.railway.app` | Production, Preview, Development |
| `VITE_SENTRY_DSN` | (your Sentry DSN, optional) | Production |
| `VITE_APP_VERSION` | `1.0.0` | Production |

**Important:** `VITE_API_URL` must point to your actual Railway backend URL. Replace with your actual Railway domain if different.

**Never add backend secrets to Vercel:** No `JWT_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`, `R2_*`, etc.

### 6.4 Deploy
1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Run `tsc --noEmit && vite build`
   - Deploy the `dist/` folder to Vercel's CDN
3. You'll get a preview URL like: `https://gradhire-frontend.vercel.app`

### 6.5 Verify Frontend
Visit the Vercel preview URL and check:
- Homepage loads
- `/jobs` page loads
- `/about` page loads
- SPA navigation works (no 404s on refresh)

---

## 7. Step 5 — Configure Custom Domains

### 7.1 Vercel Frontend Domains
1. In Vercel project → **"Settings"** → **"Domains"**
2. Add domains:
   - `gradture.ai`
   - `www.gradture.ai`
3. Vercel will show DNS records to add at your registrar

### 7.2 Railway Backend Domain
1. In Railway backend service → **"Settings"** → **"Networking"**
2. Click **"Generate Domain"** or add custom domain
3. Add domain: `api.gradture.ai`
4. Railway will provide DNS instructions

### 7.3 DNS Configuration at Your Registrar

Add these records at your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

| Type | Host/Name | Value/Points to | TTL |
|------|-----------|-----------------|-----|
| A | `gradture.ai` | (Vercel A record from Vercel dashboard) | Auto |
| CNAME | `www.gradture.ai` | `cname.vercel-dns.com` (or Vercel's provided CNAME) | Auto |
| CNAME | `api.gradture.ai` | (Railway provided domain, e.g., `gradhire-backend-production.up.railway.app`) | Auto |
| CNAME | `admin.gradture.ai` | `cname.vercel-dns.com` (same as www) | Auto |

**Note:** Exact values depend on what Vercel and Railway provide in their dashboards. Use those values.

### 7.4 Update Environment Variables After DNS Propagation
Once DNS propagates and custom domains work:

#### Railway:
```
CORS_ORIGIN=https://gradture.ai,https://www.gradture.ai,https://admin.gradture.ai,https://grad-hire-ai.vercel.app
FRONTEND_URL=https://gradture.ai
```

#### Vercel:
```
VITE_API_URL=https://gradhire-ai-production.up.railway.app
```

**Redeploy both services** after updating environment variables.

---

## 8. Step 6 — Verify Prisma Migrations

### 8.1 Check Migration Status
The `backend/docker-entrypoint.sh` runs `prisma migrate deploy` automatically on container start. This applies any pending migrations.

### 8.2 Manual Migration (if needed)
If automatic migration fails, run manually:

**Option A — Railway Shell:**
1. Railway → Backend service → **"Shell"** tab
2. Run:
   ```bash
   npx prisma migrate deploy
   ```

**Option B — Local with Railway DATABASE_URL:**
```bash
cd backend
set DATABASE_URL=<your-railway-postgres-url>
npx prisma migrate deploy
```

**Do NOT run `prisma migrate dev` in production** — it can reset data. Only use `prisma migrate deploy`.

### 8.3 Verify Database
After migration, verify tables exist by checking Railway PostgreSQL → **"Data"** tab. You should see tables like `User`, `Job`, `Application`, etc.

---

## 9. Step 7 — Configure Cloudflare R2 (Production Storage)

### 9.1 Create R2 Bucket
1. Cloudflare Dashboard → R2 → **"Create bucket"**
2. Name: `gradhire-uploads`
3. Location: Choose nearest to your users
4. Enable **"Public bucket"** only if you need public URLs (recommended: keep private and use signed URLs)

### 9.2 Create API Token
1. Cloudflare Dashboard → R2 → **"Manage R2 API Tokens"**
2. Click **"Create API token"**
3. Permissions: **"Edit"** for the bucket
4. Copy the **Access Key ID** and **Secret Access Key**

### 9.3 Configure in Railway
Add these to Railway backend environment variables (if not already added):
```
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=<your-cloudflare-account-id>
R2_BUCKET=gradhire-uploads
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY=<access-key-id>
R2_SECRET_KEY=<secret-access-key>
```

### 9.4 Verify Storage
Test file upload through the application (e.g., upload avatar). Check:
- Railway logs for "File uploaded to R2"
- Cloudflare R2 dashboard for the uploaded file

---

## 10. Step 8 — Configure Email (Resend)

### 10.1 Verify Resend Domain
1. Go to [resend.com/domains](https://resend.com/domains)
2. Ensure your domain (`gradture.ai`) is added and verified
3. Add SPF/DKIM/DMARC records at your DNS provider as Resend instructs

### 10.2 Configure in Railway
Ensure `RESEND_API_KEY` and `SMTP_FROM` are set in Railway variables.

### 10.3 Test Email
Trigger a password reset or verification email through the app and verify:
- Email is received
- Links point to `https://gradture.ai` (not localhost)

---

## 11. Step 9 — Production Verification Checklist

### 11.1 Frontend (Vercel)
Visit `https://gradture.ai` and test:

- [ ] **Homepage** loads with logo, hero, CTAs
- [ ] **SPA routing** — navigate to `/jobs`, `/about`, refresh page (no 404)
- [ ] **Direct navigation** — visit `https://gradture.ai/jobs` directly (no 404)
- [ ] **Registration** — create STUDENT account
- [ ] **Registration** — create EMPLOYER account
- [ ] **Login** — sign in with both accounts
- [ ] **Logout** — sign out successfully
- [ ] **Role-based routing** — STUDENT goes to `/student/dashboard`, EMPLOYER to `/employer/dashboard`

### 11.2 Student Flow
- [ ] **Profile** — complete student profile
- [ ] **Resume upload** — upload PDF/DOCX resume
- [ ] **Job search** — browse jobs at `/jobs`
- [ ] **Job detail** — view job at `/jobs/:id`
- [ ] **Apply** — submit application
- [ ] **Saved jobs** — save a job
- [ ] **AI recommendations** — view recommended jobs
- [ ] **Applications** — view application status
- [ ] **Messages** — send/receive messages (if another user exists)
- [ ] **Notifications** — view notifications

### 11.3 Employer Flow
- [ ] **Dashboard** — view analytics
- [ ] **Post job** — create and publish a job
- [ ] **Manage jobs** — edit/archive jobs
- [ ] **Applicants** — view applications for a job
- [ ] **Update status** — move applicant to INTERVIEW
- [ ] **Schedule interview** — schedule interview for applicant
- [ ] **Company profile** — update company info

### 11.4 API & Backend
- [ ] **Health check** — `curl https://api.gradture.ai/health` returns `{"status":"healthy",...}`
- [ ] **API requests** — all frontend API calls succeed (check Network tab)
- [ ] **CORS** — no CORS errors in browser console
- [ ] **Authentication** — JWT tokens are set, protected routes work
- [ ] **File uploads** — avatar upload succeeds, file appears in R2
- [ ] **WebSocket** — real-time notifications/messages connect (check Socket.io connection)

### 11.5 Email
- [ ] **Verification email** — received after registration
- [ ] **Password reset** — email received with correct `gradture.ai` link
- [ ] **Application notification** — employer receives email when student applies

---

## 12. Step 10 — Check Logs for Errors

### Railway Logs
1. Railway → Backend service → **"Logs"** tab
2. Look for:
   - `PostgreSQL connection established`
   - `Redis cache enabled` (or `disabled` if no Redis)
   - `Email service configured (Resend)`
   - `S3Client` or `R2StorageService` initialization
   - Any `ERROR` or `WARN` messages

### Vercel Logs
1. Vercel → Project → **"Deployments"** → click latest deployment → **"Functions"** or **"Build"** logs
2. Look for:
   - Build errors
   - Missing environment variables
   - Failed API requests

---

## 13. Step 11 — Security Hardening

### 13.1 Verify Secrets Are Not Exposed
- [ ] `.env` is in `.gitignore` and never pushed to GitHub
- [ ] Vercel environment variables contain NO backend secrets
- [ ] Railway environment variables are not visible in frontend source
- [ ] No hardcoded passwords, API keys, or tokens in source code

### 13.2 Verify HTTPS
- [ ] `https://gradture.ai` loads with valid SSL certificate (Vercel provides automatically)
- [ ] `https://api.gradture.ai` loads with valid SSL certificate (Railway provides automatically)
- [ ] No mixed content warnings (all resources load over HTTPS)

### 13.3 Verify CORS
- [ ] Backend only accepts requests from `gradture.ai`, `www.gradture.ai`, `admin.gradture.ai`
- [ ] No `Access-Control-Allow-Origin: *` in production API responses
- [ ] Credentials mode is enabled (cookies/authorization headers work)

---

## 14. Step 12 — Final Production Checklist

### Repository
- [ ] All code pushed to GitHub
- [ ] `.env` is gitignored and not in repository
- [ ] No secrets in git history (if there were, rotate them)
- [ ] `backend/railway.json` exists
- [ ] `frontend/vercel.json` exists
- [ ] `backend/docker-entrypoint.sh` runs migrations

### Railway Backend
- [ ] Service connected to GitHub repository
- [ ] Root directory set to `backend/`
- [ ] PostgreSQL provisioned and connected
- [ ] All required environment variables set
- [ ] `JWT_SECRET` is a strong random value (not exposed)
- [ ] `ADMIN_SETUP_SECRET` is a strong random value
- [ ] `DATABASE_URL` points to Railway PostgreSQL
- [ ] `CORS_ORIGIN` includes production Vercel domains
- [ ] `PORT` is not hardcoded (uses `process.env.PORT`)
- [ ] Health check endpoint responds at `/health`
- [ ] Migrations run successfully on deploy
- [ ] No runtime errors in logs

### Railway PostgreSQL
- [ ] Database is provisioned
- [ ] Connection string is copied to Railway backend variables
- [ ] Migrations have been applied
- [ ] Database persistence is enabled (volume persists data)

### Prisma Migrations
- [ ] `prisma/migrations/` folder is in repository
- [ ] `migration_lock.toml` exists
- [ ] Migrations run automatically via docker-entrypoint.sh
- [ ] Manual migration command works: `npx prisma migrate deploy`
- [ ] No data loss during migration

### Vercel Frontend
- [ ] Project imported from GitHub
- [ ] Root directory set to `frontend/`
- [ ] Framework detected as Vite
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] `VITE_API_URL` points to production Railway backend
- [ ] No backend secrets in Vercel environment variables
- [ ] SPA routing works (no 404 on refresh)
- [ ] All pages load correctly

### Environment Variables
- [ ] Frontend-safe vars (`VITE_*`) only in Vercel
- [ ] Backend-only vars (`DATABASE_URL`, `JWT_SECRET`, etc.) only in Railway
- [ ] All required variables are set in both platforms
- [ ] No placeholder values remain (`REPLACE_WITH_*`, `your-*`)

### Cloudflare R2
- [ ] Bucket created: `gradhire-uploads`
- [ ] API token created with Edit permissions
- [ ] R2 variables set in Railway
- [ ] File uploads work in production
- [ ] Files appear in R2 dashboard

### Email (Resend)
- [ ] Domain verified in Resend
- [ ] SPF/DKIM/DMARC records added to DNS
- [ ] API key configured in Railway
- [ ] Test emails are received
- [ ] Email links point to production domain

### Monitoring (Sentry)
- [ ] Sentry DSN configured in Railway (backend)
- [ ] Sentry DSN configured in Vercel (frontend)
- [ ] Test error reporting works

### CORS
- [ ] Only production domains are allowed
- [ ] No wildcard `*` origin in production
- [ ] Credentials mode is enabled

### Custom Domain & DNS
- [ ] `gradture.ai` → Vercel
- [ ] `www.gradture.ai` → Vercel
- [ ] `api.gradture.ai` → Railway
- [ ] `admin.gradture.ai` → Vercel (or Railway)
- [ ] DNS propagated (check with `nslookup`)
- [ ] HTTPS certificates are valid on all domains

### User Flow Testing
- [ ] Registration works for STUDENT and EMPLOYER
- [ ] Login/logout works
- [ ] Job posting works (employer)
- [ ] Job search works (student)
- [ ] Application submission works
- [ ] Status updates work
- [ ] Interview scheduling works
- [ ] Messaging works (real-time)
- [ ] Notifications appear (real-time)
- [ ] Profile updates persist
- [ ] File uploads work

---

## 15. Quick Reference — Where Things Live

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Frontend SPA | Vercel | `https://gradture.ai` |
| Frontend SPA (www) | Vercel | `https://www.gradture.ai` |
| Backend API | Railway | `https://api.gradture.ai` |
| Backend Health | Railway | `https://api.gradture.ai/health` |
| Admin panel | Vercel (same as frontend) | `https://admin.gradture.ai` |
| Database | Railway PostgreSQL | Internal to Railway |
| File Storage | Cloudflare R2 | S3-compatible API |
| Email | Resend | API-based |

---

## 16. Troubleshooting Common Issues

### Backend won't start on Railway
- Check logs for missing environment variables
- Ensure `DATABASE_URL` is correct
- Ensure `JWT_SECRET` is set
- Check that Prisma migrations can connect to database

### Frontend can't reach backend
- Verify `VITE_API_URL` in Vercel points to correct Railway URL
- Check CORS settings in Railway backend
- Ensure Railway backend is running and healthy

### Database connection fails
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- Check Railway PostgreSQL is running
- Ensure IP restrictions allow Railway to connect (Railway allows all by default)

### Migrations fail
- Don't run `prisma migrate dev` in production
- Use `prisma migrate deploy` only
- If migration fails due to existing data, check the migration SQL for destructive operations

### CORS errors in browser
- Ensure `CORS_ORIGIN` in Railway includes your exact Vercel domain (with `https://`)
- Check for trailing slashes or typos

### 404 on frontend refresh
- `vercel.json` has SPA rewrite rule: `"src": "/(.*)", "dest": "/index.html"`
- Ensure this is deployed and active

### WebSocket won't connect
- Verify `SocketContext.tsx` uses the correct `VITE_API_URL`
- Ensure Railway backend allows WebSocket connections (CORS `connectSrc` includes `ws:` and `wss:`)
- Check that Socket.io client version matches server version

---

## 17. Post-Deployment

Once everything is verified:

1. **Set up Railway alerts** — configure Railway to alert you on downtime
2. **Set up Vercel analytics** — enable Vercel Analytics in project settings
3. **Configure Sentry alerts** — set up Sentry to notify you of errors
4. **Set up database backups** — Railway PostgreSQL has automatic backups, verify they're enabled
5. **Monitor costs** — both Railway and Vercel have free tiers, but monitor usage
6. **Create an admin user** — use the admin setup flow to create your first ADMIN account
7. **Test from external network** — use a VPN or mobile data to verify public access
