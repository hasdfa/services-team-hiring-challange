'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { BrainIcon } from 'lucide-react';
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
import {
  Message,
  MessageContent,
  MessageAvatar,
} from '@/mui-treasury/components/ai-message';
import type { ChatViewProps, GeneratedFile, ReasoningLevel } from './types';
import { MessageParts, AssistantMessageWithPreview } from './message-parts';

export function ChatView({
  messages = [],
  loading = false,
  status = 'ready',
  error,
  emptyStateTitle = 'No messages yet',
  emptyStateDescription = 'Start a conversation with the MUI assistant',
  onSubmit,
  reasoning: externalReasoning,
  onReasoningChange: externalOnReasoningChange,
  children,
}: ChatViewProps) {
  const [internalReasoning, setInternalReasoning] =
    useState<ReasoningLevel>('low');
  const reasoning = externalReasoning ?? internalReasoning;
  const handleReasoningChange =
    externalOnReasoningChange ?? setInternalReasoning;

  const isSubmitting = status === 'submitted' || status === 'streaming';
  const prevStatusRef = useRef(status);

  // Collect generated files
  const generatedFilesRef = useRef<GeneratedFile[]>([]);

  const handleFileGenerated = useCallback((file: GeneratedFile) => {
    // Check if file already exists to avoid duplicates
    const exists = generatedFilesRef.current.some(
      (f) => f.filePath === file.filePath && f.content === file.content
    );
    if (!exists) {
      generatedFilesRef.current.push(file);
    }
  }, []);

  // Log generated files when streaming completes
  useEffect(() => {
    const wasStreaming =
      prevStatusRef.current === 'streaming' ||
      prevStatusRef.current === 'submitted';
    const isNowReady = status === 'ready';

    if (wasStreaming && isNowReady && generatedFilesRef.current.length > 0) {
      // eslint-disable-next-line no-console
      console.log('Generated files:', generatedFilesRef.current);
      // Reset for next response
      generatedFilesRef.current = [];
    }

    prevStatusRef.current = status;
  }, [status]);

  const handleSubmit = useCallback(
    async (message: { text?: string }) => {
      // Clear previous files when sending new message
      generatedFilesRef.current = [];
      await onSubmit(message);
    },
    [onSubmit]
  );

  return (
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
          {children ? (
            children
          ) : messages.length === 0 && !loading ? (
            <ConversationEmptyState
              title={emptyStateTitle}
              description={emptyStateDescription}
            />
          ) : (
            <>
              {messages.map((msg) => (
                <Message key={msg.id} from={msg.role}>
                  <MessageAvatar
                    name={msg.role === 'user' ? 'You' : 'MUI'}
                    src={msg.role === 'assistant' ? undefined : undefined}
                  />
                  <MessageContent>
                    {msg.role === 'assistant' ? (
                      <AssistantMessageWithPreview
                        message={msg}
                        onFileGenerated={handleFileGenerated}
                        isStreaming={isSubmitting}
                      />
                    ) : (
                      <MessageParts
                        message={msg}
                        onFileGenerated={handleFileGenerated}
                      />
                    )}
                  </MessageContent>
                </Message>
              ))}

              {/* Show error if present */}
              {error && (
                <Box sx={{ px: 2, py: 1 }}>
                  <Chip
                    label={`Error: ${error.message}`}
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                </Box>
              )}
            </>
          )}
        </ConversationContent>
      </Conversation>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputBody>
            <PromptInputTextarea placeholder="Ask the MUI assistant..." />
          </PromptInputBody>
          <PromptInputToolbar>
            <Select
              value={reasoning}
              onChange={(e) =>
                handleReasoningChange(e.target.value as ReasoningLevel)
              }
              size="small"
              variant="standard"
              renderValue={(value) => (
                <div className="flex flex-row items-center justify-start gap-2">
                  <BrainIcon size={16} />
                  <Typography variant="body2">
                    {value[0].toUpperCase() + value.slice(1)}
                  </Typography>
                </div>
              )}
              sx={{
                minWidth: 40,
                borderRadius: 2,
                border: 'none',
                bgcolor: 'transparent',
                fontWeight: 500,
                color: 'text.secondary',
                transition: 'all 0.2s',
                '&:before': {
                  display: 'none !important',
                },
                '&:after': {
                  display: 'none !important',
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  '&:before': {
                    display: 'none !important',
                  },
                  '&:after': {
                    display: 'none !important',
                  },
                },
                '&.Mui-focused': {
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  '&:before': {
                    display: 'none !important',
                  },
                  '&:after': {
                    display: 'none !important',
                  },
                },
                '&.Mui-focused:after': {
                  display: 'none !important',
                },
                '& .MuiSelect-select': {
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 'auto',
                  minWidth: 'auto',
                },
                '& .MuiSelect-icon': {
                  color: 'text.secondary',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    mt: 0.5,
                  },
                },
              }}
            >
              <MenuItem
                disabled
                sx={{ color: 'text.secondary', opacity: 1, cursor: 'default' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Select reasoning
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem
                value="low"
                className="flex flex-row items-center justify-start gap-2"
              >
                <BrainIcon size={16} />
                <Typography variant="body2">Low</Typography>
              </MenuItem>
              <MenuItem
                value="medium"
                className="flex flex-row items-center justify-start gap-2"
              >
                <BrainIcon size={16} />
                <Typography variant="body2">Medium</Typography>
              </MenuItem>
              <MenuItem
                value="high"
                className="flex flex-row items-center justify-start gap-2"
              >
                <BrainIcon size={16} />
                <Typography variant="body2">High</Typography>
              </MenuItem>
            </Select>
            <Box sx={{ flex: 1 }} />
            <PromptInputSubmit
              status={isSubmitting ? 'submitted' : undefined}
            />
          </PromptInputToolbar>
        </PromptInput>
      </Box>
    </Box>
  );
}
