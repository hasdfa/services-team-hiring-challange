# Challenge 3: Code Quality Scoring - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### Scoring Algorithm (12 points)

**Excellent (11-12)**

- 4+ meaningful metrics implemented
- Logical, defensible weighting scheme
- Accurate pattern detection
- Handles edge cases (empty files, non-React)
- Scores correlate with actual code quality

**Good (8-10)**

- 3-4 metrics working
- Reasonable weights
- Good accuracy on typical code

**Acceptable (5-7)**

- 2-3 basic metrics
- Simple scoring
- Some false positives/negatives

**Poor (0-4)**

- Minimal metrics
- Scores don't reflect quality
- Many false results

### API Design (10 points)

**Excellent (9-10)**

- RESTful endpoints following project conventions
- Proper Zod validation
- Clear request/response schemas
- Score a message's files endpoint
- Get scores endpoint
- Direct scoring endpoint (optional)

**Good (7-8)**

- Endpoints work correctly
- Good validation
- Clear schemas

**Acceptable (5-6)**

- Basic endpoints
- Limited validation
- Unclear schemas

**Poor (0-4)**

- Broken endpoints
- No validation
- Poor API design

### Extensibility (8 points)

**Excellent (7-8)**

- Easy to add new metrics
- Configurable weights
- Plugin-style analyzers
- Clear interfaces for each dimension
- Well-documented extension points

**Good (5-6)**

- Can add metrics with some effort
- Weights configurable
- Reasonable structure

**Acceptable (3-4)**

- Hard to add metrics
- Hardcoded values
- Tightly coupled

**Poor (0-2)**

- Can't extend
- Monolithic implementation

---

## What to Look For

### Must Have

- ✅ Type Safety metric (any usage, type coverage)
- ✅ Code Style metric (naming, formatting)
- ✅ Complexity metric (cyclomatic, nesting)
- ✅ Overall weighted score calculation
- ✅ API endpoint to score files
- ✅ Store scores linked to messages

### Should Have

- ✅ React Best Practices metric
- ✅ Accessibility metric
- ✅ Issues array with categories
- ✅ Suggestions for improvement
- ✅ Metadata (lines of code, etc.)

### Nice to Have (Bonus)

- 🌟 Auto-score on message save
- 🌟 Frontend score display
- 🌟 Score trends over session
- 🌟 AI-generated recommendations
- 🌟 Pass/fail badges

---

## Testing Checklist

### Metrics

- [ ] Type Safety: Detects `any`, missing types
- [ ] Code Style: Checks naming, console logs
- [ ] Complexity: Measures nesting, conditions
- [ ] Best Practices: Checks keys in .map(), hooks
- [ ] Accessibility: Checks alt text, aria labels

### Scoring

- [ ] High-quality code scores 85-100
- [ ] Poor code scores 30-50
- [ ] Weights sum to 1.0
- [ ] Overall is weighted average
- [ ] Scores bounded 0-100

### API

- [ ] POST /scores/message/:messageId works
- [ ] GET /scores/message/:messageId works
- [ ] POST /scores (direct) works
- [ ] Validation catches bad input
- [ ] Errors returned properly

### Database

- [ ] code_scores table created
- [ ] Links to chat_messages correctly
- [ ] All fields populated
- [ ] Cascade delete works

---

## Sample Test Cases

### High Quality Code (Expected: 85-100)

```typescript
import React from 'react';
import { Button, Box } from '@mui/material';

interface GreetingProps {
  name: string;
  onGreet: () => void;
}

export default function Greeting({ name, onGreet }: GreetingProps) {
  return (
    <Box sx={{ p: 2 }}>
      <Button onClick={onGreet} aria-label={`Greet ${name}`}>
        Hello, {name}!
      </Button>
    </Box>
  );
}
```

### Poor Quality Code (Expected: 30-50)

```typescript
export default function component(props: any) {
  var x = props.items
  return <div>{x.map(i => <div style={{color:'red'}}>{i.name}</div>)}</div>
}
```

Expected issues:

- `any` type usage
- Missing key in map
- `var` instead of `const`
- Inline styles
- Poor naming

---

## Common Issues to Watch For

❌ **False positives**: Good code scored low  
❌ **False negatives**: Bad code scored high  
❌ **Non-deterministic**: Same code, different scores  
❌ **Performance**: Slow analysis on large files  
❌ **Hardcoded weights**: Can't adjust importance  
❌ **No explanations**: Scores without context
