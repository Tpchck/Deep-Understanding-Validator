# DUV — Deep Understanding Validator

> AI-powered code analysis tool that generates conceptual multiple-choice questions  
> to validate whether you **truly understand** the code you write.

---

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Framework   | Next.js 16 (App Router, Turbopack, React 19)    |
| Language    | TypeScript 5, strict mode                       |
| Styling     | Tailwind CSS 3                                  |
| Database    | Supabase (PostgreSQL + Row-Level Security)      |
| AI — primary| Groq SDK → Llama 3.3 70B                        |
| AI — alt    | Google Generative AI → Gemini 2.5 Flash         |
| Auth        | Supabase SSR (cookie-based)                     |
| CI          | GitHub Actions — lint + test on every push / PR |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Browser (React 19)                  │
│  page.tsx ──form──▶ server action  ──redirect──▶ result  │
└───────────────┬──────────────────────────┬───────────────┘
                │  processCodeSubmission   │  QuizInterface
                ▼                          ▼
        ┌──────────────┐          ┌──────────────┐
        │  Groq / Gemini│          │   Supabase   │
        │  (LLM API)   │          │  (PostgreSQL) │
        └──────────────┘          └──────────────┘
```

1. User pastes a code snippet and hits **INITIATE ANALYSIS**.  
2. A Server Action sends the code to the **Groq Llama 3.3** (or Gemini) LLM.  
3. The LLM returns structured JSON: language, difficulty, topics, and questions.  
4. The first question is persisted to the **Supabase `questions`** table.  
5. The user is redirected to `/result/<id>` where the interactive quiz renders.

---

## Database Schema

```sql
CREATE TABLE questions (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text text    NOT NULL,
  code_snippet  text    NOT NULL,
  options       text[]  NOT NULL,
  correct_option_index integer NOT NULL,
  explanation   text    NOT NULL,
  difficulty    text    NOT NULL,       -- 'easy' | 'medium' | 'hard'
  language      text    NOT NULL,
  created_at    timestamptz DEFAULT now()
);
```

---

## Getting Started

### Prerequisites

- **Node.js ≥ 20** and npm
- A [Supabase](https://supabase.com) project (free tier works)
- API key for [Groq](https://console.groq.com) **or** [Google AI Studio](https://aistudio.google.com)

### Installation

```bash
git clone https://github.com/<your-user>/Deep-Understanding-Validator.git
cd Deep-Understanding-Validator/duv-project
npm install
```

### Environment Variables

Copy the example and fill in your keys:

```bash
cp .env.example .env.local
```

| Variable                          | Required | Description                  |
| --------------------------------- | -------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | ✅       | Supabase project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | ✅       | Supabase anon / public key   |
| `GROQ_API_KEY`                    | ✅       | Groq API key                 |
| `GEMINI_API_KEY`                  | optional | Google Generative AI key     |
| `USE_MOCK_AI`                     | optional | Set `true` to skip real LLM  |

### Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
npm test           # Vitest
```

---

## Project Structure

```
duv-project/
├── actions/
│   └── submit-code.ts          # Server Action: validate → LLM → DB → redirect
├── app/
│   ├── layout.tsx              # Root layout (Geist + JetBrains Mono fonts)
│   ├── page.tsx                # Home — code submission form
│   ├── result/[id]/page.tsx    # Quiz page (server component → Supabase fetch)
│   ├── (auth)/                 # Auth route group (login / register)
│   ├── api/                    # RESTful API routes
│   └── dashboard/              # User analytics dashboard
├── components/
│   └── features/
│       └── QuizInterface.tsx   # Client component: interactive quiz UI
├── lib/
│   ├── utils.ts                # validateCodeSubmission(), formatDifficulty()
│   ├── groq/index.ts           # Groq Llama 3.3 integration
│   ├── gemini/index.ts         # Gemini 2.5 Flash integration (+ mock mode)
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server Supabase client (cookie-based)
├── types/
│   ├── index.ts                # Difficulty, Question, AIResponse
│   └── database.types.ts       # QuestionRow, Database (Supabase generics)
├── __tests__/                  # Vitest + React Testing Library
├── .github/workflows/ci.yml   # GitHub Actions CI pipeline
└── .env.example                # Template for required env vars
```

---

## Testing

```bash
npm test              # run all tests
npm test -- --watch   # watch mode
```

Tests cover utility functions, type contracts, and QuizInterface component rendering.

---

## License

[MIT](../LICENSE)
