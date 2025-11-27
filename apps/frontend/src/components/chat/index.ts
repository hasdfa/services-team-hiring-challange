// Main component
export { ChatView } from './ChatView';

// Types
export type {
  ReasoningLevel,
  ChatStatus,
  GeneratedFile,
  LoadedFile,
  WriteFileToolInput,
  FilePartFromBackend,
  ExtendedUIMessage,
  ChatViewProps,
  PreviewFile,
  CodePreviewProps,
} from './types';

// Utils (if needed externally)
export {
  isMainEntryFile,
  extractFilesFromMessage,
  hasPreviewableFiles,
  tryParseToolInput,
  getLanguageFromPath,
} from './utils';

// Preview component
export { CodePreview } from './preview';

// Message parts (if needed externally)
export {
  MessageParts,
  AssistantMessageWithPreview,
  WriteFileToolDisplay,
  LoadedFileDisplay,
  ReasoningDisplay,
  ToolCallDisplay,
} from './message-parts';
