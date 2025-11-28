# Challenge 2: Auto-Fix Integration - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### AI Integration (12 points)

**Excellent (11-12)**

- Backend ESLint integration catches errors before streaming
- Errors streamed inline with code response
- Clean integration with existing MUI Assistant agent
- Proper prompt engineering for fix context
- Good error parsing and categorization

**Good (8-10)**

- Working ESLint backend integration
- Errors sent to frontend
- Reasonable AI prompting

**Acceptable (5-7)**

- Basic error detection
- Limited prompt engineering
- Missing some error types

**Poor (0-4)**

- No proper error detection
- Poor AI integration
- Prompts don't work well

### Streaming Implementation (10 points)

**Excellent (9-10)**

- Errors stream inline with original response
- Smooth UI updates during fix streaming
- Proper SSE event handling
- No memory leaks or dangling connections
- Clean abort/cleanup handling

**Good (7-8)**

- Streaming works
- Good UI updates
- Minor cleanup issues

**Acceptable (5-6)**

- Basic streaming
- Choppy updates
- Some cleanup issues

**Poor (0-4)**

- Streaming broken
- Poor UX during stream
- Memory leaks

### Full-Stack Integration (8 points)

**Excellent (7-8)**

- Seamless frontend ↔ backend flow
- Build errors captured properly
- Fix request/response cycle clear
- State management clean
- Database persistence for fixes

**Good (5-6)**

- Integration works
- Error capture functional
- Some state issues

**Acceptable (3-4)**

- Basic integration
- Error capture incomplete
- State management messy

**Poor (0-2)**

- Broken integration
- Poor error capture

---

## What to Look For

### Must Have

- ✅ Backend catches code blocks and runs ESLint
- ✅ Linting errors sent to frontend in stream
- ✅ Build errors from CodePreview captured
- ✅ Errors sent to AI for analysis
- ✅ AI streams fix response
- ✅ User can see fix explanation

### Should Have

- ✅ Error categorization (syntax, type, lint, etc.)
- ✅ Clear UI for error display
- ✅ Fix progress indication
- ✅ Database persistence for fix history
- ✅ "Apply Fix" button with confirmation

### Nice to Have (Bonus)

- 🌟 Diff view (original vs fixed)
- 🌟 Multi-error handling
- 🌟 Fix success rate tracking
- 🌟 Automatic retry on failure
- 🌟 Error prevention hints

---

## Testing Checklist

### Backend ESLint Integration

- [ ] Code blocks detected in AI response
- [ ] ESLint runs on generated code
- [ ] Lint errors included in stream
- [ ] Non-blocking to main response

### Error Capture

- [ ] Build errors captured from CodePreview
- [ ] Error message parsed correctly
- [ ] File and line info extracted
- [ ] Original code available in request

### AI Fix Flow

- [ ] Fix request sent with error context
- [ ] AI understands the error
- [ ] Fix streams back properly
- [ ] New code renders correctly

### UI/UX

- [ ] Error clearly displayed
- [ ] "Auto-Fix" button visible
- [ ] Progress shown during fix
- [ ] Fix result shown before applying
- [ ] Apply/cancel options clear

---

## Common Issues to Watch For

❌ **Lost context**: AI doesn't receive enough info to fix  
❌ **Infinite loops**: Fix creates new error, triggers new fix  
❌ **No feedback**: User doesn't see fix progress  
❌ **Broken stream**: SSE parsing issues  
❌ **State corruption**: Original code lost during fix  
❌ **No rollback**: Can't revert to original if fix is worse
