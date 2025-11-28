'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FileCodeIcon } from 'lucide-react';
import { tryParseToolInput } from '../utils';

interface WriteFileToolDisplayProps {
  input: unknown;
  state?: string;
}

/**
 * Component to display write-file tool progress (during streaming)
 */
export function WriteFileToolDisplay({
  input,
  state = 'input-streaming',
}: WriteFileToolDisplayProps) {
  const parsedInput = tryParseToolInput(input);
  const filePath = parsedInput?.filePath;
  const isComplete = state === 'output-available';
  const hasError = state === 'output-error';

  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        my: 1,
        borderRadius: 2,
        bgcolor: hasError
          ? 'error.50'
          : isComplete
            ? 'success.50'
            : 'action.hover',
        borderColor: hasError
          ? 'error.200'
          : isComplete
            ? 'success.200'
            : 'divider',
      }}
    >
      {!isComplete && !hasError ? (
        <CircularProgress size={18} thickness={5} />
      ) : (
        <FileCodeIcon
          size={18}
          style={{
            color: hasError
              ? 'var(--mui-palette-error-main)'
              : 'var(--mui-palette-success-main)',
          }}
        />
      )}
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {hasError
          ? `Failed to write file${filePath ? `: ${filePath}` : ''}`
          : isComplete
            ? `Wrote file: ${filePath || 'unknown'}`
            : filePath
              ? `Writing file: ${filePath}...`
              : 'Writing file...'}
      </Typography>
    </Paper>
  );
}
