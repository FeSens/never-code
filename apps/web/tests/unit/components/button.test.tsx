import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies variant as data attribute", () => {
    render(<Button variant="danger">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "danger");
  });

  it("defaults to primary variant", () => {
    render(<Button>Submit</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", "primary");
  });
});
