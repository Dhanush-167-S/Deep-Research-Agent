"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams?.get("next") || "/dashboard";
  const { login, register, loginWithGoogle } = useAuth();


  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (mode === "signin") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Please enter your full name.");
          setIsLoading(false);
          return;
        }
        await register(name, email, password);
      }
      router.push(nextUrl);
    } catch (err: any) {
      setError(err?.message ?? "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[var(--paper-1)] border border-[var(--rule-line)] rounded-xl p-8 shadow-sm space-y-6">
      {/* Eyebrow Tag */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-[var(--rule-line)] bg-[var(--paper-0)] rounded-full font-mono-data text-[11px] uppercase tracking-wider text-[var(--ink-600)]">
          <ShieldCheck size={13} className="text-[var(--verified)]" />
          Verified OS Authentication
        </span>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-lg">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
            mode === "signin"
              ? "bg-[var(--verified)] text-[var(--paper-0)] font-semibold shadow-xs"
              : "text-[var(--ink-600)] hover:text-[var(--ink-900)]"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
            mode === "signup"
              ? "bg-[var(--verified)] text-[var(--paper-0)] font-semibold shadow-xs"
              : "text-[var(--ink-600)] hover:text-[var(--ink-900)]"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Header Title */}
      <div className="text-center space-y-1">
        <h1 className="font-fraunces text-3xl font-medium text-[var(--ink-900)] tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-xs text-[var(--ink-600)] font-sans">
          {mode === "signin"
            ? "Access your verified research operating system"
            : "Start academic-grade verified research in seconds"}
        </p>
      </div>

      {/* Google OAuth Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={async () => {
            setError(null);
            try {
              await loginWithGoogle();
            } catch (err: any) {
              setError(err?.message || "Google OAuth sign-in failed.");
            }
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-[var(--paper-0)] hover:bg-[var(--paper-2)] border border-[var(--rule-line)] rounded-md text-xs font-mono-data font-semibold text-[var(--ink-900)] transition-colors shadow-xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-[var(--rule-line)] w-full"></div>
          <span className="bg-[var(--paper-1)] px-2 text-[10px] font-mono-data text-[var(--ink-600)] uppercase tracking-wider absolute">
            or email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-mono-data uppercase tracking-wider text-[var(--ink-600)]">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Eleanor Vance"
              required
              className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-md px-3.5 py-2 text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--verified)] transition-colors"
            />
          </div>
        )}

        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-mono-data uppercase tracking-wider text-[var(--ink-600)]">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="eleanor@university.edu"
            required
            className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-md px-3.5 py-2 text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--verified)] transition-colors"
          />
        </div>

        <div className="space-y-1.5 text-left">
          <label className="text-[11px] font-mono-data uppercase tracking-wider text-[var(--ink-600)]">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full bg-[var(--paper-0)] border border-[var(--rule-line)] rounded-md px-3.5 py-2 pr-10 text-sm text-[var(--ink-900)] placeholder-[var(--ink-300)] focus:outline-none focus:border-[var(--verified)] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-300)] hover:text-[var(--ink-900)] transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-[var(--verified-tint)] border border-[var(--verified)]/30 text-xs font-mono-data text-[var(--verified)] text-left">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-verified py-3 mt-2 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-[var(--paper-0)] border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>{mode === "signin" ? "Sign In to Workspace" : "Launch Account"}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="text-[11px] text-center text-[var(--ink-600)] font-sans">
        By signing in, you agree to our{" "}
        <span className="ink-link text-[var(--ink-900)] font-medium cursor-pointer">Terms</span> and{" "}
        <span className="ink-link text-[var(--ink-900)] font-medium cursor-pointer">Privacy Policy</span>.
      </p>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--paper-0)] text-[var(--ink-900)] flex flex-col items-center justify-center px-6 py-12 paper-grain relative">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-1.5 mb-8 group">
        <span className="font-fraunces text-2xl font-medium tracking-tight text-[var(--ink-900)]">
          TopResearch
        </span>
        <sup className="text-[var(--verified)] font-mono-data text-xs font-bold -top-2">
          ¹
        </sup>
      </Link>

      <Suspense fallback={
        <div className="w-full max-w-md bg-[var(--paper-1)] border border-[var(--rule-line)] rounded-xl p-8 text-center text-xs font-mono-data text-[var(--ink-600)]">
          Loading authentication...
        </div>
      }>
        <LoginForm />
      </Suspense>

      <Link
        href="/"
        className="mt-8 text-xs font-mono-data text-[var(--ink-600)] hover:text-[var(--ink-900)] transition-colors"
      >
        ← Return to TopResearch
      </Link>
    </div>
  );
}
