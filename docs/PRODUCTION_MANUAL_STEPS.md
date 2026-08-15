# Gradture AI — Production Manual Steps

**Production URLs**
- Frontend: https://grad-hire-ai.vercel.app
- Backend: https://gradhire-ai-production.up.railway.app
- Database: Railway PostgreSQL (managed)

---

## Step 1 — Create the First ADMIN User

The public `/api/v1/auth/register` endpoint intentionally blocks `ADMIN` role creation. You must create an admin through the existing admin setup flow or directly in the database.

### Option A: Railway Shell (Recommended)

1. Open **Railway** → backend service → **Shell**
2. Run:

```bash
cd backend
npx ts-node -e "
const { PrismaService } = require('./dist/prisma.service');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaService();
  const hash = await bcrypt.hash('YourSecureAdminPassword123!', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@gradture.ai',
      passwordHash: hash,
      role: 'ADMIN',
      emailVerified: true,
    },
  });
  console.log('Admin created:', user.id, user.email);
  await prisma.\$disconnect();
}
main();
"
```

Replace `YourSecureAdminPassword123!` with a strong password.

### Option B: Direct SQL

In **Railway → PostgreSQL → Query**:

```sql
INSERT INTO "User" (id, email, "passwordHash", role, "emailVerified", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@gradture.ai',
  '$2a$10$YOUR_BCRYPT_HASH_HERE',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

Generate the bcrypt hash locally first:

```bash
node -e "console.log(require('bcryptjs').hashSync('YourSecureAdminPassword123!', 10))"
```

---

## Step 2 — Log in to the Admin Panel

1. Open https://grad-hire-ai.vercel.app/admin/job-sources
2. You will be redirected to `/login`
3. Sign in with:
   - Email: `admin@gradture.ai`
   - Password: `YourSecureAdminPassword123!`
4. After login, you should be redirected to `/admin/job-sources`

If you cannot reach the admin panel, verify:
- The admin user exists: `SELECT id, email, role FROM "User" WHERE role = 'ADMIN';`
- CORS is allowing your Vercel domain
- You are using the correct password

---

## Step 3 — Create Your First Job Source

In the admin panel at https://grad-hire-ai.vercel.app/admin/job-sources:

1. Click **Add Job Source**
2. Fill in the form:

| Field | Example Value | Notes |
|-------|---------------|-------|
| Name | `Example Careers API` | Internal name |
| Company | `Example Corp` | Source owner |
| Source Type | `API` | API, RSS, JSON, or HTML |
| Base URL | `https://api.example.com` | Source website |
| Feed URL / API URL | `https://api.example.com/jobs` | Actual jobs endpoint |
| Crawl Interval | `60` | Minutes between runs |
| Rate Limit | `10` | Max requests per minute |
| Enabled | `true` | Toggle on/off |

3. Click **Save**

**Important:** Only use sources you own or have explicit permission to ingest. Do not add sources that prohibit scraping in their Terms of Service.

---

## Step 4 — Test the Job Source

After creating a source:

1. In the Job Sources table, click **Test** for the source
2. The backend will attempt a single fetch from the source URL
3. Check the result:
   - `discovered` — number of raw job items found
   - `imported` — number that passed validation
   - `rejected` — number that failed validation
   - `errors` — any fetch or parsing errors

If the test fails:
- Verify the `Feed URL / API URL` is publicly accessible
- Verify the response format matches the adapter expectations
- Check Railway logs for detailed error messages

---

## Step 5 — Sync the Job Source

1. Click **Sync Now** for the source
2. This triggers a full ingestion run:
   - Fetch raw jobs from source
   - Normalize via AI/heuristic
   - Deduplicate against existing jobs
   - Validate quality
   - Import into `Job` table
3. After sync completes, click the source name or **Runs** to view:
   - `discovered`
   - `imported`
   - `updated`
   - `duplicates`
   - `rejected`
   - `errors`

---

## Step 6 — Verify Imported Jobs Appear Publicly

1. Open https://grad-hire-ai.vercel.app/jobs
2. Imported external jobs should appear in the listings
3. Click an imported job to view details
4. For external jobs, the **Apply** button should read:
   - `Apply on <source name>` or `Apply on external site`
5. Clicking it should redirect to the original external application URL
6. Verify the URL opens in a new tab and points to the original employer/job board

