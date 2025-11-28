import { parse as parsePartialJson } from 'partial-json';
import type {
  ExtendedUIMessage,
  FilePartFromBackend,
  PreviewFile,
  WriteFileToolInput,
} from './types';

/**
 * Check if file path is a main entry file (src/main.ts/tsx/js/jsx/mjs)
 */
export function isMainEntryFile(filePath: string): boolean {
  return /^src\/main\.(ts|tsx|js|jsx|mjs)$/.test(filePath);
}

/**
 * Extract all files from a message's parts
 */
export function extractFilesFromMessage(
  message: ExtendedUIMessage
): PreviewFile[] {
  const files: PreviewFile[] = [];

  message.parts.forEach((part) => {
    // Files loaded from backend
    if (part.type === 'file-from-backend') {
      const filePart = part as FilePartFromBackend;
      files.push({
        filePath: filePart.file.filePath,
        content: filePart.file.content,
      });
    }
  });

  return files;
}

/**
 * Check if a message has previewable files (contains src/main.*)
 */
export function getEntryFile(files: PreviewFile[]): string | undefined {
  return files.find((file) => isMainEntryFile(file.filePath))?.filePath;
}

/**
 * Try to parse partial JSON for tool input streaming
 */
export function tryParseToolInput(input: unknown): WriteFileToolInput | null {
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
export function getLanguageFromPath(filePath: string): string {
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
