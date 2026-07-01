import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ReleaseSelector from "../ReleaseSelector";

describe("ReleaseSelector", () => {
  const releases = [
    { id: 1, name: "v1.0", version: "1.0.0" },
    { id: 2, name: "v2.0", version: "2.0.0" },
  ];

  it("renders releases in select", () => {
    render(
      <ReleaseSelector
        releases={releases}
        current={releases[0]}
        onSelect={() => {}}
        onCreate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("v1.0 v1.0.0")).toBeInTheDocument();
    expect(screen.getByText("v2.0 v2.0.0")).toBeInTheDocument();
  });

  it("shows empty state button when empty prop is set", () => {
    render(
      <ReleaseSelector
        releases={[]}
        current={null}
        onSelect={() => {}}
        onCreate={() => {}}
        onDelete={() => {}}
        empty
      />
    );
    expect(screen.getByText("+ New Release")).toBeInTheDocument();
  });

  it("shows new and delete buttons", () => {
    render(
      <ReleaseSelector
        releases={releases}
        current={releases[0]}
        onSelect={() => {}}
        onCreate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByText("+ New")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });
});
