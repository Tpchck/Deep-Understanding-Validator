/** Validates required environment variables at server startup. */
export function validateEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  // At least one AI provider must be configured
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const isMock = process.env.USE_MOCK_AI === "true";

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}`
    );
  }

  if (!hasGroq && !hasGemini && !isMock) {
    throw new Error(
      "No AI provider configured. Set GROQ_API_KEY, GEMINI_API_KEY, or USE_MOCK_AI=true"
    );
  }
}
