import type { MessageTarget } from './message-target.ts';

export async function uploadFiles(
  sw: MessageTarget | null,
  options: {
    projectId: string;
    filesBinary?: ArrayBuffer | Buffer;
    files?: Record<string, string>;
  }
) {
  const uploadFinishPromise = new Promise<void>((resolve) => {
    const handler = (event: MessageEvent) => {
      console.log('from SW', event);

      if (event.data?.type === 'UPLOAD_COMPLETE') {
        sw?.removeEventListener('message', handler);
        resolve();
      }
    };

    sw?.addEventListener('message', handler);
    setTimeout(resolve, 10_000);
  });

  console.log('upload files', {
    payload: {
      projectId: options.projectId,
      filesBinary: options.filesBinary,
      files: options.files,
    },
  });

  await sw?.postMessage({
    type: 'UPLOAD_FILES',
    payload: {
      projectId: options.projectId,
      filesBinary: options.filesBinary,
      files: options.files,
    },
  });

  await uploadFinishPromise;
}
