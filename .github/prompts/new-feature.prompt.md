---
description: "Add a new feature end-to-end: component, action, route, types, and tests"
agent: "agent"
argument-hint: "Describe the feature in detail"
---
Implement a complete feature across all layers of the DUV application.

## Process
1. **Types first**: Define interfaces/types in `/types/index.ts`
2. **Action**: Create server action in `/actions/` with validation and error handling
3. **UI**: Build component in `/components/` (Server Component by default)
4. **Route**: Add page in `/app/` with metadata and loading state
5. **Tests**: Write tests in `/__tests__/`
6. **Verify**: Run `npm run build` and `npm run test` to check for errors

## Rules
- Follow all existing patterns — read similar code first
- Use TypeScript strictly, no `any`
- Mobile-first Tailwind styling
- Server actions for mutations, API routes only for external consumers
