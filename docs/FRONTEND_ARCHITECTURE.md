# Frontend Architecture

## Overview

The frontend is a **Next.js 15** application using the App Router, running on **port 3000**. It provides a chat interface for interacting with the MUI Assistant AI, featuring real-time streaming responses and live code previews.

## Technology Stack

| Technology          | Version | Purpose                          |
| ------------------- | ------- | -------------------------------- |
| Next.js             | 15.x    | React framework with App Router  |
| React               | 19.x    | UI library                       |
| Material-UI         | 7.x     | Component library                |
| Vercel AI SDK React | 5.x     | Chat hooks and streaming         |
| SWR                 | 2.x     | Data fetching and caching        |
| Tailwind CSS        | 4.x     | Utility styling                  |
| TypeScript          | 5.8.x   | Type safety                      |
| esbuild-browser     | 1.1.0   | In-browser bundling for previews |

## Directory Structure

```
apps/frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   ├── page.tsx                  # Homepage (redirects to /chats/new)
│   │   ├── theme.tsx                 # MUI theme wrapper
│   │   └── chats/
│   │       └── [id]/
│   │           └── page.tsx          # Chat page with streaming
│   ├── components/
│   │   ├── ChatLayout.tsx            # Main layout with sidebars
│   │   ├── chat/
│   │   │   ├── index.ts              # Chat exports
│   │   │   ├── ChatView.tsx          # Chat message display
│   │   │   ├── types.ts              # TypeScript types
│   │   │   ├── utils.ts              # Utility functions
│   │   │   ├── sw.ts                 # Service worker registration
│   │   │   ├── message-parts/
│   │   │   │   ├── index.ts
│   │   │   │   ├── MessageParts.tsx      # Render message parts
│   │   │   │   ├── LoadedFileDisplay.tsx # Display loaded files
│   │   │   │   ├── ReasoningDisplay.tsx  # Display AI reasoning
│   │   │   │   ├── ToolCallDisplay.tsx   # Display tool calls
│   │   │   │   └── WriteFileToolDisplay.tsx # Display file writes
│   │   │   └── preview/
│   │   │       ├── index.ts
│   │   │       ├── CodePreview.tsx   # Live code preview component
│   │   │       ├── files.ts          # Preview file templates
│   │   │       ├── upload.ts         # File upload to service worker
│   │   │       └── message-target.ts # Service worker messaging
│   │   ├── ai-elements/
│   │   │   └── message.tsx           # AI message component
│   │   └── ui/                       # Reusable UI components
│   ├── mui-treasury/
│   │   ├── components/               # Custom AI chat components
│   │   │   ├── ai-conversation/      # Chat container
│   │   │   ├── ai-prompt-input/      # Message input form
│   │   │   ├── ai-message/           # Message display
│   │   │   ├── ai-response/          # Markdown response renderer
│   │   │   └── [20+ more components]
│   │   └── theme/                    # Custom MUI theme
│   │       ├── index.ts
│   │       ├── theme.tsx             # Theme creation
│   │       ├── colors.ts             # Color schemes
│   │       ├── typography.ts         # Typography config
│   │       ├── shadows.ts            # Shadow definitions
│   │       └── components/           # Component overrides
│   ├── hooks/                        # Custom React hooks
│   ├── lib/
│   │   └── utils.ts                  # Utility functions
│   └── globals.css                   # Global styles
├── public/
│   ├── service-worker.js             # Preview service worker
│   └── esbuild-browser/              # esbuild WASM files
└── package.json
```

## Routing

The application uses Next.js App Router with the following routes:

| Route         | Component             | Description               |
| ------------- | --------------------- | ------------------------- |
| `/`           | `page.tsx`            | Redirects to `/chats/new` |
| `/chats/new`  | `chats/[id]/page.tsx` | New chat (empty state)    |
| `/chats/[id]` | `chats/[id]/page.tsx` | Chat conversation with ID |

### Route Parameters

- **`[id]`**: Chat ID or "new" for creating a new chat
- **`?message=`**: URL parameter for pending message (used in new chat flow)

## Component Hierarchy

```
RootLayout
└── AppTheme (MUI ThemeProvider)
    └── ChatPage
        └── ChatLayout
            ├── Left Drawer (Chat List)
            │   ├── New Chat Button
            │   └── Chat List Items
            ├── Main Content
            │   └── ChatView
            │       ├── Conversation
            │       │   └── ConversationContent
            │       │       └── Message[]
            │       │           ├── MessageAvatar
            │       │           └── MessageContent
            │       │               └── MessageParts / AssistantMessageWithPreview
            │       │                   ├── Response (text/markdown)
            │       │                   ├── ReasoningDisplay
            │       │                   ├── ToolCallDisplay
            │       │                   ├── LoadedFileDisplay
            │       │                   └── CodePreview (optional)
            │       └── PromptInput
            │           ├── PromptInputBody
            │           │   └── PromptInputTextarea
            │           └── PromptInputToolbar
            │               ├── Reasoning Select
            │               └── PromptInputSubmit
            └── Right Drawer (Files - placeholder)
```

## Key Components

### ChatLayout

