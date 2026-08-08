# Document 09 — Testing Strategy

## Test Pyramid
- Unit tests for business logic and utilities
- Integration tests for persistence and service interactions
- API tests for endpoint contracts
- End-to-end tests for critical user journeys

## Coverage Targets
- Backend: at least 80% coverage
- Frontend: critical user flows covered by E2E tests

## Additional Testing Areas
- Performance testing for common API endpoints
- Security tests for auth, authorization, and input handling
- Load testing for peak traffic expectations
- Resume parsing tests for PDF/DOCX extraction accuracy and edge cases
- Notification tests for in-app + email delivery on application submission
- Job type (HIRING/INTERNSHIP) filtering and posting tests
