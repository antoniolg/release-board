import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import App from "../App";

const releases = [{ id: 1, name: "v1.0", version: "1.0.0" }];
const columns = [{ id: 1, release_id: 1, name: "Backlog", position: 0, color: "#6b7280" }];
const cards = [];

const server = setupServer(
  http.get("/api/releases", () => HttpResponse.json(releases)),
  http.get("/api/columns/:id", () => HttpResponse.json(columns)),
  http.get("/api/cards/release/:id", () => HttpResponse.json(cards))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("App", () => {
  it("renders the app title", async () => {
    render(<App />);
    expect(screen.getByText("Release Board")).toBeInTheDocument();
  });

  it("loads and displays releases", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("v1.0 v1.0.0")).toBeInTheDocument();
    });
  });

  it("loads and displays columns", async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText("Backlog")).toBeInTheDocument();
    });
  });
});
