import { describe, it, expect } from "vitest";
import { checkRateLimit } from "@/lib/rate-limit";

describe("checkRateLimit", () => {
  it("allows the first request for a user", () => {
    const result = checkRateLimit("rl-test-1");
    expect(result.allowed).toBe(true);
  });

  it("allows up to 5 requests within the window", () => {
    const userId = "rl-test-2";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(userId).allowed).toBe(true);
    }
  });

  it("blocks the 6th request within the window", () => {
    const userId = "rl-test-3";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(userId);
    }
    const result = checkRateLimit(userId);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("returns retryAfterMs within the window duration", () => {
    const userId = "rl-test-4";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(userId);
    }
    const result = checkRateLimit(userId);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeDefined();
    expect(result.retryAfterMs).toBeLessThanOrEqual(60_000);
  });

  it("isolates limits between different users", () => {
    const userA = "rl-test-5a";
    const userB = "rl-test-5b";
    for (let i = 0; i < 5; i++) {
      checkRateLimit(userA);
    }
    expect(checkRateLimit(userA).allowed).toBe(false);
    expect(checkRateLimit(userB).allowed).toBe(true);
  });
});
