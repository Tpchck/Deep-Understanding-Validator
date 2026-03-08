'use client';

import { signIn, signInWithGoogle } from "@/actions/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get("email") ?? "";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setError("");
    setLoading(true);

    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            DUV
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Sign in to continue</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <label htmlFor="login-email" className="sr-only">Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Email"
            required
            defaultValue={prefillEmail}
            disabled={loading}
            className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />
          <label htmlFor="login-password" className="sr-only">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            required
            disabled={loading}
            className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          />

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-white text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[rgb(10,10,10)] px-2 text-neutral-500">or</span>
          </div>
        </div>

        <form action={signInWithGoogle}>
          <button
            type="submit"
            className="w-full py-3 rounded-lg border border-neutral-700 text-white font-medium hover:bg-neutral-900 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="text-center text-neutral-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-purple-400 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
