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
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
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
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-4 pl-12 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
          required
        />
      </div>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
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
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-12 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-3 my-2 rounded-lg px-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-500"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="text-right">
        <Link href="#" className="text-sm font-medium text-blue-600 transition hover:text-blue-700">
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

      <div className="flex items-center gap-3 py-1 text-sm text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>or</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="grid h-6 w-6 place-content-center rounded-full bg-white text-sm font-bold text-slate-700">G</span>
        {loading ? "Connecting..." : "Log In with Google Account"}
      </button>

      <p className="pt-1 text-center text-base text-slate-500">
        New here?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
          Create an account
        </Link>
      </p>
    </form>
  );
}
