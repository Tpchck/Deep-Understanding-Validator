---
description: "Generate a new Next.js page with proper routing, metadata, loading state, and error handling"
agent: "agent"
argument-hint: "Describe the page: route path, purpose, auth requirement"
---
Create a new Next.js App Router page based on the user's description.

## Requirements
1. Determine the correct route path and create files in `app/`
2. Use Server Component by default. Add `'use client'` only if the page needs interactivity.
3. Include `metadata` export for SEO
4. Create a `loading.tsx` sibling for Suspense fallback
5. If the page needs auth, check session via Supabase server client
6. Use Tailwind CSS for styling, mobile-first approach
7. Follow existing patterns in the codebase — check similar pages first

## Template
```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title — DUV",
  description: "Page description",
};

export default async function PageName() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Page content */}
    </main>
  );
}
```
