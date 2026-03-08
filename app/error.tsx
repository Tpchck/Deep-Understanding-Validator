'use client';

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h1 className="text-xl font-semibold text-white mb-2">Something went wrong</h1>
      <p className="text-neutral-500 text-sm mb-6 max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
