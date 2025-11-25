# General Evaluation Rubric

This rubric applies to all challenges. See challenge-specific evaluation files for additional criteria.

## 1. Code Quality (30 points)

### Excellent (27-30 points)

- ✅ TypeScript used correctly with minimal `any` types
- ✅ Clear naming conventions and consistent style
- ✅ Proper separation of concerns
- ✅ Reusable abstractions where appropriate
- ✅ ESLint passes with zero warnings
- ✅ No code duplication

### Good (21-26 points)

- TypeScript mostly correct, few `any` types
- Generally clean and readable code
- Some code duplication or minor organization issues
- ESLint passes with minor warnings

### Acceptable (15-20 points)

- TypeScript used but with many `any` types
- Code works but could be cleaner
- Significant duplication or unclear structure
- Several ESLint warnings

### Needs Improvement (0-14 points)

- Inconsistent or messy code
- Hard to follow logic
- Poor naming or organization
- Many linting errors

---

## 2. Architecture (30 points)

### Excellent (27-30 points)

- ✅ Well-thought-out system design
- ✅ Clear separation of concerns
- ✅ Scalable and extensible
- ✅ Appropriate design patterns
- ✅ State management is clean and predictable
- ✅ Clear file/folder organization

### Good (21-26 points)

- Solid architecture with minor gaps
- Generally good separation of concerns
- Could be more scalable or extensible
- Patterns mostly appropriate

### Acceptable (15-20 points)

- Basic architecture that works
- Some mixing of concerns
- Limited extensibility
- Pattern usage could be improved

### Needs Improvement (0-14 points)

- Poor or unclear architecture
- Tight coupling between components
- Difficult to extend or maintain
- Inappropriate pattern usage

---

## 3. Problem Solving (20 points)

### Excellent (18-20 points)

- ✅ Handles all major edge cases
- ✅ Robust error handling and recovery
- ✅ Considers performance implications
- ✅ Addresses security concerns
- ✅ Graceful degradation

### Good (14-17 points)

- Handles most edge cases
- Good error handling
- Some performance considerations
- Basic security awareness

### Acceptable (10-13 points)

- Handles happy path well
- Basic error handling
- Limited edge case coverage
- Some security or performance oversights

### Needs Improvement (0-9 points)

- Only happy path works
- Poor or missing error handling
- Ignores edge cases
- Security or performance issues

---

## 4. Documentation (10 points)

### Excellent (9-10 points)

- ✅ Clear, comprehensive SOLUTION.md
- ✅ Code comments where needed (not for obvious code)
- ✅ Architecture diagrams or explanations
- ✅ Trade-offs and decisions explained
- ✅ Future improvements discussed
- ✅ Testing instructions provided

### Good (7-8 points)

- Good SOLUTION.md covering main points
- Some code comments
- Basic architecture explanation
- Main decisions explained

### Acceptable (5-6 points)

- Basic SOLUTION.md
- Minimal code comments
- Limited architecture explanation
- Few decisions explained

### Needs Improvement (0-4 points)

- Incomplete or unclear documentation
- No SOLUTION.md or very brief
- No code comments
- Decisions not explained

---

## 5. Engineering Judgment (10 points)

### Excellent (9-10 points)

- ✅ Appropriate tool/library selection
- ✅ Clear understanding of trade-offs
- ✅ YAGNI principle applied well
- ✅ Realistic about limitations
- ✅ Acknowledges future improvements
- ✅ Time management evident

### Good (7-8 points)

- Generally good tool selection
- Understands most trade-offs
- Mostly avoids over-engineering
- Mentions some limitations

### Acceptable (5-6 points)

- Tools work but may not be optimal
- Limited trade-off analysis
- Some over-engineering or under-engineering
- Few limitations acknowledged

### Needs Improvement (0-4 points)

- Poor tool selection
- No trade-off consideration
- Significant over/under-engineering
- No awareness of limitations

---

## Red Flags (Automatic Concerns)

These issues significantly impact evaluation:

- ❌ Code doesn't run or requires major fixes
- ❌ Security vulnerabilities (SQL injection, XSS, etc.)
- ❌ No error handling whatsoever
- ❌ Hardcoded credentials or secrets
- ❌ No attempt at TypeScript type safety
- ❌ Missing SOLUTION.md
- ❌ Plagiarized code without attribution
- ❌ Exceeded time limit significantly (>10 hours)

---

## Green Flags (Positive Indicators)

These demonstrate exceptional engineering:

- ✅ Tests included (not required but valued)
- ✅ Performance optimizations with justification
- ✅ Security considerations documented
- ✅ Multiple approaches evaluated
- ✅ Clean Git history with meaningful commits
- ✅ Bonus features implemented thoughtfully
- ✅ Code is production-ready quality
- ✅ Clear time management and prioritization

---

## Calibration Notes

### Fair Evaluation

1. **Compare similar challenges** - Don't compare Challenge 1 to Challenge 4 directly
2. **Adjust for seniority** - Staff engineers should show deeper architectural thinking
3. **Consider time** - 4-6 hours is limited, perfection isn't expected
4. **Look for potential** - Can they learn and grow?
5. **Be consistent** - Use same rubric for all candidates

### Context Matters

- **Partial solutions with great documentation** > Complete solutions with no explanation
- **Clean, simple solutions** > Over-engineered complex ones
- **Evidence of learning** > Showing off knowledge

### When in Doubt

- Refer to specific rubric criteria
- Compare to previous submissions
- Discuss with another evaluator
- Be generous but fair

---

## Feedback Template

```markdown
## Challenge Submission Feedback

**Challenge**: [Number and Name]
**Total Score**: [X]/100

### Strengths

- [Specific positive observation]
- [Another strength]
- [Another strength]

### Areas for Improvement

- [Specific constructive feedback]
- [Another area]
- [Another area]

### Standout Moments

- [Something particularly impressive]

### Decision: [Hire/No Hire/Maybe]

**Reasoning**: [Brief explanation of decision]
```
