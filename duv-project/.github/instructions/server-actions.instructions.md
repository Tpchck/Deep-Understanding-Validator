---
description: "Use when creating or editing server actions in the /actions/ directory. Covers validation, error handling, AI integration, and Supabase patterns."
applyTo: "actions/**"
---
# Server Action Guidelines

## Structure
```typescript
'use server';

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/types";

export async function actionName(formData: FormData): Promise<ActionResult> {
  // 1. Parse & validate input
  // 2. Auth check (if needed)
  // 3. Rate limit check (if user-facing)
  // 4. Business logic / AI call
  // 5. Return result or redirect
}
```

## Rules
- Always add `'use server'` at the top of the file.
- Never throw errors — catch and return `{ error: "message" }`.
- Validate all inputs before processing.
- Use `checkRateLimit()` from `@/lib/rate-limit` for user-facing endpoints.
- For AI calls, always handle malformed JSON responses with try/catch around `JSON.parse`.
- Use `redirect()` from `next/navigation` for post-auth redirects (it throws internally — don't catch it).
