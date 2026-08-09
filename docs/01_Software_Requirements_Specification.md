# Document 01 — Software Requirements Specification

## 1. Introduction
The Gradture AI platform provides a digital experience for students and employers to discover opportunities, manage profiles, and receive AI-assisted job recommendations.

## 2. Overall Description
The system will consist of a web application with a backend service, AI matching service, and supporting infrastructure. It will be implemented using a modular architecture that can evolve over time.

## 3. User Classes
- Students / Fresh Grads: sign up, sign in, create or auto-fill profiles via resume upload, browse all job posts, apply to jobs, receive recommendations
- Employers: sign up, sign in, post full-time job hirings or internships, view candidate matches, manage applications, receive application notifications in-app and by email
- Administrators: manage account safety, onboarding, and platform operations

## 4. Functional Requirements
- Students and employers can register, sign in, and manage their accounts
- Students can create and maintain a profile manually or by uploading a resume (PDF/DOCX) to auto-fill profile fields
- Students can browse all job posts with filters (type, location, keyword)
- Students can apply to jobs and view application status
- Employers can create and manage job postings with a specified JobType (HIRING or INTERNSHIP)
- Employers can view candidate matches and manage applications
- Employers receive direct notifications (in-app + email) for every new application
- The platform can generate AI-based job recommendations from student focus areas or resume content
- The system can authenticate users securely via JWT with role-based access

## 5. Non-Functional Requirements
- Availability: 99.9% target for production
- Performance: API responses under 500 ms for standard requests
- Security: authentication, authorization, input validation, and encryption
- Scalability: support increasing traffic without major re-architecture
- Maintainability: clear module boundaries and documented standards

## 6. Constraints
- Must support a phased delivery plan
- Initial release should be deployable to cloud infrastructure
- AI service must remain modular to support model upgrades

## 7. Business Rules
- Only authenticated users may submit applications
- Employers may only manage their own job postings
- Recommendation results must be explainable enough for review
- Sensitive data must be protected by role-based access controls

## 8. Assumptions
- A relational database will be used for transactional data
- A caching layer will be used for read-heavy operations
- AI inference can be served independently from the core application

## 9. User Stories
- As a student, I want relevant jobs so that I can apply faster.
- As a student, I want to upload my resume so that my profile is filled automatically and I get matched to suitable jobs.
- As an employer, I want to post jobs so that I can reach qualified candidates.
- As an employer, I want to post full-time hiring or internship roles so that I can target the right candidates.
- As an employer, I want to receive a message or email for each application so that I never miss a candidate.
- As an administrator, I want to review users so that the platform remains safe.

## 10. Acceptance Criteria
- New users can register and sign in successfully
- Job posting and browsing workflows work end to end
- AI recommendations appear for students with complete profiles
- Employers can post both HIRING and INTERNSHIP job types
- Students can upload a resume that auto-fills their profile and drives job recommendations
- Employers receive an in-app message and email notification for every new application
- Security checks are passed in CI before deployment
