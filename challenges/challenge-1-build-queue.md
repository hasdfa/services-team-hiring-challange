# Challenge 1: Frontend Build Queue System

**Difficulty**: Medium  
**Focus**: Frontend Engineering, State Management, Browser APIs  
**Time**: 3-4 hours

## Problem Statement

The current CodePreview system builds React components **in the browser** using esbuild-browser. While this works, it has limitations:

1. **No persistence**: Build results are lost on page refresh
2. **No caching**: Same code rebuilds every time
3. **No progress tracking**: Users can't see build status or history
4. **No queue management**: Multiple builds can conflict with each other

Your task is to implement a **frontend build queue system** that manages builds client-side with proper state management, caching, and user feedback.

## Current Implementation

The frontend `CodePreview.tsx` component currently:

```typescript
// apps/frontend/src/components/chat/preview/CodePreview.tsx

// 1. Initializes esbuild worker in browser
const worker = await initEsbuildWorker({...});

// 2. Installs dependencies from Sandpack CDN
await worker.npm__install({
  rawFiles: filesMap,
  registryBaseUrl: SANDPACK_CDN_URL,
});

// 3. Bundles with esbuild
const result = await worker.esbuild__bundle({
  entryPoints: ['index.html', entryFilePath],
  outdir: '/dist',
  bundle: true,
});

// 4. Uploads to service worker for iframe rendering
await uploadFiles(sw, { projectId: buildId, files: outputFiles });
```

This happens synchronously when users click "Preview" - no queue, no persistence, no caching.

## Your Task

Implement a frontend build queue system that:

1. ✅ **Queues build requests** and processes them sequentially
2. ✅ **Tracks build status** (`pending` → `building` → `completed`/`failed`)
3. ✅ **Caches build results** in IndexedDB/localStorage to avoid rebuilding identical code
4. ✅ **Provides queue visibility** (UI showing current builds and history)
5. ✅ **Persists state** across page refreshes

## Bonus Points

- **Build Cancellation**: Allow canceling pending builds
- **Priority Builds**: Move a build to front of queue
- **Build Metrics Dashboard**: Visualize cache hit rates, build times
- **Build Deduplication**: Detect and merge duplicate build requests
- **Service Worker Sync**: Persist builds even when tab closes

## Common Pitfalls

❌ **Race conditions**: Multiple builds modifying state simultaneously  
✅ Use proper state management patterns (single source of truth)

❌ **Memory leaks**: Unbounded queue/cache growth  
✅ Limit queue size, implement cache eviction

❌ **No timeout**: Builds running forever  
✅ Implement build timeouts (e.g., 300 seconds)

---

**Ready to start?** Review `apps/frontend/src/components/chat/preview/CodePreview.tsx` and `docs/FRONTEND_ARCHITECTURE.md` to understand the current build flow, then implement your queue system!

Good luck!
