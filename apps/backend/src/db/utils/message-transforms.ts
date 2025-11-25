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

  // Log available properties on result
  console.log('=== StreamTextResult Debug ===');
  console.log('Result keys:', Object.keys(result));
  console.log('Files array length:', files.length);

  // Extract reasoning if available
  const reasoningText = await extractReasoning(result);
  if (reasoningText) {
    console.log('✓ Found reasoning');
    parts.push({ type: 'reasoning', text: reasoningText });
  }

  // Extract tool calls with results
  try {
    // Try to access toolCalls in different ways
    const toolCalls = await result.toolCalls;
    const toolResults = await result.toolResults;

    console.log('Tool calls count:', toolCalls?.length || 0);
    console.log('Tool results count:', toolResults?.length || 0);

    if (toolCalls && toolCalls.length > 0) {
      console.log('✓ Processing tool calls');
      toolCalls.forEach((call, i) => {
        console.log(`  - Tool ${i}: ${call.toolName}`);
        console.log(`    Args:`, JSON.stringify(call.args).substring(0, 100));

        const toolResult = toolResults?.[i];
        console.log(`    Result:`, toolResult?.result ? 'present' : 'none');

        parts.push({
          type: 'tool-call',
          toolCallId: call.toolCallId,
          toolName: call.toolName,
          args: call.args as Record<string, unknown>,
          result: toolResult?.result
            ? String(toolResult.result)
            : undefined,
          error: toolResult?.error
            ? String(toolResult.error)
            : undefined,
        });
      });
    } else {
      console.log('⚠ No tool calls found');
    }
  } catch (error) {
    console.error('❌ Error extracting tool calls:', error);
  }

  // Add final text
  const text = await result.text;
  if (text) {
    console.log('✓ Found text (length:', text.length, ')');
    parts.push({ type: 'text', text });
  }

  // Add files
  if (files.length > 0) {
    console.log('✓ Adding', files.length, 'files');
    files.forEach((file) => {
      console.log(`  - File: ${file.filePath} (${file.content.length} chars)`);
      parts.push({
        type: 'file',
        filePath: file.filePath,
        content: file.content,
      });
    });
  } else {
    console.log('⚠ No files to add');
  }

  console.log('=== Final parts:', parts.map(p => p.type).join(', '), '===');

  return parts;
}
