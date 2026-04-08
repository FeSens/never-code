"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("sessionId", data.sessionId);
      router.push("/dashboard");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  return (
    <div className="auth-page">
      <h1>Sign In</h1>
      {login.error && (
        <p role="alert" className="auth-error">
          {login.error.message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={login.isPending}>
          {login.isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
      <p className="auth-footer">
        Don&apos;t have an account? <Link href="/register">Create an account</Link>
      </p>
    </div>
  );
}
