# Backend Architecture

## Overview

The backend is a **Fastify 5** server written in TypeScript, running on **port 3001**. It provides a REST API for chat management and integrates with AI models via the Vercel AI SDK to power the MUI Assistant chatbot.

## Technology Stack

| Technology    | Version | Purpose                       |
| ------------- | ------- | ----------------------------- |
| Fastify       | 5.x     | HTTP server framework         |
| Drizzle ORM   | 0.43.x  | Database ORM with type safety |
| PostgreSQL    | 16      | Primary database              |
| Zod           | 4.x     | Schema validation             |
| Vercel AI SDK | 5.x     | LLM integration and streaming |
| TypeScript    | 5.8.x   | Type safety                   |
| Handlebars    | 4.x     | Prompt templating             |

## Directory Structure

```
apps/backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── server.ts             # Fastify server configuration
│   ├── ai/
│   │   ├── index.ts          # AI exports
│   │   ├── models.ts         # LLM model configuration
│   │   └── agents/
│   │       └── mui-assistant/
│   │           ├── index.ts  # Agent implementation
│   │           ├── prompt.ts # Prompt builder
│   │           ├── prompt.hbs# System prompt template
│   │           └── tools/
│   │               ├── search-docs.ts  # Documentation search tool
│   │               └── write-file.ts   # File generation tool
│   ├── db/
│   │   ├── index.ts          # Database connection
│   │   ├── schema/
│   │   │   └── index.ts      # Drizzle schema definitions
│   │   └── utils/
│   │       └── message-transforms.ts  # Stream-to-storage transforms
│   ├── lib/
│   │   └── errors.ts         # Custom error classes
│   └── routes/
│       ├── index.ts          # Route registration
│       ├── chats.ts          # Chat CRUD endpoints
│       └── messages.ts       # Message and AI streaming endpoints
├── drizzle/
│   └── *.sql                 # Database migrations
├── drizzle.config.ts         # Drizzle configuration
└── package.json
```

## Database Schema

The database uses PostgreSQL with two main tables:

### Chats Table

```sql
CREATE TABLE "chats" (
  "id" text PRIMARY KEY NOT NULL,
  "title" text NOT NULL,
  "privacy" "chat_privacy" DEFAULT 'private' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
```

**Fields:**

- `id`: Unique identifier (nanoid)
- `title`: Chat title (max 200 chars)
- `privacy`: Enum - 'private', 'unlisted', 'public'
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update (auto-updated)

### Chat Messages Table

```sql
CREATE TABLE "chat_messages" (
  "id" text PRIMARY KEY NOT NULL,
  "chat_id" text NOT NULL REFERENCES "chats"("id") ON DELETE CASCADE,
  "role" "message_role" NOT NULL,
  "content" jsonb NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

**Fields:**

- `id`: Unique identifier (nanoid)
- `chat_id`: Foreign key to chats table
- `role`: Enum - 'user' or 'assistant'
- `content`: JSONB containing message parts
- `created_at`: Timestamp of creation

### Message Content Structure

The `content` field stores a JSONB object with a `parts` array:

```typescript
interface MessageContent {
  parts: MessagePart[];
}

type MessagePart =
  | { type: 'text'; text: string }
  | { type: 'reasoning'; text: string }
  | {
      type: 'tool-call';
      toolCallId: string;
      toolName: string;
      args: Record<string, unknown>;
      result?: string;
      error?: string;
    }
  | { type: 'file'; filePath: string; content: string };
