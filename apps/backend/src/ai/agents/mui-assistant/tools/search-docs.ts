import { tool } from 'ai';
import z from 'zod';

const availableLibraries = {
  'material-ui-v7': {
    id: '/mui/material-ui/v7_3_2',
  },
  'mui-x-data-grid-v8': {
    id: '/mui/mui-x/v8_11_0',
  },
  'mui-x-date-pickers-v8': {
    id: '/mui/mui-x/v8_11_0',
  },
  'mui-x-charts-v8': {
    id: '/mui/mui-x/v8_11_0',
  },
  'mui-x-tree-view-v8': {
    id: '/mui/mui-x/v8_11_0',
  },
} as const;

type LibraryKey = keyof typeof availableLibraries;

/**
 * Fetch documentation from Context7 API
 */
async function fetchDocsFromContext7(
  libraryId: string,
  topic?: string,
  page: number = 1
): Promise<string> {
  const apiKey = process.env.CONTEXT7_API_KEY;
  if (!apiKey) {
    throw new Error('CONTEXT7_API_KEY environment variable is not set');
  }

  // Build the URL with query parameters
  const url = new URL(`https://context7.com/api/v2/docs/code${libraryId}`);
  url.searchParams.set('type', 'txt');
  if (topic) {
    url.searchParams.set('topic', topic);
  }
  url.searchParams.set('page', page.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Context7 API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.text();
  return data;
}

const searchDocsSchema = z.object({
  library: z
    .enum([
      'material-ui-v7',
      'mui-x-data-grid-v8',
      'mui-x-date-pickers-v8',
      'mui-x-charts-v8',
      'mui-x-tree-view-v8',
    ])
    .describe('The MUI library to search documentation for'),
  topic: z
    .string()
    .optional()
    .describe(
      'Optional topic to focus the search on (e.g., "hooks", "routing", "data-grid", "date-picker")'
    ),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe('Page number for pagination (default: 1)'),
});

type SearchDocsParams = z.infer<typeof searchDocsSchema>;

export const searchDocs = tool({
  description:
    'Search and fetch documentation from MUI libraries (Material-UI v7, MUI X Data Grid v8, MUI X Date Pickers v8, MUI X Charts v8, MUI X Tree View v8) using Context7. Use this tool to find component APIs, examples, and usage patterns.',
  inputSchema: searchDocsSchema,
  execute: async (params: SearchDocsParams) => {
    const { library, topic, page } = params;
    const pageNumber = page ?? 1;
    try {
      const libraryConfig = availableLibraries[library as LibraryKey];
      if (!libraryConfig) {
        return `Error: Unknown library: ${library}. Available libraries: ${Object.keys(availableLibraries).join(', ')}`;
      }

      const docs = await fetchDocsFromContext7(
        libraryConfig.id,
        topic,
        pageNumber
      );

      return `Documentation for ${library}${topic ? ` (topic: ${topic})` : ''} (page ${pageNumber}):\n\n${docs}`;
    } catch (error) {
      return `Error fetching documentation: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  },
});
