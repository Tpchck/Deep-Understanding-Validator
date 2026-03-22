'use client';

import { signOut } from "@/actions/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingLogo from "@/components/ui/LoadingLogo";

export interface HistoryEntry {
  id: string;
  language: string;
  code_snippet: string;
  created_at: string;
}

interface SidebarProps {
  email: string;
  nickname?: string;
  history: HistoryEntry[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function timeAgo(dateStr: string) {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diff)) return "unknown";
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch (err) {
    console.error("Date parsing error:", err);
    return "unknown";
  }
}

export default function Sidebar({ email, nickname, history, isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  const [clientHistory, setClientHistory] = useState<HistoryEntry[]>(history);

  useEffect(() => {
    // Re-fetch history to ensure it's fresh when navigating client-side, bypassing layout cache
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Remove duplicates based on ID or potential session grouping
          const seen = new Set();
          const unique = data.filter(d => {
            if (seen.has(d.id)) return false;
            seen.add(d.id);
            return true;
          });
          setClientHistory(unique);
        }
      })
      .catch(console.error);
  }, [pathname]);


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

      <aside className={`fixed left-0 top-0 z-50 h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col transition-all duration-300 ease-in-out ${
        mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
      } ${
        !mobileOpen && isCollapsed ? 'md:w-20' : 'md:w-64'
      }`}>
        {/* header with logo and project name */}
        <div className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between overflow-hidden">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <LoadingLogo size={32} />
              <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
                <h2 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600 leading-tight">
                  DUV
                </h2>
                <p className="text-[10px] text-neutral-500 leading-tight">Deep Understanding Validator</p>
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
            
            {/* Desktop toggle collapse */}
            <button 
              onClick={onToggleCollapse}
              className={`hidden md:flex p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-md transition-all ${isCollapsed ? 'absolute -right-3 top-6 bg-neutral-900 border border-neutral-700 shadow-md' : ''}`}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

      {/* actions */}
      <div className="p-3 space-y-1.5 overflow-hidden">
        <Link
          href="/dashboard"
          className={`flex items-center ${isCollapsed ? 'justify-center gap-0' : 'justify-start gap-2.5'} p-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "bg-neutral-800 text-white"
              : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
          }`}
          title="Dashboard"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
          <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Dashboard</span>
        </Link>
        <Link
          href="/dashboard/new"
          className={`flex items-center justify-center ${isCollapsed ? 'gap-0' : 'gap-2'} p-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors shrink-0`}
          title="New Analysis"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>New Analysis</span>
        </Link>
      </div>

      {/* history list */}
      <nav className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide">
        <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100 h-auto'}`}>
          <p className="text-xs text-neutral-500 px-2 mb-2 uppercase tracking-wider">History</p>

          {clientHistory.length === 0 && (
            <p className="text-xs text-neutral-600 px-2">No analyses yet</p>
          )}
        </div>

        <div className={`space-y-1 transition-all duration-300 overflow-hidden ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100 h-auto'}`}>
          {clientHistory.map((item) => {
            const active = pathname === `/result/${item.id}`;
            const chunk = item.code_snippet?.split('\n')[0] || '';
            const preview = chunk.slice(0, 35);

            return (
              <div key={item.id} className="group relative">
                <Link
                  href={`/result/${item.id}`}
                  className={`block p-2.5 rounded-lg text-sm transition-colors pr-8 ${
                    active
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-400 truncate pr-2">{item.language}</span>
                    <span className="text-[10px] text-neutral-600 shrink-0" suppressHydrationWarning>
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                  <p className="truncate text-xs mt-1 text-neutral-500">{preview}</p>
                </Link>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const { deleteAnalysis } = await import('@/actions/history');
                    const res = await deleteAnalysis(item.id);
                    if (res.success) {
                      setClientHistory(prev => prev.filter(h => h.id !== item.id));
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 rounded-md"
                  title="Delete analysis"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </nav>

      {/* user section */}
      <div className="p-4 border-t border-neutral-800">
        <Link href="/dashboard/settings" className="flex items-center gap-3 mb-3 relative overflow-hidden flex-nowrap shrink-0 group hover:bg-neutral-900/50 p-1 -m-1 rounded-lg transition-colors">
          {/* Avatar */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/avatar.png" alt="" className="w-8 h-8 rounded-full object-cover shrink-0 border border-purple-500/30" />
          <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
            {nickname ? (
              <>
                <p className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors truncate">{nickname}</p>
                <p className="text-[10px] text-neutral-500 truncate">{email}</p>
              </>
            ) : (
              <p className="text-sm text-neutral-300 group-hover:text-purple-400 transition-colors truncate">{email}</p>
            )}
          </div>
        </Link>

        <div className={`transition-all duration-300 flex items-center justify-between overflow-hidden whitespace-nowrap ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100 h-auto'}`}>
          <Link
            href="/settings"
            className={`text-xs flex items-center gap-1.5 transition-colors ${
              pathname === "/settings"
                ? "text-purple-400"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="text-xs text-neutral-500 hover:text-red-400 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
    </>
  );
}
