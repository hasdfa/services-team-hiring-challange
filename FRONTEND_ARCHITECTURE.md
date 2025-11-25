# Frontend Architecture Documentation

## Overview

The frontend implements a queue-based chat interface that integrates with the BullMQ backend architecture. It handles message sending, streaming responses via Server-Sent Events (SSE), and real-time UI updates.

## Architecture Components

### 1. State Management (MobX)

**File**: `src/lib/chat-store.ts`

The `ChatStore` manages all chat-related state using MobX for reactive updates.

#### State Properties

```typescript
class ChatStore {
  isStreaming: boolean;           // Whether a stream is active
  streamingText: string;          // Accumulated text from stream chunks
  error: string | null;           // Error message if any
  currentJobId: string | null;    // Current job ID from backend
  streamUpdates: Array<...>;      // Debug/status updates
}
```

#### Key Methods

- `sendMessage(chatId, message, apiUrl)` - Main entry point for sending messages
- `connectToStream(chatId, apiUrl)` - Connects to SSE stream endpoint
- `consumeSSEStream(stream)` - Parses SSE events and accumulates text
- `startStreaming()` / `stopStreaming()` - Manage streaming state
- `reset()` - Clear state when switching chats

### 2. Data Flow

```
┌─────────────────┐
│  User Types     │
│  Message        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  ChatView Component                 │
│  - User submits message             │
│  - Calls handleSubmit()             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  ChatPage Component                 │
│  - Calls chatStore.sendMessage()    │
│  - Sets submitting state            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  ChatStore.sendMessage()            │
│  Step 1: POST /api/messages        │
│  - Queues job in backend            │
│  - Returns { ok, queued, jobId }    │
└────────┬────────────────────────────┘
         │
         │ Wait 200ms for job tracking
         ▼
┌─────────────────────────────────────┐
│  ChatStore.connectToStream()        │
│  Step 2: GET /api/messages/stream  │
│  - Connects to SSE endpoint         │
│  - Sets up stream reader            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  ChatStore.consumeSSEStream()      │
│  - Reads SSE events                 │
│  - Parses JSON chunks               │
│  - Accumulates text                 │
│  - Updates UI reactively           │
└────────┬────────────────────────────┘
         │
         │ Stream events:
         │ - connected: { type, jobId }
         │ - chunk: { type, content }
         │ - done: { type }
         │ - error: { type, message }
         ▼
┌─────────────────────────────────────┐
│  UI Updates (MobX Reactive)        │
│  - streamingText accumulates        │
│  - ChatView shows streaming msg     │
│  - Submit button shows loading     │
└────────┬────────────────────────────┘
         │
         │ Stream completes
         ▼
┌─────────────────────────────────────┐
│  ChatPage Component                 │
│  - fetchMessages() refreshes from DB │
│  - router.refresh() updates sidebar │
└─────────────────────────────────────┘
```

## Component Structure

### 1. ChatPage (`src/app/chats/[id]/page.tsx`)

**Purpose**: Main page component for individual chat conversations

**Responsibilities**:

- Fetch messages from API on mount
- Handle message submission
- Manage loading/submitting states
- Refresh messages after streaming completes
- Reset store when switching chats

**Key Features**:

- Uses `useEffect` to watch for streaming completion
- Automatically refreshes messages after stream ends
- Handles errors gracefully

### 2. ChatView (`src/components/ChatView.tsx`)

**Purpose**: UI component for displaying chat messages and input

**Responsibilities**:

- Display messages from props
- Show streaming message from store
- Handle user input submission
- Display errors
- Show loading states

**Key Features**:

- Combines prop messages with streaming message
- Reactive updates via MobX observer
- Clean error display with dismiss option

## API Integration

### 1. POST `/api/messages`

**Request**:

```typescript
{
  chatId: string;
  role: 'user';
  content: string;
}
```

**Response**:

```typescript
{
  ok: boolean;
  data: Message;
  queued: boolean;  // true if job was queued
  jobId?: string;   // Job ID if queued
}
```

**Handling**:

- Check `ok` status
- Verify `queued === true` (if false, another job is active)
- Wait 200ms before connecting to stream

### 2. GET `/api/messages/stream/:chatId`

