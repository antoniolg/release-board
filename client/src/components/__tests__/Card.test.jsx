import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Card from "../Card";

describe("Card", () => {
  const baseCard = {
    id: 1,
    title: "Test Card",
    description: "A test card",
    priority: "high",
    labels: ["Bug"],
    checklist: [
      { id: 1, text: "Step 1", checked: true },
      { id: 2, text: "Step 2", checked: false },
    ],
  };

  const labels = [{ name: "Bug", color: "#ef4444" }];

  it("renders card title and description", () => {
    render(
      <Card
        card={baseCard}
        labels={labels}
        isDragging={false}
        onDragStart={() => {}}
        onClick={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("Test Card")).toBeInTheDocument();
    expect(screen.getByText("A test card")).toBeInTheDocument();
  });

  it("renders priority badge", () => {
    render(
      <Card
        card={baseCard}
        labels={labels}
        isDragging={false}
        onDragStart={() => {}}
        onClick={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("high")).toBeInTheDocument();
  });

  it("renders labels", () => {
    render(
      <Card
        card={baseCard}
        labels={labels}
        isDragging={false}
        onDragStart={() => {}}
        onClick={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("Bug")).toBeInTheDocument();
  });

  it("renders checklist progress", () => {
    render(
      <Card
        card={baseCard}
        labels={labels}
        isDragging={false}
        onDragStart={() => {}}
        onClick={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(
      <Card
        card={baseCard}
        labels={labels}
        isDragging={false}
        onDragStart={() => {}}
        onClick={onClick}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByText("Test Card").closest(".card"));
    expect(onClick).toHaveBeenCalled();
  });

  it("calls onDelete when delete button clicked", () => {
    const onDelete = vi.fn();
    render(
      <Card
        card={baseCard}
        labels={labels}
        isDragging={false}
        onDragStart={() => {}}
        onClick={() => {}}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByTitle("Delete card"));
    expect(onDelete).toHaveBeenCalled();
  });
});