Main application layout with responsive sidebars.

**Features:**

- Left sidebar: Chat list with CRUD operations
- Right sidebar: Files panel (placeholder)
- Responsive: Permanent drawers on `md+`, temporary on mobile
- Toggleable panels via toolbar icons

**Props:**

```typescript
interface ChatLayoutProps {
  children: React.ReactNode;
  selectedChatId?: string | null;
  onChatSelect?: (chatId: string | null) => void;
}
```

### ChatView

Main chat interface displaying messages and input.

**Features:**

- Message list with auto-scroll to bottom
- Streaming status handling
- Error display
- Reasoning level selector

**Props:**

```typescript
interface ChatViewProps {
  messages?: ExtendedUIMessage[];
  loading?: boolean;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  error?: Error;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onSubmit: (message: { text?: string }) => void | Promise<void>;
  reasoning?: 'low' | 'medium' | 'high';
  onReasoningChange?: (reasoning: ReasoningLevel) => void;
  children?: ReactNode;
}
```

### MessageParts

Renders different message part types.

**Supported Part Types:**

- `text`: Rendered via `Response` component (Streamdown markdown)
- `reasoning`: Collapsible AI reasoning display
- `tool-call`: Tool invocation with args and results
- `file-from-backend`: Files loaded from database
- `tool-write-file`: Files being streamed (during streaming)

### AssistantMessageWithPreview

Wrapper that adds live preview capability to assistant messages.

**Features:**

- Extracts files from message parts
- Shows "Preview" button when `src/main.*` file exists
- Renders `CodePreview` component on demand

### CodePreview

In-browser React component preview using esbuild-browser.

**Build Pipeline:**

1. Initialize esbuild worker
2. Install dependencies via Sandpack CDN
3. Bundle with esbuild (ESM, code splitting)
4. Upload to service worker
5. Render in sandboxed iframe

**States:**

- `idle`: Preparing build
- `installing`: Installing npm packages
- `building`: Bundling with esbuild
- `uploading`: Sending to service worker
- `finished`: Showing iframe
- `error`: Displaying build errors

## MUI Treasury Components

Custom AI chat components in `mui-treasury/components/`:

### ai-conversation

Container for chat messages with auto-scroll.

```typescript
<Conversation>
  <ConversationContent>
    {/* Messages */}
  </ConversationContent>
  <ConversationScrollButton />
</Conversation>
```

Uses `use-stick-to-bottom` for scroll behavior.

### ai-prompt-input

Form for composing messages with attachments.

```typescript
<PromptInput onSubmit={handleSubmit}>
  <PromptInputAttachments>
    {(file) => <PromptInputAttachment data={file} />}
  </PromptInputAttachments>
  <PromptInputBody>
    <PromptInputTextarea placeholder="..." />
  </PromptInputBody>
  <PromptInputToolbar>
    <PromptInputActionMenu>...</PromptInputActionMenu>
    <PromptInputSubmit status={status} />
  </PromptInputToolbar>
</PromptInput>
```

**Features:**

- File attachments with drag-and-drop
- Enter to submit, Shift+Enter for newline
- Status-aware submit button

### ai-message

Message container with role-based styling.

```typescript
<Message from="user | assistant">
  <MessageAvatar name="..." src="..." />
  <MessageContent variant="contained | flat">
    {/* Content */}
  </MessageContent>
</Message>
```

### ai-response

Markdown renderer using Streamdown.

```typescript
<Response>{markdownContent}</Response>
```

Handles streaming markdown with proper list indentation.

## State Management

### useChat Hook (Vercel AI SDK)

Primary state management for chat streaming.

```typescript
const {
  messages: streamingMessages,
  sendMessage,
  status,
  error,
} = useChat({
  id: chatId,
  transport: new DefaultChatTransport({
    api: `${API_URL}/api/messages/send`,
    prepareSendMessagesRequest: ({ messages }) => ({
      body: {
        chatId,
        role: 'user',
        content:
          messages[messages.length - 1]?.parts?.find((p) => p.type === 'text')
            ?.text ?? '',
        options: { reasoningEffort: reasoning },
      },
    }),
  }),
  experimental_throttle: 600,
  onFinish: () => {
    // Merge streaming messages into SWR cache
  },
});
```

### SWR for Data Fetching

Used for initial message loading and cache management.

```typescript
const {
  data: initialMessages,
  isLoading,
  mutate,
} = useSWR(
  chatId !== 'new' ? `${API_URL}/api/messages/chat/${chatId}` : null,
  fetchMessages,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  }
);
```

### Message State Flow

```
┌─────────────────┐     ┌──────────────────┐
│   SWR Cache     │────▶│  initialMessages │
│ (persisted data)│     │     (loaded)     │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ▼
┌─────────────────┐     ┌──────────────────┐
│    useChat      │────▶│ streamingMessages│
│ (streaming data)│     │   (live stream)  │
└─────────────────┘     └────────┬─────────┘
                                 │
                                 ▼
                        ┌──────────────────┐
                        │    Combined      │
                        │    messages      │
                        │  (display array) │
                        └──────────────────┘
```

**Merge Logic:**

