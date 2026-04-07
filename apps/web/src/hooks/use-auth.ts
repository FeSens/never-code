"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

function getSessionId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sessionId");
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const sessionId = getSessionId();

  const me = trpc.auth.me.useQuery(sessionId ? { sessionId } : undefined, { enabled: !!sessionId });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      localStorage.removeItem("sessionId");
      router.push("/login");
    },
  });

  const logout = () => {
    if (sessionId) {
      logoutMutation.mutate({ sessionId });
    } else {
      localStorage.removeItem("sessionId");
      router.push("/login");
    }
  };

  return {
    user: (me.data as AuthUser) ?? null,
    isLoading: me.isLoading,
    isAuthenticated: !!me.data,
    logout,
  };
}
