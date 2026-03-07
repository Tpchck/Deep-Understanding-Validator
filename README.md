# DUV: Deep Understanding Validator

An AI-powered code analysis platform that helps developers deeply understand their own code.
Paste a code snippet, and the AI generates conceptual multiple-choice questions to test your knowledge — then explains the correct answers.

## How It Works

1. **Submit code** — paste a C++, Python, or Java snippet into the editor
2. **AI analysis** — the LLM detects the language, evaluates difficulty, and generates 3 conceptual questions
3. **Quiz** — answer multiple-choice questions about your own code
4. **Learn** — see detailed explanations for correct and incorrect answers

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Actions) |
| UI | [React 19](https://react.dev/) + [Tailwind CSS 3](https://tailwindcss.com/) |
| Language | TypeScript 5 (strict mode) |
| Database | [Supabase](https://supabase.com/) (PostgreSQL) |
| AI (primary) | [Groq](https://groq.com/) — Llama 3.3-70b-versatile |
| AI (secondary) | [Google Gemini](https://ai.google.dev/) — Gemini 2.5 Flash |
| Auth | Supabase SSR |

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A free [Supabase](https://supabase.com/) project
- A free [Groq API key](https://console.groq.com/keys) (or [Gemini API key](https://ai.google.dev/))

### 1. Clone & install

```bash
git clone https://github.com/Tpchck/Deep-Understanding-Validator.git
cd Deep-Understanding-Validator
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your keys — see [`.env.example`](.env.example) for the full list.

### 3. Set up Supabase

Create a `questions` table in your Supabase project:

```sql
CREATE TABLE questions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  question_text       text NOT NULL,
  code_snippet        text NOT NULL,
  options             jsonb NOT NULL,
  correct_option_index integer NOT NULL,
  explanation         text NOT NULL,
  difficulty          text NOT NULL,
  language            text NOT NULL
);
```

### 4. Run

```bash
npm run dev          # development server  → http://localhost:3000
npm run build        # production build
npm start            # production server
npm run lint         # ESLint check
npm test             # unit tests (Vitest)
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx          #   Root layout (fonts, metadata)
│   ├── page.tsx            #   Home — code submission form
│   ├── globals.css         #   Global styles
│   └── result/[id]/        #   Dynamic result/quiz page
│       └── page.tsx
├── components/
│   └── features/
│       └── QuizInterface.tsx   # Interactive quiz component
├── actions/
│   └── submit-code.ts      # Server Action: validate → AI → Supabase
├── lib/
│   ├── utils.ts             # Validation & formatting helpers
│   ├── groq/index.ts        # Groq (Llama 3.3) client
│   ├── gemini/index.ts      # Google Gemini client
│   └── supabase/
│       ├── server.ts        # Server-side Supabase client
│       └── client.ts        # Browser-side Supabase client
├── types/
│   ├── index.ts             # Domain types (Question, AIResponse)
│   └── database.types.ts    # Supabase table types
├── __tests__/               # Unit tests (Vitest)
└── .github/workflows/       # CI pipeline
```

## Architecture

```
┌──────────┐   form submit    ┌──────────────────┐   prompt    ┌──────────┐
│  Browser  │ ───────────────► │  Server Action    │ ──────────► │  Groq /  │
│ (React)   │                  │  (submit-code.ts) │             │  Gemini  │
└──────────┘ ◄─────────────── └──────────────────┘ ◄────────── └──────────┘
               redirect            │     ▲  JSON
               /result/:id        ▼     │
                              ┌──────────────────┐
                              │    Supabase       │
                              │   (PostgreSQL)    │
                              └──────────────────┘
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `GROQ_API_KEY` | ✅ | Groq API key (primary AI provider) |
| `GEMINI_API_KEY` | — | Google Gemini API key (alternative provider) |
| `USE_MOCK_AI` | — | Set to `true` to use mock AI responses during development |

## Development Notes

- **Mock mode** — set `USE_MOCK_AI=true` in `.env.local` to develop the UI without consuming API credits (used by the Gemini provider).
- **AI providers** — Groq is configured as the primary provider in `actions/submit-code.ts`. To switch to Gemini, change the import path from `@/lib/groq` to `@/lib/gemini`.
- **Database types** — TypeScript types for the Supabase schema are defined in `types/database.types.ts`.

## License

MIT
