# Services team - Hiring Challenge

Welcome! This is a simplified version of MUI's production chat application, designed to assess full-stack engineering skills.

## 📋 Quick Start

### Prerequisites

- **Node.js**: >= 20.0.0
- **PNPM**: >= 9.0.0
- **Docker**: For PostgreSQL and Redis

### Setup (< 5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Start databases
docker-compose up -d
docker exec -it mui-assistant-postgres createdb -U postgres mui_chat_mini

# 3. Set up environment variables
# Create .env files if they don't exist
# For backend, you'll need to add VERCEL_AI_GATEWAY_API_KEY (see LLM Setup below)

cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# 4. Run database migrations
pnpm db:migrate

# 5. Start development servers
pnpm dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Verify Setup

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
open http://localhost:3000
```

---

## 🤖 LLM Chat Setup (Vercel AI Gateway)

The backend includes LLM chat functionality using Vercel AI Gateway with the Vercel AI SDK. The implementation uses an agent-based architecture located in `apps/backend/src/ai/`.
You feel free to use any LLM and any provider, but we recommend Vercel AI Gateway because it gives $5 in credits for free every 30 days, so you should not spend your own money on it.

### Obtaining a Vercel AI Gateway API Key

1. **Sign up for Vercel**: If you don't have an account, sign up at [vercel.com](https://vercel.com)

2. **Navigate to AI Gateway**:
   - Log in to your Vercel dashboard
   - Click on the **AI Gateway** tab in the left sidebar
   - Or visit: https://vercel.com/ai-gateway

3. **Create an API Key**:
   - In the AI Gateway dashboard, click on **API Keys** in the left sidebar
   - Click **Create Key** button
   - Give your key a descriptive name (e.g., "Local Development")
   - Copy the generated API key immediately (you won't be able to see it again)

4. **Set the API Key in Your Environment**:
   Add the following to your `apps/backend/.env` file:
   ```bash
   VERCEL_AI_GATEWAY_API_KEY=your_api_key_here
   ```

### Architecture

The LLM chat functionality is organized in the `apps/backend/src/ai/` directory:

- **`models.ts`**: Defines available models and model utilities
- **`agents/mui-assistant/index.ts`**: MUI Assistant agent implementation using AI SDK
- **`index.ts`**: Centralized exports

The implementation uses the Vercel AI SDK (`ai` package) with the OpenAI provider (`@ai-sdk/openai`) configured to work with Vercel AI Gateway. The agent handles conversation context, system prompts, and response generation.

### Testing the LLM Endpoint

Once your API key is set, you can test the LLM chat endpoint:

```bash
# First, create a chat
curl -X POST http://localhost:3001/api/chats \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Chat", "privacy": "private"}'

# This will return JSON with an "id" field inside "data".
# Copy that value and use it as CHAT_ID below.

# Then send a message to the LLM (replace CHAT_ID with the id from above)
curl -X POST http://localhost:3001/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "CHAT_ID",
    "role": "user",
    "content": "Hello, how are you?",
    "options": {
      "reasoningEffort": "low"
    }
  }'