**Response**: SSE stream with events:

```
data: {"type": "connected", "jobId": "..."}

data: {"type": "chunk", "content": "text chunk"}

data: {"type": "done"}

data: {"type": "error", "message": "error message"}
```

**Parsing**:

- Read stream using `ReadableStream` API
- Buffer incomplete lines
- Parse JSON from `data: {...}` lines
- Handle each event type appropriately

### 3. GET `/api/messages/chat/:chatId`

**Response**:

```typescript
{
  ok: boolean;
  data: Message[];
}
```

**Usage**:

- Fetch all messages for a chat
- Called on mount and after streaming completes
- Messages reversed to show oldest first

## SSE Stream Processing

### Event Types

1. **connected**
   - Received when stream connects
   - Contains `jobId` for tracking
   - Updates `currentJobId` in store

2. **chunk**
   - Contains incremental text content
   - Appended to `streamingText`
   - Triggers reactive UI update

3. **done**
   - Stream completed successfully
   - Stops streaming state
   - Triggers message refresh

4. **error**
   - Stream error occurred
   - Sets error state
   - Stops streaming

### Parsing Logic

```typescript
// Buffer management
let buffer = '';
buffer += decoder.decode(value, { stream: true });
const lines = buffer.split('\n');
buffer = lines.pop() || ''; // Keep incomplete line

// Parse each line
for (const line of lines) {
  if (line.startsWith('data: ')) {
    const data = JSON.parse(line.slice(6));
    // Process event...
  }
}
```

## Error Handling

### Error Scenarios

1. **Message Queue Failure**
   - Network error or invalid response
   - Sets error in store
   - User can retry

2. **Stream Connection Failure**
   - 404: No active job
   - Network error
   - Sets error and stops streaming

3. **Stream Parsing Error**
   - Invalid JSON in SSE event
   - Logs error but continues
   - Doesn't break stream

4. **Stream Timeout**
   - Backend timeout (5 minutes)
   - Sets error message
   - Stops streaming

### Error Display

- Errors shown as dismissible Chip component
- Error state cleared when user dismisses
- Errors logged to console for debugging

## State Management Patterns

### MobX Reactive Updates

```typescript
// Store updates trigger UI re-renders
runInAction(() => {
  this.streamingText += chunk; // UI updates automatically
});

// Components observe store
const ChatView = observer(function ChatView() {
  // Automatically re-renders when store changes
});
```

### State Lifecycle

1. **Initial**: `isStreaming = false`, `streamingText = ''`
2. **Sending**: `startStreaming()` called
3. **Streaming**: Chunks accumulate in `streamingText`
4. **Complete**: `stopStreaming()` called, messages refreshed
5. **Error**: Error set, streaming stopped

## Performance Considerations

### Optimizations

1. **Debouncing**: Small delay (200ms) before stream connection
2. **Stream Updates**: Limited to last 50 updates
3. **Message Refresh**: Only after stream completes
4. **Reactive Updates**: MobX ensures minimal re-renders

### Memory Management

- Stream buffer cleared after processing
- Old stream updates automatically pruned
- Store reset when switching chats

## User Experience

### Loading States

- **Submitting**: Submit button shows loading spinner
- **Streaming**: Streaming message appears in chat
- **Loading**: Initial message fetch shows loading state

### Streaming Display

- Streaming text appears as assistant message
- Updates in real-time as chunks arrive
- Replaced by final message after refresh

### Error Recovery

- Errors displayed clearly
- User can dismiss errors
- Can retry sending message

## Testing Considerations

### Test Scenarios

1. **Happy Path**: Send message → Stream → Complete
2. **Network Error**: Handle fetch failures
3. **Stream Error**: Handle SSE errors
4. **Multiple Messages**: Ensure only one stream per chat
5. **Chat Switching**: Reset state properly

### Mock Data

- Mock SSE stream responses
- Mock API responses
- Test error scenarios

## Future Improvements

1. **Reconnection**: Auto-reconnect on stream failure
2. **Progress Indicator**: Show streaming progress
3. **Cancel Stream**: Allow user to cancel active stream
4. **Optimistic Updates**: Show user message immediately
5. **Offline Support**: Queue messages when offline
