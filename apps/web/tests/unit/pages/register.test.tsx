import RegisterPage from "@/app/(auth)/register/page";
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
      register: {
        useMutation: (opts: unknown) => {
          mockMutationState._opts = opts;
          return mockMutationState;
        },
      },
    },
  },
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutationState = {
      mutate: mockMutate,
      isPending: false,
      error: null as unknown,
      _opts: null,
    };
  });

  it("renders the register heading", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("heading", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders name, email, and password fields", () => {
    render(<RegisterPage />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("renders a submit button", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("renders a link to login", () => {
    render(<RegisterPage />);
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();
  });

  it("updates input values on change", () => {
    render(<RegisterPage />);
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(nameInput, { target: { value: "Alice" } });
    fireEvent.change(emailInput, { target: { value: "alice@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(nameInput).toHaveValue("Alice");
    expect(emailInput).toHaveValue("alice@test.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("calls register mutation on submit", () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "alice@test.com" } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(mockMutate).toHaveBeenCalledWith({
      name: "Alice",
      email: "alice@test.com",
      password: "password123",
    });
  });

  it("shows loading state when mutation is pending", () => {
    mockMutationState.isPending = true;
    render(<RegisterPage />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/registering/i);
  });

  it("shows error message when mutation fails", () => {
    mockMutationState.error = { message: "Email already in use" };
    render(<RegisterPage />);
    expect(screen.getByRole("alert")).toHaveTextContent(/email already in use/i);
  });
});
