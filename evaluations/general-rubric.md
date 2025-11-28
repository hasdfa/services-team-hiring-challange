# General Evaluation Rubric (70 Points)

This rubric applies to **all challenges**. Challenge-specific criteria add an additional 30 points.

---

## Code Quality (25 points)

### Excellent (22-25)

- Clean, readable code with consistent formatting
- Meaningful variable/function names
- Proper TypeScript usage (no `any` abuse)
- Small, focused functions and components
- DRY principles followed appropriately
- Follows existing codebase patterns

### Good (17-21)

- Generally clean code
- Good naming conventions
- TypeScript used correctly
- Some functions could be smaller
- Minor duplication

### Acceptable (12-16)

- Code works but is messy
- Some poor naming choices
- TypeScript types incomplete
- Long functions
- Noticeable duplication

### Poor (0-11)

- Difficult to read/understand
- Poor naming throughout
- Missing types or `any` everywhere
- Very long functions
- Significant duplication

---

## Architecture (20 points)

### Excellent (18-20)

- Clear separation of concerns
- Appropriate abstractions
- Follows existing patterns in codebase
- Easy to extend/modify
- State management is clear
- No unnecessary complexity

### Good (14-17)

- Reasonable architecture
- Generally follows patterns
- Some areas could be cleaner
- Mostly extensible

### Acceptable (10-13)

- Architecture works but rigid
- Deviates from existing patterns
- Hard to extend
- Some concerns mixed together

### Poor (0-9)

- No clear architecture
- Everything mixed together
- Very hard to extend
- Doesn't fit with codebase

---

## Error Handling (15 points)

### Excellent (13-15)

- All error cases handled
- Graceful degradation
- User-friendly error messages
- Proper logging
- No swallowed errors
- Edge cases covered

### Good (10-12)

- Most errors handled
- Good user messages
- Some edge cases missed
- Basic logging

### Acceptable (7-9)

- Basic error handling
- Some errors crash the app
- Generic error messages
- Limited logging

### Poor (0-6)

- Minimal error handling
- App crashes on errors
- No user feedback
- No logging

---

## Documentation (10 points)

### Excellent (9-10)

- Clear SOLUTION.md explaining approach
- Trade-offs documented
- Setup instructions work
- Code comments where needed
- Time tracking included

### Good (7-8)

- Good documentation
- Most decisions explained
- Setup works
- Some comments

### Acceptable (5-6)

- Basic documentation
- Missing explanations
- Setup mostly works
- Few comments

### Poor (0-4)

- No/minimal documentation
- No explanation of approach
- Setup unclear
- No comments

---

## Quick Reference

| Category           | Weight      | Focus                                |
| ------------------ | ----------- | ------------------------------------ |
| Code Quality       | 25 pts      | Readability, TypeScript, patterns    |
| Architecture       | 20 pts      | Structure, separation, extensibility |
| Error Handling     | 15 pts      | Coverage, UX, logging                |
| Documentation      | 10 pts      | SOLUTION.md, comments, setup         |
| **Subtotal**       | **70 pts**  |                                      |
| Challenge-Specific | 30 pts      | See per-challenge file               |
| **Total**          | **100 pts** |                                      |

---

## Common Deductions

| Issue                            | Deduction | Notes                       |
| -------------------------------- | --------- | --------------------------- |
| No TypeScript types              | -5 to -10 | Depending on extent         |
| Doesn't follow existing patterns | -5        | Should match codebase style |
| No error handling                | -5 to -10 | User shouldn't see crashes  |
| No SOLUTION.md                   | -10       | Required documentation      |
| Code doesn't run                 | -15       | Must be testable            |
| Missing time tracking            | -2        | Should estimate hours       |

---

## Bonus Points

Bonus points (up to +10) may be awarded for:

- Exceptional code quality beyond expectations
- Thoughtful bonus features that work well
- Outstanding documentation
- Particularly elegant solutions
- Comprehensive testing

Note: Bonuses cannot exceed 100 total points.
