# Challenge 1: Build Queue System - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### Queue Implementation (15 points)

**Excellent (13-15)**

- Correct FIFO ordering per chat
- Concurrent processing (multiple workers)
- Proper status transitions in database
- Thread-safe/race condition free

**Good (10-12)**

- Mostly correct ordering
- Some concurrency
- Status updates work
- Minor race conditions

**Acceptable (7-9)**

- Basic queue works
- Single worker only
- Status updates incomplete
- Some issues with ordering

**Poor (0-6)**

- Queue doesn't work properly
- No concurrency
- Missing status updates

### System Design (10 points)

**Excellent (9-10)**

- Scalable architecture
- Clear diagrams/explanation
- Trade-offs well analyzed
- Handles failures gracefully

**Good (7-8)**

- Reasonable architecture
- Basic explanation
- Some trade-offs discussed

**Acceptable (5-6)**

- Works but not scalable
- Minimal explanation

**Poor (0-4)**

- Poor design decisions
- No explanation

### Error Handling (5 points)

**Excellent (5)**

- Handles all failure modes
- Retry logic implemented
- Proper logging
- Graceful degradation

**Good (3-4)**

- Handles main errors
- Basic retry or logging

**Acceptable (2)**

- Minimal error handling

**Poor (0-1)**

- No error handling

---

## What to Look For

### Must Have

- ✅ Jobs enqueue correctly
- ✅ Jobs process in order (per chat)
- ✅ Status updates in database
- ✅ API endpoints work

### Should Have

- ✅ Concurrent processing (2+ workers)
- ✅ Error handling
- ✅ Queue visibility API
- ✅ Clean architecture

### Nice to Have

- 🌟 Tests
- 🌟 Metrics/stats
- 🌟 Priority queue
- 🌟 Dead letter queue

---

## Testing Checklist

- [ ] Single job processes correctly
- [ ] Multiple jobs queue and process in order
- [ ] Status transitions: pending → running → completed
- [ ] Failed jobs show error in database
- [ ] GET /api/builds/:id returns status
- [ ] GET /api/builds/chat/:chatId shows queue
- [ ] Concurrent requests don't cause race conditions

---

## Common Issues to Watch For

❌ **No actual queue** - Just processes synchronously
❌ **Race conditions** - Multiple workers grab same job
❌ **Memory leaks** - Queue grows unbounded
❌ **Lost jobs** - Jobs disappear on restart (acceptable for in-memory, should be noted)
❌ **No status updates** - Jobs stuck in "pending"
