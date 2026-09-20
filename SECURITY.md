# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email security@gradture.ai instead of opening a public issue.

## Production Secrets

**Never commit real secrets to version control.**

This repository contains a `.env` file with **placeholder values only**. If you find real secrets in any branch or commit:

1. **Rotate immediately**: Assume all exposed secrets are compromised and rotate them in their respective dashboards.
2. **Purge history**: Use `git filter-branch` or `git rebase` to remove the secrets from git history, then force-push.
3. **Notify**: Inform all team members to re-pull and discard any local clones that may contain the exposed secrets.

### Secrets to protect

| Secret | Where to rotate |
|--------|-----------------|
| `JWT_SECRET` | Backend deployment environment variables |
| `RESEND_API_KEY` | Resend dashboard → API Keys |
| `R2_ACCESS_KEY` / `R2_SECRET_KEY` | Cloudflare R2 → Manage R2 API tokens |
| `SENTRY_DSN` | Sentry project settings |
| `ADMIN_SETUP_SECRET` | Backend deployment environment variables |
| `REDIS_URL` | Redis provider dashboard |
| `POSTGRES_PASSWORD` | Database provider dashboard |

## Deployment Security

- **Render / Vercel / Neon**: Store all secrets in the platform's environment variable UI, not in repo files.
- **Local development**: Copy `.env.example` to `.env` and fill in your own local values.
- **Secrets managers**: In production, prefer AWS Secrets Manager, HashiCorp Vault, or Docker secrets over flat `.env` files.

## Access Control

- Public endpoints (`/companies`, `/jobs`, `/users/avatar/:id`) are rate-limited.
- Registration defaults to `STUDENT`; `EMPLOYER` requires explicit selection; `ADMIN` cannot be self-registered.
- All authenticated endpoints validate roles via guards.
