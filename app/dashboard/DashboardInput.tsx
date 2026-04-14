'use client';

import { processCodeSubmission } from "@/actions/submit-code";
import { useState, useRef, useEffect } from "react";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
// A dark theme for prism
import 'prismjs/themes/prism-tomorrow.css'; 
import LoadingLogo from "@/components/ui/LoadingLogo";

export default function DashboardInput() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevCodeLen = useRef(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (code.length - prevCodeLen.current > 50) {
      // It's a large paste. The CSS transition takes 700ms.
      // Scroll immediately after paint, and again after transition finishes
      // to ensure the newly animated submit button stays fully in view.
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 750);
    }
    prevCodeLen.current = code.length;
  }, [code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    
    setError(""); setLoading(true);
    
    // We mock a FormData since processCodeSubmission expects it
    const formData = new FormData();
    formData.append("code", code);
    
    const result = await processCodeSubmission(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // We want the container width to be dynamic. 
  // It starts centered like a TV and expands horizontally as typing happens until max-w-2xl
  const isEmpty = code.length === 0;

  return (
    <div className="w-full flex justify-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
      <form 
        onSubmit={handleSubmit} 
        className={`w-full flex-col transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${isEmpty ? 'max-w-md' : 'max-w-3xl'}`}
      >
        <div 
          ref={containerRef}
          className="relative rounded-2xl bg-neutral-900/80 border border-neutral-700 shadow-lg shadow-black/40 overflow-hidden group focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-400 transition-all duration-500"
          style={{
             minHeight: isEmpty ? '70px' : '150px' 
          }}
        >
          {mounted ? (
            <Editor
              value={code}
              onValueChange={c => setCode(c)}
              highlight={code => Prism.highlight(code, Prism.languages.javascript, 'javascript')}
              padding={20}
              textareaClassName="focus:outline-none placeholder:text-neutral-500 placeholder:italic placeholder:font-sans"
              preClassName="font-mono text-sm leading-6"
              className="w-full h-full text-white font-mono text-sm min-h-[70px]"
              placeholder="Paste your code here..."
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          ) : (
            <div className="w-full h-full text-neutral-500 font-sans text-sm p-5 min-h-[70px] italic">
              Loading editor...
            </div>
          )}
        </div>

        <div className={`transition-all duration-500 overflow-hidden ${error ? 'max-h-12 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>

        <div className={`flex justify-center transition-all duration-700 overflow-hidden ${isEmpty ? 'max-h-0 opacity-0 mt-0' : 'max-h-24 opacity-100 mt-5'}`}>
          <button
            type="submit"
            disabled={loading || isEmpty}
            className="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm sm:text-base font-medium transition-all duration-300 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <><LoadingLogo size={20} /> Analyzing...</> : "Submit & Analyze →"}
          </button>
          <p className="text-center text-[10px] text-neutral-600 mt-1.5 hidden sm:block">Ctrl+Enter to submit</p>
        </div>
        
        <div ref={bottomRef} className="h-4 w-full" />
      </form>
    </div>
  );
}
