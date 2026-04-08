import DashboardPage from "@/app/dashboard/page";
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

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    mockAuthState = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      logout: vi.fn(),
    };
  });

  it("redirects to /login when not authenticated", () => {
    render(<DashboardPage />);
    expect(mockPush).toHaveBeenCalledWith("/login");
  });

  it("shows loading state while auth is loading", () => {
    mockAuthState.isLoading = true;
    render(<DashboardPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("shows user name when authenticated", () => {
    mockAuthState.user = { id: "u-1", email: "alice@test.com", name: "Alice" };
    mockAuthState.isAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });

  it("shows a logout button when authenticated", () => {
    mockAuthState.user = { id: "u-1", email: "alice@test.com", name: "Alice" };
    mockAuthState.isAuthenticated = true;
    render(<DashboardPage />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("calls logout when logout button is clicked", () => {
    mockAuthState.user = { id: "u-1", email: "alice@test.com", name: "Alice" };
    mockAuthState.isAuthenticated = true;
    render(<DashboardPage />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mockAuthState.logout).toHaveBeenCalled();
  });
});
