import { tool } from 'ai';
import type { UIMessageStreamWriter, UIMessage } from 'ai';
import z from 'zod';

export interface FileData {
  filePath: string;
  content: string;
}

interface Params {
  writer: UIMessageStreamWriter<UIMessage>;
  files: FileData[];
}

const writeFileSchema = z.object({
  filePath: z
    .string()
    .describe('The path of the file to write to (relative to workspace root)'),
  content: z.string().describe('The content to write into the file'),
});

type WriteFileParams = z.infer<typeof writeFileSchema>;

/**
 * Creates a write file tool that stores files in memory
 * and streams status updates through the UI message writer.
 * Files are collected and can be saved to the database after streaming completes.
 */
export function createWriteFileTool({ writer, files }: Params) {
  return tool({
    description:
      'Write content to a file at the specified path. Use this tool to create or update files in the workspace. Files are stored temporarily and will be saved to the database after the response completes.',
    inputSchema: writeFileSchema,
    execute: async (params: WriteFileParams) => {
      const { filePath, content } = params;

      try {
        console.log('Writing file:', filePath);
        console.log('Content:', content);
        // Store file in memory
        files.push({
          filePath,
          content,
        });

        // // Stream success message with file data
        // writer.write({
        //   type: 'text-start',
        //   id: `write-file-${filePath}`,
        // });

        // writer.write({
        //   type: 'text-delta',
        //   id: `write-file-${filePath}`,
        //   delta: `Successfully created file: ${filePath} (${content.length} characters)`,
        // });

        // writer.write({
        //   type: 'text-end',
        //   id: `write-file-${filePath}`,
        // });

        // Also stream file data as a custom data part
        writer.write({
          type: 'data-file',
          id: `file-data-${filePath}`,
          data: {
            filePath,
            content,
          },
        });

        return `Successfully created file ${filePath} with ${content.length} characters`;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

        // Stream error message
        writer.write({
          type: 'text-start',
          id: `write-file-error-${filePath}`,
        });

        writer.write({
          type: 'text-delta',
          id: `write-file-error-${filePath}`,
          delta: `Failed to create file ${filePath}: ${errorMessage}`,
        });

        writer.write({
          type: 'text-end',
          id: `write-file-error-${filePath}`,
        });

        return `Error creating file ${filePath}: ${errorMessage}`;
      }
    },
  });
}
