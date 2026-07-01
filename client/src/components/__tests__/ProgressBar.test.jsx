import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProgressBar from "../ProgressBar";

describe("ProgressBar", () => {
  it("renders progress info", () => {
    render(<ProgressBar doneCards={3} totalCards={10} doneChecks={5} totalChecks={20} />);
    expect(screen.getByText(/3\/10/)).toBeInTheDocument();
    expect(screen.getByText(/5\/20/)).toBeInTheDocument();
  });

  it("shows 100% when all done", () => {
    render(<ProgressBar doneCards={10} totalCards={10} doneChecks={20} totalChecks={20} />);
    const percentages = screen.getAllByText(/100%/);
    expect(percentages.length).toBe(2);
  });

  it("shows 0% when nothing done", () => {
    render(<ProgressBar doneCards={0} totalCards={10} doneChecks={0} totalChecks={20} />);
    const percentages = screen.getAllByText(/0%/);
    expect(percentages.length).toBe(2);
  });
});
