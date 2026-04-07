import RootLayout from "@/app/layout";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("RootLayout", () => {
  it("renders children", () => {
    render(
      <RootLayout>
        <p>child content</p>
      </RootLayout>,
      { container: document.documentElement },
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
