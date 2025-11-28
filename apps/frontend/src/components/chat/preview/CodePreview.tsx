'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { CodePreviewProps } from '../types';

import {
  initWorker as initEsbuildWorker,
  type EsbuildWorker,
} from '@vraksha/esbuild-browser';
import { registerServiceWorker } from '../sw';
import React from 'react';
import ansiHTML from 'ansi-html';
import * as previewFiles from './files';
import { uploadFiles } from './upload';
import { MessageTarget } from './message-target';

let esbuildWorker: Promise<EsbuildWorker> = Promise.reject(
  new Error('Not initialized')
);

if (typeof window !== 'undefined') {
  const ESBUILD_BROWSER_VERSION = process.env.ESBUILD_BROWSER_VERSION;
  registerServiceWorker('/service-worker.js');

  esbuildWorker = initEsbuildWorker({
    workerUrl: new URL(
      `/esbuild-browser/${ESBUILD_BROWSER_VERSION}/worker.js`,
      window.location.origin
    ).toString(),
    esbuildVersion: '0.27.0',
  });
}

const SANDPACK_CDN_URL = process.env.NEXT_PUBLIC_SANDPACK_CDN_URL;
if (!SANDPACK_CDN_URL) {
  throw new Error('NEXT_PUBLIC_SANDPACK_CDN_URL is not set');
}

type PreviewState =
  | { status: 'idle' }
  | { status: 'installing' }
  | { status: 'building' }
  | { status: 'uploading' }
  | { status: 'finished' }
  | { status: 'error'; error: string };

/**
 * Preview component - placeholder to be filled in later
 */
export function CodePreview({
  entryFilePath,
  files,
  onClose,
}: CodePreviewProps) {
  const buildId = React.useId();
  const [status, setStatus] = React.useState<PreviewState>({ status: 'idle' });
  const iframeUrl = React.useMemo(() => {
    return new URL(`/__build/${buildId}/`, window.location.origin).toString();
  }, [buildId]);

  React.useEffect(() => {
    const controller = new AbortController();
    const sw = MessageTarget.fromServiceWorker();
    const signal = controller.signal;
    const checkSignal = () => {
      if (signal.aborted) {
        throw new Error('Build aborted');
      }
    };

    (async () => {
      console.log('started esbuildWorker', esbuildWorker);
      const worker = await esbuildWorker;
      checkSignal();

      setStatus({ status: 'installing' });
      const filesMap = files.reduce(
        (acc, file) => {
          acc[file.filePath] = file.content;
          return acc;
        },
        {
          'index.html': previewFiles.indexhtml,
          'package.json': previewFiles.packageJson,
        } as Record<string, string>
      );
      await worker.npm__install({
        rawFiles: filesMap,
        registryBaseUrl: SANDPACK_CDN_URL!,
        cwd: '/',
        progress: (type, message) => {
          console.log(type, message);
        },
      });
      checkSignal();

      setStatus({ status: 'building' });
      const result = await worker.esbuild__bundle({
        entryPoints: ['index.html', entryFilePath],
        outdir: '/dist',
        format: 'esm',
        target: 'esnext',
        bundle: true,
        splitting: true,
        sourcemap: true,
        minify: false,
      });
      console.log('result', result);
      checkSignal();

      if (result.stderr_) {
        const html = ansiHTML(result.stderr_);
        setStatus({ status: 'error', error: html });
      } else {
        setStatus({ status: 'uploading' });

        const filesObj: Record<string, string> = {
          'index.html': previewFiles.indexhtml,
          'src/main.css': ' ',
        };
        for (const file of result.outputFiles_) {
          filesObj[file.path] = Buffer.from(file.contents).toString('utf-8');
        }

        await uploadFiles(await sw, {
          projectId: buildId,
          files: filesObj,
        });

        checkSignal();
        setStatus({ status: 'finished' });
      }
    })();

    return () => {
      console.log('aborting build');
      controller.abort();
    };
  }, [files]);

  return (
    <Paper
      variant="outlined"
      sx={{
        mt: 2,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        borderColor: 'primary.200',
        bgcolor: 'background.paper',
        width: '100%',
        height: '600px',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 2,
          px: 2,
          mb: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Code Preview
        </Typography>
        {onClose && (
          <Button size="small" onClick={onClose} variant="text">
            Close
          </Button>
        )}
      </Box>
      {/* Status Display */}
      {status.status === 'idle' && (
        <Box
          sx={{
            p: 2,
            flex: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Preparing build...
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
            {files.length} file(s) ready
          </Typography>
        </Box>
      )}

      {status.status === 'installing' && (
        <Box
          sx={{
            p: 2,
            flex: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid',
              borderColor: 'primary.main',
              borderTopColor: 'transparent',
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="body1" color="primary.main" fontWeight={500}>
            Installing dependencies...
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Fetching packages from CDN
          </Typography>
        </Box>
      )}

      {status.status === 'building' && (
        <Box
          sx={{
            p: 2,
            flex: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid',
              borderColor: 'success.main',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="body1" color="success.main" fontWeight={500}>
            Building project...
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Bundling with esbuild
          </Typography>
        </Box>
      )}

      {status.status === 'error' && (
        <Box
          sx={{
            p: 2,
            flex: 1,
            borderRadius: 1,
            bgcolor: 'error.50',
            border: '1px solid',
            borderColor: 'error.200',
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="subtitle2"
            color="error.main"
            sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            ⚠️ Build Error
          </Typography>
          <Box
            component="pre"
            sx={{
              flex: 1,
              m: 0,
              p: 2,
              borderRadius: 1,
              bgcolor: 'grey.900',
              color: 'grey.100',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              '& b': { color: 'error.light' },
            }}
            dangerouslySetInnerHTML={{ __html: status.error }}
          />
        </Box>
      )}

      {status.status === 'uploading' && (
        <Box
          sx={{
            p: 2,
            flex: 1,
            borderRadius: 1,
            bgcolor: 'action.hover',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid',
              borderColor: 'info.main',
              borderTopColor: 'transparent',
              animation: 'spin 0.6s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography variant="body1" color="info.main" fontWeight={500}>
            Uploading files...
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Preparing preview
          </Typography>
        </Box>
      )}

      {status.status === 'finished' && (
        <Box
          sx={{
            flex: 1,
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1,
              bgcolor: 'success.50',
              borderBottom: '1px solid',
              borderColor: 'success.200',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
            <Typography variant="caption" color="success.dark" fontWeight={500}>
              Build successful
            </Typography>
          </Box>
          <Box
            component="iframe"
            src={iframeUrl}
            sx={{
              flex: 1,
              width: '100%',
              border: 'none',
              bgcolor: 'white',
            }}
            title="Code Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </Box>
      )}
    </Paper>
  );
}
