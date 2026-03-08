# Deep Understanding Validator (DUV)

Deep Understanding Validator is an AI-powered code analysis tool designed to test and validate a developer's genuine understanding of the code they write. Instead of focusing on syntax or generic trivia, it evaluates comprehension through open-ended questions about internal mechanics, potential edge cases, and architectural decisions.

## How It Works

1. **Submission**: You paste a code snippet (e.g., C++, Python, JavaScript) into the interface.
2. **Analysis**: The system analyzes the structure and logic of the code using Groq's LLM API.
3. **Interrogation**: It generates specific, context-aware questions. These might involve predicting the outcome of an adversarial modification or explaining a hidden boundary trap.
4. **Evaluation**: Your textual answer is assessed for depth of understanding. If your answer is vague or misses the mark, the system will generate targeted follow-up questions to probe further.

## Tech Stack

This project is built using a modern React ecosystem, focusing on performance and seamless server-client integration:

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Database & Authentication**: Supabase
- **AI Integration**: Groq SDK (Llama models)
- **Testing**: Vitest (Unit) and Playwright (E2E)

## Project Structure

- `app/` - Next.js App Router pages, layouts, and API routes.
- `actions/` - React Server Actions handling business logic, AI evaluation, and database mutations.
- `components/` - Reusable UI components and complex interactive features like the quiz interface.
- `lib/` - Utility functions, API clients setup, and environment validation.
- `supabase/` - Database migration scripts.
- `__tests__/` and `e2e/` - Test suites.

## Local Development

### Prerequisites

You will need Node.js installed, as well as accounts for Supabase (for database/auth) and Groq (for the AI API).

### Setup

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure environment variables. Copy `.env.example` to `.env.local` and fill in your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key

# Optional: set to "true" to use mocked AI responses for UI testing without spending API credits
USE_MOCK_AI=false

# Storage mode: "temp" = in-memory store, "supabase" = real DB
STORAGE_MODE=supabase
```

3. Run the development server:
```bash
npm run dev
```

4. Open `http://localhost:3000` in your browser.

## Testing

The project includes both unit tests and end-to-end testing:

- **Unit/Integration Tests**: Run `npm run test` or `npm run test:security` for specific security validations.
- **End-to-End Tests**: Run `npm run test:e2e` to execute the Playwright suite.

## Architecture Notes

- **Server Actions**: Most data mutations (saving turns, evaluating answers) bypass traditional API routes in favor of Next.js Server Actions to reduce client-side bundle size.
- **Security**: The application utilizes DOMPurify to sanitize HTML rendered during the quiz conversation, preventing XSS vulnerabilities from AI-generated or user-submitted content.
- **Rate Limiting**: Custom rate limiting logic is applied at the API and Server Action level to prevent abuse of the AI endpoints.
