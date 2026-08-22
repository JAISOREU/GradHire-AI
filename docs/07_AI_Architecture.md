# Document 07 — Architecture

## Capabilities
The platform will support:
- Resume parsing and extraction
- Profile auto-fill from uploaded resumes
- Embedding generation for semantic matching
- Job recommendation generation from student focus or resume content
- Candidate ranking and explainability

## Architecture Components
- Ingestion pipeline for resumes and job descriptions
- Resume parser (PDF/DOCX → structured profile fields)
- Embedding service using sentence-transformers
- Matching service using similarity scoring and heuristics
- Recommendation engine with caching and fallback strategies
- Notification trigger service that fires employer alerts (in-app + email) on each application

## Resume-Driven Workflow
1. Student uploads a resume (PDF/DOCX)
2. Resume parser extracts name, contact, education, skills, experience, and focus areas
3. Extracted fields auto-fill the student profile
4. The matching service uses resume content (not just a keyword string) to rank relevant jobs
5. Recommendations refresh automatically after parsing completes

## Model Lifecycle
- Version models and prompts
- Track evaluation metrics for quality and performance
- Monitor drift and update pipelines safely

## Evaluation Metrics
- Precision@K
- Recall@K
- Relevance score
- Resume-to-profile field extraction accuracy
- Latency and fallback success rate
