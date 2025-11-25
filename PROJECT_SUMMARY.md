# MUI Assistant - Project Summary

## Overview

This is a **production-pattern** hiring challenge that replicates the architecture and technologies used in MUI's actual chat application. It's designed to assess Staff Full-Stack Engineer candidates in 4-6 hours.

## What's Been Built

### ✅ Complete Foundation

#### 1. Monorepo Infrastructure

- **PNPM workspace** with NX orchestration
- **TypeScript** strict mode across all packages
- **ESLint + Prettier** configured to production standards
- **Docker Compose** for PostgreSQL + Redis

#### 2. Shared Package (`@repo/shared`)

- Zod schemas for all entities (User, Chat, Message, BuildJob)
- Type-safe utilities (formatters, ID generators, code parser)
- Clean exports structure (`/types`, `/schemas`, `/utils`)

#### 3. Backend Application (`apps/backend`)

- **Fastify 5** with Zod type provider
- **Drizzle ORM** with PostgreSQL
- **Better Auth** (email + GitHub OAuth)
- **Database schema**: users, sessions, accounts, chats, messages, build_jobs
- **API Routes**:
  - `/api/auth/*` (Better Auth integration)
  - `/api/chats` (full CRUD)
  - `/api/messages` (basic CRUD + streaming placeholder)
  - `/api/builds` (placeholder for Challenge 1)
- **Custom error handling** with ResponseError class
- **CORS** configured for localhost development

#### 4. Frontend Application (`apps/frontend`)

- **Next.js 15** with App Router
- **Material-UI v7** with theme system
- **Better Auth client** integration
- **useAuth() hook** with SWR
- Basic authentication UI
- Minimal but functional structure

#### 5. Documentation

- **README.md**: Complete setup and usage guide
- **CHALLENGES.md**: 4 detailed challenge options
- **EVALUATION.md**: Comprehensive scoring rubric
- **SOLUTION_TEMPLATE.md**: Structured template for candidates

## Challenge Options

### Challenge 1: Build Queue System (Backend)

- **Goal**: Implement concurrent job processing for ESBuild worker
- **Complexity**: Medium-High (system design)
- **Skills Tested**: Concurrency, queue design, database patterns

### Challenge 2: Auto-Fix Model Integration (Full-Stack + AI)

- **Goal**: Integrate LLM for code fixing with streaming
- **Complexity**: High (multiple systems)
- **Skills Tested**: AI integration, streaming, full-stack

### Challenge 3: Code Quality Scoring (Backend)

- **Goal**: Implement code analysis and scoring system
- **Complexity**: Medium (analysis tools)
- **Skills Tested**: Tool integration, metrics design, API design

### Challenge 4: Frontend Streaming (Frontend)

- **Goal**: Implement SSE-based streaming with SWR
- **Complexity**: Medium (state management)
- **Skills Tested**: Real-time UI, SWR patterns, TypeScript

## What's NOT Implemented (By Design)

These are intentionally left incomplete for challenges:

- ❌ Build queue system (Challenge 1)
- ❌ LLM integration and streaming (Challenge 2)
- ❌ Code scoring system (Challenge 3)
- ❌ Frontend streaming UI (Challenge 4)
- ❌ Complete chat UI components
- ❌ Message rendering with syntax highlighting
- ❌ File upload/management
- ❌ Real-time notifications

## Architecture Decisions

### Why These Technologies?

| Technology         | Reason                                                  |
| ------------------ | ------------------------------------------------------- |
| **Fastify**        | Matches production (high performance, TypeScript-first) |
| **Drizzle ORM**    | Type-safe, SQL-first, matches production                |
| **Better Auth**    | Modern auth library, matches production stack           |
| **Next.js 15**     | Latest App Router patterns                              |
| **Material-UI v7** | Production UI library                                   |
| **SWR**            | Production data fetching pattern                        |
| **Zod**            | Runtime validation + type generation                    |

### Why This Scope?

