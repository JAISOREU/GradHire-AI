# Document 04 — API Design

## API Style
The platform will expose versioned REST APIs following OpenAPI 3.1 conventions.

## Base URL
- /api/v1

## Core Endpoints
### Authentication (required for all users)
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- GET /auth/me

### Students
- GET /students/me
- PUT /students/me
- POST /resumes — upload a resume (PDF/DOCX) for parsing
- POST /resumes/parse — parse the uploaded resume and auto-fill the profile
- GET /students/me/applications — list applications for the signed-in student

### Employers
- GET /employers/me
- PUT /employers/me
- GET /employers/me/applications — list applications for the employer's job posts
- GET /employers/me/notifications — list in-app notifications
- PUT /employers/me/notifications/:id/read — mark a notification as read

### Jobs
- GET /jobs — list jobs (supports `?type=HIRING|INTERNSHIP`, `?location=`, `?keyword=`)
- POST /jobs — create a job posting (requires employer role)
- PUT /jobs/:id — update a job posting
- DELETE /jobs/:id — archive or delete a job posting

### Applications
- POST /applications — apply to a job (requires student/fresh-grad role)
- GET /applications/:id — view application details
- POST /applications/:id/withdraw — withdraw an application

## Notification & Email Delivery
- Every successful `POST /applications` creates:
  - An in-app notification for the posting employer
  - An email event sent to the employer's registered email address
- Employers can manage delivery preferences (message, email, or both) via PUT /employers/me

## Job Type Payload
Job postings include a `type` field with one of:
- `HIRING` — full-time employment
- `INTERNSHIP` — internship placement

## API Design Principles
- Consistent resource naming
- Standardized error responses
- Pagination, filtering, and sorting support
- Authenticated and rate-limited endpoints
- Clear versioning strategy for backward compatibility

## Request and Response Expectations
- Use JSON payloads for all API interactions
- Return structured error objects with status codes
- Include pagination metadata for list endpoints

## Error Handling
- 400 for validation failures
- 401 for unauthenticated requests
- 403 for insufficient permissions
- 404 for missing resources
- 500 for unexpected server failures
