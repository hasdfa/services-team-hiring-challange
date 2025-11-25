'use client';

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import {
  BrainIcon,
  FileCodeIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  WrenchIcon,
} from 'lucide-react';
import { parse as parsePartialJson } from 'partial-json';
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
import { Response } from '@/mui-treasury/components/ai-response';
import { CodeBlock } from '@/mui-treasury/components/ai-code-block';
import type { UIMessage } from 'ai';

type ReasoningLevel = 'low' | 'medium' | 'high';
type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

export interface GeneratedFile {
  filePath: string;
  content: string;
}

export interface LoadedFile {
  id: string;
  filePath: string;
  content: string;
}

interface WriteFileToolInput {
  filePath?: string;
  content?: string;
}

// Custom part type for files loaded from backend
export interface FilePartFromBackend {
  type: 'file-from-backend';
  file: LoadedFile;
}

// Extended UIMessage with our custom parts
export type ExtendedUIMessage = Omit<UIMessage, 'parts'> & {
  parts: Array<UIMessage['parts'][number] | FilePartFromBackend>;
  createdAt?: Date;
};

interface ChatViewProps {
  messages?: ExtendedUIMessage[];
  loading?: boolean;
  status?: ChatStatus;
  error?: Error;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onSubmit: (message: { text?: string }) => void | Promise<void>;
  reasoning?: ReasoningLevel;
  onReasoningChange?: (reasoning: ReasoningLevel) => void;
  children?: ReactNode;
}

/**
 * Try to parse partial JSON for tool input streaming
 */
function tryParseToolInput(input: unknown): WriteFileToolInput | null {
  if (!input) return null;

  // If it's already an object, return it
  if (typeof input === 'object') {
    return input as WriteFileToolInput;
  }

  // If it's a string, try to parse it as partial JSON
  if (typeof input === 'string') {
    try {
      return parsePartialJson(input) as WriteFileToolInput;
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Get language from file path for syntax highlighting
 */
function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: 'typescript',
    tsx: 'tsx',
    js: 'javascript',
    jsx: 'jsx',
    json: 'json',
    css: 'css',
    scss: 'scss',
    html: 'html',
    md: 'markdown',
    py: 'python',
    go: 'go',
    rs: 'rust',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    yaml: 'yaml',
    yml: 'yaml',
  };
  return langMap[ext || ''] || 'text';
}

/**
 * Component to display write-file tool progress (during streaming)
 */
function WriteFileToolDisplay({
  input,
  state,
}: {
  input: unknown;
  state: string;
}) {
  const parsedInput = tryParseToolInput(input);
  const filePath = parsedInput?.filePath;
  const isComplete = state === 'output-available';
  const hasError = state === 'output-error';

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        my: 1,
        borderRadius: 2,
        bgcolor: hasError
          ? 'error.50'
          : isComplete
            ? 'success.50'
            : 'action.hover',
        borderColor: hasError
          ? 'error.200'
          : isComplete
            ? 'success.200'
            : 'divider',
      }}
    >
      {!isComplete && !hasError ? (
        <CircularProgress size={18} thickness={5} />
      ) : (
        <FileCodeIcon
          size={18}
          style={{
            color: hasError
              ? 'var(--mui-palette-error-main)'
              : 'var(--mui-palette-success-main)',
          }}
        />
      )}
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {hasError
          ? `Failed to write file${filePath ? `: ${filePath}` : ''}`
          : isComplete
            ? `Wrote file: ${filePath || 'unknown'}`
            : filePath
              ? `Writing file: ${filePath}...`
              : 'Writing file...'}
      </Typography>
    </Paper>
  );
}

/**
 * Component to display a file loaded from backend (with expandable code)
 */
