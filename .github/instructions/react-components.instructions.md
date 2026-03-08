---
description: "Use when creating or editing React components (.tsx files). Covers component patterns, hooks usage, server vs client components, and Tailwind styling for Next.js 16 + React 19."
applyTo: "**/*.tsx"
---
# React Component Guidelines

## Server vs Client
- Default to Server Component (no directive needed).
- Add `'use client'` only when using hooks, event handlers, or browser APIs.
- Keep client components small — extract server logic into separate server components or actions.

## Component Structure
```tsx
// 1. Directive (if needed)
'use client';

// 2. Imports (types separate)
import type { ComponentProps } from "@/types";
import { utility } from "@/lib/utils";

// 3. Component
export default function ComponentName({ prop }: ComponentProps) {
  // hooks first, then derived state, then handlers
  return ( /* JSX */ );
}
```

## Styling
- Use Tailwind utility classes directly in JSX.
- Mobile-first: start with base styles, add `sm:`, `md:`, `lg:` for larger screens.
- Use `cn()` from `@/lib/utils` for conditional classes.

## Forms
- Use server actions with `action={serverAction}` on forms.
- Client-side validation before submission; server-side validation in the action.
- Show loading states with `useFormStatus` or `useActionState`.
