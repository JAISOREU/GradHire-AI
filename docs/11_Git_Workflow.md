# Document 11 — Git Workflow

## Branch Strategy
- main: production-ready code
- develop: integration branch for ongoing work
- feature/*: short-lived branches for features
- release/*: release preparation branches
- hotfix/*: urgent fixes to production

## Recommended Workflow
1. Create a feature branch from develop
2. Implement changes and commit with Conventional Commits
3. Open a pull request for review
4. Merge only after CI passes and review is complete

## Merge Policy
- Require review approval
- Enforce passing CI checks before merge
- Prefer squash merges for feature work

## Versioning
Use semantic versioning for release tagging and deployment communication.