function LoadedFileDisplay({ file }: { file: LoadedFile }) {
  const [expanded, setExpanded] = useState(false);
  const language = getLanguageFromPath(file.filePath);

  return (
    <Paper
      variant="outlined"
      sx={{
        my: 1,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'success.200',
      }}
    >
      <Box
        component="button"
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          width: '100%',
          border: 'none',
          bgcolor: 'success.50',
          cursor: 'pointer',
          textAlign: 'left',
          '&:hover': {
            bgcolor: 'success.100',
          },
        }}
      >
        <CheckCircleIcon
          size={18}
          style={{ color: 'var(--mui-palette-success-main)', flexShrink: 0 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
          {file.filePath}
        </Typography>
        <IconButton
          size="small"
          sx={{
            p: 0.5,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <ChevronDownIcon size={16} />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <CodeBlock code={file.content} language={language} />
        </Box>
      </Collapse>
    </Paper>
  );
}

/**
 * Component to display reasoning content (expandable)
 */
function ReasoningDisplay({ content }: { content: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      variant="outlined"
      sx={{
        my: 1,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'primary.200',
        bgcolor: 'primary.50',
      }}
    >
      <Box
        component="button"
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          width: '100%',
          border: 'none',
          bgcolor: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          '&:hover': {
            bgcolor: 'primary.100',
          },
        }}
      >
        <BrainIcon
          size={18}
          style={{ color: 'var(--mui-palette-primary-main)', flexShrink: 0 }}
        />
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, flex: 1, color: 'primary.main' }}
        >
          Reasoning
        </Typography>
        <IconButton
          size="small"
          sx={{
            p: 0.5,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <ChevronDownIcon size={16} />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box
          sx={{
            p: 2,
            maxHeight: 400,
            overflow: 'auto',
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              color: 'text.secondary',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {content}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}

/**
 * Component to display tool call with args and result
 */
function ToolCallDisplay({
  toolName,
  args,
  result,
  error,
}: {
  toolName: string;
  args: Record<string, unknown>;
  result?: string;
  error?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      variant="outlined"
      sx={{
        my: 1,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: error ? 'error.200' : 'info.200',
        bgcolor: error ? 'error.50' : 'info.50',
      }}
    >
      <Box
        component="button"
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          width: '100%',
          border: 'none',
          bgcolor: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          '&:hover': {
            bgcolor: error ? 'error.100' : 'info.100',
          },
        }}
      >
        <WrenchIcon
          size={18}
          style={{
            color: error
              ? 'var(--mui-palette-error-main)'
              : 'var(--mui-palette-info-main)',
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
          Called: {toolName}
        </Typography>
        {error && <Chip label="Error" size="small" color="error" />}
        <IconButton
          size="small"
          sx={{
            p: 0.5,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <ChevronDownIcon size={16} />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Arguments:
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 0.5,
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
            }}
          >
            {JSON.stringify(args, null, 2)}
          </Box>
          {result && (
            <>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, mt: 2, display: 'block' }}
              >
                Result:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {result}
              </Typography>
            </>
          )}
          {error && (
            <>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  mt: 2,
                  display: 'block',
                  color: 'error.main',
                }}
              >
                Error:
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                {error}
              </Typography>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

/**
 * Render message parts including tool invocations and loaded files
 */
function MessageParts({
  message,
  onFileGenerated,
}: {
  message: ExtendedUIMessage;
  onFileGenerated?: (file: GeneratedFile) => void;
}) {
  const reportedFilesRef = useRef<Set<string>>(new Set());

  // Track files that have been completed
  useEffect(() => {
    message.parts.forEach((part) => {
      // Check for write-file tool parts
      if (
        part.type === 'tool-write-file' ||
        ((part.type as string).startsWith('tool-') &&
          (part as any).toolName === 'write-file')
      ) {
        const toolPart = part as any;
        if (toolPart.state === 'output-available' && toolPart.input) {
          const input = tryParseToolInput(toolPart.input);
          if (input?.filePath && input?.content) {
            const fileKey = `${input.filePath}:${input.content.length}`;
            if (!reportedFilesRef.current.has(fileKey)) {
              reportedFilesRef.current.add(fileKey);
              onFileGenerated?.({
                filePath: input.filePath,
                content: input.content,
              });
            }
          }
        }
      }
    });
  }, [message.parts, onFileGenerated]);

  return (
    <>
      {message.parts.map((part, index) => {
        // Handle text parts
        if (part.type === 'text') {
          const textPart = part as { type: 'text'; text: string };
          if (!textPart.text) return null;
          return <Response key={index}>{textPart.text}</Response>;
        }

        // Handle reasoning parts
        if (part.type === 'reasoning') {
          // Reasoning content might be in different properties depending on the SDK version
          const reasoningPart = part as unknown as Record<string, unknown>;
          console.log('part', part);
          const reasoningContent = String(
            reasoningPart.reasoning ||
              reasoningPart.content ||
              reasoningPart.text ||
              ''
          );
          if (!reasoningContent) return null;
          return <ReasoningDisplay key={index} content={reasoningContent} />;
        }

        // Handle tool call parts
        if (part.type === 'tool-call') {
          const toolPart = part as unknown as {
            toolCallId?: string;
            toolName?: string;
            args?: Record<string, unknown>;
            result?: string;
            error?: string;
          };
          if (!toolPart.toolName) return null;
          return (
            <ToolCallDisplay
              key={index}
              toolName={toolPart.toolName}
              args={toolPart.args || {}}
              result={toolPart.result}
              error={toolPart.error}
            />
          );
        }

        // Handle files loaded from backend
        if (part.type === 'file-from-backend') {
          const filePart = part as FilePartFromBackend;
          return <LoadedFileDisplay key={index} file={filePart.file} />;
        }

        // Handle write-file tool parts (during streaming)
        if (
          part.type === 'tool-write-file' ||
          ((part.type as string).startsWith('tool-') &&
            (part as any).toolName === 'write-file')
        ) {
          const toolPart = part as any;
          return (
            <WriteFileToolDisplay
              key={index}
              input={toolPart.input}
              state={toolPart.state}
            />
          );
        }

        // Handle dynamic-tool type for write-file
        if (
          part.type === 'dynamic-tool' &&
          (part as any).toolName === 'write-file'
        ) {
          const toolPart = part as any;
          return (
            <WriteFileToolDisplay
              key={index}
              input={toolPart.input}
              state={toolPart.state}
            />
          );
        }

        return null;
      })}
    </>
  );
}

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
    useState<ReasoningLevel>('medium');
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
                    <MessageParts
                      message={msg}
                      onFileGenerated={handleFileGenerated}
                    />
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
