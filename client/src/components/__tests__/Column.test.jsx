import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Column from "../Column";

describe("Column", () => {
  const column = { id: 1, name: "Backlog", position: 0, color: "#6b7280" };
  const cards = [
    { id: 1, title: "Card 1", column_id: 1, priority: "medium", labels: [], checklist: [] },
    { id: 2, title: "Card 2", column_id: 1, priority: "low", labels: [], checklist: [] },
  ];
  const labels = [];

  const defaultProps = {
    column,
    cards,
    labels,
    dragCardId: null,
    isDragOver: false,
    onDragStart: () => {},
    onDragOver: () => {},
    onDragLeave: () => {},
    onDrop: () => {},
    onCreateCard: () => {},
    onDeleteCard: () => {},
    onEditCard: () => {},
    onDeleteColumn: () => {},
  };

  it("renders column name and card count", () => {
    render(<Column {...defaultProps} />);
    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders cards", () => {
    render(<Column {...defaultProps} />);
    expect(screen.getByText("Card 1")).toBeInTheDocument();
    expect(screen.getByText("Card 2")).toBeInTheDocument();
  });

  it("shows add card button", () => {
    render(<Column {...defaultProps} />);
    expect(screen.getByText("+ Add card")).toBeInTheDocument();
  });

  it("shows add card form when button clicked", () => {
    render(<Column {...defaultProps} />);
    fireEvent.click(screen.getByText("+ Add card"));
    expect(screen.getByPlaceholderText("Card title...")).toBeInTheDocument();
  });

  it("calls onCreateCard when form submitted", () => {
    const onCreateCard = vi.fn();
    render(<Column {...defaultProps} onCreateCard={onCreateCard} />);
    fireEvent.click(screen.getByText("+ Add card"));
    fireEvent.change(screen.getByPlaceholderText("Card title..."), { target: { value: "New Card" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onCreateCard).toHaveBeenCalledWith(1, "New Card");
  });
});
