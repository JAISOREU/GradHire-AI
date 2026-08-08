# Document 10 — Coding Standards

## General Principles
- Write clear, readable, and maintainable code
- Follow consistent naming and folder conventions
- Keep business logic separate from framework-specific code

## Language and Tooling
- TypeScript for frontend code
- React with functional components and hooks
- NestJS for backend services
- Prisma for database access and migrations
- Prettier for formatting
- ESLint for static analysis
- Resume parsing library (e.g., resume-parser / unstructured) for PDF/DOCX extraction
- Email/notification library (e.g., Nodemailer) for SMTP delivery

## Commit Standards
Use Conventional Commits such as:
- feat: add authentication flow
- fix: resolve recommendation caching issue
- docs: update architecture guidance

## Review Checklist
- Is the change covered by tests?
- Is the code easy to understand?
- Are security and error handling addressed?
- Is documentation updated if behavior changes?