---

## Step 7 — Configure Production Services

### 7.1 Cloudflare R2 (File Storage)

1. Log in to Cloudflare Dashboard
2. Go to **R2** → **Create bucket** → name: `gradhire-uploads`
3. Go to **R2** → **Manage R2 API Tokens** → **Create API token**
4. Set permissions: **Edit** for the bucket
5. Copy the **Access Key ID** and **Secret Access Key**
6. In **Railway** → backend → **Variables**, add:

| Variable | Value |
|----------|-------|
| `STORAGE_PROVIDER` | `r2` |
| `R2_ACCOUNT_ID` | your-cloudflare-account-id |
| `R2_BUCKET` | `gradhire-uploads` |
| `R2_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY` | access-key-id |
| `R2_SECRET_KEY` | secret-access-key |

7. Save and Railway will redeploy

### 7.2 Resend (Email)

1. Log in to Resend
2. Go to **Domains** → add `gradture.ai`
3. Follow Resend's instructions to add DNS records (SPF, DKIM, DMARC) at your domain registrar
4. After DNS propagates, verify the domain in Resend
5. Create an API key in Resend
6. In **Railway** → backend → **Variables**, add:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | re_your_resend_api_key |
| `SMTP_FROM` | `GradHire AI <noreply@gradture.ai>` |

7. Save and Railway will redeploy

### 7.3 Sentry (Error Monitoring)

1. Log in to Sentry
2. Create a new project for the backend (Node.js/NestJS)
3. Copy the **DSN**
4. Create a new project for the frontend (React)
5. Copy the **DSN**
6. In **Railway** → backend → **Variables**, add:

| Variable | Value |
|----------|-------|
| `SENTRY_DSN` | backend-sentry-dsn |
| `SENTRY_ENVIRONMENT` | `production` |
| `SENTRY_RELEASE` | `gradhire@1.0.0` |

7. In **Vercel** → frontend → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_SENTRY_DSN` | frontend-sentry-dsn |

8. Redeploy both services

### 7.4 Redis (Cache/Rate-Limit) — Optional

1. In Railway, add a **Redis** plugin to your project
2. Copy the connection URL
3. In **Railway** → backend → **Variables**, add:

| Variable | Value |
|----------|-------|
| `REDIS_URL` | redis://default:password@host:6379 |

4. Save and Railway will redeploy

---

## Step 8 — Configure Custom Domains

### 8.1 Vercel Frontend Domains

1. In **Vercel** → project → **Settings** → **Domains**
2. Add:
   - `gradture.ai`
   - `www.gradture.ai`
3. Vercel will show the DNS records to add at your registrar

### 8.2 Railway Backend Domain

1. In **Railway** → backend service → **Settings** → **Networking**
2. Click **Generate Domain** or add custom domain
3. Add: `api.gradture.ai`

### 8.3 DNS Records

At your domain registrar, add:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| A | `gradture.ai` | Vercel A record | From Vercel dashboard |
| CNAME | `www.gradture.ai` | `cname.vercel-dns.com` | From Vercel dashboard |
| CNAME | `api.gradture.ai` | Railway-provided domain | From Railway dashboard |
| CNAME | `admin.gradture.ai` | `cname.vercel-dns.com` | Same as www |

Propagation typically takes 5-30 minutes.

---

## Step 9 — Update Environment Variables for Custom Domains

After DNS propagates:

### Railway

| Variable | Updated Value |
|----------|---------------|
| `CORS_ORIGIN` | `https://gradture.ai,https://www.gradture.ai,https://admin.gradture.ai` |
| `FRONTEND_URL` | `https://gradture.ai` |

### Vercel

| Variable | Updated Value |
|----------|---------------|
| `VITE_API_URL` | `https://api.gradture.ai` |

Save both and trigger redeploys.

---

## Step 10 — Production Verification Checklist

After completing all manual steps, verify every item:

### Backend
- [ ] `curl https://api.gradture.ai/api/v1/health` returns HTTP 200
- [ ] `POST /api/v1/auth/register` works for STUDENT and EMPLOYER
- [ ] `POST /api/v1/auth/login` works
- [ ] `GET /api/v1/jobs` returns jobs list
- [ ] `POST /api/v1/admin/job-sources` works with ADMIN token
- [ ] `POST /api/v1/admin/job-sources/:id/sync` triggers ingestion
- [ ] Imported jobs appear in `GET /api/v1/jobs`

