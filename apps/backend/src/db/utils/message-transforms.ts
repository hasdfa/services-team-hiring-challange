import type { StreamTextResult, ToolSet } from 'ai';
import type { MessagePart } from '@repo/shared/schemas';

export interface FileData {
  filePath: string;
  content: string;
}

/**
 * Extract reasoning from StreamTextResult
 * Keep it simple - skip if not available, save data as-is
 */
async function extractReasoning(
  result: StreamTextResult<ToolSet, unknown>
): Promise<string | null> {
  try {
    // Try multiple possible property names depending on AI SDK version
    const reasoning = await ((result as any).experimental_reasoning ||
      (result as any).reasoning ||
      null);

    if (!reasoning) return null;

    // Handle array or string format
    if (Array.isArray(reasoning)) {
      return reasoning.join('\n');
    }
    return String(reasoning);
  } catch {
    // Silently skip if reasoning extraction fails
    return null;
  }
}

/**
 * Extract parts from StreamTextResult after streaming completes
 */
export async function buildPartsFromStreamResult(
  result: StreamTextResult<ToolSet, unknown>,
  files: FileData[]
): Promise<MessagePart[]> {
  const parts: MessagePart[] = [];

  // Extract reasoning if available
  const reasoningText = await extractReasoning(result);
  if (reasoningText) {
    parts.push({ type: 'reasoning', text: reasoningText });
  }

  // Extract tool calls with results
  try {
    const toolCalls = await result.toolCalls;
    const toolResults = await result.toolResults;

    // Create a map of tool results by toolCallId for efficient lookup
    // Note: AI SDK v5 uses 'output' for results, not 'result'
    const toolResultsMap = new Map<
      string,
      { output?: unknown; error?: unknown }
    >();
    if (toolResults && Array.isArray(toolResults)) {
      toolResults.forEach((tr: any) => {
        if (tr.toolCallId) {
          toolResultsMap.set(tr.toolCallId, {
            output: tr.output,
            error: tr.error,
          });
        }
      });
    }

    if (toolCalls && toolCalls.length > 0) {
      toolCalls.forEach((call) => {
        // AI SDK v5 uses 'input' for args, not 'args'
        const toolInput =
          (call as unknown as { input?: unknown; args?: unknown }).input ??
          (call as unknown as { args?: unknown }).args ??
          {};

        // Match tool result by toolCallId
        const toolResult = toolResultsMap.get(call.toolCallId);

        parts.push({
          type: 'tool-call',
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          args: toolInput as Record<string, unknown>,
          result: toolResult?.output ? String(toolResult.output) : undefined,
          error: toolResult?.error ? String(toolResult.error) : undefined,
        });
      });
    }
  } catch (error) {
    console.error('Error extracting tool calls:', error);
  }

  // Add final text
  const text = await result.text;
  if (text) {
    parts.push({ type: 'text', text });
  }

  // Add files
  if (files.length > 0) {
    files.forEach((file) => {
      parts.push({
        type: 'file',
        filePath: file.filePath,
        content: file.content,
      });
    });
  }

  return parts;
}
