import { NavBar } from "@/components/nav-bar";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let mockAuthState = {
  user: null as { id: string; email: string; name: string } | null,
  isLoading: false,
  isAuthenticated: false,
  logout: vi.fn(),
};

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockAuthState,
}));

describe("NavBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: vi.fn(),
    };
  });

  it("shows login and register links when logged out", () => {
    render(<NavBar />);
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });

  it("shows user name and logout button when logged in", () => {
    mockAuthState.user = { id: "u-1", email: "alice@test.com", name: "Alice" };
    mockAuthState.isAuthenticated = true;
    render(<NavBar />);
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("does not show login/register links when logged in", () => {
    mockAuthState.user = { id: "u-1", email: "alice@test.com", name: "Alice" };
    mockAuthState.isAuthenticated = true;
    render(<NavBar />);
    expect(screen.queryByRole("link", { name: /login/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /register/i })).not.toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", () => {
    mockAuthState.user = { id: "u-1", email: "alice@test.com", name: "Alice" };
    mockAuthState.isAuthenticated = true;
    render(<NavBar />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockAuthState.logout).toHaveBeenCalled();
  });
});