### Frontend
- [ ] https://gradture.ai loads
- [ ] https://www.gradture.ai redirects to https://gradture.ai
- [ ] `/register` loads and submits
- [ ] `/login` loads and submits
- [ ] `/jobs` lists jobs
- [ ] `/jobs/:id` shows job details
- [ ] External jobs show "Apply on external site" button
- [ ] Clicking external apply opens original URL in new tab
- [ ] `/admin/job-sources` loads for ADMIN users
- [ ] SPA refresh works on all routes (no 404)

### Database
- [ ] `_prisma_migrations` shows all 3 migrations as applied
- [ ] `JobSource` table exists
- [ ] `JobSourceRun` table exists
- [ ] `JobSourceJob` table exists
- [ ] `Job` table has `isExternal`, `applicationUrl`, `sourceName`, `sourceUrl`, `sourceJobId`, `importedAt`

### Email
- [ ] Verification email received after registration
- [ ] Password reset email received
- [ ] Email links point to https://gradture.ai

### File Storage
- [ ] Avatar upload succeeds
- [ ] File appears in Cloudflare R2 dashboard

### Monitoring
- [ ] Sentry captures backend errors
- [ ] Sentry captures frontend errors

---

## Step 11 — Create Production Admin User via Setup Flow

If the application has an admin setup endpoint (e.g., `/api/v1/admin/setup`), use it instead of direct SQL:

```bash
curl -X POST https://api.gradture.ai/api/v1/admin/setup \
  -H "Content-Type: application/json" \
  -H "X-Admin-Setup-Secret: YOUR_ADMIN_SETUP_SECRET" \
  -d '{
    "email": "admin@gradture.ai",
    "password": "YourSecureAdminPassword123!",
    "name": "Admin User"
  }'
```

Replace `YOUR_ADMIN_SETUP_SECRET` with the value from Railway `ADMIN_SETUP_SECRET`.

Check the backend code for the actual setup endpoint path and required headers before running.

---

## IMPORTANT NOTES

1. **Never commit secrets**: `.env` is gitignored. All secrets stay in Railway/Vercel dashboards.
2. **Rotate exposed credentials**: The original `.env` contained exposed secrets. Generate new values for `JWT_SECRET`, `ADMIN_SETUP_SECRET`, `RESEND_API_KEY`, and R2 credentials.
3. **Job ingestion is opt-in**: No jobs are ingested until you create and enable a `JobSource`.
4. **External application tracking**: Internal application flow (`Application` table) is separate from external job redirects. External jobs do not create internal application records unless you explicitly build that feature.
5. **Rate limits**: Respect source rate limits. The `rateLimit` field in `JobSource` is enforced by the scheduler concurrency limit, not per-source throttling.

---

## TROUBLESHOOTING

### Backend won't start
- Check Railway logs for missing environment variables
- Verify `DATABASE_URL` is correct
- Verify `JWT_SECRET` is set
- Run `npx prisma migrate status` in Railway shell

### Frontend shows blank page
- Verify Vercel root directory is `frontend/`
- Verify `VITE_API_URL` is set in Vercel
- Check browser console for JS errors
- Check Network tab for failed asset loads

### CORS errors
- Verify `CORS_ORIGIN` in Railway includes your exact Vercel domain
- Verify `VITE_API_URL` uses `https://` in production
- Check that Railway backend is using HTTPS

### Migration fails
- Do NOT run `prisma migrate dev` in production
- Use `prisma migrate deploy` only
- If migration is stuck, check `_prisma_migrations` table
- If enum already exists, use `prisma migrate resolve --rolled-back <name>` then redeploy

### Job ingestion not working
- Verify `JobSource` exists and `enabled = true`
- Verify `feedUrl` is publicly accessible
- Check Railway logs for adapter errors
- Verify `AI_SERVICE_URL` is set if using AI normalization

---

## SUPPORT

If you encounter issues:
1. Check Railway logs first
2. Check Vercel deployment logs
3. Check browser DevTools console/network
4. Verify environment variables in both dashboards
5. Test endpoints directly with `curl`

---

*Last updated: 2026-08-15 — production deployment verified*

---

*Commit: ab2d512 — redeploy trigger*
