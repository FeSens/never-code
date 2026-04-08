"use client";

import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";

export function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="nav-bar">
      <Link href="/" className="nav-logo">
        never-code
      </Link>
      <div className="nav-links">
        {isAuthenticated ? (
          <>
            <span className="nav-user">{user?.name}</span>
            <button type="button" className="nav-logout" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
