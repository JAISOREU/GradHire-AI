# Document 08 — Deployment Architecture

## Infrastructure Goals
Use containerized, cloud-ready deployment with automation for reliable releases.

## Recommended Stack
- Docker for containerization
- Docker Compose for local development
- GitHub Actions for CI/CD
- **Vercel** for frontend hosting (static SPA, free tier)
- **Railway** or **Fly.io** for backend and AI services (Docker-native, managed)
- **Supabase** or **Railway Postgres** for managed PostgreSQL
- **Upstash** or **Redis Cloud** for managed Redis
- **SendGrid** or **AWS SES** for email notifications

## Production Deployment Steps

### 1. Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```
- Set `VITE_API_URL` to your backend URL in Vercel environment variables
- Connect GitHub repo for automatic deployments on `main` branch

### 2. Backend + AI Service (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
cd backend
railway login
railway init

# Deploy
railway up
```
- Set environment variables from `.env.production.example`
- Railway auto-detects `Dockerfile` and builds
- Add Railway Postgres plugin for managed database
- Add Railway Redis plugin for managed cache

### 3. Alternative: Fly.io (Free Tier)
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy backend
cd backend
fly launch
fly secrets set DATABASE_URL=... JWT_SECRET=...

# Deploy AI service
cd ../ai-service
fly launch
```

### 4. Environment Variables
Copy `.env.production.example` to `.env` and fill in real values:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secure random string (min 32 chars)
- `SMTP_*` — email provider credentials
- `CORS_ORIGIN` — frontend domain
- `AI_SERVICE_URL` — AI service endpoint

### 5. Domain and SSL
- Vercel provides automatic HTTPS and CDN
- Railway/Fly.io provide automatic HTTPS for backend
- For custom domain, add DNS records to your registrar

## Production Considerations
- Reverse proxy with Nginx (included in Vercel/Railway)
- Monitoring, logging, and alerting
- Health checks and rollback support
- Backup and disaster recovery strategy

## Backup Strategy
- Automated daily PostgreSQL backups via `scripts/backup.sh`
- Backups stored locally with configurable retention (default 7 days)
- Restore via `scripts/restore.sh <backup-file.sql.gz>`
- For production, extend to S3 or object storage with lifecycle policies
