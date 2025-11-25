# Challenge 4: Frontend Streaming Implementation 🎨

**Difficulty**: Medium
**Focus**: Frontend Engineering, State Management, Real-Time UI
**Time**: 4-6 hours

## Problem Statement

The backend has a working Server-Sent Events endpoint for AI responses, but the frontend doesn't implement streaming. Messages appear all at once, which provides a poor user experience. Users should see AI responses appear word-by-word in real-time.

## Backend API (Already Implemented)

The backend endpoint is ready and waiting for your frontend:

```typescript
POST /api/messages/stream
Headers: {
  'Content-Type': 'application/json',
  'Cookie': 'session=...'  // Authentication
}
Body: {
  chatId: string,
  content: string
}

Response: Server-Sent Events (text/event-stream)

// Event stream format:
data: {"type": "start", "messageId": "msg-123"}

data: {"type": "chunk", "content": "Hello"}

data: {"type": "chunk", "content": " world"}

data: {"type": "chunk", "content": "!"}

data: {"type": "done", "messageId": "msg-123", "totalChunks": 3}

// On error:
data: {"type": "error", "message": "Rate limit exceeded"}
```

## Your Task

Implement a production-quality frontend streaming system:

1. ✅ **SSE Connection**: Connect to backend stream endpoint
2. ✅ **Real-Time Updates**: Append chunks to UI as they arrive
3. ✅ **State Management**: Use SWR mutation pattern correctly
4. ✅ **Error Handling**: Handle disconnects, retries, timeouts
5. ✅ **UI Polish**: Loading states, animations, user feedback

## Architecture Requirements

### State Management Strategy

You must architect a clean state management solution:

```
┌─────────────────────────────────────────┐
│         Chat View Component             │
│  ┌───────────────────────────────────┐ │
│  │   Messages List                   │ │
│  │   - Historical messages (DB)      │ │
│  │   - Optimistic user message       │ │
│  │   - Streaming assistant message   │ │
│  └───────────────────────────────────┘ │
│  ┌───────────────────────────────────┐ │
│  │   Chat Input                      │ │
│  │   - Text field                    │ │
│  │   - Send button (disabled while   │ │
│  │     streaming)                    │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘

State Flow:
1. User types message → Local state
2. User clicks send → Optimistic update
3. SSE connection opens → Loading state
4. Chunks arrive → Accumulate in state
5. Stream completes → Revalidate SWR cache
6. Error occurs → Show error, allow retry
```

## Implementation Guide

### Step 1: SSE Hook

Create a reusable hook for SSE connections:

**File**: `apps/frontend/src/hooks/use-sse.ts`

```typescript
import { useState, useCallback, useRef } from 'react';

type SSEEvent = {
  type: 'start' | 'chunk' | 'done' | 'error';
  content?: string;
  messageId?: string;
  message?: string;
};

export function useSSE(url: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(
    (onMessage: (event: SSEEvent) => void) => {
      setIsStreaming(true);
      setError(null);

      const eventSource = new EventSource(url, {
        withCredentials: true,
      });

      eventSource.onmessage = (event) => {
        const data: SSEEvent = JSON.parse(event.data);
        onMessage(data);

        if (data.type === 'done' || data.type === 'error') {
          eventSource.close();
          setIsStreaming(false);

          if (data.type === 'error') {
            setError(data.message || 'Stream error');
          }
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsStreaming(false);
        setError('Connection error');
      };

      eventSourceRef.current = eventSource;
    },
    [url]
  );

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    setIsStreaming(false);
  }, []);

  return { isStreaming, error, connect, disconnect };
}
```

### Step 2: Streaming Message Hook

**File**: `apps/frontend/src/hooks/use-stream-message.ts`

```typescript
import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: string;
};

export function useStreamMessage(chatId: string) {
  const { mutate } = useSWRConfig();
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      setIsStreaming(true);
      setStreamingMessage('');
      setError(null);

      try {
        // Optimistically add user message
        mutate(
          `/api/messages/chat/${chatId}`,
          (current: Message[]) => [
            ...current,
            {
              id: 'temp-user',
              content,
              role: 'user',
              createdAt: new Date().toISOString(),
            },
          ],
          false // Don't revalidate yet
        );

        // Start streaming
        const response = await fetch(`${API_URL}/api/messages/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ chatId, content }),
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let buffer = '';

        while (true) {
          const { done, value } = await reader!.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Process complete lines
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();

            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                setStreamingMessage((prev) => prev + data.content);
              } else if (data.type === 'done') {
                // Stream complete, revalidate to get real messages
                mutate(`/api/messages/chat/${chatId}`);
                setStreamingMessage('');
              } else if (data.type === 'error') {
                setError(data.message);
              }
            }
          }

          // Keep incomplete line in buffer
          buffer = lines[lines.length - 1];
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsStreaming(false);
      }
    },
    [chatId, mutate]
  );

  return {
    sendMessage,
    streamingMessage,
    isStreaming,
    error,
  };
}
```

### Step 3: Chat View Component

**File**: `apps/frontend/src/components/ChatView.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';
import useSWR from 'swr';
import { useStreamMessage } from '@/hooks/use-stream-message';