```

### Free Credits

When you sign up for a Vercel account, you get **$5 of credits every 30 days** to try out any model. This is perfect for testing and development.

**Note**: After you make your first payment, you are considered a paid customer and will no longer receive the free credits.

### API Endpoint

The LLM chat endpoint is available at:

- **POST** `/api/messages/send`

**Request Body**:

```json
{
  "chatId": "string (required)",
  "role": "user",
  "content": "string (required, min 1 character)",
  "options": {
    "reasoningEffort": "low" | "medium" | "high" (optional, defaults to "low")
  }
}
```

**Response**:

```json
{
  "ok": true,
  "data": {
    "userMessage": {
      /* message object */
    },
    "assistantMessage": {
      /* message object */
    }
  }
}
```

---

## 🏗️ Architecture Overview

### Monorepo Structure

```
mui-assistant/
├── apps/
│   ├── frontend/          # Next.js 15 + Material-UI v7
│   └── backend/           # Fastify + Drizzle ORM
├── packages/
│   ├── shared/            # Common types, schemas, utilities
│   └── bundler/           # ESBuild integration (placeholder)
├── challenges/            # Individual challenge files ⭐
├── evaluations/           # Evaluation rubrics
├── docker-compose.yml     # PostgreSQL + Redis
└── README.md              # This file
```

### Technology Stack

**Frontend:**

- Next.js 15 (App Router)
- Material-UI v7
- React 19
- SWR (data fetching)
- Better Auth (authentication)
- TypeScript

**Backend:**

- Fastify 5
- Drizzle ORM
- PostgreSQL
- Better Auth
- Zod (validation)
- TypeScript

**Shared:**

- Zod schemas
- Common utilities
- Type definitions

---

## 🎯 Your Challenge

### Step 1: Choose Your Challenge

Read the [challenges overview](./challenges/README.md) and select **ONE** of four challenges:

1. **[Build Queue System](./challenges/challenge-1-build-queue.md)** (Backend/Systems) - Implement concurrent job processing
2. **[Auto-Fix Model](./challenges/challenge-2-auto-fix.md)** (Full-Stack/AI) - Integrate LLM for code fixes
3. **[Code Quality Scoring](./challenges/challenge-3-code-scoring.md)** (Backend/Analysis) - Implement code quality metrics
4. **[Frontend Streaming](./challenges/challenge-4-frontend-streaming.md)** (Frontend/State) - Implement real-time SSE streaming

### Step 2: Understand the Codebase

Explore the existing code to understand patterns:

**Key Files to Review:**

- `apps/backend/src/server.ts` - Fastify setup
- `apps/backend/src/routes/` - API route patterns
- `apps/backend/src/db/schema/` - Database schemas
- `apps/frontend/src/hooks/use-auth.ts` - Authentication hook
- `apps/frontend/src/lib/auth-client.ts` - Better Auth client
- `packages/shared/src/schemas/` - Shared Zod schemas

### Step 3: Implement Your Solution

- Time limit: **4-6 hours** (recommended), **8 hours** (hard limit)
- Track your time for transparency
- Commit your changes regularly

### Step 4: Document Your Work

Create `SOLUTION.md` (use [`SOLUTION_TEMPLATE.md`](./SOLUTION_TEMPLATE.md)):

- Challenge selection
- Design decisions
- Trade-offs
- How to test
- Time spent

### Step 5: Submit

1. Commit all changes
2. Ensure `SOLUTION.md` is complete
3. Verify everything runs (`pnpm dev`)
4. Push to your repository
5. Share the repo link

---

## 🛠️ Development Commands

### Root Commands

```bash
# Start both apps
pnpm dev

# Build all packages
pnpm build

# Type check all packages
pnpm typecheck

# Lint all code
pnpm lint

# Format all code
pnpm format
```

### Backend Commands

```bash
# Start backend only
pnpm --filter backend dev

# Generate database migration
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Open Drizzle Studio (DB GUI)
pnpm db:studio
```

### Frontend Commands

```bash
# Start frontend only
pnpm --filter frontend dev

# Build frontend
pnpm --filter frontend build
```

### Database Commands

```bash
# Start databases
docker-compose up -d

# Stop databases
docker-compose down

