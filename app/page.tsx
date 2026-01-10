'use client';

import { processCodeSubmission } from "@/actions/submit-code";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError("");
    setLoading(true);

    try {
      const result = await processCodeSubmission(formData);
      if (result.success && result.id) {
        router.push(`/result/${result.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          DUV: Deep Understanding Validator
        </h1>
        
        <form action={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-4">
          <div className="relative">
            <textarea
              name="code"
              placeholder="// Paste your C++, Python, or Java code here..."
              className="w-full h-64 p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-green-400 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-white px-8 py-3 text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "ANALYZING..." : "INITIATE ANALYSIS"}
          </button>
        </form>
      </div>
    </main>
  );
}