"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email or password is incorrect");
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);
    try {
      await signIn("google", { redirect: true, callbackUrl: "/dashboard" });
    } catch (err) {
      setError("An error occurred while signing in with Google.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <span className="auth-input-icon pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3.5 6.75h17v10.5h-17z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 8l8 6 8-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <input
          type="email"
          placeholder="Email or Phone Number"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="auth-input w-full rounded-2xl py-3.5 pr-4 pl-12 outline-none transition"
          required
        />
      </div>

      <div className="relative">
        <span className="auth-input-icon pointer-events-none absolute inset-y-0 left-4 flex items-center">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7.75 10V8a4.25 4.25 0 0 1 8.5 0v2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="10" width="16" height="10" rx="2" />
          </svg>
        </span>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="auth-input w-full rounded-2xl py-3.5 pr-12 pl-12 outline-none transition"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="auth-eye-btn absolute inset-y-0 right-3 my-2 rounded-lg px-2 transition"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="auth-alert-error rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="text-right">
        <Link href="#" className="auth-link-subtle text-sm font-medium transition">
          Forgot Password?
        </Link>
      </div>

      <button
        disabled={loading}
        className="mt-2 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-105 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      <div className="auth-divider flex items-center gap-3 py-1 text-sm">
        <span className="auth-divider-line h-px flex-1" />
        <span>or</span>
        <span className="auth-divider-line h-px flex-1" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="auth-social-btn flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-3.5 text-base font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="grid h-6 w-6 place-content-center rounded-full bg-white text-sm font-bold text-slate-700">G</span>
        {loading ? "Connecting..." : "Log In with Google Account"}
      </button>

      <p className="auth-subtitle pt-1 text-center text-base">
        New here?{" "}
        <Link href="/register" className="auth-link-subtle font-semibold">
          Create an account
        </Link>
      </p>
    </form>
  );
}
