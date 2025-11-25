'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ChatLayout } from '@/components/ChatLayout';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/mui-treasury/components/ai-conversation';
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
} from '@/mui-treasury/components/ai-prompt-input';
import Box from '@mui/material/Box';
import { useState, useCallback } from 'react';
import type { Message as MessageType } from '@repo/shared/schemas';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  ok: boolean;
  data: T;
}

// Chat type matching backend response (without authorId)
interface Chat {
  id: string;
  title: string;
  privacy: 'private' | 'unlisted' | 'public';
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Redirect to /chats/new on mount
  useEffect(() => {
    router.push('/chats/new');
  }, [router]);

  // Handle message submission - creates chat and sends first message
  const handleSubmit = useCallback(
    async (message: { text?: string; files?: any[] }) => {
      if (!message.text?.trim()) {
        return;
      }

      setSubmitting(true);
      try {
        // Create new chat
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

        // Send user message
        const messageResponse = await fetch(`${API_URL}/api/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatId: chatResult.data.id,
            role: 'user',
            content: message.text,
          }),
        });

        const messageResult: ApiResponse<MessageType> =
          await messageResponse.json();
        if (messageResult.ok) {
          // Navigate to the new chat
          router.push(`/chats/${chatResult.data.id}`);
        }
      } catch (error) {
        console.error('Failed to create chat and send message:', error);
      } finally {
        setSubmitting(false);
      }
    },
    [router]
  );

  return (
    <ChatLayout>
      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Conversation>
          <ConversationContent>
            <ConversationEmptyState
              title="New Chat"
              description="Start a conversation with the MUI assistant"
            />
          </ConversationContent>
        </Conversation>
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea placeholder="Ask the MUI assistant..." />
            </PromptInputBody>
            <PromptInputToolbar>
              <Box sx={{ flex: 1 }} />
              <PromptInputSubmit
                status={submitting ? 'submitted' : undefined}
              />
            </PromptInputToolbar>
          </PromptInput>
        </Box>
      </Box>
    </ChatLayout>
  );
}
