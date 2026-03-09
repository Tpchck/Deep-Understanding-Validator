'use client';

import { processCodeSubmission } from "@/actions/submit-code";
import { useState, useRef, useCallback, useTransition } from "react";
import { looksLikeCode } from "@/lib/utils";
import LoadingLogo from "@/components/ui/LoadingLogo";

export default function Home() {
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const scrollToButton = useCallback(() => {
    requestAnimationFrame(() => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    });
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
    scrollToButton();
  }, [scrollToButton]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code");
    if (typeof code === "string" && !looksLikeCode(code)) {
      setError("This doesn't look like code. Please paste a valid code snippet (C++, Python, Java, JS, etc.).");
      return;
    }

    startTransition(async () => {
      const result = await processCodeSubmission(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 relative">

      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
          DUV: Deep Understanding Validator
        </h1>
        
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-4">
          <div className="relative">
            <label htmlFor="code-input" className="sr-only">Code snippet</label>
            <textarea
              ref={codeRef}
              id="code-input"
              name="code"
              rows={1}
              placeholder="// Paste your C++, Python, or Java code here..."
              onChange={handleCodeChange}
              style={{ resize: 'none' }}
              className="w-full px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-green-400 font-mono leading-6 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-[border-color,box-shadow] overflow-hidden"
              required
              disabled={isPending}
            />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-900/20 border border-red-700 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            ref={buttonRef}
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-white px-8 py-3 text-black font-bold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? <><LoadingLogo size={22} /> ANALYZING</> : "INITIATE ANALYSIS"}
          </button>
        </form>
      </div>
    </main>
  );
}