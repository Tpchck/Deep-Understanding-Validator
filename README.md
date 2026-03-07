# DUV: Deep Understanding Validator

AI-powered code analysis platform that validates and explains code through intelligent feedback.

##  Features

- **Multi-language support** - C++, Python, Java code analysis
- **AI-powered analysis** - Google Gemini & Groq LLM integration
- **Authentication** - Secure user accounts with Supabase
- **Code submission & results** - Submit code and receive detailed analysis
- **Dashboard** - Track your code submissions and history

##  Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes, Server Actions
- **Database:** Supabase (PostgreSQL)
- **AI Models:** Google Generative AI, Groq SDK
- **Auth:** Supabase SSR

##  Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the app.

##  Project Structure

- `/app` - Next.js app router pages and layouts
- `/components` - Reusable React components
- `/lib` - Utility functions and API clients
- `/actions` - Server actions for code submission
- `/types` - TypeScript type definitions

##  MVP Features

- Submit code for AI analysis
- View results and feedback
- User authentication system
- Responsive web interface

##  Build & Deploy

```bash
npm run build
npm start
```

## 🧹 Repository Maintenance

### Automatic branch cleanup

Stale branches from closed or merged pull requests are automatically deleted
by the **Cleanup closed PR branches** GitHub Actions workflow
(`.github/workflows/cleanup-branches.yml`).

### Deleting Pull Requests

GitHub **does not allow** permanent deletion of Pull Requests – this is a
platform limitation.  Closed PRs remain visible in the repository history by
design.  The recommended way to keep the repository tidy:

1. **Enable "Automatically delete head branches"** in
   *Settings → General → Pull Requests* so merged/closed PR branches are
   removed immediately.
2. The CI workflow above handles the same cleanup automatically for every
   closed PR.
