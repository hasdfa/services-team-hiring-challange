# Challenge 3: Code Quality Scoring - Evaluation

**See [general-rubric.md](./general-rubric.md) for base scoring (70 points)**

This file contains **Challenge-Specific Criteria (30 points)**

## Challenge-Specific Scoring

### Scoring Algorithm (15 points)

**Excellent (13-15)**

- 3+ metrics implemented correctly
- Logical weighting scheme
- Accurate analysis
- Meaningful scores

**Good (10-12)**

- 2-3 metrics working
- Basic weighting
- Mostly accurate

**Acceptable (7-9)**

- 1-2 metrics working
- Equal weighting
- Some accuracy issues

**Poor (0-6)**

- Metrics don't work
- No clear algorithm

### API Design (10 points)

**Excellent (9-10)**

- RESTful endpoints
- Type-safe
- Good error handling
- Clear documentation

**Good (7-8)**

- APIs work
- Basic types
- Some error handling

**Acceptable (5-6)**

- Basic APIs work
- Minimal error handling

**Poor (0-4)**

- APIs broken
- No error handling

### Extensibility (5 points)

**Excellent (5)**

- Easy to add new metrics
- Plugin architecture
- Well documented

**Good (3-4)**

- Can add metrics with effort
- Some structure

**Acceptable (2)**

- Hard to extend
- Tightly coupled

**Poor (0-1)**

- Not extensible

---

## What to Look For

### Must Have

- ✅ 3+ scoring dimensions working
- ✅ Database schema created & migrated
- ✅ POST /api/scores endpoint
- ✅ GET endpoints for retrieving scores
- ✅ Overall score calculation

### Should Have

- ✅ Accurate metric implementations
- ✅ Thoughtful weighting
- ✅ Error handling
- ✅ Metadata storage

### Nice to Have

- 🌟 4+ metrics
- 🌟 Visualization/charts
- 🌟 Thresholds (pass/fail)
- 🌟 Recommendations
- 🌟 CLI tool

---

## Testing Checklist

- [ ] Can score TypeScript code
- [ ] Multiple metrics work
- [ ] Scores saved to database
- [ ] Can retrieve score by ID
- [ ] Can get scores for chat
- [ ] Overall score is weighted average
- [ ] Metadata contains details
- [ ] Handles invalid code gracefully

---

## Common Issues

❌ **Inaccurate metrics** - Scores don't reflect quality
❌ **No weighting** - All metrics equal
❌ **Poor extensibility** - Hard to add new metrics
❌ **No metadata** - Can't debug scores
❌ **Crashes on invalid code** - No error handling