1. During streaming: Combine initial + new streaming messages
2. On finish: Optimistic update to SWR cache, then revalidate

## Live Preview System

### Architecture

```
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  CodePreview  │───▶│ esbuild-      │───▶│ Service       │
│  Component    │    │ browser       │    │ Worker        │
└───────────────┘    │ (WASM)        │    └───────────────┘
                     └───────────────┘           │
                            │                    ▼
                     ┌──────▼──────┐     ┌───────────────┐
                     │  Sandpack   │     │   Iframe      │
                     │  CDN        │     │  /__build/    │
                     │  (packages) │     │  {buildId}/   │
                     └─────────────┘     └───────────────┘
```

### Build Process

1. **Worker Initialization:**

   ```typescript
   const worker = await initEsbuildWorker({
     workerUrl: '/esbuild-browser/{version}/worker.js',
     esbuildVersion: '0.27.0',
   });
   ```

2. **Dependency Installation:**

   ```typescript
   await worker.npm__install({
     rawFiles: {
       'index.html': indexhtml,
       'package.json': packageJson,
       ...generatedFiles,
     },
     registryBaseUrl: SANDPACK_CDN_URL,
   });
   ```

3. **Bundling:**

   ```typescript
   const result = await worker.esbuild__bundle({
     entryPoints: ['index.html', 'src/main.tsx'],
     outdir: '/dist',
     format: 'esm',
     bundle: true,
     splitting: true,
     sourcemap: true,
   });
   ```

4. **Upload to Service Worker:**

   ```typescript
   await uploadFiles(sw, {
     projectId: buildId,
     files: outputFiles,
   });
   ```

5. **Render:**
   ```typescript
   <iframe
     src={`/__build/${buildId}/`}
     sandbox="allow-scripts allow-same-origin"
   />
   ```

### Preview Dependencies

Default packages available in preview (from `files.ts`):

- react: 19.1.0
- react-dom: 19.1.0
- @mui/material: 7.3.5
- @mui/icons-material: 7.3.5
- @emotion/react: 11.14.0
- @emotion/styled: 11.14.1

## Data Flow

### New Chat Flow

```
User types message
        │
        ▼
┌───────────────────┐
│ POST /api/chats   │  Create chat
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Navigate to       │  /chats/{id}?message=...
│ /chats/{id}       │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ useEffect picks   │  Send pending message
│ up ?message param │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ useChat.sendMessage│ Start streaming
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ Stream renders    │  Real-time updates
│ in UI             │
└───────────────────┘
```

### Message Streaming Flow

```
┌──────────────┐     POST /api/messages/send
│  PromptInput │────────────────────────────▶ Backend
│   onSubmit   │                                  │
└──────────────┘                                  │
       │                                          │
       │ sendMessage()                            │
       │                                          │
       ▼                                          ▼
┌──────────────┐                         ┌──────────────┐
│   useChat    │◀────── SSE Stream ──────│  AI Agent    │
│   hook       │                         │  Response    │
└──────────────┘                         └──────────────┘
       │
       │ streamingMessages
       │ (throttled 600ms)
       ▼
┌──────────────┐
│  Message     │
│  Rendering   │
│  - Text      │
│  - Reasoning │
│  - Tool calls│
│  - Files     │
└──────────────┘
       │
       │ onFinish
       ▼
┌──────────────┐
│  SWR mutate  │  Optimistic update + revalidate
└──────────────┘
```

## Type Definitions

### ExtendedUIMessage

Extended UI message with custom parts:

```typescript
type ExtendedUIMessage = Omit<UIMessage, 'parts'> & {
  parts: Array<UIMessage['parts'][number] | FilePartFromBackend>;
  createdAt?: Date;
};

interface FilePartFromBackend {
  type: 'file-from-backend';
  file: LoadedFile;
}

interface LoadedFile {
  id: string;
  filePath: string;
  content: string;
}
```

### ChatStatus

```typescript
type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';
```

### ReasoningLevel

```typescript
type ReasoningLevel = 'low' | 'medium' | 'high';
```

## Theme System

The application uses a custom MUI theme defined in `mui-treasury/theme/`:

### Theme Configuration

```typescript
const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
    cssVarPrefix: 'plus',
  },
  colorSchemes: colors,
  shape: { borderRadius: 8 },
  components: {
    /* component overrides */
  },
  typography,
  shadows,
});
```

### Component Overrides

Custom styling for:

- Buttons
- Text fields
- Selects
- Menus
- Tables
- Cards
- Dialogs
- Date pickers
- Data grid
- Tree view
- And more...

## Environment Variables

| Variable                       | Description               | Default               |
| ------------------------------ | ------------------------- | --------------------- |
| `NEXT_PUBLIC_API_URL`          | Backend API URL           | http://localhost:3001 |
| `NEXT_PUBLIC_SANDPACK_CDN_URL` | Sandpack CDN for previews | (required)            |

## Running the Frontend

```bash
# Development
pnpm --filter frontend dev

# Production build
pnpm --filter frontend build

# Start production server
pnpm --filter frontend start

# Type checking
pnpm --filter frontend typecheck

# Linting
pnpm --filter frontend lint
```
