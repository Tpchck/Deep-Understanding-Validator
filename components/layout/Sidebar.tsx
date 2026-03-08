'use client';

import { signOut } from "@/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LoadingLogo from "@/components/ui/LoadingLogo";

export interface HistoryEntry {
  id: string;
  language: string;
  code_snippet: string;
  created_at: string;
}

interface SidebarProps {
  email: string;
  history: HistoryEntry[];
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Sidebar({ email, history }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-neutral-900/80 backdrop-blur border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
        aria-label="Open navigation menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`fixed left-0 top-0 z-50 w-64 h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* header */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <LoadingLogo size={28} />
              <div>
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
                  DUV
                </h2>
                <p className="text-xs text-neutral-500">Deep Understanding Validator</p>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1 text-neutral-500 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

      {/* new analysis btn */}
      <div className="p-3 space-y-2">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 p-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
        >
          + New Analysis
        </Link>
        <Link
          href="/dashboard"
          className={`flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "bg-neutral-800 text-white"
              : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
          }`}
        >
          Dashboard
        </Link>
      </div>

      {/* history list */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="text-xs text-neutral-500 px-2 mb-2 uppercase tracking-wider">History</p>

        {history.length === 0 && (
          <p className="text-xs text-neutral-600 px-2">No analyses yet</p>
        )}

        <div className="space-y-1">
          {history.map((item) => {
            const active = pathname === `/result/${item.id}`;
            const preview = item.code_snippet.split('\n')[0].slice(0, 35);

            return (
              <Link
                key={item.id}
                href={`/result/${item.id}`}
                className={`block p-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-neutral-800 text-white"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-purple-400">{item.language}</span>
                  <span className="text-[10px] text-neutral-600">{timeAgo(item.created_at)}</span>
                </div>
                <p className="truncate text-xs mt-1 text-neutral-500">{preview}</p>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* user & logout */}
      <div className="p-4 border-t border-neutral-800">
        <p className="text-xs text-neutral-500 truncate mb-2">{email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
    </>
  );
}
