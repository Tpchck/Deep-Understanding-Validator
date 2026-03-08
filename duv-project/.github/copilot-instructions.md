# DUV Project — Copilot Instructions

## Tech Stack
- **Next.js 16** (App Router) + **React 19** + **TypeScript 5** (strict mode)
- **Supabase** for auth (SSR SDK) and database
- **Groq** (llama-3.3-70b) + **Google Gemini** (2.5-flash) for AI
- **Tailwind CSS 3.4** for styling
- **Vitest** + React Testing Library for tests

## Architecture Rules
- Default to **Server Components**. Use `'use client'` only for interactive UI.
- Server actions go in `/actions/` with `'use server'` directive at top.
- API routes live in `/app/api/` using standard Next.js route handlers.
- Auth is enforced by middleware (`middleware.ts`) — never bypass it.
- Types are centralized in `/types/`. Don't scatter type definitions across files.
- AI provider logic lives in `/lib/gemini/` and `/lib/groq/` — both implement the same interface.

## Code Conventions
- **Imports**: Always use `@/*` path alias. Use `import type` for type-only imports.
- **Components**: PascalCase filenames, default exports.
- **Utils/Actions**: camelCase functions, named exports.
- **Types**: PascalCase with descriptive suffixes (`Row`, `Result`, `Response`).
- **Constants**: UPPER_SNAKE_CASE.
- **Error handling**: Server actions return `{ error: string }` on failure. Never throw in actions — catch and return.
- **Environment vars**: Validated in `lib/env.ts`. Add new vars there, never access `process.env` directly elsewhere.

## Build & Test
```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint check
npm run test         # Vitest
```

## Key Patterns
- Rate limiting is in-memory (`lib/rate-limit.ts`). Use it for all user-facing actions.
- Supabase clients: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (SSR with cookie handling).
- AI responses must be parsed as JSON with error handling for malformed output.
- Form validation: code length 10–10,000 characters.
- Follow-up questions: max 2 per session, only when score is 15–79 with weak spots.

## Don'ts
- Don't use `any` type. Use `unknown` and narrow.
- Don't add client-side state management (Redux, Zustand) — use server state + React state.
- Don't add new dependencies without justification.
- Don't hardcode API keys or secrets — use env vars.
- Don't use `console.log` in production paths — use proper error returns.
