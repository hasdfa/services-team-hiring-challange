'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ChevronDownIcon, WrenchIcon } from 'lucide-react';

interface ToolCallDisplayProps {
  toolName: string;
  args: Record<string, unknown>;
  result?: string;
  error?: string;
}

/**
 * Component to display tool call with args and result
 */
export function ToolCallDisplay({
  toolName,
  args,
  result,
  error,
}: ToolCallDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  // Don't render write-file tool calls (they have their own display)
  if (toolName === 'write-file') {
    return null;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        my: 1,
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: error ? 'error.200' : 'info.200',
        bgcolor: error ? 'error.50' : 'info.50',
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
            bgcolor: error ? 'error.100' : 'info.100',
          },
        }}
      >
        <WrenchIcon
          size={18}
          style={{
            color: error
              ? 'var(--mui-palette-error-main)'
              : 'var(--mui-palette-info-main)',
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 500, flex: 1 }}>
          Called: {toolName}
        </Typography>
        {error && <Chip label="Error" size="small" color="error" />}
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
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="caption" sx={{ fontWeight: 600 }}>
            Arguments:
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 0.5,
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.75rem',
            }}
          >
            {JSON.stringify(args, null, 2)}
          </Box>
          {result && (
            <>
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, mt: 2, display: 'block' }}
              >
                Result:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {result}
              </Typography>
            </>
          )}
          {error && (
            <>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  mt: 2,
                  display: 'block',
                  color: 'error.main',
                }}
              >
                Error:
              </Typography>
              <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                {error}
              </Typography>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}
