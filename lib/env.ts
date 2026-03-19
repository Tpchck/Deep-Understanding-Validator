/** Validates required environment variables at server startup. */
export function validateEnv() {
  const critical = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ];

  const missingCritical = critical.filter((key) => !process.env[key]);
  if (missingCritical.length > 0) {
    throw new Error(
      `Missing strictly required environment variables:\n${missingCritical.map((k) => `  - ${k}`).join("\n")}`
    );
  }

  // Provide defaults for optional runtime vars to prevent build crashes
  if (!process.env.STORAGE_MODE) {
    console.warn("⚠️ STORAGE_MODE not set, defaulting to 'supabase'");
    process.env.STORAGE_MODE = "supabase";
  }
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn("⚠️ NEXT_PUBLIC_SITE_URL not set, defaulting to 'http://localhost:3000'");
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  }

  // At least one AI provider must be configured
  const hasGroq = !!process.env.GROQ_API_KEY;
  const isMock = process.env.USE_MOCK_AI === "true";

  if (!hasGroq && !isMock) {
    throw new Error(
      "No AI provider configured. Set GROQ_API_KEY, or USE_MOCK_AI=true"
    );
  }
}
