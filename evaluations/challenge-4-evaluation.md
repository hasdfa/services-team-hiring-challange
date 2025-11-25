# Challenge 4: Frontend Streaming - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### State Management (15 points)

**Excellent (13-15)**

- Clean hook architecture
- Proper SWR usage
- Optimistic updates work
- Cache management correct
- No unnecessary re-renders

**Good (10-12)**

- State works
- Basic SWR usage
- Some optimizations

**Acceptable (7-9)**

- State works but messy
- SWR used incorrectly
- Performance issues

**Poor (0-6)**

- State broken
- No SWR integration

### Real-Time UI (10 points)

**Excellent (9-10)**

- Smooth streaming
- Great UX
- Loading states
- Error states
- Typing indicators

**Good (7-8)**

- Streaming works
- Basic UX
- Some feedback

**Acceptable (5-6)**

- Streaming works
- Minimal UX

**Poor (0-4)**

- Choppy/broken
- Poor UX

### Connection Management (5 points)

**Excellent (5)**

- Proper SSE cleanup
- Reconnection logic
- Timeout handling
- Error recovery

**Good (3-4)**

- Basic cleanup
- Some error handling

**Acceptable (2)**

- Minimal cleanup
- Few errors handled

**Poor (0-1)**

- Memory leaks
- No error handling

---

## What to Look For

### Must Have

- ✅ SSE connection works
- ✅ Messages stream in real-time
- ✅ SWR cache updated correctly
- ✅ Basic error handling

### Should Have

- ✅ Optimistic user message
- ✅ Clean hook architecture
- ✅ Proper cleanup (no leaks)
- ✅ Loading/error states

### Nice to Have

- 🌟 Typing indicator
- 🌟 Stop streaming button
- 🌟 Retry on failure
- 🌟 Markdown rendering
- 🌟 Code highlighting

---

## Testing Checklist

- [ ] Can send message
- [ ] User message appears immediately
- [ ] Assistant response streams
- [ ] Message persists after stream
- [ ] Can send multiple messages
- [ ] Error handling works
- [ ] No memory leaks (check DevTools)
- [ ] SWR cache stays in sync
- [ ] Works on disconnect/reconnect

---

## Common Issues

❌ **Memory leaks** - EventSource not closed
❌ **Cache staleness** - SWR not updated
❌ **Poor performance** - Re-renders entire list
❌ **No optimistic update** - Wait for backend
❌ **Broken on errors** - No error states
❌ **Race conditions** - Multiple streams at once
