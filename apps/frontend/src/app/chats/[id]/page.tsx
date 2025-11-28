'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  Suspense,
} from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import useSWR from 'swr';
import { ChatLayout } from '@/components/ChatLayout';
import {
  ChatView,
  type FilePartFromBackend,
  type ExtendedUIMessage,
} from '@/components/chat';
import type { Chat } from '@repo/shared/schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const MAX_URL_MESSAGE_LENGTH = 2000;

interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

// Backend message type with parts structure
interface BackendMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: {
    parts: Array<{
      type: 'text' | 'reasoning' | 'tool-call' | 'file';
      text?: string;
      filePath?: string;
      content?: string;
      toolCallId?: string;
      toolName?: string;
      args?: Record<string, unknown>;
      result?: string;
      error?: string;
    }>;
  };
  createdAt: string;
}

/**
 * Fetcher for SWR - converts backend messages to UIMessage format
 */
async function fetchMessages(url: string): Promise<ExtendedUIMessage[]> {
  const response = await fetch(url);
  const result: ApiResponse<BackendMessage[]> = await response.json();

  if (!result.ok) {
    throw new Error('Failed to fetch messages');
  }

  // Reverse to show oldest first, then convert to UIMessage format
  return result.data.reverse().map((msg): ExtendedUIMessage => {
    const parts: ExtendedUIMessage['parts'] = [];

    // Transform each part from backend to frontend format
    msg.content.parts.forEach((part) => {
      if (part.type === 'text' && part.text) {
        parts.push({ type: 'text', text: part.text });
      } else if (part.type === 'reasoning' && part.text) {
        // Map to frontend reasoning format - using unknown then any to bypass type checking
        parts.push({
          type: 'reasoning',
          reasoning: part.text,
        } as unknown as ExtendedUIMessage['parts'][number]);
      } else if (part.type === 'file' && part.filePath && part.content) {
        parts.push({
          type: 'file-from-backend',
          file: {
            id: `${msg.id}-${part.filePath}`,
            filePath: part.filePath,
            content: part.content,
          },
        } as FilePartFromBackend);
      } else if (part.type === 'tool-call') {
        // Store tool call data for UI rendering - using unknown then any to bypass type checking
        parts.push({
          type: 'tool-call',
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args: part.args,
          result: part.result,
          error: part.error,
        } as unknown as ExtendedUIMessage['parts'][number]);
      }
    });

    return {
      id: msg.id,
      role: msg.role,
      parts,
      createdAt: new Date(msg.createdAt),
    };
  });
}

function ChatPageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = params?.id as string;
  const pendingMessage = searchParams.get('message');

  const [reasoning, setReasoning] = useState<'low' | 'medium' | 'high'>(
    'medium'
  );

  // Use ref to access current reasoning in transport without causing re-renders
  const reasoningRef = useRef(reasoning);
  reasoningRef.current = reasoning;

  // Track if we've already sent the pending message to prevent double-send
  const hasSentPendingRef = useRef(false);

  // Fetch initial messages using SWR
  const {
    data: initialMessages,
    isLoading,
    mutate,
  } = useSWR(
    chatId && chatId !== 'new'
      ? `${API_URL}/api/messages/chat/${chatId}`
      : null,
    fetchMessages,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  // Configure useChat with DefaultChatTransport
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${API_URL}/api/messages/send`,
        prepareSendMessagesRequest: ({ messages }) => {
          const lastMessage = messages[messages.length - 1];
          const textPart = lastMessage?.parts?.find(
            (p): p is { type: 'text'; text: string } => p.type === 'text'
          );
          return {
            body: {
              chatId,
              role: 'user',
              content: textPart?.text ?? '',
              options: { reasoningEffort: reasoningRef.current },
            },
          };
        },
      }),
    [chatId]
  );

  // Keep a ref to streaming messages for optimistic update in onFinish
  const streamingMessagesRef = useRef<ExtendedUIMessage[]>([]);

  const {
    messages: streamingMessages,
    sendMessage,
    status,
    error,
  } = useChat({
    id: chatId,
    transport,
    experimental_throttle: 600, // ms
    onFinish: () => {
      // Optimistic update: merge streaming messages into SWR cache immediately
      // This prevents UI flash when streaming ends and before backend refetch completes
      const currentStreamingMessages = streamingMessagesRef.current;
      if (currentStreamingMessages.length > 0) {
        mutate(
          (currentData) => {
            if (!currentData) return currentStreamingMessages;
            // Merge: keep existing messages, add new streaming ones (avoiding duplicates)
            const existingIds = new Set(currentData.map((m) => m.id));
            const newMessages = currentStreamingMessages.filter(
              (m) => !existingIds.has(m.id)
            );
            return [...currentData, ...newMessages];
          },
          { revalidate: true } // Still revalidate to get persisted data with files
        );
      }
    },
  });

  // Keep streaming messages ref in sync
  useEffect(() => {
    streamingMessagesRef.current = streamingMessages as ExtendedUIMessage[];
  }, [streamingMessages]);

  // Combine initial messages with streaming messages
  // When streaming, show streaming messages; otherwise show initial messages
  const messages = useMemo(() => {
    if (status === 'streaming' || status === 'submitted') {
      // During streaming, merge initial messages with streaming ones
      // but avoid duplicates based on role pattern
      const initialIds = new Set(initialMessages?.map((m) => m.id) || []);
      const streamingNew = streamingMessages.filter(
        (m) => !initialIds.has(m.id)
      );
      return [
        ...(initialMessages || []),
        ...streamingNew,
      ] as ExtendedUIMessage[];
    }
    return (initialMessages || []) as ExtendedUIMessage[];
  }, [initialMessages, streamingMessages, status]);

  // Handle pending message from URL (for new chat flow with streaming)
  useEffect(() => {
    if (
      pendingMessage &&
      chatId !== 'new' &&
      !hasSentPendingRef.current &&
      !isLoading
    ) {
      hasSentPendingRef.current = true;

      // Clear the URL param without triggering navigation
      router.replace(`/chats/${chatId}`, { scroll: false });

      // Send the message via useChat to get streaming
      sendMessage({ text: pendingMessage });
    }
  }, [pendingMessage, chatId, isLoading, sendMessage, router]);

  // Handle message submission
  const handleSubmit = useCallback(
    async (message: { text?: string }) => {
      if (!message.text?.trim()) {
        return;
      }

      if (chatId === 'new') {
        // Check message length for URL param limit
        if (message.text.length > MAX_URL_MESSAGE_LENGTH) {
          alert(
            `Message is too long (${message.text.length} characters). ` +
              `Please shorten it to ${MAX_URL_MESSAGE_LENGTH} characters or less to start a new chat.`
          );
          return;
        }

        // Create new chat first
        const chatResponse = await fetch(`${API_URL}/api/chats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: message.text.slice(0, 50) || 'New Chat',
            privacy: 'private',
          }),
        });

        const chatResult: ApiResponse<Chat> = await chatResponse.json();
        if (!chatResult.ok) {
          throw new Error('Failed to create chat');
        }

        const newChatId = chatResult.data.id;

        // Navigate to the new chat with the message in URL params
        // The new page will pick up the message and send it via useChat
        const encodedMessage = encodeURIComponent(message.text);
        router.push(`/chats/${newChatId}?message=${encodedMessage}`);
        return;
      }

      // Send message using useChat for existing chats
      sendMessage({ text: message.text });

      // Refresh the page to update sidebar with latest chat title
      router.refresh();
    },
    [chatId, sendMessage, router]
  );

  return (
    <ChatLayout selectedChatId={chatId}>
      <ChatView
        messages={messages}
        loading={isLoading}
        status={status}
        error={error}
        onSubmit={handleSubmit}
        reasoning={reasoning}
        onReasoningChange={setReasoning}
      />
    </ChatLayout>
  );
}

// Wrap in Suspense for useSearchParams (required by Next.js App Router)
export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <ChatLayout selectedChatId="new">
          <div />
        </ChatLayout>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}
