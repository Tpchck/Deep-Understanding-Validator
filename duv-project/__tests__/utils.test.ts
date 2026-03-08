import { describe, it, expect } from "vitest";
import { validateCodeSubmission, formatDifficulty, looksLikeCode } from "@/lib/utils";

// ── validateCodeSubmission ──────────────────────────────

describe("validateCodeSubmission", () => {
  it("rejects undefined input", () => {
    const result = validateCodeSubmission(undefined);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/required/i);
  });

  it("rejects empty string", () => {
    const result = validateCodeSubmission("");
    expect(result.valid).toBe(false);
  });

  it("rejects whitespace-only string", () => {
    const result = validateCodeSubmission("        ");
    expect(result.valid).toBe(false);
  });

  it("rejects code shorter than 10 characters", () => {
    const result = validateCodeSubmission("x = 1");
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/too short/i);
  });

  it("rejects code longer than 10 000 characters", () => {
    const result = validateCodeSubmission("a".repeat(10_001));
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.error).toMatch(/too long/i);
  });

  it("accepts valid code at minimum boundary (10 chars)", () => {
    const result = validateCodeSubmission("int x = 10");
    expect(result.valid).toBe(true);
  });

  it("accepts valid code at maximum boundary (10 000 chars)", () => {
    const result = validateCodeSubmission("a".repeat(10_000));
    expect(result.valid).toBe(true);
  });

  it("accepts a normal code snippet", () => {
    const code = `function hello() { return "world"; }`;
    const result = validateCodeSubmission(code);
    expect(result.valid).toBe(true);
  });

  it("rejects non-string input (number)", () => {
    const result = validateCodeSubmission(42);
    expect(result.valid).toBe(false);
  });
});

// ── formatDifficulty ────────────────────────────────────

describe("formatDifficulty", () => {
  it("capitalizes 'easy' → 'Easy'", () => {
    expect(formatDifficulty("easy")).toBe("Easy");
  });

  it("capitalizes 'medium' → 'Medium'", () => {
    expect(formatDifficulty("medium")).toBe("Medium");
  });

  it("capitalizes 'hard' → 'Hard'", () => {
    expect(formatDifficulty("hard")).toBe("Hard");
  });
});

// ── looksLikeCode ───────────────────────────────────────

describe("looksLikeCode", () => {
  it("accepts a Python function", () => {
    expect(looksLikeCode("def hello():\n  return 42")).toBe(true);
  });

  it("accepts a JS snippet with braces and keywords", () => {
    expect(looksLikeCode("function add(a, b) { return a + b; }")).toBe(true);
  });

  it("accepts C++ code", () => {
    expect(looksLikeCode("#include <iostream>\nint main() { std::cout << 1; }")).toBe(true);
  });

  it("rejects plain English text", () => {
    expect(looksLikeCode("Hello, how are you doing today? I'm fine thanks.")).toBe(false);
  });

  it("rejects a random sentence", () => {
    expect(looksLikeCode("The weather is great and I love pizza very much")).toBe(false);
  });

  it("rejects too-short input", () => {
    expect(looksLikeCode("hi")).toBe(false);
  });

  it("accepts pseudo-code with keywords and operators", () => {
    expect(looksLikeCode("if x > 0 then return x; else return -x;")).toBe(true);
  });

  it("rejects a natural language question about code", () => {
    expect(looksLikeCode(
      "Explain how the use of Sets.difference() in this code could lead to unexpected results if the order of elements in the sets were to change."
    )).toBe(false);
  });

  it("rejects a prompt-style request", () => {
    expect(looksLikeCode(
      "How would you optimize this algorithm to run in O(n log n) time? Please describe the approach."
    )).toBe(false);
  });

  it("accepts multi-line Java code", () => {
    expect(looksLikeCode(
      "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"hello\");\n  }\n}"
    )).toBe(true);
  });
});