- **4-6 hours**: Enough to demonstrate skills, not overwhelming
- **Multiple options**: Tests different engineering strengths
- **Production patterns**: Real-world, not toy problems
- **Partial completion**: Shows how they work with existing code

## Next Steps to Production-Ready

If this were to become a real application, you would need:

### Immediate (Phase 1)

1. Environment variable validation (Zod schemas)
2. Logging middleware (Pino configuration)
3. Rate limiting (per-user, per-IP)
4. Request ID tracking
5. Health check endpoints (database, Redis)

### Short-term (Phase 2)

1. Complete authentication flows (email verification, password reset)
2. Session management (refresh tokens, expiry)
3. Authorization middleware (role-based access)
4. API documentation (Swagger/OpenAPI)
5. Integration tests (Vitest + Supertest)

### Medium-term (Phase 3)

1. Monitoring (Sentry/DataDog integration)
2. Metrics (Prometheus/StatsD)
3. CI/CD pipeline (GitHub Actions)
4. Database migrations strategy (rollback, backup)
5. Load testing

### Long-term (Phase 4)

1. Horizontal scaling (Redis sessions, distributed queue)
2. CDN integration (static assets)
3. Performance optimization (caching, indexes)
4. Security audit (penetration testing)
5. Compliance (GDPR, data privacy)

## Using This Challenge

### For Hiring Managers

1. **Send to candidate**: Share repository link
2. **Set expectations**: 4-6 hours, choose 1 challenge
3. **Review submission**: Use EVALUATION.md rubric
4. **Discussion**: 30-minute technical interview about their solution

### For Candidates

1. **Read README.md first**: Understand setup and structure
2. **Choose challenge**: Pick one that showcases your strengths
3. **Track time**: Be honest about hours spent
4. **Document well**: SOLUTION.md is as important as code
5. **Ask questions**: Make assumptions and document them

### Evaluation Tips

- **Don't expect perfection**: 4-6 hours is limited
- **Look for judgment**: Trade-offs, tool selection, communication
- **Check fundamentals**: TypeScript, error handling, patterns
- **Assess learning**: Can they understand and extend existing code?
- **Evaluate fit**: Do they work like your team?

## Maintenance Notes

### Keeping Dependencies Updated

```bash
# Update all dependencies (quarterly)
pnpm update --latest --recursive

# Update specific package
pnpm update package-name --latest

# Check for security issues
pnpm audit
```

### Database Schema Changes

```bash
# After modifying schema files
pnpm db:generate

# Review generated migration in apps/backend/drizzle/
# Then apply:
pnpm db:migrate
```

### Testing the Challenge

Before sending to candidates:

1. **Fresh install test**: Clone repo, run setup, verify it works
2. **Time test**: Complete one challenge yourself in time limit
3. **Difficulty calibration**: Ensure challenges are appropriately scoped
4. **Documentation review**: Keep README and CHALLENGES up to date

## Known Limitations

These are acceptable for a hiring challenge:

- No comprehensive test suite (candidates can add if they want)
- Simplified authentication (no email verification)
- Basic error messages (production would be more user-friendly)
- No analytics or monitoring
- Local development only (no deployment guide)
- Minimal UI styling (focuses on functionality)

## Success Metrics

**Good candidate submission:**

- ✅ Runs without major fixes
- ✅ Implements core challenge requirements
- ✅ Demonstrates understanding of patterns
- ✅ Good documentation in SOLUTION.md
- ✅ Handles errors gracefully
- ✅ TypeScript used well

**Exceptional candidate submission:**

- ✅ All of above plus:
- ✅ Tests included
- ✅ Performance considerations documented
- ✅ Multiple approaches evaluated
- ✅ Production-ready code quality
- ✅ Insightful trade-off analysis

## Contact & Support

For questions about this challenge project:

- Review the documentation files
- Check existing code patterns
- Make reasonable assumptions

For technical issues:

- Verify setup steps in README.md
- Check troubleshooting section
- Ensure Docker is running
- Check node/pnpm versions

---

**Version**: 1.0.0
**Last Updated**: 2025-01-24
**Maintainer**: MUI Engineering Team
