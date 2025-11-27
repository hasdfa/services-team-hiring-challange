'use client';

import { useEffect, useRef, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { PlayIcon } from 'lucide-react';
import { Response } from '@/mui-treasury/components/ai-response';
import type {
  ExtendedUIMessage,
  FilePartFromBackend,
  GeneratedFile,
} from '../types';
import {
  tryParseToolInput,
  extractFilesFromMessage,
  getEntryFile,
} from '../utils';
import { CodePreview } from '../preview';
import { WriteFileToolDisplay } from './WriteFileToolDisplay';
import { LoadedFileDisplay } from './LoadedFileDisplay';
import { ReasoningDisplay } from './ReasoningDisplay';
import { ToolCallDisplay } from './ToolCallDisplay';

interface MessagePartsProps {
  message: ExtendedUIMessage;
  onFileGenerated?: (file: GeneratedFile) => void;
}

/**
 * Render message parts including tool invocations and loaded files
 */
export function MessageParts({ message, onFileGenerated }: MessagePartsProps) {
  const reportedFilesRef = useRef<Set<string>>(new Set());

  // Track files that have been completed
  useEffect(() => {
    message.parts.forEach((part) => {
      // Check for write-file tool parts
      if (
        part.type === 'tool-write-file' ||
        ((part.type as string).startsWith('tool-') &&
          (part as unknown as { toolName?: string }).toolName === 'write-file')
      ) {
        const toolPart = part as unknown as { input?: unknown; state?: string };
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
            (part as unknown as { toolName?: string }).toolName ===
              'write-file')
        ) {
          const toolPart = part as unknown as {
            input?: unknown;
            state?: string;
          };
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
          (part as unknown as { toolName?: string }).toolName === 'write-file'
        ) {
          const toolPart = part as unknown as {
            input?: unknown;
            state?: string;
          };
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

interface AssistantMessageWithPreviewProps {
  message: ExtendedUIMessage;
  onFileGenerated?: (file: GeneratedFile) => void;
  isStreaming: boolean;
}

/**
 * Component to render an assistant message with optional preview
 */
export function AssistantMessageWithPreview({
  message,
  onFileGenerated,
  isStreaming,
}: AssistantMessageWithPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Extract files from message
  const files = useMemo(() => extractFilesFromMessage(message), [message]);

  // Check if preview is available (has src/main.* file and not streaming)
  const previewEntryFile = !isStreaming && getEntryFile(files);

  return (
    <>
      <MessageParts message={message} onFileGenerated={onFileGenerated} />
      {previewEntryFile && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PlayIcon size={16} />}
            onClick={() => setShowPreview(!showPreview)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            {showPreview ? 'Hide Preview' : 'Preview'}
          </Button>
          {showPreview && (
            <CodePreview
              entryFilePath={previewEntryFile}
              files={files}
              onClose={() => setShowPreview(false)}
            />
          )}
        </Box>
      )}
    </>
  );
}
