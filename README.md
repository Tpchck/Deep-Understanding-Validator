<div align="center">
  <img src="public/duvlogo.png" alt="Deep Understanding Validator Logo" width="120" />

  # Deep Understanding Validator (DUV)

  **Stop memorizing. Start understanding.**

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-blue?logo=supabase)](https://supabase.com/)
  [![Groq](https://img.shields.io/badge/Powered%20by-Groq-orange)](https://groq.com/)

  [🚀 **Live Demo**](https://deep-understanding-validator.vercel.app)
</div>

---

## 🧐 What is DUV?

**Deep Understanding Validator** is an AI-powered interrogation tool designed to test if a developer truly understands the code they've written. 

Traditional tests check for syntax; DUV checks for **comprehension**. It analyzes your code and asks adversarial, context-aware questions to probe for edge cases, architectural logic, and hidden traps.

## ✨ Key Features

- **🧠 Contextual Interrogation**: Generates non-trivial questions based on the logic of your specific code.
- **🔄 Dynamic Follow-ups**: If your answer is vague, the AI probes deeper to find the limits of your understanding.
- **🛡️ Security Focused**: Built-in sanitization (DOMPurify) and rate limiting to prevent abuse.
- **⚡ High Performance**: Powered by Groq Llama models for near-instant responses.
- **💾 Persistent Sessions**: Option to store conversations via Supabase for later review.

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | [Next.js](https://nextjs.org/) (App Router), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **Backend** | [React Server Actions](https://react.dev/reference/react/use-server), [Zod](https://zod.dev/) |
| **AI Layer** | [Groq SDK](https://groq.com/), [Vercel AI SDK](https://sdk.vercel.ai/) |
| **Database** | [Supabase](https://supabase.com/) |
| **Testing** | [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) |

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/Tpchck/Deep-Understanding-Validator.git
cd duv-project
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key

# Options: "temp" or "supabase"
STORAGE_MODE=supabase
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to start your session.

## 🧪 Testing

- **Unit/Integration**: `npm run test`
- **Security Check**: `npm run test:security`
- **E2E (Playwright)**: `npm run test:e2e`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
