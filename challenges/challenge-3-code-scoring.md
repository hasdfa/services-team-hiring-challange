# Challenge 3: Code Quality Scoring System

**Difficulty**: Medium  
**Focus**: Backend Engineering, Code Analysis, Metrics  
**Time**: 4-6 hours

## Problem Statement

The MUI Assistant generates React components, but there's no way to assess their quality. Users and the system have no visibility into whether generated code follows best practices, has type safety issues, or could be improved.

Your task is to implement a **code quality scoring system** that evaluates AI-generated files and provides actionable feedback.

## Current Architecture

Messages are stored with file parts in the `chat_messages` table:

```typescript
// Message content structure
{
  parts: [
    { type: 'text', text: '...' },
    { type: 'file', filePath: 'src/main.tsx', content: '...' },
    { type: 'file', filePath: 'src/components/Button.tsx', content: '...' },
  ];
}
```

Your scoring system should:

1. Extract files from messages
2. Analyze each file for quality metrics
3. Store scores and provide API access
4. Display scores in the frontend (bonus)

## Scoring Dimensions

Implement **at least 4** of these metrics:

### 1. Type Safety (Weight: 25%)

### 2. Code Style (Weight: 20%)

### 3. Complexity (Weight: 20%)

### 4. React Best Practices (Weight: 20%)

### 5. Accessibility (Weight: 15%)

## Bonus Points

- **Auto-Score**: Score files automatically when message saved
- **Frontend Display**: Show scores in message UI
- **Score Trends**: Track improvement over chat session
- **Thresholds**: Pass/fail badges based on score
- **Recommendations**: AI-generated improvement suggestions

## Common Pitfalls

❌ **False positives**: Flagging valid patterns as issues  
✅ Test with real-world code examples

❌ **No extensibility**: Hard-coded analyzer logic  
✅ Use plugin/strategy pattern

❌ **Slow analysis**: Blocking on large files  
✅ Use async and parallel analysis

❌ **No metadata**: Can't debug score breakdown  
✅ Store detailed analysis results

---

**Ready to start?** Review the message schema in `apps/backend/src/db/schema/index.ts` and see how files are stored in message parts.

Good luck!
