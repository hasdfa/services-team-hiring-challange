# MUI Assistant: Evaluation Guidelines

This folder contains evaluation rubrics for the MUI Assistant hiring challenges.

## Structure

- **[general-rubric.md](./general-rubric.md)**: Base scoring criteria (70 points) applicable to all challenges
- **Challenge-specific files**: Additional criteria (30 points) for each challenge

## Scoring Overview

**Total: 100 points**

| Category           | Points | Source         |
| ------------------ | ------ | -------------- |
| Code Quality       | 25     | General Rubric |
| Architecture       | 20     | General Rubric |
| Error Handling     | 15     | General Rubric |
| Documentation      | 10     | General Rubric |
| Challenge-Specific | 30     | Per-Challenge  |

## Challenge Evaluations

| Challenge                  | Evaluation File                                          | Key Focus                                          |
| -------------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| Challenge 1: Build Queue   | [challenge-1-evaluation.md](./challenge-1-evaluation.md) | Queue design, state management, caching strategy   |
| Challenge 2: Auto-Fix      | [challenge-2-evaluation.md](./challenge-2-evaluation.md) | AI integration, streaming, full-stack coordination |
| Challenge 3: Code Scoring  | [challenge-3-evaluation.md](./challenge-3-evaluation.md) | Analysis accuracy, API design, extensibility       |
| Challenge 4: Visual Editor | [challenge-4-evaluation.md](./challenge-4-evaluation.md) | Component architecture, UX design, code sync       |

## Using These Rubrics

1. **Start with General Rubric**: Apply the 70-point base criteria
2. **Add Challenge Points**: Apply the 30-point challenge-specific criteria
3. **Document Rationale**: Note specific examples for major deductions
4. **Consider Context**: Account for time constraints and stated assumptions

## Grade Boundaries

| Score  | Rating             | Description                            |
| ------ | ------------------ | -------------------------------------- |
| 90-100 | Exceptional        | Production-ready, exceeds expectations |
| 80-89  | Strong             | Well-executed with minor gaps          |
| 70-79  | Acceptable         | Meets core requirements                |
| 60-69  | Below Expectations | Missing key requirements               |
| <60    | Insufficient       | Significant issues                     |

## Red Flags

Automatic disqualifiers or major concerns:

- ❌ Code doesn't compile/run
- ❌ Missing core functionality
- ❌ Security vulnerabilities
- ❌ No documentation
- ❌ Plagiarism detected

## Green Flags

Indicators of strong submissions:

- ✅ Clear problem understanding
- ✅ Clean code with good patterns
- ✅ Thoughtful trade-off analysis
- ✅ Working tests
- ✅ Bonus features implemented
