import { describe, it, expect } from "vitest";
import type { AIResponse, Difficulty } from "@/types";
import type { QuestionRow } from "@/types/database.types";

describe("Domain types", () => {
  it("AIResponse has expected shape", () => {
    const response: AIResponse = {
      language: "Python",
      difficulty: "medium",
      topics: ["loops", "recursion"],
      questions: [
        {
          id: "q1",
          text: "What does this function return?",
          options: ["1", "2", "3", "4"],
          correctAnswer: 0,
          explanation: "It returns 1.",
        },
      ],
    };

    expect(response.questions).toHaveLength(1);
    expect(response.difficulty).toBe("medium");
  });

  it("Difficulty type only allows expected values", () => {
    const valid: Difficulty[] = ["easy", "medium", "hard"];
    expect(valid).toHaveLength(3);
  });

  it("QuestionRow matches expected database columns", () => {
    const row: QuestionRow = {
      id: "uuid-1",
      created_at: "2025-01-01T00:00:00Z",
      question_text: "What is the output?",
      code_snippet: "print('hello')",
      options: ["hello", "world"],
      correct_option_index: 0,
      explanation: "print outputs hello",
      difficulty: "easy",
      language: "Python",
    };

    expect(row.id).toBe("uuid-1");
    expect(row.options).toHaveLength(2);
  });
});
