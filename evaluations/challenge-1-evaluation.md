# Challenge 1: Frontend Build Queue - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### Queue Implementation (12 points)

**Excellent (11-12)**

- Proper FIFO queue with sequential processing
- Clean state management (single source of truth)
- No race conditions between builds
- Handles queue overflow gracefully
- Clear queue state visibility

**Good (8-10)**

- Queue works correctly
- State mostly well-managed
- Minor race condition risks
- Basic overflow handling

**Acceptable (5-7)**

- Basic queue works
- Some state issues
- Potential race conditions
- No overflow handling

**Poor (0-4)**

- Queue broken or missing
- State management chaos
- Race conditions
- No queue visibility

### Caching Strategy (10 points)

**Excellent (9-10)**

- Content-based hash for cache keys
- Efficient cache lookup
- Proper cache invalidation
- IndexedDB or localStorage persistence
- Cache size limits implemented

**Good (7-8)**

- Working cache with good strategy
- Persistent storage
- Some edge cases missed

**Acceptable (5-6)**

- Basic caching works
- In-memory only (lost on refresh)
- No size limits

**Poor (0-4)**

- No caching
- Broken cache logic

### User Experience (8 points)

**Excellent (7-8)**

- Clear queue status display
- Build progress indicators
- History of past builds
- Smooth transitions
- Keyboard accessible

**Good (5-6)**

- Good status display
- Basic progress feedback
- Some history

**Acceptable (3-4)**

- Minimal status display
- No progress feedback
- No history

**Poor (0-2)**

- No status display
- Confusing interface

---

## What to Look For

### Must Have

- ✅ Build queue that processes one at a time
- ✅ Queue state management (pending, building, done, failed)
- ✅ Basic caching to skip identical rebuilds
- ✅ Persists across page refresh
- ✅ Clear status display

### Should Have

- ✅ Content-based hash for cache keys
- ✅ Queue position indicator
- ✅ Build history
- ✅ Error state handling
- ✅ Cache hit indicator

### Nice to Have (Bonus)

- 🌟 Build cancellation
- 🌟 Priority queue (move to front)
- 🌟 Cache eviction strategy
- 🌟 Build metrics/stats
- 🌟 Service worker integration

---

## Testing Checklist

### Queue Behavior

- [ ] Builds process one at a time
- [ ] Multiple builds queue properly
- [ ] Queue order is FIFO
- [ ] Status updates correctly per build
- [ ] Queue persists on refresh

### Caching

- [ ] Same files return cached result
- [ ] Different files trigger new build
- [ ] Cache persists in storage
- [ ] Cache hit clearly indicated
- [ ] Cache doesn't grow unbounded

### Error Handling

- [ ] Build errors don't crash queue
- [ ] Failed builds show error state
- [ ] Queue continues after failure
- [ ] Timeouts handled

### UI

- [ ] Current build status visible
- [ ] Queue length shown
- [ ] Position in queue shown
- [ ] Build history accessible
- [ ] Loading states appropriate

---

## Common Issues to Watch For

❌ **Race conditions**: Multiple builds modifying state  
❌ **Memory leaks**: Queue/cache growing unbounded  
❌ **No persistence**: State lost on refresh  
❌ **No feedback**: User can't see what's happening  
❌ **Blocking UI**: Synchronous operations freezing interface
