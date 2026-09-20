# Gradture

Gradture is an AI-powered job-matching platform connecting students with relevant opportunities and helping employers surface the right candidates.

## Documentation

- [Deployment](docs/DEPLOYMENT.md)
- [Development Completion Tracker](docs/processing-tracker.md)
- Specs and implementation plans: `docs/superpowers/specs/`, `docs/superpowers/plans/`

## Architecture

- `backend/` — NestJS API, Prisma/PostgreSQL, Redis
- `frontend/` — React 19, Vite, Tailwind, Vitest
- `infrastructure/` / `deploy/` — Docker + deployment automation

## Status

Backend and frontend are running locally with both test suites green:
- Frontend: 39 test files, 273 tests passing, `tsc --noEmit` clean
- Backend: 198 tests passing