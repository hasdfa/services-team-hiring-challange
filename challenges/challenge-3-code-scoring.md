# Challenge 3: Code Quality Scoring System 📊

**Difficulty**: Medium
**Focus**: Backend Engineering, Code Analysis, Metrics
**Time**: 4-6 hours

## Problem Statement

We need to assess the quality of AI-generated code artifacts. Implement a scoring system that evaluates code on multiple dimensions and provides actionable feedback.

## Your Task

Build a code scoring system with these features:

1. ✅ **Multi-Dimensional Analysis**: Score code on 3+ quality metrics
2. ✅ **Database Storage**: Persist scores with detailed metadata
3. ✅ **RESTful API**: Endpoints for scoring and retrieving results
4. ✅ **Extensibility**: Easy to add new scoring metrics

## Scoring Dimensions

Implement **at least 3** of these metrics:

### 1. Type Safety (TypeScript)

- Count `any` types
- Missing type annotations
- Explicit vs inferred types
- **Score**: 100 - (anyCount \* 10)

### 2. Linting Quality

- Run ESLint on code
- Count errors and warnings
- **Score**: 100 - (errors _ 5 + warnings _ 2)

### 3. Cyclomatic Complexity

- Measure code complexity
- Count decision points (if, while, for, etc.)
- **Score**: 100 - (complexity > threshold ? 20 : 0)

### 4. Test Coverage

- Check if tests exist
- Basic test file detection
- **Score**: Has tests ? 100 : 0

### 5. Documentation

- JSDoc coverage
- Comment quality
- README presence
- **Score**: (docsCount / functionsCount) \* 100

### 6. Security

- Run basic security checks
- Detect common vulnerabilities
- **Score**: 100 - (vulnerabilities \* 15)

## Database Schema

### New Table: `code_scores`

```typescript
// apps/backend/src/db/schema/code-scores.ts
export const codeScores = pgTable('code_scores', {
  id: text('id').primaryKey(),
  messageId: text('message_id')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
  chatId: text('chat_id')
    .notNull()
    .references(() => chats.id, { onDelete: 'cascade' }),

  // Scores (0-100)
  typeSafety: integer('type_safety'),
  linting: integer('linting'),
  complexity: integer('complexity'),
  testCoverage: integer('test_coverage'),
  documentation: integer('documentation'),
  security: integer('security'),

  // Overall score (weighted average)
  overall: integer('overall').notNull(),

  // Raw analysis data
  metadata: jsonb('metadata').$type<{
    typeSafety?: { anyCount: number; missingTypes: number };
    linting?: { errors: string[]; warnings: string[] };
    complexity?: { score: number; maxComplexity: number };
    security?: { vulnerabilities: string[] };
  }>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Generate migration:**

```bash
pnpm db:generate
pnpm db:migrate
```

## API Endpoints

### 1. Score Code

```typescript
POST /api/scores
Headers: { 'Content-Type': 'application/json' }
Body: {
  chatId: string,
  messageId: string,
  code: string,
  language?: string
}

Response: {
  ok: true,
  data: {
    id: string,
    scores: {
      typeSafety: 85,
      linting: 90,
      complexity: 75,
      overall: 83
    },
    metadata: { ... }
  }
}
```

### 2. Get Score

```typescript
GET /api/scores/:id

Response: {
  ok: true,
  data: CodeScore
}
```

### 3. Get Scores for Message

```typescript
GET /api/scores/message/:messageId

Response: {
  ok: true,
  data: CodeScore | null
}
```

### 4. Get Scores for Chat

```typescript
GET /api/scores/chat/:chatId

Response: {
  ok: true,
  data: CodeScore[]
}
```

## Implementation Guide

### Step 1: Create Analyzers

```typescript
// apps/backend/src/lib/analyzers/type-safety.ts
export async function analyzeTypeSafety(code: string) {
  const anyMatches = code.match(/:\s*any/g) || [];
  const anyCount = anyMatches.length;

  const score = Math.max(0, 100 - anyCount * 10);

  return {
    score,
    metadata: { anyCount },
  };
}
```

```typescript
// apps/backend/src/lib/analyzers/linting.ts
import { ESLint } from 'eslint';

