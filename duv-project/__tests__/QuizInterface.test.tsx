import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import QuizInterface from "@/components/features/QuizInterface";

afterEach(() => {
  cleanup();
});

const defaultProps = {
  sessionId: "test-session-id",
  language: "JavaScript",
  question: "What does this code do?",
  codeSnippet: 'console.log("hello");',
  correctAnswer: "It prints hello to stdout using the console API.",
  explanation: "console.log prints to stdout.",
  initialTurns: [],
  initialFinished: false,
  initialFollowUp: null,
};

describe("QuizInterface", () => {
  it("renders the question text", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const questionBubble = container.querySelector('.bg-neutral-800');
    expect(questionBubble).toHaveTextContent(defaultProps.question);
  });

  it("renders the code snippet", () => {
    render(<QuizInterface {...defaultProps} />);
    expect(screen.getByText(defaultProps.codeSnippet)).toBeInTheDocument();
  });

  it("renders a textarea for typing answer", () => {
    render(<QuizInterface {...defaultProps} />);
    expect(screen.getByPlaceholderText(/explain your understanding/i)).toBeInTheDocument();
  });

  it("shows Submit Answer button", () => {
    render(<QuizInterface {...defaultProps} />);
    expect(screen.getByText("Submit Answer")).toBeInTheDocument();
  });

  it("disables Submit button when textarea is empty", () => {
    render(<QuizInterface {...defaultProps} />);
    const submitBtn = screen.getByText("Submit Answer");
    expect(submitBtn).toBeDisabled();
  });

  it("shows header", () => {
    render(<QuizInterface {...defaultProps} />);
    expect(screen.getByText("Deep Understanding Check")).toBeInTheDocument();
  });
});
