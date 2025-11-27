'use strict';

// src/service-worker.ts
var PREVIEW_DOMAIN_SUFFIX = '{{PREVIEW_DOMAIN_SUFFIX}}';
var hasPreviewDomainSuffix =
  !PREVIEW_DOMAIN_SUFFIX.startsWith('{{') &&
  !PREVIEW_DOMAIN_SUFFIX.endsWith('}}');
var fileStore = /* @__PURE__ */ new Map();
var SECURITY_HEADERS = {
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'content-security-policy':
    "default-src * data: mediastream: blob: filesystem: about: ws: wss: 'unsafe-eval' 'wasm-unsafe-eval' 'unsafe-inline'; script-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src-elem * data: blob: 'unsafe-inline'; connect-src * data: blob: 'unsafe-inline'; img-src * data: blob: 'unsafe-inline'; media-src * data: blob: 'unsafe-inline'; frame-src * data: blob: ; style-src * data: blob: 'unsafe-inline'; font-src * data: blob: 'unsafe-inline'; frame-ancestors *;",
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'SAMEORIGIN',
  'x-nf-request-id': '01K1K2GYTJFG0PBG936G3ABJEE',
  'x-xss-protection': '1; mode=block',
};
function getContentType(filePath) {
  const extension = filePath.split('.').pop().toLowerCase();
  const contentTypes = {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html',
    json: 'application/json',
    map: 'application/json',
    // .js.map
    txt: 'text/plain',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
  };
  return contentTypes[extension] || 'application/octet-stream';
}
function getCacheName(projectId) {
  return `esbuild-files-${projectId}`;
}
self.addEventListener('message', async (event) => {
  var _a;
  if (event.data.type === 'UPLOAD_FILES') {
    const { projectId, files } = event.data.payload;
    fileStore.set(projectId, files);
    const cache = await caches.open(getCacheName(projectId));
    const keys = await cache.keys();
    for (const request of keys) {
      await cache.delete(request);
    }
    for (const [filePath, fileContent] of Object.entries(files)) {
      const url = `/${projectId}/${filePath}`;
      let body;
      if (
        typeof fileContent === 'string' ||
        fileContent instanceof Blob ||
        fileContent instanceof ArrayBuffer
      ) {
        body = fileContent;
      } else if (fileContent instanceof Uint8Array) {
        body = fileContent;
      } else {
        body = String(fileContent);
      }
      await cache.put(
        url,
        new Response(body, {
          headers: {
            'Content-Type': getContentType(filePath),
            'Cache-Control': 'no-store',
            ...SECURITY_HEADERS,
          },
        })
      );
    }
    (_a = event.source) == null
      ? void 0
      : _a.postMessage({
          type: 'UPLOAD_COMPLETE',
          projectId,
        });
  }
});
self.addEventListener('fetch', (event) => {
  const fetchEvent = event;
  const url = new URL(fetchEvent.request.url);
  if (hasPreviewDomainSuffix && url.hostname.endsWith(PREVIEW_DOMAIN_SUFFIX)) {
    const projectId = url.hostname.slice(0, -PREVIEW_DOMAIN_SUFFIX.length);
    const filePath = url.pathname;
    const projectFiles = fileStore.get(projectId);
    if (projectFiles && filePath in projectFiles) {
      const response = new Response(projectFiles[filePath], {
        headers: {
          'Content-Type': getContentType(filePath),
          'Cache-Control': 'no-store',
          ...SECURITY_HEADERS,
        },
      });
      fetchEvent.respondWith(response);
      return;
    }
    fetchEvent.respondWith(new Response('Not Found', { status: 404 }));
    return;
  }
  if (url.pathname.startsWith('/__build/')) {
    const pathParts = url.pathname.split('/');
    const projectId = pathParts[2];
    const filePath = pathParts.slice(3).join('/') || 'index.html';
    const projectFiles = fileStore.get(projectId);
    if (projectFiles && filePath in projectFiles) {
      const response = new Response(projectFiles[filePath], {
        headers: {
          'Content-Type': getContentType(filePath),
          'Cache-Control': 'no-store',
          ...SECURITY_HEADERS,
        },
      });
      fetchEvent.respondWith(response);
      return;
    }
    fetchEvent.respondWith(
      (async () => {
        const cache = await caches.open(getCacheName(projectId));
        const cachedResponse = await cache.match(`/${projectId}/${filePath}`);
        if (cachedResponse) {
          if (projectFiles) {
            const cloned = await cachedResponse.clone().arrayBuffer();
            projectFiles[filePath] = cloned;
          } else {
            const cloned = await cachedResponse.clone().arrayBuffer();
            fileStore.set(projectId, { [filePath]: cloned });
          }
          return cachedResponse;
        }
        return new Response(`File '${filePath}' was Not Found`, {
          status: 404,
        });
      })()
    );
  }
});
