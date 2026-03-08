import { describe, it, expect } from "vitest";
import type { Difficulty, Question, AIResponse } from "@/types";
import type { QuestionRow, Database } from "@/types/database.types";

describe("Type contracts", () => {
  it("Difficulty accepts valid literals", () => {
    const values: Difficulty[] = ["easy", "medium", "hard"];
    expect(values).toHaveLength(3);
  });

  it("Question has all required fields", () => {
    const q: Question = {
      id: "q1",
      text: "What is 1+1?",
      correctAnswer: "2, because addition of two ones equals two.",
      explanation: "Basic math",
    };
    expect(q.id).toBeDefined();
    expect(q.correctAnswer).toBeDefined();
  });

  it("AIResponse contains questions array", () => {
    const res: AIResponse = {
      language: "TypeScript",
      difficulty: "medium",
      topics: ["types"],
      questions: [],
    };
    expect(Array.isArray(res.questions)).toBe(true);
  });

  it("QuestionRow matches DB column names", () => {
    const row: QuestionRow = {
      id: "uuid-1",
      question_text: "text",
      code_snippet: "code",
      options: ["a", "b"],
      correct_option_index: 0,
      explanation: "exp",
      difficulty: "easy",
      language: "Python",
      created_at: new Date().toISOString(),
      user_id: null,
      session_id: null,
      turns: [],
      finished: false,
      follow_up_question: null,
    };
    expect(row.correct_option_index).toBe(0);
  });

  it("Database type exposes questions table", () => {
    type Tables = Database["public"]["Tables"];
    type QRow = Tables["questions"]["Row"];
    // If this compiles, the type is correctly shaped
    const check: QRow = {} as QuestionRow;
    expect(check).toBeDefined();
  });
});
