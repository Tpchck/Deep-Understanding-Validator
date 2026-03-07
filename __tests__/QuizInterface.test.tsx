import { describe, it, expect } from "vitest";
import { render, fireEvent, within } from "@testing-library/react";
import QuizInterface from "@/components/features/QuizInterface";

const defaultProps = {
  question: "What does this function return?",
  code: "int add(int a, int b) { return a + b; }",
  options: ["Sum of arguments", "Difference of arguments", "Product of arguments", "Quotient of arguments"],
  correctIndex: 0,
  explanation: "The function returns the sum of a and b.",
};

describe("QuizInterface", () => {
  it("renders the question and code", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const root = within(container.firstElementChild as HTMLElement);

    expect(root.getByText(defaultProps.question)).toBeInTheDocument();
    expect(root.getByText(defaultProps.code)).toBeInTheDocument();
  });

  it("renders all option buttons", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const root = within(container.firstElementChild as HTMLElement);

    for (const option of defaultProps.options) {
      expect(root.getByText(option)).toBeInTheDocument();
    }
  });

  it("does not show confirm button before selecting an option", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const root = within(container.firstElementChild as HTMLElement);

    expect(root.queryByText("Confirm Answer")).not.toBeInTheDocument();
  });

  it("shows confirm button after selecting an option", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const root = within(container.firstElementChild as HTMLElement);

    fireEvent.click(root.getByText("Sum of arguments"));
    expect(root.getByText("Confirm Answer")).toBeInTheDocument();
  });

  it("shows explanation after confirming correct answer", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const root = within(container.firstElementChild as HTMLElement);

    fireEvent.click(root.getByText("Sum of arguments"));
    fireEvent.click(root.getByText("Confirm Answer"));

    expect(root.getByText("Correct!")).toBeInTheDocument();
    expect(root.getByText(defaultProps.explanation)).toBeInTheDocument();
  });

  it("shows incorrect feedback for wrong answer", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const root = within(container.firstElementChild as HTMLElement);

    fireEvent.click(root.getByText("Difference of arguments"));
    fireEvent.click(root.getByText("Confirm Answer"));

    expect(root.getByText("Incorrect")).toBeInTheDocument();
    expect(root.getByText(defaultProps.explanation)).toBeInTheDocument();
  });

  it("disables options after submission", () => {
    const { container } = render(<QuizInterface {...defaultProps} />);
    const root = within(container.firstElementChild as HTMLElement);

    fireEvent.click(root.getByText("Sum of arguments"));
    fireEvent.click(root.getByText("Confirm Answer"));

    const optionButtons = root.getAllByRole("button").filter((btn) =>
      defaultProps.options.includes(btn.textContent ?? "")
    );
    for (const btn of optionButtons) {
      expect(btn).toBeDisabled();
    }
  });
});
