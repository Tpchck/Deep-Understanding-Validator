---
description: "Generate a new server action with validation, error handling, rate limiting, and proper types"
agent: "agent"
argument-hint: "Describe the action: what it does, inputs, outputs"
---
Create a new server action in the `/actions/` directory.

## Requirements
1. Add `'use server'` directive at file top
2. Define input validation with clear error messages
3. Add rate limiting via `checkRateLimit()` if user-facing
4. Return typed results: `{ error: string }` on failure, `{ data: T }` on success
5. Wrap external calls (AI, DB) in try/catch
6. Never throw — always return error objects
7. Check existing actions for patterns before writing

## Template
```typescript
'use server';

import { checkRateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function newAction(input: InputType) {
  // 1. Validate
  // 2. Auth check
  // 3. Rate limit
  // 4. Business logic
  // 5. Return result
}
```