```

## API Routes

All routes are prefixed with `/api`.

### Health Check

```
GET /health
```

Returns server status and timestamp.

### Chats Routes (`/api/chats`)

| Method | Endpoint | Description                           |
| ------ | -------- | ------------------------------------- |
| GET    | `/`      | List all chats (ordered by updatedAt) |
| GET    | `/:id`   | Get single chat by ID                 |
| POST   | `/`      | Create new chat                       |
| PATCH  | `/:id`   | Update chat (title, privacy)          |
| DELETE | `/:id`   | Delete chat (cascades to messages)    |

**Create Chat Request:**

```json
{
  "title": "string (required, 1-200 chars)",
  "privacy": "private | unlisted | public (optional, default: private)"
}
```

### Messages Routes (`/api/messages`)

| Method | Endpoint        | Description                                |
| ------ | --------------- | ------------------------------------------ |
| GET    | `/chat/:chatId` | Get all messages for a chat                |
| POST   | `/send`         | Send message and get AI streaming response |

**Send Message Request:**

```json
{
  "chatId": "string (required)",
  "role": "user",
  "content": "string (required)",
  "options": {
    "reasoningEffort": "low | medium | high (optional, default: low)"
  }
}
```

**Response:** Server-Sent Events (SSE) stream in UI Message format.

## AI Agent System

### MUI Assistant Agent

The MUI Assistant is a specialized AI agent for helping users build Material-UI components. It uses the Vercel AI SDK's `streamText` function with tool support.

**Location:** `src/ai/agents/mui-assistant/`

**Key Features:**

- System prompt loaded from Handlebars template
- Streaming responses via `createUIMessageStream`
- Tool execution during response generation
- Automatic message persistence on completion

**Agent Configuration:**

```typescript
streamText({
  model: defaultModel,  // Claude Haiku 4.5 via Vercel AI Gateway
  messages: [...],
  stopWhen: stepCountIs(20),  // Max 20 tool steps
  maxRetries: 5,
  temperature: 0.7,
  maxOutputTokens: 10000,
  tools: {
    'search-docs': searchDocs,
    'write-file': writeFileTool,
  },
  providerOptions: {
    openai: {
      reasoningEffort: 'low' | 'medium' | 'high',
      reasoningSummary: 'detailed',
    },
  },
});
```

### Available Tools

#### 1. Search Docs Tool (`search-docs`)

Searches MUI documentation via Context7 API.

**Parameters:**

- `library`: One of 'material-ui-v7', 'mui-x-data-grid-v8', 'mui-x-date-pickers-v8', 'mui-x-charts-v8', 'mui-x-tree-view-v8'
- `topic`: Optional search topic
- `page`: Pagination (default: 1)

**Returns:** Documentation content as text.

#### 2. Write File Tool (`write-file`)

Creates files for code generation. Files are streamed to the frontend and persisted to database.

**Parameters:**

- `filePath`: Relative file path (e.g., 'src/components/Button.tsx')
- `content`: File content

**Behavior:**

- Stores file in memory during streaming
- Streams `data-file` event to frontend
- Files saved to database after stream completion

### System Prompt

The system prompt (`prompt.hbs`) instructs the assistant to:

1. Analyze component requirements
2. Use MUI v7 components and patterns
3. Create functional TypeScript components
4. Always generate two files: component + entry point (`src/main.tsx`)
5. Follow accessibility and responsive design practices

## Message Transform Layer

The `message-transforms.ts` module converts streaming responses to persistent storage format.

### `buildPartsFromStreamResult(result, files)`

Extracts all parts from a completed stream:

1. **Reasoning**: Extracts `experimental_reasoning` if available
2. **Tool Calls**: Maps tool calls with their results
3. **Text**: Final response text
4. **Files**: Generated files from write-file tool

**Output Format:**

```typescript
[
  { type: 'reasoning', text: '...' },
  { type: 'tool-call', toolCallId: '...', toolName: '...', args: {...}, result: '...' },
  { type: 'text', text: '...' },
  { type: 'file', filePath: '...', content: '...' }
]
```

## Data Flow

### Request Lifecycle

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Fastify    │────▶│  PostgreSQL │
│   (fetch)   │     │   Server     │     │  (Drizzle)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  MUI Agent   │
                    │  (AI SDK)    │
                    └──────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Context7 │ │  Write   │ │   LLM    │
        │   API    │ │  Files   │ │ (Claude) │
        └──────────┘ └──────────┘ └──────────┘
```

### Message Send Flow

1. **Client Request:** POST `/api/messages/send` with chat ID and message
2. **Validation:** Zod schema validates request body
3. **User Message Storage:** Save user message to database
4. **Context Loading:** Fetch last 10 messages for context
5. **Agent Execution:**
   - Create UI message stream
   - Execute `streamText` with tools
   - Stream response to client
6. **Tool Execution:** Agent may call `search-docs` or `write-file`
7. **Stream Completion:**
   - `onFinish` callback triggers
   - Build parts from stream result
   - Save assistant message with all parts to database
8. **Client Receives:** SSE stream with text deltas, tool calls, and file data

## Error Handling

### ResponseError Class

Custom error class for API responses:

```typescript
class ResponseError extends Error {
  constructor(
    message: string,
    statusCode: number = 500,
    data?: Record<string, unknown>
  );

  toJSON(): {
    ok: false;
    message: string;
    statusCode: number;
    data?: Record<string, unknown>;
  };
}
```

### Error Handler

The Fastify error handler:

1. Catches `ResponseError` instances and returns appropriate status
2. Logs other errors and returns 500 with generic message

## Environment Variables

| Variable                    | Description           | Default                    |
| --------------------------- | --------------------- | -------------------------- |
| `PORT`                      | Server port           | 3001                       |
| `HOST`                      | Server host           | localhost                  |
| `POSTGRES_HOST`             | Database host         | localhost                  |
| `POSTGRES_PORT`             | Database port         | 5432                       |
| `POSTGRES_USER`             | Database user         | postgres                   |
| `POSTGRES_PASSWORD`         | Database password     | postgres                   |
| `POSTGRES_DB`               | Database name         | muiassistant               |
| `VERCEL_AI_GATEWAY_API_KEY` | AI Gateway key        | (required)                 |
| `CONTEXT7_API_KEY`          | Context7 API key      | (required for search-docs) |
| `FRONTEND_URL`              | Frontend URL for CORS | http://localhost:3000      |

## Running the Backend

```bash
# Development (with hot reload)
pnpm --filter backend dev

# Database migrations
pnpm db:migrate

# Database studio (GUI)
pnpm db:studio

# Production build
pnpm --filter backend build
pnpm --filter backend start
```
