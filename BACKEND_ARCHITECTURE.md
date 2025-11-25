# Backend Architecture Documentation

## Overview

The backend implements a queue-based message processing system using **BullMQ** and **Redis** for handling AI chat interactions. This architecture ensures reliable message processing, supports streaming responses, and enforces a single active stream per chat.

## Architecture Components

### 1. Queue System (BullMQ + Redis)

#### Components

- **Queue**: `message-processing` queue managed by BullMQ
- **Worker**: Processes jobs from the queue
- **Queue Events**: Tracks job lifecycle events
- **Redis**: Stores queue data and stream chunks

#### Key Files

- `src/lib/queue.ts` - Queue management and job tracking
- `src/lib/worker.ts` - Job processing and stream generation
- `src/routes/messages.ts` - API endpoints

### 2. Data Flow

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       │ POST /api/messages
       │ { chatId, role: 'user', content }
       ▼
┌─────────────────────────────────────┐
│  POST /api/messages                 │
│  - Validates chat exists            │
│  - Saves user message to DB        │
│  - Adds job to BullMQ queue        │
│  - Returns { ok, data, queued, jobId }│
└──────┬──────────────────────────────┘
       │
       │ Job added to queue
       ▼
┌─────────────────────────────────────┐
│  BullMQ Queue (Redis)              │
│  - Job stored with messageId       │
│  - Tracked in activeJobsByChat     │
│  - Only 1 active job per chat     │
└──────┬──────────────────────────────┘
       │
       │ Worker picks up job
       ▼
┌─────────────────────────────────────┐
│  Worker Process                     │
│  - Fetches conversation history    │
│  - Calls MUI Assistant AI          │
│  - Processes UIMessageStream       │
│  - Stores chunks in Redis           │
│  - Saves final message to DB       │
└──────┬──────────────────────────────┘
       │
       │ Stream chunks stored in Redis
       ▼
┌─────────────────────────────────────┐
│  Redis Stream Storage               │
│  - Key: stream:chunks:{jobId}       │
│  - Key: stream:status:{jobId}       │
│  - Format: JSON chunks              │
└──────┬──────────────────────────────┘
       │
       │ Frontend connects to stream
       ▼
┌─────────────────────────────────────┐
│  GET /api/messages/stream/:chatId  │
│  - Waits for job (up to 10s)       │
│  - Polls Redis for chunks          │
│  - Streams via SSE                  │
│  - Sends chunks to frontend        │
└──────┬──────────────────────────────┘
       │
       │ SSE events
       ▼