export async function analyzeLinting(code: string) {
  const eslint = new ESLint({
    baseConfig: {
      extends: ['eslint:recommended'],
      parser: '@typescript-eslint/parser',
    },
  });

  const results = await eslint.lintText(code);
  const errors = results[0].errorCount;
  const warnings = results[0].warningCount;

  const score = Math.max(0, 100 - errors * 5 - warnings * 2);

  return {
    score,
    metadata: {
      errors: results[0].messages.filter((m) => m.severity === 2),
      warnings: results[0].messages.filter((m) => m.severity === 1),
    },
  };
}
```

### Step 2: Scoring Engine

```typescript
// apps/backend/src/lib/scoring-engine.ts
import { analyzeTypeSafety } from './analyzers/type-safety';
import { analyzeLinting } from './analyzers/linting';
import { analyzeComplexity } from './analyzers/complexity';

const WEIGHTS = {
  typeSafety: 0.3,
  linting: 0.3,
  complexity: 0.2,
  testCoverage: 0.1,
  documentation: 0.1,
};

export async function scoreCode(code: string) {
  const results = await Promise.all([
    analyzeTypeSafety(code),
    analyzeLinting(code),
    analyzeComplexity(code),
  ]);

  const scores = {
    typeSafety: results[0].score,
    linting: results[1].score,
    complexity: results[2].score,
  };

  const overall = Object.entries(scores).reduce(
    (sum, [key, score]) => sum + score * WEIGHTS[key],
    0
  );

  return {
    scores,
    overall: Math.round(overall),
    metadata: {
      typeSafety: results[0].metadata,
      linting: results[1].metadata,
      complexity: results[2].metadata,
    },
  };
}
```

### Step 3: API Route

```typescript
// apps/backend/src/routes/scores.ts
export default async function scoresRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request) => {
    const { chatId, messageId, code } = request.body;

    // Score the code
    const { scores, overall, metadata } = await scoreCode(code);

    // Save to database
    const result = await db
      .insert(codeScores)
      .values({
        id: nanoid(),
        chatId,
        messageId,
        ...scores,
        overall,
        metadata,
      })
      .returning();

    return { ok: true, data: result[0] };
  });

  fastify.get('/:id', async (request) => {
    const { id } = request.params;

    const score = await db.query.codeScores.findFirst({
      where: eq(codeScores.id, id),
    });

    if (!score) {
      throw new ResponseError('Score not found', 404);
    }

    return { ok: true, data: score };
  });
}
```

## Implementation Options

### Option A: Tool-Based Analysis

**Use existing tools**: ESLint, TypeScript Compiler API, complexity-report
**Pros**: Battle-tested, accurate, comprehensive
**Cons**: External dependencies

### Option B: Custom Analyzers

**Write your own parsers**: RegEx, AST parsing
**Pros**: Full control, no dependencies
**Cons**: More work, potential inaccuracies

### Option C: Hybrid Approach

**Mix of tools and custom logic**
**Pros**: Balance of accuracy and flexibility
**Cons**: More complex

## Evaluation Criteria

| Category          | Weight | What We Look For                   |
| ----------------- | ------ | ---------------------------------- |
| **Scoring Logic** | 35%    | Accurate, meaningful metrics       |
| **Code Quality**  | 30%    | Clean, maintainable implementation |
| **API Design**    | 20%    | RESTful, type-safe, documented     |
| **Extensibility** | 15%    | Easy to add new metrics            |

## Testing Your Implementation

**Test Case 1: Perfect Code**

```typescript
const code = `
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User {
  return { id, name: "Test" };
}
`;

// Expected: High scores across all dimensions
```

**Test Case 2: Poor Code**

```typescript
const code = `
function process(data: any) {
  if (data.x) {
    if (data.y) {
      if (data.z) {
        // Deeply nested...
      }
    }
  }
}
`;

// Expected: Low scores for type safety and complexity
```

## Deliverables

1. **Scoring Engine**: Multi-metric analysis implementation
2. **API Endpoints**: Full CRUD for code scores
3. **Database Schema**: Migration applied
4. **SOLUTION.md**: Algorithm explanation, weighting rationale

## Bonus Points

- 🌟 **Visualization**: API endpoint returning score charts
- 🌟 **Thresholds**: Pass/fail based on score ranges
- 🌟 **Trends**: Track score improvements over time
- 🌟 **Recommendations**: Suggest specific improvements
- 🌟 **CLI Tool**: Score code from command line

## Common Pitfalls

❌ **Incorrect weighting**: All metrics treated equally
✅ **Solution**: Weight based on importance

❌ **No error handling**: Analyzer crashes on invalid code
✅ **Solution**: Try-catch, return partial scores

❌ **Slow analysis**: Blocking operations
✅ **Solution**: Async/parallel analysis

---

Good luck! 📊
