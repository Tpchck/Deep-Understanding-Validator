import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import QuizInterface from "@/components/features/QuizInterface";

// Mock the AI SDK completion hook — we don't want to call real APIs in tests
vi.mock("@ai-sdk/react", () => ({
  useCompletion: () => ({
    complete: vi.fn(),
    completion: "",
    isLoading: false,
    setCompletion: vi.fn(),
  }),
}));

// Mock server actions — these call Supabase / AI which we can't do in tests
vi.mock("@/actions/evaluate-answer", () => ({
  evaluateAnswer: vi.fn(),
}));

vi.mock("@/actions/save-turns", () => ({
  saveTurns: vi.fn(),
}));

afterEach(() => {
  cleanup();
});

const baseProps = {
  sessionId: "test-session-id",
  language: "Java",
  question: "What happens if StringBuffer.delete() is called concurrently?",
  codeSnippet: 'StringBuffer str = new StringBuffer();\nstr.append("Hello");',
  explanation: "StringBuffer methods are synchronized for thread safety.",
  initialTurns: [],
  initialFinished: false,
  initialFollowUp: null,
};

describe("QuizInterface — initial render", () => {
  it("shows the language tag from props", () => {
    render(<QuizInterface {...baseProps} />);
    expect(screen.getByText("Java")).toBeInTheDocument();
  });

  it("renders the code snippet in a code block", () => {
    render(<QuizInterface {...baseProps} />);
    expect(screen.getByText(/StringBuffer str/)).toBeInTheDocument();
  });

  it("shows the question text", () => {
    const { container } = render(<QuizInterface {...baseProps} />);
    const questionBubble = container.querySelector(".bg-neutral-800");
    expect(questionBubble).toBeTruthy();
    expect(questionBubble!.textContent).toContain("StringBuffer");
  });

  it("shows the answer textarea", () => {
    render(<QuizInterface {...baseProps} />);
    const textarea = screen.getByPlaceholderText(/explain your understanding/i);
    expect(textarea).toBeInTheDocument();
  });

  it("disables Submit button when answer is empty", () => {
    render(<QuizInterface {...baseProps} />);
    const btn = screen.getByText("Submit Answer");
    expect(btn).toBeDisabled();
  });

  it("enables Submit button after typing an answer", () => {
    render(<QuizInterface {...baseProps} />);
    const textarea = screen.getByPlaceholderText(/explain your understanding/i);
    fireEvent.change(textarea, { target: { value: "Because synchronized keyword" } });
    const btn = screen.getByText("Submit Answer");
    expect(btn).not.toBeDisabled();
  });
});

describe("QuizInterface — finished state", () => {
  it("hides the answer input when quiz is finished", () => {
    render(
      <QuizInterface
        {...baseProps}
        initialFinished={true}
        initialTurns={[{
          question: baseProps.question,
          userAnswer: "Because of the synchronized keyword",
          score: 90,
          feedback: "Excellent understanding.",
          weakSpots: [],
          isFollowUp: false,
        }]}
      />
    );
    expect(screen.queryByPlaceholderText(/explain your understanding/i)).toBeNull();
  });

  it("shows FinalVerdict with best score when finished", () => {
    render(
      <QuizInterface
        {...baseProps}
        initialFinished={true}
        initialTurns={[{
          question: baseProps.question,
          userAnswer: "Synchronized methods",
          score: 90,
          feedback: "Good.",
          weakSpots: [],
          isFollowUp: false,
        }]}
      />
    );
    expect(screen.getByText(/best score: 90%/i)).toBeInTheDocument();
  });

  it("shows 'Try another snippet' link when finished", () => {
    render(
      <QuizInterface
        {...baseProps}
        initialFinished={true}
        initialTurns={[{
          question: baseProps.question,
          userAnswer: "Sync",
          score: 40,
          feedback: "Partial",
          weakSpots: ["Missing detail"],
          isFollowUp: false,
        }]}
      />
    );
    expect(screen.getByText(/try another snippet/i)).toBeInTheDocument();
  });
});

describe("QuizInterface — previous turns", () => {
  it("renders historical turn with score and feedback", () => {
    render(
      <QuizInterface
        {...baseProps}
        initialTurns={[{
          question: baseProps.question,
          userAnswer: "synchronized makes it thread-safe",
          score: 60,
          feedback: "Partially correct, but missed the point about str.length().",
          weakSpots: ["Didn't address str.length() race condition"],
          isFollowUp: false,
        }]}
        initialFollowUp="Can you explain the specific race condition with str.length()?"
      />
    );
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText(/partially correct/i)).toBeInTheDocument();
  });

  it("marks follow-up turns with a badge", () => {
    render(
      <QuizInterface
        {...baseProps}
        initialTurns={[
          { question: "Q1", userAnswer: "A1", score: 50, feedback: "Partial", weakSpots: ["w1"], isFollowUp: false },
          { question: "Q2", userAnswer: "A2", score: 70, feedback: "Better", weakSpots: ["w2"], isFollowUp: true },
        ]}
      />
    );
    const badges = screen.getAllByText("Follow-up question");
    expect(badges.length).toBeGreaterThanOrEqual(1);
  });
});
