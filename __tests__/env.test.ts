import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("validateEnv", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when required Supabase vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).toThrow(/Missing required/);
  });

  it("throws when no AI provider is configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    delete process.env.GROQ_API_KEY;
    process.env.USE_MOCK_AI = "false";
    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).toThrow(/No AI provider/);
  });

  it("passes with Supabase + Groq configured", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    process.env.GROQ_API_KEY = "gsk_test";
    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).not.toThrow();
  });

  it("passes with Supabase + mock AI mode", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-key";
    delete process.env.GROQ_API_KEY;
    process.env.USE_MOCK_AI = "true";
    const { validateEnv } = await import("@/lib/env");
    expect(() => validateEnv()).not.toThrow();
  });
});
