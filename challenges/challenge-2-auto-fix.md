# Challenge 2: Auto-Fix Model Integration 🤖

**Difficulty**: High
**Focus**: Full-Stack, AI Integration, Streaming
**Time**: 4-6 hours

## Problem Statement

Users want an AI assistant that can automatically fix code errors. We need to integrate an LLM-based auto-fix feature into the chat workflow with real-time streaming.

## Your Task

Implement an auto-fix system with these core features:

1. ✅ **LLM Integration**: Call OpenAI/Anthropic/Gemini API for code fixes
2. ✅ **Streaming Responses**: Use Server-Sent Events for real-time updates
3. ✅ **Database Persistence**: Save conversations (user message + AI fix)
4. ✅ **Frontend UI**: Display streaming responses with proper state management
5. ✅ **BONUS**: A/B testing framework to compare multiple models

## Architecture Overview

```
┌──────────┐                 ┌──────────┐                ┌─────────┐
│ Frontend │ ──streaming──▶  │ Backend  │ ──API call──▶  │   LLM   │
│   UI     │ ◀──chunks────   │   SSE    │ ◀─response──   │Provider │
└──────────┘                 └──────────┘                └─────────┘
                                   │
                                   ▼
                             ┌──────────┐
                             │ Database │
                             │ messages │
                             └──────────┘
```

## Requirements

### Part 1: Backend Implementation

#### API Endpoint: `/api/auto-fix`

**File**: `apps/backend/src/routes/auto-fix.ts`

```typescript
POST /api/auto-fix
Headers: {
  'Content-Type': 'application/json',
  'Accept': 'text/event-stream'
}
Body: {
  chatId: string,
  code: string,
  error: string,
  language?: string
}

Response: Server-Sent Events stream
Events:
  data: {"type": "chunk", "content": "Here's the fix..."}
  data: {"type": "chunk", "content": " for your code"}
  data: {"type": "done", "messageId": "msg-123"}
  data: {"type": "error", "message": "API limit exceeded"}
```

#### LLM Integration

Choose ONE provider (or implement multiple for A/B testing):

**OpenAI:**

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: 'You are a code fixing assistant...' },
    { role: 'user', content: `Fix this code:\n${code}\n\nError: ${error}` },
  ],
  stream: true,
});

for await (const chunk of stream) {
  const content = chunk.choices[0]?.delta?.content || '';
  // Send SSE event
}
```

**Anthropic:**

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const stream = await anthropic.messages.stream({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  messages: [
    { role: 'user', content: `Fix this code:\n${code}\n\nError: ${error}` },
  ],
});

for await (const chunk of stream) {
  if (chunk.type === 'content_block_delta') {
    // Send SSE event
  }
}
```

#### Prompt Engineering

Design an effective prompt:

```typescript
const SYSTEM_PROMPT = `You are an expert code fixing assistant.

Your task:
1. Analyze the provided code and error message
2. Identify the root cause
3. Provide a corrected version
4. Explain what was wrong

Format your response as:
## Problem
[Brief explanation]

## Fix
\`\`\`[language]
[corrected code]
\`\`\`

## Explanation
[Why this fixes the issue]

Keep responses concise and focused.`;
```

#### Server-Sent Events Implementation

```typescript
fastify.post('/auto-fix', async (request, reply) => {
  const { chatId, code, error } = request.body;

  // Set SSE headers
  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');

  // Helper to send SSE
  const sendEvent = (data: any) => {
    reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // Save user message
    const userMsg = await db
      .insert(messages)
      .values({
        id: nanoid(),
        chatId,
        role: 'user',
        content: { text: `Fix: ${code}\nError: ${error}` },
      })
      .returning();

    // Stream LLM response
    let fullResponse = '';
    const stream = await getLLMStream(code, error);

    for await (const chunk of stream) {
      fullResponse += chunk;
      sendEvent({ type: 'chunk', content: chunk });
    }

    // Save assistant message
    const assistantMsg = await db
      .insert(messages)
      .values({
        id: nanoid(),
        chatId,
        role: 'assistant',
        content: { text: fullResponse },
      })
      .returning();

    sendEvent({ type: 'done', messageId: assistantMsg[0].id });
  } catch (error) {
    sendEvent({ type: 'error', message: error.message });
  } finally {
    reply.raw.end();
  }
});
```

### Part 2: Frontend Implementation

#### Component: `AutoFixPanel.tsx`

**File**: `apps/frontend/src/components/AutoFixPanel.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

