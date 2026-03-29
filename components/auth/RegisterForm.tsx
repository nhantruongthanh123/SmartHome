"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please enter email, password, and confirm password");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Registration successful! Redirecting...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
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
          placeholder="Email Address"
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

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M7.75 10V8a4.25 4.25 0 0 1 8.5 0v2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="4" y="10" width="16" height="10" rx="2" />
          </svg>
        </span>

        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pr-12 pl-12 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100"
          required
        />

        <button
          type="button"
          onClick={() => setShowConfirm((prev) => !prev)}
          className="absolute inset-y-0 right-3 my-2 rounded-lg px-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-500"
          aria-label={showConfirm ? "Hide password" : "Show password"}
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

      {success && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
          {success}
        </div>
      )}

      <button
        disabled={loading}
        className="mt-2 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-105 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
        type="submit"
      >
        {loading ? "Đang tạo tài khoản..." : "Create Account"}
      </button>

      <p className="pt-1 text-center text-base text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
          Sign in here
        </Link>
      </p>
    </form>
  );
}
