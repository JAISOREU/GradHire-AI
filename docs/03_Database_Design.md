# Document 03 — Database Design

## Overview
The relational database will store core domain entities for users, jobs, applications, resumes, and AI-generated insights.

## Core Entities
- users
- profiles
- jobs
- applications
- resumes
- recommendations
- notifications
- email_events
- audit_logs

## Relationships
- One user has one profile
- One employer has many jobs
- One job has many applications
- One application belongs to one student and one job
- One resume may be associated with many applications
- One application generates one in-app notification and one email event for the employer

## Job Types
Jobs must specify a `JobType` enum:
- HIRING — full-time employment for experienced or fresh-graduate candidates
- INTERNSHIP — temporary, learning-oriented placement for students and fresh grads

## Resume Auto-Fill
Resume uploads power automatic profile population:
- Parse PDF/DOCX resumes into structured fields (name, contact, education, skills, experience, focus areas)
- Populate the student profile automatically and trigger AI job matching from the extracted content
- Store the original file reference and the parsed representation for auditability

## Notification Delivery
- Every application creates a notification row targeted at the posting employer
- Notifications are delivered in-app (read/unread status) and via email (tracked in email_events)
- Notification preferences (message, email, or both) are stored on the employer profile

## Design Goals
- Normalize transactional data
- Support auditability and traceability
- Keep indexing optimized for common search and filter paths
- Provide soft-delete support where appropriate

## Recommended Constraints
- Unique email addresses for users
- Foreign key enforcement for all references
- Timestamp tracking for create/update operations
- Soft delete flag for records that may be restored

## Migration Strategy
- Use Prisma migrations for schema evolution
- Keep migration files version controlled
- Test migrations in a staging environment before production rollout

## Performance Considerations
- Index job title, location, salary, status, and JobType fields
- Index applications by student and job for fast lookup
- Index notifications by recipient and read/unread status
- Cache frequently read data in Redis
- Monitor slow queries and optimize on demand
