import type { UIMessage } from 'ai';
import type { ReactNode } from 'react';

export type ReasoningLevel = 'low' | 'medium' | 'high';
export type ChatStatus = 'submitted' | 'streaming' | 'ready' | 'error';

export interface GeneratedFile {
  filePath: string;
  content: string;
}

export interface LoadedFile {
  id: string;
  filePath: string;
  content: string;
}

export interface WriteFileToolInput {
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

export interface ChatViewProps {
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

// File type for preview
export interface PreviewFile {
  filePath: string;
  content: string;
}

export interface CodePreviewProps {
  entryFilePath: string;
  files: PreviewFile[];
  onClose?: () => void;
}
