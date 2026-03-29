'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import { deleteAnalysis } from "@/actions/history";

interface DashboardHistoryProps {
  initialItems: {
    id: string;
    question_text: string;
    difficulty: string;
    language: string;
    created_at: string;
  }[];
}

export default function DashboardHistory({ initialItems }: DashboardHistoryProps) {
  const [items, setItems] = useState(initialItems);
  const [filterLang, setFilterLang] = useState<string | null>(null);
  const [filterDiff, setFilterDiff] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    return items.filter(q => {
      if (filterLang && q.language !== filterLang) return false;
      if (filterDiff && q.difficulty !== filterDiff) return false;
      return true;
    });
  }, [items, filterLang, filterDiff]);

  // Stats reflecting current filters
  const total = filteredItems.length;
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const byLanguage: Record<string, number> = {};

  for (const q of filteredItems) {
    const d = q.difficulty as keyof typeof byDifficulty;
    if (d in byDifficulty) byDifficulty[d]++;
    byLanguage[q.language] = (byLanguage[q.language] || 0) + 1;
  }

  // To list all possible filters statically, we can compute from raw `items`:
  const absoluteByLanguage: Record<string, number> = {};
  for (const q of items) {
    absoluteByLanguage[q.language] = (absoluteByLanguage[q.language] || 0) + 1;
  }
  const allLanguages = Object.entries(absoluteByLanguage)
    .sort((a, b) => b[1] - a[1]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await deleteAnalysis(id);
    if (res.success) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Analyses" value={total} />
        <StatCard label="Easy" value={byDifficulty.easy} color="text-green-400" />
        <StatCard label="Medium" value={byDifficulty.medium} color="text-yellow-400" />
        <StatCard label="Hard" value={byDifficulty.hard} color="text-red-400" />
      </div>

      {/* filters */}
      {items.length > 0 && (
        <div className="space-y-4 bg-neutral-900/40 p-5 rounded-2xl border border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h3 className="text-sm font-semibold text-neutral-300 w-24">Languages:</h3>
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={!filterLang}
                onClick={() => setFilterLang(null)}
              />
              {allLanguages.map(([lang, count]) => (
                <FilterPill
                  key={lang}
                  label={`${lang} (${count})`}
                  active={filterLang === lang}
                  onClick={() => setFilterLang(filterLang === lang ? null : lang)}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3 border-t border-neutral-800/50">
            <h3 className="text-sm font-semibold text-neutral-300 w-24">Difficulty:</h3>
            <div className="flex flex-wrap gap-2">
              <FilterPill label="All" active={!filterDiff} onClick={() => setFilterDiff(null)} />
              <FilterPill label="Easy" active={filterDiff === 'easy'} onClick={() => setFilterDiff(filterDiff === 'easy' ? null : 'easy')} />
              <FilterPill label="Medium" active={filterDiff === 'medium'} onClick={() => setFilterDiff(filterDiff === 'medium' ? null : 'medium')} />
              <FilterPill label="Hard" active={filterDiff === 'hard'} onClick={() => setFilterDiff(filterDiff === 'hard' ? null : 'hard')} />
            </div>
          </div>
        </div>
      )}

      {/* list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mt-6 mb-4">
          <h2 className="text-lg font-semibold text-white">Analysis History</h2>
        </div>

        {filteredItems.length === 0 ? (
          <p className="text-center py-8 text-neutral-600 text-sm">No analyses found for these filters.</p>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((q) => (
              <div key={q.id} className="group relative">
                <Link
                  href={`/result/${q.id}`}
                  className="block p-4 rounded-lg bg-neutral-900/80 border border-neutral-800 hover:border-purple-500/50 hover:bg-neutral-900 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-purple-400 px-2 py-0.5 bg-purple-500/10 rounded">{q.language}</span>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                    <span className="text-xs text-neutral-500">
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-200 truncate pr-8">{q.question_text}</p>
                </Link>
                {/* Delete button inline */}
                <button
                  onClick={(e) => handleDelete(e, q.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title="Delete analysis"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${active
        ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.3)] border border-purple-500"
        : "bg-neutral-800 text-neutral-400 border border-transparent hover:bg-neutral-700 hover:text-neutral-200"
        }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-5 rounded-2xl bg-neutral-900/60 border border-neutral-800 backdrop-blur shadow-sm">
      <p className="text-xs text-neutral-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${color ?? "text-white"}`}>{value}</p>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: "bg-green-500/10 text-green-400 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[difficulty] ?? "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
      {difficulty}
    </span>
  );
}