export function AutoFixPanel({ chatId }: { chatId: string }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [response, setResponse] = useState('');

  const handleFix = async () => {
    setStreaming(true);
    setResponse('');

    const eventSource = new EventSource(
      `${API_URL}/api/auto-fix?` +
      new URLSearchParams({ chatId, code, error })
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'chunk') {
        setResponse((prev) => prev + data.content);
      } else if (data.type === 'done') {
        eventSource.close();
        setStreaming(false);
      } else if (data.type === 'error') {
        console.error(data.message);
        eventSource.close();
        setStreaming(false);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setStreaming(false);
    };
  };

  return (
    <Box>
      <TextField
        label="Code"
        multiline
        rows={10}
        fullWidth
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <TextField
        label="Error Message"
        fullWidth
        value={error}
        onChange={(e) => setError(e.target.value)}
        sx={{ mt: 2 }}
      />
      <Button
        variant="contained"
        onClick={handleFix}
        disabled={streaming || !code || !error}
        sx={{ mt: 2 }}
      >
        {streaming ? 'Fixing...' : 'Fix Code'}
      </Button>

      {response && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">AI Fix:</Typography>
          <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {response}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
```

#### Hook: `useStreamFix.ts` (Better Approach)

```typescript
import { useState } from 'react';

export function useStreamFix() {
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamFix = async (chatId: string, code: string, errorMsg: string) => {
    setIsStreaming(true);
    setResponse('');
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auto-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, code, error: errorMsg }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            if (data.type === 'chunk') {
              setResponse((prev) => prev + data.content);
            } else if (data.type === 'error') {
              setError(data.message);
            }
          }
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  };

  return { response, isStreaming, error, streamFix };
}
```

## BONUS: A/B Testing Framework

### Database Schema Extension

Add variant tracking to messages:

```typescript
// apps/backend/src/db/schema/messages.ts
export const messages = pgTable('messages', {
  // ... existing fields
  variant: text('variant'), // 'gpt-4', 'claude-3.5', 'gemini-1.5'
  metadata: jsonb('metadata').$type<{
    model?: string;
    tokens?: number;
    latency?: number;
  }>(),
});
```

### Variant Selection Logic

```typescript
// apps/backend/src/lib/ab-test.ts
const VARIANTS = [
  { id: 'gpt-4', model: 'gpt-4o-mini', weight: 0.4 },
  { id: 'claude', model: 'claude-3-5-sonnet-20241022', weight: 0.4 },
  { id: 'gemini', model: 'gemini-1.5-flash', weight: 0.2 },
];

export function selectVariant(userId: string): Variant {
  // Consistent assignment based on user ID
  const hash = hashString(userId);
  const bucket = hash % 100;

  let cumulative = 0;
  for (const variant of VARIANTS) {
    cumulative += variant.weight * 100;
    if (bucket < cumulative) return variant;
  }

  return VARIANTS[0];
}
```

### Analytics Endpoint

```typescript
GET /api/auto-fix/analytics

Response: {
  ok: true,
  data: {
    variants: [
      {
        id: 'gpt-4',
        totalRequests: 150,
        avgLatency: 2.5,
        avgTokens: 350,
        successRate: 0.95
      },
      // ... other variants
    ]
  }
}
```

## Evaluation Criteria

| Category           | Weight | What We Look For                          |
| ------------------ | ------ | ----------------------------------------- |
| **AI Integration** | 30%    | Correct LLM usage, prompt quality         |
| **Streaming**      | 25%    | Proper SSE implementation, error handling |
| **Full-Stack**     | 25%    | Frontend ↔ Backend integration quality   |
| **A/B Testing**    | 20%    | Framework design (if attempted)           |

## Testing Your Implementation

**Manual Test:**

```bash
# Start backend
pnpm --filter backend dev

# Start frontend
pnpm --filter frontend dev

# Test in browser:
1. Navigate to auto-fix UI
2. Paste buggy code
3. Enter error message
4. Click "Fix Code"
5. Observe streaming response
```

**API Test:**

```bash
curl -N -X POST http://localhost:3001/api/auto-fix \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "test",
    "code": "const x = [1,2,3]; console.log(x[5].toUpperCase());",
    "error": "TypeError: Cannot read property toUpperCase of undefined"
  }'

# Should stream SSE events
```

## Deliverables

1. **Backend**: `/api/auto-fix` endpoint with SSE streaming
2. **Frontend**: Auto-fix UI component with real-time updates
3. **SOLUTION.md**: LLM choice, prompt strategy, streaming architecture
4. **Bonus**: A/B testing implementation and analytics

## Common Pitfalls

❌ Forgetting to set SSE headers
❌ Not handling stream cleanup
❌ Poor error handling (API limits, network issues)
❌ Inefficient prompt engineering
❌ Memory leaks from unclosed streams

---

**API Keys Required**: You'll need an API key from OpenAI, Anthropic, or Google. Use your personal key or request a test key.

Good luck! 🤖
