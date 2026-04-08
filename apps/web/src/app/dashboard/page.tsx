"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p className="dashboard-welcome">
        Welcome, <strong>{user?.name}</strong>
      </p>
      <p className="dashboard-email">{user?.email}</p>
      <button type="button" className="dashboard-logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
