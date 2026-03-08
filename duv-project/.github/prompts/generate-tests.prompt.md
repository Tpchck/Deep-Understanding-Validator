---
description: "Generate comprehensive Vitest tests for a component, action, or utility"
agent: "agent"
argument-hint: "File or feature to test"
---
Generate tests for the specified file or feature.

## Requirements
1. Put tests in `__tests__/` directory
2. Use Vitest + React Testing Library
3. Mock all external dependencies (Supabase, AI, fetch)
4. Cover: happy path, error cases, edge cases, validation
5. Use descriptive test names: `should [expected behavior] when [condition]`
6. Follow existing test patterns in the codebase
7. For components: test user interactions and rendered output, not implementation
8. For actions: test validation, error returns, and success paths
