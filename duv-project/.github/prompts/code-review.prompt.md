---
description: "Review code for bugs, security issues, performance problems, and adherence to project conventions"
agent: "agent"
argument-hint: "File or feature to review"
---
Perform a thorough code review of the specified file or feature.

## Check for
1. **Security**: SQL injection, XSS, prompt injection, auth bypasses, exposed secrets
2. **Types**: Missing types, `any` usage, incorrect narrowing
3. **Error handling**: Unhandled promises, missing try/catch, thrown errors in actions
4. **Performance**: Unnecessary re-renders, missing Suspense boundaries, N+1 queries
5. **Conventions**: Import aliases, naming, file organization per project rules
6. **Edge cases**: Empty states, loading states, error states in UI

## Output Format
List issues by severity (Critical → Warning → Suggestion) with specific line references and fixes.
