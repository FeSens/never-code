import HomePage from "@/app/page";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("HomePage", () => {
  it("renders hero heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: "Never Code" })).toBeInTheDocument();
  });

  it("renders tagline", () => {
    render(<HomePage />);
    expect(screen.getByText(/gold standard for agentic fullstack engineering/)).toBeInTheDocument();
  });

  it("renders the stack section", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "The Stack" })).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
    expect(screen.getByText("Hono")).toBeInTheDocument();
    expect(screen.getByText("tRPC")).toBeInTheDocument();
    expect(screen.getByText("Drizzle")).toBeInTheDocument();
  });

  it("renders the harness section with commands", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "The Harness" })).toBeInTheDocument();
    expect(screen.getByText("/implement")).toBeInTheDocument();
    expect(screen.getByText("/experiment")).toBeInTheDocument();
  });

  it("renders the stats section", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "By The Numbers" })).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("Type-safe")).toBeInTheDocument();
  });

  it("renders the loop section", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "The Loop" })).toBeInTheDocument();
  });

  it("renders the principles section", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { name: "Principles" })).toBeInTheDocument();
    expect(screen.getByText(/Immutable gates/)).toBeInTheDocument();
    expect(screen.getByText(/Git as undo/)).toBeInTheDocument();
  });

  it("renders footer text", () => {
    render(<HomePage />);
    expect(
      screen.getByText("Built by agents, verified by machines, trusted by humans."),
    ).toBeInTheDocument();
  });
});
