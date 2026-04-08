"use client";

import { trpc } from "@/trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = trpc.auth.register.useMutation({
    onSuccess: () => router.push("/login"),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    register.mutate({ name, email, password });
  }

  return (
    <div className="auth-page">
      <h1>Create Account</h1>
      {register.error && (
        <p role="alert" className="auth-error">
          {register.error.message}
        </p>
      )}
      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
          minLength={8}
        />

        <button type="submit" disabled={register.isPending}>
          {register.isPending ? "Registering..." : "Create Account"}
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link href="/login">Sign in</Link>
      </p>
    </div>
  );
}
