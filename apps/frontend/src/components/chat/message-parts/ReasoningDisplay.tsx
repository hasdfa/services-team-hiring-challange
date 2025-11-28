'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { BrainIcon, ChevronDownIcon } from 'lucide-react';

interface ReasoningDisplayProps {
  content: string;
}

/**
 * Component to display reasoning content (expandable)
 */
export function ReasoningDisplay({ content }: ReasoningDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      variant="outlined"
      sx={{
        my: 1,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: 'primary.200',
        bgcolor: 'primary.50',
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
          bgcolor: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
          '&:hover': {
            bgcolor: 'primary.100',
          },
        }}
      >
        <BrainIcon
          size={18}
          style={{ color: 'var(--mui-palette-primary-main)', flexShrink: 0 }}
        />
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, flex: 1, color: 'primary.main' }}
        >
          Reasoning
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
        <Box
          sx={{
            p: 2,
            maxHeight: 400,
            overflow: 'auto',
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              color: 'text.secondary',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }}
          >
            {content}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
}
