'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { CheckCircleIcon, ChevronDownIcon } from 'lucide-react';
import { CodeBlock } from '@/mui-treasury/components/ai-code-block';
import type { LoadedFile } from '../types';
import { getLanguageFromPath } from '../utils';

interface LoadedFileDisplayProps {
  file: LoadedFile;
}

/**
 * Component to display a file loaded from backend (with expandable code)
 */
export function LoadedFileDisplay({ file }: LoadedFileDisplayProps) {
  const [expanded, setExpanded] = useState(false);
  const language = getLanguageFromPath(file.filePath);

  return (
    <Paper
      variant="outlined"
      sx={{
        my: 1,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'success.200',
      }}
    >
      <Box
        component="button"
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 1.5,
          width: '100%',
          border: 'none',
          bgcolor: 'success.50',
          cursor: 'pointer',
          textAlign: 'left',
          '&:hover': {
            bgcolor: 'success.100',
          },
        }}
      >
        <CheckCircleIcon
          size={18}
          style={{ color: 'var(--mui-palette-success-main)', flexShrink: 0 }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
          {file.filePath}
        </Typography>
        <IconButton
          size="small"
          sx={{
            p: 0.5,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <ChevronDownIcon size={16} />
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <CodeBlock code={file.content} language={language} />
        </Box>
      </Collapse>
    </Paper>
  );
}
