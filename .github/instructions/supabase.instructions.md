---
description: "Use when working with Supabase client, server client, auth, database queries, or middleware. Covers SSR patterns, cookie handling, and auth flow."
applyTo: ["lib/supabase/**", "middleware.ts", "app/api/auth/**"]
---
# Supabase Guidelines

## Client Usage
- **Browser**: `import { createClient } from "@/lib/supabase/client"` — for client components.
- **Server**: `import { createClient } from "@/lib/supabase/server"` — for server components, actions, route handlers. Always `await` it.

## Auth Flow
1. Middleware refreshes session on every request.
2. Sign-in/sign-up via server actions in `actions/auth.ts`.
3. OAuth callback handled by `app/api/auth/callback/route.ts`.
4. Protected routes redirect unauthenticated users to `/login`.

## Rules
- Never create Supabase clients inline — always use the shared factory functions.
- Server client requires async cookie handling — don't simplify it.
- Always check `error` field on Supabase responses before using `data`.
