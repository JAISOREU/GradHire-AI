# Document 05 — Security Architecture

## Security Objectives
Protect user data, enforce role-based access, and reduce attack surface across frontend, backend, and recommendation services.

## Security Controls
- Authentication using JWT with refresh token rotation
- Authorization through RBAC and scoped permissions
- Password hashing using Argon2
- TLS for all transit traffic and encryption at rest where supported
- Input validation and strict schema enforcement for all requests
- Protection against XSS, CSRF, and SQL injection
- File upload validation and malware scanning where required
- Resume upload validation: allow only PDF/DOCX, enforce size limits, scan for malware, and strip embedded macros
- Email notification security: send employer application alerts with TLS/SMTP auth, avoid exposing student data beyond the employer's authorized view, and include unsubscribe/opt-out controls

## Operational Security
- Secrets stored in environment variables or a secret manager
- Dependency scanning in CI/CD pipelines
- Audit logging for privileged actions
- Security headers on all web responses
- Regular dependency and vulnerability reviews
