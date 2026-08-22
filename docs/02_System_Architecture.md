# Document 02 — System Architecture

## Architectural Style
The initial system will follow a modular monolith approach with clear boundaries for future service extraction. This balances delivery speed with long-term maintainability.

## High-Level Architecture
- Frontend: React 19 + TypeScript + Vite
- Backend: NestJS with modular domain structure
- Recommendation Service: FastAPI for resume parsing and matching
- Data Layer: PostgreSQL + Redis
- Infrastructure: Docker, GitHub Actions, cloud deployment

## Component Overview
- Client application for students and employers
- API gateway and backend services
- inference pipeline for parsing and recommendation
- Resume ingestion pipeline for upload, parsing, and profile auto-fill
- Notification service for in-app messages and email delivery to employers
- Database and cache for persistence and session handling
- Observability stack for logs, metrics, and health monitoring

## Design Principles
- Clean Architecture
- SOLID principles
- Domain-Driven Design for key business domains
- Dependency Injection and repository/service separation
- API-first development

## Proposed Patterns
- Repository pattern for persistence abstraction
- Service layer for business logic
- Dependency injection for runtime configuration
- CQRS where read/write scaling justifies it

## Deployment View
The application will be deployed using containerized services and managed cloud resources, with reverse proxy support in production.