┌─────────────┐
│   Frontend  │
│  - Receives chunks                 │
│  - Accumulates text                │
│  - Updates UI in real-time         │
└─────────────┘
```

## API Endpoints

### 1. POST `/api/messages`

**Purpose**: Send a user message and queue it for AI processing

**Request Body**:

```json
{
  "chatId": "string",
  "role": "user",
  "content": "string"
}
```

**Response**:

```json
{
  "ok": true,
  "data": {
    "id": "messageId",
    "chatId": "string",
    "role": "user",
    "content": {
      "text": "string"
    },
    "createdAt": "ISO timestamp"
  },
  "queued": true,
  "jobId": "messageId"
}
```

**Workflow**:

1. Validates chat exists
2. Parses code blocks from content
3. Saves user message to database
4. If role is 'user', adds job to queue via `addMessageJob()`
5. Returns message data and job information

**Job Queueing Logic**:

- Checks if there's an active job for the chat
- If active job exists, removes it first (ensures only 1 active stream)
- Creates new job with `jobId = messageId` for deduplication
- Tracks job in `activeJobsByChat` map
- Returns job ID

### 2. GET `/api/messages/stream/:chatId`

**Purpose**: Stream AI response chunks via Server-Sent Events (SSE)

**Response**: SSE stream with events:

- `data: {"type": "connected", "jobId": "..."}`
- `data: {"type": "chunk", "content": "text chunk"}`
- `data: {"type": "done"}`
- `data: {"type": "error", "message": "error message"}`

**Workflow**:

1. Validates chat exists
2. Waits for active job (polls every 200ms, max 10 seconds)
3. Sets up SSE headers
4. Polls Redis for stream chunks every 100ms
5. Sends chunks to frontend as they arrive
6. Handles completion and errors
7. Cleans up on client disconnect

**Stream Polling**:

- Checks `stream:chunks:{jobId}` list in Redis
- Pops chunks using `RPOP` (FIFO)
- Checks `stream:status:{jobId}` for completion status
- Sends chunks via SSE format: `data: {JSON}\n\n`

### 3. GET `/api/messages/chat/:chatId`

**Purpose**: Retrieve all messages for a chat

**Response**:

```json
{
  "ok": true,
  "data": [
    {
      "id": "string",
      "chatId": "string",
      "role": "user" | "assistant",
      "content": {
        "text": "string",
        "codeBlocks": [...]
      },
      "createdAt": "ISO timestamp"
    }
  ]
}
```

## Queue System Details

### Job Data Structure

```typescript
interface MessageJobData {
  chatId: string;
  messageId: string;
  message: string;
  role: 'user' | 'assistant';
}
```

### Job Configuration

- **Queue Name**: `message-processing`
- **Job ID**: Uses `messageId` for deduplication
- **Retry Policy**: 3 attempts with exponential backoff (2s, 4s, 8s)
- **Cleanup**:
  - Completed jobs: kept for 1 hour or max 1000 jobs
  - Failed jobs: kept for 24 hours

### Active Job Tracking

**Purpose**: Ensure only 1 active stream per chat

**Implementation**:

- `activeJobsByChat` Map: `chatId -> jobId`
- When adding new job:
  1. Check for existing active job
  2. Remove existing job if still active (waiting/active/delayed)
  3. Add new job and track it
  4. Clean up tracking when job completes/fails

**Benefits**:

- Prevents multiple concurrent streams for same chat
- Ensures clean state management
- Improves resource utilization

## Worker Process

### Job Processing Flow

1. **Initialize**:
   - Update job progress to 0%
   - Fetch conversation history (last 100 messages)
   - Build messages array for AI SDK

2. **Generate Response**:
   - Call `muiAssistant.generateResponse()`
   - Get UIMessageStream and files

3. **Process Stream**:
   - Initialize Redis keys:
     - `stream:chunks:{jobId}` - List of chunks
     - `stream:status:{jobId}` - Status object
   - Read UIMessageStream incrementally
   - Extract text parts from each message
   - Calculate incremental text (difference from previous)
   - Store chunks in Redis as JSON:
     ```json
     { "type": "chunk", "content": "incremental text" }
     ```
   - Update job progress

4. **Finalize**:
   - Mark stream as completed in Redis
   - Add completion marker: `{"type": "done"}`
   - Save assistant message to database
   - Save files to database
   - Update job progress to 100%

5. **Error Handling**:
   - Mark stream as failed
   - Add error marker: `{"type": "error", "message": "..."}`
   - Throw error for BullMQ retry logic

### Worker Configuration

- **Concurrency**: 5 jobs simultaneously
- **Rate Limiting**: Max 10 jobs per second
- **Event Handlers**: Logs completion, failures, and errors

## Redis Data Structures

### Stream Chunks

**Key**: `stream:chunks:{jobId}`
**Type**: List (Redis LIST)
**Format**: JSON strings
**Operations**:

- `LPUSH` - Add chunk (worker adds)
- `RPOP` - Get chunk (stream endpoint reads)
- `LLEN` - Check if chunks available

**Chunk Format**:

```json
{"type": "chunk", "content": "text content"}
{"type": "done"}
{"type": "error", "message": "error message"}
```

### Stream Status

**Key**: `stream:status:{jobId}`
**Type**: String (JSON)
**Format**:

```json
{
  "status": "processing" | "completed" | "failed",
  "files": [...],
  "finalText": "string",
  "error": "string (if failed)"
}
```

**Operations**:

- `SET` - Update status (worker)
- `GET` - Read status (stream endpoint)

## Database Schema

### Tables

1. **chats**
   - `id` (text, PK)
   - `title` (text)
   - `privacy` (enum: private/unlisted/public)
   - `createdAt`, `updatedAt` (timestamps)

2. **chat_messages**
   - `id` (text, PK)
   - `chatId` (text, FK -> chats.id)
   - `role` (enum: user/assistant)
   - `content` (jsonb: `{text: string, codeBlocks?: [...]}`)
   - `createdAt` (timestamp)

3. **files**
   - `id` (text, PK)
   - `messageId` (text, FK -> chat_messages.id)
   - `filePath` (text)
   - `content` (text)
   - `createdAt` (timestamp)

## Error Handling

### Queue Errors

- **Job Failure**: Retried up to 3 times with exponential backoff
- **Worker Error**: Logged and job marked as failed
- **Stream Error**: Stored in Redis and sent to frontend via SSE

### API Errors

- **Chat Not Found**: 404 with error message
- **No Active Job**: 404 when stream endpoint can't find job
- **Stream Timeout**: 5-minute timeout, sends error event
- **Connection Errors**: Handled gracefully with cleanup

## Performance Considerations

### Optimization Strategies

1. **Job Deduplication**: Using `messageId` as `jobId` prevents duplicate processing
2. **Incremental Streaming**: Only sends text differences, not full text
3. **Redis List Operations**: Efficient FIFO queue for chunks
4. **Polling Interval**: 100ms balances responsiveness and server load
5. **Concurrency Control**: Limits concurrent jobs to prevent overload

### Scalability

- **Horizontal Scaling**: Multiple workers can process jobs from same queue
- **Redis Clustering**: Can be configured for high availability
- **Database Indexing**: Chat ID indexed for fast message retrieval
- **Stream Cleanup**: Automatic cleanup prevents Redis memory bloat

## Security Considerations

1. **Input Validation**: All inputs validated via Zod schemas
2. **SQL Injection**: Protected via Drizzle ORM
3. **Rate Limiting**: Built into BullMQ worker configuration
4. **Error Messages**: Sanitized to prevent information leakage

## Monitoring & Debugging

### Key Metrics to Monitor

1. **Queue Size**: Number of waiting jobs
2. **Job Processing Time**: Average time per job
3. **Error Rate**: Failed jobs vs successful
4. **Stream Latency**: Time from job start to first chunk
5. **Redis Memory**: Stream chunk storage usage

### Debugging Tips

1. **Check Redis**: Inspect `stream:chunks:{jobId}` and `stream:status:{jobId}`
2. **Worker Logs**: Check console for job completion/failure messages
3. **Job States**: Use BullMQ dashboard or Redis CLI to check job states
4. **Network**: Verify SSE connection in browser DevTools Network tab

## Future Improvements

1. **WebSocket Support**: Replace SSE polling with WebSocket for lower latency
2. **Job Prioritization**: Add priority levels for different chat types
3. **Stream Compression**: Compress chunks for bandwidth optimization
4. **Metrics Dashboard**: Real-time monitoring of queue and stream metrics
5. **Dead Letter Queue**: Better handling of permanently failed jobs
