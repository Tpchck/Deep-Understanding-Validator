---
description: "Use when working with AI provider integration — Groq, Gemini, prompt engineering, question generation, answer evaluation, or follow-up generation."
applyTo: ["lib/gemini/**", "lib/groq/**", "actions/evaluate-answer.ts", "actions/generate-followup.ts"]
---
# AI Provider Guidelines

## Architecture
- **Groq** (primary): `lib/groq/index.ts` — llama-3.3-70b-versatile
- **Gemini** (fallback): `lib/gemini/index.ts` — gemini-2.5-flash
- Both implement the same generation interface for swappability.

## Prompt Rules
- Use system messages to define the AI's role (e.g., "You are a CS professor...").
- Enforce JSON output format in the prompt AND via provider API config.
- Always wrap `JSON.parse()` in try/catch — AI output is untrusted.
- Include scoring criteria in evaluation prompts (0-100 scale).

## Mock Mode
- `USE_MOCK_AI=true` env var returns hardcoded responses for testing.
- Always support mock mode when adding new AI-powered features.

## Security
- Never pass raw user input directly into prompts without context framing.
- Sanitize code submissions before sending to AI providers.
