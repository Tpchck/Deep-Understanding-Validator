---
description: "Use when writing or editing Vitest tests, test utilities, or test setup files. Covers testing patterns for React components, server actions, and utilities."
applyTo: "__tests__/**"
---
# Testing Guidelines

## Framework
- Vitest + React Testing Library + JSDOM environment.
- Test files: `__tests__/*.test.{ts,tsx}`.

## Patterns
```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('FeatureName', () => {
  it('should do something specific', () => {
    // Arrange → Act → Assert
  });
});
```

## Rules
- Mock external dependencies (Supabase, AI providers) — never call real APIs in tests.
- Use `vi.mock()` for module mocking.
- Test user-visible behavior, not implementation details.
- For server actions, test input validation and error paths.
- Name tests descriptively: `should return error when code is too short`.
