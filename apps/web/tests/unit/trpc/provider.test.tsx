import { TRPCProvider } from "@/trpc/provider";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("TRPCProvider", () => {
  it("renders children", () => {
    render(
      <TRPCProvider>
        <p>child content</p>
      </TRPCProvider>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
