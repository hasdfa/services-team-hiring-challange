# Challenge 2: Auto-Fix Model - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### LLM Integration (10 points)

**Excellent (9-10)**

- Correct API usage
- Good prompt engineering
- Handles API errors/limits
- Efficient token usage

**Good (7-8)**

- API works
- Basic prompting
- Some error handling

**Acceptable (5-6)**

- API calls work
- Minimal error handling

**Poor (0-4)**

- API integration broken
- No error handling

### Streaming Implementation (10 points)

**Excellent (9-10)**

- SSE implemented correctly
- Smooth real-time updates
- Proper cleanup
- Error handling

**Good (7-8)**

- Streaming works
- Some errors handled

**Acceptable (5-6)**

- Basic streaming
- Minimal error handling

**Poor (0-4)**

- Streaming doesn't work
- No cleanup

### Full-Stack Integration (10 points)

**Excellent (9-10)**

- Frontend ↔ Backend seamless
- Database persistence correct
- State management clean
- Great UX

**Good (7-8)**

- Integration works
- Basic state management

**Acceptable (5-6)**

- Works but clunky
- Poor state management

**Poor (0-4)**

- Integration broken

## Bonus: A/B Testing (up to +10 points)

If implemented, can boost overall score:

**Excellent (+8-10)**

- Multiple models working
- Proper variant assignment
- Analytics/tracking
- Clear documentation

**Good (+5-7)**

- Basic A/B framework
- 2 models working
- Simple tracking

**Basic (+2-4)**

- Concept demonstrated
- Minimal implementation

---

## What to Look For

### Must Have

- ✅ LLM API integration works
- ✅ Streaming response to frontend
- ✅ Messages saved to database
- ✅ Basic error handling

### Should Have

- ✅ Good prompt engineering
- ✅ Clean streaming implementation
- ✅ Rate limit handling
- ✅ Nice UI/UX

### Nice to Have (Bonus)

- 🌟 A/B testing framework
- 🌟 Multiple LLM providers
- 🌟 Analytics dashboard
- 🌟 Cost tracking

---

## Testing Checklist

- [ ] Auto-fix endpoint responds
- [ ] Streaming works in browser
- [ ] Messages saved to DB
- [ ] Handles invalid code gracefully
- [ ] API errors shown to user
- [ ] Can test multiple requests
- [ ] A/B testing (if implemented) assigns variants

---

## Common Issues

❌ **No streaming** - Returns complete response at once
❌ **Memory leaks** - Streams not closed
❌ **Poor prompts** - Generic, not focused on fixing
❌ **No persistence** - Messages not saved
❌ **API key exposed** - Hardcoded in frontend
