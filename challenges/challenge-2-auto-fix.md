# Challenge 2: Auto-Fix Integration

**Difficulty**: High  
**Focus**: Full-Stack, AI Integration, Error Handling  
**Time**: 4-6 hours

## Problem Statement

When the AI generates React components, builds sometimes fail due to syntax errors, missing imports, or TypeScript issues. Currently, users must manually copy errors and ask for fixes.

Your task is to implement an **automatic error detection and fix system** that:

1. Catch code blocks on backend and run eslint and send updated to the frontend in same stream
2. Captures build errors from the CodePreview component
3. Sends errors to the AI agent for analysis
4. Streams corrected code back to the user
5. Applies fixes automatically (with user confirmation)

## Current Architecture

The existing system flow:

```
User Message → MUI Assistant → write-file tool → Files stream to frontend
                                                         ↓
                                               CodePreview builds
                                                         ↓
                                               Success or Error (currently lost)
```

## Bonus Points

- **Automatic Retry**: Auto-fix without user intervention (with limit)
- **Fix History**: Track fixes applied to a message
- **Error Categories**: Categorize errors (syntax, type, import, etc.)
- **Success Metrics**: Track fix success rate
- **Multiple Fixes**: Handle multiple errors in one fix cycle

## Common Pitfalls

❌ **Infinite fix loops**: AI generates new errors while fixing  
✅ Limit fix attempts, track iteration count

❌ **Over-fixing**: AI rewrites entire codebase  
✅ Instruct AI to make minimal changes

❌ **Lost context**: Fix doesn't consider original user request  
✅ Include original message context in fix prompt

❌ **No error parsing**: Raw error messages sent to AI  
✅ Parse and structure error information

---

**Ready to start?** Review the existing AI agent in `apps/backend/src/ai/agents/mui-assistant/` and the CodePreview component in `apps/frontend/src/components/chat/preview/CodePreview.tsx`.

Good luck!
