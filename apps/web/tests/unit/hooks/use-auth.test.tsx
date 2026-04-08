import { useAuth } from "@/hooks/use-auth";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

let mockQueryState = { data: null as unknown, isLoading: false };
const mockMutate = vi.fn();
let mockMutationState = { mutate: mockMutate, isPending: false };

vi.mock("@/trpc/client", () => ({
  trpc: {
    auth: {
      me: {
        useQuery: () => mockQueryState,
      },
      logout: {
        useMutation: (opts: unknown) => {
          mockMutationState._opts = opts;
          return mockMutationState;
        },
      },
    },
  },
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockQueryState = { data: null as unknown, isLoading: false };
    mockMutationState = { mutate: mockMutate, isPending: false, _opts: null };
  });

  it("returns isAuthenticated false when no user", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("returns user and isAuthenticated true when auth.me returns data", () => {
    mockQueryState.data = { id: "u-1", email: "alice@test.com", name: "Alice" };
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ id: "u-1", email: "alice@test.com", name: "Alice" });
  });

  it("returns isLoading true when query is loading", () => {
    mockQueryState.isLoading = true;
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
  });

  it("provides a logout function", () => {
    localStorage.setItem("sessionId", "session-123");
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.logout).toBe("function");
  });
});
