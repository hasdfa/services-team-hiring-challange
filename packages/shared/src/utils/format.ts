/**
 * Format a date to ISO string
 */
export function formatDate(date: Date): string {
  return date.toISOString();
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Parse code blocks from markdown-style text
 */
export function parseCodeBlocks(text: string): Array<{
  language: string;
  code: string;
  filename?: string;
}> {
  const codeBlockRegex = /```(\w+)(?:\s+(.+?))?\n([\s\S]*?)```/g;
  const blocks: Array<{ language: string; code: string; filename?: string }> =
    [];

  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    blocks.push({
      language: match[1],
      code: match[3].trim(),
      filename: match[2] || undefined,
    });
  }

  return blocks;
}
