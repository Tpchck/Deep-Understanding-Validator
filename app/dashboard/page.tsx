import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardInput from "./DashboardInput";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text, code_snippet, difficulty, language, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = questions ?? [];

  // basic stats
  const total = items.length;
  const byDifficulty = { easy: 0, medium: 0, hard: 0 };
  const byLanguage: Record<string, number> = {};
  for (const q of items) {
    const d = q.difficulty as keyof typeof byDifficulty;
    if (d in byDifficulty) byDifficulty[d]++;
    byLanguage[q.language] = (byLanguage[q.language] || 0) + 1;
  }

  const topLanguages = Object.entries(byLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <main className="flex flex-col relative z-0">
        {/* ── Grok-style centered hero with logo + input ── */}
        <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-24 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/duvlogo.png"
          alt="DUV"
          className="w-20 h-20 rounded-2xl mb-6 opacity-90"
        />
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 text-center">
          Deep Understanding <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-500">Validator</span>
        </h2>
        <p className="text-neutral-500 text-sm mb-8 text-center max-w-md">Paste your code and let the AI challenge your understanding.</p>

        <DashboardInput />
      </div>

      {/* ── Stats + history below ── */}
      <div className="max-w-4xl mx-auto w-full px-6 pb-10 space-y-8">
        {/* stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Analyses" value={total} />
          <StatCard label="Easy" value={byDifficulty.easy} color="text-green-400" />
          <StatCard label="Medium" value={byDifficulty.medium} color="text-yellow-400" />
          <StatCard label="Hard" value={byDifficulty.hard} color="text-red-400" />
        </div>

        {/* top languages */}
        {topLanguages.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Languages</h2>
            <div className="flex flex-wrap gap-2">
              {topLanguages.map(([lang, count]) => (
                <span
                  key={lang}
                  className="px-3 py-1 rounded-full bg-neutral-800 text-neutral-300 text-xs font-mono"
                >
                  {lang} <span className="text-neutral-500">({count})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* recent analyses */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
            <Link
              href="/settings"
              className="text-xs text-neutral-500 hover:text-purple-400 flex items-center gap-1 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </div>

          {items.length === 0 ? (
            <p className="text-center py-8 text-neutral-600 text-sm">No analyses yet. Paste your code above to begin!</p>
          ) : (
            <div className="space-y-2">
              {items.map((q) => (
                <Link
                  key={q.id}
                  href={`/result/${q.id}`}
                  className="block p-4 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-purple-400">{q.language}</span>
                      <DifficultyBadge difficulty={q.difficulty} />
                    </div>
                    <span className="text-xs text-neutral-600">
                      {new Date(q.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-300 truncate">{q.question_text}</p>
                  <p className="text-xs text-neutral-600 mt-1 truncate font-mono">
                    {q.code_snippet.split("\n")[0]}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color ?? "text-white"}`}>{value}</p>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: "bg-green-900/30 text-green-400",
    medium: "bg-yellow-900/30 text-yellow-400",
    hard: "bg-red-900/30 text-red-400",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors[difficulty] ?? "bg-neutral-800 text-neutral-400"}`}>
      {difficulty}
    </span>
  );
}
