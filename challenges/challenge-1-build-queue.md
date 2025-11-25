# Challenge 1: Build Queue System 🏗️

**Difficulty**: Medium-High
**Focus**: Backend Engineering, System Design, Concurrency
**Time**: 4-6 hours

## Problem Statement

The current ESBuild worker (`apps/backend/src/routes/builds.ts`) processes build jobs **sequentially**. When a user submits multiple code fixes, subsequent builds are blocked until the current one completes. This creates a poor user experience.

## Current Implementation

```typescript
// apps/backend/src/routes/builds.ts
fastify.post('/', async (request) => {
  const { chatId, messageId, code } = request.body;

  // Creates job but processes synchronously
  const newJob = await db
    .insert(buildJobs)
    .values({
      id: nanoid(),
      chatId,
      messageId,
      code,
      status: 'pending',
    })
    .returning();

  // TODO: This blocks! No queue system exists
  return { ok: true, data: newJob[0] };
});
```

### The Problem

1. **Blocking**: Jobs are processed one at a time
2. **No Queue**: No way to manage pending jobs
3. **No Status Updates**: Jobs stay "pending" forever
4. **Poor UX**: Users can't see queue position or progress

## Your Task

Implement a robust build queue system that:

1. ✅ **Queues concurrent build requests** (don't process them synchronously)
2. ✅ **Processes jobs in FIFO order** per chat (chat A's jobs don't block chat B's jobs)
3. ✅ **Updates job status** in the database (`pending` → `running` → `completed`/`failed`)
4. ✅ **Provides queue visibility** (API endpoint to see queue position and status)
5. ✅ **Handles worker failures** gracefully (retry logic, error states)

## Implementation Options

You can choose any of these approaches (or propose your own):

### Option A: In-Memory Queue with Worker Pool

**Pros**: Simple, no external dependencies, fast
**Cons**: Not persistent, lost on restart
**Good for**: Small-scale, development

```typescript
class BuildQueue {
  private queue: BuildJob[] = [];
  private workers: Worker[] = [];

  async enqueue(job: BuildJob) { ... }
  async processNext() { ... }
}
```

### Option B: Redis-Based Queue (Bull/BullMQ)

**Pros**: Persistent, battle-tested, handles distributed systems
**Cons**: External dependency, more complex
**Good for**: Production-scale, distributed workers

```typescript
import { Queue } from 'bullmq';

const buildQueue = new Queue('builds', {
  connection: redisConnection,
});

await buildQueue.add('build', { code, chatId });
```

### Option C: Database-Backed Queue with Polling

**Pros**: Uses existing database, simple, persistent
**Cons**: Polling overhead, less efficient
**Good for**: Small-scale, minimal dependencies

```typescript
// Poll for pending jobs
setInterval(async () => {
  const pending = await db
    .select()
    .from(buildJobs)
    .where(eq(buildJobs.status, 'pending'))
    .limit(1);

  if (pending[0]) await processBuildJob(pending[0]);
}, 1000);
```

### Option D: Custom Solution

Propose and implement your own architecture!

## Requirements

### 1. Core Functionality

**Queue Management:**

```typescript
// Create and enqueue job
POST /api/builds
Body: { chatId, messageId, code }
Response: { ok: true, data: { id, status: 'pending', queuePosition: 3 } }

// Get job status
GET /api/builds/:id
Response: { ok: true, data: { id, status: 'running', ... } }

// Get queue for a chat
GET /api/builds/chat/:chatId
Response: { ok: true, data: [ ...jobs with statuses ] }
```

**Status Transitions:**

```
pending → running → completed
                 → failed
```

### 2. Concurrency Handling

- Process multiple jobs concurrently (e.g., 3 workers)
- Don't block other chats' jobs
- Handle worker failures gracefully

### 3. Database Integration

Update the `build_jobs` table:

```typescript
// Ensure these fields are properly updated
{
  status: 'pending' | 'running' | 'completed' | 'failed',
  startedAt: timestamp | null,
  completedAt: timestamp | null,
  error: string | null,
  result: string | null,
}
```

### 4. Error Handling

- Handle job failures (timeout, crash, invalid code)
- Implement retry logic (optional but valued)
- Log errors appropriately
- Update database with failure information

## API Endpoints to Implement/Update

### Create Build Job (Update)

```typescript
POST /api/builds
Body: { chatId: string, messageId: string, code: string }

Response: {
  ok: true,
  data: {
    id: string,
    status: 'pending',
    queuePosition: number,  // NEW
    estimatedWaitTime?: number  // BONUS
  }
}
```

### Get Job Status (Update)

```typescript
GET /api/builds/:id

Response: {
  ok: true,
  data: {
    id: string,
    status: 'pending' | 'running' | 'completed' | 'failed',
    createdAt: string,
    startedAt: string | null,
    completedAt: string | null,
    result: string | null,
    error: string | null,
    queuePosition?: number  // If pending
  }
}
```

### Get Chat Queue (New)

```typescript
GET /api/builds/chat/:chatId

Response: {
  ok: true,
  data: {
    pending: BuildJob[],
    running: BuildJob[],
    completed: BuildJob[]
  }
}
```

### Queue Stats (Bonus)

```typescript
GET /api/builds/stats

Response: {
  ok: true,
  data: {
    totalQueued: number,
    totalRunning: number,
    totalCompleted: number,
    averageProcessingTime: number
  }
}
```

## Evaluation Criteria

### System Design (40%)

- Architecture clarity and scalability
- Queue implementation correctness
- Concurrency model appropriateness
- Trade-off analysis

### Code Quality (30%)

- Clean, maintainable implementation
- Type safety (TypeScript)
- Separation of concerns
- Reusable abstractions

### Error Handling (20%)

- Graceful failure handling
- Retry logic (if implemented)
- Edge case coverage
- Logging and debugging

### Documentation (10%)

- Architecture diagram
- Design decision rationale
- Setup and testing instructions
- Future improvements

## Testing Your Implementation

### Manual Test Cases

**Test 1: Single Job**

```bash
# Create a build job
curl -X POST http://localhost:3001/api/builds \
  -H "Content-Type: application/json" \
  -d '{"chatId":"chat1","messageId":"msg1","code":"console.log(\"test\")"}'

# Check status
curl http://localhost:3001/api/builds/{job-id}

# Expected: status should transition pending → running → completed
```

**Test 2: Multiple Jobs (Concurrency)**

```bash
# Create 5 jobs quickly
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/builds \
    -H "Content-Type: application/json" \
    -d "{\"chatId\":\"chat1\",\"messageId\":\"msg$i\",\"code\":\"console.log($i)\"}"
done

# Check queue
curl http://localhost:3001/api/builds/chat/chat1

# Expected: Some running, some pending, processing in order
```

**Test 3: Error Handling**

```bash
# Submit invalid code
curl -X POST http://localhost:3001/api/builds \
  -H "Content-Type: application/json" \
  -d '{"chatId":"chat1","messageId":"msg1","code":"syntax error{"}'

# Expected: Job should fail gracefully with error message
```

## Deliverables

1. **Working Queue Implementation**
   - Code in `apps/backend/src/lib/build-queue.ts` (or similar)
   - Updated routes in `apps/backend/src/routes/builds.ts`
   - Database migrations if schema changed

2. **SOLUTION.md** with:
   - Architecture diagram (text/ASCII art is fine)
   - Implementation approach explanation
   - Technology/pattern choices with rationale
   - Trade-offs discussed
   - Testing instructions
   - Future improvements

3. **Example Usage**
   - Code snippets showing how to use the queue
   - Example API requests/responses

## Bonus Points

- 🌟 **Tests**: Unit tests for queue logic
- 🌟 **Metrics**: Track processing time, success rate
- 🌟 **Priority Queue**: Higher priority for certain jobs
- 🌟 **Rate Limiting**: Limit jobs per user/chat
- 🌟 **Dead Letter Queue**: Handle permanently failed jobs
- 🌟 **Real-time Updates**: WebSocket/SSE for status updates

## Common Pitfalls to Avoid

❌ **Race Conditions**: Multiple workers processing same job
✅ **Solution**: Proper locking or atomic operations

❌ **Memory Leaks**: Queue growing unbounded
✅ **Solution**: Limit queue size, clean up old jobs

❌ **Lost Jobs**: Jobs disappearing on server restart
✅ **Solution**: Use persistent storage (Redis/database)

❌ **No Error Handling**: Workers crashing silently
✅ **Solution**: Try-catch, error logging, status updates

## Example Architecture Diagram

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/builds
       ▼
┌─────────────┐
│  API Route  │ ──┐
└─────────────┘   │
                  │ enqueue(job)
                  ▼
┌─────────────────────────┐
│     Build Queue         │
│  ┌────────────────┐    │
│  │ Pending Jobs   │    │
│  │  - Job 1       │    │
│  │  - Job 2       │    │
│  │  - Job 3       │    │
│  └────────────────┘    │
│         │               │
│         │ process()     │
│         ▼               │
│  ┌────────────────┐    │
│  │ Worker Pool    │    │
│  │  - Worker 1 ▶ │    │
│  │  - Worker 2 ▶ │    │
│  │  - Worker 3   │    │
│  └────────────────┘    │
│         │               │
│         │ updateStatus()│
│         ▼               │
└─────────────────────────┘
       │
       ▼
┌─────────────┐
│  Database   │
│ build_jobs  │
└─────────────┘
```

## Resources

- [Node.js Worker Threads](https://nodejs.org/api/worker_threads.html)
- [BullMQ Documentation](https://docs.bullmq.io/)
- [Drizzle ORM Transactions](https://orm.drizzle.team/docs/transactions)
- [Queue Data Structure](<https://en.wikipedia.org/wiki/Queue_(abstract_data_type)>)

---

**Ready to start?** Review the existing `apps/backend/src/routes/builds.ts` to understand the current implementation, then design and build your queue system!

Good luck! 🚀
