import { describe, it, expect } from "vitest";
import { detectLanguage } from "@/lib/utils";
import type { Difficulty, EvaluationResult, QuizTurn } from "@/types";
import type { QuestionRow, Database } from "@/types/database.types";

describe("Type contracts", () => {
  it("Difficulty type allows only valid literals", () => {
    const values: Difficulty[] = ["easy", "medium", "hard"];
    expect(values).toHaveLength(3);
    // @ts-expect-error "invalid" is not assignable to Difficulty
    const _invalid: Difficulty = "invalid";
    void _invalid;
  });

  it("EvaluationResult includes all required fields", () => {
    const result: EvaluationResult = {
      score: 75,
      feedback: "Partial understanding.",
      weakSpots: ["Missing detail about threading"],
      understood: false,
    };
    expect(result.score).toBe(75);
    expect(result.understood).toBe(false);
    expect(result.weakSpots).toHaveLength(1);
  });

  it("QuizTurn tracks question/answer pair with metadata", () => {
    const turn: QuizTurn = {
      question: "What does StringBuffer.delete() do?",
      userAnswer: "It removes characters from the buffer",
      score: 60,
      feedback: "Partial answer",
      weakSpots: ["Didn't mention thread safety"],
      isFollowUp: false,
    };
    expect(turn.isFollowUp).toBe(false);
    expect(turn.weakSpots).toContain("Didn't mention thread safety");
  });

  it("QuestionRow matches DB schema columns", () => {
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
    expect(row.finished).toBe(false);
  });

  it("Database type exposes questions table Row matching QuestionRow", () => {
    type Tables = Database["public"]["Tables"];
    type QRow = Tables["questions"]["Row"];
    // This is a compile-time check: if QuestionRow doesn't match the DB schema, TS fails
    const check: QRow = {} as QuestionRow;
    expect(check).toBeDefined();
  });
});

describe("detectLanguage", () => {
  it("detects Java from class/System.out patterns", () => {
    const code = `public class Main {
  public static void main(String[] args) {
    System.out.println("hello");
  }
}`;
    expect(detectLanguage(code)).toBe("Java");
  });

  it("detects Python from def/import/print", () => {
    const code = `import os\ndef greet(name):\n  print(f"Hello {name}")`;
    expect(detectLanguage(code)).toBe("Python");
  });

  it("detects C++ from #include/std::/cout", () => {
    const code = `#include <iostream>\nint main() { std::cout << "hello"; }`;
    expect(detectLanguage(code)).toBe("C++");
  });

  it("detects JavaScript from const/arrow/console", () => {
    const code = `const add = (a, b) => {\n  console.log(a + b);\n};`;
    expect(detectLanguage(code)).toBe("JavaScript");
  });

  it("detects Rust from fn/let mut/println!", () => {
    const code = `fn main() {\n  let mut x = 5;\n  println!("x = {}", x);\n}`;
    expect(detectLanguage(code)).toBe("Rust");
  });

  it("detects Go from func/package main/fmt", () => {
    const code = `package main\nimport "fmt"\nfunc main() { fmt.Println("hello") }`;
    expect(detectLanguage(code)).toBe("Go");
  });

  it("returns 'Unknown' for unrecognisable input", () => {
    expect(detectLanguage("hello world 123")).toBe("Unknown");
  });

  it("prefers C++ over C when both match", () => {
    const code = `#include <stdio.h>\nstd::vector<int> v;\nprintf("hi");`;
    expect(detectLanguage(code)).toBe("C++");
  });
});
