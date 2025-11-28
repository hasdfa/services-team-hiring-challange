# MUI Assistant: Engineering Challenges

Welcome to the MUI Assistant hiring challenge! This project is a production-style chat application with an AI assistant that helps users build Material-UI components.

## Architecture Overview

Before choosing a challenge, understand the existing system:

**Backend** (`apps/backend/`):

- Fastify server with PostgreSQL (Drizzle ORM)
- MUI Assistant AI agent with tools (`search-docs`, `write-file`)
- Vercel AI SDK for streaming responses
- Messages stored with parts array (text, reasoning, tool-calls, files)

**Frontend** (`apps/frontend/`):

- Next.js 15 with React 19 and MUI v7
- `useChat` hook for streaming chat
- Live code preview using esbuild-browser (in-browser bundling)
- Service worker serves built files to iframe

**Key Data Flow**:

1. User sends message → Backend processes with AI agent
2. AI generates React components using `write-file` tool
3. Files stream to frontend via SSE
4. CodePreview bundles files in browser and renders in iframe

See `docs/BACKEND_ARCHITECTURE.md` and `docs/FRONTEND_ARCHITECTURE.md` for details.

## Challenge Options

| Challenge                                                                     | Focus Area       | Complexity  | Skills Tested                                      |
| ----------------------------------------------------------------------------- | ---------------- | ----------- | -------------------------------------------------- |
| **[Challenge 1: Build Queue System](./challenge-1-build-queue.md)**           | Frontend/State   | Medium      | Queue design, state management, caching            |
| **[Challenge 2: Auto-Fix Integration](./challenge-2-auto-fix.md)**            | Full-Stack/AI    | High        | AI tools, streaming, error handling                |
| **[Challenge 3: Code Quality Scoring](./challenge-3-code-scoring.md)**        | Backend/Analysis | Medium      | Code analysis, metrics, API design                 |
| **[Challenge 4: Visual Preview Editor](./challenge-4-frontend-streaming.md)** | Frontend/UX      | Medium-High | DOM manipulation, iframe communication, state sync |

## How to Choose

### Choose Challenge 1 if you:

- Prefer frontend state management challenges
- Enjoy queue and caching architectures
- Like working with browser APIs (IndexedDB, localStorage)

### Choose Challenge 2 if you:

- Want to showcase full-stack capabilities
- Are interested in AI/LLM integration
- Enjoy extending existing systems with new features

### Choose Challenge 3 if you:

- Like code analysis and metrics
- Prefer backend-focused work
- Enjoy building developer tools

### Choose Challenge 4 if you:

- Enjoy interactive UI challenges
- Have experience with iframe communication
- Like building visual editors and design tools

## General Guidelines

### Time Management

- **4-6 hours recommended**
- **8 hours hard limit**
- Track your time in `SOLUTION.md`

### What We're Looking For

1. **Engineering Judgment**: Choose the right tools and patterns
2. **Code Quality**: Clean, maintainable, well-structured code
3. **Communication**: Clear documentation and explanations
4. **Trade-offs**: Acknowledge limitations and future improvements

### What You Should NOT Do

- Don't over-engineer (YAGNI principle)
- Don't skip error handling
- Don't forget documentation
- Don't ignore edge cases

### Submission Requirements

1. **Working Code**: All code committed to your repo
2. **SOLUTION.md**: Detailed explanation (use `SOLUTION_TEMPLATE.md`)
3. **Time Log**: Approximate hours spent
4. **Running Instructions**: How to test your implementation

### Questions?

If you have clarifying questions:

- Check `README.md` for setup instructions
- Review existing code patterns in `docs/` folder
- Make reasonable assumptions and document them

---

Good luck! We're excited to see your approach to these problems. Remember: there's no single "right" answer. We're evaluating your problem-solving process, not just the end result.

## Next Steps

1. Read the architecture docs (`docs/BACKEND_ARCHITECTURE.md`, `docs/FRONTEND_ARCHITECTURE.md`)
2. Read the challenge that interests you
3. Review the existing codebase
4. Copy `SOLUTION_TEMPLATE.md` to `SOLUTION.md`
5. Start coding!
