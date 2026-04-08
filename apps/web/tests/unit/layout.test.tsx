import RootLayout from "@/app/layout";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({ user: null, isLoading: false, isAuthenticated: false, logout: vi.fn() }),
}));

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
