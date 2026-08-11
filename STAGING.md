# Gradture AI — Staging Deployment Guide

## Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- Redis (optional, for rate limiting and caching)
- SMTP server (for transactional emails)
- S3-compatible storage (for file uploads)

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

### Required
```
DATABASE_URL=postgresql://user:password@host:5432/gradhire
JWT_SECRET=<strong-random-secret-64chars>
JWT_EXPIRES_IN=15m
NODE_ENV=staging
PORT=3000
CORS_ORIGIN=https://staging.gradture.ai
FRONTEND_URL=https://staging.gradture.ai
```

### SMTP
```
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@staging.gradture.ai
```

### Storage
```
STORAGE_PROVIDER=s3
AWS_REGION=ap-southeast-1
AWS_S3_BUCKET=gradture-staging-uploads
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

### Optional
```
REDIS_URL=redis://localhost:6379
SENTRY_DSN=https://...
AI_API_URL=http://localhost:8000
```

## Database Setup

```bash
cd backend
npm install
npx prisma db push
npm run seed  # optional
```

## Backend Deployment

```bash
cd backend
npm install --production
npm run build
npm start
```

## Frontend Deployment

```bash
cd frontend
npm install
npm run build
# Serve dist/ with nginx or similar
```

## Health Checks

```bash
curl https://staging.gradture.ai/api/v1/health
# Expected: {"status":"healthy",...}
```

## Smoke Tests

1. Register talent account
2. Register employer account
3. Employer creates company
4. Employer creates and publishes job
5. Talent views and applies to job
6. Employer views applicant and updates status
7. Talent sees updated status
8. Messaging works both directions
9. Notifications appear for both parties

## Rollback

```bash
git revert HEAD
npm run build
npm start
```
