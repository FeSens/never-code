import LoginPage from "@/app/(auth)/login/page";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockMutate = vi.fn();
let mockMutationState = { mutate: mockMutate, isPending: false, error: null as unknown };

vi.mock("@/trpc/client", () => ({
  trpc: {
    auth: {
      login: {
        useMutation: (opts: unknown) => {
          mockMutationState._opts = opts;
          return mockMutationState;
        },
      },
    },
  },
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutationState = {
      mutate: mockMutate,
      isPending: false,
      error: null as unknown,
      _opts: null,
    };
    localStorage.clear();
  });

  it("renders the login heading", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders email and password fields", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders a link to register", () => {
    render(<LoginPage />);
    expect(screen.getByRole("link", { name: /create an account/i })).toBeInTheDocument();
  });

  it("updates input values on change", () => {
    render(<LoginPage />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "secret123" } });

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("secret123");
  });

  it("calls login mutation on submit", () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      email: "alice@test.com",
      password: "password123",
    });
  });

  it("shows loading state when mutation is pending", () => {
    mockMutationState.isPending = true;
    render(<LoginPage />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/signing in/i);
  });

  it("shows error message when mutation fails", () => {
    mockMutationState.error = { message: "Invalid credentials" };
    render(<LoginPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid credentials/i);
  });
});
