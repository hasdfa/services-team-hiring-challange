import type { StreamTextResult, ToolSet } from 'ai';
import { streamText, createUIMessageStream, type ModelMessage } from 'ai';
import { defaultModel } from '../../models.js';
import { makeSystemPrompt } from './prompt.js';
import { searchDocs } from './tools/search-docs.js';
import { createWriteFileTool, type FileData } from './tools/write-file.js';

/**
 * MUI Assistant Agent
 *
 * A specialized AI agent for helping with Material-UI related questions and tasks.
 * Uses Vercel AI Gateway to access various LLM models.
 */

export interface GenerateResponseResult {
  stream: ReturnType<typeof createUIMessageStream>;
  files: FileData[];
}

/**
 * Generate a streaming response using the MUI Assistant agent
 *
 * @param messages - Array of conversation messages
 * @returns Object containing the UI message stream and collected files
 */
export async function generateResponse(
  messages: ModelMessage[],
  options?: {
    reasoningEffort?: 'low' | 'medium' | 'high';
  },
  callbacks?: {
    onFinish?: (
      result: StreamTextResult<ToolSet, unknown>,
      files: FileData[]
    ) => void;
  }
): Promise<GenerateResponseResult> {
  try {
    const systemPrompt = makeSystemPrompt({});

    // Array to collect files created during the stream
    const files: FileData[] = [];
    let result: StreamTextResult<ToolSet, unknown>;

    const stream = createUIMessageStream({
      async execute({ writer }) {
        // Create tools with the writer and files collection
        const writeFileTool = createWriteFileTool({ writer, files });

        // Stream text with tools
        const streamResult = streamText({
          model: defaultModel,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...messages,
          ],
          maxRetries: 5,
          temperature: 0.7,
          maxOutputTokens: 1000,
          tools: {
            'search-docs': searchDocs,
            'write-file': writeFileTool,
          },
          providerOptions: {
            openai: {
              reasoningEffort: options?.reasoningEffort ?? 'low',
              reasoningSummary: 'detailed',
            },
          },
        });

        // Merge the stream into the UI message stream
        writer.merge(streamResult.toUIMessageStream());
        result = streamResult as unknown as StreamTextResult<ToolSet, unknown>;
      },
      onError: (error) => {
        return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      },
      onFinish: () => {
        callbacks?.onFinish?.(result, files);
      },
    });

    return {
      stream,
      files,
    };
  } catch (error) {
    // Re-throw with more context
    throw new Error(
      `Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * MUI Assistant agent instance
 * Can be extended with tools and more advanced features in the future
 */
export const muiAssistant = {
  generateResponse,
};