const fetcher = async (url: string) => {
  const res = await fetch(`${API_URL}${url}`, {
    credentials: 'include',
  });
  return res.json();
};

export function ChatView({ chatId }: { chatId: string }) {
  const [input, setInput] = useState('');

  // Fetch historical messages
  const { data } = useSWR(`/api/messages/chat/${chatId}`, fetcher);
  const messages = data?.data || [];

  // Streaming hook
  const { sendMessage, streamingMessage, isStreaming } =
    useStreamMessage(chatId);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Messages */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming message */}
        {streamingMessage && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingMessage,
              createdAt: new Date().toISOString(),
            }}
            isStreaming
          />
        )}
      </Box>

      {/* Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isStreaming}
            placeholder="Type a message..."
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
          >
            {isStreaming ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function MessageBubble({
  message,
  isStreaming,
}: {
  message: any;
  isStreaming?: boolean;
}) {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        ml: message.role === 'user' ? 'auto' : 0,
        mr: message.role === 'assistant' ? 'auto' : 0,
        maxWidth: '70%',
        bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
      }}
    >
      <Typography>{message.content}</Typography>
      {isStreaming && (
        <Typography variant="caption" color="text.secondary">
          Typing...
        </Typography>
      )}
    </Paper>
  );
}
```

## Key Considerations

### 1. Optimistic Updates

Show user message immediately, before backend confirms:

```typescript
// Add message optimistically
mutate(key, [...messages, userMessage], false);

// After stream completes, revalidate
mutate(key); // Fetches real data from server
```

### 2. Chunk Accumulation

Efficiently append chunks without re-rendering entire message:

```typescript
// ❌ Bad: Creates new string every time
setMessage(message + chunk);

// ✅ Good: Uses functional update
setMessage((prev) => prev + chunk);
```

### 3. Connection Management

Handle reconnection on failure:

```typescript
const MAX_RETRIES = 3;
let retries = 0;

eventSource.onerror = () => {
  if (retries < MAX_RETRIES) {
    retries++;
    reconnect();
  } else {
    setError('Failed after 3 attempts');
  }
};
```

### 4. SWR Cache Integration

Properly update cache after streaming:

```typescript
// 1. Optimistic update (user message)
mutate(key, optimisticData, false);

// 2. During stream: show streaming UI
// (don't mutate cache)

// 3. After stream: revalidate
mutate(key); // Fetches latest from server
```

## Evaluation Criteria

| Category             | Weight | What We Look For                     |
| -------------------- | ------ | ------------------------------------ |
| **State Management** | 40%    | Clean architecture, proper SWR usage |
| **Real-Time UI**     | 30%    | Smooth updates, good UX              |
| **Error Handling**   | 20%    | Robust retry/disconnect logic        |
| **Code Quality**     | 10%    | TypeScript, reusable components      |

## Testing Your Implementation

**Manual Testing:**

1. Open chat view
2. Send message
3. Observe:
   - User message appears immediately
   - "Typing..." indicator shows
   - Assistant response streams in word-by-word
   - Message persists after stream completes

**Edge Cases to Test:**

- Disconnect during streaming
- Send multiple messages quickly
- Very long responses
- Network errors
- Backend errors (500, 429, etc.)

## Deliverables

1. **Working Streaming**: Full implementation with smooth UX
2. **State Management**: Clean hooks architecture
3. **SOLUTION.md**: Architecture explanation, SWR patterns
4. **Error Handling**: Robust error states and retries

## Bonus Points

- 🌟 **Typing Indicator**: Animated "..." while streaming
- 🌟 **Stop Streaming**: Button to cancel mid-stream
- 🌟 **Retry Failed**: Retry button on errors
- 🌟 **Markdown Rendering**: Render markdown in messages
- 🌟 **Code Syntax Highlighting**: Highlight code blocks

## Common Pitfalls

❌ **Memory Leaks**: Not closing EventSource
✅ **Solution**: Close in cleanup function

❌ **Cache Invalidation**: Stale data after stream
✅ **Solution**: Mutate SWR cache correctly

❌ **Poor Performance**: Re-rendering entire list
✅ **Solution**: Optimize with React.memo

---

Good luck! 🎨
