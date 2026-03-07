import { describe, it, expect } from "vitest";
import { validateCodeSubmission, formatDifficulty, MIN_CODE_LENGTH } from "@/lib/utils";

describe("validateCodeSubmission", () => {
  it("returns error for null input", () => {
    expect(validateCodeSubmission(null)).toBe("Code cannot be empty");
  });

  it("returns error for empty string", () => {
    expect(validateCodeSubmission("")).toBe("Code cannot be empty");
  });

  it("returns error for whitespace-only string", () => {
    expect(validateCodeSubmission("     ")).toBe("Code cannot be empty");
  });

  it("returns error for code shorter than minimum length", () => {
    expect(validateCodeSubmission("short")).toBe(
      `Code must be at least ${MIN_CODE_LENGTH} characters`
    );
  });

  it("returns null for valid code", () => {
    expect(validateCodeSubmission("int main() { return 0; }")).toBeNull();
  });

  it("trims whitespace before checking length", () => {
    const padded = "   ab   ";
    expect(validateCodeSubmission(padded)).toBe(
      `Code must be at least ${MIN_CODE_LENGTH} characters`
    );
  });
});

describe("formatDifficulty", () => {
  it("capitalizes lowercase difficulty", () => {
    expect(formatDifficulty("easy")).toBe("Easy");
  });

  it("normalizes uppercase difficulty", () => {
    expect(formatDifficulty("HARD")).toBe("Hard");
  });

  it("handles mixed case", () => {
    expect(formatDifficulty("mEdIuM")).toBe("Medium");
  });
});