# Reset databases (WARNING: deletes data)
docker-compose down -v
docker-compose up -d
pnpm db:migrate
```

---

## 📚 Key Concepts

### Authentication Flow

1. Frontend calls Better Auth endpoints (`/api/auth/*`)
2. Backend handles auth with `apps/backend/src/lib/auth.ts`
3. Sessions stored in database
4. Frontend uses `useAuth()` hook for auth state

### API Pattern

```typescript
// Backend route
fastify.post(
  '/api/chats',
  { schema: { body: chatCreateSchema } },
  async (req) => {
    // req.session available (auth middleware)
    // Zod validation automatic
  }
);

// Frontend hook
export function useCreateChat() {
  return useSWRMutation('/api/chats', fetcher);
}
```

### Database Queries

```typescript
// Insert
await db.insert(chats).values({ ... }).returning();

// Select with filter
await db.select().from(chats).where(eq(chats.id, id));

// Update
await db.update(chats).set({ ... }).where(eq(chats.id, id));

// Delete
await db.delete(chats).where(eq(chats.id, id));
```

---

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if databases are running
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs redis

# Restart databases
docker-compose restart
```

### Port Already in Use

```bash
# Find process using port 3000 (frontend)
lsof -i :3000

# Find process using port 3001 (backend)
lsof -i :3001

# Kill process
kill -9 <PID>
```

### TypeScript Errors

```bash
# Rebuild packages
pnpm build

# Clear NX cache
rm -rf .nx

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

### Migration Issues

```bash
# Reset database and rerun migrations
docker-compose down -v
docker-compose up -d
pnpm db:migrate
```

---

## 📖 Additional Resources

### Documentation

- [Fastify Docs](https://fastify.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Next.js Docs](https://nextjs.org/docs)
- [Material-UI Docs](https://mui.com/material-ui/)
- [SWR Docs](https://swr.vercel.app/)
- [Better Auth Docs](https://www.better-auth.com/)

### Useful Patterns

**Fastify + Zod:**

```typescript
fastify.post(
  '/',
  {
    schema: {
      body: z.object({ name: z.string() }),
      response: {
        200: z.object({ ok: z.boolean(), data: z.any() }),
      },
    },
  },
  async (request, reply) => {
    // Validated body available as request.body
  }
);
```

**SWR Mutation:**

```typescript
const { trigger, isMutating } = useSWRMutation(
  '/api/chats',
  async (url, { arg }: { arg: ChatCreate }) => {
    const res = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(arg),
    });
    return res.json();
  }
);
```

**Drizzle Transactions:**

```typescript
await db.transaction(async (tx) => {
  await tx.insert(chats).values({ ... });
  await tx.insert(messages).values({ ... });
});
```

---

## ❓ FAQ

**Q: Can I add new dependencies?**
A: Yes, but justify them in your SOLUTION.md. Prefer using existing stack when possible.

**Q: Can I modify existing code?**
A: Yes! Refactoring to support your feature is fine (and encouraged).

**Q: Should I write tests?**
A: Not required, but valued. Focus on functionality first, tests if time permits.

**Q: Can I use AI/Copilot?**
A: Yes, but understand and explain all code. We'll discuss your implementation.

**Q: What if I don't finish?**
A: Submit what you have. Partial solutions with good documentation are fine.

**Q: Can I ask questions?**
A: Make reasonable assumptions and document them. Real-world engineering requires this.

---

## 🎖️ Evaluation Criteria

See the [evaluation guidelines](./evaluations/README.md) for detailed rubric.

**Summary:**

- Code Quality (30%) - Clean, maintainable, TypeScript
- Architecture (30%) - Design decisions, patterns
- Problem Solving (20%) - Edge cases, error handling
- Documentation (10%) - SOLUTION.md quality
- Engineering Judgment (10%) - Trade-offs, tool selection

---

## 📝 Submission Checklist

Before submitting, ensure:

- [ ] Code runs without errors (`pnpm dev`)
- [ ] Challenge fully implemented (or partial with explanation)
- [ ] `SOLUTION.md` completed
- [ ] Time log included
- [ ] Git commits are clean and meaningful
- [ ] No sensitive data (API keys, passwords) committed
- [ ] README updated if you added setup steps

---

## 💡 Tips for Success

1. **Start Simple**: Get something working, then improve
2. **Read Existing Code**: Follow established patterns
3. **Document as You Go**: Write SOLUTION.md alongside code
4. **Handle Errors**: Don't just code the happy path
5. **Use TypeScript**: Leverage type safety
6. **Test Your Work**: Actually run and verify your implementation
7. **Manage Time**: 4-6 hours goes fast, prioritize core functionality
8. **Be Honest**: Document limitations and trade-offs

---

## 🚀 Ready to Start?

1. ✅ Setup complete (ran `pnpm install && pnpm dev`)
2. ✅ Databases running (postgres + redis)
3. ✅ Read [`CHALLENGES.md`](./CHALLENGES.md)
4. ✅ Selected your challenge
5. ✅ Copied [`SOLUTION_TEMPLATE.md`](./SOLUTION_TEMPLATE.md) to `SOLUTION.md`

**Let's go! We're excited to see your approach.**

---

**Questions or Issues?** Check troubleshooting section above or make a reasonable assumption and document it.

Good luck! 🎉
